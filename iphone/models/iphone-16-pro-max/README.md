# iPhone 16 Pro Max

The iPhone 16 Pro Max from Apple's dimensional drawing (`../../drawings/iphone-16-pro-max.pdf`, not in
the repository), built by the family's builder (`../../`). The 16 Pro drawn larger (77.58 x 163.03 x 8.25): the
same back (Detail D label for label), Camera Control and keepout sections, flash keepout and rear mic, and corner
profile; a tighter edge profile; ten holes on the bottom; MagSafe's keepouts moved with the larger body.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF (a test when the PDF is present), plus Detail A's corner ends, the port's ends and the holes' centres; checks the rear mic, the flash's keepout sections and MagSafe's keepouts against what the drawing draws |
| `part.ts` | the drawing → `iphone-16-pro-max.dat` and `features.json` |
| `check.ts` | the part laid over Detail D, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **The corner** is the 16 Pro's (Detail A's 0.04 to 13.75, label for label), but its end crosses carry no label:
  scaled on the corner's own lines, 19.23 across and down (the 16 Pro prints 19.23). The labels sit a leader off their
  crosses; the lines at scale pair them as the 16 Pro's.
- **The edge profile** (Detail B) rounds from ±1.84 to the faces' flat 2.41 in at ±4.12, through 0.02, 0.45 and 1.39 in
  (the 16 Pro's 0.07, 0.58, 1.47). The display runs 2.36 in, on the faces (they start at 1.39 in, within 0.02 of flat).
  The receiver (14.02 x 0.45 at 1.17) lies on the curved edge and isn't drawn.
- **Camera 1's window:** Detail D draws camera 1 without the innermost circle cameras 2 and 3 have (13.05, 12.99); the
  part gives it their 13.02 (inferred), and the re-measurement reports it as known (it finds the next ring, 13.56). The
  overlay shows it red.
- **The port's ends** aren't dimensioned (the 16 Pro's are): scaled on its outermost outline, 33.93 to 43.64 (9.71
  long, centred on Detail C's 38.79; the 16 Pro's dimensioned 9.72 lands on the same line).
- **The bottom holes** are all dimensioned, to their centres (the extension lines run to the holes' middles, within
  0.01; the edges' middles within 0.04): 4 left, 6 right, on the 2.255 pitch.
- **Camera Control** (centre 111.62, 17.10 x 3.03, flush) as the 16 Pro's; its keepout is 25.00 x 8.40: Detail E's
  2X 4.20 runs from the control's centre line to each edge (Section I-I draws one), not 4.20 across.
- **Cameras:** Ultra Wide (124°), Fusion (86°, 24 mm), 5x Telephoto (25°; Apple gives its 20°). The LiDAR scanner is a
  keepout zone only (Ø15.73 at 38.14): in `features.json`, not drawn.
- **The rear mic** (Detail D: Ø0.75 at 38.00 across, 34.14 down, near the bump top's bottom-right corner, 6.12 from its
  corner's centre) is drawn flush on the bump's top. Two concentric circles are drawn there; the Ø0.75 leader's arrow
  lands on the inner one (Ø0.73 drawn), the mic. The outer (Ø1.14 drawn, scaled as 1.15, undimensioned) isn't built.
- **The flash's keepout** (sheet 3: SECTION M-M down the phone, SECTION N-N across; the 16 Pro labels both M-M, and
  Detail P here draws only the N-N line) is in `features.json`, number for number the 16 Pro's: an inner cone from a
  Ø6.00 base 10.20 from the front, 112° down the phone and 96° across, turning at 12.32 and 12.11 into one circular 157°
  outer cone (its apex 11.07 from the front, derived from either section's numbers alike and crossed at 11.07 in both).
  The family's field takes one circular inner cone: it has the 112° one (the wider, on the safe side), its apex derived
  (8.18); N-N's 96°, the 10.20 base and the 14.20 closing line are in `drawing.ts` only. The (2.13) reference dimension
  is 12.32 - 10.20 = 2.12 (drawn 2.12): kept as a known discrepancy, as on the 16 Pro.
- **10.20 is the flash's face:** unlike the 16 Pro's, these sections draw no plateau line over the flash. On its axis
  there's one line at 10.20, stepping out to the plateau's 10.30 at the flash's edge; beside it, 10.20 and 10.30 run as
  two lines 0.10 apart (measured at 4800 dpi). The flash sits 0.10 under the plateau, and the cone's base is its face.
- **MagSafe** (sheet 4) is in `features.json`: the Ø57.50 clear circle at 38.79 across and 81.76 down, labelled PRODUCT
  CENTER but 0.245 below the product's centre (81.515), as on the 16 Pro; the magnetic zone the full width from 46.54
  (the bump outline's bottom) down, straight-sided to 115.44, closed by an R49.39 arc whose centre (84.87, derived) is
  3.11 below the circle's. The camera corner's metal keepout and the compass (56.00, 158.58) are in `drawing.ts` only;
  sheet 4's other metal keepouts and Keepouts 1 and 2 aren't recorded.
- **Scaled:** the windows, the bump's corners (13.26, 9.62), the display's corners (10.42 at three; the fourth's
  diagonal runs along a hatch line), the corner's ends, the port's ends, the mic's outer ring (1.15).
- **Spec** (support.apple.com/121032): 227 g; focal lengths, the Ultra Wide's 120°, the Telephoto's 20°.

## What it taught

- A calibration origin moved by eye from a sibling (the 16 Pro's Detail D) passed every family check, which calibrate
  on the cameras they find, but put the overlay's every circle a pixel off (2779 red pixels): the three rings' centres,
  found at several chord offsets, put the datum 0.24 mm lower, and the red fell to 370.
- A drawing can leave a circle out of one camera of three: check every camera's rings, not just camera 1's.
- The 16 Pro's recorded Camera Control keepout width (4.20) is half the width Detail E and Section I-I draw.
- A sibling's drawing can leave a question open that this one answers: the 16 Pro's sections draw the plateau's line
  over the flash too, so what lies at 10.20 was inferred; here the plateau's line stops at the flash and the flash's
  face alone is drawn at 10.20. The 16 Pro's procedures, ported, failed on exactly that check, which is how it showed.
