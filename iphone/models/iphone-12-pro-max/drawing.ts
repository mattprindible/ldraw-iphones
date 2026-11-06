// iPhone 12 Pro Max, read from Apple's dimensional drawing (iphone/drawings/iphone-12-pro-max.pdf, sheets 1
// and 2, dated 10/13/20). Every number carries where it came from and how we know it (src/provenance.ts): spec here is
// Apple's technical specifications page (support.apple.com/111874); scaled values are re-measured by measure.ts.
//
// Sheet 1 is the iPhone 12 Pro's (../iphone-12-pro) view for view: the same thickness, edge profile, notch, receiver,
// port and buttons' sizes, each placed for the bigger body (78.07 x 160.84). What differs: the body and glass, Detail
// A's corner (0.14 ... 15.96), Detail D (a bump 38.48 x 40.93 round three Ø14.11 cameras, the flash and a rear mic, in
// the 13 Pro Max's positions: 13.43, 28.56), the bump's heights (1.26, 2.79), the buttons' and holes' positions (four
// holes left of the port, six right) and the mass. Sheet 2 (drawn turned a quarter) gives the keepout cones (Sections
// F-F, G-G, H-H), Detail J the LiDAR scanner ("rear camera 4"), and its right-hand back view MagSafe's keepouts. Its F-F reverses the 12 Pro's order: camera 1 here
// is the Telephoto (39°), camera 2 the Main (82°). Coordinates on the back follow Detail D: `fromSide` from the
// side-button edge (the left edge in a back view), `fromTop` from the top edge. Depths from the back glass outward, or
// from the front face inward, as the drawing measures them.
import type { Phone } from '../../drawing.ts';
import type { Calibration, Region } from '../../../src/raster.ts';
import { v, type Kind } from '../../../src/provenance.ts';

/**
 * Where the scaled values were measured, each region of sheet 1 (PDF page 2) with the calibration measure.ts finds for
 * it: Detail D at 1200 dpi (the camera centres calibrate it: 57.52 px/mm), the front view (its outer edges, 23.00
 * px/mm), the bottom view (its outer edges and outlines). The front view has Detail A's dashed callout box 1.07 above
 * the phone's top (LEARNINGS: taken for the top edge once); the calibration's top is the product edge below it.
 */
export const detailD: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 15300, y: 1800, width: 3000, height: 3000 }, pxPerMm: 57.52, origin: [230.1, 192.1] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5350, y: 5150, width: 2150, height: 4100 }, pxPerMm: 23.0, origin: [184.5, 188.5] };
export const bottomView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5350, y: 10600, width: 2150, height: 500 }, pxPerMm: 23.0, origin: [185, 244.25] };

/**
 * Sheet 2 (PDF page 3) is drawn a quarter turn anticlockwise on its page, as the 12 Pro's: these regions are crops of
 * the page as it is, their calibrations in the crop turned upright (a quarter turn anticlockwise, measure.ts's
 * `upright`: the crop's right edge becomes its top). Section G-G through the flash at 1800 dpi, its scale from the
 * cover glass's face (the section's left edge, `origin` across; down has no datum) to the 11.62 extension line; and the
 * MagSafe view (the right-hand back view) at 2400 dpi, calibrated on its extension lines (0.00 and 72.40 across above
 * the phone, 0.00 and -110.68 down left of it). measure.ts checks both calibrations and reads the keepouts' geometry.
 */
export const sectionGG: Region & Calibration = { page: 3, dpi: 1800, crop: { x: 17700, y: 12750, width: 3600, height: 1800 }, pxPerMm: 54.95, origin: [192, 0] };
export const magsafeView: Region & Calibration = { page: 3, dpi: 2400, crop: { x: 14776, y: 15120, width: 5864, height: 3480 }, pxPerMm: 36.64, origin: [288, 310.5] };

const s1 = (what: string) => `sheet 1, ${what}`;
const s2 = (what: string) => `sheet 2, ${what}`;

export const body = {
  width: v(78.07, 'dimensioned', s1('front view: 78.07 PRODUCT WIDTH')),
  length: v(160.84, 'dimensioned', s1('front view: 160.84 PRODUCT LENGTH')),
  thickness: v(7.39, 'dimensioned', s1('right side view: 7.39 PRODUCT THICKNESS')),
  glassWidth: v(75.97, 'dimensioned', s1('front view: 75.97 GLASS')),
  glassLength: v(158.74, 'dimensioned', s1('front view: 158.74 GLASS')),
  /**
   * The plan-view corner, (along the top edge, down the side) from the corner: Detail A's crosses on the outer line,
   * each label's leader followed to its cross, paired as the 12 Pro's (symmetric about the diagonal).
   */
  corner: {
    points: [
      [15.96, 0],
      [11.54, 0.14],
      [7.26, 1.16],
      [3.61, 3.61],
      [1.16, 7.26],
      [0.14, 11.54],
      [0, 15.96],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail A: CORNER PROFILE (ALL FOUR CORNERS); 0.00, 0.14, 1.16, 3.61, 7.26, 11.54, 15.96 each way, paired by the crosses the leaders reach (symmetric about the diagonal)'),
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
    from: s1('Detail B: PROFILE (ALL SIDES), symmetric about the mid-plane; ±2.50, ±2.94, ±3.36, ±3.59, ±3.62 paired in order with 0.00, 2X 0.01, 2X 0.15, 2X 0.51, 2X 0.95 (the 12 Pro\'s, number for number)'),
  },
};

/**
 * Not read by the builder: the front view's "1.15 ALL AROUND, EXTERIOR OF HOUSING TO START OF FLAT AREA ON TOP SIDE OF
 * PRODUCT". Detail B's profile reaches its top (3.62) at 0.95 in; the 0.20 between them isn't explained by the drawing
 * (the 12 Pro's sheet has the same pair). The part follows Detail B.
 */
export const flatFrom = v(1.15, 'dimensioned', s1('front view: 1.15 ALL AROUND, EXTERIOR OF HOUSING TO START OF FLAT AREA ON TOP SIDE OF PRODUCT'));

/**
 * Detail D: two rounded rectangles round the cameras, the outline (1.70 in) and the top (5.06 in), concentric (their
 * corner radii differ by about the 3.36 between them). The heavy line outside the outline is the back glass's edge.
 */
export const bump = {
  top: v(1.26, 'dimensioned', s1('right side view: 1.26 BACK GLASS TO CAMERA PLATEAU (the inner line: the bump\'s flat top)')),
  rings: v(2.79, 'dimensioned', s1('right side view: 3X 2.79 BACK GLASS TO REAR CAMERA GLASS (the outermost line; all three cameras)')),
  baseFrom: v(1.7, 'dimensioned', s1('Detail D: 1.70 (across) and -1.70 (down)')),
  baseSize: v(38.48, 'derived', s1('Detail D: 40.18 - 1.70, across')),
  baseHeight: v(40.93, 'derived', s1('Detail D: -42.63 - -1.70, down (the bump is 2.45 taller than wide)')),
  baseRadius: v(12.0, 'scaled', 'Detail D: the outline\'s corners crossed on their diagonals, 12.02 at all four (from an 11.0 guess too)'),
  topFrom: v(5.06, 'dimensioned', s1('Detail D: 5.06 (across) and -5.06 (down)')),
  topSize: v(31.76, 'derived', s1('Detail D: 36.82 - 5.06, across')),
  topHeight: v(34.21, 'derived', s1('Detail D: -39.27 - -5.06, down')),
  topRadius: v(8.7, 'scaled', 'Detail D: the top\'s corners crossed on their diagonals, 8.69 at all four (from a 7.6 guess too); 3.33 less than the outline\'s, about the 3.36 between them'),
};

/**
 * Which is which, from sheet 2's keepout cones: camera 1 (upper left) the Telephoto (39°), camera 2 (lower left) the
 * Main (82°), camera 3 (right) the Ultra Wide (130°). The 13 Pro Max's order, not the 12 Pro's (its camera 1 is the
 * Main). Section F-F runs down the 13.43 column; its upper cone is camera 1 by its labels and by where its apex lies
 * (2.3 times further from the section's top end for the lower cone, as 30.90 / 13.43).
 */
export const cameras = {
  telephoto: {
    name: 'rear camera 1',
    label: 'Telephoto',
    fromSide: v(13.43, 'dimensioned', s1('Detail D: 2X 13.43 (rear cameras 1 and 2, across)')),
    fromTop: v(13.43, 'dimensioned', s1('Detail D: -13.43 REAR CAMERA 1')),
    ring: v(14.11, 'dimensioned', s1('Detail D: 3X Ø 14.11 (its leader lands on camera 2\'s outermost circle; the three outermost circles scale alike)')),
    window: v(10.66, 'scaled', 'Detail D: the innermost of the camera\'s circles (three thin circles inside the outermost: Ø10.66, 11.26, 11.70)'),
    coneApexFromFront: v(1.59, 'dimensioned', s2('Section F-F: 1.59 REAR CAMERA 1 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(39, 'dimensioned', s2('Section F-F: 39° REAR CAMERA 1 KEEPOUT CONE (F-F runs down the 13.43 column, through cameras 1 and 2: Detail J)')),
    identity: v(1, 'inferred', 'camera 1 is the Telephoto: its 39° cone encloses a 65 mm equivalent\'s 36.8° diagonal; camera 2\'s 82° a 26 mm equivalent\'s 79.5° (the Main); camera 3\'s 130° the Ultra Wide\'s 120° (spec)'),
    equivalentFocal: v(65, 'third-party', '65 mm equivalent (2.5x the Main), widely reported from Apple\'s 2020 launch; the spec page gives 2.5x optical zoom in'),
    aperture: v(2.2, 'spec', 'Telephoto: ƒ/2.2 aperture'),
  },
  main: {
    name: 'rear camera 2',
    label: 'Main',
    fromSide: v(13.43, 'dimensioned', s1('Detail D: 2X 13.43 (rear cameras 1 and 2, across)')),
    fromTop: v(30.9, 'dimensioned', s1('Detail D: -30.90 REAR CAMERA 2')),
    ring: v(14.11, 'dimensioned', s1('Detail D: 3X Ø 14.11 (the outermost circle)')),
    window: v(10.66, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(5.91, 'dimensioned', s2('Section F-F: 5.91 REAR CAMERA 2 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(82, 'dimensioned', s2('Section F-F: 82° REAR CAMERA 2 KEEPOUT CONE')),
    equivalentFocal: v(26, 'third-party', '26 mm equivalent, widely reported from Apple\'s 2020 launch; not on the spec page'),
    aperture: v(1.6, 'spec', 'Wide: ƒ/1.6 aperture'),
  },
  ultraWide: {
    name: 'rear camera 3',
    label: 'Ultra Wide',
    fromSide: v(28.56, 'dimensioned', s1('Detail D: 2X 28.56 (rear camera 3 and the flash)')),
    fromTop: v(22.16, 'dimensioned', s1('Detail D: -22.16 REAR CAMERA 3')),
    ring: v(14.11, 'dimensioned', s1('Detail D: 3X Ø 14.11 (the outermost circle)')),
    window: v(10.66, 'scaled', 'Detail D: the innermost of the camera\'s circles, as cameras 1 and 2'),
    coneApexFromFront: v(7.66, 'dimensioned', s2('Section H-H: 7.66 REAR CAMERA 3 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(130, 'dimensioned', s2('Section H-H: 130° REAR CAMERA 3 KEEPOUT CONE (H-H runs down the 28.56 column, through camera 3 and the LiDAR: Detail J)')),
    fov: v(120, 'spec', 'Ultra Wide: ƒ/2.4 aperture, 120° field of view'),
    aperture: v(2.4, 'spec', 'Ultra Wide: ƒ/2.4'),
  },
};

/** On the bump's top (6.97 to 13.25 down, inside the top's 5.06). Sheet 2's Section G-G gives its two keepout cones (`flashKeepout`, in features.json). */
export const flash = {
  fromSide: v(28.56, 'dimensioned', s1('Detail D: 2X 28.56 (the flash and rear camera 3)')),
  fromTop: v(10.11, 'dimensioned', s1('Detail D: -10.11 FLASH')),
  diameter: v(6.28, 'dimensioned', s1('Detail D: Ø 6.28 (its leader lands on the flash\'s circle)')),
};

/**
 * The flash's keepout (Section G-G, cut down the 28.56 line with H-H: Detail J's G and H arrows), in features.json, the
 * 12 Pro's section with this phone's numbers. The section's left edge is the cover glass (the front face): both
 * dimensions' arrows start there. The 7.35's other arrow lands on a short extension line that rises to where the inner
 * cone's two lines cross (its apex, the "origin"), 0.04 inside the back glass (7.39): the cone starts at the back glass.
 * The 11.62's extension line runs up to the lower kink, inner cone into outer, 2.97 above the bump's top (8.65; the 12
 * Pro's 2.96). Hand calculation: at the bump's top the inner cone is 2 x (8.65 - 7.35) x tan(67.5°) = Ø6.28 across,
 * the flash's Ø6.28: the cone leaves the phone at the flash's edge, as on the 12 Pro. measure.ts fits the drawn lines
 * and checks each of these.
 */
export const flashKeepout = {
  apexFromFront: v(7.35, 'dimensioned', s2('Section G-G: 7.35 FLASH KEEPOUT CONE ORIGIN TO COVER GLASS (its extension line ends at the inner cone\'s apex, 0.04 inside the back glass)')),
  transitionFromFront: v(11.62, 'dimensioned', s2('Section G-G: 11.62 FLASH KEEPOUT CONE TRANSITION TO COVER GLASS (its extension line reaches the inner cone\'s kink into the outer)')),
  inner: v(135, 'dimensioned', s2('Section G-G: 135° FLASH INNER KEEPOUT CONE')),
  outer: v(157, 'dimensioned', s2('Section G-G: 157° FLASH OUTER KEEPOUT CONE')),
};

/**
 * The rear mic beside the cameras, below camera 3 and level with camera 2, on the bump's top (inside its top's
 * bottom-right R8.70 corner, 5.58 from the corner's centre). Across: the 33.69 extension line rises from below Detail D
 * to the mic's outer circle; down: the -30.89 line leaves the mic to the right (camera 2's is -30.90, a line of its
 * own). Its Ø1.15 leader lands on the outer of its two circles (4800 dpi; the inner is about Ø0.76). measure.ts finds
 * the drawn circle there. Sections F-F, G-G and H-H run down the 13.43 and 28.56 lines, so none cuts it.
 */
export const rearMic = {
  fromSide: v(33.69, 'dimensioned', s1('Detail D: 33.69 (across: the extension line rising from below the view to the mic)')),
  fromTop: v(30.89, 'dimensioned', s1('Detail D: -30.89 (down: the extension line leaving the mic to the right)')),
  diameter: v(1.15, 'dimensioned', s1('Detail D: 2 Ø 1.15 REAR MIC (the leader on the outer of its two circles)')),
};

/**
 * MagSafe's keepouts (sheet 2, the MagSafe view: the right-hand back view), the 12 Pro's shapes with this phone's
 * numbers. The clear area (5: DO NOT OBSTRUCT THIS AREA WITH METAL, CONDUCTIVE MATERIAL, OR MAGNETIC MATERIAL) is a whole
 * Ø57.50 circle round the product centre (39.04, -80.42: half the 78.07 and the 160.84), 10.29 inside each side. The
 * magnetic zone (5 7: DO NOT OBSTRUCT THIS AREA WITH MAGNETIC OR PERMEABLE MATERIAL EXCEPT MAGSAFE MAGNETS) is the
 * 16's shape: the full width from -47.18 down, straight-sided to -110.68, closed by an R49.39 arc through those corners,
 * whose centre (derived: 110.68 - √(49.39² - 39.035²) = 80.42 down) is the product centre, as on the 12 and 12 Pro (the
 * 16's isn't). The clear circle and the arc are the 12 Pro's (Ø57.50, R49.39); the zone's top is 4.55 below the bump's
 * bottom (-42.63), where the 12 Pro's is 2.50 below its own.
 */
export const magsafe = {
  fromSide: v(39.04, 'dimensioned', s2('MagSafe view: 39.04 PRODUCT CENTER')),
  fromTop: v(80.42, 'dimensioned', s2('MagSafe view: -80.42 PRODUCT CENTER')),
  diameter: v(57.5, 'dimensioned', s2('MagSafe view: Ø 57.50 (its leader on the clear area\'s circle; measure.ts fits the circle round the product centre)')),
  zoneFrom: v(47.18, 'dimensioned', s2('MagSafe view: -47.18, the zone\'s top edge, the full width (the camera corner\'s keepout\'s bottom)')),
  zoneSidesTo: v(110.68, 'dimensioned', s2('MagSafe view: 2X -110.68, where the zone\'s sides (the phone\'s) meet its arc')),
  zoneRadius: v(49.39, 'dimensioned', s2('MagSafe view: R 49.39, the arc closing the zone below')),
};

/**
 * What the MagSafe view gives beyond the family's fields (not built, not in features.json):
 * - above the zone, the camera corner (0.00 to 40.18 across, 0.00 to -47.18 down, crosshatched): DO NOT OBSTRUCT THIS
 *   AREA WITH MAGNETIC OR PERMEABLE MATERIAL (FULL PRODUCT VOLUME INCLUDING SIDE WALLS). Its 40.18 is Detail D's bump
 *   outline's far side; the rest of the top (40.18 to the far edge) carries no keepout but the compass;
 * - the COMPASS, a small crosshatched circle centred 72.40 across, -12.09 down (its size not dimensioned).
 * Sheet 2's middle back view and its side view give other keepouts (metal and conductive material: the top and bottom
 * bands, the side band, the area beside the bump), not recorded here.
 */
export const magsafeExtras = {
  cameraZone: { across: v(40.18, 'dimensioned', s2('MagSafe view: 40.18, the camera corner\'s keepout, its edge')), down: v(47.18, 'dimensioned', s2('MagSafe view: -47.18, its bottom (the zone\'s top)')) },
  compass: { fromSide: v(72.4, 'dimensioned', s2('MagSafe view: 72.40 COMPASS')), fromTop: v(12.09, 'dimensioned', s2('MagSafe view: -12.09 COMPASS')) },
};

/**
 * The LiDAR scanner, "rear camera 4": not drawn in Detail D; sheet 2's Detail J gives the base of its keepout cone on
 * the plateau, a 5.09 x 8.09 rounded rectangle with R2.23 corners, centred on the 28.56 line (H-H) 34.17 down.
 */
export const sensor = {
  name: 'LiDAR scanner',
  fromSide: v(28.56, 'dimensioned', s2('Detail J: on the 28.56 line (Sections G-G and H-H through the flash, camera 3 and rear camera 4)')),
  fromTop: v(34.17, 'dimensioned', s2('Detail J: -34.17 (REAR CAMERA 4, BASE OF KEEPOUT CONE CONTACTING PLATEAU SURFACE)')),
  keepoutCone: v(80, 'dimensioned', s2('Section H-H: 80° REAR CAMERA 4 KEEPOUT CONE')),
  window: {
    width: v(5.09, 'dimensioned', s2('Detail J: 5.09 (extension lines on both sides)')),
    length: v(8.09, 'dimensioned', s2('Detail J: 8.09')),
    radius: v(2.23, 'dimensioned', s2('Detail J: 4X R 2.23')),
  },
};

export const lightning = {
  name: 'Lightning' as const,
  width: v(13.65, 'dimensioned', s1('Detail C: 13.65 RECOMMENDED CONNECTOR KEEPOUT (2X R 3.40 corners)')),
  thickness: v(6.85, 'dimensioned', s1('Detail C: 6.85 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(39.04, 'dimensioned', s1('Detail C: 39.04 (the port\'s centre, from the side-button edge: half the 78.07, rounded)')),
  fromBack: v(3.69, 'dimensioned', s1('Detail C: 3.69, the port\'s and screws\' centre line to the back (the bump\'s side of the view; the 12 Pro\'s Detail C says 3.67)')),
  outward: v(14.0, 'dimensioned', s1('Detail C: MATING CONNECTOR KEEPOUT AREA FLUSH TO PRODUCT SURFACE REQUIRED OUTWARD 14.0 mm')),
};

export const front = {
  activeWidth: v(71.13, 'dimensioned', s1('front view: 71.13 DISPLAY ACTIVE AREA')),
  activeLength: v(153.9, 'dimensioned', s1('front view: 153.90 DISPLAY ACTIVE AREA')),
  activeFromEdge: v(3.47, 'dimensioned', s1('front view: 3.47 ALL AROUND, EXTERIOR OF HOUSING TO DISPLAY ACTIVE AREA')),
  activeRadius: v(8.83, 'scaled', 'front view: the active area\'s corners crossed on their diagonals, 8.83 at all four (from a 7.83 guess too: the 12 Pro\'s 7.83 doesn\'t carry over)'),
  notchWidth: v(34.83, 'dimensioned', s1('front view: 34.83 ACTIVE AREA CUTOUT (wall to wall)')),
  notchDepth: v(5.32, 'dimensioned', s1('front view: 5.32 ACTIVE AREA CUTOUT; its arrows land on the active area\'s top (the 3.47 line) and the cutout\'s bottom, as the 12 Pro\'s 5.30')),
  notchTopRadius: v(0.95, 'dimensioned', s1('front view: 2X R 0.95')),
  notchBottomRadius: v(3.8, 'dimensioned', s1('front view: 2X R 3.80')),
  /** Inside the notch: Detail A draws one heavy outline and dimensions it, centred on the 39.04 line. */
  receiverLength: v(7.84, 'dimensioned', s1('Detail A: 7.84 (the receiver\'s outline, end to end; centred on the 39.04 line)')),
  receiverHeight: v(1.38, 'dimensioned', s1('Detail A: 1.38 (the outline across)')),
  receiverFromTop: v(5.49, 'dimensioned', s1('Detail A: -5.49 (the receiver\'s centre line, from the 0.00 outer line; the 12 Pro\'s -5.47)')),
  receiverDepth: v(0.3, 'assumed', 'the slot\'s depth for a render: the drawing gives none'),
};

/**
 * The buttons on the long sides, sheet 1 side views and front view (the 12 Pro's sizes, moved down for the longer
 * body). `half` is from the centre to an end (2X 2.85, 4X 5.65, 2X 8.90 land on an end and the centre line); `width`
 * runs across the thickness.
 */
export const buttons = {
  ringSilent: {
    side: 'volume' as const,
    centre: v(33.34, 'dimensioned', s1('left side view: 33.34 POCKET CENTER')),
    half: v(2.85, 'dimensioned', s1('left side view: 2X 2.85 (centre to each end of the pocket)')),
    width: v(2.12, 'dimensioned', s1('left side view: 2.12 (the pocket across the thickness)')),
    fromBack: v(3.69, 'dimensioned', s1('left side view: 3.69 POCKET CENTER, from the back\'s line (the bump\'s side)')),
    proud: v(0.6, 'dimensioned', s1('front view: 0.60 RING/SILENT SWITCH')),
    note: 'the switch sits in a 5.70 x 2.12 pocket; modelled as a block of the pocket\'s size standing 0.60 proud',
  },
  volumeUp: {
    side: 'volume' as const,
    centre: v(46.65, 'dimensioned', s1('left side view: 46.65 (+) VOLUME BUTTON')),
    half: v(5.65, 'dimensioned', s1('left side view: 4X 5.65')),
    width: v(2.76, 'dimensioned', s1('left side view: 2X 2.76')),
    fromBack: v(3.69, 'dimensioned', s1('left side view: 2X 3.69, from the back\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (+) VOLUME BUTTON')),
    note: '',
  },
  volumeDown: {
    side: 'volume' as const,
    centre: v(60.65, 'dimensioned', s1('left side view: 60.65 (-) VOLUME BUTTON')),
    half: v(5.65, 'dimensioned', s1('left side view: 4X 5.65')),
    width: v(2.76, 'dimensioned', s1('left side view: 2X 2.76')),
    fromBack: v(3.69, 'dimensioned', s1('left side view: 2X 3.69, from the back\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (-) VOLUME BUTTON')),
    note: '',
  },
  side: {
    side: 'side' as const,
    centre: v(53.65, 'dimensioned', s1('right side view: 53.65 SIDE BUTTON')),
    half: v(8.9, 'dimensioned', s1('right side view: 2X 8.90')),
    width: v(2.76, 'dimensioned', s1('right side view: 2.76')),
    fromBack: v(3.69, 'dimensioned', s1('right side view: 3.69, from the button\'s centre line to the back\'s line (its arrow lands on the bump\'s side)')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 SIDE BUTTON')),
    note: '',
  },
};

/**
 * The SIM tray, left side view. Unlike the 12 Pro's sheet (which gives only 1.33, edge to centre line), this one gives
 * its depth: 3.69 from the back's line to the tray's centre line (the short extension line between its edges; 1200
 * dpi), and 2.66 across its edges.
 */
export const simTray = {
  centre: v(88.67, 'dimensioned', s1('left side view: 88.67 (to the tray\'s centre line)')),
  length: v(16.04, 'derived', s1('left side view: 2X 8.02, centre to each end')),
  width: v(2.66, 'dimensioned', s1('left side view: 2.66 (the tray\'s edges)')),
  fromBack: v(3.69, 'dimensioned', s1('left side view: 3.69 below the tray, from the back\'s line (the bump\'s side) to the tray\'s centre line')),
};

/**
 * The bottom edge, from the volume-button edge. Each group's end holes are dimensioned to their outer edges (the
 * extension lines meet each end hole's far side at 1200 dpi): 20.20 and 28.42 bound the four left of the port, 49.66
 * and 62.38 the six right of it. A hole's centre is half its 1.45 inside; the holes between are evenly spaced, as drawn
 * (2.257 and 2.254 apart: the family's 2.255 pitch).
 */
const R = 1.45 / 2;
const group = (from: number, to: number, n: number, which: string) => {
  const [a, b] = [from + R, to - R];
  return Array.from({ length: n }, (_, i) => {
    const mm = +(a + ((b - a) * i) / (n - 1)).toFixed(3);
    const how = i === 0 ? `${from} + 0.725: ${from} lands on the hole's outer edge` : i === n - 1 ? `${to} - 0.725: ${to} lands on the hole's outer edge` : `evenly between, as drawn`;
    return v(mm, i === 0 || i === n - 1 ? 'derived' : 'inferred', s1(`bottom view, the ${which} group (10X Ø 1.45 PORTS): ${how}`));
  });
};

export const bottom = {
  holes: [...group(20.2, 28.42, 4, 'left'), ...group(49.66, 62.38, 6, 'right')],
  holeDiameter: v(1.45, 'dimensioned', s1('bottom view: 10X Ø 1.45 PORTS')),
  holesFromBack: v(3.69, 'dimensioned', s1('bottom view: 3.69, the holes\' centre line to the back\'s line')),
  holeDepth: v(0.6, 'assumed', 'a mic or speaker hole\'s depth for a render: the drawing gives none'),
  screws: [32.64, 45.43].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (2X Ø 1.50 SCREW; centres, 6.40 and 6.39 either side of the port's 39.04)`))),
  screwDiameter: v(1.5, 'dimensioned', s1('bottom view: 2X Ø 1.50 SCREW')),
  screwsFromBack: v(3.69, 'dimensioned', s1('Detail C: 3.69, its upper arrow on the line through the screws and the port')),
  portFrom: v(34.66, 'dimensioned', s1('bottom view: 34.66 (the Lightning port\'s near end)')),
  portTo: v(43.42, 'dimensioned', s1('bottom view: 43.42 (its far end; 8.76 long, centred on 39.04, as the 12 Pro\'s)')),
  portHeight: v(3.01, 'dimensioned', s1('Detail C: 3.01 (the port\'s outline across the thickness, as the 12 Pro\'s); its ends round (inferred)')),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none'),
};

export const mass = v(228, 'spec', 'Weight: 8.03 ounces (228 grams)');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '12MP (spec); 4032 x 3024 is the usual 4:3 still size, not on the spec page' };

/** Everything above, as the family's builder (iphone/part.ts) reads it. */
export const phone: Phone = {
  part: {
    title: 'iPhone 12 Pro Max',
    name: 'iphone-12-pro-max.dat',
    keywords: ['Apple', 'iPhone 12 Pro Max', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [['2026-10-31', 'Built from Apple\'s dimensional drawing: body, cameras, LiDAR, buttons, ports, notch']],
    drawn: '10/13/20',
    folder: 'iphone-12-pro-max',
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
