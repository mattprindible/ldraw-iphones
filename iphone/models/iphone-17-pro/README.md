# iPhone 17 Pro

The iPhone 17 Pro from Apple's dimensional drawing (`../../drawings/iphone-17-pro.pdf`, not in the
repository), built by the family's builder (`../../`). The first with a camera plateau across the top of the back
instead of a bump, and a back that rounds further than the front.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF (a test when the PDF is present), and checks the rear mic, the flash's keepout section and MagSafe's keepouts against the drawing |
| `part.ts` | the drawing → `iphone-17-pro.dat` and `features.json` |
| `check.ts` | the part laid over Detail D, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **The plateau** stands 2.55 above the back plate; the camera glass 1.88 above the plateau (labelled BACK PLATE TO
  REAR CAMERA GLASS, its extension lines run from the plateau's). Its outline (scaled from Detail D) sits 0.74 in from
  the phone's, its bottom edge 47.93 from the top with R13.04 corners. Its walls rise from where the flat side ends and
  round over as the back's edge does, raised 2.55 (assumed: the drawing gives its height and outline, not its edge).
  The camera area is outlined on it (a double outline, 0.2 apart, scaled).
- **The edge profile** differs front and back (Detail B): the front rounds to its flat 2.61 in, the back to 3.79.
  The faces start where each is within 0.1 of flat (1.20 in front, 2.35 behind).
- **Cameras**, by sheet 3's keepout zones: Ultra Wide (125°), Fusion (90°, 24 mm), 4x Telephoto (34°, 100 mm). The
  LiDAR window is drawn here (Ø6.65), with the flash and the rear mic, on one line 58.03 across.
- **The rear mic** (Detail D: Ø1.05 at 58.03 across, 23.99 down: the 3X 58.03 line is across, the -23.99 line runs in
  to its centre from the right) is drawn flush on the plateau, between the flash and the LiDAR window. Drawn with a
  0.18 pen, its stroke's middle traces Ø1.10; the printed 1.05 lies within the stroke.
- **The flash's keepout** (sheet 3, Section T-T, the only section through the flash) is in `features.json`: an inner
  123° cone from a Ø6.65 base on the plateau's top (11.30 from the front, which is 8.75 + 2.55: the base, not an apex),
  turning at 13.77 into a 157° outer cone; their apexes, not dimensioned, derived from the printed numbers (9.49 and
  12.17 from the front) and found where the drawn lines cross. Only V-FOV is given, so the cones are taken as round
  (assumed). The 11.30 base and the line closing the keepout (15.30, scaled: 11.30 + 4.00) are in `drawing.ts` only.
- **MagSafe** (sheet 4) is in `features.json`: the Ø57.50 clear circle on the 35.92 and 77.74 lines (2.735 below the
  product's centre, and not labelled PRODUCT CENTER); the magnetic zone the full width from the plateau's bottom edge
  (not dimensioned: scaled 47.96, Detail D's 47.93) down, straight-sided to 114.73, closed by an R49.39 arc whose
  centre (80.84, derived) is 3.10 below the circle's. The compass (20.11, 145.48) and sheet 4's metal keepouts are in
  `drawing.ts` only.
- **The bottom edge's openings** are all dimensioned; the 3.14 port is taller than the flat band (-1.50 to 1.44), so
  the bottom face runs onto the nearly flat rounding to take it.
- **Not drawn:** the receiver (a 27.38 x 0.70 slit on the glass's curved edge); the back plate's outline.
- **Spec** (support.apple.com/125090): 206 g (the US page; others say 204); focal lengths and the Ultra Wide's 120°.

## What it taught

- Its sheet 4 outline (58.01 from the top) is an antenna keepout, not the plateau, which ends at 47.93.
- The bottom view's outline is rounded or crossed by buttons at every row, so its scale comes from its extension lines.
- A face whose outline climbs a curved end made a sliver triangle whose own normal flipped: a region's facing is now
  decided once, from its largest triangle.
- A leader's arrowhead can run along the dimension line it sits under: Detail D's Ø1.05 arrowhead merges with the
  -23.99 line for 2 mm right of the mic, and the merged run's middle lies 0.04 low. Read past the arrowhead, the line
  meets the mic's centre to 0.002.
- Section T-T's numbers are unlabelled; their arrows settle them. 11.30 ends on the plateau's top (8.75 + 2.55), where
  the inner cone's base lies; the drawn inner lines cross 1.8 nearer the front, at 9.49, as the printed numbers say.
