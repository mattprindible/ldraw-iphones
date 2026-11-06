// Re-measures every scaled value in drawing.ts from the PDF (the family's procedures, iphone/measure.ts), and checks
// the rear mic, the flash's keepout section (Detail H) and MagSafe's keepouts against what the drawing draws.
//
//   node iphone-14-pro/measure.ts   → a table: recorded, measured, the difference
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { remeasure as family, report, type Measured } from '../../measure.ts';
import { cleanCircleAt, lineNear, render, runs, toPx, type Calibration } from '../../../src/raster.ts';
import { body, bottomView, bump, cameras, detailD, detailH, flash, flashKeepout, frontView, magsafe, magsafeExtras, magsafeView, micView, phone, rearMic } from './drawing.ts';

export const PDF = join(import.meta.dirname, '..', '..', 'drawings', 'iphone-14-pro.pdf');

// Helpers for the checks below (as the 14's and 12 Pro's measure.ts).
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
 * centre lines, within 8° of each axis, and of the Ø1.15 leader and the -33.98 line, which come in from the right a
 * little below the centre), each crossing sorted to a circle by its radius (the gap between them, 0.20 mm, is 37 px).
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
  add(`rear mic centre across (dimensioned 37.91: the ordinate below Detail D; the outer circle, ${n[0]} crossings)`, rearMic.fromSide.mm, outer.centre[0], 0.05);
  add('rear mic centre down (dimensioned 33.98)', rearMic.fromTop.mm, outer.centre[1], 0.05);
  add(`rear mic Ø (dimensioned 1.15): the outer circle, where its leader's arrow lands (worst crossing ${outer.worst.toFixed(3)} off)`, rearMic.diameter.mm, 2 * outer.radius, 0.05);
  add(`rear mic's inner circle concentric (its centre from the outer's, mm; ${n[1]} crossings, drawn Ø${(2 * inner.radius).toFixed(2)})`, 0, Math.hypot(inner.centre[0] - outer.centre[0], inner.centre[1] - outer.centre[1]), 0.02);
  // Read with the numbers swapped (33.98 across, 37.91 down) the place is on the bump's bare top, below camera 3: no
  // Ø1.15 circle is drawn there.
  let swapped = 'none';
  try {
    const w = cleanCircleAt(g, toPx(r, [rearMic.fromTop.mm, rearMic.fromSide.mm]), (rearMic.diameter.mm / 2) * r.pxPerMm, [10, -10, 15, -15]);
    swapped = `Ø${(w.diameter / r.pxPerMm).toFixed(2)}`;
  } catch {}
  add(`negative control: at (33.98, 37.91), the numbers swapped, the circle found: ${swapped} (1 = none, or over 0.3 mm off Ø1.15)`, 1, swapped === 'none' || Math.abs(Number(swapped.slice(1)) - rearMic.diameter.mm) > 0.3 ? 1 : 0, 0);
  // The bump's top's bottom-right corner: centre (41.52 - 9.70, 43.01 - 9.70); the mic's centre is 6.13 from it, well
  // inside R9.70, so the builder puts it flush on the bump's top.
  const corner: [number, number] = [bump.topFrom.mm + bump.topSize.mm - bump.topRadius.mm, bump.topFrom.mm + bump.topHeight.mm - bump.topRadius.mm];
  add('rear mic inside the bump top\'s R9.70 corner (how far its edge would stand outside it: 0)', 0, Math.max(0, Math.hypot(rearMic.fromSide.mm - corner[0], rearMic.fromTop.mm - corner[1]) - (bump.topRadius.mm - rearMic.diameter.mm / 2)), 0);
  return out;
}

/**
 * Sheet 2's Detail H (the section on the 32.12 line, through the flash), drawn upright: the scale from the cover glass's
 * face (the left edge) to the 11.76 extension line; the 7.74's short extension line under its arrow; the faces on the
 * right (the bump's top, camera 3's ring below) and the phone's top edge; the cone's four lines (the first ink right of
 * a start column, row by row, each fitted), their crossings (the apex, the kinks) and angles; and hand calculations
 * from the printed numbers (the kinks' spread, the inner cone where it leaves the bump's top).
 */
export function sectionReadings(pdf = PDF): Measured[] {
  const r = detailH, k = flashKeepout, g = render(pdf, r);
  const { out, add } = collector();
  const across = (y: number, expect: number) => lineNear(g, [0, y], [1, 0], g.width - 1, expect);
  // Row 150, above the phone's top end and the 11.76's dimension line (188), crosses only the extension lines (and the
  // outer cone's line beyond them).
  const face = across(150, r.origin[0]);
  const px = (across(150, face + k.transitionFromFront!.mm * r.pxPerMm) - face) / k.transitionFromFront!.mm;
  const mm = (x: number) => (x - face) / px;
  add('Detail H px/mm (calibration: the cover glass face to the 11.76 line)', r.pxPerMm, px, 0.05);
  add('Detail H cover glass face (px)', r.origin[0], face, 1);
  add('Detail H the cover glass face on the phone (row 2500), against the extension line\'s (mm)', 0, mm(across(2500, face)), 0.03);
  // 7.74's short extension line under its arrowhead (rows ~1465 to 1500; the dimension line is ~1455).
  add('Detail H 7.74 extension line, under its arrow (dimensioned)', k.apexFromFront!.mm, mm(across(1485, face + k.apexFromFront!.mm * px)), 0.03);
  // The phone's top edge, down columns in the body (the section's own datum down: rows are mm from it).
  const topEdge = mean([350, 450].map((x) => lineNear(g, [x, 0], [0, 1], g.height - 1, r.origin[1])));
  add('Detail H the phone\'s top edge (px)', r.origin[1], topEdge, 1);
  const down = (y: number) => (y - topEdge) / px;
  // The faces: the bump's top above and below the cone (rows 1210, 2600, 2800, 2900: above ~1190 its edge rounds toward
  // the phone's top), camera 3's ring (rows 1950, 2100: on
  // the 32.12 line, its centre line).
  const T = body.thickness.mm, top = T + bump.top.mm, rings = T + bump.rings.mm;
  const glass = mean([1210, 2600, 2800, 2900].map((y) => mm(across(y, face + top * px))));
  const ring = mean([1950, 2100].map((y) => mm(across(y, face + rings * px))));
  add(`Detail H the bump's top, 7.85 + 1.85 (drawn ${glass.toFixed(3)})`, top, glass, 0.05);
  add(`Detail H camera 3's ring, 7.85 + 4.18 (drawn ${ring.toFixed(3)})`, rings, ring, 0.05);
  // The cone's lines: the first ink right of a start column on each row (inside the cone is hatched, outside white).
  // The inner lines start right of the bump's top; the upper outer right of the 11.76 extension line, the lower outer
  // right of camera 3's ring (which stands right of that line from ~1775 down). The hatch lines meet each cone line and
  // merge with it on some rows, pulling the run's middle inward: so each row takes the run's outer edge (the white
  // side), moved in by half the line's own pen (the median run width).
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
  const upperOuter = line(250, 1100, Math.round(face + (k.transitionFromFront!.mm + 0.12) * px));
  const upperInner = line(1170, 1280, inside), lowerInner = line(1600, 1700, inside);
  const lowerOuter = line(1850, 2350, Math.round(face + (rings + 0.12) * px));
  const offAxis = (l: Line) => 90 - deg(Math.atan(Math.abs(l.b)));
  const apex = meet(upperInner, lowerInner), kinks = [meet(upperInner, upperOuter), meet(lowerInner, lowerOuter)];
  add(`inner cone's apex from the cover glass (its lines fitted to ${upperInner.n} and ${lowerInner.n} rows, crossed)`, k.apexFromFront!.mm, mm(apex[0]), 0.05);
  kinks.forEach((q, i) => add(`${i ? 'lower' : 'upper'} kink, inner cone to outer, from the cover glass (11.76)`, k.transitionFromFront!.mm, mm(q[0]), 0.05));
  add(`inner cone, full angle as drawn (degrees; its lines ~2.5 mm long)`, k.inner.mm, offAxis(upperInner) + offAxis(lowerInner), 1);
  add(`outer cone, full angle as drawn (degrees; fitted to ${upperOuter.n} and ${lowerOuter.n} rows)`, k.outer!.mm, offAxis(upperOuter) + offAxis(lowerOuter), 1);
  add('the apex midway between the kinks, down (mm: on the cone\'s axis)', 0, (apex[1] - (kinks[0][1] + kinks[1][1]) / 2) / px, 0.1);
  add('the cone\'s axis (the apex) below the phone\'s top edge, against the flash\'s -10.32 (sheet 1)', flash.fromTop.mm, down(apex[1]), 0.1);
  // Hand calculations from the printed numbers alone: the kinks' spread, 2 (11.76 - 7.74) tan 56°; and the inner cone
  // where it leaves the bump's top, 2 (9.70 - 7.74) tan 56° = Ø5.81, inside the flash's Ø6.90 (the 12 Pro's meets its
  // flash's edge): drawn so, by the fitted lines at the bump's top.
  const spread = 2 * (k.transitionFromFront!.mm - k.apexFromFront!.mm) * tanHalf(k.inner.mm);
  add(`kinks' spread, 2 (11.76 - 7.74) tan 56° = ${spread.toFixed(2)}, against the drawn kinks'`, spread, Math.abs(kinks[1][1] - kinks[0][1]) / px, 0.1);
  const atTop = 2 * (top - k.apexFromFront!.mm) * tanHalf(k.inner.mm);
  const xTop = face + top * px, drawnTop = ((xTop - lowerInner.a) / lowerInner.b - (xTop - upperInner.a) / upperInner.b) / px;
  add(`inner cone at the bump's top, 2 (9.70 - 7.74) tan 56° = Ø${atTop.toFixed(2)}, against the drawn lines there`, atTop, drawnTop, 0.1);
  add(`the inner cone at the bump's top against the flash's Ø6.90 (the cone leaves ${((flash.diameter.mm - atTop) / 2).toFixed(2)} inside its edge)`, flash.diameter.mm, atTop, 0.1,
    'the inner cone leaves the bump\'s top 0.54 inside the flash\'s edge all round (the drawn lines agree, line above): the keepout as drawn is narrower than the flash\'s window, unlike the 12 Pro\'s');
  // The negative controls: read from the back glass, "7.74 to cover glass" would put the apex 0.11 from the front and
  // the transition at 7.85 - 11.76, outside the front; and the outer cone's kinks read as its apex would leave the
  // drawn outer lines' crossing far out.
  add('negative control: read from the back glass the apex would be 0.11 from the front (1 = the drawn lines cross over 5 mm from it)', 1, Math.abs(mm(apex[0]) - (T - k.apexFromFront!.mm)) > 5 ? 1 : 0, 0);
  const outerApex = meet(upperOuter, lowerOuter);
  add(`negative control: the outer cone's own apex (its lines crossed at ${mm(outerApex[0]).toFixed(2)}) isn't the 7.74 origin (1 = over 1 mm apart)`, 1, Math.abs(mm(outerApex[0]) - k.apexFromFront!.mm) > 1 ? 1 : 0, 0);
  return out;
}

/**
 * Sheet 2's MagSafe view, calibrated on its extension lines: across, the 0.00 and 65.04 lines on a row 4.2 above the
 * phone; down, the 0.00 and -112.57 lines on a column 5 left of it. The other dimensioned lines check it (the mic's
 * 37.91 and -33.98 among them). Then the clear area's circle (crossings on rays from its centre, fitted), and the
 * magnetic zone's top and arc.
 */
export function magsafeReadings(pdf = PDF): Measured[] {
  const r = magsafeView, g = render(pdf, r);
  const { out, add } = collector();
  const rowAbove = Math.round(toPx(r, [0, -4.2])[1]), rowBelow = Math.round(toPx(r, [0, 150])[1]);
  const colLeft = Math.round(toPx(r, [-5, 0])[0]), colRight = Math.round(toPx(r, [80.4, 0])[0]);
  const xAt = (row: number, m: number, c: Calibration = r) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(c, [m, 0])[0]);
  const yAt = (col: number, m: number, c: Calibration = r) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(c, [0, m])[1]);
  const { compass, cameraZone, zoneTopPrinted } = magsafeExtras;
  const [x0, x1] = [0, compass.fromSide.mm].map((m) => xAt(rowAbove, m));
  const [y0, y1] = [0, magsafe.zoneSidesTo!.mm].map((m) => yAt(colLeft, m));
  const sx = (x1 - x0) / compass.fromSide.mm, sy = (y1 - y0) / magsafe.zoneSidesTo!.mm;
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [x0, y0] };
  const X = (p: number) => (p - cal.origin[0]) / cal.pxPerMm, Y = (p: number) => (p - cal.origin[1]) / cal.pxPerMm;
  add('MagSafe view px/mm across (calibration: the 0.00 and 65.04 lines)', r.pxPerMm, sx, 0.05);
  add('MagSafe view px/mm down (calibration: the 0.00 and -112.57 lines)', r.pxPerMm, sy, 0.05);
  add('MagSafe view datum across (px)', r.origin[0], x0, 1);
  add('MagSafe view datum down (px)', r.origin[1], y0, 1);
  add('MagSafe view 37.91 line across, above (the mic, dimensioned again)', rearMic.fromSide.mm, X(xAt(rowAbove, rearMic.fromSide.mm, cal)), 0.03);
  add('MagSafe view 44.12 line across, above (the camera corner\'s edge)', cameraZone.across.mm, X(xAt(rowAbove, cameraZone.across.mm, cal)), 0.03);
  add('MagSafe view 35.73 line across, below (dimensioned)', magsafe.fromSide.mm, X(xAt(rowBelow, magsafe.fromSide.mm, cal)), 0.03);
  add('MagSafe view -9.20 line down, right (the compass)', compass.fromTop.mm, Y(yAt(colRight, compass.fromTop.mm, cal)), 0.03);
  add('MagSafe view -33.98 line down, right (the mic, dimensioned again)', rearMic.fromTop.mm, Y(yAt(colRight, rearMic.fromTop.mm, cal)), 0.03);
  add('MagSafe view -75.40 line down, right (the clear circle\'s centre line)', magsafe.fromTop.mm, Y(yAt(colRight, magsafe.fromTop.mm, cal)), 0.03);
  // The phone's sides at 85 down (the outermost runs; the side band's line stands 0.45 inside each): a heavy pen, so
  // the check passes within a stroke, as the family's width checks do.
  const row85 = Math.round(toPx(cal, [0, 85])[1]);
  const sides = [0, body.width.mm].map((m) => {
    const rs = runs(g, [0, row85], [1, 0], g.width - 1), e = toPx(cal, [m, 0])[0];
    return rs.reduce((p, q) => (Math.abs(q.at - e) < Math.abs(p.at - e) ? q : p));
  });
  const stroke = mean(sides.map((q) => q.width)) / cal.pxPerMm;
  add(`the phone's width on the MagSafe view, 85 down (71.45); drawn ${stroke.toFixed(2)} wide`, body.width.mm, X(sides[1].at) - X(sides[0].at), stroke);

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
  add('clear area\'s circle: centre down (75.40)', magsafe.fromTop.mm, f.centre[1], 0.05);
  add('clear area\'s circle: Ø (dimensioned 57.50)', magsafe.diameter.mm, 2 * f.radius, 0.05);
  // The negative control: centred on the product centre (73.73, as the 16's and the 14 Pro Max's), it'd be 1.67 higher.
  add('negative control: the clear circle at the product centre, 147.46 / 2 = 73.73 down (1 = the fitted centre is over 1 mm from it)', 1, Math.abs(f.centre[1] - body.length.mm / 2) > 1 ? 1 : 0, 0);

  // The zone's top: on columns 5 and 40 across (below the crosshatch: a hatch line meets the line there on some columns,
  // so two each side, averaged), and 50 and 60 (the open top's), against the drawn 45.61; nothing at the printed 28.29
  // on the open top's columns (only the mic's -33.98 line crosses them between the compass and the zone).
  const zoneAt = (x: number) => Y(yAt(Math.round(toPx(cal, [x, 0])[0]), magsafe.zoneFrom!.mm, cal));
  add('magnetic zone\'s top below the crosshatch, 5 and 7 across (drawn; Detail D\'s bump outline -45.61)', magsafe.zoneFrom!.mm, mean([5, 7].map(zoneAt)), 0.03);
  add('magnetic zone\'s top below the crosshatch, 38 and 40 across', magsafe.zoneFrom!.mm, mean([38, 40].map(zoneAt)), 0.03);
  for (const x of [50, 60]) add(`magnetic zone's top at ${x} across, the open top`, magsafe.zoneFrom!.mm, zoneAt(x), 0.03);
  const near = [50, 60].map((x) => {
    const col = Math.round(toPx(cal, [x, 0])[0]);
    return runs(g, [col, 0], [0, 1], g.height - 1).map((q) => Y(q.at)).filter((m) => Math.abs(m - zoneTopPrinted.mm) < 1).length;
  });
  add(`negative control: lines within 1 mm of the printed -28.29 on columns 50 and 60 (${near.join(', ')}; 1 = none)`, 1, near.every((n) => n === 0) ? 1 : 0, 0);
  // The crosshatch's right edge at 44.12, rows 15 and 25 down (between the compass and the mic's lines).
  add('the camera corner\'s right edge, 15 and 25 down (44.12)', cameraZone.across.mm, mean([15, 25].map((y) => X(xAt(Math.round(toPx(cal, [0, y])[1]), cameraZone.across.mm, cal)))), 0.03);

  // The arc: its centre derived from the corners and R49.39; its lowest point down columns 0.75 either side of the
  // centre line; its crossings of x = 5, 25, 46.45 and 66.45 (clear of the R49.39 leader, which lands on the arc about
  // 13 across, and the 5 7 note's, which crosses it about 64 across), against the circle through (0, 112.57) and
  // (71.45, 112.57).
  const zr = magsafe.zoneRadius!.mm, half = body.width.mm / 2;
  const zc = magsafe.zoneSidesTo!.mm - Math.sqrt(zr * zr - half * half);
  add(`hand calculation: the zone's arc's centre, 112.57 - √(49.39² - 35.725²) = ${zc.toFixed(3)} down, ${(zc - magsafe.fromTop.mm).toFixed(2)} below the clear circle's`, magsafe.fromTop.mm + 3.07, zc, 0.01);
  const low = mean([half - 0.75, half + 0.75].map((x) => Y(yAt(Math.round(toPx(cal, [x, 0])[0]), zc + zr, cal)) + (zr - Math.sqrt(zr * zr - 0.75 * 0.75))));
  add(`magnetic zone's arc, its lowest point (centre ${zc.toFixed(2)} down, derived, + R49.39)`, zc + zr, low, 0.05);
  for (const x of [5, 25, 46.45, 66.45]) {
    const at = zc + Math.sqrt(zr * zr - (x - half) ** 2);
    add(`magnetic zone's arc at x = ${x} (${at.toFixed(2)})`, at, Y(yAt(Math.round(toPx(cal, [x, 0])[0]), at, cal)), 0.05);
  }
  // The negative control: R49.39 centred on the clear circle's centre would bottom out 3.07 higher.
  add(`negative control: centred on the clear circle, R49.39's lowest point would be ${(magsafe.fromTop.mm + zr).toFixed(2)} (1 = the drawn one is over 2 mm lower)`, 1, low - (magsafe.fromTop.mm + zr) > 2 ? 1 : 0, 0);
  return out;
}

export const remeasure = (pdf = PDF): Measured[] => [
  ...family(phone, { back: detailD, front: frontView, bottom: bottomView }, pdf, {
    // The active area is hatched at 45°, up to the right: the bottom-left corner's diagonal runs along a hatch line (no
    // crossing found), and the bottom-right's arc merges with one (a 7 px run at 9.48 for the top corners' 4 px at 9.11).
    activeCorners: ['top-left', 'top-right'],
  }),
  ...micReadings(pdf),
  ...sectionReadings(pdf),
  ...magsafeReadings(pdf),
];

export const hasPdf = () => existsSync(PDF);

if (import.meta.main) console.log(report(remeasure()));
