import assert from 'node:assert/strict';
import { test } from 'node:test';
import { circle } from './curves.ts';
import { area, triangulate } from './triangulate.ts';

type P2 = [number, number];
const triArea = (pts: P2[], t: [number, number, number]) => {
  const [a, b, c] = t.map((i) => pts[i]);
  return ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) / 2;
};

test('a region with holes is covered exactly: the triangles add up to the outline less the holes, all wound one way', () => {
  const outer: P2[] = [[0, 0], [40, 0], [40, 6], [0, 6]];
  const holes = [circle([6, 3], 0.765, 24), circle([12, 3], 0.765, 24), [[16, 2], [24, 2], [24, 4], [16, 4]] as P2[]];
  const { points, triangles } = triangulate(outer, holes);
  const signed = triangles.map((t) => triArea(points, t));
  assert.ok(signed.every((a) => a > 0), 'every triangle wound as the outline (counter-clockwise)');
  const want = area(outer) - holes.reduce((s, h) => s + area(h), 0);
  assert.ok(Math.abs(signed.reduce((a, b) => a + b) - want) < 1e-9, `${signed.reduce((a, b) => a + b)} ≠ ${want}`);
  // No triangle lies in a hole: each one's centroid is outside every hole.
  for (const t of triangles) {
    const c = t.map((i) => points[i]).reduce((s, p) => [s[0] + p[0] / 3, s[1] + p[1] / 3], [0, 0]);
    assert.ok(!(c[0] > 16 && c[0] < 24 && c[1] > 2 && c[1] < 4), 'a triangle inside the square hole');
    for (const ctr of [[6, 3], [12, 3]]) assert.ok(Math.hypot(c[0] - ctr[0], c[1] - ctr[1]) > 0.7, 'a triangle inside a round hole');
  }
});

test('a concave outline (a screen with its notch) is covered, and a clockwise outline gives clockwise triangles', () => {
  const notched: P2[] = [[0, 0], [30, 0], [30, 60], [20, 60], [20, 55], [10, 55], [10, 60], [0, 60]];
  const ccw = triangulate(notched);
  assert.ok(Math.abs(ccw.triangles.reduce((s, t) => s + triArea(ccw.points, t), 0) - (1800 - 50)) < 1e-9);
  const cw = triangulate([...notched].reverse());
  assert.ok(cw.triangles.every((t) => triArea(cw.points, t) < 0), 'clockwise in, clockwise out');
});

test('negative control: crossing rings are refused, not triangulated wrongly', () => {
  const bowtie: P2[] = [[0, 0], [10, 10], [10, 0], [0, 10]];
  assert.throws(() => triangulate(bowtie), /rings crossing/);
  // A hole poking out of its outline, likewise.
  assert.throws(() => triangulate([[0, 0], [10, 0], [10, 6], [0, 6]], [circle([9.5, 3], 1, 16)]), /rings crossing|can see/);
});
