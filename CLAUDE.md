# ldraw-iphones

LDraw parts of Apple's iPhones, built from Apple's dimensional drawings, with each model's cameras, keepouts and buttons
as data. Read `README.md` (layout, commands, the method, conventions), `docs/METHOD.md` and `docs/LEARNINGS.md` before
changing anything; `iphone/models/iphone-13-mini/README.md` is the worked example. A model's folder is
`iphone/models/iphone-<model>/` (written `<model>/` below), its drawing `iphone/drawings/iphone-<model>.pdf`.

## Working rules

- **Every number has a source.** A value from a drawing goes in `<model>/drawing.ts` as a `Value` with its kind and
  where it came from; an assumption is named as one. Never type a dimension into geometry or a check directly.
- **Read drawings from high-resolution crops**, and follow leaders, not just labels. When the drawing contradicts
  itself, record the reading and the evidence for it.
- **Scaled values must be re-measurable**: add the scan to `<model>/measure.ts`, not a scratch script.
- **Check a part against its drawing**: `<model>/check.ts` lays it over the drawing's views; look at the overlays.
- **Spatial claims are measured in a scene**: place the part, read the number back, and compare it with a hand
  calculation from the drawing's printed numbers (`iphone/scene.ts`). A mismatch is a finding: explain it, don't tune
  it away.
- **Fix the builder, not each model**: when `iphone/part.ts` can't express what a drawing shows, change the builder and
  require every other part to rebuild byte for byte.
- **Give each important check a negative control**, and keep it as a test.
- **Before a refactor that could change results, snapshot the outputs** (every `.dat`, `features.json`, measure output,
  `camera-heights.json`, `library/dist/`, the overlays) and require the new code to reproduce them, or explain the
  difference.
- **Erasable TypeScript only** (Node runs `.ts` directly): no enums, namespaces or parameter properties. Run
  `npm test` and `npm run typecheck`.
- **Drawings stay out of git**: they carry Apple's proprietary notice. They're public at
  https://developer.apple.com/accessories/dimensional-drawings/.
