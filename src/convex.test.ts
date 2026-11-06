import assert from 'node:assert/strict';
import { test } from 'node:test';
import { box, entry, inside, prism, type Piece } from './convex.ts';
import { mul, rot, scale, type V3 } from './geom.ts';

// A body like the phone's: a slab inside a convex outline, and a box on one face.
const outline: Array<[number, number]> = Array.from({ length: 40 }, (_, i) => [30 * Math.cos((2 * Math.PI * i) / 40), 60 * Math.sin((2 * Math.PI * i) / 40)]);
const body: Piece[] = [prism(outline, -4, 4), box([5, 4, 20], [25, 6.5, 45])];

test('entry() agrees with inside(): outside just before the entry distance, inside just after', () => {
  let seed = 7;
  const r = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  let entering = 0;
  for (let i = 0; i < 20000; i++) {
    const m = mul(rot('z', r() * 360), mul(rot('x', r() * 360), rot('y', r() * 360)));
    const p: V3 = [(r() - 0.5) * 200, (r() - 0.5) * 200, (r() - 0.5) * 200];
    const d0: V3 = [r() - 0.5, r() - 0.5, r() - 0.5];
    const d = scale(d0, 1 / Math.hypot(...d0));
    const s = entry(body, m, [0, 0, 0], d, p);
    if (!isFinite(s) || s === 0) continue;
    entering++;
    assert.ok(!inside(body, m, scale(d, s - 1e-6), p), `inside before entering (${p})`);
    assert.ok(inside(body, m, scale(d, s + 1e-6), p), `not inside after entering (${p})`);
  }
  assert.ok(entering > 1000, `only ${entering} entering paths sampled`);
});

test('entry() is 0 for a point already inside, Infinity for one the body moves away from', () => {
  const I = rot('x', 0);
  assert.equal(entry(body, I, [0, 0, 0], [0, 1, 0], [0, 0, 0]), 0);
  assert.equal(entry(body, I, [0, 0, 0], [0, 1, 0], [0, 50, 0]), 46);
  assert.equal(entry(body, I, [0, 0, 0], [0, -1, 0], [0, 50, 0]), Infinity);
});
