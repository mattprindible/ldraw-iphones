// Re-measures every scaled value in drawing.ts from the PDF (the family's procedures, iphone/measure.ts), with two
// scans of this model's own where the family's land on something else (below); and checks the rear mic, the flash's
// keepout section and MagSafe's keepouts against what the drawing draws (sheet 2 read upright: `upright`), as the 12's.
//
//   node iphone-12-pro/measure.ts   → a table: recorded, measured, the difference
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { remeasure as family, report, type Measured } from '../../measure.ts';
import { circleAt, cleanCircleAt, lineNear, render, runs, toPx, type Calibration, type Gray, type Region } from '../../../src/raster.ts';
import { body, bottomView, bump, cameras, detailD, flashKeepout, front, frontView, magsafe, magsafeExtras, magsafeView, phone, rearMic, sectionGG } from './drawing.ts';

export const PDF = join(import.meta.dirname, '..', '..', 'drawings', 'iphone-12-pro.pdf');

/**
 * This model's own scans, each in its view's recorded calibration (which the family's re-measurement checks):
 *
 * - The notch's bottom down the column 6 left of the middle. The family's column (4 left) is where a line of the
 *   crosshatch meets the cutout's bottom (one 13 px run at 8.87); everywhere else across the cutout the bottom is an
 *   8 px run at 8.76. (The column also grazes the receiver's end, 0.08 from it.)
 * - Camera 3's window at 4800 dpi. Each lens draws a thin innermost circle (Ø9.77) with the heavy ring 0.01 outside it;
 *   at 1200 dpi camera 3's two fall in one run (0.44 wide; its middles read Ø9.91 to Ø10.13 with the guess), cameras 1 and 2's don't. At 4800 dpi all
 *   three read alike.
 */
function own(pdf: string): Measured[] {
  const out: Measured[] = [];
  const W = phone.body.width.mm, a = front.activeFromEdge.mm, depth = front.notchDepth!.mm;
  const gf = render(pdf, frontView);
  const col = Math.round(toPx(frontView, [W / 2 - 6, 0])[0]);
  const bottomPx = lineNear(gf, [col, 0], [0, 1], gf.height - 1, toPx(frontView, [0, a + depth])[1]);
  out.push({ name: `notch bottom from the top, 6 left of the middle (${a} + ${depth})`, kind: 'check', recorded: a + depth, measured: (bottomPx - frontView.origin[1]) / frontView.pxPerMm, within: 0.05 });

  const cam = cameras.ultraWide, f = 4;
  const centre = toPx(detailD, [cam.fromSide.mm, cam.fromTop.mm]);
  const s = detailD.pxPerMm * f, h = Math.round(6.5 * s);
  const [ax, ay] = [(detailD.crop.x + centre[0]) * f, (detailD.crop.y + centre[1]) * f];
  const region: Region = { page: detailD.page, dpi: detailD.dpi * f, crop: { x: Math.round(ax) - h, y: Math.round(ay) - h, width: 2 * h, height: 2 * h } };
  const cal: Calibration = { pxPerMm: s, origin: [0, 0] };
  const c = circleAt(render(pdf, region), [h, h], (cam.window.mm / 2) * cal.pxPerMm);
  out.push({ name: `${cam.name} window Ø at 4800 dpi`, kind: 'scaled', recorded: cam.window.mm, measured: c.diameter / s, within: 0.05 });
  return out;
}

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
 * 30.23 line below it, the -27.38 line to its right, the Ø1.15 leader below and right).
 */
export function micReadings(pdf = PDF): Measured[] {
  const r = detailD, g = render(pdf, r);
  const { out, add } = collector();
  const c = cleanCircleAt(g, toPx(r, [rearMic.fromSide.mm, rearMic.fromTop.mm]), (rearMic.diameter.mm / 2) * r.pxPerMm, [20, -20, 25, -25]);
  const stroke = c.stroke / r.pxPerMm;
  add('rear mic centre across (dimensioned 30.23)', rearMic.fromSide.mm, (c.centre[0] - r.origin[0]) / r.pxPerMm, 0.05);
  add('rear mic centre down (dimensioned 27.38)', rearMic.fromTop.mm, (c.centre[1] - r.origin[1]) / r.pxPerMm, 0.05);
  add(`rear mic Ø (dimensioned 1.15, the outer circle); drawn ${stroke.toFixed(2)} wide`, rearMic.diameter.mm, c.diameter / r.pxPerMm, Math.max(0.05, stroke));
  // The negative control: the mic's centre lies on the bump's flat top, not its slope (the builder refuses a slope):
  // inside the top's bottom-right corner arc.
  const t0 = bump.topFrom.mm, rr = bump.topRadius.mm, cx = t0 + bump.topSize.mm - rr, cy = t0 + bump.topHeight.mm - rr;
  const inCorner = Math.hypot(rearMic.fromSide.mm - cx, rearMic.fromTop.mm - cy);
  add(`the mic's centre ${inCorner.toFixed(2)} from the bump top's corner centre, inside its R${rr} (1 = on the flat top)`, 1, inCorner < rr - rearMic.diameter.mm / 2 ? 1 : 0, 0);
  return out;
}

/**
 * Sheet 2's Section G-G, upright: the scale from the cover glass's face (the left edge) to the 11.29 extension line;
 * then the 7.03 line, the section's other face (the back glass above the bump, the bump's top beside the flash, camera
 * 3's ring below it), the cone's four lines (the first ink right of the bump's top, row by row, each fitted), their
 * crossings (the apex, the two kinks) and angles; and the hand calculation of the inner cone's width where it leaves
 * the bump's top, against the flash's Ø6.28.
 */
export function sectionReadings(pdf = PDF): Measured[] {
  const r = sectionGG, g = upright(pdf, r);
  const { out, add } = collector();
  const k = flashKeepout, top = body.thickness.mm + bump.top.mm, rings = body.thickness.mm + bump.rings.mm;
  const across = (y: number, expect: number) => lineNear(g, [0, y], [1, 0], g.width - 1, expect);
  // Row 2600 crosses the 11.29 extension line (it runs ~2040 to 2790) above its dimension line (~2725); row 1620 the
  // 7.03's (~1500 to 1635) below its dimension line (~1590).
  const face = across(2600, r.origin[0]);
  const px = (across(2600, r.origin[0] + k.transitionFromFront!.mm * r.pxPerMm) - face) / k.transitionFromFront!.mm;
  const mm = (x: number) => (x - face) / px;
  add('Section G-G px/mm (calibration: the cover glass face to the 11.29 line)', r.pxPerMm, px, 0.05);
  add('Section G-G cover glass face (px)', r.origin[0], face, 1);
  add('Section G-G 7.03 extension line (dimensioned)', k.apexFromFront!.mm, mm(across(1620, face + k.apexFromFront!.mm * px)), 0.03);
  const glass = [1050, 1100].map((y) => mm(across(y, face + body.thickness.mm * px)));
  add(`section's other face above the bump, the back glass (7.39), rows 1050 and 1100 (${glass.map((b) => b.toFixed(3)).join(', ')})`, body.thickness.mm, mean(glass), 0.05);
  const bumpFace = [1250].map((y) => mm(across(y, face + top * px)));
  add(`section's other face beside the flash, the bump's top (7.39 + 0.94), row 1250 (${bumpFace.map((b) => b.toFixed(3)).join(', ')})`, top, mean(bumpFace), 0.05);
  const ring = [2100, 2300].map((y) => mm(across(y, face + rings * px)));
  add(`section's other face below the flash, camera 3's ring (7.39 + 1.72), rows 2100 and 2300 (${ring.map((b) => b.toFixed(3)).join(', ')})`, rings, mean(ring), 0.05);
  // The cone's lines: the first ink right of the bump's top on each row (inside the cone is hatched, outside white).
  const from = Math.round(face + (top + 0.18) * px);
  const first = (y: number, x0 = from) => {
    const rs = runs(g, [x0, y], [1, 0], g.width - 1 - x0);
    return rs.length ? x0 + rs[0].at : NaN;
  };
  const rows = (a: number, b: number) => Array.from({ length: Math.floor((b - a) / 5) + 1 }, (_, i) => a + 5 * i);
  const line = (a: number, b: number, x0?: number) => fitLine(rows(a, b).map((y) => [first(y, x0), y]));
  // Upright rows: the upper outer line from the cone's tip (~126) to its kink (~900), the upper inner from there to where
  // it meets the bump's top (~1260), the lower inner from where it clears camera 3's ring (~1790: that face, 9.11, is
  // right of the bump's top, so start right of it) to the 135° arc's arrowhead (~1975), the lower outer from its kink
  // (~2035) to its tip (~2826), right of the 11.29 extension line.
  const upperOuter = line(200, 860), upperInner = line(960, 1230), lowerInner = line(1790, 1960, Math.round(face + (rings + 0.18) * px));
  const lowerOuter = line(2080, 2780, Math.round(face + 11.45 * px));
  const apex = meet(upperInner, lowerInner), kinks = [meet(upperInner, upperOuter), meet(lowerInner, lowerOuter)];
  add(`inner cone's apex from the cover glass (its lines fitted to ${upperInner.n} and ${lowerInner.n} rows, crossed)`, k.apexFromFront!.mm, mm(apex[0]), 0.05);
  kinks.forEach((q, i) => add(`${i ? 'lower' : 'upper'} kink, inner cone to outer, from the cover glass (11.29)`, k.transitionFromFront!.mm, mm(q[0]), 0.05));
  // The apex's crossing sits 0.14 below the kinks' midpoint: the inner cone's lines are short (the lower ~3 mm, between
  // camera 3's ring and the 135° arc's arrowhead) and cross at 135°, so 0.3° on each (67.87° and 67.32° as fitted) moves
  // the crossing that far. The kinks' midpoint is where sheet 1 puts the flash's axis: camera 3's ring top (its Ø12.45
  // from 19.87 down: 13.65) is drawn 4.475 below it (next line); and the kinks with the dimensioned 135° put the apex
  // at 7.03 on that axis (11.27 - 10.25 / tan 67.5°).
  out.push({ name: 'the apex midway between the kinks, down (mm: on the cone\'s axis)', kind: 'check', recorded: 0, measured: (apex[1] - (kinks[0][1] + kinks[1][1]) / 2) / px, within: 0.1, known: 'the apex is two short fitted lines crossed: 0.3° on each moves it 0.14 down; the kinks\' midpoint is on the flash\'s axis by camera 3\'s ring (next line)' });
  const ringCol = Math.round(face + (top + 0.37) * px), axisMm = phone.flash.fromTop.mm, ringTopMm = cameras.ultraWide.fromTop.mm - cameras.ultraWide.ring.mm / 2;
  const ringRow = lineNear(g, [ringCol, 0], [0, 1], g.height - 1, (kinks[0][1] + kinks[1][1]) / 2 + (ringTopMm - axisMm) * px);
  add(`camera 3's ring top on G-G (the 9.11 face's top) below the kinks' midpoint, against ${ringTopMm.toFixed(3)} - ${axisMm} (sheet 1)`, ringTopMm - axisMm, (ringRow - (kinks[0][1] + kinks[1][1]) / 2) / px, 0.05);
  const fromKinks = mm((kinks[0][0] + kinks[1][0]) / 2) - ((kinks[1][1] - kinks[0][1]) / 2 / px) / Math.tan((k.inner.mm / 2) * (Math.PI / 180));
  add('the apex from the kinks and the dimensioned 135°: their mean depth less half their spread / tan 67.5°', k.apexFromFront!.mm, fromKinks, 0.05);
  add('inner cone, full angle as drawn (degrees; the lines are ~4 mm long)', k.inner.mm, offAxis(upperInner) + offAxis(lowerInner), 1);
  add('outer cone, full angle as drawn (degrees)', k.outer!.mm, offAxis(upperOuter) + offAxis(lowerOuter), 1);
  // Hand calculation from the printed numbers alone: the inner cone's width at the bump's top.
  const atTop = 2 * (top - k.apexFromFront!.mm) * Math.tan((k.inner.mm / 2) * (Math.PI / 180));
  add('inner cone Ø at the bump\'s top, 2 (8.33 - 7.03) tan 67.5°, against the flash Ø6.28', phone.flash.diameter.mm, atTop, 0.1);
  // The negative control: read "to cover glass" from the back glass, the apex would sit 0.36 from the front.
  const fromBack = 2 * (top - (body.thickness.mm - k.apexFromFront!.mm)) * Math.tan((k.inner.mm / 2) * (Math.PI / 180));
  add(`negative control: read from the back glass the cone would be Ø${fromBack.toFixed(2)} at the bump's top (1 = it misses the flash by over 5 mm)`, 1, Math.abs(fromBack - phone.flash.diameter.mm) > 5 ? 1 : 0, 0);
  return out;
}

/**
 * Sheet 2's MagSafe view, upright, calibrated on its extension lines: across, the 0.00 and 65.26 lines on a row 2.5
 * above the phone (the 35.44 and 65.26 lines end 3 above it, at their labels); down, the 0.00 and -107.42 lines on a
 * column 3.2 left of it. The other dimensioned lines check it. Then the clear area's circle (crossings on rays from the
 * product centre, fitted), and the magnetic zone's top and arc.
 */
export function magsafeReadings(pdf = PDF): Measured[] {
  const r = magsafeView, g = upright(pdf, r);
  const { out, add } = collector();
  const rowAbove = Math.round(toPx(r, [0, -2.5])[1]), rowBelow = Math.round(toPx(r, [0, 148.4])[1]);
  const colLeft = Math.round(toPx(r, [-3.2, 0])[0]), colRight = Math.round(toPx(r, [80.3, 0])[0]);
  const xAt = (row: number, m: number, c: Calibration = r) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(c, [m, 0])[0]);
  const yAt = (col: number, m: number, c: Calibration = r) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(c, [0, m])[1]);
  const { compass, cameraZone } = magsafeExtras;
  const [x0, x1] = [0, compass.fromSide.mm].map((m) => xAt(rowAbove, m));
  const [y0, y1] = [0, magsafe.zoneSidesTo!.mm].map((m) => yAt(colLeft, m));
  const sx = (x1 - x0) / compass.fromSide.mm, sy = (y1 - y0) / magsafe.zoneSidesTo!.mm;
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [x0, y0] };
  const X = (px: number) => (px - cal.origin[0]) / cal.pxPerMm, Y = (px: number) => (px - cal.origin[1]) / cal.pxPerMm;
  add('MagSafe view px/mm across (calibration: the 0.00 and 65.26 lines)', r.pxPerMm, sx, 0.05);
  add('MagSafe view px/mm down (calibration: the 0.00 and -107.42 lines)', r.pxPerMm, sy, 0.05);
  add('MagSafe view datum across (px)', r.origin[0], x0, 1);
  add('MagSafe view datum down (px)', r.origin[1], y0, 1);
  add('MagSafe view 35.44 line across, above (dimensioned)', cameraZone.across.mm, X(xAt(rowAbove, cameraZone.across.mm, cal)), 0.03);
  add('MagSafe view 35.76 line across, below (dimensioned)', magsafe.fromSide.mm, X(xAt(rowBelow, magsafe.fromSide.mm, cal)), 0.03);
  add('MagSafe view -40.12 line down, left (dimensioned)', magsafe.zoneFrom!.mm, Y(yAt(colLeft, magsafe.zoneFrom!.mm, cal)), 0.03);
  for (const m of [compass.fromTop, magsafe.fromTop]) add(`MagSafe view -${m.mm.toFixed(2)} line down, right (dimensioned)`, m.mm, Y(yAt(colRight, m.mm, cal)), 0.03);
  const row85 = Math.round(toPx(cal, [0, 85])[1]);
  add('the phone\'s width on the MagSafe view, 85 down (71.52)', body.width.mm, X(xAt(row85, body.width.mm, cal)) - X(xAt(row85, 0, cal)), 0.05);

  // The clear area's circle: crossings within 0.25 of R28.75 on rays every 5° from the product centre, clear of the
  // centre lines (within 6° of each axis) and of the two leaders that cross it (Ø57.50's at 149°, the clear area's
  // note's at 24°), keeping rays with one crossing only (a hatch line meeting the circle gives two).
  const c: [number, number] = [magsafe.fromSide.mm, magsafe.fromTop.mm], R = magsafe.diameter.mm / 2;
  const P: [number, number][] = [];
  for (let a = 0; a < 360; a += 5) {
    if ([0, 90, 180, 270, 360].some((b) => Math.abs(a - b) < 6) || [24, 149].some((b) => Math.abs(a - b) < 7)) continue;
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
  // point down columns 0.75 either side of the centre line; its crossings of x = 2, 15, 56.52 and 69.52 (clear of the
  // R49.39 leader, which lands on the arc about 8 across), against the circle through (0, 107.42) and (71.52, 107.42)
  // of R49.39, its centre derived.
  const zr = magsafe.zoneRadius!.mm, half = body.width.mm / 2;
  const zc = magsafe.zoneSidesTo!.mm - Math.sqrt(zr * zr - half * half);
  add(`hand calculation: the zone's arc's centre, 107.42 - √(49.39² - 35.76²) = ${zc.toFixed(3)} down, against the product centre`, magsafe.fromTop.mm, zc, 0.03);
  for (const x of [15, 50]) add(`magnetic zone's top at ${x} across (-40.12)`, magsafe.zoneFrom!.mm, Y(yAt(Math.round(toPx(cal, [x, 0])[0]), magsafe.zoneFrom!.mm, cal)), 0.03);
  const low = mean([half - 0.75, half + 0.75].map((x) => Y(yAt(Math.round(toPx(cal, [x, 0])[0]), zc + zr, cal)) + (zr - Math.sqrt(zr * zr - 0.75 * 0.75))));
  add(`magnetic zone's arc, its lowest point (centre ${zc.toFixed(2)} down, derived, + R49.39)`, zc + zr, low, 0.05);
  for (const x of [2, 15, 56.52, 69.52]) {
    const at = zc + Math.sqrt(zr * zr - (x - half) ** 2);
    add(`magnetic zone's arc at x = ${x} (${at.toFixed(2)})`, at, Y(yAt(Math.round(toPx(cal, [x, 0])[0]), at, cal)), 0.05);
  }
  // The negative control: the zone doesn't start at the bump's bottom (-37.62); at 50 across no line lies there.
  const bumpBottom = bump.baseFrom.mm + bump.baseHeight.mm, near = Y(yAt(Math.round(toPx(cal, [50, 0])[0]), bumpBottom, cal));
  add(`negative control: at 50 across the line nearest the bump's bottom (${bumpBottom.toFixed(2)}) is at ${near.toFixed(2)} (1 = over 1 mm off: the zone doesn't start at the bump)`, 1, Math.abs(near - bumpBottom) > 1 ? 1 : 0, 0);
  return out;
}

export const remeasure = (pdf = PDF): Measured[] => [
  ...family(phone, { back: detailD, front: frontView, bottom: bottomView }, pdf, {
    known: {
      'rear camera 3 window': 'at 1200 dpi the window\'s thin circle and the heavy ring 0.01 outside it fall in one 0.44 wide run, whose middles read Ø9.91 (Ø10.13 from a 10.0 guess); read at 4800 dpi by this model\'s own scan (next lines)',
      'notch bottom from the top (': 'the family\'s column (4 left of the middle) meets the cutout\'s bottom where a line of the crosshatch does (one 13 px run); read 6 left by this model\'s own scan (next lines)',
    },
  }),
  ...own(pdf),
  ...micReadings(pdf),
  ...sectionReadings(pdf),
  ...magsafeReadings(pdf),
];

export const hasPdf = () => existsSync(PDF);

if (import.meta.main) console.log(report(remeasure()));
