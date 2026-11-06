// iPhone 15 Plus, read from Apple's dimensional drawing (iphone/drawings/iphone-15-plus.pdf, sheets 1 and
// 2, dated 2023-10-10). Every number carries where it came from and how we know it (src/provenance.ts): spec here is
// Apple's technical specifications page (support.apple.com/111830); scaled values are re-measured by measure.ts.
//
// The iPhone 15 drawn larger, sheet for sheet: the same corner, the same back (Detail A's numbers are the 15's), the same
// cameras and cones, the same island height (6.07, 20.76 long for 20.68). What differs besides the size: Detail B's
// profile isn't symmetric (3.46 toward the front, 3.50 toward the back, both drawn where labelled), the receiver's
// length is dimensioned (14.54), the bottom has ten holes (4 + 6) and Ø1.50 screws, and the port is dimensioned 3.72
// tall on its outer outline. The SIM tray's 110.72 is the 15's number, as drawn. Every reading here was checked
// against 600 and 1200 dpi crops of sheets 1 and 2.
//
// As the 15's, lettered differently from the 15 Pro: Detail A is the back (the 15 Pro's D), B the
// edge profile, C the port, D the corner profile with the Dynamic Island and the receiver (the 15 Pro's A). Sheet 2
// has the keepout sections (H-H camera 1, G-G camera 2, J-J the flash), Detail E (front sensor keepouts) and the MagSafe
// view (the right-hand back view). The 13s' two diagonal cameras and ring/silent switch, with the 15 Pro's Dynamic
// Island and USB-C. The rear mic and J-J are the 15's numbers; MagSafe's arc is not (R52.49, on the product centre).
import type { Phone } from '../../drawing.ts';
import type { Calibration, Region } from '../../../src/raster.ts';
import { v, type Kind } from '../../../src/provenance.ts';

/** Where the scaled values were measured: regions of sheet 1 (PDF page 2) at 1200 dpi, each with its calibration. */
export const detailA: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 15722, y: 1060, width: 3000, height: 3000 }, pxPerMm: 69.14, origin: [250, 280] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5380, y: 4380, width: 2160, height: 4100 }, pxPerMm: 23.05, origin: [187.5, 193.5] };
export const bottomView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5360, y: 10000, width: 2200, height: 700 }, pxPerMm: 23.05, origin: [207.5, 356.5] };
/** Detail D (the corner, the island, the receiver), drawn about 1:1; calibrated on the corner's leaders (measure.ts). */
export const detailD: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 8940, y: 1290, width: 2700, height: 1400 }, pxPerMm: 46.1, origin: [211.6, 231.8] };
/** Detail B (the edge profile), about 5:1: calibrated on its symmetric leaders, ±1.62 to ±3.09 (measure.ts). */
export const detailB: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 2000, y: 9600, width: 1400, height: 1700 }, pxPerMm: 115.2, origin: [0, 815.6] };
/** Detail C (the port), about 2:1: calibrated across on the 12.45 keepout's extension lines (measure.ts). */
export const detailC: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 9000, y: 9600, width: 2400, height: 1400 }, pxPerMm: 45.7, origin: [1072, 979] };

/** The rear mic, at 4800 dpi in Detail A's frame (measure.ts carries the calibration over). */
export const micView: Region = { page: 2, dpi: 4800, crop: { x: 66662, y: 12401, width: 800, height: 800 } };
/**
 * Sheet 2 (PDF page 3) at 1200 dpi: Section J-J, the one section through the flash (Detail F: down the phone through
 * the flash's centre, drawn upright, the cover glass's face its left edge, `origin` across; down has no datum). Scaled
 * from that face to the 11.62 extension line: 46.08 px/mm, the 15's J-J scale. And the MagSafe view (the right-hand
 * back view) at 2400 dpi, drawn at the front view's scale (23.05 px/mm at 1200), calibrated on its 0.00 and 70.77 lines
 * across and its 0.00 and -115.72 lines down.
 */
export const sectionJJ: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 17287, y: 400, width: 1400, height: 3100 }, pxPerMm: 46.08, origin: [314, 0] };
export const magsafeView: Region & Calibration = { page: 3, dpi: 2400, crop: { x: 25300, y: 12650, width: 5100, height: 8550 }, pxPerMm: 46.095, origin: [662.5, 605] };

const s1 = (what: string) => `sheet 1, ${what}`;
const s2 = (what: string) => `sheet 2, ${what}`;

/**
 * Detail D gives eight points on the corner and none on its diagonal (the 15 Pro's seven include one), which the
 * builder's monotone halves meet at: the product outline's crossing of the corner's 45° diagonal, scaled.
 */
export const cornerDiagonal = v(3.64, 'scaled', 'Detail D: the product outline (the thin outer line the crosses sit on) crossed on the corner\'s 45° diagonal, at 4800 dpi; a circle through the four crosses nearest it gives 3.63');

export const body = {
  width: v(77.76, 'dimensioned', s1('front view: 77.76 PRODUCT WIDTH')),
  length: v(160.89, 'dimensioned', s1('front view: 160.89 PRODUCT LENGTH')),
  thickness: v(7.81, 'dimensioned', s1('right side view: 7.81, labelled PRODUCT WIDTH but spanning the thickness (Apple\'s spec: 7.80)')),
  glassWidth: v(75.76, 'dimensioned', s1('front view: 75.76 GLASS')),
  glassLength: v(158.89, 'dimensioned', s1('front view: 158.89 GLASS')),
  corner: {
    points: [
      [17.4, 0],
      [13.21, 0.04],
      [9.06, 0.59],
      [5.24, 2.29],
      [cornerDiagonal.mm, cornerDiagonal.mm],
      [2.29, 5.24],
      [0.59, 9.06],
      [0.04, 13.21],
      [0, 17.4],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail D: CORNER PROFILE (ALL FOUR CORNERS); each label paired with the cross its leader reaches (0.04 one stroke in from the 0.00 line); the diagonal point scaled (cornerDiagonal)'),
  },
  /**
   * Flat to ±2.12 (the boxed 0.00 covers ±1.62 and ±2.12), then rounding (to 3.46 at 0.40 in, where the back's is 3.50): to the front's flat 2.41 in (the front view's
   * 2.41 ALL AROUND, TO START OF FLAT AREA ON TOP SIDE), past the glass's edge (1.00 in), so the face starts there as on
   * the 16 Pro, at the full half-thickness (7.81 / 2 = 3.905).
   *
   * The back: Detail B draws it as the front (both curve on into the flat past 0.81), but the 2.41 is the TOP SIDE's,
   * and the bump's outline, 1.22 in, must stand on a flat back. So the back stops at 0.81 and steps the last 0.135 to
   * its glass at 1.00 in, as the 15 Pro's both faces do (an approximation: the drawing gives no number between).
   */
  edge: {
    points: [
      [0, 1.62],
      [0, 2.12],
      [0.02, 2.61],
      [0.13, 3.09],
      [0.4, 3.46],
      [0.81, 3.77],
      [2.41, 3.905],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail B: PROFILE (ALL SIDES); insets 0.00 (boxed), 2X 0.02, 2X 0.13, 2X 0.40, 2X 0.81 paired in order with 1.62, 2.12, 2.61, 3.09, 3.46, 3.77 (the front\'s side: the upper, as the bottom view); then the front view\'s 2.41 at the face (7.81 / 2)'),
  },
  /**
   * Toward the back: Detail B's lower labels, -3.50 where the upper reads 3.46. Not a misprint: the leaders are drawn
   * 3.46 and 3.50 from the middle (measure.ts, calibrated on the four symmetric pairs). The upper side is the front, as
   * in the bottom view Detail B is taken from (the bump hangs below it).
   */
  edgeBack: {
    points: [
      [0, 1.62],
      [0, 2.12],
      [0.02, 2.61],
      [0.13, 3.09],
      [0.4, 3.5],
      [0.81, 3.77],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail B: the lower labels -1.62, -2.12, -2.61, -3.09, -3.50, -3.77 with the same insets; the 2.41 flat is the front\'s (TOP SIDE), so the back steps to its glass at 1.00 in (assumed, as the 15 Pro)'),
  },
};

export const bump = {
  top: v(1.85, 'dimensioned', s1('right side view: 1.85 BACK GLASS TO CAMERA PLATEAU')),
  rings: v(3.48, 'dimensioned', s1('right side view: 3.48 BACK GLASS TO CAMERA GLASS')),
  baseFrom: v(1.22, 'dimensioned', s1('Detail A: 1.22 (across and down)')),
  baseSize: v(35.93, 'derived', s1('Detail A: 37.15 - 1.22')),
  baseRadius: v(11.7, 'scaled', 'Detail A: the outline\'s corners crossed on their diagonals'),
  topFrom: v(3.9, 'dimensioned', s1('Detail A: 3.90 (across and down)')),
  topSize: v(30.57, 'derived', s1('Detail A: 34.47 - 3.90')),
  topRadius: v(9.03, 'scaled', 'Detail A: the top\'s corners crossed on their diagonals'),
};

/** Which is which, from sheet 2's keepout cones: camera 1 the Ultra Wide (121.83°), camera 2 the Main (75.55°). */
export const cameras = {
  ultraWide: {
    name: 'rear camera 1',
    label: 'Ultra Wide',
    fromSide: v(12.73, 'dimensioned', s1('Detail A: 12.73 REAR CAMERA 1')),
    fromTop: v(12.73, 'dimensioned', s1('Detail A: -12.73')),
    ring: v(15.07, 'dimensioned', s1('Detail A: 2X Ø15.07')),
    window: v(12.52, 'scaled', 'Detail A: the innermost of the camera\'s circles'),
    coneApexFromFront: v(9.11, 'dimensioned', s2('Section H-H (cut through camera 1, Detail F): 9.11 REAR CAMERA 1 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(121.83, 'dimensioned', s2('Section H-H: 121.83° REAR CAMERA 1 KEEPOUT CONE')),
    identity: v(1, 'inferred', 'camera 1 is the Ultra Wide: its 121.83° cone encloses its 120° (spec); camera 2\'s 75.55° is the Main\'s (narrower than a 26 mm lens\'s 79.5° diagonal, so the cone isn\'t the full diagonal field)'),
    fov: v(120, 'spec', 'Ultra Wide: 12MP, 13 mm, ƒ/2.4 aperture, 120° field of view'),
    aperture: v(2.4, 'spec', 'Ultra Wide: ƒ/2.4'),
  },
  main: {
    name: 'rear camera 2',
    label: 'Main',
    fromSide: v(25.64, 'dimensioned', s1('Detail A: 25.64 REAR CAMERA 2')),
    fromTop: v(25.64, 'dimensioned', s1('Detail A: -25.64')),
    ring: v(15.07, 'dimensioned', s1('Detail A: 2X Ø15.07')),
    window: v(12.52, 'scaled', 'Detail A: the innermost of the camera\'s circles'),
    coneApexFromFront: v(6.9, 'dimensioned', s2('Section G-G (cut through camera 2, Detail F): 6.90 REAR CAMERA 2 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(75.55, 'dimensioned', s2('Section G-G: 75.55° REAR CAMERA 2 KEEPOUT CONE')),
    equivalentFocal: v(26, 'spec', '48MP Main: 26 mm, ƒ/1.6'),
    aperture: v(1.6, 'spec', 'Main: ƒ/1.6'),
  },
};

export const flash = {
  fromSide: v(27.32, 'dimensioned', s1('Detail A: 27.32 FLASH')),
  fromTop: v(11.06, 'dimensioned', s1('Detail A: -11.06')),
  diameter: v(6.28, 'dimensioned', s1('Detail A: Ø6.28 FLASH')),
};

/**
 * The flash's keepout, Section J-J (sheet 2): the 15's J-J, number for number (112.01°, 157.00°, 9.56, 11.62), drawn
 * on the Plus's own sheet (the section is drawn again, not copied: the phone's top end and the cone sit 340 rows lower
 * against the dimension lines than on the 15's sheet at 1200 dpi, and the hatching differs). An inner cone from the
 * strobe (the flash's face, drawn 0.10 under the bump's glass) turning at 11.62 from the cover glass into a 157° outer
 * cone. J-J is the only section through the flash (down the phone), so the inner cone is taken as circular, 112.01°
 * about the flash's axis (inferred: one section).
 *
 * Follow the arrows: 9.56 FLASH KEEPOUT CONE TO COVER GLASS runs from the section's left face (the cover glass) to an
 * extension line that runs down beside the bump's glass, 0.10 in from it, and on as the strobe's face between the inner
 * cone's two corners: the inner cone's base, not its apex. 9.56 is the bump's top (7.81 + 1.85 = 9.66) less the strobe's
 * 0.10 recess, and 11.62 is 9.66 + 1.96, as the 15's. "To cover glass" is from the front: both arrows start on the
 * section's left face, the bump on the right (measure.ts reads the back glass 7.81, the bump's glass 9.66 and camera 2's
 * ring 11.29 from it: the section is drawn on this phone's body). Neither number is the apex: it's worked from this
 * drawing's own numbers, the 112.01° cone through the flash's Ø6.28 edge at the bump's top, and the base's diameter at
 * 9.56 from the same cone. The family's field has no place for the base's distance (9.56): it's kept in
 * `flashKeepoutBase`.
 *
 * Drawn but not dimensioned (not recorded): the keepout's solid is closed by a line across the cone 13.61 from the front
 * (where the outer cone's lines end), and the inner cone's lines run on past the kinks as the 112.01° angle's
 * extension lines.
 */
export const flashKeepout = {
  inner: v(112.01, 'dimensioned', s2('Section J-J: 112.01° FLASH INNER KEEPOUT CONE (down the phone; the only section through the flash, so taken as circular)')),
  outer: v(157, 'dimensioned', s2('Section J-J: 157.00° FLASH OUTER KEEPOUT CONE')),
  transitionFromFront: v(11.62, 'dimensioned', s2('Section J-J: 11.62 FLASH KEEPOUT CONE TRANSITION TO COVER GLASS (its arrows on the section\'s front face and the kinks\' extension line)')),
  apexFromFront: v(7.54, 'derived', s2('Section J-J: not dimensioned; the 112.01° cone through the flash\'s Ø6.28 edge at the bump\'s top: 7.81 + 1.85 - 3.14 / tan 56.005°')),
  innerBaseDiameter: v(5.98, 'derived', s2('Section J-J: not dimensioned; the 112.01° cone at the strobe\'s face (9.56): 2 (9.56 - 7.543) tan 56.005°')),
};

/** What J-J gives beyond the family's field (not in features.json): the distance to the inner cone's base. */
export const flashKeepoutBase = {
  fromFront: v(9.56, 'dimensioned', s2('Section J-J: 9.56 FLASH KEEPOUT CONE TO COVER GLASS (its extension line runs on as the strobe\'s face between the inner cone\'s corners: the cone\'s base)')),
};

/**
 * The rear mic, on the bump's top (inside its top's bottom-left R9.03 corner, 2.06 from the corner's centre): Detail A's
 * numbers are the 15's. Across: the 11.47 ordinate below Detail A, whose extension line rises to the mic's centre
 * (between the bump's 3.90 and camera 2's 25.64); down: the -26.90 line runs in from the left to the mic's centre.
 *
 * The drawing of it is not the 15's: three concentric circles, Ø1.65, Ø2.07 (a heavier pen, 0.11 to the others' 0.08)
 * and Ø2.40, with eight short spokes between the inner two (the 15 draws two, Ø2.10 and 2.40; the 14's three, whose
 * Ø2.10 arrow lands on the outer). The Ø2.10 REAR MIC leader's arrow lands on the middle one (measured: the ink runs
 * unbroken from it outward on the arrow's rays, and the paper inside it shows), which the printed number matches within
 * its stroke: the mic Ø2.10. The inner circle (`rearMicInner`, a grille's edge, inferred) and the outer (`rearMicRing`)
 * aren't built. All three are drawn 0.035 below the -26.90 line (within the scan's 0.05).
 */
export const rearMic = {
  fromSide: v(11.47, 'dimensioned', s1('Detail A: 11.47 (the ordinate below the view; its extension line rises to the mic\'s centre)')),
  fromTop: v(26.9, 'dimensioned', s1('Detail A: -26.90 (the line runs in to the mic\'s centre)')),
  diameter: v(2.1, 'dimensioned', s1('Detail A: [2] Ø2.10 REAR MIC (its arrow lands on the middle of three concentric circles, drawn Ø2.07 with a heavier pen)')),
};

/** The inner and outer of the mic's three circles, not dimensioned (not built, not in features.json). */
export const rearMicInner = v(1.65, 'scaled', 'Detail A: the inner of the mic\'s three concentric circles, at 4800 dpi (eight spokes join it to the middle one)');
export const rearMicRing = v(2.4, 'scaled', 'Detail A: the outer of the mic\'s three concentric circles, at 4800 dpi (as the 15\'s, and the 13\'s dimensioned Ø2.40)');

/**
 * MagSafe's keepouts (sheet 2, the MagSafe view: the right-hand back view), the 15's shape at the Plus's size. The clear
 * area (5: DO NOT OBSTRUCT THIS AREA WITH METAL, CONDUCTIVE MATERIAL, OR MAGNETIC MATERIAL) is a whole Ø57.50 circle
 * round the product centre (38.88, -80.44: half the 77.76 and 160.89). The magnetic zone (5 7: DO NOT OBSTRUCT THIS AREA
 * WITH MAGNETIC OR PERMEABLE MATERIAL EXCEPT MAGSAFE MAGNETS) is the 16's shape: the full width from its top edge down,
 * straight-sided to -115.72 (2X), closed by an R52.49 arc through those corners. Its centre (derived: 115.72 -
 * √(52.49² - 38.88²) = 80.456 down) is the product centre (80.445) within 0.011: unlike the 15's R49.39, 3.10 below its
 * centre, the Plus's arc is centred on the product centre, as the 12s' and 13 Pro's (measure.ts checks the drawn arc).
 *
 * The zone's top edge (the camera corner's keepout's bottom) is NOT dimensioned on this drawing (as the 15's): it's
 * scaled, 40.23, 3.08 below the bump's outline (37.15; the 15's is 3.43 below the same outline, at 40.58).
 */
export const magsafe = {
  fromSide: v(38.88, 'dimensioned', s2('MagSafe view: 38.88 PRODUCT CENTER')),
  fromTop: v(80.44, 'dimensioned', s2('MagSafe view: -80.44 PRODUCT CENTER')),
  diameter: v(57.5, 'dimensioned', s2('MagSafe view: Ø57.50 (its leader on the clear area\'s circle; measure.ts fits the circle round the product centre)')),
  zoneFrom: v(40.23, 'scaled', 'MagSafe view: the zone\'s top edge, the full width (the camera corner\'s keepout\'s bottom), not dimensioned; read on two columns at 2400 dpi'),
  zoneSidesTo: v(115.72, 'dimensioned', s2('MagSafe view: 2X -115.72, where the zone\'s sides (the phone\'s) meet its arc')),
  zoneRadius: v(52.49, 'dimensioned', s2('MagSafe view: R52.49, the arc closing the zone below')),
};

/**
 * What the MagSafe view gives beyond the family's fields (not built, not in features.json), as the 15's:
 * - above the zone, the camera corner (0.00 to 37.15 across, the bump outline's far edge, and 0.00 down to the zone's
 *   top, crosshatched): DO NOT OBSTRUCT THIS AREA WITH MAGNETIC OR PERMEABLE MATERIAL (FULL PRODUCT VOLUME INCLUDING
 *   SIDE WALLS); the rest of the top (37.15 to the far edge) carries no keepout but the compass;
 * - the COMPASS, a small hatched circle centred 70.77 across, -8.84 down (its size not dimensioned).
 * Sheet 2's middle back view and side view give other keepouts (metal and conductive material: the top and bottom
 * bands, the side band, the area round the bump to -35.55), and sheet 3 the antenna keepouts (Detail K): not recorded.
 */
export const magsafeExtras = {
  cameraZone: { across: v(37.15, 'dimensioned', s2('MagSafe view: 37.15, the camera corner\'s keepout, its edge')) },
  compass: { fromSide: v(70.77, 'dimensioned', s2('MagSafe view: 70.77 COMPASS')), fromTop: v(8.84, 'dimensioned', s2('MagSafe view: -8.84 COMPASS')) },
};

export const connector = {
  name: 'USB-C' as const,
  width: v(12.45, 'dimensioned', s1('Detail C: 12.45 RECOMMENDED CONNECTOR KEEPOUT (4X R3.25 corners)')),
  thickness: v(6.6, 'dimensioned', s1('Detail C: 6.60 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(38.88, 'dimensioned', s1('Detail C: 38.88 (the port\'s centre, from the side-button edge)')),
  fromBack: v(3.91, 'dimensioned', s1('Detail C: 3.91, the port\'s centre line to the back glass')),
  outward: v(14.0, 'dimensioned', s1('Detail C: MATING CONNECTOR KEEPOUT AREA FLUSH TO PRODUCT SURFACE REQUIRED OUTWARD 14.0 mm')),
};

/**
 * The receiver (Detail D: 0.59 across the glass's edge about -1.17, 0.875 to 1.465 in; its keepout, sheet 2 Detail E,
 * 14.20 x 0.75 about -0.85; Detail D dimensions its length, 14.54) lies on the curved edge, outside the flat face the
 * part models (2.41 in), so it isn't drawn (as the 16 Pro's).
 */
export const front = {
  activeWidth: v(71.21, 'dimensioned', s1('front view: 71.21 DISPLAY ACTIVE AREA')),
  activeLength: v(154.34, 'dimensioned', s1('front view: 154.34 DISPLAY ACTIVE AREA')),
  activeFromEdge: v(3.27, 'dimensioned', s1('front view: 3.27 ALL AROUND, EXTERIOR OF HOUSING TO DISPLAY ACTIVE AREA')),
  activeRadius: v(9.11, 'scaled', 'front view: the active area\'s corners crossed on their diagonals (three: the bottom-left\'s diagonal runs along a hatch line)'),
  islandLength: v(20.76, 'dimensioned', s1('Detail D: 20.76 (the Dynamic Island, a pill)')),
  islandHeight: v(6.07, 'dimensioned', s1('Detail D: 6.07')),
  islandFromTop: v(8.19, 'dimensioned', s1('Detail D: -8.19 (its centre line, at its right end); centred across, on the 2X 38.88 line')),
};

export const buttons = {
  ringSilent: {
    side: 'volume' as const,
    centre: v(31.94, 'dimensioned', s1('left side view: 31.94 POCKET CENTER')),
    half: v(2.96, 'dimensioned', s1('left side view: 2X 2.96 (centre to each end of the pocket)')),
    width: v(2.35, 'dimensioned', s1('left side view: 2.35')),
    fromBack: v(3.91, 'dimensioned', s1('left side view: 3.91 POCKET CENTER, from the back glass\'s line')),
    proud: v(0.6, 'dimensioned', s1('front view: 0.60 RING/SILENT SWITCH')),
    note: 'the switch sits in a 5.92 x 2.35 pocket; modelled as a block of the pocket\'s size standing 0.60 proud',
  },
  volumeUp: {
    side: 'volume' as const,
    centre: v(45.39, 'dimensioned', s1('left side view: 45.39 (+) VOLUME BUTTON')),
    half: v(5.6, 'dimensioned', s1('left side view: 4X 5.60')),
    width: v(2.66, 'dimensioned', s1('left side view: 2X 2.66')),
    fromBack: v(3.91, 'dimensioned', s1('left side view: 2X 3.91, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (+) VOLUME BUTTON')),
    note: '',
  },
  volumeDown: {
    side: 'volume' as const,
    centre: v(59.59, 'dimensioned', s1('left side view: 59.59 (-) VOLUME BUTTON')),
    half: v(5.6, 'dimensioned', s1('left side view: 4X 5.60')),
    width: v(2.66, 'dimensioned', s1('left side view: 2X 2.66')),
    fromBack: v(3.91, 'dimensioned', s1('left side view: 2X 3.91, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (-) VOLUME BUTTON')),
    note: '',
  },
  side: {
    side: 'side' as const,
    centre: v(52.49, 'dimensioned', s1('right side view: 52.49 SIDE BUTTON')),
    half: v(8.85, 'dimensioned', s1('right side view: 2X 8.85')),
    width: v(2.66, 'dimensioned', s1('right side view: 2.66')),
    fromBack: v(3.9, 'derived', s1('right side view: 3.91 from the front glass\'s line (its arrows land on the screen side), so 7.81 - 3.91')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 SIDE BUTTON')),
    note: '',
  },
};

export const simTray = {
  centre: v(110.72, 'dimensioned', s1('left side view: 110.72')),
  length: v(15.94, 'derived', s1('left side view: 2X 7.97, centre to each end')),
  width: v(2.56, 'dimensioned', s1('left side view: 2.56 (its extension lines on the tray\'s sides)')),
  fromBack: v(3.91, 'dimensioned', s1('left side view: 3.91, from the back glass\'s line')),
};

/**
 * The bottom edge, from the volume-button edge. Only each group's end holes are dimensioned, to their centres as on
 * the 15 Pro: both groups' spans are whole multiples of the family's 2.255 pitch only as centres (27.16 - 20.39 = 3 x
 * 2.257, 61.87 - 50.60 = 5 x 2.254). Four holes left of the port and six right (the 15's three and five). The holes
 * between are evenly spaced, as drawn.
 */
const group = (from: number, to: number, n: number, which: string) =>
  Array.from({ length: n }, (_, i) => {
    const mm = +(from + ((to - from) * i) / (n - 1)).toFixed(3);
    return i === 0 || i === n - 1
      ? v(mm, 'dimensioned', s1(`bottom view, the ${which} group (10X Ø1.35 PORTS): ${mm.toFixed(2)}, on the hole's centre`))
      : v(mm, 'inferred', s1(`bottom view, the ${which} group: evenly between, as drawn`));
  });

export const bottom = {
  holes: [...group(20.39, 27.16, 4, 'left'), ...group(50.6, 61.87, 6, 'right')],
  holeDiameter: v(1.35, 'dimensioned', s1('bottom view: 10X Ø1.35 PORTS')),
  holesFromBack: v(3.91, 'dimensioned', s1('bottom view: 3.91, the holes\' centre line to the back glass\'s line')),
  holeDepth: v(0.6, 'assumed', 'a mic or speaker hole\'s depth for a render: the drawing gives none'),
  screws: [31.95, 45.8].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (2X Ø1.50 SCREW)`))),
  screwDiameter: v(1.5, 'dimensioned', s1('bottom view: 2X Ø1.50 SCREW')),
  screwsFromBack: v(3.91, 'inferred', 'Detail C draws the screws on the holes\' centre line'),
  portFrom: v(34.09, 'dimensioned', s1('bottom view: 34.09 (the USB-C port\'s near end)')),
  portTo: v(43.67, 'dimensioned', s1('bottom view: 43.67 (its far end; centre 38.88, as Detail C\'s)')),
  /**
   * Detail C draws the port as two outlines; the 3.72's extension lines run along the outer (its strokes' middles 3.70
   * apart, measure.ts), so the part's opening is the outer outline. The inner is portInner. Both lie on the flat band
   * (±2.12). Its ends round (inferred).
   */
  portHeight: v(3.72, 'dimensioned', s1('Detail C: 3.72, its extension lines on the port\'s outer outline')),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none'),
};

/** The port's inner outline in Detail C (not modelled: the opening is the dimensioned outer one); the 15's port is 3.25. */
export const portInner = v(3.23, 'scaled', 'Detail C: the port\'s inner outline, its strokes\' middles, down a column 1.6 left of its centre');

export const mass = v(201, 'spec', 'Weight: 201 grams');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '4:3 at 12MP (the Ultra Wide; the Main\'s 24MP default has the same shape)' };

export const phone: Phone = {
  part: {
    title: 'iPhone 15 Plus',
    name: 'iphone-15-plus.dat',
    keywords: ['Apple', 'iPhone 15 Plus', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [
      ['2026-10-31', 'Built from Apple\'s dimensional drawing: body, cameras, buttons, USB-C, Dynamic Island'],
      ['2026-11-06', 'Rear mic added (Detail A); the flash\'s keepout and MagSafe\'s keepouts in its features'],
    ],
    drawn: '2023-10-10',
    folder: 'iphone-15-plus',
  },
  details: { corner: 'Detail D', edge: 'Detail B', back: 'Detail A', port: 'Detail C' },
  body,
  bump,
  cameras,
  cameraIdentity: cameras.ultraWide.identity,
  flash: { ...flash, keepout: flashKeepout },
  rearMic,
  magsafe,
  connector,
  front,
  buttons,
  simTray,
  bottom,
  mass,
  image,
};
