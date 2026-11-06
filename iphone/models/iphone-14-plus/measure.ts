// Re-measures every scaled value in drawing.ts from the PDF (the family's procedures, iphone/measure.ts), and the
// receiver's slot with the 14's scan (below), and the corner's diagonal point in Detail D; and checks the rear mic, the
// flash's keepout section (N-N, with the faces of L-L and M-M) and MagSafe's keepouts against what the drawing draws.
//
//   node iphone-14-plus/measure.ts   → a table: recorded, measured, the difference
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { remeasure as family, report, type Measured } from '../../measure.ts';
import { cleanCircleAt, lineNear, render, runs, toPx, type Calibration } from '../../../src/raster.ts';
import { body, bottomView, bump, cameras, cornerDiagonal, detailA, detailD, flash, flashKeepout, flashKeepoutPrinted, frontView, lightning, magsafe, magsafeExtras, magsafeView, micView, phone, rearMic, receiverView, sectionBackGlass, sectionLL, sectionMM, sectionNN } from './drawing.ts';

export const PDF = join(import.meta.dirname, '..', '..', 'drawings', 'iphone-14-plus.pdf');

/**
 * The receiver's slot, at 4800 dpi in the front view's frame. The family's scan reads the slot's end strokes on the
 * row through its middle, but here the slot's round ends touch the cutout's end walls there: each end is one 70 px run
 * (the cutout's 38 px wall and the slot's stroke together), whose middle reads the slot 11.42 long, and widening by
 * half that run reads it 1.16 high. So this measures what the family's scan means to: the white inside the slot (down
 * its middle column, then along the row through the white's middle), widened by one stroke of the slot's own pen. That
 * stroke is read radially on its round ends, from each end's centre up and outward at 30° to 75°, where it stands
 * clear of the glass edge (above) and the cutout's walls (beside). That's the 14's scan; on the 14 Plus the slot's top
 * stroke merges with the glass edge at 75° (one 73 px run), so it's read at 30°, 45° and 60° only (33 to 34 px). Detail
 * D, at twice the scale, checks the slot (detailDReadings).
 */
function receiver(pdf: string): Measured[] {
  const { body, front } = phone;
  const [W, L] = [body.width.mm, body.length.mm];
  // The front view's calibration, as the family finds it: its outer edges across a row 30 above the bottom, down the
  // column 4 left of the middle.
  const g = render(pdf, frontView);
  const row = toPx(frontView, [0, L - 30])[1], col = toPx(frontView, [W / 2 - 4, 0])[0];
  const [left, right] = [0, W].map((x) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(frontView, [x, 0])[0]));
  const [top, foot] = [0, L].map((y) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(frontView, [0, y])[1]));
  const cal: Calibration = { pxPerMm: ((right - left) / W + (foot - top) / L) / 2, origin: [left, top] };
  const f = receiverView.dpi / frontView.dpi;
  const rc: Calibration = {
    pxPerMm: cal.pxPerMm * f,
    origin: [(cal.origin[0] + frontView.crop.x) * f - receiverView.crop.x, (cal.origin[1] + frontView.crop.y) * f - receiverView.crop.y],
  };
  const rg = render(pdf, receiverView);
  const mid = toPx(rc, [W / 2, front.receiverFromTop!.mm]);
  // The white down the middle column: between the run above (the glass edge and the slot's top stroke, merged) and the
  // run below (the slot's bottom stroke and the cutout's, merged).
  const down = runs(rg, [Math.round(mid[0]), 0], [0, 1], rg.height - 1);
  const above = down.filter((q) => q.at < mid[1]).at(-1)!, below = down.find((q) => q.at > mid[1])!;
  const [y0, y1] = [above.at + (above.width + 1) / 2, below.at - (below.width + 1) / 2];
  const ym = (y0 + y1) / 2;
  // The white along the row through its middle, between the two merged end runs nearest the slot's recorded ends.
  const along = runs(rg, [0, Math.round(ym)], [1, 0], rg.width - 1);
  const half = (front.receiverLength!.mm / 2) * rc.pxPerMm;
  const nearest = (x: number) => along.reduce((p, q) => (Math.abs(q.at - x) < Math.abs(p.at - x) ? q : p));
  const [e0, e1] = [nearest(mid[0] - half), nearest(mid[0] + half)];
  const [x0, x1] = [e0.at + (e0.width + 1) / 2, e1.at - (e1.width + 1) / 2];
  // The slot's own stroke, radially on each round end.
  const r = (y1 - y0) / 2;
  const strokes = [[x0 + r, -1], [x1 - r, 1]].flatMap(([cx, side]) =>
    [30, 45, 60].map((a) => {
      const t = (a * Math.PI) / 180;
      return runs(rg, [cx, ym], [side * Math.cos(t), -Math.sin(t)], Math.round(4 * r))[0].width;
    }),
  );
  const stroke = strokes.reduce((s, w) => s + w) / strokes.length;
  const mm = (px: number) => px / rc.pxPerMm;
  const add = (name: string, kind: Measured['kind'], recorded: number, measured: number): Measured => ({ name, kind, recorded, measured, within: 0.05 });
  return [
    add(`receiver slot length (the white inside, ${mm(x1 - x0).toFixed(2)}, and a ${mm(stroke).toFixed(2)} stroke)`, 'scaled', front.receiverLength!.mm, mm(x1 - x0 + stroke)),
    add(`receiver slot height (the white inside, ${mm(y1 - y0).toFixed(2)}, and a ${mm(stroke).toFixed(2)} stroke)`, 'scaled', front.receiverHeight!.mm, mm(y1 - y0 + stroke)),
    add(`receiver slot middle from the top (dimensioned ${front.receiverFromTop!.mm})`, 'check', front.receiverFromTop!.mm, mm(ym - rc.origin[1])),
  ];
}

/**
 * Detail D, drawn at the back's scale (about 46 px/mm at 1200 dpi): calibrated on the corner's own leaders, the five
 * across (1.35 to 17.32, vertical above the phone) and the five down (0.85 to 15.96, horizontal left of it), each a thin
 * line whose middle is its value (the 0.00 and 0.17 lines stand apart across but the 0.00 and 0.07 merge down, so neither
 * pair serves). The receiver's cutout (11.95 long about the 39.04 line) then checks it. Then the outline's crossing of
 * the corner's diagonal.
 */
export function detailDReadings(pdf = PDF): Measured[] {
  const r = detailD, g = render(pdf, r);
  const out: Measured[] = [];
  const across = [1.35, 4.1, 8.1, 12.67, 17.32], down = [0.85, 3.14, 6.85, 11.32, 15.96];
  // Across: the leaders on a row 1 above the phone; down: on a column 1 left of it (at 0.3 the crosses' arms reach).
  const xs = across.map((m) => lineNear(g, [0, Math.round(toPx(r, [0, -1])[1])], [1, 0], g.width - 1, toPx(r, [m, 0])[0]));
  const ys = down.map((m) => lineNear(g, [Math.round(toPx(r, [-1, 0])[0]), 0], [0, 1], g.height - 1, toPx(r, [0, m])[1]));
  const [sx, sy] = [(xs.at(-1)! - xs[0]) / (across.at(-1)! - across[0]), (ys.at(-1)! - ys[0]) / (down.at(-1)! - down[0])];
  const mean = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length;
  const x0 = mean(xs.map((x, i) => x - across[i] * sx)), y0 = mean(ys.map((y, i) => y - down[i] * sy));
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [x0, y0] };
  out.push({ name: 'Detail D px/mm across (calibration: the corner\'s leaders, 1.35 to 17.32)', kind: 'check', recorded: r.pxPerMm, measured: sx, within: 0.05 });
  out.push({ name: 'Detail D px/mm down (calibration: the corner\'s leaders, 0.85 to 15.96)', kind: 'check', recorded: r.pxPerMm, measured: sy, within: 0.05 });
  out.push({ name: 'Detail D datum across (px)', kind: 'check', recorded: r.origin[0], measured: x0, within: 1 });
  out.push({ name: 'Detail D datum down (px)', kind: 'check', recorded: r.origin[1], measured: y0, within: 1 });
  across.forEach((m, i) => out.push({ name: `Detail D leader ${m.toFixed(2)} across (dimensioned)`, kind: 'check', recorded: m, measured: (xs[i] - x0) / cal.pxPerMm, within: 0.02 }));
  down.forEach((m, i) => out.push({ name: `Detail D leader ${m.toFixed(2)} down (dimensioned)`, kind: 'check', recorded: m, measured: (ys[i] - y0) / cal.pxPerMm, within: 0.02 }));
  // The 0.17 leader, which the calibration didn't use.
  const x17 = lineNear(g, [0, Math.round(toPx(cal, [0, -1])[1])], [1, 0], g.width - 1, toPx(cal, [0.17, 0])[0]);
  out.push({ name: 'Detail D leader 0.17 across (dimensioned; not in the calibration)', kind: 'check', recorded: 0.17, measured: (x17 - x0) / cal.pxPerMm, within: 0.02 });
  // The receiver's cutout: its 11.95's extension lines on a row 3.1 down (below the cutout, above the dimension line);
  // each lands on the middle of the cutout's outer stroke. (Along the row through the cutout's middle the -1.74 centre
  // line runs inside it, and the cutout's and the slot's end strokes stand 0.4 apart.)
  const { body, front } = phone;
  const cx = lightning.fromSide.mm, cut = 11.95, ry = Math.round(toPx(cal, [0, 3.1])[1]);
  const ext = [cx - cut / 2, cx + cut / 2].map((x) => (lineNear(g, [0, ry], [1, 0], g.width - 1, toPx(cal, [x, 0])[0]) - x0) / cal.pxPerMm);
  out.push({ name: `Detail D receiver cutout length, its extension lines (dimensioned ${cut})`, kind: 'check', recorded: cut, measured: ext[1] - ext[0], within: 0.05 });
  out.push({ name: `Detail D receiver cutout middle across (dimensioned ${cx}; ${(body.width.mm / 2).toFixed(3)} is the phone's middle)`, kind: 'check', recorded: cx, measured: (ext[0] + ext[1]) / 2, within: 0.05 });
  // And the slot, drawn here at twice the front view's scale: down the column 2 left of the middle (the 39.04 line is
  // dashed down the middle), the -1.74 centre line runs inside it, and the runs either side of that are the slot's top
  // and bottom strokes (its top separate from the cutout's and the glass edge's here). Its ends on a row 0.2 below the
  // centre line (clear of the dashes), the round ends' inset there added back (ends of half its height).
  const dc = runs(g, [Math.round(toPx(cal, [cx - 2, 0])[0]), 0], [0, 1], g.height - 1);
  const ft = front.receiverFromTop!.mm, mid = toPx(cal, [0, ft])[1];
  const ci = dc.reduce((p, q, i) => (Math.abs(q.at - mid) < Math.abs(dc[p].at - mid) ? i : p), 0);
  const [st, sb] = [dc[ci - 1], dc[ci + 1]].map((q) => (q.at - y0) / cal.pxPerMm);
  out.push({ name: `Detail D receiver centre line from the top (dimensioned ${ft})`, kind: 'check', recorded: ft, measured: (dc[ci].at - y0) / cal.pxPerMm, within: 0.05 });
  out.push({ name: `Detail D receiver slot middle from the top (its strokes ${st.toFixed(2)}, ${sb.toFixed(2)})`, kind: 'check', recorded: ft, measured: (st + sb) / 2, within: 0.05 });
  out.push({ name: 'Detail D receiver slot height, its strokes\' middles (front view: 0.73)', kind: 'check', recorded: front.receiverHeight!.mm, measured: sb - st, within: 0.05 });
  const half = (sb - st) / 2, off = 0.2, inset = half - Math.sqrt(half ** 2 - off ** 2);
  const sr = runs(g, [0, Math.round(toPx(cal, [0, ft + off])[1])], [1, 0], g.width - 1);
  const near = (x: number) => sr.reduce((p, q) => (Math.abs(q.at - x) < Math.abs(p.at - x) ? q : p));
  const rl = front.receiverLength!.mm;
  const [l0, l1] = [cx - rl / 2, cx + rl / 2].map((x) => (near(toPx(cal, [x, 0])[0]).at - x0) / cal.pxPerMm);
  out.push({ name: `Detail D receiver slot length, its strokes' middles (front view: ${rl}; ${(l1 - l0).toFixed(2)} at ${off} off the centre line)`, kind: 'check', recorded: rl, measured: l1 - l0 + 2 * inset, within: 0.05 });

  // The diagonal from the sharp corner (from 0.4 in, past the datum lines' own crossing), at 4800 dpi: its first line
  // that isn't a leader (the 0.85 and 1.35 leaders cross it at (0.85, 0.85) and (1.35, 1.35); the 3.14 leader, merged
  // with the left arm of the (4.10, 3.14) cross, at 3.19) is the outline, the thin line the crosses sit on. Its middle.
  const k = 4;
  const r4 = { page: r.page, dpi: r.dpi * k, crop: { x: r.crop.x * k, y: r.crop.y * k, width: 600 * k, height: 600 * k } };
  const c4: Calibration = { pxPerMm: cal.pxPerMm * k, origin: [cal.origin[0] * k, cal.origin[1] * k] };
  const g4 = render(pdf, r4);
  const leaders = [0.85, 1.35, 3.14];
  const along = (q: { at: number }) => 0.4 + (q.at / c4.pxPerMm) * Math.SQRT1_2;
  const diag = runs(g4, toPx(c4, [0.4, 0.4]), [Math.SQRT1_2, Math.SQRT1_2], Math.round(6 * c4.pxPerMm)).filter((q) => !leaders.some((l) => Math.abs(along(q) - l) * c4.pxPerMm < 16));
  out.push({ name: 'corner diagonal point (the outline on the 45° diagonal, 4800 dpi)', kind: 'scaled', recorded: cornerDiagonal.mm, measured: along(diag[0]), within: 0.05 });
  return out;
}

// Helpers for the checks below (as the 14's measure.ts).
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
 * Detail A's rear mic (the family's re-measurement doesn't read it), at 4800 dpi in Detail A's frame: three concentric
 * circles are drawn there, as on the 14, the middle one dashed. Each is fitted to its crossings on rays from the
 * dimensioned centre every 2° (clear of the extension lines' ends, within 8° of each axis, and of the Ø2.10 leader's
 * arrowhead, which comes in from the lower left), each crossing sorted to a circle by its radius (the 14's bands).
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
    if ([0, 90, 180, 270, 360].some((b) => Math.abs(a - b) < 8) || (a > 115 && a < 175)) continue;
    const t = (a * Math.PI) / 180, d: [number, number] = [Math.cos(t), Math.sin(t)], start = 0.6 * mc.pxPerMm;
    for (const q of runs(mg, [o[0] + d[0] * start, o[1] + d[1] * start], d, Math.round(0.9 * mc.pxPerMm))) {
      const rr = 0.6 + q.at / mc.pxPerMm;
      rings[rr > 1.115 ? 0 : rr > 0.935 ? 1 : 2].push([rearMic.fromSide.mm + d[0] * rr, rearMic.fromTop.mm + d[1] * rr]);
    }
  }
  const [outer, dashed, inner] = rings.map(fitCircle);
  const n = rings.map((p) => p.length);
  add(`rear mic centre across (dimensioned 11.29: the ordinate below Detail A; the outer circle, ${n[0]} crossings)`, rearMic.fromSide.mm, outer.centre[0], 0.05);
  add('rear mic centre down (dimensioned 26.56)', rearMic.fromTop.mm, outer.centre[1], 0.05);
  add(`rear mic Ø (dimensioned 2.10): the dashed middle circle (${n[1]} crossings; the inner is drawn Ø${(2 * inner.radius).toFixed(2)})`, rearMic.diameter.mm, 2 * dashed.radius, 0.05);
  add('rear mic\'s three circles concentric (the dashed and inner circles\' centres from the outer\'s, mm)', 0, Math.max(Math.hypot(dashed.centre[0] - outer.centre[0], dashed.centre[1] - outer.centre[1]), Math.hypot(inner.centre[0] - outer.centre[0], inner.centre[1] - outer.centre[1])), 0.02);
  add(`rear mic: the outer circle (drawn Ø${(2 * outer.radius).toFixed(2)}), where the Ø2.10 leader's arrow lands`, rearMic.diameter.mm, 2 * outer.radius, 0.05,
    'drawn as the 14\'s (and the 13\'s 2.40 ring, whose leader lands there too): the printed 2.10 matches the dashed middle circle, and is taken as printed, as on the 14');
  // Read with the numbers swapped (26.56 across, 11.29 down) the place lands just outside the flash, on the bump's top
  // between the flash and the camera rings: no Ø2.10 circle is drawn there.
  let swapped = 'none';
  try {
    const w = cleanCircleAt(g, toPx(r, [rearMic.fromTop.mm, rearMic.fromSide.mm]), (rearMic.diameter.mm / 2) * r.pxPerMm, [25, -25, 40, -40]);
    swapped = `Ø${(w.diameter / r.pxPerMm).toFixed(2)}`;
  } catch {}
  add(`negative control: at (26.56, 11.29), the numbers swapped, the circle found: ${swapped} (1 = none, or over 0.5 mm off Ø2.10)`, 1, swapped === 'none' || Math.abs(Number(swapped.slice(1)) - rearMic.diameter.mm) > 0.5 ? 1 : 0, 0);
  // The bump's top's bottom-left corner: centre (3.88 + 8.90, 33.97 - 8.90); the mic's centre is 2.11 from it, well
  // inside R8.90, so the builder puts it flush on the bump's top.
  const corner: [number, number] = [bump.topFrom.mm + bump.topRadius.mm, bump.topFrom.mm + bump.topSize.mm - bump.topRadius.mm];
  add('rear mic inside the bump top\'s R8.90 corner (how far its edge would stand outside it: 0)', 0, Math.max(0, Math.hypot(rearMic.fromSide.mm - corner[0], rearMic.fromTop.mm - corner[1]) - (bump.topRadius.mm - rearMic.diameter.mm / 2)), 0);
  return out;
}

/**
 * Sheet 2's Section N-N (down the phone through the flash), in the section's own frame: the scale from its front face
 * (the left edge) to the 11.11 extension line; the faces on the right (the back glass beyond the bump, the bump's glass,
 * the strobe under it, camera 2's ring below), which put the section's body at 7.30 (drawing.ts: sectionBackGlass); the
 * cone's four lines (the first ink right of a start column, row by row, each fitted), their crossings (the apex, the
 * kinks) and angles; the inner cone's width at the strobe's face and at the bump's glass (the flash's Ø6.28). Each
 * distance from the real front is the section's plus 7.80 - 7.30.
 */
export function sectionReadings(pdf = PDF): Measured[] {
  const r = sectionNN, k = flashKeepout, g = render(pdf, r);
  const { out, add } = collector();
  const across = (y: number, expect: number) => lineNear(g, [0, y], [1, 0], g.width - 1, expect);
  // Row 700, above the section's top end, crosses the 11.11 extension lines (and the outer cone's lines beyond them).
  const face = across(700, r.origin[0]);
  const printed = flashKeepoutPrinted;
  const px = (across(700, face + printed.transition.mm * r.pxPerMm) - face) / printed.transition.mm;
  const mm = (x: number) => (x - face) / px;
  add('Section N-N px/mm (calibration: the front face to the 11.11 line)', r.pxPerMm, px, 0.05);
  add('Section N-N front face (px)', r.origin[0], face, 1);
  add('N-N the front face on the section (row 1900), against the extension line\'s (mm)', 0, mm(across(1900, face)), 0.03);
  // The faces: the back glass beyond the bump's fillets (rows 895 and 905 above, 2470 and 2480 below), the bump's glass
  // below the flash and below camera 2's ring (rows 1560, 1600, 2340), the strobe (rows 1200, 1300, 1420: the base of
  // the hatched cone), camera 2's ring (rows 1800, 2000, 2200).
  const T = sectionBackGlass.mm, top = T + bump.top.mm, rings = T + bump.rings.mm, offset = body.thickness.mm - T;
  const back = mean([895, 905, 2470, 2480].map((y) => mm(across(y, face + T * px))));
  const glass = mean([1560, 1600, 2340].map((y) => mm(across(y, face + top * px))));
  const strobe = mean([1200, 1300, 1420].map((y) => mm(across(y, face + printed.base.mm * px))));
  const ring = mean([1800, 2000, 2200].map((y) => mm(across(y, face + rings * px))));
  add('N-N the back glass beyond the bump (scaled 7.30; sheet 1\'s thickness is 7.80)', T, back, 0.05, undefined, 'scaled');
  add(`N-N the bump's glass, 7.30 + 1.85 (drawn ${glass.toFixed(3)})`, top, glass, 0.05);
  add(`N-N camera 2's ring below the flash, 7.30 + 3.42 (drawn ${ring.toFixed(3)})`, rings, ring, 0.05);
  add('N-N the strobe\'s face, where 9.05\'s arrow lands (dimensioned 9.05)', printed.base.mm, strobe, 0.05);
  add('N-N the strobe 0.10 under the bump\'s glass (9.15 - 9.05, as the 14\'s 9.65 - 9.55)', top - printed.base.mm, glass - strobe, 0.03);
  // The cone's lines, as the 14's: the first ink right of a start column on each row, the run's outer edge moved in by
  // half the line's own pen. The inner lines start right of the bump's glass; the outer lines right of the 11.11
  // extension line.
  const hit = (y: number, x0: number) => {
    const rs = runs(g, [x0, y], [1, 0], g.width - 1 - x0);
    return rs.length ? { edge: x0 + rs[0].at - (rs[0].width - 1) / 2, width: rs[0].width } : { edge: NaN, width: NaN };
  };
  const inside = Math.round(face + (top + 0.15) * px), outside = Math.round(face + (printed.transition.mm + 0.15) * px);
  const line = (a: number, b: number, x0: number) => {
    const hs = rowsBy(a, b).map((y) => ({ y, ...hit(y, x0) }));
    const ws = hs.map((h) => h.width).filter(Number.isFinite).sort((p, q) => p - q), pen = ws[Math.floor(ws.length / 2)];
    return fitLine(hs.map((h): [number, number] => [h.edge + (pen - 1) / 2, h.y]));
  };
  const upperOuter = line(650, 1000, outside), upperInner = line(1055, 1150, inside), lowerInner = line(1505, 1595, inside);
  const lowerOuter = line(1640, 2000, outside);
  const offAxis = (l: Line) => 90 - deg(Math.atan(Math.abs(l.b)));
  const apex = meet(upperInner, lowerInner), kinks = [meet(upperInner, upperOuter), meet(lowerInner, lowerOuter)];
  kinks.forEach((q, i) => add(`N-N ${i ? 'lower' : 'upper'} kink, inner cone to outer, from the section's front face (11.11)`, printed.transition.mm, mm(q[0]), 0.05));
  add(`N-N inner cone, full angle as drawn (degrees; its lines fitted to ${upperInner.n} and ${lowerInner.n} rows, ~2 mm long)`, k.inner.mm, offAxis(upperInner) + offAxis(lowerInner), 1);
  add(`N-N outer cone, full angle as drawn (degrees; fitted to ${upperOuter.n} and ${lowerOuter.n} rows)`, k.outer!.mm, offAxis(upperOuter) + offAxis(lowerOuter), 1);
  add('N-N the apex midway between the kinks, down (mm: on the cone\'s axis)', 0, (apex[1] - (kinks[0][1] + kinks[1][1]) / 2) / px, 0.1);
  add(`N-N inner cone's apex from the real front (derived 7.53; the drawn lines cross ${mm(apex[0]).toFixed(2)} from the section's face, + 0.50)`, k.apexFromFront!.mm, mm(apex[0]) + offset, 0.1);
  add('N-N the transition from the real front (derived 11.61: the kinks, + 0.50)', k.transitionFromFront!.mm, mean(kinks.map((q) => mm(q[0]))) + offset, 0.05);
  const width = (atMm: number) => {
    const x = face + atMm * px;
    return ((x - lowerInner.a) / lowerInner.b - (x - upperInner.a) / upperInner.b) / px;
  };
  add('N-N inner cone at the strobe\'s face (derived Ø5.99)', k.innerBaseDiameter!.mm, width(strobe), 0.05);
  // At the bump's glass as drawn (9.146): the cone through the flash's edge there is what the apex is derived from.
  add('N-N inner cone at the bump\'s glass, as drawn (the flash\'s Ø6.28 there)', flash.diameter.mm, width(glass), 0.05);
  // Hand calculation from the printed numbers alone: the 112.01° cone from Ø6.28 at the bump's glass out 1.96 to the
  // transition (11.11 - 9.15 on the section), against the drawn kinks' spacing.
  const spacing = Math.abs(kinks[1][1] - kinks[0][1]) / px;
  const transition = flash.diameter.mm + 2 * (printed.transition.mm - top) * tanHalf(k.inner.mm);
  add(`N-N transition, Ø6.28 + 2 (11.11 - 9.15) tan 56.005° = ${transition.toFixed(2)}, against the drawn kinks' spacing`, transition, spacing, 0.1);
  // The negative controls: if the section's front face were the real phone's (7.80 to the back glass), the back glass
  // would be drawn at 7.80; and read as the apex, 9.05 would leave the drawn lines' crossing over 1.5 mm away.
  add(`negative control: a 7.80 body's back glass would be drawn at 7.80 (1 = the drawn one, ${back.toFixed(2)}, is over 0.4 nearer the face)`, 1, body.thickness.mm - back > 0.4 ? 1 : 0, 0);
  add('negative control: 9.05 read as the inner cone\'s apex (1 = the drawn lines cross over 1.5 mm nearer the front)', 1, printed.base.mm - mm(apex[0]) > 1.5 ? 1 : 0, 0);
  return out;
}

/**
 * Sections L-L and M-M (the cameras), for their faces only: the scale from each section's front face to its cone's
 * apex line (8.51, 8.76: on a row above the section's top end), then the bump's top and camera 1's or 2's ring. They
 * draw the same 7.30 body as N-N. (The cameras' recorded apexes are read from the real front, as printed: drawing.ts.)
 */
export function sectionBodies(pdf = PDF): Measured[] {
  const { out, add } = collector();
  const T = sectionBackGlass.mm, top = T + bump.top.mm, rings = T + bump.rings.mm;
  const views: [string, typeof sectionLL, number, number[], number[]][] = [
    ['L-L', sectionLL, cameras.ultraWide.coneApexFromFront.mm, [1360, 1400], [1600, 1800, 2000]],
    ['M-M', sectionMM, cameras.main.coneApexFromFront.mm, [1180, 1900], [1300, 1400, 1600]],
  ];
  for (const [name, r, apexMm, topRows, ringRows] of views) {
    const g = render(pdf, r);
    const across = (y: number, expect: number) => lineNear(g, [0, y], [1, 0], g.width - 1, expect);
    const face = across(1000, r.origin[0]);
    const px = (across(1000, face + apexMm * r.pxPerMm) - face) / apexMm;
    const mm = (x: number) => (x - face) / px;
    add(`Section ${name} px/mm (calibration: the front face to the ${apexMm.toFixed(2)} apex line)`, r.pxPerMm, px, 0.08);
    const t = mean(topRows.map((y) => mm(across(y, face + top * px))));
    add(`${name} the bump's top, 7.30 + 1.85 (drawn ${t.toFixed(3)})`, top, t, 0.05);
    add(`${name} the camera's ring, 7.30 + 3.42`, rings, mean(ringRows.map((y) => mm(across(y, face + rings * px)))), 0.05);
    add(`negative control: ${name} on a 7.80 body, the bump's top would be drawn at 9.65 (1 = over 0.4 nearer the face)`, 1, body.thickness.mm + bump.top.mm - t > 0.4 ? 1 : 0, 0);
  }
  return out;
}

/**
 * Sheet 2's MagSafe view, calibrated on its extension lines: across, the 0.00 and 66.36 lines on a row 4.34 above the
 * phone; down, the 0.00 and -115.52 lines on a column 8.6 left of it. The other dimensioned lines check it. Then the
 * clear area's circle (crossings on rays from the product centre, fitted), the magnetic zone's top (scaled: not
 * dimensioned) and its arc.
 */
export function magsafeReadings(pdf = PDF): Measured[] {
  const r = magsafeView, g = render(pdf, r);
  const { out, add } = collector();
  const rowAbove = Math.round(toPx(r, [0, -4.34])[1]), rowBelow = Math.round(toPx(r, [0, 163.84])[1]);
  const colLeft = Math.round(toPx(r, [-8.6, 0])[0]), colRight = Math.round(toPx(r, [81.07, 0])[0]);
  const xAt = (row: number, m: number, c: Calibration = r) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(c, [m, 0])[0]);
  const yAt = (col: number, m: number, c: Calibration = r) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(c, [0, m])[1]);
  const { compass, cameraZone } = magsafeExtras;
  const [x0, x1] = [0, compass.fromSide.mm].map((m) => xAt(rowAbove, m));
  const [y0, y1] = [0, magsafe.zoneSidesTo!.mm].map((m) => yAt(colLeft, m));
  const sx = (x1 - x0) / compass.fromSide.mm, sy = (y1 - y0) / magsafe.zoneSidesTo!.mm;
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [x0, y0] };
  const X = (px: number) => (px - cal.origin[0]) / cal.pxPerMm, Y = (px: number) => (px - cal.origin[1]) / cal.pxPerMm;
  add('MagSafe view px/mm across (calibration: the 0.00 and 66.36 lines)', r.pxPerMm, sx, 0.05);
  add('MagSafe view px/mm down (calibration: the 0.00 and -115.52 lines)', r.pxPerMm, sy, 0.05);
  add('MagSafe view datum across (px)', r.origin[0], x0, 1);
  add('MagSafe view datum down (px)', r.origin[1], y0, 1);
  add('MagSafe view 36.57 line across, above (dimensioned)', cameraZone.across.mm, X(xAt(rowAbove, cameraZone.across.mm, cal)), 0.03);
  add('MagSafe view 39.04 line across, below (dimensioned)', magsafe.fromSide.mm, X(xAt(rowBelow, magsafe.fromSide.mm, cal)), 0.03);
  // The -80.42 PRODUCT CENTER and -9.88 COMPASS lines run out to the right.
  add('MagSafe view -80.42 line down, right (dimensioned)', magsafe.fromTop.mm, Y(yAt(colRight, magsafe.fromTop.mm, cal)), 0.03);
  add('MagSafe view -9.88 line down, right (dimensioned)', compass.fromTop.mm, Y(yAt(colRight, compass.fromTop.mm, cal)), 0.03);
  const row85 = Math.round(toPx(cal, [0, 85])[1]);
  add('the phone\'s width on the MagSafe view, 85 down (78.07)', body.width.mm, X(xAt(row85, body.width.mm, cal)) - X(xAt(row85, 0, cal)), 0.05);

  // The clear area's circle: crossings within 0.25 of R28.75 on rays every 5° from the product centre, clear of the
  // centre lines (within 6° of each axis) and of the two leaders that cross it (Ø57.50's at about 162°, the clear area's
  // note's at about 28°: down is positive), keeping rays with one crossing only (a hatch line meeting the circle gives
  // two).
  const c: [number, number] = [magsafe.fromSide.mm, magsafe.fromTop.mm], R = magsafe.diameter.mm / 2;
  const P: [number, number][] = [];
  for (let a = 0; a < 360; a += 5) {
    if ([0, 90, 180, 270, 360].some((b) => Math.abs(a - b) < 6) || [28, 162].some((b) => Math.abs(a - b) < 9)) continue;
    const t = (a * Math.PI) / 180, d: [number, number] = [Math.cos(t), Math.sin(t)];
    const o = toPx(cal, c), start = (R - 1.5) * cal.pxPerMm;
    const rs = runs(g, [o[0] + d[0] * start, o[1] + d[1] * start], d, Math.round(3 * cal.pxPerMm)).map((q) => R - 1.5 + q.at / cal.pxPerMm).filter((x) => Math.abs(x - R) < 0.25);
    if (rs.length === 1) P.push([c[0] + d[0] * rs[0], c[1] + d[1] * rs[0]]);
  }
  const f = fitCircle(P);
  add(`clear area's circle: centre across (fitted to ${P.length} crossings; worst ${f.worst.toFixed(3)} off)`, magsafe.fromSide.mm, f.centre[0], 0.05);
  add('clear area\'s circle: centre down (round the product centre)', magsafe.fromTop.mm, f.centre[1], 0.05);
  add('clear area\'s circle: Ø (dimensioned 57.50)', magsafe.diameter.mm, 2 * f.radius, 0.05);

  // The zone: its top on columns 16 and 25 (inside the camera corner), 45 and 60 across, not dimensioned (at 50 and 70 a
  // hatch line meets it: one run 13 to 20 px wide against its 9); its arc's lowest point down columns 3 either side of
  // the centre line (at 0.75 right of it a hatch line meets the arc); its crossings of x = 8, 15, 63.07 and 70.07 (clear of the
  // R52.49 leader, which lands on the arc about 3.6 across), against the circle through (0, 115.52) and
  // (78.07, 115.52) of R52.49, its centre derived.
  const zr = magsafe.zoneRadius!.mm, half = body.width.mm / 2;
  const zc = magsafe.zoneSidesTo!.mm - Math.sqrt(zr * zr - half * half);
  add(`hand calculation: the zone's arc's centre, 115.52 - √(52.49² - 39.035²) = ${zc.toFixed(3)} down: the product centre`, magsafe.fromTop.mm, zc, 0.01);
  for (const x of [16, 25, 45, 60]) add(`magnetic zone's top at ${x} across (scaled 40.21)`, magsafe.zoneFrom!.mm, Y(yAt(Math.round(toPx(cal, [x, 0])[0]), magsafe.zoneFrom!.mm, cal)), 0.03, undefined, 'scaled');
  const low = mean([half - 3, half + 3].map((x) => Y(yAt(Math.round(toPx(cal, [x, 0])[0]), zc + zr, cal)) + (zr - Math.sqrt(zr * zr - 3 * 3))));
  add(`magnetic zone's arc, its lowest point (centre ${zc.toFixed(2)} down, derived, + R52.49)`, zc + zr, low, 0.05);
  for (const x of [8, 15, 63.07, 70.07]) {
    const at = zc + Math.sqrt(zr * zr - (x - half) ** 2);
    add(`magnetic zone's arc at x = ${x} (${at.toFixed(2)})`, at, Y(yAt(Math.round(toPx(cal, [x, 0])[0]), at, cal)), 0.05);
  }
  // The negative control: the 14's zone, whose arc's centre is 3.10 below the product centre, would bottom out 3.10 lower.
  add(`negative control: centred 3.10 below the product centre (as the 14's), R52.49's lowest point would be ${(magsafe.fromTop.mm + 3.1 + zr).toFixed(2)} (1 = the drawn one is over 2 mm higher)`, 1, magsafe.fromTop.mm + 3.1 + zr - low > 2 ? 1 : 0, 0);
  return out;
}

export const remeasure = (pdf = PDF): Measured[] => [
  ...family(phone, { back: detailA, front: frontView, bottom: bottomView }, pdf, {
    // As on the 14, the bump outline's top-left corner runs into the back glass's heavy edge (one 0.48 mm run with it), so
    // its diagonal crosses the two as one: it's left out (it reads 11.51, as the others, but from a merged run).
    bumpCorners: ['top-right', 'bottom-right', 'bottom-left'],
    // The active area's hatch runs at 45° up to the right, so the bottom-left corner's diagonal runs along a hatch line
    // that starts on the arc (it reads 3.04): that corner is left out. The top-right's runs between two hatch lines.
    activeCorners: ['top-left', 'top-right', 'bottom-right'],
    // Toward the front on the flat band, between the view's inner lines (2.7 from the middle) and the port.
    bottomRow: 2.0,
    known: {
      'px/mm down (calibration)': 'the camera centres, 12.75 apart down, read 46.18 px/mm against 46.08 across: camera 2 is drawn 1 px (0.02 mm) low of camera 1. The bump top\'s lines (3.88 to 33.97) give 46.095 both ways, so the circles, not the sheet, are off',
    },
  }),
  ...receiver(pdf),
  ...detailDReadings(pdf),
  ...micReadings(pdf),
  ...sectionReadings(pdf),
  ...sectionBodies(pdf),
  ...magsafeReadings(pdf),
];

export const hasPdf = () => existsSync(PDF);

if (import.meta.main) console.log(report(remeasure()));
