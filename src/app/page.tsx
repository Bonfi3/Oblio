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

export default function Home() {
  const horizonRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const heroView = useRef<BlackHoleView>({ ...DEFAULT_VIEW });
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

  // As the hero scrolls away the black hole lags behind and tips toward the reader.
  useScrollProgress(heroRef, () => {
    const hero = heroRef.current;
    const layer = parallaxRef.current;
    if (!hero || !layer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const scrolled = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / hero.offsetHeight));
    layer.style.transform = `translate3d(0, ${scrolled * hero.offsetHeight * 0.35}px, 0) scale(${1 - scrolled * 0.12})`;
    heroView.current = { tilt: DEFAULT_VIEW.tilt + scrolled * 0.45, rotation: DEFAULT_VIEW.rotation + scrolled * 0.2 };
  });

  return (
    <>
      {playIntro && <IntroLoader targetRef={horizonRef} onDone={handleIntroDone} />}

      <div className="flex min-h-dvh flex-col">
        <SiteHeader />

        <main className="flex-1">
          <div
            ref={heroRef}
            className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-y-10 px-4 py-8 sm:px-8 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-10 lg:py-10 xl:gap-x-14"
          >
            {/* The black hole sits at the center of the page: the loader forms it here */}
            <div className="min-w-0 lg:col-start-2 lg:row-start-1">
              <div ref={parallaxRef} className="will-change-transform">
                <div className={introDone ? 'animate-float' : ''}>
                  <BlackHole
                    horizonRef={horizonRef}
                    visible={introDone}
                    view={heroView}
                    interactive={introDone}
                    className="mx-auto -my-4 max-w-[420px] sm:my-0 lg:w-[clamp(320px,min(32vw,64vh),520px)] lg:max-w-none"
                  />
                </div>
              </div>
            </div>

            <section className="min-w-0 text-center lg:col-start-1 lg:row-start-1 lg:max-w-[420px] lg:text-left">
              <WordReveal
                as="h1"
                play={introDone}
                text="Confidential liquid staking on Solana"
                className="mx-auto block max-w-[15ch] text-[38px] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-[48px] lg:mx-0 lg:text-[42px] xl:text-[50px]"
              />
              <Reveal as="p" play={introDone} delay={350} className="mx-auto mt-5 max-w-[42ch] text-balance text-[17px] leading-relaxed text-graphite lg:mx-0 lg:text-pretty">
                Stake SOL and receive obSOL, a liquid token you can hold or redeem at any time. Your position stays
                out of view.
              </Reveal>

              <Reveal as="dl" play={introDone} delay={500} className="mx-auto mt-8 grid max-w-[420px] grid-cols-2 border-t border-ink text-left lg:mx-0">
                <div className="pt-3 pr-3">
                  <dt className="text-[13px] leading-tight text-graphite">Provisioned staking APY</dt>
                  <dd className="tabular mt-1 text-xl font-medium tracking-[-0.01em]">
                    <CountUp value={PROVISIONED_APY} suffix="%" play={introDone} />
                  </dd>
                </div>
                <div className="pt-3 pr-3">
                  <dt className="text-[13px] leading-tight text-graphite">Expected additional APY</dt>
                  <dd className="tabular mt-1 text-xl font-medium tracking-[-0.01em]">
                    <CountUp value={EXPECTED_ADDITIONAL_APY} decimals={1} prefix="+" suffix="%" play={introDone} />
                  </dd>
                  <dd className="mt-1 text-[13px]">
                    <Link href="/articles/additional-apy" className="underline decoration-rule underline-offset-4 transition-colors hover:decoration-ink">
                      How it works
                    </Link>
                  </dd>
                </div>
              </Reveal>
            </section>

            <Reveal play={introDone} delay={250} className="mx-auto w-full min-w-0 max-w-[440px] lg:col-start-3 lg:row-start-1 lg:mr-0 lg:max-w-[420px]">
              <StakePanel />
            </Reveal>
          </div>

          <section aria-label="Confidential by design" className="border-t border-rule">
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
