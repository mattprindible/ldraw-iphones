// Faces with holes: a flat region of a part (a screen around its notch, an edge with ports in it) as triangles. Ear
// clipping, with each hole first joined to the outline by a bridge to a vertex it can see, so the region becomes one
// polygon that touches itself along the bridge. Exact enough for a few hundred points; no Steiner points are added,
// so every triangle's corners are the region's own (shared with the faces around it).

type P2 = [number, number];

const area2 = (poly: P2[]) => poly.reduce((s, p, i) => s + p[0] * poly[(i + 1) % poly.length][1] - poly[(i + 1) % poly.length][0] * p[1], 0);
const cross = (o: P2, a: P2, b: P2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

/** Whether open segments ab and cd cross (sharing an end doesn't count). */
function crosses(a: P2, b: P2, c: P2, d: P2): boolean {
  const same = (p: P2, q: P2) => p[0] === q[0] && p[1] === q[1];
  if (same(a, c) || same(a, d) || same(b, c) || same(b, d)) return false;
  const [d1, d2, d3, d4] = [cross(c, d, a), cross(c, d, b), cross(a, b, c), cross(a, b, d)];
  return d1 * d2 < 0 && d3 * d4 < 0;
}

/**
 * The region inside `outer` and outside each of `holes` as triangles of indices into the returned points (the outer
 * ring's, then each hole's, in order), each wound as `outer` is given. Rings are simple and don't cross each other.
 */
export function triangulate(outer: P2[], holes: P2[][] = []): { points: P2[]; triangles: [number, number, number][] } {
  const points: P2[] = [...outer, ...holes.flat()];
  const ccw = area2(outer) > 0;
  // Work counter-clockwise: the outline CCW, each hole CW, as index rings.
  let ring = outer.map((_, i) => i);
  if (!ccw) ring.reverse();
  const segments = (r: number[]) => r.map((a, i): [number, number] => [a, r[(i + 1) % r.length]]);
  let offset = outer.length;
  const holeRings = holes.map((h) => {
    const r = h.map((_, i) => offset + i);
    offset += h.length;
    return area2(h) > 0 ? r.reverse() : r;
  });

  // Bridge each hole, rightmost first, from its rightmost vertex to the nearest vertex of the ring so far that it can
  // see (no edge of the ring or of a hole still to come crosses the bridge).
  const order = holeRings.map((r, k) => ({ r, k, x: Math.max(...r.map((i) => points[i][0])) })).sort((a, b) => b.x - a.x);
  for (const { r } of order) {
    const hi = r.reduce((a, b) => (points[b][0] > points[a][0] ? b : a));
    const blockers = [...segments(ring), ...holeRings.flatMap(segments)];
    const seen = ring
      .map((i, at) => ({ i, at, d: Math.hypot(points[i][0] - points[hi][0], points[i][1] - points[hi][1]) }))
      .sort((a, b) => a.d - b.d)
      .find(({ i }) => !blockers.some(([a, b]) => crosses(points[hi], points[i], points[a], points[b])));
    if (!seen) throw new Error('triangulate: no vertex of the outline can see a hole');
    const start = r.indexOf(hi);
    const loop = [...r.slice(start), ...r.slice(0, start), hi];
    ring = [...ring.slice(0, seen.at + 1), ...loop, ...ring.slice(seen.at)];
  }

  // Clip ears: a convex corner with no other vertex of the ring inside its triangle.
  const triangles: [number, number, number][] = [];
  const inTri = (p: P2, a: P2, b: P2, c: P2) => cross(a, b, p) >= 0 && cross(b, c, p) >= 0 && cross(c, a, p) >= 0;
  let guard = 0;
  while (ring.length > 3) {
    if (guard++ > 4 * points.length * points.length) throw new Error('triangulate: no ear found (rings crossing?)');
    let clipped = false;
    for (let k = 0; k < ring.length; k++) {
      const [ia, ib, ic] = [ring[(k - 1 + ring.length) % ring.length], ring[k], ring[(k + 1) % ring.length]];
      const [a, b, c] = [points[ia], points[ib], points[ic]];
      if (cross(a, b, c) <= 1e-12) continue;
      const blocked = ring.some((j) => {
        if (j === ia || j === ib || j === ic) return false;
        const p = points[j];
        // A bridge's ends appear twice in the ring: the same point as a corner doesn't block it.
        if ((p[0] === a[0] && p[1] === a[1]) || (p[0] === b[0] && p[1] === b[1]) || (p[0] === c[0] && p[1] === c[1])) return false;
        return inTri(p, a, b, c);
      });
      if (blocked) continue;
      triangles.push(ccw ? [ia, ib, ic] : [ic, ib, ia]);
      ring.splice(k, 1);
      clipped = true;
      break;
    }
    if (!clipped) throw new Error('triangulate: no ear found (rings crossing?)');
  }
  triangles.push(ccw ? [ring[0], ring[1], ring[2]] : [ring[2], ring[1], ring[0]]);
  // A crossing ring can still clip to triangles; they then don't add up to the region.
  const covered = triangles.reduce((s, [a, b, c]) => s + Math.abs(cross(points[a], points[b], points[c])) / 2, 0);
  const want = area(outer) - holes.reduce((s, h) => s + area(h), 0);
  if (Math.abs(covered - want) > 1e-6 * Math.max(1, want)) throw new Error(`triangulate: triangles cover ${covered}, the region is ${want} (rings crossing?)`);
  return { points, triangles };
}

/** The area of a polygon (positive whichever way it's wound). */
export const area = (poly: P2[]) => Math.abs(area2(poly)) / 2;
