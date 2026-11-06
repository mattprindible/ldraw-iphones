# iPhone 16 Pro

The iPhone 16 Pro from Apple's dimensional drawing (`../../drawings/iphone-16-pro.pdf`, not in the
repository), built by the family's builder (`../../`). The 15 Pro's back on a larger body (71.45 x 149.61), with
Camera Control, a 5x Telephoto, and an edge whose rounding runs past the glass's edge onto the faces.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF, and checks the rear mic, the flash's keepout sections and MagSafe's keepouts against what the drawing draws (a test when the PDF is present) |
| `part.ts` | the drawing → `iphone-16-pro.dat` and `features.json` |
| `check.ts` | the part laid over Detail D, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **Camera Control** (centre 98.19, 17.10 x 3.03, flush) is drawn as outlines, with the edge of its 0.63 chamfer
  (0.18 deep, 16°); its keepout (25.00 x 4.20 at the surface) is in `features.json`.
- **The edge profile** rounds from the flat side (±1.84) to the faces' flat 2.41 in, past the glass's edge (1.00 in).
  The part's faces start at 1.47 in, where the glass is within 0.025 of flat, so the display (2.44 in) lies on them.
  The receiver (14.02 x 0.45 at 1.17) lies on that curved edge and isn't drawn.
- **Cameras:** Ultra Wide (124°), Fusion (86°, 24 mm), 5x Telephoto (25°; Apple gives its 20°).
- **The LiDAR scanner** is given only as a keepout zone (Ø15.73 at 38.14): in `features.json`, not drawn.
- **The rear mic** (Detail D: Ø0.75 at 38.00 across, 34.14 down, near the bump top's bottom-right corner) is drawn flush
  on the bump's top. Two concentric circles are drawn there; the Ø0.75 leader's arrow lands on the inner one (Ø0.75
  drawn), the mic. The outer (drawn Ø1.15, undimensioned) isn't built.
- **The flash's keepout** (sheet 3, two sections both labelled M-M: one down the phone, one across) is in
  `features.json`: an inner cone from a Ø6.00 base 10.20 from the front (0.10 under the plateau), 112° down the phone
  and 96° across, turning at 12.32 and 12.11 into one circular 157° outer cone (its apex 11.07 from the front, derived
  from either section's numbers alike). The family's field takes one circular inner cone: it has the 112° one (the
  wider, on the safe side), its apex derived (8.18); the 96° section, the 10.20 base and the 14.20 closing line are in
  `drawing.ts` only. The drawing's (2.13) reference dimension is 12.32 - 10.20 = 2.12 (drawn 2.12): kept as a known
  discrepancy. Down the phone, camera 3's ring bounds the keepout's lower kink.
- **MagSafe** (sheet 4) is in `features.json`: the Ø57.50 clear circle at 35.72 across and 75.05 down, labelled PRODUCT
  CENTER but 0.245 below the product's centre (74.805); the magnetic zone the full width from 46.54 (the bump outline's
  bottom) down, straight-sided to 112.22, closed by an R49.39 arc whose centre (78.12, derived) is 3.07 below the
  circle's. The camera corner's metal keepout and the compass (52.99, 144.45) are in `drawing.ts` only.
- **A known discrepancy:** the front view draws the island 0.07 below its own -7.71 centre line. The part follows the
  number; the re-measurement reports it as known.
- **Scaled:** the windows, the bump's corners (13.30, 9.67), the display's corners (10.32 at three; the fourth's
  diagonal runs along a hatch line), the mic's outer ring (1.15).
- **Spec** (support.apple.com/121031): 199 g; focal lengths, the Ultra Wide's 120°, the Telephoto's 20°.

## What it taught

- Sheet 1's views are drawn at different scales (front 34.6 px/mm at 1200 dpi, bottom 23.05, Detail D 46.06).
- A corner scan with a poor guess finds the wrong arc: 6.65 at first (the glass's arc), 10.32 with a guess near it.
- Two sections can share a label: sheet 3's flash sections are both SECTION M-M (V-FOV and H-FOV); which is which is
  in the angles' labels, not the section letters. Each section's transition extension line runs on across the whole
  section, so a cone line traced along the axis must start just past it, not past the transition plus a margin.
