// iPhone 13 Pro, read from Apple's dimensional drawing (iphone/drawings/iphone-13-pro.pdf, sheets 1 and 2,
// dated 05/14/21). Every number carries where it came from and how we know it (src/provenance.ts): spec here is
// Apple's technical specifications page (support.apple.com/111871); scaled values are re-measured by measure.ts.
//
// It's drawn on the 13's plan (Detail A the corner, Detail B the edge profile, Detail C the Lightning port, Detail D the
// back), with three cameras, a LiDAR scanner (sheet 2, Detail H), a bump that isn't square and flat steel sides. Coordinates on the back follow Detail D: `fromSide` from the
// side-button edge (the left edge in a back view), `fromTop` from the top edge. Depths from the back glass outward, or
// from the front face inward, as the drawing measures them.
import type { Phone } from '../../drawing.ts';
import type { Calibration, Region } from '../../../src/raster.ts';
import { v, type Kind } from '../../../src/provenance.ts';

/**
 * Where the scaled values were measured, each region of sheet 1 (PDF page 2) with the calibration measure.ts finds for
 * it: Detail D at 1200 dpi (the camera centres calibrate it), the front view (its outer edges), the receiver at 4800
 * dpi (the front view's frame), the bottom view (its outer edges and outlines).
 */
export const detailD: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 15000, y: 2000, width: 2800, height: 2800 }, pxPerMm: 57.6, origin: [258, 247.5] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5450, y: 5100, width: 2100, height: 3900 }, pxPerMm: 23.05, origin: [235.5, 234.5] };
export const receiverView: Region = { page: 2, dpi: 4800, crop: { x: 25239, y: 21283, width: 1600, height: 500 } };
export const bottomView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5450, y: 10620, width: 2100, height: 500 }, pxPerMm: 23.05, origin: [235.5, 249.75] };
/**
 * Sheet 2 (PDF page 3): Detail H at 1200 dpi (its 0.00 and 30.08 lines across, the 0.00 line down; the -35.35 line
 * checks it), the flash's Section G-G and Section K-K at 1200 dpi (G-G's scale from the cover glass's face to the 11.27
 * line, origin the face; K-K's from the Ø6.00 lines, origin the flash's axis across and the face down), and the MagSafe
 * view at 1800 dpi (its 0.00 and 65.26 lines across, 0.00 and -107.42 down): what measure.ts reads the rear mic, the
 * flash's keepout and MagSafe's keepouts from.
 */
export const detailH: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 16400, y: 6400, width: 3400, height: 3600 }, pxPerMm: 63.36, origin: [320, 311.5] };
export const sectionGG: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 13900, y: 500, width: 1300, height: 4400 }, pxPerMm: 57.6, origin: [160.5, 0] };
export const sectionKK: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 16200, y: 900, width: 3300, height: 3800 }, pxPerMm: 63.42, origin: [1953.25, 1792] };
export const magsafeView: Region & Calibration = { page: 3, dpi: 1800, crop: { x: 18600, y: 9500, width: 4400, height: 7200 }, pxPerMm: 43.21, origin: [597.5, 533] };

const s1 = (what: string) => `sheet 1, ${what}`;
const s2 = (what: string) => `sheet 2, ${what}`;

export const body = {
  width: v(71.52, 'dimensioned', s1('front view: 71.52 PRODUCT WIDTH')),
  length: v(146.71, 'dimensioned', s1('front view: 146.71 PRODUCT LENGTH')),
  thickness: v(7.65, 'dimensioned', s1('side view: 7.65 PRODUCT THICKNESS')),
  glassWidth: v(69.42, 'dimensioned', s1('front view: 69.42 GLASS')),
  glassLength: v(144.61, 'dimensioned', s1('front view: 144.61 GLASS')),
  /** The plan-view corner, (along the top edge, down the side) from the corner: Detail A's crosses, paired. */
  corner: {
    points: [
      [15.89, 0],
      [11.43, 0.07],
      [7.04, 0.92],
      [3.31, 3.31],
      [0.92, 7.04],
      [0.07, 11.42],
      [0, 15.89],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail A: CORNER PROFILE (ALL FOUR CORNERS); each label paired with the cross its leader reaches (11.43 across, 11.42 down, as printed)'),
  },
  /**
   * The edge profile, (inset from the flat side, half-height from mid-plane): Detail B. Its insets run from a datum it
   * labels 0.21 (boxed) at the flat side, the side the 71.52 product width runs between, so each is taken less 0.21:
   * the flat runs straight to 3.06, then the 13 mini's rounding (0.13, 0.48, 0.91).
   */
  edge: {
    points: [
      [0, 2.63],
      [0, 3.06],
      [0.13, 3.47],
      [0.48, 3.71],
      [0.91, 3.75],
    ] as [number, number][],
    kind: 'inferred' as Kind,
    from: s1('Detail B: PROFILE (ALL SIDES); insets 0.21 (boxed), 2X 0.21, 0.34, 0.69, 1.12, each less the boxed 0.21; heights ±2.63, 3.06 (-3.07 below), ±3.47, ±3.71, ±3.75'),
  },
};

export const bump = {
  top: v(1.68, 'dimensioned', s1('right side view: 1.68 BACK GLASS TO CAMERA PLATEAU')),
  /** Dimensioned for cameras 1 and 2 (the two nearest that side); camera 3's rings are drawn alike. */
  rings: v(3.6, 'dimensioned', s1('right side view: 2X 3.60 BACK GLASS TO REAR CAMERA GLASS')),
  baseFrom: v(1.15, 'dimensioned', s1('Detail D: 1.15 (across and down)')),
  baseSize: v(41.24, 'derived', s1('Detail D: 42.39 - 1.15, across')),
  baseHeight: v(42.47, 'derived', s1('Detail D: -43.62 - -1.15, down (the bump is 1.23 taller than wide)')),
  baseRadius: v(12.5, 'scaled', 'Detail D: the outline\'s corners crossed on their diagonals, 12.48 to 12.54 at three (the top-left runs into the back glass\'s heavy edge)'),
  topFrom: v(4.27, 'dimensioned', s1('Detail D: 4.27 (across and down)')),
  topSize: v(35.01, 'derived', s1('Detail D: 39.28 - 4.27, across')),
  topHeight: v(36.24, 'derived', s1('Detail D: -40.51 - -4.27, down')),
  topRadius: v(9.39, 'scaled', 'Detail D: the top\'s corners crossed on their diagonals, 9.39 at all four'),
};

/** Which is which, from sheet 2's keepout cones: camera 1 the Telephoto (37°), 2 the Main (85°), 3 the Ultra Wide (123°). */
export const cameras = {
  telephoto: {
    name: 'rear camera 1',
    label: 'Telephoto',
    fromSide: v(13.43, 'dimensioned', s1('Detail D: 2X 13.43 (rear cameras 1 and 2)')),
    fromTop: v(13.43, 'dimensioned', s1('Detail D: -13.43 REAR CAMERA 1')),
    ring: v(15.11, 'scaled', 'Detail D: camera 1\'s outer ring (its Ø isn\'t given; smaller than camera 2\'s 15.53)'),
    window: v(11.79, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(2.96, 'dimensioned', 'sheet 2, Section F-F: 2.96 REAR CAMERA 1 KEEPOUT CONE TO COVER GLASS'),
    keepoutCone: v(37, 'dimensioned', 'sheet 2, Section F-F: 37° REAR CAMERA 1 KEEPOUT CONE'),
    identity: v(1, 'inferred', 'camera 1 is the Telephoto: its 37° cone encloses a 77 mm equivalent\'s 31°; camera 2\'s 85° the Main\'s ~80°; camera 3\'s 123° the Ultra Wide\'s 120° (spec)'),
    equivalentFocal: v(77, 'third-party', '77 mm equivalent (3x the Main), widely reported from Apple\'s 2021 launch; the spec page gives 3x optical zoom'),
    aperture: v(2.8, 'spec', 'Telephoto: ƒ/2.8 aperture'),
  },
  main: {
    name: 'rear camera 2',
    label: 'Main',
    fromSide: v(13.43, 'dimensioned', s1('Detail D: 2X 13.43 (rear cameras 1 and 2)')),
    fromTop: v(31.35, 'dimensioned', s1('Detail D: -31.35 REAR CAMERA 2')),
    ring: v(15.53, 'dimensioned', s1('Detail D: Ø 15.53 (camera 2\'s outer ring)')),
    window: v(11.79, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(7.27, 'dimensioned', 'sheet 2, Section F-F: 7.27 REAR CAMERA 2 KEEPOUT CONE TO COVER GLASS'),
    keepoutCone: v(85, 'dimensioned', 'sheet 2, Section F-F: 85° REAR CAMERA 2 KEEPOUT CONE'),
    equivalentFocal: v(26, 'third-party', '26 mm equivalent, widely reported from Apple\'s 2021 launch; not on the spec page'),
    aperture: v(1.5, 'spec', 'Wide: ƒ/1.5 aperture'),
  },
  ultraWide: {
    name: 'rear camera 3',
    label: 'Ultra Wide',
    fromSide: v(30.08, 'dimensioned', s1('Detail D: 2X 30.08 (rear camera 3 and the flash)')),
    fromTop: v(22.39, 'dimensioned', s1('Detail D: -22.39 REAR CAMERA 3')),
    ring: v(15.8, 'dimensioned', s1('Detail D: Ø 15.80 (camera 3\'s outer ring)')),
    window: v(12.05, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(6.69, 'dimensioned', 'sheet 2, Section G-G: 6.69, labelled REAR CAMERA 1 KEEPOUT CONE TO COVER GLASS; read as camera 3\'s: G-G cuts camera 3 and its 123° names camera 3 (the 13 mini\'s G-G carries the same copied label)'),
    keepoutCone: v(123, 'dimensioned', 'sheet 2, Section G-G: 123° REAR CAMERA 3 KEEPOUT CONE'),
    fov: v(120, 'spec', 'Ultra Wide: ƒ/1.8 aperture and 120° field of view'),
    aperture: v(1.8, 'spec', 'Ultra Wide: ƒ/1.8'),
  },
};

export const flash = {
  fromSide: v(30.08, 'dimensioned', s1('Detail D: 2X 30.08 FLASH')),
  fromTop: v(9.42, 'dimensioned', s1('Detail D: -9.42 FLASH')),
  /** Not given here. Its heavy circle's stroke middles read 6.156, exactly as the 13 Pro Max's dimensioned Ø6.28 does. */
  diameter: v(6.28, 'inferred', 'the 13 Pro Max\'s Ø6.28: its bump is this one, number for number, and its flash circle reads the same (first scaled 6.23, through a leader)'),
};

/**
 * The rear mic, on the bump's top. Detail D draws it (two concentric circles, the Ø1.15 leader on the outer) and
 * dimensions only its diameter: no line runs to its centre, so its place is scaled. Detail D puts it at 35.78 across and
 * 32.22 down; sheet 2's Detail H, which draws it again (on its 7.06 dimension line, at the arrowhead), at 35.76 and
 * 32.20 (measure.ts reads both). 35.76 across is the product's centre line, but nothing says the mic is on it: the
 * scaled number is kept. It sits inside the top's bottom-right R9.39 corner (6.0 from the corner's centre), so the
 * builder puts it flush on the bump's top.
 */
export const rearMic = {
  fromSide: v(35.78, 'scaled', 'Detail D: the mic\'s outer circle, its centre across (no dimension runs to it; Detail H reads 35.76)'),
  fromTop: v(32.22, 'scaled', 'Detail D: the mic\'s outer circle, its centre down (Detail H reads 32.20)'),
  diameter: v(1.15, 'dimensioned', s1('Detail D: 2 Ø 1.15 REAR MIC (the leader on the outer of its two circles; note 2: DO NOT OBSTRUCT PORTS)')),
};

/**
 * The flash's keepout, drawn in two sections through its centre: Section G-G down the phone (the cut on Detail H's
 * 30.08 line; drawn twice, the flash's piece labelled SECTION G-G, camera 3's and the LiDAR's beside it unlabelled), and
 * K-K across it (Detail H's horizontal cut through the flash). As the 13's G-G and K-K: an inner cone from the strobe
 * (the flash's face, drawn under the bump's glass) turning at 11.27 from the cover glass into a 157° outer cone, the
 * inner cone 112° in G-G and 96° in K-K, from one Ø6.00 base on the strobe (K-K's dimension). Not a cone about one
 * axis; the family's field takes one angle, G-G's 112° (a circular cone of it from the same base encloses K-K's 96°: the
 * keepout's safe side); the across section is kept below (`flashKeepoutAcross`), not built.
 *
 * "To cover glass" is from the front: 11.27's arrow lands on G-G's left face (the screen), the bump on the right, and its
 * extension line meets the kinks (measure.ts). The 13's 11.10 is 1.95 beyond its bump's top (9.15); this one's 11.27 is
 * 1.94 beyond 9.33: the same cone on a 0.18 taller bump. Neither section dimensions an apex: it's worked as the 13's, the
 * 112° cone through the flash's Ø6.28 edge at the bump's top (7.65 + 1.68). Both sections draw the bump's glass at
 * about 9.24 and camera 1's and camera 3's rings at 11.16 to 11.18, where sheet 1 dimensions 1.68 and 3.60 (9.33 and
 * 11.25): 0.09 thin, as the 13's sections are 0.08 thin (measure.ts).
 */
export const flashKeepout = {
  inner: v(112, 'dimensioned', s2('Section G-G: 112° FLASH INNER KEEPOUT CONE (down the phone; K-K across it gives 96°: see flashKeepoutAcross)')),
  outer: v(157, 'dimensioned', s2('Sections G-G and K-K: 157° FLASH OUTER KEEPOUT CONE (the same in both)')),
  transitionFromFront: v(11.27, 'dimensioned', s2('Section G-G: 11.27 FLASH KEEPOUT CONE TRANSITION TO COVER GLASS (its arrow on the section\'s front face, its extension line through the kinks)')),
  innerBaseDiameter: v(6.0, 'dimensioned', s2('Section K-K: Ø 6.00 FLASH INNER KEEPOUT CONE TO STROBE INTERSECTION (its extension lines on the inner cone\'s corners at the strobe\'s face)')),
  apexFromFront: v(7.21, 'derived', s2('Section G-G: not dimensioned; the 112° cone through the flash\'s Ø6.28 edge at the bump\'s top: 7.65 + 1.68 - 3.14 / tan 56°')),
};

/** What K-K gives beyond the family's field (not built, not in features.json): the inner cone across the phone. */
export const flashKeepoutAcross = {
  inner: v(96, 'dimensioned', s2('Section K-K: 96° FLASH INNER KEEPOUT CONE (across the phone)')),
  apexFromFront: v(6.5, 'derived', s2('Section K-K: not dimensioned; the 96° cone through the flash\'s Ø6.28 edge at the bump\'s top: 9.33 - 3.14 / tan 48°')),
  transitionFromFront: v(11.27, 'inferred', s2('Section K-K: its kinks drawn at G-G\'s dimensioned 11.27 from the cover glass (measure.ts)')),
  /** The strobe's face under the bump's glass, as both sections draw it (the base of the inner cone). */
  strobeRecess: v(0.1, 'scaled', 'sheet 2, Sections G-G and K-K: the strobe\'s face 0.10 under the bump\'s glass beside it (measure.ts), as on the 13'),
};

/**
 * MagSafe's keepouts (sheet 2, the MagSafe view: the right-hand back view), every number but the zone's top the 12 Pro's.
 * The clear area (5: DO NOT OBSTRUCT THIS AREA WITH METAL, CONDUCTIVE MATERIAL OR MAGNETIC MATERIAL) is a whole Ø57.50
 * circle round the product centre, 7.01 inside each edge. The magnetic zone (5 7: DO NOT OBSTRUCT THIS AREA WITH MAGNETIC
 * OR PERMEABLE MATERIAL EXCEPT MAGSAFE MAGNETS) is the 16's shape: the full width from -43.62 down (the bump outline's
 * bottom, Detail D's -43.62: here the camera corner's keepout ends on the bump, where the 13's and 12 Pro's end 5.00 and
 * 2.50 below theirs), straight-sided to -107.42, closed by an R49.39 arc through those corners, whose centre (derived:
 * 107.42 - √(49.39² - 35.76²) = 73.35 down) is the product centre, as on the 12 and 12 Pro (the 13's and 16's isn't).
 */
export const magsafe = {
  fromSide: v(35.76, 'dimensioned', s2('MagSafe view: 35.76 PRODUCT CENTER')),
  fromTop: v(73.35, 'dimensioned', s2('MagSafe view: -73.35 PRODUCT CENTER')),
  diameter: v(57.5, 'dimensioned', s2('MagSafe view: Ø 57.50 (its leader on the clear area\'s circle; measure.ts fits the circle round the product centre)')),
  zoneFrom: v(43.62, 'dimensioned', s2('MagSafe view: -43.62, the zone\'s top edge, the full width (the camera corner\'s keepout\'s bottom; Detail D\'s bump outline bottom)')),
  zoneSidesTo: v(107.42, 'dimensioned', s2('MagSafe view: 2X -107.42, where the zone\'s sides (the phone\'s) meet its arc')),
  zoneRadius: v(49.39, 'dimensioned', s2('MagSafe view: R 49.39, the arc closing the zone below')),
};

/**
 * What the MagSafe view gives beyond the family's fields (not built, not in features.json):
 * - above the zone, the camera corner (from 0.00 across and down to -43.62, crosshatched): DO NOT OBSTRUCT THIS AREA WITH
 *   MAGNETIC OR PERMEABLE MATERIAL (FULL PRODUCT VOLUME INCLUDING SIDEWALLS). Its right edge isn't dimensioned on this
 *   view; it's drawn on Detail D's 42.39 (the bump outline's right edge: measure.ts scales it). The rest of the top
 *   carries no keepout but the compass;
 * - the COMPASS, a small crosshatched circle centred 65.26 across, -11.09 down (its size not dimensioned).
 * Sheet 2's middle back view and its side view give other keepouts (metal and conductive material: the top and bottom
 * bands, the side band, the area beside the bump), not recorded here.
 */
export const magsafeExtras = {
  cameraZone: {
    across: v(42.39, 'inferred', s2('MagSafe view: the camera corner\'s keepout, its right edge drawn on Detail D\'s 42.39 (not dimensioned here; measure.ts scales it)')),
    down: v(43.62, 'dimensioned', s2('MagSafe view: -43.62, its bottom (the zone\'s top)')),
  },
  compass: { fromSide: v(65.26, 'dimensioned', s2('MagSafe view: 65.26 COMPASS')), fromTop: v(11.09, 'dimensioned', s2('MagSafe view: -11.09 COMPASS')) },
};

/** The LiDAR scanner: sheet 2's Detail H gives the base of its keepout cone on the plateau, a stadium, as its window. */
export const sensor = {
  name: 'LiDAR scanner',
  fromSide: v(30.08, 'dimensioned', 'sheet 2, Detail H: on the 30.08 line (section G-G through camera 3 and the sensor)'),
  fromTop: v(35.35, 'dimensioned', 'sheet 2, Detail H: -35.35 REAR SENSOR'),
  keepoutCone: v(77, 'dimensioned', 'sheet 2, Section G-G: 77° REAR SENSOR KEEPOUT CONE'),
  window: {
    width: v(4.06, 'dimensioned', 'sheet 2, Detail H: 4.06'),
    length: v(7.06, 'dimensioned', 'sheet 2, Detail H: 7.06 (REAR SENSOR BASE OF KEEPOUT CONE CONTACTING PLATEAU SURFACE)'),
  },
};

export const lightning = {
  name: 'Lightning' as const,
  width: v(13.65, 'dimensioned', s1('Detail C: 13.65 RECOMMENDED CONNECTOR KEEPOUT (2X R 3.40 corners)')),
  thickness: v(6.85, 'dimensioned', s1('Detail C: 6.85 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(35.76, 'dimensioned', s1('Detail C: 35.76 (the port\'s centre, from the side-button edge)')),
  fromBack: v(3.8, 'dimensioned', s1('Detail C: 3.80, the port\'s centre line to the back glass (the 13\'s is 3.82)')),
  outward: v(14.0, 'dimensioned', s1('Detail C: MATING CONNECTOR KEEPOUT AREA ... REQUIRED OUTWARD 14.0 mm')),
};

export const front = {
  activeWidth: v(64.58, 'dimensioned', s1('front view: 64.58 DISPLAY ACTIVE AREA')),
  activeLength: v(139.77, 'dimensioned', s1('front view: 139.77 DISPLAY ACTIVE AREA')),
  activeFromEdge: v(3.47, 'dimensioned', s1('front view: 3.47 ALL AROUND, EXTERIOR OF HOUSING TO DISPLAY ACTIVE AREA')),
  activeRadius: v(7.89, 'scaled', 'front view: the active area\'s corners crossed on their diagonals'),
  notchWidth: v(26.79, 'dimensioned', s1('front view: 26.79 ACTIVE AREA CUTOUT (wall to wall)')),
  notchDepth: v(5.58, 'dimensioned', s1('front view: 5.58 ACTIVE AREA CUTOUT, from the active area\'s top (as the 13 mini\'s 5.77)')),
  notchTopRadius: v(0.95, 'dimensioned', s1('front view: 2X R 0.95')),
  notchBottomRadius: v(3.8, 'dimensioned', s1('front view: 2X R 3.80')),
  receiverLength: v(11.12, 'dimensioned', s1('Detail A: 11.12 (the receiver\'s slot)')),
  receiverHeight: v(0.85, 'dimensioned', s1('Detail A: 0.85')),
  receiverFromTop: v(1.75, 'dimensioned', s1('Detail A: -1.75 (the receiver\'s centre line)')),
  receiverDepth: v(0.3, 'assumed', 'the slot\'s depth for a render: the drawing gives none'),
};

export const buttons = {
  ringSilent: {
    side: 'volume' as const,
    centre: v(32.22, 'dimensioned', s1('left side view: 32.22 POCKET CENTER')),
    half: v(2.9, 'dimensioned', s1('left side view: 2X 2.90 (centre to each end of the pocket)')),
    width: v(2.15, 'dimensioned', s1('left side view: 2.15')),
    fromBack: v(3.75, 'dimensioned', s1('left side view: 3.75 POCKET CENTER, from the back glass\'s line')),
    proud: v(0.6, 'dimensioned', s1('front view: 0.60 RING/SILENT SWITCH')),
    note: 'the switch sits in a 5.80 x 2.15 pocket; modelled as a block of the pocket\'s size standing 0.60 proud',
  },
  volumeUp: {
    side: 'volume' as const,
    centre: v(45.53, 'dimensioned', s1('left side view: 45.53 (+) VOLUME BUTTON')),
    half: v(5.8, 'dimensioned', s1('left side view: 4X 5.80')),
    width: v(3.06, 'dimensioned', s1('left side view: 2X 3.06')),
    fromBack: v(3.82, 'dimensioned', s1('left side view: 2X 3.82, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (+) VOLUME BUTTON')),
    note: '',
  },
  volumeDown: {
    side: 'volume' as const,
    centre: v(59.53, 'dimensioned', s1('left side view: 59.53 (-) VOLUME BUTTON')),
    half: v(5.8, 'dimensioned', s1('left side view: 4X 5.80')),
    width: v(3.06, 'dimensioned', s1('left side view: 2X 3.06')),
    fromBack: v(3.82, 'dimensioned', s1('left side view: 2X 3.82, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (-) VOLUME BUTTON')),
    note: '',
  },
  side: {
    side: 'side' as const,
    centre: v(52.53, 'dimensioned', s1('right side view: 52.53 SIDE BUTTON')),
    half: v(9.05, 'dimensioned', s1('right side view: 2X 9.05')),
    width: v(3.06, 'dimensioned', s1('right side view: 3.06')),
    fromBack: v(3.83, 'derived', s1('right side view: 3.82 from the front glass\'s line, so 7.65 - 3.82 from the back')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 SIDE BUTTON')),
    note: '',
  },
};

export const simTray = {
  centre: v(83.69, 'dimensioned', s1('left side view: 83.69')),
  length: v(16.04, 'derived', s1('left side view: 2X 8.02, centre to each end')),
  width: v(2.66, 'dimensioned', s1('left side view: 2.66')),
  fromBack: v(3.82, 'inferred', 'left side view: drawn on the buttons\' centre line (3.82 from the back glass); not dimensioned for the tray'),
};

/**
 * The bottom edge, from the volume-button edge. Only each group's end holes are dimensioned, and their extension lines
 * touch the holes' outer edges: 19.14 and 25.18 bound the three on the left, 46.34 and 56.89 the five on the right. A
 * hole's centre is half its 1.53 inside; the holes between are evenly spaced, as drawn (both groups 2.255 apart).
 */
const R = 1.53 / 2;
const group = (from: number, to: number, n: number, which: string) => {
  const [a, b] = [from + R, to - R];
  return Array.from({ length: n }, (_, i) => {
    const mm = +(a + ((b - a) * i) / (n - 1)).toFixed(3);
    const how = i === 0 ? `${from} + 0.765: ${from} lands on the hole's outer edge` : i === n - 1 ? `${to} - 0.765: ${to} lands on the hole's outer edge` : `evenly between, as drawn`;
    return v(mm, i === 0 || i === n - 1 ? 'derived' : 'inferred', s1(`bottom view, the ${which} group (8X Ø 1.53 PORTS): ${how}`));
  });
};

export const bottom = {
  holes: [...group(19.14, 25.18, 3, 'left'), ...group(46.34, 56.89, 5, 'right')],
  holeDiameter: v(1.53, 'dimensioned', s1('bottom view: 8X Ø 1.53 PORTS')),
  holesFromBack: v(3.75, 'dimensioned', s1('bottom view: 3.75, the holes\' centre line to the back glass\'s line')),
  holeDepth: v(0.6, 'assumed', 'a mic or speaker hole\'s depth for a render: the drawing gives none'),
  screws: [29.37, 42.16].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (2X Ø 1.50 SCREW)`))),
  screwDiameter: v(1.5, 'dimensioned', s1('bottom view: 2X Ø 1.50 SCREW')),
  screwsFromBack: v(3.75, 'inferred', 'Detail C draws the screws on the holes\' centre line'),
  portFrom: v(31.74, 'dimensioned', s1('bottom view: 31.74 (the Lightning port\'s near end)')),
  portTo: v(39.79, 'dimensioned', s1('bottom view: 39.79 (its far end; centre 35.765, as Detail C\'s 35.76)')),
  portHeight: v(2.3, 'dimensioned', s1('Detail C: 2.30 (the port\'s opening across the thickness); its ends round (inferred)')),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none'),
};

export const mass = v(204, 'spec', 'Weight: 204 grams');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '12MP (spec); 4032 x 3024 is the usual 4:3 still size, not on the spec page' };

/** Everything above, as the family's builder (iphone/part.ts) reads it. */
export const phone: Phone = {
  part: {
    title: 'iPhone 13 Pro',
    name: 'iphone-13-pro.dat',
    keywords: ['Apple', 'iPhone 13 Pro', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [
      ['2026-10-30', 'Built from Apple\'s dimensional drawing: body, cameras, LiDAR, buttons, ports, notch'],
      ['2026-11-01', 'Rear mic added (Detail D); the flash\'s keepout and MagSafe\'s keepouts in its features'],
    ],
    drawn: '05/14/21',
    folder: 'iphone-13-pro',
  },
  details: { corner: 'Detail A', edge: 'Detail B', back: 'Detail D', port: 'Detail C' },
  body,
  bump,
  cameras,
  cameraIdentity: cameras.telephoto.identity,
  flash: { ...flash, keepout: flashKeepout },
  rearMic,
  magsafe,
  sensor,
  connector: lightning,
  front,
  buttons,
  simTray,
  bottom,
  mass,
  image,
};
