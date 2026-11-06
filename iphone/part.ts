// The iPhone family's shared builder: a model's drawing (drawing.ts, the shape every model's own drawing.ts fills) as
// an LDraw part and a features file. Every model is drawn on the same plan, so one builder serves them all.
//
// The part's frame: origin at the product centre (mid-width, mid-length, mid-thickness); -Y out of the screen, +Y out of
// the back; +X toward the side-button edge; +Z toward the top (receiver) end. So the phone lies screen up, as on a desk,
// and its camera looks down along +Y. LDraw is right-handed: from the front, +X is the phone's right.
//
// What the geometry leaves out or approximates (each is named where it's made): the bump's fillet is a straight slope
// from its outline to its top; the lens windows are drawn flush with the rings, since the drawing gives no depth for
// them; the buttons are flat-faced stadiums and the ring/silent switch a block the size of its pocket; the holes, the
// port and the receiver are recessed to depths the drawing doesn't give (assumed, in each drawing.ts); the SIM tray and
// the screws are outlines only; the antenna lines and the rear mic aren't modelled.
import { circle, inset, monotone } from '../src/curves.ts';
import type { V3 } from '../src/geom.ts';
import { at, Dat, LDU_PER_MM } from '../src/ldraw.ts';
import { describe, type Value } from '../src/provenance.ts';
import type { Button, Camera, Disc, Phone } from './drawing.ts';

export { LDU_PER_MM };

type P2 = [number, number];

/** Who the parts are by, as their headers say it. */
export const AUTHOR = { name: 'Matt Prindible', username: 'mattprindible' };

const COLOUR = { body: 16, screen: 0, display: 0, ring: 72, window: 0, flash: 15, opening: 0, grille: 72 };

/** An arc about c from angle a0 to a1 (degrees), both ends included. */
function arc(c: P2, r: number, a0: number, a1: number, n: number): P2[] {
  return Array.from({ length: n + 1 }, (_, i): P2 => {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
  });
}

/** A stadium centred on c, `length` along its first axis and `width` across, its ends round: `n` segments an end. */
export function stadium(c: P2, length: number, width: number, n = 8): P2[] {
  const r = width / 2, s = length / 2 - r;
  const pts = [...arc([c[0] + s, c[1]], r, -90, 90, n), ...arc([c[0] - s, c[1]], r, 90, 270, n)];
  // A stadium as long as it is wide is a circle: its two arcs meet at points they share.
  return pts.filter((p, i) => Math.hypot(p[0] - pts[(i + 1) % pts.length][0], p[1] - pts[(i + 1) % pts.length][1]) > 1e-9);
}

/** The builder for one model: its geometry, its part and its features, from its drawing. */
export function iphone(phone: Phone) {
  const { part, details, body, bottom, bump, buttons, cameras, flash, front, image, connector, mass, simTray } = phone;
  const W = body.width.mm;
  const L = body.length.mm;
  const T = body.thickness.mm;
  const BACK = T / 2;
  const FRONT = -T / 2;

  /** A point on the back, in the back view's coordinates (from the side-button edge, from the top), as (X, Z) in the part's frame (mm). */
  function onBack(fromSide: number, fromTop: number): P2 {
    return [W / 2 - fromSide, L / 2 - fromTop];
  }

  /**
   * The plan outline (X, Z), one loop round the four corners, from the corner profile's points (the same at every corner).
   * Between the drawing's points the curve is a monotone cubic (an assumption: the drawing gives seven points, not the
   * curve), each half from its own points: tangent to the edge at its end, at 45° at the diagonal point (2.93, 2.94).
   */
  function outline(): P2[] {
    const pts = body.corner.points; // (fromSide, fromTop), from the top edge round to the side edge
    const mid = pts.findIndex(([s, t]) => Math.abs(s - t) < 0.05);
    // From the diagonal to the top edge: fromTop as a function of fromSide; the other half the same with the axes swapped.
    const topHalf = monotone(pts.slice(0, mid + 1).reverse(), -1, 0, 4).reverse();
    const sideHalf = monotone(pts.slice(mid).map(([s, t]): P2 => [t, s]), -1, 0, 4).map(([t, s]): P2 => [s, t]);
    const quarter = [...topHalf, ...sideHalf.slice(1)];
    const corner = (sx: number, sz: number, reverse: boolean) => {
      const pts = quarter.map(([s, t]): P2 => [sx * (W / 2 - s), sz * (L / 2 - t)]);
      return reverse ? pts.reverse() : pts;
    };
    return [...corner(1, 1, false), ...corner(1, -1, true), ...corner(-1, -1, false), ...corner(-1, 1, true)];
  }

  /** A rounded rectangle on the back, in the back view's coordinates, as (X, Z): `n` segments a corner. */
  function roundedRect(side0: number, top0: number, side1: number, top1: number, r: number, n = 12): P2[] {
    const out: P2[] = [];
    const corners: [number, number, number][] = [
      [side0 + r, top0 + r, Math.PI], // the camera corner (nearest the side-button edge and the top)
      [side1 - r, top0 + r, 1.5 * Math.PI],
      [side1 - r, top1 - r, 0],
      [side0 + r, top1 - r, 0.5 * Math.PI],
    ];
    for (const [cs, ct, a0] of corners)
      for (let i = 0; i <= n; i++) {
        const a = a0 + (i / n) * (Math.PI / 2);
        out.push(onBack(cs + r * Math.cos(a), ct + r * Math.sin(a)));
      }
    // A radius of half the width (a stadium, the 16's pill) meets the next corner with no straight between: one point.
    return out.filter((p, i) => Math.hypot(p[0] - out[(i + 1) % out.length][0], p[1] - out[(i + 1) % out.length][1]) > 1e-9);
  }

  /** The bump's outline and top as roundedRect's arguments: (from the side, from the top) to (far side, bottom), radius. */
  function bumpRects(): [number, number, number, number, number][] {
    const b = bump;
    const b0 = b.baseFrom.mm, bt = (b.baseFromTop ?? b.baseFrom).mm, t0 = b.topFrom.mm, tt = (b.topFromTop ?? b.topFrom).mm;
    return [
      [b0, bt, b0 + b.baseSize.mm, bt + (b.baseHeight ?? b.baseSize).mm, b.baseRadius.mm],
      [t0, tt, t0 + b.topSize.mm, tt + (b.topHeight ?? b.topSize).mm, b.topRadius.mm],
    ];
  }

  /**
   * The bump's flank, where it isn't a straight slope: a ring at each of its profile's points, from the top to the
   * outline, each a rounded rectangle between theirs in proportion to how far out it is (the profile's run is the
   * bottom's, top to outline), with its height above the back glass.
   */
  function flankRings(): { ring: P2[]; h: number }[] {
    const f = bump.flank!;
    const [base, top] = bumpRects();
    const run = base[3] - top[3];
    const [o1, h1] = f.points.at(-1)!;
    if (f.points[0][0] !== 0 || f.points[0][1] !== bump.top.mm || h1 !== 0 || Math.abs(o1 - run) > 0.01)
      throw new Error(`${part.title}: the bump's flank must run from (0, ${bump.top.mm}) to (${run.toFixed(2)}, 0), the top's bottom edge to the outline's`);
    const rings = f.points.map(([o, h]) => {
      const t = o / o1;
      const r = top.map((v, k) => v + t * (base[k] - v)) as [number, number, number, number, number];
      return { ring: roundedRect(...r), h };
    });
    if (rings.some((r) => r.ring.length !== rings[0].ring.length)) throw new Error(`${part.title}: the bump's flank rings must be stadiums alike, or none`);
    return rings;
  }

  /** The bump's outline on the back glass and its flat top, as (X, Z) rings. */
  function bumpRings(): { base: P2[]; top: P2[] } {
    const [base, top] = bumpRects();
    const rings = { base: roundedRect(...base), top: roundedRect(...top) };
    // The slope between them pairs their points, so they must be stadiums alike (or neither).
    if (rings.base.length !== rings.top.length) throw new Error(`${part.title}: the bump's outline and top must both be stadiums, or neither`);
    return rings;
  }

  /**
   * The display's active area on the front, as (X, Z): a rounded rectangle, counter-clockwise, with its cutout (the
   * notch) let into the top edge where it has one: the cutout's walls run straight between its top radius (leaving
   * the top edge) and its bottom radius (its bottom corners).
   */
  function activeArea(): P2[] {
    const f = front;
    const [x1, zt] = [f.activeWidth.mm / 2, L / 2 - f.activeFromEdge.mm];
    const zb = zt - f.activeLength.mm;
    const R = f.activeRadius.mm;
    const notch = (): P2[] => {
      if (!f.notchWidth) return [];
      const [w, rt, rb] = [f.notchWidth.mm / 2, f.notchTopRadius!.mm, f.notchBottomRadius!.mm];
      const zn = zt - f.notchDepth!.mm;
      return [
        ...arc([w + rt, zt - rt], rt, 90, 180, 4),
        ...arc([w - rb, zn + rb], rb, 0, -90, 8),
        ...arc([-w + rb, zn + rb], rb, -90, -180, 8),
        ...arc([-w - rt, zt - rt], rt, 0, 90, 4),
      ];
    };
    const pts = [
      ...arc([x1 - R, zb + R], R, -90, 0, 12),
      ...arc([x1 - R, zt - R], R, 0, 90, 12),
      ...notch(),
      ...arc([-x1 + R, zt - R], R, 90, 180, 12),
      ...arc([-x1 + R, zb + R], R, 180, 270, 12),
    ];
    return pts.filter((p, i) => Math.hypot(p[0] - pts[(i + 1) % pts.length][0], p[1] - pts[(i + 1) % pts.length][1]) > 1e-9);
  }

  /** The Dynamic Island, where there is one: a pill inside the active area, as (X, Z). */
  const island = (): P2[] | null =>
    front.islandLength ? stadium([0, L / 2 - front.islandFromTop!.mm], front.islandLength.mm, front.islandHeight!.mm, 12) : null;

  /** The receiver's slot on the front, as (X, Z). */
  const receiverSlot = (): P2[] | null =>
    front.receiverLength ? stadium([0, L / 2 - front.receiverFromTop!.mm], front.receiverLength.mm, front.receiverHeight!.mm) : null;

  /** A button's outline on its side, as (Z, Y), and the side's X (the volume side is -X). */
  function buttonOutline(b: Button): { ring: P2[]; x: number; out: number } {
    const out = b.side === 'volume' ? -1 : 1;
    const ring = stadium([L / 2 - b.centre.mm, BACK - b.fromBack.mm], 2 * b.half.mm, b.width.mm);
    return { ring, x: (out * W) / 2, out };
  }

  /** The bottom edge's openings, as (X, Y) on its face: the holes, the Lightning port, the screws' outlines. */
  function bottomOpenings(): { holes: P2[][]; port: P2[]; screws: P2[][] } {
    const b = bottom;
    const x = (fromVolumeEdge: number) => fromVolumeEdge - W / 2;
    const holes = b.holes.map((h) => circle([x(h.mm), BACK - b.holesFromBack.mm], b.holeDiameter.mm / 2, 16));
    const port = stadium([x((b.portFrom.mm + b.portTo.mm) / 2), BACK - connector.fromBack.mm], b.portTo.mm - b.portFrom.mm, b.portHeight.mm);
    const screws = b.screws.map((s) => circle([x(s.mm), BACK - b.screwsFromBack.mm], b.screwDiameter.mm / 2, 16));
    return { holes, port, screws };
  }


  /** Heights (Y, mm) of the back's features. */
  const heights = {
    backGlass: BACK,
    bumpTop: BACK + bump.top.mm,
    rings: BACK + bump.rings.mm,
    flash: flash.onGlass ? BACK : BACK + bump.top.mm,
  };

  /** The rear mic's height: the bump's top if its centre is within the top's outline (or on a plateau), the back glass if outside the bump's. */
  function micHeight(): number {
    const m = phone.rearMic!;
    const c = onBack(m.fromSide.mm, m.fromTop.mm);
    const within = (ring: P2[]) => ring.reduce((odd, p, i) => {
      const q = ring[(i + 1) % ring.length];
      return (p[1] > c[1]) !== (q[1] > c[1]) && c[0] < p[0] + ((c[1] - p[1]) / (q[1] - p[1])) * (q[0] - p[0]) ? !odd : odd;
    }, false);
    const { base, top } = bumpRings();
    if (phone.plateau || within(top)) return BACK + bump.top.mm;
    if (!within(base)) return BACK;
    throw new Error(`${part.title}: the rear mic's centre is on the bump's slope`);
  }

  function build(): { dat: string; features: object } {
    const d = new Dat();
    const plan = outline();
    const glassInset = (W - body.glassWidth.mm) / 2; // 1.05; the length gives the same, (131.50 - 129.40) / 2

    // The body: the plan outline lofted through the edge profile, front to back, with the glass on each face
    // as the outline moved in to the glass's size (an assumption: the drawing gives the glass's size, not its corner).
    d.comment(`body: ${details.corner} corner, ${details.edge} edge profile, glass faces ${glassInset.toFixed(2)} in`);
    const profile = body.edge.points;
    // The back may round differently from the front (the 17 Pro's: to 3.79 in against 2.61).
    const backProfile = body.edgeBack?.points ?? profile;
    // Each face: where the profile stops short of the glass's edge (the 13s, the 15 Pro), the glass stands on it as a
    // step; where it runs past (the 16 Pro: rounding to 2.41 in, the glass's edge 1.00 in, on the curve), the face
    // starts at the profile's first point within 0.1 of the full thickness (the 16 Pro's 1.47 in at 4.10, the 17 Pro's
    // 1.20 at 4.29: the glass's last rise is drawn flat, and the display lies wholly on the face).
    const half = (pts: [number, number][]) => {
      const step = pts.at(-1)![0] < glassInset;
      if (step) return { step, faceToMid: [[glassInset, T / 2], [glassInset, pts.at(-1)![1]], ...[...pts].reverse()] as [number, number][] };
      const k = pts.findIndex(([, h]) => T / 2 - h <= 0.1);
      const curve = pts.slice(0, k + 1).map(([i, h], n): [number, number] => (n === k ? [i, T / 2] : [i, h]));
      return { step, faceToMid: [...curve].reverse() };
    };
    const [frontHalf, backHalf] = [half(profile), half(backProfile)];
    const [frontStep, backStep] = [frontHalf.step, backHalf.step];
    const stations: [number, number][] = [
      ...frontHalf.faceToMid.map(([i, h]): [number, number] => [i, -h]),
      ...[...backHalf.faceToMid].reverse(),
    ];
    const rings = stations.map(([i]) => (i === 0 ? plan : inset(plan, i)));
    // The flat band round the sides (the edge profile's straight middle) carries the bottom edge's openings: its stretch
    // along the bottom is a face of its own (below), the rest quads as elsewhere.
    const flat = stations.findIndex(([, h], s) => h < 0 && stations[s + 1]?.[1] > 0);
    // How far along the bottom its openings reach from the middle: the face must run past them.
    const reach = Math.max(...[...bottomOpenings().holes.flat(), ...bottomOpenings().port].map((p) => Math.abs(p[0])));
    const floor = bottomFace(plan, L, reach);
    // The face along the bottom spans the flat band, and further onto the nearly flat rounding where an opening is
    // taller than the band (the 17 Pro's 3.14 port on a band from -1.50 to 1.44: to -2.99 and 2.86, insets 0.15
    // and 0.17; the openings are drawn on the flat side's plane).
    const ys = [...bottomOpenings().holes.flat(), ...bottomOpenings().port].map((p) => p[1]);
    let [fa, fb] = [flat, flat + 1];
    while (stations[fa][1] > Math.min(...ys) - 0.05 && fa > 0) fa--;
    while (stations[fb][1] < Math.max(...ys) + 0.05 && fb < stations.length - 1) fb++;
    for (let s = 0; s < stations.length - 1; s++) {
      if (s < fa || s >= fb) {
        d.band(s === 0 && frontStep ? COLOUR.screen : COLOUR.body, rings[s], stations[s][1], rings[s + 1], stations[s + 1][1]);
        continue;
      }
      const [r0, r1] = [rings[s], rings[s + 1]];
      for (let i = 0; i < plan.length; i++) {
        const j = (i + 1) % plan.length;
        if (floor.segments.has(i)) continue;
        d.quad(COLOUR.body, at(r0[i], stations[s][1]), at(r0[j], stations[s][1]), at(r1[j], stations[s + 1][1]), at(r1[i], stations[s + 1][1]));
      }
    }
    d.cap(COLOUR.body, rings.at(-1)!, BACK);
    // Hard edges at the profile's first points (±2.63), where the drawings draw them, even on a Pro whose flat runs on
    // to ±3.06.
    // Hard edges at the flat band's edges, except across a bottom face that runs past them.
    for (const [h, onFace] of [[-profile[0][1], fa < flat], [backProfile[0][1], fb > flat + 1]] as [number, boolean][])
      for (let i = 0; i < plan.length; i++) if (!(onFace && floor.segments.has(i))) d.edge(at(plan[i], h), at(plan[(i + 1) % plan.length], h));
    // The glass's edge and its step down to the frame: hard edges. Where the profile runs smoothly onto the faces there's
    // no edge to draw (the rungs' conditional lines give the curve its outline).
    if (frontStep) d.loop(rings[0], FRONT);
    if (backStep) d.loop(rings.at(-1)!, BACK);
    if (frontStep) d.loop(rings[1], stations[1][1]);
    if (backStep) d.loop(rings.at(-2)!, stations.at(-2)![1]);
    // Conditional lines where the body is smooth: up every rung (round the corners), and round the rings inside the edge
    // profile's curve, so its outline shows from any side.
    const ring3 = (s: number) => rings[s].map((p) => at(p, stations[s][1]));
    for (let s = 0; s < stations.length - 1; s++) d.rungs(ring3(s), ring3(s + 1));
    stations.forEach(([i, h], s) => {
      const inCurve = (h < 0 ? profile : backProfile).some(([pi, ph], k) => k > 0 && pi === i && Math.abs(ph) === Math.abs(h));
      // The faces' own stations aren't in the curve, even where a face point is the profile's last (the 15's 3.905).
      if (!inCurve || s === 0 || s === stations.length - 1) return;
      const [r, below, above] = [ring3(s), ring3(s - 1), ring3(s + 1)];
      for (let k = 0; k < r.length; k++) d.cond(r[k], r[(k + 1) % r.length], below[k], above[k]);
    });

    // The front: the glass round the display (the bezel, with the notch) and the active area, one plane, split along the
    // active area's outline; the receiver's slot let into the bezel.
    d.comment('front: display active area and its cutout (front view), receiver slot (scaled)');
    const active = activeArea();
    const slot = receiverSlot();
    d.region(COLOUR.screen, rings[0], slot ? [active, slot] : [active], (p) => at(p, FRONT));
    const pill = island();
    d.region(COLOUR.display, active, pill ? [pill] : [], (p) => at(p, FRONT));
    d.loop(active, FRONT);
    if (pill) {
      d.region(COLOUR.screen, pill, [], (p) => at(p, FRONT));
      d.loop(pill, FRONT);
    }
    if (slot) recess(d, slot.map((p) => at(p, FRONT)), [0, front.receiverDepth!.mm, 0], COLOUR.screen, COLOUR.grille);

    // The bottom edge: the flat band's stretch along it, with the holes and the port recessed into it.
    d.comment(`bottom edge: Ø${bottom.holeDiameter.mm} holes, ${connector.name} port (bottom view, ${details.port}), screws outlined`);
    const open = bottomOpenings();
    const onBottom = (p: P2): V3 => [p[0], p[1], -L / 2];
    // Its outline: along the bottom at the lowest station, up the far end through the stations between, back along
    // the top station, and down the near end.
    const idx = floor.points.map((p) => plan.indexOf(p));
    const atS = (s: number, i: number) => at(rings[s][i], stations[s][1]);
    const outer: V3[] = [
      ...idx.map((i) => atS(fa, i)),
      ...Array.from({ length: fb - fa - 1 }, (_, k) => atS(fa + 1 + k, idx.at(-1)!)),
      ...[...idx].reverse().map((i) => atS(fb, i)),
      ...Array.from({ length: fb - fa - 1 }, (_, k) => atS(fb - 1 - k, idx[0])),
    ];
    d.region(COLOUR.body, outer.map((p): P2 => [p[0], p[1]]), [...open.holes, open.port], (p, i) => (i < outer.length ? outer[i] : onBottom(p)));
    for (const h of open.holes) recess(d, h.map(onBottom), [0, 0, bottom.holeDepth.mm], COLOUR.body, COLOUR.opening);
    recess(d, open.port.map(onBottom), [0, 0, bottom.portDepth.mm], COLOUR.body, COLOUR.opening);
    for (const sc of open.screws) d.loopV(sc.map(onBottom));

    // The buttons, standing proud of the long sides; the SIM tray outlined, flush.
    for (const [name, b] of Object.entries(buttons)) {
      d.comment(`${name} button: ${(2 * b.half.mm).toFixed(2)} x ${b.width.mm}, ${b.proud.mm} proud (side views, front view)`);
      const { ring, x, out } = buttonOutline(b);
      const base = ring.map(([z, y]): V3 => [x, y, z]);
      const top = ring.map(([z, y]): V3 => [x + out * b.proud.mm, y, z]);
      const c = ring.reduce((a, p) => [a[0] + p[0] / ring.length, a[1] + p[1] / ring.length], [0, 0]);
      d.inside = [x + (out * b.proud.mm) / 2, c[1], c[0]];
      d.bandV(COLOUR.body, base, top);
      d.rungs(base, top);
      d.region(COLOUR.body, ring, [], (_, i) => top[i]);
      d.loopV(base);
      d.loopV(top);
    }
    d.inside = [0, 0, 0];
    if (simTray) {
      d.comment(`SIM tray: ${simTray.length.mm} x ${simTray.width.mm}, flush (left side view)`);
      d.loopV(stadium([L / 2 - simTray.centre.mm, BACK - simTray.fromBack.mm], simTray.length.mm, simTray.width.mm).map(([z, y]): V3 => [-W / 2, y, z]));
    }

    // Camera Control, flush in the side-button side: outlined, with the edge of the chamfer round it (its 0.18 groove
    // isn't modelled; where the outline runs past the flat side onto the rounding it stands off it by under 0.03).
    if (phone.cameraControl) {
      const cc = phone.cameraControl;
      d.comment(`Camera Control: ${(2 * cc.half.mm).toFixed(2)} x ${cc.width.mm}, flush, its chamfer ${cc.chamfer.mm} wide (outlines)`);
      const c: P2 = [L / 2 - cc.centre.mm, BACK - cc.fromBack.mm];
      const ring = (grow: number) => stadium(c, 2 * cc.half.mm + 2 * grow, cc.width.mm + 2 * grow).map(([z, y]): V3 => [W / 2, y, z]);
      d.loopV(ring(0));
      d.loopV(ring(cc.chamfer.mm));
    }

    if (phone.plateau) {
      // A plateau across the top of the back (the 17 Pro): its side walls rise straight from where the flat side ends,
      // then round over as the back's edge does, raised by its height (an assumption: the drawing gives its height and
      // outline, not its edge). Its walls run down inside the body, unseen; the camera area is outlined on its top.
      const pl = phone.plateau;
      d.comment(`camera plateau: ${pl.height.mm} above the back plate, ${pl.inset.mm} in from the edge, to ${pl.bottom.mm} from the top (R${pl.radius.mm}); camera area outlined (${details.back})`);
      const q = plan.length / 4;
      const [zb, r, e] = [L / 2 - pl.bottom.mm, pl.radius.mm, pl.inset.mm];
      // The phone's outline moved in by the plateau's inset, its top two corners kept, closed by the plateau's bottom
      // edge with its rounded corners.
      const moved = inset(plan, e);
      const outlinePl: P2[] = [
        ...moved.slice(0, q),
        ...arc([W / 2 - e - r, zb + r], r, 0, -90, 12).slice(1),
        ...arc([-W / 2 + e + r, zb + r], r, -90, -180, 12).slice(0, -1),
        ...moved.slice(3 * q),
      ];
      const lift = pl.height.mm;
      const top = BACK + lift;
      const rest = backProfile.slice(1).map(([i, h]): [number, number] => [i, h + lift]);
      const k = rest.findIndex(([, h]) => top - h <= 0.1);
      const st: [number, number][] = [[0, backProfile[0][1]], [0, backProfile[0][1] + lift], ...rest.slice(0, k), [rest[k][0], top]];
      const pr = st.map(([i]) => (i === 0 ? outlinePl : inset(outlinePl, i)));
      d.inside = [0, (backProfile[0][1] + top) / 2, (zb + L / 2) / 2];
      for (let n = 0; n < st.length - 1; n++) {
        d.band(COLOUR.body, pr[n], st[n][1], pr[n + 1], st[n + 1][1]);
        d.rungs(pr[n].map((p) => at(p, st[n][1])), pr[n + 1].map((p) => at(p, st[n + 1][1])));
      }
      d.cap(COLOUR.body, pr.at(-1)!, top);
      d.loop(bumpRings().base, heights.bumpTop);
      d.loop(bumpRings().top, heights.bumpTop);
    } else {
      // The bump: its outline on the back glass, sloping to its flat top (the fillet, approximated as a slope).
      d.comment(`camera bump: ${details.back} outline and top, side view heights`);
      const { base, top } = bumpRings();
      const t0 = bump.topFrom.mm, tt = (bump.topFromTop ?? bump.topFrom).mm;
      const centre = onBack(t0 + bump.topSize.mm / 2, tt + (bump.topHeight ?? bump.topSize).mm / 2);
      if (bump.flank) {
        // A curved flank: bands between its rings, faced away from a point in the body below (a concave flank's
        // nearly flat foot would face the bump's middle otherwise), smooth across each ring between.
        const st = flankRings().map(({ ring, h }) => ({ ring, y: heights.backGlass + h }));
        d.inside = at(centre, heights.backGlass - 1);
        for (let n = 0; n < st.length - 1; n++) {
          d.band(COLOUR.body, st[n].ring, st[n].y, st[n + 1].ring, st[n + 1].y);
          d.rungs(st[n].ring.map((p) => at(p, st[n].y)), st[n + 1].ring.map((p) => at(p, st[n + 1].y)));
        }
        for (let n = 1; n < st.length - 1; n++) {
          const [r, above, below] = [n, n - 1, n + 1].map((k) => st[k].ring.map((p) => at(p, st[k].y)));
          for (let k = 0; k < r.length; k++) d.cond(r[k], r[(k + 1) % r.length], above[k], below[k]);
        }
      } else {
        d.inside = at(centre, (heights.backGlass + heights.bumpTop) / 2);
        d.band(COLOUR.body, base, heights.backGlass, top, heights.bumpTop);
        d.rungs(base.map((p) => at(p, heights.backGlass)), top.map((p) => at(p, heights.bumpTop)));
      }
      d.cap(COLOUR.body, top, heights.bumpTop);
      d.loop(base, heights.backGlass);
      d.loop(top, heights.bumpTop);
    }

    // The lens rings up to the camera plateau, each with its window drawn flush on top.
    for (const cam of Object.values(cameras)) {
      d.comment(`${cam.name}: Ø${cam.ring.mm} ring to ${bump.rings.mm} above the back glass`);
      const c = onBack(cam.fromSide.mm, cam.fromTop.mm);
      const ring = circle(c, cam.ring.mm / 2);
      const win = circle(c, cam.window.mm / 2);
      d.inside = at(c, (heights.bumpTop + heights.rings) / 2);
      d.band(COLOUR.ring, ring, heights.bumpTop, ring, heights.rings);
      d.rungs(ring.map((p) => at(p, heights.bumpTop)), ring.map((p) => at(p, heights.rings)));
      d.band(COLOUR.ring, ring, heights.rings, win, heights.rings);
      d.cap(COLOUR.window, win, heights.rings);
      d.loop(ring, heights.rings);
      d.loop(win, heights.rings);
    }

    // The flash, flush on the bump's top, or the back glass beside it (lifted 0.02 mm so the two faces don't fight in a
    // render).
    d.comment(`flash: Ø${flash.diameter.mm}${flash.onGlass ? ', on the back glass' : ''}`);
    const fl = circle(onBack(flash.fromSide.mm, flash.fromTop.mm), flash.diameter.mm / 2);
    d.inside = at(onBack(flash.fromSide.mm, flash.fromTop.mm), heights.backGlass);
    d.cap(COLOUR.flash, fl, heights.flash + 0.02);
    d.loop(fl, heights.flash + 0.02);

    // The rear mic, flush on whichever its centre lies on: the bump's top (or the plateau), or the back glass outside
    // the bump's outline.
    if (phone.rearMic) {
      const m = phone.rearMic;
      d.comment(`rear mic: Ø${m.diameter.mm}`);
      const c = onBack(m.fromSide.mm, m.fromTop.mm);
      const mic = circle(c, m.diameter.mm / 2);
      d.inside = at(c, heights.backGlass);
      d.cap(COLOUR.opening, mic, micHeight() + 0.02);
      d.loop(mic, micHeight() + 0.02);
    }

    // A sensor's window (a Pro's LiDAR), flush on the bump's top likewise, where the drawing gives one.
    if (phone.sensor?.window) {
      const sn = phone.sensor, w = sn.window!;
      d.comment(`${sn.name}: ${w.width.mm} x ${w.length.mm} window${w.radius ? ` (R${w.radius.mm})` : ''}`);
      const c = onBack(sn.fromSide.mm, sn.fromTop.mm);
      const [s0, t0] = [sn.fromSide.mm - w.width.mm / 2, sn.fromTop.mm - w.length.mm / 2];
      const win = w.radius
        ? roundedRect(s0, t0, s0 + w.width.mm, t0 + w.length.mm, w.radius.mm, 6)
        : stadium([c[1], c[0]], w.length.mm, w.width.mm).map(([z, x]): P2 => [x, z]);
      d.inside = at(c, heights.backGlass);
      d.region(COLOUR.window, win, [], (q) => at(q, heights.bumpTop + 0.02));
      d.loop(win, heights.bumpTop + 0.02);
    }

    // The header LDraw's tools read (the Library Header spec): title, file name, author, status, licence, winding. No
    // !CATEGORY: the title's first word stands for it, so every iPhone files together.
    const header = [
      `0 ${part.title}`,
      `0 Name: ${part.name}`,
      `0 Author: ${AUTHOR.name} [${AUTHOR.username}]`,
      '0 !LDRAW_ORG Unofficial_Part',
      '0 !LICENSE Licensed under CC BY 4.0 : see CAreadme.txt',
      '',
      '0 BFC CERTIFY CCW',
      '',
      `0 !KEYWORDS ${part.keywords.join(', ')}`,
      '',
      ...part.history.map(([date, what]) => `0 !HISTORY ${date} [${AUTHOR.username}] ${what}`),
      '',
      `0 // From Apple's public dimensional drawing of the ${part.title} (${part.drawn}): every number and its source in`,
      `0 // ldraw-iphones/iphone/models/${part.folder}/drawing.ts. Not affiliated with or endorsed by Apple; iPhone is Apple's trademark.`,
      '0 // Origin: the product centre. -Y out of the screen, +Y out of the back, +X the side-button edge, +Z the top.',
      '',
    ];
    return { dat: [...header, ...d.lines, ''].join('\n'), features: features() };
  }

  /** A pinhole camera from a diagonal field of view and the image's size. */
  function pinhole(diagonalDeg: number, w = image.width, h = image.height) {
    const f = Math.hypot(w, h) / 2 / Math.tan(((diagonalDeg / 2) * Math.PI) / 180);
    const deg = (half: number) => (2 * Math.atan(half / f) * 180) / Math.PI;
    return { focalPx: round(f, 1), diagonal: round(diagonalDeg, 2), long: round(deg(w / 2), 2), short: round(deg(h / 2), 2), image: [w, h] };
  }

  function sensorFeature(sn: NonNullable<Phone['sensor']>) {
    const [x, z] = onBack(sn.fromSide.mm, sn.fromTop.mm);
    const at3: V3 = [x, heights.bumpTop, z];
    return {
      name: sn.name,
      ...(sn.window
        ? { window: { mm: mm3(at3), ldu: ldu3(at3), width: sn.window.width.mm, length: sn.window.length.mm, ...(sn.window.radius ? { cornerRadius: sn.window.radius.mm } : {}), note: 'the base of its keepout cone on the plateau, drawn as its window' } }
        : { zone: { mm: mm3(at3), ldu: ldu3(at3), diameter: sn.zone!.mm, source: describe(sn.zone!), note: 'its keepout zone on the cover glass; the drawing gives no window, so none is drawn' } }),
      axis: [0, 1, 0],
      keepoutCone: { fullAngleDeg: sn.keepoutCone.mm, source: describe(sn.keepoutCone) },
      sources: { fromSide: describe(sn.fromSide), fromTop: describe(sn.fromTop) },
    };
  }

  function flashKeepout(k: NonNullable<Phone['flash']['keepout']>) {
    const mm = (v: Value) => ({ mm: v.mm, source: describe(v) });
    return {
      axis: [0, 1, 0],
      ...(k.apexFromFront ? { apexFromFront: mm(k.apexFromFront) } : {}),
      innerConeDeg: { fullAngle: k.inner.mm, source: describe(k.inner) },
      ...(k.outer ? { outerConeDeg: { fullAngle: k.outer.mm, source: describe(k.outer) } } : {}),
      ...(k.transitionFromFront ? { transitionFromFront: mm(k.transitionFromFront) } : {}),
      ...(k.outerApexFromFront ? { outerApexFromFront: mm(k.outerApexFromFront) } : {}),
      ...(k.innerBaseDiameter ? { innerBaseDiameter: mm(k.innerBaseDiameter) } : {}),
      note: 'cones about the flash\'s axis, their apex inside the phone, measured from the front (screen) face as the section dimensions them',
    };
  }

  function magsafeFeature(m: NonNullable<Phone['magsafe']>) {
    const [x, z] = onBack(m.fromSide.mm, m.fromTop.mm);
    return {
      centre: { mm: mm3([x, BACK, z]), ldu: ldu3([x, BACK, z]), sources: [describe(m.fromSide), describe(m.fromTop)] },
      clear: { diameter: m.diameter.mm, source: describe(m.diameter), note: 'keep clear of metal, conductive or magnetic material' },
      ...(m.zoneFrom && m.zoneSidesTo && m.zoneRadius ? { magneticZone: magneticZone(m.zoneFrom, m.zoneSidesTo, m.zoneRadius) } : {}),
      axis: [0, 1, 0],
      note: 'on the back glass, about the axis out of the back',
    };
  }

  /** MagSafe's magnetic zone: full width from `from` down, straight sides to `sidesTo`, an arc of `r` through their ends. */
  function magneticZone(from: Value, sidesTo: Value, r: Value) {
    const below = Math.sqrt(r.mm ** 2 - (W / 2) ** 2); // the arc's centre above the sides' ends
    const arcCentre: [number, number] = [0, L / 2 - (sidesTo.mm - below)];
    return {
      zFrom: round(L / 2 - from.mm),
      sidesToZ: round(L / 2 - sidesTo.mm),
      arc: { radius: r.mm, centre: { mm: mm3([arcCentre[0], BACK, arcCentre[1]]) }, lowestZ: round(arcCentre[1] - r.mm) },
      sources: [describe(from), describe(sidesTo), describe(r)],
      note: 'keep clear of magnetic or permeable material except MagSafe magnets: the full width from zFrom down to sidesToZ, closed below by the arc through (±W/2, sidesToZ); its centre derived from those corners',
    };
  }

  function micFeature(m: Disc) {
    const [x, z] = onBack(m.fromSide.mm, m.fromTop.mm);
    return { mm: mm3([x, micHeight(), z]), diameter: m.diameter.mm, sources: [describe(m.fromSide), describe(m.fromTop), describe(m.diameter)] };
  }

  function controlFeature(cc: NonNullable<Phone['cameraControl']>) {
    const at3: V3 = [W / 2, BACK - cc.fromBack.mm, L / 2 - cc.centre.mm];
    return {
      centre: { mm: mm3(at3), ldu: ldu3(at3), note: 'on the side-button side (+X), flush' },
      length: 2 * cc.half.mm,
      width: cc.width.mm,
      keepout: { length: cc.keepoutLength.mm, width: cc.keepoutWidth.mm, source: describe(cc.keepoutLength), note: 'a case or mount must leave this clear round it, measured at the surface' },
    };
  }

  function features() {
    const camera = (cam: Camera, diagonalDeg: number, fovFrom: string) => {
      const [x, z] = onBack(cam.fromSide.mm, cam.fromTop.mm);
      const windowAt: V3 = [x, heights.rings, z];
      const apex: V3 = [x, FRONT + cam.coneApexFromFront.mm, z];
      return {
        name: cam.name,
        window: { mm: mm3(windowAt), ldu: ldu3(windowAt), note: 'centre of the lens window, drawn flush with the ring top (its depth is not given)' },
        coneApex: { mm: mm3(apex), ldu: ldu3(apex), source: describe(cam.coneApexFromFront), note: "the keepout cone's apex: the drawing's own optical reference; the lens's entrance pupil is near it but not given" },
        axis: [0, 1, 0],
        keepoutCone: { fullAngleDeg: cam.keepoutCone.mm, source: describe(cam.keepoutCone), note: 'nothing of a mount may enter this cone from its apex: a design check, not the field of view' },
        fieldOfView: { ...pinhole(diagonalDeg), source: fovFrom, note: "pinhole model of the 4:3 still; the image's long side runs along the phone's length (Z). Video (16:9) crops the short side" },
        sources: { fromSide: describe(cam.fromSide), fromTop: describe(cam.fromTop) },
      };
    };
    // A spec field of view where Apple gives one; else derived from a 35 mm equivalent focal length.
    const view = (cam: Camera) =>
      cam.fov
        ? camera(cam, cam.fov.mm, describe(cam.fov))
        : camera(cam, (2 * Math.atan(FULL_FRAME_DIAGONAL / 2 / cam.equivalentFocal!.mm) * 180) / Math.PI, `derived from ${describe(cam.equivalentFocal!)}`);
    const [fx, fz] = onBack(flash.fromSide.mm, flash.fromTop.mm);
    return {
      units: 'positions in mm and in LDU (2.5 LDU per mm), in the part\'s own frame',
      frame: 'origin at the product centre; -Y out of the screen, +Y out of the back; +X toward the side-button edge; +Z toward the top (receiver) end',
      extent: {
        mm: { x: [-W / 2, W / 2], y: [FRONT, round(heights.rings)], z: [-L / 2, L / 2] },
        note: `Y runs from the screen to the top of the lens rings (${T} + ${bump.rings.mm})`,
      },
      cameras: {
        ...Object.fromEntries(Object.entries(cameras).map(([key, cam]) => [key, view(cam)])),
        identity: describe(phone.cameraIdentity),
      },
      flash: {
        mm: mm3([fx, heights.flash, fz]),
        diameter: flash.diameter.mm,
        sources: [describe(flash.fromSide), describe(flash.fromTop)],
        ...(flash.keepout ? { keepout: flashKeepout(flash.keepout) } : {}),
      },
      ...(phone.rearMic ? { rearMic: micFeature(phone.rearMic) } : {}),
      ...(phone.magsafe ? { magsafe: magsafeFeature(phone.magsafe) } : {}),
      ...(phone.sensor ? { sensor: sensorFeature(phone.sensor) } : {}),
      ...(phone.cameraControl ? { cameraControl: controlFeature(phone.cameraControl) } : {}),
      mass: { grams: mass.mm, source: describe(mass), note: 'centre of mass not given; the product centre is an assumption' },
      image: { ...image },
    };
  }

  return { W, L, T, onBack, outline, roundedRect, bumpRings, activeArea, receiverSlot, buttonOutline, bottomOpenings, heights, build, pinhole };
}

/**
 * The bottom's stretch of the flat band: the outline's points along the bottom edge, (X, Z), and the outline's
 * segments it covers. It runs past the straight edge onto the corners as far as they stay within 0.01 mm of its plane,
 * and further if an opening needs it, to the first point past the openings' reach (`reach`, |X|): the iPhone 13's last
 * speaker hole reaches 1.26 into its corner's curve, where the curve has left the plane by up to 0.02 mm (the holes are
 * drawn on the plane; the face's edge follows the curve).
 */
function bottomFace(plan: P2[], L: number, reach: number): { points: P2[]; segments: Set<number> } {
  const n = plan.length;
  const flat = plan.map(([, z]) => Math.abs(z + L / 2) < 0.01);
  const first = flat.findIndex((x, i) => x && !flat[(i - 1 + n) % n]);
  const idx: number[] = [];
  for (let i = first; flat[i % n]; i++) idx.push(i % n);
  // Out along the outline each way until a point lies beyond the reach.
  const beyond = (i: number) => Math.abs(plan[i][0]) > reach;
  while (!beyond(idx[0])) idx.unshift((idx[0] - 1 + n) % n);
  while (!beyond(idx.at(-1)!)) idx.push((idx.at(-1)! + 1) % n);
  return { points: idx.map((i) => plan[i]), segments: new Set(idx.slice(0, -1)) };
}

/**
 * A recess behind an opening: walls from its mouth (a ring of points on a face) back by `depth` (a vector into the
 * part), and a floor. The walls face into it, the floor out of it.
 */
function recess(d: Dat, mouth: V3[], depth: V3, wall: number, floorColour: number) {
  const back = mouth.map((p): V3 => [p[0] + depth[0], p[1] + depth[1], p[2] + depth[2]]);
  const c = mouth.reduce((a, p): V3 => [a[0] + p[0] / mouth.length, a[1] + p[1] / mouth.length, a[2] + p[2] / mouth.length], [0, 0, 0]);
  d.bandV(wall, mouth, back, [c[0] + depth[0] / 2, c[1] + depth[1] / 2, c[2] + depth[2] / 2]);
  d.rungs(mouth, back);
  const fan: V3 = [c[0] + depth[0], c[1] + depth[1], c[2] + depth[2]];
  const out: V3 = [c[0] - depth[0], c[1] - depth[1], c[2] - depth[2]];
  for (let i = 0; i < back.length; i++) d.tri(floorColour, fan, back[i], back[(i + 1) % back.length], out);
  d.loopV(mouth);
  d.loopV(back);
}

const round = (n: number, places = 3) => Math.round(n * 10 ** places) / 10 ** places;
const mm3 = (p: V3) => p.map((c) => round(c));
const ldu3 = (p: V3) => p.map((c) => round(c * LDU_PER_MM));

/** Diagonal of a 36 x 24 mm frame, for 35 mm equivalent focal lengths. */
const FULL_FRAME_DIAGONAL = Math.hypot(36, 24);
