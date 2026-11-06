import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { audit, badConditionals } from '../../../src/ldraw.ts';
import { body, bottom, buttons, cameras, front } from './drawing.ts';
import { activeArea, bottomOpenings, build, buttonOutline, LDU_PER_MM, outline, pinhole, receiverSlot } from './part.ts';

const near = (a: number, b: number, tol = 1e-6, what = '') => assert.ok(Math.abs(a - b) <= tol, `${what} ${a} ≠ ${b} (±${tol})`);
const W = body.width.mm, L = body.length.mm;

test('the corner passes through every point of Detail X, at all four corners, and stays inside the body', () => {
  const o = outline();
  for (const [s, t] of body.corner.points)
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, -1], [-1, 1]]) {
      const p = [sx * (W / 2 - s), sz * (L / 2 - t)];
      assert.ok(o.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-9), `corner point (${s}, ${t}) at (${sx}, ${sz})`);
    }
  for (const [x, z] of o) assert.ok(Math.abs(x) <= W / 2 + 1e-9 && Math.abs(z) <= L / 2 + 1e-9, `(${x}, ${z}) outside`);
});

test("the part's extent is the drawing's: 64.21 x 131.50 and the buttons proud of it, from the screen to the lens rings (7.65 + 2.51)", () => {
  const { dat } = build();
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const line of dat.split('\n').filter((l) => /^[234] /.test(l))) {
    const n = line.split(' ').slice(2).map(Number);
    for (let i = 0; i < n.length; i += 3)
      for (let k = 0; k < 3; k++) [min[k], max[k]] = [Math.min(min[k], n[i + k]), Math.max(max[k], n[i + k])];
  }
  const mm = (ldu: number) => ldu / LDU_PER_MM;
  // Across: the ring/silent switch stands 0.60 proud of the volume side (-X), the side button 0.45 of the other.
  near(mm(min[0]), -64.21 / 2 - 0.6, 0.001, 'over the ring/silent switch');
  near(mm(max[0]), 64.21 / 2 + 0.45, 0.001, 'over the side button');
  near(mm(max[2]) - mm(min[2]), 131.5, 0.001, 'length');
  near(mm(min[1]), -7.65 / 2, 0.001, 'screen');
  near(mm(max[1]), 7.65 / 2 + 2.51, 0.001, 'lens rings');
});

test('the rear mic sits where Detail Y puts it, flush on the bump\'s top', () => {
  const m = (build().features as any).rearMic;
  near(W / 2 - m.mm[0], 9.4, 1e-3, 'from the side-button edge');
  near(L / 2 - m.mm[2], 24.66, 1e-3, 'from the top');
  near(m.mm[1] - 7.65 / 2, 1.48, 1e-3, 'on the bump\'s top, 1.48 above the back glass');
  near(m.diameter, 2.4, 1e-9, 'diameter');
});

test('the cameras sit where Detail Y and sections F-F and G-G put them', () => {
  const f = build().features as any;
  for (const [key, side, top, apex] of [['ultraWide', 10.85, 10.85, 7.81], ['main', 23.21, 23.21, 6.33]] as const) {
    const c = f.cameras[key];
    near(W / 2 - c.window.mm[0], side, 1e-3, `${key} from the side-button edge`);
    near(L / 2 - c.window.mm[2], top, 1e-3, `${key} from the top`);
    near(c.coneApex.mm[1] - -7.65 / 2, apex, 1e-3, `${key} cone apex from the front face`);
    near(c.window.mm[1] - 7.65 / 2, 2.51, 1e-3, `${key} window above the back glass`);
    near(c.window.ldu[0], c.window.mm[0] * LDU_PER_MM, 1e-3, `${key} LDU`);
  }
  // The camera centres lie on the diagonal, 12.36 apart each way.
  near(f.cameras.ultraWide.window.mm[0] - f.cameras.main.window.mm[0], 12.36, 1e-3);
});

test('a pinhole from a diagonal field of view', () => {
  // The Main's 26 mm equivalent: 2·atan(43.27 / 52) = 79.5° across the diagonal.
  const diag = (2 * Math.atan(Math.hypot(36, 24) / 2 / cameras.main.equivalentFocal.mm) * 180) / Math.PI;
  near(diag, 79.52, 0.01);
  const p = pinhole(diag);
  near(p.long, 67.28, 0.02, 'long side');
  near(p.short, 53.06, 0.02, 'short side');
  near(pinhole(120).long, 108.36, 0.02, 'ultra wide, long side');
});

test('the display, its notch and the receiver are where the front view puts them', () => {
  const a = activeArea();
  const xs = a.map((p) => p[0]), zs = a.map((p) => p[1]);
  near(Math.max(...xs) - Math.min(...xs), 57.67, 1e-6, 'active width');
  near(Math.max(...zs), L / 2 - 3.27, 1e-6, 'active top');
  near(Math.max(...zs) - Math.min(...zs), 124.96, 1e-6, 'active length');
  // The notch: its walls 26.78 apart, its bottom 5.77 below the active area's top (9.04 below the product's).
  const notch = a.filter((p) => p[1] > L / 2 - 3.27 - 5.77 - 1e-6 && Math.abs(p[0]) < 26.78 / 2 + 0.87 + 1e-6);
  near(Math.min(...notch.map((p) => p[1])), L / 2 - 9.04, 1e-6, 'notch bottom');
  for (const sx of [-1, 1]) assert.ok(notch.some((p) => Math.abs(p[0] - (sx * 26.78) / 2) < 1e-6), `a notch wall at ${(sx * 26.78) / 2}`);
  // The receiver's slot, centred in the notch, inside the glass (1.05 from the top) and above the active area.
  const r = receiverSlot()!, rz = r.map((p) => p[1]);
  near(Math.max(...r.map((p) => p[0])) - Math.min(...r.map((p) => p[0])), front.receiverLength!.mm, 1e-6, 'receiver length');
  assert.ok(Math.max(...rz) < L / 2 - 1.05 && Math.min(...rz) > L / 2 - 3.27, 'receiver within the glass, above the display');
});

test('the buttons are where the side views put them, standing proud by the front view\'s amounts', () => {
  for (const [name, b] of Object.entries(buttons)) {
    const { ring, x, out } = buttonOutline(b);
    const z = ring.map((p) => p[0]), y = ring.map((p) => p[1]);
    near(L / 2 - (Math.max(...z) + Math.min(...z)) / 2, b.centre.mm, 1e-6, `${name} centre from the top`);
    near(Math.max(...z) - Math.min(...z), 2 * b.half.mm, 1e-6, `${name} length`);
    near(Math.max(...y) - Math.min(...y), b.width.mm, 1e-6, `${name} width`);
    near(7.65 / 2 - (Math.max(...y) + Math.min(...y)) / 2, b.fromBack.mm, 1e-6, `${name} from the back`);
    near(x, (out * W) / 2, 1e-9, `${name} on its side`);
  }
  // The ring/silent switch and the volume buttons on the volume side (-X), the side button on +X.
  assert.deepEqual(Object.values(buttons).map((b) => buttonOutline(b).out), [-1, -1, -1, 1]);
});

test('the bottom edge\'s holes and port are where the bottom view puts them (from the volume-button edge)', () => {
  const o = bottomOpenings();
  const centre = (r: [number, number][]) => [r.reduce((s, p) => s + p[0], 0) / r.length, r.reduce((s, p) => s + p[1], 0) / r.length];
  o.holes.forEach((h, i) => {
    const [x, y] = centre(h);
    near(x + W / 2, bottom.holes[i].mm, 1e-6, `hole ${i} across`);
    near(7.65 / 2 - y, 3.75, 1e-6, `hole ${i} from the back`);
  });
  const px = o.port.map((p) => p[0] + W / 2), py = o.port.map((p) => p[1]);
  near(Math.min(...px), 28.08, 1e-6, 'port near end');
  near(Math.max(...px), 36.13, 1e-6, 'port far end');
  near(Math.max(...py) - Math.min(...py), 2.3, 1e-6, 'port height');
});

test('the part is a sound LDraw part: no degenerate faces, flat convex quads, winding consistent and outward', () => {
  const a = audit(build().dat);
  assert.deepEqual({ degenerate: a.degenerate, warped: a.warped, concave: a.concave, inconsistent: a.inconsistent }, { degenerate: 0, warped: 0, concave: 0, inconsistent: 0 });
  assert.ok(a.volume > 0, 'outward');
  // Open edges only where one piece stands on another's face: the bump, the two rings and the flash on the back (196
  // edges), each button on its side (18 a stadium), the rear mic on the bump's top (48). The front, the bottom edge and
  // their recesses are closed.
  assert.equal(a.open, 196 + 4 * 18 + 48);
});

test("the header is LDraw's: title, file name, author, unofficial status, CC BY 4.0, BFC; and the curves have their outlines", () => {
  const { dat } = build();
  const lines = dat.split('\n');
  assert.equal(lines[0], '0 iPhone 13 mini');
  assert.equal(lines[1], '0 Name: iphone-13-mini.dat');
  assert.match(lines[2], /^0 Author: [A-Z][a-z]+ [A-Z][a-z]+ \[[a-z0-9_]+\]$/);
  assert.equal(lines[3], '0 !LDRAW_ORG Unofficial_Part');
  // The licence line exactly as LDraw's tools expect it, word for word.
  assert.equal(lines[4], '0 !LICENSE Licensed under CC BY 4.0 : see CAreadme.txt');
  assert.ok(lines.includes('0 BFC CERTIFY CCW'));
  assert.ok(lines.some((l) => /^0 !HISTORY \d{4}-\d{2}-\d{2} \[[a-z0-9_]+\] /.test(l)));
  const c = badConditionals(dat);
  assert.ok(c.count > 2000, `${c.count} conditional lines`);
  assert.equal(c.bad, 0);
});

test('the files on disk are current (run node iphone-13-mini/part.ts after changing drawing.ts)', () => {
  const { dat, features } = build();
  assert.equal(readFileSync(join(import.meta.dirname, 'iphone-13-mini.dat'), 'utf8'), dat);
  assert.equal(readFileSync(join(import.meta.dirname, 'features.json'), 'utf8'), JSON.stringify(features, null, 2) + '\n');
});
