// Re-measures every scaled value in drawing.ts from the PDF (the family's procedures, iphone/measure.ts), and what this
// model adds: Detail A's corner diagonal point, the camera pill's round ends, camera 2's ring and the island's ends.
//
// Checks the rear mic (Detail D, at 4800 dpi), the flash's keepout sections (J-J and N-N) and MagSafe's keepouts against
// what the drawing draws, and re-measures the scaled one (the mic's outer ring).
//
//   node iphone-17/measure.ts   → a table: recorded, measured, the difference
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { remeasure as family, report, type Measured } from '../../measure.ts';
import type { Phone } from '../../drawing.ts';
import { circleAt, cleanCircleAt, lineNear, render, runNear, runs, toPx, type Calibration, type Gray, type Region } from '../../../src/raster.ts';
import { v } from '../../../src/provenance.ts';
import { body, bottomView, bump, cameras, cornerDiagonal, detailA, detailD, flash, flashKeepout, flashKeepoutAcross, flashKeepoutBase, flashKeepoutEnd, front, frontView, magsafe, magsafeView, micView, phone, rearMic, rearMicRing, sectionJJ, sectionNN } from './drawing.ts';

export const PDF = join(import.meta.dirname, '..', '..', 'drawings', 'iphone-17.pdf');

/**
 * The family calibrates the back view across on the two camera centres furthest apart across; the 17's two cameras are
 * on one line (both 13.62 from the side), so across it has nothing to divide by. The flash, a single dimensioned circle
 * (30.41, 22.48, Ø6.28), is added to the cameras the re-measurement sees as the point across: the pair furthest apart
 * across is then camera 1 and the flash (16.79), down camera 1 and camera 2 (17.72). Its "window" is the flash's own
 * circle, checked against its Ø6.28. Only the re-measurement sees it; the part's cameras are drawing.ts's.
 */
export const calibrationPoint = {
  name: 'flash (the back view\'s calibration point across)',
  label: 'flash',
  fromSide: flash.fromSide,
  fromTop: flash.fromTop,
  ring: flash.diameter,
  window: flash.diameter,
  coneApexFromFront: v(0, 'assumed', 'unused: a calibration point, not a camera'),
  keepoutCone: v(0, 'assumed', 'unused'),
  aperture: v(0, 'assumed', 'unused'),
};

/**
 * Detail A: calibrated on the crosses' extension lines, the 0.00 line and the 19.23 line, across (on a row above the
 * phone) and down (on a column left of it); checked on the 9.87 and 14.53 lines. Then the outline's crossing of the
 * corner's diagonal, from (0.4, 0.4) in past the datum lines' own crossing, passing over the 0.48, 2.26 and 5.56
 * leaders where they cross the diagonal.
 */
export function detailAReadings(pdf = PDF, r: Region & Calibration = detailA, diagonal = cornerDiagonal.mm): Measured[] {
  const g = render(pdf, r);
  const out: Measured[] = [];
  const row = Math.round(toPx(r, [0, -1.85])[1]), col = Math.round(toPx(r, [-1.4, 0])[0]);
  const acrossAt = (x: number) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(r, [x, 0])[0]);
  const downAt = (y: number) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(r, [0, y])[1]);
  const [x0, x1, y0, y1] = [acrossAt(0), acrossAt(19.23), downAt(0), downAt(19.23)];
  const [sx, sy] = [(x1 - x0) / 19.23, (y1 - y0) / 19.23];
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [x0, y0] };
  out.push({ name: 'Detail A px/mm across (calibration: the 0.00 and 19.23 lines)', kind: 'check', recorded: r.pxPerMm, measured: sx, within: 0.1 });
  out.push({ name: 'Detail A px/mm down (calibration: the 0.00 and 19.23 lines)', kind: 'check', recorded: r.pxPerMm, measured: sy, within: 0.1 });
  out.push({ name: 'Detail A datum across: the 0.00 line (px)', kind: 'check', recorded: r.origin[0], measured: x0, within: 1.5 });
  out.push({ name: 'Detail A datum down: the 0.00 line (px)', kind: 'check', recorded: r.origin[1], measured: y0, within: 1.5 });
  for (const x of [9.87, 14.53]) {
    out.push({ name: `Detail A corner's ${x.toFixed(2)} line across (dimensioned ${x.toFixed(2)})`, kind: 'check', recorded: x, measured: (acrossAt(x) - x0) / cal.pxPerMm, within: 0.05 });
    out.push({ name: `Detail A corner's ${x.toFixed(2)} line down (dimensioned ${x.toFixed(2)})`, kind: 'check', recorded: x, measured: (downAt(x) - y0) / cal.pxPerMm, within: 0.05 });
  }
  const from = toPx(cal, [0.4, 0.4]);
  const leaders = [0.48, 2.26, 5.56];
  const crossings = runs(g, from, [Math.SQRT1_2, Math.SQRT1_2], Math.round(6 * cal.pxPerMm)).filter((q) => !leaders.some((l) => Math.abs(0.4 + (q.at / cal.pxPerMm) * Math.SQRT1_2 - l) * cal.pxPerMm < 4));
  out.push({ name: 'corner diagonal point (the outline on the 45° diagonal)', kind: 'scaled', recorded: diagonal, measured: 0.4 + (crossings[0].at / cal.pxPerMm) * Math.SQRT1_2, within: 0.05 });
  return out;
}

/**
 * The pill's top end, in Detail D's calibration: down columns across its top, the outline's crossing nearest a
 * semicircle on its dimensioned width (1.18 to 26.06) from its dimensioned top (1.34); the largest difference, which
 * says its ends are round (and so its corner radius half its width): within 0.10, the most near the sides, where the
 * drawn end runs a little inside the semicircle.
 */
export function pillEnd(pdf = PDF, r: Region & Calibration = detailD, [x0, x1, top] = [1.18, 26.06, 1.34], xs = [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]): Measured[] {
  const g = render(pdf, r);
  const R = (x1 - x0) / 2, c = (x0 + x1) / 2;
  // The difference down a column, times the cosine of the curve's slope there: the distance across the curve.
  const worst = Math.max(...xs.map((x) => {
    const h = Math.sqrt(R * R - (x - c) ** 2);
    const expect = top + R - h;
    const at = lineNear(g, [Math.round(toPx(r, [x, 0])[0]), 0], [0, 1], g.height - 1, toPx(r, [0, expect])[1]);
    return (Math.abs((at - r.origin[1]) / r.pxPerMm - expect) * h) / R;
  }));
  return [{ name: `camera pill's top end against a semicircle on its ${(x1 - x0).toFixed(2)} width (largest distance across it, ${xs[0]} to ${xs.at(-1)} across)`, kind: 'check', recorded: 0, measured: worst, within: 0.12 }];
}

/**
 * Camera 2's ring: the family checks only camera 1's. Detail D's 2X Ø16.00 says both rings are 16.00, but camera 2 is
 * drawn without it: its outermost circle is the Ø15.07 that sits inside camera 1's ring too.
 */
export function secondRing(pdf = PDF, r: Region & Calibration = detailD): Measured[] {
  const g = render(pdf, r);
  const c = cameras.main;
  const found = circleAt(g, toPx(r, [c.fromSide.mm, c.fromTop.mm]), (c.ring.mm / 2) * r.pxPerMm);
  return [{ name: `${c.name} ring Ø (dimensioned 2X ${c.ring.mm.toFixed(2)}): its outermost circle`, kind: 'check', recorded: c.ring.mm, measured: found.diameter / r.pxPerMm, within: 0.05, known: 'camera 2 is drawn without the Ø16.00 ring Detail D\'s 2X gives both cameras: its outermost circle is the 15.06 inside camera 1\'s ring too. The part follows the number (the overlay shows it red)' }];
}

/**
 * The island's ends: the family reads them on the row through its middle, but here the island's dash-dot centre line
 * is drawn over its ends on that row (a 346 px dash where the right end should be). In the front view's calibration,
 * its ends on rows below the middle instead (above it the hatch lines meet one end or the other: runs 9 to 14 px wide
 * where the ends' strokes are 6), each moved out by what a semicircular end loses there (r - sqrt(r² - d²), r = 6.07 / 2).
 */
export function islandEnds(pdf = PDF, r: Region & Calibration = frontView, below = [0.5, 0.8]): Measured[] {
  const g = render(pdf, r);
  const W = phone.body.width.mm, [il, ih, it] = [front.islandLength!.mm, front.islandHeight!.mm, front.islandFromTop!.mm];
  return below.map((dy) => {
    const lost = ih / 2 - Math.sqrt((ih / 2) ** 2 - dy * dy);
    const row = Math.round(toPx(r, [0, it + dy])[1]);
    const [a, b] = [(W - il) / 2, (W + il) / 2].map((x) => (lineNear(g, [0, row], [1, 0], g.width - 1, toPx(r, [x, 0])[0]) - r.origin[0]) / r.pxPerMm);
    return { name: `island length on the row ${dy} below its middle, its ends' semicircles allowed for (dimensioned ${il.toFixed(2)})`, kind: 'check' as const, recorded: il, measured: b - a + 2 * lost, within: 0.05 };
  });
}

// Helpers for the checks below (as the 16's measure.ts).
const mean = (a: number[]) => a.reduce((p, q) => p + q, 0) / a.length;
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
 * circles. Each is fitted to its crossings on rays from the dimensioned centre every 2° (clear of the centre lines'
 * ends, within 8° of each axis: the 22.48 line comes in from the left, the 20.54 extension line from below; and of the
 * Ø1.00 leader's arrowhead, which comes in from the lower right, 15° to 48°, down positive), each crossing sorted to a
 * circle by its radius. Then where the leader's arrow lands: on its rays the ink runs unbroken from the inner circle
 * outward.
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
    if ([0, 90, 180, 270, 360].some((b) => Math.abs(a - b) < 8) || (a >= 15 && a <= 48)) continue;
    const t = (a * Math.PI) / 180, d: [number, number] = [Math.cos(t), Math.sin(t)], start = 0.3 * mc.pxPerMm;
    for (const q of runs(mg, [o[0] + d[0] * start, o[1] + d[1] * start], d, Math.round(0.65 * mc.pxPerMm))) {
      const rr = 0.3 + q.at / mc.pxPerMm;
      rings[rr > split ? 0 : 1].push([rearMic.fromSide.mm + d[0] * rr, rearMic.fromTop.mm + d[1] * rr]);
    }
  }
  const [outer, inner] = rings.map(fitCircle);
  const n = rings.map((p) => p.length);
  add(`rear mic centre across (dimensioned 20.54: the ordinate below Detail D; the inner circle, ${n[1]} crossings)`, rearMic.fromSide.mm, inner.centre[0], 0.05);
  add('rear mic centre down (dimensioned 22.48, the left-hand one)', rearMic.fromTop.mm, inner.centre[1], 0.05);
  add(`rear mic Ø (dimensioned 1.00): the inner circle (worst crossing ${inner.worst.toFixed(3)} off)`, rearMic.diameter.mm, 2 * inner.radius, 0.05);
  add(`rear mic's outer ring Ø (scaled; ${n[0]} crossings)`, rearMicRing.mm, 2 * outer.radius, 0.05, 'scaled');
  add('rear mic\'s two circles concentric (the outer\'s centre from the inner\'s, mm)', 0, Math.hypot(outer.centre[0] - inner.centre[0], outer.centre[1] - inner.centre[1]), 0.02);
  // The leader's arrowhead is drawn hollow; its point, where its sides meet, lies in the gap between the circles. On
  // the rays through the point, 26° to 30°, is there any paper between the inner circle's stroke and the outer's? (On
  // rays clear of it, 60° to 80°, the gap is paper: the negative control.)
  const gap = (a: number) => {
    const t = (a * Math.PI) / 180;
    let white = 0;
    for (let rr = inner.radius + 0.04; rr < outer.radius - 0.04; rr += 0.005) {
      const x = Math.round(o[0] + Math.cos(t) * rr * mc.pxPerMm), y = Math.round(o[1] + Math.sin(t) * rr * mc.pxPerMm);
      if (mg.at(x, y) > 128) white++;
    }
    return white;
  };
  add('rear mic: the Ø1.00 arrow lands on the inner circle (paper samples between the circles on rays 26° to 30°)', 0, [26, 27, 28, 29, 30].reduce((s, a) => s + gap(a), 0), 0);
  add('negative control: on rays clear of the arrow (60° to 80°) the gap between the circles shows (1 = paper found on every ray)', 1, [60, 65, 70, 75, 80].every((a) => gap(a) > 3) ? 1 : 0, 0);
  // Read with the numbers swapped (22.48 across, 20.54 down) the place lands on the pill's top beside camera 1's ring
  // (3.24 outside it): no Ø1.00 circle is drawn there.
  let swapped = 'none';
  try {
    const w = cleanCircleAt(g, toPx(r, [rearMic.fromTop.mm, rearMic.fromSide.mm]), (rearMic.diameter.mm / 2) * r.pxPerMm, [10, -10, 20, -20]);
    swapped = `Ø${(w.diameter / r.pxPerMm).toFixed(2)}`;
  } catch {}
  add(`negative control: at (22.48, 20.54), the numbers swapped, the circle found: ${swapped} (1 = none, or over 0.3 mm off Ø1.00)`, 1, swapped === 'none' || !(Math.abs(Number(swapped.slice(1)) - rearMic.diameter.mm) <= 0.3) ? 1 : 0, 0);
  // On the pill's flat top, on its straight part (13.80 to 31.16 down): the mic's edge from the top's middle line
  // (13.62 across) against the top's half width (9.83). The builder puts it flush on the top.
  const middle = bump.topFrom.mm + bump.topSize.mm / 2;
  add('rear mic inside the pill\'s flat top (how far its edge would stand outside it: 0)', 0, Math.max(0, Math.abs(rearMic.fromSide.mm - middle) + rearMic.diameter.mm / 2 - bump.topRadius.mm), 0);
  add('rear mic on the top\'s straight part, down (how far outside 13.80 to 31.16: 0)', 0, Math.max(0, bump.topFromTop!.mm + bump.topRadius.mm - rearMic.fromTop.mm, rearMic.fromTop.mm - (bump.topFromTop!.mm + bump.topHeight!.mm - bump.topRadius.mm)), 0);
  return out;
}

/**
 * A section through the flash as (u, v): u out from the cover glass's face along the flash's axis, v across it (px).
 * J-J is drawn upright (u its columns, v its rows); N-N lies down, the face its bottom edge, so it's turned: u up the
 * sheet, v across.
 */
type Section = { name: string; g: Gray; face: number; axis: number; px: number };
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

/** Each section's numbers: J-J's are the family's field's, N-N's `flashKeepoutAcross`. */
const sectionNumbers = (which: 'J-J' | 'N-N') => {
  const k = which === 'J-J' ? flashKeepout : flashKeepoutAcross;
  return { inner: k.inner.mm, transition: k.transitionFromFront!.mm, D: k.innerBaseDiameter!.mm, apex: k.apexFromFront!.mm, outerApex: k.outerApexFromFront!.mm };
};

/**
 * A keepout line in a section, traced on `rows` (mm from the axis, `side` -1 or 1) along u from `start` (mm from the
 * face), and fitted in mm: u = a + b·v, u from the face and v from the axis.
 */
function keepoutLine(s: Section, rows: number[], side: number, start: number): Line {
  const { g, face, axis, px } = s;
  const pts = traced(g, rows.map((r): [number, number] => [face + start * px, axis + side * r * px]), [1, 0], Math.round(4 * px));
  return fitLine(pts.map(([u, v]): [number, number] => [(u - face) / px, (v - axis) / px]), 3 / 46.1);
}

/**
 * The keepout's four lines in a section: each inner line traced along u from `from` out (J-J: 8.10, just past the back
 * glass; N-N: 8.60, past where its inner lines bend in to their base) on rows from 0.3 past there to 0.15 short of its
 * kink, at 4800 dpi (`fine`: over so short a run 1200 dpi reads N-N's angle 0.3° off); each outer line at 1200 dpi along
 * u from just past the transition's extension line on rows 7 to 13 from the axis. (N-N's bump, on the left, lies below
 * its left inner line there: the bump's slope starts 4.35 from the axis, at 7.95.)
 */
function keepoutLines(coarse: Section, fine: Section, inner: number, transition: number, D: number, past: number, from: number) {
  const base = flashKeepoutBase.fromFront.mm, rb = D / 2, t = tanHalf(inner);
  const innerRows = steps(rb + (from + 0.3 - base) * t, rb + (transition - 0.15 - base) * t);
  return {
    inner: [-1, 1].map((side) => keepoutLine(fine, innerRows, side, from)),
    outer: [-1, 1].map((side) => keepoutLine(coarse, steps(7, 13), side, past)),
  };
}

/**
 * Sheet 3's Sections J-J (down the phone) and N-N (across), each through the flash: the scale from the cover glass's
 * face to the transition's extension line; the faces (the strobe's 7.85 and the back glass's 7.95, drawn as two lines
 * 0.10 apart at 4800 dpi; N-N's bump top 9.73 against its 9.72 line; the 4.00 closing line); the keepout's four lines in
 * each, fitted, their crossings (the kinks, the inner apex, the outer apex) and angles; the inner cone's width at its
 * base. Then the hand calculations, and the negative controls.
 */
export function sectionReadings(pdf = PDF): Measured[] {
  const { out, add } = collector();
  const base = flashKeepoutBase.fromFront.mm, T = body.thickness.mm, end = flashKeepoutEnd.mm;
  const results: Record<string, { apex: number; outerApex: number; kinks: number[]; base: number }> = {};
  for (const which of ['J-J', 'N-N'] as const) {
    const r = which === 'J-J' ? sectionJJ : sectionNN;
    const raw = render(pdf, r);
    const g = which === 'J-J' ? raw : turned(raw);
    const face0 = which === 'J-J' ? r.origin[0] : raw.height - 1 - r.origin[1], axis0 = which === 'J-J' ? r.origin[1] : r.origin[0];
    const k = sectionNumbers(which), transition = k.transition, D = k.D;
    // Calibration: on a line clear of the phone (J-J: row 300, above it; N-N: column 2000, right of it, turned), the
    // face's extension line and the transition's.
    const clear = which === 'J-J' ? 300 : 2000;
    const along = (v: number, mm: number, f: number, p: number) => lineNear(g, [0, v], [1, 0], g.width - 1, f + mm * p);
    const face = along(clear, 0, face0, r.pxPerMm);
    const px = (along(clear, transition, face, r.pxPerMm) - face) / transition;
    const mm = (u: number) => (u - face) / px;
    add(`Section ${which} px/mm (calibration: the cover glass face to the ${transition.toFixed(2)} line)`, r.pxPerMm, px, 0.08);
    add(`${which} cover glass face (px)`, face0, face, 1);
    add(`${which} the 7.85 extension line, clear of the phone (dimensioned 7.85)`, base, mm(along(which === 'J-J' ? 600 : 2000, base, face, px)), 0.03);
    // The closing line: J-J on a row 2.3 above the axis (inside the keepout), N-N on a column 13.6 left (its extension
    // towards the (4.00) leader).
    add(`${which} the keepout's closing line, 7.85 + (4.00)`, end, mm(along(which === 'J-J' ? 1500 : 100, end, face, px)), 0.03);
    // The base's extension lines either side of the axis: J-J left of the face (rows), N-N below it (columns).
    const ext = which === 'J-J'
      ? [-1, 1].map((sd) => lineNear(raw, [150, 0], [0, 1], raw.height - 1, axis0 + (sd * D * px) / 2))
      : [-1, 1].map((sd) => lineNear(raw, [0, 1000], [1, 0], raw.width - 1, axis0 + (sd * D * px) / 2));
    const axis = (ext[0] + ext[1]) / 2;
    add(`${which} the base's ${D.toFixed(2)} extension lines apart (dimensioned ${D.toFixed(2)})`, D, (ext[1] - ext[0]) / px, 0.03);
    add(`${which} the axis, midway between them (px)`, axis0, axis, 1);

    // The faces at 4800 dpi. The strip: the axis at v = mid in it, reaching 7 mm either side (N-N's 14 mm to the left,
    // over the bump).
    const f4 = 4, pen4 = 23, mid = which === 'J-J' ? 1400 : 2700;
    const strip: Region = which === 'J-J'
      ? { page: r.page, dpi: r.dpi * f4, crop: { x: r.crop.x * f4, y: Math.round((r.crop.y + axis) * f4 - mid), width: Math.round((face + 12.5 * px) * f4), height: 2800 } }
      : { page: r.page, dpi: r.dpi * f4, crop: { x: Math.round((r.crop.x + axis) * f4 - mid), y: r.crop.y * f4, width: 4000, height: Math.round(raw.height * f4) } };
    const s4raw = render(pdf, strip), s4 = which === 'J-J' ? s4raw : turned(s4raw);
    const face4 = which === 'J-J' ? face * f4 + 1.5 : (raw.height - 1 - face) * f4 + 1.5, faceU4 = which === 'J-J' ? face4 : s4raw.height - 1 - face4;
    const mm4 = (u: number) => (u - faceU4) / (px * f4);
    const run4 = (dv: number, mmAt: number) => runNear(s4, [0, mid + dv], [1, 0], s4.width - 1, faceU4 + mmAt * px * f4);
    const lines = (q: { at: number; width: number }) => [q.at - (q.width - 1) / 2 + (pen4 - 1) / 2, q.at + (q.width - 1) / 2 - (pen4 - 1) / 2].map(mm4);
    // Beside the base (6 to 7 from the axis, right or below), the 7.85 extension line runs on beside the back glass: the
    // median over five rows (a section's hatch line ending on the near side merges with the run on some).
    const median = (a: number[]) => [...a].sort((p, q) => p - q)[Math.floor(a.length / 2)];
    const beside = [6, 6.25, 6.5, 6.75, 7].map((d) => lines(run4(Math.round(d * px * f4), (base + T) / 2)));
    const [near, far] = [0, 1].map((i) => median(beside.map((b) => b[i])));
    add(`${which} 6 to 7 from the axis: the 7.85 extension line, the merged run's near line (4800 dpi, median of 5 rows)`, base, near, 0.02);
    add(`${which} 6 to 7 from the axis: the back glass, its far line (7.95)`, T, far, 0.02);
    // On the axis, both sections draw only the 7.85 line: the strobe's face, no back glass over it.
    const onAxis = run4(0, base);
    add(`${which} on the axis: one line (run ${onAxis.width} px, one pen ${pen4}), the strobe's face (dimensioned 7.85)`, base, mm4(onAxis.at), 0.02);
    add(`${which} on the axis: no back glass drawn over the strobe (the run's width less one pen, mm)`, 0, (onAxis.width - pen4) / (px * f4), 0.02);
    if (which === 'J-J') {
      // The transition's line is drawn in two pieces: above the axis (the upper kink's, reached by the 9.89 leader) and
      // below it (the lower kink's, reached by the (2.06) arrow). Each read 6.5 from the axis, from the 7.85 line.
      const [up, down] = [-1, 1].map((sd) => mm4(run4(sd * Math.round(6.5 * px * f4), transition).at));
      const [b85up, b85down] = [-1, 1].map((sd) => lines(run4(sd * Math.round(6.5 * px * f4), (base + T) / 2))[0]);
      add('J-J the upper kink\'s line from the 7.85 line, 6.5 above the axis (9.89 - 7.85 = 2.04)', 2.04, up - b85up, 0.01);
      add('J-J the lower kink\'s line from the 7.85 line, 6.5 below the axis (its arrow\'s (2.06))', 2.06, down - b85down, 0.01);
      add('J-J the two pieces of the transition\'s line apart (the lower further out, mm)', 0.01, down - up, 0.006);
    } else {
      // The bump (on the left, v < axis), 13 from the axis: its top (7.95 + 1.78 = 9.73), 0.01 beyond the 9.72 line.
      const b = run4(-Math.round(13 * px * f4), (transition + T + bump.top.mm) / 2);
      add(`N-N over the bump: the bump's top, one run (${b.width} px), its middle (7.95 + 1.78 = 9.73)`, T + bump.top.mm, mm4(b.at), 0.02);
      add('N-N the 9.72 line, right of the kink (6.5 from the axis; dimensioned (1.87) from the 7.85 line)', 1.87, mm4(run4(Math.round(6.5 * px * f4), transition).at) - lines(run4(Math.round(6.5 * px * f4), (base + T) / 2))[0], 0.01);
    }

    // The keepout's lines.
    const s: Section = { name: which, g, face, axis, px };
    const axis4 = (which === 'J-J' ? (r.crop.y + axis) * f4 - strip.crop.y : (r.crop.x + axis) * f4 - strip.crop.x) + 1.5;
    const L = keepoutLines(s, { name: which, g: s4, face: faceU4, axis: axis4, px: px * f4 }, k.inner, transition, D, transition + 0.24, which === 'J-J' ? base + 0.25 : 8.6);
    const [innerL, innerR] = L.inner, [outerL, outerR] = L.outer;
    const sides = ['left', 'right'], upDown = which === 'J-J' ? ['upper', 'lower'] : sides;
    const kinks = [meet(innerL, outerL), meet(innerR, outerR)];
    kinks.forEach((q, i) => add(`${which} ${upDown[i]} kink, inner cone to outer, from the cover glass (${transition.toFixed(2)})`, transition, q[0], 0.05));
    [innerL, innerR].forEach((l, i) => add(`${which} ${upDown[i]} inner line off the axis (half ${k.inner}°; ${l.n} points)`, k.inner / 2, offAxis(l), 1));
    // N-N's inner lines are drawn wider than its numbers: straight from 8.6 out at 98.1°, bending in below 8.5 (52° each
    // side) to the Ø5.13 corners. So its straight part, extended to 7.85, is wider than 5.13, and its kinks further apart.
    const nn = which === 'N-N' ? (what: string) => `N-N's inner lines are drawn straight at 98.1° from 8.6 out (1.1° wider than its 97° H-FOV), bending in below 8.5 to the Ø5.13 corners (the check below): ${what}. The family's single cone (J-J's 112° on Ø5.50) holds them either way` : () => undefined;
    add(`${which} inner cone, full angle as drawn (degrees)`, k.inner, offAxis(innerL) + offAxis(innerR), 0.5, 'check', nn('the drawn angle'));
    add(`${which} outer cone, full angle as drawn (degrees; fitted to ${outerL.n} and ${outerR.n} points)`, flashKeepout.outer!.mm, offAxis(outerL) + offAxis(outerR), 1);
    const apex = meet(innerL, innerR), outerApex = meet(outerL, outerR);
    add(`${which} inner apex on the axis (mm across)`, 0, apex[1], 0.1);
    add(`${which} inner cone's apex from the cover glass (derived ${k.apex.toFixed(2)}; the drawn lines crossed)`, k.apex, apex[0], 0.1);
    add(`${which} outer cone's apex from the cover glass (derived ${k.outerApex.toFixed(2)}; the drawn lines crossed)`, k.outerApex, outerApex[0], 0.1);
    const atBase = vAt(innerR, base) - vAt(innerL, base);
    add(`${which} inner cone at its base, 7.85 (dimensioned Ø${D.toFixed(2)}): its straight part extended`, D, atBase, 0.05, 'check', nn('its straight part reaches 5.27 at 7.85'));
    // Hand calculation from the printed numbers alone: the cone from its base at 7.85 out to the transition, against
    // the drawn kinks' spacing.
    const across = D + 2 * (transition - base) * tanHalf(k.inner);
    add(`${which} transition, Ø${D.toFixed(2)} + 2 (${transition.toFixed(2)} - 7.85) tan ${k.inner / 2}° = ${across.toFixed(2)}, against the drawn kinks' spacing`, across, Math.abs(kinks[1][1] - kinks[0][1]), 0.1, 'check', nn('so its kinks are drawn 9.52 apart'));
    results[which] = { apex: apex[0], outerApex: outerApex[0], kinks: kinks.map((q) => q[0]), base: atBase };
    if (which === 'N-N') {
      // Below 8.5 N-N's inner lines bend in: fitted on rows where they run 8.05 to 8.45 out (traced from 8.04, clear of the back glass), extended
      // to 7.85, they reach its base's corners, on the 5.13 extension lines.
      const fine: Section = { name: which, g: s4, face: faceU4, axis: axis4, px: px * f4 };
      const low = [-1, 1].map((side) => keepoutLine(fine, steps(2.9, 3.3, 20), side, 8.04));
      add(`N-N inner lines below 8.5, extended to 7.85: apart (dimensioned 5.13; fitted to ${low[0].n} and ${low[1].n} points)`, D, vAt(low[1], base) - vAt(low[0], base), 0.05);
      add(`N-N inner lines bend in below 8.5 (1 = over 2° steeper off the axis there, ${mean(low.map(offAxis)).toFixed(1)}°, than above, ${mean([innerL, innerR].map(offAxis)).toFixed(1)}°)`, 1, mean(low.map(offAxis)) - mean([innerL, innerR].map(offAxis)) > 2 ? 1 : 0, 0);
    }
    // Read from the back glass, "to cover glass" would put the kinks 7.95 further out.
    add(`negative control (${which}): read from the back glass the transition would be ${(T + transition).toFixed(2)} from the front (1 = the drawn kinks are over 5 mm from it)`, 1, Math.abs(mean(results[which].kinks) - (T + transition)) > 5 ? 1 : 0, 0);
    add(`negative control (${which}): 7.85 read as the inner cone's apex (1 = the drawn lines cross over 1.5 mm nearer the front)`, 1, base - results[which].apex > 1.5 ? 1 : 0, 0);
  }
  // The outer cone from each section's printed numbers: its apex 8.715 (J-J) and 8.768 (N-N), not one circular cone.
  const outerApex = (inner: number, transition: number, D: number) => transition - (D / 2 + (transition - base) * tanHalf(inner)) / tanHalf(flashKeepout.outer!.mm);
  const [vApex, hApex] = [outerApex(flashKeepout.inner.mm, flashKeepout.transitionFromFront!.mm, flashKeepout.innerBaseDiameter!.mm), outerApex(flashKeepoutAcross.inner.mm, flashKeepoutAcross.transitionFromFront!.mm, flashKeepoutAcross.innerBaseDiameter!.mm)];
  add(`hand calculation: the outer cone's apex from J-J's numbers (${vApex.toFixed(3)}) and N-N's (${hApex.toFixed(3)})`, vApex, hApex, 0.01, 'check', 'the printed numbers don\'t make one circular outer cone (the 16\'s agreed to 0.001): N-N\'s base and angle don\'t reproduce its drawn kinks. As drawn, both sections\' outer lines cross at 8.73 (the next check): one cone');
  add('the outer cone\'s apex as drawn, J-J against N-N (mm)', results['J-J'].outerApex, results['N-N'].outerApex, 0.1);
  // The inner cone isn't circular: N-N draws it narrower than J-J, at its base and in its angle.
  add('negative control: the inner cone circular? (1 = N-N\'s drawn apex lies over 0.2 mm nearer the front than J-J\'s: it isn\'t)', 1, results['J-J'].apex - results['N-N'].apex > 0.2 ? 1 : 0, 0);
  add('negative control: one base for both? (1 = N-N\'s drawn base over 0.2 narrower than J-J\'s)', 1, results['J-J'].base - results['N-N'].base > 0.2 ? 1 : 0, 0);
  return out;
}

/**
 * Sheet 4's MagSafe view, calibrated on its extension lines: across, the 0.00 and 26.06 lines on a row 4.5 above the
 * phone; down, the 0.00 and 112.01 lines on a column 5 left of it. The other dimensioned lines check it (43.62, 74.81
 * and 142.88 run off to the right, read on a column 75 across; 35.72 and 54.33 run down, read on a row 152.5 down).
 * Then the clear area's circle (crossings on rays from the product centre, fitted), the magnetic zone's top (43.62,
 * dimensioned, and the pill's outline's bottom in Detail D) and its arc.
 */
export function magsafeReadings(pdf = PDF): Measured[] {
  const r = magsafeView, g = render(pdf, r);
  const { out, add } = collector();
  const rowAbove = Math.round(toPx(r, [0, -4.5])[1]), rowBelow = Math.round(toPx(r, [0, 152.5])[1]);
  const colLeft = Math.round(toPx(r, [-5, 0])[0]), colRight = Math.round(toPx(r, [75, 0])[0]);
  const xAt = (row: number, m: number, c: Calibration = r) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(c, [m, 0])[0]);
  const yAt = (col: number, m: number, c: Calibration = r) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(c, [0, m])[1]);
  const pill = bump.baseFrom.mm + bump.baseSize.mm;
  const [x0, x1] = [0, pill].map((m) => xAt(rowAbove, m));
  const [y0, y1] = [0, magsafe.zoneSidesTo!.mm].map((m) => yAt(colLeft, m));
  const sx = (x1 - x0) / pill, sy = (y1 - y0) / magsafe.zoneSidesTo!.mm;
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [x0, y0] };
  const X = (px: number) => (px - cal.origin[0]) / cal.pxPerMm, Y = (px: number) => (px - cal.origin[1]) / cal.pxPerMm;
  const col = (x: number) => Math.round(toPx(cal, [x, 0])[0]);
  add('MagSafe view px/mm across (calibration: the 0.00 and 26.06 lines)', r.pxPerMm, sx, 0.05);
  add('MagSafe view px/mm down (calibration: the 0.00 and 112.01 lines)', r.pxPerMm, sy, 0.05);
  add('MagSafe view datum across (px)', r.origin[0], x0, 1);
  add('MagSafe view datum down (px)', r.origin[1], y0, 1);
  add('MagSafe view 35.72 line across, below (dimensioned PRODUCT CENTER)', magsafe.fromSide.mm, X(xAt(rowBelow, magsafe.fromSide.mm, cal)), 0.03);
  add('MagSafe view 54.33 line across, below (dimensioned: the compass)', 54.33, X(xAt(rowBelow, 54.33, cal)), 0.03);
  for (const m of [magsafe.zoneFrom!.mm, magsafe.fromTop.mm, 142.88]) add(`MagSafe view ${m.toFixed(2)} line down, right (dimensioned)`, m, Y(yAt(colRight, m, cal)), 0.03);
  const row85 = Math.round(toPx(cal, [0, 85])[1]);
  add(`the phone's width on the MagSafe view, 85 down (${body.width.mm})`, body.width.mm, X(xAt(row85, body.width.mm, cal)) - X(xAt(row85, 0, cal)), 0.05);

  // The clear area's circle: crossings within 0.25 of R28.75 on rays every 5° from the product centre, clear of the
  // centre lines (within 6° of each axis) and of the two leaders that cross it (Ø57.50's at about 152°, the clear
  // area's note's at about 319°: down is positive), keeping rays with one crossing only (a hatch line meeting the circle
  // gives two).
  const c: [number, number] = [magsafe.fromSide.mm, magsafe.fromTop.mm], R = magsafe.diameter.mm / 2;
  const P: [number, number][] = [];
  for (let a = 0; a < 360; a += 5) {
    if ([0, 90, 180, 270, 360].some((b) => Math.abs(a - b) < 6) || [152, 319].some((b) => Math.abs(a - b) < 9)) continue;
    const t = (a * Math.PI) / 180, d: [number, number] = [Math.cos(t), Math.sin(t)];
    const o = toPx(cal, c), start = (R - 1.5) * cal.pxPerMm;
    const rs = runs(g, [o[0] + d[0] * start, o[1] + d[1] * start], d, Math.round(3 * cal.pxPerMm)).map((q) => R - 1.5 + q.at / cal.pxPerMm).filter((x) => Math.abs(x - R) < 0.25);
    if (rs.length === 1) P.push([c[0] + d[0] * rs[0], c[1] + d[1] * rs[0]]);
  }
  const f = fitCircle(P);
  add(`clear area's circle: centre across (fitted to ${P.length} crossings; worst ${f.worst.toFixed(3)} off)`, magsafe.fromSide.mm, f.centre[0], 0.05);
  add('clear area\'s circle: centre down (round the product centre)', magsafe.fromTop.mm, f.centre[1], 0.05);
  add('clear area\'s circle: Ø (dimensioned 57.50)', magsafe.diameter.mm, 2 * f.radius, 0.05);

  // The zone's top, on columns 30, 50 and 60 across (right of the pill's crosshatched keepout, which ends on it too): its
  // hatch lines meet the edge from below and can merge with it, so each is the first ink down from 1 mm above, its near
  // edge plus half the pen (the 43.62 extension line's).
  const pen = runNear(g, [colRight, 0], [0, 1], g.height - 1, toPx(cal, [0, magsafe.zoneFrom!.mm])[1]).width;
  for (const x of [30, 50, 60]) {
    const from = Math.round(toPx(cal, [0, magsafe.zoneFrom!.mm - 1])[1]), q = runs(g, [col(x), from], [0, 1], Math.round(2 * cal.pxPerMm))[0];
    add(`magnetic zone's top at ${x} across (dimensioned 43.62)`, magsafe.zoneFrom!.mm, Y(from + q.at - (q.width - 1) / 2 + (pen - 1) / 2), 0.03);
  }
  add('magnetic zone\'s top is the pill\'s outline\'s bottom (Detail D: 1.34 + 42.28)', bump.baseFromTop!.mm + bump.baseHeight!.mm, magsafe.zoneFrom!.mm, 0.005);

  // Its arc: the lowest point down columns 0.75 either side of the centre line; its crossings of x = 5, 15, 56.45 and
  // 66.45 (clear of the R49.39 leader), against the circle through (0, 112.01) and (71.45, 112.01) of R49.39, its centre
  // derived.
  const zr = magsafe.zoneRadius!.mm, half = body.width.mm / 2;
  const zc = magsafe.zoneSidesTo!.mm - Math.sqrt(zr * zr - half * half);
  add(`hand calculation: the zone's arc's centre, 112.01 - √(49.39² - 35.725²) = ${zc.toFixed(3)} down, 3.10 below the product centre`, magsafe.fromTop.mm + 3.1, zc, 0.01);
  const low = mean([half - 0.75, half + 0.75].map((x) => Y(yAt(col(x), zc + zr, cal)) + (zr - Math.sqrt(zr * zr - 0.75 * 0.75))));
  add(`magnetic zone's arc, its lowest point (centre ${zc.toFixed(2)} down, derived, + R49.39)`, zc + zr, low, 0.05);
  for (const x of [5, 15, half + 20.725, half + 30.725]) {
    const at = zc + Math.sqrt(zr * zr - (x - half) ** 2);
    add(`magnetic zone's arc at x = ${x.toFixed(2)} (${at.toFixed(2)})`, at, Y(yAt(col(x), at, cal)), 0.05);
  }
  // The negative control: R49.39 centred on the product centre would bottom out 3.10 higher.
  add(`negative control: centred on the product centre, R49.39's lowest point would be ${(magsafe.fromTop.mm + zr).toFixed(2)} (1 = the drawn one is over 2 mm lower)`, 1, low - (magsafe.fromTop.mm + zr) > 2 ? 1 : 0, 0);
  return out;
}

export const remeasure = (pdf = PDF): Measured[] => {
  const seen: Phone = { ...phone, cameras: { ...phone.cameras, calibration: calibrationPoint } };
  return [
    ...family(seen, { back: detailD, front: frontView, bottom: bottomView }, pdf, {
      // The bump's sides crossed on a row and a column 14.0 in: on the pill's straight sides (from 13.78 down: 1.34 + 24.88 / 2), and just off
      // the cameras' centre line (13.62), down which the 2X 13.62 extension line runs to camera 1's centre.
      bumpScanAt: 14,
      // Its sides crossed on a row 20 down, well onto the straights: 14 down they still curve in, 0.04 inside each line.
      bumpRow: 20,
      // A column 54 across, right of the island (as the 16's, where at 16 a hatch line met the active area's top edge).
      activeColumn: 54,
      // The active area's bottom-left diagonal runs along a hatch line that starts on the arc (as the 16 Pro's).
      activeCorners: ['top-left', 'top-right', 'bottom-right'],
      // A row 1.9 toward the front: on the flat band (to 2.27), clear of the port (3.14 tall about the middle).
      bottomRow: 1.9,
      known: {
        'island length': 'not the drawing: the row through the island\'s middle runs along its dash-dot centre line, drawn over its ends, and finds a dash; islandEnds reads its ends on rows below it',
      },
    }),
    ...detailAReadings(pdf),
    ...pillEnd(pdf),
    ...islandEnds(pdf),
    ...secondRing(pdf),
    ...micReadings(pdf),
    ...sectionReadings(pdf),
    ...magsafeReadings(pdf),
  ];
};

export const hasPdf = () => existsSync(PDF);

if (import.meta.main) console.log(report(remeasure()));
