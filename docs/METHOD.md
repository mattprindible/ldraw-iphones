# Adding a model: reading a drawing and building the part

How every iPhone model here was built, step by step, with the traps we met. The principles are in the README's
"The method"; the findings behind them in [`LEARNINGS.md`](LEARNINGS.md). This is the hands-on version, for the next
model (an iPhone first, but the steps hold for any drawn part).

A model is a folder `iphone/models/iphone-<model>/`, read from `iphone/drawings/iphone-<model>.pdf` (Apple's drawing;
not in git, see [`iphone/README.md`](../iphone/README.md)).

## What a model is

Copy the closest existing model. Each folder has:

| File | What it is |
|---|---|
| `drawing.ts` | every number as a `Value` with its kind and source, the PDF regions measured, and `export const phone: Phone` |
| `measure.ts` | re-measures every scaled value from the PDF (`node <folder>/measure.ts`) |
| `part.ts` | writes the `.dat` and `features.json` from `drawing.ts` (`node <folder>/part.ts`) |
| `check.ts` | renders the part over the drawing's views (`renders/*-overlay.png`, not in git) |
| `README.md` | what was read, known and assumed, what it taught |
| `iphone-<model>.dat`, `features.json` | generated, kept; a test fails if they're stale |

The shared code does the rest: `iphone/drawing.ts` (the `Phone` shape), `iphone/part.ts` (the builder),
`iphone/measure.ts` (re-measurement and its `Choices`), `iphone/check.ts` (the overlays).

Good starting points, by feature:

- `iphone-13/`, `iphone-13-mini/`: notch, Lightning, ring/silent switch, glass-step edge profile, square bump.
- `iphone-13-pro/`, `iphone-13-pro-max/`: three cameras, LiDAR window, rectangular bump, edge datum quirks.
- `iphone-15-pro/`: Dynamic Island, USB-C, Action button, a receiver straddling the glass edge, LiDAR as a keepout zone.
- `iphone-16-pro/`: Camera Control (outlines and keepout), an edge profile that runs past the glass edge, views at
  different scales on one sheet.
- `iphone-16/`: a pill bump (a stadium: radius exactly half the width) with the flash beside it (`flash.onGlass`).
- `iphone-17-pro/`: a camera plateau (`plateau`), an asymmetric front/back edge profile (`edgeBack`), a round LiDAR
  window, bottom-view calibration on extension lines (`bottomExtension`).
- `iphone-air/`: a plateau whose flanks curve down to the glass (`bump.flank`).
- `iphone-duo/`: a foldable, folded shut, with its own `measure.ts` (the shared one assumes a symmetric phone).

## Reading the drawing

1. `pdfinfo`, then render each sheet at 600 dpi (`pdftoppm -f N -l N -r 600 -png`), look at a small thumbnail, then
   crop each view and detail (`magick … -crop WxH+X+Y +repage`) and read the numbers from the crops. Where a sheet
   has text, `pdftotext -f N -l N -bbox` gives numbers with positions; sheet 1 is usually outlined, so crops.
2. Follow leaders and extension lines, not labels. Traps we met:
   - labels contradicting leaders (plateau vs camera glass; "camera 1" on a section through camera 3);
   - hole groups dimensioned to the holes' outer edges (the 13s) or their centres (15 Pro on): check by the 2.255 mm
     pitch or by chords at 1200 dpi;
   - half-lengths (`2X 8.05` is centre to each end) vs full lengths; "from back" vs "from front" by where the arrows
     land (third-angle projection: the back is the bump side);
   - boxed numbers can be datum values (the 13 Pro's 0.21);
   - a dimension can run from another feature, not the product's edge (the notch from the active area's top);
   - keepout zones (big circles overlapping a camera, outlines on later sheets) aren't windows or the plateau;
   - a section can be drawn on another model's body: measure its faces against sheet 1 first;
   - a printed number can match a different circle from the one its arrow touches.
3. Identify the cameras by their keepout cones (the sections on sheets 2–3) against the fields of view and focal
   lengths on Apple's tech specs page; record mass and camera specs from it, kind `spec`.

## Measuring what isn't dimensioned

4. Find each view's position at 1200 dpi with `runs()` from `src/raster.ts` (the outer edges, the datum lines). Views
   on one sheet can have different scales (23.05, 34.57, 46.06 and 57.6 px/mm seen). Guess the calibration closely: a
   scale 1% out makes the circle finder pick different concentric rings either side. Watch for dashed callout boxes
   just outside the phone (taken for its top edge once).
5. Run `node iphone/models/iphone-<model>/measure.ts` until every line is ✓, or ≠ with its reason recorded in `known`.
   Use `Choices` to move scans off crossings: corners crossed by hatching, dimension lines or leaders, rows over
   buttons or centre lines (`bumpScanAt`, `frontRow`, `activeColumn`, `bottomRow`, `bottomExtension`). Corner-radius
   guesses must be close: a far guess finds the wrong arc.

## Building and checking

6. `node iphone/models/iphone-<model>/part.ts`, then audit the part:
   `node -e "import('./src/ldraw.ts').then(m=>{const d=require('fs').readFileSync('iphone/models/iphone-<model>/iphone-<model>.dat','utf8');console.log(m.audit(d),m.badConditionals(d))})"`.
   Degenerate, warped, concave and inconsistent must be 0, volume above 0, bad conditionals 0. If the triangulator
   throws, an opening or the display probably crosses a face boundary.
7. `node iphone/models/iphone-<model>/check.ts`, then look at every overlay: black where part and drawing agree, blue
   the drawing only, red the part only. Count the red
   (`magick X.png -fx "(r>0.8 && g<0.3 && b<0.3)" -format "%[fx:mean*w*h]" info:`). Red outside a detail's dashed
   boundary, or at a feature placed from another sheet, is expected; red on outlines, cameras, holes or the island is
   a finding to resolve.
8. Write the model's `README.md` like the others: files, known and assumed, what it taught.
9. Register it: an import pair and a row in `iphone/models.ts`, a row in `library/README.md`'s table (title and
   drawing date from its `drawing.ts`), and the count in the top-level README. Then `npm run library`, `npm test`,
   `npm run typecheck`, and `node iphone/scene.ts` (its camera heights).

If the builder can't express something the drawing shows, model it as faithfully as the existing features allow,
name the approximation in `drawing.ts`, and fix the builder rather than working round it in the model
(`LEARNINGS.md`: "Fix the builder, not each model"). Snapshot every model's outputs first, and require them to
rebuild byte for byte.

## The newer features: rear mic, flash keepout, MagSafe

- **`rearMic`** (a `Disc`: `fromSide`, `fromTop`, `diameter`, in the back view's coordinates). Built flush on the bump's
  top or the back glass, whichever its centre is on; a centre on the bump's slope is refused. In the back-view overlay
  the mic's circle should lie on the drawn one.
- **`flash.keepout`** (features.json only): the flash's keepout section, where there is one. An inner and an outer
  cone by their full angles (`inner`, `outer`), with whatever the section dimensions: the inner cone's apex
  (`apexFromFront`) and the `transitionFromFront` to the outer cone (the 12 Pro's Section G-G); or each cone's apex
  (`apexFromFront`, `outerApexFromFront`) and the inner cone's `innerBaseDiameter` (the 18 Pro Max's T-T). "To cover
  glass" reads from the front (screen) face, like the cameras' `coneApexFromFront`; check it against the section, and
  check whether a dimension ends at the cone's apex or its base.
- **`magsafe`** (features.json only): the clear circle (`fromSide`, `fromTop`, `diameter`) and the magnetic zone round
  it (`zoneFrom`, `zoneSidesTo`, `zoneRadius`: full width from `zoneFrom` down, straight-sided to `zoneSidesTo`, closed
  by an arc through those corners). Work the arc's centre out from the drawing; it isn't always the product centre.
  A zone of another shape goes in `drawing.ts` and stays out of these fields.
