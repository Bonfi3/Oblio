'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { BlackHole, BlackHoleView } from '@/components/BlackHole';
import { Reveal, useScrollProgress, WordReveal } from '@/components/motion';
import { EXPECTED_ADDITIONAL_APY, PROVISIONED_APY } from '@/lib/apy';
import { FEATURES, getArticle } from '@/lib/articles';

// One camera per feature; the scene blends between them as the reader scrolls.
const STAGES: Required<BlackHoleView>[] = [
  // Block rewards: the disk spins fast, edge-on, value streaming in
  { tilt: 0.2, rotation: -0.14, lines: 0.5, speed: 2.8 },
  // Performance-based delegation: the orbit structure comes forward
  { tilt: 0.55, rotation: 0.2, lines: 2.4, speed: 1 },
  // Composable obSOL: the disk opens up face-on
  { tilt: 0.93, rotation: 0, lines: 1.1, speed: 0.7 },
];

const smoothstep = (t: number) => t * t * (3 - 2 * t);

const blend = (stage: number): BlackHoleView => {
  const i = Math.min(STAGES.length - 2, Math.floor(stage));
  const t = smoothstep(Math.min(1, Math.max(0, stage - i)));
  const a = STAGES[i];
  const b = STAGES[i + 1];
  return {
    tilt: a.tilt + (b.tilt - a.tilt) * t,
    rotation: a.rotation + (b.rotation - a.rotation) * t,
    lines: a.lines + (b.lines - a.lines) * t,
    speed: a.speed + (b.speed - a.speed) * t,
  };
};

export function FeatureStory() {
  const panelsRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<BlackHoleView>(STAGES[0]);
  const [active, setActive] = useState(0);

  useScrollProgress(panelsRef, () => {
    const el = panelsRef.current;
    if (!el) return;
    // Stage follows the panel crossing the middle of the visible area (below the sticky scene on mobile)
    const rect = el.getBoundingClientRect();
    const line = window.innerHeight * (window.matchMedia('(min-width: 1024px)').matches ? 0.5 : 0.72);
    const p = (line - rect.top) / rect.height;
    const stage = Math.min(STAGES.length - 1, Math.max(0, p * STAGES.length - 0.5));
    viewRef.current = blend(stage);
    setActive(Math.round(stage));
  });

  return (
    <section id="features" aria-labelledby="features-title" className="border-t border-rule">
      <div className="mx-auto max-w-[1440px] px-4 pt-16 sm:px-8 lg:pt-24">
        <div className="max-w-[680px]">
          <Reveal as="p" className="text-[13px] font-medium text-graphite">
            Why Oblio
          </Reveal>
          <WordReveal
            as="h2"
            text="Three ways Oblio maximizes your staking earnings"
            className="mt-3 block text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[44px]"
          />
          <Reveal as="p" delay={200} className="mt-5 text-[17px] leading-relaxed text-graphite">
            On top of the {PROVISIONED_APY.toFixed(2)}% provisioned rate, these features target an additional{' '}
            {EXPECTED_ADDITIONAL_APY.toFixed(1)}% a year.
          </Reveal>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:-mt-24 lg:grid lg:grid-cols-2 lg:gap-16">
      {/* Sticky within the whole story: on top of the panels on mobile, beside them on desktop */}
        <div className="sticky top-0 z-10 flex h-[44svh] flex-col items-center justify-center border-b border-rule bg-paper lg:h-dvh lg:self-start lg:border-0 lg:bg-transparent">
          <BlackHole view={viewRef} square className="!w-[min(88%,32svh)] lg:!w-[min(88%,66vh,600px)]" />
          <div className="mt-1 flex w-[88%] max-w-[600px] items-center gap-4 lg:mt-6">
            <span className="tabular w-12 text-[13px] text-graphite">0{active + 1} / 03</span>
            <div className="grid flex-1 grid-cols-3 gap-2">
              {FEATURES.map((f, i) => (
                <span key={f.slug} className="h-px bg-rule">
                  <span
                    className={`block h-px bg-ink transition-[width] duration-700 ease-out ${i <= active ? 'w-full' : 'w-0'}`}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>

        <div ref={panelsRef}>
          {FEATURES.map((f, i) => (
            <article
              key={f.slug}
              className={`flex min-h-[64svh] flex-col justify-center py-12 transition-opacity duration-500 lg:min-h-dvh ${
                active === i ? 'opacity-100' : 'opacity-30'
              }`}
            >
              <span className="tabular border-t border-ink pt-4 text-[13px] text-graphite">0{i + 1}</span>
              <h3 className="mt-8 text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[40px]">{f.title}</h3>
              <p className="mt-5 max-w-[46ch] text-[19px] leading-relaxed">{f.text}</p>
              <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-graphite">{getArticle(f.slug)?.excerpt}</p>
              <Link
                href={`/articles/${f.slug}`}
                className="group mt-8 inline-flex items-center gap-1 self-start text-sm font-medium hover:underline hover:underline-offset-4"
              >
                Read the article
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
