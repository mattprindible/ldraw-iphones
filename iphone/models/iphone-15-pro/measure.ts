// Re-measures every scaled value in drawing.ts from the PDF (the family's procedures, iphone/measure.ts), and checks
// the rear mic, the flash's keepout section (Section J-J) and MagSafe's keepouts against what the drawing draws (as the
// 14 Pro's measure.ts, whose sheets are drawn on the same plan).
//
//   node iphone-15-pro/measure.ts   → a table: recorded, measured, the difference
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { remeasure as family, report, type Measured } from '../../measure.ts';
import { cleanCircleAt, lineNear, render, runs, toPx, type Calibration } from '../../../src/raster.ts';
import { body, bottomView, bump, detailD, flash, flashKeepout, flashKeepoutExtras, frontView, magsafe, magsafeExtras, magsafeView, micView, phone, rearMic, rearMicOuter, sectionJJ } from './drawing.ts';

export const PDF = join(import.meta.dirname, '..', '..', 'drawings', 'iphone-15-pro.pdf');

const mean = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length;
const deg = (rad: number) => (rad * 180) / Math.PI;
const tanHalf = (fullDeg: number) => Math.tan((fullDeg / 2) * (Math.PI / 180));
function collector() {
  const out: Measured[] = [];
  const add = (name: string, recorded: number, measured: number, within: number, known?: string) => out.push({ name, kind: 'check', recorded, measured, within, ...(known ? { known } : {}) });
  return { out, add };
}

/** A line u = a + b·v through points (u, v), least squares, dropping points more than `tol` px off and refitting. */
function fitLine(P: [number, number][], tol = 3): { a: number; b: number; n: number } {
  let pts = P.filter(([u]) => Number.isFinite(u));
  let a = 0, b = 0;
  for (let pass = 0; pass < 4; pass++) {
    const mv = mean(pts.map((p) => p[1])), mu = mean(pts.map((p) => p[0]));
    b = pts.reduce((s, [u, v]) => s + (u - mu) * (v - mv), 0) / pts.reduce((s, [, v]) => s + (v - mv) ** 2, 0);
    a = mu - b * mv;
    pts = P.filter(([u, v]) => Number.isFinite(u) && Math.abs(u - (a + b * v)) < tol);
  }
  return { a, b, n: pts.length };
}
type Line = { a: number; b: number };
/** Where two lines u = a + b·v meet, as (u, v). */
const meet = (l: Line, m: Line): [number, number] => {
  const v = (m.a - l.a) / (l.b - m.b);
  return [l.a + l.b * v, v];
};
const rowsBy = (a: number, b: number, s = 5) => Array.from({ length: Math.floor((b - a) / s) + 1 }, (_, i) => a + s * i);

/** A circle through points, least squares (Kåsa), and the worst point's distance off it. */
function fitCircle(P: [number, number][]): { centre: [number, number]; radius: number; worst: number } {
  let [sx, sy, sxx, syy, sxy, sxz, syz, sz] = [0, 0, 0, 0, 0, 0, 0, 0];
  for (const [x, y] of P) {
    const z = x * x + y * y;
    sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y; sxz += x * z; syz += y * z; sz += z;
  }
  const n = P.length;
  const M = [[sxx, sxy, sx, sxz], [sxy, syy, sy, syz], [sx, sy, n, sz]];
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
 * Detail D's rear mic (the family's re-measurement doesn't read it), at 4800 dpi in Detail D's frame: two concentric
 * circles are drawn there. Each is fitted to its crossings on rays from the dimensioned centre every 2° (clear of the
 * centre lines, within 8° of each axis, and of the Ø0.75 leader and the -33.86 line, which come in from the right at
 * and a little below the centre), each crossing sorted to a circle by its radius (the gap between them, 0.20 mm, is 37 px).
 */
export function micReadings(pdf = PDF): Measured[] {
  const r = detailD, g = render(pdf, r);
  const { out, add } = collector();
  const f = micView.dpi / r.dpi;
  // A pixel at 1200 dpi covers 4 at 4800: its centre is 1.5 in.
  const mc: Calibration = { pxPerMm: r.pxPerMm * f, origin: [(r.origin[0] + r.crop.x) * f + (f - 1) / 2 - micView.crop.x, (r.origin[1] + r.crop.y) * f + (f - 1) / 2 - micView.crop.y] };
  const mg = render(pdf, micView);
  const o = toPx(mc, [rearMic.fromSide.mm, rearMic.fromTop.mm]);
  const rings: [number, number][][] = [[], []];
  for (let a = 0; a < 360; a += 2) {
    if ([0, 90, 180, 270, 360].some((b) => Math.abs(a - b) < 8) || a < 35 || a > 345) continue;
    const t = (a * Math.PI) / 180, d: [number, number] = [Math.cos(t), Math.sin(t)], start = 0.2 * mc.pxPerMm;
    for (const q of runs(mg, [o[0] + d[0] * start, o[1] + d[1] * start], d, Math.round(0.5 * mc.pxPerMm))) {
      const rr = 0.2 + q.at / mc.pxPerMm;
      rings[rr > 0.475 ? 0 : 1].push([rearMic.fromSide.mm + d[0] * rr, rearMic.fromTop.mm + d[1] * rr]);
    }
  }
  const [outer, inner] = rings.map(fitCircle);
  const n = rings.map((p) => p.length);
  add(`rear mic centre across (dimensioned 37.95: the ordinate below Detail D; the inner circle, ${n[1]} crossings)`, rearMic.fromSide.mm, inner.centre[0], 0.05);
  add('rear mic centre down (dimensioned 33.86)', rearMic.fromTop.mm, inner.centre[1], 0.05);
  add(`rear mic Ø (dimensioned 0.75): the inner circle (worst crossing ${inner.worst.toFixed(3)} off)`, rearMic.diameter.mm, 2 * inner.radius, 0.05);
  add(`rear mic's outer circle, where the Ø0.75 leader's arrow stops (${n[0]} crossings; the 14 Pro prints Ø1.15 for it)`, rearMicOuter.mm, 2 * outer.radius, 0.05);
  add('rear mic\'s outer circle concentric (its centre from the inner\'s, mm)', 0, Math.hypot(inner.centre[0] - outer.centre[0], inner.centre[1] - outer.centre[1]), 0.02);
  // The negative control for the printed number: the leader's arrow lands on the outer circle, which is not Ø0.75.
  add('negative control: the outer circle (where the arrow lands) read as the Ø0.75 (1 = over 0.3 mm off it)', 1, Math.abs(2 * outer.radius - rearMic.diameter.mm) > 0.3 ? 1 : 0, 0);
  // Read with the numbers swapped (33.86 across, 37.95 down) the place is on the bump's bare top, below camera 3: no
  // circle of the mic's size is drawn there.
  let swapped = 'none';
  try {
    const w = cleanCircleAt(g, toPx(r, [rearMic.fromTop.mm, rearMic.fromSide.mm]), (rearMicOuter.mm / 2) * r.pxPerMm, [10, -10, 15, -15]);
    swapped = `Ø${(w.diameter / r.pxPerMm).toFixed(2)}`;
  } catch {}
  add(`negative control: at (33.86, 37.95), the numbers swapped, the circle found: ${swapped} (1 = none, or over 0.3 mm off Ø1.15)`, 1, swapped === 'none' || Math.abs(Number(swapped.slice(1)) - rearMicOuter.mm) > 0.3 ? 1 : 0, 0);
  // The bump's top's bottom-right corner: centre (41.56 - 9.67, 42.88 - 9.67); the mic's centre is 6.10 from it, well
  // inside R9.67, so the builder puts it flush on the bump's top.
  const corner: [number, number] = [bump.topFrom.mm + bump.topSize.mm - bump.topRadius.mm, bump.topFrom.mm + bump.topHeight.mm - bump.topRadius.mm];
  add('rear mic inside the bump top\'s R9.67 corner (how far its edge would stand outside it: 0)', 0, Math.max(0, Math.hypot(rearMic.fromSide.mm - corner[0], rearMic.fromTop.mm - corner[1]) - (bump.topRadius.mm - rearMic.diameter.mm / 2)), 0);
  return out;
}

/**
 * Sheet 2's Section J-J (the middle one, on the 32.16 line through the flash), drawn upright: the scale from the cover
 * glass's face (the left edge) to the 12.36 extension line; the 8.35's short extension line under its arrow; the faces
 * on the right (the bump's top, camera 3's ring below) and the phone's top edge; the cone's four lines (the first ink
 * right of a start column, row by row, each fitted), their crossings (the apex, the kinks) and angles; the line closing
 * the hatched keepout; and hand calculations from the printed numbers (the kinks' spread, the inner cone where it
 * leaves the bump's top).
 */
export function sectionReadings(pdf = PDF): Measured[] {
  const r = sectionJJ, k = flashKeepout, g = render(pdf, r);
  const { out, add } = collector();
  const across = (y: number, expect: number) => lineNear(g, [0, y], [1, 0], g.width - 1, expect);
  // Row 250, above the phone's top end and below the 12.36's dimension line (174), crosses only the two extension lines.
  const face = across(250, r.origin[0]);
  const px = (across(250, face + k.transitionFromFront!.mm * r.pxPerMm) - face) / k.transitionFromFront!.mm;
  const mm = (x: number) => (x - face) / px;
  add('Section J-J px/mm (calibration: the cover glass face to the 12.36 line)', r.pxPerMm, px, 0.05);
  add('Section J-J cover glass face (px)', r.origin[0], face, 1);
  add('Section J-J the cover glass face on the phone (row 3000), against the extension line\'s (mm)', 0, mm(across(3000, face)), 0.03);
  // 8.35's short extension line, under its arrow (rows ~1580 to 2010; the dimension line is ~1964).
  add('Section J-J 8.35 extension line, under its arrow (dimensioned)', k.apexFromFront!.mm, mean([1700, 1750, 1900].map((y) => mm(across(y, face + k.apexFromFront!.mm * px)))), 0.03);
  // The phone's top edge, down columns in the body (the section's own datum down: rows are mm from it); left of ~420
  // it rounds into the front.
  const topEdge = mean([450, 550].map((x) => lineNear(g, [x, 0], [0, 1], g.height - 1, r.origin[1])));
  add('Section J-J the phone\'s top edge (px)', r.origin[1], topEdge, 1);
  const down = (y: number) => (y - topEdge) / px;
  // The faces: the bump's top above and below the flash (rows 1300, 1700, 1750: the flash's own face, rows ~1350 to
  // 1650, is drawn 0.09 lower), camera 3's ring (rows 2000, 2200).
  const T = body.thickness.mm, top = T + bump.top.mm, rings = T + bump.rings.mm;
  add(`Section J-J the back glass, 8.25 (drawn ${mm(across(3500, face + T * px)).toFixed(3)}, row 3500, below the bump)`, T, mm(across(3500, face + T * px)), 0.05);
  const plateau = mean([1300, 1700, 1750].map((y) => mm(across(y, face + top * px))));
  const ring = mean([2000, 2200].map((y) => mm(across(y, face + rings * px))));
  add(`Section J-J the bump's top, 8.25 + 2.05 (drawn ${plateau.toFixed(3)})`, top, plateau, 0.05);
  add(`Section J-J camera 3's ring, 8.25 + 3.78 (drawn ${ring.toFixed(3)})`, rings, ring, 0.05);
  // The cone's lines: the first ink right of a start column on each row (inside the cones is hatched, outside white).
  // The inner lines start right of the bump's top; the upper outer right of the 12.36 extension line, the lower outer
  // right of camera 3's ring. The hatch lines meet each cone line and merge with it on some rows: so each row takes the
  // run's outer edge (the white side, left), moved in by half the line's own pen (the median run width).
  const hit = (y: number, x0: number) => {
    const rs = runs(g, [x0, y], [1, 0], g.width - 1 - x0);
    return rs.length ? { edge: x0 + rs[0].at - (rs[0].width - 1) / 2, width: rs[0].width } : { edge: NaN, width: NaN };
  };
  const line = (a: number, b: number, x0: number) => {
    const hs = rowsBy(a, b).map((y) => ({ y, ...hit(y, x0) }));
    const ws = hs.map((h) => h.width).filter(Number.isFinite).sort((p, q) => p - q), pen = ws[Math.floor(ws.length / 2)];
    return fitLine(hs.map((h): [number, number] => [h.edge + (pen - 1) / 2, h.y]));
  };
  const inside = Math.round(face + (top + 0.15) * px);
  const upperOuter = line(650, 1230, Math.round(face + (k.transitionFromFront!.mm + 0.12) * px));
  // The lower inner line from 1690 to 1770: below, it runs into the 8.35's arrow and the hatch (merged runs).
  const upperInner = line(1280, 1390, inside), lowerInner = line(1690, 1770, inside);
  const lowerOuter = line(1850, 2300, Math.round(face + (rings + 0.12) * px));
  const offAxis = (l: Line) => 90 - deg(Math.atan(Math.abs(l.b)));
  const apex = meet(upperInner, lowerInner), kinks = [meet(upperInner, upperOuter), meet(lowerInner, lowerOuter)];
  add(`inner cone's apex from the cover glass (its lines fitted to ${upperInner.n} and ${lowerInner.n} rows, crossed)`, k.apexFromFront!.mm, mm(apex[0]), 0.05);
  kinks.forEach((q, i) => add(`${i ? 'lower' : 'upper'} kink, inner cone to outer, from the cover glass (12.36)`, k.transitionFromFront!.mm, mm(q[0]), 0.05));
  add('inner cone, full angle as drawn (degrees; its lines ~2.5 mm long)', k.inner.mm, offAxis(upperInner) + offAxis(lowerInner), 1);
  add(`outer cone, full angle as drawn (degrees; fitted to ${upperOuter.n} and ${lowerOuter.n} rows)`, k.outer!.mm, offAxis(upperOuter) + offAxis(lowerOuter), 1);
  add('the apex midway between the kinks, down (mm: on the cone\'s axis)', 0, (apex[1] - (kinks[0][1] + kinks[1][1]) / 2) / px, 0.1);
  add('the cone\'s axis (the apex) below the phone\'s top edge, against the flash\'s -10.22 (sheet 1)', flash.fromTop.mm, down(apex[1]), 0.1);
  // The line closing the hatched keepout (undimensioned), rows 1300 and 1600 (between the kinks).
  add('the line closing the hatched keepout, from the cover glass (scaled)', flashKeepoutExtras.drawnTo.mm, mean([1300, 1600].map((y) => mm(across(y, face + flashKeepoutExtras.drawnTo.mm * px)))), 0.03);
  // Hand calculations from the printed numbers alone: the kinks' spread, 2 (12.36 - 8.35) tan 56°; and the inner cone
  // where it leaves the bump's top, 2 (10.30 - 8.35) tan 56° = Ø5.78, inside the flash's Ø6.92: drawn so, by the fitted
  // lines at the bump's top.
  const spread = 2 * (k.transitionFromFront!.mm - k.apexFromFront!.mm) * tanHalf(k.inner.mm);
  add(`kinks' spread, 2 (12.36 - 8.35) tan 56° = ${spread.toFixed(2)}, against the drawn kinks'`, spread, Math.abs(kinks[1][1] - kinks[0][1]) / px, 0.1);
  const atTop = 2 * (top - k.apexFromFront!.mm) * tanHalf(k.inner.mm);
  const xTop = face + top * px, drawnTop = ((xTop - lowerInner.a) / lowerInner.b - (xTop - upperInner.a) / upperInner.b) / px;
  add(`inner cone at the bump's top, 2 (10.30 - 8.35) tan 56° = Ø${atTop.toFixed(2)}, against the drawn lines there`, atTop, drawnTop, 0.1);
  add(`the inner cone at the bump's top against the flash's Ø6.92 (the cone leaves ${((flash.diameter.mm - atTop) / 2).toFixed(2)} inside its edge)`, flash.diameter.mm, atTop, 0.1,
    'the inner cone leaves the bump\'s top 0.57 inside the flash\'s edge all round (the drawn lines agree, line above): the keepout as drawn is narrower than the flash\'s window, as the 14 Pro\'s');
  // The negative controls: read from the back glass, "8.35 to cover glass" would put the apex 0.10 outside the front;
  // and the outer cone's own apex (its lines crossed) isn't the 8.35 origin.
  add('negative control: read from the back glass the apex would be 0.10 outside the front (1 = the drawn lines cross over 5 mm from it)', 1, Math.abs(mm(apex[0]) - (T - k.apexFromFront!.mm)) > 5 ? 1 : 0, 0);
  const outerApex = meet(upperOuter, lowerOuter);
  add(`negative control: the outer cone's own apex (its lines crossed at ${mm(outerApex[0]).toFixed(2)}) isn't the 8.35 origin (1 = over 1 mm apart)`, 1, Math.abs(mm(outerApex[0]) - k.apexFromFront!.mm) > 1 ? 1 : 0, 0);
  return out;
}

/**
 * Sheet 2's MagSafe view, calibrated on its extension lines: across, the 0.00 and 63.16 lines on a row 4.2 above the
 * phone; down, the 0.00 and -112.62 lines on a column 5 left of it. The other dimensioned lines check it. Then the clear
 * area's circle (crossings on rays from its centre, fitted), and the magnetic zone's top and arc.
 */
export function magsafeReadings(pdf = PDF): Measured[] {
  const r = magsafeView, g = render(pdf, r);
  const { out, add } = collector();
  const rowAbove = Math.round(toPx(r, [0, -4.2])[1]), rowBelow = Math.round(toPx(r, [0, 150])[1]);
  const colLeft = Math.round(toPx(r, [-5, 0])[0]), colRight = Math.round(toPx(r, [80.4, 0])[0]);
  const xAt = (row: number, m: number, c: Calibration = r) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(c, [m, 0])[0]);
  const yAt = (col: number, m: number, c: Calibration = r) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(c, [0, m])[1]);
  const { compass, cameraZone } = magsafeExtras;
  const [x0, x1] = [0, compass.fromSide.mm].map((m) => xAt(rowAbove, m));
  const [y0, y1] = [0, magsafe.zoneSidesTo!.mm].map((m) => yAt(colLeft, m));
  const sx = (x1 - x0) / compass.fromSide.mm, sy = (y1 - y0) / magsafe.zoneSidesTo!.mm;
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [x0, y0] };
  const X = (p: number) => (p - cal.origin[0]) / cal.pxPerMm, Y = (p: number) => (p - cal.origin[1]) / cal.pxPerMm;
  add('MagSafe view px/mm across (calibration: the 0.00 and 63.16 lines)', r.pxPerMm, sx, 0.05);
  add('MagSafe view px/mm down (calibration: the 0.00 and -112.62 lines)', r.pxPerMm, sy, 0.05);
  add('MagSafe view datum across (px)', r.origin[0], x0, 1);
  add('MagSafe view datum down (px)', r.origin[1], y0, 1);
  add('MagSafe view 45.22 line across, above (the camera corner\'s edge)', cameraZone.across.mm, X(xAt(rowAbove, cameraZone.across.mm, cal)), 0.03);
  add('MagSafe view 35.30 line across, below (PRODUCT CENTER)', magsafe.fromSide.mm, X(xAt(rowBelow, magsafe.fromSide.mm, cal)), 0.03);
  add('MagSafe view -45.18 line down, left (the zone\'s top)', magsafe.zoneFrom!.mm, Y(yAt(colLeft, magsafe.zoneFrom!.mm, cal)), 0.03);
  add('MagSafe view -7.95 line down, right (the compass)', compass.fromTop.mm, Y(yAt(colRight, compass.fromTop.mm, cal)), 0.03);
  add('MagSafe view -74.98 line down, right (the clear circle\'s centre line)', magsafe.fromTop.mm, Y(yAt(colRight, magsafe.fromTop.mm, cal)), 0.03);
  // The phone's sides at 85 down (the outermost runs): a heavy pen, so the check passes within a stroke, as the
  // family's width checks do.
  const row85 = Math.round(toPx(cal, [0, 85])[1]);
  const sides = [0, body.width.mm].map((m) => {
    const rs = runs(g, [0, row85], [1, 0], g.width - 1), e = toPx(cal, [m, 0])[0];
    return rs.reduce((p, q) => (Math.abs(q.at - e) < Math.abs(p.at - e) ? q : p));
  });
  const stroke = mean(sides.map((q) => q.width)) / cal.pxPerMm;
  add(`the phone's width on the MagSafe view, 85 down (70.60); drawn ${stroke.toFixed(2)} wide`, body.width.mm, X(sides[1].at) - X(sides[0].at), stroke);

  // The clear area's circle: crossings within 0.25 of R28.75 on rays every 5° from its centre, clear of the centre
  // lines (within 6° of each axis) and of the leaders that cross it (Ø57.50's and the clear area's note's, both between
  // 10° and 50°: down is positive), keeping rays with one crossing only (a hatch line meeting the circle gives two).
  const c: [number, number] = [magsafe.fromSide.mm, magsafe.fromTop.mm], R = magsafe.diameter.mm / 2;
  const P: [number, number][] = [];
  for (let a = 0; a < 360; a += 5) {
    if ([0, 90, 180, 270, 360].some((b) => Math.abs(a - b) < 6) || (a > 10 && a < 50)) continue;
    const t = (a * Math.PI) / 180, d: [number, number] = [Math.cos(t), Math.sin(t)];
    const o = toPx(cal, c), start = (R - 1.5) * cal.pxPerMm;
    const rs = runs(g, [o[0] + d[0] * start, o[1] + d[1] * start], d, Math.round(3 * cal.pxPerMm)).map((q) => R - 1.5 + q.at / cal.pxPerMm).filter((x) => Math.abs(x - R) < 0.25);
    if (rs.length === 1) P.push([c[0] + d[0] * rs[0], c[1] + d[1] * rs[0]]);
  }
  const f = fitCircle(P);
  add(`clear area's circle: centre across (fitted to ${P.length} crossings; worst ${f.worst.toFixed(3)} off)`, magsafe.fromSide.mm, f.centre[0], 0.05);
  add('clear area\'s circle: centre down (74.98)', magsafe.fromTop.mm, f.centre[1], 0.05);
  add('clear area\'s circle: Ø (dimensioned 57.50)', magsafe.diameter.mm, 2 * f.radius, 0.05);
  // The negative control: centred on the product centre (73.305, as the 16's), it'd be 1.675 higher.
  add('negative control: the clear circle at the product centre, 146.61 / 2 = 73.305 down (1 = the fitted centre is over 1 mm from it)', 1, Math.abs(f.centre[1] - body.length.mm / 2) > 1 ? 1 : 0, 0);

  // The zone's top: on columns 5 and 7 across, and 40 and 44 (below the crosshatch: a hatch line meets the line on
  // some columns, 38's among them, so two each side, averaged), and 50 and 60 (the open top's), against the printed 45.18.
  const zoneAt = (x: number) => Y(yAt(Math.round(toPx(cal, [x, 0])[0]), magsafe.zoneFrom!.mm, cal));
  add('magnetic zone\'s top below the crosshatch, 5 and 7 across (-45.18)', magsafe.zoneFrom!.mm, mean([5, 7].map(zoneAt)), 0.03);
  add('magnetic zone\'s top below the crosshatch, 40 and 44 across', magsafe.zoneFrom!.mm, mean([40, 44].map(zoneAt)), 0.03);
  for (const x of [50, 60]) add(`magnetic zone's top at ${x} across, the open top`, magsafe.zoneFrom!.mm, zoneAt(x), 0.03);
  // The negative control: Detail D's bump outline ends 46.54 down; this view draws no thin (unhatched-width) line
  // there under the bump's flat bottom (columns 18 to 28: only the zone's 45° hatch, whose runs are wider).
  const pen = runs(g, [Math.round(toPx(cal, [55, 0])[0]), 0], [0, 1], g.height - 1).reduce((p, q) => (Math.abs(Y(q.at) - magsafe.zoneFrom!.mm) < Math.abs(Y(p.at) - magsafe.zoneFrom!.mm) ? q : p)).width;
  const thin = [18, 20, 22, 24, 26, 28].map((x) => runs(g, [Math.round(toPx(cal, [x, 0])[0]), 0], [0, 1], g.height - 1).filter((q) => Math.abs(Y(q.at) - bump.baseFrom.mm - bump.baseHeight.mm) < 0.3 && q.width <= pen + 1).length);
  add(`negative control: thin lines within 0.3 of Detail D's -46.54 under the bump (columns 18 to 28: ${thin.join(', ')}; 1 = none: the zone's top isn't the bump's outline)`, 1, thin.every((n) => n === 0) ? 1 : 0, 0);
  // The crosshatch's right edge at 45.22, rows 15 and 25 down.
  add('the camera corner\'s right edge, 15 and 25 down (45.22)', cameraZone.across.mm, mean([15, 25].map((y) => X(xAt(Math.round(toPx(cal, [0, y])[1]), cameraZone.across.mm, cal)))), 0.03);

  // The arc: its centre derived from the corners and R49.39; its lowest point down columns 0.75 either side of the
  // centre line; its crossings of x = 6, 25, 46 and 66 (clear of the R49.39 leader and the 5 7 note's; at 5 a hatch line
  // merges with the arc), against the
  // circle through (0, 112.62) and (70.60, 112.62).
  const zr = magsafe.zoneRadius!.mm, half = body.width.mm / 2;
  const zc = magsafe.zoneSidesTo!.mm - Math.sqrt(zr * zr - half * half);
  add(`hand calculation: the zone's arc's centre, 112.62 - √(49.39² - 35.30²) = ${zc.toFixed(3)} down, ${(zc - magsafe.fromTop.mm).toFixed(2)} below the clear circle's`, magsafe.fromTop.mm + 3.1, zc, 0.01);
  const low = mean([half - 0.75, half + 0.75].map((x) => Y(yAt(Math.round(toPx(cal, [x, 0])[0]), zc + zr, cal)) + (zr - Math.sqrt(zr * zr - 0.75 * 0.75))));
  add(`magnetic zone's arc, its lowest point (centre ${zc.toFixed(2)} down, derived, + R49.39)`, zc + zr, low, 0.05);
  for (const x of [6, 25, 46, 66]) {
    const at = zc + Math.sqrt(zr * zr - (x - half) ** 2);
    add(`magnetic zone's arc at x = ${x} (${at.toFixed(2)})`, at, Y(yAt(Math.round(toPx(cal, [x, 0])[0]), at, cal)), 0.05);
  }
  // The negative control: R49.39 centred on the clear circle's centre would bottom out 3.10 higher.
  add(`negative control: centred on the clear circle, R49.39's lowest point would be ${(magsafe.fromTop.mm + zr).toFixed(2)} (1 = the drawn one is over 2 mm lower)`, 1, low - (magsafe.fromTop.mm + zr) > 2 ? 1 : 0, 0);
  return out;
}

export const remeasure = (pdf = PDF): Measured[] => [
  ...family(phone, { back: detailD, front: frontView, bottom: bottomView }, pdf, {}),
  ...micReadings(pdf),
  ...sectionReadings(pdf),
  ...magsafeReadings(pdf),
];

export const hasPdf = () => existsSync(PDF);

if (import.meta.main) console.log(report(remeasure()));
