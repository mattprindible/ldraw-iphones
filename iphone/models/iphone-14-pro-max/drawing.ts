// iPhone 14 Pro Max, read from Apple's dimensional drawing (iphone/drawings/iphone-14-pro-max.pdf, sheets 1
// to 3, dated 2022-09-21). Every number carries where it came from and how we know it (src/provenance.ts): spec here
// is Apple's technical specifications page (support.apple.com/111846); scaled values are re-measured by measure.ts.
//
// The 14 Pro drawn larger, lettered as the 14 Plus (and the 15s), not as the 14 Pro: Detail D is the corner (with the
// Dynamic Island and the receiver), B the edge profile, C the Lightning port, A the back; sheet 2 the keepout sections
// (G-G, H-H, J-J), Detail E (front sensor keepouts) and Detail F (the LiDAR's keepout on the plateau); sheet 3 antenna
// keepouts. What it shares with the 14 Pro: the back (every number in Detail A: cameras, flash, rear mic, the bump's
// outline and top), the bump's heights (1.85, 4.18), the thickness (7.85), the island's height and place (6.07 at
// -8.10), the receiver's height and place (0.75 at -1.27), the edge profile's heights (±2.73 to ±3.85), the buttons'
// places down the sides. What differs besides the size: the corner (17.32 along the top, 15.55 down the side, not
// symmetric: the 14 Plus's pattern), the edge profile's insets (0.00, 0.01, 0.14, 0.49, 0.92), the island (20.76 long)
// and receiver (14.21), the cones (camera 1 38.23° from 4.12, camera 2 88.90° from 7.80, camera 3 125.12° from 8.09),
// the LiDAR keepout (4.78 x 8.82), the pocket (2.25 wide, 3.82 from the back) and the volume buttons and SIM tray (3.85
// from the back), ten holes on the bottom (4 + 6), the port's keepout (13.65, R3.40). Its tolerances go by size (0 to 2
// ±0.05, 2 to 10 ±0.08, 10 to 50 ±0.10, 50 to 100 ±0.20, 100 to 200 ±0.30), as the family's.
//
// Coordinates on the back follow Detail A: `fromSide` from the side-button edge, `fromTop` from the top edge. Depths
// from the back glass outward, or from the front face inward, as the drawing measures them. Sheet 2 also gives the
// flash's keepout (Section H-H) and MagSafe's keepouts (its middle back view): features.json only.
import type { Phone } from '../../drawing.ts';
import type { Calibration, Region } from '../../../src/raster.ts';
import { v, type Kind } from '../../../src/provenance.ts';

/**
 * Where the scaled values were measured: regions of sheet 1 (PDF page 2) at 1200 dpi, each with its calibration
 * (measure.ts re-derives each: Detail A from its camera centres, the front view from its outer edges, the bottom view
 * from its outer edges and outlines, Detail D from the corner's leaders, for the corner's diagonal point). Detail A's
 * scale is from the bump's straight lines, not the cameras (as on the 14 Pro): the camera calibration follows its guess
 * by up to 0.05 px/mm (at 46.04 it reads 46.09 down, at 46.13 46.08: concentric rings let the circle finder settle
 * differently), while at 46.07 the bump's outline and top read within 0.02 of their sizes both ways.
 */
export const detailA: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 15780, y: 1465, width: 2500, height: 2500 }, pxPerMm: 46.07, origin: [251.8, 281.3] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 6544, y: 4400, width: 2200, height: 4100 }, pxPerMm: 23.05, origin: [190.5, 206.5] };
export const bottomView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 6526, y: 10390, width: 2200, height: 520 }, pxPerMm: 23.05, origin: [208.5, 262] };
export const detailD: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 9750, y: 1250, width: 2700, height: 1400 }, pxPerMm: 46.13, origin: [222, 241.1] };

/**
 * Detail A's rear mic at 4800 dpi, in Detail A's frame (measure.ts carries the calibration over). Sheet 2 (PDF page 3):
 * Section H-H, through the flash, at 1200 dpi (drawn upright, the cover glass's face its left edge, the phone's top
 * edge `origin` down: the scale is from that face to the 11.76 extension line, 46.09 px/mm); and the MagSafe view (the
 * middle back view) at 1800 dpi, calibrated on its 0.00 and 71.17 lines across and its 0.00 and -114.82 lines down
 * (34.57 px/mm both ways: the front view's scale).
 */
export const micView: Region = { page: 2, dpi: 4800, crop: { x: 70712, y: 12848, width: 800, height: 800 } };
export const sectionH: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 13936, y: 1252, width: 1300, height: 3200 }, pxPerMm: 46.09, origin: [298.5, 962.5] };
export const magsafeView: Region & Calibration = { page: 3, dpi: 1800, crop: { x: 16965, y: 10404, width: 3600, height: 6700 }, pxPerMm: 34.57, origin: [588.5, 596.5] };

const s1 = (what: string) => `sheet 1, ${what}`;
const s2 = (what: string) => `sheet 2, ${what}`;

/**
 * Detail D gives seven points on the corner and none on its diagonal, which the builder's monotone halves meet at: the
 * product outline's crossing of the corner's 45° diagonal, scaled (as the 14 Plus's). Its middle cross, (4.25, 3.01),
 * is 0.88 off the diagonal: the corner isn't symmetric (17.32 along the top, 15.55 down the side).
 */
export const cornerDiagonal = v(3.62, 'scaled', 'Detail D: the product outline (the thin outer line the crosses sit on) crossed on the corner\'s 45° diagonal, at 4800 dpi');

export const body = {
  width: v(77.58, 'dimensioned', s1('front view: 77.58 PRODUCT WIDTH')),
  length: v(160.71, 'dimensioned', s1('right side view: 160.71 PRODUCT LENGTH')),
  thickness: v(7.85, 'dimensioned', s1('right side view: 7.85 PRODUCT THICKNESS')),
  glassWidth: v(75.48, 'dimensioned', s1('front view: 75.48 GLASS (1.05 a side; the note beside it says "1.15 ALL AROUND, EXTERIOR OF HOUSING TO START OF FLAT AREA ON TOP SIDE OF PRODUCT": see flatFrom)')),
  glassLength: v(158.61, 'dimensioned', s1('right side view: 158.61 GLASS')),
  /**
   * The plan-view corner, (along the top edge, down the side) from the corner: Detail D's crosses, each paired with the
   * two leaders that reach it (read at 1200 dpi, where each cross sits on the thin product outline where its leaders
   * meet). Not symmetric about the diagonal: 17.32 along the top, 15.55 down the side.
   */
  corner: {
    points: [
      [17.32, 0],
      [12.74, 0.06],
      [8.23, 0.81],
      [4.25, 3.01],
      [cornerDiagonal.mm, cornerDiagonal.mm],
      [1.47, 6.6],
      [0.21, 10.98],
      [0, 15.55],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail D: CORNER PROFILE (ALL FOUR CORNERS); across 0.00 (boxed), 0.21, 1.47, 4.25, 8.23, 12.74, 17.32 and down 0.00 (boxed), -0.06, -0.81, -3.01, -6.60, -10.98, -15.55, paired by their leaders; the diagonal point scaled (cornerDiagonal)'),
  },
  /** Flat to ±2.73 (the boxed 0.00), then rounding toward the glass; it ends at ±3.85, 0.075 short of half the 7.85 (as the 14 Pro's). */
  edge: {
    points: [
      [0, 2.73],
      [0.01, 3.16],
      [0.14, 3.57],
      [0.49, 3.81],
      [0.92, 3.85],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail B: PROFILE (ALL SIDES), symmetric about the mid-plane; insets 0.00 (boxed), 2X 0.01, 2X 0.14, 2X 0.49, 2X 0.92 paired in order with ±2.73, ±3.16, ±3.57, ±3.81, ±3.85'),
  },
};

/**
 * Not read by the builder: the front view's "1.15 ALL AROUND, EXTERIOR OF HOUSING TO START OF FLAT AREA ON TOP SIDE OF
 * PRODUCT" (the 14 Pro's sheet says 1.05 there). The glass dimensions (75.48, 158.61) put the glass 1.05 in, and
 * Detail B's profile reaches its top (3.85) at 0.92 in; the part follows the glass and Detail B. Detail A labels the
 * back glass's heavy edge -1.15 down from the top (and an across leader to the same edge reads "-16.17", which fits
 * nothing on the back: recorded, not used).
 */
export const flatFrom = v(1.15, 'dimensioned', s1('front view: 1.15 ALL AROUND, EXTERIOR OF HOUSING TO START OF FLAT AREA ON TOP SIDE OF PRODUCT'));

/**
 * Detail A draws the bump's outline 2.19 in (inside the back glass's heavy edge, 1.15 in) and its top 4.79 in; both
 * 1.49 taller than wide. The 14 Pro's numbers, every one.
 */
export const bump = {
  top: v(1.85, 'dimensioned', s1('right side view: 1.85 BACK GLASS TO CAMERA PLATEAU (its extension line lands on the bump\'s flat top)')),
  rings: v(4.18, 'dimensioned', s1('right side view: 4.18 BACK GLASS TO REAR CAMERA GLASS (on the lens rings, the outermost line)')),
  baseFrom: v(2.19, 'dimensioned', s1('Detail A: 2.19 (across and down)')),
  baseSize: v(41.93, 'derived', s1('Detail A: 44.12 - 2.19, across')),
  baseHeight: v(43.42, 'derived', s1('Detail A: -45.61 - -2.19, down')),
  baseRadius: v(12.31, 'scaled', 'Detail A: the outline\'s corners crossed on their diagonals, 12.26 to 12.34'),
  topFrom: v(4.79, 'dimensioned', s1('Detail A: 4.79 (across and down)')),
  topSize: v(36.73, 'derived', s1('Detail A: 41.52 - 4.79, across')),
  topHeight: v(38.22, 'derived', s1('Detail A: -43.01 - -4.79, down')),
  topRadius: v(9.7, 'scaled', 'Detail A: the top\'s corners crossed on their diagonals, 9.67 to 9.74'),
};

/** Which is which, from sheet 2's keepout cones: camera 1 the 3x Telephoto (38.23°), 2 the Main (88.90°), 3 the Ultra Wide (125.12°). */
export const cameras = {
  telephoto: {
    name: 'rear camera 1',
    label: 'Telephoto',
    fromSide: v(14.28, 'dimensioned', s1('Detail A: 2X 14.28 (rear cameras 1 and 2)')),
    fromTop: v(14.28, 'dimensioned', s1('Detail A: -14.28 REAR CAMERA 1')),
    ring: v(15.61, 'dimensioned', s1('Detail A: 3X Ø15.61')),
    window: v(12.75, 'scaled', 'Detail A: the innermost of the camera\'s circles (the 14 Pro\'s reads 12.78; here 12.75)'),
    coneApexFromFront: v(4.12, 'dimensioned', s2('Section G-G: 4.12 REAR CAMERA 1 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(38.23, 'dimensioned', s2('Section G-G: 38.23° REAR CAMERA 1 KEEPOUT CONE')),
    identity: v(1, 'inferred', 'camera 1 is the Telephoto: its 38.23° cone encloses a 77 mm equivalent\'s 31.4°; camera 2\'s 88.90° the Main\'s 24 mm (84°); camera 3\'s 125.12° the Ultra Wide\'s 120° (spec). Numbered as the 14 Pro\'s, the same cameras in the same places'),
    equivalentFocal: v(77, 'spec', '12MP 3x Telephoto: 77 mm, ƒ/2.8 aperture'),
    aperture: v(2.8, 'spec', '3x Telephoto: ƒ/2.8'),
  },
  main: {
    name: 'rear camera 2',
    label: 'Main',
    fromSide: v(14.28, 'dimensioned', s1('Detail A: 2X 14.28 (rear cameras 1 and 2)')),
    fromTop: v(33.52, 'dimensioned', s1('Detail A: -33.52 REAR CAMERA 2')),
    ring: v(15.61, 'dimensioned', s1('Detail A: 3X Ø15.61')),
    window: v(12.75, 'scaled', 'Detail A: the innermost of the camera\'s circles'),
    coneApexFromFront: v(7.8, 'dimensioned', s2('Section G-G: 7.80 REAR CAMERA 2 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(88.9, 'dimensioned', s2('Section G-G: 88.90° REAR CAMERA 2 KEEPOUT CONE')),
    equivalentFocal: v(24, 'spec', '48MP Main: 24 mm, ƒ/1.78 aperture'),
    aperture: v(1.78, 'spec', 'Main: ƒ/1.78'),
  },
  ultraWide: {
    name: 'rear camera 3',
    label: 'Ultra Wide',
    fromSide: v(32.12, 'dimensioned', s1('Detail A: 2X 32.12 (rear camera 3 and the flash)')),
    fromTop: v(23.9, 'dimensioned', s1('Detail A: -23.90 REAR CAMERA 3')),
    ring: v(15.61, 'dimensioned', s1('Detail A: 3X Ø15.61')),
    window: v(12.76, 'scaled', 'Detail A: the innermost of the camera\'s circles'),
    coneApexFromFront: v(8.09, 'dimensioned', s2('Section J-J: 8.09 REAR CAMERA 3 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(125.12, 'dimensioned', s2('Section J-J: 125.12° REAR CAMERA 3 KEEPOUT CONE')),
    fov: v(120, 'spec', '12MP Ultra Wide: 13 mm, ƒ/2.2 aperture and 120° field of view'),
    aperture: v(2.2, 'spec', 'Ultra Wide: ƒ/2.2'),
  },
};

export const flash = {
  fromSide: v(32.12, 'dimensioned', s1('Detail A: 2X 32.12 FLASH')),
  fromTop: v(10.32, 'dimensioned', s1('Detail A: -10.32 FLASH')),
  diameter: v(6.9, 'dimensioned', s1('Detail A: Ø6.90 FLASH')),
};

/**
 * The flash's keepout, Section H-H (sheet 2: the section on the 32.12 line, H-H beside J-J in Detail F, drawn upright):
 * the 14 Pro's Detail H, number for number, as the 12 Pro's G-G: an inner cone from its apex (the "origin") turning
 * into the outer cone at the transition. Follow the arrows: both dimensions start on the section's left face, the cover
 * glass (the front: the bump is on the right, its top drawn 9.70 from that face, 7.85 + 1.85). 7.74's other arrow lands
 * where the inner cone's two lines cross, with an extension line of its own under it: the apex, 0.11 inside the back
 * glass. 11.76's extension line runs down to the upper kink into the outer cone, 2.06 above the bump's top. measure.ts
 * fits the drawn lines and checks each.
 *
 * As on the 14 Pro, the inner cone is narrower than the flash where it leaves the bump: 2 (9.70 - 7.74) tan 56° = Ø5.81,
 * against the Ø6.90 flash, 0.54 inside its edge all round (drawn so: measure.ts). The field takes it as drawn.
 */
export const flashKeepout = {
  apexFromFront: v(7.74, 'dimensioned', s2('Section H-H: 7.74 FLASH KEEPOUT CONE ORIGIN TO COVER GLASS (its arrow and an extension line at the inner cone\'s apex, 0.11 inside the back glass)')),
  transitionFromFront: v(11.76, 'dimensioned', s2('Section H-H: 11.76 FLASH KEEPOUT CONE TRANSITION TO COVER GLASS (its extension line reaches the inner cone\'s upper kink into the outer)')),
  inner: v(112, 'dimensioned', s2('Section H-H: 112.00° FLASH INNER KEEPOUT CONE (one section, down the phone: taken as circular)')),
  outer: v(157, 'dimensioned', s2('Section H-H: 157.00° FLASH OUTER KEEPOUT CONE')),
};

/**
 * The rear mic on the bump's top (inside the top's bottom-right R9.70 corner, 6.13 from the corner's centre): the 14
 * Pro's, number for number. Across: the 37.91 ordinate below Detail A, whose extension line rises to the mic's centre
 * (beside 41.52 and 44.12); down: the -33.98 line runs in from the right to its centre. Two concentric circles are drawn
 * there (at 4800 dpi); the Ø1.15 leader's arrow lands on the outer one, and the printed number is the outer's
 * (measure.ts). Swapped (33.98 across, 37.91 down) the place is the bump's bare top, below camera 3: nothing drawn there.
 * Sheet 2's MagSafe view doesn't dimension it (the 14 Pro's does).
 */
export const rearMic = {
  fromSide: v(37.91, 'dimensioned', s1('Detail A: 37.91 (the ordinate below the view; its extension line rises to the mic\'s centre)')),
  fromTop: v(33.98, 'dimensioned', s1('Detail A: -33.98 (the line runs in from the right to the mic\'s centre)')),
  diameter: v(1.15, 'dimensioned', s1('Detail A: [2] Ø1.15 REAR MIC (its arrow lands on the outer of two concentric circles)')),
};

/**
 * MagSafe's keepouts (sheet 2, the MagSafe view: the middle back view). The clear area (5: DO NOT OBSTRUCT THIS AREA
 * WITH METAL, CONDUCTIVE MATERIAL, OR MAGNETIC MATERIAL) is a whole Ø57.50 circle centred on the product centre, both
 * lines labelled so: 38.79 PRODUCT CENTER (half the 77.58) and -80.36 PRODUCT CENTER (half the 160.71, 80.355). The
 * magnetic zone (5 7: DO NOT OBSTRUCT THIS AREA WITH MAGNETIC OR PERMEABLE MATERIAL EXCEPT MAGSAFE MAGNETS) is the 16's
 * shape: the full width from the camera corner's keepout's bottom down, straight-sided to 2X -114.82, closed by an
 * R51.89 arc through those corners. Unlike the 16's and the 14 Pro's, the arc's centre IS the product centre: 114.82 -
 * √(51.89² - 38.79²) = 80.354 (derived; measure.ts checks it, and the drawn arc).
 *
 * The zone's top carries no number. It's drawn straight across the full width (below the camera corner's crosshatch and
 * across the open top) 47.18 down: 1.57 below the bump's outline (-45.61, Detail A, which the view also draws, at
 * 45.60), so not on it, as the 14 Pro's zone top is. Scaled (measure.ts reads it on eleven columns).
 */
export const magsafe = {
  fromSide: v(38.79, 'dimensioned', s2('MagSafe view: 38.79 PRODUCT CENTER')),
  fromTop: v(80.36, 'dimensioned', s2('MagSafe view: -80.36 PRODUCT CENTER (half the 160.71)')),
  diameter: v(57.5, 'dimensioned', s2('MagSafe view: Ø57.50 (its leader on the clear area\'s circle; measure.ts fits the circle round 38.79, 80.36)')),
  zoneFrom: v(47.18, 'scaled', 'MagSafe view: the zone\'s top, the full width, not dimensioned: drawn 47.18 down (1.57 below the bump outline\'s -45.61, which the view draws at 45.60)'),
  zoneSidesTo: v(114.82, 'dimensioned', s2('MagSafe view: 2X -114.82, where the zone\'s sides (the phone\'s) meet its arc')),
  zoneRadius: v(51.89, 'dimensioned', s2('MagSafe view: R51.89, the arc closing the zone below')),
};

/**
 * What the MagSafe view gives beyond the family's fields (not built, not in features.json):
 * - above the zone, the camera corner (0.00 to 44.12 across, 0.00 to the zone's top down, crosshatched): DO NOT
 *   OBSTRUCT THIS AREA WITH MAGNETIC OR PERMEABLE MATERIAL (FULL PRODUCT VOLUME INCLUDING SIDE WALLS), the 14's wording
 *   (the 14 Pro's says metal or other conductive material); 44.12 is the bump outline's (Detail A);
 * - the COMPASS, a small hatched circle centred 71.17 across, -9.20 down (its size not dimensioned).
 * Sheet 2's left back view and side view give other keepouts (metal and conductive material: the camera corner's zone,
 * the bottom band, the side band) and Detail E the front sensors'; sheet 3 the antenna keepouts: not recorded here.
 */
export const magsafeExtras = {
  cameraZone: { across: v(44.12, 'dimensioned', s2('MagSafe view: 44.12, the camera corner\'s keepout, its edge (Detail A\'s bump outline)')) },
  compass: { fromSide: v(71.17, 'dimensioned', s2('MagSafe view: 71.17 COMPASS')), fromTop: v(9.2, 'dimensioned', s2('MagSafe view: -9.20 COMPASS')) },
};

/**
 * The LiDAR scanner: sheet 2's Detail F gives its keepout on the plateau, a 4.78 x 8.82 rectangle with barely rounded
 * corners (no radius given), centred on the 32.12 line (J-J) 37.50 down. Its corners are taken square: a keepout's
 * cautious side.
 */
export const sensor = {
  name: 'LiDAR scanner',
  fromSide: v(32.12, 'dimensioned', s2('Detail F: on the 32.12 line (Section J-J through camera 3 and the sensor)')),
  fromTop: v(37.5, 'dimensioned', s2('Detail F: -37.50 REAR SENSOR KEEPOUT CONTACTING PLATEAU SURFACE')),
  keepoutCone: v(62.08, 'dimensioned', s2('Section J-J: 62.08° REAR SENSOR KEEPOUT CONE')),
  window: {
    width: v(4.78, 'dimensioned', s2('Detail F: 4.78')),
    length: v(8.82, 'dimensioned', s2('Detail F: 8.82')),
    radius: v(0, 'assumed', 'Detail F draws the corners barely rounded (about R0.2 at 1200 dpi) and gives no radius: square, the keepout\'s cautious side'),
  },
};

export const lightning = {
  name: 'Lightning' as const,
  width: v(13.65, 'dimensioned', s1('Detail C: 13.65 RECOMMENDED CONNECTOR KEEPOUT (2X R3.40 corners)')),
  thickness: v(6.85, 'dimensioned', s1('Detail C: 6.85 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(38.79, 'dimensioned', s1('Detail C: 38.79 (the port\'s centre to the side-button edge; the phone\'s middle, 77.58 / 2)')),
  fromBack: v(3.85, 'dimensioned', s1('Detail C: 3.85, the port\'s centre line to the back glass')),
  outward: v(14.0, 'dimensioned', s1('Detail C: MATING CONNECTOR KEEPOUT AREA FLUSH TO PRODUCT SURFACE REQUIRED OUTWARD 14.0 mm')),
};

export const front = {
  activeWidth: v(71.21, 'dimensioned', s1('front view: 71.21 DISPLAY ACTIVE AREA')),
  activeLength: v(154.34, 'dimensioned', s1('front view: 154.34 DISPLAY ACTIVE AREA')),
  activeFromEdge: v(3.19, 'dimensioned', s1('front view: 3.19 ALL AROUND, EXTERIOR OF HOUSING TO DISPLAY ACTIVE AREA')),
  activeRadius: v(9.11, 'scaled', 'front view: the top-left, top-right and bottom-right corners crossed on their diagonals, 9.11 at all three (the hatch runs along the bottom-left diagonal: measure.ts)'),
  islandLength: v(20.76, 'dimensioned', s1('Detail D: 20.76 (the Dynamic Island, a pill)')),
  islandHeight: v(6.07, 'dimensioned', s1('Detail D: 6.07')),
  islandFromTop: v(8.1, 'dimensioned', s1('Detail D: -8.10 (its centre line); centred across, on the 2X 38.79 line')),
  /**
   * The receiver, 14.21 x 0.75 centred 1.27 from the top (Detail D), straddles the glass's edge (1.05 in, the front
   * view's): modelled as its part inside the glass, 1.06 to 1.645 (the 14 Pro's and 15 Pro's treatment). Sheet 2's
   * Detail E dimensions a RECEIVER KEEPOUT 14.40 long round it (a zone, not the slot).
   */
  receiverLength: v(14.21, 'dimensioned', s1('Detail D: 14.21 (the receiver; its extension lines land on the slot\'s ends)')),
  receiverHeight: v(0.585, 'derived', s1('Detail D: 0.75 at -1.27, the part inside the glass (from 1.06, just inside its 1.05 edge, to 1.645)')),
  receiverFromTop: v(1.3525, 'derived', s1('Detail D: the middle of that part')),
  receiverDepth: v(0.3, 'assumed', 'the slot\'s depth for a render: the drawing gives none'),
};

export const buttons = {
  ringSilent: {
    side: 'volume' as const,
    centre: v(31.14, 'dimensioned', s1('left side view: 31.14 POCKET CENTER')),
    half: v(2.96, 'dimensioned', s1('left side view: 2X 2.96 (centre to each end of the pocket)')),
    width: v(2.25, 'dimensioned', s1('left side view: 2.25')),
    fromBack: v(3.82, 'dimensioned', s1('left side view: 3.82 POCKET CENTER, from the back glass\'s line (read at 1200 dpi: 88 px from the bump-side line)')),
    proud: v(0.6, 'dimensioned', s1('front view: 0.60 RING/SILENT SWITCH')),
    note: 'the switch sits in a 5.92 x 2.25 pocket; modelled as a block of the pocket\'s size standing 0.60 proud',
  },
  volumeUp: {
    side: 'volume' as const,
    centre: v(44.59, 'dimensioned', s1('left side view: 44.59 (+) VOLUME BUTTON')),
    half: v(5.9, 'dimensioned', s1('left side view: 4X 5.90')),
    width: v(3.26, 'dimensioned', s1('left side view: 2X 3.26')),
    fromBack: v(3.85, 'dimensioned', s1('left side view: 2X 3.85 (the volume buttons\' centre line), from the back glass\'s line (the 14 Pro\'s says 3.92)')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (+) VOLUME BUTTON')),
    note: '',
  },
  volumeDown: {
    side: 'volume' as const,
    centre: v(58.79, 'dimensioned', s1('left side view: 58.79 (-) VOLUME BUTTON')),
    half: v(5.9, 'dimensioned', s1('left side view: 4X 5.90')),
    width: v(3.26, 'dimensioned', s1('left side view: 2X 3.26')),
    fromBack: v(3.85, 'dimensioned', s1('left side view: 2X 3.85, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (-) VOLUME BUTTON')),
    note: '',
  },
  side: {
    side: 'side' as const,
    centre: v(55.54, 'dimensioned', s1('right side view: 55.54 SIDE BUTTON')),
    half: v(9.15, 'dimensioned', s1('right side view: 2X 9.15')),
    width: v(3.26, 'dimensioned', s1('right side view: 3.26')),
    fromBack: v(3.92, 'dimensioned', s1('right side view: 3.92, from the button\'s centre line to the back glass\'s line (its arrows land on the centre line and the bump side, read at 1200 dpi)')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 SIDE BUTTON')),
    note: '',
  },
};

export const simTray = {
  centre: v(86.24, 'dimensioned', s1('left side view: 86.24 SIM TRAY')),
  length: v(15.94, 'derived', s1('left side view: 2X 7.97, centre to each end')),
  width: v(2.56, 'dimensioned', s1('left side view: 2.56')),
  fromBack: v(3.85, 'dimensioned', s1('left side view: 3.85, from the back glass\'s line')),
};

/**
 * The bottom edge, from the volume-button edge. Only each group's end holes are dimensioned, and (as on the 13s and the
 * 14 Pro) their extension lines touch the holes' outer edges: 19.91 and 28.21 bound the four on the left (bottom mic
 * 1), 49.37 and 62.17 the six on the right (the speaker's five and bottom mic 2). As edges the spans fit the 2.255
 * pitch (6.77 / 3 = 2.257, 11.27 / 5 = 2.254); as centres they wouldn't (2.77, 2.56). At 1200 dpi the chords (a row
 * 0.3 toward the front) centre on 20.67, 22.93, 25.18, 27.44 and 50.13, 52.39, 54.64, 56.90, 59.15, 61.41, and the screws
 * on 32.39 and 45.18. A hole's centre is half its 1.53 inside; the holes between are evenly spaced, as drawn.
 */
const R = 1.53 / 2;
const group = (from: number, to: number, n: number, which: string) => {
  const [a, b] = [from + R, to - R];
  return Array.from({ length: n }, (_, i) => {
    const mm = +(a + ((b - a) * i) / (n - 1)).toFixed(3);
    const how = i === 0 ? `${from} + 0.765: ${from} lands on the hole's outer edge` : i === n - 1 ? `${to} - 0.765: ${to} lands on the hole's outer edge` : `evenly between, as drawn`;
    return v(mm, i === 0 || i === n - 1 ? 'derived' : 'inferred', s1(`bottom view, the ${which} group (10X Ø1.53 PORTS): ${how}`));
  });
};

export const bottom = {
  holes: [...group(19.91, 28.21, 4, 'left'), ...group(49.37, 62.17, 6, 'right')],
  holeDiameter: v(1.53, 'dimensioned', s1('bottom view: 10X Ø1.53 PORTS')),
  holesFromBack: v(3.85, 'dimensioned', s1('bottom view: 3.85, the holes\' centre line to the back glass\'s line')),
  holeDepth: v(0.6, 'assumed', 'a mic or speaker hole\'s depth for a render: the drawing gives none'),
  screws: [32.39, 45.18].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (2X Ø1.50 SCREW)`))),
  screwDiameter: v(1.5, 'dimensioned', s1('bottom view: 2X Ø1.50 SCREW')),
  screwsFromBack: v(3.85, 'inferred', 'Detail C draws the screws on the holes\' centre line'),
  portFrom: v(34.39, 'dimensioned', s1('bottom view: 34.39 (the Lightning port\'s near end)')),
  portTo: v(43.17, 'dimensioned', s1('bottom view: 43.17 (its far end; centre 38.78, Detail C\'s 38.79 to within the rounding)')),
  portHeight: v(3.01, 'dimensioned', s1('Detail C: 3.01 (the port\'s outer outline across the thickness); its ends round (inferred)')),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none'),
};

export const mass = v(240, 'spec', 'Weight: 8.47 ounces (240 grams)');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '4:3 at 12MP (the Ultra Wide and Telephoto; the Main\'s 48MP sensor bins to 12MP by default); 4032 x 3024 is the usual 4:3 still size, not on the spec page' };

/** Everything above, as the family's builder (iphone/part.ts) reads it. */
export const phone: Phone = {
  part: {
    title: 'iPhone 14 Pro Max',
    name: 'iphone-14-pro-max.dat',
    keywords: ['Apple', 'iPhone 14 Pro Max', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [['2026-10-31', 'Built from Apple\'s dimensional drawing: body, cameras, LiDAR, buttons, Lightning, Dynamic Island']],
    drawn: '2022-09-21',
    folder: 'iphone-14-pro-max',
  },
  details: { corner: 'Detail D', edge: 'Detail B', back: 'Detail A', port: 'Detail C' },
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
