// iPhone 18 Pro, read from Apple's dimensional drawing (iphone/drawings/iphone-18-pro.pdf, sheets 1 to 4,
// dated 2026-09-09). Every number carries where it came from and how we know it (src/provenance.ts): spec here is
// Apple's technical specifications page (support.apple.com/148590); scaled values are re-measured by measure.ts.
//
// The 17 Pro's body on the same plan (the same width, length, thickness, glass, active area, corner and edge
// profiles, buttons, Camera Control and bottom-edge positions), with a taller plateau (2.78 above the back plate, the
// camera glass 2.11 above it), larger lens rings (Ø16.58), camera 3 at 32.49 across, a Ø6.90 flash and LiDAR window, a
// shorter Dynamic Island (15.66), Ø1.53 bottom holes, a longer SIM tray, and different keepout cone depths. No receiver
// slit is dimensioned. Sheet 1's views at three scales (the front 34.56 px/mm at 1200 dpi, the bottom 23.05, Detail D
// 46.08); sheet 3 the keepout sections (the flash's: Section T-T); sheet 4 the antenna keepouts and MagSafe's.
import type { Phone } from '../../drawing.ts';
import type { Calibration, Region } from '../../../src/raster.ts';
import { v, type Kind } from '../../../src/provenance.ts';

/** Where the scaled values were measured: regions of sheet 1 (PDF page 2) at 1200 dpi, each with its calibration. */
export const detailD: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 15100, y: 900, width: 3700, height: 2600 }, pxPerMm: 46.08, origin: [295.4, 265.5] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5400, y: 3300, width: 3000, height: 5700 }, pxPerMm: 34.56, origin: [208.5, 280.5] };
export const bottomView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5000, y: 10600, width: 3200, height: 500 }, pxPerMm: 23.05, origin: [1022.5, 287.25] };
/** The rear mic at 4800 dpi, round its dimensioned centre (measure.ts places the window from Detail D's calibration). */
export const micWindow = { dpi: 4800, half: 700 };
/** Sheet 3 (PDF page 4) at 1200 dpi: Section T-T (through the flash, down the phone, the front face on the left), its origin the front face and the flash's axis. */
export const sectionTT: Region & Calibration = { page: 4, dpi: 1200, crop: { x: 12400, y: 700, width: 1300, height: 2600 }, pxPerMm: 46.08, origin: [278, 1429.75] };
/**
 * Sheet 3's scale, from Sections S-S and V-V (their dimension rows; their front faces' extension lines at these px):
 * T-T's own 14.00 line is drawn short of its number, so T-T is calibrated on the sheet's scale (measure.ts).
 */
export const sectionsSV: Region & { faces: { ss: number; vv: number } } = { page: 4, dpi: 1200, crop: { x: 6400, y: 1000, width: 4300, height: 500 }, faces: { ss: 342.5, vv: 3035.5 } };
/** Sheet 4 (PDF page 5) at 1200 dpi: the MagSafe view (the middle back view), calibrated on its 0.00 and 35.92 lines across and its 0.00 and 114.73 lines down. */
export const magsafeView: Region & Calibration = { page: 5, dpi: 1200, crop: { x: 7000, y: 2500, width: 3700, height: 7800 }, pxPerMm: 46.09, origin: [192.5, 320.5] };

const s1 = (what: string) => `sheet 1, ${what}`;
const s2 = (what: string) => `sheet 2, ${what}`;
const s3 = (what: string) => `sheet 3, ${what}`;
const s4 = (what: string) => `sheet 4, ${what}`;

export const body = {
  width: v(71.85, 'dimensioned', s1('front view: 71.85 PRODUCT WIDTH')),
  length: v(150.01, 'dimensioned', s1('front view: 150.01 PRODUCT LENGTH')),
  thickness: v(8.75, 'dimensioned', s1('right side view: 8.75 PRODUCT THICKNESS (front glass to back plate)')),
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
    from: s1('Detail A: CORNER PROFILE (ALL FOUR CORNERS); each label paired with the cross its leader reaches (the 17 Pro\'s, label for label)'),
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
 * On a plateau phone, the camera area outlined on the plateau's top (Detail D's double outline), and the heights: the
 * plateau 2.78 above the back plate, the camera glass 2.11 above the plateau.
 */
export const bump = {
  top: v(2.78, 'dimensioned', s1('right side view: 2.78 BACK PLATE TO CAMERA PLATEAU (its extension lines 96.5 px apart at 1200 dpi: 2.79)')),
  /** Labelled CAMERA PLATEAU TO REAR CAMERA GLASS, as its extension lines run: 2.78 + 2.11. */
  rings: v(4.89, 'derived', s1('right side view: 2.11 CAMERA PLATEAU TO REAR CAMERA GLASS, its extension lines measured 2.79 and 4.90 from the back plate\'s at 1200 dpi, so 2.78 + 2.11')),
  baseFrom: v(4.88, 'scaled', 'Detail D: the camera area\'s outer outline, its near sides (a double outline, 0.2 apart)'),
  baseSize: v(62.09, 'scaled', 'Detail D: the outer outline across'),
  baseHeight: v(38.22, 'scaled', 'Detail D: the outer outline down'),
  baseRadius: v(9.7, 'scaled', 'Detail D: the outer outline\'s corners crossed on their diagonals, 9.66 to 9.74 (the double outline gives two crossings 0.08 of radius apart; which is nearer depends on the guess)'),
  topFrom: v(5.1, 'scaled', 'Detail D: the camera area\'s inner outline, its near sides'),
  topSize: v(61.65, 'scaled', 'Detail D: the inner outline across'),
  topHeight: v(37.79, 'scaled', 'Detail D: the inner outline down'),
  topRadius: v(9.48, 'scaled', 'Detail D: the inner outline\'s corners crossed on their diagonals, 9.44 to 9.52'),
};

/** The plateau: its outline in Detail D (the outer rounded rectangle), a little in from the phone's, its bottom edge rounded. */
export const plateau = {
  height: bump.top,
  inset: v(0.76, 'scaled', 'Detail D: the plateau\'s outline from the phone\'s (side and top)'),
  bottom: v(47.96, 'scaled', 'Detail D: the plateau\'s bottom edge from the top edge'),
  radius: v(13.1, 'scaled', 'Detail D: its bottom corners crossed on their diagonals, 13.07 to 13.15'),
};

/** Which is which, from sheet 3's keepout cones: camera 1 the Ultra Wide (125°), 2 the Fusion (90°), 3 the 4x Telephoto (34°). */
export const cameras = {
  ultraWide: {
    name: 'rear camera 1',
    label: 'Ultra Wide',
    fromSide: v(14.37, 'dimensioned', s1('Detail D: 2X 14.37 (rear cameras 1 and 2)')),
    fromTop: v(14.37, 'dimensioned', s1('Detail D: -14.37 REAR CAMERA 1')),
    ring: v(16.58, 'dimensioned', s1('Detail D: 3X Ø16.58')),
    window: v(12.84, 'scaled', 'Detail D: the innermost of the camera\'s five circles (Ø16.58, 15.28, 14.23, 13.92, 12.84; the 17 Pro draws four, to 13.55)'),
    coneApexFromFront: v(10.76, 'dimensioned', s3('Section S-S: 10.76 REAR CAMERA KEEPOUT CONE TO COVER GLASS (its extension line meets the 125° cone\'s apex)')),
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
    ring: v(16.58, 'dimensioned', s1('Detail D: 3X Ø16.58')),
    window: v(12.84, 'scaled', 'Detail D: the innermost of the camera\'s five circles (Ø16.58, 15.28, 14.23, 13.92, 12.84; the 17 Pro draws four, to 13.55)'),
    coneApexFromFront: v(7.81, 'dimensioned', s3('Section S-S: 7.81 REAR CAMERA KEEPOUT CONE TO COVER GLASS (its extension line meets the 90° cone\'s apex; the 17 Pro\'s is 8.86)')),
    keepoutCone: v(90, 'dimensioned', s3('Section S-S: 90° REAR CAMERA 2 KEEPOUT ZONE')),
    equivalentFocal: v(24, 'spec', '48MP Fusion Main with variable aperture: 24 mm'),
    aperture: v(1.48, 'spec', 'Main: variable aperture ƒ/1.48, ƒ/1.8, ƒ/2.8, ƒ/4.0 (the widest recorded)'),
  },
  telephoto: {
    name: 'rear camera 3',
    label: 'Telephoto',
    fromSide: v(32.49, 'dimensioned', s1('Detail D: 32.49 REAR CAMERA 3 (the 17 Pro\'s 32.36)')),
    fromTop: v(23.99, 'dimensioned', s1('Detail D: -23.99 REAR CAMERA 3')),
    ring: v(16.58, 'dimensioned', s1('Detail D: 3X Ø16.58')),
    window: v(12.84, 'scaled', 'Detail D: the innermost of the camera\'s circles (drawn as cameras 1 and 2 here, where the 17 Pro gives camera 3 one more)'),
    coneApexFromFront: v(8.43, 'dimensioned', s3('Section V-V: 8.43 REAR CAMERA KEEPOUT CONE TO COVER GLASS (camera 3; to its base, Ø5.00)')),
    keepoutCone: v(34, 'dimensioned', s3('Section V-V: 34° REAR CAMERA 3 KEEPOUT ZONE')),
    equivalentFocal: v(100, 'spec', '48MP Fusion Telephoto: 100 mm (4x), ƒ/2.8'),
    aperture: v(2.8, 'spec', 'Telephoto: ƒ/2.8'),
  },
};

/**
 * The flash's keepout: sheet 3's Section T-T, the only section through the flash (down the phone, on the 58.03 line
 * through the flash and the rear sensor; the front face on the left, the plateau on the right). The 17 Pro's T-T with
 * one number fewer: only 14.00 is dimensioned (the 17 Pro gives 11.30 and 13.77). Its arrows say what it spans
 * (measure.ts, at 1200 dpi):
 * - 14.00 runs from the front face's extension line to one that ends at the kinks, where the inner cone (123° FLASH
 *   INNER KEEPOUT CONE V-FOV) turns into the outer (157° FLASH OUTER KEEPOUT CONE V-FOV): the transition, as the 17
 *   Pro's 13.77.
 * - the inner cone's base, Ø6.65 FLASH INNER KEEPOUT CONE BASE DIAMETER (its extension lines on the base's corners),
 *   lies on the section's back face over the flash, the plateau's top: 8.75 + 2.78 = 11.53 from the front by sheet 1,
 *   not dimensioned here (`flashKeepoutBase`). 14.00 - 11.53 = 2.47, the 17 Pro's 13.77 - 11.30: the same keepout on a
 *   plateau 0.23 taller. Ø6.65 widened over 2.47 at 61.5° each side puts the kinks 15.75 apart (drawn so).
 * - a line closes the keepout, not dimensioned (scaled, `flashKeepoutEnd`); no field takes it.
 * The printed numbers are the 17 Pro's keepout moved 0.23 with the plateau; the lines are drawn moved 0.13. At the
 * sheet's scale (46.07 px/mm, from S-S's 10.76 and 7.81 and V-V's 8.43; T-T's own 6.65 and plateau top agree), the
 * 14.00 line and the kinks lie 13.90 from the front, the closing line 15.44 (the 17 Pro's 15.30), the lines cross at
 * 9.62 and 12.30 (the 17 Pro's 9.495 and 12.17, + 0.13), and the inner lines run on to meet the plateau 7.02 apart,
 * outside the 6.65 extension lines (6.65 at 11.43, + 2 x 0.10 tan 61.5°). The angles and the kinks' spacing (15.73 for
 * 15.75) are as printed. The printed numbers are taken; the drawn ones are known ≠ in measure.ts. Scaled on its own
 * 14.00 line (45.75 px/mm), T-T would put the plateau's top at 11.61, off sheet 1's 11.53: the line is what's off.
 * The 18 Pro Max's T-T prints 11.53 and 14.00 with the same cones: on this reading its 11.53 is the plateau's top (the
 * base), not the inner cone's apex.
 * "To cover glass" (sheet 3's camera sections' wording) is from the front: the 14.00's arrow starts on the front face.
 * Neither apex is dimensioned: each is derived from the printed numbers and checked against the drawn lines' crossings.
 * Only V-FOV is given (no section across the phone): the cones are taken as round, an assumption.
 */
export const flashKeepoutBase = {
  fromFront: v(11.53, 'derived', s1('right side view: 8.75 PRODUCT THICKNESS + 2.78 BACK PLATE TO CAMERA PLATEAU; Section T-T draws the base on the plateau\'s top, not dimensioned')),
};

export const flashKeepout = {
  inner: v(123, 'dimensioned', s3('Section T-T: 123° FLASH INNER KEEPOUT CONE V-FOV (down the phone; no section across: round assumed)')),
  outer: v(157, 'dimensioned', s3('Section T-T: 157° FLASH OUTER KEEPOUT CONE V-FOV')),
  innerBaseDiameter: v(6.65, 'dimensioned', s3('Section T-T: 6.65 FLASH INNER KEEPOUT CONE BASE DIAMETER, its extension lines on the base\'s corners, on the plateau\'s top (11.53 from the front, derived)')),
  transitionFromFront: v(14.0, 'dimensioned', s3('Section T-T: 14.00 (unlabelled), from the front face\'s extension line to the one ending at the kinks, inner cone to outer')),
  apexFromFront: v(9.72, 'derived', s3('Section T-T: not dimensioned; the 123° cone through its Ø6.65 base at 11.53: 11.53 - 3.325 / tan 61.5° = 9.725')),
  outerApexFromFront: v(12.4, 'derived', s3('Section T-T: not dimensioned; the 157° cone through the kinks: 14.00 - (3.325 + 2.47 tan 61.5°) / tan 78.5° = 12.398')),
};

/** The keepout's far end in T-T (not in features.json: the family's field has no place for it). */
export const flashKeepoutEnd = v(15.44, 'scaled', s3('Section T-T: the line closing the keepout, from the front face at the sheet\'s scale (not dimensioned; the 17 Pro\'s 15.30 + 0.13, as the drawn kinks moved)'));

export const flash = {
  fromSide: v(58.03, 'dimensioned', s1('Detail D: 3X 58.03 (the flash, the rear mic and the rear sensor)')),
  fromTop: v(13.82, 'dimensioned', s1('Detail D: -13.82 FLASH')),
  diameter: v(6.9, 'dimensioned', s1('Detail D: Ø6.90 FLASH')),
  keepout: flashKeepout,
};

/**
 * The rear mic: Detail D, one circle between the flash and the rear sensor (the 17 Pro's, larger). Across, it's on the
 * 3X 58.03 line with them (the third of the three); down, the -23.99 line on the right runs in to the circle (camera
 * 3's -23.99 on the left is the same row); its [2] Ø1.15 REAR MIC leader lands on the circle from the lower right.
 * measure.ts fits the circle at 4800 dpi. On the camera area's top, so the builder lays it flush on the plateau.
 */
export const rearMic = {
  fromSide: v(58.03, 'dimensioned', s1('Detail D: 3X 58.03 (the flash, the rear mic and the rear sensor)')),
  fromTop: v(23.99, 'dimensioned', s1('Detail D: -23.99, its line run in from the right to the mic\'s circle')),
  diameter: v(1.15, 'dimensioned', s1('Detail D: [2] Ø1.15 REAR MIC (its leader on the circle; the 17 Pro\'s Ø1.05)')),
};

/**
 * MagSafe's keepouts (sheet 4, the middle back view; measure.ts re-reads them at 1200 dpi): the 17 Pro's, number for
 * number. The clear area (1 5 7: DO NOT OBSTRUCT THIS AREA WITH METAL, CONDUCTIVE MATERIAL, OR MAGNETIC MATERIAL) is a
 * whole Ø57.50 circle centred on the 35.92 line across (half the 71.85 is 35.925) and the 77.74 line down, which is not
 * the product's centre (150.01 / 2 = 75.005): 2.735 below it. Neither line is labelled PRODUCT CENTER. The magnetic
 * zone (5 7: DO NOT OBSTRUCT THIS AREA WITH MAGNETIC OR PERMEABLE MATERIAL EXCEPT MAGSAFE MAGNETS) is the 16's shape:
 * the full width from the plateau's bottom edge down (its top is not dimensioned: scaled 47.94, where Detail D puts the
 * plateau's bottom at 47.96), straight-sided to 2X 114.73, closed by an R49.39 arc through those corners, whose centre
 * (derived: 114.73 - √(49.39² - 35.925²) = 80.84 down) is 3.10 below the clear circle's.
 */
export const magsafe = {
  fromSide: v(35.92, 'dimensioned', s4('MagSafe view: 35.92, the clear circle\'s centre line (below the view; half the 71.85 is 35.925)')),
  fromTop: v(77.74, 'dimensioned', s4('MagSafe view: 77.74, the clear circle\'s centre line (half the 150.01 is 75.005: 2.735 below the product\'s centre)')),
  diameter: v(57.5, 'dimensioned', s4('MagSafe view: Ø57.50 (its leader on the clear area\'s circle; measure.ts fits the circle round 35.92, 77.74)')),
  zoneFrom: v(47.94, 'scaled', s4('MagSafe view: the zone\'s top, the full width, on the plateau\'s bottom edge (not dimensioned; Detail D scales the plateau\'s bottom 47.96)')),
  zoneSidesTo: v(114.73, 'dimensioned', s4('MagSafe view: 2X 114.73, where the zone\'s sides (the phone\'s) meet its arc')),
  zoneRadius: v(49.39, 'dimensioned', s4('MagSafe view: R49.39, the arc closing the zone below')),
};

/**
 * What sheet 4 gives beyond the family's fields (not built, not in features.json):
 * - in the MagSafe view, the 5 7 COMPASS, a small hatched circle centred 20.11 across, 145.96 down (its size not
 *   dimensioned; the 17 Pro's 145.48);
 * - the left back view: DO NOT OBSTRUCT THIS AREA WITH METAL OR OTHER CONDUCTIVE MATERIAL (FULL PRODUCT VOLUME INCLUDING
 *   SIDEWALLS) over the top down to 58.01, its lower corners R12.00 (the plateau within it, R11.81 and R11.82), and a
 *   U over the bottom (1 LOWER ANTENNA KEEP OUT): its arms from 117.77 down on the left and 117.48 on the right (the 17
 *   Pro's 117.26 both), outside 14.20 and 57.65 across, the full width from 135.81;
 * - the right back view and its side view: a VIEW CONE kept clear of metal or other conductive material above the top
 *   edge (15.92 to 55.92 across, 27° and 44°, 0.78 and 14.50). The 17 Pro's area kept clear WITHIN 1 mm OF GLASS is
 *   not on this sheet.
 * Their numbers are as printed; only the compass is re-measured.
 */
export const magsafeExtras = {
  compass: { fromSide: v(20.11, 'dimensioned', s4('MagSafe view: 20.11 (5 7 COMPASS)')), fromTop: v(145.96, 'dimensioned', s4('MagSafe view: 145.96 (5 7 COMPASS)')) },
};

/** The LiDAR scanner: drawn here (Detail D: REAR SENSOR Ø6.90), a round window. */
export const sensor = {
  name: 'LiDAR scanner',
  fromSide: v(58.03, 'dimensioned', s1('Detail D: 3X 58.03')),
  fromTop: v(34.16, 'dimensioned', s1('Detail D: -34.16 REAR SENSOR')),
  keepoutCone: v(84, 'dimensioned', s3('Detail AA: 84° REAR SENSOR KEEPOUT CONE (its base Ø5.00, 10.28 from the cover glass)')),
  window: {
    width: v(6.9, 'dimensioned', s1('Detail D: Ø6.90 REAR SENSOR')),
    length: v(6.9, 'dimensioned', s1('Detail D: Ø6.90 (round)')),
  },
};

export const connector = {
  name: 'USB-C' as const,
  width: v(12.45, 'dimensioned', s1('Detail C: 12.45 RECOMMENDED CONNECTOR KEEPOUT (2X R3.25 corners)')),
  thickness: v(6.6, 'dimensioned', s1('Detail C: 6.60 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(35.92, 'dimensioned', s1('Detail C: 35.92 (the port\'s centre, from the side-button edge)')),
  fromBack: v(4.375, 'dimensioned', s1('Detail C: 4.375; bottom view 12X 4.375 (the holes, the screws and the port on one centre line)')),
  outward: v(14.0, 'dimensioned', s1('Detail C: MATING CONNECTOR KEEPOUT AREA FLUSH TO PRODUCT SURFACE REQUIRED OUTWARD 14.0 mm')),
};

/**
 * No receiver slit is dimensioned on this drawing (Detail A gives none; sheet 3's Detail M a RECEIVER KEEPOUT strip
 * along the top edge). Detail M also places a front sensor's keepout (R1.84) left of the island, under the display:
 * neither is drawn on the part.
 */
export const front = {
  activeWidth: v(66.57, 'dimensioned', s1('front view: 66.57 DISPLAY ACTIVE AREA')),
  activeLength: v(144.73, 'dimensioned', s1('front view: 144.73 DISPLAY ACTIVE AREA')),
  activeFromEdge: v(2.64, 'dimensioned', s1('front view: 2.64 ALL AROUND, EXTERIOR OF HOUSING TO DISPLAY ACTIVE AREA')),
  activeRadius: v(10.32, 'scaled', 'front view: the active area\'s corners crossed on their diagonals'),
  islandLength: v(15.66, 'dimensioned', s1('front view: 15.66 (the Dynamic Island; the 17 Pro\'s 20.76)')),
  islandHeight: v(6.07, 'dimensioned', s1('front view: 6.07')),
  islandFromTop: v(7.99, 'dimensioned', s1('front view: 7.99 (its centre line); centred across, on the 35.92 line')),
};

export const buttons = {
  action: {
    side: 'volume' as const,
    centre: v(34.28, 'dimensioned', s1('left side view: 34.28 (the Action button)')),
    half: v(3.45, 'dimensioned', s1('left side view: 2X 3.45 (centre to each end)')),
    width: v(2.66, 'dimensioned', s1('left side view: 3X 2.66 (across the thickness)')),
    fromBack: v(4.375, 'dimensioned', s1('left side view: 4X 4.375 (the mid-plane)')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 ACTION BUTTON')),
    note: '',
  },
  volumeUp: {
    side: 'volume' as const,
    centre: v(48.43, 'dimensioned', s1('left side view: 48.43 (+ volume)')),
    half: v(5.6, 'dimensioned', s1('left side view: 4X 5.60')),
    width: v(2.66, 'dimensioned', s1('left side view: 3X 2.66')),
    fromBack: v(4.375, 'dimensioned', s1('left side view: 4X 4.375 (the mid-plane)')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (+) VOLUME BUTTON')),
    note: '',
  },
  volumeDown: {
    side: 'volume' as const,
    centre: v(62.63, 'dimensioned', s1('left side view: 62.63 (- volume)')),
    half: v(5.6, 'dimensioned', s1('left side view: 4X 5.60')),
    width: v(2.66, 'dimensioned', s1('left side view: 3X 2.66')),
    fromBack: v(4.375, 'dimensioned', s1('left side view: 4X 4.375 (the mid-plane)')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (-) VOLUME BUTTON')),
    note: '',
  },
  side: {
    side: 'side' as const,
    centre: v(55.53, 'dimensioned', s1('right side view: 55.53 (the side button)')),
    half: v(8.85, 'dimensioned', s1('right side view: 2X 8.85')),
    width: v(2.66, 'dimensioned', s1('right side view: 2.66')),
    fromBack: v(4.375, 'dimensioned', s1('right side view: 2X 4.375 (the mid-plane)')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 SIDE BUTTON')),
    note: '',
  },
};

export const simTray = {
  centre: v(111.97, 'dimensioned', s1('left side view: 111.97')),
  length: v(19.44, 'derived', s1('left side view: 2X 9.72, centre to each end (the 17 Pro\'s 2X 8.05)')),
  width: v(2.56, 'dimensioned', s1('left side view: 2.56')),
  fromBack: v(4.375, 'dimensioned', s1('left side view: 4X 4.375 (the mid-plane)')),
};

/** Camera Control: flush (front view: 0.00), in the side-button side; sheet 2 gives its chamfer and its keepouts. */
export const cameraControl = {
  centre: v(98.4, 'dimensioned', s1('right side view: 98.40 (Camera Control)')),
  half: v(8.55, 'dimensioned', s1('right side view: 2X 8.55 (centre to each end)')),
  width: v(3.03, 'dimensioned', s1('right side view: 3.03')),
  fromBack: v(4.375, 'dimensioned', s1('right side view: 2X 4.375 (the mid-plane)')),
  chamfer: v(0.63, 'dimensioned', s2('Section Z-Z: 0.63 ALL AROUND (and 0.18 deep, 16°), as the 17 Pro\'s')),
  keepoutLength: v(25.0, 'dimensioned', s2('Detail E, CAMERA CONTROL TYPICAL KEEPOUT: 25.00 MEASURED FROM SURFACE (4X R2.20)')),
  keepoutWidth: v(4.2, 'dimensioned', s2('Detail E: 2X 4.20 CAMERA CONTROL KEEPOUT MEASURED FROM SURFACE')),
};

/**
 * The bottom edge, from the volume-button edge: every hole dimensioned (to its centre, as the 17 Pro's: each pair 2.255
 * apart), two groups of five Ø1.53 (the speaker's four and bottom mic 2; bottom mic 1 and four more): the 17 Pro's
 * positions, larger holes.
 */
export const bottom = {
  holes: [15.4, 17.65, 19.91, 22.16, 24.42, 47.43, 49.69, 51.94, 54.2, 56.45].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (10X Ø1.53 PORTS)`))),
  holeDiameter: v(1.53, 'dimensioned', s1('bottom view: 10X Ø1.53 PORTS (the 17 Pro\'s Ø1.06)')),
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

export const mass = v(211, 'spec', 'Weight: 7.44 ounces (211 grams) (the US page)');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '4:3 at 12MP (the Ultra Wide and Telephoto; the Main\'s 24MP default has the same shape)' };

export const phone: Phone = {
  part: {
    title: 'iPhone 18 Pro',
    name: 'iphone-18-pro.dat',
    keywords: ['Apple', 'iPhone 18 Pro', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [
      ['2026-10-31', 'Built from Apple\'s dimensional drawing: body, plateau, cameras, buttons, Camera Control, USB-C, Dynamic Island'],
      ['2026-11-06', 'Rear mic; the flash\'s keepout (Section T-T) and MagSafe\'s keepouts in features.json'],
    ],
    drawn: '2026-09-09',
    folder: 'iphone-18-pro',
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
