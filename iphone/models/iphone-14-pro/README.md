# iPhone 14 Pro

The iPhone 14 Pro from Apple's dimensional drawing (`../../drawings/iphone-14-pro.pdf`, not in the
repository, dated 2022-09-21), built by the family's builder (`../../`). The first Dynamic Island, drawn on the 15
Pro's plan, with the 13 Pro's sides: a ring/silent switch in a pocket, Lightning, a 7.85 body.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF (a test when the PDF is present); checks the rear mic (at 4800 dpi), the flash's keepout section (Detail H) and MagSafe's keepouts against what the drawing draws |
| `part.ts` | the drawing → `iphone-14-pro.dat` and `features.json` |
| `check.ts` | the part laid over Detail D, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **Cameras, by their keepout cones (sheet 2):** camera 1 is the 3x Telephoto (38.23°, apex 4.02 from the cover glass),
  2 the Main (88.90°, 7.84) and 3 the Ultra Wide (127.74°, 7.99). They're numbered as on the 13 Pro, not the 15 Pro. Their
  focal lengths and the Ultra Wide's 120° are from Apple's spec page.
- **The bump** is outlined 2.19 in (the 15 Pro's is 1.04, on the glass's edge) and topped 4.79 in. It's 1.49 taller
  than wide (41.93 x 43.42, top 36.73 x 38.22).
- **The Dynamic Island** (20.69 x 6.07, centred 8.10 from the top) and the receiver are dimensioned in Detail A. The
  receiver is 14.40 x 0.75, centred 1.27 from the top. It straddles the glass's edge (1.05 in), so the part has only the
  piece inside the glass, 1.06 to 1.645.
- **The LiDAR scanner's** keepout on the plateau (sheet 2, Detail F) is a 4.92 x 8.96 rectangle with barely rounded
  corners (about R0.2, no radius given): the part takes them square, the keepout's cautious side. Detail D doesn't draw it, so it shows red in that overlay.
- **The rear mic** (Detail D): Ø1.15 at 37.91 across, 33.98 down (37.91 is the ordinate below the view whose extension
  line rises to the mic's centre; the -33.98 line runs in to it from the right), flush on the bump's top, 6.13 from its
  bottom-right R9.70 corner's centre (`rearMic`). Two concentric circles are drawn, Ø1.15 and Ø0.75 at 4800 dpi; the
  leader's arrow lands on the outer, and the number is the outer's. Sheet 2's MagSafe view dimensions it again (37.91,
  -33.98). Its circle in the Detail D overlay lies on the drawn one.
- **Flash keepout** (sheet 2, Detail H, features.json only): a 112.00° inner cone from its apex ("origin") 7.74 from
  the cover glass, 0.11 inside the back glass, turning at 11.76 into a 157.00° outer cone. Both dimensions start on the
  section's left face, the front: the bump's top is drawn 9.70 from it. Detail H cuts down the 32.12 line, so the
  inner cone is taken as circular (one section). The drawn lines cross at 7.74 and kink at 11.76. Hand calculation: 2
  (9.70 - 7.74) tan 56° = Ø5.81 where the cone leaves the bump's top, 0.54 inside the Ø6.90 flash's edge all round (the
  12 Pro's meets its flash's edge). The drawn lines agree, so it's a `known` difference in measure.ts, not a misreading.
- **MagSafe** (sheet 2, the middle back view, features.json only): the clear circle Ø57.50 centred 35.73 across (PRODUCT
  CENTER) and **75.40 down**. That isn't the product centre (73.73): the circle sits 1.67 below it, as drawn and
  dimensioned (the 14 Pro Max's labels its -80.36 PRODUCT CENTER). The magnetic zone is the 16's shape: the full width
  from 45.61 down, straight sides to 112.57, closed by an R49.39 arc whose derived centre is 78.47 down.
  **The zone's top contradicts its label:** the line is printed -28.29 but drawn 45.61 down, across the full width, on
  Detail D's -45.61 bump outline, where the crosshatched camera corner above it ends. Nothing is drawn at 28.29. It's
  taken as drawn (`zoneFrom` 45.61, kind inferred), and the printed number is kept in `magsafeExtras`. The camera
  corner's keepout (to 44.12 across, crosshatched: no metal or conductive material) and the compass (65.04, 9.20) are
  recorded there too, not built. Sheet 2's other keepouts (the left view's metal bands, Detail E's front sensors) and
  sheet 3's antenna keepouts (Detail K) are not recorded.
- **The bottom holes** are dimensioned to their outer edges, as on the 13s (the 15 Pro's are to their centres). At
  1200 dpi the chords centre half a hole in, and only as edges do the spans fit the 2.255 pitch.
- **Every button's 3.92**, and the pocket's 3.85, run from the back glass. The right view's arrow lands on the bump
  side, where the 13s' and the 15 Pro's right views measure from the front.
- **Scaled:** the windows (12.78, 12.75, 12.75), the bump's corners (12.34, 9.70) and the display's corners (9.11, from
  the top two; measure.ts says why the bottom two are left out).
- **Spec** (support.apple.com/111849): 206 g; 77 mm, 24 mm and 13 mm with 120°.
- **Assumed:** the receiver's, holes' and port's depths. The drawing gives none.

## What it taught

- The camera calibration tracks its own guess on this sheet: the measured scale moves with the recorded one by up to
  0.05 px/mm, because concentric rings let the circle finder settle differently. The bump's long straight lines give
  the scale independently (46.04 to 46.10). The recorded 46.07 sits between them, and with it every check falls within
  0.03.
- The active area is hatched at 45°, so one corner's diagonal runs along a hatch line and another's arc merges with
  one. Only the top two corners can be read (9.11 at both).
- Overlays: the Detail D red is the LiDAR keepout, plus the phone's edge beyond the detail's dashed circle. The bottom
  view's red is the bump's straight-slope fillet seen from below (the builder's named approximation). The front
  view's red is a few pixels of fringe at the display's corners and the receiver's ends.
- A printed number can disagree with its own line. The MagSafe zone's top is labelled -28.29 and drawn at 45.61, on a
  dimensioned edge. The scan reads the line (four columns, 45.609) and finds nothing within 1 mm of 28.29, and the
  shape it bounds only makes sense at 45.61. Measuring every dimensioned line in a view, not just the ones you need,
  is what catches this.
- A "product centre" isn't always labelled where you'd expect. Here MagSafe's centre line carries no label and sits 1.67
  below half the length. The 16's and 14 Pro Max's are at the product centre, so assuming that here would be 1.67 off.
