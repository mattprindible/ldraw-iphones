# iPhone Duo

The iPhone Duo from Apple's dimensional drawing (`../../drawings/iphone-duo.pdf`, dated 2026-09-09,
not in the repository), built by the family's builder (`../../`). It's the family's first foldable. The part is
the phone folded shut: 84.10 x 117.80 x 11.30, the outer display on the front.

The back is the Air's plan with two cameras: a camera plateau whose only flat part is a pill, with flanks that curve
down to the back glass and out over the frame. The two cameras sit side by side on the camera line, with the flash
and the rear mic (a slot) beside them. The hinge is the volume side of the family's frame (−X). The side button
(Touch ID) and Camera Control are on the other side. The volume buttons are on the top edge, and USB-C is on the
bottom.

This drawing keeps its text, so every printed number was read with its position (`pdftotext -bbox`), then checked on
crops at 1200 to 2400 dpi. The title block numbers the sheets 1 to 7; the PDF's pages are one more.

The closest built model by shape is the Air (a pill-shaped plateau with flanks, modelled as a bump). The Duo follows
it, with its own measure.ts: the family's procedures assume a phone that is symmetric across, and the Duo isn't.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured; each approximation named; what isn't built (`notBuilt`, `magsafeZone`, `micSlot`) |
| `measure.ts` | re-measures every scaled value from the PDF and checks each view's calibration (122 readings): Detail D and the right side view (the plateau, its flank, the cameras, the flash, the mic's slot), the front view, the bottom view, sheet 5's MagSafe view, and the back view's calibration |
| `part.ts` | the drawing → `iphone-duo.dat` and `features.json` |
| `check.ts` | the part laid over Detail D, the back view, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

**What the builder can't say.** The builder assumes a phone that is symmetric across, with one corner, one profile and
a centred display. The Duo isn't:

- **The hinge corners** (Detail AY, about R1) aren't Detail A's R17. Detail A is labelled CORNER PROFILE (ALL FOUR
  CORNERS), read here as the open phone's four outer corners. The part has Detail A's corner at all four corners, so it
  shows red at the hinge corners in the front and back overlays.
- **The hinge's profile** (Detail E) is one rounded spine across both halves. The part uses Detail B's side profile
  all round instead.
- **The seam.** The two halves meet in a seam round the three other sides. At the top and the bottom each half rounds
  on its own (the side view shows a notch about 1.5 deep between them). Detail B runs flat across the seam, so the part
  has none.
- **The display** sits 4.13 from the hinge and 2.71 from the other side. Its corners are R9.66 away from the hinge and
  R0.89 at it. The builder centres it, so the part has the printed 77.17 centred (3.47 in on each side), with R9.66 at
  all four corners.
- **The front camera** is a Ø6.07 punch hole at 73.39 from the hinge, 10.62 down. The builder's island is centred
  across, so it isn't drawn.
- **The volume buttons** are on the top edge: centres 44.35 and 57.73 from the hinge, 10.88 long, 0.45 proud. The
  builder's buttons go on the long sides, so they aren't built.
- **The screws.** The bottom view has two rows of screws: the back half's pair (2.670 from the back, built) and the
  front half's pair (on the port's line, not built).

**The plateau**, built as the Air's is: a bump with the pill as its top, a flank, and an outline on the back glass.

- **The pill:** 3.64 above the back plate, from 4.70 to 25.80 down and 4.94 to 60.56 across (all dimensioned). Its
  ends are arcs of R10.32 (fitted). The left end is centred on camera 1. Each end has a 0.46 straight.
- **The outline:** 34.62 down and 69.37 across (dimensioned, the latter its extreme). At the top and the side it is
  taken at the back's start of flat (2.74), because there the flanks run on over the frame.
  - Its right end is an arc of R19.20 about the camera line, concentric with the pill's right end. A rounded rectangle
    31.88 high can't take it, and the bottom-left is a long blend.
  - So one radius (R12.83) is used: the mean of three diagonals (R9.22, R19.52, R9.74). That puts the part's outline up
    to about 2.8 off the drawn one at the corners (red in Detail D and the back view).
- **The flank:** the side view's silhouette below the pill, read on nine rows from 26.0 to 30.0 down (3.25 to 0.24),
  then straight to the outline. The right end's flank (8.81) is as long as the bottom's (8.82). The top and the side
  take the same curve in proportion.
- **The camera glass** is 5.72 out. The rings are Ø16.20 (dimensioned, the outermost circle). The windows are Ø13.21
  (scaled, the innermost circle).

**Part B's three features:**

- **Rear mic:** a slot, 3.32 x 1.50, centred at 49.58 across and 10.95 down. It lies on the pill, so the builder
  draws it on the bump's top. The builder's mic is a disc, so it's built as the slot's width, Ø1.50, at its centre.
  The slot's length is in `micSlot`, not in features.json. measure.ts checks the slot's ends, its edges and its centre
  on their extension lines.
- **Flash keepout:** Section T-T. All of the section's distances are "to back glass", so 11.30 is added to give the
  family's "from the front".
  - The inner cone, 121°, has its base Ø6.00 on the plateau's flat.
  - The inner cone meets the outer cone, 155°, at 4.73 out from the back plate (16.03 from the front), where the
    outer cone's base is Ø9.87. Worked through, the inner cone is Ø9.85 there.
  - Neither apex is dimensioned. Worked from those numbers, the inner apex is 13.24 from the front and the outer apex
    14.94 (on the plateau's flat).
  - The outer base diameter (9.87) has no field.
- **MagSafe:** the clear circle is Ø61.50 at 41.30 across and 61.31 down: 0.75 toward the side-button edge and 2.41
  below the product's middle. The magnetic zone isn't the family's shape, so it is in `magsafeZone` and not in
  features.json:
  - It runs from 25.80 down, from the side-button edge to 82.21 (not the full width).
  - An arc of R49.39 closes it, centred on MagSafe's column (41.30), 64.42 down, so its lowest point is 113.81.
  - measure.ts checks the arc at x = 20 and y = 95 against that centre. Centred on the product's middle, the arc would
    miss the y = 95 crossing by 0.75.
- **Cameras:** sections S-S and V-V give each keepout cone's apex as "to back glass": outward of it, inside the
  plateau, at 2.69 and 1.25. From the front that is 13.99 and 12.55.
  - The Ultra Wide's 123° cone encloses its 120° (spec). The Fusion's 84° cone encloses a 26 mm lens's 79.5°.
  - The spec's 2x Telephoto is a crop of the Fusion's sensor, not a third lens.

**What the drawing says that doesn't add up:**

- **The display's numbers don't close.** 4.13 + 77.17 + 2.71 = 84.01 and 2.71 + 112.28 + 2.71 = 117.70. The front view
  draws the offsets (measured 4.14, 2.73, 2.72, 2.76), so the active area scales 77.23 x 112.32. Each is within the
  lines' 0.32 of the printed size.
- **The bottom view draws the phone 11.00 thick**, 0.30 thin. The family's other drawings are up to 0.15 thin. Its
  outlines are probably the frame's, not the glass's. The port's 2.825 is taken from the part's front face and the
  holes' 2.670 from its back face. measure.ts records this as a known check.
- **The glass:** 79.93 x 115.04. It is 1.33 in on three sides, so 2.84 at the hinge, and 1.38 at each end against the
  1.33 ALL AROUND. The drawn lines span 80.13 x 115.32, within their 0.35 pen.

**Other readings:**

- **Buttons:** the side button (42.87, 2X 9.34, 3.06 wide, 0.45 proud) and Camera Control (84.97, 2X 8.55, 2.53 wide)
  both have centres 2.670 from the back, on the back half.
  - Camera Control stands 0.075 proud and the drawing gives it no chamfer, so it's built as a button.
  - Its keepout (25.00 x 2x 2.45, sheet 2) is in `notBuilt`, not in features.json.
- **USB-C:**
  - The port is 38.42 to 46.99 from the hinge, 2.825 from the front: in the front half. Its height is 2.60 (scaled).
  - The keepout is 12.45 x 6.60, centred 42.70 from the hinge.
  - The face carrying the bottom openings runs onto the rounding to 0.23 in, past the flat band, because the port is
    taller than the band.
- **Bottom holes:** eight Ø1.53 holes, dimensioned to their centres, on the 2.255 pitch. The leaders' arrowheads lie
  on the holes at 60.85 and 67.61, so measure.ts leaves those two out.
- **Not modelled:** the receiver (Detail A: 13.14 long, 0.25 from the top, on the top edge's rounding), Touch ID's
  keepout, the Taptic Engine keepout, the antenna zones, the front sensors (Detail M), the magnets and hall sensors
  (sheet 6), the inner display and the fold angles (sheets 4 and 7).
- **Spec** (apple.com/iphone-duo/specs):
  - 254 g, folded 117.8 x 84.1 x 11.3.
  - 48MP Fusion: 26 mm, ƒ/1.6.
  - 48MP Ultra Wide: 120°, ƒ/2.2.
- **Assumed, for a render:** the depths of the holes and the port.

## Overlays

Red pixels (the part only):

- **Detail D, 1924:**
  - the plateau's outline (the one-radius corners against the drawn arc and blend, and its top at 2.74 where the
    drawing has flank);
  - the hinge corner at the top right.

  The cameras' rings and windows, the flash, the pill, and the mic's disc inside its slot lie on the drawing's lines.
- **Back view, 2584:** the hinge corners (R17 against about R1), and the plateau's outline as in Detail D.
- **Front view, 3542:** the hinge corners, and the display's sides and corners (centred, R9.66 at all four, against
  4.13 / 2.71 with small corners at the hinge).
- **Bottom view, 2116:**
  - the hard edges at the flat band's ±2.91 between the ends and the openings;
  - the plateau's silhouette below;
  - fringes at the port.

  The holes, the screws and the port lie on the drawn ones.

## What it taught

- **A foldable breaks the family's symmetry.** One corner, one profile and a centred display can't describe a hinge.
  The builder would need a hinge side with its own corner, profile and display offset, buttons on the top edge, an
  off-centre punch-hole camera, a slot-shaped mic, a second row of screws, and a MagSafe zone with its own width and
  centre.
- **A drawing's distances can be "to back glass".** Sheet 3 says so outright, and its apexes lie outward of the back
  plate, inside the plateau. The family's "from the front" adds the thickness.
- **The family's back-view calibration needs two camera centres apart in both axes.** Two cameras on one line defeat
  it, as one camera does. Detail D's extension lines serve instead.
- **A text-bearing PDF still needs its leaders followed.** The 44.05 extension line kinks above the MagSafe view, and
  a calibration row through the kink put the datum 0.4 off. A row nearer the phone, where the lines run straight,
  fixed it.
