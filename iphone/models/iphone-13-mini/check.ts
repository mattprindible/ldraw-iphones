// Lays the part over the drawing (the family's iphone/check.ts): Detail Y (the back, its cameras and bump), the front
// view (the display and its notch, the receiver, the buttons in profile) and the bottom view (the holes and the port).
// Black where they agree, blue the drawing only, red the part only. Also renders the whole phone three ways.
//
//   node iphone-13-mini/check.ts   → iphone-13-mini/renders/ (detail-y-, front-view- and bottom-view-overlay.png;
//                                    back, front, side)
import { join } from 'node:path';
import { check } from '../../check.ts';
import { PHONE, phoneDat } from './body.ts';
import { body, bottomView, detailY, frontView } from './drawing.ts';
import { PDF } from './measure.ts';

const OUT = join(import.meta.dirname, 'renders');
await check({
  pdf: PDF,
  out: OUT,
  file: PHONE,
  dat: phoneDat,
  W: body.width.mm,
  L: body.length.mm,
  overlays: [
    { name: 'detail-y', view: 'back', region: detailY, reduce: 4 },
    { name: 'front-view', view: 'front', region: frontView, reduce: 2 },
    { name: 'bottom-view', view: 'bottom', region: bottomView, reduce: 1 },
  ],
});
console.log(`renders → ${OUT}: detail-y-, front-view-, bottom-view-overlay.png (black: both; blue: the drawing only; red: the part only), back, front, side`);
