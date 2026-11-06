// The drawings the parts were read from (drawings.ts, drawings.json): every model has exactly one recorded drawing,
// and every PDF on disk is that drawing, byte for byte.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { test } from 'node:test';
import { DIR, mismatch, recorded, sha256 } from './drawings.ts';
import { MODELS } from './models.ts';

const hashes = recorded();
const names = MODELS.map((m) => basename(m.dir));

test('drawings.json records one drawing per model, and none for a model not built', () => {
  assert.deepEqual(Object.keys(hashes).sort(), [...names].sort());
});

for (const name of names) {
  const path = join(DIR, `${name}.pdf`);
  test(`${name}.pdf is the drawing its part was read from`, { skip: !existsSync(path) && 'its PDF is not in iphone/drawings/' }, () => {
    assert.equal(mismatch(name, readFileSync(path)), null);
  });
}

// In CI the re-measure tests must run, not skip: a failed fetch would otherwise pass as "no drawings here".
test('in CI, every drawing is present (node iphone/drawings.ts fetches them)', { skip: !process.env.CI && 'not in CI' }, () => {
  assert.deepEqual(names.filter((n) => !existsSync(join(DIR, `${n}.pdf`))), []);
});

// Negative controls: the check catches a changed drawing and one that was never recorded.
test('a drawing changed by one byte, or not recorded, is caught', () => {
  const b = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
  const fake = { 'iphone-x': sha256(b) };
  assert.equal(mismatch('iphone-x', b, fake), null);
  b[3] ^= 1;
  assert.match(mismatch('iphone-x', b, fake) ?? '', /is not the drawing the part was read from/);
  assert.match(mismatch('iphone-99', b) ?? '', /no recorded SHA-256/);
});
