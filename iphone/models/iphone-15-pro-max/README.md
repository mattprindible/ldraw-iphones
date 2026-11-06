# iPhone 15 Pro Max

The iPhone 15 Pro Max from Apple's dimensional drawing (`../../drawings/iphone-15-pro-max.pdf`, not in
the repository), built by the family's builder (`../../`). It's drawn on the 15 Pro's plan, sheet for sheet, so
it was built from the 15 Pro's files with what the drawing changes. Its title block says DO NOT SCALE DRAWINGS; the few
scaled values are checked against dimensioned features.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF (a test when the PDF is present); checks the rear mic, Section H-H and the MagSafe view |
| `part.ts` | the drawing → `iphone-15-pro-max.dat` and `features.json` |
| `check.ts` | the part laid over Detail A, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **Detail letters swapped from the 15 Pro's:** Detail D is the corner (with the island and receiver), Detail A the
  back. B and C are the same.
- **The same as the 15 Pro:** the corner profile, the edge profile, the bump (1.04 / 4.70 to 45.22 x 46.54 / 41.56 x
  42.88, plateau 2.05), the camera centres and Ø16.20 rings, the island (20.69 x 6.07 at 7.67), the receiver (14.54 x
  0.45 at 1.17, straddling the glass's edge: modelled as its part inside), the buttons' sizes. Detail A's 2.41 across is
  the back's flat area (the front view's 2.41 ALL AROUND), not part of the bump.
- **Different:** 76.73 x 159.86 x 8.25; glass 74.73 x 157.86; active area 71.21 x 154.34; lens rings 4.07 above the back
  (3.78); flash Ø6.90 (6.92); buttons at 31.67 / 45.22 / 59.42 and 56.17 as the 15 Pro, the SIM tray at 91.07; the
  volume buttons 2X 4.13 from the back (the action button's and SIM tray's 4.12); ten bottom holes (4 + 6) on the
  2.255 pitch, screws at 31.44 and 45.29, the port 33.87 to 42.86 (8.99 long; the 15 Pro's 9.71).
- **Cameras, by their keepout cones (sheet 2):** camera 1 the Ultra Wide (123°, apex 8.28 from the cover glass), 2 the
  Main (86°, 7.73), 3 the 5x Telephoto (24.10°, 4.60: the 15 Pro's 3x had 33.2°). Fields of view from Apple's spec:
  120°, 24 mm, 120 mm.
- **The LiDAR scanner** is given only as a keepout zone (Detail F: Ø14.62 at 32.16, 38.22, overlapping camera 3's ring),
  so it's in `features.json` but not drawn.
- **The rear mic** (Detail A), the 15 Pro's number for number: Ø0.75 at 37.95 across, 33.86 down (37.95 is the first
  ordinate below the view, its extension line rising to the mic's centre; the -33.86 line runs in to it from the
  right), flush on the bump's top, 6.10 from its bottom-right R9.68 corner's centre (`rearMic`). Two concentric circles
  are drawn, Ø1.15 and Ø0.75 at 4800 dpi; the leader's arrow stops on the outer, but the printed Ø0.75 is the inner's:
  taken as printed, the opening. The outer is recorded as scaled (`rearMicOuter`). Its circle in the Detail A overlay
  lies on the drawn inner one.
- **Flash keepout** (sheet 2, Section H-H, the middle section: the 15 Pro's J-J; features.json only): the 15 Pro's
  numbers, a 112.00° inner cone from its apex ("origin") 8.35 from the cover glass, 0.10 beyond the back glass's plane
  inside the bump, turning at 12.36 into a 157.00° outer cone. Both dimensions start on the section's left face, the
  front (the section draws the bump's top 10.30 from it and camera 3's ring 12.33, as sheet 1's numbers). The
  transition is 0.04 beyond the lens rings' top (12.32), too close to tell apart in the section. One section, so the
  cones are taken as circular. Hand calculation: 2 (10.30 - 8.35) tan 56° = Ø5.78 where the inner cone leaves the
  bump's top, 0.56 inside the Ø6.90 flash's edge all round, as on the 15 Pro: a `known` difference in measure.ts. The
  hatched keepout is closed by an undimensioned line 14.67 from the cover glass (`flashKeepoutExtras`, scaled).
- **MagSafe** (sheet 2, the middle back view, features.json only): the clear circle Ø57.50 centred on the **product
  centre**, 38.37 across and 79.93 down, both labelled PRODUCT CENTER (the 15 Pro's sits 1.675 below its centre). The
  magnetic zone is the 16's shape, with its own radius: the full width from its top down, straight sides to 114.87,
  closed by an **R51.89** arc (the 15 Pro's R49.39) whose derived centre, 114.87 - √(51.89² - 38.365²) = 79.93, is the
  product centre too. The zone's top isn't dimensioned (the 15 Pro's prints -45.18): it's drawn **46.76** down across
  the full width, 0.22 below Detail A's bump outline (-46.54, which the view also draws under the bump), so `zoneFrom`
  is scaled. The camera corner's keepout (to 45.22 across, crosshatched: no metal or conductive material) and the
  compass (58.06, 153.94: near the bottom edge, where the 15 Pro's is near the top) are in `magsafeExtras`, not built.
  Sheet 2's other keepouts (the left view's metal bands, Detail E's front sensors) and sheet 3's antenna keepouts
  (Detail K) are not recorded.
- **The bottom holes** are dimensioned to their centres: the extension lines cross the view 20.39, 27.16, 49.54 and
  60.82 from the 0.00 line, on the holes.
- **Scaled:** the windows (13.03, 13.03, 13.02), the bump's corners (13.28, 9.68), the display's corners (8.24); the
  mic's outer circle (1.15), the line closing the flash's keepout (14.67) and MagSafe's zone top (46.76).
- **Spec** (support.apple.com/111828): 221 g; focal lengths, apertures and the Ultra Wide's 120°.

## What it taught

- A sibling drawing can reuse the plan but not the letters: the back is Detail A here, D on the 15 Pro. Name regions
  after the drawing in hand (`detailA`), not the model copied from.
- Every check passed on the first run with the 15 Pro's scaled values as guesses (the bump and windows are the same
  part), and the overlays' red is the same as the 15 Pro's: the bump's fillet to the back glass, drawn as a curve, built
  as a slope (bottom view), and the phone's edge outside Detail A's dashed boundary.
- The bottom view draws the phone 8.14 thick for 8.25, as the 15 Pro's draws 8.12.
- A sibling's keepouts can't be copied either: the mic and the flash's cone are the 15 Pro's to the hundredth, but
  MagSafe's clear circle moves onto the product centre, its zone's arc takes another radius (R51.89, centred there
  too), and its top loses its dimension (drawn 46.76, just below the bump).
