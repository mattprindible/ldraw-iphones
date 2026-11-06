// Re-measures every scaled value in drawing.ts from the PDF, and checks each view's calibration on dimensioned features
// it didn't use.
//
// The family's re-measurement (iphone/measure.ts) calibrates the back view on the two camera centres furthest apart in
// each axis. The Air has one camera, and the only other circles on its back (the rear mic and the flash) sit on its line
// (3X -16.29): no pair spans the view down (as on the 16e and 17e). So this file measures Detail D itself, calibrated
// on its extension lines, and runs the family's front and bottom views without a back view; its own checks in those
// views are read in the family's frames (frontCalibration, bottomCalibration).
//
// Checks the flash's keepout sections (T-T and U-U, sheet 3) and MagSafe's keepouts (sheet 4) against what the drawing
// draws: their lines, the hand calculations from the printed numbers, and negative controls.
//
//   node iphone-air/measure.ts   → a table: recorded, measured, the difference
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { bottomCalibration, frontCalibration, remeasure as family, report, type Measured } from '../../measure.ts';
import type { Value } from '../../../src/provenance.ts';
import { circleAt, cleanCircleAt, lineNear, render, runNear, runs, toPx, type Calibration, type Gray, type Region } from '../../../src/raster.ts';
import { backView, body, bottomView, bump, cameras, cornerTangent, detailA, detailD, flash, flashKeepout, flashKeepoutAcross, flashKeepoutBase, flashKeepoutEnd, frontView, magsafe, magsafeView, phone, pill, plateauBottom, rearMic, sectionTT, sectionUU, sideView, startOfFlat } from './drawing.ts';

export const PDF = join(import.meta.dirname, '..', '..', 'drawings', 'iphone-air.pdf');

const kindOf = (v: Value): Measured['kind'] => (v.kind === 'scaled' ? 'scaled' : 'check');
const label = (what: string, v: Value) => (v.kind === 'scaled' ? what : `${what} (${v.kind} ${v.mm})`);
/** As the family's: a check on a heavy line passes if its number falls within the stroke; a scaled value gets no slack. */
function collector() {
  const out: Measured[] = [];
  const add = (name: string, kind: Measured['kind'], recorded: number, measured: number, within: number) => out.push({ name, kind, recorded, measured, within });
  const value = (what: string, v: Value, measured: number, within: number, stroke = 0, edges = 1) => {
    const slack = v.kind === 'scaled' ? 0 : (edges * stroke) / 2;
    add(slack > within ? `${label(what, v)}; drawn ${stroke.toFixed(2)} wide` : label(what, v), kindOf(v), v.mm, measured, slack > within ? slack : within);
  };
  return { out, add, value };
}
const mean = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length;
const K = 1 - Math.SQRT1_2;

/** A circle through points, least squares (Kåsa): centre and radius. */
function fitCircle(P: [number, number][]): { centre: [number, number]; radius: number; worst: number } {
  let [sx, sy, sxx, syy, sxy, sxz, syz, sz] = [0, 0, 0, 0, 0, 0, 0, 0];
  for (const [x, y] of P) {
    const z = x * x + y * y;
    [sx, sy, sxx, syy, sxy, sxz, syz, sz] = [sx + x, sy + y, sxx + x * x, syy + y * y, sxy + x * y, sxz + x * z, syz + y * z, sz + z];
  }
  // x² + y² = a·x + b·y + c, by Gaussian elimination.
  const A = [[sxx, sxy, sx, sxz], [sxy, syy, sy, syz], [sx, sy, P.length, sz]];
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) { const f = A[j][i] / A[i][i]; for (let k = i; k < 4; k++) A[j][k] -= f * A[i][k]; }
  const s = [0, 0, 0];
  for (let i = 2; i >= 0; i--) { let t = A[i][3]; for (let k = i + 1; k < 3; k++) t -= A[i][k] * s[k]; s[i] = t / A[i][i]; }
  const centre: [number, number] = [s[0] / 2, s[1] / 2];
  const radius = Math.sqrt(s[2] + centre[0] ** 2 + centre[1] ** 2);
  return { centre, radius, worst: Math.max(...P.map(([x, y]) => Math.abs(Math.hypot(x - centre[0], y - centre[1]) - radius))) };
}

/**
 * Detail A: calibrated on the corner's leaders (0.91 to 13.85, across above the phone and down left of it; the 0.00 and
 * 0.04 lines merge). Then the unlabelled crosses where the corner meets the straight edges: their arms, on a row 0.3
 * above the top edge and a column 0.3 left of the side.
 */
export function cornerReadings(pdf = PDF): Measured[] {
  const r = detailA, g = render(pdf, r);
  const { out, add, value } = collector();
  const marks = [0.91, 3.78, 8.43, 13.85];
  const xs = marks.map((m) => lineNear(g, [0, Math.round(toPx(r, [0, -4])[1])], [1, 0], g.width - 1, toPx(r, [m, 0])[0]));
  const ys = marks.map((m) => lineNear(g, [Math.round(toPx(r, [-4, 0])[0]), 0], [0, 1], g.height - 1, toPx(r, [0, m])[1]));
  const span = marks.at(-1)! - marks[0];
  const [sx, sy] = [(xs.at(-1)! - xs[0]) / span, (ys.at(-1)! - ys[0]) / span];
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [mean(xs.map((x, i) => x - marks[i] * sx)), mean(ys.map((y, i) => y - marks[i] * sy))] };
  add('Detail A px/mm across (calibration: the corner\'s leaders, 0.91 to 13.85)', 'check', r.pxPerMm, sx, 0.05);
  add('Detail A px/mm down (calibration: the corner\'s leaders, 0.91 to 13.85)', 'check', r.pxPerMm, sy, 0.05);
  add('Detail A datum across (px)', 'check', r.origin[0], cal.origin[0], 1);
  add('Detail A datum down (px)', 'check', r.origin[1], cal.origin[1], 1);
  marks.slice(1, -1).forEach((m, i) => {
    add(`Detail A leader ${m.toFixed(2)} across (dimensioned)`, 'check', m, (xs[i + 1] - cal.origin[0]) / cal.pxPerMm, 0.02);
    add(`Detail A leader ${m.toFixed(2)} down (dimensioned)`, 'check', m, (ys[i + 1] - cal.origin[1]) / cal.pxPerMm, 0.02);
  });
  const along = cornerTangent.mm;
  const arm = (k: 0 | 1) => {
    const from = k === 0 ? toPx(cal, [along - 3, -0.3]) : toPx(cal, [-0.3, along - 3]);
    const at = runNear(g, [Math.round(from[0]), Math.round(from[1])], k === 0 ? [1, 0] : [0, 1], Math.round(6 * cal.pxPerMm), 3 * cal.pxPerMm).at;
    return along - 3 + at / cal.pxPerMm;
  };
  const [a, b] = [arm(0), arm(1)];
  value(`corner's tangent crosses, along the top and down the side (${a.toFixed(3)}, ${b.toFixed(3)})`, cornerTangent, (a + b) / 2, 0.05);
  return out;
}

/**
 * Detail D, calibrated on its extension lines: across, the 0.00, 16.29, 51.34 and 58.42 lines on a row 5 above the
 * phone (fitted: scale from the outer two, datum their mean); down, the 0.00 line and the -16.29 line on a column 4.5
 * left of it. Then the camera's centre and circles, the flash's and the rear mic's, and the pill: its top and bottom
 * down the middle column, its ends as circles fitted to radial crossings.
 */
export function detailDReadings(pdf = PDF): Measured[] {
  const r = detailD, g = render(pdf, r);
  const { out, add, value } = collector();
  const marks = [0, 16.29, 51.34, 58.42];
  const row = Math.round(toPx(r, [0, -5])[1]), col = Math.round(toPx(r, [-4.5, 0])[0]);
  const xs = marks.map((m) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(r, [m, 0])[0]));
  const ys = [0, 16.29].map((m) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(r, [0, m])[1]));
  const sx = (xs[3] - xs[0]) / 58.42, sy = (ys[1] - ys[0]) / 16.29;
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [mean(xs.map((x, i) => x - marks[i] * sx)), ys[0]] };
  add('Detail D px/mm across (calibration: the 0.00 and 58.42 lines)', 'check', r.pxPerMm, sx, 0.05);
  add('Detail D px/mm down (calibration: the 0.00 and -16.29 lines)', 'check', r.pxPerMm, sy, 0.05);
  add('Detail D datum across (px)', 'check', r.origin[0], cal.origin[0], 1);
  add('Detail D datum down (px)', 'check', r.origin[1], cal.origin[1], 1);
  [16.29, 51.34].forEach((m, i) => add(`Detail D ${m.toFixed(2)} line across (dimensioned)`, 'check', m, (xs[i + 1] - cal.origin[0]) / cal.pxPerMm, 0.02));
  const mm = (px: [number, number]): [number, number] => [(px[0] - cal.origin[0]) / cal.pxPerMm, (px[1] - cal.origin[1]) / cal.pxPerMm];

  const cam = cameras.main;
  const ring = circleAt(g, toPx(cal, [cam.fromSide.mm, cam.fromTop.mm]), (cam.ring.mm / 2) * cal.pxPerMm);
  const [cs, ct] = mm(ring.centre);
  value('camera centre from the side', cam.fromSide, cs, 0.05);
  value('camera centre from the top', cam.fromTop, ct, 0.05);
  value('camera ring Ø (the outermost circle)', cam.ring, ring.diameter / cal.pxPerMm, 0.05, ring.stroke / cal.pxPerMm, 2);
  const win = circleAt(g, ring.centre, (cam.window.mm / 2) * cal.pxPerMm);
  value('camera window Ø (the innermost, heavy circle)', cam.window, win.diameter / cal.pxPerMm, 0.05);
  for (const [what, d] of [['flash', flash], ['rear mic', rearMic]] as const) {
    const f = cleanCircleAt(g, toPx(cal, [d.fromSide.mm, d.fromTop.mm]), (d.diameter.mm / 2) * cal.pxPerMm, [15, -15, 25, -25]);
    const [fs, ft] = mm(f.centre);
    value(`${what} centre from the side`, d.fromSide, fs, 0.05);
    value(`${what} centre from the top`, d.fromTop, ft, 0.05);
    value(`${what} Ø`, d.diameter, f.diameter / cal.pxPerMm, 0.05, f.stroke / cal.pxPerMm, 2);
  }

  // The pill: its top and bottom down the middle column (below the camera plateau's two lines near the top edge).
  const W = phone.body.width.mm;
  const c = Math.round(toPx(cal, [W / 2, 0])[0]);
  const top = mm([0, runNear(g, [c, 0], [0, 1], g.height - 1, toPx(cal, [0, pill.top.mm])[1]).at])[1];
  const foot = mm([0, runNear(g, [c, 0], [0, 1], g.height - 1, toPx(cal, [0, pill.top.mm + pill.height.mm])[1]).at])[1];
  value('pill top from the top edge', pill.top, top, 0.05);
  value('pill height (top to bottom)', pill.height, foot - top, 0.05);
  add('pill middle from the top (dimensioned 16.29: the camera\'s line)', 'check', 16.29, (top + foot) / 2, 0.05);
  // Its ends: crossings on rays from near each end's centre, every 5° from -85° to 85° (clear of the centre line), the
  // run nearest the recorded radius; a circle fitted to them.
  const ends = ([[16.55, -1], [W - 16.55, 1]] as const).map(([cx, side]) => {
    const o = toPx(cal, [cx, 16.285]);
    const P: [number, number][] = [];
    for (let a = -85; a <= 85; a += 5) {
      if (Math.abs(a) < 4) continue;
      const t = (a * Math.PI) / 180, d: [number, number] = [side * Math.cos(t), Math.sin(t)];
      const start = 9 * cal.pxPerMm;
      const rs = runs(g, [o[0] + d[0] * start, o[1] + d[1] * start], d, Math.round(5 * cal.pxPerMm))
        .map((q) => 9 + q.at / cal.pxPerMm)
        .filter((x) => Math.abs(x - pill.radius.mm - 0.15) < 0.4);
      if (rs.length === 1) P.push([cx + d[0] * rs[0], 16.285 + d[1] * rs[0]]);
    }
    const f = fitCircle(P);
    return { ...f, extreme: side < 0 ? f.centre[0] - f.radius : W - (f.centre[0] + f.radius), n: P.length };
  });
  value(`pill ends from each side (${ends.map((e) => e.extreme.toFixed(3)).join(', ')})`, pill.ends, (ends[0].extreme + ends[1].extreme) / 2, 0.05);
  value(`pill end radius (fitted to ${ends.map((e) => e.n).join(' and ')} crossings; worst ${Math.max(...ends.map((e) => e.worst)).toFixed(3)} off)`, pill.radius, (ends[0].radius + ends[1].radius) / 2, 0.05);
  return out;
}

/**
 * The back view (the plateau's bottom lies outside Detail D's boundary): calibrated on its outer edges, across on a
 * row 90 down (between the side button and Camera Control, below the volume buttons), down the column 4 left of the middle. Then the plateau's
 * outline across the middle column, the start-of-flat lines either side on a row 22 down (between the camera's centre
 * line and the outline's corner), and the outline's bottom corners on their diagonals.
 */
export function backReadings(pdf = PDF): Measured[] {
  const r = backView, g = render(pdf, r);
  const { out, add, value } = collector();
  const [W, L] = [phone.body.width.mm, phone.body.length.mm];
  const across = (fromTop: number, at: number, c: Calibration = r) => lineNear(g, [0, Math.round(toPx(c, [0, fromTop])[1])], [1, 0], g.width - 1, toPx(c, [at, 0])[0]);
  const down = (fromSide: number, at: number, c: Calibration = r) => lineNear(g, [Math.round(toPx(c, [fromSide, 0])[0]), 0], [0, 1], g.height - 1, toPx(c, [0, at])[1]);
  const [left, right] = [across(90, 0), across(90, W)];
  const [top, foot] = [down(W / 2 - 4, 0), down(W / 2 - 4, L)];
  const [sx, sy] = [(right - left) / W, (foot - top) / L];
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [left, top] };
  add('back view px/mm across (calibration)', 'check', r.pxPerMm, sx, 0.05);
  add('back view px/mm down (calibration)', 'check', r.pxPerMm, sy, 0.05);
  add('back view datum across (px)', 'check', r.origin[0], left, 1);
  add('back view datum down (px)', 'check', r.origin[1], top, 1);
  const mmA = (px: number) => (px - cal.origin[0]) / cal.pxPerMm, mmD = (px: number) => (px - cal.origin[1]) / cal.pxPerMm;
  value('plateau outline\'s bottom across the middle column', plateauBottom, mmD(down(W / 2, plateauBottom.mm, cal)), 0.05);
  // The pill again, at this scale: a check on Detail D's reading.
  add(`pill top in the back view (scaled ${pill.top.mm} in Detail D)`, 'check', pill.top.mm, mmD(down(W / 2, pill.top.mm, cal)), 0.05);
  const flat = [mmA(across(22, startOfFlat.mm, cal)), W - mmA(across(22, W - startOfFlat.mm, cal))];
  value(`start-of-flat lines from each side, 22 down (${flat.map((x) => x.toFixed(3)).join(', ')})`, startOfFlat, mean(flat), 0.05);
  const R = bump.baseRadius.mm, b0 = bump.baseFrom.mm, yb = plateauBottom.mm;
  const corner = (c: [number, number], dir: [number, number]) => lineNear(g, toPx(cal, c), dir, Math.round(2.5 * R * K * cal.pxPerMm), R * K * cal.pxPerMm) / cal.pxPerMm / K;
  const rs = [corner([b0, yb], [1, -1]), corner([W - b0, yb], [-1, -1])];
  value(`plateau outline's bottom corner radius, on the diagonals (corners ${rs.map((x) => x.toFixed(2)).join(', ')})`, bump.baseRadius, mean(rs), 0.05);
  return out;
}

/**
 * The right side view at 2400 dpi: the front on the left, the back (and the plateau) on the right. Calibrated across on
 * the back glass's, the 3.03's and the 5.68's extension lines above the phone (the back glass's the datum); down, from
 * the phone's top. Then the plateau's flat on a row 7 down (between the flank and the camera), the camera glass's line
 * on a row 14 down (off the centre line), and the plateau's flat's extent down a column just inside it.
 */
export function sideReadings(pdf = PDF): Measured[] {
  const r = sideView, g = render(pdf, r);
  const { out, add } = collector();
  const above = 1400;
  const [back, plat, glass] = [0, bump.top.mm, bump.rings.mm].map((x) => lineNear(g, [0, above], [1, 0], g.width - 1, r.origin[0] + x * r.pxPerMm));
  const s = (glass - back) / bump.rings.mm;
  add('side view px/mm (calibration: the back glass\'s and 5.68\'s extension lines)', 'check', r.pxPerMm, s, 0.1);
  add('side view datum across: the back glass\'s extension line (px)', 'check', r.origin[0], back, 1);
  add('back glass to camera plateau: its extension line (dimensioned 3.03)', 'check', bump.top.mm, (plat - back) / s, 0.03);
  const topEdge = lineNear(g, [450, 0], [0, 1], g.height - 1, r.origin[1]);
  add('side view datum down: the phone\'s top (px)', 'check', r.origin[1], topEdge, 1);
  const rowAt = (mm: number) => Math.round(topEdge + mm * s);
  const flatAt = (lineNear(g, [Math.round(back + 2 * s), rowAt(7)], [1, 0], Math.round(2 * s), 1.03 * s) + 2 * s) / s;
  add('the plateau\'s flat from the back glass, 7 down (dimensioned 3.03)', 'check', bump.top.mm, flatAt, 0.03);
  const camAt = (lineNear(g, [Math.round(back + 4 * s), rowAt(14)], [1, 0], Math.round(2 * s), 1.68 * s) + 4 * s) / s;
  add('the camera glass from the back glass, 14 down (dimensioned 5.68)', 'check', bump.rings.mm, camAt, 0.03);
  // The flat's extent: down a column 0.1 inside it, its first and last crossings (the flank's lines) about the camera.
  const col = Math.round(back + (bump.top.mm - 0.1) * s);
  const rs = runs(g, [col, rowAt(1)], [0, 1], Math.round(34 * s)).map((q) => 1 + q.at / s);
  const [f0, f1] = [rs[0], rs.at(-1)!];
  add(`the plateau's flat begins (side view, 0.1 inside it) at the pill's top (scaled ${pill.top.mm}; the flank's rounding)`, 'check', pill.top.mm, f0, 0.1);
  add(`the plateau's flat ends at the pill's bottom (scaled ${(pill.top.mm + pill.height.mm).toFixed(2)})`, 'check', pill.top.mm + pill.height.mm, f1, 0.1);
  // The flank below the pill: its line's middle on each row, from the back glass's extension line (the first line
  // beyond the back's own, which is 0.30 wide about it).
  const foot = pill.top.mm + pill.height.mm;
  for (const [o, h] of bump.flank!.points.slice(1, -1)) {
    const line = runs(g, [Math.round(back + 0.2 * s), rowAt(foot + o)], [1, 0], Math.round(3.5 * s))[0];
    add(`the flank ${o.toFixed(2)} below the pill (${(foot + o).toFixed(2)} down): its height`, 'scaled', h, (line.at + 0.2 * s) / s - (back - r.origin[0]) / s, 0.05);
  }
  return out;
}

/** The front view's datum, and the island's middle across (the family's island scan reads its length, not where it lies). */
function frontReadings(pdf: string, frontRow: number): Measured[] {
  const region = frontView, g = render(pdf, region);
  const { out, add } = collector();
  const { cal } = frontCalibration(phone, region, pdf, { frontRow }, g);
  add('front view datum across (px)', 'check', region.origin[0], cal.origin[0], 1);
  add('front view datum down (px)', 'check', region.origin[1], cal.origin[1], 1);
  const W = phone.body.width.mm, [il, it] = [phone.front.islandLength!.mm, phone.front.islandFromTop!.mm];
  const ends = [(W - il) / 2, (W + il) / 2].map((x) => (lineNear(g, [0, toPx(cal, [0, it])[1]], [1, 0], g.width - 1, toPx(cal, [x, 0])[0]) - cal.origin[0]) / cal.pxPerMm);
  add('island middle across (dimensioned 37.35)', 'check', W / 2, (ends[0] + ends[1]) / 2, 0.05);
  return out;
}

/**
 * In the family's bottom-view frame (calibrated on its extension lines, 0.00 to 50.36, on a row 1.5 beyond the front:
 * the outline is rounded nearly to the middle): the end holes' centres from chords (the extension lines are on their
 * centres), and the port's height at 4800 dpi.
 */
function bottomReadings(pdf: string): Measured[] {
  const c = bottomView, g = render(pdf, c);
  const { out, add } = collector();
  const W = phone.body.width.mm, b = phone.bottom;
  const { cal, px, backLine } = bottomCalibration(phone, c, pdf, { bottomExtension: b.holes.at(-1)!.mm }, g);
  // The 6X 2.71: its two extension lines, on a column 2 beyond the phone's side-button end (the holes' centre line and
  // the back's).
  const beyond = Math.round(toPx(cal, [W + 2, 0])[0]);
  const [hl, bl] = [b.holesFromBack.mm, 0].map((d) => lineNear(g, [beyond, 0], [0, 1], g.height - 1, backLine - d * px));
  add(`the holes' and screws' centre line from the back: the 2.71's extension lines (dimensioned ${b.holesFromBack.mm})`, 'check', b.holesFromBack.mm, (bl - hl) / px, 0.03);
  // Each end hole's centre across: the holes are drawn as heavy rings (Ø1.49 outside, Ø0.4 inside); the middle of the
  // ring's outer edges along their centre line.
  for (const i of [0, b.holes.length - 1]) {
    const x = toPx(cal, [b.holes[i].mm, 0])[0];
    const rs = runs(g, [Math.round(x - px), Math.round(hl)], [1, 0], Math.round(2 * px));
    const centre = (rs[0].at - rs[0].width / 2 + rs.at(-1)!.at + rs.at(-1)!.width / 2) / 2 + x - px;
    add(`bottom hole ${i + 1}'s centre (dimensioned ${b.holes[i].mm}: the extension line on its centre)`, 'check', b.holes[i].mm, (centre - cal.origin[0]) / px, 0.05);
  }
  out.push(...portHeight(pdf, cal, backLine));
  return out;

  /**
   * The port's outline is a 0.55 mm pen. At 4800 dpi, its outer edges span the length 8.83 where its extension lines
   * (33.05, 41.65) give 8.60: the dimension lands 0.115 inside each outer edge. The height is read the same way: its
   * outer edges down the port's middle column, less the same.
   */
  function portHeight(pdf: string, cal: Calibration, backLine: number): Measured[] {
    const k = 4;
    const centre = toPx(cal, [(b.portFrom.mm + b.portTo.mm) / 2, 0])[0];
    const yc = backLine - phone.connector.fromBack.mm * px;
    const r4 = { page: c.page, dpi: c.dpi * k, crop: { x: Math.round((c.crop.x + centre) * k - 700), y: Math.round((c.crop.y + yc) * k - 500), width: 1400, height: 1000 } };
    const g4: Gray = render(pdf, r4);
    const p4 = px * k;
    const mid: [number, number] = [700, 500];
    const outer = (rs: { at: number; width: number }[], target: number, side: -1 | 1) => {
      const q = rs.reduce((p, q2) => (Math.abs(q2.at - target) < Math.abs(p.at - target) ? q2 : p));
      return q.at + (side * q.width) / 2;
    };
    const rowRuns = runs(g4, [0, mid[1]], [1, 0], g4.width - 1);
    const len = (b.portTo.mm - b.portFrom.mm) * p4;
    const [l0, l1] = [outer(rowRuns, mid[0] - len / 2, -1), outer(rowRuns, mid[0] + len / 2, 1)];
    const lengthOuter = (l1 - l0) / p4;
    const inset = (lengthOuter - (b.portTo.mm - b.portFrom.mm)) / 2;
    const colRuns = runs(g4, [mid[0] + 150, 0], [0, 1], g4.height - 1);
    const h = b.portHeight.mm * p4;
    const [h0, h1] = [outer(colRuns, mid[1] - h / 2, -1), outer(colRuns, mid[1] + h / 2, 1)];
    const { out: o, value: val } = collector();
    val(`port height (its outline's outer edges, ${((h1 - h0) / p4).toFixed(3)}, less ${inset.toFixed(3)} a side as its length's 8.60 lands)`, b.portHeight, (h1 - h0) / p4 - 2 * inset, 0.05);
    return o;
  }
}

const deg = (rad: number) => (rad * 180) / Math.PI;
const tanHalf = (fullDeg: number) => Math.tan((fullDeg / 2) * (Math.PI / 180));
/** A line u = a + b·v through points (u, v), least squares, dropping points more than `tol` px off and refitting. */
function fitLine(P: [number, number][], tol = 3): { a: number; b: number; n: number } {
  let pts = P.filter(([u]) => Number.isFinite(u));
  let a = 0, b = 0;
  for (let pass = 0; pass < 4; pass++) {
    const mv = mean(pts.map((p) => p[1])), mu = mean(pts.map((p) => p[0]));
    b = pts.reduce((t, [u, v]) => t + (u - mu) * (v - mv), 0) / pts.reduce((t, [, v]) => t + (v - mv) ** 2, 0);
    a = mu - b * mv;
    pts = P.filter(([u, v]) => Number.isFinite(u) && Math.abs(u - (a + b * v)) < tol);
  }
  return { a, b, n: pts.length };
}
type Line = { a: number; b: number; n: number };
/** Where two lines u = a + b·v meet, as (u, v); a line's angle off the axis (u), degrees; v on a line at u. */
const meet = (l: Line, m: Line): [number, number] => { const v = (m.a - l.a) / (l.b - m.b); return [l.a + l.b * v, v]; };
const offAxis = (l: Line) => 90 - deg(Math.atan(Math.abs(l.b)));
const vAt = (l: Line, u: number) => (u - l.a) / l.b;
/** A section drawn lying (U-U: the front face at the bottom) turned upright: u out of the back, v across. */
const turned = (g: Gray): Gray => ({ width: g.height, height: g.width, at: (u: number, v: number) => g.at(v, g.height - 1 - u) });
/** From each start, along dir, the first dark run's middle: its near edge plus half the pen (the median run's width). */
function traced(g: Gray, starts: [number, number][], dir: [number, number], length: number): [number, number][] {
  const hits = starts.flatMap((p) => {
    const q = runs(g, p, dir, length)[0];
    return q ? [{ p, near: q.at - (q.width - 1) / 2, width: q.width }] : [];
  });
  const ws = hits.map((h) => h.width).sort((a, b) => a - b), pen = ws[Math.floor(ws.length / 2)];
  return hits.map(({ p, near }): [number, number] => [p[0] + dir[0] * (near + (pen - 1) / 2), p[1] + dir[1] * (near + (pen - 1) / 2)]);
}
const steps = (a: number, b: number, n = 40) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);

/**
 * Sheet 3's Sections T-T (down the phone) and U-U (across, drawn lying: turned upright here), each through the flash.
 * Each is calibrated on its front face and an extension line clear of the phone (T-T: the 10.37 line on a row above it;
 * U-U: the 12.57 closing line on a column right of it), checked on the others (8.57, 10.37, 12.57); its axis midway
 * between the base's extension lines (6.13, 6.00). At 4800 dpi, the strobe's face and the plateau beside it. Then the
 * keepout's four lines, fitted (the inner ones on rows between the base's corner and the kink, from 8.82 out; the
 * outer ones on rows 6.5 to 14 from the axis, from 10.47 out), their crossings and angles, the inner cone's width at
 * its base; the hand calculations, and the negative controls.
 */
export function sectionReadings(pdf = PDF): Measured[] {
  const { out, add } = collector();
  const base = flashKeepoutBase.fromFront.mm, transition = flashKeepout.transitionFromFront!.mm, end = flashKeepoutEnd.mm;
  const T = body.thickness.mm, plateau = T + bump.top.mm;
  const results: Record<string, { apex: number; outerApex: number; kinks: number[]; base: number }> = {};
  for (const which of ['T-T', 'U-U'] as const) {
    const r = which === 'T-T' ? sectionTT : sectionUU, raw = render(pdf, r);
    const D = which === 'T-T' ? flashKeepout.innerBaseDiameter!.mm : flashKeepoutAcross.innerBaseDiameter.mm;
    const apexDerived = which === 'T-T' ? flashKeepout.apexFromFront!.mm : flashKeepoutAcross.apexFromFront.mm;
    const outerDerived = which === 'T-T' ? flashKeepout.outerApexFromFront!.mm : flashKeepoutAcross.outerApexFromFront.mm;
    // In raw px: the front face, the lines, the base's extension lines. T-T reads rows (u = x), U-U columns (u = up).
    let face: number, px: number, axis: number, lineAt: (mm: number) => number, ext: number[];
    if (which === 'T-T') {
      const at = (row: number, mm: number, f: number, p: number) => lineNear(raw, [0, row], [1, 0], raw.width - 1, f + mm * p);
      face = at(300, 0, r.origin[0], r.pxPerMm);
      px = (at(300, transition, face, r.pxPerMm) - face) / transition;
      lineAt = (mm) => (mm === end ? at(2700, mm, face, px) : at(700, mm, face, px));
      ext = [-1, 1].map((sd) => lineNear(raw, [100, 0], [0, 1], raw.height - 1, r.origin[1] + (sd * D * px) / 2));
    } else {
      const at = (col: number, mm: number, f: number, p: number) => lineNear(raw, [col, 0], [0, 1], raw.height - 1, f - mm * p);
      face = at(1800, 0, r.origin[1], r.pxPerMm);
      px = (face - at(2550, end, face, r.pxPerMm)) / end;
      lineAt = (mm) => at(2550, mm, face, px);
      ext = [-1, 1].map((sd) => lineNear(raw, [0, 2050], [1, 0], raw.width - 1, r.origin[0] + (sd * D * px) / 2));
    }
    const mmOut = (p: number) => (which === 'T-T' ? p - face : face - p) / px;
    axis = (ext[0] + ext[1]) / 2;
    add(`Section ${which} px/mm (calibration: the front face to the ${which === 'T-T' ? '10.37' : '12.57'} line)`, 'check', r.pxPerMm, px, 0.05);
    add(`${which} front face (px)`, 'check', which === 'T-T' ? r.origin[0] : r.origin[1], face, 1);
    for (const m of which === 'T-T' ? [base, end] : [base, transition]) add(`${which} the ${m.toFixed(2)} extension line, clear of the phone (${m === end ? '8.57 + (4.00)' : m === base ? 'dimensioned 8.57' : 'dimensioned 10.37 in T-T'})`, 'check', m, mmOut(lineAt(m)), 0.03);
    add(`${which} the base's extension lines apart (dimensioned ${D.toFixed(2)})`, 'check', D, (ext[1] - ext[0]) / px, 0.03);
    add(`${which} the axis, midway between them (px)`, 'check', which === 'T-T' ? r.origin[1] : r.origin[0], axis, 1);

    // The faces at 4800 dpi: a strip 7.9 to 9.1 from the front, across the section. Between the base's corners (±2 from
    // the axis) one line, the strobe's face; beside them (T-T: 5 to 8 either side; U-U: 4 to 8 on the right, where its
    // extension line runs) the 8.57 line merged with the plateau's 0.10 outside it, read by the run's edges less half a
    // pen; U-U's left (-4 to -8) the plateau's line alone.
    const f4 = 4, pen4 = 23, p4 = px * f4;
    const strip: Region = which === 'T-T'
      ? { page: r.page, dpi: r.dpi * f4, crop: { x: Math.round((r.crop.x + face + 7.9 * px) * f4), y: Math.round((r.crop.y + axis - 10 * px) * f4), width: Math.round(1.2 * p4), height: Math.round(20 * p4) } }
      : { page: r.page, dpi: r.dpi * f4, crop: { x: Math.round((r.crop.x + axis - 10 * px) * f4), y: Math.round((r.crop.y + face - 9.1 * px) * f4), width: Math.round(20 * p4), height: Math.round(1.2 * p4) } };
    const s4raw = render(pdf, strip), s4 = which === 'T-T' ? s4raw : turned(s4raw);
    // In s4: u from 7.9 out (T-T: x; U-U turned: up), v from 10 before the axis.
    const run4 = (d: number) => runs(s4, [0, Math.round((10 + d) * p4)], [1, 0], s4.width - 1).map((q) => ({ near: 7.9 + (q.at - (q.width - 1) / 2 + (pen4 - 1) / 2) / p4, far: 7.9 + (q.at + (q.width - 1) / 2 - (pen4 - 1) / 2) / p4, width: q.width }));
    const median = (a: number[]) => [...a].sort((p, q) => p - q)[Math.floor(a.length / 2)];
    const one = (ds: number[]) => median(ds.map((d) => run4(d).reduce((p, q) => (Math.abs((q.near + q.far) / 2 - base) < Math.abs((p.near + p.far) / 2 - base) ? q : p))).map((q) => (q.near + q.far) / 2));
    add(`${which} between the base's corners (±1, ±2 from the axis): one line, the strobe's face (dimensioned 8.57; 4800 dpi)`, 'check', base, one([-2, -1, 1, 2]), 0.02);
    const merged = (ds: number[]) => {
      const qs = ds.map((d) => run4(d).reduce((p, q) => (Math.abs(q.near - base) < Math.abs(p.near - base) ? q : p)));
      return [median(qs.map((q) => q.near)), median(qs.map((q) => q.far))];
    };
    const beside = which === 'T-T' ? [-8, -7, -6, -5, 5, 6, 7, 8] : [4, 5, 6, 7, 8];
    const [near, far] = merged(beside);
    add(`${which} beside the base (${which === 'T-T' ? '5 to 8 either side' : '4 to 8 right'}): the 8.57 extension line, the merged run's near line`, 'check', base, near, 0.02);
    add(`${which} beside the base: the plateau, its far line (5.64 + 3.03 = 8.67)`, 'check', plateau, far, 0.02);
    if (which === 'U-U') add('U-U left of the base (-4 to -8): the plateau\'s line alone (8.67)', 'check', plateau, one([-4, -5, -6, -7]) , 0.02);

    // The keepout's lines, in the section turned upright (u out of the back from the face, v across from the axis).
    const g = which === 'T-T' ? raw : turned(raw);
    const faceU = which === 'T-T' ? face : raw.height - 1 - face;
    const U = (mm: number) => faceU + mm * px, mm = (u: number) => (u - faceU) / px;
    const t = tanHalf(flashKeepout.inner.mm), rb = D / 2;
    const innerRows = steps(rb + 0.35 * t, rb + (transition - 0.15 - base) * t), outerRows = steps(6.5, 14);
    const along = (rows: number[], side: number, from: number) => fitLine(traced(g, rows.map((v): [number, number] => [Math.round(U(from)), Math.round(axis + side * v * px)]), [1, 0], Math.round(4 * px)));
    const [innerL, innerR] = [-1, 1].map((sd) => along(innerRows, sd, base + 0.25));
    const [outerL, outerR] = [-1, 1].map((sd) => along(outerRows, sd, transition + 0.1));
    const sides = which === 'T-T' ? ['upper', 'lower'] : ['left', 'right'];
    const kinks = [meet(innerL, outerL), meet(innerR, outerR)];
    kinks.forEach((q, i) => add(`${which} ${sides[i]} kink, inner cone to outer, from the front (10.37)`, 'check', transition, mm(q[0]), 0.05));
    [innerL, innerR].forEach((l, i) => add(`${which} ${sides[i]} inner line off the axis (half 82°; ${l.n} points)`, 'check', flashKeepout.inner.mm / 2, offAxis(l), 1));
    add(`${which} inner cone, full angle as drawn (degrees)`, 'check', flashKeepout.inner.mm, offAxis(innerL) + offAxis(innerR), 1);
    add(`${which} outer cone, full angle as drawn (degrees; fitted to ${outerL.n} and ${outerR.n} points)`, 'check', flashKeepout.outer!.mm, offAxis(outerL) + offAxis(outerR), 1);
    const apex = meet(innerL, innerR), outerApex = meet(outerL, outerR);
    add(`${which} inner apex on the axis (mm across)`, 'check', 0, (apex[1] - axis) / px, 0.1);
    add(`${which} inner cone's apex from the front (derived ${apexDerived.toFixed(2)}${which === 'T-T' ? ', Ø6.00\'s 5.12' : ''}; the drawn lines crossed)`, 'check', apexDerived, mm(apex[0]), 0.1);
    add(`${which} outer cone's apex from the front (derived ${outerDerived.toFixed(2)}; the drawn lines crossed)`, 'check', outerDerived, mm(outerApex[0]), 0.1);
    const atBase = (vAt(innerR, U(base)) - vAt(innerL, U(base))) / px;
    // T-T draws its base as U-U's Ø6.00, not its own 6.13 (whose extension lines, ±3.065, end 0.6 short of the base).
    const drawnAsUU = 'T-T draws its inner cone from a Ø6.00 base, U-U\'s number, not its own 6.13: its inner lines meet the strobe\'s face 6.00 apart, their kinks are Ø6.00\'s 9.13 apart and their apex is Ø6.00\'s 5.12; its 6.13 extension lines (±3.065, measured 6.13 apart) end 0.6 short of the base. The family\'s cone takes 6.13, the larger';
    const known = which === 'T-T' ? { known: drawnAsUU } : {};
    out.push({ name: `${which} inner cone at its base, 8.57 (dimensioned ${D.toFixed(2)})`, kind: 'check', recorded: D, measured: atBase, within: 0.05, ...known });
    // Hand calculation from the printed numbers alone: the cone from the base out to the transition, against the drawn
    // kinks' spacing (T-T's against U-U's Ø6.00 as well).
    const spacing = Math.abs(kinks[1][1] - kinks[0][1]) / px;
    const across = (d: number) => d + 2 * (transition - base) * t;
    out.push({ name: `${which} transition, Ø${D.toFixed(2)} + 2 (10.37 - 8.57) tan 41° = ${across(D).toFixed(2)}, against the drawn kinks' spacing`, kind: 'check', recorded: across(D), measured: spacing, within: 0.1, ...known });
    if (which === 'T-T') add(`T-T transition from U-U's Ø6.00: ${across(flashKeepoutAcross.innerBaseDiameter.mm).toFixed(2)}, against the drawn kinks' spacing`, 'check', across(flashKeepoutAcross.innerBaseDiameter.mm), spacing, 0.1);
    results[which] = { apex: mm(apex[0]), outerApex: mm(outerApex[0]), kinks: kinks.map((q) => mm(q[0])), base: atBase };
    // Read from the back glass, "to cover glass" would put the kinks 5.64 further out.
    add(`negative control (${which}): read from the back glass the transition would be ${(T + transition).toFixed(2)} from the front (1 = the drawn kinks are over 4 mm from it)`, 'check', 1, Math.abs(mean(results[which].kinks) - (T + transition)) > 4 ? 1 : 0, 0);
    add(`negative control (${which}): 8.57 read as the inner cone's apex (1 = the drawn lines cross over 2.5 mm nearer the front)`, 'check', 1, base - results[which].apex > 2.5 ? 1 : 0, 0);
  }
  // The outer cone is one circular cone to 0.013: its apex, worked from each section's printed numbers.
  const outerApex = (D: number) => transition - (D / 2 + (transition - base) * tanHalf(flashKeepout.inner.mm)) / tanHalf(flashKeepout.outer!.mm);
  const [vApex, hApex] = [outerApex(flashKeepout.innerBaseDiameter!.mm), outerApex(flashKeepoutAcross.innerBaseDiameter.mm)];
  add(`hand calculation: the outer cone's apex from T-T's numbers (${vApex.toFixed(3)}) and U-U's (${hApex.toFixed(3)}) agree`, 'check', vApex, hApex, 0.02);
  add('the outer cone\'s apex as drawn, T-T against U-U (mm)', 'check', results['T-T'].outerApex, results['U-U'].outerApex, 0.1);
  // The numbers say the base isn't round (6.13 down, 6.00 across); the drawing draws it round, Ø6.00 in both.
  add('the base as drawn, T-T against U-U (one round base, Ø6.00)', 'check', results['U-U'].base, results['T-T'].base, 0.05);
  add('negative control: T-T drawn to its own 6.13? (1 = its drawn base is over 0.08 narrower: it isn\'t)', 'check', 1, flashKeepout.innerBaseDiameter!.mm - results['T-T'].base > 0.08 ? 1 : 0, 0);
  return out;
}

/**
 * Sheet 4's MagSafe view, calibrated on its extension lines: across, the 0.00 and 28.83 lines on a row 4.5 above the
 * phone; down, the 0.00 and 113.75 lines on a column 5 left of it. The other dimensioned lines check it (34.17, 78.34
 * and 151.29 on the same column; 18.11 and 37.35 run down, read on a row 158 down), and the phone's width and length.
 * Then the clear area's circle (crossings on rays from the product centre, fitted), the magnetic zone's top (34.17,
 * dimensioned, and the plateau's outline's bottom in the back view) and its arc.
 */
export function magsafeReadings(pdf = PDF): Measured[] {
  const r = magsafeView, g = render(pdf, r);
  const { out, add } = collector();
  const rowAbove = Math.round(toPx(r, [0, -4.5])[1]), rowBelow = Math.round(toPx(r, [0, 158])[1]);
  const colLeft = Math.round(toPx(r, [-5, 0])[0]);
  const xAt = (row: number, m: number, c: Calibration = r) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(c, [m, 0])[0]);
  const yAt = (col: number, m: number, c: Calibration = r) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(c, [0, m])[1]);
  const corner = 28.83, sides = magsafe.zoneSidesTo!.mm;
  const [x0, x1] = [0, corner].map((m) => xAt(rowAbove, m));
  const [y0, y1] = [0, sides].map((m) => yAt(colLeft, m));
  const sx = (x1 - x0) / corner, sy = (y1 - y0) / sides;
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [x0, y0] };
  const X = (p: number) => (p - cal.origin[0]) / cal.pxPerMm, Y = (p: number) => (p - cal.origin[1]) / cal.pxPerMm;
  const col = (x: number) => Math.round(toPx(cal, [x, 0])[0]);
  add('MagSafe view px/mm across (calibration: the 0.00 and 28.83 lines)', 'check', r.pxPerMm, sx, 0.05);
  add('MagSafe view px/mm down (calibration: the 0.00 and 113.75 lines)', 'check', r.pxPerMm, sy, 0.05);
  add('MagSafe view datum across (px)', 'check', r.origin[0], x0, 1);
  add('MagSafe view datum down (px)', 'check', r.origin[1], y0, 1);
  add('MagSafe view 37.35 line across, below (dimensioned PRODUCT CENTER)', 'check', magsafe.fromSide.mm, X(xAt(rowBelow, magsafe.fromSide.mm, cal)), 0.03);
  add('MagSafe view 18.11 line across, below (dimensioned: the compass)', 'check', 18.11, X(xAt(rowBelow, 18.11, cal)), 0.03);
  for (const m of [magsafe.zoneFrom!.mm, magsafe.fromTop.mm, 151.29]) add(`MagSafe view ${m.toFixed(2)} line down, left (dimensioned)`, 'check', m, Y(yAt(colLeft, m, cal)), 0.03);
  const row90 = Math.round(toPx(cal, [0, 90])[1]);
  add('the phone\'s width on the MagSafe view, 90 down (74.70)', 'check', body.width.mm, X(xAt(row90, body.width.mm, cal)) - X(xAt(row90, 0, cal)), 0.05);
  // Its length, down a column 55 across (clear of the centre line and the compass): the outermost line at the bottom.
  const bottomEdge = Y(runs(g, [col(55), 0], [0, 1], g.height - 1).filter((q) => Y(q.at) < 160).at(-1)!.at);
  add('the phone\'s length on the MagSafe view, 55 across (156.18)', 'check', body.length.mm, bottomEdge, 0.05);

  // The clear area's circle: crossings within 0.25 of R30.75 on rays every 5° from the product centre, clear of the
  // centre lines (within 6° of each axis) and of the two leaders that cross it (the clear area's note's at about 19°,
  // Ø61.50's at about 37°: down is positive), keeping rays with one crossing only (a hatch line meeting the circle
  // gives two).
  const c: [number, number] = [magsafe.fromSide.mm, magsafe.fromTop.mm], R = magsafe.diameter.mm / 2;
  const P: [number, number][] = [];
  for (let a = 0; a < 360; a += 5) {
    if ([0, 90, 180, 270, 360].some((b) => Math.abs(a - b) < 6) || [19, 37].some((b) => Math.abs(a - b) < 9)) continue;
    const t = (a * Math.PI) / 180, d: [number, number] = [Math.cos(t), Math.sin(t)];
    const o = toPx(cal, c), start = (R - 1.5) * cal.pxPerMm;
    const rs = runs(g, [o[0] + d[0] * start, o[1] + d[1] * start], d, Math.round(3 * cal.pxPerMm)).map((q) => R - 1.5 + q.at / cal.pxPerMm).filter((x) => Math.abs(x - R) < 0.25);
    if (rs.length === 1) P.push([c[0] + d[0] * rs[0], c[1] + d[1] * rs[0]]);
  }
  const f = fitCircle(P);
  add(`clear area's circle: centre across (fitted to ${P.length} crossings; worst ${f.worst.toFixed(3)} off)`, 'check', magsafe.fromSide.mm, f.centre[0], 0.05);
  add('clear area\'s circle: centre down (round PRODUCT CENTER, 78.34)', 'check', magsafe.fromTop.mm, f.centre[1], 0.05);
  add('clear area\'s circle: Ø (dimensioned 61.50)', 'check', magsafe.diameter.mm, 2 * f.radius, 0.05);
  // PRODUCT CENTER isn't the middle of the length: the circle is round 78.34, not 156.18 / 2.
  add(`negative control: round the length's middle (${(body.length.mm / 2).toFixed(2)})? (1 = the fitted centre is over 0.15 below it: it isn't)`, 'check', 1, f.centre[1] - body.length.mm / 2 > 0.15 ? 1 : 0, 0);

  // The zone's top, on columns 32, 45 and 50 across (right of the camera's crosshatched corner, which ends on it too;
  // clear of a hatch line meeting it at 40; left of 58, where the plateau's outline leaves it, rising into its blend:
  // 33.90 at 60): the outline is drawn on it and its hatch lines meet it from below, so each is the first ink down from
  // 1 mm above, its near edge plus half the pen (the 34.17 extension line's).
  const zf = magsafe.zoneFrom!.mm;
  const pen = runNear(g, [colLeft, 0], [0, 1], g.height - 1, toPx(cal, [0, zf])[1]).width;
  for (const x of [32, 45, 50]) {
    const from = Math.round(toPx(cal, [0, zf - 1])[1]), q = runs(g, [col(x), from], [0, 1], Math.round(2 * cal.pxPerMm))[0];
    add(`magnetic zone's top at ${x} across (dimensioned 34.17)`, 'check', zf, Y(from + q.at - (q.width - 1) / 2 + (pen - 1) / 2), 0.03);
  }
  add('the plateau\'s outline\'s bottom, scaled in the back view, against the zone\'s top (dimensioned 34.17 here)', 'check', zf, plateauBottom.mm, 0.05);

  // Its arc: the lowest point down columns 0.75 either side of the centre line; its crossings of x = 12, 20, 55 and 65
  // (clear of the R49.39 leader, which lands on the arc about 5 across), against the circle through (0, 113.75) and
  // (74.70, 113.75) of R49.39, its centre derived.
  const zr = magsafe.zoneRadius!.mm, half = body.width.mm / 2;
  const zc = sides - Math.sqrt(zr * zr - half * half);
  add(`hand calculation: the zone's arc's centre, 113.75 - √(49.39² - 37.35²) = ${zc.toFixed(3)} down, 3.09 below the product centre`, 'check', magsafe.fromTop.mm + 3.09, zc, 0.01);
  const low = mean([half - 0.75, half + 0.75].map((x) => Y(yAt(col(x), zc + zr, cal)) + (zr - Math.sqrt(zr * zr - 0.75 * 0.75))));
  add(`magnetic zone's arc, its lowest point (centre ${zc.toFixed(2)} down, derived, + R49.39)`, 'check', zc + zr, low, 0.05);
  for (const x of [12, 20, 55, 65]) {
    const at = zc + Math.sqrt(zr * zr - (x - half) ** 2);
    add(`magnetic zone's arc at x = ${x} (${at.toFixed(2)})`, 'check', at, Y(yAt(col(x), at, cal)), 0.05);
  }
  // The negative control: R49.39 centred on the product centre would bottom out 3.09 higher.
  add(`negative control: centred on the product centre, R49.39's lowest point would be ${(magsafe.fromTop.mm + zr).toFixed(2)} (1 = the drawn one is over 2 mm lower)`, 'check', 1, low - (magsafe.fromTop.mm + zr) > 2 ? 1 : 0, 0);
  return out;
}

export const remeasure = (pdf = PDF): Measured[] => [
  ...cornerReadings(pdf),
  ...detailDReadings(pdf),
  ...backReadings(pdf),
  ...sideReadings(pdf),
  ...sectionReadings(pdf),
  ...magsafeReadings(pdf),
  // The active area's bottom-left diagonal runs along a hatch line (as the 17 Pro's): left out. The calibration row
  // 140 down: below Camera Control, above the bottom corners. The bottom view on its extension lines, 0.00 to 50.36.
  ...family(phone, { front: frontView, bottom: bottomView }, pdf, { activeCorners: ['top-left', 'top-right', 'bottom-right'], frontRow: 140, bottomExtension: phone.bottom.holes.at(-1)!.mm }),
  ...frontReadings(pdf, 140),
  ...bottomReadings(pdf),
];

export const hasPdf = () => existsSync(PDF);

if (import.meta.main) console.log(report(remeasure()));
