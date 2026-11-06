// Re-measures an iPhone drawing's scaled values from its PDF, and checks its calibrations on dimensioned features they
// didn't use, so each scaled value is evidence anyone can rerun. The procedures are the family's, since Apple draws
// every model on the same plan; a model's measure.ts gives the regions (its drawing.ts) and any model-specific choice.
// Whether a reading is a check or a scaled measurement comes from its Value's kind. A line drawn with a heavy pen
// hides where in its width the edge is (the iPhone 13's flash: a 0.24 mm stroke whose middle is Ø6.165 for a printed
// 6.28), so a check on one passes if the printed number falls within the stroke, and says how wide the stroke is.
//
//   Back view: the two camera centres furthest apart in each axis calibrate it; camera 1's ring checks it; then the
//   windows, the flash, the bump's sides and corners. Front view: the product's outer edges calibrate it; the glass,
//   the active area and its cutout check it; then the active area's corners and (at 4800 dpi) the receiver's slot.
//   Bottom view: the outer edges and the front and back outlines calibrate it, for its overlay.
import { circleAt, cleanCircleAt, lineNear, render, runNear, runs, toMm, toPx, type Calibration, type Region } from '../src/raster.ts';
import type { Value } from '../src/provenance.ts';
import type { Phone } from './drawing.ts';

export interface Measured {
  name: string;
  kind: 'scaled' | 'check';
  recorded: number;
  measured: number;
  /** How close they must agree, mm (or the calibration's px/mm, or px). */
  within: number;
  /** Where the drawing disagrees with its own number, and why: a finding, kept visible, not tolerated away. */
  known?: string;
}

/** Where a model's views were measured: regions of its PDF, each with the calibration measured for it. */
export interface Views {
  /** Left out where a model calibrates its back view itself (one camera gives no pair to scale it: the 16e, the Air). */
  back?: Region & Calibration;
  front: Region & Calibration;
  /** The receiver's slot at a higher resolution, in the front view's frame; left out where the slot is dimensioned. */
  receiver?: Region;
  bottom: Region & Calibration;
}

type Corner = 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left';

export interface Choices {
  /** Where the bump's sides are crossed, mm from the side and the top (default its middle). */
  bumpScanAt?: number;
  /** The row the bump's sides are crossed on, where it differs (mm from the top): on a pill's straight sides, below its ends. */
  bumpRow?: number;
  /** A row across the front view clear of the buttons and the corners, mm from the top (default 30 above the bottom). */
  frontRow?: number;
  /** A column down the front view clear of the active area's corners and its cutout, mm from the left (default 16). */
  activeColumn?: number;
  /** The active area's corners to cross on their diagonals (default all four); a model's measure.ts says why it leaves one out. */
  activeCorners?: Corner[];
  /** Likewise the bump outline's corners. */
  bumpCorners?: Corner[];
  /** A row across the bottom view toward the front, clear of the openings and on the flat side, mm (default 2.9). */
  bottomRow?: number;
  /**
   * Calibrate the bottom view across on its extension lines instead of its outline (where the outline is rounded or
   * crossed by buttons at every row): the 0.00 line and the one at `far`, along a row above the phone.
   */
  bottomExtension?: number;
  /** Checks where the drawing disagrees with its own number, by the start of their names, with the reason. */
  known?: Record<string, string>;
}

const kindOf = (v: Value): Measured['kind'] => (v.kind === 'scaled' ? 'scaled' : 'check');
const label = (what: string, v: Value) => (v.kind === 'scaled' ? what : `${what} (${v.kind} ${v.mm})`);

export function remeasure(phone: Phone, views: Views, pdf: string, choices: Choices = {}): Measured[] {
  const all = [...(views.back ? back(phone, views.back, pdf, choices) : []), ...front(phone, views, pdf, choices), ...bottom(phone, views.bottom, pdf, choices)];
  const known = Object.entries(choices.known ?? {});
  return all.map((m) => {
    const k = known.find(([start]) => m.name.startsWith(start));
    return k ? { ...m, known: k[1] } : m;
  });
}

/** Whether a reading agrees, or (for a known discrepancy) still disagrees, as recorded. */
export const holds = (m: Measured) => (Math.abs(m.measured - m.recorded) <= m.within) !== !!m.known;

function collector() {
  const out: Measured[] = [];
  const add = (name: string, kind: Measured['kind'], recorded: number, measured: number, within: number) => out.push({ name, kind, recorded, measured, within });
  // `stroke`: how wide the line is drawn (mm); `edges`: how many of its edges the reading spans (a diameter, two).
  const value = (what: string, v: Value, measured: number, within: number, stroke = 0, edges = 1) => {
    // Only a check gets the slack: a scaled value is the measurement itself, so re-measuring must reproduce it.
    const slack = v.kind === 'scaled' ? 0 : (edges * stroke) / 2;
    add(slack > within ? `${label(what, v)}; drawn ${stroke.toFixed(2)} wide` : label(what, v), kindOf(v), v.mm, measured, slack > within ? slack : within);
  };
  return { out, add, value };
}

/** On each corner's diagonal, a circular corner of radius r crosses r·(1 - 1/√2) in from its sharp corner on each axis. */
const K = 1 - Math.SQRT1_2;

function back(phone: Phone, region: Region & Calibration, pdf: string, choices: Choices): Measured[] {
  const { cameras, flash, bump } = phone;
  const g = render(pdf, region);
  const { out, add, value } = collector();
  const cams = Object.values(cameras);

  // Calibration: every camera centre found near where the recorded calibration puts it; the pair furthest apart
  // across gives the scale across, the pair furthest apart down the scale down; camera 1 the datum.
  const found = cams.map((c) => ({ c, at: circleAt(g, toPx(region, [c.fromSide.mm, c.fromTop.mm]), (c.ring.mm / 2) * region.pxPerMm) }));
  const pairs = found.flatMap((a, i) => found.slice(i + 1).map((b) => [a, b] as const));
  const widest = (k: 0 | 1) => pairs.reduce((p, q) => {
    const span = (x: typeof q) => Math.abs((k === 0 ? x[1].c.fromSide.mm - x[0].c.fromSide.mm : x[1].c.fromTop.mm - x[0].c.fromTop.mm));
    return span(q) > span(p) ? q : p;
  });
  const scale = (k: 0 | 1) => {
    const [a, b] = widest(k);
    const mm = k === 0 ? b.c.fromSide.mm - a.c.fromSide.mm : b.c.fromTop.mm - a.c.fromTop.mm;
    return (b.at.centre[k] - a.at.centre[k]) / mm;
  };
  const [sx, sy] = [scale(0), scale(1)];
  const c1 = found[0];
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [c1.at.centre[0] - c1.c.fromSide.mm * sx, c1.at.centre[1] - c1.c.fromTop.mm * sy] };
  add('px/mm across (calibration)', 'check', region.pxPerMm, sx, 0.05);
  add('px/mm down (calibration)', 'check', region.pxPerMm, sy, 0.05);
  value(`${c1.c.name} ring Ø`, c1.c.ring, c1.at.diameter / cal.pxPerMm, 0.05, c1.at.stroke / cal.pxPerMm, 2);

  const mm = (px: [number, number]) => toMm(cal, px);
  // A line across (a row at fromTop) or down (a column at fromSide), nearest its recorded position: where (mm) and how
  // wide it's drawn (mm).
  const across = (fromTop: number, expect: number) => {
    const r = runNear(g, [0, toPx(cal, [0, fromTop])[1]], [1, 0], g.width - 1, toPx(cal, [expect, 0])[0]);
    return { mm: mm([r.at, 0])[0], width: r.width / cal.pxPerMm };
  };
  const down = (fromSide: number, expect: number) => {
    const r = runNear(g, [toPx(cal, [fromSide, 0])[0], 0], [0, 1], g.height - 1, toPx(cal, [0, expect])[1]);
    return { mm: mm([0, r.at])[1], width: r.width / cal.pxPerMm };
  };

  // The windows: the innermost circles.
  for (const cam of cams) {
    const w = circleAt(g, toPx(cal, [cam.fromSide.mm, cam.fromTop.mm]), (cam.window.mm / 2) * cal.pxPerMm);
    value(`${cam.name} window Ø`, cam.window, w.diameter / cal.pxPerMm, 0.05, w.stroke / cal.pxPerMm, 2);
  }

  // The flash: its centre and its diameter.
  const f = cleanCircleAt(g, toPx(cal, [flash.fromSide.mm, flash.fromTop.mm]), (flash.diameter.mm / 2) * cal.pxPerMm);
  const [fs, ft] = mm(f.centre);
  value('flash centre from the side', flash.fromSide, fs, 0.05);
  value('flash centre from the top', flash.fromTop, ft, 0.05);
  value('flash Ø', flash.diameter, f.diameter / cal.pxPerMm, 0.05, f.stroke / cal.pxPerMm, 2);

  // The bump's outline and top: their near sides crossed along a row and a column through the bump (averaged), their
  // far sides across (along the row) and down (along the column), for a bump that isn't square.
  const b0 = bump.baseFrom.mm, bt = (bump.baseFromTop ?? bump.baseFrom).mm, t0 = bump.topFrom.mm, tt = (bump.topFromTop ?? bump.topFrom).mm;
  const [bx, by] = [b0 + bump.baseSize.mm, bt + (bump.baseHeight ?? bump.baseSize).mm];
  const [tx, ty] = [t0 + bump.topSize.mm, tt + (bump.topHeight ?? bump.topSize).mm];
  const at = choices.bumpScanAt ?? (b0 + Math.min(bx, by)) / 2;
  const row = choices.bumpRow ?? at;
  const near = (x: number) => {
    const [a, d] = [across(row, x), down(at, x)];
    return { mm: (a.mm + d.mm) / 2, width: Math.max(a.width, d.width) };
  };
  const [baseNear, topNear] = [near(b0), near(t0)];
  const [baseX, baseY, topX, topY] = [across(row, bx), down(at, by), across(row, tx), down(at, ty)];
  // An outline or top inset differently down than across is read on each axis.
  const baseSide = bump.baseFromTop ? across(row, b0) : baseNear, baseTop = bump.baseFromTop ? down(at, bt) : baseNear;
  if (bump.baseFromTop) value('bump outline from the top', bump.baseFromTop, baseTop.mm, 0.05, baseTop.width);
  value(bump.baseFromTop ? 'bump outline from the side' : 'bump outline from the side and top', bump.baseFrom, baseSide.mm, 0.05, baseSide.width);
  const topSide = bump.topFromTop ? across(row, t0) : topNear, topTop = bump.topFromTop ? down(at, tt) : topNear;
  if (bump.topFromTop) value('bump top from the top', bump.topFromTop, topTop.mm, 0.05, topTop.width);
  value(bump.topFromTop ? 'bump top from the side' : 'bump top from the side and top', bump.topFrom, topSide.mm, 0.05, topSide.width);
  value(`bump outline size${bump.baseHeight ? ' across' : ''}`, bump.baseSize, baseX.mm - baseSide.mm, 0.05, Math.max(baseSide.width, baseX.width), 2);
  if (bump.baseHeight) value('bump outline size down', bump.baseHeight, baseY.mm - baseTop.mm, 0.05, Math.max(baseTop.width, baseY.width), 2);
  value(`bump top size${bump.topHeight ? ' across' : ''}`, bump.topSize, topX.mm - topSide.mm, 0.05, Math.max(topSide.width, topX.width), 2);
  if (bump.topHeight) value('bump top size down', bump.topHeight, topY.mm - topTop.mm, 0.05, Math.max(topTop.width, topY.width), 2);

  // Corner radii, crossed on each corner's diagonal. The diagonal also crosses the extension lines of the bump's own
  // dimensions (on the iPhone 13 the 32.48 lines cross 2.64 in from the 35.12 corner, which would read as a 9.0
  // radius), so crossings where it meets one of those lines are passed over.
  const lines = [b0, bt, bx, by, t0, tt, tx, ty];
  const radius = (corner: [number, number], dir: [number, number], r: number) => {
    const length = Math.round(2.5 * r * K * cal.pxPerMm);
    const onLine = (at: number) => lines.some((l) => [0, 1].some((k) => Math.abs(corner[k] + dir[k] * (at / cal.pxPerMm) - l) * cal.pxPerMm < 4));
    const rs = runs(g, toPx(cal, corner), dir, length).filter((q) => !onLine(q.at));
    const best = rs.reduce((p, q) => (Math.abs(q.at - r * K * cal.pxPerMm) < Math.abs(p.at - r * K * cal.pxPerMm) ? q : p));
    return best.at / cal.pxPerMm / K;
  };
  const corners = (lo: number, hiX: number, hiY: number, r: number, which: Corner[] = ['top-left', 'top-right', 'bottom-right', 'bottom-left'], loY = lo) => {
    const at: Record<Corner, [[number, number], [number, number]]> = {
      'top-left': [[lo, loY], [1, 1]],
      'top-right': [[hiX, loY], [-1, 1]],
      'bottom-right': [[hiX, hiY], [-1, -1]],
      'bottom-left': [[lo, hiY], [1, -1]],
    };
    return which.map((k) => radius(at[k][0], at[k][1], r));
  };
  const baseR = corners(b0, bx, by, bump.baseRadius.mm, choices.bumpCorners, bt);
  const topR = corners(t0, tx, ty, bump.topRadius.mm, undefined, tt);
  value(`bump outline corner radius (corners ${baseR.map((r) => r.toFixed(2)).join(', ')})`, bump.baseRadius, baseR.reduce((a, b) => a + b) / baseR.length, 0.5);
  value(`bump top corner radius (corners ${topR.map((r) => r.toFixed(2)).join(', ')})`, bump.topRadius, topR.reduce((a, b) => a + b) / 4, 0.1);

  // A plateau (the 17 Pro): its bottom edge down the middle column, its bottom corners on their diagonals.
  if (phone.plateau) {
    const W = phone.body.width.mm, pl = phone.plateau;
    const edge = down(W / 2, pl.bottom.mm);
    value('plateau bottom edge from the top', pl.bottom, edge.mm, 0.05, edge.width);
    // Its inset: its side across a row half way along its straight (below the phone's corner, above its own), its top
    // down the middle column.
    const straight = (phone.body.corner.points[0][0] + pl.bottom.mm - pl.radius.mm) / 2;
    const side = across(straight, pl.inset.mm), topEdge = down(W / 2, pl.inset.mm);
    value('plateau inset from the edge (side and top)', pl.inset, (side.mm + topEdge.mm) / 2, 0.05);
    const r = pl.radius.mm;
    const cornerR = (c: [number, number], dir: [number, number]) =>
      lineNear(g, toPx(cal, c), dir, Math.round(2.5 * r * K * cal.pxPerMm), r * K * cal.pxPerMm) / cal.pxPerMm / K;
    const e = pl.inset.mm;
    const rs = [cornerR([e, pl.bottom.mm], [1, -1]), cornerR([W - e, pl.bottom.mm], [-1, -1])];
    value(`plateau bottom corner radius (corners ${rs.map((x) => x.toFixed(2)).join(', ')})`, pl.radius, (rs[0] + rs[1]) / 2, 0.2);
  }
  return out;
}

/**
 * The front view's calibration: the outer edges, across on a row clear of the buttons, down the column 4 left of the
 * middle (clear of the receiver's centre line). Exported for a model's own scans in the same frame (the 16e's receiver).
 */
export function frontCalibration(phone: Phone, region: Region & Calibration, pdf: string, choices: Choices = {}, g = render(pdf, region)) {
  const [W, L] = [phone.body.width.mm, phone.body.length.mm];
  const row = choices.frontRow ?? L - 30;
  const across = (fromTop: number, at: number) => lineNear(g, [0, toPx(region, [0, fromTop])[1]], [1, 0], g.width - 1, toPx(region, [at, 0])[0]);
  const down = (fromLeft: number, at: number) => lineNear(g, [toPx(region, [fromLeft, 0])[0], 0], [0, 1], g.height - 1, toPx(region, [0, at])[1]);
  const [left, right] = [across(row, 0), across(row, W)];
  const [top, foot] = [down(W / 2 - 4, 0), down(W / 2 - 4, L)];
  const [sx, sy] = [(right - left) / W, (foot - top) / L];
  const cal: Calibration = { pxPerMm: (sx + sy) / 2, origin: [left, top] };
  return { cal, sx, sy, row };
}

function front(phone: Phone, views: Views, pdf: string, choices: Choices): Measured[] {
  const { body, front } = phone;
  const region = views.front;
  const g = render(pdf, region);
  const { out, add, value } = collector();
  const [W, L] = [body.width.mm, body.length.mm];
  const across = (fromTop: number, at: number, c: Calibration = region) => lineNear(g, [0, toPx(c, [0, fromTop])[1]], [1, 0], g.width - 1, toPx(c, [at, 0])[0]);
  const down = (fromLeft: number, at: number, c: Calibration = region) => lineNear(g, [toPx(c, [fromLeft, 0])[0], 0], [0, 1], g.height - 1, toPx(c, [0, at])[1]);

  const { cal, sx, sy, row } = frontCalibration(phone, region, pdf, choices, g);
  add('front view px/mm across (calibration)', 'check', region.pxPerMm, sx, 0.05);
  add('front view px/mm down (calibration)', 'check', region.pxPerMm, sy, 0.05);
  const mmAcross = (px: number) => (px - cal.origin[0]) / cal.pxPerMm;
  const mmDown = (px: number) => (px - cal.origin[1]) / cal.pxPerMm;

  const gi = (W - body.glassWidth.mm) / 2, a = front.activeFromEdge.mm;
  // Widths between two lines, with how heavily they're drawn (the 15 Pro's glass edge is a 0.43 mm stroke).
  const span = (x0: number, x1: number) => {
    const [p, q] = [x0, x1].map((x) => runNear(g, [0, toPx(cal, [0, row])[1]], [1, 0], g.width - 1, toPx(cal, [x, 0])[0]));
    return { mm: (q.at - p.at) / cal.pxPerMm, stroke: Math.max(p.width, q.width) / cal.pxPerMm };
  };
  const glass = span(gi, W - gi), act = span(a, W - a);
  value('glass width', body.glassWidth, glass.mm, 0.05, glass.stroke, 2);
  value('active area width', front.activeWidth, act.mm, 0.05, act.stroke, 2);
  // The active area's top and bottom, down a column clear of the corners and of the cutout.
  const col16 = choices.activeColumn ?? 16;
  const [topRun, footRun] = [a, L - a].map((y) => runNear(g, [toPx(cal, [col16, 0])[0], 0], [0, 1], g.height - 1, toPx(cal, [0, y])[1]));
  const activeTop = mmDown(topRun.at), activeFoot = mmDown(footRun.at);
  const activeStroke = Math.max(topRun.width, footRun.width) / cal.pxPerMm;
  value('active area from the top', front.activeFromEdge, activeTop, 0.05);
  value('active area length', front.activeLength, activeFoot - activeTop, 0.05, activeStroke, 2);
  // The cutout, where there is one: its walls on a row 1.5 below the active area's top (between its two radii), its
  // bottom down the column 4 left of the middle. Its depth is from the active area's top: from the product's edge, the
  // bottom would measure the depth alone.
  if (front.notchWidth && front.notchDepth) {
    const nw = front.notchWidth.mm;
    const walls = [across(a + 1.5, (W - nw) / 2, cal), across(a + 1.5, (W + nw) / 2, cal)].map(mmAcross);
    value('notch width, wall to wall', front.notchWidth, walls[1] - walls[0], 0.05);
    add(`notch bottom from the top (${a} + ${front.notchDepth.mm}: its depth is from the active area)`, 'check', a + front.notchDepth.mm, mmDown(down(W / 2 - 4, a + front.notchDepth.mm, cal)), 0.05);
  }
  // The Dynamic Island, where there is one: its ends along the row through its middle, its top and bottom down the
  // middle column.
  if (front.islandLength && front.islandHeight && front.islandFromTop) {
    const [il, ih, it] = [front.islandLength.mm, front.islandHeight.mm, front.islandFromTop.mm];
    const ends = [across(it, (W - il) / 2, cal), across(it, (W + il) / 2, cal)].map(mmAcross);
    value('island length', front.islandLength, ends[1] - ends[0], 0.05);
    const col = toPx(cal, [W / 2, 0])[0];
    const [e0, e1] = [it - ih / 2, it + ih / 2].map((y) => runNear(g, [col, 0], [0, 1], g.height - 1, toPx(cal, [0, y])[1]));
    const stroke = Math.max(e0.width, e1.width) / cal.pxPerMm;
    const edges = [e0.at, e1.at].map(mmDown);
    value('island height', front.islandHeight, edges[1] - edges[0], 0.05, stroke, 2);
    value('island middle from the top', front.islandFromTop, (edges[0] + edges[1]) / 2, 0.05, stroke);
  }
  // The active area's corner radius, on each chosen corner's diagonal from its sharp corner. A run's middle is good to
  // half a pixel: about 0.07 mm of radius at 23 px/mm.
  const r = front.activeRadius.mm;
  const diagonals: Record<Corner, [[number, number], [number, number]]> = {
    'top-left': [[a, a], [1, 1]],
    'top-right': [[W - a, a], [-1, 1]],
    'bottom-right': [[W - a, L - a], [-1, -1]],
    'bottom-left': [[a, L - a], [1, -1]],
  };
  const radii = (choices.activeCorners ?? ['top-left', 'top-right', 'bottom-right', 'bottom-left']).map((k) => {
    const [c, dir] = diagonals[k];
    return lineNear(g, toPx(cal, c), dir, Math.round(2 * r * K * cal.pxPerMm), r * K * cal.pxPerMm) / cal.pxPerMm / K;
  });
  value(`active area corner radius (corners ${radii.map((x) => x.toFixed(2)).join(', ')})`, front.activeRadius, radii.reduce((s, x) => s + x) / radii.length, 0.1);

  // The receiver's slot, in the same frame at the receiver region's resolution: its end strokes on the row through its
  // middle; across, the white inside it, widened by half the end strokes' width (its top stroke merges with the glass
  // edge's, its bottom with its cutout's).
  const rv = views.receiver;
  if (!rv || !front.receiverLength || !front.receiverHeight || !front.receiverFromTop) return out;
  const rg = render(pdf, rv);
  const f = rv.dpi / region.dpi;
  const rc: Calibration = {
    pxPerMm: cal.pxPerMm * f,
    origin: [(cal.origin[0] + region.crop.x) * f - rv.crop.x, (cal.origin[1] + region.crop.y) * f - rv.crop.y],
  };
  const mid = toPx(rc, [W / 2, front.receiverFromTop.mm]);
  const rl = front.receiverLength.mm;
  const ends = [toPx(rc, [W / 2 - rl / 2, 0])[0], toPx(rc, [W / 2 + rl / 2, 0])[0]];
  const slotRow = runs(rg, [0, Math.round(mid[1])], [1, 0], rg.width - 1);
  const [e0, e1] = ends.map((x) => slotRow.reduce((p, q) => (Math.abs(q.at - x) < Math.abs(p.at - x) ? q : p)));
  const strokeMm = (e0.width + e1.width) / 2 / rc.pxPerMm;
  value('receiver slot length', front.receiverLength, (e1.at - e0.at) / rc.pxPerMm, 0.05, strokeMm, 2);
  const half = (e0.width + e1.width) / 4;
  const col = runs(rg, [Math.round(mid[0]) - 200, 0], [0, 1], rg.height - 1);
  const above = col.filter((q) => q.at < mid[1]).at(-1)!, below = col.find((q) => q.at > mid[1])!;
  const [s0, s1] = [above.at + above.width / 2 - half, below.at - below.width / 2 + half];
  value('receiver slot height', front.receiverHeight, (s1 - s0) / rc.pxPerMm, 0.05, strokeMm, 2);
  value('receiver slot middle from the top', front.receiverFromTop, ((s0 + s1) / 2 - rc.origin[1]) / rc.pxPerMm, 0.05);
  return out;
}

/**
 * The bottom view's calibration (for its overlay in check.ts): the outer edges across, on a row clear of the
 * openings (or the extension lines from 0 to `bottomExtension`); the front and back outlines down, whose middle is the
 * datum. The views draw the phone a little thinner than dimensioned (the 13 mini's 7.57 for 7.65): the outlines may be
 * the frame's edges rather than the glass. Exported for a model's own scans in the same frame (the 16e's hole centres).
 */
export function bottomCalibration(phone: Phone, c: Region & Calibration, pdf: string, choices: Choices = {}, g = render(pdf, c)) {
  const W = phone.body.width.mm, T = phone.body.thickness.mm;
  const row = Math.round(toPx(c, [0, -(choices.bottomRow ?? 2.9)])[1]); // toward the front: above the holes and the port
  const ext = choices.bottomExtension;
  const lineRow = Math.round(toPx(c, [0, -(T / 2 + 1.5)])[1]); // 1.5 beyond the front outline: only extension lines
  const [left, right] = ext
    ? [0, ext].map((x) => lineNear(g, [0, lineRow], [1, 0], g.width - 1, toPx(c, [x, 0])[0]))
    : [0, W].map((x) => lineNear(g, [0, row], [1, 0], g.width - 1, toPx(c, [x, 0])[0]));
  const px = (right - left) / (ext ?? W);
  // A column between the port's far screw and the first hole beyond it.
  const after = phone.bottom.holes.map((h) => h.mm).filter((h) => h > phone.bottom.screws.at(-1)!.mm);
  const col = Math.round(toPx(c, [(phone.bottom.screws.at(-1)!.mm + (after[0] ?? W)) / 2, 0])[0]);
  const [frontLine, backLine] = [-T / 2, T / 2].map((y) => lineNear(g, [col, 0], [0, 1], g.height - 1, toPx(c, [0, y])[1]));
  const cal: Calibration = { pxPerMm: px, origin: [left, (frontLine + backLine) / 2] };
  return { cal, px, left, frontLine, backLine };
}

function bottom(phone: Phone, c: Region & Calibration, pdf: string, choices: Choices): Measured[] {
  const { out, add } = collector();
  const T = phone.body.thickness.mm;
  const { px, left, frontLine, backLine } = bottomCalibration(phone, c, pdf, choices);
  add('bottom view px/mm across (calibration)', 'check', c.pxPerMm, px, 0.05);
  add('bottom view datum across: the volume-button edge (px)', 'check', c.origin[0], left, 1);
  add('bottom view datum down: mid-thickness (px)', 'check', c.origin[1], (frontLine + backLine) / 2, 1);
  // The bottom views draw the phone thinner than dimensioned: the 13s by 0.08, the 15 Pro by 0.13 (8.12 for 8.25).
  add(`bottom view thickness as drawn (dimensioned ${T}; the views draw it up to 0.15 thinner)`, 'check', T, (backLine - frontLine) / px, 0.15);
  return out;
}

/** The table measure.ts prints: ✓ or ✗, what, recorded, measured, the difference. */
export function report(ms: Measured[]): string {
  return ms
    .map((m) => {
      const d = Math.abs(m.measured - m.recorded) < 5e-4 ? 0 : m.measured - m.recorded;
      const mark = m.known ? (holds(m) ? '≠' : '✗') : holds(m) ? '✓' : '✗';
      return `${mark} ${m.kind.padEnd(7)} ${m.name.padEnd(70)} recorded ${m.recorded.toFixed(3).padStart(7)}  measured ${m.measured.toFixed(3).padStart(7)}  Δ ${d >= 0 ? '+' : ''}${d.toFixed(3)} (±${+m.within.toFixed(3)})${m.known ? `  known: ${m.known}` : ''}`;
    })
    .join('\n');
}
