# iPhone Air

The iPhone Air from Apple's dimensional drawing (`../../drawings/iphone-air.pdf`, dated 2025-09-09,
not in the repository), built by the family's builder (`../../`). It's the thinnest of the family (5.64). It has
one camera on a plateau across the top of the back. The plateau's only flat part is a pill. Its flanks curve down to the
back glass and onto the frame. The builder's flat-topped `plateau` doesn't fit that shape, so the part models it as a
bump.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured; each approximation named |
| `measure.ts` | re-measures every scaled value from the PDF (151 readings): Detail A's corner, Detail D (on its extension lines: the family's two-camera calibration can't run with one camera), the back view (the plateau's bottom), the right side view at 2400 dpi (the heights, the flat's extent), and the family's front and bottom views (run without a back view); checks the flash's keepout sections (T-T, U-U) and MagSafe's keepouts against what they draw, with hand calculations and negative controls |
| `part.ts` | the drawing → `iphone-air.dat` and `features.json` |
| `check.ts` | the part laid over Detail D, the back view, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **The plateau** is a pill-shaped flat 3.03 above the back glass, from 4.51 to 28.06 down (scaled). The side view's
  plateau line runs from 4.47 to 28.07, so the pill is the flat. The camera glass is 5.68 out. Around the pill, the
  flanks are concave fillets. Along the bottom they meet the back glass at an outline 34.16 down (scaled). At the sides
  and top they run out onto the frame, to the heavy line 1.05 in. The section S-S and the side view both show the
  plateau falling to nothing at the top edge.
- **How it's modelled:** a bump with the pill as its top. Its outline on the back glass is a rounded rectangle:
  - 2.58 in at the top and sides. That's the back's start of flat (Detail B). It's where the flanks meet it at the
    sides, below the camera's centre line.
  - 34.16 down at the bottom, with R7.58 corners measured on the diagonals.
  - The side view's bottom flank between the outline and the pill (`flank`): its height on eight rows from 28.20 to
    31.40 down (scaled, re-measured), concave, then straight to the outline over its last 0.25. The top and the sides
    follow it in proportion to their runs (2.58 to 4.51, to 4.78): the side view's top flank is the same curve about
    0.8 as long, running on over the edge's rounding, which the bump stops short of.

  Down the middle the built part's surface falls as the flank's numbers do (to 0.001: `iphone/part.test.ts`); the
  straight slope it replaced stood 1.30 above the flank 30.00 down. The bottom corners of the drawn
  outline are a long blend that leaves the 2.58 line 27.3 down and is level by 20 across, so one arc is off it by up
  to 1.2.
- **The pill's ends are 4.78 in, its top 4.51** (`topFrom`, `topFromTop`). The ends are arcs of R11.55 (fitted, worst 0.04 off). That's less than half the pill's
  23.55, so each end has a 0.45 straight.
- **The corner** (Detail A) has a point on its diagonal (3.78, 3.78). Unlabelled crosses where it meets the straight
  edges scale to 19.38. The 17 Pro labels its own 19.43.
- **The edge profile** (Detail B) is symmetric, flat to ±0.38. It ends at exactly half the thickness, (2.58, 2.82). It
  runs past the glass's edge (1.14 in), so the faces start at 1.49 in.
- **The display's corners** are R10.29, measured on three diagonals. The bottom-left diagonal runs along a hatch line,
  as on the 17 Pro. The corner lies 5.60 from the sharp corner, which is the outline's 3.78 plus 2.58, so the drawing's
  "2.58 ALL AROUND" holds at the corners too. The island is 20.76 x 6.07, centred 8.92 down.
- **Off the mid-plane:** the port's centre is 2.60 from the back (Detail C). The holes and screws are 2.71 from the
  back (6X 2.71). The buttons and Camera Control are on the mid-plane (2.82, dimensioned on the right side). The left
  side gives no position, and the part assumes the same.
- **The port's height** is 2.72, scaled because no dimension gives it. The outline is drawn with a 0.55 mm pen. Its
  outer edges span 2.95 across the thickness. Its 8.60 length lands 0.115 inside the same outline's outer edges, so
  the height is read the same way.
- **The bottom holes** are four Ø1.10 holes, dimensioned to their centres. There's no speaker grille. The holes are
  drawn as heavy rings: Ø1.49 outside, Ø0.4 inside.
- **Camera Control:** the chamfer is 0.12 (Section G-G). The keepout is 25.00 x 5.82. The drawing gives the width as
  2x 2.91, each measured from the centre line.
- **No SIM tray** (eSIM only): the part has none.
- **The rear mic** is drawn flush on the pill: Ø2.30, 51.34 across (its extension line rises from the mic's centre),
  16.29 down (the 3X -16.29 line it shares with the camera and the flash). Detail D draws it as one circle; the part's
  lies on it.
- **The flash's keepout** (features.json; sheet 3, T-T down the phone and U-U across): an 82° inner cone from a base
  on the strobe's face, 8.57 from the front (0.10 under the plateau's 8.67), turning at 10.37 into a 157° outer cone,
  closed 4.00 out from the base (12.57). The dimensions are unlabelled; their arrows start on the sections' front
  faces, so they're from the front, as S-S's "to cover glass". The base's numbers disagree: T-T says 6.13, U-U 6.00,
  and both sections draw it Ø6.00 (T-T's own lines, kinks and apex are Ø6.00's). The family's one circular cone takes
  6.13, the larger. Its apex is derived (5.04 from the front; Ø6.00's 5.12), as is the outer cone's (9.43, either way).
  The base's distance (8.57) and the closing line (12.57) have no field.
- **MagSafe** (features.json; sheet 4): a Ø61.50 clear circle round PRODUCT CENTER, 37.35 across and **78.34 down**,
  which isn't the middle of the length (78.09): the view draws the phone 156.18 long and the circle round the 78.34
  line. The magnetic zone runs the full width from 34.17 down (the plateau's outline, which the back view scales
  34.16), straight-sided to 113.75, closed by an R49.39 arc whose centre is 81.43 down (derived), 3.09 below the
  product centre.
- **Not drawn:**
  - the receiver (a 14.02 slot 0.45 to 1.31 down, on the glass's curved edge);
  - Detail C's 2.70 band;
  - sheet 4's other keepouts (the camera corner's conductive-material keepout above the MagSafe zone, the compass, KEEP
    OUT AREAS 1 and 2) and the front sensors' keepouts (Detail M).
- **Spec** (support.apple.com/125092): 165 g; 48MP Fusion Main, 26 mm, ƒ/1.6. Its 84° keepout cone (S-S, apex 6.92
  from the front) encloses the 26 mm lens's 79.5°.
- **Assumed, for a render:** the depths of the holes and the port.

## Overlays

Red pixels (the part only):

- **Detail D, 2503:**
  - the bump's outline 2.58 in along the top and sides, where the drawing has flank, not an edge;
  - the part beyond Detail D's dashed boundary, where the plateau's bottom corners lie.
- **Back view, 2321:** the same outline at the top and sides; the R7.58 corners inside the drawn blend.
- **Front view, 247:** fringes at the display's corners.
- **Bottom view, 99:** the plateau's ends, whose flanks follow the bottom's in proportion, against the drawn ones.

The camera ring and window, the flash, the rear mic, the outline, the island, the holes and the port lie on the
drawing's lines. (Adding the mic and the features.json keepouts left the counts unchanged.)

## What it taught

- **A corner-radius guess picks a line, not just a value.** A first guess of 8 for the display's corner crossed the
  heavy glass line (4.50 along the diagonal) and read 6.6. Inside the hatch, the first line from the sharp corner is
  the active area's outline, at 10.32.
- **A plateau can be a pill with flanks, not a bar.** Only the pill is flat. The side view's silhouette is what shows
  this: its flank falls to the back glass before the top edge.
- **A section's number can disagree with its own lines.** T-T's 6.13 base diameter has extension lines 6.13 apart,
  but they end 0.6 short of the base, and every line T-T draws (the base, the kinks, the apex) is U-U's Ø6.00. The
  re-measurement keeps it visible as a known disagreement.
- **"PRODUCT CENTER" needn't be the middle.** The Air's is 0.25 below half the length; MagSafe is centred on it.
- **The family's back-view calibration needs two camera centres apart in both axes.** One camera, with everything on
  its line, defeats it. The extension lines serve instead, as on the 16e and 17e.
