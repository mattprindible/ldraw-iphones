// Re-measures every scaled value in drawing.ts from the PDF (the family's procedures, iphone/measure.ts), the corner's
// diagonal point in Detail D (the 14 Plus's scan, on this drawing's leaders), and checks the rear mic, the flash's
// keepout section (Section H-H) and MagSafe's keepouts against what the drawing draws (the 14 Pro's checks).
//
//   node iphone-14-pro-max/measure.ts   → a table: recorded, measured, the difference
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { remeasure as family, report, type Measured } from '../../measure.ts';
import { cleanCircleAt, lineNear, render, runs, toPx, type Calibration } from '../../../src/raster.ts';
import { body, bottomView, bump, cornerDiagonal, detailA, detailD, flash, flashKeepout, frontView, magsafe, magsafeExtras, magsafeView, micView, phone, rearMic, sectionH } from './drawing.ts';

export const PDF = join(import.meta.dirname, '..', '..', 'drawings', 'iphone-14-pro-max.pdf');

/**
 * Detail D, drawn at the back's scale (about 46 px/mm at 1200 dpi): calibrated on the corner's own leaders, the five
 * across (1.47 to 17.32, vertical above the phone) and the five down (0.81 to 15.55, horizontal left of it), each a thin
 * line whose middle is its value (the 0.00 and 0.21 lines stand close across, the 0.00 and 0.06 merge down, so neither
 * pair serves). The island (20.76 about the 38.79 line) then checks it. Then the outline's crossing of the corner's
 * diagonal.
 */
export function detailDReadings(pdf = PDF): Measured[] {
  const r = detailD, g = render(pdf, r);
  const out: Measured[] = [];
  const across = [1.47, 4.25, 8.23, 12.74, 17.32], down = [0.81, 3.01, 6.6, 10.98, 15.55];
  // Across: the leaders on a row 1 above the phone; down: on a column 1 left of it.
  const xs = across.map((m) => lineNear(g, [0, Math.round(toPx(r, [0, -1])[1])], [1, 0], g.width - 1, toPx(r, [m, 0])[0]));
  const ys = down.map((m) => lineNear(g, [Math.round(toPx(r, [-1, 0])[0]), 0], [0, 1], g.height - 1, toPx(r, [0, m])[1]));
  const [sx, sy] = [(xs.at(-1)! - xs[0]) / (across.at(-1)! - across[0]), (ys.at(-1)! - ys[0]) / (down.at(-1)! - down[0])];
  const mean = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length;
  const x0 = mean(xs.map((x, i) => x - across[i] * sx)), y0 = mean(ys.map((y, i) => y - down[i] * sy));
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [x0, y0] };
  out.push({ name: 'Detail D px/mm across (calibration: the corner\'s leaders, 1.47 to 17.32)', kind: 'check', recorded: r.pxPerMm, measured: sx, within: 0.05 });
  out.push({ name: 'Detail D px/mm down (calibration: the corner\'s leaders, 0.81 to 15.55)', kind: 'check', recorded: r.pxPerMm, measured: sy, within: 0.05 });
  out.push({ name: 'Detail D datum across (px)', kind: 'check', recorded: r.origin[0], measured: x0, within: 1 });
  out.push({ name: 'Detail D datum down (px)', kind: 'check', recorded: r.origin[1], measured: y0, within: 1 });
  across.forEach((m, i) => out.push({ name: `Detail D leader ${m.toFixed(2)} across (dimensioned)`, kind: 'check', recorded: m, measured: (xs[i] - x0) / cal.pxPerMm, within: 0.02 }));
  down.forEach((m, i) => out.push({ name: `Detail D leader ${m.toFixed(2)} down (dimensioned)`, kind: 'check', recorded: m, measured: (ys[i] - y0) / cal.pxPerMm, within: 0.02 }));
  // The 0.21 leader, which the calibration didn't use.
  const x21 = lineNear(g, [0, Math.round(toPx(cal, [0, -1])[1])], [1, 0], g.width - 1, toPx(cal, [0.21, 0])[0]);
  out.push({ name: 'Detail D leader 0.21 across (dimensioned; not in the calibration)', kind: 'check', recorded: 0.21, measured: (x21 - x0) / cal.pxPerMm, within: 0.02 });
  // The island: its ends along the row through its middle (-8.10), each the pill's end stroke.
  const { front } = phone;
  const cx = phone.connector.fromSide.mm, il = front.islandLength!.mm, it = front.islandFromTop!.mm;
  const ir = Math.round(toPx(cal, [0, it])[1]);
  const ends = [cx - il / 2, cx + il / 2].map((x) => (lineNear(g, [0, ir], [1, 0], g.width - 1, toPx(cal, [x, 0])[0]) - x0) / cal.pxPerMm);
  out.push({ name: `Detail D island length (dimensioned ${il})`, kind: 'check', recorded: il, measured: ends[1] - ends[0], within: 0.05 });
  out.push({ name: `Detail D island middle across (dimensioned ${cx}, the phone's middle)`, kind: 'check', recorded: cx, measured: (ends[0] + ends[1]) / 2, within: 0.05 });

  // The diagonal from the sharp corner (from 0.4 in, past the datum lines' own crossing), at 4800 dpi: its first line
  // that isn't a leader (the 0.81 and 1.47 leaders cross it near (0.81, 0.81) and (1.47, 1.47); the 3.01 leader with the
  // left arm of the (4.25, 3.01) cross at about 3.0) is the outline, the thin line the crosses sit on. Its middle.
  const k = 4;
  const r4 = { page: r.page, dpi: r.dpi * k, crop: { x: r.crop.x * k, y: r.crop.y * k, width: 600 * k, height: 600 * k } };
  const c4: Calibration = { pxPerMm: cal.pxPerMm * k, origin: [cal.origin[0] * k, cal.origin[1] * k] };
  const g4 = render(pdf, r4);
  const leaders = [0.81, 1.47, 3.01];
  const along = (q: { at: number }) => 0.4 + (q.at / c4.pxPerMm) * Math.SQRT1_2;
  const all = runs(g4, toPx(c4, [0.4, 0.4]), [Math.SQRT1_2, Math.SQRT1_2], Math.round(6 * c4.pxPerMm));
  const diag = all.filter((q) => !leaders.some((l) => Math.abs(along(q) - l) * c4.pxPerMm < 16));
  out.push({ name: `corner diagonal point (the outline on the 45° diagonal, 4800 dpi; runs at ${all.map((q) => along(q).toFixed(2)).join(', ')})`, kind: 'scaled', recorded: cornerDiagonal.mm, measured: along(diag[0]), within: 0.05 });
  return out;
}

// Helpers for the checks below (the 14 Pro's).
const mean = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length;
const deg = (rad: number) => (rad * 180) / Math.PI;
const tanHalf = (fullDeg: number) => Math.tan((fullDeg / 2) * (Math.PI / 180));
function collector() {
  const out: Measured[] = [];
  const add = (name: string, recorded: number, measured: number, within: number, known?: string) => out.push({ name, kind: 'check', recorded, measured, within, ...(known ? { known } : {}) });
  return { out, add };
}

/**
 * A line u = a + b·v through points (u, v), least squares, dropping points more than a tolerance off and refitting: the
 * tolerance halves from 48 px down to `tol` (the 14 Pro's went straight to `tol` in four passes; here a few far rows,
 * where the cone line crosses the keepout's edge line or an arc, pulled the first fit 10 px off and left none within 3).
 */
function fitLine(P: [number, number][], tol = 3): { a: number; b: number; n: number } {
  let pts = P.filter(([u]) => Number.isFinite(u));
  let a = 0, b = 0;
  for (let pass = 0; pass < 9; pass++) {
    const mv = mean(pts.map((p) => p[1])), mu = mean(pts.map((p) => p[0]));
    b = pts.reduce((s, [u, v]) => s + (u - mu) * (v - mv), 0) / pts.reduce((s, [, v]) => s + (v - mv) ** 2, 0);
    a = mu - b * mv;
    const t = Math.max(tol, 48 / 2 ** pass);
    pts = P.filter(([u, v]) => Number.isFinite(u) && Math.abs(u - (a + b * v)) < t);
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
 * centre lines, within 8° of each axis, and of the Ø1.15 leader and the -33.98 line, which come in from the right a
 * little below the centre), each crossing sorted to a circle by its radius (the gap between them, 0.20 mm, is 37 px).
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
  add(`rear mic centre across (dimensioned 37.91: the ordinate below Detail A; the outer circle, ${n[0]} crossings)`, rearMic.fromSide.mm, outer.centre[0], 0.05);
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
 * Sheet 2's Section H-H (on the 32.12 line, through the flash), drawn upright: the scale from the cover glass's
 * face (the left edge) to the 11.76 extension line; the 7.74's extension line above its arrow; the faces on the
 * right (the bump's top, camera 3's ring below) and the phone's top edge; the cone's four lines (the first ink right of
 * a start column, row by row, each fitted), their crossings (the apex, the kinks) and angles; and hand calculations
 * from the printed numbers (the kinks' spread, the inner cone where it leaves the bump's top).
 */
export function sectionReadings(pdf = PDF): Measured[] {
  const r = sectionH, k = flashKeepout, g = render(pdf, r);
  const { out, add } = collector();
  const across = (y: number, expect: number) => lineNear(g, [0, y], [1, 0], g.width - 1, expect);
  // Row 700, between the 11.76's dimension line (634) and the phone's top end (962), crosses only the extension lines
  // (and the outer cone's lines beyond them).
  const face = across(700, r.origin[0]);
  const px = (across(700, face + k.transitionFromFront!.mm * r.pxPerMm) - face) / k.transitionFromFront!.mm;
  const mm = (x: number) => (x - face) / px;
  add('Section H-H px/mm (calibration: the cover glass face to the 11.76 line)', r.pxPerMm, px, 0.05);
  add('Section H-H cover glass face (px)', r.origin[0], face, 1);
  add('Section H-H the cover glass face on the phone (row 2500), against the extension line\'s (mm)', 0, mm(across(2500, face)), 0.03);
  // 7.74's extension line, from the apex (about row 1440) down past its dimension line (2031): row 1700.
  add('Section H-H 7.74 extension line, above its arrow (dimensioned)', k.apexFromFront!.mm, mm(across(1700, face + k.apexFromFront!.mm * px)), 0.03);
  // The phone's top edge, down columns in the body (the section's own datum down: rows are mm from it).
  const topEdge = mean([350, 450].map((x) => lineNear(g, [x, 0], [0, 1], g.height - 1, r.origin[1])));
  add('Section H-H the phone\'s top edge (px)', r.origin[1], topEdge, 1);
  const down = (y: number) => (y - topEdge) / px;
  // The faces: the bump's top above and below the cone (rows 1210, 2500, 2700, 2900: above ~1190 its edge rounds toward
  // the phone's top), camera 3's ring (rows 1950, 2100: on
  // the 32.12 line, its centre line).
  const T = body.thickness.mm, top = T + bump.top.mm, rings = T + bump.rings.mm;
  const glass = mean([1210, 2500, 2700, 2900].map((y) => mm(across(y, face + top * px))));
  const ring = mean([1950, 2100].map((y) => mm(across(y, face + rings * px))));
  add(`Section H-H the bump's top, 7.85 + 1.85 (drawn ${glass.toFixed(3)})`, top, glass, 0.05);
  add(`Section H-H camera 3's ring, 7.85 + 4.18 (drawn ${ring.toFixed(3)})`, rings, ring, 0.05);
  // The cone's lines: the first ink right of a start column on each row (inside the cone is hatched, outside white).
  // The inner lines start right of the bump's top; the upper outer right of the 11.76 extension line, the lower outer
  // right of camera 3's ring (which stands right of that line from ~1775 down). The lower inner line is read on rows
  // 1595 to 1655 only: below them a hatch line stands between the bump's top and it (1660 on), then the flash's step
  // (a horizontal line, row 1690). The hatch lines meet each cone line and
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
  const upperInner = line(1170, 1280, inside), lowerInner = line(1595, 1655, inside);
  const lowerOuter = line(1850, 2350, Math.round(face + (rings + 0.12) * px));
  const offAxis = (l: Line) => 90 - deg(Math.atan(Math.abs(l.b)));
  const apex = meet(upperInner, lowerInner), kinks = [meet(upperInner, upperOuter), meet(lowerInner, lowerOuter)];
  add(`inner cone's apex from the cover glass (its lines fitted to ${upperInner.n} and ${lowerInner.n} rows, crossed)`, k.apexFromFront!.mm, mm(apex[0]), 0.05);
  kinks.forEach((q, i) => add(`${i ? 'lower' : 'upper'} kink, inner cone to outer, from the cover glass (11.76)`, k.transitionFromFront!.mm, mm(q[0]), 0.05));
  add(`inner cone, full angle as drawn (degrees; its lines read over 2.4 and 1.3 mm)`, k.inner.mm, offAxis(upperInner) + offAxis(lowerInner), 1);
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
 * Sheet 2's MagSafe view, calibrated on its extension lines: across, the 0.00 and 71.17 lines on a row 4.2 above the
 * phone; down, the 0.00 and -114.82 lines on a column 5 left of it. The other dimensioned lines check it (and the
 * bump's outline, -45.61 in Detail A, drawn here too). Then the clear area's circle (crossings on rays from its centre,
 * fitted), the magnetic zone's top (undimensioned: scaled here) and its arc.
 */
export function magsafeReadings(pdf = PDF): Measured[] {
  const r = magsafeView, g = render(pdf, r);
  const { out, add } = collector();
  const rowAbove = Math.round(toPx(r, [0, -4.2])[1]), rowBelow = Math.round(toPx(r, [0, 165])[1]);
  const colLeft = Math.round(toPx(r, [-5, 0])[0]), colRight = Math.round(toPx(r, [80.4, 0])[0]);
  const xAt = (row: number, m: number, c: Calibration = r) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(c, [m, 0])[0]);
  const yAt = (col: number, m: number, c: Calibration = r) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(c, [0, m])[1]);
  const { compass, cameraZone } = magsafeExtras;
  const [x0, x1] = [0, compass.fromSide.mm].map((m) => xAt(rowAbove, m));
  const [y0, y1] = [0, magsafe.zoneSidesTo!.mm].map((m) => yAt(colLeft, m));
  const sx = (x1 - x0) / compass.fromSide.mm, sy = (y1 - y0) / magsafe.zoneSidesTo!.mm;
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [x0, y0] };
  const X = (p: number) => (p - cal.origin[0]) / cal.pxPerMm, Y = (p: number) => (p - cal.origin[1]) / cal.pxPerMm;
  add('MagSafe view px/mm across (calibration: the 0.00 and 71.17 lines)', r.pxPerMm, sx, 0.05);
  add('MagSafe view px/mm down (calibration: the 0.00 and -114.82 lines)', r.pxPerMm, sy, 0.05);
  add('MagSafe view datum across (px)', r.origin[0], x0, 1);
  add('MagSafe view datum down (px)', r.origin[1], y0, 1);
  add('MagSafe view 44.12 line across, above (the camera corner\'s edge)', cameraZone.across.mm, X(xAt(rowAbove, cameraZone.across.mm, cal)), 0.03);
  add('MagSafe view 38.79 PRODUCT CENTER line across, below (dimensioned)', magsafe.fromSide.mm, X(xAt(rowBelow, magsafe.fromSide.mm, cal)), 0.03);
  add('MagSafe view -9.20 line down, right (the compass)', compass.fromTop.mm, Y(yAt(colRight, compass.fromTop.mm, cal)), 0.03);
  add('MagSafe view -80.36 PRODUCT CENTER line down, right (dimensioned)', magsafe.fromTop.mm, Y(yAt(colRight, magsafe.fromTop.mm, cal)), 0.03);
  // The bump's outline (Detail A's -45.61) on column 20 across, under the crosshatch, just above the zone's top.
  add('MagSafe view the bump\'s outline, 20 across (Detail A: -45.61)', bump.baseFrom.mm + bump.baseHeight.mm, Y(yAt(Math.round(toPx(cal, [20, 0])[0]), bump.baseFrom.mm + bump.baseHeight.mm, cal)), 0.03);
  // The phone's sides at 90 down (the outermost runs): a heavy pen, so the check passes within a stroke, as the family's
  // width checks do.
  const row90 = Math.round(toPx(cal, [0, 90])[1]);
  const sides = [0, body.width.mm].map((m) => {
    const rs = runs(g, [0, row90], [1, 0], g.width - 1), e = toPx(cal, [m, 0])[0];
    return rs.reduce((p, q) => (Math.abs(q.at - e) < Math.abs(p.at - e) ? q : p));
  });
  const stroke = mean(sides.map((q) => q.width)) / cal.pxPerMm;
  add(`the phone's width on the MagSafe view, 90 down (77.58); drawn ${stroke.toFixed(2)} wide`, body.width.mm, X(sides[1].at) - X(sides[0].at), stroke);

  // The clear area's circle: crossings within 0.25 of R28.75 on rays every 5° from its centre, clear of the centre
  // lines (within 6° of each axis) and of the leaders that cross it (the clear area's note's, about 32°, down positive;
  // Ø57.50's, landing about 162°), keeping rays with one crossing only (a hatch line meeting the circle gives two).
  const c: [number, number] = [magsafe.fromSide.mm, magsafe.fromTop.mm], R = magsafe.diameter.mm / 2;
  const P: [number, number][] = [];
  for (let a = 0; a < 360; a += 5) {
    if ([0, 90, 180, 270, 360].some((b) => Math.abs(a - b) < 6) || (a > 15 && a < 50) || (a > 145 && a < 175)) continue;
    const t = (a * Math.PI) / 180, d: [number, number] = [Math.cos(t), Math.sin(t)];
    const o = toPx(cal, c), start = (R - 1.5) * cal.pxPerMm;
    const rs = runs(g, [o[0] + d[0] * start, o[1] + d[1] * start], d, Math.round(3 * cal.pxPerMm)).map((q) => R - 1.5 + q.at / cal.pxPerMm).filter((x) => Math.abs(x - R) < 0.25);
    if (rs.length === 1) P.push([c[0] + d[0] * rs[0], c[1] + d[1] * rs[0]]);
  }
  const f = fitCircle(P);
  add(`clear area's circle: centre across (fitted to ${P.length} crossings; worst ${f.worst.toFixed(3)} off)`, magsafe.fromSide.mm, f.centre[0], 0.05);
  add('clear area\'s circle: centre down (80.36)', magsafe.fromTop.mm, f.centre[1], 0.05);
  add('clear area\'s circle: Ø (dimensioned 57.50)', magsafe.diameter.mm, 2 * f.radius, 0.05);
  add('hand calculation: PRODUCT CENTER down, half the 160.71 (80.355), against the printed -80.36', magsafe.fromTop.mm, body.length.mm / 2, 0.01);
  // The negative control: placed as the 14 Pro's is (1.67 below the product centre), it'd be at 82.03.
  add('negative control: the clear circle 1.67 below the product centre, as the 14 Pro\'s (82.03; 1 = the fitted centre is over 1 mm from it)', 1, Math.abs(f.centre[1] - (body.length.mm / 2 + 1.67)) > 1 ? 1 : 0, 0);

  // The zone's top (no number): on columns 3, 5, 20 and 40 (below the crosshatch), 43 (its edge) and 46, 50, 60, 70,
  // 74 (the open top), each the line nearest the recorded 47.18; and none on the bump's outline across the open top,
  // where the 14 Pro's zone top lies.
  const zoneCols = [3, 5, 20, 40, 43, 46, 50, 60, 70, 74];
  const zoneAt = (x: number) => Y(yAt(Math.round(toPx(cal, [x, 0])[0]), magsafe.zoneFrom!.mm, cal));
  const zs = zoneCols.map(zoneAt);
  add(`magnetic zone's top (not dimensioned), ${zoneCols.length} columns across, mean (spread ${(Math.max(...zs) - Math.min(...zs)).toFixed(3)})`, magsafe.zoneFrom!.mm, mean(zs), 0.03);
  add('magnetic zone\'s top below the crosshatch, 3, 5, 20, 40 across', magsafe.zoneFrom!.mm, mean([3, 5, 20, 40].map(zoneAt)), 0.03);
  add('magnetic zone\'s top across the open top, 50, 60, 70 across', magsafe.zoneFrom!.mm, mean([50, 60, 70].map(zoneAt)), 0.03);
  const outline = bump.baseFrom.mm + bump.baseHeight.mm;
  const onOutline = [50, 60, 70].map((x) => {
    const col = Math.round(toPx(cal, [x, 0])[0]);
    return runs(g, [col, 0], [0, 1], g.height - 1).map((q) => Y(q.at)).filter((m) => Math.abs(m - outline) < 0.5).length;
  });
  add(`negative control: lines within 0.5 mm of the bump's outline (-45.61, where the 14 Pro's zone top lies) on columns 50, 60, 70 (${onOutline.join(', ')}; 1 = none)`, 1, onOutline.every((n) => n === 0) ? 1 : 0, 0);
  // The crosshatch's right edge at 44.12, rows 20 and 30 down.
  add('the camera corner\'s right edge, 20 and 30 down (44.12)', cameraZone.across.mm, mean([20, 30].map((y) => X(xAt(Math.round(toPx(cal, [0, y])[1]), cameraZone.across.mm, cal)))), 0.03);

  // The arc: its centre derived from the corners and R51.89 (on the product centre: hand calculation); its lowest point
  // down columns 0.75 either side of the centre line; its crossings at several x (clear of the R51.89 leader, which
  // lands on it about 4 across), against the circle through (0, 114.82) and (77.58, 114.82).
  const zr = magsafe.zoneRadius!.mm, half = body.width.mm / 2;
  const zc = magsafe.zoneSidesTo!.mm - Math.sqrt(zr * zr - half * half);
  add(`hand calculation: the zone's arc's centre, 114.82 - √(51.89² - 38.79²) = ${zc.toFixed(3)} down, against the product centre (80.355)`, body.length.mm / 2, zc, 0.01);
  const low = mean([half - 0.75, half + 0.75].map((x) => Y(yAt(Math.round(toPx(cal, [x, 0])[0]), zc + zr, cal)) + (zr - Math.sqrt(zr * zr - 0.75 * 0.75))));
  add(`magnetic zone's arc, its lowest point (centre ${zc.toFixed(2)} down, derived, + R51.89)`, zc + zr, low, 0.05);
  for (const x of [10, 25, 52, 66.86, 72]) {
    const at = zc + Math.sqrt(zr * zr - (x - half) ** 2);
    add(`magnetic zone's arc at x = ${x} (${at.toFixed(2)})`, at, Y(yAt(Math.round(toPx(cal, [x, 0])[0]), at, cal)), 0.05);
  }
  // The negative control: centred 3.07 below the clear circle (the 14 Pro's offset) R51.89 would bottom out 3.07 lower.
  add(`negative control: centred 3.07 below the clear circle (the 14 Pro's), R51.89's lowest point would be ${(magsafe.fromTop.mm + 3.07 + zr).toFixed(2)} (1 = the drawn one is over 2 mm higher)`, 1, magsafe.fromTop.mm + 3.07 + zr - low > 2 ? 1 : 0, 0);
  return out;
}

export const remeasure = (pdf = PDF): Measured[] => [
  ...family(phone, { back: detailA, front: frontView, bottom: bottomView }, pdf, {
    // The active area is hatched at 45°, up to the right: the bottom-left corner's diagonal runs along a hatch line (no
    // crossing found: the arc merges into one run with it), so it's left out. The top-right's runs between two. On the
    // top-left the diagonal also crosses hatch lines at 10.00 and 17.26 (as radii): a guess of 9.6 picked the 10.00, so
    // the guess must be close. Every corner's diagonal crosses the thin arc at 9.11, the glass edge at 3.93 (8 px) and the
    // outline at 1.41 (probed run by run).
    activeCorners: ['top-left', 'top-right', 'bottom-right'],
  }),
  ...detailDReadings(pdf),
  ...micReadings(pdf),
  ...sectionReadings(pdf),
  ...magsafeReadings(pdf),
];

export const hasPdf = () => existsSync(PDF);

if (import.meta.main) console.log(report(remeasure()));
