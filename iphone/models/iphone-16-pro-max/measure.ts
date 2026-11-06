// Re-measures every scaled value in drawing.ts from the PDF (the family's procedures, iphone/measure.ts), and what this
// model adds: Detail A's unlabelled corner ends, the port's undimensioned ends and the holes' centres in the bottom view.
// Then the rear mic (Detail D, at 4800 dpi), the flash's keepout sections (sheet 3's M-M and N-N) and MagSafe's
// keepouts (sheet 4) against what the drawing draws, re-measuring the scaled one (the mic's outer ring): the 16 Pro's
// procedures, on this drawing's sheets.
//
//   node iphone-16-pro-max/measure.ts   → a table: recorded, measured, the difference
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { remeasure as family, report, type Measured } from '../../measure.ts';
import { cleanCircleAt, lineNear, render, runs, toPx, type Calibration, type Gray, type Region } from '../../../src/raster.ts';
import { body, bottom, bottomView, bump, cornerEnd, detailA, detailD, flashKeepout, flashKeepoutAcross, flashKeepoutBase, flashKeepoutEnd, frontView, magsafe, magsafeExtras, magsafeView, micView, phone, portEnds, rearMic, rearMicRing, sectionAcross, sectionDown } from './drawing.ts';

export const PDF = join(import.meta.dirname, '..', '..', 'drawings', 'iphone-16-pro-max.pdf');

const mean = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length;
const median = (a: number[]) => [...a].sort((p, q) => p - q)[Math.floor(a.length / 2)];
const deg = (rad: number) => (rad * 180) / Math.PI;
const tanHalf = (fullDeg: number) => Math.tan((fullDeg / 2) * (Math.PI / 180));
function collector() {
  const out: Measured[] = [];
  const add = (name: string, recorded: number, measured: number, within: number, kind: Measured['kind'] = 'check', known?: string) => out.push({ name, kind, recorded, measured, within, ...(known ? { known } : {}) });
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
type Line = { a: number; b: number; n: number };
/** Where two lines u = a + b·v meet, as (u, v). */
const meet = (l: Line, m: Line): [number, number] => {
  const v = (m.a - l.a) / (l.b - m.b);
  return [l.a + l.b * v, v];
};
/** A line's angle off the axis (u), degrees. */
const offAxis = (l: Line) => 90 - deg(Math.atan(Math.abs(l.b)));
/** v on a line at u. */
const vAt = (l: Line, u: number) => (u - l.a) / l.b;

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
 * Detail D's rear mic (the family's re-measurement doesn't read it), at 4800 dpi in Detail D's frame: two concentric
 * circles. Each is fitted to its crossings on rays from the dimensioned centre every 2° (clear of the lines that reach
 * it, within 8° of each axis: the 34.14 line comes in from the right, the 38.00 extension line from below; and of the
 * Ø0.75 leader's arrowhead, which comes in from the right, a little below: 0° to 34°, down positive), each crossing
 * sorted to a circle by its radius. Then where the leader's arrow lands: on the rays through its point the ink runs
 * unbroken from the inner circle outward.
 */
export function micReadings(pdf = PDF): Measured[] {
  const r = detailD, g = render(pdf, r);
  const { out, add } = collector();
  const f = micView.dpi / r.dpi;
  // A pixel at 1200 dpi covers 4 at 4800: its centre is 1.5 in.
  const mc: Calibration = { pxPerMm: r.pxPerMm * f, origin: [(r.origin[0] + r.crop.x) * f + (f - 1) / 2 - micView.crop.x, (r.origin[1] + r.crop.y) * f + (f - 1) / 2 - micView.crop.y] };
  const mg = render(pdf, micView);
  const o = toPx(mc, [rearMic.fromSide.mm, rearMic.fromTop.mm]);
  const split = (rearMic.diameter.mm / 2 + rearMicRing.mm / 2) / 2;
  const rings: [number, number][][] = [[], []];
  for (let a = 0; a < 360; a += 2) {
    if ([0, 90, 180, 270, 360].some((b) => Math.abs(a - b) < 8) || a <= 34) continue;
    const t = (a * Math.PI) / 180, d: [number, number] = [Math.cos(t), Math.sin(t)], start = 0.2 * mc.pxPerMm;
    for (const q of runs(mg, [o[0] + d[0] * start, o[1] + d[1] * start], d, Math.round(0.5 * mc.pxPerMm))) {
      const rr = 0.2 + q.at / mc.pxPerMm;
      rings[rr > split ? 0 : 1].push([rearMic.fromSide.mm + d[0] * rr, rearMic.fromTop.mm + d[1] * rr]);
    }
  }
  const [outer, inner] = rings.map(fitCircle);
  const n = rings.map((p) => p.length);
  add(`rear mic centre across (dimensioned 38.00: the ordinate below Detail D; the inner circle, ${n[1]} crossings)`, rearMic.fromSide.mm, inner.centre[0], 0.05);
  add('rear mic centre down (dimensioned 34.14)', rearMic.fromTop.mm, inner.centre[1], 0.05);
  add(`rear mic Ø (dimensioned 0.75): the inner circle (worst crossing ${inner.worst.toFixed(3)} off)`, rearMic.diameter.mm, 2 * inner.radius, 0.05);
  add(`rear mic's outer ring Ø (scaled; ${n[0]} crossings)`, rearMicRing.mm, 2 * outer.radius, 0.05, 'scaled');
  add('rear mic\'s two circles concentric (the outer\'s centre from the inner\'s, mm)', 0, Math.hypot(outer.centre[0] - inner.centre[0], outer.centre[1] - inner.centre[1]), 0.02);
  // The leader's arrowhead is drawn hollow; its point lies in the gap between the circles. On the rays through the
  // point, 18° to 22°, is there any paper between the inner circle's stroke and the outer's? (On rays clear of it, 120°
  // to 160°, the gap is paper: the negative control.)
  const gap = (a: number) => {
    const t = (a * Math.PI) / 180;
    let white = 0;
    for (let rr = inner.radius + 0.04; rr < outer.radius - 0.04; rr += 0.005) {
      const x = Math.round(o[0] + Math.cos(t) * rr * mc.pxPerMm), y = Math.round(o[1] + Math.sin(t) * rr * mc.pxPerMm);
      if (mg.at(x, y) > 128) white++;
    }
    return white;
  };
  add('rear mic: the Ø0.75 arrow lands on the inner circle (paper samples between the circles on rays 18° to 22°)', 0, [18, 19, 20, 21, 22].reduce((s, a) => s + gap(a), 0), 0);
  add('negative control: on rays clear of the arrow (120° to 160°) the gap between the circles shows (1 = paper found on every ray)', 1, [120, 130, 140, 150, 160].every((a) => gap(a) > 3) ? 1 : 0, 0);
  // Read with the numbers swapped (34.14 across, 38.00 down) the place is on the bump's bare top, below camera 3 (whose
  // ring ends 31.89 down): no circle of the mic's size is drawn there.
  let swapped = 'none';
  try {
    const w = cleanCircleAt(g, toPx(r, [rearMic.fromTop.mm, rearMic.fromSide.mm]), (rearMicRing.mm / 2) * r.pxPerMm, [10, -10, 15, -15]);
    swapped = `Ø${(w.diameter / r.pxPerMm).toFixed(2)}`;
  } catch {}
  add(`negative control: at (34.14, 38.00), the numbers swapped, the circle found: ${swapped} (1 = none, or over 0.3 mm off Ø1.15)`, 1, swapped === 'none' || !(Math.abs(Number(swapped.slice(1)) - rearMicRing.mm) <= 0.3) ? 1 : 0, 0);
  // The bump's top's bottom-right corner: centre (41.56 - 9.62, 42.88 - 9.62); the mic's centre is 6.12 from it, well
  // inside R9.62, so the builder puts it flush on the bump's top.
  const corner: [number, number] = [bump.topFrom.mm + bump.topSize.mm - bump.topRadius.mm, bump.topFrom.mm + bump.topHeight.mm - bump.topRadius.mm];
  add('rear mic inside the bump top\'s R9.62 corner (how far its edge would stand outside it: 0)', 0, Math.max(0, Math.hypot(rearMic.fromSide.mm - corner[0], rearMic.fromTop.mm - corner[1]) - (bump.topRadius.mm - rearMic.diameter.mm / 2)), 0);
  return out;
}

/**
 * A section through the flash as (u, v): u out from the cover glass's face along the flash's axis, v across it (px).
 * The upright one (down the phone) is drawn with u its columns, v its rows; the lying one (across) has the face at its
 * bottom, so it's turned: u up the sheet, v across.
 */
const turned = (g: Gray): Gray => ({ width: g.height, height: g.width, at: (u: number, v: number) => g.at(v, g.height - 1 - u) });

/**
 * The line first met from each start along `dir`, at each its middle: the run's near edge plus half the pen (the
 * median run width), so a hatch line merging on the far side can't pull it. As (u, v) points.
 */
function traced(g: Gray, starts: [number, number][], dir: [number, number], length: number): [number, number][] {
  const hits = starts.flatMap((p) => {
    const q = runs(g, p, dir, length)[0];
    return q ? [{ p, near: q.at - (q.width - 1) / 2, width: q.width }] : [];
  });
  const ws = hits.map((h) => h.width).sort((a, b) => a - b), pen = ws[Math.floor(ws.length / 2)];
  return hits.map(({ p, near }): [number, number] => [p[0] + dir[0] * (near + (pen - 1) / 2), p[1] + dir[1] * (near + (pen - 1) / 2)]);
}
const steps = (a: number, b: number, n = 40) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);

/**
 * Each section's setting (M-M down the phone, N-N across): its region; on lines clear of the phone, the face's and the
 * transition's extension lines (for the scale: down, row 600, above the phone; across, raw column 3400, right of the
 * break in the phone, where the face's line runs on), the base's 10.20 line, and the closing line; the 6.00 extension
 * lines (crossed beside the face); and where
 * each of the keepout's four lines is traced along u: rows (mm from the axis, the near side negative) and, for the outer
 * lines, a start (mm from the face) just past the transition's extension line, which runs on across each whole section.
 * Down the phone, camera 3's ring (from 5.47 below the axis, its glass 12.35 and 12.53 from the front) stops the lower
 * inner line's rows at 5.3 and starts the lower outer line's past the ring's glass, and the 112° dimension's extension
 * line crosses that outer line from 11.5 below (rows to 11.3); across, camera 1's ring (from 10.0 on the near side)
 * keeps the near outer line's rows within 9.4.
 */
const settings = {
  down: {
    r: sectionDown, label: 'down the phone', section: 'M-M', transition: flashKeepout.transitionFromFront!.mm, inner: flashKeepout.inner.mm,
    clear: 600, baseAt: 950, endAt: 3000, extAt: 150,
    rows: { innerNear: [3.52, 5.92], innerFar: [3.52, 5.3], outerNear: [7, 13], outerFar: [8, 11.3] }, outerFrom: [12.4, 12.65],
  },
  across: {
    r: sectionAcross, label: 'across', section: 'N-N', transition: flashKeepoutAcross.transitionFromFront.mm, inner: flashKeepoutAcross.inner.mm,
    clear: 3400, baseAt: 3500, endAt: 1000, extAt: 1620,
    rows: { innerNear: [3.52, 4.95], innerFar: [3.52, 4.95], outerNear: [6.25, 9.4], outerFar: [6.25, 13] }, outerFrom: [12.19, 12.19],
  },
};

/**
 * Sheet 3's two sections through the flash, M-M down the phone and N-N across: the scale from the cover glass's face to the
 * transition's extension line; the base's 10.20 line, the closing line and the 6.00 extension lines; at 4800 dpi the
 * lines at the base (beside the flash, 10.20 and the plateau's 10.30 drawn as two lines 0.10 apart; over it, the flash's
 * face alone at 10.20); the keepout's four lines in each, fitted, their crossings (the kinks, the inner apex, the outer apex) and angles; the inner cone's width at its base. Then the hand
 * calculations, and the negative controls.
 */
export function sectionReadings(pdf = PDF): Measured[] {
  const { out, add } = collector();
  const base = flashKeepoutBase.fromFront.mm, T = body.thickness.mm, plateau = T + bump.top.mm, end = flashKeepoutEnd.mm, D = flashKeepout.innerBaseDiameter!.mm;
  const results: Record<string, { apex: number; outerApex: number; kinks: number[] }> = {};
  for (const which of ['down', 'across'] as const) {
    const S = settings[which], r = S.r, upright = which === 'down';
    const raw = render(pdf, r);
    const g = upright ? raw : turned(raw);
    // Raw (x, y) of a turned (u, v), and back.
    const face0 = upright ? r.origin[0] : raw.height - 1 - r.origin[1], axis0 = upright ? r.origin[1] : r.origin[0];
    const name = `${S.section} ${S.label}`;
    // Calibration: on a line clear of the phone, the face's extension line and the transition's.
    const along = (v: number, mm: number, f: number, p: number) => lineNear(g, [0, v], [1, 0], g.width - 1, f + mm * p);
    const face = along(S.clear, 0, face0, r.pxPerMm);
    const px = (along(S.clear, S.transition, face, r.pxPerMm) - face) / S.transition;
    const mm = (u: number) => (u - face) / px;
    add(`Section ${name} px/mm (calibration: the cover glass face to the ${S.transition.toFixed(2)} line)`, r.pxPerMm, px, 0.05);
    add(`${name}: the cover glass face (px)`, face0, face, 1);
    add(`${name}: the 10.20 extension line, clear of the phone (dimensioned 10.20)`, base, mm(along(S.baseAt, base, face, px)), 0.03);
    add(`${name}: the keepout's closing line, 10.20 + (4.00)`, end, mm(along(S.endAt, end, face, px)), 0.03);
    // The 6.00 extension lines either side of the axis, beside the face: down, left of it (crossed down a column);
    // across, below it (crossed along a row).
    const ext = upright
      ? [-1, 1].map((sd) => lineNear(raw, [S.extAt, 0], [0, 1], raw.height - 1, axis0 + (sd * D * px) / 2))
      : [-1, 1].map((sd) => lineNear(raw, [0, S.extAt], [1, 0], raw.width - 1, axis0 + (sd * D * px) / 2));
    const axis = (ext[0] + ext[1]) / 2;
    add(`${name}: the base's 6.00 extension lines apart (dimensioned 6.00)`, D, (ext[1] - ext[0]) / px, 0.03);
    add(`${name}: the axis, midway between them (px)`, axis0, axis, 1);
    // The reference dimension between the base and the transition, drawn: the transition's extension line from the
    // base's, on the same clear line.
    const drawnGap = mm(along(S.clear, S.transition, face, px)) - mm(along(S.baseAt, base, face, px));
    add(`${name}: the base's line to the transition's, drawn (${S.transition.toFixed(2)} - 10.20 = ${(S.transition - base).toFixed(2)})`, S.transition - base, drawnGap, 0.03);

    // The faces at 4800 dpi, along u from 9.6 to 10.9 out: on the axis (over the flash) and 4.5 either side (beyond the
    // flash's Ø6.92, on the plateau: down the phone, inside the top's edge at 5.52 above and camera 3's ring at 5.47
    // below). Each run's near line (its near edge plus half a pen) and far line (its far edge less half a pen).
    const f4 = 4, pen4 = 23, u0 = 9.6, u1 = 10.9;
    const run4 = (vMm: number) => {
      const vPx = axis + vMm * px;
      const strip: Region = upright
        ? { page: r.page, dpi: r.dpi * f4, crop: { x: Math.round((r.crop.x + face + u0 * px) * f4), y: Math.round((r.crop.y + vPx) * f4), width: Math.round((u1 - u0) * px * f4), height: 1 } }
        : { page: r.page, dpi: r.dpi * f4, crop: { x: Math.round((r.crop.x + vPx) * f4), y: Math.round((r.crop.y + raw.height - 1 - face - u1 * px) * f4), width: 1, height: Math.round((u1 - u0) * px * f4) } };
      const sg = render(pdf, strip);
      // Along u: down, rightward from the strip's left (u0); across, upward from its bottom (u0).
      const rs = upright ? runs(sg, [0, 0], [1, 0], sg.width - 1) : runs(sg, [0, sg.height - 1], [0, -1], sg.height - 1);
      const startU = upright ? strip.crop.x : strip.crop.y + strip.crop.height - 1;
      const faceAbs = upright ? (r.crop.x + face) * f4 + 1.5 : (r.crop.y + raw.height - 1 - face) * f4 + 1.5;
      const toMm = (k: number) => (upright ? startU + k - faceAbs : faceAbs - (startU - k)) / (px * f4);
      return rs.map((q) => ({ near: toMm(q.at - (q.width - 1) / 2 + (pen4 - 1) / 2), far: toMm(q.at + (q.width - 1) / 2 - (pen4 - 1) / 2), width: q.width }));
    };
    const onAxis = run4(0), beside = [-4.5, 4.5].map(run4);
    const nearest = (rs: ReturnType<typeof run4>, m: number) => rs.reduce((a, b) => (Math.abs(b.near - m) < Math.abs(a.near - m) ? b : a));
    beside.forEach((rs, i) => {
      const q = nearest(rs, base);
      add(`${name} 4.5 ${i ? 'far' : 'near'} side of the axis: the 10.20 extension line, the merged run's near line (4800 dpi)`, base, q.near, 0.02);
      add(`${name} 4.5 ${i ? 'far' : 'near'} side: the plateau, its far line (8.25 + 2.05 = 10.30)`, plateau, q.far, 0.02);
    });
    const a = nearest(onAxis, base);
    add(`${name} on the axis: the flash's face, the run's near line (dimensioned 10.20)`, base, a.near, 0.02);
    // Unlike the 16 Pro's sections, these draw no plateau line over the flash: on the axis the run is one pen wide, the
    // flash's face alone at 10.20, stepping out to the plateau's 10.30 at the flash's edge (the 10.20 reading settled).
    add(`${name} on the axis: one line, the flash's face alone, its far line too (10.20)`, base, a.far, 0.02);
    add(`negative control (${name}): the plateau's line drawn over the flash? (1 = the axis's run ends over 0.05 short of 10.30: it isn't)`, 1, plateau - a.far > 0.05 ? 1 : 0, 0);

    // The keepout's lines: each traced along u, on rows (mm from the axis) from a start (mm from the face).
    const U = (m: number) => face + m * px;
    const line = (rows: number[], side: number, from: number) => fitLine(traced(g, steps(rows[0], rows[1]).map((rr): [number, number] => [U(from), axis + side * rr * px]), [1, 0], Math.round(4 * px)));
    const innerL = line(S.rows.innerNear, -1, base + 0.25), innerR = line(S.rows.innerFar, 1, base + 0.25);
    const outerL = line(S.rows.outerNear, -1, S.outerFrom[0]), outerR = line(S.rows.outerFar, 1, S.outerFrom[1]);
    const sides = ['near', 'far'];
    const kinks = [meet(innerL, outerL), meet(innerR, outerR)];
    kinks.forEach((q, i) => add(`${name}: ${sides[i]} kink, inner cone to outer, from the cover glass (${S.transition.toFixed(2)})`, S.transition, mm(q[0]), 0.05));
    [innerL, innerR].forEach((l, i) => add(`${name}: ${sides[i]} inner line off the axis (half ${S.inner}°; ${l.n} points)`, S.inner / 2, offAxis(l), 1));
    add(`${name}: inner cone, full angle as drawn (degrees)`, S.inner, offAxis(innerL) + offAxis(innerR), 1);
    add(`${name}: outer cone, full angle as drawn (degrees; fitted to ${outerL.n} and ${outerR.n} points)`, flashKeepout.outer!.mm, offAxis(outerL) + offAxis(outerR), 1);
    const apex = meet(innerL, innerR), outerApex = meet(outerL, outerR);
    const apexFromFront = which === 'down' ? flashKeepout.apexFromFront!.mm : flashKeepoutAcross.apexFromFront.mm;
    add(`${name}: inner apex on the axis (mm across)`, 0, (apex[1] - axis) / px, 0.1);
    add(`${name}: inner cone's apex from the cover glass (derived ${apexFromFront.toFixed(2)}; the drawn lines crossed)`, apexFromFront, mm(apex[0]), 0.1);
    add(`${name}: outer cone's apex from the cover glass (derived ${flashKeepout.outerApexFromFront!.mm.toFixed(2)}; the drawn lines crossed)`, flashKeepout.outerApexFromFront!.mm, mm(outerApex[0]), 0.1);
    // Where the drawn inner lines are 6.00 apart, against 10.20: read along u, as the cone widens 2 tan(half) per mm
    // (2.97 down the phone), a width check at 10.20 would hold the lines to 0.017 mm (under a pixel).
    const w = (u: number) => (vAt(innerR, u) - vAt(innerL, u)) / px, wPerPx = w(U(base) + 1) - w(U(base));
    add(`${name}: the drawn inner cone is Ø6.00 (dimensioned) at, from the cover glass (dimensioned 10.20)`, base, mm(U(base) + (D - w(U(base))) / wPerPx), 0.03);
    // Hand calculation from the printed numbers alone: the cone from Ø6.00 at 10.20 out to the transition, against the
    // drawn kinks' spacing.
    const across = D + 2 * (S.transition - base) * tanHalf(S.inner);
    add(`${name}: transition, Ø6.00 + 2 (${S.transition.toFixed(2)} - 10.20) tan ${S.inner / 2}° = ${across.toFixed(2)}, against the drawn kinks' spacing`, across, Math.abs(kinks[1][1] - kinks[0][1]) / px, 0.1);
    results[which] = { apex: mm(apex[0]), outerApex: mm(outerApex[0]), kinks: kinks.map((q) => mm(q[0])) };
    // Read from the back glass (or the plateau), "to cover glass" would put the kinks 8.25 (10.30) further out.
    add(`negative control (${name}): read from the back glass the transition would be ${(T + S.transition).toFixed(2)} from the front (1 = the drawn kinks are over 5 mm from it)`, 1, Math.abs(mean(results[which].kinks) - (T + S.transition)) > 5 ? 1 : 0, 0);
    add(`negative control (${name}): 10.20 read as the inner cone's apex (1 = the drawn lines cross over 1.5 mm nearer the front)`, 1, base - results[which].apex > 1.5 ? 1 : 0, 0);
  }
  // The printed reference dimension down the phone, (2.13), against the printed numbers it spans: 12.32 - 10.20.
  add('(2.13), M-M: the base to the transition, against 12.32 - 10.20 (printed numbers only)', 2.13, flashKeepout.transitionFromFront!.mm - base, 0.005, 'check', 'the reference dimension prints 2.13 where 12.32 - 10.20 is 2.12; the drawing draws 2.12 (above): taken as the dimensioned 12.32 and 10.20');
  add('(1.91), N-N: the base to the transition, against 12.11 - 10.20 (printed numbers only)', 1.91, flashKeepoutAcross.transitionFromFront.mm - base, 0.005);
  // The outer cone is one circular cone: its apex, worked from each section's printed numbers, is the same.
  const outerApex = (inner: number, transition: number) => transition - (D / 2 + (transition - base) * tanHalf(inner)) / tanHalf(flashKeepout.outer!.mm);
  const [vApex, hApex] = [outerApex(flashKeepout.inner.mm, flashKeepout.transitionFromFront!.mm), outerApex(flashKeepoutAcross.inner.mm, flashKeepoutAcross.transitionFromFront.mm)];
  add(`hand calculation: the outer cone's apex from the down section's numbers (${vApex.toFixed(3)}) and the across one's (${hApex.toFixed(3)}) agree`, vApex, hApex, 0.01);
  add('hand calculation: the outer cone\'s apex, recorded 11.07', flashKeepout.outerApexFromFront!.mm, vApex, 0.005);
  add('the outer cone\'s apex as drawn, down against across (mm)', results.down.outerApex, results.across.outerApex, 0.1);
  // The inner cone isn't circular: the across section draws it narrower (the family's single cone takes the wider).
  add('negative control: the inner cone circular? (1 = across, its drawn apex lies over 0.4 mm nearer the front than down the phone: it isn\'t)', 1, results.down.apex - results.across.apex > 0.4 ? 1 : 0, 0);
  return out;
}

/**
 * Sheet 4's MagSafe view, calibrated on its extension lines: across, the 0.00 and 45.22 lines on a row 3.0 above the
 * phone (4.5 above crosses the camera note's text); down, the 0.00 and 115.44 lines on a column 5 left of it. The other
 * dimensioned lines check it (46.54 and 81.76 run off to the left, read on that column; 158.58 to the right, read on a
 * column 80 across, beyond the phone; 38.79 and 56.00 run down past the phone, read on a row 166 down). Then the clear area's circle (crossings on rays from its centre, fitted), the magnetic
 * zone's top (46.54, dimensioned, and Detail D's bump outline bottom) and its arc.
 */
export function magsafeReadings(pdf = PDF): Measured[] {
  const r = magsafeView, g = render(pdf, r);
  const { out, add } = collector();
  const rowAbove = Math.round(toPx(r, [0, -3])[1]), rowBelow = Math.round(toPx(r, [0, 166])[1]);
  const colLeft = Math.round(toPx(r, [-5, 0])[0]), colRight = Math.round(toPx(r, [80, 0])[0]);
  const xAt = (row: number, m: number, c: Calibration = r) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(c, [m, 0])[0]);
  const yAt = (col: number, m: number, c: Calibration = r) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(c, [0, m])[1]);
  const corner = magsafeExtras.cameraZone.across.mm;
  const [x0, x1] = [0, corner].map((m) => xAt(rowAbove, m));
  const [y0, y1] = [0, magsafe.zoneSidesTo!.mm].map((m) => yAt(colLeft, m));
  const sx = (x1 - x0) / corner, sy = (y1 - y0) / magsafe.zoneSidesTo!.mm;
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [x0, y0] };
  const X = (px: number) => (px - cal.origin[0]) / cal.pxPerMm, Y = (px: number) => (px - cal.origin[1]) / cal.pxPerMm;
  const col = (x: number) => Math.round(toPx(cal, [x, 0])[0]);
  add('MagSafe view px/mm across (calibration: the 0.00 and 45.22 lines)', r.pxPerMm, sx, 0.05);
  add('MagSafe view px/mm down (calibration: the 0.00 and 115.44 lines)', r.pxPerMm, sy, 0.05);
  add('MagSafe view datum across (px)', r.origin[0], x0, 1);
  add('MagSafe view datum down (px)', r.origin[1], y0, 1);
  add('MagSafe view 38.79 line across, below (dimensioned PRODUCT CENTER)', magsafe.fromSide.mm, X(xAt(rowBelow, magsafe.fromSide.mm, cal)), 0.03);
  add('MagSafe view 56.00 line across, below (dimensioned: the compass)', magsafeExtras.compass.fromSide.mm, X(xAt(rowBelow, magsafeExtras.compass.fromSide.mm, cal)), 0.03);
  for (const m of [magsafe.zoneFrom!.mm, magsafe.fromTop.mm]) add(`MagSafe view ${m.toFixed(2)} line down, left (dimensioned)`, m, Y(yAt(colLeft, m, cal)), 0.03);
  add('MagSafe view 158.58 line down, right (dimensioned: the compass)', magsafeExtras.compass.fromTop.mm, Y(yAt(colRight, magsafeExtras.compass.fromTop.mm, cal)), 0.03);
  const row85 = Math.round(toPx(cal, [0, 85])[1]);
  add('the phone\'s width on the MagSafe view, 85 down (77.58)', body.width.mm, X(xAt(row85, body.width.mm, cal)) - X(xAt(row85, 0, cal)), 0.05);

  // The clear area's circle: crossings within 0.25 of R28.75 on rays every 5° from its centre, clear of the centre lines
  // (within 6° of each axis) and of the leaders that cross it (Ø57.50's, from the lower right, at about 40°; the clear
  // area's note's, from its dot inside the circle out to the right, at about 22°: down is positive), keeping rays with
  // one crossing only (a hatch line meeting the circle gives two).
  const c: [number, number] = [magsafe.fromSide.mm, magsafe.fromTop.mm], R = magsafe.diameter.mm / 2;
  const P: [number, number][] = [];
  for (let a = 0; a < 360; a += 5) {
    if ([0, 90, 180, 270, 360].some((b) => Math.abs(a - b) < 6) || [22, 40].some((b) => Math.abs(a - b) < 9)) continue;
    const t = (a * Math.PI) / 180, d: [number, number] = [Math.cos(t), Math.sin(t)];
    const o = toPx(cal, c), start = (R - 1.5) * cal.pxPerMm;
    const rs = runs(g, [o[0] + d[0] * start, o[1] + d[1] * start], d, Math.round(3 * cal.pxPerMm)).map((q) => R - 1.5 + q.at / cal.pxPerMm).filter((x) => Math.abs(x - R) < 0.25);
    if (rs.length === 1) P.push([c[0] + d[0] * rs[0], c[1] + d[1] * rs[0]]);
  }
  const f = fitCircle(P);
  add(`clear area's circle: centre across (fitted to ${P.length} crossings; worst ${f.worst.toFixed(3)} off)`, magsafe.fromSide.mm, f.centre[0], 0.05);
  add('clear area\'s circle: centre down (81.76)', magsafe.fromTop.mm, f.centre[1], 0.05);
  add('clear area\'s circle: Ø (dimensioned 57.50)', magsafe.diameter.mm, 2 * f.radius, 0.05);
  // The negative control: labelled PRODUCT CENTER, but the product's centre down (163.03 / 2 = 81.515) is 0.245 higher.
  add('negative control: the clear circle at the product centre, 163.03 / 2 = 81.515 down (1 = the fitted centre is over 0.15 mm below it)', 1, f.centre[1] - body.length.mm / 2 > 0.15 ? 1 : 0, 0);

  // The zone's top, on columns 52, 62 and 72 across (right of the camera corner's crosshatch, which ends on the same
  // line): its hatch lines meet the edge from below and can merge with it, so each is the first ink down from 1 mm above,
  // its near edge plus half the pen (the 46.54 extension line's).
  const pen = runs(g, [colLeft, 0], [0, 1], g.height - 1).reduce((p, q) => (Math.abs(Y(q.at) - magsafe.zoneFrom!.mm) < Math.abs(Y(p.at) - magsafe.zoneFrom!.mm) ? q : p)).width;
  for (const x of [52, 62, 72]) {
    const from = Math.round(toPx(cal, [0, magsafe.zoneFrom!.mm - 1])[1]), q = runs(g, [col(x), from], [0, 1], Math.round(2 * cal.pxPerMm))[0];
    add(`magnetic zone's top at ${x} across (dimensioned 46.54)`, magsafe.zoneFrom!.mm, Y(from + q.at - (q.width - 1) / 2 + (pen - 1) / 2), 0.03);
  }
  // The camera corner's crosshatch: its right edge at 45.22, rows 15 and 25 down (against Detail D's bump outline).
  add('the camera corner\'s right edge, 15 and 25 down (45.22)', corner, mean([15, 25].map((y) => X(xAt(Math.round(toPx(cal, [0, y])[1]), corner, cal)))), 0.03);

  // Its arc: the lowest point down columns 0.75 either side of the centre line; its crossings of x = 12, 25, 48 and 70
  // (clear of the R49.39 leader, which lands on the arc about 6 across, and the 5 7 note's, about 64), against the circle
  // through (0, 115.44) and (77.58, 115.44) of R49.39, its centre derived.
  const zr = magsafe.zoneRadius!.mm, half = body.width.mm / 2;
  const zc = magsafe.zoneSidesTo!.mm - Math.sqrt(zr * zr - half * half);
  add(`hand calculation: the zone's arc's centre, 115.44 - √(49.39² - 38.79²) = ${zc.toFixed(3)} down, ${(zc - magsafe.fromTop.mm).toFixed(2)} below the clear circle's`, magsafe.fromTop.mm + 3.11, zc, 0.01);
  const low = mean([half - 0.75, half + 0.75].map((x) => Y(yAt(col(x), zc + zr, cal)) + (zr - Math.sqrt(zr * zr - 0.75 * 0.75))));
  add(`magnetic zone's arc, its lowest point (centre ${zc.toFixed(2)} down, derived, + R49.39)`, zc + zr, low, 0.05);
  for (const x of [12, 25, 48, 70]) {
    const at = zc + Math.sqrt(zr * zr - (x - half) ** 2);
    add(`magnetic zone's arc at x = ${x} (${at.toFixed(2)})`, at, Y(yAt(col(x), at, cal)), 0.05);
  }
  // The negative control: R49.39 centred on the clear circle's centre would bottom out 3.11 higher.
  add(`negative control: centred on the clear circle, R49.39's lowest point would be ${(magsafe.fromTop.mm + zr).toFixed(2)} (1 = the drawn one is over 2 mm lower)`, 1, low - (magsafe.fromTop.mm + zr) > 2 ? 1 : 0, 0);
  return out;
}

/**
 * Detail A, calibrated on the corner's extension lines: across on a row 2.5 above the phone (the 0.89, 3.74, 8.36 and
 * 13.75 lines; the 0.00 line can't serve, the 0.04 leader merges with it), down on a column 1.6 left of it (likewise).
 * Then the two end crosses, which carry no label: across, the end cross's stem down a row 1.6 below the top edge (below
 * the glass's edge at 1.00 in); down, its arm along a column 1.6 in from the side.
 */
export function detailAReadings(pdf = PDF, r: Region & Calibration = detailA): Measured[] {
  const g = render(pdf, r);
  const out: Measured[] = [];
  const marks = [0.89, 3.74, 8.36, 13.75];
  const row = Math.round(toPx(r, [0, -2.5])[1]), col = Math.round(toPx(r, [-1.6, 0])[0]);
  const xs = marks.map((m) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(r, [m, 0])[0]));
  const ys = marks.map((m) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(r, [0, m])[1]));
  const span = marks.at(-1)! - marks[0];
  const [sx, sy] = [(xs.at(-1)! - xs[0]) / span, (ys.at(-1)! - ys[0]) / span];
  const x0 = mean(xs.map((x, i) => x - marks[i] * sx)), y0 = mean(ys.map((y, i) => y - marks[i] * sy));
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [x0, y0] };
  out.push({ name: 'Detail A px/mm across (calibration: the corner\'s lines, 0.89 to 13.75)', kind: 'check', recorded: r.pxPerMm, measured: sx, within: 0.1 });
  out.push({ name: 'Detail A px/mm down (calibration: the corner\'s lines, 0.89 to 13.75)', kind: 'check', recorded: r.pxPerMm, measured: sy, within: 0.1 });
  out.push({ name: 'Detail A datum across (px)', kind: 'check', recorded: r.origin[0], measured: x0, within: 1.5 });
  out.push({ name: 'Detail A datum down (px)', kind: 'check', recorded: r.origin[1], measured: y0, within: 1.5 });
  marks.forEach((m, i) => {
    out.push({ name: `Detail A line ${m.toFixed(2)} across (dimensioned)`, kind: 'check', recorded: m, measured: (xs[i] - x0) / cal.pxPerMm, within: 0.03 });
    out.push({ name: `Detail A line ${m.toFixed(2)} down (dimensioned)`, kind: 'check', recorded: m, measured: (ys[i] - y0) / cal.pxPerMm, within: 0.03 });
  });
  const endAcross = (lineNear(g, [0, Math.round(toPx(cal, [0, 1.6])[1])], [1, 0], g.width - 1, toPx(cal, [cornerEnd.mm, 0])[0]) - x0) / cal.pxPerMm;
  const endDown = (lineNear(g, [Math.round(toPx(cal, [1.6, 0])[0]), 0], [0, 1], g.height - 1, toPx(cal, [0, cornerEnd.mm])[1]) - y0) / cal.pxPerMm;
  out.push({ name: `corner end across (the end cross's stem; down: ${endDown.toFixed(3)})`, kind: 'scaled', recorded: cornerEnd.mm, measured: (endAcross + endDown) / 2, within: 0.05 });
  out.push({ name: 'corner end: across and down agree', kind: 'check', recorded: 0, measured: endAcross - endDown, within: 0.05 });
  return out;
}

/**
 * The bottom view, in its recorded calibration (the family checks it): along the holes' centre line (4.12 from the back,
 * mid-thickness to 0.005), each hole's two edges and the extension line through it: the line on its dimension, the
 * edges' middle on it too (a centre, not an edge); and the port's outermost outline at each end, whose ends the drawing
 * doesn't dimension.
 */
export function bottomReadings(pdf = PDF, r: Region & Calibration = bottomView): Measured[] {
  const g = render(pdf, r);
  const out: Measured[] = [];
  const T = body.thickness.mm;
  const y = Math.round(toPx(r, [0, T / 2 - bottom.holesFromBack.mm])[1]);
  const row = runs(g, [0, y], [1, 0], g.width - 1).map((q) => ({ mm: (q.at - r.origin[0]) / r.pxPerMm, w: q.width / r.pxPerMm }));
  const R = bottom.holeDiameter.mm / 2;
  // The extension lines end on the holes' tops (and some holes have a leader up into them): find them on a row 0.8
  // beyond the holes, toward the front.
  const above = Math.round(toPx(r, [0, T / 2 - bottom.holesFromBack.mm - R - 0.8])[1]);
  const lines = bottom.holes.map((h) => (lineNear(g, [0, above], [1, 0], g.width - 1, toPx(r, [h.mm, 0])[0]) - r.origin[0]) / r.pxPerMm - h.mm);
  const middles = bottom.holes.map((h) => {
    const near = row.filter((q) => Math.abs(q.mm - h.mm) < R + 0.3);
    return (near[0].mm + near.at(-1)!.mm) / 2 - h.mm;
  });
  const worst = (a: number[]) => a.reduce((p, q) => (Math.abs(q) > Math.abs(p) ? q : p));
  out.push({ name: `bottom holes: the extension lines on their dimensions (largest difference of ${bottom.holes.length})`, kind: 'check', recorded: 0, measured: worst(lines), within: 0.05 });
  out.push({ name: 'bottom holes: the edges\' middles on the dimensions (to centres, not edges)', kind: 'check', recorded: 0, measured: worst(middles), within: 0.05 });
  const end = (x: number) => (lineNear(g, [0, y], [1, 0], g.width - 1, toPx(r, [x, 0])[0]) - r.origin[0]) / r.pxPerMm;
  out.push({ name: 'port near end (its outermost outline)', kind: 'scaled', recorded: portEnds.from.mm, measured: end(portEnds.from.mm), within: 0.05 });
  out.push({ name: 'port far end (its outermost outline)', kind: 'scaled', recorded: portEnds.to.mm, measured: end(portEnds.to.mm), within: 0.05 });
  out.push({ name: 'port centre (Detail C: 38.79)', kind: 'check', recorded: 38.79, measured: (end(portEnds.from.mm) + end(portEnds.to.mm)) / 2, within: 0.05 });
  return out;
}

export const remeasure = (pdf = PDF): Measured[] => [
  ...family(phone, { back: detailD, front: frontView, bottom: bottomView }, pdf, {
    // The active area's bottom-left diagonal runs along a hatch line that starts on the arc (as the 16 Pro's).
    activeCorners: ['top-left', 'top-right', 'bottom-right'],
    // A row 2.0 toward the front: clear of the port (3.14 tall about the middle) and of the long line drawn 1.8 toward
    // the front (rows 1.75 to 1.85 are dark across the whole view), where the outline has rounded in under 0.01.
    bottomRow: 2.0,
    known: {
      'rear camera 1 window': 'Detail D draws camera 1 without the innermost circle cameras 2 and 3 (and the 16 Pro\'s camera 1) have: the finder takes the next ring out, Ø13.56. The part follows cameras 2 and 3\'s 13.02',
    },
  }),
  ...detailAReadings(pdf),
  ...bottomReadings(pdf),
  ...micReadings(pdf),
  ...sectionReadings(pdf),
  ...magsafeReadings(pdf),
];

export const hasPdf = () => existsSync(PDF);

if (import.meta.main) console.log(report(remeasure()));
