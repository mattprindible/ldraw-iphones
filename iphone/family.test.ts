// The checks every model must pass, from its own drawing's numbers: its extent, where its cameras and buttons sit,
// that it's a sound LDraw part with LDraw's header, that its scaled values re-measure from its PDF, and that its files
// on disk are current.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { audit, badConditionals, LDU_PER_MM } from '../src/ldraw.ts';
import { files, MODELS } from './models.ts';
import { holds } from './measure.ts';
import { iphone } from './part.ts';

const near = (a: number, b: number, tol: number, what: string) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} ≠ ${b} (±${tol})`);

for (const m of MODELS) {
  const p = m.phone;
  const name = p.part.title;
  const model = iphone(p);
  const { dat, features } = model.build();
  const [W, L, T] = [p.body.width.mm, p.body.length.mm, p.body.thickness.mm];

  test(`${name}: its extent is the drawing's, the buttons proud of it, from the screen to the lens rings`, () => {
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (const line of dat.split('\n').filter((l) => /^[234] /.test(l))) {
      const n = line.split(' ').slice(2).map(Number);
      for (let i = 0; i < n.length; i += 3) for (let k = 0; k < 3; k++) [min[k], max[k]] = [Math.min(min[k], n[i + k]), Math.max(max[k], n[i + k])];
    }
    const proud = (side: 'volume' | 'side') => Math.max(0, ...Object.values(p.buttons).filter((b) => b.side === side).map((b) => b.proud.mm));
    near(min[0] / LDU_PER_MM, -W / 2 - proud('volume'), 0.001, 'volume side, over its buttons');
    near(max[0] / LDU_PER_MM, W / 2 + proud('side'), 0.001, 'side-button side, over its button');
    near((max[2] - min[2]) / LDU_PER_MM, L, 0.001, 'length');
    near(min[1] / LDU_PER_MM, -T / 2, 0.001, 'screen');
    near(max[1] / LDU_PER_MM, T / 2 + p.bump.rings.mm, 0.001, 'lens rings');
  });

  test(`${name}: its cameras sit where the back view and the sections put them`, () => {
    const f = features as any;
    for (const [key, cam] of Object.entries(p.cameras)) {
      const c = f.cameras[key];
      near(W / 2 - c.window.mm[0], cam.fromSide.mm, 1e-3, `${key} from the side-button edge`);
      near(L / 2 - c.window.mm[2], cam.fromTop.mm, 1e-3, `${key} from the top`);
      near(c.coneApex.mm[1] + T / 2, cam.coneApexFromFront.mm, 1e-3, `${key} cone apex from the front`);
    }
  });

  test(`${name}: its buttons sit where the side views put them`, () => {
    for (const [key, b] of Object.entries(p.buttons)) {
      const { ring } = model.buttonOutline(b);
      const z = ring.map((q) => q[0]);
      near(L / 2 - (Math.max(...z) + Math.min(...z)) / 2, b.centre.mm, 1e-6, `${key} centre`);
      near(Math.max(...z) - Math.min(...z), 2 * b.half.mm, 1e-6, `${key} length`);
    }
  });

  test(`${name}: a sound LDraw part with LDraw's header`, () => {
    const a = audit(dat);
    assert.deepEqual({ degenerate: a.degenerate, warped: a.warped, concave: a.concave, inconsistent: a.inconsistent }, { degenerate: 0, warped: 0, concave: 0, inconsistent: 0 });
    assert.ok(a.volume > 0, 'outward');
    const lines = dat.split('\n');
    assert.equal(lines[0], `0 ${name}`);
    assert.equal(lines[1], `0 Name: ${p.part.name}`);
    assert.equal(lines[2], '0 Author: Matt Prindible [mattprindible]');
    assert.equal(lines[4], '0 !LICENSE Licensed under CC BY 4.0 : see CAreadme.txt');
    assert.equal(badConditionals(dat).bad, 0);
  });

  test(`${name}: every scaled value re-measures from its drawing, and the dimensioned checks agree`, { skip: !m.hasPdf() && 'its PDF is not in iphone/drawings/' }, () => {
    // A known discrepancy must still be one (else its note is stale); everything else must agree.
    for (const r of m.remeasure()) assert.ok(holds(r), `${r.name}: recorded ${r.recorded}, measured ${r.measured.toFixed(3)}${r.known ? ' (recorded as a known discrepancy, but it now agrees)' : ''}`);
  });

  test(`${name}: the files on disk are current (run its part.ts after changing its drawing.ts)`, () => {
    const f = files(m);
    assert.equal(readFileSync(join(m.dir, p.part.name), 'utf8'), f.dat);
    assert.equal(readFileSync(join(m.dir, 'features.json'), 'utf8'), f.features);
  });
}
