# iPhone 12 Pro Max

The iPhone 12 Pro Max from Apple's dimensional drawing (`../../drawings/iphone-12-pro-max.pdf`, dated
10/13/20, not in the repository), built by the family's builder (`../../`). Sheet 1 is the iPhone 12 Pro's
(`../iphone-12-pro/`) view for view: the same thickness, edge profile, notch, receiver, port and button sizes, placed
for a 78.07 x 160.84 body. Detail D has three cameras, the flash and a rear mic in the 13 Pro Max's places. Sheet 2
(drawn turned a quarter) gives the keepout cones (Sections F-F, G-G, H-H), Detail J the LiDAR scanner ("rear camera 4"),
and its right-hand back view MagSafe's keepouts.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF (the family's scans need no choices), and checks the rear mic, Section G-G and the MagSafe view against what's drawn (73 ✓) |
| `part.ts` | the drawing → `iphone-12-pro-max.dat` and `features.json` |
| `check.ts` | the part laid over Detail D, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **The body:** 78.07 x 160.84 x 7.39; glass 75.97 x 158.74; active area 71.13 x 153.90, 3.47 in all round. Detail
  A's corner: 0.00, 0.14, 1.16, 3.61, 7.26, 11.54, 15.96 each way, paired symmetrically about the diagonal as the 12
  Pro's. Detail B's edge profile is the same as the 12 Pro's, number for number.
- **The 12 Pro's, moved:** the 34.83 notch (5.32 deep from the active area's top, against the 12 Pro's 5.30; R0.95,
  R3.80), the receiver (7.84 x 1.38 at -5.49, centred on 39.04), the button sizes (ring/silent 33.34, volume 46.65 and
  60.65, side 53.65, all 3.69 from the back), the SIM tray (88.67, 2X 8.02, 2.66), Lightning (port 34.66 to 43.42 by
  3.01, keepout 13.65 x 6.85, centred 39.04 and 3.69 from the back), the screws (32.64, 45.43).
- **The SIM tray's depth is dimensioned here:** 3.69 from the back's line to the tray's centre line (the 12 Pro's
  sheet only gives 1.33, edge to centre).
- **The bottom holes:** ten, four left of the port (20.20 to 28.42) and six right (49.66 to 62.38). The extension
  lines meet the end holes' outer edges at 1200 dpi, and the spans fit the family's 2.255 pitch (2.257, 2.254) only
  when read as outer edges.
- **Detail D:** the bump's outline runs 1.70 to 40.18 across and -1.70 to -42.63 down (38.48 x 40.93). Its top runs 5.06 to
  36.82 and -5.06 to -39.27 (31.76 x 34.21), concentric with the outline. The plateau stands 1.26 above the back glass and
  the lens rings 2.79 (3X). Cameras 1 and 2 sit at 13.43 across (-13.43 and -30.90 down), camera 3 and the flash at 28.56
  (-22.16 and -10.11). The rings are 3X Ø14.11 and the flash Ø6.28.
- **The rear mic:** Ø1.15 at 33.69 across and -30.89 down (the 33.69 extension line rises from below Detail D to the
  mic, the -30.89 line leaves it to the right; camera 2's -30.90 is a line of its own). The Ø1.15 leader lands on the
  outer of two drawn circles. Its centre is on the bump's flat top, 5.58 from the top's corner centre (R8.70), so it is
  drawn flush there. `measure.ts` finds the drawn circle at (33.690, 30.890), Ø1.14, and nothing at the swapped
  reading (30.89, 33.69).
- **Cameras, by their keepout cones (sheet 2):** camera 1 is the Telephoto (39°, apex 1.59 from the screen), camera 2
  the Main (82°, 5.91) and camera 3 the Ultra Wide (130°, 7.66). This is the reverse of the 12 Pro's order for cameras
  1 and 2, and the same as the 13 Pro Max's.
- **The LiDAR scanner:** Detail J gives the base of its 80° cone on the plateau: 5.09 x 8.09 with 4X R2.23 corners, at
  (28.56, 34.17), drawn as dimensioned.
- **Scaled** (re-measured by `measure.ts`): the lens windows (Ø10.66, all three), the bump's corners (outline 12.0,
  top 8.7, the same at all four corners from either guess) and the active area's corners (8.83; the 12 Pro's 7.83
  doesn't carry over). Detail D is drawn at 57.52 px/mm at 1200 dpi, the front and bottom views at 23.00.
- **Spec** (support.apple.com/111874): 228 g; the Ultra Wide's ƒ/2.4 and 120°; the Wide's ƒ/1.6; the Telephoto's
  ƒ/2.2; 2.5x optical zoom in. **Third-party:** the Main's 26 mm and the Telephoto's 65 mm; the 4032 x 3024 still.
- **Assumed, for a render:** the depths of the holes, the port and the receiver.
- **The flash's keepout (Section G-G, features.json only):** 135° inner and 157° outer cones. The 7.35 "origin" runs
  from the cover glass (the front face) to the inner cone's apex, 0.04 inside the back glass, and the 11.62
  "transition" to the kink where the inner cone turns into the outer, 2.97 above the bump's top. Fitted to the drawn
  lines: apex 7.36, kinks 11.62 and 11.63, angles 135.1° and 157.0°. Hand calculation: the inner cone is
  2 x (8.65 - 7.35) x tan 67.5° = Ø6.28 at the bump's top, the flash's Ø6.28, so the cone leaves the phone at the
  flash's edge (as on the 12 Pro). Read from the back glass it would be Ø41.6 there (the negative control).
- **MagSafe (sheet 2's right-hand back view, features.json only):** a clear Ø57.50 circle round the product centre
  (39.04, -80.42), and the magnetic zone. The zone runs the full width from -47.18 down, straight-sided to -110.68, and
  is closed by an R49.39 arc. The arc's centre, derived from those corners (110.68 - √(49.39² - 39.035²) = 80.42), is
  the product centre, as on the 12 and 12 Pro. `measure.ts` calibrates the view on its extension lines (36.64 px/mm),
  fits the circle (Ø57.52 at 39.03, 80.42) and finds the zone's top and arc where they're dimensioned. The zone's top
  is 4.55 below the bump's bottom (-42.63); the 12 Pro's is 2.50 below its own. Recorded in drawing.ts but not built:
  the camera corner's keepout (0 to 40.18 across, the bump outline's far side, and 0 to -47.18 down; full product
  volume), and the compass (72.40, -12.09; its size isn't dimensioned).
- **Not modelled:** the front view's 1.15 to the start of the flat (Detail B reaches its top at 0.95; recorded as
  `flatFrom`); sheet 2's metal and antenna keepout areas (the middle back view and the side view).

## Overlays

- **Detail D** (684 red px): the LiDAR window, which comes from sheet 2 and isn't drawn in Detail D, and the phone's
  edges outside Detail D's dashed circle, where the drawing is clipped. The bump's outline and top, the rings and the
  flash are black, and so is the rear mic's circle, on the drawn outer circle.
- **Front view** (0 red).
- **Bottom view** (122 red px): below the back. The drawing rounds the lens rings' top corners and sweeps the bump's
  flank in a fillet; the part has square rings and a straight flank. The heights (1.26, 2.79) are black.

## What it taught

- **A callout box sits just above the phone again.** Detail A's dashed box is 1.07 above the front view's top edge
  (the 13 Pro Max's trap). Here the first guess at the view's origin was 0.8 mm low, and the family's scan found the
  wrong top: 22.85 px/mm down against 23.00 across. Probing the column put the product edge at 188.5 px, and with that
  every front check passes.
- **Don't carry scaled values across siblings.** The notch, receiver and profiles are the 12 Pro's, but the corner
  radii aren't: the active area's corners read 8.83 at all four from the 12 Pro's 7.83 guess, and the bump's read
  12.02 and 8.69 from 11.0 and 7.6. A radius that reads the same from two guesses and at all four corners is the arc,
  not a hatch line.
- **A datum line can have gaps.** On the MagSafe view, the 0.00 extension line is broken from about 2.2 to 3.6 mm above
  the phone. A scan row placed there picked up the next line along (a leader at 7.79) and put the scale 11% out. Four
  of the checks failed together, which gave it away. The scan row now sits 4.5 above the phone.
- **The camera order follows the size, not the year.** The 12 Pro Max's camera 1 is the Telephoto, as on the 13 Pros;
  only the 12 Pro puts the Main there.
