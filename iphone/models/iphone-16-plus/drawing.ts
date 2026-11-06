// iPhone 16 Plus, read from Apple's dimensional drawing (iphone/drawings/iphone-16-plus.pdf, sheets 1 to 4,
// dated 2024-09-19). Every number carries where it came from and how we know it (src/provenance.ts): spec here is
// Apple's technical specifications page (support.apple.com/121030); scaled values are re-measured by measure.ts.
//
// The iPhone 16 drawn larger, sheet for sheet: the 15 Plus's body (77.76 x 160.89 x 7.81) with the 16's corner, edge
// profile, buttons, Camera Control and back (Detail D's numbers are the 16's but for the pill top's 3.96 down, 3.97 on
// the 16, and the rear mic's 20.55). What differs besides the size: Detail A's corner isn't quite symmetric (2.30 and
// 5.25 across, 2.29 and 5.24 down), the island's centre line is dimensioned 38.85 from the volume-button edge (the
// product's centre is 38.88: Detail A's receiver and Detail C's port are on 38.88), the bottom has ten holes (4 + 6),
// and Camera Control sits at 109.48. Sheet 1 is lettered as the 16's (A the corner, B the edge, C the port, D the
// back); sheet 2 is Camera Control, sheet 3 the keepout sections (G-G through both cameras, J-J and N-N through the
// flash) and Detail O (the front sensors), sheet 4 the antenna keepouts (not modelled) and MagSafe's. Sheet 1's views are drawn at different scales (at 1200 dpi: Detail D 69.15 px/mm, Detail A 46.08,
// the front and bottom views 34.6).
import type { Phone } from '../../drawing.ts';
import type { Calibration, Region } from '../../../src/raster.ts';
import { v, type Kind } from '../../../src/provenance.ts';

/** Where the scaled values were measured: regions of sheet 1 (PDF page 2) at 1200 dpi, each with its calibration. */
export const detailD: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 15800, y: 1080, width: 2700, height: 3450 }, pxPerMm: 69.15, origin: [259.8, 223.4] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 4500, y: 3700, width: 3200, height: 6000 }, pxPerMm: 34.57, origin: [249.5, 200.5] };
export const bottomView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5600, y: 11130, width: 3100, height: 700 }, pxPerMm: 34.57, origin: [274, 358.25] };
/** Detail A (the corner), calibrated on its crosses' extension lines: the 0.00 and 17.40 lines, across and down. */
export const detailA: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 9660, y: 1015, width: 1400, height: 1500 }, pxPerMm: 46.08, origin: [215.5, 234.5] };
/** The rear mic, at 4800 dpi in Detail D's frame (measure.ts carries the calibration over). */
export const micView: Region = { page: 2, dpi: 4800, crop: { x: 69524, y: 11032, width: 800, height: 800 } };
/**
 * Sheet 3 (PDF page 4) at 1200 dpi: the two sections through the flash (Detail P), drawn at 46.1 px/mm, as the 16's.
 * Section J-J runs down the phone (the 16's M-M), drawn upright, the cover glass's face its left edge (`origin` across)
 * and the flash's axis the row midway between the 5.50 extension lines (`origin` down). Section N-N runs across, drawn
 * lying down, the bump on the left, the cover glass's face its bottom edge (`origin` down) and the axis the column
 * midway between the 5.50 extension lines (`origin` across). Each scaled from that face to its transition's extension
 * line.
 */
export const sectionJJ: Region & Calibration = { page: 4, dpi: 1200, crop: { x: 12200, y: 830, width: 1000, height: 3300 }, pxPerMm: 46.09, origin: [220.5, 1661.25] };
export const sectionNN: Region & Calibration = { page: 4, dpi: 1200, crop: { x: 16668, y: 1890, width: 2400, height: 1300 }, pxPerMm: 46.1, origin: [1010, 904.5] };
/** Sheet 4 (PDF page 5) at 1200 dpi: the MagSafe view (the middle back view), calibrated on its 0.00 and 26.16 lines across and its 0.00 and 114.01 lines down. */
export const magsafeView: Region & Calibration = { page: 5, dpi: 1200, crop: { x: 8070, y: 1380, width: 4600, height: 8100 }, pxPerMm: 46.1, origin: [398, 368.5] };

const s1 = (what: string) => `sheet 1, ${what}`;
const s2 = (what: string) => `sheet 2, ${what}`;
const s3 = (what: string) => `sheet 3, ${what}`;
const s4 = (what: string) => `sheet 4, ${what}`;

/**
 * Detail A gives eight points on the corner, none on its diagonal (as the 16's), where the builder's monotone halves
 * meet: the product outline's crossing of the corner's 45° diagonal, scaled.
 */
export const cornerDiagonal = v(3.62, 'scaled', 'Detail A: the product outline (the outermost line, through the crosses) crossed on the corner\'s 45° diagonal');

export const body = {
  width: v(77.76, 'dimensioned', s1('front view: 77.76 PRODUCT WIDTH')),
  length: v(160.89, 'dimensioned', s1('front view: 160.89 PRODUCT LENGTH')),
  thickness: v(7.81, 'dimensioned', s1('right side view: 7.81 PRODUCT THICKNESS (Apple\'s spec: 7.80)')),
  glassWidth: v(75.76, 'dimensioned', s1('front view: 75.76 GLASS')),
  glassLength: v(158.89, 'dimensioned', s1('front view: 158.89 GLASS')),
  /**
   * The across labels (along the top) read 0.04, 0.59, 2.30, 5.25, 9.06, 13.21, 17.40; the down labels (down the side)
   * 0.04, 0.59, 2.29, 5.24, 9.06, 13.21, 17.40. At 1200 dpi the cross at 5.25 across sits on the 2.29 line, and the
   * cross at 5.24 down on the 2.30 line: the corner is 0.01 off symmetric there, as printed (the 16's reads 2.29 and
   * 5.24 both ways). Kept as printed; measure.ts checks those lines.
   */
  corner: {
    points: [
      [17.4, 0],
      [13.21, 0.04],
      [9.06, 0.59],
      [5.25, 2.29],
      [cornerDiagonal.mm, cornerDiagonal.mm],
      [2.3, 5.24],
      [0.59, 9.06],
      [0.04, 13.21],
      [0, 17.4],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail A: CORNER PROFILE (ALL FOUR CORNERS); each label paired with the cross its leader reaches (0.04 one stroke in from the 0.00 line); across 2.30 and 5.25, down 2.29 and 5.24, as printed; the diagonal point scaled (cornerDiagonal)'),
  },
  /**
   * Flat to ±2.12 (4X 0.00 covers ±1.62 and ±2.12), then rounding to 0.81 in at ±3.77. The front view's 2.41 ALL AROUND,
   * EXTERIOR OF HOUSING TO START OF FLAT AREA ON TOP SIDE says the front glass rounds on past its edge (1.00 in) to its
   * flat 2.41 in, at the full half-thickness (7.81 / 2): the face starts there, as on the 16. The back, which the note
   * doesn't cover, steps to its glass at 1.00 in, as the 16's does.
   */
  edge: {
    points: [
      [0, 1.62],
      [0, 2.12],
      [0.02, 2.61],
      [0.13, 3.09],
      [0.4, 3.5],
      [0.81, 3.77],
      [2.41, 3.905],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail B: PROFILE (ALL SIDES); insets 4X 0.00, 2X 0.02, 2X 0.13, 2X 0.40, 2X 0.81 paired in order with ±1.62, ±2.12, ±2.61, ±3.09, ±3.50, ±3.77; then the front view\'s 2.41 (start of the flat on the top side), the face, at 7.81 / 2'),
  },
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
    from: s1('Detail B: as the front to ±3.77 (symmetric); the 2.41 flat is the top side\'s, so the back steps to its glass at 1.00 in'),
  },
};

/**
 * The camera pill, as the 16's: a stadium raised 1.85 off the back glass, its outline 1.09 in from the side and 1.25
 * down from the top (to 26.16 across and 43.72 down), its flat top 3.79 and 3.96 in (to 23.45 and 41.00; the 16's is
 * 3.97). Its ends are round (the outline's top lies within 0.09 of a semicircle on its 25.07 width, 15 to 25 across;
 * measure.ts checks it), so each corner radius is half the width. The top's ends read 9.75 to 10.00 on their diagonals
 * (9.88 on average, within 0.10 of the 9.83 built).
 */
export const bump = {
  top: v(1.85, 'dimensioned', s1('right side view: 1.85 BACK GLASS TO CAMERA PLATEAU')),
  rings: v(3.48, 'dimensioned', s1('right side view: 3.48 BACK GLASS TO CAMERA GLASS')),
  baseFrom: v(1.09, 'dimensioned', s1('Detail D: 1.09 (across)')),
  baseFromTop: v(1.25, 'dimensioned', s1('Detail D: 1.25 (down)')),
  baseSize: v(25.07, 'derived', s1('Detail D: 26.16 - 1.09, across')),
  baseHeight: v(42.47, 'derived', s1('Detail D: 43.72 - 1.25, down')),
  baseRadius: v(12.535, 'derived', s1('Detail D: half the outline\'s width (25.07 / 2): its ends are semicircles')),
  topFrom: v(3.79, 'dimensioned', s1('Detail D: 3.79 (across)')),
  topFromTop: v(3.96, 'dimensioned', s1('Detail D: 3.96 (down)')),
  topSize: v(19.66, 'derived', s1('Detail D: 23.45 - 3.79, across')),
  topHeight: v(37.04, 'derived', s1('Detail D: 41.00 - 3.96, down')),
  topRadius: v(9.83, 'derived', s1('Detail D: half the top\'s width (19.66 / 2): a stadium, as the outline')),
};

/** Which is which, from sheet 3's keepout cones (section G-G, through both): camera 1 the Ultra Wide (123°), 2 the Fusion (84°). */
export const cameras = {
  ultraWide: {
    name: 'rear camera 1',
    label: 'Ultra Wide',
    fromSide: v(13.62, 'dimensioned', s1('Detail D: 2X 13.62 (both cameras, on one line)')),
    fromTop: v(13.62, 'dimensioned', s1('Detail D: 13.62 REAR CAMERA 1')),
    ring: v(16.0, 'dimensioned', s1('Detail D: 2X Ø16.00')),
    window: v(13.55, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(8.33, 'dimensioned', s3('Section G-G: 8.33 REAR CAMERA 1 KEEPOUT CONE TO COVER GLASS (the upper cone)')),
    keepoutCone: v(123, 'dimensioned', s3('Section G-G: 123° REAR CAMERA 1 KEEPOUT CONE')),
    identity: v(1, 'inferred', 'camera 1 (the upper) is the Ultra Wide: its 123° cone encloses its 120° (spec); camera 2\'s 84° encloses the 26 mm Fusion\'s 79.5° diagonal'),
    fov: v(120, 'spec', '12MP Ultra Wide: 13 mm, ƒ/2.2 aperture and 120° field of view'),
    aperture: v(2.2, 'spec', 'Ultra Wide: ƒ/2.2'),
  },
  main: {
    name: 'rear camera 2',
    label: 'Fusion',
    fromSide: v(13.62, 'dimensioned', s1('Detail D: 2X 13.62 (both cameras, on one line)')),
    fromTop: v(31.34, 'dimensioned', s1('Detail D: 31.34 REAR CAMERA 2')),
    ring: v(16.0, 'dimensioned', s1('Detail D: 2X Ø16.00')),
    window: v(13.55, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(6.9, 'dimensioned', s3('Section G-G: 6.90 REAR CAMERA 2 KEEPOUT CONE TO COVER GLASS (the lower cone)')),
    keepoutCone: v(84, 'dimensioned', s3('Section G-G: 84° REAR CAMERA 2 KEEPOUT CONE')),
    equivalentFocal: v(26, 'spec', '48MP Fusion Main: 26 mm, ƒ/1.6 aperture'),
    aperture: v(1.6, 'spec', 'Main: ƒ/1.6'),
  },
};

/**
 * The flash's keepout, from sheet 3's two sections through it (Detail P): J-J down the phone, N-N across, number for
 * number the 16's M-M and N-N. Both start from an inner cone's base, Ø5.50 (5.50 FLASH INNER KEEPOUT CONE BASE
 * DIAMETER, its extension lines on the base's corners) at 7.71 FLASH KEEPOUT CONE TO COVER GLASS: the strobe's face,
 * 0.10 under the back glass (7.81; inferred, as on the 16: the drawing doesn't name it). Its extension line runs on
 * down each section beside the back glass, 0.10 inside it; between the base's corners both sections draw it alone (no
 * glass over the strobe: the 16's M-M draws the back glass there too, its N-N doesn't). Neither 7.71 nor any other
 * number is an apex. "To cover glass" is from the front: the arrows start on each section's front face, the bump and
 * the back glass on the other side (measure.ts reads the back glass 7.81 and N-N's bump top 9.66 from it, at 4800 dpi).
 *
 * The inner cone isn't circular: 112° FLASH INNER KEEPOUT CONE V-FOV down the phone (J-J), 96° H-FOV across (N-N), and
 * it turns into the outer cone (157°, V-FOV and H-FOV both) at 9.76 down the phone and 9.56 across (each FLASH KEEPOUT
 * CONE TRANSITION TO COVER GLASS; the (2.05) and (1.85) are 9.76 - 7.71 and 9.56 - 7.71). The outer cone is one
 * circular cone: worked from each section's printed numbers its apex lies 8.58 from the front, 9.76 - (2.75 + 2.05 tan
 * 56°) / tan 78.5° = 8.582 and 9.56 - (2.75 + 1.85 tan 48°) / tan 78.5° = 8.582. Both sections close the keepout 4.00
 * out from the base, (4.00): 11.71 from the front.
 *
 * The family's field takes one inner cone, as circular. It's given J-J's (down the phone): its 112° is the wider, so a
 * circular 112° cone holds N-N's 96° one (an approximation on the safe side: across, it keeps out up to 1.5 mm more at
 * the transition). N-N's own numbers are in `flashKeepoutAcross`, and 7.71 (no field for the base's distance) in
 * `flashKeepoutBase`; neither reaches features.json.
 */
export const flashKeepout = {
  inner: v(112, 'dimensioned', s3('Section J-J: 112° FLASH INNER KEEPOUT CONE V-FOV (down the phone; across, Section N-N gives 96°: flashKeepoutAcross)')),
  outer: v(157, 'dimensioned', s3('Sections J-J and N-N: 157° FLASH OUTER KEEPOUT CONE V-FOV and H-FOV')),
  innerBaseDiameter: v(5.5, 'dimensioned', s3('Sections J-J and N-N: 5.50 FLASH INNER KEEPOUT CONE BASE DIAMETER, its extension lines on the base\'s corners, at 7.71 from the front')),
  transitionFromFront: v(9.76, 'dimensioned', s3('Section J-J: 9.76 FLASH KEEPOUT CONE TRANSITION TO COVER GLASS (its arrows on the front face and the kinks\' extension line; across, N-N gives 9.56)')),
  apexFromFront: v(5.86, 'derived', s3('Section J-J: not dimensioned; the 112° cone through its Ø5.50 base at 7.71: 7.71 - 2.75 / tan 56°')),
  outerApexFromFront: v(8.58, 'derived', s3('Sections J-J and N-N: not dimensioned; the 157° cone through either section\'s kinks: 9.76 - (2.75 + 2.05 tan 56°) / tan 78.5° = 8.582, and 9.56 - (2.75 + 1.85 tan 48°) / tan 78.5° = 8.582')),
};

/** What the sections give beyond the family's field (not in features.json): the distance to the inner cone's base. */
export const flashKeepoutBase = {
  fromFront: v(7.71, 'dimensioned', s3('Sections J-J and N-N: 7.71 FLASH KEEPOUT CONE TO COVER GLASS (its extension line runs on as the strobe\'s face between the inner cone\'s corners, 0.10 under the back glass: the cone\'s base)')),
};

/** Section N-N, across the phone (not in features.json: the family's keepout is one circular cone, J-J's). */
export const flashKeepoutAcross = {
  inner: v(96, 'dimensioned', s3('Section N-N: 96° FLASH INNER KEEPOUT CONE H-FOV')),
  transitionFromFront: v(9.56, 'dimensioned', s3('Section N-N: 9.56 FLASH KEEPOUT CONE TRANSITION TO COVER GLASS (its arrows on the front face and the kinks\' extension line, 0.10 under the bump\'s top at 9.66)')),
  apexFromFront: v(5.23, 'derived', s3('Section N-N: not dimensioned; the 96° cone through its Ø5.50 base at 7.71: 7.71 - 2.75 / tan 48°')),
};

/** The keepout's far end in both sections (not in features.json: the family's field has no place for it). */
export const flashKeepoutEnd = v(11.71, 'derived', s3('Sections J-J and N-N: (4.00), the line closing the keepout, from the base\'s 7.71 line: 7.71 + 4.00'));

/** The flash lies beside the pill (its edge 26.87 across, the pill's 26.16), on the back glass, where the part draws it. */
export const flash = {
  fromSide: v(30.01, 'dimensioned', s1('Detail D: 30.01 FLASH')),
  fromTop: v(22.48, 'dimensioned', s1('Detail D: 22.48 (the flash\'s centre line, right)')),
  diameter: v(6.28, 'dimensioned', s1('Detail D: Ø6.28 FLASH')),
  onGlass: true,
  keepout: flashKeepout,
};

/**
 * The rear mic, on the pill's top (its straight part: 6.93 from the pill's middle line, inside the top's 9.83 half
 * width). Across: the 20.55 ordinate below Detail D (the 16's 20.54), whose extension line rises to the mic's centre
 * (between the top's 3.79 and 23.45); down: the left-hand 22.48, whose line runs in to the mic's centre (the right-hand
 * 22.48 is the flash's, on the same line). Two concentric circles are drawn there; the [2] Ø1.00 REAR MIC leader's arrow
 * passes the outer and lands on the inner one, which is Ø1.00 drawn: the mic. The outer circle, a ring round it
 * (`rearMicRing`), isn't built.
 */
export const rearMic = {
  fromSide: v(20.55, 'dimensioned', s1('Detail D: 20.55 (the ordinate below the view; its extension line rises to the mic\'s centre)')),
  fromTop: v(22.48, 'dimensioned', s1('Detail D: 22.48, the left-hand one (its line runs in to the mic\'s centre; the right-hand 22.48 is the flash\'s)')),
  diameter: v(1.0, 'dimensioned', s1('Detail D: [2] Ø1.00 REAR MIC (its arrow lands on the inner of two concentric circles, drawn Ø1.00)')),
};

/** The outer of the mic's two circles, not dimensioned (not built, not in features.json). */
export const rearMicRing = v(1.4, 'scaled', 'Detail D: the outer of the mic\'s two concentric circles, at 4800 dpi');

/**
 * MagSafe's keepouts (sheet 4, the middle view; measure.ts re-reads them at 1200 dpi): the clear circle at the product
 * centre (38.88, 80.44: 77.76 / 2 and 160.89 / 2); the magnetic zone round it, the full width from 43.72 down (the
 * pill's outline's bottom, Detail D's 43.72), straight-sided to 114.01, closed by an R49.39 arc through those corners
 * (its centre 114.01 - √(49.39² - 38.88²) = 83.55 down, 3.11 below the product centre, not on it). The 16's shape with
 * the same R49.39 and Ø57.50 on a wider phone: the arc's centre sits 3.11 below the centre here, 3.10 on the 16.
 */
export const magsafe = {
  fromSide: v(38.88, 'dimensioned', s4('38.88 PRODUCT CENTER (77.76 / 2)')),
  fromTop: v(80.44, 'dimensioned', s4('80.44 PRODUCT CENTER (160.89 / 2 = 80.445)')),
  diameter: v(57.5, 'dimensioned', s4('Ø57.50: DO NOT OBSTRUCT THIS AREA WITH METAL, CONDUCTIVE MATERIAL, OR MAGNETIC MATERIAL')),
  zoneFrom: v(43.72, 'dimensioned', s4('43.72: the zone\'s top edge, the full width')),
  zoneSidesTo: v(114.01, 'dimensioned', s4('114.01: where the zone\'s sides (the phone\'s) meet its arc')),
  zoneRadius: v(49.39, 'dimensioned', s4('R49.39: the arc closing the zone below (DO NOT OBSTRUCT THIS AREA WITH MAGNETIC OR PERMEABLE MATERIAL EXCEPT MAGSAFE MAGNETS)')),
};

/** Sheet 4's compass (not in features.json: the family has no field for it), a check on the MagSafe view's calibration. */
export const compass = {
  fromSide: v(57.92, 'dimensioned', s4('57.92 (5 7 COMPASS)')),
  fromTop: v(155.23, 'dimensioned', s4('155.23 (5 7 COMPASS)')),
};

export const connector = {
  name: 'USB-C' as const,
  width: v(12.45, 'dimensioned', s1('Detail C: 12.45 RECOMMENDED CONNECTOR KEEPOUT (2X R3.25 corners)')),
  thickness: v(6.6, 'dimensioned', s1('Detail C: 6.60 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(38.88, 'dimensioned', s1('Detail C: 38.88 (the port\'s centre, from the side-button edge)')),
  fromBack: v(3.91, 'dimensioned', s1('Detail C: 3.91, the port\'s centre line to the back glass')),
  outward: v(14.0, 'dimensioned', s1('Detail C: MATING CONNECTOR KEEPOUT AREA FLUSH TO PRODUCT SURFACE REQUIRED OUTWARD 14.0 mm')),
};

/**
 * The receiver (14.02 x 0.45 centred 1.17 from the top, on 38.88, Detail A) lies on the glass's rounding, outside the
 * flat face the part models (2.41 in), so it isn't drawn (as the 16's).
 *
 * The island: the front view dimensions its centre line 38.85 from the volume-button edge (and sheet 3's Detail O its
 * keepout base's, 20.75 x 6.07 at 8.18, on 38.85 too), 0.03 short of the product's centre (77.76 / 2 = 38.88). The
 * drawing draws it there: its ends' middle reads 38.858 (measure.ts, islandAcross), 0.008 from 38.85 and 0.022 from
 * 38.88 (0.03 is about a pixel at 34.57 px/mm: it favours 38.85 at the resolution's limit). The builder centres the island across (the Phone shape has no position across for it), so the part's island
 * is 0.03 toward the side-button edge of the drawing's: an approximation within the drawing's ±0.10, named here.
 */
export const front = {
  activeWidth: v(71.21, 'dimensioned', s1('front view: 71.21 DISPLAY ACTIVE AREA')),
  activeLength: v(154.34, 'dimensioned', s1('front view: 154.34 DISPLAY ACTIVE AREA')),
  activeFromEdge: v(3.27, 'dimensioned', s1('front view: 3.27 ALL AROUND, EXTERIOR OF HOUSING TO DISPLAY ACTIVE AREA ((77.76 - 71.21) / 2 = 3.275)')),
  activeRadius: v(9.14, 'scaled', 'front view: the active area\'s corners crossed on their diagonals'),
  islandLength: v(20.76, 'dimensioned', s1('front view: 20.76 (the Dynamic Island, a pill)')),
  islandHeight: v(6.07, 'dimensioned', s1('front view: 6.07')),
  islandFromTop: v(8.19, 'dimensioned', s1('front view: 8.19 (its centre line; sheet 3\'s Detail O gives its keepout base\'s as 8.18); centred across as built (dimensioned 38.85, see above)')),
};

/** The island's centre line across, as dimensioned: the builder centres it (38.88); measure.ts reads the drawn one. */
export const islandCentre = v(38.85, 'dimensioned', s1('front view: 38.85 (the island\'s centre line, from the 0.00 volume-button edge); sheet 3, Detail O: 38.85'));

export const buttons = {
  action: {
    side: 'volume' as const,
    centre: v(34.08, 'dimensioned', s1('left side view: 34.08 (the Action button)')),
    half: v(3.45, 'dimensioned', s1('left side view: 2X 3.45 (centre to each end)')),
    width: v(2.66, 'dimensioned', s1('left side view: 3X 2.66 (across the thickness)')),
    fromBack: v(3.91, 'dimensioned', s1('left side view: 3X 3.91, from the back glass\'s line (the bump\'s side)')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 ACTION BUTTON')),
    note: '',
  },
  volumeUp: {
    side: 'volume' as const,
    centre: v(48.23, 'dimensioned', s1('left side view: 48.23 (+) VOLUME BUTTON')),
    half: v(5.6, 'dimensioned', s1('left side view: 4X 5.60')),
    width: v(2.66, 'dimensioned', s1('left side view: 3X 2.66')),
    fromBack: v(3.91, 'dimensioned', s1('left side view: 3X 3.91, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (+) VOLUME BUTTON')),
    note: '',
  },
  volumeDown: {
    side: 'volume' as const,
    centre: v(62.43, 'dimensioned', s1('left side view: 62.43 (-) VOLUME BUTTON')),
    half: v(5.6, 'dimensioned', s1('left side view: 4X 5.60')),
    width: v(2.66, 'dimensioned', s1('left side view: 3X 2.66')),
    fromBack: v(3.91, 'dimensioned', s1('left side view: 3X 3.91, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (-) VOLUME BUTTON')),
    note: '',
  },
  side: {
    side: 'side' as const,
    centre: v(55.33, 'dimensioned', s1('right side view: 55.33')),
    half: v(8.85, 'dimensioned', s1('right side view: 2X 8.85')),
    width: v(2.66, 'dimensioned', s1('right side view: 2.66')),
    fromBack: v(3.9, 'derived', s1('right side view: 2x 3.91 from the front glass\'s line (its arrows land on the screen side), so 7.81 - 3.91')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 SIDE BUTTON')),
    note: '',
  },
};

export const simTray = {
  centre: v(104.1, 'dimensioned', s1('left side view: 104.10')),
  length: v(19.64, 'derived', s1('left side view: 2X 9.82, centre to each end')),
  width: v(2.56, 'dimensioned', s1('left side view: 2.56')),
  fromBack: v(3.91, 'dimensioned', s1('left side view: 3.91, from the back glass\'s line')),
};

/** Camera Control: flush (front view: 0.00), in the side-button side; sheet 2 gives its chamfer and its keepouts. */
export const cameraControl = {
  centre: v(109.48, 'dimensioned', s1('right side view: 109.48')),
  half: v(8.55, 'dimensioned', s1('right side view: 2X 8.55 (centre to each end)')),
  width: v(3.03, 'dimensioned', s1('right side view: 3.03')),
  fromBack: v(3.9, 'derived', s1('right side view: 2x 3.91 from the front glass\'s line, so 7.81 - 3.91')),
  chamfer: v(0.63, 'dimensioned', s2('Section G-G, CAMERA CONTROL CHAMFER: 0.63 ALL AROUND along the surface (0.18 deep, 16°: tan 16° = 0.18 / 0.63)')),
  keepoutLength: v(25.0, 'dimensioned', s2('Detail E, CAMERA CONTROL TYPICAL KEEPOUT: 25.00 MEASURED AT SURFACE')),
  keepoutWidth: v(8.4, 'derived', s2('Detail E: 2X 4.20 MEASURED AT SURFACE, each from the side\'s centre line to an edge of the keepout (its 4X R(2.20) box spans both), so 8.40 across')),
};

/**
 * The bottom edge, from the volume-button edge. Only each group's end holes are dimensioned, to their centres as on the
 * 16: 20.16 and 26.92 are 3 x 2.255 apart (6.765 for 6.76), 50.83 and 62.11 5 x 2.255 (11.275 for 11.28). The holes
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
  holes: [...group(20.16, 26.92, 4, 'left'), ...group(50.83, 62.11, 6, 'right')],
  holeDiameter: v(1.35, 'dimensioned', s1('bottom view: 10X Ø1.35 PORTS')),
  holesFromBack: v(3.91, 'dimensioned', s1('bottom view: 3.91, the holes\' centre line to the back glass\'s line')),
  holeDepth: v(0.6, 'assumed', 'a mic or speaker hole\'s depth for a render: the drawing gives none'),
  screws: [31.95, 45.8].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (2X Ø1.50 SCREW)`))),
  screwDiameter: v(1.5, 'dimensioned', s1('bottom view: 2X Ø1.50 SCREW')),
  screwsFromBack: v(3.91, 'inferred', 'Detail C draws the screws on the holes\' centre line'),
  portFrom: v(34.38, 'dimensioned', s1('bottom view: 34.38 (the USB-C port\'s near end)')),
  portTo: v(43.38, 'dimensioned', s1('bottom view: 43.38 (its far end; centre 38.88, as Detail C\'s)')),
  portHeight: v(3.14, 'dimensioned', s1('Detail C: 3.14 (the port\'s opening across the thickness); its ends round (inferred)')),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none'),
};

export const mass = v(199, 'spec', 'Weight: 199 grams (7.03 ounces)');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '4:3 at 12MP (the Ultra Wide; the Main\'s 24MP default has the same shape)' };

export const phone: Phone = {
  part: {
    title: 'iPhone 16 Plus',
    name: 'iphone-16-plus.dat',
    keywords: ['Apple', 'iPhone 16 Plus', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [
      ['2026-10-31', 'Built from Apple\'s dimensional drawing: body, cameras, buttons, Camera Control, USB-C, Dynamic Island'],
      ['2026-11-06', 'Rear mic; the flash\'s keepout (sections J-J and N-N) and MagSafe in features.json'],
    ],
    drawn: '2024-09-19',
    folder: 'iphone-16-plus',
  },
  details: { corner: 'Detail A', edge: 'Detail B', back: 'Detail D', port: 'Detail C' },
  body,
  bump,
  cameras,
  cameraIdentity: cameras.ultraWide.identity,
  flash,
  rearMic,
  magsafe,
  connector,
  front,
  buttons,
  simTray,
  cameraControl,
  bottom,
  mass,
  image,
};
