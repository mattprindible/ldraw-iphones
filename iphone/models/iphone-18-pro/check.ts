// Lays the part over the drawing (the family's iphone/check.ts): Detail D (the back), the front view and the bottom
// view. Black where they agree, blue the drawing only, red the part only. Also renders the whole phone three ways.
//
//   node iphone-18-pro/check.ts   → iphone-18-pro/renders/ (detail-d-, front-view- and bottom-view-overlay.png; back, front, side)
import { join } from 'node:path';
import { check } from '../../check.ts';
import { body, bottomView, detailD, frontView } from './drawing.ts';
import { PDF } from './measure.ts';
import { build, PART } from './part.ts';

const OUT = join(import.meta.dirname, 'renders');
await check({
  pdf: PDF,
  out: OUT,
  file: PART.name,
  dat: build().dat,
  W: body.width.mm,
  L: body.length.mm,
  overlays: [
    { name: 'detail-d', view: 'back', region: detailD, reduce: 4 },
    { name: 'front-view', view: 'front', region: frontView, reduce: 2 },
    { name: 'bottom-view', view: 'bottom', region: bottomView, reduce: 1 },
  ],
});
console.log(`renders → ${OUT}: detail-d-, front-view-, bottom-view-overlay.png (black: both; blue: the drawing only; red: the part only), back, front, side`);
