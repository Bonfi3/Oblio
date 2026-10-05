'use client';

import { RefObject, useEffect, useRef, useState } from 'react';
import { clamp01, easeOutCubic, setupCanvas } from './blackHoleScene';

// Timeline (ms)
const DOT_END = 350; // the mass appears
const RINGS_START = 250; // rings ripple outward one after the other
const RING_STAGGER = 75;
const RING_GROW = 800;
const RADIALS_START = 900; // radial lines draw from the well outward
const RADIALS_GROW = 1200;
const HOLD = 2300; // the white clears and the page appears over the drawing
const REVEAL = 900;

// Geometry of the backdrop artwork, measured on the image
const WELL_X = 0.744; // the well, as shares of the image width and height
const WELL_Y = 0.608;
const OUTER_RX = 0.41; // horizontal radius of the outermost full ring, as a share of the width
const SQUASH = 0.42; // ring height / width
const SHIFT_X = -0.021; // rings drift up and left of the well as they widen (the funnel's depth)
const SHIFT_Y = -0.061;
const RINGS = 22; // up to u = 1.8, beyond the frame
const RING_MAX = 1.8;
const RADIALS = 30;
const DUST = 140;

interface IntroLoaderProps {
  /** The backdrop image: the loader draws its gravity well exactly over it. */
  targetRef: RefObject<HTMLElement | null>;
  /** The white starts to clear: the page can animate in underneath. */
  onReveal?: () => void;
  /** The loader is gone. */
  onDone: () => void;
}

export function IntroLoader({ targetRef, onReveal, onDone }: IntroLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'forming' | 'reveal' | 'done'>('forming');
  const onDoneRef = useRef(onDone);
  const onRevealRef = useRef(onReveal);

  useEffect(() => {
    onDoneRef.current = onDone;
    onRevealRef.current = onReveal;
  }, [onDone, onReveal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const target = targetRef.current;
    if (!canvas || !target) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- skip the intro; depends on a browser-only query
      setPhase('done');
      onRevealRef.current?.();
      onDoneRef.current();
      return;
    }

    // The drawing lines up with the backdrop, so start from the top of the page
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const width = window.innerWidth;
    const height = window.innerHeight;
    const ctx = setupCanvas(canvas, width, height);
    const dust = Array.from({ length: DUST }, () => ({
      u: 0.25 + Math.random() * 1.5,
      a: Math.random() * Math.PI * 2,
      size: 0.8 + Math.random() * 1.4,
      delay: Math.random() * 900,
    }));
    const start = performance.now();
    let frame = 0;
    let doneTimer: ReturnType<typeof setTimeout> | undefined;

    const render = (now: number) => {
      const t = now - start;
      // Re-measured every frame in case fonts or layout shift
      const rect = target.getBoundingClientRect();
      const W = rect.width;
      const wx = rect.left + rect.width * WELL_X;
      const wy = rect.top + rect.height * WELL_Y;

      // A point on ring u at angle a: rings widen and drift with u like the funnel in the artwork
      const point = (u: number, a: number): [number, number] => {
        const rx = OUTER_RX * W * Math.pow(u, 1.5);
        return [wx + SHIFT_X * W * u + rx * Math.cos(a), wy + SHIFT_Y * W * u + rx * SQUASH * Math.sin(a)];
      };

      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;

      // Rings ripple out from the mass
      const ringGrowth: number[] = [];
      for (let k = 1; k <= RINGS; k++) {
        const p = easeOutCubic(clamp01((t - RINGS_START - k * RING_STAGGER) / RING_GROW));
        const u = (k / RINGS) * RING_MAX;
        ringGrowth.push(u * p);
        if (p <= 0) continue;
        ctx.strokeStyle = `rgba(0,0,0,${0.2 * p})`;
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.01; a += Math.PI / 90) {
          const [x, y] = point(u * p, a);
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Radial lines follow the rings outward from the well
      const reach = easeOutCubic(clamp01((t - RADIALS_START) / RADIALS_GROW));
      if (reach > 0) {
        ctx.strokeStyle = `rgba(0,0,0,${0.18 * reach})`;
        const last = reach * RINGS;
        for (let i = 0; i < RADIALS; i++) {
          const a = (i / RADIALS) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(wx, wy);
          for (let k = 1; k <= Math.ceil(last); k++) {
            // The last segment grows smoothly instead of popping in
            const u = (Math.min(k, last) / RINGS) * RING_MAX;
            const [x, y] = point(Math.min(u, ringGrowth[k - 1] ?? u), a);
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }

      // Dust spirals slowly toward the mass
      ctx.fillStyle = '#000';
      const pull = easeOutCubic(clamp01(t / 3200));
      for (const d of dust) {
        const p = clamp01((t - d.delay) / 600);
        if (p <= 0) continue;
        const u = d.u * (1 - 0.3 * pull);
        const [x, y] = point(u, d.a + (0.9 * pull) / Math.max(u, 0.3));
        ctx.globalAlpha = 0.7 * p;
        ctx.fillRect(x, y, d.size, d.size);
      }
      ctx.globalAlpha = 1;

      // The mass
      const dot = easeOutCubic(clamp01(t / DOT_END));
      ctx.beginPath();
      ctx.arc(wx, wy, 3.5 * dot, 0, Math.PI * 2);
      ctx.fill();

      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    const revealTimer = setTimeout(() => {
      setPhase('reveal');
      document.body.style.overflow = previousOverflow; // page scrolls again
      onRevealRef.current?.();
      doneTimer = setTimeout(() => {
        cancelAnimationFrame(frame);
        setPhase('done');
        onDoneRef.current();
      }, REVEAL);
    }, HOLD);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(revealTimer);
      clearTimeout(doneTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [targetRef]);

  if (phase === 'done') return null;

  const revealing = phase === 'reveal';
  return (
    <div
      className={`fixed inset-0 z-[100] transition-colors duration-[900ms] ease-out ${
        revealing ? 'pointer-events-none bg-transparent' : 'bg-paper'
      }`}
      role="status"
      aria-label="Loading Oblio"
    >
      {/* The drawing hands over to the backdrop artwork it was traced from */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full transition-opacity duration-[900ms] ease-out ${revealing ? 'opacity-0' : ''}`}
      />
    </div>
  );
}
