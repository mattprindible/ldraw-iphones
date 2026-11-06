# iPhone 14 Pro Max

The iPhone 14 Pro Max from Apple's dimensional drawing (`../../drawings/iphone-14-pro-max.pdf`, not in
the repository, dated 2022-09-21), built by the family's builder (`../../`). It's the 14 Pro drawn larger (77.58 x
160.71 x 7.85), with the same back. The sheet is lettered like the 14 Plus's, not the 14 Pro's: Detail D is the corner
with the Dynamic Island and the receiver, B the edge profile, C the Lightning port and A the back.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF and the corner's diagonal point in Detail D; checks the rear mic (at 4800 dpi), the flash's keepout section (Section H-H) and MagSafe's keepouts against what the drawing draws |
| `part.ts` | the drawing → `iphone-14-pro-max.dat` and `features.json` |
| `check.ts` | the part laid over Detail A, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **The back is the 14 Pro's, number for number.** Detail A has the same cameras (14.28/14.28, 14.28/33.52,
  32.12/23.90, Ø15.61), flash (32.12/10.32, Ø6.90), rear mic and bump (outline 2.19 to 44.12/45.61, top 4.79 to
  41.52/43.01). The bump heights are also the same (1.85, 4.18).
- **Cameras, by their keepout cones (sheet 2):** camera 1 is the 3x Telephoto (38.23°, apex 4.12 from the cover glass),
  camera 2 the Main (88.90°, 7.80) and camera 3 the Ultra Wide (125.12°, 8.09). The 14 Pro's apexes are 4.02, 7.84 and
  7.99, and its Ultra Wide cone is 127.74°. Focal lengths and the 120° are from Apple's spec page. The spec page's "2x
  Telephoto" is a crop of the Main, not a separate camera.
- **The corner isn't symmetric.** It runs 17.32 along the top and 15.55 down the side, the 14 Plus's pattern. Detail D's
  seven crosses were paired by their leaders at 1200 dpi, and measure.ts calibrates on those leaders (each within
  0.011). The builder needs a point on the 45° diagonal, so that point (3.62) is scaled where the outline crosses it.
- **The edge profile** has the 14 Pro's heights (±2.73 to ±3.85) with insets of 0.00, 0.01, 0.14, 0.49 and 0.92. It
  ends at ±3.85, 0.075 short of half the thickness, as the 14 Pro's does.
- **"1.15 ALL AROUND ... TO START OF FLAT AREA"** in the front view, where the 14 Pro's sheet says 1.05. The glass
  dimensions (75.48, 158.61) put the glass 1.05 in, and the part follows them. Detail A labels the back glass's heavy
  edge -1.15. One across leader to that same edge reads "-16.17", which fits nothing on the back; it's recorded but
  not used.
- **The Dynamic Island** is 20.76 x 6.07, centred 8.10 from the top. The receiver is 14.21 x 0.75 at -1.27. It
  straddles the glass's edge, so the part has only the piece inside the glass (1.06 to 1.645), as on the 14 Pro. Sheet
  2's 14.40 "RECEIVER KEEPOUT" is a zone round the receiver, not the slot.
- **The LiDAR scanner's** keepout on the plateau (sheet 2, Detail F) is a 4.78 x 8.82 rectangle with barely rounded
  corners; the 14 Pro's is 4.92 x 8.96. The part takes its corners square, as the 14 Pro's. Detail
  A doesn't draw the scanner, so it shows red in that overlay.
- **The rear mic** (Detail A, the 14 Pro's numbers): Ø1.15 at 37.91 across, 33.98 down. 37.91 is the ordinate below
  the view whose extension line rises to the mic's centre; the -33.98 line runs in to it from the right. It's flush on
  the bump's top, inside its bottom-right R9.70 corner (`rearMic`). Two concentric circles are drawn (Ø1.15 and Ø0.75 at
  4800 dpi); the leader's arrow lands on the outer, and the number is the outer's. With the numbers swapped nothing is
  drawn there. Unlike the 14 Pro's, the MagSafe view doesn't dimension it again.
- **Flash keepout** (sheet 2, Section H-H, features.json only): the 14 Pro's Detail H, number for number. A 112.00°
  inner cone from its apex ("origin") 7.74 from the cover glass (the front face: the apex is 0.11 inside the back
  glass) turns into a 157.00° outer cone at 11.76 from the front. The drawn lines agree with every number. The inner
  cone leaves the bump's top at Ø5.81, 0.54 inside the Ø6.90 flash's edge; that's taken as drawn (a `known` in
  measure.ts).
- **MagSafe** (sheet 2, the middle back view, features.json only): the clear circle is Ø57.50 on the product centre,
  both lines labelled so (38.79, -80.36: half of 77.58 and 160.71). The magnetic zone runs the full width from its top
  down, straight-sided to 2X -114.82, and is closed by an R51.89 arc through those corners. Unlike the 16's and the 14
  Pro's, the arc's centre is the product centre: 114.82 - √(51.89² - 38.79²) = 80.354. The zone's top has no number.
  It's drawn 47.18 down (scaled, the same on ten columns), 1.57 below the bump's outline (-45.61), which the view
  also draws. So it doesn't sit on the outline, as the 14 Pro's does. The camera corner's crosshatched keepout (to
  44.12 across; magnetic or permeable material, the 14's wording) and the compass (71.17, -9.20) are recorded in
  `magsafeExtras`, not built. Sheet 2's other keepouts (the left view's metal bands, Detail E's front sensors) and
  sheet 3's antenna keepouts are not recorded.
- **Sides:** the pocket is 2.25 wide, centred 3.82 from the back (the 14 Pro's: 2.35 and 3.85). The volume buttons and
  the SIM tray are centred 3.85 from the back, and the side button 3.92. Every one was read at 1200 dpi from where its
  arrows land.
- **The bottom has ten holes:** 4 on the left (19.91 to 28.21) and 6 on the right (49.37 to 62.17), dimensioned to their
  outer edges. Only as edges do the spans fit the 2.255 pitch, and the chords at 1200 dpi centre on the derived holes
  to 0.01. The screws are at 32.39 and 45.18, the port from 34.39 to 43.17, and the port keepout 13.65 x 6.85 (R3.40).
- **Scaled:** the windows (12.75, 12.75, 12.76), the bump's corners (12.31, 9.70), the display's corners (9.11), the
  corner's diagonal point (3.62) and MagSafe's zone top (47.18).
- **Spec** (support.apple.com/111846): 240 g; 77 mm, 24 mm, and 13 mm with 120°.
- **Assumed:** the depths of the receiver, the holes and the port. The drawing gives none.

## What it taught

- Even a calibration that checks out can follow its own guess. As on the 14 Pro, Detail A's camera calibration moves
  by up to 0.05 px/mm with the recorded scale. At 46.07, the bump's straight lines read within 0.02 of their sizes
  both ways, so that's the recorded scale.
- A corner-radius guess picks among the lines the diagonal crosses. The top-left display corner's diagonal crosses
  hatch lines at radii 10.00 and 17.26 as well as the arc at 9.11. A guess of 9.6 read 10.00. Probing every run on
  every diagonal settled it: the arc crosses at 9.11 on three corners, and the hatch runs along the fourth.
- Sister drawings share numbers but not layouts. The 14 Pro and the 14 Pro Max have the same flash keepout and the same
  rear mic, but their MagSafe zones are built differently. The 14 Pro's arc is centred 3.07 below its clear circle, and
  its zone top is labelled -28.29 but drawn on the bump outline. Here the arc is concentric with the clear circle, and
  the top is unlabelled and drawn 1.57 below the outline. Read each drawing's own lines, not a sibling's pattern.
- A least-squares line through a few far rows can end up with no rows within the final tolerance. The 14 Pro's line
  fit, ported, kept none on H-H's upper outer line, where the line crosses the keepout's edge line and the angle's arc.
  Halving the tolerance from 48 px down fixed it.
- Overlays: Detail A's red is the LiDAR keepout plus the phone's edge outside the detail's dashed circle. The
  front view's red (70 px) is a pixel of fringe at the display's corners. The bottom view's red (207 px) is the lens
  rings' square edges under the drawing's rounded ones, and the ring/silent switch's square block. The 14 Pro's
  overlays show the same red in the same places (396, 61, 156 px).
