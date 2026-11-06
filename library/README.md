# iPhones for LDraw

LDraw parts of iPhones, built from Apple's public dimensional drawings, so you can place a phone among LEGO parts in
any LDraw tool and design a mount, a cradle or a robot around it: where its cameras sit, how far its buttons stand
out, where the Lightning plug needs room.

By Matt Prindible (LDraw: mattprindible). Not affiliated with or endorsed by Apple; iPhone is a trademark of Apple Inc.

## The parts

| File | Part | Built from |
|---|---|---|
| `parts/iphone-12-mini.dat` | iPhone 12 mini | Apple's iPhone 12 mini dimensional drawing (10/13/20) |
| `parts/iphone-12.dat` | iPhone 12 | Apple's iPhone 12 dimensional drawing (10/13/20) |
| `parts/iphone-12-pro.dat` | iPhone 12 Pro | Apple's iPhone 12 Pro dimensional drawing (10/13/20) |
| `parts/iphone-12-pro-max.dat` | iPhone 12 Pro Max | Apple's iPhone 12 Pro Max dimensional drawing (10/13/20) |
| `parts/iphone-13-mini.dat` | iPhone 13 mini | Apple's iPhone 13 mini dimensional drawing (05/14/21) |
| `parts/iphone-13.dat` | iPhone 13 | Apple's iPhone 13 dimensional drawing (05/14/21) |
| `parts/iphone-13-pro.dat` | iPhone 13 Pro | Apple's iPhone 13 Pro dimensional drawing (05/14/21) |
| `parts/iphone-13-pro-max.dat` | iPhone 13 Pro Max | Apple's iPhone 13 Pro Max dimensional drawing (05/14/21) |
| `parts/iphone-14.dat` | iPhone 14 | Apple's iPhone 14 dimensional drawing (2022-09-21) |
| `parts/iphone-14-plus.dat` | iPhone 14 Plus | Apple's iPhone 14 Plus dimensional drawing (2022-09-21) |
| `parts/iphone-14-pro.dat` | iPhone 14 Pro | Apple's iPhone 14 Pro dimensional drawing (2022-09-21) |
| `parts/iphone-14-pro-max.dat` | iPhone 14 Pro Max | Apple's iPhone 14 Pro Max dimensional drawing (2022-09-21) |
| `parts/iphone-15.dat` | iPhone 15 | Apple's iPhone 15 dimensional drawing (2023-10-10) |
| `parts/iphone-15-plus.dat` | iPhone 15 Plus | Apple's iPhone 15 Plus dimensional drawing (2023-10-10) |
| `parts/iphone-15-pro.dat` | iPhone 15 Pro | Apple's iPhone 15 Pro dimensional drawing (2023-10-10) |
| `parts/iphone-15-pro-max.dat` | iPhone 15 Pro Max | Apple's iPhone 15 Pro Max dimensional drawing (2023-10-10) |
| `parts/iphone-16.dat` | iPhone 16 | Apple's iPhone 16 dimensional drawing (2024-09-19) |
| `parts/iphone-16-plus.dat` | iPhone 16 Plus | Apple's iPhone 16 Plus dimensional drawing (2024-09-19) |
| `parts/iphone-16-pro.dat` | iPhone 16 Pro | Apple's iPhone 16 Pro dimensional drawing (2024-09-19) |
| `parts/iphone-16-pro-max.dat` | iPhone 16 Pro Max | Apple's iPhone 16 Pro Max dimensional drawing (2024-09-19) |
| `parts/iphone-16e.dat` | iPhone 16e | Apple's iPhone 16e dimensional drawing (2025-03-17) |
| `parts/iphone-17.dat` | iPhone 17 | Apple's iPhone 17 dimensional drawing (2025-09-09) |
| `parts/iphone-air.dat` | iPhone Air | Apple's iPhone Air dimensional drawing (2025-09-09) |
| `parts/iphone-17-pro.dat` | iPhone 17 Pro | Apple's iPhone 17 Pro dimensional drawing (2025-09-09) |
| `parts/iphone-17-pro-max.dat` | iPhone 17 Pro Max | Apple's iPhone 17 Pro Max dimensional drawing (2025-09-09) |
| `parts/iphone-17e.dat` | iPhone 17e | Apple's iPhone 17e dimensional drawing (2026-03-09) |
| `parts/iphone-18-pro.dat` | iPhone 18 Pro | Apple's iPhone 18 Pro dimensional drawing (2026-09-09) |
| `parts/iphone-18-pro-max.dat` | iPhone 18 Pro Max | Apple's iPhone 18 Pro Max dimensional drawing (2026-09-09) |
| `parts/iphone-duo.dat` | iPhone Duo | Apple's iPhone Duo dimensional drawing (2026-09-09) |
| `parts/iphone-se-3rd-generation.dat` | iPhone SE (3rd generation) | Apple's iPhone SE (3rd generation) dimensional drawing (2022-04-26) |

Each part is the phone's outside as the drawing dimensions it: the body (its corners and edge profile), the camera
bump or plateau with its lenses, flash, rear mic and LiDAR window where the drawing gives them, the buttons (each
standing proud by the drawing's amount; the Action button and Camera Control's outline where there are), the display
with its notch or Dynamic Island, the receiver, the bottom edge's holes and Lightning or USB-C port, and the SIM tray's
outline where there is one. Dimensioned features are as exact as
the drawing (its tolerances are ±0.05 to ±0.4 mm); features the drawing shows but doesn't dimension were measured off
it to about 0.05 mm. The depths of the holes and the port aren't given, so they're shallow, for looks.

## Using them

- **Placing:** the origin is the phone's centre (mid-width, mid-length, mid-thickness). As placed with no rotation it
  lies screen up: −Y out of the screen, +X toward the side button, +Z toward the top. LDraw units: 1 mm = 2.5 LDU.
- **Colour:** the body (frame, back glass, buttons) takes the colour you give the part; the screen is black, the lens
  rings dark bluish grey, the flash white, the rear mic black.
- **Cameras and keepouts:** each part's `features/*.json` gives each rear camera's position and axis, the keepout cone
  Apple asks a mount to stay out of, its field of view, and the flash, in the part's frame (mm and LDU); and where the
  drawing gives them, the LiDAR scanner's window or keepout zone and cone, Camera Control's keepout, the rear mic, the
  flash's keepout cones, and MagSafe's clear circle. Not every drawing's keepouts are in yet: see each model's README.

## Installing

The parts follow the LDraw file format (BFC certified, with edge and conditional lines), so any LDraw tool can load
them. Put the `.dat` files where your tool looks for unofficial parts:

- **LDraw tools** (LDView, LDCad, LeoCAD, MLCad and others): most search an `Unofficial` folder inside your LDraw
  library. Copy `parts/` to `<your LDraw folder>/Unofficial/parts/`.
- **BrickLink Studio:** copy the `.dat` files into Studio's `CustomParts/parts` folder (BrickLink's help on custom
  parts says where it is on your system), then restart Studio.
- **Anywhere else:** keep the `.dat` next to the model that uses it; LDraw tools look in the model's own folder.

They're listed under "iPhone".

**To try one:** `examples/iphone-13-mini-head-2-cradle.ldr` is an iPhone 13 mini standing in a cradle on the Robot
Inventor (51515) hub, built from LEGO's official parts. Open it in an LDraw viewer, or in Studio through File →
Import, once `iphone-13-mini.dat` is installed.

## Licence

CC BY 4.0, as LDraw's own parts are: use them, change them and share them, crediting Matt Prindible. See `LICENSE.md`.
The headers' licence line is word for word the one LDraw's tools expect.
