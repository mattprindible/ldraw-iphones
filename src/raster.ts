// Measuring a drawing's geometry where it isn't dimensioned, and checking a model against it.
//
// A vector drawing whose labels are outlined (no text to extract) is rendered to pixels at a known resolution, and lines
// are found as dark runs along rows, columns or diagonals. A run's middle is the line's position. Calibration comes
// from dimensioned features: two dimensioned centres give the scale in each axis and where the drawing's datum lies,
// and a further dimensioned feature (a diameter) checks it. Chords of a circle on rows offset from its centre give the
// centre without crossing the centre lines and dimension lines that run through it.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export interface Region {
  page: number;
  dpi: number;
  crop: { x: number; y: number; width: number; height: number };
}

export interface Gray {
  width: number;
  height: number;
  at: (x: number, y: number) => number;
}

/** A region of a PDF page in greyscale (pdftoppm), its pixels 0 (ink) to 255 (paper). */
export function render(pdf: string, r: Region): Gray {
  const dir = mkdtempSync(join(tmpdir(), 'region-'));
  try {
    const out = join(dir, 'region');
    execFileSync('pdftoppm', ['-f', `${r.page}`, '-l', `${r.page}`, '-r', `${r.dpi}`, '-x', `${r.crop.x}`, '-y', `${r.crop.y}`, '-W', `${r.crop.width}`, '-H', `${r.crop.height}`, '-gray', '-singlefile', pdf, out]);
    const buf = readFileSync(`${out}.pgm`);
    // P5 <width> <height> <max>\n then the pixels.
    let i = 0;
    const fields: string[] = [];
    while (fields.length < 4) {
      while (/\s/.test(String.fromCharCode(buf[i]))) i++;
      let s = '';
      while (!/\s/.test(String.fromCharCode(buf[i]))) s += String.fromCharCode(buf[i++]);
      fields.push(s);
    }
    const [width, height] = [Number(fields[1]), Number(fields[2])];
    const off = i + 1;
    return { width, height, at: (x, y) => buf[off + y * width + x] };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** A region of a PDF page as a PNG, resized to width x height (to lay a render over it). */
export function regionPng(pdf: string, r: Region, out: string, width: number, height: number): void {
  const dir = mkdtempSync(join(tmpdir(), 'region-'));
  try {
    const raw = join(dir, 'region');
    execFileSync('pdftoppm', ['-f', `${r.page}`, '-l', `${r.page}`, '-r', `${r.dpi}`, '-x', `${r.crop.x}`, '-y', `${r.crop.y}`, '-W', `${r.crop.width}`, '-H', `${r.crop.height}`, '-gray', '-singlefile', pdf, raw]);
    execFileSync('magick', [`${raw}.pgm`, '-resize', `${width}x${height}!`, out]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Positions (px along the path, from its start) of the middles of dark runs, with their widths. */
export function runs(g: Gray, from: [number, number], step: [number, number], length: number): Array<{ at: number; width: number }> {
  const out: Array<{ at: number; width: number }> = [];
  let start = -1;
  for (let k = 0; k <= length; k++) {
    const [x, y] = [Math.round(from[0] + step[0] * k), Math.round(from[1] + step[1] * k)];
    const dark = x >= 0 && y >= 0 && x < g.width && y < g.height && g.at(x, y) < 128;
    if (dark && start < 0) start = k;
    if (!dark && start >= 0) {
      out.push({ at: (start + k - 1) / 2, width: k - start });
      start = -1;
    }
  }
  return out;
}

/** The drawing's coordinates: px of its datum (where both measured coordinates are 0) and px per mm. */
export interface Calibration {
  origin: [number, number];
  pxPerMm: number;
}

/** A mm position on the drawing (across, down from the datum) as region px, and back. */
export const toPx = (c: Calibration, mm: [number, number]): [number, number] => [c.origin[0] + mm[0] * c.pxPerMm, c.origin[1] + mm[1] * c.pxPerMm];
export const toMm = (c: Calibration, px: [number, number]): [number, number] => [(px[0] - c.origin[0]) / c.pxPerMm, (px[1] - c.origin[1]) / c.pxPerMm];

/**
 * The centre of a circle near `guess` (px), and its diameter: chords along a row and a column each offset from the
 * guess by `offset` px, taking on each the dark run nearest `radius` px out on either side. Offsetting avoids the
 * centre lines and dimension lines that run through a drawn circle's centre.
 */
export function circleAt(g: Gray, guess: [number, number], radius: number, offset = 40): { centre: [number, number]; diameter: number; stroke: number; widest: number } {
  const widths: number[] = [];
  const chord = (from: [number, number], step: [number, number], centre: number) => {
    const span = Math.round(radius * 1.5);
    const rs = runs(g, [from[0] - step[0] * span, from[1] - step[1] * span], step, 2 * span).map((r) => ({ at: r.at - span + centre, width: r.width }));
    const near = (target: number) => {
      const r = rs.reduce((a, b) => (Math.abs(b.at - target) < Math.abs(a.at - target) ? b : a));
      widths.push(r.width);
      return r.at;
    };
    return [near(centre - radius), near(centre + radius)];
  };
  const [x0, x1] = chord([guess[0], guess[1] + offset], [1, 0], guess[0]);
  const [y0, y1] = chord([guess[0] + offset, guess[1]], [0, 1], guess[1]);
  const centre: [number, number] = [(x0 + x1) / 2, (y0 + y1) / 2];
  // The chord is offset from the centre by (offset + guess error): r² = (half chord)² + (offset from centre)².
  const half = (x1 - x0) / 2, dy = guess[1] + offset - centre[1];
  // `stroke`: the drawn line's width (px), the mean of the four crossings: a heavy pen hides where in it the edge is.
  // `widest`: the widest crossing, which gives away a leader or an arrowhead merged with the circle.
  return { centre, diameter: 2 * Math.hypot(half, dy), stroke: widths.reduce((a, b) => a + b) / widths.length, widest: Math.max(...widths) };
}

/**
 * The circle at several chord offsets either side of the guess, keeping the one whose crossings are all thin: a leader
 * whose arrowhead touches the circle (the iPhone 15 Pro's flash) merges with it into one wide run and moves the centre.
 */
export function cleanCircleAt(g: Gray, guess: [number, number], radius: number, offsets = [40, -40, 80, -80]): ReturnType<typeof circleAt> {
  const found = offsets.map((o) => circleAt(g, guess, radius, o));
  return found.reduce((a, b) => (b.widest < a.widest ? b : a));
}

/** The dark run along a path nearest `expect` (px along it): a line known roughly, measured exactly. */
export function lineNear(g: Gray, from: [number, number], step: [number, number], length: number, expect: number): number {
  return runNear(g, from, step, length, expect).at;
}

/** The same, with the run's width (px): how heavily the line is drawn. */
export function runNear(g: Gray, from: [number, number], step: [number, number], length: number, expect: number): { at: number; width: number } {
  const rs = runs(g, from, step, length);
  return rs.reduce((a, b) => (Math.abs(b.at - expect) < Math.abs(a.at - expect) ? b : a));
}

/**
 * A drawing and a render of the model at its scale, composed so that agreement is black, the drawing alone blue and
 * the model alone red (channels: red the drawing, green the darker of the two, blue the render).
 */
export function overlay(drawingPng: string, renderPng: string, out: string): void {
  execFileSync('magick', [
    drawingPng,
    '(', drawingPng, renderPng, '-colorspace', 'gray', '-compose', 'darken', '-composite', ')',
    '(', renderPng, '-colorspace', 'gray', ')',
    '-colorspace', 'gray', '-combine', out,
  ]);
}
