# iPhone 17 Pro Max

The iPhone 17 Pro Max from Apple's dimensional drawing (`../../drawings/iphone-17-pro-max.pdf`, not
in the repository), built by the family's builder (`../../`). The [17 Pro](../iphone-17-pro/README.md) drawn
larger: the same corner and edge profiles, plateau heights and camera positions; the flash, rear mic and LiDAR window
6.13 further across, and six holes a side on the bottom edge.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF (a test when the PDF is present), and checks the rear mic, the flash's keepout section and MagSafe's keepouts against the drawing |
| `part.ts` | the drawing → `iphone-17-pro-max.dat` and `features.json` |
| `check.ts` | the part laid over Detail D, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **The plateau** stands 2.55 above the back plate, the camera glass 1.88 above the plateau (labelled CAMERA PLATEAU
  TO REAR CAMERA GLASS here; its extension lines measure 2.56 and 4.44 from the back plate's). Its outline (scaled from
  Detail D) sits 0.75 in from the phone's, its bottom edge 47.98 from the top with R13.10 corners. Its walls round over
  as the back's edge does, raised 2.55 (assumed, as the 17 Pro's). The camera area is a double outline 68.30 x 38.28
  and 67.91 x 37.88 (scaled; the 17 Pro's 62.15 plus the 6.13 the phone is wider).
- **The edge profile** is the 17 Pro's, label for label (Detail B): the front rounds to its flat 2.61 in, the back to
  3.79.
- **Cameras**, by sheet 3's keepout zones: Ultra Wide (125°), Fusion (90°, 24 mm), 4x Telephoto (34°, 100 mm), at
  the 17 Pro's positions. Camera 2's cone apex is 8.85 from the cover glass (the 17 Pro's sheet says 8.86). The LiDAR
  window (Ø6.65), the flash and the rear mic are on one line 64.16 across.
- **The rear mic** (Detail D: Ø1.15 at 64.16 across, 23.99 down: the 3X 64.16 line is across, the -23.99 line runs in
  to its centre from the right; the 17 Pro's says Ø1.05) is drawn flush on the plateau, between the flash and the
  LiDAR window. Its stroke's middle traces Ø1.149. It reads 0.04 right of 64.16, as the flash on the same line does.
- **The flash's keepout** (sheet 3, Section T-T, the 17 Pro's number for number) is in `features.json`: an inner 123°
  cone from a Ø6.65 base on the plateau's top (11.30 from the front, which is 8.75 + 2.55: the base, not an apex),
  turning at 13.77 into a 157° outer cone; their apexes, not dimensioned, derived from the printed numbers (9.49 and
  12.17 from the front) and found where the drawn lines cross. Only V-FOV is given, so the cones are taken as round
  (assumed). The 11.30 base and the outline closing the keepout (15.31, scaled) are in `drawing.ts` only.
- **MagSafe** (sheet 4) is in `features.json`: the Ø57.50 clear circle on the 38.99 and 81.71 lines, the product's
  centre (the 17 Pro's is 2.735 below its own); the magnetic zone the full width from 51.94 (not dimensioned: scaled,
  3.98 below the plateau's bottom edge, where the 17 Pro's starts on it) down, straight-sided to 115.14, closed by an
  R49.39 arc whose centre (84.82, derived) is 3.11 below the circle's. The compass (49.36, 156.91) and sheet 4's metal
  keepouts are in `drawing.ts` only.
- **Camera Control** is labelled 3.13 wide; the 17 Pro's is labelled 3.03 over an outline drawn identically (the same
  runs to the pixel at 1200 dpi, 3.08 across its outer stroke). The label is taken as printed.
- **The bottom edge**: twelve Ø1.53 holes, each dimensioned to its centre (2.25 apart), and two screws. The port's
  ends aren't dimensioned in the bottom view: Detail C centres it on the middle (38.99), 9.00 long, so 34.49 to 43.49
  (derived); its opening is 3.12 across the thickness.
- **Not drawn:** the receiver (a 27.38 x 0.70 slit on the glass's curved edge); the back plate's outline.
- **Spec** (support.apple.com/125091): 233 g (the US page); focal lengths and the Ultra Wide's 120°.

## Measured

Every line of `node iphone/models/iphone-17-pro-max/measure.ts` is ✓ (85: 34 for the part, 51 for the mic, T-T and MagSafe, five
of them negative controls). The overlays: Detail D 115 red pixels (hairlines along
the camera area's outline and the phone's side below Detail D's boundary), the front view 171 (hairlines on the
active area's corners), the bottom view 1762 (the edges of the flat band and the plateau's and buttons' ends seen from
below, which the drawing doesn't draw: the 17 Pro's overlay shows the same).

## What it taught

- The bottom view draws no 0.00 extension line (its labels start at the first hole's 15.41), so the 17 Pro's
  extension-line calibration doesn't apply; the outline, 1.75 toward the front (above the buttons' stubs, where the
  rounding is in by under 0.05), gives 23.03 px/mm.
- Detail D's Ø16.20 leader runs along the camera area's near side at the 17 Pro's scan row (20 in), making a 16 px
  run for a 5 px line; the sides are crossed 28 in.
- Section T-T draws more lines than the 17 Pro's: the inner lines run on past the kinks to the 123° arrow, the outer
  past the closing outline to the 157° arrow, and three hatch lines cross the keepout at 75° to the axis, one from the
  plateau's top below the axis. Read by eye, that one looks like a cone line; its angle (150° full) gives it away.
- MagSafe's magnetic zone here starts 3.98 below the plateau, under the back glass's heavy top edge: a sibling's
  reading (the 17 Pro's zone on the plateau's edge) would have put it 3.98 too high.
- This sheet labels the 1.88 CAMERA PLATEAU TO REAR CAMERA GLASS, where the 17 Pro's says BACK PLATE: a second drawing
  confirms the reading of the 17 Pro's label as a copy error.
