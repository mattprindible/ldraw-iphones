# iPhone 12

The iPhone 12 from Apple's dimensional drawing (`../../drawings/iphone-12.pdf`, dated 10/13/20, not in
the repository), built by the family's builder (`../../`). Drawn as the 12 mini (`../iphone-12-mini/`), on the
13s' plan and lettering: Detail A the corner and the receiver, B the edge profile, C the Lightning port, D the back;
sheet 2's Section F-F the cameras' keepout cones. Two cameras in one column, the flash and a rear mic beside them.
Sheet 2 (drawn a quarter turn round on its page) also gives the flash's keepout (Section G-G) and MagSafe's keepouts on
the back; the PDF has no sheets 3 or 4.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF, with two scans of its own, and checks the rear mic, Section G-G and the MagSafe view against what they draw (70 ✓, 2 ≠ with their reasons) |
| `part.ts` | the drawing → `iphone-12.dat` and `features.json` (with the flash's keepout and MagSafe's) |
| `check.ts` | the part laid over Detail D, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **Dimensioned:** the body (71.52 x 146.71 x 7.39), the corner (Detail A: 0.13, 1.07, 3.31, 6.66, 10.59, 14.64) and
  edge (Detail B, the 12 mini's number for number) profiles; the bump's outline (3.43 to 34.13 across, -3.43 to -36.30
  down) and top (5.37 to 32.19, -5.37 to -34.37); both cameras (12.73 across; -12.73, -27.01 down; Ø12.10); the flash
  (25.28, -19.87, Ø5.66); the rear mic (25.28, -12.28, Ø2.40); the notch (34.83, 5.30 below the active area's top); the
  receiver (7.84 x 1.38, centred 5.47 down, inside the notch); buttons, SIM tray, eight bottom holes, two screws, the
  port (31.54 to 39.99) and its keepout (13.65 x 6.85, centred 3.67 from the back).
- **Scaled** (re-measured by `measure.ts`): the lens windows (Ø9.68), the bump's corners (outline 9.57, top 7.64), the
  active area's corners (7.83).
- **Calibration:** as on the 12 mini, the cameras share a column, so the dimensioned flash centre joins them as a
  calibration point for the re-measurement. Detail D is drawn at 57.49 px/mm (1200 dpi); the cameras put the scale
  down at 57.47–57.51, the bump's long sides at 57.45 (0.1% apart; 57.49 passes both checks).
- **Inferred:** camera 1 (upper) is the Ultra Wide (131° cone over its 120°; camera 2's 82° the Main's ~80°); the SIM
  tray's depth (the sheet dimensions only its 2.66 width and 1.33 to its centre line, drawn at mid-thickness: 3.695);
  the holes between each group's ends evenly spaced (2.255 in both groups, as drawn); the screws on the holes' line.
- **Spec** (support.apple.com/111876): 164 g; the Ultra Wide's ƒ/2.4 and 120°; the Wide's ƒ/1.6. **Third-party:** the
  Main's 26 mm; the 4032 x 3024 still.
- **Rear mic** (`rearMic`, drawn flush on the bump's top, 1.03 inside the top's corner centre: well clear of the
  slope): Ø2.40 at 25.28 across (the 2X 25.28 extension line runs down through the mic's and the flash's centres),
  12.28 down (its extension line leaves the mic's centre). `measure.ts` finds the drawn circle there (25.271, 12.289);
  Section G-G, cut down the same column, draws the mic's opening in the bump's top 7.595 above the flash's axis
  (19.87 - 12.28 = 7.59). The drawn outer circle is a heavy line (0.36 wide) whose middle is Ø2.23 (G-G's opening
  2.26 long): Ø2.40 lies inside the stroke, toward its outer edge, and the back overlay's circle lies on that edge.
- **Flash keepout** (`flash.keepout`, features.json; Section G-G): the 12 mini's, number for number: a 135° inner cone
  from its apex 6.94 from the cover glass, turning at 10.96 into a 157° outer cone. Both distances run from the
  section's left face, the front: its other face lies 8.12 away over the bump (7.39 + 0.73) and 7.39 beyond it; the
  6.94 line ends at the apex and the 10.96 line at the kinks, which `measure.ts` finds by crossing the cone's fitted
  lines (6.944; 10.962 and 10.959), with the angles as drawn (134.9°, 157.0°). Hand check: at the bump's top the inner
  cone is Ø5.70, the flash's Ø5.66: the apex sits 1.18 under the flash's surface.
- **MagSafe** (`magsafe`, features.json; sheet 2's right-hand back view): the clear area a whole Ø57.50 circle round
  the product centre (35.76, -73.35), 7.01 inside each edge (no straight sides, unlike the 12 mini's), fitted Ø57.487
  at (35.757, 73.351); the magnetic zone the full width from -40.12 (the camera corner's keepout's bottom, 3.82 below
  the bump's) down, straight-sided to -107.42, closed by R49.39, whose derived centre (73.353 down) is the product
  centre, as the arc scales (lowest 122.71 against 122.74).
- **Not in the fields** (drawing.ts, `magsafeExtras`): the camera corner's keepout above the zone (0 to 35.44 across, 0
  to -40.12 down: no magnetic or permeable material, full product volume including sidewalls) and the compass (65.26,
  -11.09). Sheet 2's middle back view and side view give metal and conductive-material keepouts, not recorded.
- **Assumed, for a render:** the depths of the holes, the port and the receiver.
- **Not modelled:** the antenna lines; the camera corner's keepout, the compass and the conductive-material keepouts
  (above).

## What it taught

- **The family's notch row can land on the crosshatch.** The cutout's straight wall runs only 0.55 (4.42 to 4.97 below
  the top, between its R0.95 and R3.80), and a line of the crosshatch meets the left wall on the family's row (1.5 below
  the active area): one 20 px run read 35.07 for 34.83. 1.2 below, the walls read 34.83. Recorded as known, with this
  model's own scan beside it.
- **The family's corner scan passes over lines by value, not axis.** On the bump top's bottom corners the arc crosses
  the diagonal 32.15 down, which is within 4 px of the top's right side (32.19 across): the crossing is taken for that
  line and passed over (2.94 and 10.54 read). Filtering by axis, all four corners read 7.63–7.66. Known, with its own scan.
- **One drawing gives two port depths:** Detail C puts the port's centre line 3.67 from the back, the bottom view the
  holes' 3.69 (the 12 mini's sheet says 3.69 for both). Both recorded as drawn.
- The SIM tray loses its "from back" dimension: its 1.33 is half its width, edge to centre line.
- **A sheet can be drawn turned on its page.** Sheet 2's views read bottom to top; the family's `Region` has no
  rotation, so `measure.ts` turns each crop upright itself (`upright`) and the regions' calibrations are in the turned
  crop. The two sections' and the MagSafe view's own lines (the bump's face at 8.12, the back glass at 7.39, the product
  centre's lines) check the turned calibrations.
- **A drawn circle can be smaller than its dimension.** The rear mic's Ø2.40 leader lands on a heavy circle whose middle
  is Ø2.23, and the section's opening is 2.26 long: the dimension is kept; the stroke covers the difference.
