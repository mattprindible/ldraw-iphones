// iPhone 15 Pro Max, read from Apple's dimensional drawing (iphone/drawings/iphone-15-pro-max.pdf, sheets
// 1 to 3, dated 2023-10-10). Every number carries where it came from and how we know it (src/provenance.ts): spec here
// is Apple's technical specifications page (support.apple.com/111828); scaled values are re-measured by measure.ts.
//
// Drawn on the 15 Pro's plan, sheet for sheet, but with two detail letters swapped: Detail D is the corner (the 15
// Pro's A) and Detail A the back (its D); B the edge profile, C the port; sheet 2 the keepout sections (G-G, H-H, J-J)
// and Detail F the LiDAR keepout; sheet 3 antenna keepouts. The corner, the edge profile, the bump, the island, the
// receiver and the buttons are the 15 Pro's numbers (but the volume buttons' 4.13); the body, the display, the SIM
// tray's position, the bottom's holes (10 for 8), the flash (Ø6.90 for 6.92), the lens rings' height and the telephoto (a 5x) differ. Its
// title block says DO NOT SCALE DRAWINGS: the few scaled values are checked against dimensioned features. Its
// tolerances go by decimal places (X.XX ±0.10).
// Sheet 2 also gives the flash's keepout (Section H-H, the middle one: the 15 Pro's J-J) and MagSafe's keepouts (its
// middle back view): features.json only. Detail A gives the rear mic (the 15 Pro's, number for number).
import type { Phone } from '../../drawing.ts';
import type { Calibration, Region } from '../../../src/raster.ts';
import { v, type Kind } from '../../../src/provenance.ts';

/** Where the scaled values were measured: regions of sheet 1 (PDF page 2) at 1200 dpi, each with its calibration. */
export const detailA: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 15500, y: 2000, width: 3000, height: 3000 }, pxPerMm: 46.08, origin: [533, 494.5] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 6300, y: 4400, width: 2250, height: 4100 }, pxPerMm: 23.05, origin: [235.5, 216.5] };
export const bottomView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 6500, y: 10500, width: 2250, height: 600 }, pxPerMm: 23.05, origin: [244.5, 371] };

/**
 * Detail A's rear mic at 4800 dpi, in Detail A's frame (measure.ts carries the calibration over). Sheet 2 (PDF page 3):
 * Section H-H (the middle one, through the flash) at 1200 dpi, drawn upright: the cover glass's face its left edge
 * (285.5 px), the phone's top edge `origin` down; its scale from that face to the 12.36 extension line (46.08 px/mm).
 * And the MagSafe view (the middle back view) at 1800 dpi, calibrated on its 0.00 and 45.22 lines across (above the
 * phone) and its 0.00 and -114.87 lines down (left of it): 34.57 px/mm.
 */
export const micView: Region = { page: 2, dpi: 4800, crop: { x: 70728, y: 15820, width: 800, height: 800 } };
export const sectionHH: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 13940, y: 1100, width: 1300, height: 3500 }, pxPerMm: 46.08, origin: [285.5, 1134.5] };
export const magsafeView: Region & Calibration = { page: 3, dpi: 1800, crop: { x: 16950, y: 10500, width: 3800, height: 6900 }, pxPerMm: 34.57, origin: [618, 515] };

const s1 = (what: string) => `sheet 1, ${what}`;
const s2 = (what: string) => `sheet 2, ${what}`;

export const body = {
  width: v(76.73, 'dimensioned', s1('front view: 76.73 PRODUCT WIDTH')),
  length: v(159.86, 'dimensioned', s1('front view: 159.86 PRODUCT LENGTH')),
  thickness: v(8.25, 'dimensioned', s1('right side view: 8.25 PRODUCT THICKNESS')),
  glassWidth: v(74.73, 'dimensioned', s1('front view: 74.73 GLASS')),
  glassLength: v(157.86, 'dimensioned', s1('front view: 157.86 GLASS')),
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
    from: s1('Detail D: CORNER PROFILE (ALL FOUR CORNERS); each label paired with the cross its leader reaches (the 15 Pro\'s numbers)'),
  },
  /** Flat to ±2.46 (the 2X 0.00 covers ±1.84 and ±2.46), then rounding to the glass. */
  edge: {
    points: [
      [0, 1.84],
      [0, 2.46],
      [0.06, 3.07],
      [0.32, 3.62],
      [0.81, 3.99],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail B: PROFILE (ALL SIDES); insets 2X 0.00, 2X 0.06, 2X 0.32, 2X 0.81 paired in order with ±1.84 (flat), ±2.46, ±3.07, ±3.62, ±3.99'),
  },
};

export const bump = {
  top: v(2.05, 'dimensioned', s1('right side view: 2.05 BACK GLASS TO CAMERA PLATEAU')),
  rings: v(4.07, 'dimensioned', s1('right side view: 4.07 BACK GLASS TO REAR CAMERA GLASS (the 15 Pro\'s 3.78)')),
  baseFrom: v(1.04, 'dimensioned', s1('Detail A: 1.04 (across and down); its 2.41 across is the back\'s flat area (the front view\'s 2.41 ALL AROUND), not the bump')),
  baseSize: v(44.18, 'derived', s1('Detail A: 45.22 - 1.04, across')),
  baseHeight: v(45.5, 'derived', s1('Detail A: -46.54 - -1.04, down')),
  baseRadius: v(13.28, 'scaled', 'Detail A: the outline\'s corners crossed on their diagonals, 13.22 to 13.30 (the 15 Pro\'s 13.30)'),
  topFrom: v(4.7, 'dimensioned', s1('Detail A: 4.70 (across and down)')),
  topSize: v(36.86, 'derived', s1('Detail A: 41.56 - 4.70, across')),
  topHeight: v(38.18, 'derived', s1('Detail A: -42.88 - -4.70, down')),
  topRadius: v(9.68, 'scaled', 'Detail A: the top\'s corners crossed on their diagonals, 9.63 to 9.74 (the 15 Pro\'s 9.67)'),
};

/** Which is which, from sheet 2's keepout cones: camera 1 the Ultra Wide (123°), 2 the Main (86°), 3 the 5x Telephoto (24.10°). */
export const cameras = {
  ultraWide: {
    name: 'rear camera 1',
    label: 'Ultra Wide',
    fromSide: v(14.17, 'dimensioned', s1('Detail A: 2X 14.17 (rear cameras 1 and 2)')),
    fromTop: v(14.17, 'dimensioned', s1('Detail A: -14.17 REAR CAMERA 1')),
    ring: v(16.2, 'dimensioned', s1('Detail A: 3X Ø16.20')),
    window: v(13.03, 'scaled', 'Detail A: the innermost of the camera\'s circles'),
    coneApexFromFront: v(8.28, 'dimensioned', s2('Section G-G: 8.28 REAR CAMERA 1 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(123, 'dimensioned', s2('Section G-G: 123.00° REAR CAMERA 1 KEEPOUT CONE')),
    identity: v(1, 'inferred', 'camera 1 is the Ultra Wide: its 123° cone encloses its 120° (spec); camera 2\'s 86° the Main\'s 24 mm (84°); camera 3\'s 24.10° the 5x Telephoto\'s 120 mm (20.4°)'),
    fov: v(120, 'spec', 'Ultra Wide: 13 mm, ƒ/2.2 aperture and 120° field of view'),
    aperture: v(2.2, 'spec', 'Ultra Wide: ƒ/2.2'),
  },
  main: {
    name: 'rear camera 2',
    label: 'Main',
    fromSide: v(14.17, 'dimensioned', s1('Detail A: 2X 14.17 (rear cameras 1 and 2)')),
    fromTop: v(33.41, 'dimensioned', s1('Detail A: -33.41 REAR CAMERA 2')),
    ring: v(16.2, 'dimensioned', s1('Detail A: 3X Ø16.20')),
    window: v(13.03, 'scaled', 'Detail A: the innermost of the camera\'s circles'),
    coneApexFromFront: v(7.73, 'dimensioned', s2('Section G-G: 7.73 REAR CAMERA 2 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(86, 'dimensioned', s2('Section G-G: 86.00° REAR CAMERA 2 KEEPOUT CONE')),
    equivalentFocal: v(24, 'spec', '48MP Main: 24 mm focal length'),
    aperture: v(1.78, 'spec', 'Main: ƒ/1.78'),
  },
  telephoto: {
    name: 'rear camera 3',
    label: 'Telephoto',
    fromSide: v(32.16, 'dimensioned', s1('Detail A: 2X 32.16 (rear camera 3 and the flash)')),
    fromTop: v(23.79, 'dimensioned', s1('Detail A: -23.79 REAR CAMERA 3')),
    ring: v(16.2, 'dimensioned', s1('Detail A: 3X Ø16.20')),
    window: v(13.02, 'scaled', 'Detail A: the innermost of the camera\'s circles'),
    coneApexFromFront: v(4.6, 'dimensioned', s2('Section J-J: 4.60 REAR CAMERA 3 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(24.1, 'dimensioned', s2('Section J-J: 24.10° REAR CAMERA 3 KEEPOUT CONE')),
    equivalentFocal: v(120, 'spec', '12MP 5x Telephoto: 120 mm focal length'),
    aperture: v(2.8, 'spec', 'Telephoto: ƒ/2.8'),
  },
};

export const flash = {
  fromSide: v(32.16, 'dimensioned', s1('Detail A: 2X 32.16 FLASH')),
  fromTop: v(10.22, 'dimensioned', s1('Detail A: -10.22 FLASH')),
  diameter: v(6.9, 'dimensioned', s1('Detail A: Ø6.90 FLASH')),
};

/**
 * The flash's keepout (sheet 2, Section H-H: the middle section, on the 32.16 line through the flash and camera 3; J-J
 * cuts the same line for camera 3 and the LiDAR), drawn as the 15 Pro's J-J, number for number: an inner cone from an
 * apex inside the bump, kinking into a wider outer cone. 8.35 FLASH KEEPOUT CONE ORIGIN TO COVER GLASS: its arrow lands
 * on a short extension line through the inner cone's apex (drawn 8.34 from the section's left edge); 12.36 FLASH
 * KEEPOUT CONE TRANSITION TO COVER GLASS: its extension line comes down to the inner cone's upper kink into the outer.
 * Both run from the section's left edge, the cover glass (the front face: the bump's top is drawn 10.30 from it, camera
 * 3's ring 12.33, as sheet 1's 8.25 + 2.05 and 8.25 + 4.07), so from the front, as the cameras' cone apexes: the apex is
 * 0.10 beyond the back glass's plane, inside the bump. The transition is 0.04 beyond the lens rings' top (12.32). One
 * section, down the phone: the cones are taken as circular.
 */
export const flashKeepout = {
  apexFromFront: v(8.35, 'dimensioned', s2('Section H-H: 8.35 FLASH KEEPOUT CONE ORIGIN TO COVER GLASS (its arrow on a short extension line through the inner cone\'s apex)')),
  transitionFromFront: v(12.36, 'dimensioned', s2('Section H-H: 12.36 FLASH KEEPOUT CONE TRANSITION TO COVER GLASS (its extension line reaches the inner cone\'s upper kink into the outer)')),
  inner: v(112, 'dimensioned', s2('Section H-H: 112.00° FLASH INNER KEEPOUT CONE')),
  outer: v(157, 'dimensioned', s2('Section H-H: 157.00° FLASH OUTER KEEPOUT CONE')),
};

/**
 * What Section H-H draws beyond the fields (not built, not in features.json): the keepout is hatched inside the cones
 * and closed by an undimensioned line parallel to the cover glass, 14.67 from it (4.37 beyond the bump's top): where the
 * drawing stops drawing it, not a stated limit.
 */
export const flashKeepoutExtras = {
  drawnTo: v(14.67, 'scaled', 'Section H-H: the line closing the hatched keepout, from the cover glass (no dimension)'),
};

/**
 * The rear mic on the bump's top (inside the top's bottom-right R9.68 corner, 6.10 from the corner's centre): the 15
 * Pro's, number for number. Across: the 37.95 ordinate below Detail A (the first of 37.95, 41.56, 45.22), whose
 * extension line rises to the mic's centre; down: the -33.86 line runs in from the right to its centre. Two concentric
 * circles are drawn there (measure.ts): Ø1.15 and Ø0.75. The leader of [2] Ø0.75 REAR MIC comes in from the right below
 * the -33.86 line and its arrow stops on the outer circle; the printed number is the inner's. Taken as printed, Ø0.75:
 * the inner circle, the opening. The outer (drawn Ø1.15, undimensioned here) is recorded below.
 */
export const rearMic = {
  fromSide: v(37.95, 'dimensioned', s1('Detail A: 37.95 (the ordinate below the view; its extension line rises to the mic\'s centre)')),
  fromTop: v(33.86, 'dimensioned', s1('Detail A: -33.86 (the line runs in from the right to the mic\'s centre)')),
  diameter: v(0.75, 'dimensioned', s1('Detail A: [2] Ø0.75 REAR MIC (the inner of two concentric circles, drawn Ø0.75; the leader\'s arrow stops on the outer, drawn Ø1.15)')),
};
export const rearMicOuter = v(1.15, 'scaled', 'Detail A: the outer of the mic\'s two circles (undimensioned here; the 14 Pro\'s drawing prints Ø1.15 for it)');

/**
 * MagSafe's keepouts (sheet 2, the MagSafe view: the middle back view). The clear area (5: DO NOT OBSTRUCT THIS AREA
 * WITH METAL, CONDUCTIVE MATERIAL, OR MAGNETIC MATERIAL) is a whole Ø57.50 circle centred on the product centre: 38.37
 * across (PRODUCT CENTER; half the 76.73 is 38.365) and -79.93 down (PRODUCT CENTER, half the 159.86), unlike the 15
 * Pro's, 1.675 below it. The magnetic zone (5 7: DO NOT OBSTRUCT THIS AREA WITH MAGNETIC OR PERMEABLE MATERIAL EXCEPT
 * MAGSAFE MAGNETS) is the 16's shape: the full width from its top down, straight-sided to 2X -114.87, closed by an
 * R51.89 arc (not the 15 Pro's R49.39) through those corners, whose centre (derived: 114.87 - √(51.89² - 38.365²) =
 * 79.93 down) is the product centre, the clear circle's.
 *
 * The zone's top is not dimensioned (the 15 Pro's prints -45.18): a line across the full width, which the crosshatched
 * camera corner ends on. It is drawn 46.76 down (measure.ts, on columns across the whole width), 0.22 below Detail A's
 * bump outline bottom (-46.54); under the bump the view draws both, merged into one run centred between them. Taken as
 * drawn, scaled: the zone starts just below the bump, not on its outline.
 */
export const magsafe = {
  fromSide: v(38.37, 'dimensioned', s2('MagSafe view: 38.37 PRODUCT CENTER (half the 76.73 is 38.365)')),
  fromTop: v(79.93, 'dimensioned', s2('MagSafe view: -79.93 PRODUCT CENTER (the clear circle\'s centre line; half the 159.86)')),
  diameter: v(57.5, 'dimensioned', s2('MagSafe view: Ø57.50 (its leader on the clear area\'s circle; measure.ts fits the circle round 38.37, 79.93)')),
  zoneFrom: v(46.76, 'scaled', 'MagSafe view: the zone\'s top, the full width, undimensioned (0.22 below Detail A\'s bump outline, -46.54, also drawn here)'),
  zoneSidesTo: v(114.87, 'dimensioned', s2('MagSafe view: 2X -114.87, where the zone\'s sides (the phone\'s) meet its arc')),
  zoneRadius: v(51.89, 'dimensioned', s2('MagSafe view: R51.89, the arc closing the zone below')),
};

/**
 * What the MagSafe view gives beyond the family's fields (not built, not in features.json):
 * - above the zone, the camera corner (0.00 to 45.22 across, 0.00 to the zone's top down, crosshatched): DO NOT OBSTRUCT
 *   THIS AREA WITH METAL OR OTHER CONDUCTIVE MATERIAL (FULL PRODUCT VOLUME INCLUDING SIDEWALLS); 45.22 is the bump
 *   outline's (Detail A);
 * - the COMPASS, a small hatched circle centred 58.06 across, -153.94 down (near the bottom edge, where the 15 Pro's is
 *   near the top; its size not dimensioned).
 * Sheet 2's left back view and side view give other keepouts (metal and conductive material: the camera corner, the
 * bottom band, the side band) and Detail E the front sensors'; sheet 3 the antenna keepouts (Detail K): not recorded here.
 */
export const magsafeExtras = {
  cameraZone: { across: v(45.22, 'dimensioned', s2('MagSafe view: 45.22, the camera corner\'s keepout, its edge (Detail A\'s bump outline)')) },
  compass: { fromSide: v(58.06, 'dimensioned', s2('MagSafe view: 58.06 COMPASS')), fromTop: v(153.94, 'dimensioned', s2('MagSafe view: -153.94 COMPASS')) },
};

/** The LiDAR scanner: the drawing gives only its keepout zone on the plateau (sheet 2, Detail F), not its window. */
export const sensor = {
  name: 'LiDAR scanner',
  fromSide: v(32.16, 'dimensioned', s2('Detail F: on the 32.16 line (section J-J through camera 3 and the sensor)')),
  fromTop: v(38.22, 'dimensioned', s2('Detail F: -38.22 REAR SENSOR KEEPOUT CONTACTING PLATEAU SURFACE')),
  keepoutCone: v(80.75, 'dimensioned', s2('Section J-J: 80.75° REAR SENSOR KEEPOUT CONE')),
  zone: v(14.62, 'dimensioned', s2('Detail F: Ø14.62 (it overlaps camera 3\'s ring and runs past the bump top\'s edge: a zone, not the window)')),
};

export const connector = {
  name: 'USB-C' as const,
  width: v(12.45, 'dimensioned', s1('Detail C: 12.45 RECOMMENDED CONNECTOR KEEPOUT (2X R3.25 corners)')),
  thickness: v(6.6, 'dimensioned', s1('Detail C: 6.60 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(38.37, 'dimensioned', s1('Detail C: 38.37 (the port\'s centre, from the side-button edge; half of 76.73 is 38.365)')),
  fromBack: v(4.12, 'dimensioned', s1('Detail C: 4.12, the port\'s centre line to the back glass')),
  outward: v(14.0, 'dimensioned', s1('Detail C: MATING CONNECTOR KEEPOUT AREA FLUSH TO PRODUCT SURFACE REQUIRED OUTWARD 14.0 mm')),
};

export const front = {
  activeWidth: v(71.21, 'dimensioned', s1('front view: 71.21 DISPLAY ACTIVE AREA')),
  activeLength: v(154.34, 'dimensioned', s1('front view: 154.34 DISPLAY ACTIVE AREA')),
  activeFromEdge: v(2.76, 'dimensioned', s1('front view: 2.76 ALL AROUND, EXTERIOR OF HOUSING TO DISPLAY ACTIVE AREA')),
  activeRadius: v(8.24, 'scaled', 'front view: the active area\'s corners crossed on their diagonals, 8.22 to 8.30'),
  islandLength: v(20.69, 'dimensioned', s1('Detail D: 20.69 (the Dynamic Island, a pill)')),
  islandHeight: v(6.07, 'dimensioned', s1('Detail D: 6.07')),
  islandFromTop: v(7.67, 'dimensioned', s1('Detail D: -7.67 (its centre line); centred across, on the 2X 38.37 line')),
  /**
   * The receiver, 14.54 x 0.45 centred 1.17 from the top (Detail D), straddles the glass's edge (1.00 in, from 76.73
   * and 74.73): modelled as its part inside the glass, 1.01 to 1.395, as the 15 Pro's.
   */
  receiverLength: v(14.54, 'dimensioned', s1('Detail D: 14.54 (the receiver)')),
  receiverHeight: v(0.385, 'derived', s1('Detail D: 0.45 at -1.17, the part inside the glass (from 1.01, just inside its edge, to 1.395)')),
  receiverFromTop: v(1.2025, 'derived', s1('Detail D: the middle of that part')),
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
    fromBack: v(4.13, 'dimensioned', s1('left side view: 2X 4.13, from the back glass\'s line (the action button\'s and SIM tray\'s are 4.12; the 15 Pro\'s 2X 4.12)')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (+) VOLUME BUTTON')),
    note: '',
  },
  volumeDown: {
    side: 'volume' as const,
    centre: v(59.42, 'dimensioned', s1('left side view: 59.42 (-) VOLUME BUTTON')),
    half: v(5.6, 'dimensioned', s1('left side view: 4X 5.60')),
    width: v(2.66, 'dimensioned', s1('left side view: 2X 2.66')),
    fromBack: v(4.13, 'dimensioned', s1('left side view: 2X 4.13, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (-) VOLUME BUTTON')),
    note: '',
  },
  side: {
    side: 'side' as const,
    centre: v(56.17, 'dimensioned', s1('right side view: 56.17 SIDE BUTTON')),
    half: v(8.85, 'dimensioned', s1('right side view: 2X 8.85')),
    width: v(2.66, 'dimensioned', s1('right side view: 2.66')),
    fromBack: v(4.13, 'derived', s1('right side view: 4.12, read from the front glass\'s line as the 15 Pro\'s (and the 13s\'), so 8.25 - 4.12; its centre line is drawn at mid-thickness (94 and 93.5 px from the outlines at 1200 dpi), so 4.12 and 4.13 can\'t be told apart')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 SIDE BUTTON')),
    note: '',
  },
};

export const simTray = {
  centre: v(91.07, 'dimensioned', s1('left side view: 91.07')),
  length: v(16.14, 'derived', s1('left side view: 2X 8.07, centre to each end')),
  width: v(2.76, 'dimensioned', s1('left side view: 2.76')),
  fromBack: v(4.12, 'dimensioned', s1('left side view: 4.12, from the back glass\'s line')),
};

/**
 * The bottom edge, from the volume-button edge. Only each group's end holes are dimensioned, and (as the 15 Pro's)
 * their extension lines run through the holes' centres: at 1200 dpi they cross the bottom view 20.39, 27.16, 49.54 and
 * 60.82 from the 0.00 line, on the holes' centres. The holes between are evenly spaced, as drawn (2.257 and 2.256
 * apart: the 13s' 2.255 pitch). Ten holes here (4 + 6), the 15 Pro's eight (3 + 5).
 */
const group = (from: number, to: number, n: number, which: string) =>
  Array.from({ length: n }, (_, i) => {
    const mm = +(from + ((to - from) * i) / (n - 1)).toFixed(3);
    return i === 0 || i === n - 1
      ? v(mm, 'dimensioned', s1(`bottom view, the ${which} group (10X Ø1.35 PORTS): ${mm.toFixed(2)}, on the hole's centre`))
      : v(mm, 'inferred', s1(`bottom view, the ${which} group: evenly between, as drawn`));
  });

export const bottom = {
  holes: [...group(20.4, 27.17, 4, 'left'), ...group(49.56, 60.84, 6, 'right')],
  holeDiameter: v(1.35, 'dimensioned', s1('bottom view: 10X Ø1.35 PORTS')),
  holesFromBack: v(4.12, 'dimensioned', s1('bottom view: 4.12, the holes\' centre line to the back glass\'s line')),
  holeDepth: v(0.6, 'assumed', 'a mic or speaker hole\'s depth for a render: the drawing gives none'),
  screws: [31.44, 45.29].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (2X Ø1.50 SCREW)`))),
  screwDiameter: v(1.5, 'dimensioned', s1('bottom view: 2X Ø1.50 SCREW')),
  screwsFromBack: v(4.12, 'inferred', 'Detail C draws the screws on the holes\' centre line'),
  portFrom: v(33.87, 'dimensioned', s1('bottom view: 33.87 (the USB-C port\'s near end)')),
  portTo: v(42.86, 'dimensioned', s1('bottom view: 42.86 (its far end; centre 38.365, as Detail C\'s 38.37)')),
  portHeight: v(3.14, 'dimensioned', s1('Detail C: 3.14 (the port\'s opening across the thickness); its ends round (inferred)')),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none'),
};

export const mass = v(221, 'spec', 'Weight: 221 grams');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '4:3 at 12MP (the Ultra Wide and Telephoto; the Main\'s 24MP default has the same shape)' };

export const phone: Phone = {
  part: {
    title: 'iPhone 15 Pro Max',
    name: 'iphone-15-pro-max.dat',
    keywords: ['Apple', 'iPhone 15 Pro Max', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [
      ['2026-10-31', 'Built from Apple\'s dimensional drawing: body, cameras, buttons, USB-C, Dynamic Island'],
      ['2026-11-06', 'Rear mic; the flash\'s keepout and MagSafe\'s keepouts in features.json'],
    ],
    drawn: '2023-10-10',
    folder: 'iphone-15-pro-max',
  },
  details: { corner: 'Detail D', edge: 'Detail B', back: 'Detail A', port: 'Detail C' },
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
