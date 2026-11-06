// Re-measures every scaled value in drawing.ts from the PDF, and checks each view's calibration on dimensioned features
// it didn't use.
//
// The SE's drawing is on its own plan, so this file measures its views itself, with the family's calibrations where
// they fit (frontCalibration, bottomCalibration). The family's back view calibrates on two camera centres (the SE has
// one); its front view takes the display's inset from the top as its inset from the sides too (the SE's are 17.19 and
// 4.38) and crosses rounded corners (the SE's are square). So: the back view on its extension lines; Detail C (the
// camera's circles, at twice the back view's scale) on the 12.40's extension lines, its circles read along rays parallel
// to its hatching; Detail D (the turret and the keepout cones in section) on the Ø4.54 and Ø4.16 extension lines;
// the front view on its outer edges; Detail E (the edge profile) on its faces and its insets' extension lines; the
// bottom view on its extension lines.
//
//   node iphone-se-3rd-generation/measure.ts   → a table: recorded, measured, the difference
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { bottomCalibration, frontCalibration, report, type Measured } from '../../measure.ts';
import type { Value } from '../../../src/provenance.ts';
import { circleAt, lineNear, render, runNear, runs, toPx, type Calibration, type Gray } from '../../../src/raster.ts';
import { activeFromSide, backView, body, bottom, bottomView, bump, cameras, detailC, detailD, detailE, edgeReadings, flash, flashAtSurface, flashKeepout, front, frontView, notBuilt, phone, rearMic, turret } from './drawing.ts';

export const PDF = join(import.meta.dirname, '..', '..', 'drawings', 'iphone-se-3rd-generation.pdf');

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

/**
 * A small circle's centre from chords, where hatching or a heavy pen crowds it: on rows (and columns) offset by each of
 * `offsets` (mm), the runs nearest where the recorded circle's chord ends would be, kept only when both are thin (no
 * hatch line or leader merged in); the mean of the kept chords' middles.
 */
function chordCentre(g: Gray, cal: Calibration, at: [number, number], diameter: number, offsets: number[], thin: number): { centre: [number, number]; chords: number } {
  const r = diameter / 2;
  const axis = (k: 0 | 1) => {
    const mids: number[] = [];
    for (const o of offsets) {
      const half = Math.sqrt(r * r - o * o);
      const p = toPx(cal, k === 0 ? [at[0] - 2 * r, at[1] + o] : [at[0] + o, at[1] - 2 * r]);
      const step: [number, number] = k === 0 ? [1, 0] : [0, 1];
      const rs = runs(g, [Math.round(p[0]), Math.round(p[1])], step, Math.round(4 * r * cal.pxPerMm));
      const near = (mm: number) => rs.reduce((a, b) => (Math.abs(b.at - mm * cal.pxPerMm) < Math.abs(a.at - mm * cal.pxPerMm) ? b : a));
      const [a, b] = [near(2 * r - half), near(2 * r + half)];
      if (a.width <= thin && b.width <= thin) mids.push((a.at + b.at) / 2 / cal.pxPerMm - 2 * r + at[k]);
    }
    return mids;
  };
  const [xs, ys] = [axis(0), axis(1)];
  return { centre: [mean(xs), mean(ys)], chords: Math.min(xs.length, ys.length) };
}

/**
 * The back view, calibrated on its extension lines: across, the 0.00, 10.44, 18.13, 22.84 and 51.43 lines on a row 6
 * above the phone (scale from the outer two, datum their mean); down, the 0.00, 10.24 and 15.40 lines on a column 4
 * left of it. Then the camera's outermost circle and the flash's centre (its circle sits in the hatched antenna area).
 */
export function backReadings(pdf = PDF): Measured[] {
  const r = backView, g = render(pdf, r);
  const { out, add, value } = collector();
  const across = [0, 10.44, 18.13, 22.84, 51.43], down = [0, 10.24, 15.4];
  const row = Math.round(toPx(r, [0, -6.3])[1]), col = Math.round(toPx(r, [-4, 0])[0]);
  const xs = across.map((m) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(r, [m, 0])[0]));
  const ys = down.map((m) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(r, [0, m])[1]));
  const sx = (xs.at(-1)! - xs[0]) / 51.43, sy = (ys.at(-1)! - ys[0]) / 15.4;
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [mean(xs.map((x, i) => x - across[i] * sx)), mean(ys.map((y, i) => y - down[i] * sy))] };
  add('back view px/mm across (calibration: the 0.00 and 51.43 lines)', 'check', r.pxPerMm, sx, 0.05);
  add('back view px/mm down (calibration: the 0.00 and 15.40 lines)', 'check', r.pxPerMm, sy, 0.05);
  add('back view datum across (px)', 'check', r.origin[0], cal.origin[0], 1);
  add('back view datum down (px)', 'check', r.origin[1], cal.origin[1], 1);
  [10.44, 18.13, 22.84].forEach((m, i) => add(`back view ${m.toFixed(2)} line across (dimensioned)`, 'check', m, (xs[i + 1] - cal.origin[0]) / cal.pxPerMm, 0.03));
  add('back view 10.24 line down (dimensioned)', 'check', 10.24, (ys[1] - cal.origin[1]) / cal.pxPerMm, 0.03);
  add('back view outer edge across (dimensioned 67.27)', 'check', body.width.mm, (lineNear(g, [0, Math.round(toPx(cal, [0, 80])[1])], [1, 0], g.width - 1, toPx(cal, [67.27, 0])[0]) - cal.origin[0]) / cal.pxPerMm, 0.05);

  const cam = cameras.main;
  const c = circleAt(g, toPx(cal, [cam.fromSide.mm, cam.fromTop.mm]), (turret.base.mm / 2) * cal.pxPerMm);
  const mm = (px: [number, number]) => [(px[0] - cal.origin[0]) / cal.pxPerMm, (px[1] - cal.origin[1]) / cal.pxPerMm];
  const [cs, ct] = mm(c.centre);
  value('camera centre from the side (the outermost circle)', cam.fromSide, cs, 0.05);
  value('camera centre from the top', cam.fromTop, ct, 0.05);
  add(`camera outermost circle Ø (Detail C's ${turret.base.mm}, scaled there)`, 'check', turret.base.mm, c.diameter / cal.pxPerMm, 0.1);
  const f = chordCentre(g, cal, [flash.fromSide.mm, flash.fromTop.mm], flash.diameter.mm, [0.55, -0.55, 0.95, -0.95], 13);
  value(`flash centre from the side (${f.chords} clean chords a side, clear of the hatching)`, flash.fromSide, f.centre[0], 0.05);
  value('flash centre from the top', flash.fromTop, f.centre[1], 0.05);
  return out;
}

/**
 * Detail C, at twice the back view's scale: across, the 12.40's extension lines (the camera's and the flash's centres)
 * on a row above the phone; down, the camera's centre line, crossed by a column between the camera and the flash. Its
 * datum is put where those place the camera (10.44, 10.24). The camera's circles along rays at 135° and 315°, parallel
 * to the hatching (so they cross none), averaged: the outermost (the turret's outline, scaled), the thin one inside it
 * (Ø8.57), the heavy ring (its middle the turret's top, its inner edge the window, scaled). The flash and the rear mic
 * from clean chords.
 */
export function detailCReadings(pdf = PDF): Measured[] {
  const r = detailC, g = render(pdf, r);
  const { out, add, value } = collector();
  const cam = cameras.main;
  const guess = toPx(r, [cam.fromSide.mm, cam.fromTop.mm]);
  const row = Math.round(toPx(r, [0, -8])[1]);
  const [x0, x1] = [cam.fromSide.mm, flash.fromSide.mm].map((m) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(r, [m, 0])[0]));
  const s = (x1 - x0) / 12.4;
  const y0 = lineNear(g, [Math.round((x0 + x1) / 2 - 1.5 * s), 0], [0, 1], g.height - 1, guess[1]);
  const cal: Calibration = { pxPerMm: s, origin: [x0 - cam.fromSide.mm * s, y0 - cam.fromTop.mm * s] };
  add('Detail C px/mm (calibration: the 12.40 lines, camera to flash)', 'check', r.pxPerMm, s, 0.05);
  add('Detail C datum across (px)', 'check', r.origin[0], cal.origin[0], 1);
  add('Detail C datum down (px)', 'check', r.origin[1], cal.origin[1], 1);
  // The phone's top edge, down a column clear of the corner: 10.24 above the camera's centre line.
  add('Detail C top edge from the camera\'s centre line (dimensioned 10.24)', 'check', cam.fromTop.mm, (y0 - lineNear(g, [Math.round(toPx(cal, [17, 0])[0]), 0], [0, 1], g.height - 1, toPx(cal, [0, 0])[1])) / s, 0.05);

  const centre = toPx(cal, [cam.fromSide.mm, cam.fromTop.mm]);
  const rays = [135, 315].map((a) => {
    const t = (a * Math.PI) / 180;
    return runs(g, [Math.round(centre[0]), Math.round(centre[1])], [Math.cos(t), -Math.sin(t)], Math.round(5.5 * s)).map((q) => ({ at: q.at / s, width: q.width / s }));
  });
  const ring = (mm: number) => rays.map((rs) => rs.reduce((a, b) => (Math.abs(b.at - mm) < Math.abs(a.at - mm) ? b : a)));
  const heavy = ring(turret.top.mm / 2), thin = ring(turret.wallTop.mm / 2), outer = ring(turret.base.mm / 2);
  value('turret outline Ø (the outermost circle)', turret.base, 2 * mean(outer.map((q) => q.at)), 0.05);
  value('turret wall top Ø (the thin circle inside it)', turret.wallTop, 2 * mean(thin.map((q) => q.at)), 0.05, mean(thin.map((q) => q.width)), 2);
  value(`turret top Ø (the heavy ring's middle; drawn ${mean(heavy.map((q) => q.width)).toFixed(2)} wide)`, turret.top, 2 * mean(heavy.map((q) => q.at)), 0.05);
  value('camera window Ø (the heavy ring\'s inner edge)', cam.window, 2 * mean(heavy.map((q) => q.at - q.width / 2)), 0.05);

  const f = chordCentre(g, cal, [flash.fromSide.mm, flash.fromTop.mm], flash.diameter.mm, [0.55, -0.55, 0.75, -0.75], 13);
  value(`flash centre from the side (${f.chords} clean chords a side)`, flash.fromSide, f.centre[0], 0.05);
  value('flash centre from the top', flash.fromTop, f.centre[1], 0.05);
  const m = chordCentre(g, cal, [rearMic.fromSide.mm, rearMic.fromTop.mm], rearMic.diameter.mm, [0.22, -0.22, 0.37, -0.37], 40);
  value(`rear mic centre from the side (${m.chords} chords a side; drawn with a 0.5 pen)`, rearMic.fromSide, m.centre[0], 0.05);
  value('rear mic centre from the top', rearMic.fromTop, m.centre[1], 0.05);
  return out;
}

/**
 * Detail D, a section through the camera and the flash at four times the back view's scale: x along the phone, y out
 * of the back. Calibrated on the Ø4.54 and Ø4.16 extension lines (the cones at the surface) on a row above the phone;
 * the back glass's line down a column clear of the turret. The heights the drawing dimensions (0.87, 2.00, 1.35,
 * 1.44) are checks of which line each is; the turret's wall, read on rows up it, gives where it reaches Ø8.57 (the
 * bump's top, scaled).
 */
export function detailDReadings(pdf = PDF): Measured[] {
  const r = detailD, g = render(pdf, r);
  const { out, add, value } = collector();
  const row = 300;
  const cone = (axis: number, d: number) => [axis - d / 2, axis + d / 2].map((m) => lineNear(g, [0, row], [1, 0], g.width - 1, r.origin[0] + m * r.pxPerMm));
  const [c0, c1] = cone(0, cameras.main.coneAtSurface.mm), [f0, f1] = cone(12.4, flashAtSurface.mm);
  const s = (c1 - c0 + f1 - f0) / (cameras.main.coneAtSurface.mm + flashAtSurface.mm);
  const axisCam = (c0 + c1) / 2, axisFlash = (f0 + f1) / 2;
  const colOut = Math.round(axisCam - 6.3 * s); // beyond the turret, clear of the cone
  const glass = lineNear(g, [colOut, 0], [0, 1], g.height - 1, r.origin[1]);
  add('Detail D px/mm (calibration: the Ø4.54 and Ø4.16 lines)', 'check', r.pxPerMm, s, 0.2);
  add('Detail D Ø4.54 against Ø4.16 (each by the mean scale)', 'check', cameras.main.coneAtSurface.mm - flashAtSurface.mm, (c1 - c0 - (f1 - f0)) / s, 0.03);
  add('Detail D camera axis to flash axis (dimensioned 12.40, in Detail C)', 'check', 12.4, (axisFlash - axisCam) / s, 0.05);
  add('Detail D back glass line (px)', 'check', r.origin[1], glass, 1);
  const height = (x: number, mm: number) => (lineNear(g, [Math.round(x), 0], [0, 1], g.height - 1, glass + mm * s) - glass) / s;
  add('turret height (dimensioned 0.87: its extension line beyond the turret)', 'check', turret.height.mm, height(colOut, 0.87), 0.03);
  add('camera cone apex inside the back glass (dimensioned 2.00 CONE TO BACK GLASS)', 'check', -2.0, height(axisCam - 0.5 * s, -2.0), 0.03);
  add('flash cone apex inside the back glass (dimensioned 1.35)', 'check', -1.35, height(axisFlash + 6.7 * s, -1.35), 0.03);
  add('flash cones\' meeting out from the back glass (dimensioned 1.44)', 'check', 1.44, height(axisFlash + 6.7 * s, 1.44), 0.03);
  // The derived numbers, from the printed ones: each cone's width at its surface.
  const tan = (deg: number) => Math.tan(((deg / 2) * Math.PI) / 180);
  add(`camera cone Ø at the turret's top: 2 x (2.00 + 0.87) x tan(76.7° / 2) (dimensioned ${cameras.main.coneAtSurface.mm})`, 'check', cameras.main.coneAtSurface.mm, 2 * (body.thickness.mm - cameras.main.coneApexFromFront.mm + turret.height.mm) * tan(cameras.main.keepoutCone.mm), 0.01);
  add(`flash cone Ø at the back glass: 2 x 1.35 x tan(114° / 2) (dimensioned ${flashAtSurface.mm})`, 'check', flashAtSurface.mm, 2 * (body.thickness.mm - flashKeepout.apexFromFront.mm) * tan(flashKeepout.inner.mm), 0.01);
  // The turret's wall: its near side on rows 0.2 to 0.62 out (above its foot's rounding, below its top's), fitted as a
  // line; where it reaches Ø8.57.
  const pts = [0.22, 0.29, 0.36, 0.43, 0.5, 0.57, 0.62].map((h) => {
    const y = Math.round(glass + h * s);
    const x = lineNear(g, [0, y], [1, 0], Math.round(axisCam), axisCam - 4.5 * s);
    return [h, (axisCam - x) / s] as const;
  });
  const mh = mean(pts.map((p) => p[0])), mr = mean(pts.map((p) => p[1]));
  const k = pts.reduce((a, p) => a + (p[0] - mh) * (p[1] - mr), 0) / pts.reduce((a, p) => a + (p[0] - mh) ** 2, 0);
  add('turret wall\'s slope (r against height; -1 is 45°)', 'check', -1, k, 0.05);
  value('turret wall reaches Ø8.57 at (the bump\'s top)', turret.wallTopHeight, mh + (turret.wallTop.mm / 2 - mr) / k, 0.05);
  add(`turret wall at the back glass, extended (Detail C's Ø${turret.base.mm}; its foot rounds)`, 'check', turret.base.mm, 2 * (mr - k * mh), 0.35);
  const top = (lineNear(g, [0, Math.round(glass + 0.85 * s)], [1, 0], Math.round(axisCam), axisCam - 3.8 * s));
  add(`turret flat top's edge, 0.85 out (Detail C's heavy ring, Ø${turret.top.mm})`, 'check', turret.top.mm, (2 * (axisCam - top)) / s, 0.15);
  return out;
}

/**
 * The front view on its outer edges (the family's frontCalibration: a row 30 above the bottom, a column 4 left of the
 * middle). Then the glass and the display across that row, the display's top and bottom down a column 16 in, its
 * corners (square: the run on each diagonal is the corner itself), the Home button, and the receiver's slot.
 */
export function frontReadings(pdf = PDF): Measured[] {
  const r = frontView, g = render(pdf, r);
  const { out, add, value } = collector();
  const { cal, sx, sy, row } = frontCalibration(phone, r, pdf, {}, g);
  const W = body.width.mm, L = body.length.mm;
  add('front view px/mm across (calibration)', 'check', r.pxPerMm, sx, 0.05);
  add('front view px/mm down (calibration)', 'check', r.pxPerMm, sy, 0.05);
  add('front view datum across (px)', 'check', r.origin[0], cal.origin[0], 1);
  add('front view datum down (px)', 'check', r.origin[1], cal.origin[1], 1);
  const y = Math.round(toPx(cal, [0, row])[1]);
  const at = (mm: number) => runNear(g, [0, y], [1, 0], g.width - 1, toPx(cal, [mm, 0])[0]);
  const mmX = (px: number) => (px - cal.origin[0]) / cal.pxPerMm, mmY = (px: number) => (px - cal.origin[1]) / cal.pxPerMm;
  const gi = (W - body.glassWidth.mm) / 2, ai = (W - front.activeWidth.mm) / 2;
  const [g0, g1, a0, a1] = [gi, W - gi, ai, W - ai].map(at);
  value('glass width', body.glassWidth, (g1.at - g0.at) / cal.pxPerMm, 0.05, Math.max(g0.width, g1.width) / cal.pxPerMm, 2);
  value('active area width', front.activeWidth, (a1.at - a0.at) / cal.pxPerMm, 0.05, Math.max(a0.width, a1.width) / cal.pxPerMm, 2);
  value('active area from the side', activeFromSide, mmX(a0.at), 0.05);
  const colX = Math.round(toPx(cal, [16, 0])[0]);
  const [t, b] = [front.activeFromEdge.mm, front.activeFromEdge.mm + front.activeLength.mm].map((m) => runNear(g, [colX, 0], [0, 1], g.height - 1, toPx(cal, [0, m])[1]));
  value('active area from the top', front.activeFromEdge, mmY(t.at), 0.05);
  value('active area length', front.activeLength, (b.at - t.at) / cal.pxPerMm, 0.05, Math.max(t.width, b.width) / cal.pxPerMm, 2);
  const [gt, gb] = [(L - body.glassLength.mm) / 2, (L + body.glassLength.mm) / 2].map((m) => runNear(g, [colX, 0], [0, 1], g.height - 1, toPx(cal, [0, m])[1]));
  value('glass length', body.glassLength, (gb.at - gt.at) / cal.pxPerMm, 0.05, Math.max(gt.width, gb.width) / cal.pxPerMm, 2);
  // Square corners: from 1 mm outside each corner along its diagonal inward, the first line is the corner's crossing.
  const K = 1 - Math.SQRT1_2;
  const top = front.activeFromEdge.mm, foot = top + front.activeLength.mm;
  const corners: [number, number, number, number][] = [[ai, top, 1, 1], [W - ai, top, -1, 1], [W - ai, foot, -1, -1], [ai, foot, 1, -1]];
  const radii = corners.map(([cx, cy, dx, dy]) => {
    const p = toPx(cal, [cx - dx, cy - dy]);
    const rs = runs(g, [Math.round(p[0]), Math.round(p[1])], [dx, dy], Math.round(2 * cal.pxPerMm));
    return (rs[0].at / cal.pxPerMm - 1) / K;
  });
  value(`active area corner radius (corners ${radii.map((x) => x.toFixed(2)).join(', ')})`, front.activeRadius, mean(radii), 0.1);
  const home = circleAt(g, toPx(cal, [W / 2, L - notBuilt.homeFromBottom.mm]), (notBuilt.homeButton.mm / 2) * cal.pxPerMm, 60);
  value('Home button centre from the bottom (not built)', notBuilt.homeFromBottom, L - mmY(home.centre[1]), 0.05);
  add('Home button centre across (dimensioned 33.63)', 'check', 33.63, mmX(home.centre[0]), 0.05);
  value('Home button Ø (not built)', notBuilt.homeButton, home.diameter / cal.pxPerMm, 0.05, home.stroke / cal.pxPerMm, 2);
  // The receiver's slot: its ends on the row through its middle, its top and bottom down a column 3 left of its middle.
  const ry = Math.round(toPx(cal, [0, front.receiverFromTop.mm])[1]);
  const ends = [W / 2 - front.receiverLength.mm / 2, W / 2 + front.receiverLength.mm / 2].map((m) => runNear(g, [0, ry], [1, 0], g.width - 1, toPx(cal, [m, 0])[0]));
  value('receiver slot length (its ends\' strokes, middle to middle)', front.receiverLength, (ends[1].at - ends[0].at) / cal.pxPerMm, 0.05, Math.max(ends[0].width, ends[1].width) / cal.pxPerMm, 2);
  const rc = Math.round(toPx(cal, [W / 2 - 3, 0])[0]);
  const edges = [front.receiverFromTop.mm - front.receiverHeight.mm / 2, front.receiverFromTop.mm + front.receiverHeight.mm / 2].map((m) => runNear(g, [rc, 0], [0, 1], g.height - 1, toPx(cal, [0, m])[1]));
  value('receiver slot height', front.receiverHeight, (edges[1].at - edges[0].at) / cal.pxPerMm, 0.05, Math.max(edges[0].width, edges[1].width) / cal.pxPerMm, 2);
  value('receiver slot middle from the top', front.receiverFromTop, mmY((edges[0].at + edges[1].at) / 2), 0.05);
  return out;
}

/**
 * Detail E at five times the front view's scale: the faces (7.31) give the scale down and the mid-plane; the insets'
 * extension lines below the phone (0.00, 0.41, 1.02, 2.46, 4.50) the scale across and the outermost side. Then the two
 * readings behind the points drawing.ts adds: the curve's inset 0.40 from the mid-plane, and its height 3.60 in.
 */
export function detailEReadings(pdf = PDF): Measured[] {
  const r = detailE, g = render(pdf, r);
  const { out, add, value } = collector();
  const col = Math.round(toPx(r, [6, 0])[0]);
  const [topFace, backFace] = [3.655, -3.655].map((h) => lineNear(g, [col, 0], [0, 1], g.height - 1, r.origin[1] - h * r.pxPerMm));
  const sy = (backFace - topFace) / body.thickness.mm, mid = (topFace + backFace) / 2;
  const insets = [0, 0.41, 1.02, 2.46, 4.5];
  const below = Math.round(mid + 4.8 * sy);
  const xs = insets.map((m) => lineNear(g, [0, below], [1, 0], g.width - 1, r.origin[0] + m * r.pxPerMm));
  const sx = (xs.at(-1)! - xs[0]) / 4.5;
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [xs[0], mid] };
  add('Detail E px/mm down (calibration: the faces, 7.31)', 'check', r.pxPerMm, sy, 0.3);
  add('Detail E px/mm across (calibration: the 0.00 and 4.50 lines)', 'check', r.pxPerMm, sx, 0.3);
  add('Detail E datum across (px)', 'check', r.origin[0], cal.origin[0], 1);
  add('Detail E mid-plane (px)', 'check', r.origin[1], cal.origin[1], 1);
  [0.41, 1.02, 2.46].forEach((m, i) => add(`Detail E ${m.toFixed(2)} line (dimensioned)`, 'check', m, (xs[i + 1] - cal.origin[0]) / cal.pxPerMm, 0.02));
  // The curve's inset at 0.40 up: the run on that row nearest the outermost side (left of the labels' leaders).
  const yb = Math.round(mid - 0.4 * cal.pxPerMm);
  value('the side\'s curve, inset at 0.40 from the mid-plane (the added flat band\'s end)', edgeReadings.flatBand, (lineNear(g, [0, yb], [1, 0], g.width - 1, cal.origin[0] + 0.03 * cal.pxPerMm) - cal.origin[0]) / cal.pxPerMm, 0.01);
  // Its height 3.60 in: the topmost line below the face's own line there (the 3.655 extension line runs on it).
  const x = Math.round(cal.origin[0] + 3.6 * cal.pxPerMm);
  const rs = runs(g, [x, Math.round(mid - 3.8 * cal.pxPerMm)], [0, 1], Math.round(0.5 * cal.pxPerMm));
  const curve = rs.reduce((a, b) => (Math.abs(b.at - 0.155 * cal.pxPerMm) < Math.abs(a.at - 0.155 * cal.pxPerMm) ? b : a));
  value('the side\'s curve, its height 3.60 in (the added face point)', edgeReadings.faceStart, 3.8 - curve.at / cal.pxPerMm, 0.01);
  add('the added face point, from the face (the builder lifts a point within 0.1)', 'check', 0, body.thickness.mm / 2 - phone.body.edge.points[4][1], 0.1);
  return out;
}

/**
 * The bottom view on its extension lines (the family's bottomCalibration: 0.00 to 57.01, on a row above the phone; the
 * front and back outlines for the mid-plane). Then every hole's centre from chords 0.4 either side of the centre
 * line, the screws' likewise, and the port's centre.
 */
export function bottomReadings(pdf = PDF): Measured[] {
  const c = bottomView, g = render(pdf, c);
  const { out, add } = collector();
  const T = body.thickness.mm;
  const { cal, px, left, frontLine, backLine } = bottomCalibration(phone, c, pdf, { bottomExtension: 57.01 }, g);
  add('bottom view px/mm across (calibration: the 0.00 and 57.01 lines)', 'check', c.pxPerMm, px, 0.05);
  add('bottom view datum across: the volume-button edge (px)', 'check', c.origin[0], left, 1);
  add('bottom view datum down: mid-thickness (px)', 'check', c.origin[1], (frontLine + backLine) / 2, 1);
  add(`bottom view thickness as drawn (dimensioned ${T})`, 'check', T, (backLine - frontLine) / px, 0.05);
  const line = (mm: number) => (lineNear(g, [0, Math.round(toPx(cal, [0, -(T / 2 + 1.5)])[1])], [1, 0], g.width - 1, toPx(cal, [mm, 0])[0]) - cal.origin[0]) / px;
  for (const m of [10.26, 22.26, 22.98, 27.24, 29.28, 37.98, 40.03, 44.29, 45.01]) add(`bottom view ${m.toFixed(2)} line (dimensioned)`, 'check', m, line(m), 0.03);
  // Chords on rows 0.4 either side of the centre line, the runs nearest a recorded hole's ends.
  // Chords on rows 0.1 and 0.2 either side of the centre line, the runs nearest a recorded hole's ends, kept where
  // both ends are thin. A line of the drawing runs along the second hole's right stroke, the fourth's left one (Detail
  // E's callout circle) and the eleventh's left one (their runs half as wide again): those three, inferred between
  // dimensioned ones, are left out. The screws are drawn filled: a chord is one run, its middle the centre, kept where
  // no leader splits it (its run at least 40 px).
  const rowRuns = (o: number) => runs(g, [0, Math.round(toPx(cal, [0, o])[1])], [1, 0], g.width - 1);
  const nearest = (rs: ReturnType<typeof runs>, mm: number) => rs.reduce((a, b) => (Math.abs(b.at - toPx(cal, [mm, 0])[0]) < Math.abs(a.at - toPx(cal, [mm, 0])[0]) ? b : a));
  const offsets = [-0.2, -0.1, 0.1, 0.2];
  const holeMid = (mm: number, d: number) => {
    const ms = offsets.flatMap((o) => {
      const half = Math.sqrt((d / 2) ** 2 - o * o), rs = rowRuns(o);
      const [a, b] = [nearest(rs, mm - half), nearest(rs, mm + half)];
      return a.width <= 16 && b.width <= 16 ? [(a.at + b.at) / 2] : [];
    });
    return { mm: (mean(ms) - cal.origin[0]) / px, n: ms.length };
  };
  const crossed = [1, 3, 10];
  bottom.holes.forEach((h, i) => {
    if (crossed.includes(i)) return;
    const m = holeMid(h.mm, bottom.holeDiameter.mm);
    add(`bottom hole ${i + 1}'s centre (${h.kind} ${h.mm}; ${m.n} clean chords)`, 'check', h.mm, m.mm, 0.05);
  });
  bottom.screws.forEach((sc, i) => {
    const ms = offsets.map((o) => nearest(rowRuns(o), sc.mm)).filter((q) => q.width >= 40);
    add(`bottom screw ${i + 1}'s centre (dimensioned ${sc.mm}; ${ms.length} chords of its filled disc)`, 'check', sc.mm, (mean(ms.map((q) => q.at)) - cal.origin[0]) / px, 0.05);
  });
  add('pitch: the inner bottom mic less the outer hole, over five (the family\'s 2.255)', 'check', 2.255, (bottom.holes[5].mm - bottom.holes[0].mm) / 5, 0.001);
  return out;
}

export const remeasure = (pdf = PDF): Measured[] => [...backReadings(pdf), ...detailCReadings(pdf), ...detailDReadings(pdf), ...frontReadings(pdf), ...detailEReadings(pdf), ...bottomReadings(pdf)];

export const hasPdf = () => existsSync(PDF);

if (import.meta.main) console.log(report(remeasure()));
