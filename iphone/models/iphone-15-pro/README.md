# iPhone 15 Pro

The iPhone 15 Pro from Apple's dimensional drawing (`../../drawings/iphone-15-pro.pdf`, not in the
repository), built by the family's builder (`../../`). The first model with a Dynamic Island, USB-C and an Action
button. Its title block says DO NOT SCALE DRAWINGS; the few scaled values are checked against dimensioned features.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF (a test when the PDF is present); checks the rear mic (at 4800 dpi), the flash's keepout section (Section J-J) and MagSafe's keepouts against what the drawing draws |
| `part.ts` | the drawing → `iphone-15-pro.dat` and `features.json` |
| `check.ts` | the part laid over Detail D, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **Cameras, by their keepout cones (sheet 2):** camera 1 the Ultra Wide (123°), 2 the Main (86°), 3 the 3x Telephoto
  (33.2°); numbered differently from the 13 Pro's. Their fields of view are Apple's: 120°, 24 mm, 77 mm.
- **The Dynamic Island** (20.69 x 6.07, centred 7.67 from the top) and the receiver (14.54 x 0.45 at 1.17) are
  dimensioned in Detail A. The receiver straddles the glass's edge (1.00 in), so it's modelled as its part inside.
- **The LiDAR scanner** is given only as a keepout zone (Ø14.37, overlapping camera 3's ring), so it's in
  `features.json` but not drawn.
- **The rear mic** (Detail D): Ø0.75 at 37.95 across, 33.86 down (37.95 is the first ordinate below the view, its
  extension line rising to the mic's centre; the -33.86 line runs in to it from the right), flush on the bump's top,
  6.10 from its bottom-right R9.67 corner's centre (`rearMic`). Two concentric circles are drawn, Ø1.15 and Ø0.75 at
  4800 dpi, the same pair as the 14 Pro's. The leader's arrow stops on the outer, but the printed Ø0.75 is the inner's
  (the 14 Pro prints Ø1.15, the outer's): taken as printed, the inner circle, the opening. The outer is recorded as
  scaled (`rearMicOuter`). Its circle in the Detail D overlay lies on the drawn inner one.
- **Flash keepout** (sheet 2, Section J-J, the middle section, features.json only): a 112.00° inner cone from its apex
  ("origin") 8.35 from the cover glass, 0.10 beyond the back glass's plane inside the bump, turning at 12.36 into a
  157.00° outer cone. Both dimensions start on the section's left face, the front (the back glass is drawn 8.25 from
  it, the bump's top 10.30). One section, so the cones are taken as circular. The drawn lines cross at 8.35, 10.22 down
  (the flash's centre line), and kink at 12.36. Hand calculation: 2 (10.30 - 8.35) tan 56° = Ø5.78 where the cone
  leaves the bump's top, 0.57 inside the Ø6.92 flash's edge all round, as on the 14 Pro: a `known` difference in
  measure.ts. The hatched keepout is closed by an undimensioned line 14.67 from the cover glass (`flashKeepoutExtras`,
  scaled), where the drawing stops, not a stated limit.
- **MagSafe** (sheet 2, the middle back view, features.json only): the clear circle Ø57.50 centred 35.30 across
  (PRODUCT CENTER) and **74.98 down**, 1.675 below the product centre (73.305), as drawn and dimensioned (the 14 Pro's
  sits 1.67 below too). The magnetic zone is the 16's shape: the full width from 45.18 down, straight sides to 112.62,
  closed by an R49.39 arc whose derived centre is 78.08 down (3.10 below the clear circle's). Unlike the 14 Pro's, the
  printed zone top agrees with its line (drawn 45.19), but it is 1.36 above Detail D's bump outline bottom (-46.54):
  the zone reaches up the bump's lower edge, and this view draws no line at 46.54. The camera corner's keepout (to
  45.22 across, crosshatched: no metal or conductive material) and the compass (63.16, 7.95) are recorded in
  `magsafeExtras`, not built. Sheet 2's other keepouts (the left view's metal bands, Detail E's front sensors) and
  sheet 3's antenna keepouts (Detail K) are not recorded.
- **The bottom holes** are dimensioned to their centres (the 13s' to their edges): the chords say so at 1200 dpi.
- **Scaled:** the windows (13.01), the bump's corners (13.30, 9.67), the display's corners (8.28); the mic's outer
  circle (1.15) and the line closing the flash's keepout (14.67).
- **Spec** (support.apple.com/111829): 187 g; focal lengths and the Ultra Wide's 120°.

## What it taught

- The flash's Ø6.92 leader touches its circle, and the arrowhead and the circle merge into one wide run: the circle
  finder now tries several chords and keeps the one whose crossings are all thin.
- The bottom view draws the phone 8.12 thick for 8.25 (the 13s' draw it 0.08 thin too).
- The mic's printed diameter can name either of its two drawn circles: the 14 Pro's Ø1.15 is the outer, the 15 Pro's
  Ø0.75 the inner, with the arrow on the outer both times. Measure both circles and match the number, not the arrow.
