// An iPhone as a thing to place and look through: its body for contact (src/convex.ts) and its cameras read back from
// wherever it's put, for any model of the family.
import { box, prism, type Piece } from '../src/convex.ts';
import { add, apply, dot, sub, type M3, type V3 } from '../src/geom.ts';
import { faceVertices } from '../src/ldraw.ts';
import type { Body } from '../src/place.ts';
import type { Button, Phone } from './drawing.ts';
import type { iphone } from './part.ts';

/** Camera colours in drawings and legends, in the drawing's order. */
const COLOURS = ['#c0392b', '#1f6fb2', '#1e8449', '#7d3c98'];

/**
 * The phone for contact: the slab between screen and back glass inside the plan outline, the bump as a box up to the
 * lens rings (its rounded corners counted in: a little generous), and each button as a box standing proud of its side
 * (its round ends counted in, likewise). The edges' rounding (the edge profile, under 1 mm) is left out, so the body's edges
 * are sharp where the phone's are round.
 */
export function contactBody(phone: Phone, model: ReturnType<typeof iphone>, dat: string): Body {
  const { body: dims, bump, buttons } = phone;
  const { buttonOutline, outline } = model;
  const [W, L, T] = [dims.width.mm, dims.length.mm, dims.thickness.mm];
  const b0 = bump.baseFrom.mm, bt = (bump.baseFromTop ?? bump.baseFrom).mm;
  const [bx, by] = [b0 + bump.baseSize.mm, bt + (bump.baseHeight ?? bump.baseSize).mm];
  const button = (b: Button): Piece => {
    const { ring, x, out } = buttonOutline(b);
    const [zs, ys] = [ring.map((p) => p[0]), ring.map((p) => p[1])];
    const [x0, x1] = [x, x + out * b.proud.mm].sort((p, q) => p - q);
    return box([x0, Math.min(...ys), Math.min(...zs)], [x1, Math.max(...ys), Math.max(...zs)]);
  };
  return {
    pieces: [
      prism(outline(), -T / 2, T / 2),
      box([W / 2 - bx, T / 2, L / 2 - by], [W / 2 - b0, T / 2 + bump.rings.mm, L / 2 - bt]),
      // A plateau across the top: a box its width, down to its bottom edge (its rounded corners counted in).
      ...(phone.plateau
        ? [box([-W / 2 + phone.plateau.inset.mm, T / 2 - 0.5, L / 2 - phone.plateau.bottom.mm], [W / 2 - phone.plateau.inset.mm, T / 2 + phone.plateau.height.mm, L / 2 - phone.plateau.inset.mm])]
        : []),
      ...Object.values(buttons).map(button),
    ],
    points: faceVertices(dat),
  };
}

export const placed = (body: Body, m: M3, t: V3): V3[] => body.points.map((p) => add(apply(m, p), t));

// ---------------------------------------------------------------- cameras, read back from a placement

/** A camera's optical reference and axis, its field of view (degrees) in the drawing's plane, and its colour in drawings. */
export interface Cone {
  name: string;
  apex: V3;
  axis: V3;
  fov: number;
  colour: string;
}

export interface Camera extends Cone {
  key: string;
  height: number;
  /** Degrees above the horizontal (negative: looking down). */
  pitch: number;
  /** The keepout cone's half angle, degrees. */
  keepout: number;
}

/**
 * The rear cameras of the phone placed at (m, t): each one's optical reference (its keepout cone's apex), its axis,
 * height and pitch, and its field of view in the plane square to `view` (the drawing's).
 */
export function cameras(phone: Phone, features: any, m: M3, t: V3, view: V3): Camera[] {
  return Object.entries(phone.cameras).map(([key, cam], i) => {
    const f = features.cameras[key];
    const axis = apply(m, f.axis as V3);
    // The image's long side runs along the phone's length (part Z): if that lies in the drawing's plane, the long FOV.
    const length = apply(m, [0, 0, 1]);
    const apex = add(apply(m, f.coneApex.mm as V3), t);
    return {
      key,
      name: cam.label,
      apex,
      axis,
      height: -apex[1],
      pitch: (Math.atan2(-axis[1], Math.hypot(axis[0], axis[2])) * 180) / Math.PI,
      fov: Math.abs(dot(length, view)) < 0.5 ? f.fieldOfView.long : f.fieldOfView.short,
      keepout: cam.keepoutCone.mm / 2,
      colour: COLOURS[i % COLOURS.length],
    };
  });
}

/** How far inside a camera's keepout cone a point is: positive degrees inside, negative outside. */
export function intoCone(c: Camera, p: V3): number {
  const d = sub(p, c.apex);
  const len = Math.hypot(...d);
  if (len < 1e-9) return c.keepout;
  return c.keepout - (Math.acos(Math.max(-1, Math.min(1, dot(d, c.axis) / len))) * 180) / Math.PI;
}
