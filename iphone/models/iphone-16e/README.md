# iPhone 16e

The iPhone 16e from Apple's dimensional drawing (`../../drawings/iphone-16e.pdf`, dated 2025-03-17, not
in the repository), built by the family's builder (`../../`). It has the iPhone 14's body, front and plan, number
for number: 146.71 x 71.52 x 7.80, Detail A's corner and receiver, Detail B's profile, the display and its notch. What
differs: an Action button where the 14 has its ring/silent switch, USB-C, a bottom edge 0.35 nearer the volume side, and
a new back. One camera stands on the back glass by itself, with no bump round it. The rear mic and the flash sit beside
it on one line.

| File | What it does |
|---|---|
| `drawing.ts` | every number from the drawing, with its source and kind; the regions measured |
| `measure.ts` | re-measures every scaled value from the PDF (75 readings): Detail D on its extension lines, the camera's heights in the right side view, the keepout cones in sections L-L and N-N, sheet 2's charging and compass circles, and the family's front and bottom views (run without a back view) |
| `part.ts` | the drawing → `iphone-16e.dat` and `features.json` |
| `check.ts` | the part laid over Detail D, the front view and the bottom view (`renders/*-overlay.png`) |

## Known and assumed

- **The camera has two stages and no bump.** The wide stage is Detail D's Ø14.97. Its flat top is 1.40 out (scaled
  in the side view) and starts at Ø13.54, the next circle in, after the wall rounds over. On it sits the narrow stage
  (Ø12.94, scaled; the side view draws it 12.89 across) carrying the lens cover 1.68 out (dimensioned). The window is
  the innermost of five circles (Ø11.89). The builder's bump is the wide stage, a circle (radius half its size). Its
  straight slope from the Ø14.97 outline to the Ø13.54 top stands in for a straight wall with a rounded top edge. At
  0.69 out, where the wall starts to round, the slope runs 0.35 inside the wall.
- **The camera** is the 48MP Fusion (26 mm, ƒ/1.6: a 79.5° diagonal). Section L-L draws its 82° keepout cone as a
  frustum on the lens cover (Ø5.91) and gives no apex depth. The apex is derived as 9.48 − 2.955 / tan 41° = 6.08
  from the front. The section confirms it: the cone's sides, fitted, meet 6.080 from the front at 82.05°, and they
  are 5.92 apart on the lens cover's line, which sits 1.680 from the back.
- **The flash** (29.68, 13.32, Ø3.75) lies on the back glass (`onGlass`). Its keepout (Section N-N, in features.json)
  starts on the glass: an 80° inner cone from Ø6.00 on the glass's face to the transition 0.82 out (Ø7.37), then a
  155° outer cone. N-N dimensions the transition TO BACK GLASS, not to cover glass, so the family's from-the-front
  numbers are 7.80 on: transition 8.62 (derived). Neither apex is dimensioned. Derived from the cones, the inner apex
  is 4.22 from the front (3.58 inside the phone) and the outer 7.80, on the glass's face. measure.ts fits the drawn
  sides: 79.93° and 154.93°, apexes 4.215 and 7.800, Ø5.99 on the glass, Ø7.37 at the kinks, which lie 0.825 out. The
  three numbers agree (6.00 + 2 x 0.82 tan 40° = 7.376). The hatched keepout is closed by a line about 3.4 out, which
  isn't dimensioned and isn't recorded.
- **The rear mic** (Ø1.30) is drawn flush on the back glass (`rearMic`), 10.98 from the camera's centre, outside the
  wide stage. 24.30 is across: the ordinate above Detail D comes down to its centre. Down it's the 3X -13.32 line it
  shares with the camera and the flash. Two concentric circles are drawn there. The Ø1.30 leader lands on the outer
  one (4800 dpi), which re-measures Ø1.27. The inner one (about Ø0.67, not dimensioned) isn't built. The overlay's
  circle lies on the drawn outer one.
- **No MagSafe; a charging circle instead.** Apple's spec page lists Qi wireless charging only. Sheet 2's right-hand
  back view still draws note 5's circle, in the MagSafe phones' wording (no metal, conductive or magnetic material):
  Ø57.50 at the product centre (35.76, 73.35), with no magnetic zone round it. It's recorded as `wirelessCharging` but
  not passed to the builder, because features.json would name it `magsafe`. The same view's camera-corner zone (no
  magnetic or permeable material, from the top and side to 36.03 across and 27.72 down) and the COMPASS circle (Ø8.00
  at 60.51, 9.86) are recorded too (`magneticZone`, `compass`), but no field takes them. All of them re-measure within
  0.03. Sheet 2's antenna keepouts and Detail E's front sensor keepouts aren't modelled.
- **The corner** is the 14's: its middle cross (3.22, 3.40) is off the diagonal, so (3.31, 3.31) stands in for it,
  and the outline passes 0.006 from the cross.
- **The edge profile** is the 14's, with both faces stepping to their glass at 1.05 in. The front view's 1.15 TO START
  OF FLAT AREA (also on the 14's sheet) isn't a profile point. The builder starts a face at the first point within 0.1
  of the full thickness, which is 0.91's 3.82. A [1.15, 3.90] point would be dropped and 0.91 lifted to 3.90.
- **The bottom holes** are dimensioned to their outer edges, as on the 14: the end holes' chords centre half a hole
  inside the lines (within 0.04), and the spans less a hole are 2 and 4 x 2.255.
- **Scaled:** the bump's top height (1.40) and Ø13.54, the camera ring (12.94) and window (11.89), the display's corner
  radius (7.87 at three corners; the fourth's diagonal runs along a hatch line), and the receiver slot (11.02 x 0.76,
  by the 14's scan).
- **Spec** (support.apple.com/122208): 167 g; Fusion Main 26 mm, ƒ/1.6.
- **Assumed, for a render:** the depths of the holes, the port and the receiver.

## Overlays

Red pixels:

- Detail D, 425: about 380 are half-pixel fringes on the camera's circles (anti-aliasing; every circle's centre and
  diameter re-measures within 0.01). The rest is the part's top edge beyond Detail D's dashed circle.
- Front view, 127: hairlines at the display's corners.
- Bottom view, 52: the ends of the camera's wide stage seen past the back, where the builder's slope replaces the
  drawn rounded wall.

## What it taught

- One camera gives no scale. The family calibrates the back view on camera centres, and the 16e's only circles (the
  camera, the rear mic and the flash) are all on one line. So Detail D is calibrated on its extension lines, and the
  family's re-measurement runs without a back view (`views.back` left out).
- A keepout cone can be drawn as a frustum. With no apex dimensioned, the apex comes from its base and angle, and the
  section's own sides check the result.
- Read what a keepout's distances run to. N-N's run to the back glass, the 12 Pro's and 16's to the cover glass.
- In a hatched region, a fit that looks for each side nearest a guess will follow the guess along the hatch lines.
  N-N's steep outer sides cross a column in runs about 28 px long, and the hatch lines in about 8. Keeping only the long
  runs made the fit independent of the guess: a wrong apex (8.62) now fails, where before it re-measured as itself.
