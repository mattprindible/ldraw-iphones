// iPhone SE (3rd generation), read from Apple's dimensional drawing (iphone/drawings/
// iphone-se-3rd-generation.pdf, one sheet, dated 2022-04-26; "Compatible with iPhone SE (2nd generation)"). Every number
// carries where it came from and how we know it (src/provenance.ts): spec here is Apple's technical specifications for
// the iPhone SE (3rd generation); scaled values are re-measured by measure.ts.
//
// An older drawing than the rest of the family, on its own plan: one sheet (PDF page 2) carries everything. Detail A
// the corner and the front's top (receiver, front camera, proximity sensor, ALS), Detail B the front sensors' keepout
// cones, Detail C the camera and flash from the back, Detail D a section through the camera turret and the flash with
// their keepout cones, Detail E the edge profile, Detail F the bottom edge (Lightning, the Home/Touch ID keepout cone).
// What differs from every other model: the sides are one curve, with no flat band (Detail E rounds from the mid-plane
// to 4.50 in); a Home button with Touch ID below the display, which is a plain rectangle (no notch, square corners);
// one camera in a short turret; the SIM tray on the side-button side; a Qi charging area, not MagSafe.
//
// Coordinates on the back follow the back view: `fromSide` from the side-button edge (the view's left), `fromTop` from
// the top edge. Through the thickness the side views measure from the back.
import type { Phone } from '../../drawing.ts';
import type { Calibration, Region } from '../../../src/raster.ts';
import { v, type Kind } from '../../../src/provenance.ts';

/**
 * Where the scaled values were measured, each region of the sheet (PDF page 2) with the calibration measure.ts finds
 * for it. The back view (the 0.00, 10.44, 18.13, 22.84 and 51.43 extension lines across, 0.00, 10.24 and 15.40 down),
 * Detail C at twice its scale (the 12.40's extension lines; its datum put on the camera's centre), Detail D at four
 * times (the Ø4.54 and Ø4.16 extension lines; x along the phone, y out of the back from the back glass's line), the
 * front view (its outer edges), Detail E at five times (the 7.31's faces; the insets' extension lines below it), and
 * the bottom view (the 0.00 to 57.01 extension lines).
 */
export const backView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 12800, y: 4600, width: 2300, height: 4700 }, pxPerMm: 23.01, origin: [394, 1245.5] };
export const detailC: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 12400, y: 700, width: 1800, height: 1700 }, pxPerMm: 46.01, origin: [264.7, 551.4] };
/** Detail D: x from the camera's axis along the phone (toward the flash), y from the back glass's line outward (down the sheet). */
export const detailD: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 15900, y: 1200, width: 3200, height: 1600 }, pxPerMm: 92.0, origin: [748, 991.5] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5000, y: 5300, width: 2600, height: 4300 }, pxPerMm: 22.98, origin: [549.5, 545.5] };
/** Detail E: x the inset from the outermost side (its 0.00 line), y up from the mid-plane (the faces' middle). */
export const detailE: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 1000, y: 10300, width: 1500, height: 1200 }, pxPerMm: 114.98, origin: [313, 602.75] };
export const bottomView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5400, y: 10700, width: 1900, height: 800 }, pxPerMm: 23.0, origin: [149.5, 471.75] };

const s1 = (what: string) => `sheet 1, ${what}`;

export const body = {
  width: v(67.27, 'dimensioned', s1('front view: 67.27')),
  length: v(138.44, 'dimensioned', s1('front view: 138.44')),
  thickness: v(7.31, 'dimensioned', s1('Detail E: 7.31 PRODUCT THICKNESS')),
  glassWidth: v(63.81, 'dimensioned', s1('front view: 63.81 GLASS')),
  glassLength: v(134.97, 'dimensioned', s1('front view: 134.97 GLASS')),
  /**
   * Detail A: PROFILE (ALL FOUR CORNERS), symmetric about the diagonal but for the last 0.01 (14.61 along the top, 14.62
   * down the side). The 0.00 and 0.18 lines are 8 px apart at 1200 dpi, the 0.18 one through the crosses at 9.10.
   */
  corner: {
    points: [
      [14.61, 0],
      [9.1, 0.18],
      [3.0, 3.0],
      [0.18, 9.1],
      [0, 14.62],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail A: PROFILE (ALL FOUR CORNERS); across 0.00 (boxed), 0.18, 3.00, 9.10, 14.61 and down 0.00 (boxed), 0.18, 3.00, 9.10, 14.62, paired by the crosses on the outline: (14.61, 0), (9.10, 0.18), (3.00, 3.00), (0.18, 9.10), (0, 14.62)'),
  },
  /**
   * Detail E: PROFILE (ALL SIDES), symmetric about the mid-plane: crosses at (0.41, ±1.76), (1.02, ±2.60), (2.46, ±3.45)
   * and (4.50, ±3.655), from the boxed 0.00 at the mid-plane. The side is one curve: it has no flat band, which the
   * builder needs (the bottom edge's openings are drawn on it, and its first point starts the curve). Two points are
   * added, each named:
   *  - (0, 0.40), inferred: the curve's middle drawn flat. Detail E's curve scales 0.009 in at 0.20 and 0.031 in at
   *    0.40 (measure.ts), so a band of ±0.40 is within 0.03 of it. The builder draws hard edges at ±0.40 that the
   *    phone doesn't have, and stands the buttons (2.48 across, centred 3.55 and 3.66 from the back) on the flat side's plane: their
   *    long edges, up to 1.4 off the mid-plane, are up to 0.3 outside the curve.
   *  - (3.60, 3.565), derived: on the straight line between the crosses at 2.46 and 4.50, so on or inside the drawn
   *    curve, which scales 3.65 there (measure.ts). The builder starts a face at the first point within 0.1 of the full
   *    thickness: this one, lifted to 3.655. Without it the face would start at 4.50, outside the display's sides
   *    (4.385 in), which the builder can't put on the curve. The face is flat from 3.60 in, where the curve is within
   *    0.01 of it; the 4.50 cross is kept here but not built.
   */
  edge: {
    points: [
      [0, 0.4],
      [0.41, 1.76],
      [1.02, 2.6],
      [2.46, 3.45],
      [3.6, 3.565],
      [4.5, 3.655],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail E: PROFILE (ALL SIDES), insets 0.00 (boxed), 2X 0.41, 2X 1.02, 2X 2.46, 2X 4.50 paired by their crosses with ±1.76, ±2.60, ±3.45, ±3.655; (0, 0.40) inferred (the middle drawn flat, within 0.03) and (3.60, 3.565) derived (on the line between the 2.46 and 4.50 crosses) for the builder'),
  },
};

/** The added points' readings, which measure.ts checks against Detail E's curve. */
export const edgeReadings = {
  flatBand: v(0.031, 'scaled', 'Detail E: the curve\'s inset at 0.40 from the mid-plane (the added flat band\'s end)'),
  faceStart: v(3.65, 'scaled', 'Detail E: the curve\'s height at 3.60 in (the added face point; the builder lifts it to 3.655)'),
};

/**
 * The camera turret (Detail D: 0.87 REAR CAMERA TURRET HEIGHT). The section draws it with a straight 45° wall from
 * Ø9.70 at the back glass (Detail C's outermost of the camera's circles) to Ø8.57 (the back view's dimension; Detail C's
 * next circle in), 0.72 out, which then rounds over to a flat top whose edge is Detail C's heavy ring (Ø7.54 through
 * its middle), 0.87 out. The builder's bump is the wall: its outline Ø9.70, its top Ø8.57 at 0.72 (both circles: a
 * rounded square whose radius is half its size). The camera's ring is the top: Ø7.54, from 0.72 to 0.87, a step where
 * the turret rounds over (an approximation: up to 0.15 off the drawn rounding, at its edge). The camera's centre is not
 * the same distance from the side as from the top, so the turret's insets differ (`baseFromTop`, `topFromTop`).
 */
const camSide = v(10.44, 'dimensioned', s1('back view: 10.44 (the camera\'s centre, from the side-button edge)'));
const camTop = v(10.24, 'dimensioned', s1('back view: 3X 10.24 (the camera\'s, the rear mic\'s and the flash\'s centres, from the top)'));

export const turret = {
  base: v(9.7, 'scaled', 'Detail C: the outermost of the camera\'s circles (Ø9.70 here; Detail C\'s own Ø9.70 labels the keepout round the flash); Detail D\'s wall reaches the back glass there'),
  wallTop: v(8.57, 'dimensioned', s1('back view: Ø8.57 REAR CAMERA (Detail C\'s thin circle inside the outermost; Detail D\'s 45° wall reaches it 0.72 out)')),
  wallTopHeight: v(0.72, 'scaled', 'Detail D: where the turret\'s 45° wall reaches Ø8.57 (r 4.285), above the back glass\'s line'),
  top: v(7.54, 'scaled', 'Detail C: the heavy ring round the camera, through its middle (its stroke 0.52 wide: 7.02 to 8.06); Detail D\'s flat top ends there'),
  height: v(0.87, 'dimensioned', s1('Detail D: 0.87 REAR CAMERA TURRET HEIGHT, from the back glass\'s line')),
};

export const bump = {
  top: turret.wallTopHeight,
  rings: turret.height,
  baseFrom: v(5.59, 'derived', '10.44 - 9.70 / 2: the turret\'s outline from the side'),
  baseFromTop: v(5.39, 'derived', '10.24 - 9.70 / 2: the turret\'s outline from the top'),
  baseSize: turret.base,
  baseRadius: v(4.85, 'derived', 'half of Ø9.70: the outline is a circle'),
  topFrom: v(6.155, 'derived', '10.44 - 8.57 / 2: the wall\'s top from the side'),
  topFromTop: v(5.955, 'derived', '10.24 - 8.57 / 2: the wall\'s top from the top'),
  topSize: turret.wallTop,
  topRadius: v(4.285, 'derived', 'half of Ø8.57: a circle'),
};

/**
 * One camera, the 12MP Wide (ƒ/1.8). Detail D draws its 76.7° keepout cone with its apex 2.00 inside the back glass
 * (2.00 CONE TO BACK GLASS: its arrows on the apex's line and the back glass's), so 7.31 - 2.00 = 5.31 from the front;
 * the cone is Ø4.54 at the turret's top (REAR CAMERA KEEPOUT AT SURFACE): 2 x 2.87 x tan 38.35° = 4.54, as printed.
 * 76.7° encloses a 28 mm lens's 75.4° diagonal.
 */
export const cameras = {
  main: {
    name: 'rear camera',
    label: 'Wide',
    fromSide: camSide,
    fromTop: camTop,
    ring: turret.top,
    window: v(7.02, 'scaled', 'Detail C: the heavy ring\'s inner edge (the camera\'s innermost circle)'),
    coneApexFromFront: v(5.31, 'derived', s1('Detail D: 2.00 CONE TO BACK GLASS, from the 7.31 front: 7.31 - 2.00')),
    keepoutCone: v(76.7, 'dimensioned', s1('Detail D: 76.7° REAR CAMERA KEEPOUT CONE')),
    coneAtSurface: v(4.54, 'dimensioned', s1('Detail D: Ø4.54 REAR CAMERA KEEPOUT AT SURFACE (at the turret\'s top: 2 x (2.00 + 0.87) x tan 38.35° = 4.54)')),
    identity: v(1, 'inferred', 'the only rear camera: the 12MP Wide (spec); its 76.7° cone encloses a 28 mm lens\'s 75.4° diagonal'),
    equivalentFocal: v(28, 'third-party', 'the Wide\'s 35 mm equivalent focal length as its photos\' EXIF records it (3.99 mm, 28 mm equivalent); Apple\'s specifications give none'),
    aperture: v(1.8, 'spec', '12MP Wide camera: ƒ/1.8 aperture'),
  },
};

/**
 * The flash, on the back glass beside the turret. Its keepout (Detail D): a 114° cone (FLASH KEEPOUT CONE UNDER
 * 1.44 mm) whose apex is 1.35 inside the back glass (1.35 CONE TO BACK GLASS: arrows on the apex's line and the back
 * glass's), so 7.31 - 1.35 = 5.96 from the front, Ø4.16 at the back glass (FLASH KEEPOUT AT SURFACE: 2 x 1.35 x
 * tan 57° = 4.16, as printed); beyond 1.44 out from the back glass (1.44 FLASH KEEPOUT: arrows on the back glass's line
 * and the line where the cones meet), 7.31 + 1.44 = 8.75 from the front, a 158° cone (BEYOND 1.44 mm). "To back
 * glass" is to the back face here: the distances are the back's, not the cover glass's as on later drawings.
 */
export const flashKeepout = {
  inner: v(114, 'dimensioned', s1('Detail D: 114° FLASH KEEPOUT CONE UNDER 1.44 mm')),
  outer: v(158, 'dimensioned', s1('Detail D: 158° FLASH KEEPOUT CONE BEYOND 1.44 mm')),
  apexFromFront: v(5.96, 'derived', s1('Detail D: 1.35 CONE TO BACK GLASS (the 114° cone\'s apex inside it), from the 7.31 front: 7.31 - 1.35')),
  transitionFromFront: v(8.75, 'derived', s1('Detail D: 1.44 FLASH KEEPOUT, out from the back glass to where the 158° cone starts: 7.31 + 1.44')),
};
export const flashAtSurface = v(4.16, 'dimensioned', s1('Detail D: Ø4.16 FLASH KEEPOUT AT SURFACE (the 114° cone at the back glass: 2 x 1.35 x tan 57° = 4.16)'));

export const flash = {
  fromSide: v(22.84, 'dimensioned', s1('back view: 22.84 (the flash\'s centre); Detail C: 12.40 from the camera\'s')),
  fromTop: camTop,
  diameter: v(3.75, 'dimensioned', s1('back view: Ø3.75 REAR FLASH')),
  onGlass: true,
  keepout: flashKeepout,
};

/** The rear mic, between the turret and the flash on their line, on the back glass (7.69 from the camera, outside the turret's 4.85). */
export const rearMic = {
  fromSide: v(18.13, 'dimensioned', s1('back view: 18.13 (the rear mic\'s centre, across)')),
  fromTop: camTop,
  diameter: v(1.5, 'dimensioned', s1('back view: Ø1.50 REAR MIC')),
};

/**
 * Not built (the builder has no field for them), recorded for a case or mount: Detail C's case keepout ("KEEPOUT AT
 * 1.4 mm ABOVE HOUSING SURFACE", a tapered slot, hatched, from Ø12.14 round the camera to Ø9.70 round the flash, 12.40
 * apart); the back view's charging area (Ø57.42, "DO NOT OBSTRUCT THIS AREA WITH METAL OR OTHER CONDUCTIVE MATERIAL",
 * its centre on the middle line 69.22 above the bottom: Qi, not MagSafe, which the SE hasn't; not the `magsafe` field,
 * whose features say MagSafe); the antenna areas ("DO NOT OBSTRUCT THIS AREA WITH METAL (FULL PRODUCT VOLUME)": the top
 * 15.40 and the bottom 13.51); the compass (51.43 across).
 */
export const notBuilt = {
  caseKeepoutCamera: v(12.14, 'dimensioned', s1('Detail C: Ø12.14, the case keepout round the camera')),
  caseKeepoutFlash: v(9.7, 'dimensioned', s1('Detail C: Ø9.70, the case keepout round the flash')),
  caseKeepoutHeight: v(1.4, 'dimensioned', s1('Detail C: KEEPOUT AT 1.4 mm ABOVE HOUSING SURFACE')),
  chargingDiameter: v(57.42, 'dimensioned', s1('back view: Ø57.42 (DO NOT OBSTRUCT THIS AREA WITH METAL OR OTHER CONDUCTIVE MATERIAL)')),
  chargingFromBottom: v(69.22, 'dimensioned', s1('back view: 69.22, the charging area\'s centre from the bottom edge (at 33.63 across)')),
  antennaTop: v(15.4, 'dimensioned', s1('back view: 15.40, the top antenna area from the top edge')),
  antennaBottom: v(13.51, 'dimensioned', s1('back view: 13.51, the bottom antenna area from the bottom edge')),
  compass: v(51.43, 'dimensioned', s1('back view: 51.43 COMPASS (across)')),
  /** Front: Home/Touch ID (no builder field), and the front sensors (Detail A, B), as on every model not built. */
  homeButton: v(10.9, 'dimensioned', s1('front view: Ø10.90 HOME/TOUCH ID SENSOR')),
  homeFromBottom: v(9.25, 'dimensioned', s1('front view: 9.25, the Home button\'s centre from the bottom edge (at 33.63 across)')),
  homeCone: v(100, 'dimensioned', s1('Detail F: 100.0° HOME/TOUCH ID SENSOR KEEPOUT CONE')),
  homeConeWidth: v(14.6, 'dimensioned', s1('Detail F: 14.60 (the cone at the cover glass)')),
  homeConeToGlass: v(12.46, 'dimensioned', s1('Detail F: 12.46 HOME/TOUCH ID SENSOR KEEPOUT CONE TO COVERGLASS')),
  frontCamera: { across: v(22.99, 'dimensioned', s1('Detail A: 22.99 FRONT CAMERA')), down: v(9.16, 'dimensioned', s1('Detail A: 2X 9.16')) },
  proximity: { across: v(33.63, 'dimensioned', s1('Detail A: 33.63 PROXIMITY SENSOR')), down: v(4.84, 'dimensioned', s1('Detail A: 2X 4.84')) },
  als: { across: v(37.32, 'dimensioned', s1('Detail A: 37.32 ALS')), down: v(4.84, 'dimensioned', s1('Detail A: 2X 4.84')) },
};

/**
 * The SIM tray, in the side-button side (right side view): its top 52.72 from the top, 15.67 long, 2.30 across, its
 * back edge 2.41 from the back (the 2.41's extension line is the side button's back edge too). Not built: the builder
 * outlines a SIM tray in the volume-button side only.
 */
export const simTray = {
  centre: v(60.555, 'derived', s1('right side view: 52.72 (the tray\'s top) + 15.67 / 2')),
  length: v(15.67, 'dimensioned', s1('right side view: 15.67 (SIM TRAY)')),
  width: v(2.3, 'dimensioned', s1('right side view: 2.30')),
  fromBack: v(3.56, 'derived', s1('right side view: 2.41 (its back edge from the back) + 2.30 / 2')),
};

export const lightning = {
  name: 'Lightning' as const,
  width: v(13.65, 'dimensioned', s1('Detail F: 13.65 RECOMMENDED CONNECTOR KEEPOUT (2X R3.40 corners)')),
  thickness: v(6.85, 'dimensioned', s1('Detail F: 6.85 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(33.63, 'dimensioned', s1('Detail F: 33.63 (the port\'s centre, from the side-button edge)')),
  fromBack: v(3.655, 'dimensioned', s1('Detail F: 3.655, the port\'s and holes\' centre line to the back (the mid-plane)')),
  outward: v(14.0, 'dimensioned', s1('Detail F: MATING CONNECTOR KEEPOUT AREA FLUSH TO PRODUCT SURFACE OUTWARD 14.0 mm REQUIRED')),
};

/** The front: a rectangular display, centred, 17.19 from the top and 4.38 from the sides; the receiver (Detail A). */
export const front = {
  activeWidth: v(58.5, 'dimensioned', s1('front view: 58.50 ACTIVE AREA (4.38 TO ACTIVE AREA from each side)')),
  activeLength: v(104.05, 'dimensioned', s1('front view: 104.05 ACTIVE AREA')),
  activeFromEdge: v(17.19, 'dimensioned', s1('front view: 17.19 TO ACTIVE AREA (from the top)')),
  activeRadius: v(0, 'scaled', 'front view: the active area\'s corners are square (the corner\'s two sides cross on its diagonal; measure.ts)'),
  receiverLength: v(11.87, 'dimensioned', s1('Detail A: 11.87 RECEIVER')),
  receiverHeight: v(1.2, 'dimensioned', s1('Detail A: 1.20 RECEIVER')),
  receiverFromTop: v(9.16, 'dimensioned', s1('Detail A: 2X 9.16 (the receiver\'s and the front camera\'s centre line)')),
  receiverDepth: v(0.3, 'assumed', 'the slot\'s depth for a render: the drawing gives none'),
};
export const activeFromSide = v(4.38, 'dimensioned', s1('front view: 4.38 TO ACTIVE AREA (from the side; (67.27 - 58.50) / 2 = 4.385)'));

/**
 * The buttons (side views, front view). Volume and side buttons: `centre` from the top, `half` the 2X 5.31 from the
 * centre line to an end; across the thickness 2.48 wide, their centre lines 3.55 (volume) and 3.66 (side) from the
 * back. The ring/silent switch is dimensioned by its ends (17.56 to its top, 5.61 long) and its edges (2.24 and 4.21
 * from the back), and modelled as a block that size. Each stands proud of the side as the front view gives it.
 */
export const buttons = {
  ringSilent: {
    side: 'volume' as const,
    centre: v(20.365, 'derived', s1('left side view: 17.56 (the switch\'s top) + 5.61 / 2')),
    half: v(2.805, 'derived', s1('left side view: 5.61 / 2 (the switch\'s length)')),
    width: v(1.97, 'derived', s1('left side view: 4.21 - 2.24 (the switch\'s edges from the back)')),
    fromBack: v(3.225, 'derived', s1('left side view: (2.24 + 4.21) / 2')),
    proud: v(0.42, 'dimensioned', s1('front view: RING/SILENT SWITCH 0.42')),
    note: 'the ring/silent switch, modelled as a block of its outline\'s size',
  },
  volumeUp: {
    side: 'volume' as const,
    centre: v(34.56, 'dimensioned', s1('left side view: 34.56 (+) VOLUME BUTTON')),
    half: v(5.31, 'dimensioned', s1('left side view: 2X 5.31 (the centre line to the top end)')),
    width: v(2.48, 'dimensioned', s1('left side view: 2.48')),
    fromBack: v(3.55, 'dimensioned', s1('left side view: 2X 3.55, from the back')),
    proud: v(0.4, 'dimensioned', s1('front view: (+) VOLUME BUTTON 0.40')),
    note: '',
  },
  volumeDown: {
    side: 'volume' as const,
    centre: v(47.17, 'dimensioned', s1('left side view: 47.17 (-) VOLUME BUTTON')),
    half: v(5.31, 'dimensioned', s1('left side view: 2X 5.31 (the centre line to the bottom end)')),
    width: v(2.48, 'dimensioned', s1('left side view: 2.48')),
    fromBack: v(3.55, 'dimensioned', s1('left side view: 2X 3.55, from the back')),
    proud: v(0.4, 'dimensioned', s1('front view: (-) VOLUME BUTTON 0.40')),
    note: '',
  },
  side: {
    side: 'side' as const,
    centre: v(34.64, 'dimensioned', s1('right side view: 34.64 SIDE BUTTON')),
    half: v(5.31, 'dimensioned', s1('right side view: 2X 5.31')),
    width: v(2.48, 'dimensioned', s1('right side view: 2.48')),
    fromBack: v(3.66, 'dimensioned', s1('right side view: 3.66, from the back (its back edge 2.41: 2.41 + 2.48 / 2 = 3.65)')),
    proud: v(0.4, 'dimensioned', s1('front view: 0.40 SIDE BUTTON')),
    note: '',
  },
};

/**
 * The bottom edge, from the volume-button edge: two groups of six Ø1.45 holes on the mid-plane, on the family's 2.255
 * pitch. Of each group the drawing dimensions the outer hole's outer edge (10.26, 57.01) and the inner hole's centre
 * (22.26, 45.01) and inner edge (22.98, 44.29): at 1200 dpi every hole's chords centre on 10.985 + 2.255 k and
 * 45.01 + 2.255 k (measure.ts), and 22.26 - 10.985 = 11.275 = 5 x 2.255. The holes between are evenly spaced, as drawn.
 */
const R = 1.45 / 2;
const group = (first: number, last: number, firstHow: string, lastHow: string, which: string) =>
  Array.from({ length: 6 }, (_, i) => {
    const mm = +(first + ((last - first) * i) / 5).toFixed(3);
    const how = i === 0 ? firstHow : i === 5 ? lastHow : 'evenly between, as drawn';
    return v(mm, i === 0 || i === 5 ? (how.startsWith('dimensioned') ? 'dimensioned' : 'derived') : 'inferred', s1(`bottom view, the ${which} group (Ø1.45 PORTS, BOTTOM MIC, SPEAKER): ${how.replace(/^dimensioned: /, '')}`));
  });

export const bottom = {
  holes: [
    ...group(10.26 + R, 22.26, `10.26 + 0.725: 10.26 lands on the hole's outer edge`, 'dimensioned: 22.26, the bottom mic\'s centre (22.98 its inner edge)', 'left'),
    ...group(45.01, 57.01 - R, 'dimensioned: 45.01, the bottom mic\'s centre (44.29 its inner edge)', `57.01 - 0.725: 57.01 lands on the hole's outer edge`, 'right'),
  ],
  holeDiameter: v(1.45, 'dimensioned', s1('bottom view: Ø1.45 PORTS, BOTTOM MIC, 10X Ø1.45 SPEAKER')),
  holesFromBack: v(3.655, 'dimensioned', s1('Detail F: 3.655 (the holes\' centre line to the back); bottom view: 3.66')),
  holeDepth: v(0.6, 'assumed', 'a mic or speaker hole\'s depth for a render: the drawing gives none'),
  screws: [27.24, 40.03].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (2X Ø1.60 SCREW)`))),
  screwDiameter: v(1.6, 'dimensioned', s1('bottom view: 2X Ø1.60 SCREW')),
  screwsFromBack: v(3.655, 'inferred', 'the bottom view draws the screws on the holes\' centre line'),
  portFrom: v(29.28, 'dimensioned', s1('bottom view: 29.28 (the Lightning port\'s near end)')),
  portTo: v(37.98, 'dimensioned', s1('bottom view: 37.98 (its far end; centre 33.63, as Detail F\'s)')),
  portHeight: v(2.95, 'dimensioned', s1('Detail F: 2.95 (the port\'s opening across the thickness); its ends round (inferred)')),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none'),
};

export const mass = v(144, 'spec', 'Weight: 5.09 ounces (144 grams)');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: 'the 12MP Wide\'s 4:3 stills, 4032 x 3024 (not on the spec page)' };

/** Everything above, as the family's builder (iphone/part.ts) reads it. */
export const phone: Phone = {
  part: {
    title: 'iPhone SE (3rd generation)',
    name: 'iphone-se-3rd-generation.dat',
    keywords: ['Apple', 'iPhone SE', 'iPhone SE 3rd generation', 'iPhone SE 2nd generation', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [['2026-10-31', 'Built from Apple\'s dimensional drawing: body, camera turret, flash and its keepout, rear mic, buttons, Lightning']],
    drawn: '2022-04-26',
    folder: 'iphone-se-3rd-generation',
  },
  details: { corner: 'Detail A', edge: 'Detail E', back: 'Detail C', port: 'Detail F' },
  body,
  bump,
  cameras,
  cameraIdentity: cameras.main.identity,
  flash,
  rearMic,
  connector: lightning,
  front,
  buttons,
  bottom,
  mass,
  image,
};
