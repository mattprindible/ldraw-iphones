// iPhone 17, read from Apple's dimensional drawing (iphone/drawings/iphone-17.pdf, sheets 1 to 4, dated
// 2025-09-09). Every number carries where it came from and how we know it (src/provenance.ts): spec here is Apple's
// technical specifications page (support.apple.com/125089); scaled values are re-measured by measure.ts.
//
// The iPhone 16's plan on a new body (71.45 x 149.61 x 7.95, thinner borders: the active area 2.44 from the edge all
// round, the 16's 3.27) and its back: two cameras one above the other in a raised pill, the flash and the rear mic
// beside them, the pill 0.09 narrower and lower than the 16's, the flash 0.40 further across. Sheet 1 is lettered as the
// 16's (A the corner, B the edge, C the port, D the back); sheet 2 is Camera Control, sheet 3 the keepout sections (G-G
// through both cameras), sheet 4 the antenna and MagSafe keepouts. Sheet 1's views are drawn at different scales (at
// 1200 dpi: Detail D 69.15 px/mm, Detail A 46.08, the front and bottom views 34.57).
import type { Phone } from '../../drawing.ts';
import type { Calibration, Region } from '../../../src/raster.ts';
import { v, type Kind } from '../../../src/provenance.ts';

/** Where the scaled values were measured: regions of sheet 1 (PDF page 2) at 1200 dpi, each with its calibration. */
export const detailD: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 15200, y: 1150, width: 2700, height: 3450 }, pxPerMm: 69.15, origin: [208.8, 209.8] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 4500, y: 3900, width: 2700, height: 5500 }, pxPerMm: 34.57, origin: [132.5, 195.5] };
export const bottomView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5000, y: 11000, width: 2900, height: 700 }, pxPerMm: 34.57, origin: [245.5, 356.75] };
/** Detail A (the corner), calibrated on its crosses' extension lines: the 0.00 and 19.23 lines, across and down. */
export const detailA: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 9800, y: 1300, width: 1400, height: 1500 }, pxPerMm: 46.08, origin: [219, 191.5] };
/** The rear mic, at 4800 dpi in Detail D's frame (measure.ts carries the calibration over). */
export const micView: Region = { page: 2, dpi: 4800, crop: { x: 66917, y: 11257, width: 800, height: 800 } };
/**
 * Sheet 3 (PDF page 4) at 1200 dpi: the two sections through the flash (Detail P), drawn at 46.1 px/mm. Section J-J runs
 * down the phone, drawn upright, the cover glass's face its left edge (`origin` across) and the flash's axis the row
 * midway between the 5.50 extension lines (`origin` down). Section N-N runs across, drawn lying down, the bump on the
 * left, the cover glass's face its bottom edge (`origin` down) and the axis the column midway between the 5.13
 * extension lines (`origin` across).
 */
export const sectionJJ: Region & Calibration = { page: 4, dpi: 1200, crop: { x: 12900, y: 900, width: 1000, height: 3400 }, pxPerMm: 46.1, origin: [210.5, 1608.5] };
export const sectionNN: Region & Calibration = { page: 4, dpi: 1200, crop: { x: 16600, y: 2200, width: 2400, height: 1300 }, pxPerMm: 46.1, origin: [1029.25, 907.5] };
/** Sheet 4 (PDF page 5) at 1200 dpi: the MagSafe view (the middle back view), calibrated on its 0.00 and 26.06 lines across and its 0.00 and 112.01 lines down. */
export const magsafeView: Region & Calibration = { page: 5, dpi: 1200, crop: { x: 8000, y: 1500, width: 4600, height: 7400 }, pxPerMm: 46.1, origin: [399.5, 318.5] };

const s1 = (what: string) => `sheet 1, ${what}`;
const s2 = (what: string) => `sheet 2, ${what}`;
const s3 = (what: string) => `sheet 3, ${what}`;
const s4 = (what: string) => `sheet 4, ${what}`;

/**
 * Detail A gives eight points on the corner, none on its diagonal (as the 16's), where the builder's monotone halves
 * meet: the product outline's crossing of the corner's 45° diagonal, scaled.
 */
export const cornerDiagonal = v(3.74, 'scaled', 'Detail A: the product outline (the outermost line, through the crosses) crossed on the corner\'s 45° diagonal');

export const body = {
  width: v(71.45, 'dimensioned', s1('front view: 71.45 PRODUCT WIDTH (Apple\'s spec: 71.5)')),
  length: v(149.61, 'dimensioned', s1('front view: 149.61 PRODUCT LENGTH (Apple\'s spec: 149.6)')),
  thickness: v(7.95, 'dimensioned', s1('right side view: 7.95 PRODUCT THICKNESS (Apple\'s spec: 7.95)')),
  glassWidth: v(69.45, 'dimensioned', s1('front view: 69.45 GLASS')),
  glassLength: v(147.61, 'dimensioned', s1('front view: 147.61 GLASS')),
  corner: {
    points: [
      [19.23, 0],
      [14.53, 0.02],
      [9.87, 0.48],
      [5.56, 2.26],
      [cornerDiagonal.mm, cornerDiagonal.mm],
      [2.26, 5.56],
      [0.48, 9.87],
      [0.02, 14.53],
      [0, 19.23],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail A: CORNER PROFILE (ALL FOUR CORNERS); each label paired with the cross its leader reaches (0.02 one stroke in from the 0.00 line), symmetric about the diagonal; the diagonal point scaled (cornerDiagonal)'),
  },
  /**
   * Flat to ±2.27 (4X 0.00 covers ±1.69 and ±2.27), then rounding to 1.27 in at ±3.93, 0.045 short of the face. The front
   * view's 2.41 ALL AROUND, EXTERIOR OF HOUSING TO START OF FLAT AREA ON TOP SIDE says the front glass rounds on past
   * its edge (1.00 in) to its flat 2.41 in, at the full half-thickness (7.95 / 2 = 3.975), as on the 16. The builder
   * starts the face at the first point within 0.1 of it (1.27 in, at 3.93), so the 2.41 point is recorded, not built;
   * the display (2.44 in) lies on the face either way.
   */
  edge: {
    points: [
      [0, 1.69],
      [0, 2.27],
      [0.05, 2.85],
      [0.27, 3.39],
      [0.7, 3.78],
      [1.27, 3.93],
      [2.41, 3.975],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail B: PROFILE (ALL SIDES), the upper (front) side: insets 4X 0.00, 2X 0.05, 2X 0.27, 2X 0.70, 2X 1.27 paired in order with 1.69, 2.27, 2.85, 3.39, 3.78, 3.93; then the front view\'s 2.41 (start of the flat on the top side), the face, at 7.95 / 2'),
  },
  /**
   * Detail B's lower (back) side is dimensioned on its own, 0.01 further out than the front from 2.28 on, and reaches the
   * same 1.27 in at -3.93: past the back glass's edge (1.00 in), so the back has no step to its glass (the 16's did, its
   * profile ending 0.81 in). The drawing gives no flat for the back; the builder starts its face at 1.27 in, lifting the
   * last point 0.045 to the face (an approximation of the last rise, which the drawing doesn't dimension).
   */
  edgeBack: {
    points: [
      [0, 1.69],
      [0, 2.28],
      [0.05, 2.86],
      [0.27, 3.4],
      [0.7, 3.79],
      [1.27, 3.93],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail B: the lower (back) side: insets 4X 0.00, 2X 0.05, 2X 0.27, 2X 0.70, 2X 1.27 paired in order with -1.69, -2.28, -2.86, -3.40, -3.79, -3.93'),
  },
};

/**
 * The camera pill: a stadium raised 1.78 off the back glass, its outline 1.18 in from the side and 1.34 down from the top
 * (to 26.06 across and 43.62 down), its flat top 3.79 and 3.97 in (to 23.45 and 40.99). Its ends are round: measure.ts
 * checks the outline's top against a semicircle on its 24.88 width, so each corner radius is half the width.
 */
export const bump = {
  top: v(1.78, 'dimensioned', s1('right side view: 1.78 BACK GLASS TO CAMERA PLATEAU')),
  rings: v(3.45, 'dimensioned', s1('right side view: 3.45 BACK GLASS TO CAMERA GLASS')),
  baseFrom: v(1.18, 'dimensioned', s1('Detail D: 1.18 (across)')),
  baseFromTop: v(1.34, 'dimensioned', s1('Detail D: 1.34 (down)')),
  baseSize: v(24.88, 'derived', s1('Detail D: 26.06 - 1.18, across')),
  baseHeight: v(42.28, 'derived', s1('Detail D: 43.62 - 1.34, down')),
  baseRadius: v(12.44, 'derived', s1('Detail D: half the outline\'s width (24.88 / 2): its ends are semicircles (measure.ts: the 1.34 top against one on 1.18 to 26.06)')),
  topFrom: v(3.79, 'dimensioned', s1('Detail D: 3.79 (across)')),
  topFromTop: v(3.97, 'dimensioned', s1('Detail D: 3.97 (down)')),
  topSize: v(19.66, 'derived', s1('Detail D: 23.45 - 3.79, across')),
  topHeight: v(37.02, 'derived', s1('Detail D: 40.99 - 3.97, down')),
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
    coneApexFromFront: v(8.44, 'dimensioned', s3('Section G-G: 8.44 REAR CAMERA 1 KEEPOUT CONE TO COVER GLASS (the upper cone)')),
    keepoutCone: v(123, 'dimensioned', s3('Section G-G: 123° REAR CAMERA 1 KEEPOUT CONE')),
    identity: v(1, 'inferred', 'camera 1 (the upper) is the Ultra Wide: its 123° cone encloses its 120° (spec); camera 2\'s 84° encloses the 26 mm Fusion\'s 79.5° diagonal'),
    fov: v(120, 'spec', '48MP Fusion Ultra Wide: 13 mm, ƒ/2.2 aperture and 120° field of view'),
    aperture: v(2.2, 'spec', 'Ultra Wide: ƒ/2.2'),
  },
  main: {
    name: 'rear camera 2',
    label: 'Fusion',
    fromSide: v(13.62, 'dimensioned', s1('Detail D: 2X 13.62 (both cameras, on one line)')),
    fromTop: v(31.34, 'dimensioned', s1('Detail D: 31.34 REAR CAMERA 2')),
    ring: v(16.0, 'dimensioned', s1('Detail D: 2X Ø16.00')),
    window: v(13.55, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(7.01, 'dimensioned', s3('Section G-G: 7.01 REAR CAMERA 2 KEEPOUT CONE TO COVER GLASS (the lower cone)')),
    keepoutCone: v(84, 'dimensioned', s3('Section G-G: 84° REAR CAMERA 2 KEEPOUT CONE')),
    equivalentFocal: v(26, 'spec', '48MP Fusion Main: 26 mm, ƒ/1.6 aperture'),
    aperture: v(1.6, 'spec', 'Main: ƒ/1.6'),
  },
};

/**
 * The flash's keepout, from sheet 3's two sections through it (Detail P): J-J down the phone, N-N across, as the 16's
 * M-M and N-N. Both start from the inner cone's base at 7.85 FLASH KEEPOUT CONE TO COVER GLASS: the strobe's face, 0.10
 * under the back glass (7.95), as on the 16 (inferred: the drawing doesn't name it). "To cover glass" is from the front:
 * the arrows start on each section's front face (measure.ts reads the back glass 7.95 from it, at 4800 dpi). Neither
 * 7.85 nor any other number is an apex.
 *
 * The inner cone isn't circular, and here not even its base: down the phone (J-J) 112° FLASH INNER KEEPOUT CONE V-FOV
 * from a 5.50 base, across (N-N) 97° H-FOV from a 5.13 base (each FLASH INNER KEEPOUT CONE BASE DIAMETER). It turns into
 * the outer cone (157°, V-FOV and H-FOV both) at 9.89 down the phone and 9.72 across (each FLASH KEEPOUT CONE
 * TRANSITION TO COVER GLASS). Both sections close the keepout (4.00) out from the base: 11.85 from the front.
 *
 * J-J's printed numbers disagree by 0.02: 9.89 - 7.85 = 2.04, but its reference (2.06) spans the same two lines. They
 * aren't quite the same lines: the transition's line is drawn in two pieces, the upper kink's (which the 9.89 leader
 * reaches) and the lower's (which the (2.06) arrow reaches), 0.01 apart (measure.ts, 4800 dpi: 2.046 and 2.056 from the
 * 7.85 line). Each number is its own line's, rounded; the 9.89 is the one dimensioned to the front, and is used.
 *
 * N-N's inner lines aren't drawn at its numbers (measure.ts, 4800 dpi): from 8.6 out they run straight at 98.1°, not
 * 97°, and below 8.5 they bend in (52° each side) to the base's corners, on the 5.13 extension lines. So the straight
 * part, extended, is 5.27 wide at 7.85, and its kinks are drawn 9.52 apart where the printed numbers make 9.36
 * (5.13 + 2 x 1.87 tan 48.5°). J-J's lines are straight and at its numbers (112.1°, Ø5.50 at 7.85, apex 6.00).
 *
 * The outer cone, worked from each section's printed numbers, has its apex 8.715 (J-J) and 8.768 (N-N): not quite one
 * circular cone (the 16's agreed to 0.001). As drawn, both sections' outer lines cross at 8.73: one cone, J-J's numbers
 * the nearer. J-J's is recorded.
 *
 * The family's field takes one inner cone, as circular. It's given J-J's (down the phone): its 112° and its Ø5.50 base
 * are both the wider, so a circular cone on them holds N-N's, at its numbers or as drawn (an approximation on the safe
 * side: across, it keeps out up to 1.7 mm more at the transition). N-N's own numbers are in `flashKeepoutAcross`, and
 * 7.85 (no field for the base's distance) in `flashKeepoutBase`; neither reaches features.json.
 */
export const flashKeepout = {
  inner: v(112, 'dimensioned', s3('Section J-J: 112° FLASH INNER KEEPOUT CONE V-FOV (down the phone; across, Section N-N gives 97°: flashKeepoutAcross)')),
  outer: v(157, 'dimensioned', s3('Sections J-J and N-N: 157° FLASH OUTER KEEPOUT CONE V-FOV and H-FOV')),
  innerBaseDiameter: v(5.5, 'dimensioned', s3('Section J-J: 5.50 FLASH INNER KEEPOUT CONE BASE DIAMETER, its extension lines on the base\'s corners, at 7.85 from the front (across, N-N gives 5.13)')),
  transitionFromFront: v(9.89, 'dimensioned', s3('Section J-J: 9.89 FLASH KEEPOUT CONE TRANSITION TO COVER GLASS (its arrows on the front face and the upper kink\'s extension line; its (2.06) from the 7.85 line runs to the lower kink\'s, drawn 0.01 further out; across, N-N gives 9.72)')),
  apexFromFront: v(6.0, 'derived', s3('Section J-J: not dimensioned; the 112° cone through its Ø5.50 base at 7.85: 7.85 - 2.75 / tan 56° = 5.995')),
  outerApexFromFront: v(8.72, 'derived', s3('Section J-J: not dimensioned; the 157° cone through its kinks: 9.89 - (2.75 + 2.04 tan 56°) / tan 78.5° = 8.715 (N-N\'s numbers give 8.768: 9.72 - (2.565 + 1.87 tan 48.5°) / tan 78.5°)')),
};

/** What the sections give beyond the family's field (not in features.json): the distance to the inner cone's base. */
export const flashKeepoutBase = {
  fromFront: v(7.85, 'dimensioned', s3('Sections J-J and N-N: 7.85 FLASH KEEPOUT CONE TO COVER GLASS (its extension line runs on as the strobe\'s face between the inner cone\'s corners, 0.10 under the back glass: the cone\'s base)')),
};

/** Section N-N, across the phone (not in features.json: the family's keepout is one circular cone, J-J's). */
export const flashKeepoutAcross = {
  inner: v(97, 'dimensioned', s3('Section N-N: 97° FLASH INNER KEEPOUT CONE H-FOV')),
  innerBaseDiameter: v(5.13, 'dimensioned', s3('Section N-N: 5.13 FLASH INNER KEEPOUT CONE BASE DIAMETER')),
  transitionFromFront: v(9.72, 'dimensioned', s3('Section N-N: 9.72 FLASH KEEPOUT CONE TRANSITION TO COVER GLASS (its arrows on the front face and the kinks\' extension line; (1.87) = 9.72 - 7.85)')),
  apexFromFront: v(5.58, 'derived', s3('Section N-N: not dimensioned; the 97° cone through its Ø5.13 base at 7.85: 7.85 - 2.565 / tan 48.5° = 5.581')),
  outerApexFromFront: v(8.77, 'derived', s3('Section N-N: not dimensioned; the 157° cone through its kinks: 9.72 - (2.565 + 1.87 tan 48.5°) / tan 78.5° = 8.768')),
};

/** The keepout's far end in both sections (not in features.json: the family's field has no place for it). */
export const flashKeepoutEnd = v(11.85, 'derived', s3('Sections J-J and N-N: (4.00), the line closing the keepout, from the base\'s 7.85 line: 7.85 + 4.00'));

/** The flash lies beside the pill (its edge 27.27 across, the pill's 26.06), on the back glass, where the part draws it. */
export const flash = {
  fromSide: v(30.41, 'dimensioned', s1('Detail D: 30.41 FLASH')),
  fromTop: v(22.48, 'dimensioned', s1('Detail D: 22.48 (the flash\'s centre line, right)')),
  diameter: v(6.28, 'dimensioned', s1('Detail D: Ø6.28 FLASH')),
  onGlass: true,
  keepout: flashKeepout,
};

/**
 * The rear mic, on the pill's top (its straight part: 6.92 from the pill's middle line, inside the top's 9.83 half
 * width), as on the 16, at the same numbers. Across: the 20.54 ordinate below Detail D, whose extension line rises to
 * the mic's centre (between the top's 3.79 and 23.45); down: the left-hand 22.48, whose line runs in to the mic's centre
 * (the right-hand 22.48 is the flash's, on the same line). Two concentric circles are drawn there; the [2] Ø1.00 REAR
 * MIC leader's arrow passes the outer and lands on the inner one, which is Ø1.00 drawn: the mic. The outer circle, a ring
 * round it (`rearMicRing`), isn't built.
 */
export const rearMic = {
  fromSide: v(20.54, 'dimensioned', s1('Detail D: 20.54 (the ordinate below the view; its extension line rises to the mic\'s centre)')),
  fromTop: v(22.48, 'dimensioned', s1('Detail D: 22.48, the left-hand one (its line runs in to the mic\'s centre; the right-hand 22.48 is the flash\'s)')),
  diameter: v(1.0, 'dimensioned', s1('Detail D: [2] Ø1.00 REAR MIC (its arrow lands on the inner of two concentric circles, drawn Ø1.00)')),
};

/** The outer of the mic's two circles, not dimensioned (not built, not in features.json). */
export const rearMicRing = v(1.4, 'scaled', 'Detail D: the outer of the mic\'s two concentric circles, at 4800 dpi');

/**
 * MagSafe's keepouts (sheet 4, the middle view; measure.ts re-reads them at 1200 dpi): the clear circle at the product
 * centre; the magnetic zone round it, the full width from 43.62 down (the pill's outline's bottom, Detail D's 43.62),
 * straight-sided to 112.01, closed by an R49.39 arc through those corners (its centre 112.01 - √(49.39² - 35.725²) =
 * 77.91 down, 3.10 below the product centre, not on it), as on the 16.
 */
export const magsafe = {
  fromSide: v(35.72, 'dimensioned', s4('35.72 PRODUCT CENTER (71.45 / 2 = 35.725)')),
  fromTop: v(74.81, 'dimensioned', s4('74.81 PRODUCT CENTER (149.61 / 2 = 74.805)')),
  diameter: v(57.5, 'dimensioned', s4('Ø57.50: DO NOT OBSTRUCT THIS AREA WITH METAL, CONDUCTIVE MATERIAL, OR MAGNETIC MATERIAL')),
  zoneFrom: v(43.62, 'dimensioned', s4('43.62: the zone\'s top edge, the full width')),
  zoneSidesTo: v(112.01, 'dimensioned', s4('112.01: where the zone\'s sides (the phone\'s) meet its arc')),
  zoneRadius: v(49.39, 'dimensioned', s4('R49.39: the arc closing the zone below (DO NOT OBSTRUCT THIS AREA WITH MAGNETIC OR PERMEABLE MATERIAL EXCEPT MAGSAFE MAGNETS)')),
};

export const connector = {
  name: 'USB-C' as const,
  width: v(12.45, 'dimensioned', s1('Detail C: 12.45 RECOMMENDED CONNECTOR KEEPOUT (2X R3.25 corners)')),
  thickness: v(6.6, 'dimensioned', s1('Detail C: 6.60 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(35.72, 'dimensioned', s1('Detail C: 35.72 (the port\'s centre, from the side-button edge)')),
  fromBack: v(3.97, 'dimensioned', s1('Detail C: 3.97, the port\'s centre line to the back glass')),
  outward: v(14.0, 'dimensioned', s1('Detail C: MATING CONNECTOR KEEPOUT AREA FLUSH TO PRODUCT SURFACE REQUIRED OUTWARD 14.0 mm')),
};

/**
 * The receiver (14.46 x 0.45 centred 1.17 from the top, Detail A) lies on the glass's rounding, outside the flat face the
 * part models, so it isn't drawn (as the 16's). The active area: 2.44 ALL AROUND, but its 144.79 length leaves
 * (149.61 - 144.79) / 2 = 2.41 at each end; the part centres it (2.41 at each end), where the drawing
 * draws it (measure.ts reads 2.415 from the top), the 2.44 holding across.
 */
export const front = {
  activeWidth: v(66.57, 'dimensioned', s1('front view: 66.57 DISPLAY ACTIVE AREA')),
  activeLength: v(144.79, 'dimensioned', s1('front view: 144.79 DISPLAY ACTIVE AREA')),
  activeFromEdge: v(2.41, 'derived', s1('front view: (149.61 - 144.79) / 2, the active area centred down the phone as drawn (measure.ts: 2.415 from the top); the ALL AROUND 2.44, EXTERIOR OF HOUSING TO DISPLAY ACTIVE AREA holds across (66.57) and is 0.03 off at the ends')),
  activeRadius: v(10.37, 'scaled', 'front view: the active area\'s corners crossed on their diagonals, 10.32 to 10.47 at three (the bottom-left\'s diagonal runs along a hatch line)'),
  islandLength: v(20.74, 'dimensioned', s1('front view: 20.74 (the Dynamic Island, a pill)')),
  islandHeight: v(6.07, 'dimensioned', s1('front view: 6.07')),
  islandFromTop: v(7.79, 'dimensioned', s1('front view: 7.79 (its centre line: the leader runs to the pill\'s middle); centred across, on the 35.72 line')),
};

export const buttons = {
  action: {
    side: 'volume' as const,
    centre: v(34.08, 'dimensioned', s1('left side view: 34.08 (the Action button)')),
    half: v(3.45, 'dimensioned', s1('left side view: 2X 3.45 (centre to each end)')),
    width: v(2.66, 'dimensioned', s1('left side view: 3X 2.66 (across the thickness)')),
    fromBack: v(3.97, 'dimensioned', s1('left side view: 3X 3.97, from the back glass\'s line (the bump\'s side)')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 ACTION BUTTON')),
    note: '',
  },
  volumeUp: {
    side: 'volume' as const,
    centre: v(48.23, 'dimensioned', s1('left side view: 48.23 (+) VOLUME BUTTON')),
    half: v(5.6, 'dimensioned', s1('left side view: 4X 5.60')),
    width: v(2.66, 'dimensioned', s1('left side view: 3X 2.66')),
    fromBack: v(3.97, 'dimensioned', s1('left side view: 3X 3.97, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (+) VOLUME BUTTON')),
    note: '',
  },
  volumeDown: {
    side: 'volume' as const,
    centre: v(62.43, 'dimensioned', s1('left side view: 62.43 (-) VOLUME BUTTON')),
    half: v(5.6, 'dimensioned', s1('left side view: 4X 5.60')),
    width: v(2.66, 'dimensioned', s1('left side view: 3X 2.66')),
    fromBack: v(3.97, 'dimensioned', s1('left side view: 3X 3.97, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (-) VOLUME BUTTON')),
    note: '',
  },
  side: {
    side: 'side' as const,
    centre: v(55.32, 'dimensioned', s1('right side view: 55.32')),
    half: v(8.85, 'dimensioned', s1('right side view: 2X 8.85')),
    width: v(2.66, 'dimensioned', s1('right side view: 2.66')),
    fromBack: v(3.98, 'derived', s1('right side view: 2X 3.97 from the front glass\'s line (its arrows land on the screen side), so 7.95 - 3.97')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 SIDE BUTTON')),
    note: '',
  },
};

export const simTray = {
  centre: v(105.66, 'dimensioned', s1('left side view: 105.66')),
  length: v(19.64, 'derived', s1('left side view: 2X 9.82, centre to each end')),
  width: v(2.56, 'dimensioned', s1('left side view: 2.56')),
  fromBack: v(3.97, 'dimensioned', s1('left side view: 3.97, from the back glass\'s line')),
};

/** Camera Control: flush (front view: 0.00), in the side-button side; sheet 2 gives its chamfer and its keepouts. */
export const cameraControl = {
  centre: v(98.2, 'dimensioned', s1('right side view: 98.20')),
  half: v(8.55, 'dimensioned', s1('right side view: 2X 8.55 (centre to each end)')),
  width: v(3.03, 'dimensioned', s1('right side view: 3.03')),
  fromBack: v(3.98, 'derived', s1('right side view: 2X 3.97 from the front glass\'s line, so 7.95 - 3.97')),
  chamfer: v(0.63, 'dimensioned', s2('Section AC-AC, CAMERA CONTROL CHAMFER: 0.63 ALL AROUND along the surface (0.18 deep, 16°: tan 16° = 0.18 / 0.63)')),
  keepoutLength: v(25.0, 'dimensioned', s2('Detail E, CAMERA CONTROL TYPICAL KEEPOUT: 25.00 MEASURE AT SURFACE')),
  keepoutWidth: v(8.4, 'derived', s2('Detail E: 2X 4.20 MEASURE AT SURFACE, each from the side\'s centre line to an edge of the keepout (its 4X R(2.20) box spans both), so 8.40 across')),
};

/**
 * The bottom edge, from the volume-button edge. Only each group's end holes are dimensioned, to their centres as on the
 * 16: 19.71 and 24.22 are 2 x 2.255 apart, 47.23 and 56.25 4 x 2.255. The holes between are evenly spaced, as drawn.
 */
const group = (from: number, to: number, n: number, which: string) =>
  Array.from({ length: n }, (_, i) => {
    const mm = +(from + ((to - from) * i) / (n - 1)).toFixed(3);
    return i === 0 || i === n - 1
      ? v(mm, 'dimensioned', s1(`bottom view, the ${which} group (8X Ø1.35 PORTS): ${mm.toFixed(2)}, on the hole's centre`))
      : v(mm, 'inferred', s1(`bottom view, the ${which} group: evenly between, as drawn`));
  });

export const bottom = {
  holes: [...group(19.71, 24.22, 3, 'left'), ...group(47.23, 56.25, 5, 'right')],
  holeDiameter: v(1.35, 'dimensioned', s1('bottom view: 8X Ø1.35 PORTS')),
  holesFromBack: v(3.97, 'dimensioned', s1('bottom view: 3.97, the holes\' centre line to the back glass\'s line')),
  holeDepth: v(0.6, 'assumed', 'a mic or speaker hole\'s depth for a render: the drawing gives none'),
  screws: [28.8, 42.65].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (2X Ø1.50 SCREW)`))),
  screwDiameter: v(1.5, 'dimensioned', s1('bottom view: 2X Ø1.50 SCREW')),
  screwsFromBack: v(3.97, 'inferred', 'Detail C draws the screws on the holes\' centre line'),
  portFrom: v(31.23, 'dimensioned', s1('bottom view: 31.23 (the USB-C port\'s near end)')),
  portTo: v(40.22, 'dimensioned', s1('bottom view: 40.22 (its far end; centre 35.725, as Detail C\'s 35.72)')),
  portHeight: v(3.14, 'dimensioned', s1('Detail C: 3.14 (the port\'s opening across the thickness); its ends round (inferred)')),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none'),
};

export const mass = v(177, 'spec', 'Weight: 6.24 ounces (177 grams)');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '4:3 at 12MP (a mode both 48MP cameras offer; the 24MP default has the same shape)' };

export const phone: Phone = {
  part: {
    title: 'iPhone 17',
    name: 'iphone-17.dat',
    keywords: ['Apple', 'iPhone 17', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [
      ['2026-10-31', 'Built from Apple\'s dimensional drawing: body, cameras, buttons, Camera Control, USB-C, Dynamic Island'],
      ['2026-11-06', 'Rear mic; the flash\'s keepout (sections J-J and N-N) and MagSafe\'s keepouts in features.json'],
    ],
    drawn: '2025-09-09',
    folder: 'iphone-17',
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
