# iPhone 13 Pro Max

The iPhone 13 Pro Max from Apple's dimensional drawing (`../../drawings/iphone-13-pro-max.pdf`, not in
the repository), built by the family's builder (`../../`). The 13 Pro on a larger body (78.07 x 160.84): the same
cameras, bump, LiDAR scanner and buttons; its own corner, front, SIM tray, port and bottom holes.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF (a test when the PDF is present); checks the rear mic (Detail D and Detail J), the flash's keepout sections (G-G, K-K) and MagSafe's keepouts against the drawing |
| `part.ts` | the drawing → `iphone-13-pro-max.dat` and `features.json` |
| `check.ts` | the part laid over Detail D, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **Nearly everything is dimensioned:** all three rings (3X Ø15.53), the flash (Ø6.28), the keepout cones (apexes
  3.10, 7.27 and 6.67; camera 3's labelled correctly here, confirming the 13 Pro's G-G label as a copy error), the
  LiDAR's window (Detail J, its ends R2.03), the edge profile (from a 0.00 datum: the 13's insets).
- **Its own:** the corner (17.32), the active area (71.13 x 153.90, its corners 8.93 scaled), the notch (26.83 by
  5.60), ten bottom holes (four and six, each group dimensioned to its outer edges), a larger Lightning port (8.72 x
  3.01), the SIM tray (80.28).
- **The receiver** is drawn only as its cutout in the glass (11.70 x 1.38 at 1.74; no inner slot), modelled 0.02
  shallower so it stays inside the glass, whose edge its top meets.
- **The rear mic** (Ø1.15 at 35.76 across, 32.21 down) is fully dimensioned on this Detail D, where the 13 Pro's gives
  only its diameter: the same mic on the same bump, and the 13 Pro's scaled place (35.78, 32.22) agrees to 0.02. Sheet
  2's Detail J draws it again at the same place (to 0.01). Its centre is on the bump's top (inside the top's R9.39
  corner), so it's built flush there; the overlay's circle lies on the drawn one.
- **The flash's keepout** (sheet 2, Sections G-G and K-K, the 13 Pro's): an inner cone from a Ø6.00 base on the strobe
  (drawn 0.10 under the bump's glass), turning at 11.27 from the cover glass into a 157° outer cone. The inner cone is
  112° down the phone (G-G) and 96° across (K-K): not one cone, so the features carry G-G's 112°, which encloses K-K's
  from the same base; K-K's is kept in `drawing.ts` (`flashKeepoutAcross`), not built. "To cover glass" is from the
  front: the kinks are drawn 11.27 from the screen's face (read from the back they'd be 7.65 further out). No apex is
  dimensioned: 7.21 is derived, the 112° cone through the flash's Ø6.28 edge at the bump's top. G-G's inner lines are
  only about 2 mm long, but the 112° dimension's extension lines carry them on (they fit 111.97°, and cross at 7.12):
  the drawn cone sits 0.09 nearer the front, because the section draws the bump's glass 0.07 thin (9.26 for 9.33;
  camera 3's ring 11.17 for 11.25). The printed numbers alone put G-G's kinks 12.03 apart; they're drawn 12.33 apart,
  0.22 of it the thin glass, and the cone drawn from the Ø6.00 base is Ø6.33 at the drawn glass, not 6.28 (both known
  disagreements in `measure.ts`). Both sections' hatching stops at an undimensioned line 14.15 from the cover glass.
- **MagSafe** (sheet 2, the MagSafe view): the clear area a whole Ø57.50 circle round the product centre (39.04,
  -80.42); the magnetic zone the full width from -47.18 (the camera corner's keepout's bottom, 3.56 below the bump
  outline's), straight-sided to -113.78, closed by an R49.39 arc whose centre (derived, 83.52 down) is 3.10 below the
  product centre, as the 13's (the 12 Pro's and 13 Pro's is the product centre). Not in the fields, recorded in
  `drawing.ts`: the camera corner's keepout (to 42.39 across, dimensioned here) and the compass at (72.40, -12.09).
- **Scaled:** the windows, the bump's corners (outline 12.53 from its one clean corner; top 9.39), the display's
  corners. **Spec** (support.apple.com/111870): 240 g; the Ultra Wide's 120°; apertures.

## What it taught

- A detail's callout box can sit just outside the part: its dashed edge, 1.06 above the phone, was first taken for
  the top edge (the foot, found on the glass's edge, kept the scale right and hid it); the active area then measured
  1 mm low.
- Detail D clips every line at its dashed boundary circle, so the part shows red beyond it on the overlay, and the
  flash's leader runs along a corner's diagonal.
- A sibling's drawing can dimension what another only draws: this sheet dimensions the rear mic the 13 Pro's leaves to
  scale, on the same bump, and confirms that scaled reading to 0.02.
