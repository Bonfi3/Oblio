'use client';

import { MouseEvent, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { navState, scrollToSection, smoothScrollTo } from '@/lib/navigation';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false, loading: () => <div className="h-10 w-[150px] rounded-[4px] bg-mist" /> }
);

function Wordmark({ onClick }: { onClick: (e: MouseEvent) => void }) {
  return (
    <Link href="/" onClick={onClick} className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.02em]">
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG mark */}
      <img src="/oblio-mark.svg" alt="" width={30} height={30} className="h-[30px] w-[30px]" />
      Oblio
    </Link>
  );
}

const isPlainClick = (e: MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const onHome = pathname === '/';

  useEffect(() => {
    navState.introPlayed = true;
  }, []);

  // On the home page, scroll instead of navigating so the intro is not replayed.
  const goHome = (e: MouseEvent) => {
    if (!onHome || !isPlainClick(e)) return;
    e.preventDefault();
    if (window.location.hash) history.replaceState(null, '', '/');
    smoothScrollTo(0);
  };

  const goArticles = (e: MouseEvent) => {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    if (onHome) {
      scrollToSection('articles');
    } else {
      navState.pendingSection = 'articles';
      router.push('/', { scroll: false });
    }
  };

  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-8">
        <div className="flex items-center gap-8">
          <Wordmark onClick={goHome} />
          <nav className="hidden text-sm text-graphite sm:block">
            <Link href="/#articles" onClick={goArticles} className="hover:text-ink">
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
