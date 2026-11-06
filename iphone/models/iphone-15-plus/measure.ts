// Re-measures every scaled value in drawing.ts from the PDF (the family's procedures, iphone/measure.ts), the one this
// model adds in Detail D (the corner's diagonal point), and two readings the Plus's drawing raises: Detail B's
// asymmetric 3.46 / -3.50, and which of Detail C's port outlines its 3.72 spans. Checks the rear mic (Detail A, at
// 4800 dpi), the flash's keepout section (J-J) and MagSafe's keepouts against what the drawing draws, and re-measures
// the scaled ones (the mic's outer ring, the magnetic zone's top). The procedures are the 15's (its measure.ts), with
// this sheet's own rows, columns and numbers.
//
//   node iphone-15-plus/measure.ts   → a table: recorded, measured, the difference
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { remeasure as family, report, type Measured } from '../../measure.ts';
import { cleanCircleAt, lineNear, render, runs, toPx, type Calibration } from '../../../src/raster.ts';
import { body, bottom, bottomView, bump, cornerDiagonal, detailA, detailB, detailC, detailD, flash, flashKeepout, flashKeepoutBase, front, frontView, magsafe, magsafeExtras, magsafeView, micView, phone, portInner, rearMic, rearMicInner, rearMicRing, sectionJJ } from './drawing.ts';

export const PDF = join(import.meta.dirname, '..', '..', 'drawings', 'iphone-15-plus.pdf');

/**
 * Detail D, drawn about 1:1: calibrated on the corner's own dimension lines, the six leaders across (0.59 to 17.40,
 * vertical above the phone) and the six down (horizontal left of it), each a thin line whose middle is its value. The
 * 0.00 lines can't serve: each merges with the 0.04 line beside it. The island (20.68 x 6.07 about -8.19, on the 2X
 * 38.88 line) then checks it. Then the outline's crossing of the corner's diagonal.
 */
export function detailDReadings(pdf = PDF): Measured[] {
  const r = detailD, g = render(pdf, r);
  const out: Measured[] = [];
  const W = body.width.mm;
  const marks = [0.59, 2.29, 5.24, 9.06, 13.21, 17.4];
  // Across: the leaders on a row 1 above the phone; down: on a column 0.3 left of it.
  const xs = marks.map((m) => lineNear(g, [0, Math.round(toPx(r, [0, -1])[1])], [1, 0], g.width - 1, toPx(r, [m, 0])[0]));
  const ys = marks.map((m) => lineNear(g, [Math.round(toPx(r, [-0.3, 0])[0]), 0], [0, 1], g.height - 1, toPx(r, [0, m])[1]));
  const span = marks.at(-1)! - marks[0];
  const [sx, sy] = [(xs.at(-1)! - xs[0]) / span, (ys.at(-1)! - ys[0]) / span];
  const mean = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length;
  const x0 = mean(xs.map((x, i) => x - marks[i] * sx)), y0 = mean(ys.map((y, i) => y - marks[i] * sy));
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [x0, y0] };
  out.push({ name: 'Detail D px/mm across (calibration: the corner\'s leaders, 0.59 to 17.40)', kind: 'check', recorded: r.pxPerMm, measured: sx, within: 0.05 });
  out.push({ name: 'Detail D px/mm down (calibration: the corner\'s leaders, 0.59 to 17.40)', kind: 'check', recorded: r.pxPerMm, measured: sy, within: 0.05 });
  out.push({ name: 'Detail D datum across (px)', kind: 'check', recorded: r.origin[0], measured: x0, within: 1 });
  out.push({ name: 'Detail D datum down (px)', kind: 'check', recorded: r.origin[1], measured: y0, within: 1 });
  // Every leader where the calibration puts it.
  marks.forEach((m, i) => {
    out.push({ name: `Detail D leader ${m.toFixed(2)} across (dimensioned)`, kind: 'check', recorded: m, measured: (xs[i] - x0) / cal.pxPerMm, within: 0.02 });
    out.push({ name: `Detail D leader ${m.toFixed(2)} down (dimensioned)`, kind: 'check', recorded: m, measured: (ys[i] - y0) / cal.pxPerMm, within: 0.02 });
  });
  // The island: its ends on its centre line, its top and bottom down a column 4 left of the 38.88 line (on its straight
  // run, clear of the centre line drawn down the middle, which the column at 38.88 runs along).
  const [il, ih, it] = [front.islandLength!.mm, front.islandHeight!.mm, front.islandFromTop!.mm];
  const ends = [W / 2 - il / 2, W / 2 + il / 2].map((x) => (lineNear(g, [0, Math.round(toPx(cal, [0, it])[1])], [1, 0], g.width - 1, toPx(cal, [x, 0])[0]) - x0) / cal.pxPerMm);
  const edges = [it - ih / 2, it + ih / 2].map((y) => (lineNear(g, [Math.round(toPx(cal, [W / 2 - 4, 0])[0]), 0], [0, 1], g.height - 1, toPx(cal, [0, y])[1]) - y0) / cal.pxPerMm);
  out.push({ name: 'Detail D island length (dimensioned 20.76)', kind: 'check', recorded: il, measured: ends[1] - ends[0], within: 0.05 });
  out.push({ name: 'Detail D island middle across (dimensioned 2X 38.88)', kind: 'check', recorded: 38.88, measured: (ends[0] + ends[1]) / 2, within: 0.05 });
  out.push({ name: 'Detail D island height (dimensioned 6.07)', kind: 'check', recorded: ih, measured: edges[1] - edges[0], within: 0.05 });
  out.push({ name: 'Detail D island middle from the top (dimensioned 8.19)', kind: 'check', recorded: it, measured: (edges[0] + edges[1]) / 2, within: 0.05 });

  // The diagonal from the sharp corner (from 0.4 in, past the datum lines' own crossing), at 4800 dpi: its first line
  // that isn't a leader (the 0.59 and 2.29 leaders, across and down, cross it at (0.59, 0.59) and (2.29, 2.29)) is the
  // outline, the thin line the crosses sit on. Its middle.
  const k = 4;
  const r4 = { page: r.page, dpi: r.dpi * k, crop: { x: r.crop.x * k, y: r.crop.y * k, width: 600 * k, height: 600 * k } };
  const c4: Calibration = { pxPerMm: cal.pxPerMm * k, origin: [cal.origin[0] * k, cal.origin[1] * k] };
  const g4 = render(pdf, r4);
  const leaders = [0.59, 2.29, 5.24];
  const diag = runs(g4, toPx(c4, [0.4, 0.4]), [Math.SQRT1_2, Math.SQRT1_2], Math.round(6 * c4.pxPerMm)).filter((q) => !leaders.some((l) => Math.abs(0.4 + (q.at / c4.pxPerMm) * Math.SQRT1_2 - l) * c4.pxPerMm < 16));
  out.push({ name: 'corner diagonal point (the outline on the 45° diagonal, 4800 dpi)', kind: 'scaled', recorded: cornerDiagonal.mm, measured: 0.4 + (diag[0].at / c4.pxPerMm) * Math.SQRT1_2, within: 0.05 });

  return out;
}

/**
 * Detail B: its leaders run level from the labels to the profile's ticks. Down a column through them, the four pairs
 * labelled ±1.62 to ±3.09 give the scale and the middle; then the 3.46 above and the -3.50 below are read where they're
 * drawn (the 15's reads ±3.50), and the ±3.77 pair checks it.
 */
export function detailBReadings(pdf = PDF): Measured[] {
  const r = detailB, g = render(pdf, r);
  const col = 300; // left of the profile, right of the labels' bends: only the leaders' level runs
  const at = (mm: number) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(r, [0, -mm])[1]);
  const pairs = [1.62, 2.12, 2.61, 3.09].map((m) => [m, at(m), at(-m)] as const);
  const scale = pairs.map(([m, up, dn]) => (dn - up) / (2 * m));
  const sy = scale.reduce((p, q) => p + q) / scale.length;
  const y0 = pairs.map(([, up, dn]) => (up + dn) / 2).reduce((p, q) => p + q) / pairs.length;
  const mm = (px: number) => (y0 - px) / sy;
  const front = body.edge.points, back = body.edgeBack!.points;
  return [
    { name: 'Detail B px/mm (calibration: the leaders ±1.62 to ±3.09)', kind: 'check', recorded: r.pxPerMm, measured: sy, within: 0.5 },
    { name: 'Detail B middle (px)', kind: 'check', recorded: r.origin[1], measured: y0, within: 1 },
    { name: `Detail B leader toward the front (dimensioned ${front[4][1].toFixed(2)})`, kind: 'check', recorded: front[4][1], measured: mm(at(front[4][1])), within: 0.01 },
    { name: `Detail B leader toward the back (dimensioned -${back[4][1].toFixed(2)})`, kind: 'check', recorded: back[4][1], measured: -mm(at(-back[4][1])), within: 0.01 },
    { name: 'Detail B leader 3.77 toward the front (dimensioned)', kind: 'check', recorded: 3.77, measured: mm(at(3.77)), within: 0.01 },
    { name: 'Detail B leader 3.77 toward the back (dimensioned)', kind: 'check', recorded: 3.77, measured: -mm(at(-3.77)), within: 0.01 },
  ];
}

/**
 * Detail C, calibrated across on the 12.45 keepout's extension lines (above the phone; the port's centre line midway).
 * Down a column 1.6 left of the port's centre (on its straight run, clear of its centre line), the phone's outlines
 * check the scale (7.81, drawn a little thin as every view here), and the port's two outlines are read: the 3.72's
 * extension lines run along the outer.
 */
export function detailCReadings(pdf = PDF): Measured[] {
  const r = detailC, g = render(pdf, r);
  const row = 467; // above the phone: only extension lines
  const k = phone.connector.width.mm;
  const [x0, x1] = [-k / 2, k / 2].map((x) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(r, [x, 0])[0]));
  const sx = (x1 - x0) / k, cx = (x0 + x1) / 2;
  const col = Math.round(cx - 1.6 * sx);
  const T = body.thickness.mm, c = phone.connector.fromBack.mm;
  const down = (mm: number) => lineNear(g, [col, 0], [0, 1], g.height - 1, r.origin[1] - mm * sx);
  const [backLine, frontLine] = [down(0), down(T)];
  const h = bottom.portHeight.mm, hi = portInner.mm;
  const outer = [down(c + h / 2), down(c - h / 2)], inner = [down(c + hi / 2), down(c - hi / 2)];
  const out: Measured[] = [
    { name: 'Detail C px/mm across (calibration: the 12.45 keepout)', kind: 'check', recorded: r.pxPerMm, measured: sx, within: 0.1 },
    { name: 'Detail C port centre line across (px, midway)', kind: 'check', recorded: r.origin[0], measured: cx, within: 1 },
    { name: `Detail C thickness, outline to outline (dimensioned ${T})`, kind: 'check', recorded: T, measured: (backLine - frontLine) / sx, within: 0.15 },
    { name: `Detail C port outer outline height (dimensioned ${h})`, kind: 'check', recorded: h, measured: (outer[1] - outer[0]) / sx, within: 0.05 },
    { name: `Detail C port outer outline middle from the back (dimensioned ${c})`, kind: 'check', recorded: c, measured: (backLine - (outer[0] + outer[1]) / 2) / sx, within: 0.05 },
    { name: 'Detail C port inner outline height', kind: 'scaled', recorded: hi, measured: (inner[1] - inner[0]) / sx, within: 0.05 },
  ];
  return out;
}

// Helpers for the checks below (as the 14's measure.ts).
const mean = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length;
const deg = (rad: number) => (rad * 180) / Math.PI;
const tanHalf = (fullDeg: number) => Math.tan((fullDeg / 2) * (Math.PI / 180));
function collector() {
  const out: Measured[] = [];
  const add = (name: string, recorded: number, measured: number, within: number, kind: Measured['kind'] = 'check') => out.push({ name, kind, recorded, measured, within });
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
 * Detail A's rear mic (the family's re-measurement doesn't read it), at 4800 dpi in Detail A's frame. Unlike the 15's
 * two circles, the Plus draws three, concentric: an inner Ø1.65, a heavier middle one (its pen 0.11 to the others'
 * 0.08) and an outer Ø2.40, with eight short spokes between the inner two (on the axes and the diagonals). Each is
 * fitted to its crossings on rays from the dimensioned centre every 2° (clear of the centre lines' ends, within 8° of
 * each axis, of the spokes, within 5° of each diagonal, and of the Ø2.10 leader's arrow, 150° to 176°), each crossing
 * sorted to a circle by its radius. Then where the leader's arrow lands: on its rays (156° to 158°) the ink runs
 * unbroken from the middle circle outward, and the paper between the inner circle and the middle one shows.
 */
export function micReadings(pdf = PDF): Measured[] {
  const r = detailA, g = render(pdf, r);
  const { out, add } = collector();
  const f = micView.dpi / r.dpi;
  // A pixel at 1200 dpi covers 4 at 4800: its centre is 1.5 in.
  const mc: Calibration = { pxPerMm: r.pxPerMm * f, origin: [(r.origin[0] + r.crop.x) * f + (f - 1) / 2 - micView.crop.x, (r.origin[1] + r.crop.y) * f + (f - 1) / 2 - micView.crop.y] };
  const mg = render(pdf, micView);
  const o = toPx(mc, [rearMic.fromSide.mm, rearMic.fromTop.mm]);
  const rings: [number, number][][] = [[], [], []];
  for (let a = 0; a < 360; a += 2) {
    if ([0, 90, 180, 270, 360].some((b) => Math.abs(a - b) < 8) || [45, 135, 225, 315].some((b) => Math.abs(a - b) < 5) || (a >= 150 && a <= 176)) continue;
    const t = (a * Math.PI) / 180, d: [number, number] = [Math.cos(t), Math.sin(t)], start = 0.6 * mc.pxPerMm;
    for (const q of runs(mg, [o[0] + d[0] * start, o[1] + d[1] * start], d, Math.round(0.8 * mc.pxPerMm))) {
      const rr = 0.6 + q.at / mc.pxPerMm;
      rings[rr < 0.93 ? 0 : rr < 1.12 ? 1 : 2].push([rearMic.fromSide.mm + d[0] * rr, rearMic.fromTop.mm + d[1] * rr]);
    }
  }
  const [inner, middle, outer] = rings.map(fitCircle);
  const n = rings.map((p) => p.length);
  add(`rear mic centre across (dimensioned 11.47: the ordinate below Detail A; the middle circle, ${n[1]} crossings)`, rearMic.fromSide.mm, middle.centre[0], 0.05);
  add('rear mic centre down (dimensioned 26.90; the three circles are drawn 0.035 below it)', rearMic.fromTop.mm, middle.centre[1], 0.05);
  add(`rear mic Ø (dimensioned 2.10): the middle circle, its stroke\'s middle (worst crossing ${middle.worst.toFixed(3)} off)`, rearMic.diameter.mm, 2 * middle.radius, 0.05);
  add(`rear mic's inner circle Ø (scaled; ${n[0]} crossings)`, rearMicInner.mm, 2 * inner.radius, 0.05, 'scaled');
  add(`rear mic's outer ring Ø (scaled; ${n[2]} crossings)`, rearMicRing.mm, 2 * outer.radius, 0.05, 'scaled');
  for (const [name, c] of [['inner', inner], ['outer', outer]] as const) add(`rear mic's ${name} circle concentric with the middle (mm apart)`, 0, Math.hypot(c.centre[0] - middle.centre[0], c.centre[1] - middle.centre[1]), 0.02);
  // Paper samples on a ray between two radii.
  const paper = (a: number, from: number, to: number) => {
    const t = (a * Math.PI) / 180;
    let white = 0;
    for (let rr = from; rr < to; rr += 0.005) {
      const x = Math.round(o[0] + Math.cos(t) * rr * mc.pxPerMm), y = Math.round(o[1] + Math.sin(t) * rr * mc.pxPerMm);
      if (mg.at(x, y) > 128) white++;
    }
    return white;
  };
  const arrow = [156, 157, 158];
  add('rear mic: the Ø2.10 arrow lands on the middle circle (paper samples between its stroke and 1.30 out on rays 156° to 158°)', 0, arrow.reduce((s, a) => s + paper(a, middle.radius + 0.06, 1.3), 0), 0);
  add('rear mic: the arrow stops at the middle circle (1 = paper between the inner and middle circles on every arrow ray)', 1, arrow.every((a) => paper(a, inner.radius + 0.05, middle.radius - 0.07) > 3) ? 1 : 0, 0);
  add('negative control: on rays clear of the arrow (146° to 152°) the gap between the middle and outer circles shows (1 = paper found on every ray)', 1, [146, 148, 150, 152].every((a) => paper(a, middle.radius + 0.06, outer.radius - 0.05) > 3) ? 1 : 0, 0);
  // Read with the numbers swapped (26.90 across, 11.47 down) the place lands inside the flash (0.58 from its centre, in
  // its Ø6.28): no Ø2.10 circle is drawn there.
  let swapped = 'none';
  try {
    const w = cleanCircleAt(g, toPx(r, [rearMic.fromTop.mm, rearMic.fromSide.mm]), (rearMic.diameter.mm / 2) * r.pxPerMm, [25, -25, 40, -40]);
    swapped = `Ø${(w.diameter / r.pxPerMm).toFixed(2)}`;
  } catch {}
  add(`negative control: at (26.90, 11.47), the numbers swapped, the circle found: ${swapped} (1 = none, or over 0.5 mm off Ø2.10)`, 1, swapped === 'none' || Math.abs(Number(swapped.slice(1)) - rearMic.diameter.mm) > 0.5 ? 1 : 0, 0);
  // The bump's top's bottom-left corner: centre (3.90 + 9.03, 34.47 - 9.03); the mic's centre is 2.06 from it, well
  // inside R9.03, so the builder puts it flush on the bump's top.
  const corner: [number, number] = [bump.topFrom.mm + bump.topRadius.mm, bump.topFrom.mm + bump.topSize.mm - bump.topRadius.mm];
  add('rear mic inside the bump top\'s R9.03 corner (how far its edge would stand outside it: 0)', 0, Math.max(0, Math.hypot(rearMic.fromSide.mm - corner[0], rearMic.fromTop.mm - corner[1]) - (bump.topRadius.mm - rearMic.diameter.mm / 2)), 0);
  return out;
}

/**
 * Sheet 2's Section J-J (down the phone through the flash): the scale from the cover glass's face (the left edge) to the
 * 11.62 extension line; the faces on the right (the back glass beyond the bump, the bump's glass, the strobe under it,
 * camera 2's ring below; 9.56's extension line above the phone); the cone's four lines (the first ink right of a start
 * column, row by row, each fitted), their crossings (the apex, the kinks) and angles; the inner cone's width at the
 * strobe's face and at the glass's (the flash's Ø6.28).
 */
export function sectionReadings(pdf = PDF): Measured[] {
  const r = sectionJJ, k = flashKeepout, g = render(pdf, r);
  const { out, add } = collector();
  const across = (y: number, expect: number) => lineNear(g, [0, y], [1, 0], g.width - 1, expect);
  // Row 600, below the 11.62 dimension line and above 9.56's (and the phone's top end), crosses only the 11.62
  // extension lines (and the outer cone's line beyond them).
  const face = across(600, r.origin[0]);
  const px = (across(600, face + k.transitionFromFront!.mm * r.pxPerMm) - face) / k.transitionFromFront!.mm;
  const mm = (x: number) => (x - face) / px;
  add('Section J-J px/mm (calibration: the cover glass face to the 11.62 line)', r.pxPerMm, px, 0.05);
  add('Section J-J cover glass face (px)', r.origin[0], face, 1);
  add('J-J the cover glass face on the phone (row 2600), against the extension line\'s (mm)', 0, mm(across(2600, face)), 0.03);
  // The faces (this sheet's rows: the phone's top end is at about row 1260): the back glass below the bump (rows 2900,
  // 3050), the bump's glass below the flash (rows 1990, 2050: above it 9.56's extension line runs beside the glass and
  // merges with it), the strobe (rows 1660, 1820, between its corners at about 1610 and 1895, off the hatch lines),
  // camera 2's ring (rows 2300, 2600: the cut runs 1.68 beside its centre), 9.56's extension line above the phone
  // (rows 900, 1100).
  const T = body.thickness.mm, top = T + bump.top.mm, rings = T + bump.rings.mm, base = flashKeepoutBase.fromFront.mm;
  const back = mean([2900, 3050].map((y) => mm(across(y, face + T * px))));
  const glass = mean([1990, 2050].map((y) => mm(across(y, face + top * px))));
  const strobe = mean([1660, 1820].map((y) => mm(across(y, face + base * px))));
  const ring = mean([2300, 2600].map((y) => mm(across(y, face + rings * px))));
  const ext = mean([900, 1100].map((y) => mm(across(y, face + base * px))));
  add('J-J the back glass beyond the bump (7.81)', T, back, 0.05);
  add(`J-J the bump's glass below the flash, 7.81 + 1.85 (drawn ${glass.toFixed(3)})`, top, glass, 0.05);
  add(`J-J camera 2's ring below the flash, 7.81 + 3.48 (drawn ${ring.toFixed(3)})`, rings, ring, 0.05);
  add('J-J 9.56\'s extension line, above the phone (dimensioned 9.56)', base, ext, 0.03);
  add('J-J the strobe\'s face, on 9.56\'s extension line (dimensioned 9.56)', base, strobe, 0.05);
  add('J-J the strobe 0.10 under the bump\'s glass (9.66 - 9.56, as the 15\'s)', top - base, glass - strobe, 0.03);
  // The cone's lines: the first ink right of a start column on each row. The inner lines start right of the bump's
  // glass; the outer lines right of the 11.62 extension line (camera 2's ring stands left of it below). Hatch lines
  // inside the inner cone can merge with its lines on some rows, pulling the run's middle inward: so each row takes the
  // run's outer edge (the white side), moved in by half the line's own pen (the median run width).
  const hit = (y: number, x0: number) => {
    const rs = runs(g, [x0, y], [1, 0], g.width - 1 - x0);
    return rs.length ? { edge: x0 + rs[0].at - (rs[0].width - 1) / 2, width: rs[0].width } : { edge: NaN, width: NaN };
  };
  const inside = Math.round(face + (top + 0.15) * px), outside = Math.round(face + (k.transitionFromFront!.mm + 0.15) * px);
  const line = (a: number, b: number, x0: number) => {
    const hs = rowsBy(a, b).map((y) => ({ y, ...hit(y, x0) }));
    const ws = hs.map((h) => h.width).filter(Number.isFinite).sort((p, q) => p - q), pen = ws[Math.floor(ws.length / 2)];
    return fitLine(hs.map((h): [number, number] => [h.edge + (pen - 1) / 2, h.y]));
  };
  // Rows: the upper outer from where it passes inside the 13.61 closing line (row 1060) to above the kink (about 1465);
  // the inner lines between the kinks and the strobe's corners (the upper 1480 to 1590; the lower 1930 to 2010, clear of
  // the hatch line that leaves the lower corner beside it); the lower outer from below the kink (about 2025) for 340
  // rows, as long as the upper.
  const upperOuter = line(1060, 1380, outside), upperInner = line(1480, 1590, inside), lowerInner = line(1930, 2010, inside);
  const lowerOuter = line(2080, 2420, outside);
  const offAxis = (l: Line) => 90 - deg(Math.atan(Math.abs(l.b)));
  const apex = meet(upperInner, lowerInner), kinks = [meet(upperInner, upperOuter), meet(lowerInner, lowerOuter)];
  kinks.forEach((q, i) => add(`J-J ${i ? 'lower' : 'upper'} kink, inner cone to outer, from the cover glass (11.62)`, k.transitionFromFront!.mm, mm(q[0]), 0.05));
  add(`J-J inner cone, full angle as drawn (degrees; its lines fitted to ${upperInner.n} and ${lowerInner.n} rows, ~2 mm long)`, k.inner.mm, offAxis(upperInner) + offAxis(lowerInner), 1);
  add(`J-J outer cone, full angle as drawn (degrees; fitted to ${upperOuter.n} and ${lowerOuter.n} rows)`, k.outer!.mm, offAxis(upperOuter) + offAxis(lowerOuter), 1);
  add('J-J the apex midway between the kinks, down (mm: on the cone\'s axis)', 0, (apex[1] - (kinks[0][1] + kinks[1][1]) / 2) / px, 0.1);
  add('J-J inner cone\'s apex from the cover glass (derived 7.54; the drawn lines crossed)', k.apexFromFront!.mm, mm(apex[0]), 0.1);
  const width = (atMm: number) => {
    const x = face + atMm * px;
    return ((x - lowerInner.a) / lowerInner.b - (x - upperInner.a) / upperInner.b) / px;
  };
  add('J-J inner cone at the strobe\'s face (derived Ø5.98)', k.innerBaseDiameter!.mm, width(strobe), 0.05);
  add('J-J inner cone at the bump\'s top, 9.66 (the flash\'s Ø6.28 there)', flash.diameter.mm, width(top), 0.05);
  // Hand calculation from the printed numbers alone: the 112.01° cone from Ø6.28 at 9.66 out to 11.62 (the
  // transition), against the drawn kinks' spacing.
  const spacing = Math.abs(kinks[1][1] - kinks[0][1]) / px;
  const transition = flash.diameter.mm + 2 * (k.transitionFromFront!.mm - top) * tanHalf(k.inner.mm);
  add(`J-J transition, Ø6.28 + 2 (11.62 - 9.66) tan 56.005° = ${transition.toFixed(2)}, against the drawn kinks' spacing`, transition, spacing, 0.1);
  // The negative controls: read from the back glass, "11.62 to cover glass" would put the kinks 7.81 further out (19.43
  // from the front); and read as the apex, 9.56 would leave the drawn lines' crossing over 1.5 mm away.
  add('negative control: read from the back glass the transition would be 19.43 from the front (1 = the drawn kinks are over 5 mm from it)', 1, Math.abs(mm(kinks[0][0]) - (T + k.transitionFromFront!.mm)) > 5 ? 1 : 0, 0);
  add('negative control: 9.56 read as the inner cone\'s apex (1 = the drawn lines cross over 1.5 mm nearer the front)', 1, base - mm(apex[0]) > 1.5 ? 1 : 0, 0);
  return out;
}

/**
 * Sheet 2's MagSafe view, calibrated on its extension lines: across, the 0.00 and 70.77 lines on a row 6 above the
 * phone (the 0.00 line breaks from about 3.5 to 4.5 above it); down, the 0.00 and -115.72 lines on a column 5 left of
 * it. The other dimensioned lines check it (the -80.44 and -8.84 lines run off to the right, so they're read on a
 * column 7.2 right of the phone). Then the clear area's circle (crossings on rays from the product centre, fitted), and
 * the magnetic zone's top (scaled: not dimensioned) and arc.
 */
export function magsafeReadings(pdf = PDF): Measured[] {
  const r = magsafeView, g = render(pdf, r);
  const { out, add } = collector();
  const rowAbove = Math.round(toPx(r, [0, -6])[1]), rowBelow = Math.round(toPx(r, [0, 163])[1]);
  const colLeft = Math.round(toPx(r, [-5, 0])[0]), colRight = Math.round(toPx(r, [85, 0])[0]);
  const xAt = (row: number, m: number, c: Calibration = r) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(c, [m, 0])[0]);
  const yAt = (col: number, m: number, c: Calibration = r) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(c, [0, m])[1]);
  const { compass, cameraZone } = magsafeExtras;
  const [x0, x1] = [0, compass.fromSide.mm].map((m) => xAt(rowAbove, m));
  const [y0, y1] = [0, magsafe.zoneSidesTo!.mm].map((m) => yAt(colLeft, m));
  const sx = (x1 - x0) / compass.fromSide.mm, sy = (y1 - y0) / magsafe.zoneSidesTo!.mm;
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [x0, y0] };
  const X = (px: number) => (px - cal.origin[0]) / cal.pxPerMm, Y = (px: number) => (px - cal.origin[1]) / cal.pxPerMm;
  const col = (x: number) => Math.round(toPx(cal, [x, 0])[0]);
  add('MagSafe view px/mm across (calibration: the 0.00 and 70.77 lines)', r.pxPerMm, sx, 0.05);
  add('MagSafe view px/mm down (calibration: the 0.00 and -115.72 lines)', r.pxPerMm, sy, 0.05);
  add('MagSafe view datum across (px)', r.origin[0], x0, 1);
  add('MagSafe view datum down (px)', r.origin[1], y0, 1);
  add('MagSafe view 37.15 line across, above (dimensioned)', cameraZone.across.mm, X(xAt(rowAbove, cameraZone.across.mm, cal)), 0.03);
  add('MagSafe view 38.88 line across, below (dimensioned)', magsafe.fromSide.mm, X(xAt(rowBelow, magsafe.fromSide.mm, cal)), 0.03);
  for (const m of [compass.fromTop, magsafe.fromTop]) add(`MagSafe view -${m.mm.toFixed(2)} line down, right (dimensioned)`, m.mm, Y(yAt(colRight, m.mm, cal)), 0.03);
  // The phone's width on a row 140 down, below the zone's sides: at 85 down (the 15's row) a hatch line meets the right
  // side and merges with it (one 20 px run, its middle 0.09 in).
  const row140 = Math.round(toPx(cal, [0, 140])[1]);
  add('the phone\'s width on the MagSafe view, 140 down (77.76)', body.width.mm, X(xAt(row140, body.width.mm, cal)) - X(xAt(row140, 0, cal)), 0.05);

  // The clear area's circle: crossings within 0.25 of R28.75 on rays every 5° from the product centre, clear of the
  // centre lines (within 6° of each axis) and of the two leaders that cross it (Ø57.50's at about 157°, the clear
  // area's note's at about 35°: down is positive), keeping rays with one crossing only (a hatch line meeting the circle
  // gives two).
  const c: [number, number] = [magsafe.fromSide.mm, magsafe.fromTop.mm], R = magsafe.diameter.mm / 2;
  const P: [number, number][] = [];
  for (let a = 0; a < 360; a += 5) {
    if ([0, 90, 180, 270, 360].some((b) => Math.abs(a - b) < 6) || [157, 35].some((b) => Math.abs(a - b) < 9)) continue;
    const t = (a * Math.PI) / 180, d: [number, number] = [Math.cos(t), Math.sin(t)];
    const o = toPx(cal, c), start = (R - 1.5) * cal.pxPerMm;
    const rs = runs(g, [o[0] + d[0] * start, o[1] + d[1] * start], d, Math.round(3 * cal.pxPerMm)).map((q) => R - 1.5 + q.at / cal.pxPerMm).filter((x) => Math.abs(x - R) < 0.25);
    if (rs.length === 1) P.push([c[0] + d[0] * rs[0], c[1] + d[1] * rs[0]]);
  }
  const f = fitCircle(P);
  add(`clear area's circle: centre across (fitted to ${P.length} crossings; worst ${f.worst.toFixed(3)} off)`, magsafe.fromSide.mm, f.centre[0], 0.05);
  add('clear area\'s circle: centre down (round the product centre)', magsafe.fromTop.mm, f.centre[1], 0.05);
  add('clear area\'s circle: Ø (dimensioned 57.50)', magsafe.diameter.mm, 2 * f.radius, 0.05);

  // The zone's top, not dimensioned: on columns 16 and 55 across (under the camera corner, and under the open top),
  // a thin outline's pen (the hatch lines' are wider). On column 16 the bump's outline (37.15, Detail A) stands 3.08
  // above it: the zone doesn't start at the bump.
  for (const x of [16, 55]) add(`magnetic zone's top at ${x} across (scaled)`, magsafe.zoneFrom!.mm, Y(yAt(col(x), magsafe.zoneFrom!.mm, cal)), 0.03, 'scaled');
  const outline = bump.baseFrom.mm + bump.baseSize.mm;
  add('the bump\'s outline on the MagSafe view, 16 across (Detail A: 37.15)', outline, Y(yAt(col(16), outline, cal)), 0.03);
  add('negative control: the zone\'s top isn\'t the bump\'s outline (1 = over 2 mm below it)', 1, magsafe.zoneFrom!.mm - outline > 2 ? 1 : 0, 0);
  // Its arc: the lowest point down columns 0.75 either side of the centre line; its crossings of x = 12, 22, 55.76 and
  // 65.76 (clear of the R52.49 leader, which lands on the arc about 4.4 across), against the circle through (0, 115.72)
  // and (77.76, 115.72) of R52.49, its centre derived: the product centre (160.89 / 2 = 80.445), within 0.011.
  const zr = magsafe.zoneRadius!.mm, half = body.width.mm / 2;
  const zc = magsafe.zoneSidesTo!.mm - Math.sqrt(zr * zr - half * half);
  add(`hand calculation: the zone's arc's centre, 115.72 - √(52.49² - 38.88²) = ${zc.toFixed(3)} down, the product centre (160.89 / 2)`, body.length.mm / 2, zc, 0.02);
  const low = mean([half - 0.75, half + 0.75].map((x) => Y(yAt(col(x), zc + zr, cal)) + (zr - Math.sqrt(zr * zr - 0.75 * 0.75))));
  add(`magnetic zone's arc, its lowest point (centre ${zc.toFixed(2)} down, derived, + R52.49)`, zc + zr, low, 0.05);
  for (const x of [12, 22, 55.76, 65.76]) {
    const at = zc + Math.sqrt(zr * zr - (x - half) ** 2);
    add(`magnetic zone's arc at x = ${x} (${at.toFixed(2)})`, at, Y(yAt(col(x), at, cal)), 0.05);
  }
  // The negative control: centred 3.10 below the product centre (as the 15's R49.39), R52.49 would bottom out 3.10
  // lower than the drawn arc.
  add(`negative control: centred 3.10 below the product centre (the 15's), R52.49's lowest point would be ${(magsafe.fromTop.mm + 3.1 + zr).toFixed(2)} (1 = the drawn one is over 2 mm higher)`, 1, magsafe.fromTop.mm + 3.1 + zr - low > 2 ? 1 : 0, 0);
  return out;
}

export const remeasure = (pdf = PDF): Measured[] => [
  ...family(phone, { back: detailA, front: frontView, bottom: bottomView }, pdf, {
    // The active area's bottom-left diagonal runs along a hatch line that starts on the arc (as the 16 Pro's).
    activeCorners: ['top-left', 'top-right', 'bottom-right'],
    // A row 1.9 toward the front: on the flat band (to 2.12), clear of the port (3.25 tall about the middle) and the
    // buttons' stubs (2.66 wide about it).
    bottomRow: 1.9,
  }),
  ...detailDReadings(pdf),
  ...detailBReadings(pdf),
  ...detailCReadings(pdf),
  ...micReadings(pdf),
  ...sectionReadings(pdf),
  ...magsafeReadings(pdf),
];

export const hasPdf = () => existsSync(PDF);

if (import.meta.main) console.log(report(remeasure()));
