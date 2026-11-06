// Re-measures every scaled value in drawing.ts from the PDF, and checks each view's calibration on dimensioned features
// it didn't use.
//
// The family's re-measurement (iphone/measure.ts) calibrates the back view on the two camera centres furthest apart in
// each axis. The 17e has one camera, and the only other circles in Detail D (the rear mic and the flash) sit on its
// line (3X -13.32): no pair spans the view down. So this file measures Detail D itself, calibrated on its extension
// lines, and runs the family's front and bottom views without a back view; the receiver and the end holes are read
// in their frames (frontCalibration, bottomCalibration).
//
//   node iphone-17e/measure.ts   → a table: recorded, measured, the difference
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { bottomCalibration, frontCalibration, remeasure as family, report, type Measured } from '../../measure.ts';
import { iphone } from '../../part.ts';
import type { Value } from '../../../src/provenance.ts';
import { circleAt, cleanCircleAt, lineNear, render, runNear, runs, toPx, type Calibration } from '../../../src/raster.ts';
import { bottomView, bump, cameraZone, cameras, compass, cornerMiddle, detailD, flash, flashKeepout, flashKeepoutTransition, frontView, magsafe, magsafeView, magsafeZone, phone, rearMic, receiverView, sectionLL, sectionNN, sideView, wideStage } from './drawing.ts';

export const PDF = join(import.meta.dirname, '..', '..', 'drawings', 'iphone-17e.pdf');

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

/**
 * Detail D, calibrated on its extension lines: across, the 0.00, 13.32, 24.30 and 29.68 lines on a row 2 above the
 * phone (fitted: scale from the outer two, datum their mean); down, the 0.00 line and the -13.32 line on a column 2 left
 * of it. Then the camera's centre and its five circles (Ø14.97 dimensioned; 13.54, 12.94, 11.89 scaled; the 12.33
 * between isn't used), the flash's and the rear mic's centres and diameters.
 */
export function detailDReadings(pdf = PDF): Measured[] {
  const r = detailD, g = render(pdf, r);
  const { out, add, value } = collector();
  const marks = [0, 13.32, 24.3, 29.68];
  const row = Math.round(toPx(r, [0, -2])[1]), col = Math.round(toPx(r, [-2, 0])[0]);
  const xs = marks.map((m) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(r, [m, 0])[0]));
  const ys = [0, 13.32].map((m) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(r, [0, m])[1]));
  const sx = (xs[3] - xs[0]) / 29.68, sy = (ys[1] - ys[0]) / 13.32;
  const mean = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length;
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [mean(xs.map((x, i) => x - marks[i] * sx)), ys[0]] };
  add('Detail D px/mm across (calibration: the 0.00 and 29.68 lines)', 'check', r.pxPerMm, sx, 0.05);
  add('Detail D px/mm down (calibration: the 0.00 and 13.32 lines)', 'check', r.pxPerMm, sy, 0.05);
  add('Detail D datum across (px)', 'check', r.origin[0], cal.origin[0], 1);
  add('Detail D datum down (px)', 'check', r.origin[1], cal.origin[1], 1);
  [13.32, 24.3].forEach((m, i) => add(`Detail D ${m.toFixed(2)} line across (dimensioned)`, 'check', m, (xs[i + 1] - cal.origin[0]) / cal.pxPerMm, 0.02));

  const mm = (px: [number, number]) => [(px[0] - cal.origin[0]) / cal.pxPerMm, (px[1] - cal.origin[1]) / cal.pxPerMm];
  const cam = cameras.main;
  const at = toPx(cal, [cam.fromSide.mm, cam.fromTop.mm]);
  const outer = circleAt(g, at, (wideStage.diameter.mm / 2) * cal.pxPerMm);
  const [cs, ct] = mm(outer.centre);
  value('camera centre from the side', cam.fromSide, cs, 0.05);
  value('camera centre from the top', cam.fromTop, ct, 0.05);
  value('camera outline Ø (the wide stage, the bump\'s outline)', wideStage.diameter, outer.diameter / cal.pxPerMm, 0.05, outer.stroke / cal.pxPerMm, 2);
  for (const [what, v] of [['wide stage top Ø (the bump\'s top)', wideStage.top], ['camera ring Ø (the narrow stage)', cam.ring], ['camera window Ø', cam.window]] as const) {
    const c = circleAt(g, outer.centre, (v.mm / 2) * cal.pxPerMm);
    value(what, v, c.diameter / cal.pxPerMm, 0.05, c.stroke / cal.pxPerMm, 2);
  }
  // The builder's derived bump numbers, from the circles.
  add(`bump outline from the side and top (derived ${bump.baseFrom.mm}: the camera's centre less half its Ø14.97)`, 'check', bump.baseFrom.mm, cs - outer.diameter / cal.pxPerMm / 2, 0.05);

  for (const [what, d] of [['flash', flash], ['rear mic', rearMic]] as const) {
    const f = cleanCircleAt(g, toPx(cal, [d.fromSide.mm, d.fromTop.mm]), (d.diameter.mm / 2) * cal.pxPerMm, [15, -15, 25, -25]);
    const [fs, ft] = mm(f.centre);
    value(`${what} centre from the side`, d.fromSide, fs, 0.05);
    value(`${what} centre from the top`, d.fromTop, ft, 0.05);
    value(`${what} Ø`, d.diameter, f.diameter / cal.pxPerMm, 0.05, f.stroke / cal.pxPerMm, 2);
  }
  return out;
}

/**
 * The right side view at 2400 dpi: the front on the left, the back (and the camera) on the right. Calibrated across on
 * the 7.80's extension lines below the phone; its datum the back glass's 1.68 extension line above it. Then, on a row
 * through the camera: the wide stage's flat top (the bump's top, scaled) and the narrow stage's (the 1.68); down
 * columns, the wide stage's extent (Ø14.97) and the narrow stage's, just above the wide stage's top (Ø12.94).
 */
export function sideReadings(pdf = PDF): Measured[] {
  const r = sideView, g = render(pdf, r);
  const { out, add, value } = collector();
  const below = 11650, above = 1000, through = 2300; // rows: under the phone, over it, through the camera
  const [f0, b0] = [-7.8, 0].map((x) => lineNear(g, [0, below], [1, 0], g.width - 1, toPx(r, [x, 0])[0]));
  const s = (b0 - f0) / 7.8;
  const back = lineNear(g, [0, above], [1, 0], g.width - 1, r.origin[0]);
  const lens = lineNear(g, [0, above], [1, 0], g.width - 1, r.origin[0] + 1.68 * s);
  add('side view px/mm (calibration: the 7.80 lines)', 'check', r.pxPerMm, s, 0.05);
  add('side view back glass: the 1.68\'s line over the 7.80\'s under the phone (px)', 'check', back, b0, 1);
  add('back glass to camera glass (dimensioned 1.68: its two extension lines)', 'check', bump.rings.mm, (lens - back) / s, 0.03);
  const camRow = runs(g, [0, through], [1, 0], g.width - 1);
  const near = (mm: number) => camRow.reduce((p, q) => (Math.abs(q.at - (back + mm * s)) < Math.abs(p.at - (back + mm * s)) ? q : p));
  value('wide stage\'s flat top from the back glass (the bump\'s top)', bump.top, (near(bump.top.mm).at - back) / s, 0.05);
  add('narrow stage\'s top from the back glass, on the camera (dimensioned 1.68)', 'check', bump.rings.mm, (near(bump.rings.mm).at - back) / s, 0.03);
  const extent = (x: number) => {
    const rs = runs(g, [Math.round(x), 0], [0, 1], 4000);
    return (rs.at(-1)!.at - rs.find((q) => q.at > 1500)!.at) / s;
  };
  value('wide stage across the side view (Detail D\'s Ø14.97)', wideStage.diameter, extent(back + 0.4 * s), 0.05);
  const wideTop = near(bump.top.mm);
  // Just above the wide stage's top stroke: the narrow stage's corners round over its 0.28 height (12.85 half way up),
  // so it reads a little under the plan's circle even here; within 0.08.
  add(`narrow stage across the side view, at its base (Detail D's Ø${cameras.main.ring.mm}, scaled; its corners round)`, 'check', cameras.main.ring.mm, extent(wideTop.at + wideTop.width / 2 + 2), 0.08);
  return out;
}

/**
 * Section L-L (sheet 2): the keepout cone, drawn as a frustum on the lens cover. Calibrated on the phone's faces
 * (7.80) on a row below the camera; the cone's two sides found down columns 0.6 to 4.6 mm beyond the lens cover and
 * fitted as lines. Their angle checks the 82°, their meeting the derived apex (6.08 from the front), their width at the
 * lens cover's line the Ø5.91, and that line's distance from the back the 1.68.
 */
export function sectionReadings(pdf = PDF): Measured[] {
  const r = sectionLL, g = render(pdf, r);
  const { out, add } = collector();
  const row = 2400;
  const [front, back] = [r.origin[0] - 7.8 * r.pxPerMm, r.origin[0]].map((x) => lineNear(g, [0, row], [1, 0], g.width - 1, x));
  const s = (back - front) / 7.8;
  add('section L-L px/mm (calibration: the faces, 7.80)', 'check', r.pxPerMm, s, 0.1);
  const cover = lineNear(g, [0, 1107], [1, 0], g.width - 1, back + 1.68 * s);
  add('section L-L lens cover from the back face (dimensioned 1.68)', 'check', 1.68, (cover - back) / s, 0.05);
  // The cone's axis: the lens cover's row through its centre; the sides nearest where the recorded cone puts them.
  const cam = cameras.main;
  const apex = front + cam.coneApexFromFront.mm * s;
  const t = Math.tan(((cam.keepoutCone.mm / 2) * Math.PI) / 180);
  const axis = 1110;
  const pts = Array.from({ length: 9 }, (_, i) => cover + (0.6 + 0.5 * i) * s).map((x) => {
    const half = (x - apex) * t;
    const [a, b] = [axis - half, axis + half].map((y) => lineNear(g, [Math.round(x), 0], [0, 1], g.height - 1, y));
    return [x, (b - a) / 2] as const;
  });
  // Half-width against depth: a line; its slope the half-angle's tangent, its root the apex.
  const n = pts.length, mx = pts.reduce((p, q) => p + q[0], 0) / n, my = pts.reduce((p, q) => p + q[1], 0) / n;
  const k = pts.reduce((p, q) => p + (q[0] - mx) * (q[1] - my), 0) / pts.reduce((p, q) => p + (q[0] - mx) ** 2, 0);
  const root = mx - my / k;
  add('section L-L cone angle (dimensioned 82°)', 'check', cam.keepoutCone.mm, (2 * Math.atan(k) * 180) / Math.PI, 0.5);
  add(`section L-L cone apex from the front (derived ${cam.coneApexFromFront.mm}: the sides' meeting)`, 'check', cam.coneApexFromFront.mm, (root - front) / s, 0.05);
  add(`section L-L cone base Ø on the lens cover (dimensioned ${cam.coneBase.mm})`, 'check', cam.coneBase.mm, (2 * k * (cover - root)) / s, 0.05);
  return out;
}

/**
 * A cone's two sides about a horizontal axis, found down columns `xs` (px) nearest where `half(x)` puts them, fitted as
 * a line of half-width against x: its slope the half-angle's tangent, its root (half-width 0) the apex. `minWidth` (px)
 * keeps only runs at least that long down the column: a steep side crosses a column in a long run, a hatch line in a
 * short one, so in a hatched region the side is found wherever the guess puts it. (The 16e's.)
 */
function fitSides(g: ReturnType<typeof render>, axis: number, xs: number[], half: (x: number) => number, minWidth = 0) {
  const pts = xs.map((x) => {
    const rs = runs(g, [Math.round(x), 0], [0, 1], g.height - 1).filter((q) => q.width >= minWidth);
    const [a, b] = [axis - half(x), axis + half(x)].map((y) => rs.reduce((p, q) => (Math.abs(q.at - y) < Math.abs(p.at - y) ? q : p)).at);
    return [x, (b - a) / 2] as const;
  });
  const n = pts.length, mx = pts.reduce((p, q) => p + q[0], 0) / n, my = pts.reduce((p, q) => p + q[1], 0) / n;
  const k = pts.reduce((p, q) => p + (q[0] - mx) * (q[1] - my), 0) / pts.reduce((p, q) => p + (q[0] - mx) ** 2, 0);
  return { k, root: mx - my / k, at: (x: number) => my + k * (x - mx), degrees: (2 * Math.atan(k) * 180) / Math.PI };
}

/**
 * Section N-N (sheet 2): the flash's keepout beyond the back glass, read as the 16e's. Calibrated on the phone's faces
 * (7.80) on a row below the keepout; the axis the flash's centre line. The 0.82's two extension lines above the phone
 * (the back glass's face and the kinks'). The outer cone's sides down columns 1.0 to 3.4 mm out, fitted: their angle
 * (155°), their meeting (the derived outer apex, on the glass's face) and their width 0.82 out (7.37). The inner cone's
 * own sides, between the glass and the kinks (0.15 to 0.70 mm out): their width on the glass's face (6.00) and on the
 * kinks' line (7.37), and their angle, loosely (a 0.55 mm run). The 80° dimension's extension lines continue the inner
 * cone's sides (4.0 to 8.7 mm out): their angle and their meeting (the derived inner apex). The negative control: 0.82
 * read "to cover glass" (from the front, as the 12 Pro's and 16's numbers are) puts the transition 7 mm off the kinks.
 */
export function flashSectionReadings(pdf = PDF): Measured[] {
  const r = sectionNN, g = render(pdf, r);
  const { out, add } = collector();
  const [front, back] = [r.origin[0] - 7.8 * r.pxPerMm, r.origin[0]].map((x) => lineNear(g, [0, 2300], [1, 0], g.width - 1, x));
  const s = (back - front) / 7.8;
  add('section N-N px/mm (calibration: the faces, 7.80)', 'check', r.pxPerMm, s, 0.1);
  const axis = lineNear(g, [1100, 0], [0, 1], g.height - 1, r.origin[1]);
  add('section N-N axis: the flash\'s centre line (px)', 'check', r.origin[1], axis, 1);
  const k = flashKeepout, tr = flashKeepoutTransition;
  // Along the row from x = 600 (left of the phone's top end): runs count from there.
  const [glass, kinks] = [back, back + tr.fromBack.mm * s].map((x) => 600 + lineNear(g, [600, 500], [1, 0], 600, x - 600));
  add(`section N-N transition from the back glass (dimensioned ${tr.fromBack.mm}: its two extension lines)`, 'check', tr.fromBack.mm, (kinks - glass) / s, 0.03);
  const xAt = (fromFront: number) => front + fromFront * s;
  const tan = (deg: number) => Math.tan((deg / 2) * (Math.PI / 180));
  const span = (a: number, b: number, n: number) => Array.from({ length: n }, (_, i) => back + (a + ((b - a) * i) / (n - 1)) * s);
  // The outer sides, 12.5° off a column, cross it in runs of about 28 px; the wedge's hatch lines in about 8.
  const outer = fitSides(g, axis, span(1.0, 3.4, 9), (x) => (x - xAt(k.outerApexFromFront!.mm)) * tan(k.outer!.mm), 18);
  add('section N-N outer cone angle (dimensioned 155°)', 'check', k.outer!.mm, outer.degrees, 0.5);
  add(`section N-N outer cone apex from the front (derived ${k.outerApexFromFront!.mm}: the sides' meeting)`, 'check', k.outerApexFromFront!.mm, (outer.root - front) / s, 0.05);
  // At 0.82 from the glass, not on the drawn kinks' line: the outer sides are steep (77.5° from the axis), so 0.005
  // along the axis moves their width 0.045.
  add(`section N-N outer cone Ø 0.82 from the back glass (dimensioned ${tr.diameter.mm}; its sides are steep)`, 'check', tr.diameter.mm, (2 * outer.at(glass + tr.fromBack.mm * s)) / s, 0.05);
  const inner = fitSides(g, axis, span(0.15, 0.7, 12), (x) => (x - xAt(k.apexFromFront!.mm)) * tan(k.inner.mm));
  add(`section N-N inner cone Ø on the back glass's face (dimensioned ${k.innerBaseDiameter!.mm})`, 'check', k.innerBaseDiameter!.mm, (2 * inner.at(glass)) / s, 0.05);
  add(`section N-N inner cone Ø on the kinks' line (dimensioned ${tr.diameter.mm})`, 'check', tr.diameter.mm, (2 * inner.at(kinks)) / s, 0.05);
  add('section N-N inner cone angle, its own sides over 0.55 (dimensioned 80°)', 'check', k.inner.mm, inner.degrees, 2);
  const witness = fitSides(g, axis, span(4.0, 8.7, 9), (x) => (x - xAt(k.apexFromFront!.mm)) * tan(k.inner.mm));
  add('section N-N inner cone angle, the 80°\'s extension lines (dimensioned 80°)', 'check', k.inner.mm, witness.degrees, 0.5);
  add(`section N-N inner cone apex from the front (derived ${k.apexFromFront!.mm}: the extension lines' meeting)`, 'check', k.apexFromFront!.mm, (witness.root - front) / s, 0.05);
  add(`section N-N transition from the front (derived ${k.transitionFromFront!.mm}: the kinks' line)`, 'check', k.transitionFromFront!.mm, (kinks - front) / s, 0.05);
  add('negative control: 0.82 read from the front (1 = the drawn kinks are over 5 mm from it)', 'check', 1, Math.abs((kinks - front) / s - tr.fromBack.mm) > 5 ? 1 : 0, 0);
  return out;
}

/** A circle through points, least squares (Kåsa), and the worst point's distance off it (the 14's). */
function fitCircle(P: [number, number][]): { centre: [number, number]; radius: number; worst: number } {
  let [sx, sy, sxx, syy, sxy, sxz, syz] = [0, 0, 0, 0, 0, 0, 0];
  for (const [x, y] of P) {
    const z = x * x + y * y;
    sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y; sxz += x * z; syz += y * z;
  }
  const n = P.length;
  const M = [[sxx, sxy, sx, sxz], [sxy, syy, sy, syz], [sx, sy, n, P.reduce((p, [x, y]) => p + x * x + y * y, 0)]];
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      const f = M[j][i] / M[i][i];
      for (let k = i; k < 4; k++) M[j][k] -= f * M[i][k];
    }
  }
  const s = [0, 0, 0];
  for (let i = 2; i >= 0; i--) s[i] = (M[i][3] - M[i].slice(i + 1, 3).reduce((p, q, k) => p + q * s[i + 1 + k], 0)) / M[i][i];
  const centre: [number, number] = [s[0] / 2, s[1] / 2];
  const radius = Math.sqrt(s[2] + centre[0] ** 2 + centre[1] ** 2);
  return { centre, radius, worst: Math.max(...P.map(([x, y]) => Math.abs(Math.hypot(x - centre[0], y - centre[1]) - radius))) };
}

/**
 * Sheet 2's MagSafe view: calibrated on its 0.00 and 60.51 lines across (on a row above the phone) and its 0.00 and
 * -73.35 lines down (on a column left of it); then the product's width, the camera corner's 36.03 line, the clear
 * Ø57.50 circle and the compass's Ø8.00 (their centres), and the magnetic zone's arc. The arc is crossed down columns:
 * its top on the right (50 to 68 across, clear of Detail F's dash-dot circle, which reaches 47, and of the compass's
 * 60.51 line), the outermost dark run above where the R49.39 circle about the product centre puts it; its bottom (clear
 * of the centre line, the R49.39 leader at about 13 across and the [5] [7] note's at about 59), the outermost below.
 * Hatch lines inside the zone merge with the arc where they meet it: a crossing wider than 1.5 strokes is left out.
 * One circle is fitted through both arcs: its centre and radius. The negative controls: the 16's shape (a straight
 * full-width top) would put the top at 50 and 68 across on one line; the 14's arc centre (3.10 below the product centre)
 * would put the lowest point 3.10 lower.
 */
export function magsafeReadings(pdf = PDF): Measured[] {
  const r = magsafeView, g = render(pdf, r);
  const { out, add, value } = collector();
  const xs = [0, compass.fromSide.mm].map((m) => lineNear(g, [0, 420], [1, 0], g.width - 1, r.origin[0] + m * r.pxPerMm));
  const ys = [0, magsafe.fromTop.mm].map((m) => lineNear(g, [150, 0], [0, 1], g.height - 1, r.origin[1] + m * r.pxPerMm));
  const sx = (xs[1] - xs[0]) / compass.fromSide.mm, sy = (ys[1] - ys[0]) / magsafe.fromTop.mm;
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [xs[0], ys[0]] };
  add('MagSafe view px/mm across (calibration: the 0.00 and 60.51 lines)', 'check', r.pxPerMm, sx, 0.05);
  add('MagSafe view px/mm down (calibration: the 0.00 and -73.35 lines)', 'check', r.pxPerMm, sy, 0.05);
  add('MagSafe view datum across (px)', 'check', r.origin[0], cal.origin[0], 1);
  add('MagSafe view datum down (px)', 'check', r.origin[1], cal.origin[1], 1);
  const X = (px: number) => (px - cal.origin[0]) / cal.pxPerMm, Y = (px: number) => (px - cal.origin[1]) / cal.pxPerMm;
  const W = phone.body.width.mm;
  const row = Math.round(toPx(cal, [0, 95])[1]);
  add(`MagSafe view product width, 95 down (dimensioned ${W}: the outline's sides)`, 'check', W, X(lineNear(g, [0, row], [1, 0], g.width - 1, toPx(cal, [W, 0])[0])) - X(lineNear(g, [0, row], [1, 0], g.width - 1, cal.origin[0])), 0.1);
  add(`MagSafe view camera corner's edge across (dimensioned ${cameraZone.across.mm})`, 'check', cameraZone.across.mm, X(lineNear(g, [0, 420], [1, 0], g.width - 1, toPx(cal, [cameraZone.across.mm, 0])[0])), 0.05);
  const mm = (px: [number, number]) => [X(px[0]), Y(px[1])];
  {
    const d = compass;
    const c = cleanCircleAt(g, toPx(cal, [d.fromSide.mm, d.fromTop.mm]), (d.diameter.mm / 2) * cal.pxPerMm, [12, -12, 30, -30]);
    const [cs, ct] = mm(c.centre);
    value('compass circle centre from the side', d.fromSide, cs, 0.1);
    value('compass circle centre from the top', d.fromTop, ct, 0.1);
    value('compass circle Ø', d.diameter, c.diameter / cal.pxPerMm, 0.1, c.stroke / cal.pxPerMm, 2);
  }
  // The clear circle, as the 14's: hatch lines on both sides of it meet it, so four chords can land on a merged run.
  // Crossings within 0.25 of R28.75 on rays every 5° from the product centre, clear of the centre lines (within 6° of
  // each axis) and the Ø57.50 leader (its arrow at about 30°, down positive), keeping rays with one thin crossing
  // only; fitted.
  const C: [number, number] = [magsafe.fromSide.mm, magsafe.fromTop.mm], Rc = magsafe.diameter.mm / 2;
  const P: [number, number][] = [];
  const widths: number[] = [];
  for (let a = 0; a < 360; a += 5) {
    if ([0, 90, 180, 270, 360].some((b) => Math.abs(a - b) < 6) || Math.abs(a - 30) < 9) continue;
    const t = (a * Math.PI) / 180, dir: [number, number] = [Math.cos(t), Math.sin(t)];
    const o = toPx(cal, C), start = (Rc - 1.5) * cal.pxPerMm;
    const rs = runs(g, [o[0] + dir[0] * start, o[1] + dir[1] * start], dir, Math.round(3 * cal.pxPerMm)).map((q) => ({ r: Rc - 1.5 + q.at / cal.pxPerMm, w: q.width })).filter((q) => Math.abs(q.r - Rc) < 0.25);
    if (rs.length === 1 && rs[0].w <= 9) { P.push([C[0] + dir[0] * rs[0].r, C[1] + dir[1] * rs[0].r]); widths.push(rs[0].w); }
  }
  const fc = fitCircle(P);
  const pen = widths.reduce((p, q) => p + q, 0) / widths.length / cal.pxPerMm;
  value(`MagSafe clear circle centre from the side (fitted to ${P.length} crossings; worst ${fc.worst.toFixed(3)} off)`, magsafe.fromSide, fc.centre[0], 0.05);
  value('MagSafe clear circle centre from the top', magsafe.fromTop, fc.centre[1], 0.05);
  value('MagSafe clear circle Ø', magsafe.diameter, 2 * fc.radius, 0.05, pen, 2);

  // The zone's arc: down each column, the dark runs within 2 mm of where the circle puts it; the outermost (above it on
  // the top, below it on the bottom), if no wider than 1.3 times the arc's stroke (read 4 right of the cap's peak, where
  // it runs flat) widened by its slope: the hatch lines are drawn as heavy as the arc, and one meeting it doubles it.
  const R = magsafeZone.radius.mm, [cx, cy] = [magsafe.fromSide.mm, magsafe.fromTop.mm];
  const column = (x: number, top: boolean) => {
    const at = cy + (top ? -1 : 1) * Math.sqrt(R * R - (x - cx) ** 2);
    const col = Math.round(toPx(cal, [x, 0])[0]), y0 = Math.round(toPx(cal, [0, at - 2])[1]);
    const rs = runs(g, [col, y0], [0, 1], Math.round(4 * cal.pxPerMm));
    return { y0, q: rs.length ? (top ? rs[0] : rs.at(-1)!) : undefined };
  };
  const stroke = column(cx + 4, true).q!.width;
  const crossing = (x: number, top: boolean): [number, number] | undefined => {
    const { y0, q } = column(x, top);
    const slope = Math.abs(x - cx) / Math.sqrt(R * R - (x - cx) ** 2);
    return !q || q.width > 1.3 * stroke * Math.hypot(1, slope) ? undefined : [x, Y(y0 + q.at)];
  };
  const topXs = [40, 42, 44, 50, 52, 54, 56, 58, 63, 65, 67, 68, 69];
  const bottomXs = [3, 5, 7, 9, 17, 19, 22, 25, 28, 31, 40, 43, 46, 49, 52, 55, 63, 65, 67, 69];
  const topP = topXs.map((x) => crossing(x, true)).filter((p) => p !== undefined);
  const bottomP = bottomXs.map((x) => crossing(x, false)).filter((p) => p !== undefined);
  const f = fitCircle([...topP, ...bottomP]);
  const n = `${topP.length} on the top, ${bottomP.length} on the bottom; worst ${f.worst.toFixed(3)} off`;
  add(`magnetic zone's circle: centre across (fitted to ${n}; the product centre)`, 'check', cx, f.centre[0], 0.05);
  add('magnetic zone\'s circle: centre down (the product centre, as the 12\'s; the 14\'s is 3.10 below it)', 'check', cy, f.centre[1], 0.05);
  add(`magnetic zone's circle: radius (dimensioned ${R})`, 'check', R, f.radius, 0.05);
  // One circle top and bottom: each arc's crossings, their mean distance from the fitted centre (an arc fitted alone,
  // one side of the cap, is too short to pin a radius).
  const from = (P: [number, number][]) => P.reduce((t, [x, y]) => t + Math.hypot(x - f.centre[0], y - f.centre[1]), 0) / P.length;
  add('magnetic zone\'s top arc (40 to 69 across): its crossings from the fitted centre', 'check', R, from(topP), 0.05);
  add('magnetic zone\'s bottom arc: its crossings from the fitted centre', 'check', R, from(bottomP), 0.05);
  const lowest = f.centre[1] + f.radius;
  add(`magnetic zone's lowest point (derived ${magsafeZone.bottom.mm}: 73.35 + 49.39)`, 'check', magsafeZone.bottom.mm, lowest, 0.05);
  add(`magnetic zone's top, the cap's peak (derived ${magsafeZone.top.mm}: 73.35 - 49.39)`, 'check', magsafeZone.top.mm, f.centre[1] - f.radius, 0.05);
  const side = Math.sqrt(f.radius ** 2 - (W / 2) ** 2);
  add(`magnetic zone meets the sides (derived ${magsafeZone.sidesFrom.mm} and ${magsafeZone.sidesTo.mm}): from`, 'check', magsafeZone.sidesFrom.mm, f.centre[1] - side, 0.05);
  add('magnetic zone meets the sides: to', 'check', magsafeZone.sidesTo.mm, f.centre[1] + side, 0.05);
  const at = (x: number) => topP.find((p) => p[0] === x)![1];
  add(`negative control: a straight full-width top (the 16's) puts 50 and 68 across on one line (1 = they're over 5 mm apart: ${at(50).toFixed(2)}, ${at(68).toFixed(2)})`, 'check', 1, Math.abs(at(68) - at(50)) > 5 ? 1 : 0, 0);
  add(`negative control: the 14's arc, centred 3.10 below, would bottom out at ${(magsafeZone.bottom.mm + 3.1).toFixed(2)} (1 = the drawn one is over 2 mm higher)`, 'check', 1, magsafeZone.bottom.mm + 3.1 - lowest > 2 ? 1 : 0, 0);
  return out;
}

/**
 * The receiver's slot at 4800 dpi in the front view's frame (the 14's scan): the white inside the slot (down its middle
 * column, then along the row through the white's middle), widened by one stroke of the slot's own pen, read radially on
 * its round ends at 30° to 75°, clear of the glass edge above and the cutout's walls beside.
 */
function receiver(pdf: string, cal: Calibration): Measured[] {
  const { body, front } = phone;
  const W = body.width.mm;
  const f = receiverView.dpi / frontView.dpi;
  const rc: Calibration = {
    pxPerMm: cal.pxPerMm * f,
    origin: [(cal.origin[0] + frontView.crop.x) * f - receiverView.crop.x, (cal.origin[1] + frontView.crop.y) * f - receiverView.crop.y],
  };
  const rg = render(pdf, receiverView);
  const mid = toPx(rc, [W / 2, front.receiverFromTop!.mm]);
  const down = runs(rg, [Math.round(mid[0]), 0], [0, 1], rg.height - 1);
  const above = down.filter((q) => q.at < mid[1]).at(-1)!, below = down.find((q) => q.at > mid[1])!;
  const [y0, y1] = [above.at + (above.width + 1) / 2, below.at - (below.width + 1) / 2];
  const ym = (y0 + y1) / 2;
  const along = runs(rg, [0, Math.round(ym)], [1, 0], rg.width - 1);
  const half = (front.receiverLength!.mm / 2) * rc.pxPerMm;
  const nearest = (x: number) => along.reduce((p, q) => (Math.abs(q.at - x) < Math.abs(p.at - x) ? q : p));
  const [e0, e1] = [nearest(mid[0] - half), nearest(mid[0] + half)];
  const [x0, x1] = [e0.at + (e0.width + 1) / 2, e1.at - (e1.width + 1) / 2];
  const r = (y1 - y0) / 2;
  const strokes = [[x0 + r, -1], [x1 - r, 1]].flatMap(([cx, side]) =>
    [30, 45, 60, 75].map((a) => {
      const t = (a * Math.PI) / 180;
      return runs(rg, [cx, ym], [side * Math.cos(t), -Math.sin(t)], Math.round(4 * r))[0].width;
    }),
  );
  const stroke = strokes.reduce((s, w) => s + w) / strokes.length;
  const mm = (px: number) => px / rc.pxPerMm;
  const add = (name: string, kind: Measured['kind'], recorded: number, measured: number): Measured => ({ name, kind, recorded, measured, within: 0.05 });
  return [
    add(`receiver slot length (the white inside, ${mm(x1 - x0).toFixed(2)}, and a ${mm(stroke).toFixed(2)} stroke)`, 'scaled', front.receiverLength!.mm, mm(x1 - x0 + stroke)),
    add(`receiver slot height (the white inside, ${mm(y1 - y0).toFixed(2)}, and a ${mm(stroke).toFixed(2)} stroke)`, 'scaled', front.receiverHeight!.mm, mm(y1 - y0 + stroke)),
    add(`receiver slot middle from the top (dimensioned ${front.receiverFromTop!.mm})`, 'check', front.receiverFromTop!.mm, mm(ym - rc.origin[1])),
    add(`receiver slot middle across (dimensioned 35.76)`, 'check', 35.76, mm((x0 + x1) / 2 - rc.origin[0])),
  ];
}

/**
 * The end holes' centres from chords on rows either side of their centre line, in the family's bottom-view frame,
 * against the dimensioned outer edges plus or less half a hole.
 */
function holes(pdf: string, bottomRow: number): Measured[] {
  const c = bottomView, g = render(pdf, c);
  const { out, add } = collector();
  const b = phone.bottom;
  const { cal, px } = bottomCalibration(phone, c, pdf, { bottomRow }, g);
  for (const [i, edge] of [[0, 18.79], [2, 24.83], [3, 46.69], [7, 57.24]] as const) {
    const h = circleAt(g, toPx(cal, [b.holes[i].mm, 0]), (b.holeDiameter.mm / 2) * px, 10);
    const centre = (h.centre[0] - cal.origin[0]) / px;
    add(`bottom hole ${i + 1}'s centre (dimensioned ${edge} ${i === 0 || i === 3 ? '+' : '-'} 0.765: the line on its outer edge)`, 'check', b.holes[i].mm, centre, 0.05);
  }
  return out;
}

/** The corner's middle cross, stood in for by a point on the diagonal (drawing.ts): how far the built outline passes from it. */
function cornerCross(): Measured {
  const { W, L, outline } = iphone(phone);
  const q = outline().map(([x, z]): [number, number] => [W / 2 - x, L / 2 - z]).filter(([s, t]) => s < 20 && t < 20);
  const p = [cornerMiddle.across.mm, cornerMiddle.down.mm];
  const dist = Math.min(...q.slice(0, -1).map((a, i) => {
    const b = q[i + 1], v = [b[0] - a[0], b[1] - a[1]], w = [p[0] - a[0], p[1] - a[1]];
    const t = Math.max(0, Math.min(1, (v[0] * w[0] + v[1] * w[1]) / (v[0] ** 2 + v[1] ** 2)));
    return Math.hypot(a[0] + t * v[0] - p[0], a[1] + t * v[1] - p[1]);
  }));
  return { name: 'corner outline from Detail A\'s middle cross (3.22, 3.40), which its diagonal point stands in for', kind: 'check', recorded: 0, measured: dist, within: 0.01 };
}

export const remeasure = (pdf = PDF): Measured[] => {
  // The active area's bottom-left diagonal runs along a hatch line that starts on the arc (as the 14's): left out.
  // The bottom row 1.9 toward the front: on the flat band (to 2.71), clear of the port (3.14 tall about the middle).
  const bottomRow = 1.9;
  return [
    cornerCross(),
    ...detailDReadings(pdf),
    ...sideReadings(pdf),
    ...sectionReadings(pdf),
    ...flashSectionReadings(pdf),
    ...magsafeReadings(pdf),
    ...family(phone, { front: frontView, bottom: bottomView }, pdf, { activeCorners: ['top-left', 'top-right', 'bottom-right'], bottomRow }),
    ...receiver(pdf, frontCalibration(phone, frontView, pdf).cal),
    ...holes(pdf, bottomRow),
  ];
};

export const hasPdf = () => existsSync(PDF);

if (import.meta.main) console.log(report(remeasure()));
