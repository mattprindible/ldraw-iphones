// iPhone 16 Pro, read from Apple's dimensional drawing (iphone/drawings/iphone-16-pro.pdf, sheets 1 to 4,
// dated 2024-09-19). Every number carries where it came from and how we know it (src/provenance.ts): spec here is
// Apple's technical specifications page (support.apple.com/121031); scaled values are re-measured by measure.ts.
//
// The 15 Pro's back on a larger body, with Camera Control (sheet 2: its keepouts and chamfer), a 5x Telephoto, and an
// edge profile whose rounding runs past the glass's edge onto the faces. Sheet 1's views are drawn at different scales
// (the front view 34.6 px/mm at 1200 dpi, the bottom view 23.05, Detail D 46.06); sheet 3 the keepout sections.
// Sheet 3 also gives the flash's keepout (its two sections M-M) and sheet 4 MagSafe's keepouts (its middle back view):
// features.json only. Detail D gives the rear mic.
import type { Phone } from '../../drawing.ts';
import type { Calibration, Region } from '../../../src/raster.ts';
import { v, type Kind } from '../../../src/provenance.ts';

/** Where the scaled values were measured: regions of sheet 1 (PDF page 2) at 1200 dpi, each with its calibration. */
export const detailD: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 16000, y: 1200, width: 2800, height: 2800 }, pxPerMm: 46.06, origin: [262.5, 244.5] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5100, y: 2900, width: 2800, height: 5500 }, pxPerMm: 34.57, origin: [316.5, 309] };
export const bottomView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 6400, y: 10500, width: 2900, height: 500 }, pxPerMm: 23.05, origin: [447.5, 240.5] };

/**
 * Detail D's rear mic at 4800 dpi, in Detail D's frame (measure.ts carries the calibration over). Sheet 3 (PDF page 4)
 * at 1200 dpi: the two sections through the flash, both labelled SECTION M-M (one drawn upright: down the phone, V-FOV,
 * on Detail P's 32.16 line, the J-J plane; the other lying down: across, H-FOV, on Detail P's M-M line), each `origin`
 * the cover glass's face and the flash's axis (the middle of its 6.00 extension lines), its scale from the face to the
 * transition's extension line (46.10 px/mm). Sheet 4 (PDF page 5) at 1200 dpi: the MagSafe view (the middle back view),
 * calibrated on its 0.00 and 45.22 lines across and its 0.00 and 112.22 lines down.
 */
export const micView: Region = { page: 2, dpi: 4800, crop: { x: 71650, y: 11670, width: 800, height: 800 } };
export const sectionDown: Region & Calibration = { page: 4, dpi: 1200, crop: { x: 12800, y: 1000, width: 1600, height: 3800 }, pxPerMm: 46.1, origin: [332.5, 1515.75] };
export const sectionAcross: Region & Calibration = { page: 4, dpi: 1200, crop: { x: 14600, y: 4600, width: 3800, height: 1700 }, pxPerMm: 46.1, origin: [2009.75, 1438] };
export const magsafeView: Region & Calibration = { page: 5, dpi: 1200, crop: { x: 8000, y: 1500, width: 4600, height: 7700 }, pxPerMm: 46.1, origin: [514.5, 653.5] };

const s1 = (what: string) => `sheet 1, ${what}`;
const s2 = (what: string) => `sheet 2, ${what}`;
const s3 = (what: string) => `sheet 3, ${what}`;
const s4 = (what: string) => `sheet 4, ${what}`;

export const body = {
  width: v(71.45, 'dimensioned', s1('front view: 71.45 PRODUCT WIDTH')),
  length: v(149.61, 'dimensioned', s1('front view: 149.61 PRODUCT LENGTH')),
  thickness: v(8.25, 'dimensioned', s1('side view: 8.25 PRODUCT THICKNESS')),
  glassWidth: v(69.45, 'dimensioned', s1('front view: 69.45 GLASS')),
  glassLength: v(147.61, 'dimensioned', s1('front view: 147.61 GLASS')),
  corner: {
    points: [
      [19.23, 0],
      [13.75, 0.04],
      [8.36, 0.89],
      [3.74, 3.74],
      [0.89, 8.36],
      [0.04, 13.75],
      [0, 19.23],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail A: CORNER PROFILE (ALL FOUR CORNERS); each label paired with the cross its leader reaches'),
  },
  /**
   * Flat to ±1.84, then rounding that runs past the glass's edge (1.00 in) to the flat of the faces, 2.41 in at ±4.12
   * (the front view's 2.41 ALL AROUND, TO START OF FLAT AREA): the faces start there.
   */
  edge: {
    points: [
      [0, 1.84],
      [0.07, 2.86],
      [0.58, 3.76],
      [1.47, 4.1],
      [2.41, 4.12],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail B: PROFILE (ALL SIDES); insets 2X 0.00, 0.07, 0.58, 1.47, 2.41 paired in order with ±1.84, ±2.86, ±3.76, ±4.10, ±4.12'),
  },
};

export const bump = {
  top: v(2.05, 'dimensioned', s1('right side view: 2.05 BACK GLASS TO CAMERA PLATEAU')),
  rings: v(4.28, 'dimensioned', s1('right side view: 4.28 BACK GLASS TO REAR CAMERA GLASS')),
  baseFrom: v(1.04, 'dimensioned', s1('Detail D: 1.04 (across and down)')),
  baseSize: v(44.18, 'derived', s1('Detail D: 45.22 - 1.04, across')),
  baseHeight: v(45.5, 'derived', s1('Detail D: -46.54 - -1.04, down')),
  baseRadius: v(13.3, 'scaled', 'Detail D: the outline\'s corners crossed on their diagonals, 13.30 at all four'),
  topFrom: v(4.7, 'dimensioned', s1('Detail D: 4.70 (across and down)')),
  topSize: v(36.86, 'derived', s1('Detail D: 41.56 - 4.70, across')),
  topHeight: v(38.18, 'derived', s1('Detail D: -42.88 - -4.70, down')),
  topRadius: v(9.67, 'scaled', 'Detail D: the top\'s corners crossed on their diagonals, 9.67 at all four'),
};

/** Which is which, from sheet 3's keepout cones: camera 1 the Ultra Wide (124°), 2 the Fusion (86°), 3 the 5x Telephoto (25°). */
export const cameras = {
  ultraWide: {
    name: 'rear camera 1',
    label: 'Ultra Wide',
    fromSide: v(14.17, 'dimensioned', s1('Detail D: 2X 14.17 (rear cameras 1 and 2)')),
    fromTop: v(14.17, 'dimensioned', s1('Detail D: -14.17 REAR CAMERA 1')),
    ring: v(16.2, 'dimensioned', s1('Detail D: 3X Ø16.20')),
    window: v(13.01, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(8.52, 'dimensioned', s3('Section G-G: 8.52 REAR CAMERA 1 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(124, 'dimensioned', s3('Section G-G: 124° REAR CAMERA 1 KEEPOUT CONE')),
    identity: v(1, 'inferred', 'camera 1 is the Ultra Wide: its 124° cone encloses its 120° (spec); camera 2\'s 86° the Fusion\'s 24 mm (84°); camera 3\'s 25° the 5x Telephoto\'s 20° (spec)'),
    fov: v(120, 'spec', '48MP Ultra Wide: 13 mm, ƒ/2.2 aperture and 120° field of view'),
    aperture: v(2.2, 'spec', 'Ultra Wide: ƒ/2.2'),
  },
  main: {
    name: 'rear camera 2',
    label: 'Fusion',
    fromSide: v(14.17, 'dimensioned', s1('Detail D: 2X 14.17 (rear cameras 1 and 2)')),
    fromTop: v(33.41, 'dimensioned', s1('Detail D: -33.41 REAR CAMERA 2')),
    ring: v(16.2, 'dimensioned', s1('Detail D: 3X Ø16.20')),
    window: v(13.02, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(7.97, 'dimensioned', s3('Section G-G: 7.97 REAR CAMERA 2 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(86, 'dimensioned', s3('Section G-G: 86° REAR CAMERA 2 KEEPOUT CONE')),
    equivalentFocal: v(24, 'spec', '48MP Fusion: 24 mm focal length'),
    aperture: v(1.78, 'spec', 'Main: ƒ/1.78'),
  },
  telephoto: {
    name: 'rear camera 3',
    label: 'Telephoto',
    fromSide: v(32.16, 'dimensioned', s1('Detail D: 2X 32.16 (rear camera 3 and the flash)')),
    fromTop: v(23.79, 'dimensioned', s1('Detail D: -23.79 REAR CAMERA 3')),
    ring: v(16.2, 'dimensioned', s1('Detail D: 3X Ø16.20')),
    window: v(13.02, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(7.23, 'dimensioned', s3('Section J-J: 7.23 REAR CAMERA 3 KEEPOUT CONE TO COVER GLASS (its base Ø5.14)')),
    keepoutCone: v(25, 'dimensioned', s3('Section J-J: 25° REAR CAMERA 3 KEEPOUT CONE')),
    fov: v(20, 'spec', '12MP 5x Telephoto: 120 mm, ƒ/2.8 aperture and 20° field of view'),
    aperture: v(2.8, 'spec', 'Telephoto: ƒ/2.8'),
  },
};

/**
 * The flash's keepout, from sheet 3's two sections through it, both labelled SECTION M-M: one drawn upright, down the
 * phone (V-FOV; on Detail P's 32.16 line, the J-J plane, through the flash and camera 3), the other lying down, across
 * it (H-FOV; on Detail P's M-M line). The 16's plan: both start from an inner cone's base, Ø6.00 (6.00 FLASH KEEPOUT CONE
 * BASE DIAMETER, its extension lines on the base's corners) at 10.20 FLASH KEEPOUT CONE BASE TO COVER GLASS, 0.10 under
 * the plateau (8.25 + 2.05 = 10.30). Both sections draw the 10.20 line on beside the plateau's, 0.10 apart, over the
 * flash as beside it (measure.ts, at 4800 dpi), so they don't show what lies at 10.20: the flash's face, as the 15 Pro's
 * is drawn 0.09 under its bump's top, is the likely reading (inferred). Neither 10.20 nor any other number is an apex.
 * "To cover glass" is from the front: the arrows start on each section's front face (its extension line), the bump on
 * the other side.
 *
 * Down the phone, camera 3's ring (from 5.47 below the flash's axis, its glass 12.53 from the front) stands where the
 * lower kink would be: the section draws the lower inner line to the ring's edge and the lower outer line on from
 * beyond the ring's glass. Extended, they meet 12.31 from the front (measure.ts), as dimensioned: the phone's own ring
 * bounds the keepout there; the cones are as printed.
 *
 * The inner cone isn't circular: 112° FLASH INNER KEEPOUT CONE V-FOV down the phone, 96° H-FOV across, and it turns into
 * the outer cone (157°, V-FOV and H-FOV both) at 12.32 down the phone and 12.11 across (each FLASH KEEPOUT CONE
 * TRANSITION TO COVER GLASS). The outer cone is one circular cone: worked from each section's printed numbers its apex
 * lies 11.07 from the front, 12.32 - (3.00 + 2.12 tan 56°) / tan 78.5° = 11.070 and 12.11 - (3.00 + 1.91 tan 48°) /
 * tan 78.5° = 11.068. Both sections close the keepout 4.00 out from the base, (4.00): 14.20 from the front. The
 * reference dimensions between the base and the transition are (2.13) down the phone, where 12.32 - 10.20 is 2.12
 * (measure.ts reads 2.12 drawn), and (1.91) across, 12.11 - 10.20.
 *
 * The family's field takes one inner cone, as circular. It's given the down-the-phone section's: its 112° is the wider,
 * so a circular 112° cone holds the 96° one across (an approximation on the safe side, as the 16's). The across
 * section's own numbers are in `flashKeepoutAcross`, and 10.20 (no field for the base's distance) in `flashKeepoutBase`;
 * neither reaches features.json.
 */
export const flashKeepout = {
  inner: v(112, 'dimensioned', s3('Section M-M, upright (down the phone): 112° FLASH INNER KEEPOUT CONE V-FOV (across, the lying-down M-M gives 96°: flashKeepoutAcross)')),
  outer: v(157, 'dimensioned', s3('both Sections M-M: 157° FLASH OUTER KEEPOUT CONE V-FOV and H-FOV')),
  innerBaseDiameter: v(6.0, 'dimensioned', s3('both Sections M-M: 6.00 FLASH KEEPOUT CONE BASE DIAMETER, its extension lines on the base\'s corners, at 10.20 from the front')),
  transitionFromFront: v(12.32, 'dimensioned', s3('Section M-M, upright: 12.32 FLASH KEEPOUT CONE TRANSITION TO COVER GLASS (its arrows on the front face\'s and the kinks\' extension lines; across, 12.11)')),
  apexFromFront: v(8.18, 'derived', s3('Section M-M, upright: not dimensioned; the 112° cone through its Ø6.00 base at 10.20: 10.20 - 3.00 / tan 56°')),
  outerApexFromFront: v(11.07, 'derived', s3('both Sections M-M: not dimensioned; the 157° cone through either section\'s kinks: 12.32 - (3.00 + 2.12 tan 56°) / tan 78.5° = 11.070, and 12.11 - (3.00 + 1.91 tan 48°) / tan 78.5° = 11.068')),
};

/** What the sections give beyond the family's field (not in features.json): the distance to the inner cone's base. */
export const flashKeepoutBase = {
  fromFront: v(10.2, 'dimensioned', s3('both Sections M-M: 10.20 FLASH KEEPOUT CONE BASE TO COVER GLASS (the flash\'s face, 0.10 under the plateau: the cone\'s base)')),
};

/** The lying-down Section M-M, across the phone (not in features.json: the family's keepout is one circular cone). */
export const flashKeepoutAcross = {
  inner: v(96, 'dimensioned', s3('Section M-M, lying down (across): 96° FLASH INNER KEEPOUT CONE H-FOV')),
  transitionFromFront: v(12.11, 'dimensioned', s3('Section M-M, lying down: 12.11 FLASH KEEPOUT CONE TRANSITION TO COVER GLASS ((1.91) from the base)')),
  apexFromFront: v(7.5, 'derived', s3('Section M-M, lying down: not dimensioned; the 96° cone through its Ø6.00 base at 10.20: 10.20 - 3.00 / tan 48°')),
};

/** The keepout's far end in both sections (not in features.json: the family's field has no place for it). */
export const flashKeepoutEnd = v(14.2, 'derived', s3('both Sections M-M: (4.00), the line closing the keepout, from the base\'s 10.20 line: 10.20 + 4.00'));

export const flash = {
  fromSide: v(32.16, 'dimensioned', s1('Detail D: 2X 32.16 FLASH')),
  fromTop: v(10.22, 'dimensioned', s1('Detail D: -10.22 FLASH')),
  diameter: v(6.92, 'dimensioned', s1('Detail D: Ø6.92 FLASH')),
  keepout: flashKeepout,
};

/**
 * The rear mic, on the bump's top, by its bottom-right corner (as the 15 Pro's, at 37.95, 33.86 there). Across: the
 * 38.00 ordinate below Detail D, whose extension line rises to the mic's centre (between the top's 4.70 and 41.56);
 * down: the 34.14 line, which runs in from the right to the mic's centre. Two concentric circles are drawn there; the
 * [2] Ø0.75 REAR MIC leader's arrow passes the outer and lands on the inner one, which is Ø0.75 drawn: the mic. The outer
 * circle (drawn Ø1.15, undimensioned; the 14 Pro's drawing prints Ø1.15 for it), a ring round it, isn't built.
 */
export const rearMic = {
  fromSide: v(38.0, 'dimensioned', s1('Detail D: 38.00 (the ordinate below the view; its extension line rises to the mic\'s centre)')),
  fromTop: v(34.14, 'dimensioned', s1('Detail D: 34.14 (the line runs in from the right to the mic\'s centre)')),
  diameter: v(0.75, 'dimensioned', s1('Detail D: [2] Ø0.75 REAR MIC (its arrow lands on the inner of two concentric circles, drawn Ø0.75)')),
};

/** The outer of the mic's two circles, not dimensioned (not built, not in features.json). */
export const rearMicRing = v(1.15, 'scaled', 'Detail D: the outer of the mic\'s two concentric circles, at 4800 dpi');

/**
 * MagSafe's keepouts (sheet 4, the middle back view; measure.ts re-reads them at 1200 dpi). The clear area (5 7: DO NOT
 * OBSTRUCT THIS AREA WITH METAL, CONDUCTIVE MATERIAL, OR MAGNETIC MATERIAL) is a whole Ø57.50 circle centred 35.72 across
 * (PRODUCT CENTER; half the 71.45 is 35.725) and 75.05 down, labelled PRODUCT CENTER too, though half the 149.61 is
 * 74.805: the circle sits 0.245 below the product's centre (measure.ts fits it at 75.05; the 15 Pro's sits 1.675 below,
 * the 16's on it). The magnetic zone (5 7: DO NOT OBSTRUCT THIS AREA WITH MAGNETIC OR PERMEABLE MATERIAL EXCEPT MAGSAFE
 * MAGNETS) is the 16's shape: the full width from 46.54 down (Detail D's bump outline bottom; the camera corner's
 * crosshatch ends on it), straight-sided to 2X 112.22, closed by an R49.39 arc through those corners, whose centre
 * (derived: 112.22 - √(49.39² - 35.725²) = 78.12 down) is 3.07 below the clear circle's, not on it.
 */
export const magsafe = {
  fromSide: v(35.72, 'dimensioned', s4('MagSafe view: 35.72 PRODUCT CENTER (half the 71.45 is 35.725)')),
  fromTop: v(75.05, 'dimensioned', s4('MagSafe view: 75.05 PRODUCT CENTER (the clear circle\'s centre line; half the 149.61 is 74.805)')),
  diameter: v(57.5, 'dimensioned', s4('MagSafe view: Ø57.50 (its leader on the clear area\'s circle; measure.ts fits the circle round 35.72, 75.05)')),
  zoneFrom: v(46.54, 'dimensioned', s4('MagSafe view: 46.54, the zone\'s top, the full width (Detail D\'s bump outline bottom)')),
  zoneSidesTo: v(112.22, 'dimensioned', s4('MagSafe view: 2X 112.22, where the zone\'s sides (the phone\'s) meet its arc')),
  zoneRadius: v(49.39, 'dimensioned', s4('MagSafe view: R49.39, the arc closing the zone below')),
};

/**
 * What the MagSafe view gives beyond the family's fields (not built, not in features.json):
 * - above the zone, the camera corner (0.00 to 45.22 across, 0.00 to 46.54 down, crosshatched): DO NOT OBSTRUCT THIS AREA
 *   WITH METAL OR OTHER CONDUCTIVE MATERIAL (FULL PRODUCT VOLUME INCLUDING SIDEWALLS); 45.22 and 46.54 are the bump
 *   outline's (Detail D);
 * - the COMPASS (5 7), a small hatched circle centred 52.99 across, 144.45 down (its size not dimensioned).
 * Sheet 4's left back view gives other metal keepouts (the camera corner and top band, the bottom band) and its right
 * one Keepouts 1 and 2 (non-conductive material uniform in thickness, by the flash): not recorded here.
 */
export const magsafeExtras = {
  cameraZone: { across: v(45.22, 'dimensioned', s4('MagSafe view: 45.22, the camera corner\'s keepout, its edge (Detail D\'s bump outline)')) },
  compass: { fromSide: v(52.99, 'dimensioned', s4('MagSafe view: 52.99 COMPASS')), fromTop: v(144.45, 'dimensioned', s4('MagSafe view: 144.45 COMPASS')) },
};

/** The LiDAR scanner: the drawing gives only its keepout zone (sheet 3, Detail P), not its window. */
export const sensor = {
  name: 'LiDAR scanner',
  fromSide: v(32.16, 'dimensioned', s3('Detail P: on the 32.16 line (section J-J through camera 3 and the sensor)')),
  fromTop: v(38.14, 'dimensioned', s3('Detail P: 38.14 REAR SENSOR KEEPOUT CONTACTING PLATEAU SURFACE')),
  keepoutCone: v(68, 'dimensioned', s3('Section J-J: 68° REAR SENSOR KEEPOUT CONE (its zone 7.28 to the cover glass)')),
  zone: v(15.73, 'dimensioned', s3('Detail P: Ø15.73 (it overlaps camera 3\'s ring: a zone, not the window)')),
};

export const connector = {
  name: 'USB-C' as const,
  width: v(12.45, 'dimensioned', s1('Detail C: 12.45 RECOMMENDED CONNECTOR KEEPOUT (2X R3.25 corners)')),
  thickness: v(6.6, 'dimensioned', s1('Detail C: 6.60 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(35.72, 'dimensioned', s1('Detail C: 35.72 (the port\'s centre, from the side-button edge)')),
  fromBack: v(4.12, 'dimensioned', s1('Detail C: 4.12, the port\'s centre line to the back glass')),
  outward: v(14.0, 'dimensioned', s1('Detail C: MATING CONNECTOR KEEPOUT AREA FLUSH TO PRODUCT SURFACE REQUIRED OUTWARD 14.0 mm')),
};

/**
 * The receiver (14.02 x 0.45 centred 1.17 from the top, Detail A) lies on the glass's curved edge, outside the flat face
 * the part models (2.41 in), so it isn't drawn.
 */
export const front = {
  activeWidth: v(66.57, 'dimensioned', s1('front view: 66.57 DISPLAY ACTIVE AREA')),
  activeLength: v(144.79, 'dimensioned', s1('front view: 144.79 DISPLAY ACTIVE AREA')),
  activeFromEdge: v(2.44, 'dimensioned', s1('front view: 2.44 ALL AROUND, EXTERIOR OF HOUSING TO DISPLAY ACTIVE AREA')),
  activeRadius: v(10.32, 'scaled', 'front view: the active area\'s corners crossed on their diagonals, 10.27 to 10.42 at three (the bottom-left\'s diagonal runs along a hatch line; first read 6.65 from a guess that found the glass\'s arc)'),
  islandLength: v(20.73, 'dimensioned', s1('front view: 20.73 (the Dynamic Island)')),
  islandHeight: v(6.07, 'dimensioned', s1('front view: 6.07')),
  islandFromTop: v(7.71, 'dimensioned', s1('front view: -7.71 (its centre line); centred across, on the 35.72 line')),
};

export const buttons = {
  action: {
    side: 'volume' as const,
    centre: v(34.08, 'dimensioned', s1('left side view: 34.08 ACTION BUTTON')),
    half: v(3.45, 'dimensioned', s1('left side view: 2X 3.45 (centre to each end)')),
    width: v(2.66, 'dimensioned', s1('left side view: 2.66 (across the thickness)')),
    fromBack: v(4.12, 'dimensioned', s1('left side view: 4.12, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 ACTION BUTTON')),
    note: '',
  },
  volumeUp: {
    side: 'volume' as const,
    centre: v(48.23, 'dimensioned', s1('left side view: 48.23 (+) VOLUME BUTTON')),
    half: v(5.6, 'dimensioned', s1('left side view: 4X 5.60')),
    width: v(2.66, 'dimensioned', s1('left side view: 3X 2.66')),
    fromBack: v(4.12, 'dimensioned', s1('left side view: 4X 4.12, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (+) VOLUME BUTTON')),
    note: '',
  },
  volumeDown: {
    side: 'volume' as const,
    centre: v(62.43, 'dimensioned', s1('left side view: 62.43 (-) VOLUME BUTTON')),
    half: v(5.6, 'dimensioned', s1('left side view: 4X 5.60')),
    width: v(2.66, 'dimensioned', s1('left side view: 3X 2.66')),
    fromBack: v(4.12, 'dimensioned', s1('left side view: 4X 4.12, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (-) VOLUME BUTTON')),
    note: '',
  },
  side: {
    side: 'side' as const,
    centre: v(55.33, 'dimensioned', s1('right side view: 55.33 SIDE BUTTON')),
    half: v(8.85, 'dimensioned', s1('right side view: 2X 8.85')),
    width: v(2.66, 'dimensioned', s1('right side view: 2.66')),
    fromBack: v(4.13, 'derived', s1('right side view: 2X 4.12 from the front glass\'s line (as the 13s\' right views), so 8.25 - 4.12')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 SIDE BUTTON')),
    note: '',
  },
};

export const simTray = {
  centre: v(90.17, 'dimensioned', s1('left side view: 90.17')),
  length: v(16.34, 'derived', s1('left side view: 2X 8.17, centre to each end')),
  width: v(2.76, 'dimensioned', s1('left side view: 2.76')),
  fromBack: v(4.12, 'dimensioned', s1('left side view: 4X 4.12, from the back glass\'s line')),
};

/** Camera Control: flush (front view: 0.00), in the side-button side; sheet 2 gives its chamfer and its keepouts. */
export const cameraControl = {
  centre: v(98.19, 'dimensioned', s1('right side view: 98.19 CAMERA CONTROL')),
  half: v(8.55, 'dimensioned', s1('right side view: 2X 8.55 (centre to each end)')),
  width: v(3.03, 'dimensioned', s1('right side view: 3.03')),
  fromBack: v(4.13, 'derived', s1('right side view: 2X 4.12 from the front glass\'s line, so 8.25 - 4.12')),
  chamfer: v(0.63, 'dimensioned', s2('Section G-G, CAMERA CONTROL CHAMFER: 0.63 ALL AROUND (and 0.18 deep, 16°: tan 16° = 0.18 / 0.63)')),
  keepoutLength: v(25.0, 'dimensioned', s2('Detail E, CAMERA CONTROL TYPICAL KEEPOUT: 25.00 MEASURED AT SURFACE')),
  keepoutWidth: v(4.2, 'dimensioned', s2('Detail E: 2X 4.20 MEASURED AT SURFACE')),
};

/**
 * The bottom edge, from the volume-button edge. Only each group's end holes are dimensioned, and (as on the 15 Pro)
 * to their centres: 19.70 and 24.21 are 2 x 2.255 apart, 47.23 and 56.25 4 x 2.255 (to the edges, a hole's 1.35 more).
 * The holes between are evenly spaced, as drawn.
 */
const group = (from: number, to: number, n: number, which: string) =>
  Array.from({ length: n }, (_, i) => {
    const mm = +(from + ((to - from) * i) / (n - 1)).toFixed(3);
    return i === 0 || i === n - 1
      ? v(mm, 'dimensioned', s1(`bottom view, the ${which} group (8X Ø1.35 PORTS): ${mm.toFixed(2)}, on the hole's centre`))
      : v(mm, 'inferred', s1(`bottom view, the ${which} group: evenly between, as drawn`));
  });

export const bottom = {
  holes: [...group(19.7, 24.21, 3, 'left'), ...group(47.23, 56.25, 5, 'right')],
  holeDiameter: v(1.35, 'dimensioned', s1('bottom view: 8X Ø1.35 PORTS')),
  holesFromBack: v(4.12, 'dimensioned', s1('bottom view: 4.12, the holes\' centre line to the back glass\'s line')),
  holeDepth: v(0.6, 'assumed', 'a mic or speaker hole\'s depth for a render: the drawing gives none'),
  screws: [28.79, 42.64].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (2X Ø1.50 SCREW)`))),
  screwDiameter: v(1.5, 'dimensioned', s1('bottom view: 2X Ø1.50 SCREW')),
  screwsFromBack: v(4.12, 'inferred', 'Detail C draws the screws on the holes\' centre line'),
  portFrom: v(30.86, 'dimensioned', s1('bottom view: 30.86 (the USB-C port\'s near end)')),
  portTo: v(40.58, 'dimensioned', s1('bottom view: 40.58 (its far end; centre 35.72, as Detail C\'s 35.72)')),
  portHeight: v(3.14, 'dimensioned', s1('Detail C: 3.14 (the port\'s opening across the thickness); its ends round (inferred)')),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none'),
};

export const mass = v(199, 'spec', 'Weight: 199 grams');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '4:3 at 12MP (the Ultra Wide and Telephoto; the Main\'s 24MP default has the same shape)' };

export const phone: Phone = {
  part: {
    title: 'iPhone 16 Pro',
    name: 'iphone-16-pro.dat',
    keywords: ['Apple', 'iPhone 16 Pro', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [
      ['2026-10-30', 'Built from Apple\'s dimensional drawing: body, cameras, buttons, Camera Control, USB-C, Dynamic Island'],
      ['2026-11-06', 'Rear mic; the flash\'s keepout (both sections M-M) and MagSafe\'s keepouts in features.json'],
    ],
    drawn: '2024-09-19',
    folder: 'iphone-16-pro',
  },
  details: { corner: 'Detail A', edge: 'Detail B', back: 'Detail D', port: 'Detail C' },
  body,
  bump,
  cameras,
  cameraIdentity: cameras.ultraWide.identity,
  flash,
  rearMic,
  magsafe,
  sensor,
  connector,
  front,
  buttons,
  simTray,
  cameraControl,
  bottom,
  mass,
  image,
};
