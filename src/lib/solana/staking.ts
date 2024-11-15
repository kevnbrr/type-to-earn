import { 
  Connection, 
  PublicKey, 
  Transaction, 
  Keypair,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import {
  createSyncNativeInstruction,
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction
} from '@solana/spl-token';
import { TOKENOMICS } from './tokenomics';

export class TYPRStaking {
  private connection: Connection;
  private mint: PublicKey;
  private stakingPool: Keypair;

  constructor(connection: Connection, mint: PublicKey, stakingPool: Keypair) {
    this.connection = connection;
    this.mint = mint;
    this.stakingPool = stakingPool;
  }

  async stake(
    userPubkey: PublicKey,
    amount: number,
    duration: number
  ): Promise<string> {
    try {
      if (amount < TOKENOMICS.MIN_STAKE_AMOUNT) {
        throw new Error(`Minimum stake amount is ${TOKENOMICS.MIN_STAKE_AMOUNT} TYPR`);
      }

      if (duration < TOKENOMICS.MIN_STAKE_DURATION) {
        throw new Error(`Minimum staking duration is ${TOKENOMICS.MIN_STAKE_DURATION} days`);
      }

      const userAta = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.stakingPool,
        this.mint,
        userPubkey
      );

      const stakingAta = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.stakingPool,
        this.mint,
        this.stakingPool.publicKey
      );

      const transaction = new Transaction().add(
        createTransferInstruction(
          userAta.address,
          stakingAta.address,
          userPubkey,
          amount * Math.pow(10, 6) // 6 decimals for TYPR token
        )
      );

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.stakingPool]
      );

      // Store staking info in program state (simplified for example)
      const stakingInfo = {
        user: userPubkey.toBase58(),
        amount,
        startTime: Date.now(),
        duration,
        apy: TOKENOMICS.STAKING_APY
      };

      return signature;
    } catch (error) {
      console.error('Error staking tokens:', error);
      throw error;
    }
  }

  async calculateRewards(
    userPubkey: PublicKey,
    amount: number,
    stakingDuration: number
  ): Promise<number> {
    const annualRate = TOKENOMICS.STAKING_APY / 100;
    const durationInYears = stakingDuration / 365;
    return amount * annualRate * durationInYears;
  }

  async unstake(userPubkey: PublicKey): Promise<string> {
    try {
      // Simplified unstaking logic
      const userAta = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.stakingPool,
        this.mint,
        userPubkey
      );

      const stakingAta = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.stakingPool,
        this.mint,
        this.stakingPool.publicKey
      );

      // Get staking info (simplified)
      const stakingInfo = {
        amount: 1000,
        startTime: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 days ago
        duration: 7
      };

      const rewards = await this.calculateRewards(
        userPubkey,
        stakingInfo.amount,
        stakingInfo.duration
      );

      const transaction = new Transaction().add(
        createTransferInstruction(
          stakingAta.address,
          userAta.address,
          this.stakingPool.publicKey,
          (stakingInfo.amount + rewards) * Math.pow(10, 6)
        )
      );

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.stakingPool]
      );

      return signature;
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      throw error;
    }
  }
}

export const initializeStaking = async (
  endpoint: string = 'https://api.devnet.solana.com'
): Promise<TYPRStaking> => {
  const connection = new Connection(endpoint, 'confirmed');
  const mint = new PublicKey(process.env.VITE_TYPR_TOKEN_MINT || '');
  const stakingPool = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(process.env.VITE_STAKING_POOL_KEYPAIR || '[]'))
  );

  return new TYPRStaking(connection, mint, stakingPool);
};