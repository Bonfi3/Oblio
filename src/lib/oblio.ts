/**
 * Oblio protocol constants and transaction builders.
 *
 * This module is shared by the browser and the server, so it must never
 * contain secrets. The treasury keypair lives only in the API route
 * (src/app/api/transaction/route.ts), loaded from a server-only env var.
 */
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { Buffer } from 'buffer';

// --- Protocol configuration ---

/** Address that receives the SOL deposited by stakers. */
export const STATIC_ADDRESS = new PublicKey('FqpTYTSHDmsHcXKyKfTscvoziARvqHvggpDFphdQgEgL');

/** obSOL SPL token mint. Its mint authority is the treasury wallet. */
export const obSOLMintAddress = new PublicKey('B4u93JEn6tyL4Paq13i5FhEkPDWdMCDs5h9VbEFieq45');

/** obSOL has 6 decimals: 1 obSOL = 1_000_000 base units. */
export const OBSOL_DECIMALS = 1_000_000;

/** SOL returned for each obSOL burned. */
export const UNSTAKE_RATE = 1.2;

// --- Minimal SPL Token helpers (replaces @solana/spl-token) ---
// Only the four operations Oblio needs are implemented. The byte layouts
// match the official SPL Token and Associated Token Account programs.

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

const MINT_TO_INSTRUCTION = 7;
const BURN_INSTRUCTION = 8;
const CREATE_IDEMPOTENT_INSTRUCTION = 1;

/** Derives the owner's associated token account for a mint. */
export function getAssociatedTokenAddress(mint: PublicKey, owner: PublicKey): PublicKey {
  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return address;
}

/** Instruction tag (1 byte) followed by a u64 little-endian amount. */
function amountInstructionData(instruction: number, amount: number): Buffer {
  const data = Buffer.alloc(9);
  data.writeUInt8(instruction, 0);
  data.writeBigUInt64LE(BigInt(amount), 1);
  return data;
}

/** Creates the token account if missing; a no-op if it already exists. */
function createAssociatedTokenAccountIdempotentInstruction(
  payer: PublicKey,
  associatedToken: PublicKey,
  owner: PublicKey,
  mint: PublicKey
): TransactionInstruction {
  return new TransactionInstruction({
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: associatedToken, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: false, isWritable: false },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([CREATE_IDEMPOTENT_INSTRUCTION]),
  });
}

function createMintToInstruction(
  mint: PublicKey,
  destination: PublicKey,
  authority: PublicKey,
  amount: number
): TransactionInstruction {
  return new TransactionInstruction({
    programId: TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: destination, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: false },
    ],
    data: amountInstructionData(MINT_TO_INSTRUCTION, amount),
  });
}

function createBurnInstruction(
  account: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  amount: number
): TransactionInstruction {
  return new TransactionInstruction({
    programId: TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ],
    data: amountInstructionData(BURN_INSTRUCTION, amount),
  });
}

// --- Transaction builders ---
// Each action is a single atomic transaction: either every instruction
// succeeds or none does. That is what makes server co-signing safe — the
// treasury signature is only valid together with the user's payment/burn.

/**
 * Stake: the user sends SOL to STATIC_ADDRESS and receives the same
 * amount of obSOL, minted by the treasury (mint authority).
 */
export function buildStakeInstructions(
  owner: PublicKey,
  mintAuthority: PublicKey,
  amount: number
): TransactionInstruction[] {
  const userObSOLAddress = getAssociatedTokenAddress(obSOLMintAddress, owner);
  return [
    // 1. SOL from the user to the static address
    SystemProgram.transfer({
      fromPubkey: owner,
      toPubkey: STATIC_ADDRESS,
      lamports: Math.round(amount * LAMPORTS_PER_SOL),
    }),
    // 2. The user's obSOL token account, created on first stake
    createAssociatedTokenAccountIdempotentInstruction(owner, userObSOLAddress, owner, obSOLMintAddress),
    // 3. obSOL minted to the user at a 1:1 ratio
    createMintToInstruction(obSOLMintAddress, userObSOLAddress, mintAuthority, Math.round(amount * OBSOL_DECIMALS)),
  ];
}

/**
 * Unstake: the user burns obSOL and the treasury pays back
 * amount * UNSTAKE_RATE SOL.
 */
export function buildUnstakeInstructions(
  owner: PublicKey,
  treasury: PublicKey,
  amount: number
): TransactionInstruction[] {
  const userObSOLAddress = getAssociatedTokenAddress(obSOLMintAddress, owner);
  return [
    // 1. obSOL burned from the user's token account (fails if balance is too low)
    createBurnInstruction(userObSOLAddress, obSOLMintAddress, owner, Math.round(amount * OBSOL_DECIMALS)),
    // 2. SOL from the treasury back to the user
    SystemProgram.transfer({
      fromPubkey: treasury,
      toPubkey: owner,
      lamports: Math.round(amount * UNSTAKE_RATE * LAMPORTS_PER_SOL),
    }),
  ];
}

// --- Reads ---

/** Returns the user's SOL and obSOL balances. */
export async function getBalances(
  connection: Connection,
  owner: PublicKey
): Promise<{ sol: number; obSOL: number }> {
  const userObSOLAddress = getAssociatedTokenAddress(obSOLMintAddress, owner);
  const [lamports, tokenAccount] = await Promise.all([
    connection.getBalance(owner),
    connection.getAccountInfo(userObSOLAddress),
  ]);

  let obSOL = 0;
  if (tokenAccount) {
    const balance = await connection.getTokenAccountBalance(userObSOLAddress);
    obSOL = balance.value.uiAmount ?? 0;
  }
  return { sol: lamports / LAMPORTS_PER_SOL, obSOL };
}
