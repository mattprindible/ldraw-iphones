// iPhone 12, read from Apple's dimensional drawing (iphone/drawings/iphone-12.pdf, sheets 1 and 2, dated
// 10/13/20; the PDF has no sheets 3 or 4: sheet 2 carries the flash's keepout and MagSafe's, and is drawn turned a
// quarter turn on its page). Every number carries where it came from and how we know it (src/provenance.ts): spec here is
// Apple's technical specifications page (support.apple.com/111876); scaled values are re-measured by measure.ts.
//
// It's drawn as the 12 mini (../iphone-12-mini), on the 13s' plan, lettered as the iPhone 13's: Detail A the corner (and the receiver), Detail B the edge
// profile, Detail C the Lightning port, Detail D the back; sheet 2's Section F-F gives both rear cameras' keepout cones,
// Section G-G the flash's, and its third back view MagSafe's keepouts.
// As the 12 mini's, its two cameras stand one above the other (both 12.73 from the side), with the flash and a rear mic
// beside them, and the receiver lies inside the notch (5.47 down), not on the glass's top edge. Coordinates on the
// back follow Detail D: `fromSide` from the side-button edge (the left edge in a back view), `fromTop` from the top
// edge. Depths from the back glass outward, or from the front face inward, as the drawing measures them.
import type { Phone } from '../../drawing.ts';
import type { Calibration, Region } from '../../../src/raster.ts';
import { v, type Kind } from '../../../src/provenance.ts';

/**
 * Where the scaled values were measured, each region of sheet 1 (PDF page 2) with the calibration measure.ts finds for
 * it: Detail D at 1200 dpi (the camera centres down, the flash across: see measure.ts), the front view (its outer
 * edges), the bottom view (its outer edges and outlines). The receiver is dimensioned (Detail A), so it isn't scaled.
 */
export const detailD: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 15250, y: 2250, width: 2300, height: 2400 }, pxPerMm: 57.49, origin: [217.7, 194.7] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5500, y: 5150, width: 2050, height: 3775 }, pxPerMm: 23.0, origin: [194, 184] };
export const bottomView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5500, y: 10600, width: 2050, height: 500 }, pxPerMm: 23.0, origin: [194, 256.75] };

/**
 * Sheet 2 (PDF page 3) is drawn a quarter turn anticlockwise on its page: its text reads bottom to top. These regions
 * are crops of the page as it is, but their calibrations are in the crop turned upright (a quarter turn anticlockwise,
 * as measure.ts's `upright` does: the crop's right edge becomes its top), where the views read as the 12 mini's do.
 * Section G-G through the flash at 1800 dpi, its scale from the cover glass's face (the section's left edge, `origin`
 * across; down has no datum) to the 10.96 extension line; and the MagSafe view (the right-hand back view) at 2400 dpi,
 * calibrated on its extension lines (0.00 and 65.26 across above the phone, 0.00 and -107.42 down left of it).
 * measure.ts checks both calibrations and reads the keepouts' geometry from them.
 */
export const sectionGG: Region & Calibration = { page: 3, dpi: 1800, crop: { x: 17400, y: 15450, width: 3000, height: 1800 }, pxPerMm: 54.93, origin: [285.5, 0] };
export const magsafeView: Region & Calibration = { page: 3, dpi: 2400, crop: { x: 13600, y: 15600, width: 8000, height: 4200 }, pxPerMm: 36.64, origin: [657, 1463] };

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
   * each label's leader followed to its cross (the labels sit in order, the leaders fan out to the curve).
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
    from: s1('Detail B: PROFILE (ALL SIDES), symmetric about the mid-plane; ±2.50, ±2.94, ±3.36, ±3.59, ±3.62 paired in order with 0.00, 2X 0.01, 2X 0.15, 2X 0.51, 2X 0.95 (the 12 mini\'s, number for number)'),
  },
};

export const bump = {
  top: v(0.73, 'dimensioned', s1('right side view: 0.73 BACK GLASS TO CAMERA PLATEAU (the inner line: the bump\'s flat top)')),
  rings: v(1.51, 'dimensioned', s1('right side view: 2X 1.51 BACK GLASS TO REAR CAMERA GLASS (the outermost line)')),
  baseFrom: v(3.43, 'dimensioned', s1('Detail D: 3.43 (across) and -3.43 (down)')),
  baseSize: v(30.7, 'derived', s1('Detail D: 34.13 - 3.43, across')),
  baseHeight: v(32.87, 'derived', s1('Detail D: -36.30 - -3.43, down (the bump is 2.17 taller than wide)')),
  baseRadius: v(9.57, 'scaled', 'Detail D: the outline\'s corners crossed on their diagonals (9.53 to 9.59)'),
  topFrom: v(5.37, 'dimensioned', s1('Detail D: 5.37 (across) and -5.37 (down)')),
  topSize: v(26.82, 'derived', s1('Detail D: 32.19 - 5.37, across')),
  topHeight: v(29.0, 'derived', s1('Detail D: -34.37 - -5.37, down')),
  topRadius: v(7.64, 'scaled', 'Detail D: the top\'s corners crossed on their diagonals, 7.63 to 7.66 (measure.ts: the bottom two by its own scan, since the family\'s passes their crossing over)'),
};

/** Rear camera 1 (the upper): the Ultra Wide. Rear camera 2 (the lower): the Main (Wide). Both in Section F-F. */
export const cameras = {
  ultraWide: {
    name: 'rear camera 1',
    label: 'Ultra Wide',
    fromSide: v(12.73, 'dimensioned', s1('Detail D: 2X 12.73 (rear cameras 1 and 2, across)')),
    fromTop: v(12.73, 'dimensioned', s1('Detail D: -12.73 REAR CAMERA 1')),
    ring: v(12.1, 'dimensioned', s1('Detail D: 2X Ø 12.10 (its leader lands on the outermost circle)')),
    window: v(9.68, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(6.33, 'dimensioned', 'sheet 2, Section F-F: 6.33 REAR CAMERA 1 KEEPOUT CONE TO COVER GLASS'),
    keepoutCone: v(131, 'dimensioned', 'sheet 2, Section F-F: 131° REAR CAMERA 1 KEEPOUT CONE (the upper cone: F-F runs down the cameras\' column, the phone\'s top at the top)'),
    identity: v(1, 'inferred', 'camera 1 (the upper) is the Ultra Wide: its 131° keepout cone encloses the Ultra Wide\'s 120° (spec); camera 2\'s 82° the Main\'s ~80° (26 mm); and camera 2\'s apex is the further from the back (5.01 from the cover glass against 6.33), as the 12 mini\'s and the 13s\' Main\'s'),
    fov: v(120, 'spec', 'Ultra Wide: ƒ/2.4 aperture and 120° field of view'),
    aperture: v(2.4, 'spec', 'Ultra Wide: ƒ/2.4'),
  },
  main: {
    name: 'rear camera 2',
    label: 'Main',
    fromSide: v(12.73, 'dimensioned', s1('Detail D: 2X 12.73 (rear cameras 1 and 2, across)')),
    fromTop: v(27.01, 'dimensioned', s1('Detail D: -27.01 REAR CAMERA 2')),
    ring: v(12.1, 'dimensioned', s1('Detail D: 2X Ø 12.10')),
    window: v(9.68, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(5.01, 'dimensioned', 'sheet 2, Section F-F: 5.01 REAR CAMERA 2 KEEPOUT CONE TO COVER GLASS'),
    keepoutCone: v(82, 'dimensioned', 'sheet 2, Section F-F: 82° REAR CAMERA 2 KEEPOUT CONE'),
    equivalentFocal: v(26, 'third-party', '26 mm equivalent, widely reported from Apple\'s 2020 launch; not on the spec page'),
    aperture: v(1.6, 'spec', 'Wide: ƒ/1.6 aperture'),
  },
};

export const flash = {
  fromSide: v(25.28, 'dimensioned', s1('Detail D: 2X 25.28 (the flash and the rear mic)')),
  fromTop: v(19.87, 'dimensioned', s1('Detail D: -19.87 FLASH')),
  diameter: v(5.66, 'dimensioned', s1('Detail D: Ø 5.66 FLASH')),
};

/**
 * The flash's keepout (sheet 2, Section G-G, cut down the flash's and the mic's column, Detail H's G: upright, the cone
 * opens to the right and the section's left face is the cover glass). As the 12 mini's G-G, number for number: an inner
 * cone from an "origin" and, past a transition, an outer cone. Both distances run from the section's left face, the
 * front (cover glass), not the back: the section's right face steps from the back glass (7.39 from the left face) to
 * the bump's top (8.12, 7.39 + 0.73) over the bump's length, which measure.ts reads. The 6.94 extension line runs down to
 * where the inner cone's two lines meet (its apex, 1.18 below the bump's top, inside the phone); the 10.96 line to the
 * kinks where they turn into the outer cone's (2.84 above the bump's top). Hand calculation: at the bump's top the inner
 * cone is 2 x (8.12 - 6.94) x tan(67.5°) = Ø5.70 across, the flash's Ø5.66 to 0.04: the cone leaves the phone at the
 * flash window's edge.
 */
export const flashKeepout = {
  apexFromFront: v(6.94, 'dimensioned', s2('Section G-G: 6.94 FLASH KEEPOUT CONE ORIGIN TO COVER GLASS (its extension line ends at the inner cone\'s apex)')),
  transitionFromFront: v(10.96, 'dimensioned', s2('Section G-G: 10.96 FLASH KEEPOUT CONE TRANSITION TO COVER GLASS (its extension line reaches the inner cone\'s kinks into the outer)')),
  inner: v(135, 'dimensioned', s2('Section G-G: 135° FLASH INNER KEEPOUT CONE')),
  outer: v(157, 'dimensioned', s2('Section G-G: 157° FLASH OUTER KEEPOUT CONE')),
};

/**
 * The rear mic beside the cameras, on the bump's top (inside its top's R7.64 corner, 1.03 from the corner's centre).
 * Across: the 2X 25.28 extension line runs down through the mic's centre to the flash's; down: the -12.28 line leaves
 * the mic's centre to the right. Its Ø2.40 leader lands on the outer of its two circles. measure.ts finds the drawn
 * circle there, and Section G-G (cut down the same column) draws the mic's opening in the bump's top 7.59 above the
 * flash's axis (19.87 - 12.28).
 */
export const rearMic = {
  fromSide: v(25.28, 'dimensioned', s1('Detail D: 2X 25.28 (the extension line through the mic\'s and the flash\'s centres)')),
  fromTop: v(12.28, 'dimensioned', s1('Detail D: -12.28 REAR MIC (its extension line leaves the mic\'s centre)')),
  diameter: v(2.4, 'dimensioned', s1('Detail D: 2 Ø 2.40 REAR MIC (the leader on the outer circle)')),
};

/**
 * MagSafe's keepouts (sheet 2, the MagSafe view: the right-hand back view). The clear area (5: DO NOT OBSTRUCT THIS AREA
 * WITH METAL, CONDUCTIVE MATERIAL OR MAGNETIC MATERIAL) is a whole Ø57.50 circle round the product centre: on the 12's
 * 71.52 width it stays 7.01 inside each edge, so unlike the 12 mini's it has no straight sides. The magnetic zone (5 7: DO
 * NOT OBSTRUCT THIS AREA WITH MAGNETIC OR PERMEABLE MATERIAL EXCEPT MAGSAFE MAGNETS) is the 16's shape: the full width
 * from -40.12 down (3.82 below the bump's bottom, -36.30: the camera corner's keepout ends there, not at the bump),
 * straight-sided to -107.42, closed by an R49.39 arc through those corners, whose centre (derived: 107.42 -
 * √(49.39² - 35.76²) = 73.35 down) is the product centre here, as on the 12 mini (the 16's isn't).
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
 *   AREA WITH MAGNETIC OR PERMEABLE MATERIAL (FULL PRODUCT VOLUME INCLUDING SIDEWALLS); the rest of the top (35.44 to
 *   the far edge) carries no keepout but the compass;
 * - the COMPASS, a small crosshatched circle centred 65.26 across, -11.09 down (its size not dimensioned).
 * Sheet 2's middle back view and its side view give other keepouts (metal and conductive material: the top and bottom
 * bands, the side band, the area beside the bump), not recorded here.
 */
export const magsafeExtras = {
  cameraZone: { across: v(35.44, 'dimensioned', s2('MagSafe view: 35.44, the camera corner\'s keepout, its edge')), down: v(40.12, 'dimensioned', s2('MagSafe view: -40.12, its bottom (the zone\'s top)')) },
  compass: { fromSide: v(65.26, 'dimensioned', s2('MagSafe view: 65.26 COMPASS')), fromTop: v(11.09, 'dimensioned', s2('MagSafe view: -11.09 COMPASS')) },
};

export const lightning = {
  name: 'Lightning' as const,
  width: v(13.65, 'dimensioned', s1('Detail C: 13.65 RECOMMENDED CONNECTOR KEEPOUT (2X R 3.40 corners)')),
  thickness: v(6.85, 'dimensioned', s1('Detail C: 6.85 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(35.76, 'dimensioned', s1('Detail C: 35.76 (the port\'s centre, from the side-button edge)')),
  fromBack: v(3.67, 'dimensioned', s1('Detail C: 3.67, the port\'s centre line to the back (the bump\'s side of the view); the 12 mini\'s says 3.69, as this sheet\'s bottom view does for the holes')),
  outward: v(14.0, 'dimensioned', s1('Detail C: MATING CONNECTOR KEEPOUT AREA FLUSH TO PRODUCT SURFACE REQUIRED OUTWARD 14.0 mm')),
};

export const front = {
  activeWidth: v(64.58, 'dimensioned', s1('front view: 64.58 DISPLAY ACTIVE AREA')),
  activeLength: v(139.77, 'dimensioned', s1('front view: 139.77 DISPLAY ACTIVE AREA')),
  activeFromEdge: v(3.47, 'dimensioned', s1('front view: 3.47 ALL AROUND, EXTERIOR OF HOUSING TO DISPLAY ACTIVE AREA')),
  activeRadius: v(7.83, 'scaled', 'front view: the active area\'s corners crossed on their diagonals (7.79 at the top, 7.87 at the bottom)'),
  notchWidth: v(34.83, 'dimensioned', s1('front view: 34.83 ACTIVE AREA CUTOUT (wall to wall)')),
  notchDepth: v(5.3, 'dimensioned', s1('front view: 5.30 ACTIVE AREA CUTOUT; its arrows land on the active area\'s top (the 3.47 line) and the cutout\'s bottom, as the 13s\'')),
  notchTopRadius: v(0.95, 'dimensioned', s1('front view: 2X R 0.95')),
  notchBottomRadius: v(3.8, 'dimensioned', s1('front view: 2X R 3.80')),
  /** Inside the notch: Detail A draws one heavy outline (with a dashed line inside it) and dimensions it. */
  receiverLength: v(7.84, 'dimensioned', s1('Detail A: 7.84 (the receiver\'s outline, end to end; centred on the 35.76 line)')),
  receiverHeight: v(1.38, 'dimensioned', s1('Detail A: 1.38 (the outline across)')),
  receiverFromTop: v(5.47, 'dimensioned', s1('Detail A: -5.47 (the receiver\'s centre line, from the 0.00 outer line)')),
  receiverDepth: v(0.3, 'assumed', 'the slot\'s depth for a render: the drawing gives none'),
};

/**
 * The buttons on the long sides, sheet 1 side views and front view. `half` is from the centre to an end (2X 2.85, 4X
 * 5.65, 2X 8.90 land on an end and the centre line); `width` runs across the thickness.
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
    fromBack: v(3.7, 'derived', s1('right side view: 3.69 from the front\'s line (the view\'s bump is on the far side), so 7.39 - 3.69 from the back')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 SIDE BUTTON')),
    note: '',
  },
};

/**
 * The SIM tray, left side view. Unlike the 12 mini's (3.69 from the back), this sheet gives no depth for it: its 1.33
 * runs from the tray's edge to its centre line (half its 2.66), and that line is drawn at mid-thickness.
 */
export const simTray = {
  centre: v(111.88, 'dimensioned', s1('left side view: 111.88 (to the tray\'s centre line)')),
  length: v(16.04, 'derived', s1('left side view: 2X 8.02, centre to each end')),
  width: v(2.66, 'dimensioned', s1('left side view: 2.66 (and 1.33, the edge to its centre line)')),
  fromBack: v(3.695, 'inferred', 'left side view: the tray\'s centre line is drawn at mid-thickness (7.39 / 2); the sheet dimensions it only from the tray\'s edge (1.33)'),
};

/**
 * The bottom edge, from the volume-button edge. Each group's end holes are dimensioned to their outer edges (the
 * extension lines touch the holes, as on the 13s and the 12 mini): 19.18 and 25.14 bound the three left of the port,
 * 46.38 and 56.85 the five right of it. A hole's centre is half its 1.45 inside; the holes between are evenly spaced, as
 * drawn (2.255 apart in both groups: 4.51 / 2 and 9.02 / 4).
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
  screws: [29.37, 42.16].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (2X Ø 1.50 SCREW; 6.39 and 6.40 either side of the port's 35.76: centres)`))),
  screwDiameter: v(1.5, 'dimensioned', s1('bottom view: 2X Ø 1.50 SCREW')),
  screwsFromBack: v(3.69, 'inferred', 'Detail C draws the screws on the holes\' centre line'),
  portFrom: v(31.54, 'dimensioned', s1('bottom view: 31.54 (the Lightning port\'s near end)')),
  portTo: v(39.99, 'dimensioned', s1('bottom view: 39.99 (its far end; centre 35.765, as Detail C\'s 35.76)')),
  portHeight: v(2.7, 'dimensioned', s1('Detail C: 2.70 (the port\'s opening across the thickness, its heavy outline\'s outer edges); its ends round (inferred)')),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none'),
};

export const mass = v(164, 'spec', 'Weight: 164 grams');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '12MP (spec); 4032 x 3024 is the usual 4:3 still size, not on the spec page' };

/** Everything above, as the family's builder (iphone/part.ts) reads it. */
export const phone: Phone = {
  part: {
    title: 'iPhone 12',
    name: 'iphone-12.dat',
    keywords: ['Apple', 'iPhone 12', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [['2026-10-31', 'Built from Apple\'s dimensional drawing: body, cameras, buttons, ports, notch']],
    drawn: '10/13/20',
    folder: 'iphone-12',
  },
  details: { corner: 'Detail A', edge: 'Detail B', back: 'Detail D', port: 'Detail C' },
  body,
  bump,
  cameras,
  cameraIdentity: cameras.ultraWide.identity,
  flash: { ...flash, keepout: flashKeepout },
  rearMic,
  magsafe,
  connector: lightning,
  front,
  buttons,
  simTray,
  bottom,
  mass,
  image,
};
