// The builder's handling of shapes only some drawings give: a pill-shaped bump (a stadium), a flash on the back glass
// beside the bump, an edge profile whose last point is the face itself, a sensor window with its corners' radius, no
// SIM tray, a bump whose flank is curved (the Air's), and the rear mic and the flash's keepout. Each with its negative
// control.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { audit, LDU_PER_MM } from '../src/ldraw.ts';
import { phone as i15 } from './models/iphone-15/drawing.ts';
import { phone as i16 } from './models/iphone-16/drawing.ts';
import { phone as i12p } from './models/iphone-12-pro/drawing.ts';
import { phone as air } from './models/iphone-air/drawing.ts';
import { phone as i14p } from './models/iphone-14-pro/drawing.ts';
import { phone as i16e } from './models/iphone-16e/drawing.ts';
import { phone as i13p } from './models/iphone-13-pro/drawing.ts';
import { phone as se3 } from './models/iphone-se-3rd-generation/drawing.ts';
import type { Phone } from './drawing.ts';
import { iphone } from './part.ts';

const near = (a: number, b: number, tol: number, what: string) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} ≠ ${b} (±${tol})`);
const repeats = (ring: [number, number][]) => ring.filter((p, i) => Math.hypot(p[0] - ring[(i + 1) % ring.length][0], p[1] - ring[(i + 1) % ring.length][1]) < 1e-9).length;

test('a radius of half the width gives a stadium without repeated points; a smaller one keeps its straights', () => {
  const model = iphone(i16);
  assert.equal(repeats(model.roundedRect(0, 0, 20, 40, 10)), 0);
  assert.equal(model.roundedRect(0, 0, 20, 40, 10).length, 4 * 13 - 2);
  assert.equal(model.roundedRect(0, 0, 20, 40, 9.99).length, 4 * 13);
  const { base, top } = model.bumpRings();
  assert.deepEqual([repeats(base), repeats(top)], [0, 0]);
  assert.equal(audit(model.build().dat).degenerate, 0);
});

test('negative control: a stadium outline with a rounded-rectangle top is refused, not lofted wrongly', () => {
  const p: Phone = structuredClone(i16);
  p.bump.topRadius = { ...p.bump.topRadius, mm: p.bump.topRadius.mm - 1 };
  assert.throws(() => iphone(p).bumpRings(), /both be stadiums/);
});

test('a flash on the back glass sits at the glass; one on the bump at its top', () => {
  const T = i16.body.thickness.mm;
  const y = (p: Phone) => (iphone(p).build().features as any).flash.mm[1];
  assert.equal(y(i16), T / 2);
  const p: Phone = structuredClone(i16);
  delete p.flash.onGlass;
  assert.equal(y(p), T / 2 + i16.bump.top.mm);
});

test('an edge profile ending at the face (the 15\'s 3.905 of 7.81) builds as one ending just short of it', () => {
  const T = i15.body.thickness.mm;
  assert.equal(i15.body.edge.points.at(-1)![1], T / 2);
  const p: Phone = structuredClone(i15);
  p.body.edge.points = p.body.edge.points.map(([i, h]): [number, number] => [i, h === T / 2 ? T / 2 - 0.005 : h]);
  assert.equal(iphone(i15).build().dat, iphone(p).build().dat);
});

test("a sensor window takes its corners' radius where the drawing gives one (the 12 Pro's R1.96); without, a stadium", () => {
  const sensor = (p: Phone) => (iphone(p).build().features as any).sensor.window;
  assert.equal(sensor(i12p).cornerRadius, 1.96);
  const dat = iphone(i12p).build().dat;
  assert.match(dat, /LiDAR scanner: 4\.55 x 7\.55 window \(R1\.96\)/);
  const p: Phone = structuredClone(i12p);
  delete p.sensor!.window!.radius;
  assert.equal(sensor(p).cornerRadius, undefined);
  assert.notEqual(iphone(p).build().dat, dat);
  assert.equal(sensor(i13p).cornerRadius, undefined);
});

test('a phone without a SIM tray (the Air) has none; given one, it has it', () => {
  assert.doesNotMatch(iphone(air).build().dat, /SIM tray/);
  const p: Phone = structuredClone(air);
  p.simTray = structuredClone(i16.simTray);
  assert.match(iphone(p).build().dat, /SIM tray/);
});

/** The highest point of a part's faces on the vertical line through (x, z), in mm. */
function surface(dat: string, x: number, z: number): number {
  let best = -Infinity;
  for (const l of dat.split('\n')) {
    const n = l.trim().split(/\s+/);
    if (n[0] !== '3' && n[0] !== '4') continue;
    const p = n.slice(2).map((q) => Number(q) / LDU_PER_MM);
    const v = Array.from({ length: p.length / 3 }, (_, i) => p.slice(3 * i, 3 * i + 3));
    for (const [a, b, c] of v.length === 4 ? [[v[0], v[1], v[2]], [v[0], v[2], v[3]]] : [v]) {
      const d = (b[0] - a[0]) * (c[2] - a[2]) - (c[0] - a[0]) * (b[2] - a[2]);
      if (Math.abs(d) < 1e-12) continue;
      const u = ((x - a[0]) * (c[2] - a[2]) - (c[0] - a[0]) * (z - a[2])) / d;
      const w = ((b[0] - a[0]) * (z - a[2]) - (x - a[0]) * (b[2] - a[2])) / d;
      if (u >= -1e-9 && w >= -1e-9 && u + w <= 1 + 1e-9) best = Math.max(best, a[1] + u * (b[1] - a[1]) + w * (c[1] - a[1]));
    }
  }
  return best;
}

test("the Air's bump falls below its pill as the side view's flank does; a straight slope stands well above it", () => {
  const [L, T] = [air.body.length.mm, air.body.thickness.mm];
  const foot = air.bump.topFromTop!.mm + air.bump.topHeight!.mm; // the pill's bottom, 28.06 down
  const height = (dat: string, o: number) => surface(dat, 0.3, L / 2 - foot - o) - T / 2;
  const dat = iphone(air).build().dat;
  for (const [o, h] of air.bump.flank!.points) near(height(dat, o), h, 1e-3, `${o} below the pill`);
  const p: Phone = structuredClone(air);
  delete p.bump.flank;
  assert.ok(height(iphone(p).build().dat, 1.94) - 0.81 > 1.2, 'the straight slope, 30.00 down');
  assert.equal(audit(dat).inconsistent, 0);
});

test('negative control: a flank that stops short of the outline is refused', () => {
  const p: Phone = structuredClone(air);
  p.bump.flank!.points = p.bump.flank!.points.slice(0, -1).concat([[5, 0]]);
  assert.throws(() => iphone(p).build(), /flank must run/);
});

test("the rear mic lies on what its centre is on: the 14 Pro's bump top, the 16e's back glass; on a slope it's refused", () => {
  const y = (p: Phone) => (iphone(p).build().features as any).rearMic.mm[1];
  assert.equal(y(i14p), i14p.body.thickness.mm / 2 + i14p.bump.top.mm);
  assert.equal(y(i16e), i16e.body.thickness.mm / 2);
  assert.match(iphone(i14p).build().dat, /rear mic: Ø1\.15/);
  const p: Phone = structuredClone(i14p);
  p.rearMic!.fromSide = { ...p.rearMic!.fromSide, mm: (p.bump.baseFrom.mm + p.bump.topFrom.mm) / 2 };
  p.rearMic!.fromTop = { ...p.rearMic!.fromTop, mm: (p.bump.baseFrom.mm + p.bump.topFrom.mm) / 2 + 10 };
  assert.throws(() => iphone(p).build(), /on the bump's slope/);
});

test("the flash's keepout goes into features.json where a section gives it (the 12 Pro's), and nowhere else", () => {
  const k = (p: Phone) => (iphone(p).build().features as any).flash.keepout;
  assert.deepEqual([k(i12p).apexFromFront.mm, k(i12p).innerConeDeg.fullAngle, k(i12p).outerConeDeg.fullAngle, k(i12p).transitionFromFront.mm], [7.03, 135, 157, 11.29]);
  // Negative control: the same phone with no keepout recorded writes none.
  const bare: Phone = structuredClone(i12p);
  delete bare.flash.keepout;
  assert.equal(k(bare), undefined);
});

test("MagSafe's clear circle goes into features.json at the 16's product centre, and nowhere it isn't recorded", () => {
  const m = (p: Phone) => (iphone(p).build().features as any).magsafe;
  near(Math.hypot(m(i16).centre.mm[0], m(i16).centre.mm[2]), 0, 0.01, 'from the product centre');
  assert.equal(m(i16).clear.diameter, 57.5);
  // The zone's arc passes through the ends of its straight sides, at the phone's edges, and bulges below them.
  const z = m(i16).magneticZone, W = i16.body.width.mm;
  near(Math.hypot(W / 2, z.sidesToZ - z.arc.centre.mm[2]), z.arc.radius, 1e-3, 'the arc through the sides\' ends');
  assert.ok(z.arc.lowestZ < z.sidesToZ && z.zFrom > z.sidesToZ);
  assert.equal(m(se3), undefined); // the SE has Qi, not MagSafe
});
