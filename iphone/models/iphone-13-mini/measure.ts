// Re-measures every scaled value in drawing.ts from the PDF (the family's procedures, iphone/measure.ts), so each is
// evidence anyone can rerun, not a number copied from a session; and checks the rear mic, the flash's keepout sections
// (AB-AB, AC-AC) and MagSafe's keepouts against what the drawing draws.
//
//   node iphone-13-mini/measure.ts   → a table: recorded, measured, the difference
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { remeasure as family, report, type Measured } from '../../measure.ts';
import { cleanCircleAt, lineNear, render, runNear, runs, toPx, type Calibration, type Gray } from '../../../src/raster.ts';
import { body, bottomView, bump, detailY, flash, flashKeepout, flashKeepoutAcross, frontView, magsafe, magsafeSides, magsafeView, phone, rearMic, receiverView, sectionAB, sectionAC } from './drawing.ts';

export const PDF = join(import.meta.dirname, '..', '..', 'drawings', 'iphone-13-mini.pdf');

const mean = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length;
const median = (a: number[]) => [...a].sort((p, q) => p - q)[Math.floor(a.length / 2)];
const rms = (a: number[]) => Math.sqrt(mean(a.map((x) => x * x)));
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
 * Detail Y's rear mic (the family's re-measurement doesn't read it): the circle at its dimensioned centre, on Detail Y's
 * calibration (which the family's checks confirm), chords offset off the -24.66 and 9.40 lines through it.
 */
export function micReadings(pdf = PDF): Measured[] {
  const r = detailY, g = render(pdf, r);
  const { out, add } = collector();
  const c = cleanCircleAt(g, toPx(r, [rearMic.fromSide.mm, rearMic.fromTop.mm]), (rearMic.diameter.mm / 2) * r.pxPerMm, [30, -30, 50, -50]);
  const stroke = c.stroke / r.pxPerMm;
  add('rear mic centre across (dimensioned 9.40: the ordinate below Detail Y)', rearMic.fromSide.mm, (c.centre[0] - r.origin[0]) / r.pxPerMm, 0.05);
  add('rear mic centre down (dimensioned 24.66)', rearMic.fromTop.mm, (c.centre[1] - r.origin[1]) / r.pxPerMm, 0.05);
  add(`rear mic Ø (dimensioned 2.40, the outer circle); drawn ${stroke.toFixed(2)} wide`, rearMic.diameter.mm, c.diameter / r.pxPerMm, Math.max(0.05, stroke));
  // Read with the numbers swapped (24.66 across, 9.40 down) the place lands inside the flash (0.6 from its centre, in
  // its Ø6.28): the circle finder finds no circle there (it throws: no line within its chords).
  let swapped = 'none';
  try {
    const w = cleanCircleAt(g, toPx(r, [rearMic.fromTop.mm, rearMic.fromSide.mm]), (rearMic.diameter.mm / 2) * r.pxPerMm, [30, -30, 50, -50]);
    swapped = `Ø${(w.diameter / r.pxPerMm).toFixed(2)}`;
  } catch {}
  add(`negative control: at (24.66, 9.40), the numbers swapped, the circle found: ${swapped} (1 = none, or over 1 mm off Ø2.40)`, 1, swapped === 'none' || Math.abs(Number(swapped.slice(1)) - rearMic.diameter.mm) > 1 ? 1 : 0, 0);
  // The bump's top's bottom-left corner: centre (2.875 + 8.0, 31.195 - 8.0); the mic's centre is 2.08 from it, well
  // inside R8.0, so the builder puts it flush on the bump's top.
  const corner: [number, number] = [bump.topFrom.mm + bump.topRadius.mm, bump.topFrom.mm + bump.topSize.mm - bump.topRadius.mm];
  add('rear mic centre inside the bump top\'s R8.0 corner (its distance from the corner\'s centre, under 8.0 - 1.2)', 0, Math.max(0, Math.hypot(rearMic.fromSide.mm - corner[0], rearMic.fromTop.mm - corner[1]) - (bump.topRadius.mm - rearMic.diameter.mm / 2)), 0);
  return out;
}

/**
 * Sheet 2's Section AB-AB (down the phone through the flash): the scale from the cover glass's face (the left edge) to
 * the 11.10 extension line; the faces on the right (the bump's glass, the strobe under it, camera 2's ring below); the
 * cone's four lines (the first ink right of the face, row by row, each fitted), their crossings (the apex, the kinks)
 * and angles; the inner cone's width at the strobe's face (AC-AC's Ø6.00) and at the glass's (the flash's Ø6.28).
 */
function sectionABReadings(g: Gray, add: ReturnType<typeof collector>['add']) {
  const r = sectionAB, k = flashKeepout;
  const across = (y: number, expect: number) => lineNear(g, [0, y], [1, 0], g.width - 1, expect);
  // Row 2860 crosses the 11.10 extension line (it runs ~1890 to 2890) and the front face.
  const face = across(2860, r.origin[0]);
  const px = (across(2860, face + k.transitionFromFront!.mm * r.pxPerMm) - face) / k.transitionFromFront!.mm;
  const mm = (x: number) => (x - face) / px;
  add('Section AB-AB px/mm (calibration: the cover glass face to the 11.10 line)', r.pxPerMm, px, 0.05);
  add('Section AB-AB cover glass face (px)', r.origin[0], face, 1);
  // The faces: the bump's glass above and below the strobe (rows 1100, 1800), the strobe (rows 1400, 1500), camera 2's
  // ring (rows 2200, 2600: the cut runs 1.87 beside its centre).
  const top = body.thickness.mm + bump.top.mm, rings = body.thickness.mm + bump.rings.mm;
  const glass = mean([1100, 1800].map((y) => mm(across(y, face + top * px))));
  const strobe = mean([1400, 1500].map((y) => mm(across(y, face + (top - 0.15) * px))));
  // Drawn 0.06 thin, within the title block's ±0.08: the sheet's views draw the body thin (the bottom view 7.57 for 7.65).
  add(`the bump's glass beside the flash, 7.65 + 1.48 (drawn ${glass.toFixed(3)}: thin, as the sheet's views)`, top, glass, 0.08);
  add('the strobe under the bump\'s glass (scaled)', flashKeepoutAcross.strobeRecess.mm, glass - strobe, 0.02);
  add('camera 2\'s ring below the flash, 7.65 + 2.51', rings, mean([2200, 2600].map((y) => mm(across(y, face + rings * px)))), 0.05);
  // The cone's lines: the first ink right of the face on each row (inside the cone is hatched, outside white). Below the
  // lower kink the 11.10 extension line and camera 2's ring come first: start right of the line.
  const first = (y: number, x0: number) => {
    const rs = runs(g, [x0, y], [1, 0], g.width - 1 - x0);
    return rs.length ? x0 + rs[0].at : NaN;
  };
  const from = Math.round(face + (top + 0.15) * px);
  const line = (a: number, b: number, x0 = from) => fitLine(rowsBy(a, b).map((y) => [first(y, x0), y]));
  const upperOuter = line(20, 960), upperInner = line(1020, 1190), lowerInner = line(1710, 1860);
  const lowerOuter = line(2000, 2800, Math.round(face + 11.2 * px));
  const offAxis = (l: Line) => 90 - deg(Math.atan(Math.abs(l.b)));
  const apex = meet(upperInner, lowerInner), kinks = [meet(upperInner, upperOuter), meet(lowerInner, lowerOuter)];
  kinks.forEach((q, i) => add(`AB-AB ${i ? 'lower' : 'upper'} kink, inner cone to outer, from the cover glass (11.10)`, k.transitionFromFront!.mm, mm(q[0]), 0.05));
  add('AB-AB inner cone, full angle as drawn (degrees; its lines are ~3 mm long)', k.inner.mm, offAxis(upperInner) + offAxis(lowerInner), 1);
  add('AB-AB outer cone, full angle as drawn (degrees)', k.outer!.mm, offAxis(upperOuter) + offAxis(lowerOuter), 1);
  add('AB-AB the apex midway between the kinks, down (mm: on the cone\'s axis)', 0, (apex[1] - (kinks[0][1] + kinks[1][1]) / 2) / px, 0.1);
  // The derived apex against the drawn lines' crossing: the cone is drawn from the thin glass, 0.04 nearer the front.
  add(`AB-AB inner cone's apex from the cover glass (derived 7.01; its lines fitted to ${upperInner.n} and ${lowerInner.n} rows, crossed)`, k.apexFromFront!.mm, mm(apex[0]), 0.08);
  const width = (atMm: number) => {
    const x = face + atMm * px;
    return ((x - lowerInner.a) / lowerInner.b - (x - upperInner.a) / upperInner.b) / px;
  };
  add('AB-AB inner cone at the strobe\'s face (AC-AC\'s Ø6.00)', k.innerBaseDiameter!.mm, width(strobe), 0.05);
  add('AB-AB inner cone at the bump\'s glass, drawn (the flash\'s Ø6.28)', flash.diameter.mm, width(glass), 0.05);
  // Hand calculation from the printed numbers alone: the 112° cone from 7.01 at 11.10 (the transition), against the drawn.
  const transition = k.innerBaseDiameter!.mm + 2 * (k.transitionFromFront!.mm - (top - flashKeepoutAcross.strobeRecess.mm)) * tanHalf(k.inner.mm);
  // The drawn kinks sit 0.08 further out each side: the cone drawn from the thin glass, and 112.25° as drawn.
  add(`AB-AB transition, Ø6.00 + 2 (11.10 - 9.03) tan 56° = ${transition.toFixed(2)}, against the drawn kinks' spacing`, transition, Math.abs(kinks[1][1] - kinks[0][1]) / px, 0.2);
  // The negative control: read from the back glass, "11.10 to cover glass" would put the kinks 7.65 further out (18.75
  // from the front), off the section's drawn ones by its whole thickness.
  add('negative control: read from the back glass the transition would be 18.75 from the front (1 = the drawn kinks are over 5 mm from it)', 1, Math.abs(mm(kinks[0][0]) - (body.thickness.mm + k.transitionFromFront!.mm)) > 5 ? 1 : 0, 0);
}

/**
 * Sheet 2's Section AC-AC (across the phone through the flash, drawn lying, the back down): the scale from the Ø6.00
 * extension lines; the cover glass's face (the top edge), the back glass (right of the bump) and the strobe's face; the
 * inner cone's lines (row by row inward from outside it, below the bezel) and the outer cone's (column by column, the
 * first ink below the phone), their crossings and angles.
 */
function sectionACReadings(g: Gray, add: ReturnType<typeof collector>['add']) {
  const r = sectionAC, kx = flashKeepoutAcross, k = flashKeepout;
  const base = k.innerBaseDiameter!.mm;
  // Row 50, above the phone, crosses only the Ø6.00 extension lines.
  const [l, rr] = [-1, 1].map((s) => lineNear(g, [0, 50], [1, 0], g.width - 1, r.origin[0] + (s * base * r.pxPerMm) / 2));
  const px = (rr - l) / base, axis = (l + rr) / 2;
  add('Section AC-AC px/mm (calibration: the Ø6.00 lines)', r.pxPerMm, px, 0.05);
  add('Section AC-AC the flash\'s axis across, the Ø6.00 lines\' midpoint (px)', r.origin[0], axis, 1);
  add('Section AC-AC px/mm against AB-AB\'s (one scale: both read in either)', sectionAB.pxPerMm, px, 0.05);
  const down = (x: number, expect: number) => lineNear(g, [x, 0], [0, 1], g.height - 1, expect);
  const face = down(2700, r.origin[1]);
  const mm = (y: number) => (y - face) / px;
  add('Section AC-AC cover glass face (px)', r.origin[1], face, 1);
  add('AC-AC the back glass, right of the bump (7.65)', body.thickness.mm, mm(down(2700, face + body.thickness.mm * px)), 0.05);
  const strobe = mean([1400, 1700].map((x) => mm(down(x, face + 8.97 * px))));
  add('AC-AC the strobe\'s face, as AB-AB draws it (7.65 + 1.48 - 0.10, drawn 0.06 thin)', body.thickness.mm + bump.top.mm - kx.strobeRecess.mm - 0.06, strobe, 0.03);
  // The inner lines (x = a + b·y): rows between the bezel's last line and the kinks, each from outside the cone inward.
  const inward = (y: number, x0: number, dir: 1 | -1) => {
    const rs = runs(g, [x0, y], [dir, 0], 400);
    return rs.length ? x0 + dir * rs[0].at : NaN;
  };
  const left = fitLine(rowsBy(850, 898, 2).map((y) => [inward(y, Math.round(axis - 7.3 * px), 1), y]));
  const right = fitLine(rowsBy(850, 898, 2).map((y) => [inward(y, Math.round(axis + 7.3 * px), -1), y]));
  // The outer lines (y = a + b·x): the first ink below the phone's lowest face (camera 1's ring, 10.16), column by column.
  const below = Math.round(face + 10.3 * px);
  const firstDown = (x: number) => {
    const rs = runs(g, [x, below], [0, 1], g.height - 1 - below);
    return rs.length ? below + rs[0].at : NaN;
  };
  const wingL = fitLine(rowsBy(Math.round(axis - 15.9 * px), Math.round(axis - 6.1 * px)).map((x) => [firstDown(x), x]));
  const wingR = fitLine(rowsBy(Math.round(axis + 6.1 * px), Math.round(axis + 16.1 * px)).map((x) => [firstDown(x), x]));
  const inner = deg(Math.atan(Math.abs(left.b))) + deg(Math.atan(Math.abs(right.b)));
  const outer = 180 - deg(Math.atan(Math.abs(wingL.b))) - deg(Math.atan(Math.abs(wingR.b)));
  add('AC-AC inner cone, full angle as drawn (degrees)', kx.inner.mm, inner, 1);
  add('AC-AC outer cone, full angle as drawn (degrees)', k.outer!.mm, outer, 1);
  const [ax, ay] = meet(left, right);
  add('AC-AC inner cone\'s apex on the flash\'s axis (mm across)', 0, (ax - axis) / px, 0.05);
  add(`AC-AC inner cone's apex from the cover glass (derived 6.30; fitted to ${left.n} and ${right.n} rows, crossed)`, kx.apexFromFront.mm, mm(ay), 0.08);
  const widthAt = (y: number) => ((right.a + right.b * y) - (left.a + left.b * y)) / px;
  add('AC-AC inner cone at the strobe\'s face (dimensioned Ø6.00)', base, widthAt(face + strobe * px), 0.05);
  // The kinks: an inner line x = a + b·y meets a wing y = c + d·x where y = (c + d·a) / (1 - d·b).
  const kink = (i: Line, w: Line) => (w.a + w.b * i.a) / (1 - w.b * i.b);
  for (const [name, i, w] of [['left', left, wingL], ['right', right, wingR]] as const) add(`AC-AC ${name} kink from the cover glass (undimensioned; AB-AB's 11.10)`, kx.transitionFromFront.mm, mm(kink(i, w)), 0.05);
  // Hand calculation: the transition across from the printed numbers, against the drawn kinks' spacing.
  const transition = base + 2 * (kx.transitionFromFront.mm - (body.thickness.mm + bump.top.mm - kx.strobeRecess.mm)) * tanHalf(kx.inner.mm);
  const kx0 = left.a + left.b * kink(left, wingL), kx1 = right.a + right.b * kink(right, wingR);
  add(`AC-AC transition, Ø6.00 + 2 (11.10 - 9.03) tan 48° = ${transition.toFixed(2)}, against the drawn kinks' spacing`, transition, (kx1 - kx0) / px, 0.2);
  // The negative control for one circular cone: AB-AB's 112° here would cross the strobe's face 6.00 apart and fan out
  // 1.5 wider at 11.10; the drawn lines are AC-AC's 96°, 16° narrower.
  add('negative control: the inner cone is narrower across than down (1 = AC-AC\'s drawn angle over 10° under AB-AB\'s 112°)', 1, k.inner.mm - inner > 10 ? 1 : 0, 0);
}

export function sectionReadings(pdf = PDF): Measured[] {
  const { out, add } = collector();
  sectionABReadings(render(pdf, sectionAB), add);
  sectionACReadings(render(pdf, sectionAC), add);
  return out;
}

/**
 * Sheet 2's MagSafe view, calibrated on its extension lines: across, the 0.00 and 58.47 lines on a row 4 above the
 * phone; down, the 0.00 and -104.21 lines on a column 3 left of it. The other dimensioned lines check it. Then the clear
 * area's arcs (crossings on rays from the product centre, fitted to a circle), its straight sides, its corners (traced at
 * 4800 dpi against a blend and a sharp corner), and the magnetic zone's top and arc.
 */
export function magsafeReadings(pdf = PDF): Measured[] {
  const r = magsafeView, g = render(pdf, r);
  const { out, add } = collector();
  const rowAbove = Math.round(toPx(r, [0, -4])[1]), rowBelow = Math.round(toPx(r, [0, 134])[1]);
  const colLeft = Math.round(toPx(r, [-3, 0])[0]), colRight = Math.round(toPx(r, [70.3, 0])[0]);
  const xAt = (row: number, m: number, c: Calibration = r) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(c, [m, 0])[0]);
  const yAt = (col: number, m: number, c: Calibration = r) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(c, [0, m])[1]);
  const [x0, x1] = [0, 58.47].map((m) => xAt(rowAbove, m));
  const [y0, y1] = [0, 104.21].map((m) => yAt(colLeft, m));
  const sx = (x1 - x0) / 58.47, sy = (y1 - y0) / 104.21;
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [x0, y0] };
  const X = (px: number) => (px - cal.origin[0]) / cal.pxPerMm, Y = (px: number) => (px - cal.origin[1]) / cal.pxPerMm;
  add('MagSafe view px/mm across (calibration: the 0.00 and 58.47 lines)', r.pxPerMm, sx, 0.05);
  add('MagSafe view px/mm down (calibration: the 0.00 and -104.21 lines)', r.pxPerMm, sy, 0.05);
  add('MagSafe view datum across (px)', r.origin[0], x0, 1);
  add('MagSafe view datum down (px)', r.origin[1], y0, 1);
  add('MagSafe view 33.12 line across, above (dimensioned)', magsafeSides.cameraZone.across.mm, X(xAt(rowAbove, 33.12, cal)), 0.03);
  for (const m of [magsafeSides.sideFrom, magsafe.fromSide, magsafeSides.sideTo]) add(`MagSafe view ${m.mm.toFixed(2)} line across, below (dimensioned)`, m.mm, X(xAt(rowBelow, m.mm, cal)), 0.03);
  add('MagSafe view -33.12 line down, left (dimensioned)', magsafe.zoneFrom!.mm, Y(yAt(colLeft, 33.12, cal)), 0.03);
  for (const m of [magsafeSides.compass.fromTop, magsafeSides.straightFrom, magsafe.fromTop, magsafeSides.straightTo]) add(`MagSafe view -${m.mm.toFixed(2)} line down, right (dimensioned)`, m.mm, Y(yAt(colRight, m.mm, cal)), 0.03);
  // The width on a row 60 down: at 85 (the 12 mini's row) a hatch line meets the right edge (one 14 px run, 64.06).
  const row60 = Math.round(toPx(cal, [0, 60])[1]);
  add('the phone\'s width on the MagSafe view, 60 down (64.21)', body.width.mm, X(xAt(row60, body.width.mm, cal)) - X(xAt(row60, 0, cal)), 0.05);

  // The clear area's arcs: crossings within 0.25 of R28.75 on rays every 5° from the product centre, clear of the
  // straight sides (within 25° of the horizontal) and of the centre line (within 5° of the vertical).
  const c: [number, number] = [magsafe.fromSide.mm, magsafe.fromTop.mm], R = magsafe.diameter.mm / 2;
  const P: [number, number][] = [];
  for (let a = 30; a <= 330; a += 5) {
    if (a > 150 && a < 210) continue;
    if (Math.abs(a - 90) < 6 || Math.abs(a - 270) < 6) continue;
    const t = (a * Math.PI) / 180, d: [number, number] = [Math.cos(t), Math.sin(t)];
    const o = toPx(cal, c), start = (R - 1.5) * cal.pxPerMm;
    const rs = runs(g, [o[0] + d[0] * start, o[1] + d[1] * start], d, Math.round(3 * cal.pxPerMm)).map((q) => R - 1.5 + q.at / cal.pxPerMm).filter((x) => Math.abs(x - R) < 0.25);
    if (rs.length === 1) P.push([c[0] + d[0] * rs[0], c[1] + d[1] * rs[0]]);
  }
  const f = fitCircle(P);
  add(`clear area's arcs: centre across (fitted to ${P.length} crossings; worst ${f.worst.toFixed(3)} off)`, magsafe.fromSide.mm, f.centre[0], 0.05);
  add('clear area\'s arcs: centre down (both arcs on one circle round the product centre)', magsafe.fromTop.mm, f.centre[1], 0.05);
  add('clear area\'s arcs: Ø (2X R28.75)', magsafe.diameter.mm, 2 * f.radius, 0.05);
  // Its straight sides on rows every 1 mm from 57 to 74 down, off the centre line at 65.74 and where a hatch line meets
  // the side (the run wider than the line's 9 px).
  for (const side of [magsafeSides.sideFrom, magsafeSides.sideTo]) {
    const xs = Array.from({ length: 18 }, (_, i) => 57 + i).filter((y) => Math.abs(y - 65.74) > 0.5).flatMap((y) => {
      const q = runNear(g, [0, Math.round(toPx(cal, [0, y])[1])], [1, 0], g.width - 1, toPx(cal, [side.mm, 0])[0]);
      return q.width <= 10 ? [X(q.at)] : [];
    });
    add(`clear area's straight side at ${side.mm.toFixed(2)} (${xs.length} rows, 57 to 74 down, clear of hatch lines)`, side.mm, mean(xs), 0.03);
  }
  out.push(...cornerReadings(pdf, cal));

  // The zone: its top on columns 15 and 50 across (the camera corner's bottom and the open top's); its arc's lowest
  // point down columns 0.75 either side of the centre line; its crossings of x = 10 and x = 50, against the circle
  // through (0, 104.21) and (64.21, 104.21) of R49.39 (centred 66.68 down, derived).
  const zr = magsafe.zoneRadius!.mm, half = body.width.mm / 2;
  const zc = magsafe.zoneSidesTo!.mm - Math.sqrt(zr * zr - half * half);
  for (const x of [15, 50]) add(`magnetic zone's top at ${x} across (-33.12)`, magsafe.zoneFrom!.mm, Y(yAt(Math.round(toPx(cal, [x, 0])[0]), 33.12, cal)), 0.03);
  const low = mean([half - 0.75, half + 0.75].map((x) => Y(yAt(Math.round(toPx(cal, [x, 0])[0]), zc + zr, cal)) + (zr - Math.sqrt(zr * zr - 0.75 * 0.75))));
  add(`magnetic zone's arc, its lowest point (centre ${zc.toFixed(2)} down, derived, + R49.39)`, zc + zr, low, 0.05);
  for (const x of [10, 50]) {
    const at = zc + Math.sqrt(zr * zr - (x - half) ** 2);
    add(`magnetic zone's arc at x = ${x} (${at.toFixed(2)})`, at, Y(yAt(Math.round(toPx(cal, [x, 0])[0]), at, cal)), 0.05);
  }
  // The negative control: R49.39 centred on the product centre (65.74, as the 12 mini's) would bottom out 0.94 higher.
  add('negative control: centred on the product centre, R49.39\'s lowest point would be 115.13 (1 = the drawn one is over 0.5 lower)', 1, low - (magsafe.fromTop.mm + zr) > 0.5 ? 1 : 0, 0);
  return out;
}

/**
 * The clear area's four corners at 4800 dpi: on each row from the straight side's dimensioned end (55.66, 75.82) out to
 * 0.6 past it, how far the outline's inner edge has left the straight side's (its median 0.2 to 0.6 before that end),
 * against a blend of R2.41 tangent at the dimensioned end and a sharp corner where the circle meets the side (55.19,
 * 76.29: 0.47 past the end). Further out the two converge on the circle. Rows where a hatch line meets the outline (off
 * both by over 0.06) are passed over.
 */
function cornerReadings(pdf: string, cal: Calibration): Measured[] {
  const { out, add } = collector();
  const k = 4, s = cal.pxPerMm * k;
  const O: [number, number] = [(magsafeView.crop.x + cal.origin[0]) * k, (magsafeView.crop.y + cal.origin[1]) * k];
  const R = magsafe.diameter.mm / 2, rb = magsafeSides.blendRadius.mm;
  const cx = (magsafeSides.sideFrom.mm + magsafeSides.sideTo.mm) / 2, h = (magsafeSides.sideTo.mm - magsafeSides.sideFrom.mm) / 2;
  const cy = magsafe.fromTop.mm, d = cy - magsafeSides.straightFrom.mm;
  const circle = (dy: number) => Math.sqrt(R * R - dy * dy);
  const blendEnd = (R * d) / (R - rb); // where the blend meets the circle, |dy|
  const blend = (dy: number) => (dy <= d ? h : dy < blendEnd ? h - rb + Math.sqrt(rb * rb - (dy - d) ** 2) : circle(dy));
  const sharp = (dy: number) => Math.min(h, circle(dy));
  const errs = { blend: [] as number[], sharp: [] as number[] };
  for (const [side, end] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const sideMm = cx + side * h, endMm = cy + end * d;
    const xA = Math.round(O[0] + (sideMm - side * 2.5) * s), xB = Math.round(O[0] + (sideMm + side * 0.6) * s);
    const yA = Math.round(O[1] + (endMm - end * 0.7) * s), yB = Math.round(O[1] + (endMm + end * 1.1) * s);
    const crop = { x: Math.min(xA, xB), y: Math.min(yA, yB), width: Math.abs(xB - xA), height: Math.abs(yB - yA) };
    const g: Gray = render(pdf, { page: magsafeView.page, dpi: magsafeView.dpi * k, crop });
    const lineX = Math.round(O[0] + sideMm * s) - crop.x;
    // The inner edge (toward the centre) of the ink run on the side line, as a distance from the centre column.
    const inner = (yy: number) => {
      if (g.at(lineX, yy) >= 128) return NaN;
      let x = lineX;
      while (x - side >= 0 && x - side < g.width && g.at(x - side, yy) < 128) x -= side;
      return Math.abs((crop.x + x - O[0]) / s - cx);
    };
    const yy = (mm: number) => Math.round(O[1] + mm * s) - crop.y;
    const straight = median(Array.from({ length: 9 }, (_, i) => inner(yy(endMm - end * (0.2 + 0.05 * i)))).filter(Number.isFinite));
    for (let t = 0; t <= 0.6; t += 0.025) {
      const y = endMm + end * t, dy = Math.abs(y - cy);
      const dev = straight - inner(yy(y));
      const [eb, es] = [dev - (h - blend(dy)), dev - (h - sharp(dy))];
      if (!Number.isFinite(dev) || (Math.abs(eb) > 0.06 && Math.abs(es) > 0.06)) continue;
      errs.blend.push(eb);
      errs.sharp.push(es);
    }
  }
  const [b, sh] = [rms(errs.blend), rms(errs.sharp)];
  add(`clear area's corners: a R${rb} blend tangent at 55.66 / 75.82, RMS off over ${errs.blend.length} rows (mm)`, 0, b, 0.015);
  add(`negative control: a sharp corner at 55.19 / 76.29 fits worse, RMS ${sh.toFixed(3)} (1 = over twice the blend's)`, 1, sh > 2 * b ? 1 : 0, 0);
  return out;
}

export const remeasure = (pdf = PDF): Measured[] => [
  ...family(phone, { back: detailY, front: frontView, receiver: receiverView, bottom: bottomView }, pdf, {
    // The bump's sides crossed 17 in from the side and the top; the front view's row 100 below the top, below every
    // button. The active area's bottom-left diagonal runs along a hatch line that starts on the arc (the two make one
    // long run), so that corner is left out.
    bumpScanAt: 17,
    frontRow: 100,
    activeCorners: ['top-left', 'top-right', 'bottom-right'],
  }),
  ...micReadings(pdf),
  ...sectionReadings(pdf),
  ...magsafeReadings(pdf),
];

export const hasPdf = () => existsSync(PDF);

if (import.meta.main) console.log(report(remeasure()));
