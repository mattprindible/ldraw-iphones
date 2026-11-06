# iPhone 12 Pro

The iPhone 12 Pro from Apple's dimensional drawing (`../../drawings/iphone-12-pro.pdf`, dated 10/13/20,
not in the repository), built by the family's builder (`../../`). Sheet 1 is the iPhone 12's (`../iphone-12/`)
view for view and, outside Detail D and the port, number for number; Detail D has three cameras, the flash and a rear
mic on a bump drawn at a larger scale. Sheet 2 (drawn turned a quarter) gives the keepout cones (Sections F-F, G-G,
H-H), Detail J the LiDAR scanner ("rear camera 4") and its right-hand back view MagSafe's keepouts.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF and checks the rear mic, Section G-G and the MagSafe view against the drawing (71 ✓, 3 ≠ with their reasons), with scans of its own |
| `part.ts` | the drawing → `iphone-12-pro.dat` and `features.json` |
| `check.ts` | the part laid over Detail D, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **The 12's, number for number:** the body (71.52 x 146.71 x 7.39), the corner (Detail A) and edge (Detail B)
  profiles, the front view (active area, the 34.83 x 5.30 notch, the receiver inside it), the buttons, the SIM tray, the
  eight bottom holes, the screws, Lightning's keepout (13.65 x 6.85, centred 3.67 from the back).
- **Detail D:** the bump's outline 2.12 to 35.44 across, -2.12 to -37.62 down (33.32 x 35.50) and its top 4.62 to
  32.94, -4.62 to -35.11 (28.32 x 30.49), concentric; plateau 0.94 above the back glass, the lens rings 1.72 (3X).
  Cameras 1 and 2 at 12.16 across (-12.16, -27.58 down), camera 3 and the flash at 25.51 (-19.87, -9.17); 3X Ø12.45
  rings; the flash Ø6.28.
- **The rear mic:** 30.23 across (its extension line rises from below the view), -27.38 down (its line leaves the mic
  to the right), Ø1.15 (the leader on the outer of its two circles, at 2400 dpi). Its centre is on the bump's top,
  inside the top's bottom-right R7.80 corner (5.09 from its centre), so it's drawn flush there. `measure.ts` finds the
  circle at 30.230, 27.380, Ø1.14; the overlay's mic lies on the drawn circle.
- **Cameras, by their keepout cones (sheet 2):** camera 1 the Main (82°, apex 5.51 from the screen), camera 2 the
  Telephoto (47°, 3.13), camera 3 the Ultra Wide (130°, 6.77). Not the 13 Pro's order: there camera 1 is the Telephoto.
- **The LiDAR scanner:** Detail J's base of its 80° cone on the plateau, 4.55 x 7.55 with 4X R1.96 corners, at (25.51,
  30.45), drawn as dimensioned.
- **The port's outline** is larger than the 12's: 31.38 to 40.14 (8.76) by 3.01, against 31.54 to 39.99 by 2.70; the
  3.01's extension lines touch the heavy outline's outer edges. Recorded as drawn.
- **The side button's 3.69** lands on the back (the bump's side) in this right side view; with 7.39 / 2 = 3.695 it
  makes no visible difference.
- **Scaled** (re-measured by `measure.ts`): the lens windows (Ø9.77, all three), the bump's corners (outline 10.30, top
  7.80), the active area's corners (7.83). Detail D is drawn at 63.25 px/mm at 1200 dpi (the 12's: 57.49).
- **Spec** (support.apple.com/111875): 189 g; the Ultra Wide's ƒ/2.4 and 120°; the Wide's ƒ/1.6; the Telephoto's
  ƒ/2.0; 2x optical zoom in. **Third-party:** the Main's 26 mm, the Telephoto's 52 mm; the 4032 x 3024 still.
- **Assumed, for a render:** the depths of the holes, the port and the receiver.
- **In features.json only:** the flash's keepout cones (G-G, cut down the 25.51 line: apex 7.03, 135° inner, 157°
  outer, transition 11.29). "To cover glass" is from the front face: both arrows start at the section's left edge; the
  7.03 lands where the inner cone's lines cross, 0.36 inside the back glass, the 11.29 on the kinks into the outer cone.
  Hand calculation: 2 x (8.33 - 7.03) x tan 67.5° = Ø6.28 at the bump's top, the flash's own Ø6.28 (from the back glass
  it would be Ø38.5: the negative control). `measure.ts` fits the drawn lines: apex 7.05, kinks 11.27, 135.2° and 156.8°.
  The crossing sits 0.14 below the kinks' midpoint, which is on the flash's axis by camera 3's ring (4.51 below it for
  sheet 1's 4.475): recorded as known (two short lines crossed; 0.3° each moves it that far).
- **MagSafe (features.json only)**, sheet 2's MagSafe view, every number the 12's: the clear Ø57.50 circle round the
  product centre (35.76, -73.35); the magnetic zone the full width from -40.12, straight-sided to -107.42, closed by an
  R49.39 arc whose centre (107.42 - √(49.39² - 35.76²) = 73.35) is the product centre. `measure.ts` calibrates on the
  view's extension lines and fits the circle (Ø57.48 at 35.76, 73.33) and the arc. The zone's top is 2.50 below this
  bump's bottom (-37.62; on the 12, 3.82), and the camera corner's 35.44 is Detail D's: the shared numbers fit the
  Pro's bump (inferred). Not in the family's fields, recorded in `drawing.ts` only: the camera corner's keepout (0 to
  35.44, 0 to -40.12) and the compass (65.26, -11.09).
- **Not modelled:** the front view's 1.15 to the start of the flat (Detail B reaches its top at 0.95; recorded as
  `flatFrom`), sheet 2's antenna (metal and conductive material) keepout areas.

## What it taught

- **Two strokes 0.01 apart merge or not with the pixel grid.** Each lens draws a thin innermost circle (Ø9.77) with
  the heavy ring just outside it. At 1200 dpi cameras 1 and 2 read them apart, camera 3 as one 0.44 wide run (Ø9.91
  to 10.13 with the guess); at 4800 dpi all three read Ø9.77. Recorded as known, with a 4800 dpi scan beside it.
- **The crosshatch moves from sheet to sheet.** The 12's notch row failed on a hatch line and its bottom passed; here
  the row passes and the family's column meets a hatch line at the cutout's bottom (8.87 for 8.77). 6 left of the
  middle it reads 8.76. Known, with its own scan.
- **One plan, a different camera order.** The 12 Pro's camera 1 (upper left) is the Main, the 13 Pro's the Telephoto:
  read each drawing's cones; don't carry identities across models.
