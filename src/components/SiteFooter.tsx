'use client';

import { useToast } from '@/components/ToastProvider';
import { obSOLMintAddress } from '@/utils/solana';

const PROGRAM_REPO = 'https://github.com/metapozza/oblio-program';
const mint = obSOLMintAddress.toBase58();

export function SiteFooter() {
  const { showToast } = useToast();

  const copyMint = async () => {
    try {
      await navigator.clipboard.writeText(mint);
      showToast('obSOL mint address copied', 'success', 2500);
    } catch {
      showToast('Copy failed. Select the address and copy it manually.', 'error');
    }
  };

  return (
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
  );
}
