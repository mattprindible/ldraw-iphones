import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { DIST, files, PARTS } from './build.ts';

test('the library on disk is current (run node library/build.ts after changing a part)', () => {
  for (const [path, text] of Object.entries(files())) assert.equal(readFileSync(join(DIST, path), 'utf8'), text, path);
  for (const f of ['README.md', 'LICENSE.md']) assert.equal(readFileSync(join(DIST, f), 'utf8'), readFileSync(join(import.meta.dirname, f), 'utf8'), f);
  for (const f of readdirSync(join(import.meta.dirname, 'examples'))) assert.equal(readFileSync(join(DIST, 'examples', f), 'utf8'), readFileSync(join(import.meta.dirname, 'examples', f), 'utf8'), `examples/${f}`);
});

test("each part's file name is its header's Name:, and the README lists it", () => {
  const readme = readFileSync(join(import.meta.dirname, 'README.md'), 'utf8');
  for (const { part } of PARTS) {
    assert.ok(existsSync(join(DIST, 'parts', part.name)), part.name);
    assert.match(readFileSync(join(DIST, 'parts', part.name), 'utf8'), new RegExp(`^0 Name: ${part.name.replace('.', '\\.')}$`, 'm'));
    assert.ok(readme.includes(part.name), `README lists ${part.name}`);
  }
});
