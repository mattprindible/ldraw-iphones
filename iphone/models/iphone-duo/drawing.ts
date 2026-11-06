// iPhone Duo, read from Apple's dimensional drawing (iphone/drawings/iphone-duo.pdf, sheets 1 to 7, dated
// 2026-09-09). Every number carries where it came from and how we know it (src/provenance.ts): spec here is Apple's
// technical specifications page (apple.com/iphone-duo/specs); scaled values are re-measured by measure.ts.
//
// A foldable: two halves on a hinge, drawn and built here folded shut, 84.10 x 117.80 x 11.30. The outer display is
// the front; the back carries a camera plateau like the Air's (a pill-shaped flat 3.64 above the back plate, its
// flanks curving down to the back glass and out over the frame at the top and the side), two cameras side by side on
// the camera line (2X -15.25), the flash and the rear mic (a slot) beside them. The hinge is the volume side of the
// family's frame (-X: the left of the front view, the bottom view's 0.00), the side button (Touch ID) and Camera
// Control are on the side-button side (+X), the volume buttons on the top edge, USB-C on the bottom. Unlike the other
// sheets this PDF keeps its text, so every printed number was read with its position (pdftotext -bbox) and then
// checked on crops at 1200 to 2400 dpi.
//
// The sheets (the title block's numbering; PDF page = sheet + 1): sheet 1 Details A (corner), AY (hinge corner), B
// (side profile), C (USB-C), D (the plateau), E (the hinge's profile), the front, back, side and bottom views; sheet 2
// Camera Control and Touch ID keepouts; sheet 3 the keepout sections (S-S, V-V the cameras, T-T the flash) and Detail M
// the front sensors; sheet 4 the inner display (open); sheet 5 antenna, MagSafe and Taptic Engine keepouts; sheet 6
// magnets and hall sensors; sheet 7 the hinge's fold angles.
//
// Coordinates on the back follow Detail D: `fromSide` from the side-button edge, `fromTop` from the top edge.
//
// What the builder can't say, and how it's approximated (each named where it's made below; `notBuilt` keeps the rest):
// - The phone isn't symmetric across: the hinge side has its own corner (Detail AY, about R1 against Detail A's R17)
//   and its own profile (Detail E: one rounded spine across both halves), the display sits 4.13 from the hinge and
//   2.71 from the other side, with small corners at the hinge. The builder draws one corner at all four, one profile
//   all round and the display centred: here Detail A's corner (CORNER PROFILE, ALL FOUR CORNERS: the open phone's four
//   outer corners), Detail B's profile and the display's printed width centred, its outer corners' radius at all four.
// - The two halves meet in a seam all round but the hinge, and at the top and bottom each half rounds on its own (the
//   side view: a notch about 1.5 deep between them). Detail B's side profile runs flat across the seam, so the part
//   has no seam.
// - The volume buttons are on the top edge (the builder's buttons are on the long sides), the front camera is a punch
//   hole off the middle (the builder's island is centred), the rear mic is a slot (the builder's mic is a disc), and the
//   bottom view's screws are in two rows (the builder's in one): see each below.
// - The plateau's outline is a blend the builder's one-radius rounded rectangle can't follow (as on the Air).
import type { Phone } from '../../drawing.ts';
import type { Calibration, Region } from '../../../src/raster.ts';
import { v, type Kind } from '../../../src/provenance.ts';

/**
 * Where the scaled values were measured, each region with the calibration measure.ts finds: on sheet 1 (PDF page 2),
 * Detail D at 1200 dpi (its extension lines: 0.00 to 49.58 across, 0.00 to -34.62 down), the front view (its outer
 * edges), the bottom view (its extension lines, 0.00 to 67.61), the back view (its outer edges, for its overlay), the
 * right side view at 2400 dpi (the 3.64 and 5.72 extension lines, x from the back plate's, y from the phone's top);
 * on sheet 5 (PDF page 6) the MagSafe view (its extension lines, 0.00 to 70.93 across, 25.80 to 110.14 down).
 */
export const detailD: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 14600, y: 300, width: 5400, height: 3300 }, pxPerMm: 46.1, origin: [553, 1179.5] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 7000, y: 3000, width: 4600, height: 6000 }, pxPerMm: 34.54, origin: [313.5, 1138.5] };
export const backView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 12500, y: 3700, width: 3800, height: 5000 }, pxPerMm: 34.53, origin: [237, 438.5] };
export const bottomView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 4800, y: 9600, width: 4800, height: 1800 }, pxPerMm: 34.574, origin: [328.5, 905.75] };
export const sideView: Region & Calibration = { page: 2, dpi: 2400, crop: { x: 9800, y: 6000, width: 1600, height: 5000 }, pxPerMm: 69.23, origin: [911, 2278] };
export const magsafeView: Region & Calibration = { page: 6, dpi: 1200, crop: { x: 14333, y: 1250, width: 5667, height: 7833 }, pxPerMm: 46.087, origin: [819.5, 980.5] };

const s1 = (what: string) => `sheet 1, ${what}`;
const s2 = (what: string) => `sheet 2, ${what}`;
const s3 = (what: string) => `sheet 3, ${what}`;
const s5 = (what: string) => `sheet 5, ${what}`;

export const body = {
  width: v(84.1, 'dimensioned', s1('front view: 84.10 PRODUCT WIDTH (folded; Apple\'s spec: 84.1)')),
  length: v(117.8, 'dimensioned', s1('front view: 117.80 PRODUCT LENGTH')),
  thickness: v(11.3, 'dimensioned', s1('right side view: 11.30 PRODUCT THICKNESS, the two halves 2x 5.48 (to the seam\'s near edge; Apple\'s spec: 11.3)')),
  glassWidth: v(79.93, 'dimensioned', s1('front view: 79.93 GLASS (1.33 ALL AROUND from the housing on the three plain sides, so 2.84 at the hinge: the builder uses it only to see that the profile runs past the glass\'s edge)')),
  glassLength: v(115.04, 'dimensioned', s1('front view: 115.04 GLASS (1.38 each end, against the 1.33 ALL AROUND)')),
  /**
   * Detail A's corner, from the corner: its labels are positions from the hinge edge (66.80 to 84.10) and from the top
   * (0.00 to -17.31), so each point is 84.10 less the first, paired in order by the crosses its leaders reach. It's
   * labelled ALL FOUR CORNERS, and is drawn at the top right of the front view; the top left, at the hinge, is Detail
   * AY's (a corner about R1 on the hinge's spine). Read as the open phone's four outer corners. The builder takes one
   * corner for all four, so the hinge corners are Detail A's too (an approximation: see notBuilt.hingeCorner).
   */
  corner: {
    points: [
      [17.3, 0],
      [12.44, 0.06],
      [7.68, 1.0],
      [3.62, 3.63],
      [1.0, 7.68],
      [0.02, 12.44],
      [0, 17.31],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail A: CORNER PROFILE (ALL FOUR CORNERS): across 66.80, 71.66, 76.42, 80.48, 83.10, 84.08, 84.10 (from the hinge edge: 84.10 less each), down 0.00, -0.06, -1.00, -3.63, -7.68, -12.44, -17.31, paired in order'),
  },
  /**
   * Detail B, SIDE PROFILE (the side-button side, seen in the bottom view): flat at the side from the mid-plane to
   * ±2.91, rounding to the faces' flat 2.74 in at exactly half the thickness (5.65), the same front and back (its 2x
   * labels). The seam between the halves is drawn reaching the outer line at the mid-plane but not cutting it: the
   * profile runs straight across. The front view's 2.74 ALL AROUND, TO START OF FLAT AREA ON TOP SIDE is its last
   * point. It runs past the glass's edge (1.33 in), so the faces start on the curve, at 1.80 in (5.63, within 0.1 of
   * the face). Used all round: the hinge's own profile (Detail E) isn't (notBuilt.hingeProfile).
   */
  edge: {
    points: [
      [0, 2.91],
      [0.02, 3.85],
      [0.23, 4.76],
      [0.89, 5.41],
      [1.8, 5.63],
      [2.74, 5.65],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail B: SIDE PROFILE: insets 0.00, 2x -0.02, 2x -0.23, 2x -0.89, 2x -1.80, 2x -2.74 paired in order with ±2.91, ±3.85, ±4.76, ±5.41, ±5.63, ±5.65 by the crosses their leaders reach (the 0.00 cross also on the mid-plane)'),
  },
};

/**
 * The plateau, as the builder's bump, as on the Air (see the header). Its flat top is the pill Detail D outlines,
 * 4.70 to 25.80 down and from 4.94 to 60.56 across (its ends' extremes, crosses on the camera line); its outline on
 * the back glass the outer curve, to 34.62 down and 69.37 across (its extreme, a cross on the camera line). At the top
 * and the side it runs out onto the frame (the side view: the top flank begins at the phone's top), so the bump's
 * outline there is taken at the back's start of flat, 2.74 in.
 */
export const pill = {
  top: v(4.7, 'dimensioned', s1('Detail D: -4.70 (the pill\'s top)')),
  bottom: v(25.8, 'dimensioned', s1('Detail D: -25.80 (the pill\'s bottom)')),
  left: v(4.94, 'dimensioned', s1('Detail D: 4.94 (the pill\'s left end, its extension line tangent to it on the camera line)')),
  right: v(60.56, 'dimensioned', s1('Detail D: 60.56 (a cross on the camera line at the pill\'s right end: its extreme, where the arc runs vertical)')),
  radius: v(10.32, 'scaled', 'Detail D: circles fitted to each end\'s crossings from -85° to 85° (the left R10.30 centred on camera 1, the right R10.34): less than half its 21.10 height, so its ends have a 0.46 straight'),
};
export const outline = {
  bottom: v(34.62, 'dimensioned', s1('Detail D: -34.62 (the outer curve below the pill)')),
  right: v(69.37, 'dimensioned', s1('Detail D: 69.37 (a cross on the camera line at the outer curve\'s right end: its extreme)')),
  /**
   * The outer curve's right end, crossed on rays from (50.00, 15.25): a circle of R19.20 about the camera line (centred 50.18, 15.21), so
   * concentric with the pill's right end (R10.32 centred 50.2), 9 further out. From its top it runs over the start of
   * flat onto the frame; below, it meets the bottom straight about 50 across.
   */
  endRadius: v(19.2, 'scaled', 'Detail D: a circle fitted to the outer curve\'s right end, -80° to 85° about the camera line'),
};
export const startOfFlat = v(2.74, 'dimensioned', s1('Detail B: 2x -2.74, and the front view\'s 2.74 ALL AROUND, EXTERIOR OF HOUSING TO START OF FLAT AREA ON TOP SIDE (the back view draws its line 2.74 in, left of the plateau below the camera line)'));

export const bump = {
  top: v(3.64, 'dimensioned', s1('right side view: 3.64 BACK PLATE TO CAMERA PLATEAU (its extension line on the plateau\'s flat); sheet 3, Section T-T: 3.64')),
  rings: v(5.72, 'dimensioned', s1('right side view: 5.72 BACK PLATE TO REAR CAMERA GLASS (its extension line on the camera\'s outermost line)')),
  baseFrom: v(startOfFlat.mm, 'inferred', 'the plateau\'s outline at the side, where the flanks run out onto the back\'s flat (the line 2.74 in, below the camera line); above it the flanks run on over the frame, which the bump can\'t follow'),
  baseFromTop: v(startOfFlat.mm, 'inferred', 'the plateau\'s outline at the top, taken at the back\'s start of flat as at the side: the side view\'s top flank begins at the phone\'s top edge, over the edge\'s rounding (an approximation, as on the Air)'),
  baseSize: v(+(outline.right.mm - startOfFlat.mm).toFixed(2), 'derived', 'the outer curve\'s extreme (69.37) less its side (2.74)'),
  baseHeight: v(+(outline.bottom.mm - startOfFlat.mm).toFixed(2), 'derived', 'the outer curve\'s bottom (34.62) less its top (2.74)'),
  baseRadius: v(12.83, 'scaled', 'Detail D: the outline\'s top-right, bottom-right and bottom-left corners crossed on their diagonals from the rounded rectangle\'s sharp corners, averaged (an approximation: the right end is an arc of R19.20 about the camera line, which no rounded rectangle 31.88 high can take; the bottom-left is a long blend; the top-left lies on the phone\'s own corner)'),
  topFrom: pill.left,
  topFromTop: pill.top,
  topSize: v(+(pill.right.mm - pill.left.mm).toFixed(2), 'derived', 'the pill\'s extremes, 60.56 less 4.94'),
  topHeight: v(+(pill.bottom.mm - pill.top.mm).toFixed(2), 'derived', 'the pill\'s bottom less its top, 25.80 less 4.70 (centred on the camera line)'),
  topRadius: pill.radius,
  /**
   * The right side view's silhouette below the pill, its line's middle on rows down from the pill's bottom (25.80):
   * leaving the flat steeply, concave, nearly tangent to the back plate by 30.0 down (0.24 above it), where its line
   * merges with the back's; on to the outline (34.62) straight (an approximation: the drawing's tail is under a line's
   * width). The right end's flank (69.37 - 60.56 = 8.81) is as long as the bottom's (8.82); the top and the side (1.96,
   * 2.20) take it in proportion (an approximation: the side view's top flank, from the phone's top to 4.7 down, runs
   * over the edge's rounding, which the bump stops short of at 2.74).
   */
  flank: {
    points: [
      [0, 3.64],
      [0.2, 3.25],
      [0.7, 2.54],
      [1.2, 1.98],
      [1.7, 1.5],
      [2.2, 1.12],
      [2.7, 0.81],
      [3.2, 0.56],
      [3.7, 0.38],
      [4.2, 0.24],
      [8.82, 0],
    ] as [number, number][],
    kind: 'scaled' as Kind,
    from: s1('right side view at 2400 dpi: the flank\'s line on rows 26.0 to 30.0 down, every 0.5 (its middle from the back plate\'s extension line, as measure.ts finds it); from the plateau\'s 3.64 at the pill\'s bottom (25.80) to the outline (34.62 - 25.80)'),
  },
};

/** Which is which, from sheet 3's keepout cones against the spec's lenses. */
const identity = v(1, 'inferred', 'camera 1 (the outer, by the side) is the Ultra Wide: its 123° cone (S-S) encloses the Ultra Wide\'s 120° (spec); camera 2\'s 84° (V-V) encloses the 26 mm Fusion\'s 79.5°. The spec\'s 2x Telephoto is a crop of the Fusion\'s sensor (52 mm), not a lens of its own');

/**
 * Sheet 3's sections dimension each cone's apex from the BACK GLASS (REAR CAMERA KEEPOUT CONE TO BACK GLASS), not a
 * cover glass: the arrows land on the back plate's line (continued past the plateau) and on the apex, outward of it,
 * inside the plateau (2.69 and 1.25 out, the plateau 3.64). From the front: 11.30 plus each.
 */
export const cameras = {
  ultraWide: {
    name: 'rear camera 1',
    label: 'Ultra Wide',
    fromSide: v(15.25, 'dimensioned', s1('Detail D: 15.25 (REAR CAMERA 1)')),
    fromTop: v(15.25, 'dimensioned', s1('Detail D: 2x -15.25')),
    ring: v(16.2, 'dimensioned', s1('Detail D: 2X Ø16.20, its leader on the outermost of each camera\'s four circles')),
    window: v(13.21, 'scaled', 'Detail D: the innermost of the camera\'s circles (thin); outside it Ø13.92 (heavy) and Ø15.26'),
    coneApexFromFront: v(13.99, 'derived', s3('Section S-S: 2.69 REAR CAMERA KEEPOUT CONE TO BACK GLASS, outward from the back plate (the apex inside the plateau): 11.30 + 2.69')),
    keepoutCone: v(123, 'dimensioned', s3('Section S-S: 123° REAR CAMERA 1 KEEPOUT ZONE')),
    identity,
    fov: v(120, 'spec', '48MP Fusion Ultra Wide: 120° field of view'),
    aperture: v(2.2, 'spec', 'Ultra Wide: ƒ/2.2 aperture'),
  },
  main: {
    name: 'rear camera 2',
    label: 'Fusion',
    fromSide: v(32.98, 'dimensioned', s1('Detail D: 32.98 (REAR CAMERA 2)')),
    fromTop: v(15.25, 'dimensioned', s1('Detail D: 2x -15.25')),
    ring: v(16.2, 'dimensioned', s1('Detail D: 2X Ø16.20')),
    window: v(13.21, 'scaled', 'Detail D: the innermost of the camera\'s circles, as camera 1\'s'),
    coneApexFromFront: v(12.55, 'derived', s3('Section V-V: 1.25 REAR CAMERA KEEPOUT CONE TO BACK GLASS, outward from the back plate: 11.30 + 1.25')),
    keepoutCone: v(84, 'dimensioned', s3('Section V-V: 84° REAR CAMERA 2 KEEPOUT ZONE')),
    identity,
    equivalentFocal: v(26, 'spec', '48MP Fusion Main: 26 mm focal length'),
    aperture: v(1.6, 'spec', 'Fusion Main: ƒ/1.6 aperture'),
  },
};

/**
 * The flash's keepout (Section T-T): the inner cone, 121°, has its base Ø6.00 on the plateau's flat (its arrows on
 * the plateau's line, 3.64 out) and widens to the outer cone's base, Ø9.87, where the 4.73's arrow lands (4.73 out
 * from the back plate); the outer cone, 155°, runs on from there. Worked through: the inner cone at 4.73 is Ø9.85
 * (6.00 + 2·1.09·tan 60.5°), the outer base's 9.87 within the drawing's rounding. The apexes aren't dimensioned: worked
 * from those numbers, the inner cone's lies 1.70 inside the plateau's flat (13.24 from the front), the outer cone's
 * 1.09 inside the 4.73 line, on the plateau's flat (14.94). The drawing says "to back glass" outright, so the family's
 * "from the front" adds 11.30. The outer cone's base diameter (9.87) has no field: it's the transition's circle.
 */
export const flashKeepout = {
  inner: v(121, 'dimensioned', s3('Section T-T: 121° FLASH INNER KEEPOUT CONE V-FOV')),
  outer: v(155, 'dimensioned', s3('Section T-T: 155° FLASH OUTER KEEPOUT CONE V-FOV')),
  innerBaseDiameter: v(6.0, 'dimensioned', s3('Section T-T: 6.00 FLASH INNER KEEPOUT CONE BASE DIAMETER, its arrows on the plateau\'s flat (3.64 out from the back plate, 14.94 from the front)')),
  transitionFromFront: v(16.03, 'derived', s3('Section T-T: 4.73, from the back plate to where the inner cone meets the outer (the outer cone\'s base, 9.87 FLASH OUTTER KEEPOUT CONE BASE DIAMETER): 11.30 + 4.73')),
  apexFromFront: v(13.24, 'derived', s3('Section T-T: the inner cone\'s apex, not dimensioned: its Ø6.00 base on the plateau (14.94 from the front) less 3.00 / tan 60.5° (1.70)')),
  outerApexFromFront: v(14.94, 'derived', s3('Section T-T: the outer cone\'s apex, not dimensioned: its Ø9.87 base at 16.03 less 4.935 / tan 77.5° (1.09): on the plateau\'s flat')),
};

/** On the pill, flush (the builder's flash on the bump's top). */
export const flash = {
  fromSide: v(49.58, 'dimensioned', s1('Detail D: 49.58 (FLASH)')),
  fromTop: v(19.7, 'dimensioned', s1('Detail D: -19.70')),
  diameter: v(3.75, 'dimensioned', s1('Detail D: Ø3.75 FLASH')),
  keepout: flashKeepout,
};

/**
 * The rear mic is a slot: 3.32 across (its extension lines on its ends, either side of the flash's 49.58 centre line)
 * by 1.50 down (on its edges' extension lines), centred -10.95 down. The builder's rear mic is a disc: it's drawn as
 * the disc of the slot's width at its centre (an approximation: the slot's 0.91 straight either side isn't drawn).
 */
export const micSlot = {
  length: v(3.32, 'dimensioned', s1('Detail D: 3.32 (REAR MIC), its extension lines on the slot\'s ends')),
  width: v(1.5, 'dimensioned', s1('Detail D: 1.50, its arrows on the slot\'s edges\' extension lines either side of the -10.95 line')),
};
export const rearMic = {
  fromSide: v(49.58, 'inferred', 'Detail D: the slot is drawn on the flash\'s 49.58 centre line, its 3.32 ends either side of it (47.92 and 51.24)'),
  fromTop: v(10.95, 'dimensioned', s1('Detail D: -10.95 (REAR MIC)')),
  diameter: micSlot.width,
};

/** MagSafe's clear circle (sheet 5). Its magnetic zone isn't the family's shape: see magsafeZone. */
export const magsafe = {
  fromSide: v(41.3, 'dimensioned', s5('MAGSAFE AND TAPTIC ENGINE KEEPOUT ZONES: 41.30, the circle\'s dash-dot centre line (0.75 toward the side-button edge from the product\'s middle)')),
  fromTop: v(61.31, 'dimensioned', s5('MAGSAFE AND TAPTIC ENGINE KEEPOUT ZONES: 61.31, its dash-dot centre line (2.41 below the product\'s middle)')),
  diameter: v(61.5, 'dimensioned', s5('Ø61.50: DO NOT OBSTRUCT THIS AREA WITH METAL, CONDUCTIVE MATERIAL, OR MAGNETIC MATERIAL')),
};

/**
 * MagSafe's magnetic zone (DO NOT OBSTRUCT THIS AREA WITH MAGNETIC OR PERMEABLE MATERIAL EXCEPT MAGSAFE MAGNETS), not in
 * features.json: it isn't the family's shape. It runs from 25.80 down (dimensioned) from the side-button edge across
 * to 82.21, not the full width (a line 1.89 short of the hinge side), its sides straight down until an arc of R49.39
 * (dimensioned) closes it. The arc's centre is on MagSafe's centre column (41.30), not the product's middle (42.05),
 * and 64.42 down, 3.11 below MagSafe's centre: its lowest point scales 113.81 and it crosses x = 20.00 at 108.97 (that
 * centre gives 108.98) and y = 95.00 at 80.09 (80.09). So the arc meets the side-button edge 91.51 down and the zone's
 * right side 92.09 down: neither its width, its centre's column nor its sides' ends fit the family's fields.
 */
export const magsafeZone = {
  from: v(25.8, 'dimensioned', s5('25.80, the zone\'s top, across from the side-button edge')),
  radius: v(49.39, 'dimensioned', s5('R49.39, the arc closing the zone')),
  right: v(82.21, 'scaled', 'sheet 5: the zone\'s right side, crossed on rows 40, 60 and 80 down (the phone\'s hinge-side line beyond it at 84.01)'),
  lowest: v(113.81, 'scaled', 'sheet 5: the arc\'s lowest point, down the 41.30 column'),
};

/**
 * USB-C. The bottom view draws the phone 11.00 thick (0.30 thin: its outlines are likely the frame's, not the glass):
 * the port and the front half's screws are dimensioned 2.825 from the front outline (2X 2.825: where the second
 * instance runs isn't followed here), the holes and the back half's screws 2.670 from the back outline (10X 2.670). Each is
 * taken from its own face of the part.
 */
export const connector = {
  name: 'USB-C' as const,
  width: v(12.45, 'dimensioned', s1('Detail C: 12.45 RECOMMENDED CONNECTOR KEEPOUT (2X R3.30 corners)')),
  thickness: v(6.6, 'dimensioned', s1('Detail C: 6.60 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(41.4, 'derived', s1('Detail C: 42.70, the keepout\'s centre from the hinge edge (the port\'s ends 38.42 and 46.99 centre on 42.705): 84.10 - 42.70 from the side-button edge (the back view\'s 41.40)')),
  fromBack: v(8.475, 'derived', s1('bottom view and Detail C: 2X 2.825, from the front outline to the port\'s centre line: 11.30 - 2.825')),
  outward: v(14.0, 'dimensioned', s1('Detail C: MATING CONNECTOR KEEPOUT AREA FLUSH TO PRODUCT SURFACE REQUIRED OUTWARD 14.0 mm')),
};

/**
 * The outer display. Its offsets don't close with its sizes: 4.13 + 77.17 + 2.71 = 84.01 across and 2.71 + 112.28 +
 * 2.71 = 117.70 down, against 84.10 and 117.80. The front view draws the offsets (measured 4.14, 2.73, 2.72 and 2.72),
 * so its active area scales 77.23 x 112.36, each within the lines' 0.17 width of the printed sizes. The builder centres
 * it across: here the printed 77.17, which puts its hinge edge 3.47 in (drawn 4.13) and its far edge 3.47 in (drawn
 * 2.71). Its corners: R9.66 at the two away from the hinge (the radius used), about R1 at the hinge
 * (notBuilt.hingeDisplayRadius). The front camera, a punch hole, isn't drawn (notBuilt.frontCamera). The receiver
 * (Detail A: 13.14 long, 0.25 from the top) lies on the top edge's rounding (the flat starts 2.74 in), and isn't drawn.
 */
export const front = {
  activeWidth: v(77.17, 'dimensioned', s1('front view: 77.17 DISPLAY ACTIVE AREA')),
  activeLength: v(112.28, 'dimensioned', s1('front view: 112.28 DISPLAY ACTIVE AREA')),
  activeFromEdge: v(2.71, 'dimensioned', s1('front view: 2.71 ALL AROUND, EXTERIOR OF HOUSING TO DISPLAY ACTIVE AREA (the hinge side 4.13, EXTERIOR OF HINGE TO DISPLAY ACTIVE AREA)')),
  activeRadius: v(9.66, 'scaled', 'front view: the active area\'s top-right and bottom-right corners (away from the hinge) crossed on their diagonals from (81.37, 2.72) and (81.37, 115.08); the first line in from the corner is the active area, 0.35 inside it the case occlusion line, outside it the glass'),
};

export const buttons = {
  /** Touch ID (sheet 2, Detail L: its keepout 18.67 x (5.67), measured from the surface: not modelled). */
  side: {
    side: 'side' as const,
    centre: v(42.87, 'dimensioned', s1('right side view: 42.87 (the side button)')),
    half: v(9.34, 'dimensioned', s1('right side view: 2X 9.34 (centre to each end)')),
    width: v(3.06, 'dimensioned', s1('right side view: 3.06 (across the thickness)')),
    fromBack: v(2.67, 'dimensioned', s1('right side view: 2X 2.670, from the buttons\' centre line to the back plate: both on the back half')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 SIDE BUTTON')),
    note: 'the side button, with Touch ID',
  },
  /**
   * Camera Control stands 0.075 proud (the front view), so it's built as a button, not the builder's flush Camera
   * Control with a chamfer (the drawing gives no chamfer). Its keepouts (sheet 2) are in notBuilt.
   */
  cameraControl: {
    side: 'side' as const,
    centre: v(84.97, 'dimensioned', s1('right side view: 84.97 (Camera Control)')),
    half: v(8.55, 'dimensioned', s1('right side view: 2X 8.55')),
    width: v(2.53, 'dimensioned', s1('right side view: 2.53')),
    fromBack: v(2.67, 'dimensioned', s1('right side view: 2X 2.670')),
    proud: v(0.075, 'dimensioned', s1('front view: 0.075 CAMERA CONTROL')),
    note: 'Camera Control, 0.075 proud',
  },
};

/**
 * The bottom edge, from the hinge edge (the bottom view's 0.00): two groups of four Ø1.53 holes on the 2.255 pitch
 * (bottom mic and three more; bottom mic and three speaker ports), dimensioned to their centres (measure.ts), and the
 * back half's two screws, all on one line 2.670 from the back; the port in the front half. The front half's two screws
 * (the same 35.35 and 50.04, on the port's line) aren't drawn: the builder takes one row (notBuilt.frontScrews).
 */
export const bottom = {
  holes: [17.78, 20.03, 22.29, 24.54, 60.85, 63.1, 65.36, 67.61].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (8X Ø1.53 PORTS: bottom mics and speaker ports)`))),
  holeDiameter: v(1.53, 'dimensioned', s1('bottom view: 8X Ø1.53 PORTS')),
  holesFromBack: v(2.67, 'dimensioned', s1('bottom view: 10X 2.670, from the back outline to the holes\' and back screws\' centre line')),
  holeDepth: v(0.6, 'assumed', 'a hole\'s depth for a render: the drawing gives none'),
  screws: [35.35, 50.04].map((mm) => v(mm, 'dimensioned', s1(`bottom view: 2x ${mm.toFixed(2)} (4X Ø1.50 SCREW: the back half's pair)`))),
  screwDiameter: v(1.5, 'dimensioned', s1('bottom view: 4X Ø1.50 SCREW')),
  screwsFromBack: v(2.67, 'dimensioned', s1('bottom view: 10X 2.670')),
  portFrom: v(38.42, 'dimensioned', s1('bottom view: 38.42 (the port\'s near end)')),
  portTo: v(46.99, 'dimensioned', s1('bottom view: 46.99 (its far end: 8.57 long; Detail C\'s 8.59)')),
  portHeight: v(2.6, 'scaled', 'bottom view: the port\'s outline across the thickness down its middle column, its lines\' middles; no dimension gives it'),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none'),
};

/** What the drawing gives that the builder can't take (or isn't the folded part's), kept with its source. */
export const notBuilt = {
  hingeCorner: v(1.0, 'inferred', s1('Detail AY: HINGE CORNER PROFILE, the hinge corners (labels 0.00 to 3.03 across, 0.00 to -3.72 down; two curves, the spine\'s and the half\'s behind it): about R1 against Detail A\'s R17; the builder draws Detail A\'s at all four corners')),
  hingeProfile: { from: s1('Detail E: the hinge side\'s profile, one rounded spine across both halves: insets 0.00, 0.01, 0.26, 0.92, 1.80, 1.82, 1.99, 2.34, 2x 2.74 against ±5.65, ±5.62, ±5.43, ±5.09, ±4.71, ±4.09, ±3.92, ±3.32, ±2.46, ±1.56, 0.00; the builder takes one profile all round (Detail B\'s), so it isn\'t used, and its pairing isn\'t settled here') },
  hingeDisplayEdge: v(4.13, 'dimensioned', s1('front view: 4.13 EXTERIOR OF HINGE TO DISPLAY ACTIVE AREA (and 4.16 TO START OF FLAT, 5.23 TO MAX CASE OCCLUSION)')),
  hingeDisplayRadius: v(0.89, 'scaled', 'front view: the active area\'s top-left corner (at the hinge) crossed on its diagonal from (4.14, 2.72)'),
  seam: v(5.48, 'dimensioned', s1('right side view: 2x 5.48 PRODUCT THICKNESS, each half to the seam (11.30 - 2 x 5.48 = 0.34 between); at the top and bottom each half rounds on its own')),
  frontCamera: {
    fromHinge: v(73.39, 'dimensioned', s1('front view: 73.39 (FRONT CAMERA), from the hinge edge')),
    fromTop: v(10.62, 'dimensioned', s1('front view: 10.62')),
    diameter: v(6.07, 'dimensioned', s1('front view: Ø6.07 FRONT CAMERA (a punch hole in the active area; the builder\'s island is centred across)')),
    keepoutCone: v(88.5, 'dimensioned', s3('Section P-P: 88.50° FRONT CAMERA 1, its cone 1.53 FRONT CAMERA KEEPOUT CONE TO OUTER DISPLAY')),
  },
  volumeButtons: {
    down: v(44.35, 'dimensioned', s1('front view: 44.35 (-) VOLUME BUTTON, its centre from the hinge edge, on the top edge')),
    up: v(57.73, 'dimensioned', s1('front view: 57.73 (+) VOLUME BUTTON')),
    length: v(10.88, 'dimensioned', s1('front view: 2x 10.88')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (each)')),
  },
  frontScrews: v(2.825, 'dimensioned', s1('bottom view: 2x 35.35 and 2x 50.04, the front half\'s pair on the port\'s line, 2.825 from the front outline')),
  cameraControlKeepout: {
    length: v(25.0, 'dimensioned', s2('Detail H: (25.00) CAMERA CONTROL KEEPOUT MEASURED FROM SURFACE (4X R1.00)')),
    halfWidth: v(2.45, 'dimensioned', s2('Detail H: 2x 2.45 CAMERA CONTROL KEEPOUT MEASURED FROM SURFACE, each from the centre line')),
  },
  taptic: { from: s5('TAPTIC ENGINE KEEPOUT: 44.05 to 70.93 across, 98.87 to 110.14 down (keep clear of magnetic or permeable material except MagSafe magnets)') },
  open: { from: 'sheet 4: the inner display, open (164.60 wide); sheet 7: the fold angles. The part is the phone folded shut' },
};

export const mass = v(254, 'spec', 'Weight: 8.96 ounces (254 grams)');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '4:3, the shape of the Fusion\'s 24MP default and 12MP stills; 4032 x 3024 is the usual 12MP size, not on the spec page' };

export const phone: Phone = {
  part: {
    title: 'iPhone Duo',
    name: 'iphone-duo.dat',
    keywords: ['Apple', 'iPhone Duo', 'phone', 'smartphone', 'foldable', 'camera', 'non-LEGO'],
    history: [['2026-10-31', 'Built from Apple\'s dimensional drawing, folded: body, plateau (as a bump), cameras, flash, rear mic, side button, Camera Control, USB-C']],
    drawn: '2026-09-09',
    folder: 'iphone-duo',
  },
  details: { corner: 'Detail A', edge: 'Detail B', back: 'Detail D', port: 'Detail C' },
  body,
  bump,
  cameras,
  cameraIdentity: identity,
  flash,
  rearMic,
  magsafe,
  connector,
  front,
  buttons,
  bottom,
  mass,
  image,
};
