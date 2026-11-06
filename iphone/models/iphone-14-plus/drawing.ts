// iPhone 14 Plus, read from Apple's dimensional drawing (iphone/drawings/iphone-14-plus.pdf, sheets 1 and 2,
// dated 2022-09-21). Every number carries where it came from and how we know it (src/provenance.ts): spec here is
// Apple's technical specifications page (support.apple.com/111854); scaled values are re-measured by measure.ts.
//
// The iPhone 14 drawn larger, but lettered as the 15s, not as the 14: Detail D is the corner (and the receiver), B the
// edge profile, C the Lightning port, A the back; sheet 2 the keepout sections (L-L, M-M, N-N), Detail E (front sensor
// keepouts), Detail F (where the sections cut) and the MagSafe view, sheet 3 antenna keepouts. What it shares with the
// 14: the edge profile (Detail B's numbers are the 14's but one, 3.55 for 3.54), the thickness (7.80, everything on the
// mid-plane), the bump's heights (1.85, 3.42) and its top's size (30.09), the lens rings (Ø14.38), the flash (Ø6.28),
// the receiver's cutout (11.95 x 1.38 at -1.74), the buttons and the pocket. What differs besides the size: the corner
// (17.32 along the top, 15.96 down the side), the bump's outline (symmetric, 1.28 to 36.57), the cones (129.61°,
// 80.25°), ten holes on the bottom (4 + 6), the port's keepout (13.65, R3.40), the SIM tray (110.70).
//
// Coordinates on the back follow Detail A: `fromSide` from the side-button edge (the left edge in a back view),
// `fromTop` from the top edge. Depths from the back glass outward, or from the front face inward, as the drawing
// measures them. Every button, the port and the holes sit on the mid-plane (3.90 of 7.80), so "from the back" and
// "from the front" read the same here.
import type { Phone } from '../../drawing.ts';
import type { Calibration, Region } from '../../../src/raster.ts';
import { v, type Kind } from '../../../src/provenance.ts';

/**
 * Where the scaled values were measured, each region of sheet 1 (PDF page 2) with the calibration measure.ts finds for
 * it: Detail A at 1200 dpi (the camera centres calibrate it; drawn at twice the front view's scale), the front view (its
 * outer edges), the receiver at 4800 dpi (the front view's frame), the bottom view (its outer edges and outlines), Detail
 * D at 1200 dpi (calibrated on the corner's leaders, for the corner's diagonal point).
 */
export const detailA: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 16200, y: 1680, width: 2400, height: 2400 }, pxPerMm: 46.1, origin: [301.5, 304] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 6544, y: 4400, width: 2200, height: 4100 }, pxPerMm: 23.05, origin: [184.5, 205] };
export const receiverView: Region = { page: 2, dpi: 4800, crop: { x: 29712, y: 18330, width: 1600, height: 500 } };
export const bottomView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 6526, y: 10390, width: 2200, height: 520 }, pxPerMm: 23.05, origin: [202.5, 262] };
export const detailD: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 9750, y: 1250, width: 2700, height: 1400 }, pxPerMm: 46.09, origin: [210.8, 238.3] };

const s1 = (what: string) => `sheet 1, ${what}`;
const s2 = (what: string) => `sheet 2, ${what}`;

/**
 * Detail D gives seven points on the corner and none on its diagonal, which the builder's monotone halves meet at: the
 * product outline's crossing of the corner's 45° diagonal, scaled. Its middle cross, (4.10, 3.14), is 0.68 off the
 * diagonal (the corner isn't symmetric: 17.32 along the top, 15.96 down the side), and the outline drawn through it
 * crosses the diagonal 0.69 further round, its secant there (43.8°) within 2° of the 45° the builder starts each half at.
 */
export const cornerDiagonal = v(3.61, 'scaled', 'Detail D: the product outline (the thin outer line the crosses sit on) crossed on the corner\'s 45° diagonal, at 4800 dpi');

export const body = {
  width: v(78.07, 'dimensioned', s1('front view: 78.07 PRODUCT WIDTH')),
  length: v(160.84, 'dimensioned', s1('front view: 160.84 PRODUCT LENGTH')),
  thickness: v(7.8, 'dimensioned', s1('right side view: 7.80 PRODUCT THICKNESS')),
  glassWidth: v(75.97, 'dimensioned', s1('front view: 75.97 GLASS')),
  glassLength: v(158.74, 'dimensioned', s1('front view: 158.74 GLASS')),
  /**
   * The plan-view corner, (along the top edge, down the side) from the corner: Detail D's crosses, each paired with the
   * two leaders that reach it (at 1200 dpi the across leaders scale 46.09 px/mm from 1.35 to 17.32 and the down leaders
   * 46.10 from 0.85 to 15.96, so each label is where its leader lands; the 0.17 leader stands apart from the 0.00 line,
   * the 0.07 merges with it). Not symmetric about the diagonal: 17.32 along the top, 15.96 down the side.
   */
  corner: {
    points: [
      [17.32, 0],
      [12.67, 0.07],
      [8.1, 0.85],
      [4.1, 3.14],
      [cornerDiagonal.mm, cornerDiagonal.mm],
      [1.35, 6.85],
      [0.17, 11.32],
      [0, 15.96],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail D: CORNER PROFILE (ALL FOUR CORNERS); across 0.00 (boxed), 0.17, 1.35, 4.10, 8.10, 12.67, 17.32 and down 0.00 (boxed), -0.07, -0.85, -3.14, -6.85, -11.32, -15.96, paired by their leaders; the diagonal point scaled (cornerDiagonal)'),
  },
  /** The edge profile, (inset from the outermost side, half-height from mid-plane): Detail B: the 14's numbers, but 3.55 for its 3.54 (read at 1200 dpi). */
  edge: {
    points: [
      [0, 2.71],
      [0.01, 3.14],
      [0.14, 3.55],
      [0.49, 3.79],
      [0.91, 3.82],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail B: (ALL SIDES), symmetric about the mid-plane; insets 0.00 (boxed), 2X 0.01, 2X 0.14, 2X 0.49, 2X 0.91 paired in order with ±2.71, ±3.14, ±3.55, ±3.79, ±3.82'),
  },
};

export const bump = {
  /** Its leaders land as labelled (read at 1200 dpi), as on the 14. */
  top: v(1.85, 'dimensioned', s1('right side view: 1.85 BACK GLASS TO CAMERA PLATEAU (the inner line: the bump\'s flat top)')),
  rings: v(3.42, 'dimensioned', s1('right side view: 3.42 BACK GLASS TO REAR CAMERA GLASS (the outermost line)')),
  baseFrom: v(1.28, 'dimensioned', s1('Detail A: 1.28 and -1.28 (the outline\'s near sides, which merge with the back glass\'s heavy edge: one 0.48 mm run from 0.89 to 1.37)')),
  baseSize: v(35.29, 'derived', s1('Detail A: 36.57 - 1.28, the outline\'s far sides (across and down) less its near')),
  baseRadius: v(11.5, 'scaled', 'Detail A: the outline\'s corners crossed on their diagonals, 11.58, 11.51 and 11.44 (the top-left runs into the back glass\'s heavy edge)'),
  topFrom: v(3.88, 'dimensioned', s1('Detail A: 3.88 and -3.88')),
  topSize: v(30.09, 'derived', s1('Detail A: 33.97 - 3.88, across and down (the 14\'s 30.09)')),
  topRadius: v(8.9, 'scaled', 'Detail A: the top\'s corners crossed on their diagonals, 8.84 to 8.99 at all four'),
};

/** Rear camera 1: the Ultra Wide. Rear camera 2: the Main (Wide). */
export const cameras = {
  ultraWide: {
    name: 'rear camera 1',
    label: 'Ultra Wide',
    fromSide: v(12.55, 'dimensioned', s1('Detail A: 12.55 (rear camera 1, across)')),
    fromTop: v(12.55, 'dimensioned', s1('Detail A: -12.55')),
    ring: v(14.38, 'dimensioned', s1('Detail A: 2X Ø14.38')),
    window: v(11.7, 'scaled', 'Detail A: the innermost of the camera\'s circles (re-measured 11.70)'),
    coneApexFromFront: v(8.51, 'dimensioned', s2('Section L-L: 8.51 REAR CAMERA 1 KEEPOUT CONE TO COVER GLASS (Detail F: L-L cuts camera 1)')),
    keepoutCone: v(129.61, 'dimensioned', s2('Section L-L: 129.61° REAR CAMERA 1 KEEPOUT CONE')),
    identity: v(1, 'inferred', 'camera 1 is the Ultra Wide: its 129.61° keepout cone encloses the Ultra Wide\'s 120° (spec); camera 2\'s 80.25° (Section M-M, which Detail F draws through camera 2) the Main\'s 26 mm (79.5°)'),
    fov: v(120, 'spec', 'Ultra Wide: 13 mm, ƒ/2.4 aperture and 120° field of view'),
    aperture: v(2.4, 'spec', 'Ultra Wide: ƒ/2.4'),
  },
  main: {
    name: 'rear camera 2',
    label: 'Main',
    fromSide: v(25.3, 'dimensioned', s1('Detail A: 25.30 (rear camera 2, across)')),
    fromTop: v(25.3, 'dimensioned', s1('Detail A: -25.30')),
    ring: v(14.38, 'dimensioned', s1('Detail A: 2X Ø14.38')),
    window: v(11.7, 'scaled', 'Detail A: the innermost of the camera\'s circles (re-measured 11.68)'),
    coneApexFromFront: v(8.76, 'dimensioned', s2('Section M-M: 8.76 REAR CAMERA 2 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(80.25, 'dimensioned', s2('Section M-M: 80.25° REAR CAMERA 2 KEEPOUT CONE')),
    equivalentFocal: v(26, 'spec', 'Main: 26 mm, ƒ/1.5 aperture'),
    aperture: v(1.5, 'spec', 'Main: ƒ/1.5'),
  },
};

export const flash = {
  fromSide: v(26.97, 'dimensioned', s1('Detail A: 26.97 (FLASH)')),
  fromTop: v(10.87, 'dimensioned', s1('Detail A: -10.87')),
  diameter: v(6.28, 'dimensioned', s1('Detail A: Ø6.28')),
};

/**
 * Sheet 2 (PDF page 3) at 1200 dpi: Section N-N, the one section through the flash (Detail F: down the phone through
 * the flash's centre, drawn upright, its front face the left edge, `origin` across; down has no datum). Scaled from that
 * face to the 11.11 extension line: 46.08 px/mm, Detail A's scale. Sections L-L and M-M (the cameras) beside it, at the
 * same scale, are read for their faces only (measure.ts: sectionBodies).
 */
export const sectionNN: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 16300, y: 1500, width: 1700, height: 2600 }, pxPerMm: 46.08, origin: [494.5, 0] };
export const sectionLL: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 11400, y: 1900, width: 1700, height: 2300 }, pxPerMm: 46.08, origin: [284.5, 0] };
export const sectionMM: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 13900, y: 1900, width: 1700, height: 2300 }, pxPerMm: 46.08, origin: [313.5, 0] };

/**
 * A finding: sheet 2's sections draw the phone 0.50 thinner than sheet 1 does. In N-N the back glass beyond the bump is
 * drawn 7.29 from the section's front face (its left edge), the bump's glass 9.15 and camera 2's ring 10.72: sheet 1's
 * 1.85 and 3.42 beyond the back glass, as they should be, but on a 7.30 body, not the 7.80 of sheet 1's PRODUCT
 * THICKNESS (and Apple's spec). L-L and M-M draw the same body (the bump's top 9.15, the ring 10.72). The iPhone 14's
 * N-N draws all of these 0.50 further out (7.80, 9.65, 11.22) and dimensions its flash keepout 9.55 and 11.61, where
 * this one prints 9.05 and 11.11: the same section, number for number, on the thinner body.
 */
export const sectionBackGlass = v(7.3, 'scaled', s2('Section N-N: the back glass beyond the bump, drawn 7.29 from the section\'s front face (the bump\'s glass 9.15 and the ring 10.72 stand 1.85 and 3.42 beyond it, sheet 1\'s numbers)'));

/**
 * The flash's keepout, Section N-N (sheet 2): as the 14's, an inner cone from the strobe (the flash's face, drawn 0.10
 * under the bump's glass) turning at 11.11 from the section's front face into a 157° outer cone. N-N runs down the
 * phone, the only section through the flash, so the inner cone is taken as circular, 112.01° about the flash's axis
 * (inferred: one section).
 *
 * Follow the arrows: 9.05 FLASH KEEPOUT CONE TO COVER GLASS runs from the section's front face to the strobe's face,
 * where its arrow lands between the inner cone's two corners: the inner cone's base, not its apex. 11.11 runs from the
 * same face to the kinks' extension line. Both are measured on the section's 7.30 body (sectionBackGlass): 9.05 is its
 * bump glass (7.30 + 1.85) less the strobe's 0.10 recess, 11.11 that glass and 1.96, as on the 14. The family measures
 * "to cover glass" from the front face of the real 7.80 phone, so each is carried onto it by where it stands from the
 * back glass, 7.80 - 7.30 = 0.50 further out: the 14's 9.55 and 11.61 exactly. Taken as printed from the real front,
 * the strobe would sit 0.60 inside the bump's glass and the transition 1.46 beyond it, where the section draws 0.10
 * and 1.96 (measure.ts's negative control). The apex isn't dimensioned: it's worked from the 112.01° cone through the
 * flash's Ø6.28 edge at the bump's top (as the 14's), and the base's diameter from the same cone at the strobe's face.
 * The drawn cone is a little wider than that one: 6.33 at the bump's glass and 6.04 at the strobe (its lines cross
 * 0.02 nearer the front), within 0.05 of each.
 */
const toRealFront = body.thickness.mm - sectionBackGlass.mm;
const tan56 = Math.tan((112.01 / 2) * (Math.PI / 180));
export const flashKeepoutPrinted = {
  base: v(9.05, 'dimensioned', s2('Section N-N: 9.05 FLASH KEEPOUT CONE TO COVER GLASS (its arrow lands on the strobe\'s face between the inner cone\'s corners: the cone\'s base), from the section\'s front face')),
  transition: v(11.11, 'dimensioned', s2('Section N-N: 11.11 FLASH KEEPOUT CONE TRANSITION TO COVER GLASS (its arrows on the section\'s front face and the kinks\' extension line)')),
};
const apexFromFront = +(body.thickness.mm + bump.top.mm - flash.diameter.mm / 2 / tan56).toFixed(2);
export const flashKeepout = {
  inner: v(112.01, 'dimensioned', s2('Section N-N: 112.01° FLASH INNER KEEPOUT CONE (down the phone; the only section through the flash, so taken as circular)')),
  outer: v(157, 'dimensioned', s2('Section N-N: 157.00° FLASH OUTER KEEPOUT CONE')),
  transitionFromFront: v(+(flashKeepoutPrinted.transition.mm + toRealFront).toFixed(2), 'derived', s2('Section N-N: 11.11 from the section\'s front face, on its 7.30 body; 11.11 + (7.80 - 7.30) from the real phone\'s (the 14\'s 11.61)')),
  apexFromFront: v(apexFromFront, 'derived', s2('Section N-N: not dimensioned; the 112.01° cone through the flash\'s Ø6.28 edge at the bump\'s top: 7.80 + 1.85 - 3.14 / tan 56.005° (the drawn lines cross 7.01 from the section\'s front face: 7.51 on the real phone)')),
  innerBaseDiameter: v(+(2 * (flashKeepoutPrinted.base.mm + toRealFront - apexFromFront) * tan56).toFixed(2), 'derived', s2('Section N-N: not dimensioned; the 112.01° cone at the strobe\'s face (9.05 on the section, 9.55 on the real phone): 2 (9.55 - 7.53) tan 56.005°')),
};

/**
 * The rear mic, on the bump's top (inside its top's bottom-left R8.90 corner, 2.11 from the corner's centre). Across:
 * the 11.29 ordinate below Detail A, whose extension line rises to the mic's centre (the side-button edge is the view's
 * 0.00, the bump's 1.28 and 3.88 beside it); down: the -26.56 line runs in from the left to the mic's centre. So the
 * README's "11.29, 26.56" is (across, down). Three concentric circles are drawn there, as on the 14 (Ø2.39, 2.06
 * dashed, 1.66 at 4800 dpi), and the Ø2.10 leader's arrow lands on the outer one, as on the 14; the printed 2.10
 * matches the dashed middle one. Taken as printed (the 14's reading).
 */
export const micView: Region = { page: 2, dpi: 4800, crop: { x: 67688, y: 12434, width: 800, height: 800 } };
export const rearMic = {
  fromSide: v(11.29, 'dimensioned', s1('Detail A: 11.29 (the ordinate below the view; its extension line rises to the mic\'s centre)')),
  fromTop: v(26.56, 'dimensioned', s1('Detail A: -26.56 (the line runs in from the left to the mic\'s centre)')),
  diameter: v(2.1, 'dimensioned', s1('Detail A: [2] Ø2.10 REAR MIC (its arrow lands on the outer of three circles; the printed 2.10 matches the dashed middle one)')),
};

/**
 * MagSafe's keepouts (sheet 2, the MagSafe view: the second back view from the right) at 1800 dpi, calibrated on its
 * 0.00 and 66.36 lines across and its 0.00 and -115.52 lines down. The clear area (5: DO NOT OBSTRUCT THIS AREA WITH
 * METAL, CONDUCTIVE MATERIAL, OR MAGNETIC MATERIAL) is a whole Ø57.50 circle round the product centre (39.04, -80.42:
 * half the 78.07 and 160.84). The magnetic zone (5 7: DO NOT OBSTRUCT THIS AREA WITH MAGNETIC OR PERMEABLE MATERIAL
 * EXCEPT MAGSAFE MAGNETS) is the 16's shape: the full width from the camera corner's keepout down, straight-sided to
 * -115.52, closed by an R52.49 arc through those corners. Two differences from the 14 (and the 16): the zone's top isn't
 * dimensioned (scaled: 40.21, 3.64 below the bump's outline; the 14 dimensions its -40.12), and the arc's centre
 * (derived: 115.52 - √(52.49² - 39.035²) = 80.43 down) is the product centre, within 0.01, not 3.10 below it.
 */
export const magsafeView: Region & Calibration = { page: 3, dpi: 1800, crop: { x: 16850, y: 10548, width: 4200, height: 6500 }, pxPerMm: 34.57, origin: [695, 450] };
export const magsafe = {
  fromSide: v(39.04, 'dimensioned', s2('MagSafe view: 39.04 PRODUCT CENTER')),
  fromTop: v(80.42, 'dimensioned', s2('MagSafe view: -80.42 PRODUCT CENTER')),
  diameter: v(57.5, 'dimensioned', s2('MagSafe view: Ø57.50 (its leader on the clear area\'s circle; measure.ts fits the circle round the product centre)')),
  zoneFrom: v(40.21, 'scaled', 'MagSafe view: the zone\'s top edge, the full width (the camera corner\'s keepout\'s bottom), not dimensioned: read on columns 16, 25, 45 and 60 across, 40.21 on each'),
  zoneSidesTo: v(115.52, 'dimensioned', s2('MagSafe view: 2X -115.52, where the zone\'s sides (the phone\'s) meet its arc')),
  zoneRadius: v(52.49, 'dimensioned', s2('MagSafe view: R52.49, the arc closing the zone below')),
};

/**
 * What the MagSafe view gives beyond the family's fields (not built, not in features.json):
 * - above the zone, the camera corner (0.00 to 36.57 across, the bump outline's far side, and 0.00 to the zone's top
 *   down, crosshatched): DO NOT OBSTRUCT THIS AREA WITH MAGNETIC OR PERMEABLE MATERIAL (FULL PRODUCT VOLUME INCLUDING
 *   SIDE WALLS); the rest of the top carries no keepout but the compass;
 * - the COMPASS, a small hatched circle centred 66.36 across, -9.88 down (its size not dimensioned).
 * Sheet 2's middle back view and side view give other keepouts (metal and conductive material: the top and bottom
 * bands, the side band, the area beside the bump), and sheet 3 the antenna keepouts (Detail K): not recorded here.
 */
export const magsafeExtras = {
  cameraZone: { across: v(36.57, 'dimensioned', s2('MagSafe view: 36.57, the camera corner\'s keepout, its edge')) },
  compass: { fromSide: v(66.36, 'dimensioned', s2('MagSafe view: 66.36 COMPASS')), fromTop: v(9.88, 'dimensioned', s2('MagSafe view: -9.88 COMPASS')) },
};

export const lightning = {
  name: 'Lightning' as const,
  width: v(13.65, 'dimensioned', s1('Detail C: 13.65 RECOMMENDED CONNECTOR KEEPOUT (2X R3.40 corners)')),
  thickness: v(6.85, 'dimensioned', s1('Detail C: 6.85 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(39.04, 'dimensioned', s1('Detail C: 39.04 (the port\'s centre to the side-button edge; the phone\'s middle, 78.07 / 2)')),
  fromBack: v(3.9, 'dimensioned', s1('Detail C: 3.90, the port\'s centre line to the back glass (the mid-plane)')),
  outward: v(14.0, 'dimensioned', s1('Detail C: MATING CONNECTOR KEEPOUT AREA FLUSH TO PRODUCT SURFACE REQUIRED OUTWARD 14.0 mm')),
};

export const front = {
  activeWidth: v(71.13, 'dimensioned', s1('front view: 71.13 DISPLAY ACTIVE AREA')),
  activeLength: v(153.9, 'dimensioned', s1('front view: 153.90 DISPLAY ACTIVE AREA')),
  activeFromEdge: v(3.47, 'dimensioned', s1('front view: 3.47 ALL AROUND EXTERIOR OF HOUSING TO DISPLAY ACTIVE AREA')),
  activeRadius: v(8.9, 'scaled', 'front view: the active area\'s corners crossed on their diagonals, 8.81 to 8.96 at three (the bottom-left runs along a hatch line)'),
  notchWidth: v(26.83, 'dimensioned', s1('front view: 26.83 ACTIVE AREA CUTOUT (wall to wall)')),
  notchDepth: v(5.6, 'dimensioned', s1('front view: 5.60 ACTIVE AREA CUTOUT, from the active area\'s top (its upper arrow lands on the 153.90 line)')),
  notchTopRadius: v(0.83, 'dimensioned', s1('front view: 2X R0.83 (the leader reaches where the cutout\'s wall leaves the active area\'s top)')),
  notchBottomRadius: v(3.71, 'dimensioned', s1('front view: 2X R3.71 (the cutout\'s bottom corners)')),
  /**
   * Detail D dimensions only the receiver's cutout (11.95 long, 1.38 down from the glass's edge, centred -1.74 on the
   * 39.04 line), as the 14's Detail A. The slot inside it is scaled from the front view as the 14's: the white inside
   * it widened by one stroke of its own pen (measure.ts reads it with the 14's scan).
   */
  receiverLength: v(11.0, 'scaled', 'front view at 4800 dpi: the white inside the slot and one stroke of its pen'),
  receiverHeight: v(0.73, 'scaled', 'front view at 4800 dpi: the white inside the slot and one stroke of its pen'),
  receiverFromTop: v(1.74, 'dimensioned', s1('Detail D: -1.74 (the receiver\'s centre line)')),
  receiverDepth: v(0.3, 'assumed', 'the slot\'s depth for a render: the drawing gives none'),
};

export const buttons = {
  ringSilent: {
    side: 'volume' as const,
    centre: v(31.98, 'dimensioned', s1('left side view: 31.98 POCKET CENTER')),
    half: v(2.96, 'dimensioned', s1('left side view: 2X 2.96 (centre to each end of the pocket)')),
    width: v(2.35, 'dimensioned', s1('left side view: 2.35')),
    fromBack: v(3.9, 'dimensioned', s1('left side view: 3.90 POCKET CENTER, from the back glass\'s line')),
    proud: v(0.6, 'dimensioned', s1('front view: 0.60 RING/SILENT SWITCH')),
    note: 'the switch sits in a 5.92 x 2.35 pocket; modelled as a block of the pocket\'s size standing 0.60 proud',
  },
  volumeUp: {
    side: 'volume' as const,
    centre: v(45.43, 'dimensioned', s1('left side view: 45.43 (+) VOLUME BUTTON')),
    half: v(5.92, 'dimensioned', s1('left side view: 4X 5.92')),
    width: v(3.31, 'dimensioned', s1('left side view: 2X 3.31')),
    fromBack: v(3.9, 'dimensioned', s1('left side view: 2X 3.90, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (+) VOLUME BUTTON')),
    note: '',
  },
  volumeDown: {
    side: 'volume' as const,
    centre: v(59.63, 'dimensioned', s1('left side view: 59.63 (-) VOLUME BUTTON')),
    half: v(5.92, 'dimensioned', s1('left side view: 4X 5.92')),
    width: v(3.31, 'dimensioned', s1('left side view: 2X 3.31')),
    fromBack: v(3.9, 'dimensioned', s1('left side view: 2X 3.90, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (-) VOLUME BUTTON')),
    note: '',
  },
  side: {
    side: 'side' as const,
    centre: v(52.53, 'dimensioned', s1('right side view: 52.53 SIDE BUTTON')),
    half: v(9.17, 'dimensioned', s1('right side view: 2X 9.17')),
    width: v(3.31, 'dimensioned', s1('right side view: 3.31')),
    fromBack: v(3.9, 'dimensioned', s1('right side view: 3.90 (the mid-plane: from either glass)')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 SIDE BUTTON')),
    note: '',
  },
};

/** Drawn on the left side view; Apple's US spec page lists the 14 Plus as eSIM only, other regions with a nano-SIM. */
export const simTray = {
  centre: v(110.7, 'dimensioned', s1('left side view: 110.70 SIM TRAY')),
  length: v(15.94, 'derived', s1('left side view: 2X 7.97, centre to each end')),
  width: v(2.56, 'dimensioned', s1('left side view: 2.56')),
  fromBack: v(3.9, 'dimensioned', s1('left side view: 3.90, from the back glass\'s line')),
};

/**
 * The bottom edge, from the volume-button edge. Only each group's end holes are dimensioned, and (as on the 13s and the
 * 14) their extension lines touch the holes' outer edges: as edges the four-hole group's span (20.16 to 28.46) and the
 * six-hole group's (49.62 to 62.42) both fall on the 2.255 pitch (2.257, 2.254); as centres they'd be 2.77 and 2.56.
 * The holes between are evenly spaced, as drawn.
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
  holes: [...group(20.16, 28.46, 4, 'left'), ...group(49.62, 62.42, 6, 'right')],
  holeDiameter: v(1.53, 'dimensioned', s1('bottom view: 10X Ø1.53 PORTS')),
  holesFromBack: v(3.9, 'dimensioned', s1('bottom view: 3.90, the holes\' centre line to the back glass\'s line')),
  holeDepth: v(0.6, 'assumed', 'a mic or speaker hole\'s depth for a render: the drawing gives none'),
  screws: [32.64, 45.43].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (2X Ø1.50 SCREW; 6.395 either side of the port\'s centre)`))),
  screwDiameter: v(1.5, 'dimensioned', s1('bottom view: 2X Ø1.50 SCREW')),
  screwsFromBack: v(3.9, 'inferred', 'Detail C draws the screws on the holes\' centre line'),
  portFrom: v(34.81, 'dimensioned', s1('bottom view: 34.81 (the Lightning port\'s near end)')),
  portTo: v(43.26, 'dimensioned', s1('bottom view: 43.26 (its far end; centre 39.035, as Detail C\'s 39.04)')),
  portHeight: v(2.7, 'dimensioned', s1('Detail C: 2.70 (the port\'s opening across the thickness); its ends round (inferred)')),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none'),
};

export const mass = v(203, 'spec', 'Weight: 203 grams');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '12MP (spec); 4032 x 3024 is the usual 4:3 still size, not on the spec page' };

/** Everything above, as the family's builder (iphone/part.ts) reads it. */
export const phone: Phone = {
  part: {
    title: 'iPhone 14 Plus',
    name: 'iphone-14-plus.dat',
    keywords: ['Apple', 'iPhone 14 Plus', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [
      ['2026-10-31', 'Built from Apple\'s dimensional drawing: body, cameras, buttons, ports, notch'],
      ['2026-11-01', 'Rear mic; the flash\'s keepout and MagSafe\'s keepouts in features.json'],
    ],
    drawn: '2022-09-21',
    folder: 'iphone-14-plus',
  },
  details: { corner: 'Detail D', edge: 'Detail B', back: 'Detail A', port: 'Detail C' },
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
