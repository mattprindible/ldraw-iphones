// Small 3D maths for placing parts: vectors, rotations as row-major 3x3 matrices (as in an LDraw type 1 line).

export type V3 = [number, number, number];
/** Row-major, as in an LDraw type 1 line: world = m·p + t. */
export type M3 = [number, number, number, number, number, number, number, number, number];

export const apply = (m: M3, p: V3): V3 => [m[0] * p[0] + m[1] * p[1] + m[2] * p[2], m[3] * p[0] + m[4] * p[1] + m[5] * p[2], m[6] * p[0] + m[7] * p[1] + m[8] * p[2]];
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const transpose = (m: M3): M3 => [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]];

export function mul(a: M3, b: M3): M3 {
  const r = Array(9).fill(0) as M3;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) r[i * 3 + j] += a[i * 3 + k] * b[k * 3 + j];
  return r;
}

/** A rotation from where a part's own X, Y and Z axes point in the world. Throws unless they're right-handed. */
export function axes(x: V3, y: V3, z: V3): M3 {
  const m: M3 = [x[0], y[0], z[0], x[1], y[1], z[1], x[2], y[2], z[2]];
  const det = m[0] * (m[4] * m[8] - m[5] * m[7]) - m[1] * (m[3] * m[8] - m[5] * m[6]) + m[2] * (m[3] * m[7] - m[4] * m[6]);
  if (Math.abs(det - 1) > 1e-9) throw new Error(`not a rotation (det ${det}): the axes must be right-handed`);
  return m;
}

/** A rotation of `deg` about a world axis (right-handed). */
export function rot(axis: 'x' | 'y' | 'z', deg: number): M3 {
  const [c, s] = [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)];
  if (axis === 'x') return [1, 0, 0, 0, c, -s, 0, s, c];
  if (axis === 'y') return [c, 0, s, 0, 1, 0, -s, 0, c];
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}

/** The least of f over many points: a loop, since a part's surface samples are too many to spread into Math.min. */
export function least<T>(items: T[], f: (x: T) => number): number {
  let best = Infinity;
  for (const x of items) best = Math.min(best, f(x));
  return best;
}

/** The axis-aligned box of some points, grown by `pad`. */
export function bounds(pts: V3[], pad = 0): { min: V3; max: V3 } {
  const min: V3 = [Infinity, Infinity, Infinity], max: V3 = [-Infinity, -Infinity, -Infinity];
  for (const p of pts) for (let k = 0; k < 3; k++) (min[k] = Math.min(min[k], p[k])), (max[k] = Math.max(max[k], p[k]));
  return { min: min.map((v) => v - pad) as V3, max: max.map((v) => v + pad) as V3 };
}
