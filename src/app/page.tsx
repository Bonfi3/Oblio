'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArticleList } from '@/components/ArticleList';
import { BlackHole } from '@/components/BlackHole';
import { IntroLoader } from '@/components/IntroLoader';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { StakePanel } from '@/components/StakePanel';
import { EXPECTED_ADDITIONAL_APY, PROVISIONED_APY } from '@/lib/apy';
import { ARTICLES, FEATURES } from '@/lib/articles';
import { navState, scrollToSection } from '@/lib/navigation';
import { UNSTAKE_RATE } from '@/utils/solana';

function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1 text-sm font-medium text-ink hover:underline hover:underline-offset-4">
      {children}
      <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}

export default function Home() {
  const horizonRef = useRef<HTMLDivElement>(null);
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

  return (
    <>
      {playIntro && <IntroLoader targetRef={horizonRef} onDone={handleIntroDone} />}

      <div className="flex min-h-dvh flex-col">
        <SiteHeader />

        <main className="flex-1">
          <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-y-10 px-4 py-8 sm:px-8 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-10 lg:py-10 xl:gap-x-14">
            {/* The black hole sits at the center of the page: the loader forms it here */}
            <div className="min-w-0 lg:col-start-2 lg:row-start-1">
              <BlackHole
                horizonRef={horizonRef}
                visible={introDone}
                className="mx-auto -my-4 max-w-[420px] sm:my-0 lg:w-[clamp(320px,min(32vw,64vh),520px)] lg:max-w-none"
              />
            </div>

            <section className="min-w-0 text-center lg:col-start-1 lg:row-start-1 lg:max-w-[420px] lg:text-left">
              <h1 className="mx-auto max-w-[15ch] text-[38px] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-[48px] lg:mx-0 lg:text-[42px] xl:text-[50px]">
                Confidential liquid staking on Solana
              </h1>
              <p className="mx-auto mt-5 max-w-[42ch] text-balance text-[17px] leading-relaxed text-graphite lg:mx-0 lg:text-pretty">
                Stake SOL and receive obSOL, a liquid token you can hold or redeem at any time. Your position stays
                out of view.
              </p>

              <dl className="mx-auto mt-8 grid max-w-[420px] grid-cols-3 border-t border-ink text-left lg:mx-0">
                <div className="pt-3 pr-3">
                  <dt className="text-[13px] leading-tight text-graphite">Provisioned staking APY</dt>
                  <dd className="tabular mt-1 text-xl font-medium tracking-[-0.01em]">{PROVISIONED_APY.toFixed(2)}%</dd>
                </div>
                <div className="pt-3 pr-3">
                  <dt className="text-[13px] leading-tight text-graphite">Expected additional APY</dt>
                  <dd className="tabular mt-1 text-xl font-medium tracking-[-0.01em]">
                    +{EXPECTED_ADDITIONAL_APY.toFixed(1)}%
                  </dd>
                  <dd className="mt-1 text-[13px]">
                    <Link href="/articles/additional-apy" className="underline decoration-rule underline-offset-4 hover:decoration-ink">
                      How it works
                    </Link>
                  </dd>
                </div>
                <div className="pt-3">
                  <dt className="text-[13px] leading-tight text-graphite">Redemption</dt>
                  <dd className="tabular mt-1 text-xl font-medium tracking-[-0.01em]">{UNSTAKE_RATE.toFixed(2)} SOL</dd>
                </div>
              </dl>
            </section>

            <div className="mx-auto w-full min-w-0 max-w-[440px] lg:col-start-3 lg:row-start-1 lg:mr-0 lg:max-w-[420px]">
              <StakePanel />
            </div>
          </div>

          <section aria-labelledby="features-title" className="border-t border-rule">
            <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:py-24">
              <div className="max-w-[640px]">
                <p className="text-[13px] font-medium text-graphite">Why Oblio</p>
                <h2 id="features-title" className="mt-3 text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[36px]">
                  Three ways Oblio maximizes your staking earnings
                </h2>
                <p className="mt-4 text-[17px] leading-relaxed text-graphite">
                  On top of the {PROVISIONED_APY.toFixed(2)}% provisioned rate, these features target an additional{' '}
                  {EXPECTED_ADDITIONAL_APY.toFixed(1)}% a year.
                </p>
              </div>

              <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8 lg:gap-12">
                {FEATURES.map((f, i) => (
                  <li key={f.slug} className="flex flex-col border-t border-ink pt-5">
                    <span className="tabular text-[13px] text-graphite">0{i + 1}</span>
                    <h3 className="mt-6 text-[20px] font-semibold tracking-[-0.015em]">{f.title}</h3>
                    <p className="mt-3 flex-1 text-[15px] leading-relaxed text-graphite">{f.text}</p>
                    <div className="mt-6">
                      <ArrowLink href={`/articles/${f.slug}`}>Read the article</ArrowLink>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section id="articles" aria-labelledby="articles-title" className="border-t border-rule bg-mist/60">
            <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:py-24">
              <div className="mb-10 flex items-end justify-between gap-6">
                <div>
                  <p className="text-[13px] font-medium text-graphite">Research and updates</p>
                  <h2 id="articles-title" className="mt-3 text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[36px]">
                    Latest articles
                  </h2>
                </div>
                <ArrowLink href="/articles">All articles</ArrowLink>
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
