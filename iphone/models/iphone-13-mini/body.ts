// The iPhone 13 mini as a thing to place and look through: its generated part, its body for contact and its cameras
// read back from wherever it's put (the family's iphone/body.ts on this model).
import { join } from 'node:path';
import type { M3, V3 } from '../../../src/geom.ts';
import { cameras as camerasOf, contactBody, intoCone, placed, type Camera } from '../../body.ts';
import { phone as drawing } from './drawing.ts';
import { build, model, PART } from './part.ts';

export { intoCone, type Camera };

export const PHONE = PART.name;
export const PHONE_FILE = join(import.meta.dirname, PHONE);

const built = build();
export const phoneDat = built.dat;
export const features = built.features as any;
export const T = drawing.body.thickness.mm;

/** The phone for contact: see contactBody. */
export const phone = contactBody(drawing, model, phoneDat);
export const placedPhone = (m: M3, t: V3): V3[] => placed(phone, m, t);
export const cameras = (m: M3, t: V3, view: V3): Camera[] => camerasOf(drawing, features, m, t, view);
