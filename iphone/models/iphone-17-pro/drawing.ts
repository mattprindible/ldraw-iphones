// iPhone 17 Pro, read from Apple's dimensional drawing (iphone/drawings/iphone-17-pro.pdf, sheets 1 to 4,
// dated 2025-09-09). Every number carries where it came from and how we know it (src/provenance.ts): spec here is
// Apple's technical specifications page (support.apple.com/125090); scaled values are re-measured by measure.ts.
//
// A camera plateau across the top of the back in place of a bump (2.55 above the back plate, the lens rings 1.88
// above it), a back that rounds further than the front (Detail B gives each), the cameras, flash and LiDAR window in a
// row of three across the plateau, Camera Control. Sheet 1's views at three scales (the front 34.56 px/mm at 1200 dpi,
// the bottom 23.05, Detail D 45.04); sheet 3 the keepout sections (the flash's: Section T-T); sheet 4 the antenna
// keepouts and MagSafe's.
import type { Phone } from '../../drawing.ts';
import type { Calibration, Region } from '../../../src/raster.ts';
import { v, type Kind } from '../../../src/provenance.ts';

/** Where the scaled values were measured: regions of sheet 1 (PDF page 2) at 1200 dpi, each with its calibration. */
export const detailD: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 15100, y: 900, width: 3700, height: 2600 }, pxPerMm: 46.08, origin: [294.5, 266] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5400, y: 3300, width: 3000, height: 5700 }, pxPerMm: 34.56, origin: [205.5, 280.5] };
export const bottomView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5000, y: 10600, width: 3200, height: 500 }, pxPerMm: 23.05, origin: [1019.5, 287.25] };
/** The rear mic at 4800 dpi, round its dimensioned centre (measure.ts places the window from Detail D's calibration). */
export const micWindow = { dpi: 4800, half: 700 };
/** Sheet 3 (PDF page 4) at 1200 dpi: Section T-T (through the flash, down the phone, the front face on the left), its origin the front face and the flash's axis. */
export const sectionTT: Region & Calibration = { page: 4, dpi: 1200, crop: { x: 12400, y: 700, width: 1300, height: 2600 }, pxPerMm: 46.08, origin: [276.5, 1429] };
/** Sheet 4 (PDF page 5) at 1200 dpi: the MagSafe view (the middle back view), calibrated on its 0.00 and 35.92 lines across and its 0.00 and 114.73 lines down. */
export const magsafeView: Region & Calibration = { page: 5, dpi: 1200, crop: { x: 7000, y: 2500, width: 3700, height: 7800 }, pxPerMm: 46.1, origin: [190, 319.5] };

const s1 = (what: string) => `sheet 1, ${what}`;
const s2 = (what: string) => `sheet 2, ${what}`;
const s3 = (what: string) => `sheet 3, ${what}`;
const s4 = (what: string) => `sheet 4, ${what}`;

export const body = {
  width: v(71.85, 'dimensioned', s1('front view: 71.85 PRODUCT WIDTH')),
  length: v(150.01, 'dimensioned', s1('front view: 150.01 PRODUCT LENGTH')),
  thickness: v(8.75, 'dimensioned', s1('side view: 8.75 PRODUCT THICKNESS (front glass to back plate)')),
  glassWidth: v(69.45, 'dimensioned', s1('front view: 69.45 GLASS')),
  glassLength: v(147.61, 'dimensioned', s1('front view: 147.61 GLASS')),
  corner: {
    points: [
      [19.43, 0],
      [13.9, 0.04],
      [8.46, 0.92],
      [3.8, 3.8],
      [0.92, 8.46],
      [0.04, 13.9],
      [0, 19.43],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail A: CORNER PROFILE (ALL FOUR CORNERS); each label paired with the cross its leader reaches'),
  },
  /** The front: flat to 1.50, rounding to the face's flat 2.61 in (the front view's 2.61 ALL AROUND). */
  edge: {
    points: [
      [0.01, 1.5],
      [0.15, 2.99],
      [0.9, 4.24],
      [1.2, 4.29],
      [2.61, 4.38],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail B: PROFILE (ALL SIDES), the upper (front) side: insets 0.01, 0.15, 0.90, 1.20, 2.61 paired in order with 1.50, 2.99, 4.24, 4.29, 4.38'),
  },
  /** The back rounds further: flat to 1.44, to the back plate's flat 3.79 in. */
  edgeBack: {
    points: [
      [0, 1.44],
      [0.17, 2.86],
      [0.97, 4.01],
      [2.35, 4.35],
      [3.79, 4.38],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail B: the lower (back) side: insets 0.00, 0.17, 0.97, 2.35, 3.79 paired in order with -1.44, -2.86, -4.01, -4.35, -4.38'),
  },
};

/**
 * On a plateau phone, the camera area outlined on the plateau's top (Detail D's inner rounded rectangle), and the
 * heights: the plateau 2.55 above the back plate, the camera glass 1.88 above the plateau.
 */
export const bump = {
  top: v(2.55, 'dimensioned', s1('right side view: 2.55 BACK PLATE TO CAMERA PLATEAU')),
  /** Labelled BACK PLATE TO REAR CAMERA GLASS, its leaders span from the plateau to the camera glass: 2.55 + 1.88. */
  rings: v(4.43, 'derived', s1('right side view: 1.88, its extension lines from the plateau\'s to the camera glass\'s (measured 2.56 and 4.44 from the back plate\'s at 1200 dpi), so 2.55 + 1.88')),
  baseFrom: v(4.84, 'scaled', 'Detail D: the camera area\'s outer outline, its near sides (a double outline, 0.2 apart)'),
  baseSize: v(62.15, 'scaled', 'Detail D: the outer outline across'),
  baseHeight: v(38.26, 'scaled', 'Detail D: the outer outline down'),
  baseRadius: v(9.68, 'scaled', 'Detail D: the outer outline\'s corners crossed on their diagonals, 9.59 to 9.74'),
  topFrom: v(5.04, 'scaled', 'Detail D: the camera area\'s inner outline, its near sides'),
  topSize: v(61.76, 'scaled', 'Detail D: the inner outline across'),
  topHeight: v(37.86, 'scaled', 'Detail D: the inner outline down'),
  topRadius: v(9.49, 'scaled', 'Detail D: the inner outline\'s corners crossed on their diagonals, 9.44 to 9.52'),
};

/** The plateau: its outline in Detail D (the outer rounded rectangle), a little in from the phone's, its bottom edge rounded. */
export const plateau = {
  height: bump.top,
  inset: v(0.74, 'scaled', 'Detail D: the plateau\'s outline from the phone\'s (0.76 at the side, 0.72 at the top)'),
  bottom: v(47.93, 'scaled', 'Detail D: the plateau\'s bottom edge from the top edge'),
  radius: v(13.04, 'scaled', 'Detail D: its bottom corners crossed on their diagonals, 13.00 and 13.07'),
};

/** Which is which, from sheet 3's keepout cones: camera 1 the Ultra Wide (125°), 2 the Fusion (90°), 3 the 4x Telephoto (34°). */
export const cameras = {
  ultraWide: {
    name: 'rear camera 1',
    label: 'Ultra Wide',
    fromSide: v(14.37, 'dimensioned', s1('Detail D: 2X 14.37 (rear cameras 1 and 2)')),
    fromTop: v(14.37, 'dimensioned', s1('Detail D: -14.37 REAR CAMERA 1')),
    ring: v(16.2, 'dimensioned', s1('Detail D: 3X Ø16.20')),
    window: v(13.55, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(10.21, 'dimensioned', s3('Section S-S: 10.21 REAR CAMERA KEEPOUT ZONE TO COVER GLASS (camera 1)')),
    keepoutCone: v(125, 'dimensioned', s3('Section S-S: 125° REAR CAMERA 1 KEEPOUT ZONE')),
    identity: v(1, 'inferred', 'camera 1 is the Ultra Wide: its 125° zone encloses its 120° (spec); camera 2\'s 90° the Fusion\'s 24 mm (84°); camera 3\'s 34° the 4x Telephoto\'s 100 mm (24°)'),
    fov: v(120, 'spec', '48MP Fusion Ultra Wide: 13 mm, ƒ/2.2 aperture and 120° field of view'),
    aperture: v(2.2, 'spec', 'Ultra Wide: ƒ/2.2'),
  },
  main: {
    name: 'rear camera 2',
    label: 'Fusion',
    fromSide: v(14.37, 'dimensioned', s1('Detail D: 2X 14.37 (rear cameras 1 and 2)')),
    fromTop: v(33.61, 'dimensioned', s1('Detail D: -33.61 REAR CAMERA 2')),
    ring: v(16.2, 'dimensioned', s1('Detail D: 3X Ø16.20')),
    window: v(13.55, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(8.86, 'dimensioned', s3('Section S-S: 8.86 REAR CAMERA KEEPOUT ZONE TO COVER GLASS (camera 2)')),
    keepoutCone: v(90, 'dimensioned', s3('Section S-S: 90° REAR CAMERA 2 KEEPOUT ZONE')),
    equivalentFocal: v(24, 'spec', '48MP Fusion: 24 mm focal length'),
    aperture: v(1.78, 'spec', 'Main: ƒ/1.78'),
  },
  telephoto: {
    name: 'rear camera 3',
    label: 'Telephoto',
    fromSide: v(32.36, 'dimensioned', s1('Detail D: 32.36 REAR CAMERA 3')),
    fromTop: v(23.99, 'dimensioned', s1('Detail D: -23.99 REAR CAMERA 3')),
    ring: v(16.2, 'dimensioned', s1('Detail D: 3X Ø16.20')),
    window: v(12.44, 'scaled', 'Detail D: the innermost of the camera\'s circles (camera 3 has one more than cameras 1 and 2)'),
    coneApexFromFront: v(8.02, 'dimensioned', s3('Section V-V: 8.02 REAR CAMERA KEEPOUT ZONE TO COVER GLASS (camera 3; its base Ø5.00)')),
    keepoutCone: v(34, 'dimensioned', s3('Section V-V: 34° REAR CAMERA 3 KEEPOUT ZONE')),
    equivalentFocal: v(100, 'spec', '48MP Fusion Telephoto: 100 mm (4x)'),
    aperture: v(2.8, 'spec', 'Telephoto: ƒ/2.8'),
  },
};

/**
 * The flash's keepout: sheet 3's Section T-T, the only section through the flash (down the phone, on the 58.03 line
 * through the flash and the rear sensor; the front face on the left, the plateau on the right). Its numbers are
 * unlabelled but for the cones' and the base's names; their arrows say what they span (measure.ts, at 1200 dpi):
 * - 11.30 runs from the front face's extension line to the section's back face over the flash, the plateau's top
 *   (8.75 + 2.55 = 11.30): the inner cone's base, Ø6.65 FLASH INNER KEEPOUT CONE BASE DIAMETER (its extension lines on
 *   the base's corners), lies on it. 11.30 is not an apex: the inner lines cross 1.8 nearer the front.
 * - 13.77 runs from the front face's to an extension line that ends at the kinks, where the inner cone (123° FLASH INNER
 *   KEEPOUT CONE V-FOV) turns into the outer (157° FLASH OUTER KEEPOUT CONE V-FOV): the transition. Ø6.65 widened over
 *   2.47 at 61.5° each side puts the kinks 6.65 + 2 x 2.47 tan 61.5° = 15.75 apart (drawn so).
 * - a line closes the keepout 15.30 from the front, not dimensioned (scaled: the base's 11.30 + 4.00, as the 16 Pro's
 *   (4.00)); no field takes it (`flashKeepoutEnd`).
 * "To cover glass" (sheet 3's camera sections' wording) is from the front: every arrow here starts on the front face.
 * Neither apex is dimensioned: each is derived from the printed numbers and checked against the drawn lines' crossings.
 * Only V-FOV is given (no section across the phone): the cones are taken as round, an assumption.
 */
export const flashKeepout = {
  inner: v(123, 'dimensioned', s3('Section T-T: 123° FLASH INNER KEEPOUT CONE V-FOV (down the phone; no section across: round assumed)')),
  outer: v(157, 'dimensioned', s3('Section T-T: 157° FLASH OUTER KEEPOUT CONE V-FOV')),
  innerBaseDiameter: v(6.65, 'dimensioned', s3('Section T-T: 6.65 FLASH INNER KEEPOUT CONE BASE DIAMETER, its extension lines on the base\'s corners, on the plateau\'s top 11.30 from the front')),
  transitionFromFront: v(13.77, 'dimensioned', s3('Section T-T: 13.77 (unlabelled), from the front face\'s extension line to the one ending at the kinks, inner cone to outer')),
  apexFromFront: v(9.49, 'derived', s3('Section T-T: not dimensioned; the 123° cone through its Ø6.65 base at 11.30: 11.30 - 3.325 / tan 61.5° = 9.495')),
  outerApexFromFront: v(12.17, 'derived', s3('Section T-T: not dimensioned; the 157° cone through the kinks: 13.77 - (3.325 + 2.47 tan 61.5°) / tan 78.5° = 12.168')),
};

/** What T-T gives beyond the family's field (not in features.json): the distance to the inner cone's base. */
export const flashKeepoutBase = {
  fromFront: v(11.3, 'dimensioned', s3('Section T-T: 11.30 (unlabelled), the front face to the plateau\'s top, where the base lies (8.75 + 2.55)')),
};

/** The keepout's far end in T-T (not in features.json: the family's field has no place for it). */
export const flashKeepoutEnd = v(15.3, 'scaled', s3('Section T-T: the line closing the keepout, from the front face (not dimensioned)'));

export const flash = {
  fromSide: v(58.03, 'dimensioned', s1('Detail D: 3X 58.03 (the flash, the rear mic and the rear sensor)')),
  fromTop: v(13.82, 'dimensioned', s1('Detail D: -13.82 FLASH')),
  diameter: v(6.8, 'dimensioned', s1('Detail D: Ø6.80 FLASH')),
  keepout: flashKeepout,
};

/**
 * The rear mic: Detail D, one circle between the flash and the rear sensor. Across, it's on the 3X 58.03 line with
 * them (the third of the three); down, the -23.99 line on the right runs in to its centre (camera 3's -23.99 on the
 * left is the same row); its [2] Ø1.05 REAR MIC leader lands on the circle from the lower right. measure.ts fits the
 * circle at 4800 dpi. On the camera area's top, so the builder lays it flush on the plateau.
 */
export const rearMic = {
  fromSide: v(58.03, 'dimensioned', s1('Detail D: 3X 58.03 (the flash, the rear mic and the rear sensor)')),
  fromTop: v(23.99, 'dimensioned', s1('Detail D: -23.99, its line run in from the right to the mic\'s centre')),
  diameter: v(1.05, 'dimensioned', s1('Detail D: [2] Ø1.05 REAR MIC (its leader on the circle)')),
};

/**
 * MagSafe's keepouts (sheet 4, the middle back view; measure.ts re-reads them at 1200 dpi). The clear area (1 5 7: DO NOT
 * OBSTRUCT THIS AREA WITH METAL, CONDUCTIVE MATERIAL, OR MAGNETIC MATERIAL) is a whole Ø57.50 circle centred on the
 * 35.92 line across (half the 71.85 is 35.925) and the 77.74 line down, which is not the product's centre (150.01 / 2 =
 * 75.005): 2.735 below it. Neither line is labelled PRODUCT CENTER here. The magnetic zone (5 7: DO NOT OBSTRUCT THIS
 * AREA WITH MAGNETIC OR PERMEABLE MATERIAL EXCEPT MAGSAFE MAGNETS) is the 16's shape: the full width from the plateau's
 * bottom edge down (its top is not dimensioned: scaled 47.96, where Detail D puts the plateau's bottom at 47.93),
 * straight-sided to 2X 114.73, closed by an R49.39 arc through those corners, whose centre (derived: 114.73 -
 * √(49.39² - 35.925²) = 80.84 down) is 3.10 below the clear circle's, as the 16 Pro's is 3.07 below its own.
 */
export const magsafe = {
  fromSide: v(35.92, 'dimensioned', s4('MagSafe view: 35.92, the clear circle\'s centre line (below the view; half the 71.85 is 35.925)')),
  fromTop: v(77.74, 'dimensioned', s4('MagSafe view: 77.74, the clear circle\'s centre line (half the 150.01 is 75.005: 2.735 below the product\'s centre)')),
  diameter: v(57.5, 'dimensioned', s4('MagSafe view: Ø57.50 (its leader on the clear area\'s circle; measure.ts fits the circle round 35.92, 77.74)')),
  zoneFrom: v(47.96, 'scaled', s4('MagSafe view: the zone\'s top, the full width, on the plateau\'s bottom edge (not dimensioned; Detail D scales the plateau\'s bottom 47.93)')),
  zoneSidesTo: v(114.73, 'dimensioned', s4('MagSafe view: 2X 114.73, where the zone\'s sides (the phone\'s) meet its arc')),
  zoneRadius: v(49.39, 'dimensioned', s4('MagSafe view: R49.39, the arc closing the zone below')),
};

/**
 * What sheet 4 gives beyond the family's fields (not built, not in features.json):
 * - in the MagSafe view, the 5 7 COMPASS, a small hatched circle centred 20.11 across, 145.48 down (its size not
 *   dimensioned);
 * - the left back view: DO NOT OBSTRUCT THIS AREA WITH METAL OR OTHER CONDUCTIVE MATERIAL (FULL PRODUCT VOLUME INCLUDING
 *   SIDEWALLS) over the top down to 58.01, its lower corners R12.00 (the plateau within it, R11.81 and R11.82: the
 *   antenna keepout the README names), and a U over the bottom: its arms from 117.26 down outside 14.20 and 57.65
 *   across, the full width from 135.81;
 * - the right back view and its side view: a VIEW CONE kept clear of metal or other conductive material above the top
 *   edge (15.92 to 55.92 across, 27° and 44°, 0.78 and 14.50), and an area 8.34 to 32.04 across, 106.64 to 141.16 down,
 *   kept clear WITHIN 1 mm OF GLASS (the side view's 1.00).
 * Their numbers are as printed; only the compass is re-measured.
 */
export const magsafeExtras = {
  compass: { fromSide: v(20.11, 'dimensioned', s4('MagSafe view: 20.11 (5 7 COMPASS)')), fromTop: v(145.48, 'dimensioned', s4('MagSafe view: 145.48 (5 7 COMPASS)')) },
};

/** The LiDAR scanner: drawn here (Detail D: REAR SENSOR Ø6.65), a round window. */
export const sensor = {
  name: 'LiDAR scanner',
  fromSide: v(58.03, 'dimensioned', s1('Detail D: 3X 58.03')),
  fromTop: v(34.16, 'dimensioned', s1('Detail D: -34.16 REAR SENSOR')),
  keepoutCone: v(84, 'dimensioned', s3('Detail AA: 84° REAR SENSOR KEEPOUT CONE')),
  window: {
    width: v(6.65, 'dimensioned', s1('Detail D: Ø6.65 REAR SENSOR')),
    length: v(6.65, 'dimensioned', s1('Detail D: Ø6.65 (round)')),
  },
};

export const connector = {
  name: 'USB-C' as const,
  width: v(12.45, 'dimensioned', s1('Detail C: 12.45 RECOMMENDED CONNECTOR KEEPOUT (2X R3.25 corners)')),
  thickness: v(6.6, 'dimensioned', s1('Detail C: 6.60 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(35.92, 'dimensioned', s1('Detail C: 35.92 (the port\'s centre, from the side-button edge)')),
  fromBack: v(4.375, 'dimensioned', s1('bottom view: 12X 4.375 (the holes, the screws and the port on one centre line; Detail C\'s keepout runs 3.25 below it)')),
  outward: v(14.0, 'dimensioned', s1('Detail C: MATING CONNECTOR KEEPOUT AREA FLUSH TO PRODUCT SURFACE REQUIRED OUTWARD 14.0 mm')),
};

/**
 * The receiver, a 27.38 x 0.70 slit centred 1.25 from the top (Detail A), lies on the glass's curved edge, outside the
 * flat face the part models, so it isn't drawn.
 */
export const front = {
  activeWidth: v(66.57, 'dimensioned', s1('front view: 66.57 DISPLAY ACTIVE AREA')),
  activeLength: v(144.73, 'dimensioned', s1('front view: 144.73 DISPLAY ACTIVE AREA')),
  activeFromEdge: v(2.64, 'dimensioned', s1('front view: 2.64 ALL AROUND, EXTERIOR OF HOUSING TO DISPLAY ACTIVE AREA')),
  activeRadius: v(10.32, 'scaled', 'front view: the active area\'s corners crossed on their diagonals, 10.27 to 10.42 at three (the bottom-left\'s diagonal runs along a hatch line, as the 16 Pro\'s)'),
  islandLength: v(20.76, 'dimensioned', s1('front view: 20.76 (the Dynamic Island)')),
  islandHeight: v(6.07, 'dimensioned', s1('front view: 6.07')),
  islandFromTop: v(7.99, 'dimensioned', s1('front view: 7.99 (its centre line); centred across, on the 35.92 line')),
};

export const buttons = {
  action: {
    side: 'volume' as const,
    centre: v(34.28, 'dimensioned', s1('left side view: 34.28 ACTION BUTTON')),
    half: v(3.45, 'dimensioned', s1('left side view: 2X 3.45 (centre to each end)')),
    width: v(2.66, 'dimensioned', s1('left side view: 2.66 (across the thickness)')),
    fromBack: v(4.375, 'dimensioned', s1('left side view: 4X 4.375 (the mid-plane)')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 ACTION BUTTON')),
    note: '',
  },
  volumeUp: {
    side: 'volume' as const,
    centre: v(48.43, 'dimensioned', s1('left side view: 48.43 (+) VOLUME BUTTON')),
    half: v(5.6, 'dimensioned', s1('left side view: 4X 5.60')),
    width: v(2.66, 'dimensioned', s1('left side view: 3X 2.66')),
    fromBack: v(4.375, 'dimensioned', s1('left side view: 4X 4.375 (the mid-plane)')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (+) VOLUME BUTTON')),
    note: '',
  },
  volumeDown: {
    side: 'volume' as const,
    centre: v(62.63, 'dimensioned', s1('left side view: 62.63 (-) VOLUME BUTTON')),
    half: v(5.6, 'dimensioned', s1('left side view: 4X 5.60')),
    width: v(2.66, 'dimensioned', s1('left side view: 3X 2.66')),
    fromBack: v(4.375, 'dimensioned', s1('left side view: 4X 4.375 (the mid-plane)')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (-) VOLUME BUTTON')),
    note: '',
  },
  side: {
    side: 'side' as const,
    centre: v(55.53, 'dimensioned', s1('right side view: 55.53 SIDE BUTTON')),
    half: v(8.85, 'dimensioned', s1('right side view: 2X 8.85')),
    width: v(2.66, 'dimensioned', s1('right side view: 2.66')),
    fromBack: v(4.375, 'dimensioned', s1('right side view: 2X 4.375 (the mid-plane)')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 SIDE BUTTON')),
    note: '',
  },
};

export const simTray = {
  centre: v(114.19, 'dimensioned', s1('left side view: 114.19')),
  length: v(16.1, 'derived', s1('left side view: 2X 8.05, centre to each end')),
  width: v(2.56, 'dimensioned', s1('left side view: 2.56')),
  fromBack: v(4.375, 'dimensioned', s1('left side view: 4X 4.375 (the mid-plane)')),
};

/** Camera Control: flush (front view: 0.00), in the side-button side; sheet 2 gives its chamfer and its keepouts. */
export const cameraControl = {
  centre: v(98.4, 'dimensioned', s1('right side view: 98.40 CAMERA CONTROL')),
  half: v(8.55, 'dimensioned', s1('right side view: 2X 8.55 (centre to each end)')),
  width: v(3.03, 'dimensioned', s1('right side view: 3.03')),
  fromBack: v(4.375, 'dimensioned', s1('right side view: 2X 4.375 (the mid-plane)')),
  chamfer: v(0.63, 'dimensioned', s2('Section Z-Z: 0.63 ALL AROUND (and 0.18 deep), as the 16 Pro\'s')),
  keepoutLength: v(25.0, 'dimensioned', s2('CAMERA CONTROL KEEPOUT: 25.00 (4X R 2.20)')),
  keepoutWidth: v(4.2, 'dimensioned', s2('CAMERA CONTROL KEEPOUT: 2X 4.20')),
};

/**
 * The bottom edge, from the volume-button edge: every hole dimensioned (to its centre: each pair 2.255 apart), two
 * groups of five Ø1.06 (the speaker's four and bottom mic 2; bottom mic 1 and four more).
 */
export const bottom = {
  holes: [15.4, 17.65, 19.91, 22.16, 24.42, 47.43, 49.69, 51.94, 54.2, 56.45].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (10X Ø1.06 PORTS)`))),
  holeDiameter: v(1.06, 'dimensioned', s1('bottom view: 10X Ø1.06 PORTS')),
  holesFromBack: v(4.375, 'dimensioned', s1('bottom view: 12X 4.375 (the mid-plane)')),
  holeDepth: v(0.6, 'assumed', 'a mic or speaker hole\'s depth for a render: the drawing gives none'),
  screws: [29.0, 42.85].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (2X Ø1.50 SCREW)`))),
  screwDiameter: v(1.5, 'dimensioned', s1('bottom view: 2X Ø1.50 SCREW')),
  screwsFromBack: v(4.375, 'dimensioned', s1('bottom view: 12X 4.375')),
  portFrom: v(31.43, 'dimensioned', s1('bottom view: 31.43 (the USB-C port\'s near end)')),
  portTo: v(40.42, 'dimensioned', s1('bottom view: 40.42 (its far end: 8.99 long, Detail C\'s 9.00)')),
  portHeight: v(3.14, 'dimensioned', s1('Detail C: 3.14 (the port\'s opening across the thickness); its ends round (inferred)')),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none'),
};

export const mass = v(206, 'spec', 'Weight: 206 grams (the US page; others give 204: it varies by configuration)');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '4:3 at 12MP (the Ultra Wide and Telephoto; the Main\'s 24MP default has the same shape)' };

export const phone: Phone = {
  part: {
    title: 'iPhone 17 Pro',
    name: 'iphone-17-pro.dat',
    keywords: ['Apple', 'iPhone 17 Pro', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [
      ['2026-10-30', 'Built from Apple\'s dimensional drawing: body, plateau, cameras, buttons, Camera Control, USB-C, Dynamic Island'],
      ['2026-11-06', 'Rear mic; the flash\'s keepout (Section T-T) and MagSafe\'s keepouts in features.json'],
    ],
    drawn: '2025-09-09',
    folder: 'iphone-17-pro',
  },
  details: { corner: 'Detail A', edge: 'Detail B', back: 'Detail D', port: 'Detail C' },
  body,
  bump,
  plateau,
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
