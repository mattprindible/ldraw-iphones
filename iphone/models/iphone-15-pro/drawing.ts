// iPhone 15 Pro, read from Apple's dimensional drawing (iphone/drawings/iphone-15-pro.pdf, sheets 1 to 3,
// dated 2023-10-10). Every number carries where it came from and how we know it (src/provenance.ts): spec here is
// Apple's technical specifications page (support.apple.com/111829); scaled values are re-measured by measure.ts.
//
// Drawn on the 13s' plan (Detail A the corner, B the edge profile, C the port, D the back; sheet 2 the keepout
// sections; sheet 3 antenna keepouts), with a Dynamic Island for the notch, USB-C for Lightning and an Action button
// for the ring/silent switch. Its title block says DO NOT SCALE DRAWINGS: the few scaled values are checked against
// dimensioned features as everywhere else. Its tolerances go by decimal places (X.XX ±0.10).
// Sheet 2 also gives the flash's keepout (Section J-J, the middle one) and MagSafe's keepouts (its middle back view):
// features.json only. Detail D gives the rear mic.
import type { Phone } from '../../drawing.ts';
import type { Calibration, Region } from '../../../src/raster.ts';
import { v, type Kind } from '../../../src/provenance.ts';

/** Where the scaled values were measured: regions of sheet 1 (PDF page 2) at 1200 dpi, each with its calibration. */
export const detailD: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 15500, y: 2000, width: 3000, height: 3000 }, pxPerMm: 46.13, origin: [346, 312] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 6000, y: 4650, width: 2050, height: 3800 }, pxPerMm: 23.05, origin: [213, 317.5] };
export const bottomView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 6000, y: 10650, width: 1950, height: 500 }, pxPerMm: 23.05, origin: [213, 241.5] };

/**
 * Detail D's rear mic at 4800 dpi, in Detail D's frame (measure.ts carries the calibration over). Sheet 2 (PDF page 3):
 * Section J-J (the middle one, through the flash) at 1200 dpi, drawn upright: the cover glass's face its left edge
 * (288 px), the phone's top edge `origin` down; its scale from that face to the 12.36 extension line (46.08 px/mm). And
 * the MagSafe view (the middle back view) at 1800 dpi, calibrated on its 0.00 and 63.16 lines across and its 0.00 and
 * -112.62 lines down (34.56 px/mm).
 */
export const micView: Region = { page: 2, dpi: 4800, crop: { x: 69990, y: 15100, width: 800, height: 800 } };
export const sectionJJ: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 13400, y: 1400, width: 1300, height: 3900 }, pxPerMm: 46.08, origin: [288, 1070] };
export const magsafeView: Region & Calibration = { page: 3, dpi: 1800, crop: { x: 17250, y: 10950, width: 3600, height: 6150 }, pxPerMm: 34.56, origin: [612, 609] };

const s1 = (what: string) => `sheet 1, ${what}`;
const s2 = (what: string) => `sheet 2, ${what}`;

export const body = {
  width: v(70.6, 'dimensioned', s1('front view: 70.60 PRODUCT WIDTH')),
  length: v(146.61, 'dimensioned', s1('front view: 146.61 PRODUCT LENGTH')),
  thickness: v(8.25, 'dimensioned', s1('side view: 8.25 PRODUCT THICKNESS')),
  glassWidth: v(68.6, 'dimensioned', s1('front view: 68.60 GLASS')),
  glassLength: v(144.61, 'dimensioned', s1('front view: 144.61 GLASS')),
  corner: {
    points: [
      [17.24, 0],
      [12.36, 0.05],
      [7.58, 0.9],
      [3.48, 3.48],
      [0.9, 7.58],
      [0.05, 12.36],
      [0, 17.24],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail A: CORNER PROFILE (ALL FOUR CORNERS); each label paired with the cross its leader reaches'),
  },
  /** Flat to ±2.46 (the 4X 0.00 covers ±1.84 and ±2.46), then rounding to the glass. */
  edge: {
    points: [
      [0, 1.84],
      [0, 2.46],
      [0.06, 3.07],
      [0.32, 3.62],
      [0.81, 3.99],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail B: PROFILE (ALL SIDES); insets 4X 0.00, 2X 0.06, 2X 0.32, 2X 0.81 paired in order with ±1.84, ±2.46, ±3.07, ±3.62, ±3.99'),
  },
};

export const bump = {
  top: v(2.05, 'dimensioned', s1('right side view: 2.05 BACK GLASS TO CAMERA PLATEAU')),
  rings: v(3.78, 'dimensioned', s1('right side view: 3.78 BACK GLASS TO REAR CAMERA GLASS')),
  baseFrom: v(1.04, 'dimensioned', s1('Detail D: 1.04 (across and down)')),
  baseSize: v(44.18, 'derived', s1('Detail D: 45.22 - 1.04, across')),
  baseHeight: v(45.5, 'derived', s1('Detail D: -46.54 - -1.04, down')),
  baseRadius: v(13.3, 'scaled', 'Detail D: the outline\'s corners crossed on their diagonals, 13.30 at all four'),
  topFrom: v(4.7, 'dimensioned', s1('Detail D: 4.70 (across and down)')),
  topSize: v(36.86, 'derived', s1('Detail D: 41.56 - 4.70, across')),
  topHeight: v(38.18, 'derived', s1('Detail D: -42.88 - -4.70, down')),
  topRadius: v(9.67, 'scaled', 'Detail D: the top\'s corners crossed on their diagonals, 9.67 at all four'),
};

/** Which is which, from sheet 2's keepout cones: camera 1 the Ultra Wide (123°), 2 the Main (86°), 3 the 3x Telephoto (33.2°). */
export const cameras = {
  ultraWide: {
    name: 'rear camera 1',
    label: 'Ultra Wide',
    fromSide: v(14.17, 'dimensioned', s1('Detail D: 2X 14.17 (rear cameras 1 and 2)')),
    fromTop: v(14.17, 'dimensioned', s1('Detail D: -14.17 REAR CAMERA 1')),
    ring: v(16.2, 'dimensioned', s1('Detail D: 3X Ø16.20')),
    window: v(13.01, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(8.29, 'dimensioned', s2('Section G-G: 8.29 REAR CAMERA 1 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(123, 'dimensioned', s2('Section G-G: 123.00° REAR CAMERA 1 KEEPOUT CONE')),
    identity: v(1, 'inferred', 'camera 1 is the Ultra Wide: its 123° cone encloses its 120° (spec); camera 2\'s 86° the Main\'s 24 mm (84°); camera 3\'s 33.2° the 3x Telephoto\'s 77 mm (31°)'),
    fov: v(120, 'spec', 'Ultra Wide: 13 mm, ƒ/2.2 aperture and 120° field of view'),
    aperture: v(2.2, 'spec', 'Ultra Wide: ƒ/2.2'),
  },
  main: {
    name: 'rear camera 2',
    label: 'Main',
    fromSide: v(14.17, 'dimensioned', s1('Detail D: 2X 14.17 (rear cameras 1 and 2)')),
    fromTop: v(33.41, 'dimensioned', s1('Detail D: -33.41 REAR CAMERA 2')),
    ring: v(16.2, 'dimensioned', s1('Detail D: 3X Ø16.20')),
    window: v(13.02, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(7.59, 'dimensioned', s2('Section G-G: 7.59 REAR CAMERA 2 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(86, 'dimensioned', s2('Section G-G: 86.00° REAR CAMERA 2 KEEPOUT CONE')),
    equivalentFocal: v(24, 'spec', '48MP Main: 24 mm focal length'),
    aperture: v(1.78, 'spec', 'Main: ƒ/1.78'),
  },
  telephoto: {
    name: 'rear camera 3',
    label: 'Telephoto',
    fromSide: v(32.16, 'dimensioned', s1('Detail D: 2X 32.16 (rear camera 3 and the flash)')),
    fromTop: v(23.79, 'dimensioned', s1('Detail D: -23.79 REAR CAMERA 3')),
    ring: v(16.2, 'dimensioned', s1('Detail D: 3X Ø16.20')),
    window: v(13.02, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(3.51, 'dimensioned', s2('Section J-J: 3.51 REAR CAMERA 3 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(33.2, 'dimensioned', s2('Section J-J: 33.20° REAR CAMERA 3 KEEPOUT CONE')),
    equivalentFocal: v(77, 'spec', '12MP 3x Telephoto: 77 mm focal length'),
    aperture: v(2.8, 'spec', 'Telephoto: ƒ/2.8'),
  },
};

export const flash = {
  fromSide: v(32.16, 'dimensioned', s1('Detail D: 2X 32.16 FLASH')),
  fromTop: v(10.22, 'dimensioned', s1('Detail D: -10.22 FLASH')),
  diameter: v(6.92, 'dimensioned', s1('Detail D: Ø6.92 FLASH')),
};

/**
 * The flash's keepout (sheet 2, Section J-J: the middle section, on the 32.16 line through the flash), drawn as the 14
 * Pro's Detail H: an inner cone from an apex inside the bump, kinking into a wider outer cone. 8.35 FLASH KEEPOUT CONE
 * ORIGIN TO COVER GLASS: its arrow lands on a short extension line through the inner cone's apex (drawn 8.34 from the
 * section's left edge); 12.36 FLASH KEEPOUT CONE TRANSITION TO COVER GLASS: its extension line comes down to the inner
 * cone's upper kink into the outer. Both run from the section's left edge, the cover glass (the front face: the back
 * glass is drawn 8.25 from it), so from the front, as the cameras' cone apexes: the apex is 0.10 beyond the back glass's
 * plane, inside the bump (whose top is 10.30). One section, down the phone: the cones are taken as circular.
 */
export const flashKeepout = {
  apexFromFront: v(8.35, 'dimensioned', s2('Section J-J: 8.35 FLASH KEEPOUT CONE ORIGIN TO COVER GLASS (its arrow on a short extension line through the inner cone\'s apex)')),
  transitionFromFront: v(12.36, 'dimensioned', s2('Section J-J: 12.36 FLASH KEEPOUT CONE TRANSITION TO COVER GLASS (its extension line reaches the inner cone\'s upper kink into the outer)')),
  inner: v(112, 'dimensioned', s2('Section J-J: 112.00° FLASH INNER KEEPOUT CONE')),
  outer: v(157, 'dimensioned', s2('Section J-J: 157.00° FLASH OUTER KEEPOUT CONE')),
};

/**
 * What Section J-J draws beyond the fields (not built, not in features.json): the keepout is hatched inside the cones
 * and closed by an undimensioned line parallel to the cover glass, 14.67 from it (4.31 beyond the plateau): where the
 * drawing stops drawing it, not a stated limit.
 */
export const flashKeepoutExtras = {
  drawnTo: v(14.67, 'scaled', 'Section J-J: the line closing the hatched keepout, from the cover glass (no dimension)'),
};

/**
 * The rear mic on the bump's top (inside the top's bottom-right R9.67 corner, 6.10 from the corner's centre). Across:
 * the 37.95 ordinate below Detail D (the first of 37.95, 41.56, 45.22), whose extension line rises to the mic's centre;
 * down: the -33.86 line runs in from the right to its centre. Two concentric circles are drawn there, as on the 14 Pro:
 * Ø1.15 and Ø0.75 (measure.ts). The leader of [2] Ø0.75 REAR MIC comes in from the right below the -33.86 line and its
 * arrow stops on the outer circle (it would have to cross it to reach the inner); the printed number is the inner's. The
 * 14 Pro's drawing labels the same pair Ø1.15, the outer's. Taken as printed, Ø0.75: the inner circle, the opening. The
 * outer (drawn Ø1.15, undimensioned here) is recorded below.
 */
export const rearMic = {
  fromSide: v(37.95, 'dimensioned', s1('Detail D: 37.95 (the ordinate below the view; its extension line rises to the mic\'s centre)')),
  fromTop: v(33.86, 'dimensioned', s1('Detail D: -33.86 (the line runs in from the right to the mic\'s centre)')),
  diameter: v(0.75, 'dimensioned', s1('Detail D: [2] Ø0.75 REAR MIC (the inner of two concentric circles, drawn Ø0.75; the leader\'s arrow stops on the outer, drawn Ø1.15)')),
};
export const rearMicOuter = v(1.15, 'scaled', 'Detail D: the outer of the mic\'s two circles (undimensioned here; the 14 Pro\'s drawing prints Ø1.15 for it)');

/**
 * MagSafe's keepouts (sheet 2, the MagSafe view: the middle back view). The clear area (5: DO NOT OBSTRUCT THIS AREA
 * WITH METAL, CONDUCTIVE MATERIAL, OR MAGNETIC MATERIAL) is a whole Ø57.50 circle centred 35.30 across (PRODUCT CENTER,
 * half the 70.60) and 74.98 down, which is NOT the product centre down: half the 146.61 is 73.305, so the circle sits
 * 1.675 below it (as the 14 Pro's, 1.67; measure.ts fits it at 74.98). The magnetic zone (5 7: DO NOT OBSTRUCT THIS
 * AREA WITH MAGNETIC OR PERMEABLE MATERIAL EXCEPT MAGSAFE MAGNETS) is the 16's shape: the full width from -45.18 down
 * (drawn there, on both sides of the crosshatch and across the open top), straight-sided to 2X -112.62, closed by an
 * R49.39 arc through those corners, whose centre (derived: 112.62 - √(49.39² - 35.30²) = 78.08 down) is 3.10 below the
 * clear circle's.
 *
 * The zone's top, 45.18, is 1.36 above Detail D's bump outline bottom (-46.54), unlike the 14 Pro's (on its outline): the
 * zone reaches 1.36 up the bump's lower edge. This view draws no line at 46.54: its bump outline ends on the zone's line.
 */
export const magsafe = {
  fromSide: v(35.3, 'dimensioned', s2('MagSafe view: 35.30 PRODUCT CENTER')),
  fromTop: v(74.98, 'dimensioned', s2('MagSafe view: -74.98 (the clear circle\'s centre line; 1.675 below the product centre, 73.305)')),
  diameter: v(57.5, 'dimensioned', s2('MagSafe view: Ø57.50 (its leader on the clear area\'s circle; measure.ts fits the circle round 35.30, 74.98)')),
  zoneFrom: v(45.18, 'dimensioned', s2('MagSafe view: -45.18, the zone\'s top, the full width (drawn there: measure.ts)')),
  zoneSidesTo: v(112.62, 'dimensioned', s2('MagSafe view: 2X -112.62, where the zone\'s sides (the phone\'s) meet its arc')),
  zoneRadius: v(49.39, 'dimensioned', s2('MagSafe view: R 49.39, the arc closing the zone below')),
};

/**
 * What the MagSafe view gives beyond the family's fields (not built, not in features.json):
 * - above the zone, the camera corner (0.00 to 45.22 across, 0.00 to the zone's top down, crosshatched): DO NOT OBSTRUCT
 *   THIS AREA WITH METAL OR OTHER CONDUCTIVE MATERIAL (FULL PRODUCT VOLUME INCLUDING SIDEWALLS); 45.22 is the bump
 *   outline's (Detail D);
 * - the COMPASS, a small hatched circle centred 63.16 across, -7.95 down (its size not dimensioned).
 * Sheet 2's left back view and side view give other keepouts (metal and conductive material: the bump's corner zone,
 * the bottom band, the side band) and Detail E the front sensors'; sheet 3 the antenna keepouts (Detail K): not
 * recorded here.
 */
export const magsafeExtras = {
  cameraZone: { across: v(45.22, 'dimensioned', s2('MagSafe view: 45.22, the camera corner\'s keepout, its edge (Detail D\'s bump outline)')) },
  compass: { fromSide: v(63.16, 'dimensioned', s2('MagSafe view: 63.16 COMPASS')), fromTop: v(7.95, 'dimensioned', s2('MagSafe view: -7.95 COMPASS')) },
};

/** The LiDAR scanner: the drawing gives only its keepout zone on the cover glass (sheet 2, Detail F), not its window. */
export const sensor = {
  name: 'LiDAR scanner',
  fromSide: v(32.16, 'dimensioned', s2('Detail F: on the 32.16 line (section J-J through camera 3 and the sensor)')),
  fromTop: v(36.62, 'dimensioned', s2('Detail F: -36.62 REAR SENSOR KEEPOUT ZONE')),
  keepoutCone: v(80.75, 'dimensioned', s2('Section J-J: 80.75° REAR SENSOR KEEPOUT CONE')),
  zone: v(14.37, 'dimensioned', s2('Detail F: Ø14.37 (it overlaps camera 3\'s ring: a zone, not the window)')),
};

export const connector = {
  name: 'USB-C' as const,
  width: v(12.45, 'dimensioned', s1('Detail C: 12.45 RECOMMENDED CONNECTOR KEEPOUT (2X R3.25 corners)')),
  thickness: v(6.6, 'dimensioned', s1('Detail C: 6.60 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(35.3, 'dimensioned', s1('Detail C: 35.30 (the port\'s centre, from the side-button edge)')),
  fromBack: v(4.12, 'dimensioned', s1('Detail C: 4.12, the port\'s centre line to the back glass')),
  outward: v(14.0, 'dimensioned', s1('Detail C: MATING CONNECTOR KEEPOUT AREA FLUSH TO PRODUCT SURFACE REQUIRED OUTWARD 14.0 mm')),
};

export const front = {
  activeWidth: v(65.08, 'dimensioned', s1('front view: 65.08 DISPLAY ACTIVE AREA')),
  activeLength: v(141.09, 'dimensioned', s1('front view: 141.09 DISPLAY ACTIVE AREA')),
  activeFromEdge: v(2.76, 'dimensioned', s1('front view: 2.76 ALL AROUND, EXTERIOR OF HOUSING TO DISPLAY ACTIVE AREA')),
  activeRadius: v(8.28, 'scaled', 'front view: the active area\'s corners crossed on their diagonals, 8.22 to 8.37'),
  islandLength: v(20.69, 'dimensioned', s1('Detail A: 20.69 (the Dynamic Island, a pill)')),
  islandHeight: v(6.07, 'dimensioned', s1('Detail A: 6.07')),
  islandFromTop: v(7.67, 'dimensioned', s1('Detail A: -7.67 (its centre line); centred across, on the 35.30 line')),
  /**
   * The receiver, 14.54 x 0.45 centred 1.17 from the top (Detail A), straddles the glass's edge (1.00 in): modelled as
   * its part inside the glass, 1.01 to 1.395.
   */
  receiverLength: v(14.54, 'dimensioned', s1('Detail A: 14.54 (the receiver)')),
  receiverHeight: v(0.385, 'derived', s1('Detail A: 0.45 at -1.17, the part inside the glass (from 1.01, just inside its edge, to 1.395)')),
  receiverFromTop: v(1.2025, 'derived', s1('Detail A: the middle of that part')),
  receiverDepth: v(0.3, 'assumed', 'the slot\'s depth for a render: the drawing gives none'),
};

export const buttons = {
  action: {
    side: 'volume' as const,
    centre: v(31.67, 'dimensioned', s1('left side view: 31.67 ACTION BUTTON')),
    half: v(3.02, 'dimensioned', s1('left side view: 2X 3.02 (centre to each end)')),
    width: v(2.66, 'dimensioned', s1('left side view: 2.66 (across the thickness)')),
    fromBack: v(4.12, 'dimensioned', s1('left side view: 4.12, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 ACTION BUTTON')),
    note: '',
  },
  volumeUp: {
    side: 'volume' as const,
    centre: v(45.22, 'dimensioned', s1('left side view: 45.22 (+) VOLUME BUTTON')),
    half: v(5.6, 'dimensioned', s1('left side view: 4X 5.60')),
    width: v(2.66, 'dimensioned', s1('left side view: 2X 2.66')),
    fromBack: v(4.12, 'dimensioned', s1('left side view: 2X 4.12, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (+) VOLUME BUTTON')),
    note: '',
  },
  volumeDown: {
    side: 'volume' as const,
    centre: v(59.42, 'dimensioned', s1('left side view: 59.42 (-) VOLUME BUTTON')),
    half: v(5.6, 'dimensioned', s1('left side view: 4X 5.60')),
    width: v(2.66, 'dimensioned', s1('left side view: 2X 2.66')),
    fromBack: v(4.12, 'dimensioned', s1('left side view: 2X 4.12, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (-) VOLUME BUTTON')),
    note: '',
  },
  side: {
    side: 'side' as const,
    centre: v(56.17, 'dimensioned', s1('right side view: 56.17 SIDE BUTTON')),
    half: v(8.85, 'dimensioned', s1('right side view: 2X 8.85')),
    width: v(2.66, 'dimensioned', s1('right side view: 2.66')),
    fromBack: v(4.13, 'derived', s1('right side view: 4.12 from the front glass\'s line (as the 13s\' right views), so 8.25 - 4.12')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 SIDE BUTTON')),
    note: '',
  },
};

export const simTray = {
  centre: v(87.05, 'dimensioned', s1('left side view: 87.05')),
  length: v(16.14, 'derived', s1('left side view: 2X 8.07, centre to each end')),
  width: v(2.76, 'dimensioned', s1('left side view: 2.76')),
  fromBack: v(4.12, 'dimensioned', s1('left side view: 4.12, from the back glass\'s line')),
};

/**
 * The bottom edge, from the volume-button edge. Only each group's end holes are dimensioned, and here (unlike the 13s)
 * their extension lines run through the holes' centres: measured at 1200 dpi, the chords centre on 19.60 and 24.12,
 * 46.50 and 55.53. The holes between are evenly spaced, as drawn (2.255 apart, the 13s' pitch).
 */
const group = (from: number, to: number, n: number, which: string) =>
  Array.from({ length: n }, (_, i) => {
    const mm = +(from + ((to - from) * i) / (n - 1)).toFixed(3);
    return i === 0 || i === n - 1
      ? v(mm, 'dimensioned', s1(`bottom view, the ${which} group (8X Ø1.35 PORTS): ${mm.toFixed(2)}, on the hole's centre`))
      : v(mm, 'inferred', s1(`bottom view, the ${which} group: evenly between, as drawn`));
  });

export const bottom = {
  holes: [...group(19.59, 24.1, 3, 'left'), ...group(46.5, 55.52, 5, 'right')],
  holeDiameter: v(1.35, 'dimensioned', s1('bottom view: 8X Ø1.35 PORTS')),
  holesFromBack: v(4.12, 'dimensioned', s1('bottom view: 4.12, the holes\' centre line to the back glass\'s line')),
  holeDepth: v(0.6, 'assumed', 'a mic or speaker hole\'s depth for a render: the drawing gives none'),
  screws: [28.38, 42.23].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (2X Ø1.50 SCREW)`))),
  screwDiameter: v(1.5, 'dimensioned', s1('bottom view: 2X Ø1.50 SCREW')),
  screwsFromBack: v(4.12, 'inferred', 'Detail C draws the screws on the holes\' centre line'),
  portFrom: v(30.45, 'dimensioned', s1('bottom view: 30.45 (the USB-C port\'s near end)')),
  portTo: v(40.16, 'dimensioned', s1('bottom view: 40.16 (its far end; centre 35.305, as Detail C\'s 35.30)')),
  portHeight: v(3.14, 'dimensioned', s1('Detail C: 3.14 (the port\'s opening across the thickness); its ends round (inferred)')),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none'),
};

export const mass = v(187, 'spec', 'Weight: 187 grams');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '4:3 at 12MP (the Ultra Wide and Telephoto; the Main\'s 24MP default has the same shape)' };

export const phone: Phone = {
  part: {
    title: 'iPhone 15 Pro',
    name: 'iphone-15-pro.dat',
    keywords: ['Apple', 'iPhone 15 Pro', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [
      ['2026-10-30', 'Built from Apple\'s dimensional drawing: body, cameras, buttons, USB-C, Dynamic Island'],
      ['2026-11-06', 'Rear mic; the flash\'s keepout and MagSafe\'s keepouts in features.json'],
    ],
    drawn: '2023-10-10',
    folder: 'iphone-15-pro',
  },
  details: { corner: 'Detail A', edge: 'Detail B', back: 'Detail D', port: 'Detail C' },
  body,
  bump,
  cameras,
  cameraIdentity: cameras.ultraWide.identity,
  flash: { ...flash, keepout: flashKeepout },
  rearMic,
  magsafe,
  sensor,
  connector,
  front,
  buttons,
  simTray,
  bottom,
  mass,
  image,
};
