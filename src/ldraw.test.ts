import assert from 'node:assert/strict';
import { test } from 'node:test';
import { audit, badConditionals } from './ldraw.ts';

// LDraw's own unit box, p/box.dat's faces (BFC CERTIFY CCW): the reference for which way is out.
const BOX = [
  '4 16 1 1 1 1 1 -1 -1 1 -1 -1 1 1', '4 16 -1 -1 -1 1 -1 -1 1 -1 1 -1 -1 1', '4 16 -1 -1 1 1 -1 1 1 1 1 -1 1 1',
  '4 16 -1 -1 -1 -1 -1 1 -1 1 1 -1 1 -1', '4 16 1 -1 -1 -1 -1 -1 -1 1 -1 1 1 -1', '4 16 1 -1 1 1 -1 -1 1 1 -1 1 1 1',
].join('\n');

test("the audit passes LDraw's unit box: closed, consistent, outward (volume +8)", () => {
  assert.deepEqual(audit(BOX), { faces: 6, degenerate: 0, warped: 0, concave: 0, inconsistent: 0, open: 0, volume: 8 });
});

test('negative controls: a face wound the wrong way, the whole box inside out, a warped quad, a bow-tie quad', () => {
  const lines = BOX.split('\n');
  const flip = (l: string) => {
    const [t, c, ...n] = l.split(' ');
    const p = Array.from({ length: n.length / 3 }, (_, i) => n.slice(3 * i, 3 * i + 3).join(' ')).reverse();
    return [t, c, ...p].join(' ');
  };
  assert.ok(audit([flip(lines[0]), ...lines.slice(1)].join('\n')).inconsistent > 0, 'one flipped face');
  assert.ok(audit(lines.map(flip).join('\n')).volume < 0, 'inside out');
  assert.equal(audit('4 16 0 0 0 1 0 0 1 1 0.5 0 1 0').warped, 1, 'warped');
  assert.equal(audit('4 16 0 0 0 1 1 0 1 0 0 0 1 0').concave, 1, 'bow-tie');
});

test("conditional lines: LDraw's own cylinder's pass; a control point on the line, or both on one side, are caught", () => {
  // From p/4-4cyli.dat: the rung at (1, 0, 0)–(1, 1, 0), its control points the bottom ring's neighbours.
  assert.deepEqual(badConditionals('5 24 1 0 0 1 1 0 0.9239 0 0.3827 0.9239 0 -0.3827'), { count: 1, bad: 0 });
  assert.equal(badConditionals('5 24 1 0 0 1 1 0 1 0.5 0 0.9239 0 -0.3827').bad, 1, 'on the line');
  assert.equal(badConditionals('5 24 1 0 0 1 1 0 0.9239 0 0.3827 0.9239 0 0.3827').bad, 1, 'both one side');
});
