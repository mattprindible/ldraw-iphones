# iPhone 16

The iPhone 16 from Apple's dimensional drawing (`../../drawings/iphone-16.pdf`, not in the
repository), built by the family's builder (`../../`). The iPhone 15's body (71.63 x 147.64 x 7.81, the same corner
and edge numbers) with the Action button and Camera Control, and a new back: two cameras one above the other in a
raised pill, the flash and the rear mic beside them.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF (a test when the PDF is present), with Detail A's corner diagonal, the pill's round ends and camera 2's ring; checks the rear mic, the flash's keepout sections (M-M, N-N) and MagSafe's keepouts against the drawing |
| `part.ts` | the drawing → `iphone-16.dat` and `features.json` |
| `check.ts` | the part laid over Detail D, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **The camera pill** is a stadium 1.85 off the back glass, its outline 1.09 in across but 1.25 down, its top 3.79 and
  3.97 (`baseFromTop`, `topFromTop`). Its ends lie within 0.10 of semicircles, so its corner radii are half its widths
  (the top's 9.83, as drawn; on their diagonals its ends read 9.75 to 10.04). Its slope is the builder's straight
  fillet. Its sides are crossed 20 down (`bumpRow`): 14 down they still curve in, and read 0.04 inside each line.
- **Camera 2's ring:** Detail D's 2X Ø16.00 gives both cameras the ring, but camera 2 is drawn without it (its outermost
  circle is the 15.07 inside camera 1's ring too). The part follows the number. The overlay shows it red, and the
  re-measurement keeps it as a known check.
- **The flash** lies beside the pill, on the back glass (`onGlass`).
- **The rear mic** (Ø1.00 at 20.54 across, 22.48 down: the left-hand 22.48 runs to it, the right-hand one is the
  flash's) is drawn flush on the pill's top, on its straight part. Two concentric circles are drawn there; the Ø1.00
  arrow's hollow point lands on the inner (Ø0.99 drawn), the outer (Ø1.40, scaled) isn't built.
- **The flash's keepout** (features.json): sections M-M (down the phone) and N-N (across) both start from a Ø5.50 base
  at 7.71 from the front (the strobe's face, 0.10 under the back glass; inferred), and both end at a 157° outer cone
  closed 4.00 out (11.71). The inner cone isn't circular: 112° V-FOV turning at 9.76 down the phone, 96° H-FOV turning
  at 9.56 across. The outer cone is one circular cone: from either section's printed numbers its apex is 8.582 from
  the front. The family's field takes one circular inner cone: features.json has M-M's (112°, apex 5.86 derived), the
  wider, so it holds N-N's on the safe side (up to 1.5 mm more across at the transition). N-N's 96°, 9.56 and apex
  5.23 (`flashKeepoutAcross`), the base's 7.71 and the 11.71 end aren't in features.json: the field has no place.
  M-M's kinks are drawn 0.03 beyond 9.76, so their spacing is 0.09 wider than the hand calculation (a known check).
- **MagSafe** (features.json): the Ø57.50 clear circle at the product centre; the magnetic zone the full width from
  43.72 (the pill's outline's bottom) down, straight to 110.93, closed by an R49.39 arc through those corners, its
  centre 76.92 down (3.10 below the product centre). Re-measured at 1200 dpi: the circle (Ø57.51 about 35.81, 73.81),
  the zone's top, the arc's lowest point (126.29 for 126.31) and four points on it.
- **The edge profile:** Detail B to 0.81 in at ±3.77, then the front view's 2.41 ALL AROUND, TO START OF FLAT AREA ON
  TOP SIDE: the front glass rounds past its edge (1.00 in) to its flat 2.41 in, and the face starts there, as on the
  16 Pro. The back steps to its glass at 1.00, as the 15 Pro's does. The receiver (14.02 x 0.45 at 1.17) lies on the front's rounding and isn't drawn.
- **Detail A** gives eight corner points and none on the diagonal: the outline's crossing of the diagonal is scaled
  (3.60).
- **Camera Control** (centre 96.23, 17.10 x 3.03, flush), drawn as outlines with its 0.63 chamfer. Its keepout is
  25.00 x 8.40: Detail E's 2X 4.20 runs from the side's centre line to each edge of the keepout.
- **Cameras:** Ultra Wide (123° cone, Apple's 120°), Fusion (84° cone, 26 mm: 79.5° diagonal), from section L-L.
- **Calibration:** both cameras sit on one line (13.62 from the side), so the back view has no pair of cameras to scale
  it across. measure.ts adds the flash as the point across, for the re-measurement only.
- **Scaled:** the windows (13.55), the display's corners (9.14 at three; the fourth's diagonal runs along a hatch line),
  the corner's diagonal point.
- **Spec** (support.apple.com/121029): 170 g; the Fusion's 26 mm, the Ultra Wide's 120°.

## What it taught

- A keepout drawn in two sections needn't be a cone of revolution: the 16's flash's inner cone is 112° one way and 96°
  the other, its transitions at 9.76 and 9.56, yet both sections' numbers put the outer cone's apex at the same 8.582.
  Check one section's numbers against the other's before taking either as the whole.

- A drawing can dimension a feature it doesn't draw: 2X Ø16.00 for two rings, one of them missing.
- Two cameras on one line give no scale across. The back view needs a second feature off that line (the flash).
- A stadium bump is a rounded rectangle whose radius is half its width: the builder's rectangle repeated a point where
  two corners met (4 degenerate quads, 10 repeated edges), until it learned to drop it.
