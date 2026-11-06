// Lays a model's part over its drawing, view by view: the part rendered at the view's exact scale (an orthographic
// camera framed on the same region of the sheet) and the two composed so that agreement is black, the drawing alone
// blue and the part alone red (src/raster.ts's overlay). Also renders the whole phone three ways.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { LDU_PER_MM, mpd, placement } from '../src/ldraw.ts';
import { Renderer } from '../src/render/renderer.ts';
import { overlay, regionPng, type Calibration, type Region } from '../src/raster.ts';

/**
 * How each of the family's views turns the part to match the sheet, with the camera at -Z looking along +Z and the
 * image's right world +X, its up world -Y; and where its datum sits, as a function of the phone's width and length.
 */
export const VIEWS = {
  // The back toward the camera (part +Y → world -Z), the top up (part +Z → world -Y): the side-button edge (part +X)
  // on the left. Datum: the side-button edge and the top.
  back: { m: [-1, 0, 0, 0, 0, -1, 0, -1, 0], at: (W: number, L: number): [number, number] => [-W / 2, -L / 2] },
  // The screen toward the camera (part -Y → world -Z), the top up, the side-button edge on the right. Datum: the
  // volume edge and the top.
  front: { m: [1, 0, 0, 0, 0, -1, 0, 1, 0], at: (W: number, L: number): [number, number] => [-W / 2, -L / 2] },
  // The bottom edge toward the camera, the front up (part as world). Datum: the volume edge, mid-thickness.
  bottom: { m: [1, 0, 0, 0, 1, 0, 0, 0, 1], at: (W: number, _L: number): [number, number] => [-W / 2, 0] },
};

export interface Overlay {
  /** The files' stem: <name>.png (the sheet), <name>-part.png, <name>-overlay.png. */
  name: string;
  view: keyof typeof VIEWS;
  region: Region & Calibration;
  /** How much the sheet's region is reduced for the overlay. */
  reduce: number;
}

export async function check(o: { pdf: string; out: string; file: string; dat: string; W: number; L: number; overlays: Overlay[] }): Promise<void> {
  mkdirSync(o.out, { recursive: true });
  const model = (m: number[]) => mpd([placement(71, m, [0, 0, 0], o.file)], { [o.file]: o.dat });
  const r = await Renderer.start();
  try {
    for (const v of o.overlays) {
      const { m, at } = VIEWS[v.view];
      const datum = at(o.W, o.L);
      const [w, h] = [v.region.crop.width / v.reduce, v.region.crop.height / v.reduce];
      regionPng(o.pdf, v.region, join(o.out, `${v.name}.png`), w, h);
      // The region in world LDU: its mm coordinates from its datum, moved to where the datum sits in the world.
      const world = (px: number, k: 0 | 1) => ((px - v.region.origin[k]) / v.region.pxPerMm + datum[k]) * LDU_PER_MM;
      const frame = { min: [world(0, 0), world(0, 1), -200], max: [world(v.region.crop.width, 0), world(v.region.crop.height, 1), 200] };
      const res = await r.render(model(m), { width: w, height: h, view: [0, 0, -1], frame, padding: 1, lineArt: true });
      // The overlay only means something if the image's right is world +X and its up world -Y (else it's a mirror).
      const [right, up] = [res.camera.right, res.camera.up].map((x) => x.map((c) => Math.round(c)).join(','));
      if (right !== '1,0,0' || up !== '0,-1,0') throw new Error(`${v.name}'s axes are right ${right}, up ${up}: not +X and -Y`);
      writeFileSync(join(o.out, `${v.name}-part.png`), res.png);
      overlay(join(o.out, `${v.name}.png`), join(o.out, `${v.name}-part.png`), join(o.out, `${v.name}-overlay.png`));
    }
    for (const [name, view] of [['back', [0.5, 1, 0.9]], ['front', [-0.4, -1, -0.6]], ['side', [1, 0, 0.0001]]] as const) {
      const res = await r.render(model([1, 0, 0, 0, 1, 0, 0, 0, 1]), { width: 900, height: 700, view: [...view] });
      writeFileSync(join(o.out, `${name}.png`), res.png);
    }
  } finally {
    await r.close();
  }
}
