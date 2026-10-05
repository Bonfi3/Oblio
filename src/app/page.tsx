'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArticleList } from '@/components/ArticleList';
import { BlackHole } from '@/components/BlackHole';
import { FeatureStory } from '@/components/FeatureStory';
import { GravityWell } from '@/components/GravityWell';
import { IntroLoader } from '@/components/IntroLoader';
import { CountUp, Reveal, ScrubWords, WordReveal } from '@/components/motion';
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
  const wellRef = useRef<HTMLDivElement>(null);
  // The intro only plays when the site is first loaded on this page, not on client navigations back to it.
  const [playIntro] = useState(() => !navState.introPlayed);
  // The page animates in as soon as the loader starts to clear
  const [introDone, setIntroDone] = useState(!playIntro);
  const handleReveal = useCallback(() => setIntroDone(true), []);

  useEffect(() => {
    const section = navState.pendingSection;
    if (!section) return;
    navState.pendingSection = null;
    // Start from the top so the page visibly scrolls down to the section.
    window.scrollTo(0, 0);
    scrollToSection(section);
  }, []);

  return (
    <>
      {playIntro && <IntroLoader targetRef={wellRef} onReveal={handleReveal} onDone={handleReveal} />}
      <div className="flex min-h-dvh flex-col">
        <SiteHeader overlay />

        <main className="flex-1">
          <div className="relative overflow-hidden">
            <GravityWell ref={wellRef} />

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

                <Reveal as="dl" play={introDone} delay={500} className="mx-auto mt-10 flex max-w-[560px] justify-center gap-x-10 border-t border-ink text-center sm:gap-x-16 lg:mx-0 lg:mt-12 lg:justify-start">
                  <div className="pt-4">
                    <dt className="text-[13px] leading-tight text-graphite lg:text-[15px]">Provisioned staking APY</dt>
                    <dd className="tabular mt-2 text-[28px] font-medium tracking-[-0.02em] lg:text-[40px]">
                      <CountUp value={PROVISIONED_APY} suffix="%" play={introDone} />
                    </dd>
                  </div>
                  <div className="pt-4">
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

          {/* isolate + bg-paper: the statement blends only against this section's white and the black hole */}
          <section aria-label="Confidential by design" className="relative isolate overflow-hidden border-t border-rule bg-paper">
            <BlackHole
              interactive
              className="!absolute left-[82%] top-[78%] !w-[150vw] max-w-none -translate-x-1/2 -translate-y-1/2 lg:left-[72%] lg:top-1/2 lg:!w-[min(82vw,1240px)]"
            />
            <div className="relative mx-auto max-w-[1440px] px-4 py-24 sm:px-8 lg:py-40">
              <Reveal as="p" className="text-[13px] font-medium text-graphite">
                Confidential by design
              </Reveal>
              <ScrubWords
                text="On a public chain every stake position is visible to anyone. Oblio pools them, earns the full provisioned rate, targets more on top, and keeps your position out of view."
                className="mt-6 max-w-[24ch] text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] text-paper mix-blend-difference sm:text-[52px] lg:max-w-[26ch] lg:text-[64px]"
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
