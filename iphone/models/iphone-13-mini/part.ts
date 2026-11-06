// The iPhone 13 mini as an LDraw part and a features file: the family's builder (iphone/part.ts) on its drawing.
//
//   node iphone-13-mini/part.ts   → iphone-13-mini/iphone-13-mini.dat, iphone-13-mini/features.json
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { iphone, LDU_PER_MM } from '../../part.ts';
import { phone } from './drawing.ts';

export { LDU_PER_MM };
export { stadium } from '../../part.ts';

/** The part as LDraw's tools list it. */
export const PART = phone.part;
export const model = iphone(phone);
export const { onBack, outline, roundedRect, bumpRings, activeArea, receiverSlot, buttonOutline, bottomOpenings, heights, build, pinhole } = model;

if (import.meta.main) {
  const { dat, features: f } = build();
  const dir = import.meta.dirname;
  writeFileSync(join(dir, PART.name), dat);
  writeFileSync(join(dir, 'features.json'), JSON.stringify(f, null, 2) + '\n');
  console.log(`${PART.name} (${dat.split('\n').length} lines), features.json`);
}
