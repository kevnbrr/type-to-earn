import { useCallback, useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';

export interface PhantomWallet {
  connected: boolean;
  publicKey: PublicKey | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export function usePhantomWallet(): PhantomWallet {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);

  const getProvider = useCallback(() => {
    if ('phantom' in window && window.phantom?.solana?.isPhantom) {
      return window.phantom.solana;
    }

    window.open('https://phantom.app/', '_blank');
    throw new Error('Please install Phantom wallet');
  }, []);

  useEffect(() => {
    const provider = getProvider();

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
  }, [getProvider]);

  const connect = useCallback(async () => {
    try {
      const provider = getProvider();
      const response = await provider.connect();
      setPublicKey(response.publicKey);
      setConnected(true);
    } catch (error) {
      console.error('Error connecting to Phantom wallet:', error);
      throw error;
    }
  }, [getProvider]);

  const disconnect = useCallback(async () => {
    try {
      const provider = getProvider();
      await provider.disconnect();
      setPublicKey(null);
      setConnected(false);
    } catch (error) {
      console.error('Error disconnecting from Phantom wallet:', error);
      throw error;
    }
  }, [getProvider]);

  return {
    connected,
    publicKey,
    connect,
    disconnect,
  };
}