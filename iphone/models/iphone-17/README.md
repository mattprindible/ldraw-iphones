# iPhone 17

The iPhone 17 from Apple's dimensional drawing (`../../drawings/iphone-17.pdf`, not in the
repository), built by the family's builder (`../../`). The iPhone 16's plan on a new body: 71.45 x 149.61 x 7.95,
the display out to 2.44 from the edge (the 16's 3.27), the same two cameras one above the other in a raised pill, with
the flash and the rear mic beside them, Camera Control and the Action button.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF, plus Detail A's corner diagonal, the pill's round ends, camera 2's ring and the island's ends; checks the rear mic, the flash's keepout sections (J-J, N-N) and MagSafe's keepouts against the drawing |
| `part.ts` | the drawing → `iphone-17.dat` and `features.json` |
| `check.ts` | the part laid over Detail D, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **The camera pill** is a stadium 1.78 off the back glass (the lens glass 3.45). Its outline sits 1.18 in across and
  1.34 down, its top 3.79 and 3.97 (`baseFromTop`, `topFromTop`). Its outline's top lies within 0.11 of a semicircle
  on its 24.88 width, so its corner radii are half its widths (the top's 9.83; on their diagonals its ends read 9.75
  to 10.05). Its sides are crossed 20 down (`bumpRow`), clear of the ends.
- **Camera 2's ring:** as on the 16, Detail D's 2X Ø16.00 gives both cameras the ring, but camera 2 is drawn without
  it (its outermost circle is Ø15.06). The part follows the number. It shows red in the overlay and is kept as a known
  check.
- **The flash** stands beside the pill on the back glass (`onGlass`), at 30.41 (the 16's: 30.01).
- **The rear mic** (Ø1.00 at 20.54 across, 22.48 down, the 16's numbers: the 20.54 ordinate below Detail D rises to
  it, the left-hand 22.48 runs to it, the right-hand one is the flash's) is drawn flush on the pill's top, on its
  straight part. Two concentric circles are drawn there; the Ø1.00 arrow's hollow point lands on the inner (Ø0.99
  drawn), and the outer (Ø1.40, scaled) isn't built. Read swapped (22.48 across), no circle is drawn there.
- **The flash's keepout** (features.json): sections J-J (down the phone) and N-N (across) both start from the inner
  cone's base at 7.85 from the front (the strobe's face, 0.10 under the back glass; inferred), and both end at a 157°
  outer cone closed 4.00 out (11.85). The inner cone isn't circular, and nor is its base: 112° on Ø5.50 turning at 9.89
  down the phone, 97° on Ø5.13 turning at 9.72 across. The family's one circular cone takes J-J's, the wider (apex
  6.00, outer apex 8.72, both derived). N-N's are in `flashKeepoutAcross`.
- **J-J's 9.89 and (2.06)** don't add up (9.89 − 7.85 = 2.04). The transition's line is drawn in two pieces, 0.01
  apart: the 9.89 leader reaches the upper one (2.045 from the 7.85 line), the (2.06) arrow the lower (2.055). Each is
  its own line's number, rounded.
- **N-N isn't drawn at its numbers.** Its inner lines run straight at 98.1° from 8.6 out, not 97°, and bend in below
  8.5 (52° each side) to its base's corners on the 5.13 lines. So its kinks are drawn 9.52 apart, where its numbers
  make 9.36, and its printed numbers put the outer cone's apex at 8.768 where J-J's put it at 8.715. As drawn, both
  sections' outer lines cross at 8.73. These are known checks in measure.ts. J-J's cone holds N-N's either way.
- **MagSafe** (features.json): the Ø57.50 clear circle at the product centre (35.72, 74.81). The magnetic zone runs the
  full width from 43.62 down (the pill's outline's bottom), straight-sided to 112.01, closed by an R49.39 arc through
  those corners. The arc's centre is 77.91 down, 3.10 below the product centre (as on the 16). All re-read from
  sheet 4 within 0.04.
- **The edge profile:** Detail B dimensions both sides, the back 0.01 further out from ±2.28 on, and both reach 1.27
  in at ±3.93, 0.045 short of the face. On the front, the front view's 2.41 ALL AROUND, START OF FLAT AREA ON TOP SIDE
  ends the curve on the face. The back runs past its glass's edge (1.00 in), so it has no step to its glass. The
  16's back did step, because its profile ended 0.81 in. The builder starts both faces at 1.27 in, lifting that last
  point 0.045 onto the face. The drawing doesn't dimension the back's last rise. The receiver (14.46 x 0.45 at 1.17)
  lies on the rounding and isn't drawn.
- **The active area:** "2.44 ALL AROUND", but 144.79 long, which leaves (149.61 − 144.79) / 2 = 2.41 at each end.
  The drawing draws it centred (2.415 from the top, measured), so the part does too, and the 2.44 holds across
  (66.57). Its corners measure 10.37 on three diagonals. The bottom-left's diagonal runs along a hatch line.
- **Detail A** gives eight corner points and none on the diagonal: the outline's crossing of the diagonal is scaled
  (3.74).
- **Buttons:** the side button's and Camera Control's 3.97 are measured from the front (the arrows land on the screen
  side), so they sit 3.98 from the back. The volume-side buttons and the SIM tray are 3.97 from the back.
- **Camera Control** (centre 98.20, 17.10 x 3.03, flush) is drawn as outlines with its 0.63 chamfer. Its keepout is
  25.00 x 8.40 (sheet 2, as on the 16).
- **Cameras:** Ultra Wide (123° cone, apex 8.44 from the front; Apple's 120°) and Fusion (84° cone, apex 7.01;
  26 mm), from section G-G.
- **Calibration:** both cameras sit on one line (13.62 from the side), so measure.ts uses the flash as the point
  across, as on the 16. In the front view, the outer outline at the top is the thin line 0.9 above the heavy glass
  edge. Detail A's dash-dot box lies another 0.8 above it.
- **The island's length** can't be read on its middle row. Its dash-dot centre line is drawn over its ends there.
  Above the middle, hatch lines meet its ends. `islandEnds` reads it on rows 0.5 and 0.8 below the middle, allowing
  for the semicircular ends (20.737, 20.753), and the family's middle-row check is marked known for that reason.
- **Scaled:** the windows (13.55), the display's corners (10.37), the corner's diagonal point (3.74).
- **Spec** (support.apple.com/125089): 177 g; the Fusion's 26 mm, the Ultra Wide's 120°.

## What it taught

- A section can be drawn off its own numbers: N-N's inner cone is 98° and bends in at its base, where its numbers
  say 97° from Ø5.13. Fitting the drawn lines, and the printed numbers' hand calculation, together found it. A
  reference dimension can also run to a different line from the main one: J-J's (2.06) and 9.89.
- A drawing's "ALL AROUND" can hold on only two sides: 2.44 across, while the length's own number leaves 2.41 at each
  end. The drawing draws it at the numbers, centred.
- A centre line drawn through a feature's ends can blind a scan along it. Rows off the middle find the ends, and a
  semicircle's known shape corrects for the offset.
- The family's middle-row island scan needs a row choice (as `frontRow` and `activeColumn` already have) for drawings
  like this one.
