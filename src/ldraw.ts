// Writing LDraw: a part's faces and edges from geometry in mm, and models that carry a generated part inside them (an
// MPD), so a renderer (src/render/) can draw it without the part being in LDraw's library.
import { add, apply, scale, sub, type M3, type V3 } from './geom.ts';
import { triangulate } from './triangulate.ts';

/** 1 stud = 20 LDU = 8 mm. */
export const LDU_PER_MM = 2.5;

type P2 = [number, number];
/** A point in a plane at height y: (x, z) at y, as LDraw's parts lie (y is up/down, -y up). */
export const at = (p: P2, y: number): V3 => [p[0], y, p[1]];

const fmt = (n: number) => {
  const s = n.toFixed(3).replace(/\.?0+$/, '');
  return s === '-0' ? '0' : s;
};

/**
 * A part's body, in LDU, from geometry in mm. Faces are wound counter-clockwise seen from outside (BFC CERTIFY CCW):
 * draw each convex piece after setting `inside` to a point within it, and every face is turned to face away from it.
 * (Without consistent winding the renderer culls half the faces: the iPhone's screen went missing.)
 */
export class Dat {
  lines: string[] = [];
  inside: V3 = [0, 0, 0];
  comment(text: string) {
    this.lines.push(`0 // ${text}`);
  }
  private pt(p: V3) {
    return p.map((c) => fmt(c * LDU_PER_MM)).join(' ');
  }
  /** The face's points wound to face away from `inside`, or toward `toward` when given (a recess's walls). */
  outward(pts: V3[], toward?: V3): V3[] {
    const [a, b, c] = pts;
    const u = sub(b, a), w = sub(c, a);
    const n: V3 = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    const mid = scale(pts.reduce((s, p) => add(s, p), [0, 0, 0] as V3), 1 / pts.length);
    const away = toward ? sub(toward, mid) : sub(mid, this.inside);
    return n[0] * away[0] + n[1] * away[1] + n[2] * away[2] >= 0 ? pts : [...pts].reverse();
  }
  quad(colour: number, a: V3, b: V3, c: V3, d: V3, toward?: V3) {
    this.lines.push(`4 ${colour} ${this.outward([a, b, c, d], toward).map((p) => this.pt(p)).join(' ')}`);
  }
  tri(colour: number, a: V3, b: V3, c: V3, toward?: V3) {
    this.lines.push(`3 ${colour} ${this.outward([a, b, c], toward).map((p) => this.pt(p)).join(' ')}`);
  }
  edge(a: V3, b: V3) {
    this.lines.push(`2 24 ${this.pt(a)} ${this.pt(b)}`);
  }
  /**
   * A conditional line (type 5) along a smooth surface's seam a–b, drawn only where it's a silhouette: when c and d
   * (points on the faces either side) appear on the same side of it. LDraw draws curved surfaces' outlines this way.
   */
  cond(a: V3, b: V3, c: V3, d: V3) {
    this.lines.push(`5 24 ${[a, b, c, d].map((p) => this.pt(p)).join(' ')}`);
  }
  /** Conditional lines along the rungs between two rings round a smooth surface (a cylinder's sides), as LDraw's primitives have them. */
  rungs(r0: V3[], r1: V3[]) {
    const n = r0.length;
    for (let i = 0; i < n; i++) this.cond(r0[i], r1[i], r0[(i - 1 + n) % n], r0[(i + 1) % n]);
  }
  /** Quads between two rings of the same length, each at its own height. */
  band(colour: number, r0: P2[], y0: number, r1: P2[], y1: number) {
    for (let i = 0; i < r0.length; i++) {
      const j = (i + 1) % r0.length;
      this.quad(colour, at(r0[i], y0), at(r0[j], y0), at(r1[j], y1), at(r1[i], y1));
    }
  }
  /** A convex cap: a fan from the ring's centroid. */
  cap(colour: number, ring: P2[], y: number) {
    const c: P2 = [ring.reduce((s, p) => s + p[0], 0) / ring.length, ring.reduce((s, p) => s + p[1], 0) / ring.length];
    for (let i = 0; i < ring.length; i++) this.tri(colour, at(c, y), at(ring[i], y), at(ring[(i + 1) % ring.length], y));
  }
  /** Edge lines round a ring. */
  loop(ring: P2[], y: number) {
    for (let i = 0; i < ring.length; i++) this.edge(at(ring[i], y), at(ring[(i + 1) % ring.length], y));
  }
  /** Quads between two rings of points in space, of the same length (a button's sides, a hole's walls). */
  bandV(colour: number, r0: V3[], r1: V3[], toward?: V3) {
    for (let i = 0; i < r0.length; i++) {
      const j = (i + 1) % r0.length;
      this.quad(colour, r0[i], r0[j], r1[j], r1[i], toward);
    }
  }
  loopV(ring: V3[]) {
    for (let i = 0; i < ring.length; i++) this.edge(ring[i], ring[(i + 1) % ring.length]);
  }
  /**
   * A flat region with holes (src/triangulate.ts) as triangles: rings in the face's own 2D coordinates, each point put
   * in space by `to3` (given the point and its index: the outer ring's, then each hole's), so points shared with the
   * faces around can be placed exactly where those faces have them.
   */
  region(colour: number, outer: P2[], holes: P2[][], to3: (p: P2, index: number) => V3, toward?: V3) {
    const { points, triangles } = triangulate(outer, holes);
    const p3 = points.map((p, i) => to3(p, i));
    // The triangulation winds every triangle alike, so the region's facing is decided once, from its largest triangle:
    // a sliver's own normal is too unsteady to trust (the 17 Pro's bottom face, three points up its curved end).
    const area = ([a, b, c]: [number, number, number]) => {
      const [u, w] = [sub(p3[b], p3[a]), sub(p3[c], p3[a])];
      return Math.hypot(u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]);
    };
    const big = triangles.reduce((x, y) => (area(y) > area(x) ? y : x));
    const keep = this.outward([p3[big[0]], p3[big[1]], p3[big[2]]], toward)[0] === p3[big[0]];
    for (const [a, b, c] of triangles) {
      const pts = keep ? [p3[a], p3[b], p3[c]] : [p3[c], p3[b], p3[a]];
      this.lines.push(`3 ${colour} ${pts.map((p) => this.pt(p)).join(' ')}`);
    }
  }
}

/** The vertices of a part's faces (types 3 and 4), in mm: what a generated part is made of. */
export function faceVertices(dat: string): V3[] {
  const out: V3[] = [];
  for (const line of dat.split('\n').filter((l) => /^[34] /.test(l))) {
    const n = line.split(' ').slice(2).map(Number);
    for (let i = 0; i < n.length; i += 3) out.push([n[i] / LDU_PER_MM, n[i + 1] / LDU_PER_MM, n[i + 2] / LDU_PER_MM]);
  }
  return out;
}

/** An LDraw type 1 line: a part placed at t (LDU) turned by m. */
export function placement(colour: number, m: M3 | number[], tLdu: V3 | number[], part: string): string {
  const n = (c: number, places: number) => +c.toFixed(places);
  return `1 ${colour} ${tLdu.map((c) => n(c, 4)).join(' ')} ${m.map((c) => n(c, 9)).join(' ')} ${part}`;
}

/** A model (its type 1 lines) with generated parts carried inside it as further files: an MPD. */
export function mpd(lines: string[], parts: Record<string, string>): string {
  return [
    '0 FILE model.ldr',
    ...lines,
    '0 NOFILE',
    ...Object.entries(parts).flatMap(([name, text]) => [`0 FILE ${name}`, text.trimEnd(), '0 NOFILE']),
    '',
  ].join('\n');
}

/** World mm → LDU, for a placement given in mm. */
export const ldu = (p: V3): V3 => scale(p, LDU_PER_MM);
/** A placement (m, t in mm) of a point given in the part's own frame (mm). */
export const place = (m: M3, t: V3, p: V3): V3 => add(apply(m, p), t);

/**
 * What LDraw asks of a part's faces (types 3 and 4), checked: no degenerate faces; quads flat and convex; winding
 * consistent (BFC CERTIFY CCW), so no edge is shared by two faces running the same way; and outward overall, so the
 * signed volume the faces enclose is positive (LDU³; a boss left open where it meets a face counts in it too).
 * `open` counts directed edges with no face running back along them: where one face stands on another (a button on
 * a side) or a T-junction.
 */
export function audit(dat: string): { faces: number; degenerate: number; warped: number; concave: number; inconsistent: number; open: number; volume: number } {
  const faces: V3[][] = [];
  for (const line of dat.split('\n').filter((l) => /^[34] /.test(l))) {
    const n = line.trim().split(/\s+/).slice(2).map(Number);
    faces.push(Array.from({ length: n.length / 3 }, (_, i): V3 => [n[3 * i], n[3 * i + 1], n[3 * i + 2]]));
  }
  const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const key = (p: V3) => p.map((c) => c.toFixed(3)).join(' ');
  const edges = new Map<string, number>();
  let [degenerate, warped, concave, volume] = [0, 0, 0, 0];
  for (const f of faces) {
    for (let i = 1; i + 1 < f.length; i++) volume += dot(f[0], cross(f[i], f[i + 1])) / 6;
    const n = cross(sub(f[1], f[0]), sub(f[2], f[0]));
    const len = Math.hypot(...n);
    if (len < 1e-9) degenerate++;
    if (f.length === 4 && len >= 1e-9) {
      // Out of plane by more than 0.01 LDU, or turning the wrong way at a corner.
      if (Math.abs(dot(sub(f[3], f[0]), n)) / len > 0.01) warped++;
      if ([0, 1, 2, 3].some((i) => dot(cross(sub(f[(i + 1) % 4], f[i]), sub(f[(i + 2) % 4], f[(i + 1) % 4])), n) < 0)) concave++;
    }
    for (let i = 0; i < f.length; i++) {
      const k = `${key(f[i])}>${key(f[(i + 1) % f.length])}`;
      edges.set(k, (edges.get(k) ?? 0) + 1);
    }
  }
  let [inconsistent, open] = [0, 0];
  for (const [k, c] of edges) {
    inconsistent += c - 1;
    const [a, b] = k.split('>');
    if (!edges.has(`${b}>${a}`)) open++;
  }
  return { faces: faces.length, degenerate, warped, concave, inconsistent, open, volume };
}

/**
 * Conditional lines (type 5) that can't work: a control point on the line itself, or both control points on the same
 * side of it (then the line is drawn from every direction, or from none). Each control point should lie on a face
 * either side of the seam, so seen along the line's normal they fall on opposite sides.
 */
export function badConditionals(dat: string): { count: number; bad: number } {
  let [count, bad] = [0, 0];
  for (const line of dat.split('\n').filter((l) => /^5 /.test(l))) {
    count++;
    const n = line.trim().split(/\s+/).slice(2).map(Number);
    const [a, b, c, d] = [0, 1, 2, 3].map((i): V3 => [n[3 * i], n[3 * i + 1], n[3 * i + 2]]);
    const ab = sub(b, a);
    const len = Math.hypot(...ab);
    // Each control point's offset from the line, square to it.
    const off = (p: V3): V3 => {
      const ap = sub(p, a);
      const k = (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / (len * len);
      return [ap[0] - k * ab[0], ap[1] - k * ab[1], ap[2] - k * ab[2]];
    };
    const [oc, od] = [off(c), off(d)];
    const [lc, ld] = [Math.hypot(...oc), Math.hypot(...od)];
    if (len < 1e-9 || lc < 1e-6 || ld < 1e-6 || (oc[0] * od[0] + oc[1] * od[1] + oc[2] * od[2]) / (lc * ld) > 0.999) bad++;
  }
  return { count, bad };
}
