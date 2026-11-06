// iPhone 13 mini, read from Apple's accessory drawing (iphone-13-mini.pdf, "Dimensional Drawings", sheets 1 and 2,
// dated 05/14/21; sheet 2 gives the cameras' and the flash's keepout sections and MagSafe's keepouts). Every number carries where it came from and how we know it (src/provenance.ts): spec here is
// Apple's technical specifications page (support.apple.com/111873); scaled values are re-measured by measure.ts.
//
// Coordinates on the back follow Detail Y (a view of the back): `fromSide` is measured from the side-button edge
// (the left edge in a back view), `fromTop` from the top edge (receiver end). Depths are measured from the back glass
// outward, or from the front face (the screen's cover glass) inward, as the drawing measures them.
import type { Calibration, Region } from '../../../src/raster.ts';
import { v, type Kind } from '../../../src/provenance.ts';
import type { Phone } from '../../drawing.ts';
export { tolerance } from '../../drawing.ts';

/**
 * Where the scaled values were measured: sheet 1 (PDF page 2) at 1200 dpi, cropped to Detail Y. The calibration is
 * measure.ts's: the two dimensioned camera centres give 69.14 px/mm in both axes and the datum (the side and top
 * edges, both drawn lines, fall where it puts 0); camera 1's ring then measures 13.69, as dimensioned.
 */
export const detailY: Region & Calibration = {
  page: 2,
  dpi: 1200,
  crop: { x: 13800, y: 500, width: 6200, height: 4400 },
  pxPerMm: 69.14,
  origin: [1893.7, 1533.8],
};

export const body = {
  width: v(64.21, 'dimensioned', 'sheet 1, front view: PRODUCT WIDTH'),
  length: v(131.5, 'dimensioned', 'sheet 1, front view: PRODUCT LENGTH'),
  thickness: v(7.65, 'dimensioned', 'sheet 1, side view: PRODUCT THICKNESS (front glass to back glass)'),
  glassWidth: v(62.11, 'dimensioned', 'sheet 1, front view: GLASS'),
  glassLength: v(129.4, 'dimensioned', 'sheet 1, front view: GLASS'),
  /** The plan-view corner: points on the curve as (along the top edge, down the side) from the corner, Detail X. */
  corner: {
    points: [
      [14.09, 0],
      [10.12, 0.06],
      [6.25, 0.81],
      [2.93, 2.94],
      [0.82, 6.24],
      [0.06, 10.12],
      [0, 14.09],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: 'sheet 1, Detail X: CORNER PROFILE (ALL FOUR CORNERS); paired by the curve\'s symmetry about the diagonal',
  },
  /** The edge profile through the thickness: (inset from the outermost side, half-height from mid-plane), Detail AA. */
  edge: {
    points: [
      [0, 2.63],
      [0.01, 3.07],
      [0.13, 3.47],
      [0.48, 3.71],
      [0.91, 3.75],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: 'sheet 1, Detail AA: PROFILE (ALL SIDES), symmetric about the mid-plane; paired in order (the 2X labels)',
  },
};

export const bump = {
  /** Above the back glass: the bump's flat top (the camera module's glass). */
  top: v(1.48, 'dimensioned', 'sheet 1, side view: 1.48 BACK GLASS TO REAR CAMERA GLASS (the inner of the two lines)'),
  /** Above the back glass: the lens rings, the highest point of the phone. */
  rings: v(2.51, 'dimensioned', 'sheet 1, side view: 2.51 BACK GLASS TO CAMERA PLATEAU (the outermost line)'),
  turretKeepout: v(1.51, 'dimensioned', 'sheet 1, Detail Y: RCAM TURRET KEEPOUT 1.51 mm ABOVE HOUSING SURFACE'),
  /** The bump's outline on the back glass: a square, its near sides 1.15 from the side and top edges. */
  baseSize: v(31.97, 'dimensioned', 'sheet 1, Detail Y: 31.97, the thin outline from 1.15 to 33.12 (scaled: both ways the same)'),
  baseFrom: v(1.15, 'scaled', 'Detail Y: the thin outline at 1.15 from the side and the top edge (mid-side scans)'),
  baseRadius: v(9.6, 'scaled', 'Detail Y: the outline\'s corners crossed on their diagonals, 9.25 to 9.9 (±0.4)'),
  /** Across from the heavy line (≈1.0 from the edges, left and top only: the back glass's edge, drawn heavy) to 33.12. */
  heavyToFar: v(32.07, 'dimensioned', 'sheet 1, Detail Y: 32.07 (scaled 32.13: from the heavy line, not the bump\'s outline)'),
  topSize: v(28.32, 'dimensioned', 'sheet 1, Detail Y: 28.32 square (both ways; scaled 2.875 to 31.19)'),
  topFrom: v(2.875, 'scaled', 'Detail Y: the 28.32 square\'s near sides, 2.87 to 2.88 from the side and top edges'),
  topRadius: v(8.0, 'scaled', 'Detail Y: the 28.32 square\'s corners crossed on their diagonals, 8.00 to 8.07 at all four'),
};

/** Rear camera 1: the Ultra Wide. Rear camera 2: the Main (Wide). */
export const cameras = {
  ultraWide: {
    name: 'rear camera 1',
    label: 'Ultra Wide',
    fromSide: v(10.85, 'dimensioned', 'sheet 1, Detail Y: REAR CAMERA 1'),
    fromTop: v(10.85, 'dimensioned', 'sheet 1, Detail Y: REAR CAMERA 1'),
    ring: v(13.69, 'dimensioned', 'sheet 1, Detail Y: 2X Ø 13.69 REAR CAMERA'),
    window: v(10.83, 'scaled', 'Detail Y: the innermost of the camera\'s circles (rings at 13.69, 11.99, 11.54, 10.83)'),
    /** Apex of the keepout cone, measured from the front face; the drawing's own optical reference point. */
    coneApexFromFront: v(7.81, 'dimensioned', 'sheet 2, Section F-F: 7.81 REAR CAMERA 1 KEEPOUT CONE TO COVER GLASS (from the front face)'),
    keepoutCone: v(124, 'dimensioned', 'sheet 2, Section F-F: 124° REAR CAMERA 1 KEEPOUT CONE'),
    identity: v(1, 'inferred', 'camera 1 is the Ultra Wide: its 124° keepout cone just encloses the Ultra Wide\'s 120° (spec); camera 2\'s 83° encloses the Main\'s ~80°'),
    /** Diagonal field of view. */
    fov: v(120, 'spec', 'Ultra Wide: ƒ/2.4 aperture and 120° field of view'),
    aperture: v(2.4, 'spec', 'Ultra Wide: ƒ/2.4'),
  },
  main: {
    name: 'rear camera 2',
    label: 'Main',
    fromSide: v(23.21, 'dimensioned', 'sheet 1, Detail Y: REAR CAMERA 2'),
    fromTop: v(23.21, 'dimensioned', 'sheet 1, Detail Y: REAR CAMERA 2'),
    ring: v(13.69, 'dimensioned', 'sheet 1, Detail Y: 2X Ø 13.69 REAR CAMERA (a further ring at 14.10, scaled)'),
    window: v(10.83, 'scaled', 'Detail Y: the innermost of the camera\'s circles (rings at 14.10, 13.70, 11.98, 11.54, 10.83)'),
    coneApexFromFront: v(6.33, 'dimensioned', 'sheet 2, Section G-G: 6.33 REAR CAMERA 2 KEEPOUT CONE TO COVERGLASS (from the front face)'),
    keepoutCone: v(83, 'dimensioned', 'sheet 2, Section G-G: 83°, labelled REAR CAMERA 1 KEEPOUT CONE; read as camera 2\'s: G-G cuts through camera 2 (Detail H) and its 6.33 names camera 2, so the label looks copied from F-F'),
    /** 35 mm equivalent focal length: Apple's spec page gives only the aperture. */
    equivalentFocal: v(26, 'third-party', '26 mm equivalent, widely reported from Apple\'s 2021 launch; not on the spec page'),
    aperture: v(1.6, 'spec', 'Main: ƒ/1.6 aperture; sensor-shift optical image stabilisation (Main)'),
  },
};

export const flash = {
  fromSide: v(25.08, 'scaled', 'Detail Y: the flash circle\'s centre (not dimensioned across)'),
  fromTop: v(8.98, 'dimensioned', 'sheet 1, Detail Y: -8.98'),
  diameter: v(6.28, 'dimensioned', 'sheet 1, Detail Y: Ø 6.28 FLASH'),
};

/**
 * Sheet 2 (PDF page 3) at 1200 dpi: the two sections through the flash and the MagSafe view, each with the calibration
 * measure.ts finds for it. Section AB-AB (down the phone through the flash's centre, Detail H; the cover glass's face is
 * its left edge, `origin` across; down has no datum) is scaled from that face to the 11.10 extension line. Section
 * AC-AC (across the phone through the flash's centre; drawn lying, the back down) is scaled on its Ø6.00 extension
 * lines: `origin` is their midpoint across (the flash's axis) and the cover glass's face (the top edge) down. Both come
 * out at 69.1 px/mm, Detail Y's scale. The MagSafe view (the back, middle of the sheet) is calibrated on its extension
 * lines: 0.00 and 58.47 across above the phone, 0.00 and -104.21 down left of it.
 */
export const sectionAB: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 12900, y: 1300, width: 1300, height: 3000 }, pxPerMm: 69.1, origin: [144.5, 0] };
export const sectionAC: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 16200, y: 1500, width: 3100, height: 1300 }, pxPerMm: 69.08, origin: [1542.25, 137.5] };
export const magsafeView: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 12200, y: 6300, width: 2700, height: 5000 }, pxPerMm: 28.8, origin: [402.5, 629.5] };

/**
 * The flash's keepout, drawn in two sections through its centre (Detail H): AB-AB down the phone, AC-AC across it.
 * Both draw an inner cone from the strobe (the flash's face, drawn 0.10 under the bump's glass) turning at 11.10 from
 * the cover glass into a 157° outer cone; but the inner cone is 112° in AB-AB and 96° in AC-AC. One Ø6.00 base on the
 * strobe (AC-AC's dimension; AB-AB's lines cross the strobe's face 5.97 apart) flares wider down the phone than across
 * it, to a transition 12.1 long by 10.6 wide (worked from the printed numbers): not a cone about one axis, and the
 * family's field takes one angle. It takes AB-AB's, 112°: a circular cone of it from the same base encloses AC-AC's 96°
 * (a keepout, so the larger is the safe one); the across section is kept below (`flashKeepoutAcross`), not built.
 *
 * "To cover glass" is from the front: 11.10's arrow lands on the section's left face, the bump on the right, and its
 * extension line on the kinks, which measure.ts finds 11.09 and 11.10 from that face (AC-AC's, undimensioned, 11.11).
 * Neither section dimensions an apex. The drawn inner lines leave the bump's glass at Ø6.27, the flash's own Ø6.28,
 * so the apex is worked from that: the 112° cone through Ø6.28 at the bump's top (7.65 + 1.48 = 9.13) has it 7.01
 * from the front, and meets the strobe (0.10 down) at Ø6.00, AC-AC's number. measure.ts crosses AB-AB's drawn lines
 * at 6.97: the section draws the bump's glass 0.06 thin (9.07), as the sheet's other views draw the body thin.
 */
export const flashKeepout = {
  inner: v(112, 'dimensioned', 'sheet 2, Section AB-AB: 112° FLASH INNER KEEPOUT CONE (down the phone; AC-AC across it gives 96°: see flashKeepoutAcross)'),
  outer: v(157, 'dimensioned', 'sheet 2, Sections AB-AB and AC-AC: 157° FLASH OUTER KEEPOUT CONE (the same in both)'),
  transitionFromFront: v(11.1, 'dimensioned', 'sheet 2, Section AB-AB: 11.10 FLASH KEEPOUT CONE TRANSITION TO COVER GLASS (its arrow on the section\'s front face, its extension line at the kinks)'),
  innerBaseDiameter: v(6.0, 'dimensioned', 'sheet 2, Section AC-AC: Ø 6.00 FLASH INNER KEEPOUT CONE TO STROBE INTERSECTION (its extension lines on the inner cone\'s corners at the strobe\'s face)'),
  apexFromFront: v(7.01, 'derived', 'sheet 2, Section AB-AB: not dimensioned; the 112° cone through the flash\'s Ø6.28 edge at the bump\'s top: 7.65 + 1.48 - 3.14 / tan 56° (equally, Ø6.00 on the strobe 0.10 under that top: 9.03 - 3.00 / tan 56°)'),
};

/** What AC-AC gives beyond the family's field (not built, not in features.json): the inner cone across the phone. */
export const flashKeepoutAcross = {
  inner: v(96, 'dimensioned', 'sheet 2, Section AC-AC: 96° FLASH INNER KEEPOUT CONE (across the phone)'),
  apexFromFront: v(6.3, 'derived', 'sheet 2, Section AC-AC: not dimensioned; the 96° cone through the flash\'s Ø6.28 edge at the bump\'s top: 9.13 - 3.14 / tan 48° (measure.ts crosses the drawn lines at 6.28)'),
  transitionFromFront: v(11.1, 'inferred', 'sheet 2, Section AC-AC: its kinks drawn 11.11 from the cover glass, AB-AB\'s dimensioned 11.10'),
  /** The strobe's face under the bump's glass, as both sections draw it (the base of the inner cone). */
  strobeRecess: v(0.1, 'scaled', 'sheet 2, Sections AB-AB and AC-AC: the strobe\'s face 8.97 from the cover glass, the bump\'s glass beside it 9.07 (AB-AB)'),
};

/**
 * The rear mic, on the bump's top (inside its top's bottom-left R8.0 corner, 2.08 from the corner's centre). Across: the
 * 9.40 under Detail Y is an ordinate whose extension line rises to the mic's centre (the side-button edge is the view's
 * 0.00); down: the -24.66 line leaves the mic's centre to the left. Its Ø2.40 leader lands on the outer of its three
 * circles (2400 dpi: Ø2.39, 2.08 and 1.65 scaled). measure.ts finds the drawn circle there.
 */
export const rearMic = {
  fromSide: v(9.4, 'dimensioned', 'sheet 1, Detail Y: 9.40 (the ordinate below the view; its extension line rises to the mic\'s centre)'),
  fromTop: v(24.66, 'dimensioned', 'sheet 1, Detail Y: -24.66 (the line leaves the mic\'s centre)'),
  diameter: v(2.4, 'dimensioned', 'sheet 1, Detail Y: 2 7 Ø 2.40 REAR MIC (the leader on the outer circle)'),
};

/**
 * MagSafe's keepouts (sheet 2, the MagSafe view: the back), as the 12 mini's drawing gives them on the same body. The
 * clear area (5: DO NOT OBSTRUCT THIS AREA WITH METAL, CONDUCTIVE MATERIAL OR MAGNETIC MATERIAL) is a Ø57.50 circle
 * round the product centre, its arcs (2X R28.75) cut off by straight sides 5.36 in from each edge (see `magsafeSides`):
 * the family's field takes the circle. The magnetic zone (5 7: DO NOT OBSTRUCT THIS AREA WITH METAL OR PERMEABLE
 * MATERIAL EXCEPT MAGSAFE MAGNETS) is the 16's shape: the full width from -33.12 (the bump's bottom: Detail Y's 1.15 +
 * 31.97) down, straight-sided to -104.21, closed by an R49.39 arc through those corners, whose centre (derived:
 * 104.21 - √(49.39² - 32.105²) = 66.68 down) is 0.94 below the product centre (the 12 mini's is on it).
 */
export const magsafe = {
  fromSide: v(32.11, 'dimensioned', 'sheet 2, MagSafe view: 32.11 PRODUCT CENTER'),
  fromTop: v(65.74, 'dimensioned', 'sheet 2, MagSafe view: -65.74 PRODUCT CENTER'),
  diameter: v(57.5, 'derived', 'sheet 2, MagSafe view: 2X R 28.75, the clear area\'s arcs above and below, both on one circle round the product centre (measure.ts fits them): 2 x 28.75'),
  zoneFrom: v(33.12, 'dimensioned', 'sheet 2, MagSafe view: -33.12, the zone\'s top edge, the full width (the bump\'s bottom, as Detail Y\'s outline)'),
  zoneSidesTo: v(104.21, 'dimensioned', 'sheet 2, MagSafe view: 2X -104.21, where the zone\'s sides (the phone\'s) meet its arc'),
  zoneRadius: v(49.39, 'dimensioned', 'sheet 2, MagSafe view: R 49.39, the arc closing the zone below'),
};

/**
 * What the MagSafe view gives beyond the family's fields (not built, not in features.json):
 * - the clear area's straight sides, 5.36 and 58.85 across (53.49 apart, centred on 32.105), from 55.66 to 75.82 down
 *   (2X: ±10.08 about the product centre). Sharp corners where the Ø57.50 circle meets those lines would fall at 55.19
 *   and 76.29: the dimensioned ends are the tangent points of blends the drawing doesn't dimension, R2.41 by the 12
 *   mini's working ((28.75 - r)² - (26.745 - r)² = 10.08²), which measure.ts's 4800 dpi trace checks here too;
 * - above the zone, the camera corner (0.00 to 33.12 across, 0.00 to -33.12 down, crosshatched): DO NOT OBSTRUCT THIS
 *   AREA WITH MAGNETIC OR PERMEABLE MATERIAL (FULL PRODUCT VOLUME INCLUDING SIDEWALLS); the rest of the top (33.12 to
 *   the far edge) carries no keepout;
 * - the COMPASS, a small circle centred 58.47 across, -8.83 down (its size not dimensioned).
 */
export const magsafeSides = {
  sideFrom: v(5.36, 'dimensioned', 'sheet 2, MagSafe view: 5.36 (the clear area\'s straight side, side-button edge)'),
  sideTo: v(58.85, 'dimensioned', 'sheet 2, MagSafe view: 58.85 (its other straight side)'),
  straightFrom: v(55.66, 'dimensioned', 'sheet 2, MagSafe view: 2X -55.66 (where the straight sides start)'),
  straightTo: v(75.82, 'dimensioned', 'sheet 2, MagSafe view: 2X -75.82 (where they end)'),
  blendRadius: v(2.41, 'derived', 'sheet 2, the blend between each straight side and its arc: not dimensioned; the radius that puts its tangent points on the 55.66 and 75.82 lines, from R28.75 and the sides 26.745 from the centre'),
  cameraZone: { across: v(33.12, 'dimensioned', 'sheet 2, MagSafe view: 33.12, the camera corner\'s keepout, its edge'), down: v(33.12, 'dimensioned', 'sheet 2, MagSafe view: -33.12, its bottom (the zone\'s top)') },
  compass: { fromSide: v(58.47, 'dimensioned', 'sheet 2, MagSafe view: 58.47 COMPASS'), fromTop: v(8.83, 'dimensioned', 'sheet 2, MagSafe view: -8.83 COMPASS') },
};

/** The room a Lightning plug needs: a rounded box on the bottom edge, centred on the port, reaching out from it. */
export const lightning = {
  name: 'Lightning' as const,
  width: v(13.65, 'dimensioned', 'sheet 1, Detail Z: 13.65 RECOMMENDED CONNECTOR KEEPOUT (2X R 3.40 corners)'),
  thickness: v(6.85, 'dimensioned', 'sheet 1, Detail Z: 6.85 RECOMMENDED CONNECTOR KEEPOUT'),
  fromSide: v(32.11, 'dimensioned', 'sheet 1, Detail Z: 32.11 (the port\'s centre, from the side-button edge)'),
  /** First recorded as from the screen; its leaders land on the back glass's line (the bump's side), 0.01 mm apart. */
  fromBack: v(3.82, 'dimensioned', 'sheet 1, Detail Z: 3.82, the port\'s centre line to the back glass (the bump\'s side of the view)'),
  outward: v(14.0, 'dimensioned', 'sheet 1, Detail Z: MATING CONNECTOR KEEPOUT AREA ... REQUIRED OUTWARD 14.0 mm'),
};

/**
 * Where the front view's scaled values were measured: sheet 1 (PDF page 2) at 1200 dpi, cropped to the front view.
 * Its coordinates are (from the volume-button edge, from the top edge): the front view's left is the volume side. The
 * calibration is measure.ts's: the product's outer edges, 64.21 across and 131.50 down.
 */
export const frontView: Region & Calibration = {
  page: 2,
  dpi: 1200,
  crop: { x: 5100, y: 5300, width: 1900, height: 3300 },
  pxPerMm: 23.05,
  origin: [196.5, 138.5],
};

/**
 * The bottom view, for laying the part over it: sheet 1 at 1200 dpi. Its coordinates are (from the volume-button edge,
 * from mid-thickness toward the back). Calibrated in measure.ts: the outer edges across (64.21), mid-way between the
 * front and back outlines down.
 */
export const bottomView: Region & Calibration = {
  page: 2,
  dpi: 1200,
  crop: { x: 5300, y: 10550, width: 1850, height: 500 },
  pxPerMm: 23.04,
  origin: [182, 233.25],
};

/** The receiver's slot, too finely drawn for 1200 dpi: the front view's top middle at 4800 dpi (frontView's frame). */
export const receiverView: Region = { page: 2, dpi: 4800, crop: { x: 23500, y: 21700, width: 1600, height: 500 } };

/** The front: the display's active area with its cutout (the notch) and the receiver, sheet 1 front view. */
export const front = {
  activeWidth: v(57.67, 'dimensioned', 'sheet 1, front view: 57.67 DISPLAY ACTIVE AREA'),
  activeLength: v(124.96, 'dimensioned', 'sheet 1, front view: 124.96 DISPLAY ACTIVE AREA'),
  activeFromEdge: v(3.27, 'dimensioned', 'sheet 1, front view: 3.27 TO ACTIVE AREA (top), 3.27 HOUSING SPLINE TO ACTIVE AREA (side)'),
  activeRadius: v(6.74, 'scaled', 'front view: the active area\'s corners crossed on their diagonals, 6.74 at three; the bottom-left\'s diagonal runs along a hatch line'),
  notchWidth: v(26.78, 'dimensioned', 'sheet 1, front view: 26.78 ACTIVE AREA CUTOUT (wall to wall)'),
  /** From the active area's top edge, not the product's: scaled, the cutout's bottom is 9.02 from the top (3.27 + 5.77). */
  notchDepth: v(5.77, 'dimensioned', 'sheet 1, front view: 5.77 ACTIVE AREA CUTOUT; its arrows land on the active area\'s top (the 3.27 line) and the cutout\'s bottom'),
  notchTopRadius: v(0.87, 'dimensioned', 'sheet 1, front view: 2X R 0.87 (where the cutout leaves the active area\'s top edge)'),
  notchBottomRadius: v(3.57, 'dimensioned', 'sheet 1, front view: 2X R 3.57 (the cutout\'s bottom corners)'),
  /** The receiver's slot (the inner of its two outlines; the outer is its cutout in the glass, the 11.70 keepout). */
  /** First scaled (11.01 x 0.76 at 1.76, from the strokes' middles at 4800 dpi), then found dimensioned in Detail X. */
  receiverLength: v(11.12, 'dimensioned', 'sheet 1, Detail X: 11.12 (the receiver\'s slot; its strokes\' middles scale 0.1 inside)'),
  receiverHeight: v(0.85, 'dimensioned', 'sheet 1, Detail X: 0.85 (the slot across)'),
  receiverFromTop: v(1.75, 'dimensioned', 'sheet 1, Detail X: -1.75 (the slot\'s centre line)'),
  receiverDepth: v(0.3, 'assumed', 'the slot\'s depth for a render: the drawing gives none'),
};

/**
 * The buttons on the long sides, sheet 1 side views and front view. `centre` is from the top edge; `half` is from the
 * centre to an end (the 4X 5.82 and 2X 9.07 land on an end and the centre line); `width` runs across the thickness;
 * each stands `proud` of the flat side (front view). Each is drawn as a stadium, its ends round (inferred: half its
 * width), and modelled flat-faced (assumed: the drawing gives no crown).
 */
export const buttons = {
  ringSilent: {
    side: 'volume' as const,
    centre: v(23.37, 'dimensioned', 'sheet 1, left side view: 23.37 POCKET CENTER'),
    half: v(2.85, 'derived', 'sheet 1, left side view: the pocket, 5.70 long'),
    width: v(2.15, 'dimensioned', 'sheet 1, left side view: 2.15 (the pocket across the thickness)'),
    fromBack: v(3.75, 'dimensioned', 'sheet 1, left side view: 3.75 POCKET CENTER, from the back glass\'s line (the bump\'s side)'),
    proud: v(0.6, 'dimensioned', 'sheet 1, front view: 0.60 RING/SILENT SWITCH'),
    note: 'the switch sits in a 5.70 x 2.15 pocket; modelled as a block of the pocket\'s size standing 0.60 proud (the toggle\'s own size isn\'t given)',
  },
  volumeUp: {
    side: 'volume' as const,
    centre: v(36.68, 'dimensioned', 'sheet 1, left side view: 36.68 (+) VOLUME BUTTON'),
    half: v(5.82, 'dimensioned', 'sheet 1, left side view: 4X 5.82'),
    width: v(3.11, 'dimensioned', 'sheet 1, left side view: 2X 3.11'),
    fromBack: v(3.82, 'dimensioned', 'sheet 1, left side view: 2X 3.82, from the back glass\'s line'),
    proud: v(0.45, 'dimensioned', 'sheet 1, front view: 0.45 (+) VOLUME BUTTON'),
    note: '',
  },
  volumeDown: {
    side: 'volume' as const,
    centre: v(50.68, 'dimensioned', 'sheet 1, left side view: 50.68 (-) VOLUME BUTTON'),
    half: v(5.82, 'dimensioned', 'sheet 1, left side view: 4X 5.82'),
    width: v(3.11, 'dimensioned', 'sheet 1, left side view: 2X 3.11'),
    fromBack: v(3.82, 'dimensioned', 'sheet 1, left side view: 2X 3.82, from the back glass\'s line'),
    proud: v(0.45, 'dimensioned', 'sheet 1, front view: 0.45 (-) VOLUME BUTTON'),
    note: '',
  },
  side: {
    side: 'side' as const,
    centre: v(43.68, 'dimensioned', 'sheet 1, right side view: 43.68 SIDE BUTTON'),
    half: v(9.07, 'dimensioned', 'sheet 1, right side view: 2X 9.07'),
    width: v(3.11, 'dimensioned', 'sheet 1, right side view: 3.11'),
    fromBack: v(3.83, 'derived', 'sheet 1, right side view: 3.82 from the front glass\'s line, so 7.65 - 3.82 from the back'),
    proud: v(0.45, 'dimensioned', 'sheet 1, front view: 0.45 SIDE BUTTON'),
    note: '',
  },
};

/** The SIM tray on the volume side, flush (an outline only): sheet 1, left side view. */
export const simTray = {
  centre: v(97.83, 'dimensioned', 'sheet 1, left side view: 97.83 (to the tray\'s centre line)'),
  length: v(16.03, 'dimensioned', 'sheet 1, left side view: 16.03'),
  width: v(2.36, 'dimensioned', 'sheet 1, left side view: 2X 2.36'),
  fromBack: v(3.82, 'dimensioned', 'sheet 1, left side view: 2X 3.82, from the back glass\'s line'),
};

/**
 * The bottom edge, sheet 1 bottom view and Detail Z. Positions run from the volume-button edge (the bottom view's
 * 0.00: the view's left, under the front view; the camera bump shows on the far side), each landing on its feature's
 * centre (or the port's ends). Depths below the surface aren't given.
 */
export const bottom = {
  /**
   * The first two are dimensioned to the pair's outer edges (17.74 and 21.53: their extension lines touch the holes, as
   * the iPhone 13's drawing shows plainly), so their centres are half a hole inside: 2.26 apart, as drawn and as the
   * other four are. First read as centres, which put them 3.79 apart, off the drawn holes.
   */
  holes: [
    v(18.505, 'derived', 'sheet 1, bottom view: 17.74 + 0.765 (17.74 lands on bottom mic 1\'s pair\'s outer edge; 2X Ø 1.53 PORTS)'),
    v(20.765, 'derived', 'sheet 1, bottom view: 21.53 - 0.765 (21.53 lands on the pair\'s other outer edge)'),
    ...[43.45, 45.71, 47.96, 50.22].map((mm) => v(mm, 'dimensioned', `sheet 1, bottom view: ${mm.toFixed(2)} (4X Ø 1.53 PORTS: the speaker and bottom mic 2; each lands on its hole's centre)`)),
  ],
  holeDiameter: v(1.53, 'dimensioned', 'sheet 1, bottom view: Ø 1.53 PORTS'),
  holesFromBack: v(3.75, 'dimensioned', 'sheet 1, bottom view: 3.75, the holes\' centre line to the back glass\'s line'),
  holeDepth: v(0.6, 'assumed', 'a mic or speaker hole\'s depth for a render: the drawing gives none'),
  screws: [25.71, 38.5].map((mm) => v(mm, 'dimensioned', `sheet 1, bottom view: ${mm.toFixed(2)} (2X Ø 1.50 SCREW)`)),
  screwDiameter: v(1.5, 'dimensioned', 'sheet 1, bottom view: 2X Ø 1.50 SCREW'),
  screwsFromBack: v(3.75, 'inferred', 'Detail Z draws the screws on the holes\' centre line'),
  portFrom: v(28.08, 'dimensioned', 'sheet 1, bottom view: 28.08 (the Lightning port\'s near end)'),
  portTo: v(36.13, 'dimensioned', 'sheet 1, bottom view: 36.13 (its far end; centre 32.105, as Detail Z\'s 32.11)'),
  portHeight: v(2.3, 'dimensioned', 'sheet 1, Detail Z: 2.30 (the port\'s opening across the thickness); its ends round (inferred: half its height)'),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none (a real receptacle runs far deeper)'),
};

export const mass = v(140, 'spec', 'Weight: 140 grams');

/** The phone's still image: 12MP, 4:3 (both rear cameras). */
export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '12MP (spec); 4032 x 3024 is the usual 4:3 still size, not on the spec page' };

/** Everything above, as the family's builder (iphone/part.ts) reads it. */
export const phone: Phone = {
  part: {
    title: 'iPhone 13 mini',
    name: 'iphone-13-mini.dat',
    keywords: ['Apple', 'iPhone 13 mini', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [
      ['2026-10-30', 'Built from Apple\'s dimensional drawing: body, cameras, buttons, ports, notch'],
      ['2026-11-01', 'Rear mic added (Detail Y); the flash\'s keepout and MagSafe\'s keepouts in its features'],
    ],
    drawn: '05/14/21',
    folder: 'iphone-13-mini',
  },
  details: { corner: 'Detail X', edge: 'Detail AA', back: 'Detail Y', port: 'Detail Z' },
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
