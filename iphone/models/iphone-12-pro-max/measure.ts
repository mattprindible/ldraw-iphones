// Re-measures every scaled value in drawing.ts from the PDF (the family's procedures, iphone/measure.ts), and checks
// the rear mic, the flash's keepout section and MagSafe's keepouts against what the drawing draws (sheet 2 read upright:
// `upright`), as the 12 Pro's.
//
//   node iphone-12-pro-max/measure.ts   → a table: recorded, measured, the difference
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { remeasure as family, report, type Measured } from '../../measure.ts';
import { cleanCircleAt, lineNear, render, runs, toPx, type Calibration, type Gray, type Region } from '../../../src/raster.ts';
import { body, bottomView, bump, cameras, detailD, flashKeepout, frontView, magsafe, magsafeExtras, magsafeView, phone, rearMic, sectionGG } from './drawing.ts';

export const PDF = join(import.meta.dirname, '..', '..', 'drawings', 'iphone-12-pro-max.pdf');

/**
 * Sheet 2 is drawn a quarter turn anticlockwise on its page. A region of it, turned upright (a quarter turn
 * anticlockwise: the crop's right edge becomes its top), so that its views read as drawn and the regions' calibrations
 * (drawing.ts) apply: across to the right, down the page.
 */
export function upright(pdf: string, r: Region): Gray {
  const g = render(pdf, r);
  return { width: g.height, height: g.width, at: (x, y) => g.at(g.width - 1 - y, x) };
}

const mean = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length;
function collector() {
  const out: Measured[] = [];
  const add = (name: string, recorded: number, measured: number, within: number) => out.push({ name, kind: 'check', recorded, measured, within });
  return { out, add };
}

/** A line x = a + b·y through points (x, y), least squares, dropping points more than `tol` px off and refitting. */
function fitLine(P: [number, number][], tol = 3): { a: number; b: number; n: number } {
  let pts = P.filter(([x]) => Number.isFinite(x));
  let a = 0, b = 0;
  for (let pass = 0; pass < 4; pass++) {
    const my = mean(pts.map((p) => p[1])), mx = mean(pts.map((p) => p[0]));
    b = pts.reduce((s, [x, y]) => s + (x - mx) * (y - my), 0) / pts.reduce((s, [, y]) => s + (y - my) ** 2, 0);
    a = mx - b * my;
    pts = P.filter(([x, y]) => Number.isFinite(x) && Math.abs(x - (a + b * y)) < tol);
  }
  return { a, b, n: pts.length };
}
const meet = (l: { a: number; b: number }, m: { a: number; b: number }): [number, number] => {
  const y = (m.a - l.a) / (l.b - m.b);
  return [l.a + l.b * y, y];
};
/** A line's angle off the cone's axis (the section's horizontal), degrees. */
const offAxis = (l: { b: number }) => 90 - (Math.atan(Math.abs(l.b)) * 180) / Math.PI;

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
 * Detail D's rear mic (the family's re-measurement doesn't read it): the circle at its dimensioned centre, on the
 * region's calibration (which the family's checks confirm), chords offset off the extension lines through it (the
 * 33.69 line below it, the -30.89 line to its right, the Ø1.15 leader to its right and a little below).
 */
export function micReadings(pdf = PDF): Measured[] {
  const r = detailD, g = render(pdf, r);
  const { out, add } = collector();
  const c = cleanCircleAt(g, toPx(r, [rearMic.fromSide.mm, rearMic.fromTop.mm]), (rearMic.diameter.mm / 2) * r.pxPerMm, [20, -20, 25, -25]);
  const stroke = c.stroke / r.pxPerMm;
  add('rear mic centre across (dimensioned 33.69)', rearMic.fromSide.mm, (c.centre[0] - r.origin[0]) / r.pxPerMm, 0.05);
  add('rear mic centre down (dimensioned 30.89)', rearMic.fromTop.mm, (c.centre[1] - r.origin[1]) / r.pxPerMm, 0.05);
  add(`rear mic Ø (dimensioned 1.15, the outer circle); drawn ${stroke.toFixed(2)} wide`, rearMic.diameter.mm, c.diameter / r.pxPerMm, Math.max(0.05, stroke));
  // The negative control for the reading across and down: swapped, (30.89, 33.69) is on the bump's top between the
  // cameras, where no circle of the mic's size is drawn (the nearest ink, camera 2's ring, is several mm off).
  const sw = toPx(r, [rearMic.fromTop.mm, rearMic.fromSide.mm]), R = (rearMic.diameter.mm / 2) * r.pxPerMm;
  const ink = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => runs(g, sw, [dx, dy], Math.round(2 * R)).length);
  add(`negative control: read swapped, (30.89, 33.69) has no circle within 2 radii (${ink.join(', ')} crossings each way; 1 = none)`, 1, ink.every((n) => n === 0) ? 1 : 0, 0);
  // The mic's centre lies on the bump's flat top, not its slope (the builder refuses a slope): inside the top's
  // bottom-right corner arc.
  const t0 = bump.topFrom.mm, rr = bump.topRadius.mm, cx = t0 + bump.topSize.mm - rr, cy = t0 + bump.topHeight.mm - rr;
  const inCorner = Math.hypot(rearMic.fromSide.mm - cx, rearMic.fromTop.mm - cy);
  add(`the mic's centre ${inCorner.toFixed(2)} from the bump top's corner centre, inside its R${rr} (1 = on the flat top)`, 1, inCorner < rr - rearMic.diameter.mm / 2 ? 1 : 0, 0);
  return out;
}

/**
 * Sheet 2's Section G-G, upright: the scale from the cover glass's face (the left edge) to the 11.62 extension line;
 * then the 7.35 line, the section's other face (the back glass above the bump, the bump's top beside the flash, camera
 * 3's ring below it), the cone's four lines (the first ink right of a face, row by row, each fitted), their crossings
 * (the apex, the two kinks) and angles; and the hand calculation of the inner cone's width where it leaves the bump's
 * top, against the flash's Ø6.28.
 */
export function sectionReadings(pdf = PDF): Measured[] {
  const r = sectionGG, g = upright(pdf, r);
  const { out, add } = collector();
  const k = flashKeepout, top = body.thickness.mm + bump.top.mm, rings = body.thickness.mm + bump.rings.mm;
  const across = (y: number, expect: number) => lineNear(g, [0, y], [1, 0], g.width - 1, expect);
  // Row 3200 crosses the 11.62 extension line (it runs ~2330 to 3400) above its dimension line (~3400); row 2400 the
  // 7.35's (~1780 to 2600) above its dimension line (~2520).
  const face = across(3200, r.origin[0]);
  const px = (across(3200, r.origin[0] + k.transitionFromFront!.mm * r.pxPerMm) - face) / k.transitionFromFront!.mm;
  const mm = (x: number) => (x - face) / px;
  add('Section G-G px/mm (calibration: the cover glass face to the 11.62 line)', r.pxPerMm, px, 0.05);
  add('Section G-G cover glass face (px)', r.origin[0], face, 1);
  add('Section G-G 7.35 extension line (dimensioned)', k.apexFromFront!.mm, mm(across(2400, face + k.apexFromFront!.mm * px)), 0.03);
  const glass = [1300, 1350].map((y) => mm(across(y, face + body.thickness.mm * px)));
  add(`section's other face above the bump, the back glass (7.39), rows 1300 and 1350 (${glass.map((b) => b.toFixed(3)).join(', ')})`, body.thickness.mm, mean(glass), 0.05);
  const bumpFace = [1520, 1990].map((y) => mm(across(y, face + top * px)));
  add(`section's other face either side of the flash, the bump's top (7.39 + 1.26), rows 1520 and 1990 (${bumpFace.map((b) => b.toFixed(3)).join(', ')})`, top, mean(bumpFace), 0.05);
  const ring = [2200, 2650].map((y) => mm(across(y, face + rings * px)));
  add(`section's other face below the flash, camera 3's ring (7.39 + 2.79), rows 2200 and 2650 (${ring.map((b) => b.toFixed(3)).join(', ')})`, rings, mean(ring), 0.05);
  // The cone's lines: the first ink right of a face on each row (inside the cone is hatched, outside white).
  const first = (y: number, x0: number) => {
    const rs = runs(g, [x0, y], [1, 0], g.width - 1 - x0);
    return rs.length ? x0 + rs[0].at : NaN;
  };
  const rows = (a: number, b: number) => Array.from({ length: Math.floor((b - a) / 5) + 1 }, (_, i) => a + 5 * i);
  const pts = (a: number, b: number, from: number) => rows(a, b).map((y): [number, number] => [first(y, Math.round(face + from * px)), y]);
  // Upright rows: the upper outer line from below the 157° arc's arrowhead at its tip (~500) to its kink (~1195), the
  // upper inner from there until it nears the bump's top (~1570: below, hatch lines reach the face); the lower inner
  // right of the bump's top (~1960 to ~2080: below, it crosses camera 3's ring's rounded top corner) and right of the
  // ring's face (~2165 to ~2290); the lower outer right of the 11.62 extension line, from where it clears it (~2370) to
  // above the 157° arc's arrowhead at its tip (~2990).
  const upperOuter = fitLine(pts(520, 1180, top + 0.18)), upperInner = fitLine(pts(1210, 1560, top + 0.18));
  const lowerInner = fitLine([...pts(1960, 2080, top + 0.18), ...pts(2165, 2290, rings + 0.18)]);
  const lowerOuter = fitLine(pts(2375, 2990, k.transitionFromFront!.mm + 0.18));
  const apex = meet(upperInner, lowerInner), kinks = [meet(upperInner, upperOuter), meet(lowerInner, lowerOuter)];
  add(`inner cone's apex from the cover glass (its lines fitted to ${upperInner.n} and ${lowerInner.n} rows, crossed)`, k.apexFromFront!.mm, mm(apex[0]), 0.05);
  kinks.forEach((q, i) => add(`${i ? 'lower' : 'upper'} kink, inner cone to outer, from the cover glass (11.62)`, k.transitionFromFront!.mm, mm(q[0]), 0.05));
  add('the apex midway between the kinks, down (mm: on the cone\'s axis)', 0, (apex[1] - (kinks[0][1] + kinks[1][1]) / 2) / px, 0.1);
  // The flash's axis on sheet 1 is 10.11 down; camera 3's ring (Ø14.11 at 22.16) starts 15.105 down, 4.995 below it.
  // On G-G the ring's top corner meets the bump's top just right of it (a column 0.12 out, clear of the cone's line).
  const ringCol = Math.round(face + (top + 0.12) * px), axisMm = phone.flash.fromTop.mm, ringTopMm = cameras.ultraWide.fromTop.mm - cameras.ultraWide.ring.mm / 2;
  const mid = (kinks[0][1] + kinks[1][1]) / 2;
  const ringRow = lineNear(g, [ringCol, 0], [0, 1], g.height - 1, mid + (ringTopMm - axisMm) * px);
  add(`camera 3's ring top on G-G (where it meets the bump's top) below the kinks' midpoint, against ${ringTopMm.toFixed(3)} - ${axisMm} (sheet 1)`, ringTopMm - axisMm, (ringRow - mid) / px, 0.05);
  const fromKinks = mm((kinks[0][0] + kinks[1][0]) / 2) - ((kinks[1][1] - kinks[0][1]) / 2 / px) / Math.tan((k.inner.mm / 2) * (Math.PI / 180));
  add('the apex from the kinks and the dimensioned 135°: their mean depth less half their spread / tan 67.5°', k.apexFromFront!.mm, fromKinks, 0.05);
  add('inner cone, full angle as drawn (degrees)', k.inner.mm, offAxis(upperInner) + offAxis(lowerInner), 1);
  add('outer cone, full angle as drawn (degrees)', k.outer!.mm, offAxis(upperOuter) + offAxis(lowerOuter), 1);
  // Hand calculation from the printed numbers alone: the inner cone's width at the bump's top.
  const atTop = 2 * (top - k.apexFromFront!.mm) * Math.tan((k.inner.mm / 2) * (Math.PI / 180));
  add('inner cone Ø at the bump\'s top, 2 (8.65 - 7.35) tan 67.5°, against the flash Ø6.28', phone.flash.diameter.mm, atTop, 0.1);
  // The negative control: read "to cover glass" from the back glass, the apex would sit 0.04 from the front.
  const fromBack = 2 * (top - (body.thickness.mm - k.apexFromFront!.mm)) * Math.tan((k.inner.mm / 2) * (Math.PI / 180));
  add(`negative control: read from the back glass the cone would be Ø${fromBack.toFixed(2)} at the bump's top (1 = it misses the flash by over 5 mm)`, 1, Math.abs(fromBack - phone.flash.diameter.mm) > 5 ? 1 : 0, 0);
  return out;
}

/**
 * Sheet 2's MagSafe view, upright, calibrated on its extension lines: across, the 0.00 and 72.40 lines on a row 4.5
 * above the phone (the 0.00 line has a gap from about 2.2 to 3.6 above it); down, the 0.00 and -110.68 lines on a column 5 left of it (the 0.00 line stops 3.7 left of the
 * phone). The other dimensioned lines check it. Then the clear area's circle (crossings on rays from the product
 * centre, fitted), and the magnetic zone's top and arc.
 */
export function magsafeReadings(pdf = PDF): Measured[] {
  const r = magsafeView, g = upright(pdf, r);
  const { out, add } = collector();
  const rowAbove = Math.round(toPx(r, [0, -4.5])[1]), rowBelow = Math.round(toPx(r, [0, 150])[1]);
  const colLeft = Math.round(toPx(r, [-5, 0])[0]), colRight = Math.round(toPx(r, [80.3, 0])[0]);
  const xAt = (row: number, m: number, c: Calibration = r) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(c, [m, 0])[0]);
  const yAt = (col: number, m: number, c: Calibration = r) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(c, [0, m])[1]);
  const { compass, cameraZone } = magsafeExtras;
  const [x0, x1] = [0, compass.fromSide.mm].map((m) => xAt(rowAbove, m));
  const [y0, y1] = [0, magsafe.zoneSidesTo!.mm].map((m) => yAt(colLeft, m));
  const sx = (x1 - x0) / compass.fromSide.mm, sy = (y1 - y0) / magsafe.zoneSidesTo!.mm;
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [x0, y0] };
  const X = (px: number) => (px - cal.origin[0]) / cal.pxPerMm, Y = (px: number) => (px - cal.origin[1]) / cal.pxPerMm;
  add('MagSafe view px/mm across (calibration: the 0.00 and 72.40 lines)', r.pxPerMm, sx, 0.05);
  add('MagSafe view px/mm down (calibration: the 0.00 and -110.68 lines)', r.pxPerMm, sy, 0.05);
  add('MagSafe view datum across (px)', r.origin[0], x0, 1);
  add('MagSafe view datum down (px)', r.origin[1], y0, 1);
  add('MagSafe view 40.18 line across, above (dimensioned)', cameraZone.across.mm, X(xAt(rowAbove, cameraZone.across.mm, cal)), 0.03);
  add('MagSafe view 39.04 line across, below (dimensioned)', magsafe.fromSide.mm, X(xAt(rowBelow, magsafe.fromSide.mm, cal)), 0.03);
  add('MagSafe view -47.18 line down, left (dimensioned)', magsafe.zoneFrom!.mm, Y(yAt(colLeft, magsafe.zoneFrom!.mm, cal)), 0.03);
  for (const m of [compass.fromTop, magsafe.fromTop]) add(`MagSafe view -${m.mm.toFixed(2)} line down, right (dimensioned)`, m.mm, Y(yAt(colRight, m.mm, cal)), 0.03);
  const row140 = Math.round(toPx(cal, [0, 140])[1]);
  add('the phone\'s width on the MagSafe view, 140 down (78.07)', body.width.mm, X(xAt(row140, body.width.mm, cal)) - X(xAt(row140, 0, cal)), 0.05);

  // The clear area's circle: crossings within 0.25 of R28.75 on rays every 5° from the product centre, clear of the
  // centre lines (within 6° of each axis) and of the two leaders that cross it (Ø57.50's at about 155°, the clear
  // area's note's at about 25°), keeping rays with one crossing only (a hatch line meeting the circle gives two).
  const c: [number, number] = [magsafe.fromSide.mm, magsafe.fromTop.mm], R = magsafe.diameter.mm / 2;
  const P: [number, number][] = [];
  for (let a = 0; a < 360; a += 5) {
    if ([0, 90, 180, 270, 360].some((b) => Math.abs(a - b) < 6) || [25, 155].some((b) => Math.abs(a - b) < 7)) continue;
    const t = (a * Math.PI) / 180, d: [number, number] = [Math.cos(t), Math.sin(t)];
    const o = toPx(cal, c), start = (R - 1.5) * cal.pxPerMm;
    const rs = runs(g, [o[0] + d[0] * start, o[1] + d[1] * start], d, Math.round(3 * cal.pxPerMm)).map((q) => R - 1.5 + q.at / cal.pxPerMm).filter((x) => Math.abs(x - R) < 0.25);
    if (rs.length === 1) P.push([c[0] + d[0] * rs[0], c[1] + d[1] * rs[0]]);
  }
  // A hatch line meeting the circle on a ray merges with it into one wider run (up to 0.23 off): drop crossings more than
  // 0.05 off the first fit and fit again.
  const f0 = fitCircle(P), Q = P.filter(([x, y]) => Math.abs(Math.hypot(x - f0.centre[0], y - f0.centre[1]) - f0.radius) < 0.05), f = fitCircle(Q);
  add(`clear area's circle: centre across (fitted to ${Q.length} of ${P.length} crossings; worst ${f.worst.toFixed(3)} off)`, magsafe.fromSide.mm, f.centre[0], 0.05);
  add('clear area\'s circle: centre down (round the product centre)', magsafe.fromTop.mm, f.centre[1], 0.05);
  add('clear area\'s circle: Ø (dimensioned 57.50)', magsafe.diameter.mm, 2 * f.radius, 0.05);

  // The zone: its top on columns 15 and 55 across (the camera corner's bottom and the open top's); its arc's lowest
  // point down columns 0.75 either side of the centre line; its crossings of x = 8, 18, 60.07 and 66 (clear of the
  // R49.39 leader, which lands on the arc about 3.6 across; at 70.07 and at 12.07 a hatch line's end merges with the arc
  // into one wider run, 0.14 to 0.23 above it, so 66 stands for 8's mirror), against the circle through (0, 110.68) and (78.07, 110.68)
  // of R49.39, its centre derived.
  const zr = magsafe.zoneRadius!.mm, half = body.width.mm / 2;
  const zc = magsafe.zoneSidesTo!.mm - Math.sqrt(zr * zr - half * half);
  add(`hand calculation: the zone's arc's centre, 110.68 - √(49.39² - 39.035²) = ${zc.toFixed(3)} down, against the product centre`, magsafe.fromTop.mm, zc, 0.03);
  for (const x of [15, 55]) add(`magnetic zone's top at ${x} across (-47.18)`, magsafe.zoneFrom!.mm, Y(yAt(Math.round(toPx(cal, [x, 0])[0]), magsafe.zoneFrom!.mm, cal)), 0.03);
  const low = mean([half - 0.75, half + 0.75].map((x) => Y(yAt(Math.round(toPx(cal, [x, 0])[0]), zc + zr, cal)) + (zr - Math.sqrt(zr * zr - 0.75 * 0.75))));
  add(`magnetic zone's arc, its lowest point (centre ${zc.toFixed(2)} down, derived, + R49.39)`, zc + zr, low, 0.05);
  for (const x of [8, 18, 60.07, 66]) {
    const at = zc + Math.sqrt(zr * zr - (x - half) ** 2);
    add(`magnetic zone's arc at x = ${x} (${at.toFixed(2)})`, at, Y(yAt(Math.round(toPx(cal, [x, 0])[0]), at, cal)), 0.05);
  }
  // The negative control: the zone doesn't start at the bump's bottom (-42.63); at 55 across no line lies there.
  const bumpBottom = bump.baseFrom.mm + bump.baseHeight.mm, near = Y(yAt(Math.round(toPx(cal, [55, 0])[0]), bumpBottom, cal));
  add(`negative control: at 55 across the line nearest the bump's bottom (${bumpBottom.toFixed(2)}) is at ${near.toFixed(2)} (1 = over 1 mm off: the zone doesn't start at the bump)`, 1, Math.abs(near - bumpBottom) > 1 ? 1 : 0, 0);
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
