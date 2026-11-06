# iPhone 17e

The iPhone 17e from Apple's dimensional drawing (`../../drawings/iphone-17e.pdf`, dated 2026-03-09, not
in the repository), built by the family's builder (`../../`). Its drawing is the 16e's drawn again
([`../iphone-16e/`](../iphone-16e/README.md)). Sheet 1's outlines match the 16e's, and every reading re-measures from
this PDF. The part is the 16e's, vertex for vertex. Only the header and the mass differ: 169 g against the 16e's 167.
Its features differ by MagSafe, which the 16e hasn't.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured (the 16e's, unchanged) |
| `measure.ts` | re-measures every scaled value from the PDF (89 readings): Detail D on its extension lines, the camera's heights in the right side view, the keepout cones in sections L-L and N-N, the MagSafe view (the clear circle and the magnetic zone's arc), and the family's front and bottom views (run without a back view) |
| `part.ts` | the drawing → `iphone-17e.dat` and `features.json` |
| `check.ts` | the part laid over Detail D, the front view and the bottom view (`renders/*-overlay.png`) |

## What differs from the 16e's drawing

Both sheets were rendered at 300 dpi and differenced against the 16e's (`magick compare`, 20% fuzz):

- **Sheet 1's outlines are the same.** One hairline at an antenna split in the bottom view sits slightly apart from
  the 16e's. No dimension lands on it. Every dimension is the same number in the same place.
- **The labels are text.** `pdftotext -bbox` gives every number with its position. The 16e's labels were outlined and
  had to be read from crops. The text confirms each of the 16e's readings.
- **Callouts dropped.** The role callouts are gone: FLASH, REAR CAMERA, BOTTOM MIC 1 and 2, SPEAKER, and the
  isometric's surface notes. The holes' roles come from the 16e's sheet.
- **Detail C reads 2X R3.30** for the port keepout's corners, where the 16e's sheet reads R3.25. R3.30 is half the
  6.60 keepout, which makes the keepout a stadium. The builder takes only the keepout's width and thickness, so the
  part doesn't change.
- **Sheet 2 adds MagSafe's magnetic zone.** Differenced against the 16e's, sheet 2 is the same but for its right-hand
  back view. The 16e's Ø57.50 circle about the product centre is there, now with notes 1, 5 and 7. Round it is a new
  zone ([5] [7] DO NOT OBSTRUCT THIS AREA WITH MAGNETIC OR PERMEABLE MATERIAL EXCEPT MAGSAFE MAGNETS): an R49.39
  circle about the product centre, cut off by the phone's sides. Sheet 1's note 7 reads NO MAGNETS ON REAR OF
  PRODUCT EXCEPT MAGSAFE MAGNETS. The spec page lists MagSafe wireless charging up to 15W; the 16e's lists only Qi.

## Known and assumed

All of this is as on the 16e (its README has the reasoning):

- **The camera has two stages and no bump.** The wide stage is Ø14.97. Its flat top is 1.40 out (scaled) and starts
  at Ø13.54 (scaled). The narrow stage (Ø12.94) carries the lens cover 1.68 out (dimensioned). The window is
  Ø11.89. The builder's bump is the wide stage, a circle whose straight slope stands in for the drawn wall and its
  rounded top edge.
- **The camera** is the 48MP Fusion (26 mm, ƒ/1.6). The keepout cone is 82°, drawn as a frustum from Ø5.91 on the lens
  cover. Its apex, 6.08 from the front, is derived, and the section's fitted sides meet at 6.080 at 82.05°.
- **The flash** lies on the back glass (`onGlass`).
- **The flash's keepout** is Section N-N's, the 16e's line for line, in features.json. It is an 80° inner cone from
  Ø6.00 on the back glass, to a transition 0.82 beyond the glass (Ø7.37), then a 155° outer cone. The 0.82 runs from
  the back glass, not "to cover glass": its arrows land on the glass's face and the kinks' line. So the transition is
  8.62 from the front (derived). Neither apex is dimensioned. The inner apex is 4.22 from the front and the outer 7.80,
  on the glass's face; both are derived and measured where the drawn sides meet. The cones are taken as round, since
  only one section cuts the flash. The 0.82 and Ø7.37 have no field (`flashKeepoutTransition`).
- **The rear mic** is Ø1.30, 24.30 across (the ordinate above Detail D, its extension line coming down to the mic) and
  13.32 down (the 3X -13.32 it shares with the camera and flash). It is drawn flush on the back glass (`rearMic`),
  10.98 from the camera's centre and outside its wide stage. Two concentric circles are drawn. The leader's arrow
  lands on the outer one (read Ø1.28); the inner (about Ø0.66, not dimensioned) isn't built.
- **MagSafe's clear circle** (Ø57.50 about the product centre) is in features.json (`magsafe`). Its **magnetic zone
  isn't**. It is the whole R49.39 circle about the product centre (fitted: centre within 0.01, R49.388), cut off by
  the sides. Its top is an arc: the cap peaks at 23.96 and meets the sides at 39.28, and the zone runs straight-sided
  to 107.42 and bottoms out at 122.74 (all derived). The family's zone fields take a straight full-width top
  (`zoneFrom`). Here 39.28 would drop the cap and 23.96 would add the top corners outside it, so the zone is recorded
  in `magsafeZone`, not forced. The camera corner's magnetic keepout (to 36.03 across, -27.72 down) and the Ø8.00
  compass at (60.51, -9.86) are recorded too (`cameraZone`, `compass`). The middle back view's metal keepouts aren't.
- **The corner** is the 14's: (3.31, 3.31) on the diagonal stands in for the off-diagonal cross (3.22, 3.40), and the
  outline passes 0.006 from it.
- **The edge profile** is the 14's, with both faces stepping to their glass at 1.05 in. The 1.15 start of flat isn't a
  profile point.
- **The bottom holes** are dimensioned to their outer edges, as the 14's and 16e's are.
- **Scaled:** the bump's top (1.40) and Ø13.54, the camera ring (12.94) and window (11.89), the display's corner radius
  (7.87), and the receiver slot (11.02 x 0.76).
- **Spec** (support.apple.com/126470): 169 g; 48MP Fusion Main 26 mm, ƒ/1.6.
- **Assumed, for a render:** the depths of the holes, the port and the receiver.

## Overlays

Red pixels:

- Detail D, 439: half-pixel fringes on the camera's, the flash's and the rear mic's circles, plus the part's top edge
  beyond Detail D's dashed circle. The last run counted 433 with the same geometry (the .dat differs only by a
  history line).
- Front view, 127: hairlines at the display's corners and at the buttons' ends.
- Bottom view, 53: the ends of the camera's wide stage seen past the back, where the builder's slope replaces the drawn
  rounded wall.

## What it taught

- **Difference a new drawing against its nearest sibling before reading it.** A 300 dpi pixel difference showed in a
  minute that the 17e's sheet 1 is the 16e's, label changes aside. Re-measuring from the new PDF, rather than copying
  numbers, then confirms it reading by reading: all 53 pass.
- **A zone that repeats can change shape.** The 17e's magnetic zone is the 16's R49.39, but as a whole circle. It has no
  straight top, and the family's fields can't take it. Two arcs fitted as one circle (worst 0.02 off) show it is one
  circle top and bottom.
- **A hatched region defeats a four-chord circle finder.** The Ø57.50 circle has hatch lines on both sides. Read on
  four chords it came out 0.09 off its centre across; on rays from the centre, keeping only thin single crossings, it
  came out within 0.004.
- **A redrawn sheet can correct a label.** The 16e's R3.25 on a 6.60 keepout couldn't be a stadium; the 17e's R3.30
  is.
