import { 
  Connection, 
  PublicKey,
  Transaction,
  Keypair,
  sendAndConfirmTransaction,
  clusterApiUrl
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { TOKENOMICS } from './tokenomics';

export class TYPRToken {
  private connection: Connection;
  private mint: PublicKey;
  private rewardsPool: Keypair;

  constructor(connection: Connection, mint: PublicKey, rewardsPool: Keypair) {
    this.connection = connection;
    this.mint = mint;
    this.rewardsPool = rewardsPool;
  }

  async distributeReward(
    userPubkey: PublicKey,
    wpm: number,
    accuracy: number,
    streak: number = 0
  ): Promise<string> {
    try {
      const rewardAmount = TOKENOMICS.calculateReward(wpm, accuracy, streak);
      if (rewardAmount <= 0) return '';

      const userAta = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.rewardsPool,
        this.mint,
        userPubkey
      );

      const transaction = new Transaction().add(
        createTransferInstruction(
          userAta.address,
          userAta.address,
          userPubkey,
          Math.floor(rewardAmount * Math.pow(10, TOKENOMICS.DECIMALS))
        )
      );

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.rewardsPool]
      );

      return signature;
    } catch (error) {
      console.error('Error distributing reward:', error);
      throw error;
    }
  }

  async getUserBalance(userPubkey: PublicKey): Promise<number> {
    try {
      const userAta = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.rewardsPool,
        this.mint,
        userPubkey
      );

      const balance = (await this.connection.getTokenAccountBalance(userAta.address)).value;
      return parseFloat(balance.uiAmount?.toFixed(2) || '0');
    } catch (error) {
      console.error('Error getting user balance:', error);
      return 0;
    }
  }
}

export const initializeTYPRToken = async (): Promise<TYPRToken> => {
  try {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const mintAddress = import.meta.env.VITE_TYPR_TOKEN_MINT;
    const rewardsPoolKey = import.meta.env.VITE_REWARDS_POOL_KEYPAIR;

    if (!mintAddress) {
      throw new Error('Missing TYPR token mint address');
    }

    const mint = new PublicKey(mintAddress);
    const rewardsPool = Keypair.fromSeed(new Uint8Array(32).fill(1));

    return new TYPRToken(connection, mint, rewardsPool);
  } catch (error) {
    console.error('Failed to initialize TYPR token:', error);
    throw error;
  }
};