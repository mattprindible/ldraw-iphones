## What and why

<!-- What changes, which models, and the issue it fixes (Fixes #12). -->

## Checklist

The rules are in CLAUDE.md and docs/METHOD.md. Tick what applies:

- [ ] **Every new or changed number has a source**: a `Value` in the model's `drawing.ts`, giving its kind (dimensioned, scaled, derived, …) and where on the drawing it comes from, or named as an assumption.
- [ ] **Scaled values can be re-measured**: they're in the model's `measure.ts`, not a scratch script.
- [ ] **Checked against the drawing**: `node iphone/models/<model>/check.ts`, and I looked at the overlays.
- [ ] **A builder change** (`iphone/part.ts`) rebuilds every other model byte for byte, or the PR says what changed and why.
- [ ] **Outputs regenerated**: the model's `part.ts`, `npm run library`, `node iphone/scene.ts` (the tests fail if any is stale).
- [ ] `npm test` and `npm run typecheck` pass locally (`npm run drawings` first, so the re-measure tests run).
- [ ] No Apple drawings, or crops of them, are committed.
