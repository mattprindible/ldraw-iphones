// Re-measures every scaled value in drawing.ts from the PDF (the family's procedures, iphone/measure.ts), and checks
// what the family's procedures don't read: the rear mic (Detail D, at 4800 dpi), the flash's keepout (sheet 3's
// Section T-T) and MagSafe's keepouts (sheet 4) against what the drawing draws, with hand calculations from the
// printed numbers and negative controls.
//
//   node iphone-18-pro-max/measure.ts   → a table: recorded, measured, the difference
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { remeasure as family, report, type Measured } from '../../measure.ts';
import type { Value } from '../../../src/provenance.ts';
import { circleAt, lineNear, render, runs, toPx, type Calibration, type Region } from '../../../src/raster.ts';
import { body, bottomView, bump, cameras, detailD, flashKeepout, flashKeepoutBase, flashKeepoutEnd, frontView, magsafe, magsafeExtras, magsafeView, micWindow, phone, plateau, rearMic, sectionTT } from './drawing.ts';

export const PDF = join(import.meta.dirname, '..', '..', 'drawings', 'iphone-18-pro-max.pdf');

/** As the family's: a check on a heavy line passes if its number falls within the stroke; a scaled value gets no slack. */
function collector() {
  const out: Measured[] = [];
  const add = (name: string, kind: Measured['kind'], recorded: number, measured: number, within: number) => out.push({ name, kind, recorded, measured, within });
  const value = (what: string, v: Value, measured: number, within: number) =>
    add(v.kind === 'scaled' ? what : `${what} (${v.kind} ${v.mm})`, v.kind === 'scaled' ? 'scaled' : 'check', v.mm, measured, within);
  return { out, add, value };
}
const mean = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length;
const deg = (rad: number) => (rad * 180) / Math.PI;
const tanHalf = (fullDeg: number) => Math.tan((fullDeg / 2) * (Math.PI / 180));
const steps = (a: number, b: number, n = 40) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);

/** A circle through points, least squares (Kåsa): centre and radius, and the worst point's distance off it. */
function fitCircle(P: [number, number][]): { centre: [number, number]; radius: number; worst: number } {
  let [sx, sy, sxx, syy, sxy, sxz, syz] = [0, 0, 0, 0, 0, 0, 0];
  for (const [x, y] of P) {
    const z = x * x + y * y;
    [sx, sy, sxx, syy, sxy, sxz, syz] = [sx + x, sy + y, sxx + x * x, syy + y * y, sxy + x * y, sxz + x * z, syz + y * z];
  }
  const sz = P.reduce((t, [x, y]) => t + x * x + y * y, 0);
  // x² + y² = a·x + b·y + c, by Gaussian elimination.
  const A = [[sxx, sxy, sx, sxz], [sxy, syy, sy, syz], [sx, sy, P.length, sz]];
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) { const f = A[j][i] / A[i][i]; for (let k = i; k < 4; k++) A[j][k] -= f * A[i][k]; }
  const s = [0, 0, 0];
  for (let i = 2; i >= 0; i--) { let t = A[i][3]; for (let k = i + 1; k < 3; k++) t -= A[i][k] * s[k]; s[i] = t / A[i][i]; }
  const centre: [number, number] = [s[0] / 2, s[1] / 2];
  const radius = Math.sqrt(s[2] + centre[0] ** 2 + centre[1] ** 2);
  return { centre, radius, worst: Math.max(...P.map(([x, y]) => Math.abs(Math.hypot(x - centre[0], y - centre[1]) - radius))) };
}

/** A line u = a + b·v through points (u, v), least squares, dropping points more than `tol` px off and refitting. */
type Line = { a: number; b: number; n: number };
function fitLine(P: [number, number][], tol = 3): Line {
  let pts = P;
  let a = 0, b = 0;
  for (let pass = 0; pass < 4; pass++) {
    const mv = mean(pts.map((p) => p[1])), mu = mean(pts.map((p) => p[0]));
    b = pts.reduce((t, [u, v]) => t + (u - mu) * (v - mv), 0) / pts.reduce((t, [, v]) => t + (v - mv) ** 2, 0);
    a = mu - b * mv;
    pts = P.filter(([u, v]) => Math.abs(u - (a + b * v)) < tol);
  }
  return { a, b, n: pts.length };
}
/** Where two lines meet, as (u, v); a line's angle off the axis (the u direction), degrees. */
const meet = (l: Line, m: Line): [number, number] => { const v = (m.a - l.a) / (l.b - m.b); return [l.a + l.b * v, v]; };
const offAxis = (l: Line) => 90 - deg(Math.atan(Math.abs(l.b)));

/**
 * Detail D calibrated as the family calibrates it (the camera centres furthest apart: 1 and 3 across, 1 and 2 down;
 * camera 1 the datum), then the rear mic at 4800 dpi: crossings of its stroke's middle on rays every 5° from its
 * dimensioned centre, clear of the -23.99 line and the leader that come in from the right (-25° to 45°, down positive),
 * a circle fitted to them. The -23.99 line's own row, 2.6 to 3.2 right of the centre, past the arrowhead. And a negative control: the same
 * scan where nothing is drawn.
 */
export function micReadings(pdf = PDF): Measured[] {
  const { out, add, value } = collector();
  const r = detailD, g = render(pdf, r);
  const at = (c: { fromSide: Value; fromTop: Value; ring: Value }) => circleAt(g, toPx(r, [c.fromSide.mm, c.fromTop.mm]), (c.ring.mm / 2) * r.pxPerMm).centre;
  const [c1, c2, c3] = [cameras.ultraWide, cameras.main, cameras.telephoto].map(at);
  const sx = (c3[0] - c1[0]) / (cameras.telephoto.fromSide.mm - cameras.ultraWide.fromSide.mm);
  const sy = (c2[1] - c1[1]) / (cameras.main.fromTop.mm - cameras.ultraWide.fromTop.mm);
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [c1[0] - cameras.ultraWide.fromSide.mm * sx, c1[1] - cameras.ultraWide.fromTop.mm * sy] };

  // The 4800 dpi window round a point (mm), in the drawing's mm.
  const f = micWindow.dpi / r.dpi, p4 = cal.pxPerMm * f, half = micWindow.half;
  const windowAt = (mm: [number, number]) => {
    const px = toPx(cal, mm);
    const w: Region = { page: r.page, dpi: micWindow.dpi, crop: { x: Math.round((r.crop.x + px[0]) * f) - half, y: Math.round((r.crop.y + px[1]) * f) - half, width: 2 * half, height: 2 * half } };
    const toMm = (u: number, v: number): [number, number] => [((w.crop.x + u) / f - r.crop.x - cal.origin[0]) / cal.pxPerMm, ((w.crop.y + v) / f - r.crop.y - cal.origin[1]) / cal.pxPerMm];
    return { g: render(pdf, w), toMm, o: [(px[0] + r.crop.x) * f - w.crop.x, (px[1] + r.crop.y) * f - w.crop.y] as [number, number] };
  };
  const R = rearMic.diameter.mm / 2;
  const crossings = (w: ReturnType<typeof windowAt>) => {
    const P: [number, number][] = [], widths: number[] = [];
    for (let a = 0; a < 360; a += 5) {
      // Clear of the -23.99 line and the leader from the right, and of the mic's own centre lines (within 10° of each axis).
      if (a > 360 - 25 || a < 45 || [90, 180, 270].some((b) => Math.abs(a - b) < 10)) continue;
      const t = (a * Math.PI) / 180, d: [number, number] = [Math.cos(t), Math.sin(t)];
      const start = 0.2 * p4, rs = runs(w.g, [w.o[0] + d[0] * start, w.o[1] + d[1] * start], d, Math.round(0.7 * p4)).map((q) => ({ r: 0.2 + q.at / p4, width: q.width / p4 }));
      const near = rs.filter((q) => Math.abs(q.r - R) < 0.15);
      if (near.length !== 1) continue;
      P.push(w.toMm(w.o[0] + d[0] * near[0].r * p4, w.o[1] + d[1] * near[0].r * p4));
      widths.push(near[0].width);
    }
    return { P, stroke: widths.length ? mean(widths) : 0 };
  };
  const w = windowAt([rearMic.fromSide.mm, rearMic.fromTop.mm]);
  const { P, stroke } = crossings(w);
  const c = fitCircle(P);
  // Across, the mic reads 0.04 right of 64.16, as the flash on the same line does by the family's procedure (+0.03): the
  // 3X 64.16 column is drawn there in Detail D's calibration, not the mic alone.
  value(`rear mic centre across (3X 64.16: the flash's, the mic's and the sensor's line; ${P.length} crossings, worst ${c.worst.toFixed(3)} off)`, rearMic.fromSide, c.centre[0], 0.05);
  value('rear mic centre down (-23.99)', rearMic.fromTop, c.centre[1], 0.05);
  // A light pen (0.12, the camera rings'): its middle traces the printed Ø1.15 (the 17 Pro's 0.18 pen traced Ø1.10 for 1.05).
  add(`rear mic Ø, its stroke's middle; drawn ${stroke.toFixed(2)} wide (dimensioned 1.15)`, 'check', rearMic.diameter.mm, 2 * c.radius, Math.max(0.05, stroke));
  // The -23.99 line, on columns 2.6 to 3.2 right of the centre: nearer, the leader's arrowhead's upper edge runs along it
  // and merges with it into one wider run, whose middle lies 0.04 low.
  const rowOf = mean([2.6, 2.9, 3.2].map((dx) => {
    const u = Math.round(w.o[0] + dx * p4);
    return w.toMm(u, lineNear(w.g, [u, 0], [0, 1], w.g.height - 1, w.o[1]))[1];
  }));
  add('the -23.99 line on the right, down (dimensioned 23.99)', 'check', rearMic.fromTop.mm, rowOf, 0.03);
  add('the -23.99 line against the fitted centre (mm)', 'check', 0, rowOf - c.centre[1], 0.03);
  // The negative control: mirrored across the phone's middle, (13.82, 23.99) lies between cameras 1 and 2, clear of both
  // (camera 3's -23.99 centre line runs through it, along the rays at 0° and 180°, which the scan skips).
  const empty = crossings(windowAt([body.width.mm - rearMic.fromSide.mm, rearMic.fromTop.mm]));
  add(`negative control: the same scan at (13.82, 23.99), where nothing is drawn (1 = under a third of the rays find a ring; ${empty.P.length} did)`, 'check', 1, empty.P.length < P.length / 3 ? 1 : 0, 0);
  return out;
}

/**
 * Sheet 3's Section T-T (the front face on the left, the flash's axis across): calibrated on the front face and the
 * 14.00 line on a row above the phone, checked on the 11.53 line; the axis midway between the 6.65 base's extension
 * lines, left of the phone. Then the keepout's four lines, fitted on rows (the inner ones between the base's corner and
 * the kink, the outer ones from just past the kink to just short of the closing line), their crossings and angles; the
 * closing line; the hand calculations from the printed numbers, and the negative controls. The 11.53 line is read 500
 * rows down (its extension line starts at about 400, above its arrow). The fits keep 37 to 40 of the 41 rows traced on each
 * line (the rest have no run within 6 px, or one over 3 px off the fitted line).
 */
export function sectionReadings(pdf = PDF): Measured[] {
  const { out, add, value } = collector();
  const r = sectionTT, g = render(pdf, r);
  const k = flashKeepout, base = flashKeepoutBase.fromFront.mm, transition = k.transitionFromFront!.mm, D = k.innerBaseDiameter!.mm;
  const T = body.thickness.mm;
  const across = (row: number, mm: number, f: number, p: number) => lineNear(g, [0, row], [1, 0], g.width - 1, f + mm * p);
  const face = across(100, 0, r.origin[0], r.pxPerMm);
  const px = (across(100, transition, face, r.pxPerMm) - face) / transition;
  const mm = (u: number) => (u - face) / px;
  add('Section T-T px/mm (calibration: the front face to the 14.00 line)', 'check', r.pxPerMm, px, 0.05);
  add('T-T front face (px)', 'check', r.origin[0], face, 1);
  add('T-T the 11.53 line, its arrow\'s end (dimensioned)', 'check', base, mm(across(500, base, face, px)), 0.03);
  add(`T-T the 11.53 line is the plateau's top: ${T} + ${bump.top.mm} (dimensioned, sheet 1)`, 'check', T + bump.top.mm, base, 0.005);
  const ext = [-1, 1].map((sd) => lineNear(g, [100, 0], [0, 1], g.height - 1, r.origin[1] + (sd * D * px) / 2));
  const axis = (ext[0] + ext[1]) / 2;
  add('T-T the base\'s extension lines apart (dimensioned 6.65)', 'check', D, (ext[1] - ext[0]) / px, 0.03);
  add('T-T the axis, midway between them (px)', 'check', r.origin[1], axis, 1);
  // The section's back face beside the base, on rows 4 to 6 either side of the axis (the plateau's top).
  const faceAt = (v: number) => mm(across(Math.round(axis + v * px), base, face, px));
  add('T-T the section\'s back face beside the base (rows 4 to 6 either side): the plateau\'s top', 'check', base, mean([-6, -5, -4, 4, 5, 6].map(faceAt)), 0.03);
  const end = mean([-12, -10, 10, 12].map((v) => mm(across(Math.round(axis + v * px), flashKeepoutEnd.mm, face, px))));
  value('T-T the line closing the keepout, from the front (rows 10 and 12 either side)', flashKeepoutEnd, end, 0.03);

  // The keepout's lines: on each row (v mm from the axis), the run nearest where the printed numbers put the line,
  // within 6 px; fitted u = a + b·v.
  const ti = tanHalf(k.inner.mm), to = tanHalf(k.outer!.mm), kinkHalf = D / 2 + (transition - base) * ti;
  const innerU = (h: number) => base + (h - D / 2) / ti, outerU = (h: number) => transition + (h - kinkHalf) / to;
  const traced = (hs: number[], side: number, expect: (h: number) => number): [number, number][] => hs.flatMap((h) => {
    const row = Math.round(axis + side * h * px), want = face + expect(h) * px;
    const q = runs(g, [0, row], [1, 0], g.width - 1).reduce((p, q) => (Math.abs(q.at - want) < Math.abs(p.at - want) ? q : p));
    return Math.abs(q.at - want) < 6 ? [[q.at, row] as [number, number]] : [];
  });
  const innerHs = steps(D / 2 + 0.3 * ti, kinkHalf - 0.3), outerHs = steps(kinkHalf + 0.6, kinkHalf + 0.85 * (flashKeepoutEnd.mm - transition) * to);
  const [innerU1, innerL1] = [-1, 1].map((sd) => fitLine(traced(innerHs, sd, innerU)));
  const [outerU1, outerL1] = [-1, 1].map((sd) => fitLine(traced(outerHs, sd, outerU)));
  const kinks = [meet(innerU1, outerU1), meet(innerL1, outerL1)];
  kinks.forEach((q, i) => add(`T-T ${['upper', 'lower'][i]} kink, inner cone to outer, from the front (14.00)`, 'check', transition, mm(q[0]), 0.05));
  add(`T-T inner cone, full angle as drawn (degrees; fitted to ${innerU1.n} and ${innerL1.n} points)`, 'check', k.inner.mm, offAxis(innerU1) + offAxis(innerL1), 1);
  add(`T-T outer cone, full angle as drawn (degrees; fitted to ${outerU1.n} and ${outerL1.n} points)`, 'check', k.outer!.mm, offAxis(outerU1) + offAxis(outerL1), 1);
  const apex = meet(innerU1, innerL1), outerApex = meet(outerU1, outerL1);
  add('T-T inner apex on the axis (mm across)', 'check', 0, (apex[1] - axis) / px, 0.1);
  add(`T-T inner cone's apex from the front (derived ${k.apexFromFront!.mm}; the drawn lines crossed)`, 'check', k.apexFromFront!.mm, mm(apex[0]), 0.1);
  add(`T-T outer cone's apex from the front (derived ${k.outerApexFromFront!.mm}; the drawn lines crossed)`, 'check', k.outerApexFromFront!.mm, mm(outerApex[0]), 0.1);
  // The inner lines at the base: they start on the base's corners (6.65 apart on the plateau's top).
  const vAt = (l: Line, u: number) => (u - l.a) / l.b;
  add('T-T the inner cone at its base, 11.53 (dimensioned 6.65)', 'check', D, (vAt(innerL1, face + base * px) - vAt(innerU1, face + base * px)) / px, 0.05);
  // Hand calculations from the printed numbers alone.
  const spacing = Math.abs(kinks[1][1] - kinks[0][1]) / px;
  add(`T-T transition, Ø6.65 + 2 (14.00 - 11.53) tan 61.5° = ${(2 * kinkHalf).toFixed(2)}, against the drawn kinks' spacing`, 'check', 2 * kinkHalf, spacing, 0.1);
  add(`hand calculation: the inner apex, 11.53 - 3.325 / tan 61.5° = ${(base - D / 2 / ti).toFixed(3)} (recorded ${k.apexFromFront!.mm})`, 'check', k.apexFromFront!.mm, base - D / 2 / ti, 0.01);
  add(`hand calculation: the outer apex, 14.00 - ${kinkHalf.toFixed(3)} / tan 78.5° = ${(transition - kinkHalf / to).toFixed(3)} (recorded ${k.outerApexFromFront!.mm})`, 'check', k.outerApexFromFront!.mm, transition - kinkHalf / to, 0.01);
  // Negative controls: 11.53 read as the inner apex (whether 11.53 runs to the apex or to the base was the open question), and "to cover glass"
  // read from the back plate.
  add('negative control: 11.53 read as the inner cone\'s apex (1 = the drawn lines cross over 1 mm nearer the front)', 'check', 1, base - mm(apex[0]) > 1 ? 1 : 0, 0);
  add(`negative control: read from the back plate the transition would be ${(T + transition).toFixed(2)} from the front (1 = the drawn kinks are over 4 mm from it)`, 'check', 1, Math.abs(mean(kinks.map((q) => mm(q[0]))) - (T + transition)) > 4 ? 1 : 0, 0);
  return out;
}

/**
 * Sheet 4's MagSafe view: calibrated on its 0.00 and 38.99 lines across (above and below the phone) and its 0.00 and
 * 115.14 lines down (left of it), checked on the others (81.71, 157.45, 49.79) and the phone's outline. Then the clear
 * circle fitted to its crossings; the zone's top on columns along its straight edge; the arc, its lowest point and its
 * crossings of four columns against the circle through the 115.14 corners; negative controls.
 */
export function magsafeReadings(pdf = PDF): Measured[] {
  const { out, add, value } = collector();
  const r = magsafeView, g = render(pdf, r);
  const rowAbove = Math.round(toPx(r, [0, -3])[1]), rowBelow = Math.round(toPx(r, [0, 166])[1]);
  const colLeft = Math.round(toPx(r, [-3, 0])[0]);
  const xAt = (row: number, m: number, c: Calibration = r) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(c, [m, 0])[0]);
  const yAt = (col: number, m: number, c: Calibration = r) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(c, [0, m])[1]);
  const [x0, x1] = [xAt(rowAbove, 0), xAt(rowBelow, magsafe.fromSide.mm)];
  const [y0, y1] = [0, magsafe.zoneSidesTo!.mm].map((m) => yAt(colLeft, m));
  const sx = (x1 - x0) / magsafe.fromSide.mm, sy = (y1 - y0) / magsafe.zoneSidesTo!.mm;
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [x0, y0] };
  const X = (px: number) => (px - cal.origin[0]) / cal.pxPerMm, Y = (px: number) => (px - cal.origin[1]) / cal.pxPerMm;
  const col = (x: number) => Math.round(toPx(cal, [x, 0])[0]), row = (y: number) => Math.round(toPx(cal, [0, y])[1]);
  add('MagSafe view px/mm across (calibration: the 0.00 and 38.99 lines)', 'check', r.pxPerMm, sx, 0.05);
  add('MagSafe view px/mm down (calibration: the 0.00 and 115.14 lines)', 'check', r.pxPerMm, sy, 0.05);
  add('MagSafe view datum across (px)', 'check', r.origin[0], x0, 1);
  add('MagSafe view datum down (px)', 'check', r.origin[1], y0, 1);
  add('MagSafe view 49.79 line across, below (dimensioned: the compass)', 'check', magsafeExtras.compass.fromSide.mm, X(xAt(rowBelow, magsafeExtras.compass.fromSide.mm, cal)), 0.03);
  add('MagSafe view 81.71 line down, left (dimensioned)', 'check', magsafe.fromTop.mm, Y(yAt(colLeft, magsafe.fromTop.mm, cal)), 0.03);
  add('MagSafe view 157.45 line down, left (dimensioned: the compass)', 'check', magsafeExtras.compass.fromTop.mm, Y(yAt(colLeft, magsafeExtras.compass.fromTop.mm, cal)), 0.03);
  add('the phone\'s width on the MagSafe view, 90 down (77.98)', 'check', body.width.mm, X(xAt(row(90), body.width.mm, cal)) - X(xAt(row(90), 0, cal)), 0.05);
  add('the phone\'s bottom edge on the MagSafe view, 20 and 60 across (163.43)', 'check', body.length.mm, mean([20, 60].map((x) => Y(yAt(col(x), body.length.mm, cal)))), 0.05);
  add(`hand calculation: the clear circle's centre is the product's, 163.43 / 2 = ${(body.length.mm / 2).toFixed(3)} down, 77.98 / 2 = ${(body.width.mm / 2).toFixed(3)} across`, 'check', magsafe.fromTop.mm, body.length.mm / 2, 0.01);

  // The clear circle: crossings within 0.25 of R28.75 on rays every 5° from its centre, clear of the centre lines (within
  // 6° of each axis), of the leaders that cross it (the 1 5 7 note's, from the right at about 10°, and Ø57.50's, landing
  // at about 40°, down positive) and of the apple's bottom, which comes within a stroke of the circle straight down
  // (70° to 110°), keeping rays with one crossing only (a hatch line meeting the circle gives two).
  const c: [number, number] = [magsafe.fromSide.mm, magsafe.fromTop.mm], R = magsafe.diameter.mm / 2;
  const P: [number, number][] = [];
  for (let a = 0; a < 360; a += 5) {
    if ([0, 90, 180, 270, 360].some((b) => Math.abs(a - b) < 6) || [10, 40].some((b) => Math.abs(a - b) < 9) || (a > 70 && a < 110)) continue;
    const t = (a * Math.PI) / 180, d: [number, number] = [Math.cos(t), Math.sin(t)];
    const o = toPx(cal, c), start = (R - 1.5) * cal.pxPerMm;
    const rs = runs(g, [o[0] + d[0] * start, o[1] + d[1] * start], d, Math.round(3 * cal.pxPerMm)).map((q) => R - 1.5 + q.at / cal.pxPerMm).filter((x) => Math.abs(x - R) < 0.25);
    if (rs.length === 1) P.push([c[0] + d[0] * rs[0], c[1] + d[1] * rs[0]]);
  }
  const f = fitCircle(P);
  add(`clear area's circle: centre across (fitted to ${P.length} crossings; worst ${f.worst.toFixed(3)} off)`, 'check', magsafe.fromSide.mm, f.centre[0], 0.05);
  add('clear area\'s circle: centre down (81.71)', 'check', magsafe.fromTop.mm, f.centre[1], 0.05);
  add('clear area\'s circle: Ø (dimensioned 57.50)', 'check', magsafe.diameter.mm, 2 * f.radius, 0.05);
  add('negative control: the clear circle 2.735 below the product centre, as the 17 Pro\'s, would be 84.45 down (1 = the fitted centre is over 2 mm above it)', 'check', 1, body.length.mm / 2 + 2.735 - f.centre[1] > 2 ? 1 : 0, 0);

  // The zone's top on columns 20, 30, 48 and 58 across (clear of the 38.99 centre line): a thin straight line the full
  // width, under the plateau's bottom edge (47.96 here) and the back glass's heavy top edge (48.8). Its hatch lines meet
  // it from below and can merge with it, so each is the first ink down from 1.5 above, its near edge plus half the pen
  // (the 115.14 extension line's).
  const zf = magsafe.zoneFrom!.mm;
  const pen = runs(g, [colLeft, 0], [0, 1], g.height - 1).reduce((p, q) => (Math.abs(Y(q.at) - magsafe.zoneSidesTo!.mm) < Math.abs(Y(p.at) - magsafe.zoneSidesTo!.mm) ? q : p)).width;
  const tops = [20, 30, 48, 58].map((x) => {
    const from = row(zf - 1.5), q = runs(g, [col(x), from], [0, 1], Math.round(2.5 * cal.pxPerMm))[0];
    return Y(from + q.at - (q.width - 1) / 2 + (pen - 1) / 2);
  });
  value(`magnetic zone's top, 20, 30, 48 and 58 across (${tops.map((t) => t.toFixed(3)).join(', ')})`, magsafe.zoneFrom!, mean(tops), 0.03);
  // The plateau's bottom edge on the same columns, the first ink down from 3 above it: the zone's top is not on it.
  const edge = mean([20, 30, 48, 58].map((x) => { const from = row(plateau.bottom.mm - 3); return Y(from + runs(g, [col(x), from], [0, 1], Math.round(4 * cal.pxPerMm))[0].at); }));
  add(`the plateau's bottom edge on this view (Detail D scales ${plateau.bottom.mm})`, 'check', plateau.bottom.mm, edge, 0.05);
  add(`negative control: the zone's top on the plateau's bottom edge, as the 17 Pro's (1 = the drawn top is over 3 mm below it; ${(mean(tops) - edge).toFixed(2)})`, 'check', 1, mean(tops) - edge > 3 ? 1 : 0, 0);

  // Its arc: the lowest point down columns 1.5 either side of the centre line (at 0.75 the right one meets a hatch line
  // where it joins the arc: a 14 px run for 6, its middle 0.05 high); its crossings of x = 12, 22, 58 and 70
  // (clear of the R49.39 leader, which lands on the arc about 3.4 across, the 5 7 note's, inside the zone, and the
  // compass's 49.79 line, which starts below the arc), against the circle through (0, 115.14) and (77.98, 115.14) of
  // R49.39, its centre derived.
  const zr = magsafe.zoneRadius!.mm, half = body.width.mm / 2;
  const zc = magsafe.zoneSidesTo!.mm - Math.sqrt(zr * zr - half * half);
  add(`hand calculation: the zone's arc's centre, 115.14 - √(49.39² - 38.99²) = ${zc.toFixed(3)} down, ${(zc - magsafe.fromTop.mm).toFixed(2)} below the clear circle's`, 'check', magsafe.fromTop.mm + 3.11, zc, 0.01);
  const low = mean([half - 1.5, half + 1.5].map((x) => Y(yAt(col(x), zc + zr, cal)) + (zr - Math.sqrt(zr * zr - 1.5 * 1.5))));
  add(`magnetic zone's arc, its lowest point (centre ${zc.toFixed(2)} down, derived, + R49.39)`, 'check', zc + zr, low, 0.05);
  for (const x of [12, 22, 58, 70]) {
    const at = zc + Math.sqrt(zr * zr - (x - half) ** 2);
    add(`magnetic zone's arc at x = ${x} (${at.toFixed(2)})`, 'check', at, Y(yAt(col(x), at, cal)), 0.05);
  }
  add(`negative control: centred on the clear circle, R49.39's lowest point would be ${(magsafe.fromTop.mm + zr).toFixed(2)} (1 = the drawn one is over 2 mm lower)`, 'check', 1, low - (magsafe.fromTop.mm + zr) > 2 ? 1 : 0, 0);
  return out;
}

export const remeasure = (pdf = PDF): Measured[] => [
  ...family(phone, { back: detailD, front: frontView, bottom: bottomView }, pdf, {
    // The camera area's sides crossed 28 in (the 17 Pro Max's): at 20 the Ø16.58 leader's diagonal is near the
    // outline's near side, and the middle row runs along camera 3's centre line.
    bumpScanAt: 28,
    // The bottom view draws no 0.00 extension line (its labels start at the first hole's 15.40), so it's calibrated on
    // its outline; the buttons' stubs cover the flat band, so the row is 1.75 toward the front (the 17 Pro Max's).
    bottomRow: 1.75,
    // The active area's bottom-left diagonal runs along a hatch line (as the 17 Pro Max's); on the bottom-right's a
    // hatch line crosses the arc itself (a 9 px run for 5, reading 10.67 where the top two read 10.47 each).
    activeCorners: ['top-left', 'top-right'],
    known: {
      // Not the drawing's disagreement but a crossing the family's procedure can't step round (it reads the ends on
      // the island's centre row only): there the island's own dash-dot centre line runs into its left end (a 44 px
      // run), and the run picked is the next dash, 3.3 in. The 15.68 extension lines are 15.68 apart at 1200 dpi, and
      // the ends on rows 0.26 and 0.49 off the centre measure 15.66 to 15.71 once the chord's shortening (R3.035) is
      // added back.
      'island length': 'on its centre row its own centre line runs into the left end (a 44 px run); between its extension lines, and on rows 0.26 and 0.49 off the centre, it measures 15.66 to 15.71',
      // The bottom view's front outline is drawn with a heavy pen (13 px at 1200 dpi, the back's 6), as the 18 Pro's:
      // middle to middle 8.57; the front stroke spans 8.29 to 8.85 from the back's middle, and 8.75 falls inside it.
      'bottom view thickness': 'the front outline is a 13 px stroke (the back\'s 6): middle to middle 8.57, its inner and outer edges 8.29 and 8.85 from the back\'s middle',
    },
  }),
  ...micReadings(pdf),
  ...sectionReadings(pdf),
  ...magsafeReadings(pdf),
];

export const hasPdf = () => existsSync(PDF);

if (import.meta.main) console.log(report(remeasure()));
