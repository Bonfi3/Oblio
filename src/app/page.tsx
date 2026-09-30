'use client';

import { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { BlackHole } from '@/components/BlackHole';
import { IntroLoader } from '@/components/IntroLoader';
import { ESTIMATED_APY, StakePanel } from '@/components/StakePanel';
import { useToast } from '@/components/ToastProvider';
import { obSOLMintAddress, UNSTAKE_RATE } from '@/utils/solana';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false, loading: () => <div className="h-10 w-[150px] rounded-[4px] bg-mist" /> }
);

const PROGRAM_REPO = 'https://github.com/metapozza/oblio-program';
const mint = obSOLMintAddress.toBase58();

function Wordmark() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.02em]">
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG mark */}
      <img src="/oblio-mark.svg" alt="" width={30} height={30} className="h-[30px] w-[30px]" />
      Oblio
    </span>
  );
}

export default function Home() {
  const horizonRef = useRef<HTMLDivElement>(null);
  const [introDone, setIntroDone] = useState(false);
  const { showToast } = useToast();
  const handleIntroDone = useCallback(() => setIntroDone(true), []);

  const copyMint = async () => {
    try {
      await navigator.clipboard.writeText(mint);
      showToast('obSOL mint address copied', 'success', 2500);
    } catch {
      showToast('Copy failed. Select the address and copy it manually.', 'error');
    }
  };

  return (
    <>
      <IntroLoader targetRef={horizonRef} onDone={handleIntroDone} />

      <div className="flex min-h-dvh flex-col">
        <header className="border-b border-rule">
          <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-8">
            <Wordmark />
            <div className="flex items-center gap-5">
              <span className="hidden items-center gap-2 text-sm text-graphite sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-ink" aria-hidden />
                Solana Devnet
              </span>
              <WalletMultiButton />
            </div>
          </div>
        </header>

        <main className="mx-auto grid w-full max-w-[1440px] flex-1 grid-cols-1 items-center gap-y-10 px-4 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-10 lg:py-10 xl:gap-x-14">
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

            <dl className="mx-auto mt-8 grid max-w-[420px] grid-cols-3 border-t border-ink lg:mx-0">
              {[
                ['Estimated APY', `${ESTIMATED_APY}%`],
                ['Redemption', `${UNSTAKE_RATE.toFixed(2)} SOL`],
                ['Network', 'Devnet'],
              ].map(([label, value]) => (
                <div key={label} className="pt-3 lg:pr-3">
                  <dt className="text-[13px] text-graphite">{label}</dt>
                  <dd className="tabular mt-1 text-xl font-medium tracking-[-0.01em]">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="mx-auto w-full min-w-0 max-w-[440px] lg:col-start-3 lg:row-start-1 lg:mr-0 lg:max-w-[420px]">
            <StakePanel />
          </div>
        </main>

        <footer className="border-t border-rule">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-5 text-[13px] text-graphite sm:px-8 sm:py-6 sm:text-sm">
            <button onClick={copyMint} className="tabular whitespace-nowrap hover:text-ink" title="Copy obSOL mint address">
              <span className="hidden sm:inline">obSOL mint </span>
              <span className="sm:hidden">Mint </span>
              {mint.slice(0, 4)}…{mint.slice(-4)}
            </button>
            <a href={PROGRAM_REPO} target="_blank" rel="noreferrer" className="whitespace-nowrap hover:text-ink sm:ml-auto">
              <span className="hidden sm:inline">Program source</span>
              <span className="sm:hidden">Source</span>
            </a>
            <span className="whitespace-nowrap">
              <span className="hidden sm:inline">Beta on devnet. Not audited.</span>
              <span className="sm:hidden">Devnet beta, unaudited</span>
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
