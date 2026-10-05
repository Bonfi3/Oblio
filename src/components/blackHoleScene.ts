/**
 * Shared black hole scene: accretion disk, orbit lines and photon ring.
 *
 * The intro loader and the hero draw the same particles with the same
 * function, so when the loader hands over to the hero the frame is
 * identical: the dust that spiralled in from the screen simply keeps orbiting.
 */

// Geometry, in horizon radii unless noted
export const HORIZON_RATIO = 0.38; // horizon diameter / hero container width
const INNER = 1.2;
const OUTER = 2.55;
const ORBITS = [1.35, 1.75, 2.2, 2.55];
const COUNT = 1300;

// Intro timeline (ms)
export const INFALL = 1900; // dust spirals from the screen onto its orbit
export const STRUCTURE_START = 1100; // orbit lines and lensed halo fade in
export const STRUCTURE_END = 2100;

/** Camera on the disk. Scroll and pointer move it; the defaults are the hero framing. */
export interface SceneView {
  tilt: number; // vertical squash of the accretion disk: 0 edge-on, 1 face-on
  rotation: number; // in-plane rotation of the disk, radians
  lines: number; // opacity multiplier of the orbit lines and photon ring
}

export const DEFAULT_VIEW: SceneView = { tilt: 0.27, rotation: -0.12, lines: 1 };

export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

interface DiskParticle {
  radius: number; // orbit radius
  a0: number; // angle at the scene epoch
  speed: number; // rad/ms
  size: number; // px
  alpha: number;
  spawn: number; // intro start distance, as a share of the screen's half-diagonal
  spin: number; // extra turns made while falling in
  delay: number; // intro stagger, 0..0.4
}

let scene: { particles: DiskParticle[]; epoch: number } | null = null;

/** One scene per page load, created on first use in the browser. */
function getScene() {
  if (!scene) {
    const particles = Array.from({ length: COUNT }, () => {
      const radius = INNER + (OUTER - INNER) * Math.pow(Math.random(), 1.8);
      const depth = (radius - INNER) / (OUTER - INNER);
      return {
        radius,
        a0: Math.random() * Math.PI * 2,
        // Keplerian falloff: inner orbits move faster
        speed: 0.00038 * Math.pow(INNER / radius, 1.5) * (0.85 + Math.random() * 0.3),
        size: 0.8 + Math.random() * (1.4 - depth * 0.6),
        alpha: (0.9 - depth * 0.65) * (0.55 + Math.random() * 0.45),
        spawn: 0.2 + 0.8 * Math.sqrt(Math.random()),
        spin: 4 + Math.random() * 4,
        delay: Math.random() * 0.4,
      };
    });
    scene = { particles, epoch: performance.now() };
  }
  return scene;
}

export interface SceneFrame {
  back: CanvasRenderingContext2D; // drawn below the horizon element
  front: CanvasRenderingContext2D; // drawn above it
  width: number;
  height: number;
  cx: number; // horizon center, canvas px
  cy: number;
  horizon: number; // final horizon radius, px
  mask: number; // current horizon radius (grows during the intro), px
  now: number;
  /** Simulation time in ms; defaults to the time since the scene epoch. */
  elapsed?: number;
  view?: SceneView;
  /** Loader only: ms since the intro started, and the screen half-diagonal. */
  intro?: { t: number; reach: number };
}

/** Time since the scene epoch: where an instance running at normal speed starts. */
export const sceneTime = (now: number) => now - getScene().epoch;

export function drawScene(f: SceneFrame) {
  const { particles, epoch } = getScene();
  const { back, front, cx, cy, horizon, mask, intro } = f;
  const elapsed = f.elapsed ?? f.now - epoch;
  const { tilt: TILT, rotation, lines } = f.view ?? DEFAULT_VIEW;
  const COS = Math.cos(rotation);
  const SIN = Math.sin(rotation);
  const structure =
    (intro ? easeOutCubic(clamp01((intro.t - STRUCTURE_START) / (STRUCTURE_END - STRUCTURE_START))) : 1) * lines;

  const project = (r: number, angle: number, squash: number): [number, number] => {
    const dx = r * Math.cos(angle);
    const dy = r * Math.sin(angle) * squash;
    return [cx + dx * COS - dy * SIN, cy + dx * SIN + dy * COS];
  };

  back.clearRect(0, 0, f.width, f.height);
  front.clearRect(0, 0, f.width, f.height);

  // --- Orbit lines and photon ring ---
  if (structure > 0 && mask > 0) {
    const orbitPath = (orbit: number, from: number, to: number) => {
      const path = new Path2D();
      for (let a = from; a <= to + 0.001; a += Math.PI / 90) {
        const [x, y] = project(orbit * horizon, a, TILT);
        if (a === from) path.moveTo(x, y);
        else path.lineTo(x, y);
      }
      return path;
    };
    back.lineWidth = 1;
    front.lineWidth = 1;
    for (const orbit of ORBITS) {
      back.strokeStyle = `rgba(0,0,0,${0.14 * structure})`;
      back.stroke(orbitPath(orbit, Math.PI, Math.PI * 2));

      const near = orbitPath(orbit, 0, Math.PI);
      front.strokeStyle = `rgba(0,0,0,${0.14 * structure})`;
      front.stroke(near);
      // Where the near side crosses the horizon, only a light line shows
      front.save();
      front.beginPath();
      front.arc(cx, cy, mask, 0, Math.PI * 2);
      front.clip();
      front.strokeStyle = `rgba(255,255,255,${0.35 * structure})`;
      front.stroke(near);
      front.restore();
    }
    back.beginPath();
    back.arc(cx, cy, Math.max(mask, 0.01) * 1.07, 0, Math.PI * 2); // grows with the horizon
    back.strokeStyle = `rgba(0,0,0,${0.22 * structure})`;
    back.stroke();
  }

  // --- Dust ---
  back.fillStyle = '#000';
  front.fillStyle = '#000';
  for (const d of particles) {
    const settle = intro ? easeInOutCubic(clamp01((intro.t / INFALL - d.delay) / (1 - d.delay))) : 1;
    const orbitR = d.radius * horizon;
    const r = intro ? orbitR + (d.spawn * intro.reach - orbitR) * (1 - settle) : orbitR;
    // Arrives on its orbit exactly where the hero expects it
    const angle = d.a0 + d.speed * elapsed - (1 - settle) * d.spin;
    // The cloud flattens into the tilted disk as it settles
    const squash = 1 - (1 - TILT) * settle;
    const [x, y] = project(r, angle, squash);
    const behind = Math.sin(angle) < 0;
    const ctx = behind ? back : front;

    // Near-side dust passing in front of the horizon shows up light on black
    if (!behind) ctx.fillStyle = Math.hypot(x - cx, y - cy) < mask - 1 ? '#fff' : '#000';

    ctx.globalAlpha = d.alpha * (intro ? 0.55 + 0.45 * settle : 1);
    const streak = (1 - Math.abs(2 * settle - 1)) * 8;
    if (streak > 0.5) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillRect(-d.size / 2, -(d.size + streak) / 2, d.size, d.size + streak);
      ctx.restore();
    } else {
      ctx.fillRect(x, y, d.size, d.size);
    }
  }
  back.globalAlpha = 1;
  front.globalAlpha = 1;
}

/** Sizes a canvas for the device pixel ratio and returns its 2D context. */
export function setupCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}
