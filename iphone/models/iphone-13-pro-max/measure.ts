// Re-measures every scaled value in drawing.ts from the PDF (the family's procedures, iphone/measure.ts); and checks the
// rear mic (Detail D, Detail J), the flash's keepout sections (G-G, K-K) and MagSafe's keepouts against what the
// drawing draws.
//
//   node iphone-13-pro-max/measure.ts   → a table: recorded, measured, the difference
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { remeasure as family, report, type Measured } from '../../measure.ts';
import { cleanCircleAt, lineNear, render, runs, toPx, type Calibration, type Gray } from '../../../src/raster.ts';
import { body, bottomView, bump, detailD, detailJ, flash, flashKeepout, flashKeepoutAcross, frontView, magsafe, magsafeExtras, magsafeView, phone, rearMic, sectionGG, sectionKK, sensor } from './drawing.ts';

export const PDF = join(import.meta.dirname, '..', '..', 'drawings', 'iphone-13-pro-max.pdf');

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
 * The rear mic (the family's re-measurement doesn't read it). Detail D dimensions it: the -32.21 extension line's row
 * (on columns right of the mic, before the 39.28 line) and the 35.76 line's column (on rows below it, above the bump
 * top's bottom edge), each on Detail D's calibration (which the family's checks confirm), against the dimensions; then
 * the outer circle's centre against them, chords above its centre and either side (the leader's arrowhead merges with
 * it below on the right). Sheet 2's Detail J draws it again, on its own calibration (the 0.00 and 30.08 lines across,
 * the 0.00 line down; the 7.06 dimension's lines check it).
 */
export function micReadings(pdf = PDF): Measured[] {
  const { out, add } = collector();
  const R = rearMic.diameter.mm / 2;
  {
    const r = detailD, g = render(pdf, r);
    const X = (px: number) => (px - r.origin[0]) / r.pxPerMm, Y = (px: number) => (px - r.origin[1]) / r.pxPerMm;
    const [mx, my] = toPx(r, [rearMic.fromSide.mm, rearMic.fromTop.mm]);
    const row = mean([37.0, 37.8].map((x) => Y(lineNear(g, [Math.round(toPx(r, [x, 0])[0]), 0], [0, 1], g.height - 1, my))));
    const col = mean([34.0, 37.0].map((y) => X(lineNear(g, [0, Math.round(toPx(r, [0, y])[1])], [1, 0], g.width - 1, mx))));
    add('Detail D -32.21 line down (dimensioned: the mic\'s centre)', rearMic.fromTop.mm, row, 0.03);
    add('Detail D 35.76 line across (dimensioned: the mic\'s centre)', rearMic.fromSide.mm, col, 0.03);
    const c = cleanCircleAt(g, [mx, my], R * r.pxPerMm, [-8, -12, -16, 8]);
    const stroke = c.stroke / r.pxPerMm;
    add('rear mic\'s circle, its centre across, against the 35.76 line', col, X(c.centre[0]), 0.03);
    add('rear mic\'s circle, its centre down, against the -32.21 line', row, Y(c.centre[1]), 0.03);
    add(`rear mic Ø, Detail D (dimensioned 1.15, the outer circle); drawn ${stroke.toFixed(2)} wide`, rearMic.diameter.mm, c.diameter / r.pxPerMm, Math.max(0.05, stroke));
    // The negative control: the same finder at the mic's place mirrored across the bump top's middle (22.39 down), an
    // empty stretch of the top between the flash and camera 3, finds no Ø1.15 circle.
    let empty = 'none';
    try {
      const w = cleanCircleAt(g, toPx(r, [rearMic.fromSide.mm, 2 * 22.39 - rearMic.fromTop.mm]), R * r.pxPerMm, [-8, -12, -16, 8]);
      empty = `Ø${(w.diameter / r.pxPerMm).toFixed(2)}`;
    } catch {}
    add(`negative control: at (35.76, 12.57), nothing drawn, the circle found: ${empty} (1 = none, or over 0.5 mm off Ø1.15)`, 1, empty === 'none' || Math.abs(Number(empty.slice(1)) - rearMic.diameter.mm) > 0.5 ? 1 : 0, 0);
  }
  {
    const r = detailJ, g = render(pdf, r);
    // Row 500, above the phone, crosses only the 0.00 and 30.08 lines; column 700 the 0.00 line, then the K-K cut's.
    const [x0, x1] = [0, sensor.fromSide.mm].map((m) => lineNear(g, [0, 500], [1, 0], g.width - 1, toPx(r, [m, 0])[0]));
    const px = (x1 - x0) / sensor.fromSide.mm;
    const y0 = lineNear(g, [700, 0], [0, 1], g.height - 1, r.origin[1]);
    const cal: Calibration = { pxPerMm: px, origin: [x0, y0] };
    add('Detail J px/mm (calibration: the 0.00 and 30.08 lines)', r.pxPerMm, px, 0.05);
    add('Detail J datum across (px)', r.origin[0], x0, 1);
    add('Detail J datum down: the 0.00 line (px)', r.origin[1], y0, 1);
    // The 7.06 dimension's lines (the LiDAR window's ends, -35.35 ± 3.53) on column 3200, right of the bump.
    for (const s of [-1, 1]) {
      const m = sensor.fromTop.mm + (s * sensor.window!.length.mm) / 2;
      add(`Detail J ${s < 0 ? 'upper' : 'lower'} 7.06 line down (-35.35 ${s < 0 ? '+' : '-'} 3.53)`, m, (lineNear(g, [3200, 0], [0, 1], g.height - 1, toPx(cal, [0, m])[1]) - y0) / px, 0.03);
    }
    const c = cleanCircleAt(g, toPx(cal, [rearMic.fromSide.mm, rearMic.fromTop.mm]), R * px, [-8, 8]);
    add('rear mic centre across, Detail J (against Detail D\'s 35.76)', rearMic.fromSide.mm, (c.centre[0] - x0) / px, 0.05);
    add('rear mic centre down, Detail J (against Detail D\'s 32.21)', rearMic.fromTop.mm, (c.centre[1] - y0) / px, 0.05);
    add('rear mic Ø, Detail J (dimensioned 1.15)', rearMic.diameter.mm, c.diameter / px, 0.05);
  }
  // The bump top's bottom-right corner: centre (39.28 - 9.39, 40.51 - 9.39); the mic's centre is 5.97 from it, well
  // inside R9.39, so the builder puts it flush on the bump's top.
  const corner: [number, number] = [bump.topFrom.mm + bump.topSize.mm - bump.topRadius.mm, bump.topFrom.mm + bump.topHeight.mm - bump.topRadius.mm];
  add('rear mic inside the bump top\'s R9.39 corner (how far its edge pokes past the corner\'s arc: 0)', 0, Math.max(0, Math.hypot(rearMic.fromSide.mm - corner[0], rearMic.fromTop.mm - corner[1]) - (bump.topRadius.mm - R)), 0);
  return out;
}

/**
 * Sheet 2's Section G-G (down the phone through the flash, the screen on the left): the scale from the cover glass's face
 * to the 11.27 extension line; the faces on the right (the back glass below the bump, the bump's glass above the flash
 * and below camera 3, the strobe under it, camera 3's ring); the cone's four lines (the first ink right of a start
 * column, row by row, each fitted), their crossings (the apex, the kinks) and angles; the 112° dimension's extension
 * lines, which continue the inner lines past the kinks; the inner cone's width at the strobe's face (K-K's Ø6.00) and at
 * the glass's (the flash's Ø6.28).
 */
function sectionGGReadings(g: Gray, add: Add) {
  const r = sectionGG, k = flashKeepout;
  const across = (y: number, expect: number) => lineNear(g, [0, y], [1, 0], g.width - 1, expect);
  // Row 3200, above the 11.27 dimension line, crosses the face, the hatching and then the 11.27 extension line.
  const face = across(3200, r.origin[0]);
  const px = (across(3200, face + k.transitionFromFront!.mm * r.pxPerMm) - face) / k.transitionFromFront!.mm;
  const mm = (x: number) => (x - face) / px;
  add('Section G-G px/mm (calibration: the cover glass face to the 11.27 line)', r.pxPerMm, px, 0.05);
  add('Section G-G cover glass face (px)', r.origin[0], face, 1);
  // The faces: the back glass below the bump (rows 3500, 3520, below the fillet at the bump's foot), the bump's glass
  // above the flash and below camera 3 (rows 1300, 3000), the strobe (rows 1500 to 1700), camera 3's ring (rows 2300,
  // 2500: drawn so close to the 11.27 extension line beside it that the two merge into one run; the ring is its left
  // half, 3 px in from its start).
  const T = body.thickness.mm, top = T + bump.top.mm, rings = T + bump.rings.mm;
  const back = mean([3500, 3520].map((y) => mm(across(y, face + T * px))));
  const glass = mean([1300, 3000].map((y) => mm(across(y, face + (top - 0.08) * px))));
  const strobe = mean([1500, 1600, 1700].map((y) => mm(across(y, face + (top - 0.18) * px))));
  const ring = mean([2300, 2500].map((y) => {
    const rs = runs(g, [0, y], [1, 0], g.width - 1).reduce((a, b) => (Math.abs(b.at - (face + rings * px)) < Math.abs(a.at - (face + rings * px)) ? b : a));
    return mm(rs.at - rs.width / 2 + 3);
  }));
  add('G-G the back glass below the bump (7.65)', T, back, 0.05);
  add(`G-G the bump's glass beside the flash, 7.65 + 1.68 (drawn ${glass.toFixed(3)})`, top, glass, 0.1);
  add(`G-G camera 3's ring below the flash, 7.65 + 3.60 (drawn ${ring.toFixed(3)})`, rings, ring, 0.1);
  add(`G-G the strobe's face under the bump's glass (drawn ${strobe.toFixed(3)})`, flashKeepoutAcross.strobeRecess.mm, glass - strobe, 0.02);
  // The cone's lines, the first ink right of a start column on each row (outside the keepout is white, inside hatched):
  // the outer lines right of the 11.27 line (and of camera 3's ring, merged with it), the inner ones right of the bump's
  // glass; the lower inner line's rows stop above the strobe's stepped lower corner, which it crosses.
  const first = (y: number, x0: number) => {
    const rs = runs(g, [x0, y], [1, 0], g.width - 1 - x0);
    return rs.length ? x0 + rs[0].at : NaN;
  };
  const from = Math.round(face + (top + 0.15) * px), beyond = Math.round(face + (k.transitionFromFront!.mm + 0.1) * px);
  const line = (a: number, b: number, x0 = from) => fitLine(rowsBy(a, b).map((y) => [first(y, x0), y]));
  const upperOuter = line(450, 1150, beyond), upperInner = line(1225, 1345), lowerInner = line(1790, 1845);
  const lowerOuter = line(1970, 2650, beyond);
  const offAxis = (l: Line) => 90 - deg(Math.atan(Math.abs(l.b)));
  const kinks = [meet(upperInner, upperOuter), meet(lowerInner, lowerOuter)];
  kinks.forEach((q, i) => add(`G-G ${i ? 'lower' : 'upper'} kink, the drawn inner line meets the outer, from the cover glass (11.27)`, k.transitionFromFront!.mm, mm(q[0]), 0.05));
  add(`G-G outer cone, full angle as drawn (degrees; fitted to ${upperOuter.n} and ${lowerOuter.n} rows)`, k.outer!.mm, offAxis(upperOuter) + offAxis(lowerOuter), 1);
  // The 112° dimension's extension lines carry the inner lines on past the kinks (rows clear of the arrowheads, right
  // of the 14.15 line where the hatching stops). They're long, so they give the inner cone's angle and apex; the drawn
  // inner lines are short (about 2 mm between the strobe and the kinks) and are checked to lie on them.
  const ext = (a: number, b: number) => fitLine(rowsBy(a, b).map((y) => [first(y, Math.round(face + 14.3 * px)), y]));
  const upperExt = ext(760, 940), lowerExt = ext(2200, 2360);
  add(`G-G the 112° dimension's extension lines, their full angle (degrees; fitted to ${upperExt.n} and ${lowerExt.n} rows)`, k.inner.mm, offAxis(upperExt) + offAxis(lowerExt), 0.5);
  for (const [name, drawn, e, a, b] of [['upper', upperInner, upperExt, 1225, 1345], ['lower', lowerInner, lowerExt, 1790, 1845]] as const) {
    const off = Math.max(...[a, b].map((y) => Math.abs(drawn.a + drawn.b * y - (e.a + e.b * y)))) / px;
    add(`G-G the drawn ${name} inner line on its extension line (mm off, the worst of its ends; fitted to ${drawn.n} rows)`, 0, off, 0.05);
  }
  const extKinks = [meet(upperExt, upperOuter), meet(lowerExt, lowerOuter)];
  extKinks.forEach((q, i) => add(`G-G ${i ? 'lower' : 'upper'} extension line meets the outer cone, from the cover glass (11.27)`, k.transitionFromFront!.mm, mm(q[0]), 0.05));
  const apex = meet(upperExt, lowerExt);
  add('G-G the apex midway between the kinks, down (mm: on the cone\'s axis)', 0, (apex[1] - (extKinks[0][1] + extKinks[1][1]) / 2) / px, 0.1);
  // The derived apex against the drawn lines' crossing: the cone is drawn from the thin glass, nearer the front.
  add('G-G inner cone\'s apex from the cover glass (derived 7.21; the extension lines crossed)', k.apexFromFront!.mm, mm(apex[0]), 0.1);
  const width = (atMm: number) => {
    const x = face + atMm * px;
    return ((x - lowerExt.a) / lowerExt.b - (x - upperExt.a) / upperExt.b) / px;
  };
  add('G-G inner cone at the strobe\'s face (K-K\'s Ø6.00; the extension lines)', k.innerBaseDiameter!.mm, width(strobe), 0.05);
  add('G-G inner cone at the bump\'s glass, drawn (the flash\'s Ø6.28; the extension lines)', flash.diameter.mm, width(glass), 0.05,
    'the cone is drawn from Ø6.00 on the strobe, drawn 0.104 under the glass; 112° puts Ø6.28 0.094 above that, 0.01 under the drawn glass: Ø6.33 there');
  // Hand calculation from the printed numbers alone: the 112° cone from Ø6.28 at 9.33 out to 11.27 (the transition),
  // against the drawn kinks' spacing; and the same from the glass as drawn.
  const spacing = Math.abs(extKinks[1][1] - extKinks[0][1]) / px;
  const transition = flash.diameter.mm + 2 * (k.transitionFromFront!.mm - top) * tanHalf(k.inner.mm);
  add(`G-G transition, Ø6.28 + 2 (11.27 - 9.33) tan 56° = ${transition.toFixed(2)}, against the drawn kinks' spacing`, transition, spacing, 0.1,
    'the section draws the cone from its glass at 9.25 (0.07 thin): 0.22 of the 0.30 (next line), as on the 13 Pro');
  const drawnTransition = flash.diameter.mm + 2 * (k.transitionFromFront!.mm - glass) * tanHalf(k.inner.mm);
  add(`G-G transition from the glass as drawn, Ø6.28 + 2 (11.27 - ${glass.toFixed(2)}) tan 56° = ${drawnTransition.toFixed(2)}, against the drawn kinks' spacing`, drawnTransition, spacing, 0.1);
  // The negative control: read from the back glass, "11.27 to cover glass" would put the kinks 7.65 further out (18.92
  // from the front), off the section's drawn ones by its whole thickness.
  add('negative control: read from the back glass the transition would be 18.92 from the front (1 = the drawn kinks are over 5 mm from it)', 1, Math.abs(mm(kinks[0][0]) - (T + k.transitionFromFront!.mm)) > 5 ? 1 : 0, 0);
  return { strobe };
}

/**
 * Sheet 2's Section K-K (across the phone through the flash, drawn lying, the back down, the side-button edge on the
 * left), as the 13 Pro's at a smaller scale: the scale from the Ø6.00 extension lines; the cover glass's face (the top
 * edge), the back glass (right of the bump), the bump's glass and the strobe's face; the inner cone's lines (row by row
 * inward from outside it) and the outer cone's (column by column, the first ink below camera 3's ring, drawn beyond the
 * cut), their crossings and angles.
 */
function sectionKKReadings(g: Gray, add: Add, ggStrobe: number) {
  const r = sectionKK, kx = flashKeepoutAcross, k = flashKeepout;
  const base = k.innerBaseDiameter!.mm;
  // Row 800, above the phone, crosses only the Ø6.00 extension lines.
  const [l, rr] = [-1, 1].map((s) => lineNear(g, [0, 800], [1, 0], g.width - 1, r.origin[0] + (s * base * r.pxPerMm) / 2));
  const px = (rr - l) / base, axis = (l + rr) / 2;
  add('Section K-K px/mm (calibration: the Ø6.00 lines)', r.pxPerMm, px, 0.05);
  add('Section K-K the flash\'s axis across, the Ø6.00 lines\' midpoint (px)', r.origin[0], axis, 1);
  const down = (x: number, expect: number) => lineNear(g, [x, 0], [0, 1], g.height - 1, expect);
  const face = down(3000, r.origin[1]);
  const mm = (y: number) => (y - face) / px;
  const T = body.thickness.mm, top = T + bump.top.mm;
  add('Section K-K cover glass face (px)', r.origin[1], face, 1);
  add('K-K the back glass, right of the bump (7.65)', T, mm(down(3000, face + T * px)), 0.05);
  // The bump's glass either side of the flash, on columns 8.5 mm out (beyond camera 3's ring, drawn under it nearer);
  // the strobe's face on columns every 0.25 mm within 2.5 of the axis, the median of those crossing it as a thin line.
  const glass = mean([-1, 1].map((s) => mm(down(Math.round(axis + s * 8.5 * px), face + (top - 0.08) * px))));
  const strobe = [...rowsBy(-10, 10, 1)].flatMap((i) => {
    const q = runs(g, [Math.round(axis + i * 0.25 * px), 0], [0, 1], g.height - 1).reduce((a, b) => (Math.abs(b.at - (face + ggStrobe * px)) < Math.abs(a.at - (face + ggStrobe * px)) ? b : a));
    return q.width <= 7 ? [mm(q.at)] : [];
  }).sort((p, q) => p - q);
  const strobeAt = strobe[Math.floor(strobe.length / 2)];
  add(`K-K the bump's glass beside the flash, 7.65 + 1.68 (drawn ${glass.toFixed(3)})`, top, glass, 0.11);
  add(`K-K the strobe's face against G-G's (one strobe in both; ${strobe.length} columns)`, ggStrobe, strobeAt, 0.03);
  add('K-K the strobe\'s face under the bump\'s glass', kx.strobeRecess.mm, glass - strobeAt, 0.02);
  // The inner lines (x = a + b·y): rows between the strobe and the kinks, each from 6.3 mm out inward (inside camera 3's
  // ring, drawn beyond the cut; its horizontal lines cross some rows: the fit drops them).
  const inward = (y: number, x0: number, dir: 1 | -1) => {
    const rs = runs(g, [x0, y], [dir, 0], Math.round(9 * px));
    return rs.length ? x0 + dir * rs[0].at : NaN;
  };
  const rows = rowsBy(Math.round(face + 9.45 * px), Math.round(face + 11.05 * px), 2);
  const left = fitLine(rows.map((y) => [inward(y, Math.round(axis - 6.3 * px), 1), y]));
  const right = fitLine(rows.map((y) => [inward(y, Math.round(axis + 6.3 * px), -1), y]));
  // The outer lines (y = a + b·x): the first ink below camera 3's ring (about 11.2 as drawn), column by column.
  const below = Math.round(face + 11.25 * px);
  const firstDown = (x: number) => {
    const rs = runs(g, [x, below], [0, 1], g.height - 1 - below);
    return rs.length ? below + rs[0].at : NaN;
  };
  const wingL = fitLine(rowsBy(Math.round(axis - 18 * px), Math.round(axis - 7 * px)).map((x) => [firstDown(x), x]));
  const wingR = fitLine(rowsBy(Math.round(axis + 7 * px), Math.round(axis + 18 * px)).map((x) => [firstDown(x), x]));
  const inner = deg(Math.atan(Math.abs(left.b))) + deg(Math.atan(Math.abs(right.b)));
  const outer = 180 - deg(Math.atan(Math.abs(wingL.b))) - deg(Math.atan(Math.abs(wingR.b)));
  add(`K-K inner cone, full angle as drawn (degrees; fitted to ${left.n} and ${right.n} rows)`, kx.inner.mm, inner, 1);
  add(`K-K outer cone, full angle as drawn (degrees; fitted to ${wingL.n} and ${wingR.n} columns)`, k.outer!.mm, outer, 1);
  const [ax, ay] = meet(left, right);
  add('K-K inner cone\'s apex on the flash\'s axis (mm across)', 0, (ax - axis) / px, 0.05);
  add('K-K inner cone\'s apex from the cover glass (derived 6.50; the drawn lines crossed)', kx.apexFromFront.mm, mm(ay), 0.1);
  const widthAt = (y: number) => ((right.a + right.b * y) - (left.a + left.b * y)) / px;
  add('K-K inner cone at the strobe\'s face (dimensioned Ø6.00)', base, widthAt(face + strobeAt * px), 0.05);
  // The kinks: an inner line x = a + b·y meets a wing y = c + d·x where y = (c + d·a) / (1 - d·b).
  const kink = (i: Line, w: Line) => (w.a + w.b * i.a) / (1 - w.b * i.b);
  for (const [name, i, w] of [['left', left, wingL], ['right', right, wingR]] as const) add(`K-K ${name} kink from the cover glass (undimensioned; G-G's 11.27)`, kx.transitionFromFront.mm, mm(kink(i, w)), 0.05);
  // Hand calculation: the transition across from the printed numbers, against the drawn kinks' spacing.
  const transition = flash.diameter.mm + 2 * (kx.transitionFromFront.mm - top) * tanHalf(kx.inner.mm);
  const kx0 = left.a + left.b * kink(left, wingL), kx1 = right.a + right.b * kink(right, wingR);
  add(`K-K transition, Ø6.28 + 2 (11.27 - 9.33) tan 48° = ${transition.toFixed(2)}, against the drawn kinks' spacing`, transition, (kx1 - kx0) / px, 0.15);
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
 * Sheet 2's MagSafe view, calibrated on its extension lines: across, the 0.00 and 72.40 lines on a row 4.5 above the
 * phone; down, the 0.00 and -113.78 lines on a column 4.1 left of it. The other dimensioned lines check it. Then the
 * clear area's circle (crossings on rays from the product centre, fitted), the magnetic zone's top and arc.
 */
export function magsafeReadings(pdf = PDF): Measured[] {
  const r = magsafeView, g = render(pdf, r);
  const { out, add } = collector();
  const rowAbove = Math.round(toPx(r, [0, -4.5])[1]), rowBelow = Math.round(toPx(r, [0, 148.4])[1]);
  const colLeft = Math.round(toPx(r, [-4.1, 0])[0]), colRight = Math.round(toPx(r, [83.5, 0])[0]);
  const xAt = (row: number, m: number, c: Calibration = r) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(c, [m, 0])[0]);
  const yAt = (col: number, m: number, c: Calibration = r) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(c, [0, m])[1]);
  const { compass, cameraZone } = magsafeExtras;
  const [x0, x1] = [0, compass.fromSide.mm].map((m) => xAt(rowAbove, m));
  const [y0, y1] = [0, magsafe.zoneSidesTo!.mm].map((m) => yAt(colLeft, m));
  const sx = (x1 - x0) / compass.fromSide.mm, sy = (y1 - y0) / magsafe.zoneSidesTo!.mm;
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [x0, y0] };
  const X = (px: number) => (px - cal.origin[0]) / cal.pxPerMm, Y = (px: number) => (px - cal.origin[1]) / cal.pxPerMm;
  add('MagSafe view px/mm across (calibration: the 0.00 and 72.40 lines)', r.pxPerMm, sx, 0.05);
  add('MagSafe view px/mm down (calibration: the 0.00 and -113.78 lines)', r.pxPerMm, sy, 0.05);
  add('MagSafe view datum across (px)', r.origin[0], x0, 1);
  add('MagSafe view datum down (px)', r.origin[1], y0, 1);
  add('MagSafe view 42.39 line across, above (dimensioned: the camera corner\'s right edge)', cameraZone.across.mm, X(xAt(rowAbove, cameraZone.across.mm, cal)), 0.03);
  add('MagSafe view 39.04 line across, below (dimensioned: the product centre)', magsafe.fromSide.mm, X(xAt(rowBelow, magsafe.fromSide.mm, cal)), 0.03);
  add('MagSafe view -47.18 line down, left (dimensioned)', magsafe.zoneFrom!.mm, Y(yAt(colLeft, magsafe.zoneFrom!.mm, cal)), 0.03);
  for (const m of [compass.fromTop, magsafe.fromTop]) add(`MagSafe view -${m.mm.toFixed(2)} line down, right (dimensioned)`, m.mm, Y(yAt(colRight, m.mm, cal)), 0.03);
  const row90 = Math.round(toPx(cal, [0, 90])[1]);
  add('the phone\'s width on the MagSafe view, 90 down (78.07)', body.width.mm, X(xAt(row90, body.width.mm, cal)) - X(xAt(row90, 0, cal)), 0.05);
  add('the product centre, half the width (78.07 / 2 against the 39.04 line)', body.width.mm / 2, magsafe.fromSide.mm, 0.01);

  // The clear area's circle: crossings within 0.25 of R28.75 on rays every 5° from the product centre, clear of the
  // centre lines (within 6° of each axis) and of the two leaders that cross it (Ø57.50's at about 157°, the clear
  // area's note's at about 35°), keeping rays with one crossing only (a hatch line meeting the circle gives two).
  const c: [number, number] = [magsafe.fromSide.mm, magsafe.fromTop.mm], R = magsafe.diameter.mm / 2;
  const P: [number, number][] = [];
  for (let a = 0; a < 360; a += 5) {
    if ([0, 90, 180, 270, 360].some((b) => Math.abs(a - b) < 6) || [35, 157].some((b) => Math.abs(a - b) < 9)) continue;
    const t = (a * Math.PI) / 180, d: [number, number] = [Math.cos(t), Math.sin(t)];
    const o = toPx(cal, c), start = (R - 1.5) * cal.pxPerMm;
    const rs = runs(g, [o[0] + d[0] * start, o[1] + d[1] * start], d, Math.round(3 * cal.pxPerMm)).map((q) => R - 1.5 + q.at / cal.pxPerMm).filter((x) => Math.abs(x - R) < 0.25);
    if (rs.length === 1) P.push([c[0] + d[0] * rs[0], c[1] + d[1] * rs[0]]);
  }
  const f = fitCircle(P);
  add(`clear area's circle: centre across (fitted to ${P.length} crossings; worst ${f.worst.toFixed(3)} off)`, magsafe.fromSide.mm, f.centre[0], 0.05);
  add('clear area\'s circle: centre down (round the product centre)', magsafe.fromTop.mm, f.centre[1], 0.05);
  add('clear area\'s circle: Ø (dimensioned 57.50)', magsafe.diameter.mm, 2 * f.radius, 0.05);

  // The zone: its top on columns 20 and 60 across (the camera corner's bottom and the open top's); its arc's lowest
  // point down columns 0.75 either side of the centre line; its crossings of x = 6, 15, 63.07 and 71 (clear of the
  // R49.39 leader, which lands on the arc about 2 across, and of a hatch line ending on it at 72), against the circle through (0, 113.78) and (78.07, 113.78)
  // of R49.39, its centre derived.
  const zr = magsafe.zoneRadius!.mm, half = body.width.mm / 2;
  const zc = magsafe.zoneSidesTo!.mm - Math.sqrt(zr * zr - half * half);
  add(`hand calculation: the zone's arc's centre, 113.78 - √(49.39² - 39.035²) = ${zc.toFixed(3)} down, 3.10 below the product centre`, magsafe.fromTop.mm + 3.1, zc, 0.01);
  for (const x of [20, 60]) add(`magnetic zone's top at ${x} across (-47.18)`, magsafe.zoneFrom!.mm, Y(yAt(Math.round(toPx(cal, [x, 0])[0]), magsafe.zoneFrom!.mm, cal)), 0.03);
  const low = mean([half - 0.75, half + 0.75].map((x) => Y(yAt(Math.round(toPx(cal, [x, 0])[0]), zc + zr, cal)) + (zr - Math.sqrt(zr * zr - 0.75 * 0.75))));
  add(`magnetic zone's arc, its lowest point (centre ${zc.toFixed(2)} down, derived, + R49.39)`, zc + zr, low, 0.05);
  for (const x of [6, 15, 63.07, 71]) {
    const at = zc + Math.sqrt(zr * zr - (x - half) ** 2);
    add(`magnetic zone's arc at x = ${x} (${at.toFixed(2)})`, at, Y(yAt(Math.round(toPx(cal, [x, 0])[0]), at, cal)), 0.05);
  }
  // The negative control: an arc round the product centre (the 12 Pro's and 13 Pro's), through the same corners, would
  // bottom out 3.10 higher than the drawn arc.
  add(`negative control: an arc round the product centre would bottom out at ${(magsafe.fromTop.mm + zr).toFixed(2)} (1 = the drawn one is over 2 mm lower)`, 1, low - (magsafe.fromTop.mm + zr) > 2 ? 1 : 0, 0);
  return out;
}

export const remeasure = (pdf = PDF): Measured[] => [
  ...family(phone, { back: detailD, front: frontView, bottom: bottomView }, pdf, {
    // As on the 13, the bump outline's top-left corner runs into the back glass's heavy edge; across the top-right the
    // flash's leader runs along the diagonal, and Detail D's dashed boundary crosses the bottom-right: only the
    // bottom-left is clean (12.53, as the 13 Pro's three for the same bump: 12.48 to 12.54). The front
    // view's row 30 above the bottom crosses the 3.47 ALL AROUND arrows, so row 100; and the active area's top is still
    // curving 16 in from the side, so its column is 22 in (the cutout starts at 24.7).
    bumpCorners: ['bottom-left'],
    frontRow: 100,
    activeColumn: 22,
  }),
  ...micReadings(pdf),
  ...sectionReadings(pdf),
  ...magsafeReadings(pdf),
];

export const hasPdf = () => existsSync(PDF);

if (import.meta.main) console.log(report(remeasure()));
