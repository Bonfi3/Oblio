/**
 * Browser-side stake/unstake.
 *
 * The browser never holds the treasury key. It asks /api/transaction for a
 * transaction already signed by the treasury, has the user's wallet add its
 * signature, and submits it to the network.
 */
import { Connection, Transaction } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Buffer } from 'buffer';

export { getBalances, obSOLMintAddress, UNSTAKE_RATE } from '@/lib/oblio';

type Action = 'stake' | 'unstake';

interface TransactionResponse {
  transaction: string; // base64, partially signed by the treasury
  blockhash: string;
  lastValidBlockHeight: number;
}

async function execute(
  action: Action,
  connection: Connection,
  wallet: WalletContextState,
  amount: number
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  // 1. Ask the server to build the transaction and co-sign it with the treasury
  const response = await fetch('/api/transaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, owner: wallet.publicKey.toBase58(), amount }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? `Server error ${response.status}`);
  }
  const { transaction, blockhash, lastValidBlockHeight } = payload as TransactionResponse;

  // 2. The user's wallet adds its signature (the treasury one is kept)
  const signed = await wallet.signTransaction(Transaction.from(Buffer.from(transaction, 'base64')));

  // 3. Submit and wait for confirmation
  const signature = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'processed');
  return signature;
}

/** Sends SOL and mints the same amount of obSOL to the user. */
export const stake = (connection: Connection, wallet: WalletContextState, amount: number) =>
  execute('stake', connection, wallet, amount);

/** Burns obSOL and returns amount * UNSTAKE_RATE SOL to the user. */
export const unstake = (connection: Connection, wallet: WalletContextState, amount: number) =>
  execute('unstake', connection, wallet, amount);
