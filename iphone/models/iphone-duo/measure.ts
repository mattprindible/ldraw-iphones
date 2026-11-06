// Re-measures every scaled value in drawing.ts from the PDF, and checks each view's calibration on dimensioned features
// it didn't use.
//
// The family's re-measurement (iphone/measure.ts) assumes a phone symmetric across: its back view calibrates on two
// camera centres apart in both axes (the Duo's two sit on one line, 2x -15.25), its front view takes the display
// centred and the glass equally inset (the Duo's sit 4.13 and 2.84 from the hinge, 2.71 and 1.33 from the other
// side), and its bottom view expects the drawn thickness within 0.15 of the dimensioned (the Duo's is 0.30 thin). So
// this file measures every view itself, each calibrated on its extension lines or its outer edges, with the family's
// raster procedures (src/raster.ts) and its report.
//
//   node iphone-duo/measure.ts   → a table: recorded, measured, the difference
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { report, type Measured } from '../../measure.ts';
import type { Value } from '../../../src/provenance.ts';
import { circleAt, cleanCircleAt, lineNear, render, runNear, runs, toPx, type Calibration, type Gray, type Region } from '../../../src/raster.ts';
import { backView, bottom, bottomView, bump, cameras, detailD, flash, front, frontView, magsafe, magsafeZone, micSlot, notBuilt, outline, phone, pill, rearMic, sideView, magsafeView, startOfFlat } from './drawing.ts';

export const PDF = join(import.meta.dirname, '..', '..', 'drawings', 'iphone-duo.pdf');

const W = phone.body.width.mm, L = phone.body.length.mm, T = phone.body.thickness.mm;
const kindOf = (v: Value): Measured['kind'] => (v.kind === 'scaled' ? 'scaled' : 'check');
const label = (what: string, v: Value) => (v.kind === 'scaled' ? what : `${what} (${v.kind} ${v.mm})`);
/** As the family's: a check on a heavy line passes if its number falls within the stroke; a scaled value gets no slack. */
function collector() {
  const out: Measured[] = [];
  const add = (name: string, kind: Measured['kind'], recorded: number, measured: number, within: number, known?: string) => out.push({ name, kind, recorded, measured, within, ...(known ? { known } : {}) });
  const value = (what: string, v: Value, measured: number, within: number, stroke = 0, edges = 1) => {
    const slack = v.kind === 'scaled' ? 0 : (edges * stroke) / 2;
    add(slack > within ? `${label(what, v)}; drawn ${stroke.toFixed(2)} wide` : label(what, v), kindOf(v), v.mm, measured, slack > within ? slack : within);
  };
  return { out, add, value };
}
const mean = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length;
const K = 1 - Math.SQRT1_2;

/** A circle through points, least squares (Kåsa): centre and radius, and the worst point's distance off it. */
function fitCircle(P: [number, number][]): { centre: [number, number]; radius: number; worst: number } {
  let [sx, sy, sxx, syy, sxy, sxz, syz, sz] = [0, 0, 0, 0, 0, 0, 0, 0];
  for (const [x, y] of P) {
    const z = x * x + y * y;
    [sx, sy, sxx, syy, sxy, sxz, syz, sz] = [sx + x, sy + y, sxx + x * x, syy + y * y, sxy + x * y, sxz + x * z, syz + y * z, sz + z];
  }
  const A = [[sxx, sxy, sx, sxz], [sxy, syy, sy, syz], [sx, sy, P.length, sz]];
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) { const f = A[j][i] / A[i][i]; for (let k = i; k < 4; k++) A[j][k] -= f * A[i][k]; }
  const s = [0, 0, 0];
  for (let i = 2; i >= 0; i--) { let t = A[i][3]; for (let k = i + 1; k < 3; k++) t -= A[i][k] * s[k]; s[i] = t / A[i][i]; }
  const centre: [number, number] = [s[0] / 2, s[1] / 2];
  const radius = Math.sqrt(s[2] + centre[0] ** 2 + centre[1] ** 2);
  return { centre, radius, worst: Math.max(...P.map(([x, y]) => Math.abs(Math.hypot(x - centre[0], y - centre[1]) - radius))) };
}

/**
 * Crossings of a circle near radius `r` (mm) about `c` on rays every 5° from `a0` to `a1` (degrees, 0 along +x, the
 * drawing's y down), each ray's single run within `band` of r (a ray with none or two is passed over), in mm.
 */
function crossings(g: Gray, cal: Calibration, c: [number, number], r: number, a0: number, a1: number, band = 0.4, skip: (a: number) => boolean = () => false): [number, number][] {
  const P: [number, number][] = [];
  for (let a = a0; a <= a1; a += 5) {
    if (skip(a)) continue;
    const t = (a * Math.PI) / 180, d: [number, number] = [Math.cos(t), Math.sin(t)];
    const o = toPx(cal, c), start = (r - 1.5) * cal.pxPerMm;
    const rs = runs(g, [o[0] + d[0] * start, o[1] + d[1] * start], d, Math.round(3 * cal.pxPerMm)).map((q) => r - 1.5 + q.at / cal.pxPerMm).filter((x) => Math.abs(x - r) < band);
    if (rs.length === 1) P.push([c[0] + d[0] * rs[0], c[1] + d[1] * rs[0]]);
  }
  return P;
}

/**
 * Detail D, calibrated on its extension lines: across, the 0.00, 4.94, 15.25, 32.98 and 49.58 lines on a row 8 above
 * the phone (scale from the outer two, datum their fitted mean); down, the 0.00, -4.70, -15.25, -25.80 and -34.62
 * lines on a column 3.3 left of it. Then the cameras' circles, the flash, the rear mic's slot on its extension lines,
 * the pill (its top and bottom down a column, its ends as circles fitted to radial crossings), the outline (its bottom,
 * its right end as a circle, its corners on their diagonals) and the start-of-flat line beside it.
 */
export function detailDReadings(pdf = PDF): Measured[] {
  const r = detailD, g = render(pdf, r);
  const { out, add, value } = collector();
  const across = [0, 4.94, 15.25, 32.98, 49.58], down = [0, 4.7, 15.25, 25.8, 34.62];
  const row = Math.round(toPx(r, [0, -8])[1]), col = Math.round(toPx(r, [-3.3, 0])[0]);
  const xs = across.map((m) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(r, [m, 0])[0]));
  const ys = down.map((m) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(r, [0, m])[1]));
  const sx = (xs.at(-1)! - xs[0]) / across.at(-1)!, sy = (ys.at(-1)! - ys[0]) / down.at(-1)!;
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [mean(xs.map((x, i) => x - across[i] * sx)), mean(ys.map((y, i) => y - down[i] * sy))] };
  add('Detail D px/mm across (calibration: the 0.00 and 49.58 lines)', 'check', r.pxPerMm, sx, 0.05);
  add('Detail D px/mm down (calibration: the 0.00 and -34.62 lines)', 'check', r.pxPerMm, sy, 0.05);
  add('Detail D datum across (px)', 'check', r.origin[0], cal.origin[0], 1);
  add('Detail D datum down (px)', 'check', r.origin[1], cal.origin[1], 1);
  across.slice(1, -1).forEach((m, i) => add(`Detail D ${m.toFixed(2)} line across (dimensioned)`, 'check', m, (xs[i + 1] - cal.origin[0]) / cal.pxPerMm, 0.02));
  down.slice(1, -1).forEach((m, i) => add(`Detail D -${m.toFixed(2)} line down (dimensioned)`, 'check', m, (ys[i + 1] - cal.origin[1]) / cal.pxPerMm, 0.02));
  const mm = (px: [number, number]): [number, number] => [(px[0] - cal.origin[0]) / cal.pxPerMm, (px[1] - cal.origin[1]) / cal.pxPerMm];

  for (const cam of Object.values(cameras)) {
    const ring = circleAt(g, toPx(cal, [cam.fromSide.mm, cam.fromTop.mm]), (cam.ring.mm / 2) * cal.pxPerMm);
    const [cs, ct] = mm(ring.centre);
    value(`${cam.name} centre from the side`, cam.fromSide, cs, 0.05);
    value(`${cam.name} centre from the top`, cam.fromTop, ct, 0.05);
    value(`${cam.name} ring Ø (the outermost circle)`, cam.ring, ring.diameter / cal.pxPerMm, 0.05, ring.stroke / cal.pxPerMm, 2);
    const win = circleAt(g, ring.centre, (cam.window.mm / 2) * cal.pxPerMm);
    value(`${cam.name} window Ø (the innermost circle)`, cam.window, win.diameter / cal.pxPerMm, 0.05);
  }
  const f = cleanCircleAt(g, toPx(cal, [flash.fromSide.mm, flash.fromTop.mm]), (flash.diameter.mm / 2) * cal.pxPerMm, [15, -15, 25, -25]);
  const [fs, ft] = mm(f.centre);
  value('flash centre from the side', flash.fromSide, fs, 0.05);
  value('flash centre from the top', flash.fromTop, ft, 0.05);
  value('flash Ø', flash.diameter, f.diameter / cal.pxPerMm, 0.05, f.stroke / cal.pxPerMm, 2);

  // The rear mic's slot: its ends' extension lines (the 3.32) on a row 6 above the phone; its edges' (the 1.50) on a
  // column 85.6 across, beyond the phone, either side of the -10.95 line.
  const r6 = Math.round(toPx(cal, [0, -6])[1]);
  const ends = [-1, 1].map((k) => (lineNear(g, [0, r6], [1, 0], g.width - 1, toPx(cal, [rearMic.fromSide.mm + (k * micSlot.length.mm) / 2, 0])[0]) - cal.origin[0]) / cal.pxPerMm);
  value('rear mic slot length (its ends\' extension lines)', micSlot.length, ends[1] - ends[0], 0.03);
  value('rear mic slot centre across, between its ends (on the flash\'s 49.58 line)', rearMic.fromSide, (ends[0] + ends[1]) / 2, 0.03);
  const c87 = Math.round(toPx(cal, [85.6, 0])[0]);
  const edges = [-1, 1].map((k) => (lineNear(g, [c87, 0], [0, 1], g.height - 1, toPx(cal, [0, rearMic.fromTop.mm + (k * micSlot.width.mm) / 2])[1]) - cal.origin[1]) / cal.pxPerMm);
  value('rear mic slot width (its edges\' extension lines)', micSlot.width, edges[1] - edges[0], 0.03);
  value('rear mic slot centre down, between its edges', rearMic.fromTop, (edges[0] + edges[1]) / 2, 0.03);

  // The pill's top and bottom down a column between the cameras' circles and clear of the Ø16.20 leader.
  const c24 = Math.round(toPx(cal, [24.1, 0])[0]);
  const at = (y: number) => mm([0, runNear(g, [c24, 0], [0, 1], g.height - 1, toPx(cal, [0, y])[1]).at])[1];
  value('pill top down the 24.10 column', pill.top, at(pill.top.mm), 0.05);
  value('pill bottom down the 24.10 column', pill.bottom, at(pill.bottom.mm), 0.05);
  // Its ends: rays from near each end's centre on the camera line, -85° to 85° about the outward direction, clear of
  // the camera line itself.
  const R = pill.radius.mm;
  const endFits = ([[4.94 + R, -1], [60.56 - R, 1]] as const).map(([cx, side]) => {
    const P = crossings(g, cal, [cx, 15.25], R, side < 0 ? 95 : -85, side < 0 ? 265 : 85, 0.4, (a) => Math.abs(((a % 180) + 180) % 180) < 4 || Math.abs((((a % 180) + 180) % 180) - 180) < 4);
    const fit = fitCircle(P);
    return { ...fit, extreme: fit.centre[0] + side * fit.radius, n: P.length };
  });
  value(`pill radius: circles fitted to its ends (R${endFits.map((e) => e.radius.toFixed(3)).join(', R')}; ${endFits.map((e) => e.n).join(' and ')} crossings; worst ${Math.max(...endFits.map((e) => e.worst)).toFixed(3)} off)`, pill.radius, mean(endFits.map((e) => e.radius)), 0.05);
  add(`pill's left end centred on camera 1 across (its fit's centre ${endFits[0].centre[0].toFixed(3)}, ${endFits[0].centre[1].toFixed(3)})`, 'check', cameras.ultraWide.fromSide.mm, endFits[0].centre[0], 0.05);
  value('pill left extreme (its fit)', pill.left, endFits[0].extreme, 0.05);
  value('pill right extreme (its fit)', pill.right, endFits[1].extreme, 0.05);

  // The outline: its bottom down a column between the cameras; its right end, crossings on rays from (50.00, 15.25)
  // between -80° and 85° (passing over the slot's lines and the camera line); its corners on the diagonals.
  const c30 = Math.round(toPx(cal, [30, 0])[0]);
  value('outline bottom down the 30.00 column', outline.bottom, mm([0, runNear(g, [c30, 0], [0, 1], g.height - 1, toPx(cal, [0, outline.bottom.mm])[1]).at])[1], 0.05);
  // (The rays look within 0.4 of R19.3, a first reading, not the recorded value, so the reading can't follow it.)
  const P = crossings(g, cal, [50, 15.25], 19.3, -80, 85, 0.4, (a) => Math.abs(a) < 4);
  const end = fitCircle(P);
  value(`outline right end radius (fitted to ${P.length} crossings, centre ${end.centre[0].toFixed(2)}, ${end.centre[1].toFixed(2)}; worst ${end.worst.toFixed(3)} off)`, outline.endRadius, end.radius, 0.05);
  value('outline right extreme (its fit)', outline.right, end.centre[0] + end.radius, 0.1);
  const b0 = startOfFlat.mm, bx = outline.right.mm, by = outline.bottom.mm;
  const corner = (c: [number, number], dir: [number, number], expect: number) => runNear(g, toPx(cal, c), dir, Math.round(10 * cal.pxPerMm), expect * K * cal.pxPerMm).at / cal.pxPerMm / K;
  const rs = [corner([bx, b0], [-1, 1], 9.3), corner([bx, by], [-1, -1], 19.6), corner([b0, by], [1, -1], 9.7)];
  value(`outline corner radius: top-right, bottom-right, bottom-left on their diagonals (R${rs.map((x) => x.toFixed(2)).join(', R')}), averaged`, bump.baseRadius, mean(rs), 0.05);
  const flat = [25, 28, 31].map((y) => (lineNear(g, [Math.round(toPx(cal, [1.8, 0])[0]), Math.round(toPx(cal, [0, y])[1])], [1, 0], Math.round(1.5 * cal.pxPerMm), (startOfFlat.mm - 1.8) * cal.pxPerMm) / cal.pxPerMm) + 1.8);
  value(`start-of-flat line beside the plateau, 25, 28 and 31 down (${flat.map((x) => x.toFixed(3)).join(', ')})`, startOfFlat, mean(flat), 0.05);
  return out;
}

/**
 * The right side view at 2400 dpi: the front on the left, the back (and the plateau) on the right. Calibrated across on
 * the back plate's, the 3.64's and the 5.72's extension lines above the phone (the back plate's the datum); down, from
 * the phone's top. Then the plateau's flat 10 down, the camera glass 15 down, the flat's extent down a column just
 * inside it, and the flank below the pill row by row.
 */
export function sideReadings(pdf = PDF): Measured[] {
  const r = sideView, g = render(pdf, r);
  const { out, add, value } = collector();
  const above = Math.round(r.origin[1] - 24 * r.pxPerMm);
  const [back, plat, glass] = [0, bump.top.mm, bump.rings.mm].map((x) => lineNear(g, [0, above], [1, 0], g.width - 1, r.origin[0] + x * r.pxPerMm));
  const s = (glass - back) / bump.rings.mm;
  add('side view px/mm (calibration: the back plate\'s and 5.72\'s extension lines)', 'check', r.pxPerMm, s, 0.1);
  add('side view datum across: the back plate\'s extension line (px)', 'check', r.origin[0], back, 1);
  add('back plate to camera plateau: its extension line (dimensioned 3.64)', 'check', bump.top.mm, (plat - back) / s, 0.03);
  const topEdge = lineNear(g, [Math.round(back - 4.5 * s), 0], [0, 1], g.height - 1, r.origin[1]);
  add('side view datum down: the phone\'s top (px)', 'check', r.origin[1], topEdge, 1);
  const rowAt = (mm: number) => Math.round(topEdge + mm * s);
  const flatAt = (lineNear(g, [Math.round(back + 2 * s), rowAt(10)], [1, 0], Math.round(2 * s), 1.64 * s) + 2 * s) / s;
  add('the plateau\'s flat from the back plate, 10 down (dimensioned 3.64)', 'check', bump.top.mm, flatAt, 0.03);
  // The camera glass: its outermost line merges with the one inside it into one run; its outer edge less half a line.
  const cam = runs(g, [Math.round(back + 4.5 * s), rowAt(15)], [1, 0], Math.round(2 * s)).at(-1)!;
  add('the camera glass\'s outermost line, 15 down: its run\'s outer edge less half a line (dimensioned 5.72)', 'check', bump.rings.mm, (cam.at + cam.width / 2 - 5.5) / s + 4.5, 0.03);
  const col = Math.round(back + (bump.top.mm - 0.1) * s);
  const rs = runs(g, [col, rowAt(1)], [0, 1], Math.round(34 * s)).map((q) => 1 + q.at / s);
  value('the plateau\'s flat begins (side view, 0.1 inside it) at the pill\'s top', pill.top, rs[0], 0.15);
  value('the plateau\'s flat ends at the pill\'s bottom', pill.bottom, rs.at(-1)!, 0.15);
  // The flank below the pill: its line's middle on each row, from the back plate's extension line: the outermost line
  // (the silhouette) beyond the back's own, which is about 0.3 wide about it; 26.0 down a line on the flank inside it
  // (0.33) is passed over.
  for (const [o, h] of bump.flank!.points.slice(1, -1)) {
    const y = pill.bottom.mm + o;
    const line = runs(g, [Math.round(back - s), rowAt(y)], [1, 0], Math.round(5 * s)).map((q) => (q.at - s) / s).filter((x) => x > 0.12).at(-1)!;
    add(`the flank ${o.toFixed(2)} below the pill (${y.toFixed(2)} down): its height`, 'scaled', h, line, 0.05);
  }
  return out;
}

/**
 * The front view, calibrated on its outer edges: across on a row 25 down (above the side button), down a column 25 from
 * the hinge (clear of the volume buttons on the top edge). Then the active area's four edges and size, the glass's two
 * sides, and the active area's corners on their diagonals: the two away from the hinge (the radius used) and the top
 * one at the hinge (the bottom one's diagonal runs along a hatch line).
 */
export function frontReadings(pdf = PDF): Measured[] {
  const r = frontView, g = render(pdf, r);
  const { out, add, value } = collector();
  const rowPx = Math.round(toPx(r, [0, 25])[1]), colPx = Math.round(toPx(r, [25, 0])[0]);
  const [left, right] = [0, W].map((x) => lineNear(g, [0, rowPx], [1, 0], g.width - 1, toPx(r, [x, 0])[0]));
  const [top, foot] = [0, L].map((y) => lineNear(g, [colPx, 0], [0, 1], g.height - 1, toPx(r, [0, y])[1]));
  const [sx, sy] = [(right - left) / W, (foot - top) / L];
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [left, top] };
  add('front view px/mm across (calibration: the outer edges, 25 down)', 'check', r.pxPerMm, sx, 0.05);
  add('front view px/mm down (calibration: the outer edges, 25 across)', 'check', r.pxPerMm, sy, 0.05);
  add('front view datum across (px)', 'check', r.origin[0], left, 1);
  add('front view datum down (px)', 'check', r.origin[1], top, 1);
  const lineX = (y: number, x: number) => { const q = runNear(g, [0, Math.round(toPx(cal, [0, y])[1])], [1, 0], g.width - 1, toPx(cal, [x, 0])[0]); return { mm: (q.at - cal.origin[0]) / cal.pxPerMm, w: q.width / cal.pxPerMm }; };
  const lineY = (x: number, y: number) => { const q = runNear(g, [Math.round(toPx(cal, [x, 0])[0]), 0], [0, 1], g.height - 1, toPx(cal, [0, y])[1]); return { mm: (q.at - cal.origin[1]) / cal.pxPerMm, w: q.width / cal.pxPerMm }; };
  const a = front.activeFromEdge.mm, hinge = notBuilt.hingeDisplayEdge.mm;
  const aL = lineX(25, hinge), aR = lineX(25, W - a), aT = [lineY(25, a), lineY(69, a)], aB = [lineY(25, L - a), lineY(69, L - a)];
  value('active area from the hinge edge, 25 down', notBuilt.hingeDisplayEdge, aL.mm, 0.05);
  value('active area from the far side, 25 down', front.activeFromEdge, W - aR.mm, 0.05);
  value('active area from the top, 25 and 69 across', front.activeFromEdge, mean(aT.map((q) => q.mm)), 0.05);
  value('active area from the bottom, 25 and 69 across', front.activeFromEdge, L - mean(aB.map((q) => q.mm)), 0.05);
  const stroke = Math.max(aL.w, aR.w, ...aT.map((q) => q.w), ...aB.map((q) => q.w));
  value(`active area width (4.13 + 77.17 + 2.71 is 84.01)`, front.activeWidth, aR.mm - aL.mm, 0.05, stroke, 2);
  value(`active area length (2.71 + 112.28 + 2.71 is 117.70)`, front.activeLength, mean(aB.map((q) => q.mm)) - mean(aT.map((q) => q.mm)), 0.05, stroke, 2);
  const gL = lineX(25, 84.1 - 1.33 - phone.body.glassWidth.mm), gR = lineX(25, W - 1.33);
  value('glass width (its hinge-side line to its far one)', phone.body.glassWidth, gR.mm - gL.mm, 0.05, Math.max(gL.w, gR.w), 2);
  const gT = lineY(25, 1.38), gB = lineY(25, L - 1.38);
  value('glass length', phone.body.glassLength, gB.mm - gT.mm, 0.05, Math.max(gT.w, gB.w), 2);
  // The corners: the first line in from each sharp corner (the active area's own lines' crossing) nearest the radius.
  const diag = (c: [number, number], dir: [number, number], R: number) => runNear(g, toPx(cal, c), dir, Math.round(2.5 * R * K * cal.pxPerMm), R * K * cal.pxPerMm).at / cal.pxPerMm / K;
  const rs = [diag([aR.mm, mean(aT.map((q) => q.mm))], [-1, 1], front.activeRadius.mm), diag([aR.mm, mean(aB.map((q) => q.mm))], [-1, -1], front.activeRadius.mm)];
  value(`active area corner radius away from the hinge (top-right R${rs[0].toFixed(2)}, bottom-right R${rs[1].toFixed(2)})`, front.activeRadius, mean(rs), 0.05);
  const hr = diag([aL.mm, mean(aT.map((q) => q.mm))], [1, 1], notBuilt.hingeDisplayRadius.mm);
  value('active area corner radius at the hinge (top-left)', notBuilt.hingeDisplayRadius, hr, 0.05);
  // The outline's crossing of the top-right corner's diagonal: Detail A's (3.62, 3.63).
  const oc = runNear(g, toPx(cal, [W, 0]), [-1, 1], Math.round(5 * cal.pxPerMm), 3.62 * cal.pxPerMm).at / cal.pxPerMm;
  add('the outline on the top-right corner\'s diagonal (Detail A\'s 3.62, 3.63)', 'check', 3.62, oc, 0.05);
  return out;
}

/**
 * The bottom view, calibrated across on its extension lines (0.00 to 67.61, on a row 12.9 beyond the front, where they
 * run straight), down on the 2.825's and 2.670's extension lines beyond the phone's far end (the front and back
 * outlines the datum's). Then each hole's and the back screws' centre from chords, the port's ends and its height.
 */
export function bottomReadings(pdf = PDF): Measured[] {
  const r = bottomView, g = render(pdf, r);
  const { out, add, value } = collector();
  const marks = [0, 17.78, 24.54, 35.35, 38.42, 46.99, 50.04, 60.85, 67.61];
  const row = Math.round(toPx(r, [0, -12.9])[1]);
  const xs = marks.map((m) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(r, [m, 0])[0]));
  const px = (xs.at(-1)! - xs[0]) / marks.at(-1)!;
  add('bottom view px/mm across (calibration: the 0.00 and 67.61 lines)', 'check', r.pxPerMm, px, 0.05);
  add('bottom view datum across: the hinge edge\'s extension line (px)', 'check', r.origin[0], xs[0], 1);
  marks.slice(1, -1).forEach((m, i) => add(`bottom view ${m.toFixed(2)} line (dimensioned)`, 'check', m, (xs[i + 1] - xs[0]) / px, 0.03));
  const beyond = Math.round(toPx(r, [88.84, 0])[0]);
  const yl = (y: number) => lineNear(g, [beyond, 0], [0, 1], g.height - 1, toPx(r, [0, y])[1]);
  const drawnT = 11.0;
  const [fl, pl, hl, bl] = [-drawnT / 2, -drawnT / 2 + 2.825, drawnT / 2 - 2.67, drawnT / 2].map(yl);
  const cal: Calibration = { pxPerMm: px, origin: [xs[0], (fl + bl) / 2] };
  add('bottom view datum down: between the front and back outlines\' extension lines (px)', 'check', r.origin[1], cal.origin[1], 1);
  add(`bottom view thickness as drawn: its outlines' extension lines (dimensioned ${T})`, 'check', T, (bl - fl) / px, 0.15, 'the view draws the phone 11.00 thick, 0.30 thin (the family\'s other views up to 0.15): its outlines are likely the frame\'s, not the glass\'s; the 2.825 and 2.670 are taken from the part\'s faces');
  add('the port\'s line from the front outline: the 2.825\'s extension lines (dimensioned 2.825)', 'check', 2.825, (pl - fl) / px, 0.03);
  add('the holes\' line from the back outline: the 2.670\'s extension lines (dimensioned 2.670)', 'check', bottom.holesFromBack.mm, (bl - hl) / px, 0.03);
  const mmX = (p: number) => (p - cal.origin[0]) / px;
  // Each hole and back screw: chords on rows and columns 0.35 or 0.49 off its centre (the 2.670 extension line runs
  // through it), keeping the chords whose crossings are all thin (the leaders' arrows touch the right group's holes).
  const off = Math.round(0.35 * px);
  const crossed = [60.85, 67.61]; // the BOTTOM MIC and SPEAKER PORTS leaders' arrowheads lie on these two
  const circles = [...bottom.holes.filter((h) => !crossed.includes(h.mm)).map((h) => ({ at: h, d: bottom.holeDiameter, name: `bottom hole at ${h.mm.toFixed(2)}` })), ...bottom.screws.map((h) => ({ at: h, d: bottom.screwDiameter, name: `back screw at ${h.mm.toFixed(2)}` }))];
  const ds: number[] = [], strokes: number[] = [];
  for (const c of circles) {
    const f = cleanCircleAt(g, [toPx(cal, [c.at.mm, 0])[0], hl], (c.d.mm / 2) * px, [off, -off, Math.round(1.4 * off), -Math.round(1.4 * off)]);
    add(`${c.name}: its centre (the extension line on its centre)`, 'check', c.at.mm, mmX(f.centre[0]), 0.05);
    add(`${c.name}: its centre's distance from the back outline (2.670)`, 'check', bottom.holesFromBack.mm, (bl - f.centre[1]) / px, 0.05);
    if (c.d === bottom.holeDiameter) { ds.push(f.diameter / px); strokes.push(f.stroke / px); }
  }
  value('bottom holes\' mean Ø', bottom.holeDiameter, mean(ds), 0.05, mean(strokes), 2);
  // The port: its ends on a row 0.4 off its centre line (drawn through it), each moved out by its round end's offset
  // there (r - √(r² - 0.4²), r half its height); its height down its middle column, the lines' middles.
  const pr = Math.round(pl + 0.4 * px);
  const pr0 = bottom.portHeight.mm / 2, shift = pr0 - Math.sqrt(pr0 * pr0 - 0.16);
  const pe = [bottom.portFrom, bottom.portTo].map((e, k) => mmX(lineNear(g, [0, pr], [1, 0], g.width - 1, toPx(cal, [e.mm, 0])[0])) + (k === 0 ? -shift : shift));
  add(`port's near end (dimensioned 38.42), 0.4 off its centre line, moved out ${shift.toFixed(3)}`, 'check', bottom.portFrom.mm, pe[0], 0.05);
  add('port\'s far end (dimensioned 46.99), likewise', 'check', bottom.portTo.mm, pe[1], 0.05);
  const mid = Math.round(toPx(cal, [(bottom.portFrom.mm + bottom.portTo.mm) / 2 + 1, 0])[0]);
  const h = [-1, 1].map((k) => lineNear(g, [mid, 0], [0, 1], g.height - 1, pl + (k * bottom.portHeight.mm * px) / 2));
  value('port height (its outline\'s lines down its middle, 1 off the centre)', bottom.portHeight, (h[1] - h[0]) / px, 0.05);
  add('port centre from the front outline (dimensioned 2.825)', 'check', 2.825, ((h[0] + h[1]) / 2 - fl) / px, 0.05);
  return out;
}

/**
 * Sheet 5's MagSafe view, calibrated on its extension lines: across, the 0.00, 41.30, 44.05 and 70.93 lines on a row 2.8
 * above the phone (higher, the 44.05's leader kinks); down, the 25.80, 61.31, 98.87 and 110.14 lines on a column beyond its far side. Then the clear
 * circle (crossings on rays from its centre, fitted), the magnetic zone's right side and its arc.
 */
export function magsafeReadings(pdf = PDF): Measured[] {
  const r = magsafeView, g = render(pdf, r);
  const { out, add, value } = collector();
  const across = [0, 41.3, 44.05, 70.93], down = [25.8, 61.31, 98.87, 110.14];
  const row = Math.round(toPx(r, [0, -2.8])[1]), col = Math.round(toPx(r, [84.63, 0])[0]);
  const xs = across.map((m) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(r, [m, 0])[0]));
  const ys = down.map((m) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(r, [0, m])[1]));
  const sx = (xs.at(-1)! - xs[0]) / (across.at(-1)! - across[0]), sy = (ys.at(-1)! - ys[0]) / (down.at(-1)! - down[0]);
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [mean(xs.map((x, i) => x - across[i] * sx)), mean(ys.map((y, i) => y - down[i] * sy))] };
  add('MagSafe view px/mm across (calibration: the 0.00 and 70.93 lines)', 'check', r.pxPerMm, sx, 0.05);
  add('MagSafe view px/mm down (calibration: the 25.80 and 110.14 lines)', 'check', r.pxPerMm, sy, 0.05);
  add('MagSafe view datum across (px)', 'check', r.origin[0], cal.origin[0], 1);
  add('MagSafe view datum down (px)', 'check', r.origin[1], cal.origin[1], 1);
  across.slice(1, -1).forEach((m, i) => add(`MagSafe view ${m.toFixed(2)} line across (dimensioned)`, 'check', m, (xs[i + 1] - cal.origin[0]) / cal.pxPerMm, 0.03));
  down.slice(1, -1).forEach((m, i) => add(`MagSafe view ${m.toFixed(2)} line down (dimensioned)`, 'check', m, (ys[i + 1] - cal.origin[1]) / cal.pxPerMm, 0.03));
  const top = Math.round(toPx(cal, [0, 0])[1]);
  add('MagSafe view: the phone\'s top on the 0.00 line (px)', 'check', top, lineNear(g, [Math.round(toPx(cal, [10, 0])[0]), 0], [0, 1], g.height - 1, top), 1.5);
  // The clear circle: both sides are hatched (at different angles), so crossings within 0.25 of its radius on rays
  // every 5°, fitted.
  const P = crossings(g, cal, [magsafe.fromSide.mm, magsafe.fromTop.mm], magsafe.diameter.mm / 2, 0, 355, 0.25);
  const c = fitCircle(P);
  add(`MagSafe circle centre from the side (fitted to ${P.length} crossings; worst ${c.worst.toFixed(3)} off)`, 'check', magsafe.fromSide.mm, c.centre[0], 0.05);
  add('MagSafe circle centre from the top', 'check', magsafe.fromTop.mm, c.centre[1], 0.05);
  add('MagSafe circle Ø', 'check', magsafe.diameter.mm, 2 * c.radius, 0.05);
  // The zone: its right side on rows 40, 60, 80; its arc's lowest point down columns 0.75 either side of 41.30 (its
  // centre column), its crossings of x = 20.00 and y = 95.00 against the circle that lowest point and R49.39 give.
  const rx = [40, 60, 80].map((y) => (lineNear(g, [0, Math.round(toPx(cal, [0, y])[1])], [1, 0], g.width - 1, toPx(cal, [magsafeZone.right.mm, 0])[0]) - cal.origin[0]) / cal.pxPerMm);
  value(`magnetic zone's right side, 40, 60 and 80 down (${rx.map((x) => x.toFixed(3)).join(', ')})`, magsafeZone.right, mean(rx), 0.05);
  const downAt = (x: number, expect: number) => (lineNear(g, [Math.round(toPx(cal, [x, 0])[0]), 0], [0, 1], g.height - 1, toPx(cal, [0, expect])[1]) - cal.origin[1]) / cal.pxPerMm;
  const R = magsafeZone.radius.mm, cx = magsafe.fromSide.mm;
  const low = mean([cx - 0.75, cx + 0.75].map((x) => downAt(x, magsafeZone.lowest.mm) + (R - Math.sqrt(R * R - 0.75 * 0.75))));
  value('magnetic zone\'s arc, its lowest point (down 0.75 either side of 41.30, less the arc\'s rise there)', magsafeZone.lowest, low, 0.05);
  const cy = magsafeZone.lowest.mm - R;
  const at20 = cy + Math.sqrt(R * R - (cx - 20) ** 2);
  add(`magnetic zone's arc at x = 20.00 (centred ${cx.toFixed(2)}, ${cy.toFixed(2)}: ${at20.toFixed(2)})`, 'check', at20, downAt(20, at20), 0.05);
  const x95 = cx + Math.sqrt(R * R - (95 - cy) ** 2);
  const m95 = (lineNear(g, [0, Math.round(toPx(cal, [0, 95])[1])], [1, 0], g.width - 1, toPx(cal, [x95, 0])[0]) - cal.origin[0]) / cal.pxPerMm;
  add(`magnetic zone's arc at y = 95.00 (that centre: ${x95.toFixed(2)}; centred on the product's middle, 42.05, it would be ${(x95 + 0.75).toFixed(2)})`, 'check', x95, m95, 0.05);
  return out;
}

/** The back view: its calibration, for its overlay (its outer edges, across 65 down between the buttons, down 75 across, clear of the volume buttons on the top). */
export function backReadings(pdf = PDF): Measured[] {
  const r = backView, g = render(pdf, r);
  const { out, add } = collector();
  const row = Math.round(toPx(r, [0, 65])[1]), col = Math.round(toPx(r, [75, 0])[0]);
  const [left, right] = [0, W].map((x) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(r, [x, 0])[0]));
  const [top, foot] = [0, L].map((y) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(r, [0, y])[1]));
  add('back view px/mm across (calibration)', 'check', r.pxPerMm, (right - left) / W, 0.05);
  add('back view px/mm down (calibration)', 'check', r.pxPerMm, (foot - top) / L, 0.05);
  add('back view datum across (px)', 'check', r.origin[0], left, 1);
  add('back view datum down (px)', 'check', r.origin[1], top, 1);
  return out;
}

export const remeasure = (pdf = PDF): Measured[] => [
  ...detailDReadings(pdf),
  ...sideReadings(pdf),
  ...frontReadings(pdf),
  ...bottomReadings(pdf),
  ...magsafeReadings(pdf),
  ...backReadings(pdf),
];

export const hasPdf = () => existsSync(PDF);

if (import.meta.main) console.log(report(remeasure()));
