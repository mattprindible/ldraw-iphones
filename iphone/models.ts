// Every iPhone model built here: its drawing (the numbers), its folder (its .dat and features.json), and its
// re-measurement against its PDF. The library and the family's tests read this list.
import { join } from 'node:path';
import type { Measured } from './measure.ts';
import type { Phone } from './drawing.ts';
import { iphone } from './part.ts';
import * as i12_mini from './models/iphone-12-mini/drawing.ts';
import * as i12_minim from './models/iphone-12-mini/measure.ts';
import * as i12 from './models/iphone-12/drawing.ts';
import * as i12m from './models/iphone-12/measure.ts';
import * as i12_pro from './models/iphone-12-pro/drawing.ts';
import * as i12_prom from './models/iphone-12-pro/measure.ts';
import * as i12_pro_max from './models/iphone-12-pro-max/drawing.ts';
import * as i12_pro_maxm from './models/iphone-12-pro-max/measure.ts';
import * as i13_mini from './models/iphone-13-mini/drawing.ts';
import * as i13_minim from './models/iphone-13-mini/measure.ts';
import * as i13 from './models/iphone-13/drawing.ts';
import * as i13m from './models/iphone-13/measure.ts';
import * as i13_pro from './models/iphone-13-pro/drawing.ts';
import * as i13_prom from './models/iphone-13-pro/measure.ts';
import * as i13_pro_max from './models/iphone-13-pro-max/drawing.ts';
import * as i13_pro_maxm from './models/iphone-13-pro-max/measure.ts';
import * as i14 from './models/iphone-14/drawing.ts';
import * as i14m from './models/iphone-14/measure.ts';
import * as i14_plus from './models/iphone-14-plus/drawing.ts';
import * as i14_plusm from './models/iphone-14-plus/measure.ts';
import * as i14_pro from './models/iphone-14-pro/drawing.ts';
import * as i14_prom from './models/iphone-14-pro/measure.ts';
import * as i14_pro_max from './models/iphone-14-pro-max/drawing.ts';
import * as i14_pro_maxm from './models/iphone-14-pro-max/measure.ts';
import * as i15 from './models/iphone-15/drawing.ts';
import * as i15m from './models/iphone-15/measure.ts';
import * as i15_plus from './models/iphone-15-plus/drawing.ts';
import * as i15_plusm from './models/iphone-15-plus/measure.ts';
import * as i15_pro from './models/iphone-15-pro/drawing.ts';
import * as i15_prom from './models/iphone-15-pro/measure.ts';
import * as i15_pro_max from './models/iphone-15-pro-max/drawing.ts';
import * as i15_pro_maxm from './models/iphone-15-pro-max/measure.ts';
import * as i16 from './models/iphone-16/drawing.ts';
import * as i16m from './models/iphone-16/measure.ts';
import * as i16_plus from './models/iphone-16-plus/drawing.ts';
import * as i16_plusm from './models/iphone-16-plus/measure.ts';
import * as i16_pro from './models/iphone-16-pro/drawing.ts';
import * as i16_prom from './models/iphone-16-pro/measure.ts';
import * as i16_pro_max from './models/iphone-16-pro-max/drawing.ts';
import * as i16_pro_maxm from './models/iphone-16-pro-max/measure.ts';
import * as i16e from './models/iphone-16e/drawing.ts';
import * as i16em from './models/iphone-16e/measure.ts';
import * as i17 from './models/iphone-17/drawing.ts';
import * as i17m from './models/iphone-17/measure.ts';
import * as iair from './models/iphone-air/drawing.ts';
import * as iairm from './models/iphone-air/measure.ts';
import * as i17_pro from './models/iphone-17-pro/drawing.ts';
import * as i17_prom from './models/iphone-17-pro/measure.ts';
import * as i17_pro_max from './models/iphone-17-pro-max/drawing.ts';
import * as i17_pro_maxm from './models/iphone-17-pro-max/measure.ts';
import * as i17e from './models/iphone-17e/drawing.ts';
import * as i17em from './models/iphone-17e/measure.ts';
import * as i18_pro from './models/iphone-18-pro/drawing.ts';
import * as i18_prom from './models/iphone-18-pro/measure.ts';
import * as i18_pro_max from './models/iphone-18-pro-max/drawing.ts';
import * as i18_pro_maxm from './models/iphone-18-pro-max/measure.ts';
import * as iduo from './models/iphone-duo/drawing.ts';
import * as iduom from './models/iphone-duo/measure.ts';
import * as ise3 from './models/iphone-se-3rd-generation/drawing.ts';
import * as ise3m from './models/iphone-se-3rd-generation/measure.ts';

export interface Model {
  phone: Phone;
  /** The folder its files are generated into. */
  dir: string;
  remeasure: () => Measured[];
  hasPdf: () => boolean;
}

const at = (folder: string) => join(import.meta.dirname, 'models', folder);

export const MODELS: Model[] = [
  { phone: i12_mini.phone, dir: at('iphone-12-mini'), remeasure: () => i12_minim.remeasure(), hasPdf: i12_minim.hasPdf },
  { phone: i12.phone, dir: at('iphone-12'), remeasure: () => i12m.remeasure(), hasPdf: i12m.hasPdf },
  { phone: i12_pro.phone, dir: at('iphone-12-pro'), remeasure: () => i12_prom.remeasure(), hasPdf: i12_prom.hasPdf },
  { phone: i12_pro_max.phone, dir: at('iphone-12-pro-max'), remeasure: () => i12_pro_maxm.remeasure(), hasPdf: i12_pro_maxm.hasPdf },
  { phone: i13_mini.phone, dir: at('iphone-13-mini'), remeasure: () => i13_minim.remeasure(), hasPdf: i13_minim.hasPdf },
  { phone: i13.phone, dir: at('iphone-13'), remeasure: () => i13m.remeasure(), hasPdf: i13m.hasPdf },
  { phone: i13_pro.phone, dir: at('iphone-13-pro'), remeasure: () => i13_prom.remeasure(), hasPdf: i13_prom.hasPdf },
  { phone: i13_pro_max.phone, dir: at('iphone-13-pro-max'), remeasure: () => i13_pro_maxm.remeasure(), hasPdf: i13_pro_maxm.hasPdf },
  { phone: i14.phone, dir: at('iphone-14'), remeasure: () => i14m.remeasure(), hasPdf: i14m.hasPdf },
  { phone: i14_plus.phone, dir: at('iphone-14-plus'), remeasure: () => i14_plusm.remeasure(), hasPdf: i14_plusm.hasPdf },
  { phone: i14_pro.phone, dir: at('iphone-14-pro'), remeasure: () => i14_prom.remeasure(), hasPdf: i14_prom.hasPdf },
  { phone: i14_pro_max.phone, dir: at('iphone-14-pro-max'), remeasure: () => i14_pro_maxm.remeasure(), hasPdf: i14_pro_maxm.hasPdf },
  { phone: i15.phone, dir: at('iphone-15'), remeasure: () => i15m.remeasure(), hasPdf: i15m.hasPdf },
  { phone: i15_plus.phone, dir: at('iphone-15-plus'), remeasure: () => i15_plusm.remeasure(), hasPdf: i15_plusm.hasPdf },
  { phone: i15_pro.phone, dir: at('iphone-15-pro'), remeasure: () => i15_prom.remeasure(), hasPdf: i15_prom.hasPdf },
  { phone: i15_pro_max.phone, dir: at('iphone-15-pro-max'), remeasure: () => i15_pro_maxm.remeasure(), hasPdf: i15_pro_maxm.hasPdf },
  { phone: i16.phone, dir: at('iphone-16'), remeasure: () => i16m.remeasure(), hasPdf: i16m.hasPdf },
  { phone: i16_plus.phone, dir: at('iphone-16-plus'), remeasure: () => i16_plusm.remeasure(), hasPdf: i16_plusm.hasPdf },
  { phone: i16_pro.phone, dir: at('iphone-16-pro'), remeasure: () => i16_prom.remeasure(), hasPdf: i16_prom.hasPdf },
  { phone: i16_pro_max.phone, dir: at('iphone-16-pro-max'), remeasure: () => i16_pro_maxm.remeasure(), hasPdf: i16_pro_maxm.hasPdf },
  { phone: i16e.phone, dir: at('iphone-16e'), remeasure: () => i16em.remeasure(), hasPdf: i16em.hasPdf },
  { phone: i17.phone, dir: at('iphone-17'), remeasure: () => i17m.remeasure(), hasPdf: i17m.hasPdf },
  { phone: iair.phone, dir: at('iphone-air'), remeasure: () => iairm.remeasure(), hasPdf: iairm.hasPdf },
  { phone: i17_pro.phone, dir: at('iphone-17-pro'), remeasure: () => i17_prom.remeasure(), hasPdf: i17_prom.hasPdf },
  { phone: i17_pro_max.phone, dir: at('iphone-17-pro-max'), remeasure: () => i17_pro_maxm.remeasure(), hasPdf: i17_pro_maxm.hasPdf },
  { phone: i17e.phone, dir: at('iphone-17e'), remeasure: () => i17em.remeasure(), hasPdf: i17em.hasPdf },
  { phone: i18_pro.phone, dir: at('iphone-18-pro'), remeasure: () => i18_prom.remeasure(), hasPdf: i18_prom.hasPdf },
  { phone: i18_pro_max.phone, dir: at('iphone-18-pro-max'), remeasure: () => i18_pro_maxm.remeasure(), hasPdf: i18_pro_maxm.hasPdf },
  { phone: iduo.phone, dir: at('iphone-duo'), remeasure: () => iduom.remeasure(), hasPdf: iduom.hasPdf },
  { phone: ise3.phone, dir: at('iphone-se-3rd-generation'), remeasure: () => ise3m.remeasure(), hasPdf: ise3m.hasPdf },
];

/** A model's generated files, as its part.ts writes them. */
export function files(m: Model): { dat: string; features: string } {
  const { dat, features } = iphone(m.phone).build();
  return { dat, features: JSON.stringify(features, null, 2) + '\n' };
}
