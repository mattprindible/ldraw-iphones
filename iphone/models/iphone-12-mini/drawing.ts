// iPhone 12 mini, read from Apple's dimensional drawing (iphone/drawings/iphone-12-mini.pdf, sheets 1 and
// 2, dated 10/13/20; the PDF has no sheets 3 or 4: sheet 2 carries the flash's keepout and MagSafe's). Every number carries where it came from and how we know it (src/provenance.ts): spec here is
// Apple's technical specifications page (support.apple.com/111877); scaled values are re-measured by measure.ts.
//
// It's drawn on the 13s' plan, lettered as the iPhone 13's: Detail A the corner (and the receiver), Detail B the edge
// profile, Detail C the Lightning port, Detail D the back; sheet 2's Section F-F gives both rear cameras' keepout cones.
// Unlike the 13 mini, its two cameras stand one above the other (both 10.67 from the side), with the flash and a rear
// mic beside them, and the receiver lies inside the notch (5.45 down), not on the glass's top edge. Coordinates on the
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
export const detailD: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 15000, y: 2200, width: 2400, height: 2700 }, pxPerMm: 69.02, origin: [199.4, 213.4] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5500, y: 5300, width: 1900, height: 3300 }, pxPerMm: 22.99, origin: [182.5, 209] };
export const bottomView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 4400, y: 10850, width: 1850, height: 500 }, pxPerMm: 22.99, origin: [140.5, 240.5] };
/**
 * Sheet 2 (PDF page 3): Section G-G through the flash, its scale from the cover glass's face (the section's left edge,
 * `origin` across; down has no datum) to the 10.96 extension line; and the MagSafe view (the back, bottom middle of the
 * sheet), calibrated on its extension lines (0.00 and 58.47 across above the phone, 0.00 and -103.28 down left of it).
 * measure.ts checks both calibrations and reads the keepouts' geometry from them.
 */
export const sectionGG: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 16600, y: 900, width: 2200, height: 3000 }, pxPerMm: 57.48, origin: [256, 0] };
export const magsafeView: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 12600, y: 5600, width: 2700, height: 4600 }, pxPerMm: 28.75, origin: [390, 516] };

const s1 = (what: string) => `sheet 1, ${what}`;
const s2 = (what: string) => `sheet 2, ${what}`;

export const body = {
  width: v(64.21, 'dimensioned', s1('front view: 64.21 PRODUCT WIDTH')),
  length: v(131.5, 'dimensioned', s1('front view: 131.50 PRODUCT LENGTH')),
  thickness: v(7.39, 'dimensioned', s1('right side view: 7.39 PRODUCT THICKNESS')),
  glassWidth: v(62.11, 'dimensioned', s1('front view: 62.11 GLASS')),
  glassLength: v(129.4, 'dimensioned', s1('front view: 129.40 GLASS')),
  /**
   * The plan-view corner, (along the top edge, down the side) from the corner: Detail A's crosses on the outer line,
   * each label's leader followed to its cross (the labels sit in order, the leaders fan out to the curve).
   */
  corner: {
    points: [
      [13.03, 0],
      [9.42, 0.11],
      [5.92, 0.94],
      [2.93, 2.93],
      [0.94, 5.92],
      [0.11, 9.42],
      [0, 13.03],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail A: CORNER PROFILE (ALL FOUR CORNERS); 0.00, 0.11, 0.94, 2.93, 5.92, 9.42, 13.03 each way, paired by the crosses the leaders reach (symmetric about the diagonal)'),
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
    from: s1('Detail B: PROFILE (ALL SIDES), symmetric about the mid-plane; ±2.50, ±2.94, ±3.36, ±3.59, ±3.62 paired in order with 0.00, 2X 0.01, 2X 0.15, 2X 0.51, 2X 0.95'),
  },
};

export const bump = {
  top: v(0.73, 'dimensioned', s1('right side view: 0.73 BACK GLASS TO CAMERA PLATEAU (the inner line: the bump\'s flat top)')),
  rings: v(1.51, 'dimensioned', s1('right side view: 2X 1.51 BACK GLASS TO REAR CAMERA GLASS (the outermost line)')),
  baseFrom: v(1.67, 'dimensioned', s1('Detail D: 1.67 (across) and -1.67 (down)')),
  baseSize: v(29.09, 'derived', s1('Detail D: 30.76 - 1.67, across')),
  baseHeight: v(32.28, 'derived', s1('Detail D: -33.95 - -1.67, down (the bump is 3.19 taller than wide)')),
  baseRadius: v(9.3, 'scaled', 'Detail D: the outline\'s corners crossed on their diagonals (the top\'s extension lines cross each diagonal 1.94 in: passed over)'),
  topFrom: v(3.61, 'dimensioned', s1('Detail D: 3.61 (across) and -3.61 (down)')),
  topSize: v(25.21, 'derived', s1('Detail D: 28.82 - 3.61, across')),
  topHeight: v(28.4, 'derived', s1('Detail D: -32.01 - -3.61, down')),
  topRadius: v(7.35, 'scaled', 'Detail D: the top\'s corners crossed on their diagonals'),
};

/** Rear camera 1 (the upper): the Ultra Wide. Rear camera 2 (the lower): the Main (Wide). Both in Section F-F. */
export const cameras = {
  ultraWide: {
    name: 'rear camera 1',
    label: 'Ultra Wide',
    fromSide: v(10.67, 'dimensioned', s1('Detail D: 2X 10.67 (rear cameras 1 and 2, across)')),
    fromTop: v(10.67, 'dimensioned', s1('Detail D: -10.67 REAR CAMERA 1')),
    ring: v(12.1, 'dimensioned', s1('Detail D: 2X Ø 12.10 (its leader lands on the outermost circle)')),
    window: v(9.68, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(6.2, 'dimensioned', 'sheet 2, Section F-F: 6.20 REAR CAMERA 1 KEEPOUT CONE TO COVER GLASS'),
    keepoutCone: v(131, 'dimensioned', 'sheet 2, Section F-F: 131° REAR CAMERA 1 KEEPOUT CONE (the upper cone: F-F runs down the cameras\' column, the phone\'s top at the top)'),
    identity: v(1, 'inferred', 'camera 1 (the upper) is the Ultra Wide: its 131° keepout cone encloses the Ultra Wide\'s 120° (spec); camera 2\'s 82° the Main\'s ~80° (26 mm); and camera 2\'s apex is the deeper (5.01 against 6.20), as the 13s\' Main\'s'),
    fov: v(120, 'spec', 'Ultra Wide: ƒ/2.4 aperture and 120° field of view'),
    aperture: v(2.4, 'spec', 'Ultra Wide: ƒ/2.4'),
  },
  main: {
    name: 'rear camera 2',
    label: 'Main',
    fromSide: v(10.67, 'dimensioned', s1('Detail D: 2X 10.67 (rear cameras 1 and 2, across)')),
    fromTop: v(24.95, 'dimensioned', s1('Detail D: -24.95 REAR CAMERA 2')),
    ring: v(12.1, 'dimensioned', s1('Detail D: 2X Ø 12.10')),
    window: v(9.68, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(5.01, 'dimensioned', 'sheet 2, Section F-F: 5.01 REAR CAMERA 2 KEEPOUT CONE TO COVERGLASS'),
    keepoutCone: v(82, 'dimensioned', 'sheet 2, Section F-F: 82° REAR CAMERA 2 KEEPOUT CONE'),
    equivalentFocal: v(26, 'third-party', '26 mm equivalent, widely reported from Apple\'s 2020 launch; not on the spec page'),
    aperture: v(1.6, 'spec', 'Wide: ƒ/1.6 aperture'),
  },
};

export const flash = {
  fromSide: v(22.21, 'dimensioned', s1('Detail D: 2X 22.21 (the flash and the rear mic)')),
  fromTop: v(17.81, 'dimensioned', s1('Detail D: -17.81 FLASH')),
  diameter: v(5.66, 'dimensioned', s1('Detail D: Ø 5.66 FLASH')),
};

/**
 * The flash's keepout (sheet 2, Section G-G, cut down the flash's column: the cone opens to the right, the section's
 * left face the cover glass). As the 12 Pro's G-G: an inner cone from an "origin" and, past a transition, an outer cone.
 * Both distances run from the section's left face, which is the front (cover glass), not the back: the face opposite the
 * cone, 8.12 from the section's other face (7.39 + 0.73, the bump's top, where the flash is), which measure.ts reads.
 * The 6.94 extension line runs down to where the inner cone's two lines meet (its apex, 1.18 below the bump's top,
 * inside the phone); the 10.96 line to the kinks where they turn into the outer cone's (2.84 above the bump's top).
 * Hand calculation: at the bump's top the inner cone is 2 x (8.12 - 6.94) x tan(67.5°) = Ø5.70 across, the flash's
 * Ø5.66 to 0.04: the cone leaves the phone at the flash window's edge.
 */
export const flashKeepout = {
  apexFromFront: v(6.94, 'dimensioned', s2('Section G-G: 6.94 FLASH KEEPOUT CONE ORIGIN TO COVER GLASS (its extension line ends at the inner cone\'s apex)')),
  transitionFromFront: v(10.96, 'dimensioned', s2('Section G-G: 10.96 FLASH KEEPOUT CONE TRANSITION TO COVER GLASS (its extension line reaches the inner cone\'s kinks into the outer)')),
  inner: v(135, 'dimensioned', s2('Section G-G: 135° FLASH INNER KEEPOUT CONE')),
  outer: v(157, 'dimensioned', s2('Section G-G: 157° FLASH OUTER KEEPOUT CONE')),
};

/**
 * The rear mic beside the cameras, on the bump's top (inside its top's R7.35 corner). Across: the 2X 22.21 extension
 * line runs down through the mic's centre to the flash's; down: the -10.22 line leaves the mic's centre. Its Ø2.40
 * leader lands on the outer of its two circles. measure.ts finds the drawn circle there.
 */
export const rearMic = {
  fromSide: v(22.21, 'dimensioned', s1('Detail D: 2X 22.21 (the extension line through the mic\'s and the flash\'s centres)')),
  fromTop: v(10.22, 'dimensioned', s1('Detail D: -10.22 REAR MIC')),
  diameter: v(2.4, 'dimensioned', s1('Detail D: 2 Ø 2.40 REAR MIC (the leader on the outer circle)')),
};

/**
 * MagSafe's keepouts (sheet 2, the MagSafe view: the back). The clear area (5: DO NOT OBSTRUCT THIS AREA WITH METAL,
 * CONDUCTIVE MATERIAL OR MAGNETIC MATERIAL) is a Ø57.50 circle round the product centre, its arcs (2X R28.75) cut off
 * by straight sides 5.36 in from each edge (see `magsafeSides`): the family's field takes the circle. The magnetic zone
 * (5 7: DO NOT OBSTRUCT THIS AREA WITH METAL OR PERMEABLE MATERIAL EXCEPT MAGSAFE MAGNETS) is the 16's shape: the full
 * width from -33.95 (the bump's bottom) down, straight-sided to -103.28, closed by an R49.39 arc through those corners,
 * whose centre (derived: 103.28 - √(49.39² - 32.105²) = 65.75 down) is the product centre here (the 16's isn't).
 */
export const magsafe = {
  fromSide: v(32.11, 'dimensioned', s2('MagSafe view: 32.11 PRODUCT CENTER')),
  fromTop: v(65.74, 'dimensioned', s2('MagSafe view: -65.74 PRODUCT CENTER')),
  diameter: v(57.5, 'derived', s2('MagSafe view: 2X R 28.75, the clear area\'s arcs above and below, both on one circle round the product centre (measure.ts fits them): 2 x 28.75')),
  zoneFrom: v(33.95, 'dimensioned', s2('MagSafe view: -33.95, the zone\'s top edge, the full width (Detail D\'s -33.95, the bump\'s bottom)')),
  zoneSidesTo: v(103.28, 'dimensioned', s2('MagSafe view: 2X -103.28, where the zone\'s sides (the phone\'s) meet its arc')),
  zoneRadius: v(49.39, 'dimensioned', s2('MagSafe view: R 49.39, the arc closing the zone below')),
};

/**
 * What the MagSafe view gives beyond the family's fields (not built, not in features.json):
 * - the clear area's straight sides, 5.36 and 58.85 across (53.49 apart, centred on 32.105), from 55.66 to 75.82 down
 *   (2X: ±10.08 about the product centre). Where the Ø57.50 circle meets those lines, sharp corners would fall at
 *   55.19 and 76.29 (±10.55): the dimensioned ends are 0.47 short of them. They are the tangent points of blends the
 *   drawing doesn't dimension: R2.41 puts them there ((28.75 - r)² - (26.745 - r)² = 10.08²), and measure.ts's trace
 *   of the four corners at 4800 dpi follows such a blend, not a sharp corner;
 * - above the zone, the camera corner (0.00 to 32.11 across, 0.00 to -33.95 down, crosshatched): DO NOT OBSTRUCT THIS
 *   AREA WITH MAGNETIC OR PERMEABLE MATERIAL (FULL PRODUCT VOLUME INCLUDING SIDEWALLS); the rest of the top (32.11 to
 *   the far edge) carries no keepout;
 * - the COMPASS, a small circle centred 58.47 across, -8.83 down (its size not dimensioned).
 */
export const magsafeSides = {
  sideFrom: v(5.36, 'dimensioned', s2('MagSafe view: 5.36 (the clear area\'s straight side, side-button edge)')),
  sideTo: v(58.85, 'dimensioned', s2('MagSafe view: 58.85 (its other straight side)')),
  straightFrom: v(55.66, 'dimensioned', s2('MagSafe view: 2X -55.66 (where the straight sides start)')),
  straightTo: v(75.82, 'dimensioned', s2('MagSafe view: 2X -75.82 (where they end)')),
  blendRadius: v(2.41, 'derived', s2('the blend between each straight side and its arc: not dimensioned; the radius that puts its tangent points on the 55.66 and 75.82 lines, from R28.75 and the sides 26.745 from the centre')),
  cameraZone: { across: v(32.11, 'dimensioned', s2('MagSafe view: 32.11, the camera corner\'s keepout, its edge')), down: v(33.95, 'dimensioned', s2('MagSafe view: -33.95, its bottom (the zone\'s top)')) },
  compass: { fromSide: v(58.47, 'dimensioned', s2('MagSafe view: 58.47 COMPASS')), fromTop: v(8.83, 'dimensioned', s2('MagSafe view: -8.83 COMPASS')) },
};

export const lightning = {
  name: 'Lightning' as const,
  width: v(13.65, 'dimensioned', s1('Detail C: 13.65 RECOMMENDED CONNECTOR KEEPOUT (2X R 3.40 corners)')),
  thickness: v(6.85, 'dimensioned', s1('Detail C: 6.85 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(32.11, 'dimensioned', s1('Detail C: 32.11 (the port\'s centre, from the side-button edge)')),
  fromBack: v(3.69, 'dimensioned', s1('Detail C: 3.69, the port\'s centre line to the back (the bump\'s side of the view)')),
  outward: v(14.0, 'dimensioned', s1('Detail C: MATING CONNECTOR KEEPOUT AREA FLUSH TO PRODUCT SURFACE REQUIRED OUTWARD 14.0 mm')),
};

export const front = {
  activeWidth: v(57.67, 'dimensioned', s1('front view: 57.67 DISPLAY ACTIVE AREA')),
  activeLength: v(124.96, 'dimensioned', s1('front view: 124.96 DISPLAY ACTIVE AREA')),
  activeFromEdge: v(3.27, 'dimensioned', s1('front view: 3.27 ALL AROUND, EXTERIOR OF HOUSING TO DISPLAY ACTIVE AREA')),
  activeRadius: v(6.76, 'scaled', 'front view: the active area\'s corners crossed on their diagonals, 6.76 at three; the bottom-left\'s diagonal runs along a line of the crosshatch (it reads 0.97: passed over)'),
  notchWidth: v(34.83, 'dimensioned', s1('front view: 34.83 ACTIVE AREA CUTOUT (wall to wall)')),
  notchDepth: v(5.3, 'dimensioned', s1('front view: 5.30 ACTIVE AREA CUTOUT; its arrows land on the active area\'s top (the 3.27 line) and the cutout\'s bottom, as the 13s\'')),
  notchTopRadius: v(0.95, 'dimensioned', s1('front view: 2X R 0.95')),
  notchBottomRadius: v(3.8, 'dimensioned', s1('front view: 2X R 3.80')),
  /** Inside the notch: Detail A draws one heavy outline (with a dashed line inside it) and dimensions it. */
  receiverLength: v(7.84, 'dimensioned', s1('Detail A: 7.84 (the receiver\'s outline, end to end; centred on the 32.11 line)')),
  receiverHeight: v(1.38, 'dimensioned', s1('Detail A: 1.38 (the outline across)')),
  receiverFromTop: v(5.45, 'dimensioned', s1('Detail A: -5.45 (the receiver\'s centre line, from the 0.00 outer line)')),
  receiverDepth: v(0.3, 'assumed', 'the slot\'s depth for a render: the drawing gives none'),
};

/**
 * The buttons on the long sides, sheet 1 side views and front view. `half` is from the centre to an end (2X 2.85, 4X
 * 5.65, 2X 8.90 land on an end and the centre line); `width` runs across the thickness.
 */
export const buttons = {
  ringSilent: {
    side: 'volume' as const,
    centre: v(23.37, 'dimensioned', s1('left side view: 23.37 POCKET CENTER')),
    half: v(2.85, 'dimensioned', s1('left side view: 2X 2.85 (centre to each end of the pocket)')),
    width: v(2.15, 'dimensioned', s1('left side view: 2.15 (the pocket across the thickness)')),
    fromBack: v(3.68, 'dimensioned', s1('left side view: 3.68 POCKET CENTER, from the back\'s line (the bump\'s side)')),
    proud: v(0.6, 'dimensioned', s1('front view: 0.60 RING/SILENT SWITCH')),
    note: 'the switch sits in a 5.70 x 2.15 pocket; modelled as a block of the pocket\'s size standing 0.60 proud',
  },
  volumeUp: {
    side: 'volume' as const,
    centre: v(36.68, 'dimensioned', s1('left side view: 36.68 (+) VOLUME BUTTON')),
    half: v(5.65, 'dimensioned', s1('left side view: 4X 5.65')),
    width: v(2.76, 'dimensioned', s1('left side view: 2X 2.76')),
    fromBack: v(3.69, 'dimensioned', s1('left side view: 2X 3.69, from the back\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (+) VOLUME BUTTON')),
    note: '',
  },
  volumeDown: {
    side: 'volume' as const,
    centre: v(50.68, 'dimensioned', s1('left side view: 50.68 (-) VOLUME BUTTON')),
    half: v(5.65, 'dimensioned', s1('left side view: 4X 5.65')),
    width: v(2.76, 'dimensioned', s1('left side view: 2X 2.76')),
    fromBack: v(3.69, 'dimensioned', s1('left side view: 2X 3.69, from the back\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (-) VOLUME BUTTON')),
    note: '',
  },
  side: {
    side: 'side' as const,
    centre: v(43.68, 'dimensioned', s1('right side view: 43.68 SIDE BUTTON')),
    half: v(8.9, 'dimensioned', s1('right side view: 2X 8.90')),
    width: v(2.76, 'dimensioned', s1('right side view: 2.76')),
    fromBack: v(3.7, 'derived', s1('right side view: 3.69 from the front\'s line (the view\'s bump is on the far side), so 7.39 - 3.69 from the back')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 SIDE BUTTON')),
    note: '',
  },
};

export const simTray = {
  centre: v(96.67, 'dimensioned', s1('left side view: 96.67 (to the tray\'s centre line)')),
  length: v(15.98, 'derived', s1('left side view: 2X 7.99, centre to each end')),
  width: v(2.3, 'dimensioned', s1('left side view: 2.30')),
  fromBack: v(3.69, 'dimensioned', s1('left side view: 3.69, from the back\'s line')),
};

/**
 * The bottom edge, from the volume-button edge. Each group's end holes are dimensioned to their outer edges (the
 * extension lines touch the holes, as on the 13s): 17.78 and 21.49 bound the pair left of the port, 42.73 and 50.94
 * the four right of it. A hole's centre is half its 1.45 inside; the holes between are evenly spaced, as drawn (2.25
 * apart: the 13 mini's centres, number for number).
 */
const R = 1.45 / 2;
const group = (from: number, to: number, n: number, which: string) => {
  const [a, b] = [from + R, to - R];
  return Array.from({ length: n }, (_, i) => {
    const mm = +(a + ((b - a) * i) / (n - 1)).toFixed(3);
    const how = i === 0 ? `${from} + 0.725: ${from} lands on the hole's outer edge` : i === n - 1 ? `${to} - 0.725: ${to} lands on the hole's outer edge` : `evenly between, as drawn`;
    return v(mm, i === 0 || i === n - 1 ? 'derived' : 'inferred', s1(`bottom view, the ${which} group (6X Ø 1.45 PORTS): ${how}`));
  });
};

export const bottom = {
  holes: [...group(17.78, 21.49, 2, 'left'), ...group(42.73, 50.94, 4, 'right')],
  holeDiameter: v(1.45, 'dimensioned', s1('bottom view: 6X Ø 1.45 PORTS')),
  holesFromBack: v(3.69, 'dimensioned', s1('bottom view: 3.69, the holes\' centre line to the back\'s line')),
  holeDepth: v(0.6, 'assumed', 'a mic or speaker hole\'s depth for a render: the drawing gives none'),
  screws: [25.71, 38.5].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (2X Ø 1.50 SCREW)`))),
  screwDiameter: v(1.5, 'dimensioned', s1('bottom view: 2X Ø 1.50 SCREW')),
  screwsFromBack: v(3.69, 'inferred', 'Detail C draws the screws on the holes\' centre line'),
  portFrom: v(27.89, 'dimensioned', s1('bottom view: 27.89 (the Lightning port\'s near end)')),
  portTo: v(36.33, 'dimensioned', s1('bottom view: 36.33 (its far end; centre 32.11, as Detail C\'s)')),
  portHeight: v(2.7, 'dimensioned', s1('Detail C: 2.70 (the port\'s opening across the thickness, its heavy outline\'s outer edges); its ends round (inferred)')),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none'),
};

export const mass = v(135, 'spec', 'Weight: 135 grams');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '12MP (spec); 4032 x 3024 is the usual 4:3 still size, not on the spec page' };

/** Everything above, as the family's builder (iphone/part.ts) reads it. */
export const phone: Phone = {
  part: {
    title: 'iPhone 12 mini',
    name: 'iphone-12-mini.dat',
    keywords: ['Apple', 'iPhone 12 mini', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [['2026-10-31', 'Built from Apple\'s dimensional drawing: body, cameras, buttons, ports, notch']],
    drawn: '10/13/20',
    folder: 'iphone-12-mini',
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
