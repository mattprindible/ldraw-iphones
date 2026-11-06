// Re-measures every scaled value in drawing.ts from the PDF (the family's procedures, iphone/measure.ts), and checks
// the rear mic, the flash's keepout section (Section H-H) and MagSafe's keepouts against what the drawing draws (as the
// 15 Pro's measure.ts, whose sheets are drawn on the same plan).
//
//   node iphone-15-pro-max/measure.ts   → a table: recorded, measured, the difference
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { remeasure as family, report, type Measured } from '../../measure.ts';
import { cleanCircleAt, lineNear, render, runs, toPx, type Calibration } from '../../../src/raster.ts';
import { body, bottomView, bump, detailA, flash, flashKeepout, flashKeepoutExtras, frontView, magsafe, magsafeExtras, magsafeView, micView, phone, rearMic, rearMicOuter, sectionHH } from './drawing.ts';

export const PDF = join(import.meta.dirname, '..', '..', 'drawings', 'iphone-15-pro-max.pdf');

const mean = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length;
const deg = (rad: number) => (rad * 180) / Math.PI;
const tanHalf = (fullDeg: number) => Math.tan((fullDeg / 2) * (Math.PI / 180));
function collector() {
  const out: Measured[] = [];
  const add = (name: string, recorded: number, measured: number, within: number, known?: string, kind: Measured['kind'] = 'check') => out.push({ name, kind, recorded, measured, within, ...(known ? { known } : {}) });
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
 * Detail A's rear mic (the family's re-measurement doesn't read it), at 4800 dpi in Detail A's frame: two concentric
 * circles are drawn there. Each is fitted to its crossings on rays from the dimensioned centre every 2° (clear of the
 * centre lines, within 8° of each axis, and of the Ø0.75 leader and the -33.86 line, which come in from the right at
 * and a little below the centre), each crossing sorted to a circle by its radius (the gap between them, 0.20 mm, is 37 px).
 */
export function micReadings(pdf = PDF): Measured[] {
  const r = detailA, g = render(pdf, r);
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
  add(`rear mic centre across (dimensioned 37.95: the ordinate below Detail A; the inner circle, ${n[1]} crossings)`, rearMic.fromSide.mm, inner.centre[0], 0.05);
  add('rear mic centre down (dimensioned 33.86)', rearMic.fromTop.mm, inner.centre[1], 0.05);
  add(`rear mic Ø (dimensioned 0.75): the inner circle (worst crossing ${inner.worst.toFixed(3)} off)`, rearMic.diameter.mm, 2 * inner.radius, 0.05);
  add(`rear mic's outer circle, where the Ø0.75 leader's arrow stops (${n[0]} crossings; the 14 Pro prints Ø1.15 for it)`, rearMicOuter.mm, 2 * outer.radius, 0.05, undefined, 'scaled');
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
  // The bump's top's bottom-right corner: centre (41.56 - 9.68, 42.88 - 9.68); the mic's centre is 6.10 from it, well
  // inside R9.68, so the builder puts it flush on the bump's top.
  const corner: [number, number] = [bump.topFrom.mm + bump.topSize.mm - bump.topRadius.mm, bump.topFrom.mm + bump.topHeight.mm - bump.topRadius.mm];
  add('rear mic inside the bump top\'s R9.68 corner (how far its edge would stand outside it: 0)', 0, Math.max(0, Math.hypot(rearMic.fromSide.mm - corner[0], rearMic.fromTop.mm - corner[1]) - (bump.topRadius.mm - rearMic.diameter.mm / 2)), 0);
  return out;
}

/**
 * Sheet 2's Section H-H (the middle one, on the 32.16 line through the flash and camera 3), drawn upright: the scale
 * from the cover glass's face (the left edge) to the 12.36 extension line; the 8.35's short extension line under its
 * arrow; the faces on the right (the bump's top, camera 3's ring below, the bump's foot) and the phone's top edge; the
 * cone's four lines (the first ink right of a start column, row by row, each fitted), their crossings (the apex, the
 * kinks) and angles; the line closing the hatched keepout; and hand calculations from the printed numbers (the kinks'
 * spread, the inner cone where it leaves the bump's top).
 */
export function sectionReadings(pdf = PDF): Measured[] {
  const r = sectionHH, k = flashKeepout, g = render(pdf, r);
  const { out, add } = collector();
  const across = (y: number, expect: number) => lineNear(g, [0, y], [1, 0], g.width - 1, expect);
  // Row 900, below the 12.36's dimension line (787) and above the phone's top end (1134), crosses the two extension
  // lines (and, right of them, the outer cone's upper line and the line closing the keepout).
  const face = across(900, r.origin[0]);
  const px = (across(900, face + k.transitionFromFront!.mm * r.pxPerMm) - face) / k.transitionFromFront!.mm;
  const mm = (x: number) => (x - face) / px;
  add('Section H-H px/mm (calibration: the cover glass face to the 12.36 line)', r.pxPerMm, px, 0.05);
  add('Section H-H cover glass face (px)', r.origin[0], face, 1);
  add('Section H-H the cover glass face on the phone (row 3000), against the extension line\'s (mm)', 0, mm(across(3000, face)), 0.03);
  // 8.35's short extension line, under its arrow (rows ~1640 to 2220).
  add('Section H-H 8.35 extension line, under its arrow (dimensioned)', k.apexFromFront!.mm, mean([1700, 1900, 2000].map((y) => mm(across(y, face + k.apexFromFront!.mm * px)))), 0.03);
  // The phone's top edge, down columns in the body (the section's own datum down: rows are mm from it).
  const topEdge = mean([450, 550].map((x) => lineNear(g, [x, 0], [0, 1], g.height - 1, r.origin[1])));
  add('Section H-H the phone\'s top edge (px)', r.origin[1], topEdge, 1);
  const down = (y: number) => (y - topEdge) / px;
  // The faces: the bump's top above and below the flash (rows 1400, 1800: the flash's own face, rows ~1460 to 1700, is
  // drawn 0.09 lower) and below camera 3 (2700, 3000); camera 3's ring (rows 2100, 2300). The section stops at the
  // bump's foot: its fillet's last rows (3270 to 3285) reach the back glass's plane.
  const T = body.thickness.mm, top = T + bump.top.mm, rings = T + bump.rings.mm;
  const foot = Math.min(...rowsBy(3270, 3285, 1).map((y) => mm(across(y, face + T * px))));
  add(`Section H-H the bump's foot on the back glass, 8.25 (drawn ${foot.toFixed(3)}: the fillet's lowest rows; the section draws no back glass beyond the bump)`, T, foot, 0.05);
  const plateau = mean([1400, 1800, 2700, 3000].map((y) => mm(across(y, face + top * px))));
  const ring = mean([2100, 2300].map((y) => mm(across(y, face + rings * px))));
  add(`Section H-H the bump's top, 8.25 + 2.05 (drawn ${plateau.toFixed(3)})`, top, plateau, 0.05);
  add(`Section H-H camera 3's ring, 8.25 + 4.07 (drawn ${ring.toFixed(3)})`, rings, ring, 0.05);
  // The cone's lines: the first ink right of a start column on each row (inside the cones is hatched, outside white).
  // The inner lines start right of the bump's top; the outer right of the 12.36 extension line and camera 3's ring
  // (12.33: 0.04 inside the transition). The hatch lines meet each cone line and merge with it on some rows: so each
  // row takes the run's outer edge (the white side, left), moved in by half the line's own pen (the median run width).
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
  const upperOuter = line(650, 1250, Math.round(face + (k.transitionFromFront!.mm + 0.12) * px));
  // The inner lines right of the bump's top only: the upper from 1345 to 1445, the lower from 1770 to 1850 (below, it
  // meets the ring's step, ~1860).
  const upperInner = line(1345, 1445, inside), lowerInner = line(1770, 1850, inside);
  const lowerOuter = line(1950, 2350, Math.round(face + (rings + 0.12) * px));
  const offAxis = (l: Line) => 90 - deg(Math.atan(Math.abs(l.b)));
  const apex = meet(upperInner, lowerInner), kinks = [meet(upperInner, upperOuter), meet(lowerInner, lowerOuter)];
  add(`inner cone's apex from the cover glass (its lines fitted to ${upperInner.n} and ${lowerInner.n} rows, crossed)`, k.apexFromFront!.mm, mm(apex[0]), 0.05);
  kinks.forEach((q, i) => add(`${i ? 'lower' : 'upper'} kink, inner cone to outer, from the cover glass (12.36)`, k.transitionFromFront!.mm, mm(q[0]), 0.05));
  add('inner cone, full angle as drawn (degrees; its lines ~2 mm long)', k.inner.mm, offAxis(upperInner) + offAxis(lowerInner), 1);
  add(`outer cone, full angle as drawn (degrees; fitted to ${upperOuter.n} and ${lowerOuter.n} rows)`, k.outer!.mm, offAxis(upperOuter) + offAxis(lowerOuter), 1);
  add('the apex midway between the kinks, down (mm: on the cone\'s axis)', 0, (apex[1] - (kinks[0][1] + kinks[1][1]) / 2) / px, 0.1);
  add('the cone\'s axis (the apex) below the phone\'s top edge, against the flash\'s -10.22 (sheet 1)', flash.fromTop.mm, down(apex[1]), 0.1);
  // The line closing the hatched keepout (undimensioned), rows 1300 and 1600 (between the kinks).
  add('the line closing the hatched keepout, from the cover glass (scaled)', flashKeepoutExtras.drawnTo.mm, mean([1300, 1600].map((y) => mm(across(y, face + flashKeepoutExtras.drawnTo.mm * px)))), 0.03, undefined, 'scaled');
  // Hand calculations from the printed numbers alone: the kinks' spread, 2 (12.36 - 8.35) tan 56°; and the inner cone
  // where it leaves the bump's top, 2 (10.30 - 8.35) tan 56° = Ø5.78, inside the flash's Ø6.90: drawn so, by the fitted
  // lines at the bump's top.
  const spread = 2 * (k.transitionFromFront!.mm - k.apexFromFront!.mm) * tanHalf(k.inner.mm);
  add(`kinks' spread, 2 (12.36 - 8.35) tan 56° = ${spread.toFixed(2)}, against the drawn kinks'`, spread, Math.abs(kinks[1][1] - kinks[0][1]) / px, 0.1);
  const atTop = 2 * (top - k.apexFromFront!.mm) * tanHalf(k.inner.mm);
  const xTop = face + top * px, drawnTop = ((xTop - lowerInner.a) / lowerInner.b - (xTop - upperInner.a) / upperInner.b) / px;
  add(`inner cone at the bump's top, 2 (10.30 - 8.35) tan 56° = Ø${atTop.toFixed(2)}, against the drawn lines there`, atTop, drawnTop, 0.1);
  add(`the inner cone at the bump's top against the flash's Ø6.90 (the cone leaves ${((flash.diameter.mm - atTop) / 2).toFixed(2)} inside its edge)`, flash.diameter.mm, atTop, 0.1,
    'the inner cone leaves the bump\'s top 0.56 inside the flash\'s edge all round (the drawn lines agree, line above): the keepout as drawn is narrower than the flash\'s window, as the 15 Pro\'s and 14 Pro\'s');
  // The negative controls: read from the back glass, "8.35 to cover glass" would put the apex 0.10 outside the front;
  // and the outer cone's own apex (its lines crossed) isn't the 8.35 origin.
  add('negative control: read from the back glass the apex would be 0.10 outside the front (1 = the drawn lines cross over 5 mm from it)', 1, Math.abs(mm(apex[0]) - (T - k.apexFromFront!.mm)) > 5 ? 1 : 0, 0);
  const outerApex = meet(upperOuter, lowerOuter);
  add(`negative control: the outer cone's own apex (its lines crossed at ${mm(outerApex[0]).toFixed(2)}) isn't the 8.35 origin (1 = over 1 mm apart)`, 1, Math.abs(mm(outerApex[0]) - k.apexFromFront!.mm) > 1 ? 1 : 0, 0);
  // The kink isn't the lens rings' top: 12.36 is 0.04 beyond 12.32, too close to tell apart by the kinks (±0.05), so the
  // control is the other way round: the transition, read as the bump's top (10.30), would miss the kinks by 2.
  add('negative control: the kinks read against the bump\'s top, 10.30 (1 = over 1 mm off it)', 1, kinks.every((q) => Math.abs(mm(q[0]) - top) > 1) ? 1 : 0, 0);
  return out;
}

/**
 * Sheet 2's MagSafe view, calibrated on its extension lines: across, the 0.00 and 45.22 lines on a row 6 above the
 * phone; down, the 0.00 and -114.87 lines on a column 9 left of it. The other dimensioned lines check it (38.37 and
 * 58.06 below the phone, -79.93 and -153.94 right of it). Then the clear area's circle (crossings on rays from its
 * centre, fitted), and the magnetic zone's top (undimensioned: scaled) and arc.
 */
export function magsafeReadings(pdf = PDF): Measured[] {
  const r = magsafeView, g = render(pdf, r);
  const { out, add } = collector();
  const rowAbove = Math.round(toPx(r, [0, -6.2])[1]), rowBelow = Math.round(toPx(r, [0, 164])[1]);
  const colLeft = Math.round(toPx(r, [-12, 0])[0]), colRight = Math.round(toPx(r, [81.4, 0])[0]);
  const xAt = (row: number, m: number, c: Calibration = r) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(c, [m, 0])[0]);
  const yAt = (col: number, m: number, c: Calibration = r) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(c, [0, m])[1]);
  const { compass, cameraZone } = magsafeExtras;
  const [x0, x1] = [0, cameraZone.across.mm].map((m) => xAt(rowAbove, m));
  const [y0, y1] = [0, magsafe.zoneSidesTo!.mm].map((m) => yAt(colLeft, m));
  const sx = (x1 - x0) / cameraZone.across.mm, sy = (y1 - y0) / magsafe.zoneSidesTo!.mm;
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [x0, y0] };
  const X = (p: number) => (p - cal.origin[0]) / cal.pxPerMm, Y = (p: number) => (p - cal.origin[1]) / cal.pxPerMm;
  add('MagSafe view px/mm across (calibration: the 0.00 and 45.22 lines)', r.pxPerMm, sx, 0.05);
  add('MagSafe view px/mm down (calibration: the 0.00 and -114.87 lines)', r.pxPerMm, sy, 0.05);
  add('MagSafe view datum across (px)', r.origin[0], x0, 1);
  add('MagSafe view datum down (px)', r.origin[1], y0, 1);
  add('MagSafe view 38.37 line across, below (PRODUCT CENTER)', magsafe.fromSide.mm, X(xAt(rowBelow, magsafe.fromSide.mm, cal)), 0.03);
  add('MagSafe view 58.06 line across, below (the compass)', compass.fromSide.mm, X(xAt(rowBelow, compass.fromSide.mm, cal)), 0.03);
  add('MagSafe view -79.93 line down, right (PRODUCT CENTER: the clear circle\'s centre line)', magsafe.fromTop.mm, Y(yAt(colRight, magsafe.fromTop.mm, cal)), 0.03);
  add('MagSafe view -153.94 line down, right (the compass)', compass.fromTop.mm, Y(yAt(colRight, compass.fromTop.mm, cal)), 0.03);
  // The phone's sides at 85 down (the outermost runs): a heavy pen, so the check passes within a stroke, as the
  // family's width checks do.
  const row85 = Math.round(toPx(cal, [0, 85])[1]);
  const sides = [0, body.width.mm].map((m) => {
    const rs = runs(g, [0, row85], [1, 0], g.width - 1), e = toPx(cal, [m, 0])[0];
    return rs.reduce((p, q) => (Math.abs(q.at - e) < Math.abs(p.at - e) ? q : p));
  });
  const stroke = mean(sides.map((q) => q.width)) / cal.pxPerMm;
  add(`the phone's width on the MagSafe view, 85 down (76.73); drawn ${stroke.toFixed(2)} wide`, body.width.mm, X(sides[1].at) - X(sides[0].at), stroke);

  // The clear area's circle: crossings within 0.25 of R28.75 on rays every 5° from its centre, clear of the centre
  // lines (within 6° of each axis) and of the leaders that cross it (the 5 note's, near 20°, and Ø57.50's, near 165°:
  // down is positive), keeping rays with one crossing only (a hatch line meeting the circle gives two).
  const c: [number, number] = [magsafe.fromSide.mm, magsafe.fromTop.mm], R = magsafe.diameter.mm / 2;
  const P: [number, number][] = [];
  for (let a = 0; a < 360; a += 5) {
    if ([0, 90, 180, 270, 360].some((b) => Math.abs(a - b) < 6) || (a > 5 && a < 40) || (a > 150 && a < 180)) continue;
    const t = (a * Math.PI) / 180, d: [number, number] = [Math.cos(t), Math.sin(t)];
    const o = toPx(cal, c), start = (R - 1.5) * cal.pxPerMm;
    const rs = runs(g, [o[0] + d[0] * start, o[1] + d[1] * start], d, Math.round(3 * cal.pxPerMm)).map((q) => R - 1.5 + q.at / cal.pxPerMm).filter((x) => Math.abs(x - R) < 0.25);
    if (rs.length === 1) P.push([c[0] + d[0] * rs[0], c[1] + d[1] * rs[0]]);
  }
  const f = fitCircle(P);
  add(`clear area's circle: centre across (fitted to ${P.length} crossings; worst ${f.worst.toFixed(3)} off)`, magsafe.fromSide.mm, f.centre[0], 0.05);
  add('clear area\'s circle: centre down (79.93)', magsafe.fromTop.mm, f.centre[1], 0.05);
  add('clear area\'s circle: Ø (dimensioned 57.50)', magsafe.diameter.mm, 2 * f.radius, 0.05);
  // The negative control: placed as the 15 Pro's, 1.675 below the product centre, it'd be 81.605 down.
  add('negative control: the clear circle 1.675 below the product centre, as the 15 Pro\'s (1 = the fitted centre is over 1 mm from 81.605)', 1, Math.abs(f.centre[1] - (body.length.mm / 2 + 1.675)) > 1 ? 1 : 0, 0);

  // The zone's top, undimensioned: down columns 3 to 7 across and 40 to 44 (under the crosshatch, either side of the
  // bump's outline), and 50 to 74 (the open top), against the scaled 46.76. Under the bump (20 and 30 across) it merges
  // with the bump outline's line into one 16 px run: not used.
  const zoneAt = (x: number) => Y(yAt(Math.round(toPx(cal, [x, 0])[0]), magsafe.zoneFrom!.mm, cal));
  add('magnetic zone\'s top below the crosshatch, 3, 5 and 7 across (scaled, undimensioned)', magsafe.zoneFrom!.mm, mean([3, 5, 7].map(zoneAt)), 0.03, undefined, 'scaled');
  add('magnetic zone\'s top below the crosshatch, 40 and 44 across', magsafe.zoneFrom!.mm, mean([40, 44].map(zoneAt)), 0.03);
  for (const x of [50, 60, 74]) add(`magnetic zone's top at ${x} across, the open top`, magsafe.zoneFrom!.mm, zoneAt(x), 0.03);
  // Against Detail A's bump outline, 46.54: the zone's top is drawn 0.22 below it, and the merged run under the bump
  // (columns 20 to 30) is centred between the two lines and wider than one pen.
  const pen = runs(g, [Math.round(toPx(cal, [55, 0])[0]), 0], [0, 1], g.height - 1).reduce((p, q) => (Math.abs(Y(q.at) - magsafe.zoneFrom!.mm) < Math.abs(Y(p.at) - magsafe.zoneFrom!.mm) ? q : p)).width;
  const outline = bump.baseFrom.mm + bump.baseHeight.mm;
  const merged = [20, 24, 30].map((x) => runs(g, [Math.round(toPx(cal, [x, 0])[0]), 0], [0, 1], g.height - 1).reduce((p, q) => (Math.abs(Y(q.at) - outline) < Math.abs(Y(p.at) - outline) ? q : p)));
  add(`under the bump (20, 24, 30 across) one run holds the bump's outline (46.54) and the zone's top: centred between them (widths ${merged.map((q) => q.width).join(', ')} px, the open top's pen ${pen})`, (outline + magsafe.zoneFrom!.mm) / 2, mean(merged.map((q) => Y(q.at))), 0.03);
  add('negative control: the zone\'s top read as Detail A\'s bump outline, 46.54 (1 = the open top\'s line is over 0.15 from it)', 1, Math.abs(zoneAt(60) - outline) > 0.15 ? 1 : 0, 0);
  // The crosshatch's right edge at 45.22, rows 15 and 25 down.
  add('the camera corner\'s right edge, 15 and 25 down (45.22)', cameraZone.across.mm, mean([15, 25].map((y) => X(xAt(Math.round(toPx(cal, [0, y])[1]), cameraZone.across.mm, cal)))), 0.03);

  // The arc: its centre derived from the corners and R51.89; its lowest point down columns 0.75 either side of the
  // centre line; its crossings of x = 10, 25, 50 and 66 (clear of the R51.89 leader, near 5, and the 5 7 note's, which
  // ends near 57 across, 117 down, above the arc), against the circle through (0, 114.87) and (76.73, 114.87).
  const zr = magsafe.zoneRadius!.mm, half = body.width.mm / 2;
  const zc = magsafe.zoneSidesTo!.mm - Math.sqrt(zr * zr - half * half);
  add(`hand calculation: the zone's arc's centre, 114.87 - √(51.89² - 38.365²) = ${zc.toFixed(3)} down, on the product centre (79.93)`, body.length.mm / 2, zc, 0.01);
  const low = mean([half - 0.75, half + 0.75].map((x) => Y(yAt(Math.round(toPx(cal, [x, 0])[0]), zc + zr, cal)) + (zr - Math.sqrt(zr * zr - 0.75 * 0.75))));
  add(`magnetic zone's arc, its lowest point (centre ${zc.toFixed(2)} down, derived, + R51.89)`, zc + zr, low, 0.05);
  for (const x of [10, 25, 50, 66]) {
    const at = zc + Math.sqrt(zr * zr - (x - half) ** 2);
    add(`magnetic zone's arc at x = ${x} (${at.toFixed(2)})`, at, Y(yAt(Math.round(toPx(cal, [x, 0])[0]), at, cal)), 0.05);
  }
  // The negative control: the 15 Pro's R49.39 through the same corners would be centred 3.21 lower (83.77) and bottom
  // out 1.34 lower.
  const r15 = 49.39, low15 = magsafe.zoneSidesTo!.mm - Math.sqrt(r15 * r15 - half * half) + r15;
  add(`negative control: R49.39 (the 15 Pro's) through the same corners would bottom out at ${low15.toFixed(2)} (1 = the drawn one is over 0.5 mm from it)`, 1, Math.abs(low - low15) > 0.5 ? 1 : 0, 0);
  return out;
}

export const remeasure = (pdf = PDF): Measured[] => [
  ...family(phone, { back: detailA, front: frontView, bottom: bottomView }, pdf, {}),
  ...micReadings(pdf),
  ...sectionReadings(pdf),
  ...magsafeReadings(pdf),
];

export const hasPdf = () => existsSync(PDF);

if (import.meta.main) console.log(report(remeasure()));
