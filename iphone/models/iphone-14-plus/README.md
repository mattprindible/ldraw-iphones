# iPhone 14 Plus

The iPhone 14 Plus from Apple's dimensional drawing (`../../drawings/iphone-14-plus.pdf`, dated
2022-09-21, not in the repository), built by the family's builder (`../../`). It's the iPhone 14 drawn larger
(78.07 x 160.84 x 7.80, every button, the port and the holes on the mid-plane), but lettered as the 15s, not as the 14:
Detail D is the corner and the receiver, B the edge profile, C the Lightning port, A the back; sheet 2 has the keepout
sections (L-L, M-M, N-N), Detail F, where they cut, and the MagSafe view.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF, with the 14's receiver scan and Detail D's corner and receiver readings; checks the rear mic, Section N-N (and L-L's and M-M's faces) and the MagSafe view |
| `part.ts` | the drawing → `iphone-14-plus.dat` and `features.json` |
| `check.ts` | the part laid over Detail A, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **Shared with the 14:** Detail B's profile (but 3.55 for its 3.54), the bump's heights (1.85 to its top, 3.42 to the
  lens glass) and its top's size (30.09), Ø14.38 rings, the Ø6.28 flash, the receiver's cutout (11.95 x 1.38 at -1.74),
  the buttons, the pocket. Different: the corner, the bump's outline (1.28 to 36.57 on both axes, 2.60 outside its top
  all round), the cones, ten bottom holes (4 + 6), the port's keepout (13.65, R3.40), the SIM tray (110.70).
- **Cameras, by their keepout cones (sheet 2):** camera 1 the Ultra Wide (L-L, 129.61°, enclosing its 120°), camera 2
  the Main (M-M, 80.25°, enclosing its 26 mm's 79.5°). Detail F draws L-L through camera 1 and M-M through camera 2.
- **The corner isn't symmetric:** 17.32 along the top, 15.96 down the side, the middle cross at (4.10, 3.14), 0.68
  off the diagonal. Every label sits where its leader lands (the leaders scale 46.09 px/mm, each within 0.01). Detail D
  gives no point on the diagonal, so the builder's halves meet at the outline's crossing of it, scaled at 4800 dpi: 3.61.
  The outline from the middle cross to there runs at 43.8°, so the builder's 45° start fits it and the curve passes
  through all seven printed points.
- **Holes dimensioned to their outer edges**, as on the 13s and the 14: 20.16 to 28.46 and 49.62 to 62.42 fall on the
  2.255 pitch only as edges (2.257, 2.254). The screws are 6.395 either side of the port's centre (39.035).
- **Scaled** (re-measured by `measure.ts`): the lens windows (Ø11.70), the bump's corners (outline 11.50, from 11.58,
  11.51, 11.44; top 8.90), the active area's corners (8.90; the 14's 7.85 would be 1 mm off), the receiver slot
  (11.00 x 0.73), the corner's diagonal point (3.61). Detail D, at twice the front view's scale, checks the slot: 11.005
  long and 0.76 high between its strokes' middles, centred 1.747 down.
- **Known discrepancy:** Detail A's camera centres give 46.18 px/mm down against 46.08 across (camera 2 drawn 0.02 mm
  low of camera 1); the bump top's lines give 46.095 both ways. Recorded as known in `measure.ts`.
- **Inferred:** camera identities; the holes between each group's ends evenly spaced; the screws on the holes' line;
  round button and port ends.
- **Spec** (support.apple.com/111854): 203 g; Ultra Wide 13 mm ƒ/2.4 120°; Main 26 mm ƒ/1.5. The US spec page lists the
  phone as eSIM only; the drawing still draws the SIM tray, so the part has it.
- **Assumed, for a render:** the depths of the holes, the port and the receiver.
- **Rear mic:** Ø2.10 at 11.29 across (the ordinate below Detail A, its extension line rising to the mic's centre) and
  26.56 down (the line running in from the left), on the bump's top (2.11 from the centre of its top's bottom-left R8.90
  corner), so it's drawn flush there. Three concentric circles are drawn (Ø2.39, 2.06 dashed, 1.66) and the leader's arrow lands on
  the outer, as on the 14; the printed 2.10 matches the dashed one and is taken as printed (the outer recorded as known).
  Swapped (26.56 across, 11.29 down) no circle is drawn: the negative control.
- **Sheet 2's sections draw the phone 0.50 thinner** (a finding): N-N's back glass beyond the bump is drawn 7.29 from
  the section's front face, its bump glass 9.15 and camera 2's ring 10.72 (sheet 1's 1.85 and 3.42 beyond it), on a
  7.30 body where sheet 1 and the spec give 7.80; L-L and M-M draw the same body. The 14's N-N is this one 0.50
  further out, number for number (7.80, 9.65, 11.22; its flash keepout 9.55 and 11.61, this one's 9.05 and 11.11).
- **Flash keepout (N-N), features.json only:** an inner 112.01° cone from the strobe (drawn 0.10 under the bump's glass,
  where 9.05's arrow lands: the cone's base, not its apex) turning into a 157° outer cone at 11.11. Both are measured on
  the section's 7.30 body, so each is carried onto the real phone by where it stands from the back glass: the
  transition 11.11 + 0.50 = 11.61 from the front (the 14's exactly). Taken as printed from the real front, the strobe
  would sit 0.60 inside the bump's glass and the transition 1.46 beyond it, where the section draws 0.10 and 1.96. The
  apex (7.53) and the base's Ø5.99 are derived, as on the 14, from the cone through the flash's Ø6.28 edge at the
  bump's top; the drawn lines cross 7.51 (on the real phone), the drawn cone 0.05 wider. Taken as circular (one section).
- **The cameras' cone apexes are left as printed, from the real front** (8.51, 8.76; the 14's 8.48, 8.75), though L-L
  and M-M are drawn on the same 7.30 body: read the flash's way they'd be 9.01 and 9.26. Read from the real front, the
  Ultra Wide's 129.61° cone meets the ring's top (11.22) at Ø11.5, near its Ø11.70 window; read the other way, at Ø9.4. Not
  settled by the drawing: a question for a second source.
- **MagSafe, features.json only:** the clear Ø57.50 circle round the product centre (39.04, -80.42), and the magnetic
  zone: the full width from 40.21 down (the camera corner's keepout's bottom: not dimensioned here, so scaled; the 14
  dimensions its 40.12), straight-sided to 115.52, closed by an R52.49 arc whose centre (derived: 80.43) is the product
  centre, not 3.10 below it as on the 14 and the 16. The camera corner (36.57 across) and the compass (66.36, -9.88)
  are recorded in drawing.ts, not built.
- **Not modelled:** the front sensor keepouts (Detail E), the antenna keepouts (sheet 3), the other metal keepouts of
  sheet 2.

## Overlays

Red pixels: Detail A 158 (the part's side and glass edge running on below where Detail A stops drawing the phone, a
button stub at the bottom-left, a few anti-aliased pixels), front view 44 (anti-aliasing at the button ends and the
active area's top-left corner), bottom view 122 (the bump's fillet, which the builder draws as a straight slope, and
the volume buttons seen end on).

## What it taught

- Lettering isn't stable even between siblings: the 14 Plus is the 14's design but lettered as the 15s (D the corner, A
  the back). Read each sheet's own labels before copying regions and names.
- Copied scaled values have to be re-measured: the 14's active-area radius (7.85) and bump outline radius (10.86) are
  each about 1 mm off here (8.90, 11.50).
- The 14's receiver scan needed one change: here the slot's top stroke meets the glass edge at 75°, so the slot's pen
  is read at 30° to 60°. Detail D, drawn at twice the scale, then confirmed the slot to 0.005.
- A section can be drawn on a different body from the plan views: check its faces against sheet 1 before reading its
  "to cover glass" numbers. Here every face lands 0.50 nearer the section's front than sheet 1 puts it, and the flash's
  numbers only make sense (the strobe 0.10 under the glass, as on the 14) measured on that body.
