/**
 * POST /api/transaction
 *
 * Builds a stake or unstake transaction and signs it with the treasury
 * keypair, then returns it to the browser. The user's wallet adds the
 * second signature and submits it.
 *
 * Why this lives on the server:
 * the treasury is the obSOL mint authority and pays out SOL on unstake.
 * If its secret key ships to the browser, anyone can mint obSOL or drain
 * the treasury. Here it is read from TREASURY_SECRET_KEY, an env var
 * without the NEXT_PUBLIC_ prefix, so Next.js never bundles it for the client.
 *
 * Why co-signing is safe:
 * the server builds the whole transaction itself and the treasury signature
 * covers every instruction. The user can't edit it without invalidating that
 * signature, and the transaction is atomic: no mint without the SOL payment,
 * no payout without the obSOL burn.
 *
 * Request:  { action: "stake" | "unstake", owner: "<base58 pubkey>", amount: number }
 * Response: { transaction: "<base64>", blockhash, lastValidBlockHeight }
 *           or { error: "<message>" } with a 4xx/5xx status.
 */
import { NextResponse } from 'next/server';
import { clusterApiUrl, Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { buildStakeInstructions, buildUnstakeInstructions } from '@/lib/oblio';

// Web3.js needs Node APIs; don't run this on the Edge runtime.
export const runtime = 'nodejs';

// Server-side RPC. RPC_URL lets the server use a different (private) endpoint.
const RPC_URL = process.env.RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl('devnet');

// Largest amount accepted per transaction, in SOL/obSOL. Guards against typos.
const MAX_AMOUNT = 1_000_000;

/** Loads the treasury keypair once per server instance. */
let treasury: Keypair | null = null;
function getTreasury(): Keypair {
  if (treasury) return treasury;
  const secret = process.env.TREASURY_SECRET_KEY;
  if (!secret) {
    throw new Error('TREASURY_SECRET_KEY is not set. Add it to .env.local (base58 secret key).');
  }
  treasury = Keypair.fromSecretKey(bs58.decode(secret));
  return treasury;
}

type Body = { action?: unknown; owner?: unknown; amount?: unknown };

export async function POST(request: Request) {
  // --- 1. Validate the request ---
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be JSON.' }, { status: 400 });
  }

  const { action, owner, amount } = body;
  if (action !== 'stake' && action !== 'unstake') {
    return NextResponse.json({ error: 'action must be "stake" or "unstake".' }, { status: 400 });
  }
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) {
    return NextResponse.json({ error: `amount must be between 0 and ${MAX_AMOUNT}.` }, { status: 400 });
  }
  let ownerKey: PublicKey;
  try {
    ownerKey = new PublicKey(owner as string);
  } catch {
    return NextResponse.json({ error: 'owner must be a valid Solana address.' }, { status: 400 });
  }

  // --- 2. Build and co-sign the transaction ---
  try {
    const treasuryKeypair = getTreasury();
    const connection = new Connection(RPC_URL, 'confirmed');

    const instructions =
      action === 'stake'
        ? buildStakeInstructions(ownerKey, treasuryKeypair.publicKey, amount)
        : buildUnstakeInstructions(ownerKey, treasuryKeypair.publicKey, amount);

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    const transaction = new Transaction({
      feePayer: ownerKey, // the user pays network fees
      blockhash,
      lastValidBlockHeight,
    }).add(...instructions);

    // Treasury signs first; the user's wallet signature is still missing,
    // so serialize without requiring all signatures.
    transaction.partialSign(treasuryKeypair);
    const serialized = transaction.serialize({ requireAllSignatures: false, verifySignatures: true });

    return NextResponse.json({
      transaction: serialized.toString('base64'),
      blockhash,
      lastValidBlockHeight,
    });
  } catch (error) {
    console.error('[api/transaction]', error);
    return NextResponse.json({ error: 'Could not build the transaction. Try again.' }, { status: 500 });
  }
}
