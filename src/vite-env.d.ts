/// <reference types="vite/client" />

import { PublicKey } from '@solana/web3.js';

declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean;
        connect: () => Promise<{ publicKey: PublicKey }>;
        disconnect: () => Promise<void>;
        on: (event: string, callback: Function) => void;
        removeAllListeners: (event: string) => void;
        publicKey: PublicKey | null;
      };
    };
  }
}