'use client';

import { RefObject, useEffect, useRef } from 'react';
import { drawScene, HORIZON_RATIO, setupCanvas } from './blackHoleScene';

interface BlackHoleProps {
  horizonRef: RefObject<HTMLDivElement | null>;
  /** Hidden while the intro loader draws the same scene on top. */
  visible: boolean;
  className?: string;
}

export function BlackHole({ horizonRef, visible, className = '' }: BlackHoleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const backCanvas = backRef.current;
    const frontCanvas = frontRef.current;
    if (!container || !backCanvas || !frontCanvas) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let back: CanvasRenderingContext2D;
    let front: CanvasRenderingContext2D;
    let width = 0;
    let height = 0;
    let frame = 0;

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      back = setupCanvas(backCanvas, width, height);
      front = setupCanvas(frontCanvas, width, height);
    };

    const draw = (now: number) => {
      const horizon = (width * HORIZON_RATIO) / 2;
      drawScene({ back, front, width, height, cx: width / 2, cy: height / 2, horizon, mask: horizon, now });
    };

    const tick = (now: number) => {
      draw(now);
      frame = requestAnimationFrame(tick);
    };

    resize();
    const observer = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    observer.observe(container);

    if (reduceMotion) draw(performance.now());
    else frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const shown = visible ? 'opacity-100' : 'opacity-0';

  return (
    <div ref={containerRef} className={`relative aspect-[9/5] w-full ${className}`} aria-hidden>
      <canvas ref={backRef} className={`absolute inset-0 h-full w-full ${shown}`} />
      <div
        ref={horizonRef}
        className={`absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink ${shown}`}
        style={{ width: `${HORIZON_RATIO * 100}%` }}
      />
      <canvas ref={frontRef} className={`absolute inset-0 h-full w-full ${shown}`} />
    </div>
  );
}
