// A drawn part as a body to place: its convex pieces (convex.ts) for contact, and its own surface points, for its
// bounds and the floor check. Placements are (m, t) in mm, LDraw's world (-Y up, the floor at y 0): world = m·p + t.
import { add, apply, type M3, type V3 } from './geom.ts';
import type { Piece } from './convex.ts';

/** A drawn part to place: its convex body, and its own surface points (for its bounds and its floor check). */
export interface Body {
  pieces: Piece[];
  points: V3[];
}

/** Something else in the scene, as points in world mm. */
export interface Obstacle {
  label: string;
  points: V3[];
}

const placedPoints = (body: Body, m: M3, t: V3) => body.points.map((p) => add(apply(m, p), t));

/** Labels of the obstacles (and the body itself, as `self`) with any point more than 0.05 mm below the floor (y 0). */
export function belowFloor(body: Body, m: M3, t: V3, obs: Obstacle[], self: string): string[] {
  return [...obs, { label: self, points: placedPoints(body, m, t) }].filter((o) => o.points.some((p) => p[1] > 0.05)).map((o) => o.label);
}
