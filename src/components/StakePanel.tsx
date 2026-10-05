'use client';

import { useCallback, useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { getBalances, stake, unstake, UNSTAKE_RATE } from '@/utils/solana';
import { PROVISIONED_APY } from '@/lib/apy';
import { COMING_SOON } from '@/lib/launch';
import { useToast } from './ToastProvider';

const FEE_RESERVE = 0.01; // SOL kept aside for network fees
const EXPLORER = (signature: string) => `https://explorer.solana.com/tx/${signature}?cluster=devnet`;

type Mode = 'stake' | 'unstake';

const format = (value: number, digits = 4) =>
  value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

const sanitize = (value: string) => {
  const normalized = value.replace(',', '.').replace(/[^0-9.]/g, '');
  const [whole, ...rest] = normalized.split('.');
  return rest.length ? `${whole}.${rest.join('').slice(0, 9)}` : whole;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
      <dt className="text-graphite">{label}</dt>
      <dd className="tabular text-right font-medium">{value}</dd>
    </div>
  );
}

export function StakePanel() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();
  const { showToast, removeToast } = useToast();
  const { publicKey, connected } = wallet;

  const [mode, setMode] = useState<Mode>('stake');
  const [amount, setAmount] = useState('');
  const [balances, setBalances] = useState({ sol: 0, obSOL: 0 });
  const [pending, setPending] = useState(false);

  const refreshBalances = useCallback(async () => {
    if (!publicKey) {
      setBalances({ sol: 0, obSOL: 0 });
      return;
    }
    try {
      setBalances(await getBalances(connection, publicKey));
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with the chain
    refreshBalances();
    const interval = setInterval(refreshBalances, 10_000);
    return () => clearInterval(interval);
  }, [refreshBalances]);

  const isStake = mode === 'stake';
  const available = isStake ? Math.max(balances.sol - FEE_RESERVE, 0) : balances.obSOL;
  const inputUnit = isStake ? 'SOL' : 'obSOL';
  const value = parseFloat(amount) || 0;
  const exceeds = connected && value > available;
  const receive = isStake ? value : value * UNSTAKE_RATE;

  const fillMax = () => setAmount(available > 0 ? String(Math.floor(available * 1e4) / 1e4) : '');

  const switchMode = (next: Mode) => {
    setMode(next);
    setAmount('');
  };

  const submit = async () => {
    if (COMING_SOON) return;
    if (!connected) {
      setVisible(true);
      return;
    }
    if (value <= 0 || exceeds || pending) return;

    const verb = isStake ? 'Staking' : 'Unstaking';
    setPending(true);
    const loadingId = showToast(`${verb} ${value} ${inputUnit}. Approve the transaction in your wallet.`, 'loading', Infinity);
    try {
      const signature = await (isStake ? stake : unstake)(connection, wallet, value);
      removeToast(loadingId);
      showToast(
        isStake ? `Staked ${value} SOL` : `Unstaked ${value} obSOL for ${format(receive)} SOL`,
        'success',
        8000,
        { href: EXPLORER(signature), label: 'View' }
      );
      setAmount('');
      await refreshBalances();
    } catch (error) {
      removeToast(loadingId);
      console.error(`${verb} failed:`, error);
      const rejected = error instanceof Error && /reject/i.test(error.message);
      showToast(
        rejected ? 'Transaction cancelled in wallet' : `${isStake ? 'Stake' : 'Unstake'} failed. Check your balance and try again.`,
        rejected ? 'info' : 'error',
        6000
      );
    } finally {
      setPending(false);
    }
  };

  const buttonLabel = COMING_SOON
    ? 'Coming soon'
    : !connected
    ? 'Connect wallet'
    : pending
      ? 'Confirming…'
      : isStake
        ? 'Stake SOL'
        : 'Unstake obSOL';

  return (
    <section aria-label="Stake and unstake" className="rounded-[6px] border border-rule bg-paper">
      <div role="tablist" className="grid grid-cols-2 border-b border-rule">
        {(['stake', 'unstake'] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => switchMode(m)}
            className={`relative h-14 text-[15px] font-medium transition-colors ${
              mode === m ? 'text-ink' : 'text-graphite hover:text-ink'
            }`}
          >
            {m === 'stake' ? 'Stake' : 'Unstake'}
            <span
              className={`absolute inset-x-0 -bottom-px h-0.5 bg-ink transition-opacity ${mode === m ? 'opacity-100' : 'opacity-0'}`}
            />
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-7">
        <div className="flex items-baseline justify-between">
          <label htmlFor="amount" className="text-sm font-medium">
            {isStake ? 'Amount to stake' : 'Amount to unstake'}
          </label>
          {connected && (
            <span className="tabular text-sm text-graphite">
              Available {format(available)} {inputUnit}
            </span>
          )}
        </div>

        <div
          className={`mt-3 flex items-center rounded-[4px] border bg-paper transition-colors focus-within:border-ink ${
            exceeds ? 'border-alert' : 'border-rule hover:border-[#bdbdbd]'
          }`}
        >
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(sanitize(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            aria-invalid={exceeds || undefined}
            aria-describedby={exceeds ? 'amount-error' : undefined}
            className="tabular w-full min-w-0 flex-1 bg-transparent px-4 py-4 text-[28px] font-medium tracking-[-0.01em] placeholder:text-[#c4c4c4] focus:outline-none focus-visible:outline-none"
          />
          {connected && (
            <button
              type="button"
              onClick={fillMax}
              className="mr-2 rounded-[3px] px-2.5 py-1.5 text-sm font-medium text-graphite hover:bg-mist hover:text-ink"
            >
              Max
            </button>
          )}
          <span className="border-l border-rule px-4 py-2 text-sm font-medium">{inputUnit}</span>
        </div>
        <p id="amount-error" className={`mt-2 min-h-5 text-sm text-alert ${exceeds ? '' : 'invisible'}`}>
          Amount exceeds your available {inputUnit} balance.
        </p>

        <dl className="mt-3 divide-y divide-rule border-y border-rule">
          <Row label="You receive" value={`${format(receive)} ${isStake ? 'obSOL' : 'SOL'}`} />
          {isStake ? (
            <>
              <Row label="Exchange rate" value="1 SOL = 1 obSOL" />
              <Row label="Provisioned staking APY" value={`${PROVISIONED_APY.toFixed(2)}%`} />
              <Row label="Estimated yearly reward" value={`${format(value * (PROVISIONED_APY / 100))} SOL`} />
            </>
          ) : (
            <Row label="Redemption rate" value={`1 obSOL = ${UNSTAKE_RATE.toFixed(2)} SOL`} />
          )}
        </dl>

        <button
          onClick={submit}
          disabled={COMING_SOON || (connected && (pending || value <= 0 || exceeds))}
          className="mt-6 h-13 w-full rounded-[4px] bg-ink text-[15px] font-medium text-paper transition-colors hover:bg-[#262626] disabled:cursor-not-allowed disabled:bg-mist disabled:text-[#9a9a9a]"
        >
          {buttonLabel}
        </button>

        {connected && (
          <p className="mt-4 text-center text-xs text-graphite">
            {isStake
              ? `${FEE_RESERVE} SOL stays in your wallet to cover network fees.`
              : 'SOL is returned to your wallet in the same transaction.'}
          </p>
        )}
      </div>
    </section>
  );
}
