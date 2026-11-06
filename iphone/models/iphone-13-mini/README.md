# iPhone 13 mini

The worked example: the phone as an LDraw part from Apple's accessory drawing
(`../../drawings/iphone-13-mini.pdf`, not in the repository), the first model built and the one the method was
worked out on. The rear camera came first: where it is, which way it looks, what it can see, wherever the phone is
put.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; Detail Y's calibration |
| `measure.ts` | re-measures every scaled value from the PDF (the family's procedures; a test when the PDF is present), and checks the rear mic, sections AB-AB and AC-AC and the MagSafe view against what they draw (92 ✓) |
| `part.ts` | the family's builder (`../../part.ts`) on this drawing → `iphone-13-mini.dat` and `features.json` (with the flash's keepout and MagSafe's) |
| `body.ts` | the phone for contact (the family's `../../body.ts` on this model) and its cameras read back from a placement |
| `check.ts` | the part laid over Detail Y, the front view and the bottom view at the drawing's scale (`renders/*-overlay.png`) |

**Frame:** the origin is the product centre. −Y points out of the screen and +Y out of the back. +X points toward
the side-button edge and +Z toward the top (receiver) end. Lying screen up, the cameras look down along +Y.

## The rear cameras: known and assumed

- **Known (dimensioned):** where each lens sits on the back (Detail Y); how far the rings stand proud (2.51); each
  keepout cone's apex from the screen (7.81, 6.33: sections F-F, G-G) and its angle (124°, 83°); the Lightning
  plug's room (Detail Z: 13.65 x 6.85, 14 mm out).
- **Scaled** (re-measured by `measure.ts`, within 0.05 mm): the lens windows (Ø10.83), the flash's place across,
  the bump's outline (1.15 in, a 31.97 square, corners R9.6) and top (2.875 in, 28.32, R8.0).
- **Inferred:** camera 1 is the Ultra Wide (its 124° cone just encloses 120°); G-G's "camera 1" label is a copy error.
- **Spec (Apple):** 140 g; the Ultra Wide's 120° field of view; apertures.
- **Assumed, to replace by a measurement:** the Main camera's 26 mm equivalent focal length (third-party); a pinhole
  model of the 4:3 still; the image's orientation along Z; the centre of mass at the product centre; the lens windows
  flush with the rings. A photo the phone takes of a LEGO plate (studs at exactly 8 mm), from a measured pose, would
  calibrate the camera.

## The secondary features: known and assumed

- **Known (dimensioned):** the display's active area (57.67 x 124.96, 3.27 in) and its cutout, the notch (26.78 wide,
  5.77 deep *from the active area's top*, R0.87 and R3.57 corners); each button's place, length, width and how far it
  stands proud (switch 0.60, volume and side buttons 0.45); the SIM tray; the bottom edge's six Ø1.53 holes, two
  Ø1.50 screws and the Lightning port (8.05 x 2.30).
- **Scaled** (re-measured by `measure.ts`): the active area's corner radius (6.74). The receiver's slot was scaled
  first (11.01 x 0.76 at 1.76), then found dimensioned in Detail X (11.12 x 0.85 at 1.75): its heavy strokes' middles
  read 0.1 inside.
- **Inferred:** the buttons' and the port's ends are round (half their width); the screws sit on the holes' line.
- **Assumed, for a render:** the depths of the holes (0.6), the port (1.5) and the receiver (0.3); flat-faced buttons;
  the ring/silent switch as a block the size of its pocket.
- **The two holes left of the port:** first read as centres at 17.74 and 21.53, which put them off the drawn holes.
  Their extension lines touch the holes' outer edges (the iPhone 13's drawing shows it plainly), so the centres are
  18.505 and 20.765, 2.26 apart like the other four, and the overlay agrees.
- **Not modelled:** the antenna lines, the mmWave window, the front camera and sensors (keepouts only); MagSafe's
  straight sides, the camera corner's keepout and the compass, and the flash keepout's across section (below).

## The rear mic, the flash's keepout and MagSafe: known and assumed

- **Rear mic** (`rearMic`, drawn flush on the bump's top, 2.08 from its bottom-left R8.0 corner's centre): Ø2.40 at
  9.40 across and 24.66 down (Detail Y: 9.40 is the ordinate below the view, its extension line rising to the mic's
  centre; the -24.66 line leaves it to the left; the Ø2.40 leader lands on the outer of its three circles).
  `measure.ts` finds the drawn circle there (9.393, 24.660, Ø2.390), none at the swapped place (inside the flash),
  and the back overlay's circle lies on the drawn one. The part gains its disc (97 lines).
- **Flash keepout** (`flash.keepout`, features.json; sheet 2, sections AB-AB down the phone and AC-AC across it,
  both through the flash's centre, Detail H): an inner cone from a Ø6.00 base on the strobe (AC-AC: FLASH INNER
  KEEPOUT CONE TO STROBE INTERSECTION; the strobe drawn 0.10 under the bump's glass), turning at 11.10 from the cover
  glass (AB-AB; its arrow on the front face) into a 157° outer cone (both). **The inner cone isn't round:** 112° down
  the phone (AB-AB), 96° across (AC-AC), so its transition is about 12.1 by 10.6. The family's field takes one angle:
  it carries AB-AB's 112°, which encloses the other (a keepout, so the larger); AC-AC's is in `flashKeepoutAcross`.
  The apex isn't dimensioned: 7.01 from the front, worked from the cone leaving the bump's top (9.13) at the flash's
  Ø6.28, as the drawn lines do (Ø6.27). `measure.ts` finds the kinks 11.09–11.11 from the front in both sections,
  the angles as drawn (112.3°, 157.0°; 96.0°, 157.0°), the inner cone 5.97 and 5.99 across at the strobe, and AB-AB's
  apex at 6.97 (the section draws the bump's glass 0.06 thin, 9.07).
- **MagSafe** (`magsafe`, features.json; sheet 2's back view): the clear area round the product centre (32.11,
  -65.74) as a Ø57.50 circle (2X R28.75: both arcs fit one circle there, Ø57.486); the magnetic zone the full width
  from -33.12 (the bump's bottom) down, straight-sided to -104.21, closed by R49.39, whose derived centre (66.68 down)
  is 0.94 below the product centre (the 12 mini's, on the same body, is on it), as the arc scales (lowest 116.08
  against 116.07).
- **Not in the fields** (in drawing.ts, `magsafeSides`): the clear area's straight sides 5.36 in from each edge,
  from -55.66 to -75.82, met by undimensioned R2.41 blends (the 4800 dpi trace: 0.009 RMS, a sharp corner 0.025), as
  the 12 mini's; the camera corner's keepout above the zone (0 to 33.12 across and down: no magnetic or permeable
  material, full product volume including sidewalls); the compass (58.47, -8.83). The zone's note here says "metal or
  permeable material except MagSafe magnets"; the builder's fixed note says "magnetic or permeable".

## Results so far

**Scenes** (`../../scene.ts`, for every model): upright on its bottom edge, the Ultra Wide's optical reference is
120.65 mm above the floor and the Main's 108.29 (±0.4 from the drawing's tolerances), matching the hand calculation
from the printed numbers to 0.0002 mm; upside down and flat on its screen likewise. On its side (an earlier scene) it
stands on a button and rocks 0.4° onto its bottom corner (centre of mass assumed at the product centre): the cameras
come out 0.6–0.8 mm higher than the side alone would put them.
