// iPhone 14 Pro, read from Apple's dimensional drawing (iphone/drawings/iphone-14-pro.pdf, sheets 1 to 3,
// dated 2022-09-21). Every number carries where it came from and how we know it (src/provenance.ts): spec here is
// Apple's technical specifications page (support.apple.com/111849); scaled values are re-measured by measure.ts.
//
// The first Dynamic Island, drawn on the 15 Pro's plan (Detail A the corner with the island and receiver, B the edge
// profile, C the port, D the back; sheet 2 the keepout sections, Detail F the LiDAR's keepout on the plateau; sheet 3
// antenna keepouts), with the 13 Pro's sides: a ring/silent switch in a pocket, Lightning, a 7.85 body. Its tolerances
// go by size (0 to 2 ±0.05, 2 to 10 ±0.08, 10 to 50 ±0.10, 50 to 100 ±0.20, 100 to 200 ±0.30), as the family's.
// Coordinates on the back follow Detail D: `fromSide` from the side-button edge, `fromTop` from the top edge. Depths
// from the back glass outward, or from the front face inward, as the drawing measures them. Sheet 2 also gives the
// flash's keepout (Detail H) and MagSafe's keepouts (its middle back view): features.json only.
import type { Phone } from '../../drawing.ts';
import type { Calibration, Region } from '../../../src/raster.ts';
import { v, type Kind } from '../../../src/provenance.ts';

/**
 * Where the scaled values were measured: regions of sheet 1 (PDF page 2) at 1200 dpi, each with its calibration
 * (measure.ts re-derives each: Detail D from its camera centres, the front view from its outer edges, the bottom view
 * from its outer edges and outlines). The front view's top edge is the solid line 225.5 px down; Detail A's dashed box
 * runs 2.06 above it (178 px). Detail D's scale is from the bump's straight lines, not the cameras: the outline and the
 * top read 46.04 and 46.05 px/mm across, 46.10 and 46.10 down (46.07 between); the camera calibration follows its guess
 * by up to 0.05 (concentric rings: at 46.085 it reads 46.137 down), so the guess is the lines'.
 */
export const detailD: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 15900, y: 2450, width: 2500, height: 2500 }, pxPerMm: 46.07, origin: [252.5, 284.5] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 6000, y: 5350, width: 2050, height: 3900 }, pxPerMm: 23.05, origin: [203.5, 225.5] };
export const bottomView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5450, y: 10900, width: 2050, height: 500 }, pxPerMm: 23.07, origin: [231.5, 262] };

/**
 * Detail D's rear mic at 4800 dpi, in Detail D's frame (measure.ts carries the calibration over). Sheet 2 (PDF page 3):
 * Detail H, the section through the flash, at 1200 dpi (drawn upright, the cover glass's face its left edge, the phone's
 * top edge `origin` down: the scale is from that face to the 11.76 extension line, 46.09 px/mm, Detail D's); and the
 * MagSafe view (the middle back view) at 1800 dpi, calibrated on its 0.00 and 65.04 lines across and its 0.00 and
 * -112.57 lines down (34.58 and 34.57 px/mm).
 */
export const micView: Region = { page: 2, dpi: 4800, crop: { x: 71196, y: 16800, width: 800, height: 800 } };
export const detailH: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 13300, y: 1500, width: 1300, height: 3200 }, pxPerMm: 46.09, origin: [298.5, 962] };
export const magsafeView: Region & Calibration = { page: 3, dpi: 1800, crop: { x: 17250, y: 10950, width: 3600, height: 6150 }, pxPerMm: 34.58, origin: [597, 594] };

const s1 = (what: string) => `sheet 1, ${what}`;
const s2 = (what: string) => `sheet 2, ${what}`;

export const body = {
  width: v(71.45, 'dimensioned', s1('front view: 71.45 PRODUCT WIDTH')),
  length: v(147.46, 'dimensioned', s1('right side view: 147.46 PRODUCT LENGTH')),
  thickness: v(7.85, 'dimensioned', s1('right side view: 7.85 PRODUCT THICKNESS')),
  glassWidth: v(69.35, 'dimensioned', s1('front view: 69.35 GLASS (1.05 ALL AROUND, EXTERIOR OF HOUSING TO START OF FLAT AREA ON TOP SIDE)')),
  glassLength: v(145.36, 'dimensioned', s1('right side view: 145.36 GLASS')),
  corner: {
    points: [
      [17.32, 0],
      [12.45, 0.08],
      [7.68, 1.0],
      [3.61, 3.61],
      [1.0, 7.68],
      [0.08, 12.45],
      [0, 17.32],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail A: CORNER PROFILE (ALL FOUR CORNERS); each label paired with the cross its leader reaches (as the 15 Pro\'s)'),
  },
  /** Flat to ±3.16 (the 4X 0.00 covers ±2.73 and ±3.16), then rounding toward the glass; its boxed 0.00 is the flat side. */
  edge: {
    points: [
      [0, 2.73],
      [0, 3.16],
      [0.13, 3.57],
      [0.48, 3.81],
      [0.91, 3.85],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail B: PROFILE (ALL SIDES); insets 4X 0.00, 2X 0.13, 2X 0.48, 2X 0.91 paired in order with ±2.73, ±3.16, ±3.57, ±3.81, ±3.85'),
  },
};

/**
 * Detail D draws the bump's outline 2.19 in (inside the back glass's heavy edge, about 1.05 in, unlike the 15 Pro's
 * 1.04) and its top 4.79 in; both 1.49 taller than wide.
 */
export const bump = {
  top: v(1.85, 'dimensioned', s1('right side view: 1.85 BACK GLASS TO CAMERA PLATEAU (its extension line lands on the bump\'s flat top)')),
  rings: v(4.18, 'dimensioned', s1('right side view: 4.18 BACK GLASS TO REAR CAMERA GLASS (on the lens rings, the outermost line)')),
  baseFrom: v(2.19, 'dimensioned', s1('Detail D: 2.19 (across and down)')),
  baseSize: v(41.93, 'derived', s1('Detail D: 44.12 - 2.19, across')),
  baseHeight: v(43.42, 'derived', s1('Detail D: -45.61 - -2.19, down')),
  baseRadius: v(12.34, 'scaled', 'Detail D: the outline\'s corners crossed on their diagonals, 12.34 at all four'),
  topFrom: v(4.79, 'dimensioned', s1('Detail D: 4.79 (across and down)')),
  topSize: v(36.73, 'derived', s1('Detail D: 41.52 - 4.79, across')),
  topHeight: v(38.22, 'derived', s1('Detail D: -43.01 - -4.79, down')),
  topRadius: v(9.7, 'scaled', 'Detail D: the top\'s corners crossed on their diagonals, 9.67 to 9.74'),
};

/** Which is which, from sheet 2's keepout cones: camera 1 the 3x Telephoto (38.23°), 2 the Main (88.90°), 3 the Ultra Wide (127.74°). */
export const cameras = {
  telephoto: {
    name: 'rear camera 1',
    label: 'Telephoto',
    fromSide: v(14.28, 'dimensioned', s1('Detail D: 2X 14.28 (rear cameras 1 and 2)')),
    fromTop: v(14.28, 'dimensioned', s1('Detail D: -14.28 REAR CAMERA 1')),
    ring: v(15.61, 'dimensioned', s1('Detail D: 3X Ø15.61')),
    window: v(12.78, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(4.02, 'dimensioned', s2('Section G-G: 4.02 REAR CAMERA 1 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(38.23, 'dimensioned', s2('Section G-G: 38.23° REAR CAMERA 1 KEEPOUT CONE')),
    identity: v(1, 'inferred', 'camera 1 is the Telephoto: its 38.23° cone encloses a 77 mm equivalent\'s 31.4°; camera 2\'s 88.90° the Main\'s 24 mm (84°); camera 3\'s 127.74° the Ultra Wide\'s 120° (spec). Numbered as the 13 Pro\'s, not the 15 Pro\'s'),
    equivalentFocal: v(77, 'spec', '12MP 3x Telephoto: 77 mm, ƒ/2.8 aperture'),
    aperture: v(2.8, 'spec', '3x Telephoto: ƒ/2.8'),
  },
  main: {
    name: 'rear camera 2',
    label: 'Main',
    fromSide: v(14.28, 'dimensioned', s1('Detail D: 2X 14.28 (rear cameras 1 and 2)')),
    fromTop: v(33.52, 'dimensioned', s1('Detail D: -33.52 REAR CAMERA 2')),
    ring: v(15.61, 'dimensioned', s1('Detail D: 3X Ø15.61')),
    window: v(12.75, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(7.84, 'dimensioned', s2('Section G-G: 7.84 REAR CAMERA 2 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(88.9, 'dimensioned', s2('Section G-G: 88.90° REAR CAMERA 2 KEEPOUT CONE')),
    equivalentFocal: v(24, 'spec', '48MP Main: 24 mm, ƒ/1.78 aperture'),
    aperture: v(1.78, 'spec', 'Main: ƒ/1.78'),
  },
  ultraWide: {
    name: 'rear camera 3',
    label: 'Ultra Wide',
    fromSide: v(32.12, 'dimensioned', s1('Detail D: 2X 32.12 (rear camera 3 and the flash)')),
    fromTop: v(23.9, 'dimensioned', s1('Detail D: -23.90 REAR CAMERA 3')),
    ring: v(15.61, 'dimensioned', s1('Detail D: 3X Ø15.61')),
    window: v(12.75, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(7.99, 'dimensioned', s2('Section J-J: 7.99 REAR CAMERA 3 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(127.74, 'dimensioned', s2('Section J-J: 127.74° REAR CAMERA 3 KEEPOUT CONE')),
    fov: v(120, 'spec', '12MP Ultra Wide: 13 mm, ƒ/2.2 aperture and 120° field of view'),
    aperture: v(2.2, 'spec', 'Ultra Wide: ƒ/2.2'),
  },
};

export const flash = {
  fromSide: v(32.12, 'dimensioned', s1('Detail D: 2X 32.12 FLASH')),
  fromTop: v(10.32, 'dimensioned', s1('Detail D: -10.32 FLASH')),
  diameter: v(6.9, 'dimensioned', s1('Detail D: Ø6.90 FLASH')),
};

/**
 * The flash's keepout, Detail H (sheet 2: the section on the 32.12 line, H-H beside J-J in Detail F, drawn upright),
 * as the 12 Pro's G-G: an inner cone from its apex (the "origin") turning into the outer cone at the transition. Follow
 * the arrows: both dimensions start on the section's left face, the cover glass (the front: the bump is on the right,
 * its top drawn 9.70 from that face, 7.85 + 1.85). 7.74's other arrow lands where the inner cone's two lines cross, with
 * a short extension line of its own under it: the apex, 0.11 inside the back glass. 11.76's extension line runs down to
 * the upper kink into the outer cone, 2.06 above the bump's top. measure.ts fits the drawn lines and checks each.
 *
 * Unlike the 12 Pro's (whose inner cone leaves the bump's top at the flash's Ø6.28 edge), this cone is narrower than
 * the flash where it leaves the bump: 2 (9.70 - 7.74) tan 56° = Ø5.81, against the Ø6.90 flash, 0.54 inside its edge
 * all round (drawn so: measure.ts). The keepout doesn't claim the flash's whole window; the field takes it as drawn.
 */
export const flashKeepout = {
  apexFromFront: v(7.74, 'dimensioned', s2('Detail H: 7.74 FLASH KEEPOUT CONE ORIGIN TO COVER GLASS (its arrow and a short extension line at the inner cone\'s apex, 0.11 inside the back glass)')),
  transitionFromFront: v(11.76, 'dimensioned', s2('Detail H: 11.76 FLASH KEEPOUT CONE TRANSITION TO COVER GLASS (its extension line reaches the inner cone\'s upper kink into the outer)')),
  inner: v(112, 'dimensioned', s2('Detail H: 112.00° FLASH INNER KEEPOUT CONE (one section, down the phone: taken as circular)')),
  outer: v(157, 'dimensioned', s2('Detail H: 157.00° FLASH OUTER KEEPOUT CONE')),
};

/**
 * The rear mic on the bump's top (inside the top's bottom-right R9.70 corner, 6.13 from the corner's centre). Across:
 * the 37.91 ordinate below Detail D, whose extension line rises to the mic's centre (beside 32.12, 41.52 and 44.12);
 * down: the -33.98 line runs in from the right to its centre. Two concentric circles are drawn there, Ø1.15 and Ø0.75
 * at 4800 dpi; the Ø1.15 leader's arrow lands on the outer one, and the printed number is the outer's. Sheet 2's MagSafe
 * view dimensions the same mic again, 37.91 across and -33.98 down (measure.ts finds both lines there).
 */
export const rearMic = {
  fromSide: v(37.91, 'dimensioned', s1('Detail D: 37.91 (the ordinate below the view; its extension line rises to the mic\'s centre); again on sheet 2\'s MagSafe view')),
  fromTop: v(33.98, 'dimensioned', s1('Detail D: -33.98 (the line runs in to the mic\'s centre); again on sheet 2\'s MagSafe view')),
  diameter: v(1.15, 'dimensioned', s1('Detail D: [2] Ø1.15 REAR MIC (its arrow lands on the outer of two circles, drawn Ø1.15; the inner is drawn Ø0.75)')),
};

/**
 * MagSafe's keepouts (sheet 2, the MagSafe view: the middle back view). The clear area (5: DO NOT OBSTRUCT THIS AREA
 * WITH METAL, CONDUCTIVE MATERIAL, OR MAGNETIC MATERIAL) is a whole Ø57.50 circle centred 35.73 across (PRODUCT CENTER,
 * half the 71.45) and 75.40 down, which is NOT labelled the product centre and isn't: half the 147.46 is 73.73, so the
 * circle sits 1.67 below it (drawn so: measure.ts fits it at 75.40; the 14 Pro Max's view labels its -80.36 PRODUCT
 * CENTER, half its length). The magnetic zone (5 7: DO NOT OBSTRUCT THIS AREA WITH MAGNETIC OR PERMEABLE MATERIAL
 * EXCEPT MAGSAFE MAGNETS) is the 16's shape: the full width from the camera corner's keepout's bottom down, straight-
 * sided to -112.57, closed by an R49.39 arc through those corners, whose centre (derived: 112.57 - √(49.39² - 35.725²)
 * = 78.47 down) is 3.07 below the clear circle's.
 *
 * The drawing contradicts itself on the zone's top. Its line is labelled -28.29, but it's drawn 45.61 down (on both
 * sides of the crosshatch and across the full width: measure.ts), on the bump outline's dimensioned -45.61 (Detail D),
 * where the crosshatched camera corner above it ends; nothing is drawn 28.29 down (that would cut through camera 2 and
 * the mic, inside the corner it bounds). The line is taken where it's drawn and where Detail D dimensions it, 45.61; the
 * printed 28.29 is recorded as the contradiction. Neither datum explains it exactly: from the product centre (73.73)
 * the drawn line is 28.12 up, 0.17 off (outside the ±0.10 tolerance); 45.61 - 17.32 (Detail A's corner) is 28.29, which
 * may be coincidence. The drawing doesn't say.
 */
export const magsafe = {
  fromSide: v(35.73, 'dimensioned', s2('MagSafe view: 35.73 PRODUCT CENTER')),
  fromTop: v(75.4, 'dimensioned', s2('MagSafe view: -75.40 (the clear circle\'s centre line; not labelled PRODUCT CENTER, and 1.67 below it)')),
  diameter: v(57.5, 'dimensioned', s2('MagSafe view: Ø57.50 (its leader on the clear area\'s circle; measure.ts fits the circle round 35.73, 75.40)')),
  zoneFrom: v(45.61, 'inferred', s2('MagSafe view: the zone\'s top, the full width, labelled -28.29 but drawn 45.61 down, on Detail D\'s -45.61 bump outline (the printed 28.29 contradicts its own line: taken as drawn and as Detail D dimensions it)')),
  zoneSidesTo: v(112.57, 'dimensioned', s2('MagSafe view: 2X -112.57, where the zone\'s sides (the phone\'s) meet its arc')),
  zoneRadius: v(49.39, 'dimensioned', s2('MagSafe view: R49.39, the arc closing the zone below')),
};

/**
 * What the MagSafe view gives beyond the family's fields (not built, not in features.json):
 * - the printed -28.29 on the zone's top line (see `magsafe`);
 * - above the zone, the camera corner (0.00 to 44.12 across, 0.00 to the zone's top down, crosshatched): DO NOT
 *   OBSTRUCT THIS AREA WITH METAL OR OTHER CONDUCTIVE MATERIAL (FULL PRODUCT VOLUME INCLUDING SIDEWALLS), where the 14's
 *   says magnetic or permeable; 44.12 is the bump outline's (Detail D); the rest of the top carries no keepout but the
 *   compass;
 * - the COMPASS, a small hatched circle centred 65.04 across, -9.20 down (its size not dimensioned).
 * Sheet 2's left back view and side view give other keepouts (metal and conductive material: the bump's corner zone,
 * the bottom band, the side band) and Detail E the front sensors'; sheet 3 the antenna keepouts (Detail K): not
 * recorded here.
 */
export const magsafeExtras = {
  zoneTopPrinted: v(28.29, 'dimensioned', s2('MagSafe view: -28.29 on the zone\'s top line (drawn 45.61 down: contradicts it)')),
  cameraZone: { across: v(44.12, 'dimensioned', s2('MagSafe view: 44.12, the camera corner\'s keepout, its edge (Detail D\'s bump outline)')) },
  compass: { fromSide: v(65.04, 'dimensioned', s2('MagSafe view: 65.04 COMPASS')), fromTop: v(9.2, 'dimensioned', s2('MagSafe view: -9.20 COMPASS')) },
};

/**
 * The LiDAR scanner: sheet 2's Detail F gives its keepout on the plateau, a 4.92 x 8.96 rectangle with barely rounded
 * corners (no radius given), centred on the 32.12 line (J-J) 37.50 down. Its corners are taken square: a keepout's
 * cautious side.
 */
export const sensor = {
  name: 'LiDAR scanner',
  fromSide: v(32.12, 'dimensioned', s2('Detail F: on the 32.12 line (Section J-J through camera 3 and the sensor)')),
  fromTop: v(37.5, 'dimensioned', s2('Detail F: -37.50 REAR SENSOR KEEPOUT CONTACTING PLATEAU SURFACE')),
  keepoutCone: v(62.08, 'dimensioned', s2('Section J-J: 62.08° REAR SENSOR KEEPOUT CONE')),
  window: {
    width: v(4.92, 'dimensioned', s2('Detail F: 4.92')),
    length: v(8.96, 'dimensioned', s2('Detail F: 8.96')),
    radius: v(0, 'assumed', 'Detail F draws the corners barely rounded (about R0.2 at 1200 dpi) and gives no radius: square, the keepout\'s cautious side'),
  },
};

export const lightning = {
  name: 'Lightning' as const,
  width: v(12.59, 'dimensioned', s1('Detail C: 12.59 RECOMMENDED CONNECTOR KEEPOUT (2X R3.34 corners)')),
  thickness: v(6.85, 'dimensioned', s1('Detail C: 6.85 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(35.73, 'dimensioned', s1('Detail C: 35.73 (the port\'s centre, from the side-button edge)')),
  fromBack: v(3.85, 'dimensioned', s1('Detail C: 3.85, the port\'s centre line to the back glass')),
  outward: v(14.0, 'dimensioned', s1('Detail C: MATING CONNECTOR KEEPOUT AREA FLUSH TO PRODUCT SURFACE REQUIRED OUTWARD 14.0 mm')),
};

export const front = {
  activeWidth: v(65.08, 'dimensioned', s1('front view: 65.08 DISPLAY ACTIVE AREA')),
  activeLength: v(141.09, 'dimensioned', s1('front view: 141.09 DISPLAY ACTIVE AREA')),
  activeFromEdge: v(3.19, 'dimensioned', s1('front view: 3.19 ALL AROUND, EXTERIOR OF HOUSING TO DISPLAY ACTIVE AREA')),
  activeRadius: v(9.11, 'scaled', 'front view: the top corners crossed on their diagonals, 9.11 at both (the hatch runs along the bottom-left diagonal and merges with the bottom-right arc: measure.ts)'),
  islandLength: v(20.69, 'dimensioned', s1('Detail A: 20.69 (the Dynamic Island, a pill)')),
  islandHeight: v(6.07, 'dimensioned', s1('Detail A: 6.07')),
  islandFromTop: v(8.1, 'dimensioned', s1('Detail A: -8.10 (its centre line); centred across, on the 2X 35.73 line')),
  /**
   * The receiver, 14.40 x 0.75 centred 1.27 from the top (Detail A), straddles the glass's edge (1.05 in, the front
   * view's): modelled as its part inside the glass, 1.06 to 1.645 (the 15 Pro's treatment).
   */
  receiverLength: v(14.4, 'dimensioned', s1('Detail A: 14.40 (the receiver)')),
  receiverHeight: v(0.585, 'derived', s1('Detail A: 0.75 at -1.27, the part inside the glass (from 1.06, just inside its 1.05 edge, to 1.645)')),
  receiverFromTop: v(1.3525, 'derived', s1('Detail A: the middle of that part')),
  receiverDepth: v(0.3, 'assumed', 'the slot\'s depth for a render: the drawing gives none'),
};

export const buttons = {
  ringSilent: {
    side: 'volume' as const,
    centre: v(31.14, 'dimensioned', s1('left side view: 31.14 POCKET CENTER')),
    half: v(2.96, 'dimensioned', s1('left side view: 2X 2.96 (centre to each end of the pocket)')),
    width: v(2.35, 'dimensioned', s1('left side view: 2.35')),
    fromBack: v(3.85, 'dimensioned', s1('left side view: 3.85 POCKET CENTER, from the back glass\'s line')),
    proud: v(0.6, 'dimensioned', s1('front view: 0.60 RING/SILENT SWITCH')),
    note: 'the switch sits in a 5.92 x 2.35 pocket; modelled as a block of the pocket\'s size standing 0.60 proud',
  },
  volumeUp: {
    side: 'volume' as const,
    centre: v(44.59, 'dimensioned', s1('left side view: 44.59 (+) VOLUME BUTTON')),
    half: v(5.9, 'dimensioned', s1('left side view: 4X 5.90')),
    width: v(3.26, 'dimensioned', s1('left side view: 2X 3.26')),
    fromBack: v(3.92, 'dimensioned', s1('left side view: 2X 3.92, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (+) VOLUME BUTTON')),
    note: '',
  },
  volumeDown: {
    side: 'volume' as const,
    centre: v(58.79, 'dimensioned', s1('left side view: 58.79 (-) VOLUME BUTTON')),
    half: v(5.9, 'dimensioned', s1('left side view: 4X 5.90')),
    width: v(3.26, 'dimensioned', s1('left side view: 2X 3.26')),
    fromBack: v(3.92, 'dimensioned', s1('left side view: 2X 3.92, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (-) VOLUME BUTTON')),
    note: '',
  },
  side: {
    side: 'side' as const,
    centre: v(55.54, 'dimensioned', s1('right side view: 55.54 SIDE BUTTON')),
    half: v(9.15, 'dimensioned', s1('right side view: 2X 9.15')),
    width: v(3.26, 'dimensioned', s1('right side view: 3.26')),
    fromBack: v(3.92, 'dimensioned', s1('right side view: 3.92, from the back glass\'s line (its arrow lands on the bump side, unlike the 13s\' and 15 Pro\'s right views)')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 SIDE BUTTON')),
    note: '',
  },
};

export const simTray = {
  centre: v(86.24, 'dimensioned', s1('left side view: 86.24 SIM TRAY')),
  length: v(15.94, 'derived', s1('left side view: 2X 7.97, centre to each end')),
  width: v(2.56, 'dimensioned', s1('left side view: 2.56')),
  fromBack: v(3.92, 'dimensioned', s1('left side view: 3.92, from the back glass\'s line')),
};

/**
 * The bottom edge, from the volume-button edge. Only each group's end holes are dimensioned, and (as on the 13s, unlike
 * the 15 Pro) their extension lines touch the holes' outer edges: 19.11 and 25.15 bound the three on the left, 46.31
 * and 56.86 the five on the right. At 1200 dpi the chords centre on 19.87, 22.13, 24.38 and 47.04 to 56.06; as edges
 * the spans fit the 2.255 pitch (4.51, 9.02), as centres they wouldn't (3.02, 2.64). A hole's centre is half its 1.53
 * inside; the holes between are evenly spaced, as drawn.
 */
const R = 1.53 / 2;
const group = (from: number, to: number, n: number, which: string) => {
  const [a, b] = [from + R, to - R];
  return Array.from({ length: n }, (_, i) => {
    const mm = +(a + ((b - a) * i) / (n - 1)).toFixed(3);
    const how = i === 0 ? `${from} + 0.765: ${from} lands on the hole's outer edge` : i === n - 1 ? `${to} - 0.765: ${to} lands on the hole's outer edge` : `evenly between, as drawn`;
    return v(mm, i === 0 || i === n - 1 ? 'derived' : 'inferred', s1(`bottom view, the ${which} group (8X Ø1.53 PORTS): ${how}`));
  });
};

export const bottom = {
  holes: [...group(19.11, 25.15, 3, 'left'), ...group(46.31, 56.86, 5, 'right')],
  holeDiameter: v(1.53, 'dimensioned', s1('bottom view: 8X Ø1.53 PORTS')),
  holesFromBack: v(3.85, 'dimensioned', s1('bottom view: 3.85, the holes\' centre line to the back glass\'s line')),
  holeDepth: v(0.6, 'assumed', 'a mic or speaker hole\'s depth for a render: the drawing gives none'),
  screws: [29.33, 42.12].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (2X Ø1.50 SCREW; the chords centre on it)`))),
  screwDiameter: v(1.5, 'dimensioned', s1('bottom view: 2X Ø1.50 SCREW')),
  screwsFromBack: v(3.85, 'inferred', 'Detail C draws the screws on the holes\' centre line'),
  portFrom: v(31.35, 'dimensioned', s1('bottom view: 31.35 (the Lightning port\'s near end)')),
  portTo: v(40.11, 'dimensioned', s1('bottom view: 40.11 (its far end; centre 35.73, as Detail C\'s 35.73)')),
  portHeight: v(3.01, 'dimensioned', s1('Detail C: 3.01 (the port\'s outer outline across the thickness); its ends round (inferred)')),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none'),
};

export const mass = v(206, 'spec', 'Weight: 7.27 ounces (206 grams)');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '4:3 at 12MP (the Ultra Wide and Telephoto; the Main\'s 48MP sensor bins to 12MP by default); 4032 x 3024 is the usual 4:3 still size, not on the spec page' };

/** Everything above, as the family's builder (iphone/part.ts) reads it. */
export const phone: Phone = {
  part: {
    title: 'iPhone 14 Pro',
    name: 'iphone-14-pro.dat',
    keywords: ['Apple', 'iPhone 14 Pro', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [['2026-10-31', 'Built from Apple\'s dimensional drawing: body, cameras, LiDAR, buttons, Lightning, Dynamic Island']],
    drawn: '2022-09-21',
    folder: 'iphone-14-pro',
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
