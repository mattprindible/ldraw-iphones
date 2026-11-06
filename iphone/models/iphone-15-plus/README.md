# iPhone 15 Plus

The iPhone 15 Plus from Apple's dimensional drawing (`../../drawings/iphone-15-plus.pdf`, not in the
repository), built by the family's builder (`../../`). The iPhone 15 drawn larger on the same plan and lettering:
A the back, B the edge profile, C the port, D the corner with the island and the receiver; sheet 2 the keepout
sections, Detail E and the MagSafe view.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF; Detail D's calibration on the corner's own leaders; Detail B's asymmetric leaders; Detail C's port outlines; the rear mic's three circles (4800 dpi); Section J-J (the flash's keepout); the MagSafe view |
| `part.ts` | the drawing → `iphone-15-plus.dat` and `features.json` |
| `check.ts` | the part laid over Detail A, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **The same as the 15:** the corner (Detail D's eight points; the diagonal scaled, 3.64), Detail A's back (bump,
  cameras, flash: every number the 15's), the cones (121.83° camera 1, the Ultra Wide; 75.55° camera 2, the Main), the
  island's height and centre (6.07 about -8.19), the buttons' sizes. Apple's spec page (support.apple.com/111830):
  201 g, 13 mm ƒ/2.4 and 26 mm ƒ/1.6.
- **The edge profile isn't symmetric.** Detail B labels 3.46 toward the front and -3.50 toward the back at the 0.40
  inset (the 15 reads ±3.50). The leaders are drawn there too (3.462 and 3.499, calibrated on the four symmetric
  pairs), so it isn't a misprint; the front is the upper side, as in the bottom view (the bump hangs below). The
  front rounds on to the 2.41 flat; the back is assumed to step to its glass at 1.00 after 0.81, as the 15's.
- **The port** is dimensioned 3.72 on its outer outline (the strokes' middles 3.70 apart); its inner outline is 3.23,
  near the 15's 3.25. The part's opening is the outer, the dimensioned one.
- **The receiver** (Detail D: 0.59 about -1.17, 14.54 long) lies on the curved edge outside the modelled face, so it
  isn't drawn, as on the 15.
- **The bottom holes** (4 + 6, Ø1.35) are dimensioned to their centres: 27.16 - 20.39 = 3 x 2.257 and 61.87 - 50.60 =
  5 x 2.254 fit the 2.255 pitch only so. Screws Ø1.50 (the 15's Ø1.60).
- **Rear mic** (Detail A): Ø2.10 at 11.47 across, 26.90 down (the 15's numbers: 11.47 is the ordinate below the view
  whose extension line rises to the mic's centre; the -26.90 line runs in to it), flush on the bump's top (2.06 from
  its R9.03 corner's centre). Drawn unlike the 15's two circles: three concentric ones, Ø1.65, Ø2.07 (a heavier pen)
  and Ø2.40, with eight short spokes between the inner two, all 0.035 below the -26.90 line. The Ø2.10 leader's arrow
  lands on the middle one (measured: the ink runs unbroken from it outward on the arrow's rays; inside it the paper
  shows), and 2.10 lies within its stroke: the mic is the middle circle. The inner and outer (scaled, `rearMicInner`,
  `rearMicRing`) aren't built.
- **The flash's keepout** (sheet 2, Section J-J, features.json only): the 15's numbers, on a section drawn again for
  this sheet. An inner cone of 112.01° turning into a 157° outer cone at 11.62 from the front. J-J is the only section
  through the flash (down the phone), so the inner cone is taken as circular. 9.56 FLASH KEEPOUT CONE TO COVER GLASS
  reaches the strobe's face, 0.10 under the bump's glass (9.66), between the inner cone's corners: the cone's base,
  not its apex (kept as `flashKeepoutBase`; the field has no place for it). "To cover glass" is from the front: the
  arrows start on the section's front face, and the back glass (7.81), bump glass (9.66) and camera 2's ring (11.29)
  read from it, so the section is drawn on this phone's body. **Derived:** the apex, 7.54 from the front (the 112.01°
  cone through the flash's Ø6.28 at the bump's top; the drawn lines cross at 7.543), and the base Ø5.98 at 9.56
  (drawn 5.99).
- **MagSafe** (sheet 2, features.json only): the clear circle Ø57.50 at the product centre (38.88, -80.44); the
  magnetic zone the full width from its top edge down, straight-sided to -115.72, closed by an R52.49 arc. The arc's
  centre (derived, 80.456 down) is the product centre within 0.011, where the 15's R49.39 is centred 3.10 below its
  own: the drawn arc's lowest point and four crossings fall on it within 0.025. **Scaled:** the zone's top edge, 40.23,
  isn't dimensioned (as on the 15): read on two columns at 2400 dpi, 3.08 below the bump's outline (the 15's 3.43).
  Beyond the fields (`magsafeExtras`, not built): the camera corner's keepout (to 37.15 across, down to the zone) and
  the compass (70.77, -8.84).
- **Not modelled:** the antenna lines.
- **The right side view's 7.81 is labelled PRODUCT WIDTH** but spans the thickness (Apple's spec: 7.80).

## What it taught

- **A copied view region keeps the old view's datum.** The front view's left edge, first taken at 208.5 px, was the
  glass's heavy line (1.00 in): the scale across came out 22.78 for 23.05 and the active width 1.3 off. The outline is
  the thin line 21 px further out (187.5), where the top-to-bottom scale agrees.
- **A centre line can run down the column you scan.** Detail D draws the island's vertical centre line on the 38.88
  line, and the 15's procedure scanned the island's top and bottom along it (7.04 for 6.07); a column 4 to the left,
  on the island's straight run, reads 6.073.
- **The front view draws no outer arc at the corners**: its top and side outlines run straight on as the length's and
  width's extension lines, and the heaviest arc is the glass's edge. The part's corner silhouette shows red there; the
  corner's source is Detail D, which re-measures.
- **A shared number isn't a shared drawing.** Detail A's mic is the 15's, number for number, but drawn as three circles
  where the 15 draws two: the 15's procedure, sorting crossings into two rings, fitted the inner two together as a
  Ø1.88 circle and failed. And J-J's numbers are the 15's, but the section sits 340 rows lower on the sheet against its
  dimension lines: each scan row was chosen again.
