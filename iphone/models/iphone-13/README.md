# iPhone 13

The iPhone 13 from Apple's dimensional drawing (`../../drawings/iphone-13.pdf`, not in the
repository), built by the family's builder (`../../`). The second model after the 13 mini, and the test of what the
family shares: the same sheets, lettered A–D (corner, edge, port, back) where the mini's are X, AA, Z and Y.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF (a test when the PDF is present); checks the rear mic, the flash's keepout sections (G-G, K-K) and MagSafe's keepouts against what sheet 2 draws |
| `part.ts` | the drawing → `iphone-13.dat` and `features.json` |
| `check.ts` | the part laid over Detail D, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **Dimensioned, where the 13 mini's were scaled:** the bump's outline (1.15 to 35.12) and top (3.64 to 32.48), the
  flash's place (26.11, 10.01), the receiver's centre line (1.75).
- **Rear mic** (Detail D): Ø2.40 at 10.43 across, 25.69 down (10.43 is the ordinate above the view whose extension
  line drops to the mic's centre; the -25.69 line runs in to it), flush on the bump's top (2.35 from its R8.45 corner's
  centre). It lies on the drawn circle in the overlay.
- **Flash keepout** (sheet 2, features.json only), the 13 mini's number for number: 112° inner cone (Section G-G, down
  the phone), 157° outer, the transition 11.10 from the front, the inner cone's base Ø6.00 on the strobe (Section K-K).
  K-K draws the inner cone across the phone at 96°: not one circular cone; the field takes G-G's 112°, which encloses
  it (K-K kept in `flashKeepoutAcross`, not built). **Derived:** the apex, 7.03 from the front (the 112° cone through
  the flash's Ø6.28 at the bump's top; the drawn lines cross at 6.98). "To cover glass" is from the front: the
  transition read from the back would miss the drawn kinks by the phone's thickness (a negative control).
- **MagSafe** (sheet 2, features.json only): the clear circle Ø57.50 at the product centre (35.76, 73.35), whole (7.01
  inside each edge); the magnetic zone the full width from 40.12 down, straight-sided to 110.52, closed by an R49.39
  arc whose centre (derived, 76.45 down) is 3.10 below the product centre (the 12's is on it; measure.ts finds the
  drawn arc there, and a product-centred arc 3.1 higher fails, the negative control). The camera corner's keepout
  (to 39.12 across, 40.12 down) and the compass (64.91, 9.65) are recorded in `magsafeExtras`, not built.
- **Scaled** (re-measured by `measure.ts`): the lens windows (Ø10.83), the bump's corners (outline 10.92, top 8.45),
  the active area's corners (7.89), the receiver's slot (11.00 x 0.77; the 13 mini's dimensioned slot suggests the
  strokes' middles read about 0.1 small).
- **Inferred:** camera 1 is the Ultra Wide (its 124° cone encloses 120°); the holes between each group's ends are
  evenly spaced, as drawn; round button and port ends.
- **Spec** (support.apple.com/111872): 174 g; the Ultra Wide's 120°; apertures. **Third-party:** the Main's 26 mm.
- **Assumed, for a render:** the depths of the holes, the port and the receiver.
- **A finding, not tuned away:** sheet 2's sections draw the 13 mini's body: the bump's glass at 9.08 from the front
  and camera 2's ring at 10.16 (the mini's 7.65 + 2.51), where sheet 1 dimensions this phone's 1.50 and 2.59 (9.15,
  10.24): 0.07 to 0.08 thin, the title block's tolerance. So the drawn transition (12.34 across its kinks) is wider
  than the printed numbers give (12.06): recorded as a known difference in `measure.ts`; from the glass as drawn it
  closes to 0.07.

## What it taught

- The bottom view dimensions each hole group to its outer edges, which showed the 13 mini's left pair had been misread
  as centres.
- Its labels sit where their leaders land, confirming the 13 mini's swapped plateau label and mislabelled cone.
- Its heavy pens (the flash, the back glass's edge) and the crossing of dimension lines on a corner's diagonal made the
  re-measurement stroke-aware and line-aware (`../../../docs/LEARNINGS.md`).
