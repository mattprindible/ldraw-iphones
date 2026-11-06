// A drawn part as a body for contact: a union of convex pieces, each the points inside a set of half-spaces, in the
// part's own frame (mm). Simple enough to state from a drawing's dimensions (a slab inside an outline, a box for a
// bump), and exact to move: how far the body can travel before a point is inside it is a clip of the point's path
// against each piece's faces (Cyrus-Beck), with no stepping and no tolerance.
import { apply, sub, transpose, type M3, type V3 } from './geom.ts';

/** The points q with n·q ≤ d. */
export interface HalfSpace {
  n: V3;
  d: number;
}
/** Where all of its half-spaces hold. */
export type Piece = HalfSpace[];

/** A polygon in the (x, z) plane, convex, extruded along y from y0 to y1. */
export function prism(polygon: Array<[number, number]>, y0: number, y1: number): Piece {
  const n = polygon.length;
  const area = polygon.reduce((s, p, i) => s + p[0] * polygon[(i + 1) % n][1] - polygon[(i + 1) % n][0] * p[1], 0);
  const sides = polygon.map((a, i): HalfSpace => {
    const b = polygon[(i + 1) % n];
    const [dx, dz] = [b[0] - a[0], b[1] - a[1]];
    const [nx, nz] = area > 0 ? [dz, -dx] : [-dz, dx];
    return { n: [nx, 0, nz], d: nx * a[0] + nz * a[1] };
  });
  return [{ n: [0, 1, 0], d: y1 }, { n: [0, -1, 0], d: -y0 }, ...sides];
}

export function box(min: V3, max: V3): Piece {
  return [0, 1, 2].flatMap((k): Piece => {
    const e: V3 = [0, 0, 0];
    e[k] = 1;
    return [{ n: e, d: max[k] }, { n: [-e[0], -e[1], -e[2]], d: -min[k] }];
  });
}

const within = (piece: Piece, q: V3) => piece.every((h) => h.n[0] * q[0] + h.n[1] * q[1] + h.n[2] * q[2] <= h.d);

/** Whether a world point is inside the body placed at (m, t). */
export function inside(body: Piece[], m: M3, t: V3, p: V3): boolean {
  const q = apply(transpose(m), sub(p, t));
  return body.some((piece) => within(piece, q));
}

/**
 * How far the body at (m, t) can move along `dir` before `p` is inside it: Infinity if it never enters, 0 if it's
 * inside already. In the body's frame the point moves by -s·u; each half-space n·(q - s·u) ≤ d bounds s on one side.
 */
export function entry(body: Piece[], m: M3, t: V3, dir: V3, p: V3): number {
  const inv = transpose(m);
  const q = apply(inv, sub(p, t));
  const u = apply(inv, dir);
  let best = Infinity;
  for (const piece of body) {
    let [lo, hi] = [-Infinity, Infinity];
    for (const h of piece) {
      const a = h.n[0] * q[0] + h.n[1] * q[1] + h.n[2] * q[2] - h.d; // a + b·s ≤ 0
      const b = -(h.n[0] * u[0] + h.n[1] * u[1] + h.n[2] * u[2]);
      if (Math.abs(b) < 1e-12) {
        if (a > 0) {
          lo = Infinity;
          break;
        }
        continue;
      }
      if (b > 0) hi = Math.min(hi, -a / b); else lo = Math.max(lo, -a / b);
      if (lo > hi) break;
    }
    if (lo <= hi && hi >= 0) best = Math.min(best, Math.max(0, lo));
  }
  return best;
}
