// Every number read from a drawing carries where it came from and how we know it, so a model built from it can say
// which of its dimensions are the drawing's, which were measured off it, and which are assumptions to replace.

export type Kind =
  /** printed on the drawing */
  | 'dimensioned'
  /** measured off the drawing's geometry, calibrated on dimensioned features (src/raster.ts) */
  | 'scaled'
  /** computed from other values */
  | 'derived'
  /** the maker's published specifications */
  | 'spec'
  /** not from the maker; named so it can be replaced by a measurement */
  | 'third-party'
  /** a reading of the drawing it doesn't state outright; the reason is given */
  | 'inferred'
  /** chosen where the drawing is silent (a depth it doesn't give); named so it can be replaced by a measurement */
  | 'assumed';

export interface Value {
  mm: number;
  kind: Kind;
  from: string;
}

export const v = (mm: number, kind: Kind, from: string): Value => ({ mm, kind, from });

export const describe = (x: Value) => `${x.kind}: ${x.from}`;
