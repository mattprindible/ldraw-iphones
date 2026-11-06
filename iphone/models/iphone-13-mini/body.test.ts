import assert from 'node:assert/strict';
import { test } from 'node:test';
import { inside } from '../../../src/convex.ts';
import { axes } from '../../../src/geom.ts';
import { phone } from './body.ts';
import { body } from './drawing.ts';


test("the phone's body is the drawing's: inside just within each face, outside just beyond", () => {
  const I = axes([1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const [W, L, T] = [body.width.mm, body.length.mm, body.thickness.mm];
  for (const [p, want] of [
    [[W / 2 - 0.01, 0, 0], true], [[W / 2 + 0.01, 0, 0], false],
    [[0, 0, L / 2 - 0.01], true], [[0, 0, L / 2 + 0.01], false],
    [[0, -T / 2 + 0.01, 0], true], [[0, -T / 2 - 0.01, 0], false],
    // The bump: above the back glass behind the cameras, but not elsewhere on the back.
    [[15, T / 2 + 2, 50], true], [[-15, T / 2 + 2, 50], false],
    // The side button stands 0.45 proud at 43.68 from the top; the ring/silent switch 0.60 on the other side at 23.37.
    [[W / 2 + 0.44, 0, L / 2 - 43.68], true], [[W / 2 + 0.46, 0, L / 2 - 43.68], false],
    [[-W / 2 - 0.59, 0, L / 2 - 23.37], true], [[-W / 2 - 0.61, 0, L / 2 - 23.37], false],
  ] as const)
    assert.equal(inside(phone.pieces, I, [0, 0, 0], [...p]), want, `${p}`);
});
