// iPhone 12 Pro, read from Apple's dimensional drawing (iphone/drawings/iphone-12-pro.pdf, sheets 1 and 2,
// dated 10/13/20). Every number carries where it came from and how we know it (src/provenance.ts): spec here is
// Apple's technical specifications page (support.apple.com/111875); scaled values are re-measured by measure.ts.
//
// Sheet 1 is the iPhone 12's (../iphone-12) view for view and, outside Detail D and the port, number for number: the
// body, Detail A (the corner and the receiver inside the notch), Detail B (the edge profile), the front view, both
// side views and the bottom holes. What differs: Detail D (three cameras, a bump 33.32 x 35.50 drawn at a larger
// scale, the flash and a rear mic), the bump's heights (0.94, 1.72), the port's outline (31.38 to 40.14 by 3.01)
// and the mass. Sheet 2 (drawn turned a quarter) gives the keepout cones (Sections F-F, G-G and H-H), Detail J the
// LiDAR scanner ("rear camera 4"), and its right-hand back view MagSafe's keepouts (the 12's, number for number). Coordinates on the back follow Detail D: `fromSide` from the side-button edge (the left
// edge in a back view), `fromTop` from the top edge. Depths from the back glass outward, or from the front face inward,
// as the drawing measures them.
import type { Phone } from '../../drawing.ts';
import type { Calibration, Region } from '../../../src/raster.ts';
import { v, type Kind } from '../../../src/provenance.ts';

/**
 * Where the scaled values were measured, each region of sheet 1 (PDF page 2) with the calibration measure.ts finds for
 * it: Detail D at 1200 dpi (the camera centres calibrate it; drawn at 63.25 px/mm, larger than the 12's 57.49), the
 * front view (its outer edges), the bottom view (its outer edges and outlines). Both are the 12's views, drawn 0.17 in
 * (200 px at 1200 dpi) further right on the sheet. The receiver is dimensioned (Detail A), so it isn't scaled.
 */
export const detailD: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 15300, y: 1900, width: 3000, height: 3000 }, pxPerMm: 63.25, origin: [495.6, 401.7] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5700, y: 5150, width: 2050, height: 3775 }, pxPerMm: 23.0, origin: [191.5, 184] };
export const bottomView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5700, y: 10600, width: 2050, height: 500 }, pxPerMm: 23.0, origin: [191.5, 256.75] };

/**
 * Sheet 2 (PDF page 3) is drawn a quarter turn anticlockwise on its page, as the 12's: these regions are crops of the
 * page as it is, their calibrations in the crop turned upright (a quarter turn anticlockwise, measure.ts's `upright`:
 * the crop's right edge becomes its top). Section G-G through the flash at 1800 dpi, its scale from the cover glass's
 * face (the section's left edge, `origin` across; down has no datum) to the 11.29 extension line; and the MagSafe view
 * (the right-hand back view) at 2400 dpi, calibrated on its extension lines (0.00 and 65.26 across above the phone,
 * 0.00 and -107.42 down left of it). measure.ts checks both calibrations and reads the keepouts' geometry from them.
 */
export const sectionGG: Region & Calibration = { page: 3, dpi: 1800, crop: { x: 17400, y: 12500, width: 3000, height: 1800 }, pxPerMm: 55.0, origin: [272.5, 0] };
export const magsafeView: Region & Calibration = { page: 3, dpi: 2400, crop: { x: 13184, y: 14168, width: 8000, height: 4200 }, pxPerMm: 36.64, origin: [647, 1457] };

const s1 = (what: string) => `sheet 1, ${what}`;
const s2 = (what: string) => `sheet 2, ${what}`;

export const body = {
  width: v(71.52, 'dimensioned', s1('front view: 71.52 PRODUCT WIDTH')),
  length: v(146.71, 'dimensioned', s1('front view: 146.71 PRODUCT LENGTH')),
  thickness: v(7.39, 'dimensioned', s1('right side view: 7.39 PRODUCT THICKNESS')),
  glassWidth: v(69.42, 'dimensioned', s1('front view: 69.42 GLASS')),
  glassLength: v(144.61, 'dimensioned', s1('front view: 144.61 GLASS')),
  /**
   * The plan-view corner, (along the top edge, down the side) from the corner: Detail A's crosses on the outer line,
   * each label's leader followed to its cross (the 12's, number for number).
   */
  corner: {
    points: [
      [14.64, 0],
      [10.59, 0.13],
      [6.66, 1.07],
      [3.31, 3.31],
      [1.07, 6.66],
      [0.13, 10.59],
      [0, 14.64],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail A: CORNER PROFILE (ALL FOUR CORNERS); 0.00, 0.13, 1.07, 3.31, 6.66, 10.59, 14.64 each way, paired by the crosses the leaders reach (symmetric about the diagonal)'),
  },
  /** The edge profile, (inset from the outermost side, half-height from mid-plane): Detail B, from its 0.00 datum. */
  edge: {
    points: [
      [0, 2.5],
      [0.01, 2.94],
      [0.15, 3.36],
      [0.51, 3.59],
      [0.95, 3.62],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail B: PROFILE (ALL SIDES), symmetric about the mid-plane; ±2.50, ±2.94, ±3.36, ±3.59, ±3.62 paired in order with 0.00, 2X 0.01, 2X 0.15, 2X 0.51, 2X 0.95 (the 12\'s, number for number)'),
  },
};

/**
 * Not read by the builder: the front view's "1.15 ALL AROUND, EXTERIOR OF HOUSING TO START OF FLAT AREA ON TOP SIDE OF
 * PRODUCT" (the 12's sheet has it too, as "HOUSING SPLINE TO START OF FLAT AREA"). Detail B's profile reaches its top
 * (3.62) at 0.95 in; the 0.20 between them isn't explained by the drawing. The part follows Detail B.
 */
export const flatFrom = v(1.15, 'dimensioned', s1('front view: 1.15 ALL AROUND, EXTERIOR OF HOUSING TO START OF FLAT AREA ON TOP SIDE OF PRODUCT'));

/**
 * Detail D: two rounded rectangles round the cameras, the outline (2.12 in) and the top (4.62 in), concentric (their
 * corner radii differ by the 2.50 between them). The heavy line outside the outline is the back glass's edge.
 */
export const bump = {
  top: v(0.94, 'dimensioned', s1('right side view: 0.94 BACK GLASS TO CAMERA PLATEAU (the inner line: the bump\'s flat top)')),
  rings: v(1.72, 'dimensioned', s1('right side view: 3X 1.72 BACK GLASS TO REAR CAMERA GLASS (the outermost line; all three cameras)')),
  baseFrom: v(2.12, 'dimensioned', s1('Detail D: 2.12 (across) and -2.12 (down)')),
  baseSize: v(33.32, 'derived', s1('Detail D: 35.44 - 2.12, across')),
  baseHeight: v(35.5, 'derived', s1('Detail D: -37.62 - -2.12, down (the bump is 2.18 taller than wide)')),
  baseRadius: v(10.3, 'scaled', 'Detail D: the outline\'s corners crossed on their diagonals, 10.28 to 10.34 at all four (each diagonal also crosses the top\'s 4.62 and 32.94 lines\' crossing, 2.50 in, which reads 8.55)'),
  topFrom: v(4.62, 'dimensioned', s1('Detail D: 4.62 (across) and -4.62 (down)')),
  topSize: v(28.32, 'derived', s1('Detail D: 32.94 - 4.62, across')),
  topHeight: v(30.49, 'derived', s1('Detail D: -35.11 - -4.62, down')),
  topRadius: v(7.8, 'scaled', 'Detail D: the top\'s corners crossed on their diagonals, 7.80 at all four'),
};

/**
 * Which is which, from sheet 2's keepout cones: camera 1 (upper left) the Main (82°), camera 2 (lower left) the
 * Telephoto (47°), camera 3 (right) the Ultra Wide (130°). Not the 13 Pro's order (its camera 1 is the Telephoto).
 */
export const cameras = {
  main: {
    name: 'rear camera 1',
    label: 'Main',
    fromSide: v(12.16, 'dimensioned', s1('Detail D: 2X 12.16 (rear cameras 1 and 2, across)')),
    fromTop: v(12.16, 'dimensioned', s1('Detail D: -12.16 REAR CAMERA 1')),
    ring: v(12.45, 'dimensioned', s1('Detail D: 3X Ø 12.45 (its leader lands on camera 2\'s outermost circle; the three outermost circles scale alike)')),
    window: v(9.77, 'scaled', 'Detail D: the innermost of the camera\'s circles (a thin one inside the heavy ring)'),
    coneApexFromFront: v(5.51, 'dimensioned', s2('Section F-F: 5.51 REAR CAMERA 1 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(82, 'dimensioned', s2('Section F-F: 82° REAR CAMERA 1 KEEPOUT CONE (F-F runs down the 12.16 column, through cameras 1 and 2)')),
    identity: v(1, 'inferred', 'camera 1 is the Main: its 82° cone encloses a 26 mm equivalent\'s 79.5° diagonal; camera 2\'s 47° a 52 mm equivalent\'s 45.2° (the Telephoto, 2x); camera 3\'s 130° the Ultra Wide\'s 120° (spec)'),
    equivalentFocal: v(26, 'third-party', '26 mm equivalent, widely reported from Apple\'s 2020 launch; not on the spec page'),
    aperture: v(1.6, 'spec', 'Wide: ƒ/1.6 aperture'),
  },
  telephoto: {
    name: 'rear camera 2',
    label: 'Telephoto',
    fromSide: v(12.16, 'dimensioned', s1('Detail D: 2X 12.16 (rear cameras 1 and 2, across)')),
    fromTop: v(27.58, 'dimensioned', s1('Detail D: -27.58 REAR CAMERA 2')),
    ring: v(12.45, 'dimensioned', s1('Detail D: 3X Ø 12.45 (the outermost circle)')),
    window: v(9.77, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(3.13, 'dimensioned', s2('Section F-F: 3.13 REAR CAMERA 2 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(47, 'dimensioned', s2('Section F-F: 47° REAR CAMERA 2 KEEPOUT CONE')),
    equivalentFocal: v(52, 'third-party', '52 mm equivalent (2x the Main), widely reported from Apple\'s 2020 launch; the spec page gives 2x optical zoom in'),
    aperture: v(2.0, 'spec', 'Telephoto: ƒ/2.0 aperture'),
  },
  ultraWide: {
    name: 'rear camera 3',
    label: 'Ultra Wide',
    fromSide: v(25.51, 'dimensioned', s1('Detail D: 2X 25.51 (rear camera 3 and the flash)')),
    fromTop: v(19.87, 'dimensioned', s1('Detail D: -19.87 REAR CAMERA 3')),
    ring: v(12.45, 'dimensioned', s1('Detail D: 3X Ø 12.45 (the outermost circle)')),
    window: v(9.77, 'scaled', 'Detail D: the innermost of the camera\'s circles, as cameras 1 and 2 (at 1200 dpi it merges with the heavy ring 0.01 outside it into one 0.44 wide stroke; at 4800 dpi they separate: measure.ts)'),
    coneApexFromFront: v(6.77, 'dimensioned', s2('Section H-H: 6.77 REAR CAMERA 3 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(130, 'dimensioned', s2('Section H-H: 130° REAR CAMERA 3 KEEPOUT CONE (H-H runs down the 25.51 column, through camera 3 and the LiDAR)')),
    fov: v(120, 'spec', 'Ultra Wide: ƒ/2.4 aperture and 120° field of view'),
    aperture: v(2.4, 'spec', 'Ultra Wide: ƒ/2.4'),
  },
};

/** On the bump's top (6.03 to 12.31 down, inside the top's 4.62). Sheet 2's Section G-G gives its two keepout cones (`flashKeepout`, in features.json). */
export const flash = {
  fromSide: v(25.51, 'dimensioned', s1('Detail D: 2X 25.51 (the flash and rear camera 3)')),
  fromTop: v(9.17, 'dimensioned', s1('Detail D: -9.17 FLASH')),
  diameter: v(6.28, 'dimensioned', s1('Detail D: Ø 6.28 (its leader lands on the flash\'s circle)')),
};

/**
 * The flash's keepout (Section G-G, cut down the 25.51 line with H-H: Detail J's G and H arrows), in features.json. The
 * section's left edge is the cover glass (the front face): both dimensions' arrows start there. The 7.03's other arrow
 * lands on a short extension line 0.36 below the back glass (7.39), where the inner cone's two lines, followed down
 * past the bump's face, cross: its apex (the "origin"). The 11.29's extension line runs up to the inner cone's kinks into
 * the outer, 2.96 above the bump's top (8.33). Hand calculation: at the bump's top the inner cone is 2 x (8.33 - 7.03) x
 * tan(67.5°) = Ø6.28 across, the flash's Ø6.28: the cone leaves the phone at the flash's edge. measure.ts fits the
 * drawn lines and checks each of these.
 */
export const flashKeepout = {
  apexFromFront: v(7.03, 'dimensioned', s2('Section G-G: 7.03 FLASH KEEPOUT CONE ORIGIN TO COVER GLASS (its extension line ends at the inner cone\'s apex, 0.36 inside the back glass)')),
  transitionFromFront: v(11.29, 'dimensioned', s2('Section G-G: 11.29 FLASH KEEPOUT CONE TRANSITION TO COVER GLASS (its extension line reaches the inner cone\'s kinks into the outer)')),
  inner: v(135, 'dimensioned', s2('Section G-G: 135° FLASH INNER KEEPOUT CONE')),
  outer: v(157, 'dimensioned', s2('Section G-G: 157° FLASH OUTER KEEPOUT CONE')),
};

/**
 * The rear mic beside the cameras, below camera 3, on the bump's top (inside its top's bottom-right R7.80 corner, 5.09
 * from the corner's centre). Across: the 30.23 extension line rises from below Detail D to the mic's outer circle;
 * down: the -27.38 line leaves the mic to the right. Its Ø1.15 leader lands on the outer of its two circles (2400 dpi).
 * measure.ts finds the drawn circle there. Sections F-F, G-G and H-H run down the 12.16 and 25.51 lines, so none cuts it.
 */
export const rearMic = {
  fromSide: v(30.23, 'dimensioned', s1('Detail D: 30.23 (across: the extension line rising from below the view to the mic)')),
  fromTop: v(27.38, 'dimensioned', s1('Detail D: -27.38 (down: the extension line leaving the mic to the right)')),
  diameter: v(1.15, 'dimensioned', s1('Detail D: 2 Ø 1.15 REAR MIC (the leader on the outer of its two circles)')),
};

/**
 * MagSafe's keepouts (sheet 2, the MagSafe view: the right-hand back view), every number the 12's. The clear area (5:
 * DO NOT OBSTRUCT THIS AREA WITH METAL, CONDUCTIVE MATERIAL OR MAGNETIC MATERIAL) is a whole Ø57.50 circle round the
 * product centre, 7.01 inside each edge. The magnetic zone (5 7: DO NOT OBSTRUCT THIS AREA WITH MAGNETIC OR PERMEABLE
 * MATERIAL EXCEPT MAGSAFE MAGNETS) is the 16's shape: the full width from -40.12 down, straight-sided to -107.42, closed
 * by an R49.39 arc through those corners, whose centre (derived: 107.42 - √(49.39² - 35.76²) = 73.35 down) is the
 * product centre, as on the 12 (the 16's isn't). Here the zone's top is 2.50 below the bump's bottom (-37.62); on the
 * 12, whose bump is shorter, 3.82: the shared numbers fit this bump's outline (inferred: the camera corner's 35.44 is
 * Detail D's 35.44 too).
 */
export const magsafe = {
  fromSide: v(35.76, 'dimensioned', s2('MagSafe view: 35.76 PRODUCT CENTER')),
  fromTop: v(73.35, 'dimensioned', s2('MagSafe view: -73.35 PRODUCT CENTER')),
  diameter: v(57.5, 'dimensioned', s2('MagSafe view: Ø 57.50 (its leader on the clear area\'s circle; measure.ts fits the circle round the product centre)')),
  zoneFrom: v(40.12, 'dimensioned', s2('MagSafe view: -40.12, the zone\'s top edge, the full width (the camera corner\'s keepout\'s bottom)')),
  zoneSidesTo: v(107.42, 'dimensioned', s2('MagSafe view: 2X -107.42, where the zone\'s sides (the phone\'s) meet its arc')),
  zoneRadius: v(49.39, 'dimensioned', s2('MagSafe view: R 49.39, the arc closing the zone below')),
};

/**
 * What the MagSafe view gives beyond the family's fields (not built, not in features.json):
 * - above the zone, the camera corner (0.00 to 35.44 across, 0.00 to -40.12 down, crosshatched): DO NOT OBSTRUCT THIS
 *   AREA WITH MAGNETIC OR PERMEABLE MATERIAL (FULL PRODUCT VOLUME INCLUDING SIDE WALLS); the rest of the top (35.44 to
 *   the far edge) carries no keepout but the compass;
 * - the COMPASS, a small crosshatched circle centred 65.26 across, -11.09 down (its size not dimensioned).
 * Sheet 2's middle back view and its side view give other keepouts (metal and conductive material: the top and bottom
 * bands, the side band, the area beside the bump), not recorded here.
 */
export const magsafeExtras = {
  cameraZone: { across: v(35.44, 'dimensioned', s2('MagSafe view: 35.44, the camera corner\'s keepout, its edge')), down: v(40.12, 'dimensioned', s2('MagSafe view: -40.12, its bottom (the zone\'s top)')) },
  compass: { fromSide: v(65.26, 'dimensioned', s2('MagSafe view: 65.26 COMPASS')), fromTop: v(11.09, 'dimensioned', s2('MagSafe view: -11.09 COMPASS')) },
};

/**
 * The LiDAR scanner, "rear camera 4": not drawn in Detail D; sheet 2's Detail J gives the base of its keepout cone on
 * the plateau, a 4.55 x 7.55 rounded rectangle with R1.96 corners, centred on the 25.51 line (H-H) 30.45 down.
 */
export const sensor = {
  name: 'LiDAR scanner',
  fromSide: v(25.51, 'dimensioned', s2('Detail J: on the 25.51 line (Section H-H through camera 3 and rear camera 4)')),
  fromTop: v(30.45, 'dimensioned', s2('Detail J: -30.45 (REAR CAMERA 4, BASE OF KEEPOUT CONE CONTACTING PLATEAU SURFACE)')),
  keepoutCone: v(80, 'dimensioned', s2('Section H-H: 80° REAR CAMERA 4 KEEPOUT CONE')),
  window: {
    width: v(4.55, 'dimensioned', s2('Detail J: 4.55 (extension lines on both sides)')),
    length: v(7.55, 'dimensioned', s2('Detail J: 7.55')),
    radius: v(1.96, 'dimensioned', s2('Detail J: 4X R 1.96')),
  },
};

export const lightning = {
  name: 'Lightning' as const,
  width: v(13.65, 'dimensioned', s1('Detail C: 13.65 RECOMMENDED CONNECTOR KEEPOUT (2X R 3.40 corners)')),
  thickness: v(6.85, 'dimensioned', s1('Detail C: 6.85 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(35.76, 'dimensioned', s1('Detail C: 35.76 (the port\'s centre, from the side-button edge)')),
  fromBack: v(3.67, 'dimensioned', s1('Detail C: 3.67, the port\'s centre line to the back (the bump\'s side of the view); the bottom view says 3.69 for the holes, as the 12\'s sheet does')),
  outward: v(14.0, 'dimensioned', s1('Detail C: MATING CONNECTOR KEEPOUT AREA FLUSH TO PRODUCT SURFACE REQUIRED OUTWARD 14.0 mm')),
};

export const front = {
  activeWidth: v(64.58, 'dimensioned', s1('front view: 64.58 DISPLAY ACTIVE AREA')),
  activeLength: v(139.77, 'dimensioned', s1('front view: 139.77 DISPLAY ACTIVE AREA')),
  activeFromEdge: v(3.47, 'dimensioned', s1('front view: 3.47 ALL AROUND, EXTERIOR OF HOUSING TO DISPLAY ACTIVE AREA')),
  activeRadius: v(7.83, 'scaled', 'front view: the active area\'s corners crossed on their diagonals'),
  notchWidth: v(34.83, 'dimensioned', s1('front view: 34.83 ACTIVE AREA CUTOUT (wall to wall)')),
  notchDepth: v(5.3, 'dimensioned', s1('front view: 5.30 ACTIVE AREA CUTOUT; its arrows land on the active area\'s top (the 3.47 line) and the cutout\'s bottom, as the 12\'s')),
  notchTopRadius: v(0.95, 'dimensioned', s1('front view: 2X R 0.95')),
  notchBottomRadius: v(3.8, 'dimensioned', s1('front view: 2X R 3.80')),
  /** Inside the notch: Detail A draws one heavy outline (with a dashed line inside it) and dimensions it. */
  receiverLength: v(7.84, 'dimensioned', s1('Detail A: 7.84 (the receiver\'s outline, end to end; centred on the 35.76 line)')),
  receiverHeight: v(1.38, 'dimensioned', s1('Detail A: 1.38 (the outline across)')),
  receiverFromTop: v(5.47, 'dimensioned', s1('Detail A: -5.47 (the receiver\'s centre line, from the 0.00 outer line)')),
  receiverDepth: v(0.3, 'assumed', 'the slot\'s depth for a render: the drawing gives none'),
};

/**
 * The buttons on the long sides, sheet 1 side views and front view (the 12's numbers). `half` is from the centre to an
 * end (2X 2.85, 4X 5.65, 2X 8.90 land on an end and the centre line); `width` runs across the thickness.
 */
export const buttons = {
  ringSilent: {
    side: 'volume' as const,
    centre: v(25.99, 'dimensioned', s1('left side view: 25.99 POCKET CENTER')),
    half: v(2.85, 'dimensioned', s1('left side view: 2X 2.85 (centre to each end of the pocket)')),
    width: v(2.12, 'dimensioned', s1('left side view: 2.12 (the pocket across the thickness)')),
    fromBack: v(3.69, 'dimensioned', s1('left side view: 3.69 POCKET CENTER, from the back\'s line (the bump\'s side)')),
    proud: v(0.6, 'dimensioned', s1('front view: 0.60 RING/SILENT SWITCH')),
    note: 'the switch sits in a 5.70 x 2.12 pocket; modelled as a block of the pocket\'s size standing 0.60 proud',
  },
  volumeUp: {
    side: 'volume' as const,
    centre: v(39.31, 'dimensioned', s1('left side view: 39.31 (+) VOLUME BUTTON')),
    half: v(5.65, 'dimensioned', s1('left side view: 4X 5.65')),
    width: v(2.76, 'dimensioned', s1('left side view: 2X 2.76')),
    fromBack: v(3.69, 'dimensioned', s1('left side view: 2X 3.69, from the back\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (+) VOLUME BUTTON')),
    note: '',
  },
  volumeDown: {
    side: 'volume' as const,
    centre: v(53.31, 'dimensioned', s1('left side view: 53.31 (-) VOLUME BUTTON')),
    half: v(5.65, 'dimensioned', s1('left side view: 4X 5.65')),
    width: v(2.76, 'dimensioned', s1('left side view: 2X 2.76')),
    fromBack: v(3.69, 'dimensioned', s1('left side view: 2X 3.69, from the back\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (-) VOLUME BUTTON')),
    note: '',
  },
  side: {
    side: 'side' as const,
    centre: v(46.31, 'dimensioned', s1('right side view: 46.31 SIDE BUTTON')),
    half: v(8.9, 'dimensioned', s1('right side view: 2X 8.90')),
    width: v(2.76, 'dimensioned', s1('right side view: 2.76')),
    fromBack: v(3.69, 'dimensioned', s1('right side view: 3.69, from the button\'s centre line to the back\'s line (its arrow lands on the bump\'s side; the 12 read its as from the front, 3.70 from the back)')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 SIDE BUTTON')),
    note: '',
  },
};

/**
 * The SIM tray, left side view. As on the 12's sheet, no depth is given: its 1.33 runs from the tray's edge to its
 * centre line (half its 2.66), and that line is drawn at mid-thickness.
 */
export const simTray = {
  centre: v(111.88, 'dimensioned', s1('left side view: 111.88 (to the tray\'s centre line)')),
  length: v(16.04, 'derived', s1('left side view: 2X 8.02, centre to each end')),
  width: v(2.66, 'dimensioned', s1('left side view: 2.66 (and 1.33, the edge to its centre line)')),
  fromBack: v(3.695, 'inferred', 'left side view: the tray\'s centre line is drawn at mid-thickness (7.39 / 2); the sheet dimensions it only from the tray\'s edge (1.33)'),
};

/**
 * The bottom edge, from the volume-button edge (the 12's holes and screws). Each group's end holes are dimensioned to
 * their outer edges: 19.18 and 25.14 bound the three left of the port, 46.38 and 56.85 the five right of it. A hole's
 * centre is half its 1.45 inside; the holes between are evenly spaced, as drawn (2.255 apart in both groups).
 */
const R = 1.45 / 2;
const group = (from: number, to: number, n: number, which: string) => {
  const [a, b] = [from + R, to - R];
  return Array.from({ length: n }, (_, i) => {
    const mm = +(a + ((b - a) * i) / (n - 1)).toFixed(3);
    const how = i === 0 ? `${from} + 0.725: ${from} lands on the hole's outer edge` : i === n - 1 ? `${to} - 0.725: ${to} lands on the hole's outer edge` : `evenly between, as drawn`;
    return v(mm, i === 0 || i === n - 1 ? 'derived' : 'inferred', s1(`bottom view, the ${which} group (8X Ø 1.45 PORTS): ${how}`));
  });
};

export const bottom = {
  holes: [...group(19.18, 25.14, 3, 'left'), ...group(46.38, 56.85, 5, 'right')],
  holeDiameter: v(1.45, 'dimensioned', s1('bottom view: 8X Ø 1.45 PORTS')),
  holesFromBack: v(3.69, 'dimensioned', s1('bottom view: 3.69, the holes\' centre line to the back\'s line')),
  holeDepth: v(0.6, 'assumed', 'a mic or speaker hole\'s depth for a render: the drawing gives none'),
  screws: [29.37, 42.16].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (2X Ø 1.50 SCREW; centres, 6.39 and 6.40 either side of the port's 35.76)`))),
  screwDiameter: v(1.5, 'dimensioned', s1('bottom view: 2X Ø 1.50 SCREW')),
  screwsFromBack: v(3.69, 'inferred', 'Detail C draws the screws on the holes\' centre line'),
  portFrom: v(31.38, 'dimensioned', s1('bottom view: 31.38 (the Lightning port\'s near end; the 12\'s 31.54)')),
  portTo: v(40.14, 'dimensioned', s1('bottom view: 40.14 (its far end; centre 35.76, as Detail C\'s; the 12\'s 39.99)')),
  portHeight: v(3.01, 'dimensioned', s1('Detail C: 3.01 (the port\'s outline across the thickness: its extension lines touch the heavy outline\'s outer edges; the 12\'s 2.70); its ends round (inferred)')),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none'),
};

export const mass = v(189, 'spec', 'Weight: 6.66 ounces (189 grams)');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '12MP (spec); 4032 x 3024 is the usual 4:3 still size, not on the spec page' };

/** Everything above, as the family's builder (iphone/part.ts) reads it. */
export const phone: Phone = {
  part: {
    title: 'iPhone 12 Pro',
    name: 'iphone-12-pro.dat',
    keywords: ['Apple', 'iPhone 12 Pro', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [['2026-10-31', 'Built from Apple\'s dimensional drawing: body, cameras, LiDAR, buttons, ports, notch']],
    drawn: '10/13/20',
    folder: 'iphone-12-pro',
  },
  details: { corner: 'Detail A', edge: 'Detail B', back: 'Detail D', port: 'Detail C' },
  body,
  bump,
  cameras,
  cameraIdentity: cameras.main.identity,
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
