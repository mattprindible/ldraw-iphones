# iPhone 13 Pro

The iPhone 13 Pro from Apple's dimensional drawing (`../../drawings/iphone-13-pro.pdf`, not in the
repository), built by the family's builder (`../../`). Drawn on the 13's plan, with three cameras, a LiDAR scanner,
a bump that isn't square and flat steel sides; the front and the bottom edge are the 13's, number for number.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF (a test when the PDF is present); checks the rear mic (Detail D and Detail H), the flash's keepout sections (G-G, K-K) and MagSafe's keepouts against the drawing |
| `part.ts` | the drawing → `iphone-13-pro.dat` and `features.json` (with the rear mic, the flash's keepout and MagSafe's keepouts) |
| `check.ts` | the part laid over Detail D, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **Cameras, by their keepout cones (sheet 2):** camera 1 the Telephoto (37°, apex 2.96 from the screen), camera 2 the
  Main (85°, 7.27), camera 3 the Ultra Wide (123°, 6.69). Section G-G labels camera 3's apex "camera 1", the 13 mini's
  copy error again.
- **The bump** is 41.24 across and 42.47 down (outline; its top 35.01 by 36.24), plateau 1.68 above the back glass,
  the lens rings 3.60 (dimensioned for cameras 1 and 2; camera 3's drawn alike).
- **The LiDAR scanner** isn't drawn on the back view; sheet 2's Detail H gives the base of its 77° keepout cone on the
  plateau, a 4.06 x 7.06 stadium at (30.08, 35.35), modelled as its window.
- **The edge profile** is inferred: Detail B measures from a datum it labels 0.21 at the flat side, so each inset is
  taken less 0.21, which gives a flat to ±3.06 and then the 13 mini's rounding.
- **The rear mic** (Ø1.15, dimensioned) is drawn on Detail D but no dimension runs to its centre: its place is scaled,
  35.78 across and 32.22 down, and sheet 2's Detail H, which draws it again, agrees to 0.01 (35.77, 32.21). That's on
  the product's centre line (35.76) within the scaling, but nothing says so, so the scaled number stands. Its centre is
  on the bump's top (inside the top's R9.39 corner), so it's built flush there; the overlay's circle lies on the drawn
  one.
- **The flash's keepout** (sheet 2, Sections G-G and K-K, as the 13's): an inner cone from a Ø6.00 base on the strobe
  (drawn 0.10 under the bump's glass), turning at 11.27 from the cover glass into a 157° outer cone. The inner cone is
  112° down the phone (G-G) and 96° across (K-K): not one cone, so the features carry G-G's 112°, which encloses K-K's
  from the same base; K-K's is kept in `drawing.ts` (`flashKeepoutAcross`), not built. "To cover glass" is from the
  front: the kinks are drawn 11.27 from the screen's face (read from the back they'd be 7.65 further out). No apex is
  dimensioned: 7.21 is derived, the 112° cone through the flash's Ø6.28 edge at the bump's top; the drawn lines cross
  0.07 nearer the front, because both sections draw the bump 0.07 to 0.10 thin (9.26 and 9.23 for 9.33; camera 3's ring
  11.18 for 11.25). The printed numbers alone put G-G's kinks 12.03 apart; they're drawn 12.28 apart, which the
  thin glass accounts for (a known disagreement in `measure.ts`).
- **MagSafe** (sheet 2, the MagSafe view): the clear area a whole Ø57.50 circle round the product centre; the magnetic
  zone the full width from -43.62 (the bump outline's bottom: the camera corner's keepout ends on the bump here, 5.00
  and 2.50 below it on the 13 and 12 Pro), straight-sided to -107.42, closed by an R49.39 arc whose centre (derived) is
  the product centre, as the 12's and 12 Pro's (the 13's sits 3.10 lower). Not in the fields, recorded in `drawing.ts`:
  the camera corner's keepout (its right edge undimensioned, drawn on Detail D's 42.39) and the compass at (65.26,
  -11.09).
- **Scaled:** camera 1's ring (15.11, smaller than camera 2's dimensioned 15.53), the windows, the bump's corners
  (outline 12.50, top 9.39), the active area's corners, the rear mic's place. The flash's Ø6.28 is inferred from the 13
  Pro Max (the same bump; its circle reads the same), not dimensioned here.
- **Spec** (support.apple.com/111871): 204 g; the Ultra Wide's 120°; apertures; 3x optical zoom. **Third-party:** the
  Main's 26 mm and the Telephoto's 77 mm.

## What it taught

- A calibration found from circles needs a close guess when a lens has several concentric rings: with the scale 1.4%
  off, the circle finder took different rings on either side, and the centres came out 0.1 mm off. With it right, every
  ring is symmetric about the dimensioned centres, and the bump's long straight lines agree.
