# ldraw-iphones

LDraw parts of Apple's iPhones, built from Apple's dimensional drawings: **30 models**, from the 12 mini to the
18 Pro Max, the 16e, 17e, Air, Duo and SE (3rd generation). Place them among LEGO parts in BrickLink Studio or any
LDraw tool, or programmatically, and design around them: each part comes with its rear cameras, keepouts and buttons
as data, so you can tell where a camera looks from and what a mount must leave clear.

## Using the parts

Everything you need is in [`library/dist/`](library/dist/README.md):

- `parts/*.dat`: one LDraw part per model, BFC certified, with edge and conditional lines. Each is self-contained (it
  uses no other LDraw files).
- `features/*.json`: each part's rear cameras (optical reference, axis, field of view, keepout cone), flash, rear mic,
  LiDAR, Camera Control and MagSafe keepouts, in the part's own frame (mm and LDU).
- `examples/`: a model to open straight away (an iPhone 13 mini in a cradle on a LEGO hub).
- `README.md`: how to install them (LDraw tools, BrickLink Studio), their frame and colours; `LICENSE.md`: CC BY 4.0.

For code: [`iphone/camera-heights.json`](iphone/camera-heights.json) gives every camera's height above the floor
with the phone upright, upside down and flat, each checked against the drawing.

**Accuracy:** dimensioned features are as exact as Apple's drawing (its tolerances are ±0.05 to ±0.4 mm); features
measured off the drawing are within about 0.05 mm. Each model's `README.md` lists what was read, assumed and left out.

## What's here

```
src/                      reading PDFs, writing LDraw, geometry, rendering (for any drawn part)
iphone/                   the family: the shared builder, scenes and tests (iphone/README.md)
  models/iphone-<model>/  one folder per model: its drawing's numbers, re-measurement, part and README
  drawings/               Apple's PDFs (not in git)
  drawings.json           each drawing's SHA-256; drawings.ts fetches and verifies them
  camera-heights.json     every camera's height in the standard poses
library/                  the parts gathered for handing out: build.ts → dist/
docs/
  METHOD.md               adding a model: reading a drawing and building the part, step by step
  LEARNINGS.md            what we found, tagged measured, observed or inferred
```

The worked example is the **iPhone 13 mini** ([`iphone/models/iphone-13-mini/`](iphone/models/iphone-13-mini/README.md)),
the first model built.

## Working on it

**Requirements:**
- **Node 24 or later:** `.ts` runs directly, so erasable syntax only (no enums, namespaces or parameter properties).
  `npm install` fetches the rest (TypeScript, three.js and playwright-core for the renderer).
- **Google Chrome:** the renderer drives the installed Chrome (through playwright-core) for the overlays.
- **poppler** (`pdftoppm`) and **ImageMagick** (`magick`): reading the drawings and composing the overlays.
- **Apple's drawings in `iphone/drawings/`,** only to re-measure and for the overlays: `npm run drawings` fetches
  them from https://developer.apple.com/accessories/dimensional-drawings/ and checks each against its recorded SHA-256
  (see [`iphone/README.md`](iphone/README.md)).

```sh
npm install
npm run drawings                           # fetch Apple's drawings and verify them
npm test                                   # every test (the re-measure tests skip without the drawings)
npm run typecheck
npm run library                            # every part into library/dist/
node iphone/scene.ts                       # every model in the standard poses → iphone/camera-heights.json
node iphone/models/iphone-13/part.ts       # one model: drawing.ts → its .dat and features.json
node iphone/models/iphone-13/measure.ts    #   re-measure its scaled values from the PDF
node iphone/models/iphone-13/check.ts      #   the part laid over the drawing's views (renders/)
```

To add a model, follow [`docs/METHOD.md`](docs/METHOD.md).

## Automation and releases

GitHub Actions (`.github/workflows/`) runs three things:

- **Test** (`test.yml`), on every push to `main` and every pull request: fetches the drawings, then runs
  `npm run typecheck` and `npm test`, re-measuring included.
- **Release** (`release.yml`), on pushing a version tag: runs Test, and only if it passes zips `library/dist/` as
  `ldraw-iphone-parts-v<version>.zip` and publishes it as a GitHub release, with notes from the commits since the
  last one.
- **Apple's drawings** (`apple-drawings.yml`), weekly: fails, and so emails you, if Apple has published a new iPhone
  drawing, revised one or taken one down.

To release, push the commit as usual, then tag it:

```sh
git tag v1.1.0 && git push origin v1.1.0
```

Pull requests to `main` must pass Test before they merge (a ruleset; the repository's admins can push directly).

Version numbers: the major for a change that breaks how parts are used (a renamed file, a moved origin or frame),
the minor for new models or changed geometry or features, the patch for corrections and documentation.

## The method

Each step names the code that carries it. The principle throughout: every number traces to the drawing or is named
as an assumption, and every spatial claim is measured, not worked out in the head.

1. **Read the drawing up close.** Apple's drawings are vector PDFs whose labels are often outlined, with no text to
   extract. Render the sheet at 600 dpi or more (`pdftoppm`) and crop each detail; read numbers from the crops, never
   from a thumbnail. Read the leaders too: which line a dimension lands on can contradict its label.
2. **Record every number with its source** in the model's `drawing.ts`, as a `Value` (`src/provenance.ts`):
   dimensioned, scaled, derived, spec, third-party or inferred, with the sheet, detail and label. Record contradictions
   in the drawing and how you read them.
3. **Measure what isn't dimensioned** (`src/raster.ts`). Calibrate on two dimensioned features (px/mm in each axis and
   the datum), check the calibration on others it didn't use, then find each line as a dark run near where you
   expect it. A circle's centre comes from chords offset from it (its centre lines run through the middle). Put the
   procedure in the model's `measure.ts`, so the scaled values can be re-measured and tested.
4. **Write the part** (`src/ldraw.ts`, `iphone/part.ts`). Choose its frame (origin, axes, LDraw's −Y up,
   right-handed) and say it in the file's header. Pass curves through the drawing's own points without overshooting
   them (`src/curves.ts`). Wind every face outward. Name each approximation where it's made.
5. **Check it against the drawing.** Render the part at the drawing's exact scale (`src/render/`) and lay one over the
   other, in every view that dimensions something (black where they agree, blue the drawing only, red the part only).
   Assert the render's axes first, or a mirrored part can pass. Test its extents against the dimensions.
6. **Give its features as data** in its own frame: each camera's optical reference and axis, its keepout cone, its
   field of view, the flash's and MagSafe's keepouts (`features.json`).
7. **Measure it in a scene.** Place the part (`iphone/body.ts`, `src/convex.ts`), read its cameras back from where it
   rests, and compare each with the same number worked by hand from the drawing (`iphone/scene.ts`). Keep a negative
   control for each check that matters: a check that can't fail checks nothing.

`src/` in brief: `provenance.ts` (values and how we know them), `raster.ts` (rendering a PDF region, finding lines and
circles, calibration, overlays), `curves.ts` (monotone cubics, insets, circles), `triangulate.ts` (flat faces with
holes), `ldraw.ts` (writing parts and MPDs; an audit of what LDraw asks of faces), `geom.ts` (vectors and rotations,
row-major as in an LDraw type 1 line), `convex.ts` (bodies as convex pieces), `place.ts` (a body to place; the floor
check), `render/` (a headless LDraw renderer: three.js in Chrome, with LDraw.org's `LDConfig.ldr` colour table).

## Conventions

- **Units:** mm in code; LDU (2.5 per mm, 20 a stud) only at LDraw's edges (`src/ldraw.ts`).
- **World:** LDraw's: −Y up, the floor at y 0, right-handed. A placement is (m, t): world = m·p + t, m row-major.
- **A part's frame** is stated in its file's header and in its features: origin at the product centre, −Y out of the
  screen, +X toward the side-button edge, +Z toward the top.
- **Generated files:** `renders/` is output, not in git. The `.dat`, `features.json`, `camera-heights.json` and
  `library/dist/` are generated but kept, and a test fails if they're stale.
- **A part's header** is LDraw's (title, `Name:`, `Author: Matt Prindible [mattprindible]`, `Unofficial_Part`, the CC BY
  4.0 line word for word, `BFC CERTIFY CCW`, keywords, history), and its curved surfaces carry conditional lines, so
  it behaves in any LDraw tool as a library part does. The parts are shared directly, not through LDraw.org's library
  (it takes LEGO parts only).
- **Drawings stay out of the repository:** each PDF carries Apple's proprietary notice (`.gitignore`).
- **Not affiliated with Apple.** iPhone is a trademark of Apple Inc.

## Contributing

Found something wrong with a part? [Open an issue](https://github.com/mattprindible/ldraw-iphones/issues/new/choose):
it asks for the model, the release and how you know. To fix it yourself: `npm install`, `npm run drawings`,
`npm test`, then follow `CLAUDE.md` (Claude Code reads it on its own) and `docs/METHOD.md`; the pull request template
has the checklist.

