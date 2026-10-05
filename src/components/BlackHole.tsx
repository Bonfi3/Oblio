'use client';

import { RefObject, useEffect, useRef } from 'react';
import { DEFAULT_VIEW, drawScene, HORIZON_RATIO, sceneTime, SceneView, setupCanvas } from './blackHoleScene';

/** Target camera for the scene; the canvas eases toward it every frame. */
export type BlackHoleView = Partial<SceneView> & { speed?: number };

interface BlackHoleProps {
  horizonRef?: RefObject<HTMLDivElement | null>;
  /** Hidden while the intro loader draws the same scene on top. */
  visible?: boolean;
  /** Mutable target view, read every frame so scroll updates never re-render. */
  view?: RefObject<BlackHoleView>;
  /** Tilts the disk toward the pointer. */
  interactive?: boolean;
  /** Square leaves room for the disk when it is seen face-on. */
  square?: boolean;
  className?: string;
}

const EASE = 0.08; // share of the remaining distance covered per frame

export function BlackHole({
  horizonRef,
  visible = true,
  view,
  interactive = false,
  square = false,
  className = '',
}: BlackHoleProps) {
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
    let running = false;

    // At normal speed the simulation clock matches the scene epoch, so the hero
    // stays frame-identical with the intro loader that hands over to it.
    let last = performance.now();
    let elapsed = sceneTime(last);
    const current = { ...DEFAULT_VIEW, speed: 1 };
    const pointer = { x: 0, y: 0 };

    const target = () => {
      const t = view?.current ?? {};
      return {
        tilt: (t.tilt ?? DEFAULT_VIEW.tilt) + pointer.y * 0.08,
        rotation: (t.rotation ?? DEFAULT_VIEW.rotation) + pointer.x * 0.06,
        lines: t.lines ?? DEFAULT_VIEW.lines,
        speed: t.speed ?? 1,
      };
    };

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      back = setupCanvas(backCanvas, width, height);
      front = setupCanvas(frontCanvas, width, height);
    };

    const draw = (now: number) => {
      const goal = target();
      const k = reduceMotion ? 1 : EASE;
      current.tilt += (goal.tilt - current.tilt) * k;
      current.rotation += (goal.rotation - current.rotation) * k;
      current.lines += (goal.lines - current.lines) * k;
      current.speed += (goal.speed - current.speed) * k;
      elapsed += (now - last) * current.speed;
      last = now;

      const horizon = (width * HORIZON_RATIO) / 2;
      drawScene({
        back,
        front,
        width,
        height,
        cx: width / 2,
        cy: height / 2,
        horizon,
        mask: horizon,
        now,
        elapsed,
        view: current,
      });
    };

    const tick = (now: number) => {
      draw(now);
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    resize();
    draw(performance.now());

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    resizeObserver.observe(container);

    // Off screen, the canvas stops drawing.
    const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    visibility.observe(container);

    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (interactive && !reduceMotion) window.addEventListener('pointermove', onPointer, { passive: true });

    return () => {
      stop();
      resizeObserver.disconnect();
      visibility.disconnect();
      window.removeEventListener('pointermove', onPointer);
    };
  }, [view, interactive]);

  const shown = visible ? 'opacity-100' : 'opacity-0';

  return (
    <div ref={containerRef} className={`relative w-full ${square ? 'aspect-square' : 'aspect-[9/5]'} ${className}`} aria-hidden>
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
