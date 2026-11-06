// Re-measures every scaled value in drawing.ts from the PDF (the family's procedures, iphone/measure.ts), with two
// scans of this model's own where the family's land on something else (below); and checks the rear mic, the flash's
// keepout section and MagSafe's keepouts against what the drawing draws (sheet 2 read upright: `upright`).
//
//   node iphone-12/measure.ts   → a table: recorded, measured, the difference
//
// The family calibrates the back view on the camera centres furthest apart in each axis. Here, as on the 12 mini, the
// two cameras stand in one column (both 12.73 from the side), so across they give no scale (0 mm apart: a division by
// zero). The flash's centre is dimensioned too (25.28, 19.87), so for the re-measurement only it joins the cameras as
// a calibration point (`withFlash`): across, camera 1 to the flash (12.55 mm); down, camera 1 to camera 2 (14.28). It
// then reads its own "window", the flash circle again. The part is built from `phone` as it is.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { remeasure as family, report, type Measured } from '../../measure.ts';
import type { Phone } from '../../drawing.ts';
import { cleanCircleAt, lineNear, render, runs, toPx, type Calibration, type Gray, type Region } from '../../../src/raster.ts';
import { body, bottomView, bump, detailD, flashKeepout, front, frontView, magsafe, magsafeExtras, magsafeView, phone, rearMic, sectionGG } from './drawing.ts';

export const PDF = join(import.meta.dirname, '..', '..', 'drawings', 'iphone-12.pdf');

const { flash } = phone;
export const withFlash: Phone = {
  ...phone,
  cameras: {
    ...phone.cameras,
    flash: { ...phone.cameras.main, name: 'flash (calibration point)', label: 'Flash', fromSide: flash.fromSide, fromTop: flash.fromTop, ring: flash.diameter, window: flash.diameter },
  },
};

const K = 1 - Math.SQRT1_2;

/**
 * This model's own scans, each in its view's recorded calibration (which the family's re-measurement checks above):
 *
 * - The notch's walls on a row 1.2 below the active area's top. The family's row (1.5 below) is where the cutout's
 *   straight wall (4.42 to 4.97 down, between its R0.95 and R3.80) meets a line of the crosshatch, which merges with the
 *   left wall (a 20 px run at 18.11 for 18.35); 1.2 below, both walls are thin runs.
 * - The bump top's corners, the lines of the bump's own dimensions passed over by axis. The family's scan passes over a
 *   crossing within 4 px of any of those lines in either coordinate; on the bottom corners the arc's crossing lies at
 *   34.37 - 2.22 = 32.15 down, 4 px from the top's right side (32.19 across), so it's passed over and a line beyond
 *   is taken (2.91 and 10.49).
 */
function own(pdf: string): Measured[] {
  const out: Measured[] = [];
  const W = phone.body.width.mm, a = front.activeFromEdge.mm, nw = front.notchWidth!.mm;
  const gf = render(pdf, frontView);
  const row = toPx(frontView, [0, a + 1.2])[1];
  const [l, r] = [(W - nw) / 2, (W + nw) / 2].map((x) => lineNear(gf, [0, Math.round(row)], [1, 0], gf.width - 1, toPx(frontView, [x, 0])[0]));
  out.push({ name: `notch width, wall to wall, 1.2 below the active area's top (dimensioned ${nw})`, kind: 'check', recorded: nw, measured: (r - l) / frontView.pxPerMm, within: 0.05 });

  const g = render(pdf, detailD);
  const px = detailD.pxPerMm;
  const t0 = bump.topFrom.mm, tx = t0 + bump.topSize.mm, ty = t0 + bump.topHeight.mm, b0 = bump.baseFrom.mm;
  const across = [b0, b0 + bump.baseSize.mm, t0, tx], down = [b0, b0 + bump.baseHeight.mm, t0, ty];
  const rr = bump.topRadius.mm;
  const corners: [[number, number], [number, number]][] = [[[t0, t0], [1, 1]], [[tx, t0], [-1, 1]], [[tx, ty], [-1, -1]], [[t0, ty], [1, -1]]];
  const radii = corners.map(([c, dir]) => {
    const onLine = (at: number) => across.some((x) => Math.abs(c[0] + (dir[0] * at) / px - x) * px < 4) || down.some((y) => Math.abs(c[1] + (dir[1] * at) / px - y) * px < 4);
    const rs = runs(g, toPx(detailD, c), dir, Math.round(2.5 * rr * K * px)).filter((q) => !onLine(q.at));
    const best = rs.reduce((p, q) => (Math.abs(q.at - rr * K * px) < Math.abs(p.at - rr * K * px) ? q : p));
    return best.at / px / K;
  });
  out.push({ name: `bump top corner radius, lines passed over by axis (corners ${radii.map((x) => x.toFixed(2)).join(', ')})`, kind: 'scaled', recorded: rr, measured: radii.reduce((s, x) => s + x) / 4, within: 0.1 });
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
 * region's calibration (which the family's checks confirm), chords offset off the extension lines through it.
 */
export function micReadings(pdf = PDF): Measured[] {
  const r = detailD, g = render(pdf, r);
  const { out, add } = collector();
  const c = cleanCircleAt(g, toPx(r, [rearMic.fromSide.mm, rearMic.fromTop.mm]), (rearMic.diameter.mm / 2) * r.pxPerMm, [30, -30, 50, -50]);
  const stroke = c.stroke / r.pxPerMm;
  add('rear mic centre across (dimensioned 25.28: the 2X 25.28 line)', rearMic.fromSide.mm, (c.centre[0] - r.origin[0]) / r.pxPerMm, 0.05);
  add('rear mic centre down (dimensioned 12.28)', rearMic.fromTop.mm, (c.centre[1] - r.origin[1]) / r.pxPerMm, 0.05);
  add(`rear mic Ø (dimensioned 2.40, the outer circle); drawn ${stroke.toFixed(2)} wide`, rearMic.diameter.mm, c.diameter / r.pxPerMm, Math.max(0.05, stroke));
  // The negative control: the mic's centre lies on the bump's flat top, not its slope (the builder refuses a slope).
  const t0 = bump.topFrom.mm, rr = bump.topRadius.mm, cx = t0 + bump.topSize.mm - rr, cy = t0 + rr;
  const inCorner = Math.hypot(rearMic.fromSide.mm - cx, rearMic.fromTop.mm - cy);
  add(`the mic's centre ${inCorner.toFixed(2)} from the bump top's corner centre, inside its R${rr} (1 = on the flat top)`, 1, inCorner < rr - rearMic.diameter.mm / 2 ? 1 : 0, 0);
  return out;
}

/**
 * Sheet 2's Section G-G, upright: the scale from the cover glass's face (the left edge) to the 10.96 extension line;
 * then the 6.94 line, the section's other face (the bump's top, and the back glass beyond the bump), the cone's four
 * lines (the first ink right of the bump's face, row by row, each fitted), their crossings (the apex, the two kinks) and
 * angles; the mic's opening in the bump's top against the flash's axis; and the hand calculation of the inner cone's
 * width where it leaves the bump's top, against the flash's Ø5.66.
 */
export function sectionReadings(pdf = PDF): Measured[] {
  const r = sectionGG, g = upright(pdf, r);
  const { out, add } = collector();
  const k = flashKeepout, top = body.thickness.mm + bump.top.mm;
  const across = (y: number, expect: number) => lineNear(g, [0, y], [1, 0], g.width - 1, expect);
  // Row 1450 crosses the 6.94 extension line (it runs ~1290 to 1540) below its dimension line; row 2450 the 10.96's
  // (~2150 to 2560) above its dimension line.
  const face = across(1450, r.origin[0]), face2 = across(2450, r.origin[0]);
  const px = (across(2450, r.origin[0] + k.transitionFromFront!.mm * r.pxPerMm) - face2) / k.transitionFromFront!.mm;
  const mm = (x: number) => (x - face) / px;
  add('Section G-G px/mm (calibration: the cover glass face to the 10.96 line)', r.pxPerMm, px, 0.05);
  add('Section G-G cover glass face (px)', r.origin[0], face, 1);
  add('Section G-G 6.94 extension line (dimensioned)', k.apexFromFront!.mm, mm(across(1450, face + 6.94 * px)), 0.03);
  const bumpFace = [900, 2000].map((y) => mm(across(y, face + top * px)));
  add(`section's other face, the bump's top (7.39 + 0.73), rows 900 and 2000 (${bumpFace.map((b) => b.toFixed(3)).join(', ')})`, top, mean(bumpFace), 0.05);
  const glass = [600, 2700].map((y) => mm(across(y, face + body.thickness.mm * px)));
  add(`section's other face beyond the bump, the back glass (7.39), rows 600 and 2700 (${glass.map((b) => b.toFixed(3)).join(', ')})`, body.thickness.mm, mean(glass), 0.05);
  // The cone's lines: the first ink right of the bump's face on each row (inside the cone is hatched, outside white).
  const from = Math.round(face + (top + 0.18) * px);
  const first = (y: number, x0 = from) => {
    const rs = runs(g, [x0, y], [1, 0], g.width - 1 - x0);
    return rs.length ? x0 + rs[0].at : NaN;
  };
  const rows = (a: number, b: number) => Array.from({ length: Math.floor((b - a) / 5) + 1 }, (_, i) => a + 5 * i);
  const line = (a: number, b: number, x0?: number) => fitLine(rows(a, b).map((y) => [first(y, x0), y]));
  const upperOuter = line(340, 960), upperInner = line(1090, 1380), lowerInner = line(1790, 2060);
  // Below the lower kink the 10.96 extension line is the first ink: start right of it.
  const lowerOuter = line(2250, 2780, Math.round(face + 11.15 * px));
  const apex = meet(upperInner, lowerInner), kinks = [meet(upperInner, upperOuter), meet(lowerInner, lowerOuter)];
  add(`inner cone's apex from the cover glass (its lines fitted to ${upperInner.n} and ${lowerInner.n} rows, crossed)`, k.apexFromFront!.mm, mm(apex[0]), 0.05);
  kinks.forEach((q, i) => add(`${i ? 'lower' : 'upper'} kink, inner cone to outer, from the cover glass (10.96)`, k.transitionFromFront!.mm, mm(q[0]), 0.05));
  add('the apex midway between the kinks, down (mm: on the cone\'s axis)', 0, (apex[1] - (kinks[0][1] + kinks[1][1]) / 2) / px, 0.1);
  add('inner cone, full angle as drawn (degrees; the lines are ~5 mm long)', k.inner.mm, offAxis(upperInner) + offAxis(lowerInner), 1);
  add('outer cone, full angle as drawn (degrees)', k.outer!.mm, offAxis(upperOuter) + offAxis(lowerOuter), 1);
  // The mic's opening, drawn in the bump's top above the flash: a heavy bar just inside the bump's face (a column 0.2
  // inside it crosses the bar as one long run; elsewhere only hatch lines and outlines); its middle against the cone's
  // axis (the apex), 19.87 - 12.28 apart on Detail D.
  const col = Math.round(face + (top - 0.2) * px);
  const bar = runs(g, [col, 900], [0, 1], 600).filter((q) => q.width > 1.5 * px);
  const micMid = 900 + bar[0].at;
  add(`rear mic's opening on G-G above the flash's axis (its bar ${(bar[0].width / px).toFixed(2)} long, ${bar.length} found), against 19.87 - 12.28`, phone.flash.fromTop.mm - rearMic.fromTop.mm, (apex[1] - micMid) / px, 0.05);
  // Hand calculation from the printed numbers alone: the inner cone's width at the bump's top.
  const atTop = 2 * (top - k.apexFromFront!.mm) * Math.tan((k.inner.mm / 2) * (Math.PI / 180));
  add('inner cone Ø at the bump\'s top, 2 (8.12 - 6.94) tan 67.5°, against the flash Ø5.66', phone.flash.diameter.mm, atTop, 0.1);
  // The negative control: read "to cover glass" from the back glass, the apex would sit 0.45 from the front.
  const fromBack = 2 * (top - (body.thickness.mm - k.apexFromFront!.mm)) * Math.tan((k.inner.mm / 2) * (Math.PI / 180));
  add(`negative control: read from the back glass the cone would be Ø${fromBack.toFixed(2)} at the bump's top (1 = it misses the flash by over 5 mm)`, 1, Math.abs(fromBack - phone.flash.diameter.mm) > 5 ? 1 : 0, 0);
  return out;
}

/**
 * Sheet 2's MagSafe view, upright, calibrated on its extension lines: across, the 0.00 and 65.26 lines on a row 4.5
 * above the phone; down, the 0.00 and -107.42 lines on a column 3.2 left of it. The other dimensioned lines check it.
 * Then the clear area's circle (crossings on rays from the product centre, fitted), and the magnetic zone's top and arc.
 */
export function magsafeReadings(pdf = PDF): Measured[] {
  const r = magsafeView, g = upright(pdf, r);
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
  // note's at 31°), keeping rays with one crossing only (a hatch line meeting the circle gives two).
  const c: [number, number] = [magsafe.fromSide.mm, magsafe.fromTop.mm], R = magsafe.diameter.mm / 2;
  const P: [number, number][] = [];
  for (let a = 0; a < 360; a += 5) {
    if ([0, 90, 180, 270, 360].some((b) => Math.abs(a - b) < 6) || [31, 149].some((b) => Math.abs(a - b) < 7)) continue;
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
  // The negative control: the 12 mini's zone starts at the bump's bottom; here, at 50 across, no line lies there (-36.30).
  const bumpBottom = bump.baseFrom.mm + bump.baseHeight.mm, near = Y(yAt(Math.round(toPx(cal, [50, 0])[0]), bumpBottom, cal));
  add(`negative control: at 50 across the line nearest the bump's bottom (${bumpBottom.toFixed(2)}) is at ${near.toFixed(2)} (1 = over 1 mm off: the zone doesn't start at the bump)`, 1, Math.abs(near - bumpBottom) > 1 ? 1 : 0, 0);
  return out;
}

export const remeasure = (pdf = PDF): Measured[] => [
  ...family(withFlash, { back: detailD, front: frontView, bottom: bottomView }, pdf, {
    // The front view's leaders (COVER GLASS, ACTIVE AREA) cross the left edge about 67 and 86 down, the 3.47 ALL AROUND
    // arrows 113: row 97 is clear, below the side button. The cutout reaches 17.4 from the side, the corners 11, so
    // the active area's top is read 14 in.
    frontRow: 97,
    activeColumn: 14,
    known: {
      'notch width': 'the family\'s row (1.5 below the active area\'s top) crosses the left wall where a line of the crosshatch meets it; read 1.2 below by this model\'s own scan (next lines)',
      'bump top corner radius (': 'the family\'s scan passes over the bottom corners\' crossing (32.15 down lies 4 px from the 32.19 line across); read by this model\'s own scan, lines passed over by axis (next lines)',
    },
  }),
  ...own(pdf),
  ...micReadings(pdf),
  ...sectionReadings(pdf),
  ...magsafeReadings(pdf),
];

export const hasPdf = () => existsSync(PDF);

if (import.meta.main) console.log(report(remeasure()));
