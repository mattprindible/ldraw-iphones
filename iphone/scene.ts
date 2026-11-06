// Every model in the standard poses, each camera's height read back from the scene and set against the same height
// worked by hand from its drawing's printed numbers.
//
//   node iphone/scene.ts   → a table, and iphone/camera-heights.json
//
// The poses are the ones whose heights follow from the printed numbers alone:
//   upright      on its bottom edge, top up            by hand: length − the camera's distance from the top
//   upside down  on its top edge                       by hand: the camera's distance from the top
//   flat         on its screen, cameras up             by hand: the cone apex's distance from the front
// Each phone is set on the floor by its lowest point. Each camera's optical reference (its keepout cone's apex,
// features.json) is carried through the placement by iphone/body.ts and its height read off. The poses on its sides
// are left out: there a phone rests on its own buttons and rocks, which no printed number gives.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { apply, axes, type M3, type V3 } from '../src/geom.ts';
import { belowFloor } from '../src/place.ts';
import { cameras, contactBody } from './body.ts';
import { MODELS, type Model } from './models.ts';
import { iphone } from './part.ts';

/** Part +Y (the back) → world +X, part +Z (the top) → world up (-Y): upright, camera facing +X. */
const UPRIGHT = axes([0, 0, -1], [1, 0, 0], [0, -1, 0]);
/** Turned end over end about world X: on its top edge. */
const UPSIDE_DOWN = axes([0, 0, 1], [1, 0, 0], [0, 1, 0]);
/** Part +Y (the back) → world up: flat on its screen. */
const FLAT = axes([0, 0, 1], [0, -1, 0], [1, 0, 0]);
const VIEW: V3 = [0, 0, -1];

export const POSES = ['upright', 'upside down', 'flat'] as const;

export interface Reading {
  pose: (typeof POSES)[number];
  camera: string;
  label: string;
  /** Read back from the placed phone, mm above the floor. */
  scene: number;
  /** Worked from the drawing's printed numbers. */
  hand: number;
  how: string;
}

export interface PhoneScene {
  title: string;
  readings: Reading[];
  /** Anything of the phone more than 0.05 mm below the floor, in any pose (should be empty). */
  belowFloor: string[];
}

/** The model in the standard poses, every camera read back and worked by hand. */
export function phoneScene(m: Model): PhoneScene {
  const p = m.phone;
  const model = iphone(p);
  const { dat, features } = model.build();
  const body = contactBody(p, model, dat);
  const L = p.body.length.mm;
  const onFloor = (r: M3): V3 => [0, -Math.max(...body.points.map((q) => apply(r, q)[1])), 0];

  const readings: Reading[] = [];
  const below = new Set<string>();
  const read = (pose: Reading['pose'], r: M3, hand: (c: (typeof p.cameras)[string]) => [number, string]) => {
    const t = onFloor(r);
    for (const b of belowFloor(body, r, t, [], 'phone')) below.add(`${pose}: ${b}`);
    for (const c of cameras(p, features, r, t, VIEW)) {
      const [h, how] = hand(p.cameras[c.key]);
      readings.push({ pose, camera: c.key, label: c.name, scene: c.height, hand: h, how });
    }
  };

  read('upright', UPRIGHT, (c) => [L - c.fromTop.mm, `${L} − ${c.fromTop.mm}`]);
  read('upside down', UPSIDE_DOWN, (c) => [c.fromTop.mm, `${c.fromTop.mm}`]);
  read('flat', FLAT, (c) => [c.coneApexFromFront.mm, `${c.coneApexFromFront.mm}`]);

  return { title: p.part.title, readings, belowFloor: [...below] };
}

if (import.meta.main) {
  const all = MODELS.map(phoneScene);
  const cell = (r: Reading) => `${r.scene.toFixed(2).padStart(7)} (${r.hand.toFixed(2)})`;
  console.log('camera heights above the floor, mm: scene (by hand), worst |Δ| over every camera and pose\n');
  console.log(`${'model'.padEnd(27)}${'camera'.padEnd(12)}${'upright'.padStart(17)}${'upside down'.padStart(17)}${'flat'.padStart(15)}   worst Δ`);
  for (const s of all) {
    const worst = Math.max(...s.readings.map((r) => Math.abs(r.scene - r.hand)));
    [...new Set(s.readings.map((r) => r.camera))].forEach((k, i) => {
      const at = (pose: Reading['pose']) => s.readings.find((r) => r.camera === k && r.pose === pose)!;
      console.log(`${(i ? '' : s.title).padEnd(27)}${at('upright').label.padEnd(12)}${cell(at('upright')).padStart(17)}${cell(at('upside down')).padStart(17)}${cell(at('flat')).padStart(15)}${i ? '' : `   ${worst.toExponential(1)}`}`);
    });
    if (s.belowFloor.length) console.log(`  BELOW THE FLOOR: ${s.belowFloor.join(', ')}`);
  }
  const round = (n: number) => Math.round(n * 1000) / 1000;
  const out = all.map((s) => ({
    title: s.title,
    cameras: Object.fromEntries(
      [...new Set(s.readings.map((r) => r.camera))].map((k) => [
        k,
        Object.fromEntries(s.readings.filter((r) => r.camera === k).map((r) => [r.pose, { scene: round(r.scene), hand: round(r.hand), how: r.how }])),
      ]),
    ),
  }));
  writeFileSync(join(import.meta.dirname, 'camera-heights.json'), JSON.stringify(out, null, 2) + '\n');
  console.log('\n→ iphone/camera-heights.json');
}
