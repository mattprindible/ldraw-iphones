// Re-measures every scaled value in drawing.ts from the PDF (the family's procedures, iphone/measure.ts); and checks the
// rear mic, the flash's keepout sections (G-G, K-K) and MagSafe's keepouts against what the drawing draws.
//
//   node iphone-13/measure.ts   → a table: recorded, measured, the difference
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { remeasure as family, report, type Measured } from '../../measure.ts';
import { cleanCircleAt, lineNear, render, runs, toPx, type Calibration, type Gray } from '../../../src/raster.ts';
import { body, bottomView, bump, detailD, flash, flashKeepout, flashKeepoutAcross, frontView, magsafe, magsafeExtras, magsafeView, phone, rearMic, receiverView, sectionGG, sectionKK } from './drawing.ts';

export const PDF = join(import.meta.dirname, '..', '..', 'drawings', 'iphone-13.pdf');

const mean = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length;
const deg = (rad: number) => (rad * 180) / Math.PI;
const tanHalf = (fullDeg: number) => Math.tan((fullDeg / 2) * (Math.PI / 180));
function collector() {
  const out: Measured[] = [];
  const add = (name: string, recorded: number, measured: number, within: number, known?: string) => out.push({ name, kind: 'check', recorded, measured, within, ...(known ? { known } : {}) });
  return { out, add };
}
type Add = ReturnType<typeof collector>['add'];

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
 * Detail D's rear mic (the family's re-measurement doesn't read it): the circle at its dimensioned centre, on Detail D's
 * calibration (which the family's checks confirm), chords offset off the 10.43 and -25.69 lines that end at its centre.
 */
export function micReadings(pdf = PDF): Measured[] {
  const r = detailD, g = render(pdf, r);
  const { out, add } = collector();
  const c = cleanCircleAt(g, toPx(r, [rearMic.fromSide.mm, rearMic.fromTop.mm]), (rearMic.diameter.mm / 2) * r.pxPerMm, [30, -30, 50, -50]);
  const stroke = c.stroke / r.pxPerMm;
  add('rear mic centre across (dimensioned 10.43: the ordinate above Detail D)', rearMic.fromSide.mm, (c.centre[0] - r.origin[0]) / r.pxPerMm, 0.05);
  add('rear mic centre down (dimensioned 25.69)', rearMic.fromTop.mm, (c.centre[1] - r.origin[1]) / r.pxPerMm, 0.05);
  add(`rear mic Ø (dimensioned 2.40, the outer circle); drawn ${stroke.toFixed(2)} wide`, rearMic.diameter.mm, c.diameter / r.pxPerMm, Math.max(0.05, stroke));
  // Read with the numbers swapped (25.69 across, 10.43 down) the place lands inside the flash (0.6 from its centre, in
  // its Ø6.28): no Ø2.40 circle is drawn there.
  let swapped = 'none';
  try {
    const w = cleanCircleAt(g, toPx(r, [rearMic.fromTop.mm, rearMic.fromSide.mm]), (rearMic.diameter.mm / 2) * r.pxPerMm, [30, -30, 50, -50]);
    swapped = `Ø${(w.diameter / r.pxPerMm).toFixed(2)}`;
  } catch {}
  add(`negative control: at (25.69, 10.43), the numbers swapped, the circle found: ${swapped} (1 = none, or over 1 mm off Ø2.40)`, 1, swapped === 'none' || Math.abs(Number(swapped.slice(1)) - rearMic.diameter.mm) > 1 ? 1 : 0, 0);
  // The bump's top's bottom-left corner: centre (3.64 + 8.45, 32.48 - 8.45); the mic's centre is 2.35 from it, well
  // inside R8.45, so the builder puts it flush on the bump's top.
  const corner: [number, number] = [bump.topFrom.mm + bump.topRadius.mm, bump.topFrom.mm + bump.topSize.mm - bump.topRadius.mm];
  add('rear mic centre inside the bump top\'s R8.45 corner (its distance from the corner\'s centre, under 8.45 - 1.2)', 0, Math.max(0, Math.hypot(rearMic.fromSide.mm - corner[0], rearMic.fromTop.mm - corner[1]) - (bump.topRadius.mm - rearMic.diameter.mm / 2)), 0);
  return out;
}

/**
 * Sheet 2's Section G-G (down the phone through the flash): the scale from the cover glass's face (the left edge) to the
 * 11.10 extension line; the faces on the right (the back glass beyond the bump, the bump's glass, the strobe under it,
 * camera 2's ring below); the cone's four lines (the first ink right of the face, row by row, each fitted), their
 * crossings (the apex, the kinks) and angles; the inner cone's width at the strobe's face (K-K's Ø6.00) and at the
 * glass's (the flash's Ø6.28).
 */
function sectionGGReadings(g: Gray, add: Add) {
  const r = sectionGG, k = flashKeepout;
  const across = (y: number, expect: number) => lineNear(g, [0, y], [1, 0], g.width - 1, expect);
  // Row 2700 crosses the 11.10 extension line (it runs ~1862 to 2867) and the front face.
  const face = across(2700, r.origin[0]);
  const px = (across(2700, face + k.transitionFromFront!.mm * r.pxPerMm) - face) / k.transitionFromFront!.mm;
  const mm = (x: number) => (x - face) / px;
  add('Section G-G px/mm (calibration: the cover glass face to the 11.10 line)', r.pxPerMm, px, 0.05);
  add('Section G-G cover glass face (px)', r.origin[0], face, 1);
  // The faces: the back glass above the bump and below camera 2 (rows 1000, 2950), the bump's glass above and below the
  // strobe (rows 1200, 1750), the strobe (rows 1400, 1550), camera 2's ring (rows 2200, 2600: the cut runs 1.87 beside
  // its centre).
  const T = body.thickness.mm, top = T + bump.top.mm, rings = T + bump.rings.mm;
  const back = mean([1000, 2950].map((y) => mm(across(y, face + T * px))));
  const glass = mean([1200, 1750].map((y) => mm(across(y, face + top * px))));
  const strobe = mean([1400, 1550].map((y) => mm(across(y, face + (top - 0.15) * px))));
  const ring = mean([2200, 2600].map((y) => mm(across(y, face + rings * px))));
  add('G-G the back glass beyond the bump (7.65)', T, back, 0.05);
  // The 13 mini's section draws its bump's glass at 9.07 and camera 2's ring at 10.16 (7.65 + 2.51); this one is drawn
  // the same, 0.08 under this phone's 1.50 and 2.59: the title block's ±0.08, and a finding (drawing.ts).
  add(`G-G the bump's glass beside the flash, 7.65 + 1.50 (drawn ${glass.toFixed(3)}: as the 13 mini's 9.07)`, top, glass, 0.08);
  add(`G-G camera 2's ring below the flash, 7.65 + 2.59 (drawn ${ring.toFixed(3)}: the 13 mini's 7.65 + 2.51)`, rings, ring, 0.09);
  add(`G-G the strobe's face under the bump's glass (drawn ${strobe.toFixed(3)}; the 13 mini's 0.10)`, flashKeepoutAcross.strobeRecess.mm, glass - strobe, 0.02);
  // The cone's lines: the first ink right of the face on each row (inside the cone is hatched, outside white). Below the
  // lower kink the 11.10 extension line and camera 2's ring come first: start right of the line.
  const first = (y: number, x0: number) => {
    const rs = runs(g, [x0, y], [1, 0], g.width - 1 - x0);
    return rs.length ? x0 + rs[0].at : NaN;
  };
  const from = Math.round(face + (top + 0.15) * px);
  const line = (a: number, b: number, x0 = from) => fitLine(rowsBy(a, b).map((y) => [first(y, x0), y]));
  const upperOuter = line(350, 1080), upperInner = line(1145, 1280), lowerInner = line(1680, 1810);
  const lowerOuter = line(1900, 2700, Math.round(face + 11.2 * px));
  const offAxis = (l: Line) => 90 - deg(Math.atan(Math.abs(l.b)));
  const apex = meet(upperInner, lowerInner), kinks = [meet(upperInner, upperOuter), meet(lowerInner, lowerOuter)];
  kinks.forEach((q, i) => add(`G-G ${i ? 'lower' : 'upper'} kink, inner cone to outer, from the cover glass (11.10)`, k.transitionFromFront!.mm, mm(q[0]), 0.05));
  add('G-G inner cone, full angle as drawn (degrees; its lines are ~3 mm long)', k.inner.mm, offAxis(upperInner) + offAxis(lowerInner), 1);
  add('G-G outer cone, full angle as drawn (degrees)', k.outer!.mm, offAxis(upperOuter) + offAxis(lowerOuter), 1);
  add('G-G the apex midway between the kinks, down (mm: on the cone\'s axis)', 0, (apex[1] - (kinks[0][1] + kinks[1][1]) / 2) / px, 0.1);
  // The derived apex against the drawn lines' crossing: the cone is drawn from the thin glass, nearer the front.
  add(`G-G inner cone's apex from the cover glass (derived 7.03; its lines fitted to ${upperInner.n} and ${lowerInner.n} rows, crossed)`, k.apexFromFront!.mm, mm(apex[0]), 0.1);
  const width = (atMm: number) => {
    const x = face + atMm * px;
    return ((x - lowerInner.a) / lowerInner.b - (x - upperInner.a) / upperInner.b) / px;
  };
  add('G-G inner cone at the strobe\'s face (K-K\'s Ø6.00)', k.innerBaseDiameter!.mm, width(strobe), 0.05);
  add('G-G inner cone at the bump\'s glass, drawn (the flash\'s Ø6.28)', flash.diameter.mm, width(glass), 0.05);
  // Hand calculation from the printed numbers alone: the 112° cone from Ø6.28 at 9.15 out to 11.10 (the transition),
  // against the drawn kinks' spacing. The section draws the cone from its thin glass (9.08) at 112.5°, so its kinks
  // stand 0.14 further out each side: the same calculation from the glass as drawn closes it.
  const spacing = Math.abs(kinks[1][1] - kinks[0][1]) / px;
  const transition = flash.diameter.mm + 2 * (k.transitionFromFront!.mm - top) * tanHalf(k.inner.mm);
  add(`G-G transition, Ø6.28 + 2 (11.10 - 9.15) tan 56° = ${transition.toFixed(2)}, against the drawn kinks' spacing`, transition, spacing, 0.1,
    'the section draws the cone from its glass at 9.08 (0.07 thin) and at 112.5°: 0.21 of the 0.28 from the glass, the rest the half degree (next line)');
  const drawnTransition = flash.diameter.mm + 2 * (k.transitionFromFront!.mm - glass) * tanHalf(k.inner.mm);
  add(`G-G transition from the glass as drawn, Ø6.28 + 2 (11.10 - ${glass.toFixed(2)}) tan 56° = ${drawnTransition.toFixed(2)}, against the drawn kinks' spacing`, drawnTransition, spacing, 0.1);
  // The negative control: read from the back glass, "11.10 to cover glass" would put the kinks 7.65 further out (18.75
  // from the front), off the section's drawn ones by its whole thickness.
  add('negative control: read from the back glass the transition would be 18.75 from the front (1 = the drawn kinks are over 5 mm from it)', 1, Math.abs(mm(kinks[0][0]) - (T + k.transitionFromFront!.mm)) > 5 ? 1 : 0, 0);
  return { strobe };
}

/**
 * Sheet 2's Section K-K (across the phone through the flash, drawn lying, the back down): the scale from the Ø6.00
 * extension lines; the cover glass's face (the top edge), the back glass (right of the bump), the bump's glass and the
 * strobe's face; the inner cone's lines (row by row inward from outside it, below the bezel) and the outer cone's
 * (column by column, the first ink below the phone), their crossings and angles.
 */
function sectionKKReadings(g: Gray, add: Add, ggStrobe: number) {
  const r = sectionKK, kx = flashKeepoutAcross, k = flashKeepout;
  const base = k.innerBaseDiameter!.mm;
  // Row 50, above the phone, crosses only the Ø6.00 extension lines.
  const [l, rr] = [-1, 1].map((s) => lineNear(g, [0, 50], [1, 0], g.width - 1, r.origin[0] + (s * base * r.pxPerMm) / 2));
  const px = (rr - l) / base, axis = (l + rr) / 2;
  add('Section K-K px/mm (calibration: the Ø6.00 lines)', r.pxPerMm, px, 0.05);
  add('Section K-K the flash\'s axis across, the Ø6.00 lines\' midpoint (px)', r.origin[0], axis, 1);
  const down = (x: number, expect: number) => lineNear(g, [x, 0], [0, 1], g.height - 1, expect);
  const face = down(2700, r.origin[1]);
  const mm = (y: number) => (y - face) / px;
  const T = body.thickness.mm, top = T + bump.top.mm;
  add('Section K-K cover glass face (px)', r.origin[1], face, 1);
  add('K-K the back glass, right of the bump (7.65)', T, mm(down(2700, face + T * px)), 0.05);
  // The bump's glass either side of the flash (columns 1.2 mm outside its Ø6.28 edge); the strobe's face on columns
  // every 0.25 mm within 2.5 of the axis, the median of those crossing it as a thin line (not merged with a hatch line).
  const glass = mean([-1, 1].map((s) => mm(down(Math.round(axis + s * 4.35 * px), face + top * px))));
  const strobe = [...rowsBy(-10, 10, 1)].flatMap((i) => {
    const q = runs(g, [Math.round(axis + i * 0.25 * px), 0], [0, 1], g.height - 1).reduce((a, b) => (Math.abs(b.at - (face + ggStrobe * px)) < Math.abs(a.at - (face + ggStrobe * px)) ? b : a));
    return q.width <= 7 ? [mm(q.at)] : [];
  }).sort((p, q) => p - q);
  const strobeAt = strobe[Math.floor(strobe.length / 2)];
  add(`K-K the bump's glass beside the flash, 7.65 + 1.50 (drawn ${glass.toFixed(3)})`, top, glass, 0.08);
  add(`K-K the strobe's face against G-G's (one strobe in both; ${strobe.length} columns)`, ggStrobe, strobeAt, 0.03);
  // The inner lines (x = a + b·y): rows between the bezel's last line and the kinks, each from outside the cone inward.
  const inward = (y: number, x0: number, dir: 1 | -1) => {
    const rs = runs(g, [x0, y], [dir, 0], 400);
    return rs.length ? x0 + dir * rs[0].at : NaN;
  };
  const rows = rowsBy(Math.round(face + 9.9 * px), Math.round(face + 10.95 * px), 2);
  const left = fitLine(rows.map((y) => [inward(y, Math.round(axis - 7.3 * px), 1), y]));
  const right = fitLine(rows.map((y) => [inward(y, Math.round(axis + 7.3 * px), -1), y]));
  // The outer lines (y = a + b·x): the first ink below the phone's lowest face (camera 1's ring), column by column.
  const below = Math.round(face + 10.3 * px);
  const firstDown = (x: number) => {
    const rs = runs(g, [x, below], [0, 1], g.height - 1 - below);
    return rs.length ? below + rs[0].at : NaN;
  };
  const wingL = fitLine(rowsBy(Math.round(axis - 16.1 * px), Math.round(axis - 6.1 * px)).map((x) => [firstDown(x), x]));
  const wingR = fitLine(rowsBy(Math.round(axis + 6.1 * px), Math.round(axis + 16.1 * px)).map((x) => [firstDown(x), x]));
  const inner = deg(Math.atan(Math.abs(left.b))) + deg(Math.atan(Math.abs(right.b)));
  const outer = 180 - deg(Math.atan(Math.abs(wingL.b))) - deg(Math.atan(Math.abs(wingR.b)));
  add(`K-K inner cone, full angle as drawn (degrees; fitted to ${left.n} and ${right.n} rows)`, kx.inner.mm, inner, 1);
  add(`K-K outer cone, full angle as drawn (degrees; fitted to ${wingL.n} and ${wingR.n} columns)`, k.outer!.mm, outer, 1);
  const [ax, ay] = meet(left, right);
  add('K-K inner cone\'s apex on the flash\'s axis (mm across)', 0, (ax - axis) / px, 0.05);
  add('K-K inner cone\'s apex from the cover glass (derived 6.32; the drawn lines crossed)', kx.apexFromFront.mm, mm(ay), 0.1);
  const widthAt = (y: number) => ((right.a + right.b * y) - (left.a + left.b * y)) / px;
  add('K-K inner cone at the strobe\'s face (dimensioned Ø6.00)', base, widthAt(face + strobeAt * px), 0.05);
  // The kinks: an inner line x = a + b·y meets a wing y = c + d·x where y = (c + d·a) / (1 - d·b).
  const kink = (i: Line, w: Line) => (w.a + w.b * i.a) / (1 - w.b * i.b);
  for (const [name, i, w] of [['left', left, wingL], ['right', right, wingR]] as const) add(`K-K ${name} kink from the cover glass (undimensioned; G-G's 11.10)`, kx.transitionFromFront.mm, mm(kink(i, w)), 0.05);
  // Hand calculation: the transition across from the printed numbers, against the drawn kinks' spacing.
  const transition = flash.diameter.mm + 2 * (kx.transitionFromFront.mm - top) * tanHalf(kx.inner.mm);
  const kx0 = left.a + left.b * kink(left, wingL), kx1 = right.a + right.b * kink(right, wingR);
  add(`K-K transition, Ø6.28 + 2 (11.10 - 9.15) tan 48° = ${transition.toFixed(2)}, against the drawn kinks' spacing (drawn from the glass at 9.10)`, transition, (kx1 - kx0) / px, 0.1);
  // The negative control for one circular cone: G-G's 112° here would fan out wider; the drawn lines are K-K's 96°.
  add('negative control: the inner cone is narrower across than down (1 = K-K\'s drawn angle over 10° under G-G\'s 112°)', 1, k.inner.mm - inner > 10 ? 1 : 0, 0);
}

export function sectionReadings(pdf = PDF): Measured[] {
  const { out, add } = collector();
  const { strobe } = sectionGGReadings(render(pdf, sectionGG), add);
  sectionKKReadings(render(pdf, sectionKK), add, strobe);
  return out;
}

/**
 * Sheet 2's MagSafe view, calibrated on its extension lines: across, the 0.00 and 64.91 lines on a row 4.5 above the
 * phone; down, the 0.00 and -110.52 lines on a column 3.2 left of it. The other dimensioned lines check it. Then the clear
 * area's circle (crossings on rays from the product centre, fitted), and the magnetic zone's top and arc.
 */
export function magsafeReadings(pdf = PDF): Measured[] {
  const r = magsafeView, g = render(pdf, r);
  const { out, add } = collector();
  const rowAbove = Math.round(toPx(r, [0, -4.5])[1]), rowBelow = Math.round(toPx(r, [0, 148.4])[1]);
  const colLeft = Math.round(toPx(r, [-3.2, 0])[0]), colRight = Math.round(toPx(r, [80.3, 0])[0]);
  const xAt = (row: number, m: number, c: Calibration = r) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(c, [m, 0])[0]);
  const yAt = (col: number, m: number, c: Calibration = r) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(c, [0, m])[1]);
  const { compass, cameraZone } = magsafeExtras;
  const [x0, x1] = [0, compass.fromSide.mm].map((m) => xAt(rowAbove, m));
  const [y0, y1] = [0, magsafe.zoneSidesTo!.mm].map((m) => yAt(colLeft, m));
  const sx = (x1 - x0) / compass.fromSide.mm, sy = (y1 - y0) / magsafe.zoneSidesTo!.mm;
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [x0, y0] };
  const X = (px: number) => (px - cal.origin[0]) / cal.pxPerMm, Y = (px: number) => (px - cal.origin[1]) / cal.pxPerMm;
  add('MagSafe view px/mm across (calibration: the 0.00 and 64.91 lines)', r.pxPerMm, sx, 0.05);
  add('MagSafe view px/mm down (calibration: the 0.00 and -110.52 lines)', r.pxPerMm, sy, 0.05);
  add('MagSafe view datum across (px)', r.origin[0], x0, 1);
  add('MagSafe view datum down (px)', r.origin[1], y0, 1);
  add('MagSafe view 39.12 line across, above (dimensioned)', cameraZone.across.mm, X(xAt(rowAbove, cameraZone.across.mm, cal)), 0.03);
  add('MagSafe view 35.76 line across, below (dimensioned)', magsafe.fromSide.mm, X(xAt(rowBelow, magsafe.fromSide.mm, cal)), 0.03);
  add('MagSafe view -40.12 line down, left (dimensioned)', magsafe.zoneFrom!.mm, Y(yAt(colLeft, magsafe.zoneFrom!.mm, cal)), 0.03);
  for (const m of [compass.fromTop, magsafe.fromTop]) add(`MagSafe view -${m.mm.toFixed(2)} line down, right (dimensioned)`, m.mm, Y(yAt(colRight, m.mm, cal)), 0.03);
  const row85 = Math.round(toPx(cal, [0, 85])[1]);
  add('the phone\'s width on the MagSafe view, 85 down (71.52)', body.width.mm, X(xAt(row85, body.width.mm, cal)) - X(xAt(row85, 0, cal)), 0.05);

  // The clear area's circle: crossings within 0.25 of R28.75 on rays every 5° from the product centre, clear of the
  // centre lines (within 6° of each axis) and of the two leaders that cross it (Ø57.50's at about 155°, the clear
  // area's note's at about 27°), keeping rays with one crossing only (a hatch line meeting the circle gives two).
  const c: [number, number] = [magsafe.fromSide.mm, magsafe.fromTop.mm], R = magsafe.diameter.mm / 2;
  const P: [number, number][] = [];
  for (let a = 0; a < 360; a += 5) {
    if ([0, 90, 180, 270, 360].some((b) => Math.abs(a - b) < 6) || [27, 155].some((b) => Math.abs(a - b) < 9)) continue;
    const t = (a * Math.PI) / 180, d: [number, number] = [Math.cos(t), Math.sin(t)];
    const o = toPx(cal, c), start = (R - 1.5) * cal.pxPerMm;
    const rs = runs(g, [o[0] + d[0] * start, o[1] + d[1] * start], d, Math.round(3 * cal.pxPerMm)).map((q) => R - 1.5 + q.at / cal.pxPerMm).filter((x) => Math.abs(x - R) < 0.25);
    if (rs.length === 1) P.push([c[0] + d[0] * rs[0], c[1] + d[1] * rs[0]]);
  }
  const f = fitCircle(P);
  add(`clear area's circle: centre across (fitted to ${P.length} crossings; worst ${f.worst.toFixed(3)} off)`, magsafe.fromSide.mm, f.centre[0], 0.05);
  add('clear area\'s circle: centre down (round the product centre)', magsafe.fromTop.mm, f.centre[1], 0.05);
  add('clear area\'s circle: Ø (dimensioned 57.50)', magsafe.diameter.mm, 2 * f.radius, 0.05);

  // The zone: its top on columns 15 and 50 across (the camera corner's bottom and the open top's); its arc's lowest
  // point down columns 0.75 either side of the centre line; its crossings of x = 5, 15, 56.52 and 66.52 (clear of the
  // R49.39 leader, which lands on the arc about 2 across), against the circle through (0, 110.52) and (71.52, 110.52)
  // of R49.39, its centre derived.
  const zr = magsafe.zoneRadius!.mm, half = body.width.mm / 2;
  const zc = magsafe.zoneSidesTo!.mm - Math.sqrt(zr * zr - half * half);
  add(`hand calculation: the zone's arc's centre, 110.52 - √(49.39² - 35.76²) = ${zc.toFixed(3)} down, 3.10 below the product centre`, magsafe.fromTop.mm + 3.1, zc, 0.01);
  for (const x of [15, 50]) add(`magnetic zone's top at ${x} across (-40.12)`, magsafe.zoneFrom!.mm, Y(yAt(Math.round(toPx(cal, [x, 0])[0]), magsafe.zoneFrom!.mm, cal)), 0.03);
  const low = mean([half - 0.75, half + 0.75].map((x) => Y(yAt(Math.round(toPx(cal, [x, 0])[0]), zc + zr, cal)) + (zr - Math.sqrt(zr * zr - 0.75 * 0.75))));
  add(`magnetic zone's arc, its lowest point (centre ${zc.toFixed(2)} down, derived, + R49.39)`, zc + zr, low, 0.05);
  for (const x of [5, 15, 56.52, 66.52]) {
    const at = zc + Math.sqrt(zr * zr - (x - half) ** 2);
    add(`magnetic zone's arc at x = ${x} (${at.toFixed(2)})`, at, Y(yAt(Math.round(toPx(cal, [x, 0])[0]), at, cal)), 0.05);
  }
  // The negative control: R49.39 centred on the product centre (as the 12's) would bottom out 3.10 higher.
  add(`negative control: centred on the product centre, R49.39's lowest point would be ${(magsafe.fromTop.mm + zr).toFixed(2)} (1 = the drawn one is over 2 mm lower)`, 1, low - (magsafe.fromTop.mm + zr) > 2 ? 1 : 0, 0);
  return out;
}

export const remeasure = (pdf = PDF): Measured[] => [
  ...family(phone, { back: detailD, front: frontView, receiver: receiverView, bottom: bottomView }, pdf, {
    // The bump outline's top-left corner runs into the back glass's heavy edge (a 0.33 mm stroke), so its diagonal
    // crosses the two as one: it's left out.
    bumpCorners: ['top-right', 'bottom-right', 'bottom-left'],
  }),
  ...micReadings(pdf),
  ...sectionReadings(pdf),
  ...magsafeReadings(pdf),
];

export const hasPdf = () => existsSync(PDF);

if (import.meta.main) console.log(report(remeasure()));
