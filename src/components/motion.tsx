'use client';

import { ElementType, Fragment, ReactNode, RefObject, useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** True once the element has entered the viewport. */
export function useInView<T extends Element>(ref: RefObject<T | null>, rootMargin = '0px 0px -12% 0px') {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

/**
 * Calls `onProgress` with how far the element has travelled through the
 * viewport: 0 when its top reaches the bottom edge, 1 when its bottom leaves the top.
 */
export function useScrollProgress<T extends Element>(ref: RefObject<T | null>, onProgress: (p: number) => void) {
  const callback = useRef(onProgress);
  useEffect(() => {
    callback.current = onProgress;
  });
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height + window.innerHeight;
      callback.current(Math.min(1, Math.max(0, (window.innerHeight - rect.top) / total)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [ref]);
}

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  delay?: number; // ms
  className?: string;
  /** Plays on this flag instead of on entering the viewport. */
  play?: boolean;
}

/** Fades and lifts its content into place. */
export function Reveal({ children, as: Tag = 'div', delay = 0, className = '', play }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref);
  const shown = play ?? inView;
  return (
    <Tag ref={ref} className={`reveal ${shown ? 'is-visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

interface WordRevealProps {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number; // ms before the first word
  stagger?: number; // ms between words
  play?: boolean;
}

/** Each word rises out of its own mask, one after the other. */
export function WordReveal({ text, as: Tag = 'span', className = '', delay = 0, stagger = 55, play }: WordRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref);
  const shown = play ?? inView;
  const words = text.split(' ');
  const [done, setDone] = useState(false);

  // When the last word has landed, drop the masks so the heading is plain, selectable text
  useEffect(() => {
    if (!shown) return;
    const wait = prefersReducedMotion() ? 0 : delay + (words.length - 1) * stagger + 950;
    const timer = setTimeout(() => setDone(true), wait);
    return () => clearTimeout(timer);
  }, [shown, delay, stagger, words.length]);

  return (
    <Tag ref={ref} className={`${shown ? 'is-visible' : ''} ${done ? 'is-done' : ''} ${className}`} aria-label={text}>
      {words.map((word, i) => (
        // The space sits outside the inline-block mask, where it is not collapsed
        <Fragment key={i}>
          <span aria-hidden className="word-mask">
            <span className="word" style={{ transitionDelay: `${delay + i * stagger}ms` }}>
              {word}
            </span>
          </span>
          {i < words.length - 1 && ' '}
        </Fragment>
      ))}
    </Tag>
  );
}

/** Words darken from graphite to ink as the paragraph scrolls through the viewport. */
export function ScrubWords({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(' ');

  useScrollProgress(ref, (p) => {
    const el = ref.current;
    if (!el) return;
    // Fully lit by the time the paragraph is a little above the middle of the screen
    const lit = Math.min(1, Math.max(0, (p - 0.15) / 0.4)) * words.length;
    el.querySelectorAll<HTMLSpanElement>('[data-word]').forEach((span, i) => {
      span.style.opacity = String(0.18 + 0.82 * Math.min(1, Math.max(0, lit - i)));
    });
  });

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} data-word className="transition-opacity duration-150 motion-reduce:!opacity-100">
          {word}
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </p>
  );
}

interface CountUpProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  play?: boolean;
  duration?: number; // ms
}

/** Counts up to `value` once it plays. Renders the final value on the server. */
export function CountUp({ value, decimals = 2, prefix = '', suffix = '', play = true, duration = 1400 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (n: number) => `${prefix}${n.toFixed(decimals)}${suffix}`;

  useEffect(() => {
    const el = ref.current;
    if (!el || !play || prefersReducedMotion()) return;
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = format(value * (1 - Math.pow(1 - t, 4)));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- format depends only on the props below
  }, [play, value, decimals, prefix, suffix, duration]);

  return <span ref={ref}>{format(value)}</span>;
}
