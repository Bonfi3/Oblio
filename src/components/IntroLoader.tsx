'use client';

import { RefObject, useEffect, useRef, useState } from 'react';
import { setupCanvas } from './blackHoleScene';
import { drawWell, WELL_INTRO } from './wellScene';

const REVEAL = 900; // the white clears and the page appears over the finished drawing

interface IntroLoaderProps {
  /** The hero backdrop: the loader builds the same gravity well exactly over it. */
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
    const start = performance.now();
    let frame = 0;
    let doneTimer: ReturnType<typeof setTimeout> | undefined;

    const render = (now: number) => {
      // Re-measured every frame in case fonts or layout shift
      const rect = target.getBoundingClientRect();
      drawWell({
        ctx,
        width,
        height,
        ox: rect.left,
        oy: rect.top,
        heroWidth: rect.width,
        heroHeight: rect.height,
        now,
        intro: now - start,
      });
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
    }, WELL_INTRO.end);

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
      {/* Its last frame is identical to the backdrop beneath, which takes over as it fades */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full transition-opacity duration-[900ms] ease-out ${revealing ? 'opacity-0' : ''}`}
      />
    </div>
  );
}
