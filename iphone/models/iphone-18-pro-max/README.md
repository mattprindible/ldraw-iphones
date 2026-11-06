# iPhone 18 Pro Max

The iPhone 18 Pro Max from Apple's dimensional drawing (`../../drawings/iphone-18-pro-max.pdf`, not in
the repository, dated 2026-09-09), built by the family's builder (`../../`). The
[17 Pro Max](../iphone-17-pro-max/README.md)'s body with the [18 Pro](../iphone-18-pro/README.md)'s camera details: the
taller plateau, the larger lens rings, the shorter Dynamic Island.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF (a test when the PDF is present), and checks the rear mic, the flash's keepout section and MagSafe's keepouts against the drawing |
| `part.ts` | the drawing → `iphone-18-pro-max.dat` and `features.json` |
| `check.ts` | the part laid over Detail D, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **The 17 Pro Max's, unchanged:** 77.98 x 163.43 x 8.75, the glass (75.58 x 161.03) and active area (72.86 x 158.31,
  2.56 all round), the corner and edge profiles (Details A and B, label for label), the buttons, Camera Control at
  111.82, the cameras' positions except camera 3's, the flash, rear mic and LiDAR line (64.16), Detail C (38.99, 9.00,
  12.45 x 6.60).
- **The 18 Pro's, unchanged:** the plateau 2.78 above the back plate and the camera glass 2.11 above it (the
  extension lines measure 2.79 and 4.90 from the back plate's at 1200 dpi, so the lens rings stand 4.89 proud), rings
  Ø16.58 with a 12.84 innermost circle, camera 3 at 32.49 across, a Ø6.90 flash and LiDAR window, and the keepout
  cones: 125° with its apex 10.76 from the cover glass (Ultra Wide), 90° at 7.81 (Fusion), 34° at 8.43 to its Ø5.00
  base (4x Telephoto), the LiDAR's 84°.
- **New here:** the island 15.68 long (the 17 Pro Max's 20.76, the 18 Pro's 15.66), its centre 7.91 down; the SIM tray
  at 125.38, 2X 9.80 (19.60 long); the port 3.14 high (3.12); Camera Control labelled 3.03 wide (the 17 Pro Max's sheet
  said 3.13 for the same outline); the bottom holes' first and last at 15.40 and 62.58 (15.41, 62.57).
- **A copied label:** the front view's second "2.56 ALL AROUND ... TO START OF FLAT AREA ON TOP SIDE OF PRODUCT" (the 17
  Pro Max's 2.61) has its arrows on the outline and the active area's edge, the same lines as the first 2.56, at 2400
  dpi. Detail B's 2.61 is taken for where the face's flat starts.
- **The rear mic** (Detail D: [2] Ø1.15 at 64.16 across, 23.99 down): the 3X 64.16 line is across (the vertical
  centre line through the flash, the mic and the rear sensor), the -23.99 line on the right runs in as the mic's own
  horizontal centre line. Drawn as two concentric circles; the leader lands on the outer one, Ø1.15 (the inner, not
  dimensioned, scales Ø0.75 and isn't recorded). On the camera area's top: built flush on the plateau.
- **The flash's keepout** (sheet 3, Section T-T) is in `features.json`: an inner 123° cone on a Ø6.65 base and an
  outer 157° cone from 14.00, both V-FOV, taken as round (assumed). The arrows settle 11.53: it runs to the section's
  back face over the flash, the plateau's top (8.75 + 2.78), where the Ø6.65 base lies, not to the inner cone's apex.
  The apexes aren't dimensioned: derived 9.725 (11.53 - 3.325 / tan 61.5°) and 12.398, and the drawn lines cross at
  9.71 and 12.38. 14.00 is the transition (the kinks), from the front face, as the camera sections' "to cover glass".
  The 11.53 base and the line closing the keepout (15.53, scaled) are in `drawing.ts` only.
- **MagSafe** (sheet 4) is in `features.json`, the 17 Pro Max's number for number: the Ø57.50 clear circle on the
  38.99 and 81.71 lines (the product's centre), the magnetic zone the full width from 51.94 down (scaled: 3.97 below
  the plateau's bottom edge, not on it), straight-sided to 115.14, closed by an R49.39 arc whose centre (derived 84.82
  down) is 3.11 below the clear circle's. The compass (49.79 across, 157.45 down; the 17 Pro Max's 49.36, 156.91) and
  the antenna keepouts and view cone are in `drawing.ts` only.
- **Not drawn:** the receiver (a 26.58 x 0.46 slit on the glass's curved edge, Detail A).
- **Scaled:** the camera area's double outline (outer 4.87 in, 68.25 x 38.23, R9.67; inner 5.09 in, 67.81 x 37.79,
  R9.45), the plateau (0.75 in, its bottom 47.97 down, R13.10), the active area's corners (R10.47).
- **Spec** (support.apple.com/148591): 249 g; the same three cameras as the 18 Pro (13 mm ƒ/2.2 120°, 24 mm ƒ/1.48
  to ƒ/4.0, 100 mm ƒ/2.8).

## Measured

`node iphone/models/iphone-18-pro-max/measure.ts`: 83 ✓, 2 ≠ (known, with the reason), none ✗: 34 lines for the part (32 ✓, the
2 ≠), 51 for the rear mic (at 4800 dpi), Section T-T and MagSafe, six of those negative controls (the mic's scan where
nothing is drawn; 11.53 read as the inner apex; "to cover glass" read from the back plate; the clear circle off the
product centre, as the 17 Pro's; the zone's top on the plateau's edge, as the 17 Pro's; the zone's arc centred on the
clear circle).

- **island length** reads 12.40: on the island's centre row, the only row the family's procedure reads, the island's
  own dash-dot centre line runs into its left end (a 44 px run) and the run picked is the next dash. The 15.68
  extension lines are 15.68 apart at 1200 dpi; on rows 0.26 and 0.49 off the centre the ends give 15.66 to 15.71 once
  the chord's shortening is added back.
- **bottom view thickness** reads 8.57: the front outline is drawn with a 13 px pen (the back's 6), as on the 18 Pro.
  Its inner and outer edges lie 8.29 and 8.85 from the back's middle: 8.75 falls inside the stroke.

Choices: the camera area's sides crossed 28 in, the bottom view's row 1.75 toward the front (as the 17 Pro Max's), and
only the active area's top two corners: the bottom-left's diagonal runs along a hatch line, and on the bottom-right's
a hatch line crosses the arc (a 9 px run reading 10.67 where the top two read 10.47).

The overlays: Detail D 111 red pixels (hairlines on the camera area's outline, and the phone's side past Detail D's
boundary; none at the rear mic, whose circle lies on the drawn outer one), the front view 136 (hairlines where the active area's corners meet its sides), the bottom view 764 (the flat
band's edges and the plateau's end seen from below, which the drawing doesn't draw). The audit: 0 degenerate, warped,
concave or inconsistent; 0 bad conditional lines.

## What it taught

- A Max a year on is two drawings merged: the 17 Pro Max's body line for line, the 18 Pro's camera details number for
  number. Each still needed its own regions: the sheet is laid out as the 17 Pro Max's but its views sit 0.5 to 3 px
  apart at 1200 dpi, and the old front-view origin put the island 0.09 off centre.
- A double outline makes a corner radius a choice between two lines: before the outlines were re-measured the inner
  one's corners read 9.60 (the 17 Pro Max's sides, 0.04 off), after it 9.44. Listing every crossing on each diagonal
  settles which line is which: from the inner outline's sharp corner the outer crosses at 8.93 and the inner at 9.45,
  at all four corners.
- A note can be copied from the line above it: the second 2.56 lands where the first does.
- A number printed on one sheet settles a sibling's: the 18 Pro's T-T leaves the base undimensioned and draws its lines
  0.10 short of its 14.00; this T-T prints 11.53 on the plateau's top and draws the kinks at 13.99, the apexes where the
  printed numbers put them.
