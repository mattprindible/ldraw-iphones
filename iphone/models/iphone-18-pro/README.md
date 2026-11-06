# iPhone 18 Pro

The iPhone 18 Pro from Apple's dimensional drawing (`../../drawings/iphone-18-pro.pdf`, not in the
repository, dated 2026-09-09), built by the family's builder (`../../`). The [17 Pro](../iphone-17-pro/README.md)'s
body on the same plan, with a taller plateau, larger lens rings and a shorter Dynamic Island.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF (a test when the PDF is present), and checks the rear mic, the flash's keepout section (on sheet 3's scale) and MagSafe's keepouts against the drawing |
| `part.ts` | the drawing → `iphone-18-pro.dat` and `features.json` |
| `check.ts` | the part laid over Detail D, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **The 17 Pro's, unchanged:** 71.85 x 150.01 x 8.75, the glass and active area, the corner and edge profiles (Details
  A and B, label for label), the buttons, Camera Control (98.40, 3.03 wide), the cameras' positions but camera 3's, the
  flash, rear mic and LiDAR line (58.03), the bottom edge's positions and Detail C.
- **The plateau** stands 2.78 above the back plate (the 17 Pro's 2.55), the camera glass 2.11 above it (1.88): the
  extension lines measure 2.79 and 4.90 from the back plate's, so the lens rings stand 4.89 proud. Its outline (scaled)
  sits 0.76 in from the phone's, its bottom edge 47.96 from the top with R13.10 corners; its walls round over as the
  back's edge does (assumed, as the 17 Pro's).
- **Cameras**: rings Ø16.58 (16.20), camera 3 at 32.49 across (32.36). Each is drawn with five circles (16.58, 15.28,
  14.23, 13.92, 12.84; the 17 Pro's four); the window is the innermost, 12.84, all three alike. By sheet 3's keepout
  zones: Ultra Wide (125°), Fusion (90°, 24 mm), 4x Telephoto (34°, 100 mm). The cone depths changed: 10.76 for camera
  1 (10.21), 7.81 for camera 2 (8.86), 8.43 to camera 3's Ø5.00 base (8.02). The flash and the LiDAR window are Ø6.90.
- **The front**: the island is 15.66 long (20.76), 6.07 high, its centre 7.99 from the top. No receiver slit is
  dimensioned (sheet 3's Detail M has a RECEIVER KEEPOUT strip on the top edge, and a front sensor keepout, R1.84, left of
  the island, under the display): neither is drawn.
- **The SIM tray** is centred 111.97 from the top, 2X 9.72 (19.44 long; the 17 Pro's 16.10).
- **The bottom edge**: the 17 Pro's ten hole positions, Ø1.53 (Ø1.06).
- **The rear mic** (Detail D: [2] Ø1.15 at 58.03 across, 23.99 down; the 17 Pro's Ø1.05): the 3X 58.03 line is
  across, the -23.99 line runs in to its circle from the right, its leader lands on the circle. Drawn flush on the
  plateau, between the flash and the LiDAR window; at 4800 dpi its circle centres on 58.04, 24.00, its stroke's middle
  Ø1.10 (a 0.17 pen: the printed 1.15 lies within it).
- **The flash's keepout** (sheet 3, Section T-T, the only section through the flash) is in `features.json`: an inner
  123° cone from a Ø6.65 base on the plateau's top (11.53 from the front: 8.75 + 2.78, not dimensioned here), turning at
  14.00 into a 157° outer cone; their apexes, not dimensioned, derived from the printed numbers (9.72 and 12.40). Only
  V-FOV is given: round is assumed. "To cover glass" is from the front: the 14.00's arrow starts on the front face.
  The printed numbers are taken over the drawn lines, which disagree (below).
- **MagSafe** (sheet 4) is in `features.json`, the 17 Pro's number for number: the Ø57.50 clear circle on the 35.92
  and 77.74 lines (2.735 below the product's centre, not labelled PRODUCT CENTER); the magnetic zone the full width from
  the plateau's bottom edge (not dimensioned: scaled 47.94, Detail D's 47.96) down, straight-sided to 114.73, closed by
  an R49.39 arc whose centre (80.84 down, derived) is 3.10 below the clear circle's. The compass (20.11, 145.96; the 17
  Pro's 145.48), the antenna keepouts (the U's arms from 117.77 left and 117.48 right; the 17 Pro's 117.26) and the
  view cone are recorded in `drawing.ts` only; the 17 Pro's WITHIN 1 mm OF GLASS area isn't on this sheet.
- **Spec** (support.apple.com/148590): 211 g; the Main's variable aperture (ƒ/1.48 to ƒ/4.0; the widest recorded).

## Measured

`node iphone/models/iphone-18-pro/measure.ts`: 83 ✓, 8 ≠ (known, with the reason), none ✗.

- **island length** reads 15.77: on the island's centre row, the only row the family's procedure uses, a hatch line
  meets its right end (a 14 px run for a 6 px stroke). The 15.66 extension lines are 15.65 apart at 1200 dpi, and the
  ends on rows 0.26 and 0.49 mm off the centre give 15.65 once the chord's shortening is added back.
- **bottom view thickness** reads 8.57: the bottom view's front outline is drawn with a heavier pen than the 17 Pro's
  (13 px at 1200 dpi for 9). Outer edge to outer edge less one stroke it is 8.72.
- **Section T-T** draws the 17 Pro's flash keepout moved 0.13 outward, where its printed numbers move it 0.23 with the
  plateau. At sheet 3's scale (46.07 px/mm from S-S's 10.76 and 7.81 and V-V's 8.43; T-T's own 6.65 extension lines and
  plateau top agree with it), the 14.00 line and both kinks lie at 13.90 (≠), and the drawn lines cross at 9.62 and
  12.30 (≠; the 17 Pro's 9.495 and 12.17, plus 0.13). The inner lines run on to meet the plateau 7.02 apart (≠, for
  6.65), which is 6.65 at 11.43 widened over 0.10 at 61.5°. The closing line is at 15.44 (scaled; the 17 Pro's 15.30).
  The angles (122.8°, 157.0°) and the kinks' spacing (15.73 for the printed 15.75) agree. Calibrated on its own 14.00
  line instead (45.75 px/mm), T-T would put the plateau's top at 11.61, off sheet 1's 11.53: a negative control.

The overlays: Detail D 110 red pixels (hairlines on the camera area's outline, and the phone's side past Detail D's
boundary; none at the rear mic, whose circle lies on the drawn one), the front view 68 (hairlines on the active area's corners), the bottom view 1407 (the flat band's edges
and the plateau's and buttons' ends seen from below, which the drawing doesn't draw, as on the 17 Pro). The
audit: 0 degenerate, warped, concave or inconsistent; 0 bad conditional lines.

## What it taught

- A drawing a year on can reuse a body line for line and still change the details that matter for a mount: the
  plateau is 0.23 taller and the lens rings 0.46 further proud; camera 2's keepout apex moved 1.05 toward the screen.
- A check can fail on a crossing, not on the drawing: the family's island check reads one row, and here a hatch line
  touches the island's end on it. Measured off the row, the drawing agrees with its number.
- A section's own dimension can be the one drawn wrong. T-T has a single number, so calibrating on it looks natural;
  the sheet's other sections and T-T's own base and plateau agree on a scale that puts the line 0.10 short. Its
  drawn geometry is last year's keepout moved part way. The same 11.53 and 14.00 are printed on the 18 Pro Max's T-T,
  where here 11.53 is the base on the plateau's top, not the inner cone's apex.
- Camera windows aren't drawn alike from model to model: "the innermost circle" is 13.55 of 16.20 on the 17 Pro and
  12.84 of 16.58 here.
