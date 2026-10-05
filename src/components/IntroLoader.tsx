'use client';

import { RefObject, useEffect, useRef, useState } from 'react';
import { clamp01, drawScene, easeOutCubic, setupCanvas } from './blackHoleScene';

// Timeline (ms). Dust timing lives in blackHoleScene (INFALL, STRUCTURE_*).
const HORIZON_START = 1100; // the horizon starts to form
const HORIZON_END = 2000;
const HOLD = 2400; // the page is revealed around the black hole
const REVEAL = 800;

interface IntroLoaderProps {
  /** Where the black hole forms: the loader measures this element every frame. */
  targetRef: RefObject<HTMLDivElement | null>;
  onDone: () => void;
}

export function IntroLoader({ targetRef, onDone }: IntroLoaderProps) {
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  const horizonRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'forming' | 'reveal' | 'done'>('forming');
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const backCanvas = backRef.current;
    const frontCanvas = frontRef.current;
    const horizonEl = horizonRef.current;
    const target = targetRef.current;
    if (!backCanvas || !frontCanvas || !horizonEl || !target) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- skip the intro; depends on a browser-only query
      setPhase('done');
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

    const render = (now: number) => {
      const t = now - start;
      // Re-measured every frame in case fonts or layout shift
      const rect = target.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const horizon = rect.width / 2;
      const growth = easeOutCubic(clamp01((t - HORIZON_START) / (HORIZON_END - HORIZON_START)));

      horizonEl.style.width = horizonEl.style.height = `${rect.width}px`;
      horizonEl.style.transform = `translate(${cx - horizon}px, ${cy - horizon}px) scale(${growth})`;

      drawScene({ back, front, width, height, cx, cy, horizon, mask: horizon * growth, now, intro: { t, reach } });
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    // The whole loader fades out over the page
    const revealTimer = setTimeout(() => {
      setPhase('reveal');
      doneTimer = setTimeout(() => {
        cancelAnimationFrame(frame);
        document.body.style.overflow = previousOverflow; // page scrolls again
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

  return (
    <div
      className={`fixed inset-0 z-[100] bg-paper transition-[opacity,transform] duration-[800ms] ease-out ${
        phase === 'reveal' ? 'scale-[1.04] opacity-0' : ''
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
