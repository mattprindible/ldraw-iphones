// Re-measures every scaled value in drawing.ts from the PDF (the family's procedures, iphone/measure.ts), and the
// receiver's slot with a scan of its own (below), since the family's can't read it on this drawing; and checks the rear
// mic, the flash's keepout section (N-N) and MagSafe's keepouts against what the drawing draws.
//
//   node iphone-14/measure.ts   → a table: recorded, measured, the difference
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { remeasure as family, report, type Measured } from '../../measure.ts';
import { cleanCircleAt, lineNear, render, runs, toPx, type Calibration } from '../../../src/raster.ts';
import { iphone } from '../../part.ts';
import { body, bottomView, bump, cornerMiddle, detailD, flash, flashKeepout, flashKeepoutBase, frontView, magsafe, magsafeExtras, magsafeView, micView, phone, rearMic, receiverView, sectionNN } from './drawing.ts';

export const PDF = join(import.meta.dirname, '..', '..', 'drawings', 'iphone-14.pdf');

/**
 * The receiver's slot, at 4800 dpi in the front view's frame. The family's scan reads the slot's end strokes on the
 * row through its middle, but here the slot's round ends touch the cutout's end walls there: each end is one 70 px run
 * (the cutout's 38 px wall and the slot's stroke together), whose middle reads the slot 11.42 long, and widening by
 * half that run reads it 1.16 high. So this measures what the family's scan means to: the white inside the slot (down
 * its middle column, then along the row through the white's middle), widened by one stroke of the slot's own pen. That
 * stroke is read radially on its round ends, from each end's centre up and outward at 30° to 75°, where it stands
 * clear of the glass edge (above) and the cutout's walls (beside): 31 to 32 px there, against the cutout's 38.
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
    [30, 45, 60, 75].map((a) => {
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
 * The corner's middle cross, (3.22, 3.40), stood in for by a point on the diagonal (drawing.ts says why): how far the
 * built outline passes from it (0 recorded; within 0.01).
 */
function cornerCross(): Measured {
  const { W, L, outline } = iphone(phone);
  const q = outline().map(([x, z]): [number, number] => [W / 2 - x, L / 2 - z]).filter(([s, t]) => s < 20 && t < 20);
  const p = [cornerMiddle.across.mm, cornerMiddle.down.mm];
  const dist = Math.min(...q.slice(0, -1).map((a, i) => {
    const b = q[i + 1], v = [b[0] - a[0], b[1] - a[1]], w = [p[0] - a[0], p[1] - a[1]];
    const t = Math.max(0, Math.min(1, (v[0] * w[0] + v[1] * w[1]) / (v[0] ** 2 + v[1] ** 2)));
    return Math.hypot(a[0] + t * v[0] - p[0], a[1] + t * v[1] - p[1]);
  }));
  return { name: 'corner outline from Detail A\'s middle cross (3.22, 3.40), which its diagonal point stands in for', kind: 'check', recorded: 0, measured: dist, within: 0.01 };
}

// Helpers for the checks below (as the 13's measure.ts).
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
 * Detail D's rear mic (the family's re-measurement doesn't read it), at 4800 dpi in Detail D's frame: three concentric
 * circles are drawn there, as on the 13 (whose are Ø2.40, 2.07 and 1.65), the middle one dashed here. Each is fitted
 * to its crossings on rays from the dimensioned centre every 2° (clear of the centre lines' ends, within 8° of each
 * axis, and of the Ø2.10 leader, which comes in from the left a little below the centre), each crossing sorted to a
 * circle by its radius: the gaps between them (0.15 and 0.21 mm) are 28 px and more wide here.
 */
export function micReadings(pdf = PDF): Measured[] {
  const r = detailD, g = render(pdf, r);
  const { out, add } = collector();
  const f = micView.dpi / r.dpi;
  // A pixel at 1200 dpi covers 4 at 4800: its centre is 1.5 in.
  const mc: Calibration = { pxPerMm: r.pxPerMm * f, origin: [(r.origin[0] + r.crop.x) * f + (f - 1) / 2 - micView.crop.x, (r.origin[1] + r.crop.y) * f + (f - 1) / 2 - micView.crop.y] };
  const mg = render(pdf, micView);
  const o = toPx(mc, [rearMic.fromSide.mm, rearMic.fromTop.mm]);
  const rings: [number, number][][] = [[], [], []];
  for (let a = 0; a < 360; a += 2) {
    if ([0, 90, 180, 270, 360].some((b) => Math.abs(a - b) < 8) || (a > 150 && a < 190)) continue;
    const t = (a * Math.PI) / 180, d: [number, number] = [Math.cos(t), Math.sin(t)], start = 0.6 * mc.pxPerMm;
    for (const q of runs(mg, [o[0] + d[0] * start, o[1] + d[1] * start], d, Math.round(0.9 * mc.pxPerMm))) {
      const rr = 0.6 + q.at / mc.pxPerMm;
      rings[rr > 1.115 ? 0 : rr > 0.935 ? 1 : 2].push([rearMic.fromSide.mm + d[0] * rr, rearMic.fromTop.mm + d[1] * rr]);
    }
  }
  const [outer, dashed, inner] = rings.map(fitCircle);
  const n = rings.map((p) => p.length);
  add(`rear mic centre across (dimensioned 10.62: the ordinate below Detail D; the outer circle, ${n[0]} crossings)`, rearMic.fromSide.mm, outer.centre[0], 0.05);
  add('rear mic centre down (dimensioned 25.89)', rearMic.fromTop.mm, outer.centre[1], 0.05);
  add(`rear mic Ø (dimensioned 2.10): the dashed middle circle (${n[1]} crossings; the inner is drawn Ø${(2 * inner.radius).toFixed(2)})`, rearMic.diameter.mm, 2 * dashed.radius, 0.05);
  add('rear mic\'s three circles concentric (the dashed and inner circles\' centres from the outer\'s, mm)', 0, Math.max(Math.hypot(dashed.centre[0] - outer.centre[0], dashed.centre[1] - outer.centre[1]), Math.hypot(inner.centre[0] - outer.centre[0], inner.centre[1] - outer.centre[1])), 0.02);
  add('rear mic: the outer circle, where the Ø2.10 leader\'s arrow lands', rearMic.diameter.mm, 2 * outer.radius, 0.05,
    'drawn as the 13\'s ring (whose leader lands there too, dimensioned 2.40; its three circles are drawn 2.40, 2.07, 1.65, these 2.39, 2.06, 1.66): the printed 2.10 matches the dashed middle circle, and is taken as printed');
  // Read with the numbers swapped (25.89 across, 10.62 down) the place lands inside the flash (0.58 from its centre, in
  // its Ø6.28): no Ø2.10 circle is drawn there.
  let swapped = 'none';
  try {
    const w = cleanCircleAt(g, toPx(r, [rearMic.fromTop.mm, rearMic.fromSide.mm]), (rearMic.diameter.mm / 2) * r.pxPerMm, [25, -25, 40, -40]);
    swapped = `Ø${(w.diameter / r.pxPerMm).toFixed(2)}`;
  } catch {}
  add(`negative control: at (25.89, 10.62), the numbers swapped, the circle found: ${swapped} (1 = none, or over 0.5 mm off Ø2.10)`, 1, swapped === 'none' || Math.abs(Number(swapped.slice(1)) - rearMic.diameter.mm) > 0.5 ? 1 : 0, 0);
  // The bump's top's bottom-left corner: centre (3.21 + 8.89, 33.30 - 8.89); the mic's centre is 2.09 from it, well
  // inside R8.89, so the builder puts it flush on the bump's top.
  const corner: [number, number] = [bump.topFrom.mm + bump.topRadius.mm, bump.topFrom.mm + bump.topSize.mm - bump.topRadius.mm];
  add('rear mic inside the bump top\'s R8.89 corner (how far its edge would stand outside it: 0)', 0, Math.max(0, Math.hypot(rearMic.fromSide.mm - corner[0], rearMic.fromTop.mm - corner[1]) - (bump.topRadius.mm - rearMic.diameter.mm / 2)), 0);
  return out;
}

/**
 * Sheet 2's Section N-N (down the phone through the flash): the scale from the cover glass's face (the left edge) to the
 * 11.61 extension line; the faces on the right (the back glass beyond the bump, the bump's glass, the strobe under it,
 * camera 2's ring below); the cone's four lines (the first ink right of a start column, row by row, each fitted), their
 * crossings (the apex, the kinks) and angles; the inner cone's width at the strobe's face and at the glass's (the
 * flash's Ø6.28).
 */
export function sectionReadings(pdf = PDF): Measured[] {
  const r = sectionNN, k = flashKeepout, g = render(pdf, r);
  const { out, add } = collector();
  const across = (y: number, expect: number) => lineNear(g, [0, y], [1, 0], g.width - 1, expect);
  // Row 900, above the phone's top end, crosses only the 11.61 extension lines (and the outer cone's line beyond them).
  const face = across(900, r.origin[0]);
  const px = (across(900, face + k.transitionFromFront!.mm * r.pxPerMm) - face) / k.transitionFromFront!.mm;
  const mm = (x: number) => (x - face) / px;
  add('Section N-N px/mm (calibration: the cover glass face to the 11.61 line)', r.pxPerMm, px, 0.05);
  add('Section N-N cover glass face (px)', r.origin[0], face, 1);
  add('N-N the cover glass face on the phone (row 2900), against the extension line\'s (mm)', 0, mm(across(2900, face)), 0.03);
  // The faces: the back glass below the bump (rows 2850, 2950), the bump's glass above and below the flash (rows 1300,
  // 1800: above 1210 is the bump's fillet), the strobe (rows 1450, 1600), camera 2's ring (rows 2050, 2350: the cut runs
  // 1.67 beside its centre).
  const T = body.thickness.mm, top = T + bump.top.mm, rings = T + bump.rings.mm;
  const back = mean([2850, 2950].map((y) => mm(across(y, face + T * px))));
  const glass = mean([1300, 1800].map((y) => mm(across(y, face + top * px))));
  const strobe = mean([1450, 1600].map((y) => mm(across(y, face + flashKeepoutBase.fromFront.mm * px))));
  const ring = mean([2050, 2350].map((y) => mm(across(y, face + rings * px))));
  add('N-N the back glass beyond the bump (7.80)', T, back, 0.05);
  add(`N-N the bump's glass beside the flash, 7.80 + 1.85 (drawn ${glass.toFixed(3)})`, top, glass, 0.05);
  add(`N-N camera 2's ring below the flash, 7.80 + 3.42 (drawn ${ring.toFixed(3)})`, rings, ring, 0.05);
  add('N-N the strobe\'s face, where 9.55\'s arrow lands (dimensioned 9.55)', flashKeepoutBase.fromFront.mm, strobe, 0.05);
  add('N-N the strobe 0.10 under the bump\'s glass (9.65 - 9.55, as the 13\'s)', top - flashKeepoutBase.fromFront.mm, glass - strobe, 0.03);
  // The cone's lines: the first ink right of a start column on each row (inside the cone is hatched, outside white).
  // The inner lines start right of the bump's glass; the outer lines right of the 11.61 extension line (which runs the
  // section's height, and camera 2's ring stands left of it below). The hatch lines meet each cone line at 45° and
  // merge with it on some rows (runs up to 15 px wide against its 7), pulling the run's middle inward: so each row
  // takes the run's outer edge (the white side), moved in by half the line's own pen (the median run width).
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
  const upperOuter = line(820, 1200, outside), upperInner = line(1270, 1370, inside), lowerInner = line(1700, 1790, inside);
  const lowerOuter = line(1860, 2250, outside);
  const offAxis = (l: Line) => 90 - deg(Math.atan(Math.abs(l.b)));
  const apex = meet(upperInner, lowerInner), kinks = [meet(upperInner, upperOuter), meet(lowerInner, lowerOuter)];
  kinks.forEach((q, i) => add(`N-N ${i ? 'lower' : 'upper'} kink, inner cone to outer, from the cover glass (11.61)`, k.transitionFromFront!.mm, mm(q[0]), 0.05));
  add(`N-N inner cone, full angle as drawn (degrees; its lines fitted to ${upperInner.n} and ${lowerInner.n} rows, ~2.5 mm long)`, k.inner.mm, offAxis(upperInner) + offAxis(lowerInner), 1);
  add(`N-N outer cone, full angle as drawn (degrees; fitted to ${upperOuter.n} and ${lowerOuter.n} rows)`, k.outer!.mm, offAxis(upperOuter) + offAxis(lowerOuter), 1);
  add('N-N the apex midway between the kinks, down (mm: on the cone\'s axis)', 0, (apex[1] - (kinks[0][1] + kinks[1][1]) / 2) / px, 0.1);
  add('N-N inner cone\'s apex from the cover glass (derived 7.53; the drawn lines crossed)', k.apexFromFront!.mm, mm(apex[0]), 0.1);
  const width = (atMm: number) => {
    const x = face + atMm * px;
    return ((x - lowerInner.a) / lowerInner.b - (x - upperInner.a) / upperInner.b) / px;
  };
  add('N-N inner cone at the strobe\'s face (derived Ø5.98)', k.innerBaseDiameter!.mm, width(strobe), 0.05);
  add('N-N inner cone at the bump\'s top, 9.65 (the flash\'s Ø6.28 there)', flash.diameter.mm, width(top), 0.05);
  // Hand calculation from the printed numbers alone: the 112.07° cone from Ø6.28 at 9.65 out to 11.61 (the
  // transition), against the drawn kinks' spacing.
  const spacing = Math.abs(kinks[1][1] - kinks[0][1]) / px;
  const transition = flash.diameter.mm + 2 * (k.transitionFromFront!.mm - top) * tanHalf(k.inner.mm);
  add(`N-N transition, Ø6.28 + 2 (11.61 - 9.65) tan 56.035° = ${transition.toFixed(2)}, against the drawn kinks' spacing`, transition, spacing, 0.1);
  // The negative controls: read from the back glass, "11.61 to cover glass" would put the kinks 7.80 further out (19.41
  // from the front), and 9.55 would be inside the bump's air, 17.35 out; and read as the apex, 9.55 would leave the
  // drawn lines' crossing over 1.5 mm away.
  add('negative control: read from the back glass the transition would be 19.41 from the front (1 = the drawn kinks are over 5 mm from it)', 1, Math.abs(mm(kinks[0][0]) - (T + k.transitionFromFront!.mm)) > 5 ? 1 : 0, 0);
  add('negative control: 9.55 read as the inner cone\'s apex (1 = the drawn lines cross over 1.5 mm nearer the front)', 1, flashKeepoutBase.fromFront.mm - mm(apex[0]) > 1.5 ? 1 : 0, 0);
  return out;
}

/**
 * Sheet 2's MagSafe view, calibrated on its extension lines: across, the 0.00 and 64.91 lines on a row 4.5 above the
 * phone; down, the 0.00 and -110.52 lines on a column 5 left of it (at 3.2 left Detail F's dashed callout circle crosses
 * the -40.12 line). The other dimensioned lines check it. Then the clear
 * area's circle (crossings on rays from the product centre, fitted), and the magnetic zone's top and arc.
 */
export function magsafeReadings(pdf = PDF): Measured[] {
  const r = magsafeView, g = render(pdf, r);
  const { out, add } = collector();
  const rowAbove = Math.round(toPx(r, [0, -4.5])[1]), rowBelow = Math.round(toPx(r, [0, 148.4])[1]);
  const colLeft = Math.round(toPx(r, [-5, 0])[0]), colRight = Math.round(toPx(r, [80.3, 0])[0]);
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
  // Here the -73.35 PRODUCT CENTER line is on the left (on the right a note's leader runs at 73.86).
  for (const m of [magsafe.zoneFrom!, magsafe.fromTop]) add(`MagSafe view -${m.mm.toFixed(2)} line down, left (dimensioned)`, m.mm, Y(yAt(colLeft, m.mm, cal)), 0.03);
  add('MagSafe view -9.65 line down, right (dimensioned)', compass.fromTop.mm, Y(yAt(colRight, compass.fromTop.mm, cal)), 0.03);
  const row85 = Math.round(toPx(cal, [0, 85])[1]);
  add('the phone\'s width on the MagSafe view, 85 down (71.52)', body.width.mm, X(xAt(row85, body.width.mm, cal)) - X(xAt(row85, 0, cal)), 0.05);

  // The clear area's circle: crossings within 0.25 of R28.75 on rays every 5° from the product centre, clear of the
  // centre lines (within 6° of each axis) and of the two leaders that cross it (Ø57.50's at about 40°, the clear area's
  // note's at about 340°: down is positive), keeping rays with one crossing only (a hatch line meeting the circle gives
  // two).
  const c: [number, number] = [magsafe.fromSide.mm, magsafe.fromTop.mm], R = magsafe.diameter.mm / 2;
  const P: [number, number][] = [];
  for (let a = 0; a < 360; a += 5) {
    if ([0, 90, 180, 270, 360].some((b) => Math.abs(a - b) < 6) || [34, 8].some((b) => Math.abs(a - b) < 9)) continue;
    const t = (a * Math.PI) / 180, d: [number, number] = [Math.cos(t), Math.sin(t)];
    const o = toPx(cal, c), start = (R - 1.5) * cal.pxPerMm;
    const rs = runs(g, [o[0] + d[0] * start, o[1] + d[1] * start], d, Math.round(3 * cal.pxPerMm)).map((q) => R - 1.5 + q.at / cal.pxPerMm).filter((x) => Math.abs(x - R) < 0.25);
    if (rs.length === 1) P.push([c[0] + d[0] * rs[0], c[1] + d[1] * rs[0]]);
  }
  const f = fitCircle(P);
  add(`clear area's circle: centre across (fitted to ${P.length} crossings; worst ${f.worst.toFixed(3)} off)`, magsafe.fromSide.mm, f.centre[0], 0.05);
  add('clear area\'s circle: centre down (round the product centre)', magsafe.fromTop.mm, f.centre[1], 0.05);
  add('clear area\'s circle: Ø (dimensioned 57.50)', magsafe.diameter.mm, 2 * f.radius, 0.05);

  // The zone: its top on columns 16 and 50 across (the camera corner's bottom, where at 15 a crosshatch line meets it,
  // and the open top's); its arc's lowest
  // point down columns 0.75 either side of the centre line; its crossings of x = 5, 15, 56.52 and 66.52 (clear of the
  // R49.39 leader, which lands on the arc about 62 across), against the circle through (0, 110.52) and (71.52, 110.52)
  // of R49.39, its centre derived.
  const zr = magsafe.zoneRadius!.mm, half = body.width.mm / 2;
  const zc = magsafe.zoneSidesTo!.mm - Math.sqrt(zr * zr - half * half);
  add(`hand calculation: the zone's arc's centre, 110.52 - √(49.39² - 35.76²) = ${zc.toFixed(3)} down, 3.10 below the product centre`, magsafe.fromTop.mm + 3.1, zc, 0.01);
  for (const x of [16, 50]) add(`magnetic zone's top at ${x} across (-40.12)`, magsafe.zoneFrom!.mm, Y(yAt(Math.round(toPx(cal, [x, 0])[0]), magsafe.zoneFrom!.mm, cal)), 0.03);
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
  cornerCross(),
  ...family(phone, { back: detailD, front: frontView, bottom: bottomView }, pdf, {
    // As on the 13, the bump outline's top-left corner runs into the back glass's heavy edge (a 0.37 mm stroke), so its
    // diagonal crosses the two as one: it's left out.
    bumpCorners: ['top-right', 'bottom-right', 'bottom-left'],
    // The active area's hatch runs at 45° up to the right, so the bottom-left corner's diagonal runs along a hatch line
    // that starts on the arc (it read 2.00): that corner is left out. The top-right's runs between two hatch lines.
    activeCorners: ['top-left', 'top-right', 'bottom-right'],
  }),
  ...receiver(pdf),
  ...micReadings(pdf),
  ...sectionReadings(pdf),
  ...magsafeReadings(pdf),
];

export const hasPdf = () => existsSync(PDF);

if (import.meta.main) console.log(report(remeasure()));
