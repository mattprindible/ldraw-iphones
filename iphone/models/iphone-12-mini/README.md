# iPhone 12 mini

The iPhone 12 mini from Apple's dimensional drawing (`../../drawings/iphone-12-mini.pdf`, dated
10/13/20, not in the repository), built by the family's builder (`../../`). Drawn on the 13s' plan and lettered as
the iPhone 13's (Detail A the corner, B the edge profile, C the Lightning port, D the back; sheet 2's Section F-F the
cameras' keepout cones), but its two cameras stand one above the other, with the flash and a rear mic beside them.
Sheet 2 also gives the flash's keepout (Section G-G) and MagSafe's keepouts on the back; the PDF has no sheets 3 or 4.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF, and checks the rear mic, Section G-G and the MagSafe view against what they draw (71 ✓) |
| `part.ts` | the drawing → `iphone-12-mini.dat` and `features.json` (with the flash's keepout and MagSafe's) |
| `check.ts` | the part laid over Detail D, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **Dimensioned:** the body (64.21 x 131.50 x 7.39), the corner (Detail A) and edge (Detail B) profiles, the bump's
  outline (1.67 to 30.76 across, -1.67 to -33.95 down: 3.19 taller than wide) and top (3.61 to 28.82, -3.61 to -32.01),
  both cameras (10.67 across; -10.67 and -24.95 down; Ø12.10), the flash (22.21, -17.81, Ø5.66), the rear mic (22.21,
  -10.22, Ø2.40), the notch (34.83 wide, 5.30 below the active area's top), the receiver (Detail A: 7.84 x 1.38,
  centred 5.45 down: inside the notch, not on the glass's edge), the buttons, the SIM tray and the bottom openings.
- **Scaled** (re-measured by `measure.ts`): the lens windows (Ø9.68), the bump's corners (outline 9.30, top 7.35), the
  active area's corners (6.76; the bottom-left corner's diagonal runs along a line of the crosshatch and is passed over).
- **Calibration:** the cameras share a column, so across they give no scale; `measure.ts` adds the dimensioned flash
  centre as a third calibration point for the re-measurement only (the part is built from `phone` as it is).
- **Inferred:** camera 1 (upper) is the Ultra Wide (its 131° cone encloses 120°; camera 2's 82° the Main's ~80°; its
  apex is the deeper, 5.01 against 6.20); the holes between each group's ends are evenly spaced (2.25), as drawn; the
  screws lie on the holes' centre line; round port ends.
- **Spec** (support.apple.com/111877): 135 g; the Ultra Wide's ƒ/2.4 and 120°; the Wide's ƒ/1.6. **Third-party:** the
  Main's 26 mm; the 4032 x 3024 still.
- **Rear mic** (`rearMic`, drawn flush on the bump's top): Ø2.40 at 22.21 across (the 2X 22.21 extension line runs
  through the mic's and the flash's centres), 10.22 down; `measure.ts` finds the drawn circle there (22.210, 10.227,
  Ø2.400) and the back overlay's circle lies on the drawn outer one.
- **Flash keepout** (`flash.keepout`, features.json; Section G-G): a 135° inner cone from its apex 6.94 from the cover
  glass, turning at 10.96 into a 157° outer cone, as the 12 Pro's. Both distances run from the section's left face,
  the front: its other face lies 8.12 away (7.39 + 0.73, the bump's top); the 6.94 line ends at the apex and the 10.96
  line at the kinks, which `measure.ts` finds by crossing the cone's fitted lines (6.945; 10.945 and 10.969), with the
  angles as drawn (135.0°, 157.0°). Hand check: at the bump's top the inner cone is Ø5.70, the flash's Ø5.66: the apex
  sits 1.18 under the flash's surface and the cone leaves through the window's edge.
- **MagSafe** (`magsafe`, features.json; sheet 2's back view): the clear area round the product centre (32.11, -65.74)
  as a Ø57.50 circle (2X R28.75: both arcs fit one circle there, Ø57.498); the magnetic zone the full width from
  -33.95 (the bump's bottom) down, straight-sided to -103.28, closed by R49.39, whose derived centre (65.75 down) is the
  product centre (unlike the 16's), as the arc scales (lowest 115.13 against 115.14).
- **Not in the fields** (recorded in drawing.ts, `magsafeSides`): the clear area is cut by straight sides 5.36 in from
  each edge, from -55.66 to -75.82. Sharp corners where the circle meets them would fall at 55.19 and 76.29: the
  dimensioned ends are the tangent points of undimensioned blends (R2.41 puts them there; the 4800 dpi trace follows
  the blend to 0.005 RMS, a sharp corner 0.026). Also the camera corner's keepout above the zone (0 to 32.11 across,
  0 to -33.95 down: no magnetic or permeable material, full product volume including sidewalls) and the compass
  (58.47, -8.83). The zone's note on this drawing says "metal or permeable material except MagSafe magnets"; the
  builder's fixed note says "magnetic or permeable".
- **Assumed, for a render:** the depths of the holes, the port and the receiver.
- **Not modelled:** the antenna lines; MagSafe's straight sides, the camera corner's keepout and the compass (above).

## What it taught

- The family's back-view calibration needs two cameras apart in each axis; a single column of cameras gives none
  across. A dimensioned flash centre serves (`withFlash` in `measure.ts`), but the shared code has no place for a
  calibration point that isn't a camera.
- The hole groups are dimensioned to their outer edges, as on the 13s: half a hole in, both groups fall on the 2.255
  pitch; read as centres the left pair would be 3.71 apart.
- The edge profile's half-height (3.62) falls 0.075 short of half the thickness (3.695), as the 13s' does (3.75 for
  3.825).
- Section F-F's labels sit where their cones are (camera 1 the upper, 131°), unlike the 13 mini's.
- A keepout dimension's ends can be checked without reading its label: crossing the section's own lines (the cone's
  apex and kinks) and the far face (the bump's top at 8.12) settles both what 6.94 and 10.96 span and that "to cover
  glass" is from the front.
- A dimension that lands 0.47 off where two drawn curves meet isn't necessarily wrong: MagSafe's straight sides end at
  the tangent points of blends the drawing never labels. Telling a blend of R2.4 from a sharp corner at a 21.5° crossing
  takes 4800 dpi (the two differ by under 0.05 mm).
