// iPhone 13 Pro Max, read from Apple's dimensional drawing (iphone/drawings/iphone-13-pro-max.pdf, sheets 1
// and 2, dated 05/14/21). Every number carries where it came from and how we know it (src/provenance.ts): spec here is
// Apple's technical specifications page (support.apple.com/111870); scaled values are re-measured by measure.ts.
//
// The 13 Pro on a larger body: the same cameras, bump, LiDAR scanner (sheet 2, Detail J) and buttons; its own corner,
// front, SIM tray, port and bottom holes. Detail A the corner, B the edge profile, C the Lightning port, D the back. Coordinates on the back follow Detail D: `fromSide` from the
// side-button edge (the left edge in a back view), `fromTop` from the top edge. Depths from the back glass outward, or
// from the front face inward, as the drawing measures them.
import type { Phone } from '../../drawing.ts';
import type { Calibration, Region } from '../../../src/raster.ts';
import { v, type Kind } from '../../../src/provenance.ts';

/**
 * Where the scaled values were measured, each region of sheet 1 (PDF page 2) with the calibration measure.ts finds for
 * it: Detail D at 1200 dpi (the camera centres calibrate it), the front view (its outer edges), the receiver at 4800
 * dpi (the front view's frame), the bottom view (its outer edges and outlines).
 */
export const detailD: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 15300, y: 1800, width: 2800, height: 2800 }, pxPerMm: 57.6, origin: [245, 186] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5300, y: 5000, width: 2100, height: 4150 }, pxPerMm: 23.05, origin: [225.5, 339] };
export const bottomView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5300, y: 10600, width: 2100, height: 500 }, pxPerMm: 23.05, origin: [225.5, 257.25] };
/**
 * Sheet 2 (PDF page 3): Detail J at 1200 dpi (its 0.00 and 30.08 lines across, the 0.00 line down; the 7.06 lines check
 * it), the flash's Section G-G and Section K-K at 1200 dpi (G-G's scale from the cover glass's face to the 11.27 line,
 * origin the face; K-K's from the Ø6.00 lines, origin the flash's axis across and the face down), and the MagSafe view
 * at 1800 dpi (its 0.00 and 72.40 lines across, 0.00 and -113.78 down): what measure.ts reads the rear mic again, the
 * flash's keepout and MagSafe's keepouts from.
 */
export const detailJ: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 15600, y: 5800, width: 4000, height: 3800 }, pxPerMm: 46.09, origin: [914.5, 786] };
export const sectionGG: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 13100, y: 1000, width: 1300, height: 3600 }, pxPerMm: 57.6, origin: [247.5, 0] };
export const sectionKK: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 16000, y: 600, width: 3800, height: 3400 }, pxPerMm: 46.17, origin: [1901, 941] };
export const magsafeView: Region & Calibration = { page: 3, dpi: 1800, crop: { x: 17700, y: 9200, width: 4600, height: 7800 }, pxPerMm: 43.22, origin: [494, 605.5] };

const s1 = (what: string) => `sheet 1, ${what}`;
const s2 = (what: string) => `sheet 2, ${what}`;

export const body = {
  width: v(78.07, 'dimensioned', s1('front view: 78.07 PRODUCT WIDTH')),
  length: v(160.84, 'dimensioned', s1('front view: 160.84 PRODUCT LENGTH')),
  thickness: v(7.65, 'dimensioned', s1('side view: 7.65 PRODUCT THICKNESS')),
  glassWidth: v(75.97, 'dimensioned', s1('front view: 75.97 GLASS')),
  glassLength: v(158.74, 'dimensioned', s1('front view: 158.74 GLASS')),
  /** The plan-view corner, (along the top edge, down the side) from the corner: Detail A's crosses, paired. */
  corner: {
    points: [
      [17.32, 0],
      [12.44, 0.08],
      [7.67, 1.0],
      [3.61, 3.61],
      [1.0, 7.67],
      [0.08, 12.44],
      [0, 17.32],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail A: CORNER PROFILE (ALL FOUR CORNERS); each label paired with the cross its leader reaches'),
  },
  /** The edge profile, (inset from the flat side, half-height from mid-plane): Detail B, from a 0.00 datum (the 13 Pro's says 0.21). */
  edge: {
    points: [
      [0, 2.63],
      [0.01, 3.07],
      [0.14, 3.47],
      [0.48, 3.71],
      [0.91, 3.75],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail B: PROFILE (ALL SIDES), symmetric about the mid-plane; paired in order (the 2X labels)'),
  },
};

export const bump = {
  top: v(1.68, 'dimensioned', s1('right side view: 1.68 BACK GLASS TO CAMERA PLATEAU')),
  rings: v(3.6, 'dimensioned', s1('right side view: 3X 3.60 BACK GLASS TO REAR CAMERA GLASS')),
  baseFrom: v(1.15, 'dimensioned', s1('Detail D: 1.15 (across and down)')),
  baseSize: v(41.24, 'derived', s1('Detail D: 42.39 - 1.15, across')),
  baseHeight: v(42.47, 'derived', s1('Detail D: -43.62 - -1.15, down (the bump is 1.23 taller than wide)')),
  baseRadius: v(12.53, 'scaled', 'Detail D: the outline\'s bottom-left corner crossed on its diagonal (the other three are crossed by other lines)'),
  topFrom: v(4.27, 'dimensioned', s1('Detail D: 4.27 (across and down)')),
  topSize: v(35.01, 'derived', s1('Detail D: 39.28 - 4.27, across')),
  topHeight: v(36.24, 'derived', s1('Detail D: -40.51 - -4.27, down')),
  topRadius: v(9.39, 'scaled', 'Detail D: the top\'s corners crossed on their diagonals'),
};

/** Which is which, from sheet 2's keepout cones: camera 1 the Telephoto (37°), 2 the Main (85°), 3 the Ultra Wide (123°). */
export const cameras = {
  telephoto: {
    name: 'rear camera 1',
    label: 'Telephoto',
    fromSide: v(13.43, 'dimensioned', s1('Detail D: 2X 13.43 (rear cameras 1 and 2)')),
    fromTop: v(13.43, 'dimensioned', s1('Detail D: -13.43 REAR CAMERA 1')),
    ring: v(15.53, 'dimensioned', s1('Detail D: 3X Ø 15.53')),
    window: v(11.79, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(3.1, 'dimensioned', 'sheet 2, Section F-F: 3.10 REAR CAMERA 1 KEEPOUT CONE TO COVER GLASS'),
    keepoutCone: v(37, 'dimensioned', 'sheet 2, Section F-F: 37° REAR CAMERA 1 KEEPOUT CONE'),
    identity: v(1, 'inferred', 'camera 1 is the Telephoto: its 37° cone encloses a 77 mm equivalent\'s 31°; camera 2\'s 85° the Main\'s ~80°; camera 3\'s 123° the Ultra Wide\'s 120° (spec)'),
    equivalentFocal: v(77, 'third-party', '77 mm equivalent (3x the Main), widely reported from Apple\'s 2021 launch; the spec page gives 3x optical zoom'),
    aperture: v(2.8, 'spec', 'Telephoto: ƒ/2.8 aperture'),
  },
  main: {
    name: 'rear camera 2',
    label: 'Main',
    fromSide: v(13.43, 'dimensioned', s1('Detail D: 2X 13.43 (rear cameras 1 and 2)')),
    fromTop: v(31.35, 'dimensioned', s1('Detail D: -31.35 REAR CAMERA 2')),
    ring: v(15.53, 'dimensioned', s1('Detail D: 3X Ø 15.53')),
    window: v(11.79, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(7.27, 'dimensioned', 'sheet 2, Section F-F: 7.27 REAR CAMERA 2 KEEPOUT CONE TO COVER GLASS'),
    keepoutCone: v(85, 'dimensioned', 'sheet 2, Section F-F: 85° REAR CAMERA 2 KEEPOUT CONE'),
    equivalentFocal: v(26, 'third-party', '26 mm equivalent, widely reported from Apple\'s 2021 launch; not on the spec page'),
    aperture: v(1.5, 'spec', 'Wide: ƒ/1.5 aperture'),
  },
  ultraWide: {
    name: 'rear camera 3',
    label: 'Ultra Wide',
    fromSide: v(30.08, 'dimensioned', s1('Detail D: 2X 30.08 (rear camera 3 and the flash)')),
    fromTop: v(22.39, 'dimensioned', s1('Detail D: -22.39 REAR CAMERA 3')),
    ring: v(15.53, 'dimensioned', s1('Detail D: 3X Ø 15.53')),
    window: v(12.05, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(6.67, 'dimensioned', 'sheet 2, Section H-H: 6.67 REAR CAMERA 3 KEEPOUT CONE TO COVER GLASS (labelled camera 3 here, as the 13 Pro\'s G-G should be)'),
    keepoutCone: v(123, 'dimensioned', 'sheet 2, Section H-H: 123° REAR CAMERA 3 KEEPOUT CONE'),
    fov: v(120, 'spec', 'Ultra Wide: ƒ/1.8 aperture and 120° field of view'),
    aperture: v(1.8, 'spec', 'Ultra Wide: ƒ/1.8'),
  },
};

export const flash = {
  fromSide: v(30.08, 'dimensioned', s1('Detail D: 2X 30.08 FLASH')),
  fromTop: v(9.42, 'dimensioned', s1('Detail D: -9.42 FLASH')),
  diameter: v(6.28, 'dimensioned', s1('Detail D: Ø 6.28 FLASH')),
};

/**
 * The rear mic, on the bump's top. Unlike the 13 Pro's sheet (which gives only its Ø1.15, so its place there is scaled),
 * this Detail D dimensions it: the -32.21 extension line runs right from the mic's centre, the 35.76 one down from it
 * (both start at its outer circle, on its centre lines), and the Ø1.15 leader lands on the outer of its two circles. The
 * bump and cameras carry the 13 Pro's numbers, and its scaled mic (35.78, 32.22) lands within 0.02 of these: the same
 * mic on the same bump. 35.76 isn't this phone's centre line (39.04). Sheet 2's Detail J draws it again, its top crossed by
 * the 7.06 dimension's upper line (measure.ts reads both). Its centre is 5.97 from the centre of the top's bottom-right
 * R9.39 corner, well inside it, so the builder puts it flush on the bump's top.
 */
export const rearMic = {
  fromSide: v(35.76, 'dimensioned', s1('Detail D: 35.76 (the extension line down from the rear mic\'s centre)')),
  fromTop: v(32.21, 'dimensioned', s1('Detail D: -32.21 (the extension line right from the rear mic\'s centre)')),
  diameter: v(1.15, 'dimensioned', s1('Detail D: 2 Ø 1.15 REAR MIC (the leader on the outer of its two circles; note 2: DO NOT OBSTRUCT PORTS)')),
};

/**
 * The flash's keepout, drawn as on the 13 Pro in two sections through its centre: Section G-G down the phone (the cut on
 * Detail J's 30.08 line) and K-K across it (Detail J's horizontal cut through the flash). An inner cone from the strobe
 * (the flash's face, drawn 0.10 under the bump's glass) turning at 11.27 from the cover glass into a 157° outer cone,
 * the inner cone 112° in G-G and 96° in K-K, from one Ø6.00 base on the strobe (K-K's dimension). Not a cone about one
 * axis; the family's field takes one angle, G-G's 112° (a circular cone of it from the same base encloses K-K's 96°: the
 * keepout's safe side); the across section is kept below (`flashKeepoutAcross`), not built. Both sections' hatching
 * stops at a line 14.15 from the cover glass (undimensioned): a drafting limit, not part of the keepout.
 *
 * "To cover glass" is from the front: 11.27's arrows run from G-G's left face (the screen; the bump is on the right) to
 * an extension line that rises to the lower kink, and both kinks lie on it (measure.ts). Neither section dimensions an
 * apex: it's worked as the 13 Pro's, the 112° cone through the flash's Ø6.28 edge at the bump's top (7.65 + 1.68, the
 * same as the 13 Pro's). The sections draw the bump's glass at about 9.25 and camera 3's ring at about 11.2, where sheet
 * 1 dimensions 1.68 and 3.60 (9.33 and 11.25): 0.07 to 0.08 thin, as the 13 Pro's (measure.ts).
 */
export const flashKeepout = {
  inner: v(112, 'dimensioned', s2('Section G-G: 112° FLASH INNER KEEPOUT CONE (down the phone; K-K across it gives 96°: see flashKeepoutAcross)')),
  outer: v(157, 'dimensioned', s2('Sections G-G and K-K: 157° FLASH OUTER KEEPOUT CONE (the same in both)')),
  transitionFromFront: v(11.27, 'dimensioned', s2('Section G-G: 11.27 FLASH KEEPOUT CONE TRANSITION TO COVER GLASS (its arrows from the section\'s front face to an extension line rising to the lower kink)')),
  innerBaseDiameter: v(6.0, 'dimensioned', s2('Section K-K: Ø 6.00 FLASH INNER KEEPOUT CONE TO STROBE INTERSECTION (its extension lines on the inner cone\'s corners at the strobe\'s face)')),
  apexFromFront: v(7.21, 'derived', s2('Section G-G: not dimensioned; the 112° cone through the flash\'s Ø6.28 edge at the bump\'s top: 7.65 + 1.68 - 3.14 / tan 56°')),
};

/** What K-K gives beyond the family's field (not built, not in features.json): the inner cone across the phone. */
export const flashKeepoutAcross = {
  inner: v(96, 'dimensioned', s2('Section K-K: 96° FLASH INNER KEEPOUT CONE (across the phone)')),
  apexFromFront: v(6.5, 'derived', s2('Section K-K: not dimensioned; the 96° cone through the flash\'s Ø6.28 edge at the bump\'s top: 9.33 - 3.14 / tan 48°')),
  transitionFromFront: v(11.27, 'inferred', s2('Section K-K: its kinks drawn at G-G\'s dimensioned 11.27 from the cover glass (measure.ts)')),
  /** The strobe's face under the bump's glass, as both sections draw it (the base of the inner cone). */
  strobeRecess: v(0.1, 'scaled', 'sheet 2, Sections G-G and K-K: the strobe\'s face 0.10 under the bump\'s glass beside it (measure.ts), as on the 13 Pro'),
};

/**
 * MagSafe's keepouts (sheet 2, the MagSafe view: the middle-right back view). The clear area (5: DO NOT OBSTRUCT THIS
 * AREA WITH METAL, CONDUCTIVE MATERIAL OR MAGNETIC MATERIAL) is a whole Ø57.50 circle round the product centre (39.04,
 * -80.42). The magnetic zone (5 7: DO NOT OBSTRUCT THIS AREA WITH MAGNETIC OR PERMEABLE MATERIAL EXCEPT MAGSAFE MAGNETS)
 * is the 16's shape: the full width from -47.18 down (the camera corner's keepout's bottom, 3.56 below the bump
 * outline's -43.62), straight-sided to -113.78, closed by an R49.39 arc through those corners. Its centre (derived:
 * 113.78 - √(49.39² - 39.035²) = 83.52 down) is 3.10 below the product centre, as on the 13 (the 12 Pro's and 13 Pro's
 * is the product centre): the 13's arc on a wider phone, its sides running 3.26 further down.
 */
export const magsafe = {
  fromSide: v(39.04, 'dimensioned', s2('MagSafe view: 39.04 PRODUCT CENTER')),
  fromTop: v(80.42, 'dimensioned', s2('MagSafe view: -80.42 PRODUCT CENTER')),
  diameter: v(57.5, 'dimensioned', s2('MagSafe view: Ø 57.50 (its leader on the clear area\'s circle; measure.ts fits the circle round the product centre)')),
  zoneFrom: v(47.18, 'dimensioned', s2('MagSafe view: -47.18, the zone\'s top edge, the full width (the camera corner\'s keepout\'s bottom)')),
  zoneSidesTo: v(113.78, 'dimensioned', s2('MagSafe view: 2X -113.78, where the zone\'s sides (the phone\'s) meet its arc')),
  zoneRadius: v(49.39, 'dimensioned', s2('MagSafe view: R 49.39, the arc closing the zone below')),
};

/**
 * What the MagSafe view gives beyond the family's fields (not built, not in features.json):
 * - above the zone, the camera corner (from 0.00 across to 42.39, down to -47.18, crosshatched): DO NOT OBSTRUCT THIS
 *   AREA WITH MAGNETIC OR PERMEABLE MATERIAL (FULL PRODUCT VOLUME INCLUDING SIDE WALLS). Here its right edge is
 *   dimensioned (42.39, the bump outline's right edge; the 13 Pro's sheet leaves it to scale). The rest of the top carries
 *   no keepout but the compass;
 * - the COMPASS, a small crosshatched circle centred 72.40 across, -12.09 down (its size not dimensioned).
 * Sheet 2's middle back view and its side view give other keepouts (metal and conductive material: the top and bottom
 * bands, the side band, the area beside the bump), not recorded here.
 */
export const magsafeExtras = {
  cameraZone: {
    across: v(42.39, 'dimensioned', s2('MagSafe view: 42.39, the camera corner\'s keepout\'s right edge')),
    down: v(47.18, 'dimensioned', s2('MagSafe view: -47.18, its bottom (the zone\'s top)')),
  },
  compass: { fromSide: v(72.4, 'dimensioned', s2('MagSafe view: 72.40 COMPASS')), fromTop: v(12.09, 'dimensioned', s2('MagSafe view: -12.09 COMPASS')) },
};

/** The LiDAR scanner: sheet 2's Detail J gives the base of its keepout cone on the plateau, a stadium, as its window. */
export const sensor = {
  name: 'LiDAR scanner',
  fromSide: v(30.08, 'dimensioned', 'sheet 2, Detail J: on the 30.08 line (section H-H through camera 3 and the sensor)'),
  fromTop: v(35.35, 'dimensioned', 'sheet 2, Detail J: -35.35 REAR SENSOR KEEPOUT'),
  keepoutCone: v(77, 'dimensioned', 'sheet 2, Section H-H: 77° REAR SENSOR KEEPOUT'),
  window: {
    width: v(4.06, 'dimensioned', 'sheet 2, Detail J: 4.06 (its ends 2X R 2.03: round, half its width)'),
    length: v(7.06, 'dimensioned', 'sheet 2, Detail J: 7.06 (REAR SENSOR KEEPOUT CONTACTING PLATEAU SURFACE)'),
  },
};

export const lightning = {
  name: 'Lightning' as const,
  width: v(13.65, 'dimensioned', s1('Detail C: 13.65 RECOMMENDED CONNECTOR KEEPOUT (2X R 3.40 corners)')),
  thickness: v(6.85, 'dimensioned', s1('Detail C: 6.85 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(39.04, 'dimensioned', s1('Detail C: 39.04 (the port\'s centre, from the side-button edge)')),
  fromBack: v(3.82, 'dimensioned', s1('Detail C: 3.82, the port\'s centre line to the back glass')),
  outward: v(14.0, 'dimensioned', s1('Detail C: MATING CONNECTOR KEEPOUT AREA ... REQUIRED OUTWARD 14.0 mm')),
};

export const front = {
  activeWidth: v(71.13, 'dimensioned', s1('front view: 71.13 DISPLAY ACTIVE AREA')),
  activeLength: v(153.9, 'dimensioned', s1('front view: 153.90 DISPLAY ACTIVE AREA')),
  activeFromEdge: v(3.47, 'dimensioned', s1('front view: 3.47 ALL AROUND, EXTERIOR OF HOUSING TO DISPLAY ACTIVE AREA')),
  activeRadius: v(8.93, 'scaled', 'front view: the active area\'s corners crossed on their diagonals, 8.81 to 8.96'),
  notchWidth: v(26.83, 'dimensioned', s1('front view: 26.83 ACTIVE AREA CUTOUT (wall to wall)')),
  notchDepth: v(5.6, 'dimensioned', s1('front view: 5.60 ACTIVE AREA CUTOUT, from the active area\'s top (as the 13 mini\'s 5.77)')),
  notchTopRadius: v(0.95, 'dimensioned', s1('front view: 2X R 0.95')),
  notchBottomRadius: v(3.8, 'dimensioned', s1('front view: 2X R 3.80')),
  /**
   * The receiver: this drawing draws only its cutout in the glass's edge (no inner slot, as the 13s have), dimensioned
   * in Detail A. Its top meets the glass's edge, so it's modelled 0.02 shallower, to stay a hole inside the glass.
   */
  receiverLength: v(11.7, 'dimensioned', s1('Detail A: 11.70 (the receiver\'s cutout)')),
  receiverHeight: v(1.36, 'derived', s1('Detail A: 1.38, less 0.02 to stay inside the glass, whose edge its top meets')),
  receiverFromTop: v(1.74, 'dimensioned', s1('Detail A: -1.74 (the receiver\'s centre line)')),
  receiverDepth: v(0.3, 'assumed', 'the slot\'s depth for a render: the drawing gives none'),
};

export const buttons = {
  ringSilent: {
    side: 'volume' as const,
    centre: v(32.22, 'dimensioned', s1('left side view: 32.22 POCKET CENTER')),
    half: v(2.9, 'dimensioned', s1('left side view: 2X 2.90 (centre to each end of the pocket)')),
    width: v(2.15, 'dimensioned', s1('left side view: 2.15')),
    fromBack: v(3.75, 'dimensioned', s1('left side view: 3.75 POCKET CENTER, from the back glass\'s line')),
    proud: v(0.6, 'dimensioned', s1('front view: 0.60 RING/SILENT SWITCH')),
    note: 'the switch sits in a 5.80 x 2.15 pocket; modelled as a block of the pocket\'s size standing 0.60 proud',
  },
  volumeUp: {
    side: 'volume' as const,
    centre: v(45.53, 'dimensioned', s1('left side view: 45.53 (+) VOLUME BUTTON')),
    half: v(5.8, 'dimensioned', s1('left side view: 4X 5.80')),
    width: v(3.06, 'dimensioned', s1('left side view: 2X 3.06')),
    fromBack: v(3.82, 'dimensioned', s1('left side view: 2X 3.82, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (+) VOLUME BUTTON')),
    note: '',
  },
  volumeDown: {
    side: 'volume' as const,
    centre: v(59.53, 'dimensioned', s1('left side view: 59.53 (-) VOLUME BUTTON')),
    half: v(5.8, 'dimensioned', s1('left side view: 4X 5.80')),
    width: v(3.06, 'dimensioned', s1('left side view: 2X 3.06')),
    fromBack: v(3.82, 'dimensioned', s1('left side view: 2X 3.82, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (-) VOLUME BUTTON')),
    note: '',
  },
  side: {
    side: 'side' as const,
    centre: v(52.53, 'dimensioned', s1('right side view: 52.53 SIDE BUTTON')),
    half: v(9.05, 'dimensioned', s1('right side view: 2X 9.05')),
    width: v(3.06, 'dimensioned', s1('right side view: 3.06')),
    fromBack: v(3.83, 'derived', s1('right side view: 3.82 from the front glass\'s line, so 7.65 - 3.82 from the back')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 SIDE BUTTON')),
    note: '',
  },
};

export const simTray = {
  centre: v(80.28, 'dimensioned', s1('left side view: 80.28')),
  length: v(16.14, 'derived', s1('left side view: 2X 8.07, centre to each end')),
  width: v(2.76, 'dimensioned', s1('left side view: 2.76')),
  fromBack: v(3.82, 'dimensioned', s1('left side view: 3.82, from the back glass\'s line')),
};

/**
 * The bottom edge, from the volume-button edge. Only each group's end holes are dimensioned, their extension lines
 * touching the holes' outer edges: 20.16 and 28.46 bound the four on the left, 49.62 and 62.42 the six on the right.
 * A hole's centre is half its 1.53 inside; the holes between are evenly spaced, as drawn (both groups 2.255 apart).
 */
const R = 1.53 / 2;
const group = (from: number, to: number, n: number, which: string) => {
  const [a, b] = [from + R, to - R];
  return Array.from({ length: n }, (_, i) => {
    const mm = +(a + ((b - a) * i) / (n - 1)).toFixed(3);
    const how = i === 0 ? `${from} + 0.765: ${from} lands on the hole's outer edge` : i === n - 1 ? `${to} - 0.765: ${to} lands on the hole's outer edge` : `evenly between, as drawn`;
    return v(mm, i === 0 || i === n - 1 ? 'derived' : 'inferred', s1(`bottom view, the ${which} group (10X Ø 1.53 PORTS): ${how}`));
  });
};

export const bottom = {
  holes: [...group(20.16, 28.46, 4, 'left'), ...group(49.62, 62.42, 6, 'right')],
  holeDiameter: v(1.53, 'dimensioned', s1('bottom view: 10X Ø 1.53 PORTS')),
  holesFromBack: v(3.75, 'dimensioned', s1('bottom view: 3.75, the holes\' centre line to the back glass\'s line')),
  holeDepth: v(0.6, 'assumed', 'a mic or speaker hole\'s depth for a render: the drawing gives none'),
  screws: [32.64, 45.43].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (2X Ø 1.50 SCREW)`))),
  screwDiameter: v(1.5, 'dimensioned', s1('bottom view: 2X Ø 1.50 SCREW')),
  screwsFromBack: v(3.75, 'inferred', 'Detail C draws the screws on the holes\' centre line'),
  portFrom: v(34.7, 'dimensioned', s1('bottom view: 34.70 (the Lightning port\'s near end)')),
  portTo: v(43.42, 'dimensioned', s1('bottom view: 43.42 (its far end; centre 39.06, as Detail C\'s 39.04): 8.72 long, the 13\'s 8.05')),
  portHeight: v(3.01, 'dimensioned', s1('Detail C: 3.01 (the port\'s opening across the thickness, the 13\'s 2.30); its ends round (inferred)')),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none'),
};

export const mass = v(240, 'spec', 'Weight: 240 grams');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '12MP (spec); 4032 x 3024 is the usual 4:3 still size, not on the spec page' };

/** Everything above, as the family's builder (iphone/part.ts) reads it. */
export const phone: Phone = {
  part: {
    title: 'iPhone 13 Pro Max',
    name: 'iphone-13-pro-max.dat',
    keywords: ['Apple', 'iPhone 13 Pro Max', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [
      ['2026-10-30', 'Built from Apple\'s dimensional drawing: body, cameras, LiDAR, buttons, ports, notch'],
      ['2026-11-01', 'Rear mic added (Detail D); the flash\'s keepout and MagSafe\'s keepouts in its features'],
    ],
    drawn: '05/14/21',
    folder: 'iphone-13-pro-max',
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
