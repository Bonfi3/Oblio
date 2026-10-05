'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false, loading: () => <div className="h-10 w-[150px] rounded-[4px] bg-mist" /> }
);

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.02em]">
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG mark */}
      <img src="/oblio-mark.svg" alt="" width={30} height={30} className="h-[30px] w-[30px]" />
      Oblio
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-8">
        <div className="flex items-center gap-8">
          <Wordmark />
          <nav className="hidden text-sm text-graphite sm:block">
            <Link href="/articles" className="hover:text-ink">
              Articles
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-5">
          <span className="hidden items-center gap-2 text-sm text-graphite md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-ink" aria-hidden />
            Solana Devnet
          </span>
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}
