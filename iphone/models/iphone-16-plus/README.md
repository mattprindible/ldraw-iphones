# iPhone 16 Plus

The iPhone 16 Plus from Apple's dimensional drawing (`../../drawings/iphone-16-plus.pdf`, not in the
repository), built by the family's builder (`../../`). The iPhone 16 drawn larger, sheet for sheet: the 15 Plus's
body (77.76 x 160.89 x 7.81) with the 16's corner, edge profile, buttons, Camera Control at 109.48, and the 16's back
(two cameras one above the other in a raised pill, the flash and the rear mic beside them).

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF, with Detail A's corner diagonal and its lines, the pill's round ends, camera 2's ring, and the island's position across; checks the rear mic, the flash's keepout sections (J-J, N-N) and MagSafe's keepouts against what's drawn |
| `part.ts` | the drawing → `iphone-16-plus.dat` and `features.json` |
| `check.ts` | the part laid over Detail D, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **Detail D** is the 16's, number for number, except the pill top's 3.96 down (the 16's 3.97) and the rear mic's
  20.55 (20.54). The pill is a stadium 1.85 off the back glass, its outline 1.09 in across and 1.25 down, its top 3.79
  and 3.96 (`baseFromTop`, `topFromTop`). Its ends lie within 0.09 of semicircles, so its corner radii are half its
  widths; the top's ends read 9.75 to 10.00 on their diagonals, 9.88 on average, within 0.10 of the 9.83 built. Its
  sides are crossed 20 down (`bumpRow`), clear of the ends. Its slope is the builder's straight fillet (the bottom view's red at the bump).
- **Camera 2's ring:** Detail D's 2X Ø16.00 gives both cameras the ring, but camera 2 is drawn without it (its outermost
  circle reads 15.06), as on the 16. The part follows the number; the overlay shows it red, and the re-measurement keeps
  it as a known check.
- **The island** is dimensioned 38.85 from the volume-button edge in the front view and in sheet 3's Detail O, not
  the product's centre (38.88, where Detail A's receiver and Detail C's port are). The drawn island's ends centre on
  38.858, which favours 38.85 at the resolution's limit (0.03 is about a pixel). The builder centres the island, so the
  part's is 0.03 off the drawing's: named in drawing.ts, within the drawing's ±0.10.
- **Detail A** isn't quite symmetric: across it reads 2.30 and 5.25, down 2.29 and 5.24, kept as printed (0.01 is half
  a pixel; measure.ts checks each line is where its label says). No point on the diagonal: the outline's crossing is
  scaled (3.62).
- **The edge profile:** Detail B to 0.81 in at ±3.77, then the front view's 2.41 TO START OF FLAT AREA ON TOP SIDE: the
  face starts there, as on the 16. The back steps to its glass at 1.00. The receiver (14.02 x 0.45 at 1.17) lies on
  the front's rounding and isn't drawn.
- **The bottom:** ten Ø1.35 holes, 4 + 6, dimensioned to the end holes' centres (20.16 to 26.92 and 50.83 to 62.11: 3
  and 5 x 2.255, the extension lines entering the holes at their middles at 1200 dpi); Ø1.50 screws at 31.95 and
  45.80; the port 34.38 to 43.38, 3.14 tall.
- **Camera Control** (centre 109.48, 17.10 x 3.03, flush), outlines with its 0.63 chamfer; its keepout 25.00 x 8.40.
- **Cameras:** Ultra Wide (123° cone, Apple's 120°), Fusion (84° cone, 26 mm), from sheet 3's section G-G.
- **The rear mic:** Ø1.00 at 20.55 across (the ordinate below Detail D, its extension line rising to the mic's centre)
  and 22.48 down (the left-hand one; the right-hand 22.48 is the flash's), flush on the pill's flat top. Two concentric
  circles are drawn there; the Ø1.00 leader's arrow lands on the inner (Ø1.000 drawn), the outer (Ø1.39, scaled) isn't
  built. Read swapped (22.48 across) no circle is drawn: the negative control.
- **The flash's keepout** (features.json): sheet 3's sections J-J (down the phone) and N-N (across), the 16's M-M and
  N-N number for number: an inner cone from Ø5.50 at 7.71 from the front (the strobe's face, 0.10 under the back
  glass), 112° down the phone and 96° across, turning at 9.76 and 9.56 into one circular 157° outer cone (its apex 8.58
  from either section's numbers), closed 4.00 out. The family's single circular inner cone takes J-J's 112° (the wider:
  on the safe side across); N-N's numbers and the 7.71 stay in drawing.ts. "To cover glass" is from the front: the
  arrows start on the front face, and the drawn lines cross where the derived apexes say (5.86, 5.25 for 5.23, 8.58).
  Unlike the 16's M-M, J-J draws no back glass over the strobe on its axis (one line, as both N-Ns).
- **MagSafe** (features.json, sheet 4's middle view): the clear Ø57.50 at the product centre (38.88, 80.44); the
  magnetic zone the full width from 43.72 down, straight-sided to 114.01, closed by R49.39 through those corners, whose
  centre is 83.55 down, 3.11 below the product centre (the 16's shape and radii on a wider phone). Re-read at 1200 dpi:
  the circle fits Ø57.51 on (38.88, 80.43), the arc's lowest point 132.91 for 132.94. Sheet 4's antenna keepouts
  (KEEPOUT 1 and 2) aren't modelled.
- **Calibration:** both cameras sit on one line, so measure.ts adds the flash as the back view's point across, as the
  16's does. The circle finder's centres move by up to half a pixel with its starting guess, so the across scale reads
  69.09 to 69.19 by where the calibration starts it: 69.15 (the 16's) reads 69.150 across and 69.122 down.
- **Scaled:** the windows (13.55), the display's corners (9.14 at three; the bottom-left's diagonal runs along a hatch
  line), the corner's diagonal point (3.62).
- **Spec** (support.apple.com/121030): 199 g; the Fusion's 26 mm, the Ultra Wide's 120°.

## What it taught

- A Plus drawing isn't just its sibling scaled: the island's centre line moved 0.03 off the product's centre, and one
  corner pair reads 0.01 off symmetric. Read every label again, even where the sheet looks copied.
- A scan row that suits one drawing can land on another's leader kinks: Detail A's row 1.85 above the phone (the 16's)
  crossed leaders here 13 to 36 px wide; 1.2 above, every extension line is thin.
- A single circle as a calibration point is sensitive to sub-pixel noise: half a pixel at the flash moves the scale by
  0.04 px/mm, close to the check's ±0.05.
