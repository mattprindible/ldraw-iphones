// iPhone 14, read from Apple's dimensional drawing (iphone/drawings/iphone-14.pdf, sheets 1 and 2, dated
// 2022-09-21). Every number carries where it came from and how we know it (src/provenance.ts): spec here is Apple's
// technical specifications page (support.apple.com/111850); scaled values are re-measured by measure.ts.
//
// It's drawn on the 13's plan, lettered as the 13's: Detail A the corner (and the receiver), Detail B the edge profile,
// Detail C the Lightning port, Detail D the back; sheet 2 the keepout sections (L-L, M-M, N-N), Detail F and the
// MagSafe view, sheet 3 antenna keepouts. Coordinates on the back follow Detail D: `fromSide` from the side-button edge
// (the left edge in a back view), `fromTop` from the top edge. Depths from the back glass outward, or from the front face inward, as the
// drawing measures them. The phone is 7.80 thick and every button, the port and the holes sit on its mid-plane (3.90),
// so "from the back" and "from the front" read the same here.
import type { Phone } from '../../drawing.ts';
import type { Calibration, Region } from '../../../src/raster.ts';
import { v, type Kind } from '../../../src/provenance.ts';

/**
 * Where the scaled values were measured, each region of sheet 1 (PDF page 2) with the calibration measure.ts finds for
 * it: Detail D at 1200 dpi (the camera centres calibrate it; drawn at twice the front view's scale, as the 15 Pro's),
 * the front view (its outer edges), the receiver at 4800 dpi (the front view's frame), the bottom view (its outer edges
 * and outlines; it sits 0.4 mm-at-scale left of the front view, not under it).
 */
export const detailD: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 15850, y: 2450, width: 2400, height: 2400 }, pxPerMm: 46.1, origin: [300.5, 302.5] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 6000, y: 5380, width: 2050, height: 3800 }, pxPerMm: 23.05, origin: [204.5, 204] };
export const receiverView: Region = { page: 2, dpi: 4800, crop: { x: 27315, y: 22246, width: 1600, height: 500 } };
/** The rear mic at 4800 dpi, in Detail D's frame (its three circles stand 0.15 to 0.21 apart: too close at 1200). */
export const micView: Region = { page: 2, dpi: 4800, crop: { x: 66160, y: 15384, width: 800, height: 800 } };
export const bottomView: Region & Calibration ={ page: 2, dpi: 1200, crop: { x: 5480, y: 10905, width: 2050, height: 500 }, pxPerMm: 23.05, origin: [201, 257] };

const s1 = (what: string) => `sheet 1, ${what}`;
const s2 = (what: string) => `sheet 2, ${what}`;

export const body = {
  width: v(71.52, 'dimensioned', s1('front view: 71.52 PRODUCT WIDTH')),
  length: v(146.71, 'dimensioned', s1('front view: 146.71 PRODUCT LENGTH')),
  thickness: v(7.8, 'dimensioned', s1('right side view: 7.80 PRODUCT THICKNESS')),
  glassWidth: v(69.42, 'dimensioned', s1('front view: 69.42 GLASS')),
  glassLength: v(144.61, 'dimensioned', s1('front view: 144.61 GLASS')),
  /**
   * The plan-view corner, (along the top edge, down the side) from the corner: Detail A's crosses, each paired with the
   * leaders that reach it (the 0.00 lines at 1200 dpi put each cross within 0.02 of its pair). Unlike the 13s' it isn't
   * symmetric about the diagonal: it runs 15.89 along the top and 16.14 down the side, and its middle cross is
   * (3.22, 3.40), 0.13 off the diagonal. The builder (iphone/part.ts) splits the corner at a point on the diagonal and
   * starts each half there at 45°. With a point added on the diagonal beside the cross, the 0.13 between them bent the
   * cubic tighter than the glass's 1.05 inset, and the glass's ring folded (the triangulator found no ear). So the
   * diagonal point stands in for the cross: (3.31, 3.31), where the curve's tangent at the cross (from its neighbours'
   * secants, -0.65 and -1.61, Fritsch-Carlson's harmonic mean -0.93: within 2° of 45°) meets the diagonal; (3.22, 3.40)
   * lies on that 45° line, and the built outline passes 0.006 from it (measure.ts checks it). Inferred: the builder's
   * gap, a corner split only on the diagonal.
   */
  corner: {
    points: [
      [15.89, 0],
      [11.38, 0.07],
      [6.97, 0.95],
      [3.31, 3.31],
      [0.86, 7.2],
      [0.06, 11.63],
      [0, 16.14],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail A: CORNER PROFILE (ALL FOUR CORNERS); across 0.06, 0.86, 3.22, 6.97, 11.38, 15.89 and down -0.07, -0.95, -3.40, -7.20, -11.63, -16.14, paired by their leaders; (3.31, 3.31) inferred on the diagonal in place of the printed (3.22, 3.40), which the outline passes within 0.01 (see above)'),
  },
  /** The edge profile, (inset from the outermost side, half-height from mid-plane): Detail B. */
  edge: {
    points: [
      [0, 2.71],
      [0.01, 3.14],
      [0.14, 3.54],
      [0.49, 3.79],
      [0.91, 3.82],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail B: PROFILE (ALL SIDES), symmetric about the mid-plane; insets 0.00 (boxed), 2X 0.01, 2X 0.14, 2X 0.49, 2X 0.91 paired in order with ±2.71, ±3.14, ±3.54, ±3.79, ±3.82 (the 13\'s profile 0.08 further out, for a phone 0.15 thicker)'),
  },
};

/** Detail A's printed middle cross, which the corner's diagonal point stands in for: the built outline must pass it. */
export const cornerMiddle = { across: v(3.22, 'dimensioned', s1('Detail A: 3.22 (the middle cross)')), down: v(3.4, 'dimensioned', s1('Detail A: -3.40 (the middle cross)')) };

export const bump = {
  /** Its leaders land as labelled (read at 1200 dpi). */
  top: v(1.85, 'dimensioned', s1('right side view: 1.85 BACK GLASS TO CAMERA PLATEAU (the inner line: the bump\'s flat top)')),
  rings: v(3.42, 'dimensioned', s1('right side view: 3.42 BACK GLASS TO REAR CAMERA GLASS (the outermost line)')),
  baseFrom: v(1.15, 'dimensioned', s1('Detail D: 1.15 (across; its leader lands where the outline meets the back glass\'s heavy edge; taken the same down, as the bump is square: -35.90 matches 35.90)')),
  baseSize: v(34.75, 'derived', s1('Detail D: 35.90 - 1.15, the outline\'s far sides (across and down) less its near')),
  baseRadius: v(10.86, 'scaled', 'Detail D: the outline\'s corners crossed on their diagonals, 10.55 at the top-right and bottom-left, 11.44 at the bottom-right (the top-left runs into the back glass\'s heavy edge)'),
  topFrom: v(3.21, 'dimensioned', s1('Detail D: 3.21 (across; taken the same down, as -33.30 matches 33.30)')),
  topSize: v(30.09, 'derived', s1('Detail D: 33.30 - 3.21, across and down')),
  topRadius: v(8.89, 'scaled', 'Detail D: the top\'s corners crossed on their diagonals, 8.85 to 8.92 at all four'),
};

/** Rear camera 1: the Ultra Wide. Rear camera 2: the Main (Wide). */
export const cameras = {
  ultraWide: {
    name: 'rear camera 1',
    label: 'Ultra Wide',
    fromSide: v(11.88, 'dimensioned', s1('Detail D: 2X 11.88 (rear camera 1, across)')),
    fromTop: v(11.88, 'dimensioned', s1('Detail D: -11.88 REAR CAMERA 1')),
    ring: v(14.38, 'dimensioned', s1('Detail D: 2X Ø14.38')),
    window: v(11.7, 'scaled', 'Detail D: the innermost of the camera\'s four circles (Ø11.7, 12.2, 12.8 and the 14.38 ring)'),
    coneApexFromFront: v(8.48, 'dimensioned', s2('Section L-L: 8.48 REAR CAMERA 1 KEEPOUT CONE TO COVER GLASS (L-L cuts camera 1, Detail F)')),
    keepoutCone: v(132.87, 'dimensioned', s2('Section L-L: 132.87° REAR CAMERA 1 KEEPOUT CONE')),
    identity: v(1, 'inferred', 'camera 1 is the Ultra Wide: its 132.87° keepout cone encloses the Ultra Wide\'s 120° (spec); camera 2\'s 81.99° (Section M-M, through camera 2) the Main\'s 26 mm (79.5°)'),
    fov: v(120, 'spec', 'Ultra Wide: 13 mm, ƒ/2.4 aperture and 120° field of view'),
    aperture: v(2.4, 'spec', 'Ultra Wide: ƒ/2.4'),
  },
  main: {
    name: 'rear camera 2',
    label: 'Main',
    fromSide: v(24.63, 'dimensioned', s1('Detail D: 24.63 (rear camera 2, across)')),
    fromTop: v(24.63, 'dimensioned', s1('Detail D: -24.63 REAR CAMERA 2')),
    ring: v(14.38, 'dimensioned', s1('Detail D: 2X Ø14.38')),
    window: v(11.7, 'scaled', 'Detail D: the innermost of the camera\'s four circles (Ø11.7, 12.2, 12.8 and the 14.38 ring)'),
    coneApexFromFront: v(8.75, 'dimensioned', s2('Section M-M: 8.75 REAR CAMERA 2 KEEPOUT CONE TO COVER GLASS')),
    keepoutCone: v(81.99, 'dimensioned', s2('Section M-M: 81.99° REAR CAMERA 2 KEEPOUT CONE')),
    equivalentFocal: v(26, 'spec', 'Main: 26 mm, ƒ/1.5 aperture'),
    aperture: v(1.5, 'spec', 'Main: ƒ/1.5'),
  },
};

export const flash = {
  fromSide: v(26.3, 'dimensioned', s1('Detail D: 26.30 FLASH')),
  fromTop: v(10.21, 'dimensioned', s1('Detail D: -10.21')),
  diameter: v(6.28, 'dimensioned', s1('Detail D: Ø6.28 FLASH')),
};

/**
 * Sheet 2 (PDF page 3) at 1200 dpi: Section N-N, the one section through the flash (Detail F: down the phone through
 * the flash's centre, drawn upright, the cover glass's face its left edge, `origin` across; down has no datum). Scaled
 * from that face to the 11.61 extension line: 46.08 px/mm, Detail D's scale. And the MagSafe view (the right-hand back
 * view) at 1800 dpi, calibrated on its 0.00 and 64.91 lines across and its 0.00 and -110.52 lines down.
 */
export const sectionNN: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 16200, y: 1100, width: 1400, height: 3100 }, pxPerMm: 46.08, origin: [228.5, 0] };
export const magsafeView: Region & Calibration = { page: 3, dpi: 1800, crop: { x: 17400, y: 11160, width: 3800, height: 5900 }, pxPerMm: 34.57, origin: [642, 397.5] };

/**
 * The flash's keepout, Section N-N (sheet 2): as the 13's G-G, an inner cone from the strobe (the flash's face, drawn
 * 0.10 under the bump's glass) turning at 11.61 from the cover glass into a 157° outer cone. The 14 draws only this
 * section, down the phone (no across section like the 13's K-K, whose inner cone was narrower): the inner cone is
 * taken as circular, 112.07° about the flash's axis (inferred: one section).
 *
 * Follow the arrows: 9.55 FLASH KEEPOUT CONE TO COVER GLASS runs from the section's left face (the cover glass) to the
 * strobe's face, where its arrow lands between the inner cone's two corners (at 1200 dpi they stand 5.97 apart there):
 * the inner cone's base, not its apex. 9.55 is the bump's top (7.80 + 1.85 = 9.65) less the strobe's 0.10 recess, and
 * 11.61 is 9.65 + 1.96, as the 13's 11.10 is its 9.15 + 1.95. "To cover glass" is from the front: both arrows land on
 * the section's left face, the bump on the right (measure.ts reads the back glass 7.80 and the bump's glass 9.65 from
 * it). Neither number is the apex: it's worked from this drawing's own numbers, the 112.07° cone through the flash's
 * Ø6.28 edge at the bump's top (as the 13's), and the base's diameter at 9.55 from the same cone. The family's field
 * has no place for the base's distance (9.55): it's kept in `flashKeepoutBase`.
 */
export const flashKeepout = {
  inner: v(112.07, 'dimensioned', s2('Section N-N: 112.07° FLASH INNER KEEPOUT CONE (down the phone; the only section through the flash, so taken as circular)')),
  outer: v(157, 'dimensioned', s2('Section N-N: 157.00° FLASH OUTER KEEPOUT CONE')),
  transitionFromFront: v(11.61, 'dimensioned', s2('Section N-N: 11.61 FLASH KEEPOUT CONE TRANSITION TO COVER GLASS (its arrows on the section\'s front face and the kinks\' extension line)')),
  apexFromFront: v(7.53, 'derived', s2('Section N-N: not dimensioned; the 112.07° cone through the flash\'s Ø6.28 edge at the bump\'s top: 7.80 + 1.85 - 3.14 / tan 56.035°')),
  innerBaseDiameter: v(5.98, 'derived', s2('Section N-N: not dimensioned; the 112.07° cone at the strobe\'s face (9.55): 2 (9.55 - 7.535) tan 56.035° (drawn 5.97 at 1200 dpi; the 13\'s K-K dimensions Ø6.00)')),
};

/** What N-N gives beyond the family's field (not in features.json): the distance to the inner cone's base. */
export const flashKeepoutBase = {
  fromFront: v(9.55, 'dimensioned', s2('Section N-N: 9.55 FLASH KEEPOUT CONE TO COVER GLASS (its arrow lands on the strobe\'s face between the inner cone\'s corners: the cone\'s base)')),
};

/**
 * The rear mic, on the bump's top (inside its top's bottom-left R8.89 corner, 2.09 from the corner's centre). Across:
 * the 10.62 ordinate below Detail D, whose extension line rises to the mic's centre (the side-button edge is the view's
 * 0.00, the bump's 1.15 and 3.21 beside it); down: the -25.89 line runs in from the left to the mic's centre. Three concentric
 * circles are drawn there, Ø2.39, 2.06 (dashed) and 1.66 at 4800 dpi: the 13's three (2.40, 2.07, 1.65), whose Ø2.40
 * leader lands on the outer one. Here the Ø2.10 leader's arrow also lands on the outer circle, but the printed 2.10
 * matches the dashed middle one (within 0.04), not the outer (0.29 off). The number is taken as printed: the mic Ø2.10
 * (a finding: the outer ring may be the 13's carried over, or a trim round a smaller opening; the drawing doesn't say).
 */
export const rearMic = {
  fromSide: v(10.62, 'dimensioned', s1('Detail D: 10.62 (the ordinate below the view; its extension line rises to the mic\'s centre)')),
  fromTop: v(25.89, 'dimensioned', s1('Detail D: -25.89 (the line runs in to the mic\'s centre)')),
  diameter: v(2.1, 'dimensioned', s1('Detail D: [2] Ø2.10 REAR MIC (its arrow lands on the outer of three circles, drawn Ø2.39 as the 13\'s 2.40 ring; the printed 2.10 matches the dashed middle one, drawn 2.06)')),
};

/**
 * MagSafe's keepouts (sheet 2, the MagSafe view: the right-hand back view), the 13's number for number. The clear area
 * (5: DO NOT OBSTRUCT THIS AREA WITH METAL, CONDUCTIVE MATERIAL, OR MAGNETIC MATERIAL) is a whole Ø57.50 circle round
 * the product centre (35.76, -73.35: half the 146.71, rounded), 7.01 inside each edge. The magnetic zone (5 7: DO NOT
 * OBSTRUCT THIS AREA WITH MAGNETIC OR PERMEABLE MATERIAL EXCEPT MAGSAFE MAGNETS) is the 16's shape: the full width from
 * -40.12 down (the camera corner's keepout ends there: 4.22 below this phone's bump outline, 35.90, where the 13's is
 * 5.00 below its 35.12), straight-sided to -110.52, closed by an R49.39 arc through those corners, whose centre
 * (derived: 110.52 - √(49.39² - 35.76²) = 76.45 down) is 3.10 below the product centre.
 */
export const magsafe = {
  fromSide: v(35.76, 'dimensioned', s2('MagSafe view: 35.76 PRODUCT CENTER')),
  fromTop: v(73.35, 'dimensioned', s2('MagSafe view: -73.35 PRODUCT CENTER')),
  diameter: v(57.5, 'dimensioned', s2('MagSafe view: Ø57.50 (its leader on the clear area\'s circle; measure.ts fits the circle round the product centre)')),
  zoneFrom: v(40.12, 'dimensioned', s2('MagSafe view: -40.12, the zone\'s top edge, the full width (the camera corner\'s keepout\'s bottom)')),
  zoneSidesTo: v(110.52, 'dimensioned', s2('MagSafe view: 2X -110.52, where the zone\'s sides (the phone\'s) meet its arc')),
  zoneRadius: v(49.39, 'dimensioned', s2('MagSafe view: R49.39, the arc closing the zone below')),
};

/**
 * What the MagSafe view gives beyond the family's fields (not built, not in features.json):
 * - above the zone, the camera corner (0.00 to 39.12 across, 0.00 to -40.12 down, crosshatched): DO NOT OBSTRUCT THIS
 *   AREA WITH MAGNETIC OR PERMEABLE MATERIAL (FULL PRODUCT VOLUME INCLUDING SIDE WALLS); the rest of the top (39.12 to
 *   the far edge) carries no keepout but the compass;
 * - the COMPASS, a small hatched circle centred 64.91 across, -9.65 down (its size not dimensioned).
 * Sheet 2's middle back view and side view give other keepouts (metal and conductive material: the top and bottom
 * bands, the side band, the area beside the bump), and sheet 3 the antenna keepouts (Detail K): not recorded here.
 */
export const magsafeExtras = {
  cameraZone: { across: v(39.12, 'dimensioned', s2('MagSafe view: 39.12, the camera corner\'s keepout, its edge')), down: v(40.12, 'dimensioned', s2('MagSafe view: -40.12, its bottom (the zone\'s top)')) },
  compass: { fromSide: v(64.91, 'dimensioned', s2('MagSafe view: 64.91 COMPASS')), fromTop: v(9.65, 'dimensioned', s2('MagSafe view: -9.65 COMPASS')) },
};

export const lightning = {
  name: 'Lightning' as const,
  width: v(12.59, 'dimensioned', s1('Detail C: 12.59 RECOMMENDED CONNECTOR KEEPOUT (2X R3.45 corners)')),
  thickness: v(6.85, 'dimensioned', s1('Detail C: 6.85 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(35.76, 'dimensioned', s1('Detail C: 35.76 (the port\'s centre, from the side-button edge)')),
  fromBack: v(3.9, 'dimensioned', s1('Detail C: 3.90, the port\'s centre line to the back glass (the mid-plane)')),
  outward: v(14.0, 'dimensioned', s1('Detail C: MATING CONNECTOR KEEPOUT AREA FLUSH TO PRODUCT SURFACE REQUIRED OUTWARD 14.0 mm')),
};

export const front = {
  activeWidth: v(64.58, 'dimensioned', s1('front view: 64.58 DISPLAY ACTIVE AREA')),
  activeLength: v(139.77, 'dimensioned', s1('front view: 139.77 DISPLAY ACTIVE AREA')),
  activeFromEdge: v(3.47, 'dimensioned', s1('front view: 3.47 EXTERIOR OF HOUSING TO DISPLAY ACTIVE AREA')),
  activeRadius: v(7.85, 'scaled', 'front view: the active area\'s corners crossed on their diagonals, 7.78 to 7.93 at three (the bottom-left runs along a hatch line)'),
  notchWidth: v(26.79, 'dimensioned', s1('front view: 26.79 ACTIVE AREA CUTOUT (wall to wall)')),
  notchDepth: v(5.58, 'dimensioned', s1('front view: 5.58 ACTIVE AREA CUTOUT, from the active area\'s top (its upper arrow lands on the 139.77 line)')),
  notchTopRadius: v(0.82, 'dimensioned', s1('front view: 2X R0.82 (the leader reaches where the cutout\'s wall leaves the active area\'s top)')),
  notchBottomRadius: v(3.72, 'dimensioned', s1('front view: 2X R3.72 (the cutout\'s bottom corners)')),
  /**
   * Detail A dimensions only the receiver's cutout: 11.95 long (its extension lines touch the outer outline's ends) and
   * 1.38 down from the glass's edge (its upper arrow on the heavy glass line, 1.05 from the top), centred -1.74. The
   * slot inside it is scaled from the front view: the white inside it widened by one stroke of its own pen (0.34; the
   * cutout's is 0.41), its strokes' middles, as the 13's 11.00 x 0.77. Its round ends touch the cutout's end walls, so
   * measure.ts reads it with a scan of its own.
   */
  receiverLength: v(11.0, 'scaled', 'front view at 4800 dpi: the white inside the slot (10.66) and one stroke of its pen'),
  receiverHeight: v(0.73, 'scaled', 'front view at 4800 dpi: the white inside the slot (0.39) and one stroke of its pen'),
  receiverFromTop: v(1.74, 'dimensioned', s1('Detail A: -1.74 (the receiver\'s centre line)')),
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

export const simTray = {
  centre: v(110.04, 'dimensioned', s1('left side view: 110.04 SIM TRAY')),
  length: v(15.94, 'derived', s1('left side view: 2X 7.97, centre to each end')),
  width: v(2.56, 'dimensioned', s1('left side view: 2.56')),
  fromBack: v(3.9, 'dimensioned', s1('left side view: 3.90, from the back glass\'s line')),
};

/**
 * The bottom edge, from the volume-button edge. Only each group's end holes are dimensioned, and (as on the 13s) their
 * extension lines touch the holes' outer edges: at 1200 dpi the chords centre on 19.91, 22.16, 24.43 and 47.10 ...
 * 56.13, half a hole inside 19.14 and 25.18, 46.34 and 56.89. The holes between are evenly spaced, as drawn (2.255).
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
  holes: [...group(19.14, 25.18, 3, 'left'), ...group(46.34, 56.89, 5, 'right')],
  holeDiameter: v(1.53, 'dimensioned', s1('bottom view: 8X Ø1.53 PORTS')),
  holesFromBack: v(3.9, 'dimensioned', s1('bottom view: 3.90, the holes\' centre line to the back glass\'s line')),
  holeDepth: v(0.6, 'assumed', 'a mic or speaker hole\'s depth for a render: the drawing gives none'),
  screws: [29.37, 42.16].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (2X Ø1.50 SCREWS; the chords centre on it)`))),
  screwDiameter: v(1.5, 'dimensioned', s1('bottom view: 2X Ø1.50 SCREWS')),
  screwsFromBack: v(3.9, 'inferred', 'Detail C draws the screws on the holes\' centre line'),
  portFrom: v(31.54, 'dimensioned', s1('bottom view: 31.54 (the Lightning port\'s near end)')),
  portTo: v(39.99, 'dimensioned', s1('bottom view: 39.99 (its far end; centre 35.765, as Detail C\'s 35.76)')),
  portHeight: v(2.7, 'dimensioned', s1('Detail C: 2.70 (the port\'s opening across the thickness); its ends round (inferred)')),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none'),
};

export const mass = v(172, 'spec', 'Weight: 172 grams');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '12MP (spec); 4032 x 3024 is the usual 4:3 still size, not on the spec page' };

/** Everything above, as the family's builder (iphone/part.ts) reads it. */
export const phone: Phone = {
  part: {
    title: 'iPhone 14',
    name: 'iphone-14.dat',
    keywords: ['Apple', 'iPhone 14', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [
      ['2026-10-31', 'Built from Apple\'s dimensional drawing: body, cameras, buttons, ports, notch'],
      ['2026-11-01', 'Rear mic added (Detail D); the flash\'s keepout and MagSafe\'s keepouts in its features'],
    ],
    drawn: '2022-09-21',
    folder: 'iphone-14',
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
