# iPhone SE (3rd generation)

The iPhone SE (3rd generation) from Apple's dimensional drawing (`../../drawings/iphone-se-3rd-generation.pdf`,
dated 2022-04-26, not in the repository; the sheet says it fits the 2nd generation too). The family's builder
(`../../`) builds it. It's an older drawing than the rest, on its own plan. One sheet carries everything:

- Detail A: the corner, and the receiver and front sensors.
- Detail B: the front sensors' keepout cones.
- Detail C: the camera and flash, seen from the back.
- Detail D: a section through the camera turret and the flash, with their keepout cones.
- Detail E: the edge profile.
- Detail F: the bottom edge.

The phone is 138.44 x 67.27 x 7.31. Its sides are one curve with no flat band. It has a Home button with Touch ID
under a rectangular display, and one camera in a 0.87 turret. The flash and the rear mic sit on the back glass beside
the turret, all three on one line. The bottom edge has Lightning.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured; what isn't built (`notBuilt`, `simTray`) |
| `measure.ts` | re-measures every scaled value from the PDF (92 readings): the back view and the bottom view on their extension lines, Detail C's circles along rays parallel to its hatching, Detail D's heights and the turret's wall, the front view, and Detail E's curve where `drawing.ts` adds points to it |
| `part.ts` | the drawing → `iphone-se-3rd-generation.dat` and `features.json` |
| `check.ts` | the part laid over the back view, Detail C, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **The edge profile has no flat band, so two points are added.** Detail E's curve runs from the mid-plane (boxed
  0.00) through (0.41, 1.76), (1.02, 2.60) and (2.46, 3.45) to the face at (4.50, 3.655). The builder needs a flat
  band, so (0, 0.40) draws the curve's middle flat. The curve scales only 0.03 in at 0.40. The bottom edge's openings
  and the buttons sit on that plane. The builder also needs a face within 0.1 of the full thickness inside the
  display's sides (4.385 in). (3.60, 3.565) lies on the line between the 2.46 and 4.50 crosses, and the curve scales
  3.65 there. The builder lifts that point to the face.
- **The camera turret.** Detail D draws a 45° wall from Ø9.70 at the back glass up to Ø8.57, 0.72 out. Ø9.70 is
  scaled from Detail C's outermost circle, Ø8.57 is the back view's REAR CAMERA dimension, and the 0.72 height is
  scaled where the wall reaches Ø8.57. The wall then rounds over to a flat top 0.87 out (dimensioned), which ends at
  Detail C's heavy ring (Ø7.54 through its middle). The builder's bump is the wall. The camera's ring is the top:
  Ø7.54, standing from 0.72 to 0.87, a step where the drawing rounds. The window is the heavy ring's inner edge
  (Ø7.02).
- **The camera** is the 12MP Wide (ƒ/1.8). Detail D puts its 76.7° keepout cone's apex 2.00 inside the back glass,
  so 5.31 from the front. The cone is Ø4.54 at the turret's top, which is the printed value worked from 2.00, 0.87
  and 76.7°. The cone encloses a 28 mm lens's 75.4° diagonal. The 28 mm comes from the camera's EXIF (third-party;
  Apple's specifications give no focal length).
- **The flash keepout** (`flash.keepout`) has an inner cone of 114°, its apex 1.35 inside the back glass (5.96 from
  the front). It is Ø4.16 at the glass, which is the printed value worked from 1.35 and 114°. Beyond 1.44 out from
  the back glass (8.75 from the front) the outer cone is 158° (`transitionFromFront`). Detail D's arrows land on the
  apex lines, the back glass's line and the line where the two cones meet. measure.ts checks each of the four heights
  at four times the back view's scale. The drawing measures these distances from the back glass, not from a cover
  glass; they're converted to "from the front" as the family records them.
- **The rear mic** (`rearMic`) sits at 18.13 across, 10.24 down (the 3X 10.24 shared with the camera and flash), Ø1.50.
  It's 7.69 from the camera's centre, outside the turret, so it's drawn flush on the back glass.
- **MagSafe isn't on this drawing**: the SE has none. The back view's Ø57.42 circle (centred 69.22 above the bottom) is
  the Qi charging area ("do not obstruct this area with metal or other conductive material"). It's recorded in
  `notBuilt`, not in `magsafe`.
- **Not built** (recorded in `drawing.ts`): the Home button (Ø10.90, 9.25 above the bottom; its 100° keepout cone,
  14.60 wide at the cover glass, 12.46 deep), because the builder has no field for it. Detail C's case keepout (a tapered
  slot from Ø12.14 round the camera to Ø9.70 round the flash, at 1.4 above the housing). The antenna areas, the
  compass, and the front sensors. The SIM tray (52.72 to 68.39 down, 2.30 wide, its back edge 2.41 from the back), which
  is in the side-button side, while the builder outlines a tray in the volume side only.
- **The bottom holes**: two groups of six Ø1.45 holes on the 2.255 pitch. The drawing dimensions each group's outer
  hole by its outer edge (10.26, 57.01), and its inner hole (the bottom mic) by its centre (22.26, 45.01) and inner
  edge (22.98, 44.29). Nine holes' chords centre within 0.02 of that reading. The second, fourth and eleventh are
  crossed by other lines of the drawing, so measure.ts leaves them out.
- **The ring/silent switch** is dimensioned by its ends (17.56, 5.61 long) and edges (2.24 and 4.21 from the back). It's
  modelled as a block that size standing 0.42 proud.
- **Scaled:** the turret's Ø9.70, 0.72 and Ø7.54, the window (Ø7.02), the display's square corners, and the two
  profile readings behind the added points.
- **Spec:** 144 g; Wide camera ƒ/1.8.
- **Assumed, for a render:** the depths of the holes, the port and the receiver.

## Overlays

Red pixels:

- Back view, 9.
- Front view, 9.
- Detail C, 532: the part's top and side edges beyond Detail C's dashed circle, where the detail stops drawing, plus
  a fringe at the window's edge. Every circle the part draws lies on a drawn one: the turret's three, the window, the
  flash, and the rear mic inside its heavy ring.
- Bottom view, 406: the hard edges the builder draws at the added flat band's ±0.40, between each end and the holes.

## What it taught

- **A drawing can give no flat band.** The SE's sides are one curve. The builder takes a band as the profile's first
  point and puts the bottom openings and the buttons on that band's plane. So the band is drawn as narrow as the curve
  allows (±0.40, within 0.03). The buttons then stand on that plane up to 0.3 outside the curve at their long edges.
- **A face can start past the display's edge.** The SE's front reaches its full height only 4.50 in, beyond the
  display's 4.385. The builder starts a face at the first point within 0.1, so a point on the straight line between two
  crosses (3.60) puts the face where the curve is within 0.01 of flat, and Detail E's own curve confirms it.
- **"To back glass" here is from the back.** The SE's keepout depths are measured from the back glass (1.35, 2.00 inside
  it; 1.44 outside). Each printed diameter at the surface (Ø4.54, Ø4.16) follows from those depths and the cone's
  angle, and that check settles which line each arrow lands on.
