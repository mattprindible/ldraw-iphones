// Curves through a drawing's sampled points: a drawing often gives a few points on a curve (a corner's profile) rather
// than the curve. A monotone cubic passes through every point and can't overshoot them, so the curve never bulges past
// the drawing's own numbers (a Catmull-Rom through the iPhone's corner bulged 0.017 mm past its edge).

type P2 = [number, number];

/**
 * A monotone cubic (Fritsch-Carlson) through points sorted by x, with the end slopes given; `per` samples an
 * interval. Returns the points along it, the first and last the drawing's own.
 */
export function monotone(pts: P2[], slope0: number, slopeN: number, per: number): P2[] {
  const n = pts.length;
  const secant = pts.slice(1).map((p, i) => (p[1] - pts[i][1]) / (p[0] - pts[i][0]));
  const m = pts.map((_, i) => {
    if (i === 0) return slope0;
    if (i === n - 1) return slopeN;
    const [a, b] = [secant[i - 1], secant[i]];
    return a * b <= 0 ? 0 : (2 * a * b) / (a + b);
  });
  const out: P2[] = [pts[0]];
  for (let i = 0; i < n - 1; i++) {
    const [[x0, y0], [x1, y1]] = [pts[i], pts[i + 1]];
    const h = x1 - x0;
    for (let s = 1; s <= per; s++) {
      const t = s / per;
      const h00 = 2 * t ** 3 - 3 * t ** 2 + 1, h10 = t ** 3 - 2 * t ** 2 + t, h01 = -2 * t ** 3 + 3 * t ** 2, h11 = t ** 3 - t ** 2;
      out.push([x0 + h * t, h00 * y0 + h10 * h * m[i] + h01 * y1 + h11 * h * m[i + 1]]);
    }
  }
  return out;
}

/** The polygon moved inward by d along its vertex normals (fine for smooth outlines; no mitring at sharp corners). */
export function inset(poly: P2[], d: number): P2[] {
  const n = poly.length;
  const area = poly.reduce((s, p, i) => s + p[0] * poly[(i + 1) % n][1] - poly[(i + 1) % n][0] * p[1], 0);
  const sign = area < 0 ? 1 : -1; // outward normal of edge (dx, dz) is sign·(-dz, dx)
  const unit = (v: P2): P2 => {
    const l = Math.hypot(v[0], v[1]) || 1;
    return [v[0] / l, v[1] / l];
  };
  return poly.map((p, i) => {
    const a = poly[(i - 1 + n) % n], b = poly[(i + 1) % n];
    const e1 = unit([p[0] - a[0], p[1] - a[1]]), e2 = unit([b[0] - p[0], b[1] - p[1]]);
    const out = unit([sign * -(e1[1] + e2[1]), sign * (e1[0] + e2[0])]);
    return [p[0] - d * out[0], p[1] - d * out[1]];
  });
}

export function circle(c: P2, r: number, n = 48): P2[] {
  return Array.from({ length: n }, (_, i): P2 => [c[0] + r * Math.cos((2 * Math.PI * i) / n), c[1] + r * Math.sin((2 * Math.PI * i) / n)]);
}
