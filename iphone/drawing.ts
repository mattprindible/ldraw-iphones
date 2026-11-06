// What an iPhone's dimensional drawing gives, as every model's drawing.ts records it: the shape the shared builder
// (part.ts) reads. Apple draws the family on one plan, sheet after sheet: a corner profile and an edge profile, the
// back with its cameras, the front with its display, the side views with their buttons, the bottom with its ports. Each
// model fills it with its own numbers, each a Value saying where it came from (src/provenance.ts).
import type { Value } from '../src/provenance.ts';

export interface Points {
  points: [number, number][];
  kind: Value['kind'];
  from: string;
}

export interface Camera {
  /** As the drawing names it ("rear camera 1"). */
  name: string;
  /** As people know it ("Ultra Wide"), for drawings and legends. */
  label: string;
  /** Centre on the back, from the side-button edge and the top edge (the back view's datum). */
  fromSide: Value;
  fromTop: Value;
  ring: Value;
  window: Value;
  /** Apex of its keepout cone, from the front face: the drawing's own optical reference. */
  coneApexFromFront: Value;
  keepoutCone: Value;
  /** Diagonal field of view (spec), or a 35 mm equivalent focal length to derive it from. */
  fov?: Value;
  equivalentFocal?: Value;
  aperture: Value;
}

export interface Button {
  side: 'volume' | 'side';
  /** From the top edge to its centre; centre to an end; across the thickness; centre from the back; proud of the side. */
  centre: Value;
  half: Value;
  width: Value;
  fromBack: Value;
  proud: Value;
  note: string;
}

/** A flat disc on the bump's top (the flash, a LiDAR scanner), from the side-button edge and the top. */
export interface Disc {
  fromSide: Value;
  fromTop: Value;
  diameter: Value;
}

export interface Phone {
  /** The part's header: its title, file, keywords and history; the drawing's date; the folder it's built in. */
  part: { title: string; name: string; keywords: string[]; history: [string, string][]; drawn: string; folder: string };
  /** The drawing's names for the details the comments cite. */
  details: { corner: string; edge: string; back: string; port: string };
  body: {
    width: Value;
    length: Value;
    thickness: Value;
    glassWidth: Value;
    glassLength: Value;
    /** The plan-view corner: (along the top edge, down the side) from the corner, the same at all four. */
    corner: Points;
    /** The edge profile: (inset from the outermost side, half-height from mid-plane), starting on the flat side. */
    edge: Points;
    /** The back's, where it differs from the front's (`edge`). */
    edgeBack?: Points;
  };
  bump: {
    top: Value;
    rings: Value;
    /** Its outline and top: from the side and top edges, their size across, and (when not square) down. */
    baseSize: Value;
    baseHeight?: Value;
    baseFrom: Value;
    /** The outline's inset from the top edge, where it differs from its inset from the side (the 16's pill: 1.25 and 1.09). */
    baseFromTop?: Value;
    baseRadius: Value;
    topSize: Value;
    topHeight?: Value;
    topFrom: Value;
    /** The top's inset from the top edge, where it differs from its inset from the side (the Air's pill: 4.51 and 4.78). */
    topFromTop?: Value;
    topRadius: Value;
    /**
     * The slope from the top down to the outline, where it isn't straight (the Air's concave flanks): (out from the
     * top's edge, height above the back glass), as the side view draws it below the top, from (0, top) to (its run to
     * the outline, 0). The flanks at the top and sides follow it in proportion to their runs.
     */
    flank?: Points;
  };
  /**
   * A camera plateau across the top of the back (the 17 Pro), in place of a bump on the back glass: its height above
   * the back plate, how far its outline sits in from the phone's (top and sides), its bottom edge from the top edge,
   * and that edge's corner radius. `bump` then gives the camera
   * area outlined on its top (base and top alike), and the plateau's and the lens rings' heights.
   */
  plateau?: { height: Value; inset: Value; bottom: Value; radius: Value };
  /** The rear cameras, keyed as features.json names them, in the drawing's order. */
  cameras: Record<string, Camera>;
  /** Which camera is which, when the drawing only numbers them. */
  cameraIdentity: Value;
  /**
   * The flash: on the bump's top, or on the back glass beside the bump where the back view draws it there (the 16).
   * Its keepout where a section gives one, features.json only: an inner cone and the outer cone beyond it, by their
   * full angles, with whatever the section dimensions of them: the inner cone's apex (the 12 Pro's G-G: its "origin")
   * and the transition to the outer cone, from the front (the 12 Pro's); or each cone's apex and the inner cone's base
   * diameter (the 18 Pro Max's T-T).
   */
  flash: Disc & {
    onGlass?: boolean;
    keepout?: { inner: Value; outer?: Value; apexFromFront?: Value; outerApexFromFront?: Value; transitionFromFront?: Value; innerBaseDiameter?: Value };
  };
  /** The rear mic, where the back view gives it: flush on the bump's top or the back glass, whichever its centre is on. */
  rearMic?: Disc;
  /**
   * MagSafe's keepouts on the back (sheet 4), features.json only: the circle kept clear of metal, conductive and
   * magnetic material (its centre and diameter); and round it the zone kept clear of magnetic material but MagSafe's
   * magnets, as the 16 draws it: the phone's full width from `zoneFrom` down, its sides straight to `zoneSidesTo`, then
   * closed by an arc of `zoneRadius` through those two corners (its centre on the middle line).
   */
  magsafe?: { fromSide: Value; fromTop: Value; diameter: Value; zoneFrom?: Value; zoneSidesTo?: Value; zoneRadius?: Value };
  /**
   * A sensor on the bump (the Pros' LiDAR scanner): its window (`length` down the phone) where the drawing gives one, a
   * stadium unless its corners' radius is given (the 12 Pro's R1.96), or only its keepout zone on the cover glass (a
   * circle), which isn't drawn on the part.
   */
  sensor?: { name: string; fromSide: Value; fromTop: Value; keepoutCone: Value; window?: { width: Value; length: Value; radius?: Value }; zone?: Value };
  /** The port on the bottom edge and the room its plug needs: a rounded box reaching out from it. */
  connector: { name: 'Lightning' | 'USB-C'; width: Value; thickness: Value; fromSide: Value; fromBack: Value; outward: Value };
  front: {
    activeWidth: Value;
    activeLength: Value;
    activeFromEdge: Value;
    activeRadius: Value;
    /** A notch let into the active area's top edge (to the 14), or */
    notchWidth?: Value;
    notchDepth?: Value;
    notchTopRadius?: Value;
    notchBottomRadius?: Value;
    /** a Dynamic Island: a pill inside it, centred across, its centre from the top edge. */
    islandLength?: Value;
    islandHeight?: Value;
    islandFromTop?: Value;
    /** The receiver's slot, where it lies on the flat face (the 16 Pro's is on the glass's curved edge, and isn't drawn). */
    receiverLength?: Value;
    receiverHeight?: Value;
    receiverFromTop?: Value;
    receiverDepth?: Value;
  };
  buttons: Record<string, Button>;
  /** The SIM tray's outline in the volume-button side, where there is one (the Air has none). */
  simTray?: { centre: Value; length: Value; width: Value; fromBack: Value };
  /** Camera Control, flush in the side-button side (the 16s on): from the top to its centre, centre to an end, across the thickness, and the chamfer round it; its keepout at the surface. */
  cameraControl?: { centre: Value; half: Value; width: Value; fromBack: Value; chamfer: Value; keepoutLength: Value; keepoutWidth: Value };
  bottom: {
    /** From the volume-button edge (the bottom view's datum). */
    holes: Value[];
    holeDiameter: Value;
    holesFromBack: Value;
    holeDepth: Value;
    screws: Value[];
    screwDiameter: Value;
    screwsFromBack: Value;
    portFrom: Value;
    portTo: Value;
    portHeight: Value;
    portDepth: Value;
  };
  mass: Value;
  image: { width: number; height: number; kind: Value['kind']; from: string };
}

/** The title block's general tolerance for a dimension of this size (every sheet of the family, METRIC). */
export function tolerance(mm: number): number {
  const a = Math.abs(mm);
  return a < 2 ? 0.05 : a < 10 ? 0.08 : a < 50 ? 0.1 : a < 100 ? 0.2 : a < 200 ? 0.3 : 0.4;
}
