# iPhone 14

The iPhone 14 from Apple's dimensional drawing (`../../drawings/iphone-14.pdf`, dated 2022-09-21, not
in the repository), built by the family's builder (`../../`). Drawn on the iPhone 13's plan and lettered as it
(Detail A the corner and receiver, B the edge profile, C the Lightning port, D the back; sheet 2 the keepout sections),
but 7.80 thick with every button, the port and the holes on the mid-plane (3.90), and a bigger bump (lens rings 3.42
out).

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF (a test when the PDF is present), with a receiver scan of its own; checks the rear mic (at 4800 dpi), the flash's keepout section (N-N) and MagSafe's keepouts against what the drawing draws |
| `part.ts` | the drawing → `iphone-14.dat` and `features.json` |
| `check.ts` | the part laid over Detail D, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **Cameras, by their keepout cones (sheet 2):** camera 1 the Ultra Wide (L-L, 132.87°, enclosing its 120°), camera 2
  the Main (M-M, 81.99°, enclosing its 26 mm's 79.5°). L-L and M-M cut through the cameras their labels name.
- **Dimensioned:** the bump's outline (1.15 to 35.90) and top (3.21 to 33.30), the flash (26.30, 10.21, Ø6.28), the
  receiver's centre line (1.74) and its cutout (11.95 x 1.38), the notch (26.79 wide, 5.58 from the active area's top,
  R0.82 and R3.72). Detail C's 12.59 keepout's extension lines fall 0.10 inside the screws' centres, not on them.
- **The corner isn't symmetric** (15.89 along the top, 16.14 down the side; the middle cross (3.22, 3.40)). The
  builder splits a corner on its diagonal at 45°, so the cross is stood in for by (3.31, 3.31), on the 45° line through
  it; the outline passes 0.006 from the cross (`measure.ts` checks it). A point added beside the cross instead made a
  0.13 mm segment that bent tighter than the glass's 1.05 inset, and the glass ring folded.
- **Rear mic** (Detail D): Ø2.10 at 10.62 across, 25.89 down (10.62 is the ordinate below the view whose extension
  line rises to the mic's centre; the -25.89 line runs in to it), flush on the bump's top (2.09 from its R8.89 corner's
  centre). It lies on the drawn dashed circle in the overlay. **A finding:** three concentric circles are drawn there,
  Ø2.39, 2.06 (dashed) and 1.66, the 13's three (2.40, 2.07, 1.65); the Ø2.10 leader's arrow lands on the outer one
  (as the 13's Ø2.40 does), but 2.10 matches the dashed middle circle. Taken as printed; the outer circle is a known
  difference in `measure.ts`.
- **Flash keepout** (sheet 2, Section N-N, features.json only): 112.07° inner cone, 157.00° outer, the transition
  11.61 from the front. N-N is the only section through the flash (down the phone), so the inner cone is taken as
  circular (the 13's across section K-K drew it narrower). 9.55 FLASH KEEPOUT CONE TO COVER GLASS lands on the strobe's
  face (0.10 under the bump's glass, 9.65), between the inner cone's corners: the cone's base, not its apex (kept in
  `flashKeepoutBase`; the field has no place for it). **Derived:** the apex, 7.53 from the front (the 112.07° cone
  through the flash's Ø6.28 at the bump's top; the drawn lines cross at 7.52), and the base Ø5.98 at 9.55 (drawn 5.99).
  The section draws this phone's body (back glass 7.80, bump's glass 9.66, camera 2's ring 11.23), and the drawn kinks'
  spacing (12.13) closes with the printed numbers' 12.10. Negative controls: read from the back glass, the transition
  would miss the drawn kinks by the phone's thickness; read as the apex, 9.55 is 2.0 from the drawn lines' crossing.
- **MagSafe** (sheet 2, features.json only), the 13's number for number: the clear circle Ø57.50 at the product centre
  (35.76, 73.35), whole; the magnetic zone the full width from 40.12 down (4.22 below this phone's bump outline, where
  the 13's is 5.00), straight-sided to 110.52, closed by an R49.39 arc whose centre (derived, 76.45 down) is 3.10 below
  the product centre (measure.ts finds the drawn arc there; a product-centred arc fails, the negative control). The
  camera corner's keepout (to 39.12 across, 40.12 down) and the compass (64.91, 9.65) are recorded in `magsafeExtras`,
  not built; sheet 2's metal keepouts and sheet 3's antenna keepouts (Detail K) are not recorded.
- **Scaled** (re-measured by `measure.ts`): the lens windows (Ø11.70, the innermost of four circles), the bump's
  corners (outline 10.86, from 10.55, 11.44 and 10.55; top 8.89), the active area's corners (7.85), the receiver slot
  (11.00 x 0.73).
- **Inferred:** camera identities; the flash's inner cone circular (one section); the holes between each group's ends evenly spaced (they fall on the 2.255 pitch at
  1200 dpi, the end holes dimensioned to their outer edges as on the 13s); round button and port ends.
- **Spec** (support.apple.com/111850): 172 g; Ultra Wide 13 mm ƒ/2.4 120°; Main 26 mm ƒ/1.5.
- **Assumed, for a render:** the depths of the holes, the port and the receiver.

## Overlays

Red pixels (unchanged by the rear mic, which lies on the drawn circle): Detail D 433 (hairlines at the bump outline's corners, which are drawn unequal, and the part's top edges
beyond Detail D's dashed circle), front view 57 (anti-aliasing at the active area's corners), bottom view 142 (the
bump's fillet, which the builder draws as a straight slope).

## What it taught

- The receiver's round ends touch its cutout's end walls on the row through its middle, where the family's scan reads
  its end strokes: it read the slot 11.42 x 1.16 from two merged 70 px runs. The white inside, widened by the slot's
  own stroke measured radially on its ends (0.34; the cutout's pen is 0.41), gives 11.00 x 0.73, as the 13's.
- Earlier guesses copied from the 13 (windows 11.4, top radius 8.5, the slot) were each off by more than a scan's
  error: every scaled value has to come from this drawing's scan.
- A corner whose middle point is off the diagonal needs the builder to split it elsewhere, or a stand-in point.
- A cone line crossed by its own hatch at 45° merges with a hatch line on some rows, and the run's middle moves inward:
  the inner cone read 110.5° that way. The run's outer (white) edge, moved in by half the line's pen, reads 111.9°.
- A leader's arrow and its number can disagree: the mic's Ø2.10 arrow lands on a Ø2.39 circle. Measuring every circle
  drawn there (at 4800 dpi) showed which one the number fits.
