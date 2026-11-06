# The iPhone family

Thirty iPhone models, from the 12 mini to the 18 Pro Max, the 16e, 17e, Air, Duo and SE (3rd generation), each built
from Apple's dimensional drawing. Apple draws every model on the same plan (a corner and an edge profile, the back with
its cameras, the front, the side views with their buttons, the bottom with its ports), so one builder serves them all
and each model supplies its own numbers.

## Layout

| Path | What it is |
|---|---|
| `drawing.ts` | the shape every model's drawing fills (`Phone`): the numbers the builder reads, each a `Value` with its source |
| `part.ts` | the builder: a `Phone` → the LDraw `.dat` and `features.json` |
| `measure.ts` | re-measuring a model's scaled values from its PDF, with per-model `Choices` |
| `check.ts` | overlays of a part on its drawing's views |
| `body.ts` | a phone as a body to place by contact, and its cameras read back from a placement |
| `scene.ts` | every model upright, upside down and flat, camera heights read back → `camera-heights.json` |
| `models.ts` | the list of models; the library, the tests and the scenes read it |
| `*.test.ts` | the checks every model passes (`family.test.ts`), the builder's own (`part.test.ts`), the scenes' (`scene.test.ts`) |
| `models/iphone-<model>/` | one folder per model: its `drawing.ts`, `measure.ts`, `part.ts`, `check.ts`, `README.md`, and the generated `.dat` and `features.json` |
| `drawings/` | Apple's PDFs, one per model, named `iphone-<model>.pdf` (not in git) |

`models/iphone-13-mini/` is the worked example, the first model built: its README and tests go furthest.

## The drawings

The PDFs carry Apple's proprietary notice, so they stay out of git (`.gitignore`). Apple publishes them, free and
without an account, at https://developer.apple.com/accessories/dimensional-drawings/. Download each model's drawing
and save it as `drawings/iphone-<model>.pdf`, the name the model's `measure.ts` expects. Only re-measuring and the
overlays need them: without them the parts still build, and the re-measure tests skip.

## Camera heights

`camera-heights.json` gives, for every model and every rear camera, the height of its optical reference (the apex of
Apple's keepout cone for it) above the floor in three poses, read back from a scene and checked against the same number
worked by hand from the drawing. `node iphone/scene.ts` regenerates it; `scene.test.ts` fails if it's stale or if any
reading disagrees with its hand calculation.

## Adding a model

See [`docs/METHOD.md`](../docs/METHOD.md): copy the closest model, read the drawing, measure what isn't dimensioned,
build, check the overlays, and register it in `models.ts` and `library/README.md`.
