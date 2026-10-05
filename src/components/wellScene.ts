/**
 * The hero backdrop: a gravity well drawn as a hairline grid.
 *
 * A polar grid lies on the surface z = -A / sqrt(1 + (r / C)^2) and is
 * projected at an oblique angle, so the rings sink into a funnel around an
 * unseen mass. The intro loader and the hero backdrop draw it with the same
 * function, so the loader's last frame is the backdrop's first.
 */

import { clamp01, easeOutCubic } from './blackHoleScene';

// Surface, in units of R (the radius of the reference ring)
const DEPTH = 0.42; // how far the center sinks
const CORE = 0.16; // width of the throat
const SQUASH = 0.4; // vertical squash of the rings: the viewing angle
const LIFT = Math.sqrt(1 - SQUASH * SQUASH);
const TWIST = 1.1; // radial lines curl into the throat
const ROTATION = -0.07; // in-plane tilt of the whole well, radians
const COS = Math.cos(ROTATION);
const SIN = Math.sin(ROTATION);
const R_MIN = 0.012;
const R_MAX = 2.6; // past the edges of the frame
const RINGS = 24;
const RADIALS = 32;
const DUST = 110;

// Intro timeline (ms)
export const WELL_INTRO = {
  dot: 350, // the mass appears
  rings: 250, // first ring starts
  ringStagger: 55,
  ringGrow: 900,
  radials: 800,
  radialGrow: 1300,
  end: 2400, // everything is in place: the frame matches the backdrop
};

const ringRadius = (i: number) => R_MIN + (R_MAX - R_MIN) * Math.pow(i / RINGS, 1.6);

let dust: { r: number; a: number; size: number; alpha: number; delay: number }[] | null = null;
let epoch = 0;

const getDust = () => {
  if (!dust) {
    epoch = performance.now();
    dust = Array.from({ length: DUST }, () => ({
      r: 0.18 + Math.pow(Math.random(), 0.8) * 1.9,
      a: Math.random() * Math.PI * 2,
      size: 0.8 + Math.random() * 1.3,
      alpha: 0.35 + Math.random() * 0.5,
      delay: Math.random() * 900,
    }));
  }
  return dust;
};

export interface WellLayout {
  wx: number; // the mass at the bottom of the throat, px from the hero's top-left corner
  wy: number;
  R: number; // px
  /** Lines fade toward this side to keep the copy clean. */
  fade: 'left' | 'top';
}

/** Where the well sits in a hero of this size; shared so loader and backdrop agree. */
export function wellLayout(width: number, height: number): WellLayout {
  if (width >= 1024) {
    return { wx: width * 0.55, wy: height * 0.56, R: Math.min(Math.max(width * 0.36, 420), 640), fade: 'left' };
  }
  return { wx: width * 0.7, wy: height * 0.44, R: Math.max(width * 0.62, 220), fade: 'top' };
}

export interface WellFrame {
  ctx: CanvasRenderingContext2D;
  width: number; // canvas size, px
  height: number;
  ox: number; // where the hero's top-left corner is on this canvas
  oy: number;
  heroWidth: number;
  heroHeight: number;
  now: number;
  /** ms since the intro started; omitted once the well is in place. */
  intro?: number;
}

export function drawWell(f: WellFrame) {
  const { ctx, ox, oy, heroWidth, heroHeight, now } = f;
  const { wx, wy, R, fade } = wellLayout(heroWidth, heroHeight);
  const t = f.intro ?? Infinity;
  const time = now - (getDust(), epoch);

  const project = (r: number, a: number): [number, number] => {
    const z = DEPTH / Math.sqrt(1 + (r / CORE) * (r / CORE));
    const theta = a + (TWIST * CORE) / (r + CORE);
    const x = r * Math.cos(theta) * R;
    // The mass (r = 0) stays exactly on (wx, wy); the rim rises above it
    const y = (r * Math.sin(theta) * SQUASH + (z - DEPTH) * LIFT) * R;
    return [ox + wx + x * COS - y * SIN, oy + wy + x * SIN + y * COS];
  };

  ctx.clearRect(0, 0, f.width, f.height);
  ctx.lineWidth = 1;

  const stroke = (points: [number, number][], alpha: number) => {
    ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  };

  // Rings ripple outward from the mass, sliding up the funnel to their place
  for (let i = 1; i <= RINGS; i++) {
    const p = easeOutCubic(clamp01((t - WELL_INTRO.rings - i * WELL_INTRO.ringStagger) / WELL_INTRO.ringGrow));
    if (p <= 0) continue;
    const r = ringRadius(i) * p;
    const points: [number, number][] = [];
    for (let k = 0; k <= 120; k++) points.push(project(r, (k / 120) * Math.PI * 2));
    stroke(points, 0.13 * p);
  }

  // Radial lines draw from the throat outward
  const reach = easeOutCubic(clamp01((t - WELL_INTRO.radials) / WELL_INTRO.radialGrow));
  if (reach > 0) {
    const rEnd = R_MIN + (R_MAX - R_MIN) * reach;
    for (let j = 0; j < RADIALS; j++) {
      const a = (j / RADIALS) * Math.PI * 2;
      const points: [number, number][] = [];
      for (let k = 0; k <= 60; k++) {
        const r = R_MIN + (rEnd - R_MIN) * Math.pow(k / 60, 1.6);
        points.push(project(r, a));
      }
      stroke(points, 0.11 * reach);
    }
  }

  // Dust orbits the mass, faster near the throat
  ctx.fillStyle = '#000';
  for (const d of getDust()) {
    const p = clamp01((t - d.delay) / 600);
    if (p <= 0) continue;
    const [x, y] = project(d.r, d.a + (time * 0.00004) / Math.pow(d.r, 1.5));
    ctx.globalAlpha = d.alpha * p;
    ctx.fillRect(x, y, d.size, d.size);
  }
  ctx.globalAlpha = 1;

  // Lines fade toward the copy so it stays readable: erase with a gradient
  const mask =
    fade === 'left'
      ? ctx.createLinearGradient(ox + heroWidth * 0.08, 0, ox + heroWidth * 0.5, 0)
      : ctx.createLinearGradient(0, oy + heroHeight * 0.05, 0, oy + heroHeight * 0.35);
  mask.addColorStop(0, `rgba(0,0,0,${fade === 'left' ? 0.75 : 0.65})`);
  mask.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = mask;
  ctx.fillRect(0, 0, f.width, f.height);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000';

  // The mass
  const dot = easeOutCubic(clamp01(t / WELL_INTRO.dot));
  const [mx, my] = project(0, 0);
  ctx.beginPath();
  ctx.arc(mx, my, 3 * dot, 0, Math.PI * 2);
  ctx.fill();
}
