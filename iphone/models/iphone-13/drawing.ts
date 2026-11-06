// iPhone 13, read from Apple's dimensional drawing (iphone/drawings/iphone-13.pdf, sheets 1 and 2, dated
// 05/14/21; sheet 2 gives the cameras' and the flash's keepout sections and MagSafe's keepouts). Every number carries where it came from and how we know it (src/provenance.ts): spec here is Apple's
// technical specifications page (support.apple.com/111872); scaled values are re-measured by measure.ts.
//
// It's drawn on the 13 mini's plan with the details lettered A–D: Detail A the corner, Detail B the edge profile,
// Detail C the Lightning port, Detail D the back. Coordinates on the back follow Detail D: `fromSide` from the
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
export const detailD: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 15500, y: 2200, width: 2600, height: 2600 }, pxPerMm: 57.6, origin: [234, 194] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5400, y: 5300, width: 2050, height: 3750 }, pxPerMm: 23.05, origin: [201, 201.5] };
export const receiverView: Region = { page: 2, dpi: 4800, crop: { x: 24900, y: 21950, width: 1600, height: 500 } };
export const bottomView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5400, y: 10600, width: 2050, height: 500 }, pxPerMm: 23.05, origin: [201, 257.25] };

/**
 * Sheet 2 (PDF page 3, drawn upright) at 1200 dpi: the two sections through the flash (Detail J), each with the
 * calibration measure.ts finds for it, and the MagSafe view (the right-hand back view) at 1800 dpi. Section G-G (down the
 * phone through the flash's centre; the cover glass's face is its left edge, `origin` across; down has no datum) is
 * scaled from that face to the 11.10 extension line: 57.6 px/mm, Detail D's scale. Section K-K (across the phone through
 * the flash's centre; drawn lying, the back down) is scaled on its Ø6.00 extension lines, at another scale (46.2 px/mm):
 * `origin` is their midpoint across (the flash's axis) and the cover glass's face (the top edge) down. The MagSafe view
 * is calibrated on its extension lines: 0.00 and 64.91 across above the phone, 0.00 and -110.52 down left of it.
 */
export const sectionGG: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 13650, y: 1300, width: 1300, height: 3000 }, pxPerMm: 57.6, origin: [208, 0] };
export const sectionKK: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 16300, y: 1500, width: 3100, height: 1300 }, pxPerMm: 46.17, origin: [1569, 525.5] };
export const magsafeView: Region & Calibration = { page: 3, dpi: 1800, crop: { x: 17700, y: 9750, width: 4500, height: 7050 }, pxPerMm: 43.21, origin: [635.5, 361] };

const s1 = (what: string) => `sheet 1, ${what}`;
const s2 = (what: string) => `sheet 2, ${what}`;

export const body = {
  width: v(71.52, 'dimensioned', s1('front view: 71.52 PRODUCT WIDTH')),
  length: v(146.7, 'dimensioned', s1('front view: 146.70 PRODUCT LENGTH')),
  thickness: v(7.65, 'dimensioned', s1('side view: 7.65 PRODUCT THICKNESS')),
  glassWidth: v(69.42, 'dimensioned', s1('front view: 69.42 GLASS')),
  glassLength: v(144.61, 'dimensioned', s1('front view: 144.61 GLASS')),
  /** The plan-view corner, (along the top edge, down the side) from the corner: Detail A's crosses, paired. */
  corner: {
    points: [
      [15.89, 0],
      [11.43, 0.07],
      [7.04, 0.92],
      [3.31, 3.31],
      [0.92, 7.04],
      [0.07, 11.42],
      [0, 15.89],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail A: CORNER PROFILE (ALL FOUR CORNERS); each label paired with the cross its leader reaches (11.43 across, 11.42 down, as printed)'),
  },
  /** The edge profile, (inset from the outermost side, half-height from mid-plane): Detail B. */
  edge: {
    points: [
      [0, 2.63],
      [0.01, 3.07],
      [0.14, 3.47],
      [0.48, 3.71],
      [0.91, 3.75],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail B: PROFILE (ALL SIDES), symmetric about the mid-plane; paired in order (the 2X labels; 0.14 where the 13 mini has 0.13)'),
  },
};

export const bump = {
  /** Its leaders land as labelled here (on the 13 mini the plateau's label sat on the outermost line). */
  top: v(1.5, 'dimensioned', s1('right side view: 1.50 BACK GLASS TO CAMERA PLATEAU (the inner line: the bump\'s flat top)')),
  rings: v(2.59, 'dimensioned', s1('right side view: 3X 2.59 BACK GLASS TO REAR CAMERA GLASS (the outermost line)')),
  baseFrom: v(1.15, 'dimensioned', s1('Detail D: 1.15 (across and down; its leader lands where the outline meets the back glass\'s heavy edge)')),
  baseSize: v(33.97, 'derived', s1('Detail D: 35.12 - 1.15, the outline\'s far sides less its near')),
  baseRadius: v(10.92, 'scaled', 'Detail D: the outline\'s corners crossed on their diagonals, 10.81 to 11.11 at three (the top-left runs into the back glass\'s heavy edge)'),
  topFrom: v(3.64, 'dimensioned', s1('Detail D: 3.64 (across and down)')),
  topSize: v(28.84, 'derived', s1('Detail D: 32.48 - 3.64')),
  topRadius: v(8.45, 'scaled', 'Detail D: the top\'s corners crossed on their diagonals, 8.44 to 8.47 at all four'),
};

/** Rear camera 1: the Ultra Wide. Rear camera 2: the Main (Wide). */
export const cameras = {
  ultraWide: {
    name: 'rear camera 1',
    label: 'Ultra Wide',
    fromSide: v(11.88, 'dimensioned', s1('Detail D: 11.88 REAR CAMERA 1')),
    fromTop: v(11.88, 'dimensioned', s1('Detail D: -11.88 REAR CAMERA 1')),
    ring: v(13.69, 'dimensioned', s1('Detail D: 2X Ø 13.69')),
    window: v(10.83, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(7.81, 'dimensioned', 'sheet 2, Section F-F: 7.81 REAR CAMERA 1 KEEPOUT CONE TO COVER GLASS'),
    keepoutCone: v(124, 'dimensioned', 'sheet 2, Section F-F: 124° REAR CAMERA 1 KEEPOUT CONE'),
    identity: v(1, 'inferred', 'camera 1 is the Ultra Wide: its 124° keepout cone just encloses the Ultra Wide\'s 120° (spec); camera 2\'s 83° (Section H-H, labelled camera 2 here) encloses the Main\'s ~80°'),
    fov: v(120, 'spec', 'Ultra Wide: ƒ/2.4 aperture and 120° field of view'),
    aperture: v(2.4, 'spec', 'Ultra Wide: ƒ/2.4'),
  },
  main: {
    name: 'rear camera 2',
    label: 'Main',
    fromSide: v(24.24, 'dimensioned', s1('Detail D: 24.24 REAR CAMERA 2')),
    fromTop: v(24.24, 'dimensioned', s1('Detail D: -24.24 REAR CAMERA 2')),
    ring: v(13.69, 'dimensioned', s1('Detail D: 2X Ø 13.69')),
    window: v(10.83, 'scaled', 'Detail D: the innermost of the camera\'s circles'),
    coneApexFromFront: v(6.33, 'dimensioned', 'sheet 2, Section H-H: 6.33 REAR CAMERA 2 KEEPOUT CONE TO COVER GLASS'),
    keepoutCone: v(83, 'dimensioned', 'sheet 2, Section H-H: 83° REAR CAMERA 2 KEEPOUT CONE'),
    equivalentFocal: v(26, 'third-party', '26 mm equivalent, widely reported from Apple\'s 2021 launch; not on the spec page'),
    aperture: v(1.6, 'spec', 'Main: ƒ/1.6 aperture'),
  },
};

export const flash = {
  fromSide: v(26.11, 'dimensioned', s1('Detail D: 26.11 FLASH')),
  fromTop: v(10.01, 'dimensioned', s1('Detail D: -10.01')),
  diameter: v(6.28, 'dimensioned', s1('Detail D: Ø 6.28 FLASH')),
};

/**
 * The flash's keepout, drawn in two sections through its centre (Detail J): G-G down the phone, K-K across it. As the 13
 * mini's AB-AB and AC-AC, number for number: both draw an inner cone from the strobe (the flash's face, drawn under the
 * bump's glass) turning at 11.10 from the cover glass into a 157° outer cone; but the inner cone is 112° in G-G and 96° in
 * K-K. One Ø6.00 base on the strobe (K-K's dimension; G-G's lines leave the strobe's face about that far apart) flares
 * wider down the phone than across it: not a cone about one axis, and the family's field takes one angle. It takes
 * G-G's, 112°: a circular cone of it from the same base encloses K-K's 96° (a keepout, so the larger is the safe one);
 * the across section is kept below (`flashKeepoutAcross`), not built.
 *
 * "To cover glass" is from the front: 11.10's arrow lands on G-G's left face, the bump on the right, and its extension
 * line starts at the lower kink (measure.ts finds both kinks there). Neither section dimensions an apex: it's worked
 * from this drawing's own numbers, the 112° cone through the flash's Ø6.28 edge at the bump's top (7.65 + 1.50). Both
 * sections draw the body as the 13 mini's (measure.ts): the bump's glass 9.07 from the front, camera 2's ring 10.16
 * (the mini's 7.65 + 2.51), where sheet 1 dimensions this phone's 1.50 and 2.59 (9.15 and 10.24): 0.08 thin, the title
 * block's tolerance. The drawn lines cross nearer the front than the derived apex by about that.
 */
export const flashKeepout = {
  inner: v(112, 'dimensioned', s2('Section G-G: 112° FLASH INNER KEEPOUT CONE (down the phone; K-K across it gives 96°: see flashKeepoutAcross)')),
  outer: v(157, 'dimensioned', s2('Sections G-G and K-K: 157° FLASH OUTER KEEPOUT CONE (the same in both)')),
  transitionFromFront: v(11.1, 'dimensioned', s2('Section G-G: 11.10 FLASH KEEPOUT CONE TRANSITION TO COVER GLASS (its arrow on the section\'s front face, its extension line from the lower kink)')),
  innerBaseDiameter: v(6.0, 'dimensioned', s2('Section K-K: Ø 6.00 FLASH INNER KEEPOUT CONETO STROBE INTERSECTION (its extension lines on the inner cone\'s corners at the strobe\'s face)')),
  apexFromFront: v(7.03, 'derived', s2('Section G-G: not dimensioned; the 112° cone through the flash\'s Ø6.28 edge at the bump\'s top: 7.65 + 1.50 - 3.14 / tan 56°')),
};

/** What K-K gives beyond the family's field (not built, not in features.json): the inner cone across the phone. */
export const flashKeepoutAcross = {
  inner: v(96, 'dimensioned', s2('Section K-K: 96° FLASH INNER KEEPOUT CONE (across the phone)')),
  apexFromFront: v(6.32, 'derived', s2('Section K-K: not dimensioned; the 96° cone through the flash\'s Ø6.28 edge at the bump\'s top: 9.15 - 3.14 / tan 48°')),
  transitionFromFront: v(11.1, 'inferred', s2('Section K-K: its kinks drawn at G-G\'s dimensioned 11.10 from the cover glass (measure.ts)')),
  /** The strobe's face under the bump's glass, as both sections draw it (the base of the inner cone). */
  strobeRecess: v(0.1, 'scaled', 'sheet 2, Sections G-G and K-K: the strobe\'s face 8.98 from the cover glass (K-K 8.97), the bump\'s glass beside it 9.08 (K-K 9.10)'),
};

/**
 * The rear mic, on the bump's top (inside its top's bottom-left R8.45 corner, 2.35 from the corner's centre). Across: the
 * 10.43 ordinate above Detail D, whose extension line jogs and drops to the mic's centre (the side-button edge is the
 * view's 0.00); down: the -25.69 line runs in from the left to the mic's centre. Its Ø2.40 leader lands on the outer of
 * its two circles. measure.ts finds the drawn circle there.
 */
export const rearMic = {
  fromSide: v(10.43, 'dimensioned', s1('Detail D: 10.43 (the ordinate above the view; its extension line drops to the mic\'s centre)')),
  fromTop: v(25.69, 'dimensioned', s1('Detail D: -25.69 (the line runs in to the mic\'s centre)')),
  diameter: v(2.4, 'dimensioned', s1('Detail D: 2 Ø 2.40 REAR MIC (the leader on the outer circle)')),
};

/**
 * MagSafe's keepouts (sheet 2, the MagSafe view: the right-hand back view). The clear area (5: DO NOT OBSTRUCT THIS AREA
 * WITH METAL, CONDUCTIVE MATERIAL, OR MAGNETIC MATERIAL) is a whole Ø57.50 circle round the product centre: on the 71.52
 * width it stays 7.01 inside each edge (no straight sides, unlike the 13 mini's). The magnetic zone (5 7: DO NOT
 * OBSTRUCT THIS AREA WITH MAGNETIC OR PERMEABLE MATERIAL EXCEPT MAGSAFE MAGNETS) is the 16's shape: the full width from
 * -40.12 down (5.00 below the bump's outline, 35.12: the camera corner's keepout ends there), straight-sided to
 * -110.52, closed by an R49.39 arc through those corners, whose centre (derived: 110.52 - √(49.39² - 35.76²) = 76.45
 * down) is 3.10 below the product centre (the 12's, at 107.42, is on it).
 */
export const magsafe = {
  fromSide: v(35.76, 'dimensioned', s2('MagSafe view: 35.76 PRODUCT CENTER')),
  fromTop: v(73.35, 'dimensioned', s2('MagSafe view: -73.35 PRODUCT CENTER')),
  diameter: v(57.5, 'dimensioned', s2('MagSafe view: Ø 57.50 (its leader on the clear area\'s circle; measure.ts fits the circle round the product centre)')),
  zoneFrom: v(40.12, 'dimensioned', s2('MagSafe view: -40.12, the zone\'s top edge, the full width (the camera corner\'s keepout\'s bottom)')),
  zoneSidesTo: v(110.52, 'dimensioned', s2('MagSafe view: 2X -110.52, where the zone\'s sides (the phone\'s) meet its arc')),
  zoneRadius: v(49.39, 'dimensioned', s2('MagSafe view: R 49.39, the arc closing the zone below')),
};

/**
 * What the MagSafe view gives beyond the family's fields (not built, not in features.json):
 * - above the zone, the camera corner (0.00 to 39.12 across, 0.00 to -40.12 down, crosshatched): DO NOT OBSTRUCT THIS
 *   AREA WITH MAGNETIC OR PERMEABLE MATERIAL (FULL PRODUCT VOLUME INCLUDING SIDE WALLS); the rest of the top (39.12 to
 *   the far edge) carries no keepout but the compass;
 * - the COMPASS, a small hatched circle centred 64.91 across, -9.65 down (its size not dimensioned).
 * Sheet 2's middle back view and its side view give other keepouts (metal and conductive material: the top and bottom
 * bands, the side band, the area beside the bump), not recorded here.
 */
export const magsafeExtras = {
  cameraZone: { across: v(39.12, 'dimensioned', s2('MagSafe view: 39.12, the camera corner\'s keepout, its edge')), down: v(40.12, 'dimensioned', s2('MagSafe view: -40.12, its bottom (the zone\'s top)')) },
  compass: { fromSide: v(64.91, 'dimensioned', s2('MagSafe view: 64.91 COMPASS')), fromTop: v(9.65, 'dimensioned', s2('MagSafe view: -9.65 COMPASS')) },
};

export const lightning = {
  name: 'Lightning' as const,
  width: v(13.65, 'dimensioned', s1('Detail C: 13.65 RECOMMENDED CONNECTOR KEEPOUT (2X R 3.40 corners)')),
  thickness: v(6.85, 'dimensioned', s1('Detail C: 6.85 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(35.76, 'dimensioned', s1('Detail C: 35.76 (the port\'s centre, from the side-button edge)')),
  fromBack: v(3.82, 'dimensioned', s1('Detail C: 3.82, the port\'s centre line to the back glass')),
  outward: v(14.0, 'dimensioned', s1('Detail C: MATING CONNECTOR KEEPOUT AREA ... REQUIRED OUTWARD 14.0 mm')),
};

export const front = {
  activeWidth: v(64.58, 'dimensioned', s1('front view: 64.58 DISPLAY ACTIVE AREA')),
  activeLength: v(139.77, 'dimensioned', s1('front view: 139.77 DISPLAY ACTIVE AREA')),
  activeFromEdge: v(3.47, 'dimensioned', s1('front view: 3.47 ALL AROUND, EXTERIOR OF HOUSING TO DISPLAY ACTIVE AREA')),
  activeRadius: v(7.89, 'scaled', 'front view: the active area\'s corners crossed on their diagonals, 7.92 at three, 7.78 at the bottom-left'),
  notchWidth: v(26.79, 'dimensioned', s1('front view: 26.79 ACTIVE AREA CUTOUT (wall to wall)')),
  notchDepth: v(5.58, 'dimensioned', s1('front view: 5.58 ACTIVE AREA CUTOUT, from the active area\'s top (as the 13 mini\'s 5.77)')),
  notchTopRadius: v(0.95, 'dimensioned', s1('front view: 2X R 0.95')),
  notchBottomRadius: v(3.8, 'dimensioned', s1('front view: 2X R 3.80')),
  /** The 13 mini's drawing dimensions its slot (11.12 x 0.85), and these strokes' middles read 0.1 inside it there. */
  receiverLength: v(11.0, 'scaled', 'front view at 4800 dpi: the slot\'s end strokes, centre to centre (its cutout, the 11.70 x 1.38 of Detail A and the keepout, is the outer outline)'),
  receiverHeight: v(0.77, 'scaled', 'front view at 4800 dpi: the white inside the slot, widened by half a stroke each side'),
  receiverFromTop: v(1.75, 'dimensioned', s1('Detail A: -1.75 (the receiver\'s centre line)')),
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
    half: v(5.82, 'dimensioned', s1('left side view: 4X 5.82')),
    width: v(3.11, 'dimensioned', s1('left side view: 2X 3.11')),
    fromBack: v(3.82, 'dimensioned', s1('left side view: 2X 3.82, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (+) VOLUME BUTTON')),
    note: '',
  },
  volumeDown: {
    side: 'volume' as const,
    centre: v(59.53, 'dimensioned', s1('left side view: 59.53 (-) VOLUME BUTTON')),
    half: v(5.82, 'dimensioned', s1('left side view: 4X 5.82')),
    width: v(3.11, 'dimensioned', s1('left side view: 2X 3.11')),
    fromBack: v(3.82, 'dimensioned', s1('left side view: 2X 3.82, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (-) VOLUME BUTTON')),
    note: '',
  },
  side: {
    side: 'side' as const,
    centre: v(52.53, 'dimensioned', s1('right side view: 52.53 SIDE BUTTON')),
    half: v(9.07, 'dimensioned', s1('right side view: 2X 9.07')),
    width: v(3.11, 'dimensioned', s1('right side view: 3.11')),
    fromBack: v(3.83, 'derived', s1('right side view: 3.82 from the front glass\'s line, so 7.65 - 3.82 from the back')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 SIDE BUTTON')),
    note: '',
  },
};

export const simTray = {
  centre: v(110.04, 'dimensioned', s1('left side view: 110.04')),
  length: v(16.1, 'derived', s1('left side view: 2X 8.05, centre to each end')),
  width: v(2.72, 'dimensioned', s1('left side view: 2.72')),
  fromBack: v(3.82, 'dimensioned', s1('left side view: 3.82, from the back glass\'s line')),
};

/**
 * The bottom edge, from the volume-button edge. Only each group's end holes are dimensioned, and their extension lines
 * touch the holes' outer edges: 19.14 and 25.18 bound the three on the left, 46.34 and 56.89 the five on the right. A
 * hole's centre is half its 1.53 inside; the holes between are evenly spaced, as drawn (both groups 2.255 apart).
 */
const R = 1.53 / 2;
const group = (from: number, to: number, n: number, which: string) => {
  const [a, b] = [from + R, to - R];
  return Array.from({ length: n }, (_, i) => {
    const mm = +(a + ((b - a) * i) / (n - 1)).toFixed(3);
    const how = i === 0 ? `${from} + 0.765: ${from} lands on the hole's outer edge` : i === n - 1 ? `${to} - 0.765: ${to} lands on the hole's outer edge` : `evenly between, as drawn`;
    return v(mm, i === 0 || i === n - 1 ? 'derived' : 'inferred', s1(`bottom view, the ${which} group (8X Ø 1.53 PORTS): ${how}`));
  });
};

export const bottom = {
  holes: [...group(19.14, 25.18, 3, 'left'), ...group(46.34, 56.89, 5, 'right')],
  holeDiameter: v(1.53, 'dimensioned', s1('bottom view: 8X Ø 1.53 PORTS')),
  holesFromBack: v(3.75, 'dimensioned', s1('bottom view: 3.75, the holes\' centre line to the back glass\'s line')),
  holeDepth: v(0.6, 'assumed', 'a mic or speaker hole\'s depth for a render: the drawing gives none'),
  screws: [29.37, 42.16].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (2X Ø 1.50 SCREW)`))),
  screwDiameter: v(1.5, 'dimensioned', s1('bottom view: 2X Ø 1.50 SCREW')),
  screwsFromBack: v(3.75, 'inferred', 'Detail C draws the screws on the holes\' centre line'),
  portFrom: v(31.74, 'dimensioned', s1('bottom view: 31.74 (the Lightning port\'s near end)')),
  portTo: v(39.79, 'dimensioned', s1('bottom view: 39.79 (its far end; centre 35.765, as Detail C\'s 35.76)')),
  portHeight: v(2.3, 'dimensioned', s1('Detail C: 2.30 (the port\'s opening across the thickness); its ends round (inferred)')),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none'),
};

export const mass = v(174, 'spec', 'Weight: 174 grams');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '12MP (spec); 4032 x 3024 is the usual 4:3 still size, not on the spec page' };

/** Everything above, as the family's builder (iphone/part.ts) reads it. */
export const phone: Phone = {
  part: {
    title: 'iPhone 13',
    name: 'iphone-13.dat',
    keywords: ['Apple', 'iPhone 13', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [
      ['2026-10-30', 'Built from Apple\'s dimensional drawing: body, cameras, buttons, ports, notch'],
      ['2026-11-01', 'Rear mic added (Detail D); the flash\'s keepout and MagSafe\'s keepouts in its features'],
    ],
    drawn: '05/14/21',
    folder: 'iphone-13',
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
