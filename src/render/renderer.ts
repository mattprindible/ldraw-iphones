// Headless renderer for LDraw text: serves three.js (its LDrawLoader) and LDraw's colour table over a local HTTP
// server and drives the installed Chrome through playwright-core, so no browser download is needed. The models it
// renders carry their parts inline (an MPD, src/ldraw.ts), so the only LDraw file it needs is LDConfig.ldr (LDraw.org,
// CC BY 4.0), kept beside this file.
import { readFile } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { extname, join, normalize } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';

const ROOT = join(import.meta.dirname, '..', '..');
const TYPES: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };

export interface RenderOptions {
  width?: number;
  height?: number;
  /** Direction from the model toward the camera, in LDraw axes (-Y is up). */
  view?: [number, number, number];
  padding?: number;
  background?: string;
  /** Fix the fitted region (LDraw coords) so several renders share one scale and framing. */
  frame?: { min: number[]; max: number[] };
  /** White faces and black visible edges, like an instruction drawing (for laying over a drawing). */
  lineArt?: boolean;
}

/** The orthographic camera a render used: world point p lands at x = (p·right − eye·right − left) / (rightEdge − left) · width. */
export interface RenderCamera {
  eye: number[];
  right: number[];
  up: number[];
  left: number;
  rightEdge: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

export interface RenderResult {
  png: Buffer;
  bounds: { min: number[]; max: number[] };
  camera: RenderCamera;
}

export class Renderer {
  private server: Server;
  private browser: Browser;
  private page: Page;

  private constructor(server: Server, browser: Browser, page: Page) {
    this.server = server;
    this.browser = browser;
    this.page = page;
  }

  static async start(): Promise<Renderer> {
    const mounts: Array<[string, string]> = [
      ['/three/', join(ROOT, 'node_modules', 'three')],
      ['/ldraw/', import.meta.dirname],
    ];
    const server = createServer(async (req, res) => {
      const url = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
      let file = url === '/' ? join(import.meta.dirname, 'page.html') : undefined;
      for (const [prefix, dir] of mounts) if (url.startsWith(prefix)) file = join(dir, normalize(url.slice(prefix.length)).replace(/^(\.\.[/\\])+/, ''));
      try {
        if (!file) throw new Error('no route');
        const body = await readFile(file);
        res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'text/plain' }).end(body);
      } catch {
        // The LDraw loader probes parts/, p/, models/ for files a model doesn't carry inline: 404s are normal.
        res.writeHead(404).end();
      }
    });
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-unsafe-swiftshader'] });
    const page = await browser.newPage();
    page.on('pageerror', (e) => console.error('[render page]', e.message));
    await page.goto(`http://127.0.0.1:${(server.address() as AddressInfo).port}/`);
    await page.waitForFunction(() => (window as any).rendererReady === true);
    return new Renderer(server, browser, page);
  }

  async render(ldraw: string, opts: RenderOptions = {}): Promise<RenderResult> {
    const r = await this.page.evaluate(([text, o]) => (window as any).renderLDraw(text, o), [ldraw, opts] as const);
    return { png: Buffer.from(r.png.split(',')[1], 'base64'), bounds: r.bounds, camera: r.camera };
  }

  async close(): Promise<void> {
    await this.browser.close();
    await new Promise((r) => this.server.close(r));
  }
}
