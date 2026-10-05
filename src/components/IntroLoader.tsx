'use client';

import { RefObject, useEffect, useRef, useState } from 'react';
import { clamp01, drawScene, easeOutCubic, setupCanvas } from './blackHoleScene';

// Timeline (ms). Dust timing lives in blackHoleScene (INFALL, STRUCTURE_*).
const HORIZON_START = 1100; // the horizon starts to form
const HORIZON_END = 2000;
const HOLD = 2400; // the black hole starts to dissipate and the page appears behind it
const DISSIPATE = 1700;
const SHARDS = 900; // grains the horizon breaks into

interface IntroLoaderProps {
  /** Where the black hole forms: the loader measures this element every frame. */
  targetRef: RefObject<HTMLDivElement | null>;
  /** The black hole starts to dissipate: the page can animate in underneath. */
  onReveal?: () => void;
  /** The loader is gone. */
  onDone: () => void;
}

// Grains spread over the horizon disk; each flies outward with a little swirl as it fades.
const makeShards = () =>
  Array.from({ length: SHARDS }, () => ({
    r: Math.sqrt(Math.random()), // share of the horizon radius
    a: Math.random() * Math.PI * 2,
    reach: 0.6 + Math.random() * 2.4, // extra distance, in horizon radii
    swirl: (Math.random() - 0.3) * 0.9,
    size: 0.8 + Math.random() * 1.8,
    delay: Math.random() * 0.35, // the disk breaks up from its edge inward
  }));

export function IntroLoader({ targetRef, onReveal, onDone }: IntroLoaderProps) {
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  const horizonRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'forming' | 'reveal' | 'done'>('forming');
  const onDoneRef = useRef(onDone);
  const onRevealRef = useRef(onReveal);

  useEffect(() => {
    onDoneRef.current = onDone;
    onRevealRef.current = onReveal;
  }, [onDone, onReveal]);

  useEffect(() => {
    const backCanvas = backRef.current;
    const frontCanvas = frontRef.current;
    const horizonEl = horizonRef.current;
    const target = targetRef.current;
    if (!backCanvas || !frontCanvas || !horizonEl || !target) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- skip the intro; depends on a browser-only query
      setPhase('done');
      onRevealRef.current?.();
      onDoneRef.current();
      return;
    }

    // Start from the top of the page
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const width = window.innerWidth;
    const height = window.innerHeight;
    const back = setupCanvas(backCanvas, width, height);
    const front = setupCanvas(frontCanvas, width, height);
    const reach = Math.hypot(width, height) / 2;
    const start = performance.now();
    let frame = 0;
    let doneTimer: ReturnType<typeof setTimeout> | undefined;
    let dissolveStart = 0;
    const shards = makeShards();

    const render = (now: number) => {
      const t = now - start;
      // Re-measured every frame in case fonts or layout shift
      const rect = target.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const horizon = rect.width / 2;
      const growth = easeOutCubic(clamp01((t - HORIZON_START) / (HORIZON_END - HORIZON_START)));
      const d = dissolveStart ? clamp01((now - dissolveStart) / DISSIPATE) : 0;
      // The solid disk gives way early; its grains carry the shape outward
      const solid = 1 - easeOutCubic(clamp01(d / 0.45));

      horizonEl.style.width = horizonEl.style.height = `${rect.width}px`;
      horizonEl.style.transform = `translate(${cx - horizon}px, ${cy - horizon}px) scale(${growth * (1 - 0.15 * d)})`;
      horizonEl.style.opacity = String(solid);
      horizonEl.style.filter = d ? `blur(${d * 14}px)` : '';

      drawScene({
        back,
        front,
        width,
        height,
        cx,
        cy,
        horizon,
        mask: horizon * growth * solid,
        now,
        dissipate: d,
        intro: { t, reach },
      });

      if (d > 0) {
        front.fillStyle = '#000';
        for (const g of shards) {
          const p = clamp01((d - g.delay) / (1 - g.delay));
          if (p >= 1) continue;
          const e = easeOutCubic(p);
          const dist = horizon * (g.r + g.reach * e);
          const angle = g.a + g.swirl * e;
          front.globalAlpha = (1 - p) * (p > 0 ? 1 : solid);
          front.fillRect(cx + dist * Math.cos(angle), cy + dist * Math.sin(angle), g.size, g.size);
        }
        front.globalAlpha = 1;
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    // The white clears and the page appears while the black hole dissipates into dust
    const revealTimer = setTimeout(() => {
      setPhase('reveal');
      dissolveStart = performance.now();
      document.body.style.overflow = previousOverflow; // page scrolls again
      onRevealRef.current?.();
      doneTimer = setTimeout(() => {
        cancelAnimationFrame(frame);
        setPhase('done');
        onDoneRef.current();
      }, DISSIPATE);
    }, HOLD);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(revealTimer);
      clearTimeout(doneTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [targetRef]);

  if (phase === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-[100] transition-colors duration-[900ms] ease-out ${
        phase === 'reveal' ? 'pointer-events-none bg-transparent' : 'bg-paper'
      }`}
      role="status"
      aria-label="Loading Oblio"
    >
      <canvas ref={backRef} className="absolute inset-0 h-full w-full" />
      <div
        ref={horizonRef}
        className="absolute left-0 top-0 origin-center rounded-full bg-ink"
        style={{ transform: 'scale(0)' }}
      />
      <canvas ref={frontRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
