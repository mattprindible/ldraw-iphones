# Learnings

What building the iPhones from Apple's drawings taught us (the 13 mini first, then the other 29), for the next drawn
part. Each entry is tagged with how we know it:

- **measured**: a number from a scan, a scene or a check, reproducible from the code here
- **observed**: seen in a render, an overlay or a drawing up close
- **inferred**: a reading that fits the evidence but isn't stated by it

## Reading drawings

- **Labels can contradict leaders; follow the leaders.** (observed) The side view's "2.51 back glass to camera
  plateau" lands on the lens rings, the outermost line; "1.48 back glass to rear camera glass" on the bump's flat
  top. Section G-G's 83° cone is labelled "rear camera 1", but G-G cuts through camera 2 (Detail H) and its own 6.33
  names camera 2. Recorded with the reading in `drawing.ts`.
- **A dimension can start from a line you didn't expect.** (measured) Detail Y's 32.07 runs from the back glass's
  heavy edge (about 1.0 from the sides), not from the bump's outline (1.15); the outline is the 31.97 square. The first
  bump outline was measured off the heavy line; the overlay showed red at its corners.
- **Keepout geometry carries optical information.** (inferred) Each rear camera's keepout cone (124°, 83°) just encloses
  its field of view (the Ultra Wide's 120°, the Main's ~80°), which says which camera is which; each cone's apex,
  dimensioned from the screen, is the best optical reference the drawing gives (the entrance pupil isn't).
- **A dimension's datum can be another feature, not the part's edge.** (measured) The notch's "5.77 ACTIVE AREA
  CUTOUT" runs from the active area's top (the 3.27 line), not the product's edge: its bottom scales 9.02 from the top
  (3.27 + 5.77 = 9.04). Detail Z's 3.82 to the port lands on the back glass, not the screen as first recorded.
- **An extension line can touch a hole's edge, not its centre.** (measured) The 13 mini's two holes left of the port
  are dimensioned 17.74 and 21.53; read as centres they sat 3.79 apart, off the drawn holes, and looked like the
  drawing contradicting itself. The iPhone 13's drawing dimensions only each group's end holes, its extension lines
  plainly tangent: half a hole in, every hole of both models falls on one 2.255 mm pitch, where they're drawn. Check
  where an extension line meets a circle before calling a drawing wrong.
- **A dimension can land anywhere in a heavy stroke.** (measured) The iPhone 13's flash is drawn with a 0.24 mm pen:
  its middle traces Ø6.165, its outer edge Ø6.4, the label says 6.28. The back glass's 0.33 mm edge swallows the
  bump outline's 1.15. A check on a heavy line passes if the printed number falls within the stroke, and says so.
- **A scan along a diagonal crosses dimension lines too.** (measured) The iPhone 13's bump outline first read a 9.0
  radius: its corner's diagonal met the crossing of the 32.48 extension lines 2.64 in, which is where a 9.0 corner
  would be. Passing over known lines' crossings gave 10.8 to 11.1, and the overlay's red at the corners went.
- **Concentric rings need a close guess.** (measured) The 13 Pro's back view, calibrated from its camera circles with
  a guessed scale 1.4% low, put the centres 0.1 mm off: the circle finder took a different ring of each lens on either
  side. The bump's long straight lines gave the scale (57.6 px/mm); with it, every ring sits symmetric about its
  dimensioned centre.
- **A boxed number can be a datum's value.** (inferred) The 13 Pro's Detail B labels its flat side 0.21 (boxed), and
  its insets run from there; taken from the flat side they're the 13 mini's profile. The front view's 71.52 runs
  between the flat sides.
- **A dashed line just outside the part may be a callout's box.** (measured) The 13 Pro Max's front view has Detail
  A's dashed box 1.06 above the phone; taken for the top edge (the foot, found on the glass's edge 1.06 up, kept the
  scale exact and hid it), it put the display 1 mm low against its 3.47. Look at the edge being calibrated on.
- **Leaders and boundaries cross scans too.** (observed) The 13 Pro Max's flash leader runs along a bump corner's
  diagonal, and Detail D's dashed boundary crosses another; Detail D also clips the drawing at that boundary, so the
  part shows red beyond it. Choose corners and rows that cross nothing else, and say why.
- **Each drawing has its own conventions; measure, don't assume.** (measured) The 13s dimension each hole group to its
  outer edges, the 15 Pro and 16 Pro to its centres: at 1200 dpi the chords centre on the labels, and the spans fit
  the 2.255 pitch only as centres. The 16 Pro draws sheet 1's views at three scales.
- **A leader can touch what it labels.** (measured) The 15 Pro's Ø6.92 leader ends on the flash's circle, and the two
  merge into one wide run that moved the circle's centre 0.16. Chords at several offsets, keeping the one whose
  crossings are all thin, find it at 32.17 for 32.16.
- **A drawing can disagree with its own number; record it, don't tolerate it.** (measured) The 16 Pro's island is
  drawn 0.07 below its own centre line. The re-measurement marks such a check as known, with the reason, and the test
  fails if it ever stops disagreeing.
- **A profile can run past the glass's edge.** (observed) The 16 Pro's rounding reaches the faces' flat 2.41 in, past
  the glass's 1.00; the builder starts the faces where the profile is within 0.03 of flat (1.47 in), so the display,
  2.44 in, lies on them, and draws no hard edge where the two join smoothly.
- **A label can name the wrong surface; the extension lines don't.** (measured) The 17 Pro's "1.88 BACK PLATE TO
  REAR CAMERA GLASS" spans from the plateau's extension line (2.56 out) to the camera glass's (4.44): 1.88 above the
  plateau, not the back plate.
- **Not every outline is the part.** (observed) The 17 Pro's sheet 4 dimensions an outline 58.01 down with R12.00
  corners; it's an antenna keepout. Detail D's own outline puts the plateau's edge at 47.93.
- **A second drawing tests the first's readings.** (observed) The iPhone 13's labels sit where their leaders land
  ("1.50 camera plateau" on the bump's top, "2.59 rear camera glass" on the outermost line; the 83° cone labelled
  camera 2): the 13 mini's swapped plateau label and its "camera 1" on G-G were copy errors, as read.
- **Heavy strokes hide small features.** (measured) At 1200 dpi the receiver's slot and its glass cutout merge into
  one 18 px run; at 4800 dpi they separate, and the slot's top stroke still merges with the glass edge's. Measure the
  white inside the slot and widen it by half a stroke. That read 11.01 x 0.76; the 13 mini's Detail X, read again,
  dimensions the slot 11.12 x 0.85: look for a dimension before scaling, even in a detail you've read.
- **The section views give depths the plan views don't.** (observed) The cone apexes (F-F, G-G) were the only depths
  for the cameras' optics.
- **Scaling a vector drawing is accurate to about 0.05 mm.** (measured) Calibrated on the two dimensioned camera
  centres, Detail Y at 1200 dpi is 69.14 px/mm in both axes; it then gives the dimensioned 13.69 ring as 13.688, the
  8.98 flash height as 8.976, the 31.97 and 28.32 squares within 0.006 (`measure.ts`).
- **A section can be drawn on another phone's body.** (measured) The iPhone 13's and 13 Pro's sections draw the bump's
  glass 0.07 to 0.10 nearer the front than sheet 1 puts it, which is the 13 mini's body. The 14 Plus's sections draw
  the phone 0.50 thinner than its sheet 1; they are the 14's sections moved 0.50, number for number. The 18 Pro's
  T-T is the 17 Pro's keepout moved 0.13 outward, though its printed numbers are its own; the 17e's N-N is the
  16e's. Measure a section's faces against sheet 1 before taking depths from it, and say which body its numbers
  belong to.
- **A keepout cone needn't be round.** (measured) The 13s and 16s give the flash's inner cone in two sections from
  one base: 112° down the phone, 96° across it (the 17: 97°, on a narrower base). A field that takes one angle gets the larger, which encloses the other;
  the other is recorded. Where only one section cuts the flash, round is an assumption: name it as one.
- **"Cone to cover glass" can land on the base, not the apex.** (measured) The 14's 9.55, the 14 Plus's 9.05 and the
  15's 9.56 end on the strobe's face, between the inner cone's corners; the 12s' and 14 Pro's "origin" ends where the
  cone's lines cross. Follow each leader; read as an apex, the 14's 9.55 is 2.0 off the drawn crossing.
- **A shape that repeats across models still varies in its datum.** (measured) MagSafe's R49.39 arc is centred on the
  product centre on the 12s and 13 Pro, 3.10 below it on the 13, 13 Pro Max, 14 and 15, 0.94 below on the 13 mini;
  the 14 Plus and 14 Pro Max use other radii, and the 17e's zone is a whole circle with an arc top. The clear
  circle's own centre can be off the product's: the 17 Pro and 18 Pro put it 2.735 below, the Air's and 16 Pro's
  "PRODUCT CENTER" sits 0.25 below half the length. The 17 Pro's zone starts on the plateau's edge, the 17 Pro Max's
  3.98 below it. Work each centre and edge out from its own drawing and check the drawn line; a sibling's reading is
  evidence for where to look, not a measurement.
- **A printed number can match a different circle from the one its arrow touches.** (measured) The 14's and 14 Plus's
  mic arrows land on the outer of three circles (Ø2.39), but the printed 2.10 is the dashed middle one; the 15's
  arrow lands on its 2.10. And the 14 Pro's MagSafe zone top is printed -28.29 but drawn at 45.61, on the bump's
  outline, with nothing drawn at 28.29. The Air's T-T prints the flash cone's base Ø6.13, but draws it 6.00, as its
  U-U prints it. Take the number as printed or as drawn, say which, and keep the other as a known ≠.

## Building the part

- **A spline through a drawing's points can overshoot them.** (measured) A Catmull-Rom through Detail X's corner points
  bulged 0.017 mm past the phone's edge; a monotone cubic (Fritsch-Carlson), each half from its own points and tangent
  at the ends, passes through all seven and stays inside.
- **Wind faces consistently, or half of them vanish.** (observed) With mixed winding the renderer culled the screen;
  `BFC NOCERTIFY` didn't stop it. Winding each face away from a point inside its convex piece fixed it.
- **Conditional lines can't be seen here, so check them by shape.** (inferred) The renderer (`src/render/`) skips type 5
  lines in its line art. Each one is checked instead as LDraw's own `p/4-4cyli.dat` has them: its two control points on the faces
  either side, off the line and on opposite sides of it (`badConditionals`, with negative controls).
- **Assert the render's axes before trusting an overlay.** (inferred) A mirrored part overlays a symmetric drawing
  nearly as well; the camera's right and up vectors from the renderer rule it out.
- **The drawing's numbers fit LEGO uncannily.** (measured) The phone is 64.21 mm wide: 8 studs is 64.0 in LDraw, so it
  goes 0.21 mm into an 8-stud gap there (real bricks have about 0.1 mm play a side: a marginal fit). It's 7.65 mm thick
  where a module's gap between two beam faces is 8.00: a slot one module wide holds it with 0.35 mm to spare.
- **The buttons change the fits.** (measured) Across its buttons the phone is 65.11 mm (the side button opposite the
  volume buttons, 34.6 to 52.8 from the top) and 64.81 at the ring/silent switch: an 8-stud gap only takes its lower
  75 mm, below the buttons. Lying on its side it stands on a button and rocks 0.4° onto its bottom corner.
- **A face with holes is one region, not quads.** (observed) Ear clipping with bridged holes (`src/triangulate.ts`)
  gives a screen with its notch and an edge with its ports from the drawing's outlines, every corner shared with the
  faces round it: the audit finds no open edges there, only where the bump, a ring, the flash or a button stands on a face.
- **Fix the builder, not each model.** (observed) Building the 12 to the 18 Pro in parallel, agents told not to touch
  shared code each worked round its gaps: the 15 and 16 wrote their face point 3.90 for 3.905 (the builder took a face
  at the profile's last point for a ring in the curve, and threw), the 16 its pill radii 0.005 under half its widths
  (a stadium repeated a point where two corners met: 4 degenerate quads), and its flash stood 1.85 off the glass on a
  bump top it isn't on. Each workaround was recorded honestly, but the next model would copy it. The builder now leaves
  the faces' stations out of the curve, drops a stadium's repeated points, and takes a flash `onGlass`
  (`iphone/part.test.ts`); every other part rebuilt byte for byte.
- **A silhouette gives a profile.** (measured) The Air's camera plateau is a flat pill whose flanks curve down to the
  back glass; Detail D gives only outlines, but the side view's silhouette is the flank below the pill, read row by
  row (eight heights, re-measured). Built as rings between the pill and its outline (`bump.flank`), the part's
  surface falls as those numbers do; the straight slope it replaced stood 1.30 mm proud, enough to mislead a
  clearance under the bar.
- **An average can hide a misread.** (measured) The 16's pill is inset 1.09 across and 1.25 down; built from their
  mean, its checks passed. Given both, the across readings came out 0.04 inside every line: the scan row, 14 down,
  was 0.2 below where the ends are meant to end, and the drawn ends are wider than semicircles. Read 20 down
  (`bumpRow`), every side lands on its number.
- **Calibrate where you'll re-measure.** (measured) The flank's heights read from the calibration's origin came out
  0.03 above the same rows read from the extension line measure.ts finds, two pixels apart: a scaled value is only
  re-measurable if it comes from the procedure that re-measures it.
- **A negative control on a model nobody has read yet goes stale.** (observed) Two family tests used "the 15 has no
  MagSafe" and "the 16 has no flash keepout" as controls; each was true only because those features hadn't been read,
  and the 15's read broke its test. A control should rest on a fact: the SE, whose drawing has Qi and not MagSafe, or
  the same phone with the field removed (`iphone/part.test.ts`).

## Placing the parts

What placing the phone among LDraw parts by contact taught us (the 13 mini on the 51515 hub and in cradles), for
anyone building with these parts.

- **A part's vertices aren't enough to collide with.** (observed) An axle has vertices only at its two ends; the phone,
  set down across its middle, fell through it to the floor. Sampling every face at 0.8 mm fixed it, and left a
  resolution: a sharp 14° edge slipped 0.09 mm between two rows of samples before it caught.
- **Bounding boxes aren't where things rest.** (measured) LDraw's 51515 hub is 80 LDU (32.0 mm) to its rim, but its top
  panel inside the rim is 79 LDU (31.6 mm): the phone stood on the hub came out 0.40 mm below the hand calculation
  until the calculation used the panel.
- **A part can have more than one resting place.** (observed) Where a tilted phone starts and the order of the moves
  decide where it comes to rest: dropped first it stood on its corner, pushed back first it slid onto the axles. Say
  which resting place a result is.
- **A scene checks the pipeline; a hand calculation checks the scene.** (measured) All 30 models' floor poses
  (`iphone/scene.ts`) match their hand calculations from the drawings' printed numbers to 0.0002 mm; on the hub, the
  one that didn't (its rim) was a real difference.
