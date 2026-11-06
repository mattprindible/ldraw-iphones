// Apple's drawings: where each comes from and the exact file the parts were read from (its SHA-256, in
// drawings.json). The PDFs stay out of git (they carry Apple's proprietary notice); this fetches them.
//
//   node iphone/drawings.ts                  fetch any missing drawing into drawings/, and verify every one
//   node iphone/drawings.ts --record <name>  record the SHA-256 of drawings/<name>.pdf (a new model, or a revision)
//   node iphone/drawings.ts --check-apple    compare what Apple publishes now with what's recorded (CI, weekly)
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const DIR = join(import.meta.dirname, 'drawings');
const JSON_PATH = join(import.meta.dirname, 'drawings.json');
export const PAGE = 'https://developer.apple.com/accessories/dimensional-drawings/';
export const BASE = 'https://developer.apple.com/download/files/accessories/dimensional-drawings/';

/** Each drawing's name (iphone-<model>) and the SHA-256 of the PDF the part was read from. */
export function recorded(): Record<string, string> {
  return JSON.parse(readFileSync(JSON_PATH, 'utf8')).sha256;
}

export const sha256 = (b: Uint8Array) => createHash('sha256').update(b).digest('hex');

/** Why a PDF isn't the recorded drawing, or null if it is. */
export function mismatch(name: string, b: Uint8Array, hashes = recorded()): string | null {
  const want = hashes[name];
  if (!want) return `${name} has no recorded SHA-256 in drawings.json`;
  const got = sha256(b);
  return got === want ? null : `${name}.pdf is not the drawing the part was read from: SHA-256 ${got}, recorded ${want}`;
}

async function download(url: string): Promise<Uint8Array> {
  const res = await fetch(url, { headers: { 'User-Agent': 'ldraw-iphones' } });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

/** Fetch every missing drawing and verify all of them; the problems found. */
async function fetchAll(): Promise<string[]> {
  const problems: string[] = [];
  for (const name of Object.keys(recorded())) {
    const path = join(DIR, `${name}.pdf`);
    if (!existsSync(path)) {
      const b = await download(`${BASE}${name}.pdf`);
      const why = mismatch(name, b);
      if (why) { problems.push(`${why} (as downloaded; not saved)`); continue; }
      writeFileSync(path, b);
      console.log(`fetched  ${name}.pdf`);
      continue;
    }
    const why = mismatch(name, readFileSync(path));
    if (why) problems.push(why);
    else console.log(`verified ${name}.pdf`);
  }
  return problems;
}

/** Apple's page now against what's recorded: new drawings, removed ones, revised ones. */
async function checkApple(): Promise<string[]> {
  const page = new TextDecoder().decode(await download(PAGE));
  const listed = new Set([...page.matchAll(/dimensional-drawings\/(iphone-[a-z0-9-]+)\.pdf/g)].map(m => m[1]));
  if (listed.size === 0) return [`no iPhone drawings found on ${PAGE}: has the page changed shape?`];
  const hashes = recorded();
  const problems: string[] = [];
  for (const name of listed) if (!hashes[name]) problems.push(`new on Apple's page: ${name}.pdf (no part for it yet)`);
  for (const name of Object.keys(hashes)) {
    if (!listed.has(name)) { problems.push(`no longer on Apple's page: ${name}.pdf`); continue; }
    const why = mismatch(name, await download(`${BASE}${name}.pdf`), hashes);
    if (why) problems.push(`revised by Apple: ${why}`);
    else console.log(`unchanged ${name}.pdf`);
  }
  return problems;
}

function record(name: string): void {
  const b = readFileSync(join(DIR, `${name}.pdf`));
  const data = JSON.parse(readFileSync(JSON_PATH, 'utf8'));
  data.sha256[name] = sha256(b);
  data.sha256 = Object.fromEntries(Object.entries(data.sha256).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(JSON_PATH, JSON.stringify(data, null, 2) + '\n');
  console.log(`recorded ${name}.pdf ${data.sha256[name]}`);
}

if (import.meta.main) {
  const [flag, arg] = process.argv.slice(2);
  if (flag === '--record') {
    if (!arg) throw new Error('usage: node iphone/drawings.ts --record iphone-<model>');
    record(arg);
  } else {
    const problems = flag === '--check-apple' ? await checkApple() : await fetchAll();
    for (const p of problems) console.error(`✗ ${p}`);
    if (problems.length) process.exit(1);
  }
}
