// Every model placed in the standard poses (scene.ts): each camera's height, read back from the scene, is the height
// its drawing's printed numbers give, and nothing goes through the floor.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { MODELS } from './models.ts';
import { phoneScene } from './scene.ts';

const scenes = MODELS.map(phoneScene);

for (const s of scenes) {
  test(`${s.title}: every camera's height in every pose is the drawing's, read back from the scene`, () => {
    for (const r of s.readings) assert.ok(Math.abs(r.scene - r.hand) < 1e-3, `${r.pose}, ${r.label}: scene ${r.scene} ≠ by hand ${r.hand} (${r.how})`);
    assert.deepEqual(s.belowFloor, []);
  });
}

// Negative control: the comparison can tell the poses apart.
test('a camera read upright does not pass for one read upside down', () => {
  for (const s of scenes) {
    for (const up of s.readings.filter((r) => r.pose === 'upright')) {
      const down = s.readings.find((r) => r.pose === 'upside down' && r.camera === up.camera)!;
      assert.ok(Math.abs(up.scene - down.hand) > 1, `${s.title} ${up.label}: upright ${up.scene} would pass as upside down ${down.hand}`);
    }
  }
});

test('iphone/camera-heights.json is current (run node iphone/scene.ts)', () => {
  const onDisk = JSON.parse(readFileSync(join(import.meta.dirname, 'camera-heights.json'), 'utf8'));
  for (const s of scenes) {
    const d = onDisk.find((o: any) => o.title === s.title);
    assert.ok(d, `${s.title} missing`);
    for (const r of s.readings) assert.ok(Math.abs(d.cameras[r.camera][r.pose].scene - r.scene) < 1e-3, `${s.title} ${r.camera} ${r.pose}`);
  }
});
