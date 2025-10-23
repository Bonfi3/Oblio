import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createBurnInstruction,
  createMint,
} from '@solana/spl-token';
import { WalletContextState } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';

// --- IMPORTANT CONFIGURATION ---

// 1. Replace with the static public key where you want to receive SOL.
const STATIC_ADDRESS = new PublicKey('FqpTYTSHDmsHcXKyKfTscvoziARvqHvggpDFphdQgEgL');

// 2. Replace with the secret key for your treasury wallet.
//    - This wallet will be the mint authority for "obSOL".
//    - It will pay out SOL when users burn "obSOL".
//    - In production, load this from a secure environment variable, DO NOT hardcode it.
//    - You can generate a new keypair with `solana-keygen new`.
let decodedSecretKey: Uint8Array;
decodedSecretKey = bs58.decode("3ArHkaRSSyF7mkAqEytFviTN7pyyzAUibHjnY6UChKy6pmfTi8jZaeKakbNa2pxsBHiVY5HMNV9eicEY6E7Eu196");
const treasuryWallet = Keypair.fromSecretKey(decodedSecretKey);

// 3. This will hold your "obSOL" token's mint address.
//    - After creating the mint for the first time, paste the address here.
let obSOLMintAddress = new PublicKey('B4u93JEn6tyL4Paq13i5FhEkPDWdMCDs5h9VbEFieq45');

// 4. obSOL token decimals (if your token has 6 decimals like USDC, use 1_000_000)
//    If your token has 9 decimals like SOL, use LAMPORTS_PER_SOL (1_000_000_000)
const OBSOL_DECIMALS = 1_000_000; // 6 decimals

/**
 * Mints "obSOL" tokens in exchange for SOL.
 * Sends SOL to the static address and mints an equal amount of "obSOL" to the user.
 */
export async function stake(
  connection: Connection,
  wallet: WalletContextState,
  amount: number
): Promise<string> {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    throw new Error('Wallet not connected');
  }
  if (!obSOLMintAddress) {
    throw new Error("obSOL mint address is not set.");
  }

  const transaction = new Transaction();

  // 1. Transfer SOL from the user to the static address
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: STATIC_ADDRESS,
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );

  // 2. Get or create the user's associated token account for "obSOL"
  const userObSOLAddress = await getAssociatedTokenAddress(obSOLMintAddress, wallet.publicKey);
  const userObSOLAccount = await connection.getAccountInfo(userObSOLAddress);
  if (!userObSOLAccount) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        userObSOLAddress,
        wallet.publicKey,
        obSOLMintAddress
      )
    );
  }

  // 3. Mint "obSOL" to the user's token account (1:1 ratio with SOL)
  transaction.add(
    createMintToInstruction(
      obSOLMintAddress,
      userObSOLAddress,
      treasuryWallet.publicKey, // Mint authority
      amount * OBSOL_DECIMALS // Use obSOL decimals for 1:1 ratio
    )
  );

  try {
    const signature = await wallet.sendTransaction(transaction, connection, {
      signers: [treasuryWallet],
    });
    await connection.confirmTransaction(signature, 'processed');
    console.log('Mint successful:', signature);
    return signature;
  } catch (error) {
    console.error('Mint failed:', error);
    throw error;
  }
}

/**
 * Burns "obSOL" tokens and returns SOL to the user at a 1.2x rate.
 */
export async function unstake(
  connection: Connection,
  wallet: WalletContextState,
  amount: number
): Promise<string> {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    throw new Error('Wallet not connected');
  }
  if (!obSOLMintAddress) {
    throw new Error("obSOL mint address is not set.");
  }

  const transaction = new Transaction();

  // 1. Get the user's associated token account for "obSOL"
  const userObSOLAddress = await getAssociatedTokenAddress(obSOLMintAddress, wallet.publicKey);

  // 2. Burn "obSOL" from the user's token account
  transaction.add(
    createBurnInstruction(
      userObSOLAddress,
      obSOLMintAddress,
      wallet.publicKey, // Owner of the token account
      amount * OBSOL_DECIMALS // Use obSOL decimals
    )
  );

  // 3. Transfer SOL from the treasury wallet back to the user (amount * 1.2)
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: treasuryWallet.publicKey,
      toPubkey: wallet.publicKey,
      lamports: amount * 1.2 * LAMPORTS_PER_SOL,
    })
  );

  try {
    const signature = await wallet.sendTransaction(transaction, connection, {
      signers: [treasuryWallet],
    });
    await connection.confirmTransaction(signature, 'processed');
    console.log('Burn successful:', signature);
    return signature;
  } catch (error) {
    console.error('Burn failed:', error);
    throw error;
  }
}