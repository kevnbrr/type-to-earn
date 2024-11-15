import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'process', 'crypto', 'stream'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  define: {
    'process.env': {
      VITE_TYPR_TOKEN_MINT: JSON.stringify("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      VITE_REWARDS_POOL_KEYPAIR: JSON.stringify([
        112, 101, 121, 115, 104, 97, 109, 101, 
        114, 115, 104, 97, 109, 101, 114, 115, 
        104, 97, 109, 101, 114, 115, 104, 97, 
        109, 101, 114, 115, 104, 97, 109, 101
      ])
    }
  },
  resolve: {
    alias: {
      stream: 'stream-browserify',
      crypto: 'crypto-browserify'
    }
  }
});