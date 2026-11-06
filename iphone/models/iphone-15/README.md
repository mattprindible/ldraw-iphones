# iPhone 15

The iPhone 15 from Apple's dimensional drawing (`../../drawings/iphone-15.pdf`, not in the
repository), built by the family's builder (`../../`). The 13s' two diagonal cameras and ring/silent switch, with
the 15 Pro's Dynamic Island and USB-C. Its details are lettered differently from the 15 Pro's: A the back, B the edge
profile, C the port, D the corner with the island and the receiver.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF, and Detail D's calibration on the corner's own leaders; checks the rear mic (at 4800 dpi), the flash's keepout section (J-J) and MagSafe's keepouts against what the drawing draws |
| `part.ts` | the drawing → `iphone-15.dat` and `features.json` |
| `check.ts` | the part laid over Detail A, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **Cameras, by their keepout cones (sheet 2):** camera 1 the Ultra Wide (121.83°, its 120°), camera 2 the Main
  (75.55°, narrower than a 26 mm lens's 79.5° diagonal). Apple's spec page (support.apple.com/111831): 171 g, 13 mm
  ƒ/2.4 and 26 mm ƒ/1.6.
- **The corner** (Detail D) gives eight points and none on its diagonal, where the builder joins its two halves: the
  outline's crossing of the diagonal is scaled, 3.64 (a circle through the four nearest crosses gives 3.63).
- **The edge profile** (Detail B) rounds past the glass's edge onto the front to the front view's 2.41 (TO START OF
  FLAT AREA ON TOP SIDE), so the front face starts there, as the 16 Pro's. The back is assumed to step to its glass at
  1.00 after the profile's last point (0.81 in), as the 15 Pro's: the bump's outline, 1.22 in, needs a flat back, and
  the 2.41 is the top side's only.
- **The receiver** (0.59 about -1.17) lies on the curved edge outside the modelled face, so it isn't drawn; its length
  isn't dimensioned (its keepout, Detail E, is 14.40 x 0.75).
- **The bottom holes** are dimensioned to their centres: both groups' spans are whole multiples of 2.255 only so.
- **Rear mic** (Detail A): Ø2.10 at 11.47 across, 26.90 down (11.47 is the ordinate below the view whose extension
  line rises to the mic's centre; the -26.90 line runs in to it), flush on the bump's top (2.06 from its R9.03
  corner's centre). Two concentric circles are drawn, Ø2.10 and 2.40; the Ø2.10 leader's arrow lands on the inner one
  (measured: the ink runs unbroken from it outward on the arrow's rays), so the number and the arrow agree. The outer
  ring (scaled, `rearMicRing`) isn't built.
- **The flash's keepout** (sheet 2, Section J-J, features.json only): the 14's N-N again. An inner cone of 112.01°
  turning into a 157° outer cone at 11.62 from the front. J-J is the only section through the flash (down the phone),
  so the inner cone is taken as circular. 9.56 FLASH KEEPOUT CONE TO COVER GLASS reaches the strobe's face, 0.10
  under the bump's glass (9.66), between the inner cone's corners: the cone's base, not its apex (kept as
  `flashKeepoutBase`; the field has no place for it). "To cover glass" is from the front: the arrows start on the
  section's front face, and the back glass (7.81), bump glass (9.66) and camera 2's ring (11.29) read from it.
  **Derived:** the apex, 7.54 from the front (the 112.01° cone through the flash's Ø6.28 at the bump's top; the drawn
  lines cross at 7.53), and the base Ø5.98 at 9.56 (drawn 5.99).
- **MagSafe** (sheet 2, features.json only): the clear circle Ø57.50 at the product centre (35.81, -73.82); the
  magnetic zone the full width from its top edge down, straight-sided to -110.93, closed by an R49.39 arc whose centre
  (derived, 76.92 down) is 3.10 below the product centre, as the 14's. **Scaled:** the zone's top edge, 40.58, isn't
  dimensioned on this drawing (the 14 prints its -40.12): read on two columns at 1800 dpi, 3.43 below the bump's
  outline. Beyond the fields (`magsafeExtras`, not built): the camera corner's keepout (to 37.15 across, down to the
  zone) and the compass (64.96, -8.82).
- **Not modelled:** the antenna lines.
- **The right side view's 7.81 is labelled PRODUCT WIDTH** but spans the thickness (Apple's spec: 7.80).

## What it taught

- **Calibrate on thin lines, not a feature that may be drawn off.** Calibrated on the island (20.68 x 6.07), Detail D
  put the corner's leaders 0.03 to 0.05 off their values and the diagonal point at 3.66; calibrated on the twelve
  leaders themselves (each within 0.01 of its value), the island checks to 0.013 and the diagonal reads 3.64.
- **A profile point at exactly half the thickness** (2.41, 3.905) made the builder take the face for a ring in the
  curve and look for one beyond it; the builder now leaves the faces' stations out.
- The bottom view draws the phone 7.68 thick for 7.81, as the 15 Pro's draws 8.12 for 8.25.
- **The same circles, read again per drawing.** The 14's Ø2.10 mic arrow lands on a 2.39 ring; here it lands on the
  Ø2.10 circle itself. Which circle an arrow touches is a measurement (the ink between the circles on its rays), not
  something to carry over from a sibling.
- **A sibling's number may be missing.** The MagSafe zone's top is printed on the 14 (-40.12) and not here: it is
  scaled (40.58), and the bump's outline on the same columns (37.14 against Detail A's 37.15) checks the calibration.
