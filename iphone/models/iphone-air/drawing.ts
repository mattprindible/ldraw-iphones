// iPhone Air, read from Apple's dimensional drawing (iphone/drawings/iphone-air.pdf, sheets 1 to 4, dated
// 2025-09-09). Every number carries where it came from and how we know it (src/provenance.ts): spec here is Apple's
// technical specifications page (support.apple.com/125092); scaled values are re-measured by measure.ts.
//
// The thinnest of the family (5.64), one camera, and a plateau across the top of the back: a pill-shaped flat top 3.03
// above the back glass carrying the camera (its glass 5.68 out), the rear mic and the flash on one line (3X -16.29),
// its flanks curving down to the back glass below it and onto the frame at the top and the sides. The Action button,
// Camera Control, USB-C; no SIM tray (eSIM only). Sheet 1 is outlined (no text: every number read from crops at 600 to
// 4800 dpi): Detail A the corner (and the receiver's slot), Detail B the edge profile, Detail C the USB-C port, Detail
// D the plateau; sheet 2 Camera Control's keepouts; sheet 3 the keepout sections (S-S the camera, T-T and U-U the
// flash: `flashKeepout`, in features.json) and Detail M the front sensors; sheet 4 the antenna keepouts (not modelled)
// and MagSafe's (`magsafe`, in features.json).
//
// Coordinates on the back follow Detail D: `fromSide` from the side-button edge, `fromTop` from the top edge.
//
// What the builder can't say, and how it's approximated (each named where it's made below):
// - The plateau isn't a flat-topped bar to the edges (the 17 Pro's `plateau`): only its pill is flat; its flanks are
//   concave, running out to the frame at the top and sides. It's modelled as a bump: the pill as its top, its outline
//   on the back glass at the back's start of flat (2.58 in) along the top and sides and at the drawn outline (34.16
//   down) along the bottom, the side view's bottom flank between (`flank`), the top and sides in proportion.
// - The bottom corners of the plateau's outline are a long blend (leaving the 2.58 line 27.3 down, level by 20 across),
//   not an arc: one radius (on the diagonal, as the family measures corners) for all four.
import type { Phone } from '../../drawing.ts';
import type { Calibration, Region } from '../../../src/raster.ts';
import { v, type Kind } from '../../../src/provenance.ts';

/**
 * Where the scaled values were measured, regions of sheet 1 (PDF page 2), each with the calibration measure.ts finds:
 * Detail D at 1200 dpi (its extension lines 0.00, 16.29, 51.34 and 58.42 across, 0.00 and -16.29 down: the family's
 * calibration on two camera centres can't run with one camera); the back view (its outer edges; the plateau's bottom,
 * which Detail D's boundary cuts off); the front view (its outer edges); the bottom view (its 0.00 to 50.36 extension
 * lines); Detail A (the corner's leaders); the right side view at 2400 dpi (its 3.03 and 5.68 extension lines, x from
 * the back glass's line, y from the phone's top).
 */
export const detailD: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 15400, y: 300, width: 3900, height: 3300 }, pxPerMm: 46.08, origin: [354.5, 1135.5] };
export const backView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 12500, y: 3200, width: 3300, height: 5800 }, pxPerMm: 34.57, origin: [368, 273.5] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5300, y: 3200, width: 3000, height: 5800 }, pxPerMm: 34.57, origin: [256.5, 273.5] };
export const bottomView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5700, y: 9800, width: 2400, height: 1400 }, pxPerMm: 23.05, origin: [286.5, 1086.5] };
export const detailA: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 10000, y: 1100, width: 2000, height: 1600 }, pxPerMm: 46.08, origin: [302.4, 335.4] };
export const sideView: Region & Calibration = { page: 2, dpi: 2400, crop: { x: 22000, y: 5000, width: 1500, height: 5000 }, pxPerMm: 69.15, origin: [743, 1948] };
/**
 * Sheet 3 (PDF page 4) at 1200 dpi, the flash's keepout sections: T-T (down the phone, drawn upright: the front face on
 * the left, x out of the back, the phone's top up) with its origin at the front face's extension line and the axis
 * midway between the 6.13 extension lines; U-U (across, drawn lying: the front face at the bottom, the keepout above)
 * with its origin at the axis (midway between the 6.00 extension lines) and the front face's line. Both calibrated by
 * measure.ts on the front face and the 10.37 (T-T) or 12.57 (U-U) lines.
 */
export const sectionTT: Region & Calibration = { page: 4, dpi: 1200, crop: { x: 13250, y: 600, width: 1400, height: 3200 }, pxPerMm: 46.1, origin: [212.5, 1584.75] };
export const sectionUU: Region & Calibration = { page: 4, dpi: 1200, crop: { x: 16100, y: 1000, width: 2600, height: 2200 }, pxPerMm: 46.1, origin: [1304.5, 1832] };
/** Sheet 4 (PDF page 5) at 1200 dpi: the MagSafe view (the middle back view), calibrated on its 0.00 and 28.83 lines across and its 0.00 and 113.75 lines down. */
export const magsafeView: Region & Calibration = { page: 5, dpi: 1200, crop: { x: 7900, y: 1500, width: 4400, height: 8000 }, pxPerMm: 46.09, origin: [463, 456.5] };

const s1 = (what: string) => `sheet 1, ${what}`;
const s2 = (what: string) => `sheet 2, ${what}`;
const s3 = (what: string) => `sheet 3, ${what}`;
const s4 = (what: string) => `sheet 4, ${what}`;

/** Detail A's unlabelled crosses where the corner meets the straight edges (the 17 Pro labels its 19.43). */
export const cornerTangent = v(19.38, 'scaled', 'Detail A: the crosses on the top edge and the side, beyond the 13.85 crosses (unlabelled), their arms at 1200 dpi');

export const body = {
  width: v(74.7, 'dimensioned', s1('front view: 74.70 PRODUCT WIDTH')),
  length: v(156.18, 'dimensioned', s1('front view: 156.18 PRODUCT LENGTH')),
  thickness: v(5.64, 'dimensioned', s1('right side view: 5.64 PRODUCT THICKNESS (Apple\'s spec: 5.64)')),
  glassWidth: v(72.42, 'dimensioned', s1('front view: 72.42 GLASS')),
  glassLength: v(153.9, 'dimensioned', s1('front view: 153.90 GLASS (1.14 in each end, as the width\'s)')),
  corner: {
    points: [
      [cornerTangent.mm, 0],
      [13.85, 0.04],
      [8.43, 0.91],
      [3.78, 3.78],
      [0.91, 8.43],
      [0.04, 13.85],
      [0, cornerTangent.mm],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail A: CORNER PROFILE (ALL FOUR CORNERS); each label paired with the cross its leaders reach (the 0.04 lines merge with the 0.00 lines at 1200 dpi); the end points scaled (cornerTangent)'),
  },
  /**
   * Flat to ±0.38, rounding to the face's flat 2.58 in (the front view's 2.58 ALL AROUND, TO START OF FLAT AREA ON TOP
   * SIDE), ending at exactly half the thickness (5.64 / 2 = 2.82). It runs past the glass's edge (1.14 in), so the
   * faces start on the curve, at 1.49 in (2.79, within 0.1 of the face), as on the 16 Pro. Detail B draws the back the
   * same (its 2X labels).
   */
  edge: {
    points: [
      [0, 0.38],
      [0.02, 1.47],
      [0.47, 2.44],
      [1.49, 2.79],
      [2.58, 2.82],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail B: PROFILE (ALL SIDES): insets 0.00, 2X 0.02, 2X 0.47, 2X 1.49, 2X 2.58 paired in order with ±0.38, ±1.47, ±2.44, ±2.79, ±2.82 by the crosses their leaders reach'),
  },
};

/**
 * The plateau, as the builder's bump (see the header). Its flat top is the pill Detail D outlines: the side view's
 * plateau line (3.03) runs from 4.47 to 28.1 down, the pill's top and bottom (4.51, 28.06). Its outline on the back
 * glass is the outer curve below it (34.16 down in the back view, leaving the start-of-flat line 27.3 down).
 */
export const pill = {
  top: v(4.51, 'scaled', 'Detail D: the pill\'s top line down the middle column (its bottom 28.06)'),
  ends: v(4.78, 'scaled', 'Detail D: the pill\'s ends from each side (4.78 and 74.70 - 69.945), the extremes of circles fitted to radial crossings of each end'),
  height: v(23.55, 'scaled', 'Detail D: the pill\'s top to its bottom down the middle column (4.51 to 28.06: centred on the camera\'s 16.29)'),
  radius: v(11.55, 'scaled', 'Detail D: circles fitted to each end\'s crossings from -85° to 85° (11.55, centres 16.33 and 58.40, worst 0.04 off): less than half its height, so its ends have a 0.45 straight'),
};
export const plateauBottom = v(34.16, 'scaled', 'back view: the plateau\'s outline across the middle column (the outer of the two lines below the pill; the inner, 31.94, is Detail D\'s dash-dot boundary)');
export const startOfFlat = v(2.58, 'dimensioned', s1('Detail B: 2X 2.58, where the back\'s flat starts (the back view draws its line 2.57 in, below the camera\'s centre line)'));

export const bump = {
  top: v(3.03, 'dimensioned', s1('right side view: 3.03 BACK GLASS TO CAMERA PLATEAU (its extension line on the plateau\'s flat)')),
  rings: v(5.68, 'dimensioned', s1('right side view: 5.68 BACK GLASS TO REAR CAMERA GLASS (its extension line on the camera\'s outermost line)')),
  baseFrom: v(startOfFlat.mm, 'inferred', 'the plateau\'s outline at the top and sides, where the flanks meet the back\'s flat: drawn there at the sides below the camera\'s centre line (the 2.57 line ends there; above it the flanks run on to the frame at the heavy line, 1.05 in, which the bump can\'t follow); taken as the same at the top (an approximation: the side view\'s flank reaches the back glass\'s plane 1.7 down)'),
  baseSize: v(74.7 - 2 * startOfFlat.mm, 'derived', 'the width less 2.58 a side'),
  baseHeight: v(+(plateauBottom.mm - startOfFlat.mm).toFixed(2), 'derived', 'the plateau\'s bottom (34.16) less its top (2.58)'),
  baseRadius: v(7.58, 'scaled', 'back view: the outline\'s bottom corners crossed on their diagonals from (2.58, 34.16), 7.56 and 7.60 (an approximation: the outline is a long blend, off an arc of this radius by up to 1.2)'),
  topFrom: pill.ends,
  topFromTop: pill.top,
  topSize: v(+(74.7 - 2 * pill.ends.mm).toFixed(2), 'derived', 'the width less the pill\'s ends\' 4.78 each side: centred, as it is'),
  topHeight: pill.height,
  topRadius: pill.radius,
  /**
   * The right side view's flank below the pill, its line's middle on rows down from the pill's bottom (28.06): leaving
   * the flat at about 30°, concave, nearly tangent to the back glass by 31.4 down (0.25 above it), where its line
   * merges with the back's; on to the plan outline (34.16) straight (an approximation: the drawing's tail is under a
   * line's width). The top and the sides take it in proportion to their runs (2.58 to 4.51 and to 4.78; an
   * approximation: the side view's top flank, 1.8 to 4.5 down, is the same curve 0.8 as long, running over the edge's
   * rounding, which the bump stops short of at 2.58).
   */
  flank: {
    points: [
      [0, 3.03],
      [0.14, 2.68],
      [0.34, 2.34],
      [0.54, 2.06],
      [0.94, 1.6],
      [1.34, 1.24],
      [1.94, 0.81],
      [2.54, 0.5],
      [3.34, 0.25],
      [6.1, 0],
    ] as [number, number][],
    kind: 'scaled' as Kind,
    from: s1('right side view at 2400 dpi: the flank\'s line on rows 28.20, 28.40, 28.60, 29.00, 29.40, 30.00, 30.60, 31.40 down (its middle from the back glass\'s extension line, as measure.ts finds it); from the plateau\'s 3.03 at the pill\'s bottom (28.06) to the plan outline (34.16 - 28.06)'),
  },
};

/** The one camera; its keepout cone (84°) is section S-S's. */
export const cameras = {
  main: {
    name: 'rear camera',
    label: 'Fusion',
    fromSide: v(16.29, 'dimensioned', s1('Detail D: 16.29 (REAR CAMERA)')),
    fromTop: v(16.29, 'dimensioned', s1('Detail D: 3X -16.29 (the camera, the rear mic and the flash)')),
    ring: v(15.82, 'dimensioned', s1('Detail D: Ø15.82, its leader on the outermost of the camera\'s four circles')),
    window: v(12.58, 'scaled', 'Detail D: the innermost (heavy) of the camera\'s circles; between it and the ring, Ø13.45 and Ø14.5'),
    coneApexFromFront: v(6.92, 'dimensioned', s3('Section S-S: 6.92 REAR CAMERA KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(84, 'dimensioned', s3('Section S-S: 84° REAR CAMERA KEEPOUT CONE')),
    identity: v(1, 'inferred', 'one rear camera, the 48MP Fusion: its 84° cone encloses a 26 mm equivalent\'s 79.5° diagonal'),
    equivalentFocal: v(26, 'spec', '48MP Fusion Main: 26 mm focal length'),
    aperture: v(1.6, 'spec', 'Main: ƒ/1.6 aperture'),
  },
};

/** On the pill, flush (the builder's flash on the bump's top). Its keepout cones (sheet 3, T-T and U-U) are `flashKeepout`. */
export const flash = {
  fromSide: v(58.42, 'dimensioned', s1('Detail D: 58.42 FLASH')),
  fromTop: v(16.29, 'dimensioned', s1('Detail D: 3X -16.29')),
  diameter: v(6.3, 'dimensioned', s1('Detail D: Ø6.30 FLASH')),
};

/**
 * The flash's keepout, from sheet 3's two sections through it (Detail N): T-T down the phone (V-FOV), U-U across
 * (H-FOV). Both draw an inner cone of 82° (FLASH INNER KEEPOUT CONE V-FOV, H-FOV) from a base on the strobe's face,
 * turning into an outer cone of 157° (FLASH OUTER KEEPOUT CONE V-FOV, H-FOV), the keepout closed by a line across.
 * The section dimensions are unlabelled; their arrows start on each section's front face (T-T's left, U-U's bottom;
 * the plateau on the other side), so "to cover glass", as S-S's 6.92 says, is from the front:
 * - 8.57, to the inner cone's base: the strobe's face, drawn 0.10 under the plateau (5.64 + 3.03 = 8.67). Between the
 *   base's corners only the 8.57 line is drawn; beside them it runs on with the plateau's line 0.10 outside it
 *   (measure.ts reads both at 4800 dpi), as the 16's strobe sits 0.10 under its back glass. Not an apex.
 * - 10.37, to the kinks (the inner cone into the outer): the transition. (1.80) is 10.37 - 8.57.
 * - (4.00), from the 8.57 line to the closing line: 12.57 from the front (`flashKeepoutEnd`).
 * The base's numbers disagree: T-T's 6.13 FLASH INNER KEEPOUT CONE BASE DIAMETER against U-U's 6.00, as if the base
 * were 0.13 longer down the phone than across (both angles 82°). The drawing draws it round, Ø6.00 in both: T-T's inner
 * lines meet the strobe's face 6.00 apart, their kinks lie Ø6.00's 9.13 apart (6.13's would be 9.26) and their apex
 * Ø6.00's 5.12 from the front; its 6.13 extension lines, 6.13 apart, end 0.6 short of the base, touching nothing
 * (measure.ts: a known disagreement). The family's field takes one circular cone, and is given T-T's 6.13, the larger
 * (on the safe side, by 0.065 a side): its apex 8.57 - 3.065 / tan 41° = 5.04 from the front (Ø6.00's 5.12). The
 * outer cone is one cone either way, to 0.013: 10.37 - (3.065 + 1.80 tan 41°) / tan 78.5° = 9.428, and with 3.00,
 * 9.441 (both sections draw it 9.43 to 9.45). U-U's own numbers are in `flashKeepoutAcross`, the base's 8.57 in
 * `flashKeepoutBase`; neither reaches features.json.
 */
export const flashKeepout = {
  inner: v(82, 'dimensioned', s3('Sections T-T and U-U: 82° FLASH INNER KEEPOUT CONE V-FOV and H-FOV')),
  outer: v(157, 'dimensioned', s3('Sections T-T and U-U: 157° FLASH OUTER KEEPOUT CONE V-FOV and H-FOV')),
  innerBaseDiameter: v(6.13, 'dimensioned', s3('Section T-T: 6.13 FLASH INNER KEEPOUT CONE BASE DIAMETER, at 8.57 from the front (its extension lines end short of the base, which T-T draws Ø6.00; across, Section U-U gives 6.00: flashKeepoutAcross): the larger taken')),
  transitionFromFront: v(10.37, 'dimensioned', s3('Section T-T: 10.37 (unlabelled), its arrows on the front face and the kinks\' extension line (U-U draws the same line, (1.80) beyond the 8.57)')),
  apexFromFront: v(5.04, 'derived', s3('Section T-T: not dimensioned; the 82° cone through its Ø6.13 base at 8.57: 8.57 - 3.065 / tan 41°')),
  outerApexFromFront: v(9.43, 'derived', s3('Section T-T: not dimensioned; the 157° cone through its kinks: 10.37 - (3.065 + 1.80 tan 41°) / tan 78.5° = 9.428 (U-U\'s numbers give 9.441)')),
};

/** What the sections give beyond the family's field (not in features.json): the distance to the inner cone's base. */
export const flashKeepoutBase = {
  fromFront: v(8.57, 'dimensioned', s3('Sections T-T and U-U: 8.57 (unlabelled in T-T; U-U draws the line), the strobe\'s face, 0.10 under the plateau\'s 8.67: the inner cone\'s base')),
};

/** Section U-U, across the phone (not in features.json: the family's keepout is one circular cone, T-T's). */
export const flashKeepoutAcross = {
  innerBaseDiameter: v(6.0, 'dimensioned', s3('Section U-U: 6.00 FLASH INNER KEEPOUT CONE BASE DIAMETER')),
  apexFromFront: v(5.12, 'derived', s3('Section U-U: not dimensioned; the 82° cone through its Ø6.00 base at 8.57: 8.57 - 3.00 / tan 41°')),
  outerApexFromFront: v(9.44, 'derived', s3('Section U-U: not dimensioned; 10.37 - (3.00 + 1.80 tan 41°) / tan 78.5° = 9.441')),
};

/** The keepout's far end in both sections (not in features.json: the family's field has no place for it). */
export const flashKeepoutEnd = v(12.57, 'derived', s3('Sections T-T and U-U: (4.00), the line closing the keepout, from the base\'s 8.57 line: 8.57 + 4.00'));

/**
 * The rear mic, on the pill between the camera and the flash, flush on it (the builder's rear mic on the bump's top).
 * Detail D draws it as one circle: across, the 51.34 extension line rises from its centre; down, it's on the 3X -16.29
 * line with the camera and the flash; its Ø2.30 leader lands on the circle from below. measure.ts finds it there.
 */
export const rearMic = {
  fromSide: v(51.34, 'dimensioned', s1('Detail D: 51.34 REAR MIC')),
  fromTop: v(16.29, 'dimensioned', s1('Detail D: 3X -16.29')),
  diameter: v(2.3, 'dimensioned', s1('Detail D: Ø2.30 REAR MIC')),
};

/**
 * MagSafe's keepouts (sheet 4, the middle back view). The clear area (5 7: DO NOT OBSTRUCT THIS AREA WITH METAL,
 * CONDUCTIVE MATERIAL, OR MAGNETIC MATERIAL) is a Ø61.50 circle round PRODUCT CENTER: 37.35 across (half the 74.70)
 * and 78.34 down, which is NOT half the length (156.18 / 2 = 78.09): the view draws the phone's bottom edge 156.18 down
 * and the circle round the 78.34 line (measure.ts), 0.25 below the middle. The magnetic zone (5 7: DO NOT OBSTRUCT
 * THIS AREA WITH MAGNETIC OR PERMEABLE MATERIAL EXCEPT MAGSAFE MAGNETS) is the 16's shape: the full width from 34.17
 * down (the plateau's outline: the back view scales its bottom 34.16), straight-sided to 2X 113.75, closed by an R49.39
 * arc through those corners, whose centre (derived: 113.75 - √(49.39² - 37.35²) = 81.43 down) is 3.09 below the
 * product centre, as the 16's is 3.10 below its own.
 */
export const magsafe = {
  fromSide: v(37.35, 'dimensioned', s4('37.35 PRODUCT CENTER (74.70 / 2)')),
  fromTop: v(78.34, 'dimensioned', s4('78.34 PRODUCT CENTER (not 156.18 / 2 = 78.09: the circle is drawn round the 78.34 line)')),
  diameter: v(61.5, 'dimensioned', s4('Ø61.50: DO NOT OBSTRUCT THIS AREA WITH METAL, CONDUCTIVE MATERIAL, OR MAGNETIC MATERIAL (its leader on the circle)')),
  zoneFrom: v(34.17, 'dimensioned', s4('34.17: the zone\'s top edge, the full width (the plateau\'s outline, scaled 34.16 in the back view)')),
  zoneSidesTo: v(113.75, 'dimensioned', s4('2X 113.75: where the zone\'s sides (the phone\'s) meet its arc')),
  zoneRadius: v(49.39, 'dimensioned', s4('R49.39: the arc closing the zone below (DO NOT OBSTRUCT THIS AREA WITH MAGNETIC OR PERMEABLE MATERIAL EXCEPT MAGSAFE MAGNETS)')),
};

/**
 * What sheet 4 gives beyond the family's fields (not built, not in features.json):
 * - in the MagSafe view, above the zone, the camera's corner (0.00 to 28.83 across, 0.00 to 34.17 down, crosshatched):
 *   DO NOT OBSTRUCT THIS AREA WITH METAL OR OTHER CONDUCTIVE MATERIAL (FULL PRODUCT VOLUME INCLUDING SIDEWALLS); the
 *   rest of the top (28.83 to the far edge, above 34.17) carries no keepout;
 * - the 5 7 COMPASS, a small hatched circle centred 18.11 across, 151.29 down (its size not dimensioned);
 * - KEEP OUT AREA 1 and KEEP OUT AREA 2 (the left and right back views, each with a 100° cone in a side view below):
 *   areas kept clear of metal or other conductive material at the top and bottom (the full product volume) and two
 *   KEEPOUTs measured at the glass surface beside the plateau; their numbers not recorded here, not modelled.
 */

/**
 * The port's centre is 2.60 from the back (Detail C), the holes' and screws' 2.71 (the bottom view): neither on the
 * mid-plane (2.82). Detail C's 2.70 is a band about the holes (its extension lines 1.35 either side of them), not
 * modelled.
 */
export const connector = {
  name: 'USB-C' as const,
  width: v(12.45, 'dimensioned', s1('Detail C: 12.45 RECOMMENDED CONNECTOR KEEPOUT (2X R3.25 corners)')),
  thickness: v(6.6, 'dimensioned', s1('Detail C: 6.60 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(37.35, 'dimensioned', s1('Detail C: 37.35 (the port\'s centre line, from the side-button edge: the middle)')),
  fromBack: v(2.6, 'dimensioned', s1('Detail C: 2.60, from the port\'s centre line to the back\'s (the plateau\'s line lies beyond it)')),
  outward: v(14.0, 'dimensioned', s1('Detail C: MATING CONNECTOR KEEPOUT AREA FLUSH TO PRODUCT SURFACE REQUIRED OUTWARD 14.0 mm')),
};

/**
 * The receiver, a 14.02 slot centred across between 0.45 and 1.31 from the top (Detail A: PORTS: RECEIVER, FRONT MIC),
 * lies on the glass's curved edge (the flat starts 2.58 in), outside the flat face the part models, so it isn't drawn.
 */
export const front = {
  activeWidth: v(69.55, 'dimensioned', s1('front view: 69.55 DISPLAY ACTIVE AREA')),
  activeLength: v(151.03, 'dimensioned', s1('front view: 151.03 DISPLAY ACTIVE AREA')),
  activeFromEdge: v(2.58, 'dimensioned', s1('front view: 2.58 ALL AROUND, EXTERIOR OF HOUSING TO DISPLAY ACTIVE AREA')),
  activeRadius: v(10.29, 'scaled', 'front view: the active area\'s corners crossed on their diagonals, 10.27 to 10.32 at three (the bottom-left\'s diagonal runs along a hatch line, as the 17 Pro\'s); the top-left 5.60 from the sharp corner: the outline\'s 3.78 plus 2.58 along the diagonal\'s normal, so the 2.58 ALL AROUND holds at the corners too. A first guess of 8 found the heavy glass line (4.50) at 6.6: inside the hatch the first line is the outline'),
  islandLength: v(20.76, 'dimensioned', s1('front view: 20.76 (the Dynamic Island), centred on the 37.35 line')),
  islandHeight: v(6.07, 'dimensioned', s1('front view: 6.07 (its arrows on the island\'s top and bottom)')),
  islandFromTop: v(8.92, 'dimensioned', s1('front view: 8.92 (its centre line)')),
};

const mid = (side: string) => v(2.82, 'dimensioned', s1(`${side}: 2.82, from the button's centre line to the back (half the 5.64: the mid-plane)`));
const midLeft = v(2.82, 'inferred', 'the left side view gives no position across: drawn centred, as the right side\'s buttons are dimensioned (2.82, the mid-plane)');

export const buttons = {
  action: {
    side: 'volume' as const,
    centre: v(34.08, 'dimensioned', s1('left side view: 34.08 (the Action button)')),
    half: v(3.45, 'dimensioned', s1('left side view: 2X 3.45 (centre to each end)')),
    width: v(2.35, 'dimensioned', s1('left side view: 3X 2.35 (across the thickness)')),
    fromBack: midLeft,
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 ACTION BUTTON')),
    note: '',
  },
  volumeUp: {
    side: 'volume' as const,
    centre: v(48.23, 'dimensioned', s1('left side view: 48.23 (+ volume)')),
    half: v(5.6, 'dimensioned', s1('left side view: 4X 5.60')),
    width: v(2.35, 'dimensioned', s1('left side view: 3X 2.35')),
    fromBack: midLeft,
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (+) VOLUME BUTTON')),
    note: '',
  },
  volumeDown: {
    side: 'volume' as const,
    centre: v(62.43, 'dimensioned', s1('left side view: 62.43 (- volume)')),
    half: v(5.6, 'dimensioned', s1('left side view: 4X 5.60')),
    width: v(2.35, 'dimensioned', s1('left side view: 3X 2.35')),
    fromBack: midLeft,
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (-) VOLUME BUTTON')),
    note: '',
  },
  side: {
    side: 'side' as const,
    centre: v(55.33, 'dimensioned', s1('right side view: 55.33 (the side button)')),
    half: v(8.9, 'dimensioned', s1('right side view: 2X 8.90')),
    width: v(2.35, 'dimensioned', s1('right side view: 2.35')),
    fromBack: mid('right side view'),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 SIDE BUTTON')),
    note: '',
  },
};

/** Camera Control: flush (front view: 0.00), in the side-button side; sheet 2 gives its chamfer and its keepouts. */
export const cameraControl = {
  centre: v(104.77, 'dimensioned', s1('right side view: 104.77 (Camera Control)')),
  half: v(8.55, 'dimensioned', s1('right side view: 2X 8.55 (centre to each end)')),
  width: v(2.53, 'dimensioned', s1('right side view: 2.53')),
  fromBack: mid('right side view (Camera Control)'),
  chamfer: v(0.12, 'dimensioned', s2('Section G-G: CAMERA CONTROL CHAMFER 0.12 ALL AROUND, 45°')),
  keepoutLength: v(25.0, 'dimensioned', s2('Detail E: 25.00 CAMERA CONTROL KEEPOUT MEASURED FROM SURFACE (4X R2.20)')),
  keepoutWidth: v(5.82, 'derived', s2('Detail E: 2x 2.91 CAMERA CONTROL KEEPOUT MEASURED FROM SURFACE, each from the centre line (its extension line) to an edge: 5.82 across')),
};

/**
 * The bottom edge, from the volume-button edge: no speaker grille, four Ø1.10 holes (bottom mic 1 and one beside it;
 * bottom mic 2 and one beside it), each dimensioned to its centre (the chords centre on the extension lines: measure.ts),
 * the screws either side of the port.
 */
export const bottom = {
  holes: [24.34, 26.33, 48.38, 50.36].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (4X Ø1.10 PORTS: bottom mics 1 and 2 and two more)`))),
  holeDiameter: v(1.1, 'dimensioned', s1('bottom view: 4X Ø1.10 PORTS')),
  holesFromBack: v(2.71, 'dimensioned', s1('bottom view: 6X 2.71, from the holes\' and screws\' centre line to the back\'s')),
  holeDepth: v(0.6, 'assumed', 'a mic hole\'s depth for a render: the drawing gives none'),
  screws: [30.01, 44.7].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (2X Ø1.50 SCREW)`))),
  screwDiameter: v(1.5, 'dimensioned', s1('bottom view: 2X Ø1.50 SCREW')),
  screwsFromBack: v(2.71, 'dimensioned', s1('bottom view: 6X 2.71')),
  portFrom: v(33.05, 'dimensioned', s1('bottom view: 33.05 (the USB-C port\'s near end)')),
  portTo: v(41.65, 'dimensioned', s1('bottom view: 41.65 (its far end: 8.60 long, centred on 37.35)')),
  portHeight: v(2.72, 'scaled', 'bottom view at 4800 dpi: the port\'s outline (a 0.55 mm pen) across the thickness, its outer edges (2.95) less 0.115 a side, as its 8.60 length lands inside the same outline\'s outer edges (8.83); no dimension gives it'),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none'),
};

export const mass = v(165, 'spec', 'Weight: 5.82 ounces (165 grams)');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '4:3, the shape of the Fusion\'s 24MP default and 12MP stills; 4032 x 3024 is the usual 12MP size, not on the spec page' };

export const phone: Phone = {
  part: {
    title: 'iPhone Air',
    name: 'iphone-air.dat',
    keywords: ['Apple', 'iPhone Air', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [
      ['2026-10-31', 'Built from Apple\'s dimensional drawing: body, plateau (as a bump), camera, buttons, Camera Control, USB-C, Dynamic Island'],
      ['2026-11-06', 'Rear mic (Detail D); the flash\'s keepout (sections T-T and U-U) and MagSafe\'s keepouts in features.json'],
    ],
    drawn: '2025-09-09',
    folder: 'iphone-air',
  },
  details: { corner: 'Detail A', edge: 'Detail B', back: 'Detail D', port: 'Detail C' },
  body,
  bump,
  cameras,
  cameraIdentity: cameras.main.identity,
  flash: { ...flash, keepout: flashKeepout },
  rearMic,
  magsafe,
  connector,
  front,
  buttons,
  cameraControl,
  bottom,
  mass,
  image,
};
