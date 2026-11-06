// Gathers each drawn part into a library people can add to their LDraw setup: its .dat under parts/ (LDraw's layout,
// so a tool's search path finds it beside the official parts), its features (cameras, keepouts) under features/, and
// the README and licence that travel with them, and an example model that uses one.
//
//   node library/build.ts   → library/dist/
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { files as modelFiles, MODELS } from '../iphone/models.ts';

/** Every part in the library: its header's facts. */
export const PARTS = MODELS.map((m) => ({ part: m.phone.part, model: m }));

export const DIST = join(import.meta.dirname, 'dist');

/** The library's files, by path within dist/. */
export function files(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const { part, model } of PARTS) {
    const { dat, features } = modelFiles(model);
    out[`parts/${part.name}`] = dat;
    out[`features/${part.name.replace(/\.dat$/, '.json')}`] = features;
  }
  return out;
}

if (import.meta.main) {
  rmSync(DIST, { recursive: true, force: true });
  for (const [path, text] of Object.entries(files())) {
    mkdirSync(join(DIST, path, '..'), { recursive: true });
    writeFileSync(join(DIST, path), text);
  }
  for (const f of ['README.md', 'LICENSE.md']) cpSync(join(import.meta.dirname, f), join(DIST, f));
  cpSync(join(import.meta.dirname, 'examples'), join(DIST, 'examples'), { recursive: true });
  console.log(`library → ${DIST}: ${PARTS.map((p) => p.part.name).join(', ')}`);
}
