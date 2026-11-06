// Re-measures every scaled value in drawing.ts from the PDF (the family's procedures, iphone/measure.ts), and checks
// the rear mic, the flash's keepout section and MagSafe's keepouts against what the drawing draws.
//
//   node iphone-12-mini/measure.ts   → a table: recorded, measured, the difference
//
// The family calibrates the back view on the camera centres furthest apart in each axis. Here the two cameras stand in
// one column (both 10.67 from the side), so across they give no scale (0 mm apart: a division by zero). The flash's
// centre is dimensioned too (22.21, 17.81), so for the re-measurement only it joins the cameras as a calibration point
// (`withFlash`): across, camera 1 to the flash (11.54 mm); down, camera 1 to camera 2 (14.28). It then reads its own
// "window", the flash circle again. The part is built from `phone` as it is. (A gap in the shared code: reported.)
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { remeasure as family, report, type Measured } from '../../measure.ts';
import type { Phone } from '../../drawing.ts';
import { cleanCircleAt, lineNear, render, runNear, runs, toPx, type Calibration, type Gray } from '../../../src/raster.ts';
import { body, bottomView, bump, detailD, flash, flashKeepout, frontView, magsafe, magsafeSides, magsafeView, phone, rearMic, sectionGG } from './drawing.ts';

export const PDF = join(import.meta.dirname, '..', '..', 'drawings', 'iphone-12-mini.pdf');

export const withFlash: Phone = {
  ...phone,
  cameras: {
    ...phone.cameras,
    flash: { ...phone.cameras.main, name: 'flash (calibration point)', label: 'Flash', fromSide: flash.fromSide, fromTop: flash.fromTop, ring: flash.diameter, window: flash.diameter },
  },
};

const mean = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length;
const median = (a: number[]) => [...a].sort((p, q) => p - q)[Math.floor(a.length / 2)];
const rms = (a: number[]) => Math.sqrt(mean(a.map((x) => x * x)));
function collector() {
  const out: Measured[] = [];
  const add = (name: string, recorded: number, measured: number, within: number, known?: string) => out.push({ name, kind: 'check', recorded, measured, within, ...(known ? { known } : {}) });
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
  // Solve [sxx sxy sx; sxy syy sy; sx sy n] [A B C] = [sxz syz sz]; centre (A/2, B/2).
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
 * Detail D's rear mic (the family's re-measurement doesn't read it): the circle at its dimensioned centre, on the region's
 * calibration (which the family's checks confirm), chords offset off the extension line through it and the -10.22 line.
 */
export function micReadings(pdf = PDF): Measured[] {
  const r = detailD, g = render(pdf, r);
  const { out, add } = collector();
  const c = cleanCircleAt(g, toPx(r, [rearMic.fromSide.mm, rearMic.fromTop.mm]), (rearMic.diameter.mm / 2) * r.pxPerMm, [30, -30, 50, -50]);
  const stroke = c.stroke / r.pxPerMm;
  add('rear mic centre across (dimensioned 22.21: the 2X 22.21 line)', rearMic.fromSide.mm, (c.centre[0] - r.origin[0]) / r.pxPerMm, 0.05);
  add('rear mic centre down (dimensioned 10.22)', rearMic.fromTop.mm, (c.centre[1] - r.origin[1]) / r.pxPerMm, 0.05);
  add(`rear mic Ø (dimensioned 2.40, the outer circle); drawn ${stroke.toFixed(2)} wide`, rearMic.diameter.mm, c.diameter / r.pxPerMm, Math.max(0.05, stroke));
  return out;
}

/**
 * Sheet 2's Section G-G: the scale from the cover glass's face (the left edge) to the 10.96 extension line; then the
 * 6.94 line, the section's other face (the bump's top), the cone's four lines (the first ink right of that face, row
 * by row, each fitted), their crossings (the apex, the two kinks) and angles; and the hand calculation of the inner
 * cone's width where it leaves the bump's top, against the flash's Ø5.66.
 */
export function sectionReadings(pdf = PDF): Measured[] {
  const r = sectionGG, g = render(pdf, r);
  const { out, add } = collector();
  const across = (y: number, expect: number) => lineNear(g, [0, y], [1, 0], g.width - 1, expect);
  // Row 1000 crosses the 6.94 extension line (it runs ~380 to 1214); row 2300 the 10.96's (~1840 to 2525).
  const face = across(1000, r.origin[0]), face2 = across(2300, r.origin[0]);
  const px = (across(2300, r.origin[0] + flashKeepout.transitionFromFront!.mm * r.pxPerMm) - face2) / flashKeepout.transitionFromFront!.mm;
  const mm = (x: number) => (x - face) / px;
  add('Section G-G px/mm (calibration: the cover glass face to the 10.96 line)', r.pxPerMm, px, 0.05);
  add('Section G-G cover glass face (px)', r.origin[0], face, 1);
  add('Section G-G 6.94 extension line (dimensioned)', flashKeepout.apexFromFront!.mm, mm(across(1000, face + 6.94 * px)), 0.03);
  const top = body.thickness.mm + bump.top.mm;
  const back = [450, 1000].map((y) => mm(across(y, face + top * px)));
  add(`section's other face, the bump's top (7.39 + 0.73), rows 450 and 1000 (${back.map((b) => b.toFixed(3)).join(', ')})`, top, mean(back), 0.05);
  // The cone's lines: the first ink right of the bump's face on each row (inside the cone is hatched, outside white).
  const from = Math.round(face + (top + 0.18) * px);
  const first = (y: number, x0 = from) => {
    const rs = runs(g, [x0, y], [1, 0], g.width - 1 - x0);
    return rs.length ? x0 + rs[0].at : NaN;
  };
  const rows = (a: number, b: number) => Array.from({ length: Math.floor((b - a) / 5) + 1 }, (_, i) => a + 5 * i);
  const line = (a: number, b: number, x0?: number) => fitLine(rows(a, b).map((y) => [first(y, x0), y]));
  const upperOuter = line(20, 560), upperInner = line(700, 1040), lowerInner = line(1440, 1840);
  // Below the lower kink the 10.96 extension line is the first ink: start right of it.
  const lowerOuter = line(1900, 2400, Math.round(face + 11.1 * px));
  const apex = meet(upperInner, lowerInner), kinks = [meet(upperInner, upperOuter), meet(lowerInner, lowerOuter)];
  add(`inner cone's apex from the cover glass (its lines fitted to ${upperInner.n} and ${lowerInner.n} rows, crossed)`, flashKeepout.apexFromFront!.mm, mm(apex[0]), 0.05);
  kinks.forEach((k, i) => add(`${i ? 'lower' : 'upper'} kink, inner cone to outer, from the cover glass (10.96)`, flashKeepout.transitionFromFront!.mm, mm(k[0]), 0.05));
  add('the apex midway between the kinks, down (mm: on the cone\'s axis)', 0, (apex[1] - (kinks[0][1] + kinks[1][1]) / 2) / px, 0.1);
  add('inner cone, full angle as drawn (degrees; the lines are ~6 mm long)', flashKeepout.inner.mm, offAxis(upperInner) + offAxis(lowerInner), 1);
  add('outer cone, full angle as drawn (degrees)', flashKeepout.outer!.mm, offAxis(upperOuter) + offAxis(lowerOuter), 1);
  // Hand calculation from the printed numbers alone: the inner cone's width at the bump's top.
  const atTop = 2 * (top - flashKeepout.apexFromFront!.mm) * Math.tan((flashKeepout.inner.mm / 2) * (Math.PI / 180));
  add('inner cone Ø at the bump\'s top, 2 (8.12 - 6.94) tan 67.5°, against the flash Ø5.66', flash.diameter.mm, atTop, 0.1);
  // The negative control: read "to cover glass" from the back glass, the apex would sit 0.45 from the front.
  const fromBack = 2 * (top - (body.thickness.mm - flashKeepout.apexFromFront!.mm)) * Math.tan((flashKeepout.inner.mm / 2) * (Math.PI / 180));
  add(`negative control: read from the back glass the cone would be Ø${fromBack.toFixed(2)} at the bump's top (1 = it misses the flash by over 5 mm)`, 1, Math.abs(fromBack - flash.diameter.mm) > 5 ? 1 : 0, 0);
  return out;
}

/**
 * Sheet 2's MagSafe view, calibrated on its extension lines: across, the 0.00 and 58.47 lines on a row 7.6 above the
 * phone; down, the 0.00 and -103.28 lines on a column 6.6 left of it. The other dimensioned lines check it. Then the
 * clear area's arcs (crossings on rays from the product centre, fitted to a circle), its straight sides, its corners
 * (traced at 4800 dpi against a blend and a sharp corner), and the magnetic zone's top and arc.
 */
export function magsafeReadings(pdf = PDF): Measured[] {
  const r = magsafeView, g = render(pdf, r);
  const { out, add } = collector();
  const rowAbove = Math.round(toPx(r, [0, -7.6])[1]), rowBelow = Math.round(toPx(r, [0, 135.1])[1]);
  const colLeft = Math.round(toPx(r, [-6.6, 0])[0]), colRight = Math.round(toPx(r, [69.9, 0])[0]);
  const xAt = (row: number, m: number, c: Calibration = r) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(c, [m, 0])[0]);
  const yAt = (col: number, m: number, c: Calibration = r) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(c, [0, m])[1]);
  const [x0, x1] = [0, 58.47].map((m) => xAt(rowAbove, m));
  const [y0, y1] = [0, 103.28].map((m) => yAt(colLeft, m));
  const sx = (x1 - x0) / 58.47, sy = (y1 - y0) / 103.28;
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [x0, y0] };
  const X = (px: number) => (px - cal.origin[0]) / cal.pxPerMm, Y = (px: number) => (px - cal.origin[1]) / cal.pxPerMm;
  add('MagSafe view px/mm across (calibration: the 0.00 and 58.47 lines)', r.pxPerMm, sx, 0.05);
  add('MagSafe view px/mm down (calibration: the 0.00 and -103.28 lines)', r.pxPerMm, sy, 0.05);
  add('MagSafe view datum across (px)', r.origin[0], x0, 1);
  add('MagSafe view datum down (px)', r.origin[1], y0, 1);
  add('MagSafe view 32.11 line across, above (dimensioned)', magsafe.fromSide.mm, X(xAt(rowAbove, 32.11, cal)), 0.03);
  for (const m of [magsafeSides.sideFrom, magsafe.fromSide, magsafeSides.sideTo]) add(`MagSafe view ${m.mm.toFixed(2)} line across, below (dimensioned)`, m.mm, X(xAt(rowBelow, m.mm, cal)), 0.03);
  add('MagSafe view -33.95 line down, left (dimensioned)', magsafe.zoneFrom!.mm, Y(yAt(colLeft, 33.95, cal)), 0.03);
  for (const m of [magsafeSides.compass.fromTop, magsafeSides.straightFrom, magsafe.fromTop, magsafeSides.straightTo]) add(`MagSafe view -${m.mm.toFixed(2)} line down, right (dimensioned)`, m.mm, Y(yAt(colRight, m.mm, cal)), 0.03);
  const row85 = Math.round(toPx(cal, [0, 85])[1]);
  add('the phone\'s width on the MagSafe view, 85 down (64.21)', body.width.mm, X(xAt(row85, body.width.mm, cal)) - X(xAt(row85, 0, cal)), 0.05);

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
  // through (0, 103.28) and (64.21, 103.28) of R49.39 (centred 65.75 down, derived).
  const zr = magsafe.zoneRadius!.mm, half = body.width.mm / 2;
  const zc = magsafe.zoneSidesTo!.mm - Math.sqrt(zr * zr - half * half);
  for (const x of [15, 50]) add(`magnetic zone's top at ${x} across (-33.95)`, magsafe.zoneFrom!.mm, Y(yAt(Math.round(toPx(cal, [x, 0])[0]), 33.95, cal)), 0.03);
  const low = mean([half - 0.75, half + 0.75].map((x) => Y(yAt(Math.round(toPx(cal, [x, 0])[0]), zc + zr, cal)) + (zr - Math.sqrt(zr * zr - 0.75 * 0.75))));
  add(`magnetic zone's arc, its lowest point (centre ${zc.toFixed(2)} down, derived, + R49.39)`, zc + zr, low, 0.05);
  for (const x of [10, 50]) {
    const at = zc + Math.sqrt(zr * zr - (x - half) ** 2);
    add(`magnetic zone's arc at x = ${x} (${at.toFixed(2)})`, at, Y(yAt(Math.round(toPx(cal, [x, 0])[0]), at, cal)), 0.05);
  }
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
  ...family(withFlash, { back: detailD, front: frontView, bottom: bottomView }, pdf, {
    // The front view's leaders (COVER GLASS, ACTIVE AREA) cross the left edge at 65 and 78 down and the 3.27 ALL AROUND
    // arrows at 100: row 90 is clear, below the side button. The cutout reaches 13.7 from the side, so the active
    // area's top is read 12 in.
    frontRow: 90,
    activeColumn: 12,
    // The crosshatch's lines run up to the right, along the bottom-left corner's diagonal; one lies on it (it reads
    // 0.97), so that corner is left out.
    activeCorners: ['top-left', 'top-right', 'bottom-right'],
  }),
  ...micReadings(pdf),
  ...sectionReadings(pdf),
  ...magsafeReadings(pdf),
];

export const hasPdf = () => existsSync(PDF);

if (import.meta.main) console.log(report(remeasure()));
