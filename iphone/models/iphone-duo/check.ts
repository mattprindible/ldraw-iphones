// Lays the part over the drawing (the family's iphone/check.ts): Detail D (the plateau), the back view, the front view
// and the bottom view. Black where they agree, blue the drawing only, red the part only. Also renders the whole phone
// three ways.
//
//   node iphone-duo/check.ts   → iphone-duo/renders/ (detail-d-, back-view-, front-view- and bottom-view-overlay.png; back, front, side)
import { join } from 'node:path';
import { check } from '../../check.ts';
import { backView, body, bottomView, detailD, frontView } from './drawing.ts';
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
    { name: 'back-view', view: 'back', region: backView, reduce: 2 },
    { name: 'front-view', view: 'front', region: frontView, reduce: 2 },
    { name: 'bottom-view', view: 'bottom', region: bottomView, reduce: 2 },
  ],
});
console.log(`renders → ${OUT}: detail-d-, back-view-, front-view-, bottom-view-overlay.png (black: both; blue: the drawing only; red: the part only), back, front, side`);
