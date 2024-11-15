import { PublicKey } from '@solana/web3.js';

export interface TokenomicsConfig {
  // Token configuration
  DECIMALS: number;
  TOTAL_SUPPLY: number;
  
  // Base rewards
  BASE_REWARD_PER_TEST: number;
  MIN_WPM_THRESHOLD: number;
  
  // Multipliers
  WPM_MULTIPLIER: number;
  ACCURACY_MULTIPLIER: number;
  STREAK_MULTIPLIER: number;
  
  // Staking
  STAKING_APY: number;
  MIN_STAKE_AMOUNT: number;
  MIN_STAKE_DURATION: number; // in days
  
  // Limits
  MAX_DAILY_TESTS: number;
  MAX_DAILY_EARNINGS: number;
  
  // Methods
  calculateReward: (wpm: number, accuracy: number, streak?: number) => number;
}

export const TOKENOMICS: TokenomicsConfig = {
  DECIMALS: 6,
  TOTAL_SUPPLY: 1_000_000_000,
  
  BASE_REWARD_PER_TEST: 10,
  MIN_WPM_THRESHOLD: 30,
  
  WPM_MULTIPLIER: 0.05,      // 5% bonus per WPM above threshold
  ACCURACY_MULTIPLIER: 0.02,  // 2% bonus per accuracy point above 90%
  STREAK_MULTIPLIER: 0.1,     // 10% bonus per day in streak
  
  STAKING_APY: 12,           // 12% APY for staking
  MIN_STAKE_AMOUNT: 1000,    // Minimum 1000 TYPR to stake
  MIN_STAKE_DURATION: 7,     // Minimum 7 days staking period
  
  MAX_DAILY_TESTS: 20,
  MAX_DAILY_EARNINGS: 1000,
  
  calculateReward(wpm: number, accuracy: number, streak: number = 0): number {
    if (wpm < this.MIN_WPM_THRESHOLD) return 0;

    let reward = this.BASE_REWARD_PER_TEST;

    // WPM bonus
    const wpmBonus = Math.max(0, (wpm - this.MIN_WPM_THRESHOLD)) * this.WPM_MULTIPLIER;
    reward += wpmBonus;

    // Accuracy bonus (only applies above 90%)
    if (accuracy > 90) {
      const accuracyBonus = (accuracy - 90) * this.ACCURACY_MULTIPLIER;
      reward += accuracyBonus;
    }

    // Streak bonus
    if (streak > 0) {
      const streakBonus = reward * (streak * this.STREAK_MULTIPLIER);
      reward += streakBonus;
    }

    return Math.min(reward, this.MAX_DAILY_EARNINGS);
  }
};