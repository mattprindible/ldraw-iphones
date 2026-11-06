// The iPhone 16e as an LDraw part and a features file: the family's builder (iphone/part.ts) on its drawing.
//
//   node iphone-16e/part.ts   → iphone-16e/iphone-16e.dat, iphone-16e/features.json
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { iphone } from '../../part.ts';
import { phone } from './drawing.ts';

export const PART = phone.part;
export const model = iphone(phone);
export const { build } = model;

if (import.meta.main) {
  const { dat, features: f } = build();
  const dir = import.meta.dirname;
  writeFileSync(join(dir, PART.name), dat);
  writeFileSync(join(dir, 'features.json'), JSON.stringify(f, null, 2) + '\n');
  console.log(`${PART.name} (${dat.split('\n').length} lines), features.json`);
}
