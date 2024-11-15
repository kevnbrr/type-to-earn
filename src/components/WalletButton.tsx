import React, { useCallback } from 'react';
import { Wallet } from 'lucide-react';
import { usePhantomWallet } from '../hooks/usePhantomWallet';

export default function WalletButton() {
  const { connected, connect, disconnect } = usePhantomWallet();

  const handleClick = useCallback(async () => {
    try {
      if (connected) {
        await disconnect();
      } else {
        await connect();
      }
    } catch (error: any) {
      console.error('Wallet error:', error);
      if (error?.message?.includes('install')) {
        alert('Please install Phantom wallet to continue');
      }
    }
  }, [connected, connect, disconnect]);

  return (
    <button 
      onClick={handleClick}
      className={`flex items-center px-4 py-2 rounded-full transition-colors ${
        connected 
          ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-200' 
          : 'bg-purple-600 hover:bg-purple-700 text-white'
      }`}
    >
      <Wallet className="w-4 h-4 mr-2" />
      {connected ? 'Disconnect' : 'Connect Wallet'}
    </button>
  );
}