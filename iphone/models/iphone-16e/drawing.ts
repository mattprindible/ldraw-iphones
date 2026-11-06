// iPhone 16e, read from Apple's dimensional drawing (iphone/drawings/iphone-16e.pdf, sheets 1 and 2, dated
// 2025-03-17). Every number carries where it came from and how we know it (src/provenance.ts): spec here is Apple's
// technical specifications page (support.apple.com/122208); scaled values are re-measured by measure.ts.
//
// The iPhone 14's body, front and plan, number for number (146.71 x 71.52 x 7.80, glass 144.61 x 69.42, Detail A's
// corner and receiver, Detail B's profile, the display, its notch), lettered as the 14's: Detail A the corner and the
// receiver, B the edge profile, C the USB-C port, D the back; sheet 2 the keepout sections (L-L the camera, N-N the
// flash: in features.json), Detail E (front sensor keepouts, not modelled), the antenna keepouts (not modelled) and the
// wireless-charging, magnetic and compass keepouts (recorded here, not in the part: see `wirelessCharging`). What differs:
// the Action button for the ring/silent switch (with the 14's volume buttons, side button and SIM tray), USB-C, a
// bottom edge shifted 0.35 toward the volume side, and a new back: one camera, standing alone on the back glass with no
// bump round it, with the rear mic and the flash beside it on one line (3X -13.32).
//
// Coordinates on the back follow Detail D: `fromSide` from the side-button edge, `fromTop` from the top edge. The phone
// is 7.80 thick and every button, the port and the holes sit on its mid-plane (3.90), so "from the back" and "from the
// front" read the same here.
import type { Phone } from '../../drawing.ts';
import type { Calibration, Region } from '../../../src/raster.ts';
import { v, type Kind } from '../../../src/provenance.ts';

/**
 * Where the scaled values were measured, each region of sheet 1 (PDF page 2) with the calibration measure.ts finds for
 * it: Detail D at 1200 dpi (drawn at three times the 14's front view scale: its extension lines 0.00, 13.32, 24.30 and
 * 29.68 across, 0.00 and 13.32 down calibrate it), the front view (its outer edges; drawn at 1.5 times the 14's), the
 * receiver at 4800 dpi (in the front view's frame), the bottom view (its 0.00 to 57.24 extension lines), and the right
 * side view at 2400 dpi (the camera's heights; its 7.80 extension lines calibrate it).
 */
export const detailD: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 15700, y: 1500, width: 2900, height: 2200 }, pxPerMm: 69.14, origin: [291.5, 299.5] };
export const frontView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5400, y: 3900, width: 2900, height: 5450 }, pxPerMm: 34.57, origin: [217.5, 214.5] };
export const receiverView: Region = { page: 2, dpi: 4800, crop: { x: 26500, y: 16450, width: 1900, height: 500 } };
export const bottomView: Region & Calibration = { page: 2, dpi: 1200, crop: { x: 5400, y: 11000, width: 2900, height: 800 }, pxPerMm: 34.57, origin: [217.5, 416] };
/** The right side view at 2400 dpi: x from the front (left) to the back (right), y down the phone; origin x the back glass's 1.68 extension line. */
export const sideView: Region & Calibration = { page: 2, dpi: 2400, crop: { x: 21600, y: 6800, width: 1200, height: 12200 }, pxPerMm: 69.1, origin: [814.5, 0] };
/** Section L-L (sheet 2, PDF page 3) at 1200 dpi: the camera's keepout cone on its lens cover. */
export const sectionLL: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 11400, y: 1300, width: 2600, height: 2700 }, pxPerMm: 69.04, origin: [839.5, 0] };
/**
 * Section N-N (sheet 2) at 1200 dpi, through the flash down the phone: the phone on the left (its front face the left
 * edge), the keepout beyond its back glass on the right. Origin: the back glass's face (across) and the flash's axis,
 * its centre line (down).
 */
export const sectionNN: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 16900, y: 1000, width: 2000, height: 3000 }, pxPerMm: 69.1, origin: [798.5, 1540.5] };
/**
 * Sheet 2's right-hand back view at 1200 dpi (the keepouts kept clear of metal and magnetic material; Detail F's circle
 * on it): calibrated on its 0.00 and 60.51 lines across and its 0.00 and -73.35 lines down. The camera at its top left,
 * as in Detail D: across from the side-button edge.
 */
export const keepoutView: Region & Calibration = { page: 3, dpi: 1200, crop: { x: 11000, y: 7500, width: 2400, height: 4000 }, pxPerMm: 23.05, origin: [347.5, 556.5] };

const s1 = (what: string) => `sheet 1, ${what}`;
const s2 = (what: string) => `sheet 2, ${what}`;

export const body = {
  width: v(71.52, 'dimensioned', s1('front view: 71.52 PRODUCT WIDTH')),
  length: v(146.71, 'dimensioned', s1('front view: 146.71 PRODUCT LENGTH')),
  thickness: v(7.8, 'dimensioned', s1('right side view: 7.80 PRODUCT THICKNESS')),
  glassWidth: v(69.42, 'dimensioned', s1('front view: 69.42 GLASS')),
  glassLength: v(144.61, 'dimensioned', s1('front view: 144.61 GLASS')),
  /**
   * Detail A is the iPhone 14's, every label and leader: not symmetric about the diagonal (15.89 along the top, 16.14
   * down the side), its middle cross (3.22, 3.40) 0.13 off it. As on the 14, the builder splits the corner on the
   * diagonal, so (3.31, 3.31) stands in for the cross: where the curve's 45° tangent there meets the diagonal; the built
   * outline passes within 0.01 of (3.22, 3.40) (measure.ts checks it). Inferred: the builder's gap, a corner split
   * only on the diagonal.
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
    from: s1('Detail A: CORNER PROFILE (ALL FOUR CORNERS); across 0.06, 0.86, 3.22, 6.97, 11.38, 15.89 and down -0.07, -0.95, -3.40, -7.20, -11.63, -16.14, paired by their leaders (the 14\'s); (3.31, 3.31) inferred on the diagonal in place of the printed (3.22, 3.40), which the outline passes within 0.01'),
  },
  /**
   * Detail B, the 14's profile. The front view adds 1.15 EXTERIOR OF HOUSING TO START OF FLAT AREA ON TOP SIDE (as the
   * 14's drawing does): the front rises the last 0.08 (3.82 to 3.90) between 0.91 and 1.15 in. It isn't a point of the
   * profile here: the builder starts a face at the profile's first point within 0.1 of the full thickness, which is
   * 0.91's 3.82, so a [1.15, 3.90] point would be dropped and 0.91 lifted to 3.90. Both faces step to their glass at
   * 1.05 in instead, as the 14's do (an approximation of the 0.08 rise, 0.10 outside where the drawing ends it).
   */
  edge: {
    points: [
      [0, 2.71],
      [0.01, 3.14],
      [0.14, 3.54],
      [0.49, 3.79],
      [0.91, 3.82],
    ] as [number, number][],
    kind: 'dimensioned' as Kind,
    from: s1('Detail B: PROFILE (ALL SIDES), symmetric about the mid-plane; insets 0.00 (boxed), 2X 0.01, 2X 0.14, 2X 0.49, 2X 0.91 paired in order with ±2.71, ±3.14, ±3.54, ±3.79, ±3.82 (the 14\'s)'),
  },
};

/** The front view's start of the flat (not modelled: see body.edge). */
export const flatStart = v(1.15, 'dimensioned', s1('front view: 1.15 EXTERIOR OF HOUSING TO START OF FLAT AREA ON TOP SIDE OF PRODUCT'));

/** Detail A's printed middle cross, which the corner's diagonal point stands in for: the built outline must pass it. */
export const cornerMiddle = { across: v(3.22, 'dimensioned', s1('Detail A: 3.22 (the middle cross)')), down: v(3.4, 'dimensioned', s1('Detail A: -3.40 (the middle cross)')) };

/** The camera's centre: Detail D's 13.32 across and 3X -13.32 down (camera, rear mic and flash on one line). */
const camSide = v(13.32, 'dimensioned', s1('Detail D: 13.32 (the camera\'s centre, across)'));
const camTop = v(13.32, 'dimensioned', s1('Detail D: 3X -13.32 (the camera\'s, the rear mic\'s and the flash\'s centres)'));

/**
 * There is no bump: the camera stands on the back glass by itself, in two stages (the right side view, section L-L).
 * The wide stage is Detail D's Ø14.97, its wall rising straight and rounding over (Detail D's next circle, Ø13.54, where
 * its flat top starts; the side view's tangent line 0.69 out) to its flat top 1.40 out. The narrow stage on it (Ø12.94)
 * carries the lens cover, 1.68 out. The builder's bump is the wide stage: a circle (a rounded square whose radius is
 * half its size), its outline Ø14.97, its top Ø13.54, the builder's straight slope between them standing for the wall
 * and its rounding (the slope runs 0.35 inside the wall at 0.69 out, where the wall starts to round). The narrow stage
 * is the camera's ring.
 */
export const wideStage = {
  diameter: v(14.97, 'dimensioned', s1('Detail D: Ø14.97 (its leader on the outermost circle)')),
  top: v(13.54, 'scaled', 'Detail D: the second circle in (Ø13.54), where the wide stage\'s rounding meets its flat top'),
};

export const bump = {
  top: v(1.4, 'scaled', 'right side view at 2400 dpi: the wide stage\'s flat top from the back glass\'s 1.68 extension line'),
  rings: v(1.68, 'dimensioned', s1('right side view: 1.68 BACK GLASS TO CAMERA GLASS (its arrows on the back glass and the narrow stage\'s top)')),
  baseFrom: v(5.835, 'derived', s1('Detail D: 13.32 - 14.97 / 2, the wide stage\'s outline from the side and top')),
  baseSize: wideStage.diameter,
  baseRadius: v(7.485, 'derived', 'half of Ø14.97: the outline is a circle'),
  topFrom: v(6.55, 'derived', '13.32 - 13.54 / 2 (scaled), the wide stage\'s flat top from the side and top'),
  topSize: wideStage.top,
  topRadius: v(6.77, 'derived', 'half of Ø13.54 (scaled): the top is a circle'),
};

/**
 * One camera, the 48MP Fusion (26 mm, ƒ/1.6). Section L-L draws its 82° keepout cone as a frustum from its base on the
 * lens cover (Ø5.91) and gives no apex depth: the apex is where the cone's sides meet, 2.955 / tan 41° = 3.40 inside
 * the lens cover, which is 7.80 + 1.68 = 9.48 from the front: 6.08 from the front. 82° encloses the 26 mm's 79.5°
 * diagonal.
 */
export const cameras = {
  main: {
    name: 'rear camera',
    label: 'Fusion',
    fromSide: camSide,
    fromTop: camTop,
    ring: v(12.94, 'scaled', 'Detail D: the third circle in (Ø12.94), the narrow stage: the side view draws it 12.90 across'),
    window: v(11.89, 'scaled', 'Detail D: the innermost of the camera\'s five circles (Ø14.97, 13.54, 12.94, 12.33, 11.89)'),
    coneApexFromFront: v(6.08, 'derived', s2('Section L-L: 82° REAR CAMERA KEEPOUT CONE from its Ø5.91 BASE OF KEEPOUT CONE CONTACTING LENS COVER (1.68 + 7.80 = 9.48 from the front): 9.48 - 2.955 / tan 41°')),
    keepoutCone: v(82, 'dimensioned', s2('Section L-L: 82° REAR CAMERA KEEPOUT CONE')),
    coneBase: v(5.91, 'dimensioned', s2('Section L-L: Ø5.91 BASE OF KEEPOUT CONE CONTACTING LENS COVER')),
    identity: v(1, 'inferred', 'the only rear camera: the Fusion (spec); its 82° cone encloses a 26 mm lens\'s 79.5° diagonal'),
    equivalentFocal: v(26, 'spec', '48MP Fusion Main: 26 mm, ƒ/1.6 aperture'),
    aperture: v(1.6, 'spec', 'Fusion Main: ƒ/1.6'),
  },
};

/**
 * The flash's keepout, Section N-N (sheet 2, down the phone through the flash; Detail F places it). The flash is flush
 * with the back glass and the keepout starts on the glass: an 80° inner cone from its Ø6.00 base on the glass's face out
 * to the transition 0.82 beyond it, where it is Ø7.37, then a 155° outer cone. Both distances are from the back glass
 * here (0.82 FLASH KEEPOUT CONE TRANSITION TO BACK GLASS: its arrows on the glass's face and on the kinks' extension
 * line), not "to cover glass" as on the 12 Pro and 16: the family's from-the-front numbers are 7.80 on. Neither apex is
 * dimensioned; both are where the cones' sides meet. The outer cone's apex lands on the glass's face (7.803 from the
 * front: the 155° cone is drawn from the flash's centre on the glass), and the inner's 3.58 inside the phone. The three
 * dimensions agree: 6.00 + 2 x 0.82 tan 40° = 7.376 against the printed 7.37. measure.ts fits the drawn sides.
 */
export const flashKeepout = {
  inner: v(80, 'dimensioned', s2('Section N-N: 80° FLASH INNER KEEPOUT CONE')),
  outer: v(155, 'dimensioned', s2('Section N-N: 155° FLASH OUTER KEEPOUT CONE')),
  innerBaseDiameter: v(6.0, 'dimensioned', s2('Section N-N: 6.00 DIAMETER OF KEEPOUT CONE BASE CONTACTING REAR GLASS (its extension lines on the inner cone\'s corners on the back glass\'s face, 7.80 from the front)')),
  transitionFromFront: v(8.62, 'derived', s2('Section N-N: 0.82 FLASH KEEPOUT CONE TRANSITION TO BACK GLASS (its arrows on the back glass\'s face and the kinks\' extension line), so 7.80 + 0.82 from the front')),
  apexFromFront: v(4.22, 'derived', s2('Section N-N: not dimensioned; the 80° cone through its Ø6.00 base on the back glass: 7.80 - 3.00 / tan 40° = 4.225')),
  outerApexFromFront: v(7.8, 'derived', s2('Section N-N: not dimensioned; the 155° cone through the Ø7.37 transition: 8.62 - 3.685 / tan 77.5° = 7.803, on the back glass\'s face')),
};

/** What N-N gives beyond the family's fields (not in features.json): the transition's own numbers. */
export const flashKeepoutTransition = {
  fromBack: v(0.82, 'dimensioned', s2('Section N-N: 0.82 FLASH KEEPOUT CONE TRANSITION TO BACK GLASS')),
  diameter: v(7.37, 'dimensioned', s2('Section N-N: 7.37 DIAMETER OF KEEPOUT CONE AT TRANSITION POINT')),
};

/** The flash lies beside the camera, on the back glass, its keepout N-N's. */
export const flash = {
  fromSide: v(29.68, 'dimensioned', s1('Detail D: 29.68 (FLASH)')),
  fromTop: camTop,
  diameter: v(3.75, 'dimensioned', s1('Detail D: Ø3.75 FLASH')),
  onGlass: true,
  keepout: flashKeepout,
};

/**
 * The rear mic, between the camera and the flash, on the back glass (10.98 from the camera's centre, outside the wide
 * stage's 7.49 radius). Across: the 24.30 ordinate above Detail D, whose extension line comes down to the mic's centre;
 * down: the 3X -13.32 (the camera's, the mic's and the flash's centres, on one line). Two concentric circles are drawn
 * there; the [2] Ø1.30 REAR MIC leader's arrow lands on the outer one (4800 dpi), drawn Ø1.27-1.30: the mic. The inner
 * circle (about Ø0.67 drawn, not dimensioned) isn't built.
 */
export const rearMic = {
  fromSide: v(24.3, 'dimensioned', s1('Detail D: 24.30 (the ordinate above the view; its extension line comes down to the mic\'s centre)')),
  fromTop: camTop,
  diameter: v(1.3, 'dimensioned', s1('Detail D: [2] Ø1.30 REAR MIC (its arrow lands on the outer of two concentric circles)')),
};

/**
 * The back's material keepouts (sheet 2, the right-hand back view), recorded but not passed to the builder. The 16e has
 * no MagSafe (Apple's spec page lists only "Wireless charging (works with Qi chargers)"), but the view draws note 5's
 * circle, the wording the MagSafe phones use (DO NOT OBSTRUCT THIS AREA WITH METAL, CONDUCTIVE MATERIAL, OR MAGNETIC
 * MATERIAL): Ø57.50 at the product centre, 7.01 inside each side. There is no magnetic zone round it (no "except
 * MagSafe magnets"). The family's `magsafe` field would take the circle as it is (its zone fields are optional), but
 * features.json would then call it MagSafe, which the 16e hasn't: a mount relying on its magnets wouldn't hold. Left for
 * the lead: `magsafe: wirelessCharging` builds it.
 */
export const wirelessCharging = {
  fromSide: v(35.76, 'dimensioned', s2('the right-hand back view: 35.76 PRODUCT CENTER (71.52 / 2)')),
  fromTop: v(73.35, 'dimensioned', s2('the right-hand back view: -73.35 PRODUCT CENTER (146.71 / 2 = 73.355)')),
  diameter: v(57.5, 'dimensioned', s2('the right-hand back view: [5] Ø57.50 DO NOT OBSTRUCT THIS AREA WITH METAL, CONDUCTIVE MATERIAL, OR MAGNETIC MATERIAL')),
};

/**
 * The same view's other keepouts, which no field takes: a cross-hatched rectangle in the camera's corner, the full
 * product volume from the top and the side-button edge to 36.03 across and -27.72 down (DO NOT OBSTRUCT THIS AREA WITH
 * MAGNETIC OR PERMEABLE MATERIAL), and a hatched Ø8.00 circle labelled COMPASS at 60.51 across, -9.86 down (its
 * restriction isn't stated; by its neighbour, presumably magnetic material).
 */
export const magneticZone = {
  across: v(36.03, 'dimensioned', s2('the right-hand back view: 36.03 (the zone\'s edge, from the side-button edge)')),
  down: v(27.72, 'dimensioned', s2('the right-hand back view: -27.72 (the zone\'s bottom edge, from the top)')),
};
export const compass = {
  fromSide: v(60.51, 'dimensioned', s2('the right-hand back view: 60.51 (COMPASS)')),
  fromTop: v(9.86, 'dimensioned', s2('the right-hand back view: -9.86 (COMPASS)')),
  diameter: v(8.0, 'dimensioned', s2('the right-hand back view: Ø8.00 (COMPASS)')),
};

export const usbC = {
  name: 'USB-C' as const,
  width: v(12.45, 'dimensioned', s1('Detail C: 12.45 RECOMMENDED CONNECTOR KEEPOUT (2X R3.25 corners)')),
  thickness: v(6.6, 'dimensioned', s1('Detail C: 6.60 RECOMMENDED CONNECTOR KEEPOUT')),
  fromSide: v(35.76, 'dimensioned', s1('Detail C: 35.76 (the port\'s centre, from the side-button edge)')),
  fromBack: v(3.9, 'dimensioned', s1('Detail C: 3.90, the port\'s centre line to the back glass (the mid-plane)')),
  outward: v(14.0, 'dimensioned', s1('Detail C: MATING CONNECTOR KEEPOUT AREA FLUSH TO PRODUCT SURFACE REQUIRED OUTWARD 14.0mm')),
};

export const front = {
  activeWidth: v(64.58, 'dimensioned', s1('front view: 64.58 DISPLAY ACTIVE AREA')),
  activeLength: v(139.77, 'dimensioned', s1('front view: 139.77 DISPLAY ACTIVE AREA')),
  activeFromEdge: v(3.47, 'dimensioned', s1('front view: 3.47 EXTERIOR OF HOUSING TO DISPLAY ACTIVE AREA')),
  activeRadius: v(7.87, 'scaled', 'front view: the active area\'s corners crossed on their diagonals, 7.85 to 7.90 at three (the bottom-left runs along a hatch line)'),
  notchWidth: v(26.79, 'dimensioned', s1('front view: 26.79 ACTIVE AREA CUTOUT (wall to wall)')),
  notchDepth: v(5.58, 'dimensioned', s1('front view: 5.58 ACTIVE AREA CUTOUT, from the active area\'s top (its upper arrow on the 139.77 line)')),
  notchTopRadius: v(0.82, 'dimensioned', s1('front view: 2X R0.82')),
  notchBottomRadius: v(3.72, 'dimensioned', s1('front view: 2X R3.72 (the cutout\'s bottom corners)')),
  /**
   * Detail A dimensions only the receiver's cutout (11.95 long, 1.38 down from the glass's edge) and its centre line
   * (-1.74), as the 14's. The slot inside it is scaled from the front view at 4800 dpi as on the 14: the white inside it
   * widened by one stroke of its own pen.
   */
  receiverLength: v(11.02, 'scaled', 'front view at 4800 dpi: the white inside the slot (10.74) and one stroke of its pen (0.28)'),
  receiverHeight: v(0.76, 'scaled', 'front view at 4800 dpi: the white inside the slot (0.48) and one stroke of its pen (0.28)'),
  receiverFromTop: v(1.74, 'dimensioned', s1('Detail A: -1.74 (the receiver\'s centre line)')),
  receiverDepth: v(0.3, 'assumed', 'the slot\'s depth for a render: the drawing gives none'),
};

export const buttons = {
  action: {
    side: 'volume' as const,
    centre: v(31.28, 'dimensioned', s1('left side view: 31.28 (the Action button\'s centre)')),
    half: v(3.77, 'dimensioned', s1('left side view: 2X 3.77 (centre to each end)')),
    width: v(3.31, 'dimensioned', s1('left side view: 3X 3.31')),
    fromBack: v(3.9, 'dimensioned', s1('left side view: 3X 3.90, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 ACTION BUTTON')),
    note: 'the Action button, in place of the 14\'s ring/silent switch',
  },
  volumeUp: {
    side: 'volume' as const,
    centre: v(45.43, 'dimensioned', s1('left side view: 45.43 (+) VOLUME BUTTON')),
    half: v(5.92, 'dimensioned', s1('left side view: 4X 5.92')),
    width: v(3.31, 'dimensioned', s1('left side view: 3X 3.31')),
    fromBack: v(3.9, 'dimensioned', s1('left side view: 3X 3.90, from the back glass\'s line')),
    proud: v(0.45, 'dimensioned', s1('front view: 0.45 (+) VOLUME BUTTON')),
    note: '',
  },
  volumeDown: {
    side: 'volume' as const,
    centre: v(59.63, 'dimensioned', s1('left side view: 59.63 (-) VOLUME BUTTON')),
    half: v(5.92, 'dimensioned', s1('left side view: 4X 5.92')),
    width: v(3.31, 'dimensioned', s1('left side view: 3X 3.31')),
    fromBack: v(3.9, 'dimensioned', s1('left side view: 3X 3.90, from the back glass\'s line')),
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
  centre: v(110.04, 'dimensioned', s1('left side view: 110.04 (SIM TRAY)')),
  length: v(15.94, 'derived', s1('left side view: 2X 7.97, centre to each end')),
  width: v(2.56, 'dimensioned', s1('left side view: 2.56')),
  fromBack: v(3.9, 'dimensioned', s1('left side view: 3.90, from the back glass\'s line')),
};

/**
 * The bottom edge, from the volume-button edge. Only each group's end holes are dimensioned, and (as on the 14) their
 * extension lines touch the holes' outer edges: the spans less a hole are whole multiples of the family's 2.255 pitch
 * (24.83 - 18.79 - 1.53 = 2 x 2.255, 57.24 - 46.69 - 1.53 = 4 x 2.255), and at 1200 dpi the end holes' chords centre
 * half a hole inside the lines (measure.ts checks it). The holes between are evenly spaced, as drawn.
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
  holes: [...group(18.79, 24.83, 3, 'left'), ...group(46.69, 57.24, 5, 'right')],
  holeDiameter: v(1.53, 'dimensioned', s1('bottom view: 8X Ø1.53 PORTS')),
  holesFromBack: v(3.9, 'dimensioned', s1('bottom view: 3.90, the holes\' centre line to the back glass\'s line')),
  holeDepth: v(0.6, 'assumed', 'a mic or speaker hole\'s depth for a render: the drawing gives none'),
  screws: [28.84, 42.69].map((mm) => v(mm, 'dimensioned', s1(`bottom view: ${mm.toFixed(2)} (2X Ø1.50 SCREW)`))),
  screwDiameter: v(1.5, 'dimensioned', s1('bottom view: 2X Ø1.50 SCREW')),
  screwsFromBack: v(3.9, 'inferred', 'Detail C draws the screws on the holes\' centre line'),
  portFrom: v(30.97, 'dimensioned', s1('bottom view: 30.97 (the USB-C port\'s near end)')),
  portTo: v(40.55, 'dimensioned', s1('bottom view: 40.55 (its far end; centre 35.76, as Detail C\'s)')),
  portHeight: v(3.14, 'dimensioned', s1('Detail C: 3.14 (the port\'s opening across the thickness); its ends round (inferred)')),
  portDepth: v(1.5, 'assumed', 'the port\'s depth for a render: the drawing gives none'),
};

export const mass = v(167, 'spec', 'Weight: 5.88 ounces (167 grams)');

export const image = { width: 4032, height: 3024, kind: 'third-party' as Kind, from: '4:3, the shape of the Fusion\'s 24MP default and 12MP stills; 4032 x 3024 is the usual 12MP size, not on the spec page' };

/** Everything above, as the family's builder (iphone/part.ts) reads it. */
export const phone: Phone = {
  part: {
    title: 'iPhone 16e',
    name: 'iphone-16e.dat',
    keywords: ['Apple', 'iPhone 16e', 'phone', 'smartphone', 'camera', 'non-LEGO'],
    history: [
      ['2026-10-31', 'Built from Apple\'s dimensional drawing: body, camera, buttons, USB-C, notch'],
      ['2026-11-06', 'The flash\'s keepout (Section N-N) in features.json'],
    ],
    drawn: '2025-03-17',
    folder: 'iphone-16e',
  },
  details: { corner: 'Detail A', edge: 'Detail B', back: 'Detail D', port: 'Detail C' },
  body,
  bump,
  cameras,
  cameraIdentity: cameras.main.identity,
  flash,
  rearMic,
  connector: usbC,
  front,
  buttons,
  simTray,
  bottom,
  mass,
  image,
};
