'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { setupCanvas } from './blackHoleScene';
import { drawWell } from './wellScene';

/** The hero backdrop: fills its positioned parent and draws the well in its final state. */
export const GravityWell = forwardRef<HTMLDivElement, { className?: string }>(function GravityWell({ className = '' }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useImperativeHandle(ref, () => containerRef.current!);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ctx: CanvasRenderingContext2D;
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;

    const draw = (now: number) =>
      drawWell({ ctx, width, height, ox: 0, oy: 0, heroWidth: width, heroHeight: height, now });

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      ctx = setupCanvas(canvas, width, height);
      draw(performance.now());
    };

    const tick = (now: number) => {
      draw(now);
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    // Off screen, the dust stops orbiting
    const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    visibility.observe(container);

    return () => {
      stop();
      resizeObserver.disconnect();
      visibility.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} aria-hidden className={`absolute inset-0 ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
});
