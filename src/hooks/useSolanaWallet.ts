import { useEffect, useState, useCallback } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { TYPRToken, initializeTYPRToken } from '../lib/solana/token';

export interface WalletState {
  connected: boolean;
  publicKey: PublicKey | null;
  balance: number;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  distributeReward: (wpm: number, accuracy: number, streak?: number) => Promise<void>;
}

export function useSolanaWallet(): WalletState {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [balance, setBalance] = useState(0);
  const [typrToken, setTyprToken] = useState<TYPRToken | null>(null);

  const getProvider = () => {
    if ('phantom' in window) {
      const provider = window.phantom?.solana;

      if (provider?.isPhantom) {
        return provider;
      }
    }
    window.open('https://phantom.app/', '_blank');
    throw new Error('Please install Phantom wallet');
  };

  const updateBalance = useCallback(async () => {
    if (connected && publicKey && typrToken) {
      try {
        const newBalance = await typrToken.getUserBalance(publicKey);
        setBalance(newBalance);
      } catch (error) {
        console.error('Failed to update balance:', error);
      }
    }
  }, [connected, publicKey, typrToken]);

  useEffect(() => {
    const init = async () => {
      try {
        const token = await initializeTYPRToken();
        setTyprToken(token);
      } catch (error) {
        console.error('Failed to initialize TYPR token:', error);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const provider = window.phantom?.solana;

    if (provider) {
      const handleConnect = () => {
        if (provider.publicKey) {
          setPublicKey(provider.publicKey);
          setConnected(true);
        }
      };

      const handleDisconnect = () => {
        setPublicKey(null);
        setConnected(false);
        setBalance(0);
      };

      provider.on('connect', handleConnect);
      provider.on('disconnect', handleDisconnect);

      // Check if already connected
      if (provider.publicKey) {
        setPublicKey(provider.publicKey);
        setConnected(true);
      }

      return () => {
        provider.removeListener('connect', handleConnect);
        provider.removeListener('disconnect', handleDisconnect);
      };
    }
  }, []);

  useEffect(() => {
    updateBalance();
  }, [connected, publicKey, updateBalance]);

  const connect = async () => {
    try {
      const provider = getProvider();
      await provider.connect();
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      const provider = getProvider();
      await provider.disconnect();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw error;
    }
  };

  const distributeReward = async (wpm: number, accuracy: number, streak: number = 0) => {
    if (!connected || !publicKey || !typrToken) {
      throw new Error('Wallet not connected');
    }

    try {
      await typrToken.distributeReward(publicKey, wpm, accuracy, streak);
      await updateBalance();
    } catch (error) {
      console.error('Error distributing reward:', error);
      throw error;
    }
  };

  return {
    connected,
    publicKey,
    balance,
    connect,
    disconnect,
    distributeReward,
  };
}