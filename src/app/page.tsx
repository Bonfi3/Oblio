'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArticleList } from '@/components/ArticleList';
import { BlackHole, BlackHoleView } from '@/components/BlackHole';
import { DEFAULT_VIEW } from '@/components/blackHoleScene';
import { FeatureStory } from '@/components/FeatureStory';
import { IntroLoader } from '@/components/IntroLoader';
import { CountUp, Reveal, ScrubWords, useScrollProgress, WordReveal } from '@/components/motion';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { StakePanel } from '@/components/StakePanel';
import { EXPECTED_ADDITIONAL_APY, PROVISIONED_APY } from '@/lib/apy';
import { ARTICLES } from '@/lib/articles';
import { navState, scrollToSection } from '@/lib/navigation';

function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1 text-sm font-medium text-ink hover:underline hover:underline-offset-4">
      {children}
      <span aria-hidden className="transition-transform group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}

// The hero black hole sits behind the copy, so it is a light line drawing.
const HOLE_OPACITY = 0.6;

export default function Home() {
  const horizonRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const holeView = useRef<BlackHoleView>({ ...DEFAULT_VIEW });
  // The intro only plays when the site is first loaded on this page, not on client navigations back to it.
  const [playIntro] = useState(() => !navState.introPlayed);
  const [introDone, setIntroDone] = useState(!playIntro);
  const handleIntroDone = useCallback(() => setIntroDone(true), []);

  useEffect(() => {
    const section = navState.pendingSection;
    if (!section) return;
    navState.pendingSection = null;
    // Start from the top so the page visibly scrolls down to the section.
    window.scrollTo(0, 0);
    scrollToSection(section);
  }, []);

  // Scrolling into the next section, the black hole collapses: the disk turns edge-on and spins
  // faster while the whole hole shrinks and falls toward the section below, then fades out.
  useScrollProgress(heroRef, () => {
    const hero = heroRef.current;
    const hole = backdropRef.current;
    if (!hero || !hole || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const scrolled = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / (hero.offsetHeight * 0.85)));
    const t = scrolled * scrolled * (3 - 2 * scrolled); // smoothstep
    hole.style.transform = `translate3d(-50%, calc(-50% + ${t * hero.offsetHeight * 0.7}px), 0) scale(${1 - 0.8 * t})`;
    hole.style.opacity = String(HOLE_OPACITY * (1 - Math.max(0, (scrolled - 0.6) / 0.4)));
    holeView.current = {
      tilt: DEFAULT_VIEW.tilt * (1 - 0.8 * t),
      rotation: DEFAULT_VIEW.rotation - 0.25 * t,
      lines: 1 - 0.5 * t,
      speed: 1 + 5 * t,
    };
  });

  return (
    <>
      {playIntro && <IntroLoader targetRef={horizonRef} onDone={handleIntroDone} />}
      <div className="flex min-h-dvh flex-col">
        <SiteHeader overlay />

        <main className="flex-1">
          <div ref={heroRef} className="relative overflow-x-clip">
            {/* The loader forms the black hole exactly here, then fades out over this faint copy of it */}
            <div
              ref={backdropRef}
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-[40%] w-[135vw] max-w-[1100px] will-change-transform lg:left-[54%] lg:top-[46%] lg:w-[min(70vw,1000px)]"
              // Centered by the collapse transform (set on mount), not by translate classes
              style={{ opacity: HOLE_OPACITY, transform: 'translate3d(-50%, -50%, 0)' }}
            >
              <BlackHole horizonRef={horizonRef} view={holeView} interactive={introDone} outline />
            </div>

            <div className="relative mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-y-12 px-4 pt-28 pb-12 sm:px-8 lg:min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] lg:gap-x-16 lg:pt-24 lg:pb-36 xl:grid-cols-[minmax(0,1fr)_minmax(0,580px)] xl:gap-x-24">
              <section className="min-w-0 text-center lg:text-left">
                <WordReveal
                  as="h1"
                  play={introDone}
                  text="Confidential liquid staking on Solana"
                  className="mx-auto block max-w-[14ch] text-[40px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[56px] lg:mx-0 lg:text-[68px] xl:text-[80px]"
                />
                <Reveal as="p" play={introDone} delay={350} className="mx-auto mt-6 max-w-[40ch] text-balance text-[18px] leading-relaxed text-graphite lg:mx-0 lg:mt-8 lg:text-pretty lg:text-[21px]">
                  Stake SOL and receive obSOL, a liquid token you can hold or redeem at any time. Your position stays
                  out of view.
                </Reveal>

                <Reveal as="dl" play={introDone} delay={500} className="mx-auto mt-10 grid max-w-[560px] grid-cols-2 border-t border-ink text-left lg:mx-0 lg:mt-12">
                  <div className="pt-4 pr-4">
                    <dt className="text-[13px] leading-tight text-graphite lg:text-[15px]">Provisioned staking APY</dt>
                    <dd className="tabular mt-2 text-[28px] font-medium tracking-[-0.02em] lg:text-[40px]">
                      <CountUp value={PROVISIONED_APY} suffix="%" play={introDone} />
                    </dd>
                  </div>
                  <div className="pt-4 pr-4">
                    <dt className="text-[13px] leading-tight text-graphite lg:text-[15px]">Expected additional APY</dt>
                    <dd className="tabular mt-2 text-[28px] font-medium tracking-[-0.02em] lg:text-[40px]">
                      <CountUp value={EXPECTED_ADDITIONAL_APY} decimals={1} prefix="+" suffix="%" play={introDone} />
                    </dd>
                    <dd className="mt-2 text-[13px] lg:text-[15px]">
                      <Link href="/articles/additional-apy" className="underline decoration-rule underline-offset-4 transition-colors hover:decoration-ink">
                        How it works
                      </Link>
                    </dd>
                  </div>
                </Reveal>
              </section>

              <Reveal play={introDone} delay={250} className="mx-auto w-full min-w-0 max-w-[560px] lg:mr-0">
                <StakePanel />
              </Reveal>
            </div>
          </div>

          <section aria-label="Confidential by design" className="relative border-t border-rule">
            <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8 lg:py-40">
              <Reveal as="p" className="text-[13px] font-medium text-graphite">
                Confidential by design
              </Reveal>
              <ScrubWords
                text="On a public chain every stake position is visible to anyone. Oblio pools them, earns the full provisioned rate, targets more on top, and keeps your position out of view."
                className="mt-6 max-w-[24ch] text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[52px] lg:max-w-[26ch] lg:text-[64px]"
              />
            </div>
          </section>

          <FeatureStory />

          <section id="articles" aria-labelledby="articles-title" className="border-t border-rule bg-mist/60">
            <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:py-24">
              <div className="mb-10 flex items-end justify-between gap-6">
                <div>
                  <Reveal as="p" className="text-[13px] font-medium text-graphite">
                    Research and updates
                  </Reveal>
                  <WordReveal
                    as="h2"
                    text="Latest articles"
                    className="mt-3 block text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[44px]"
                  />
                </div>
                <Reveal delay={150}>
                  <ArrowLink href="/articles">All articles</ArrowLink>
                </Reveal>
              </div>
              <ArticleList articles={ARTICLES.slice(0, 4)} />
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
