import React from 'react';
import { Activity, Award, Crown, KeyRound, Timer, Trophy, Users } from 'lucide-react';
import TypeTest from './components/TypeTest';
import Leaderboard from './components/Leaderboard';
import Stats from './components/Stats';
import WalletButton from './components/WalletButton';
import { usePhantomWallet } from './hooks/usePhantomWallet';

function App() {
  const { connected, publicKey } = usePhantomWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <KeyRound className="w-8 h-8 text-purple-400" />
              <span className="ml-2 text-xl font-bold text-white">TyperDAO</span>
            </div>
            <div className="flex items-center space-x-4">
              {connected && publicKey && (
                <div className="bg-purple-500/20 px-4 py-2 rounded-full flex items-center">
                  <Trophy className="w-4 h-4 text-purple-400 mr-2" />
                  <span className="text-purple-200 font-mono text-sm">
                    {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                  </span>
                </div>
              )}
              <WalletButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-purple-400" />
                Typing Challenge
              </h2>
              <TypeTest />
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Award className="w-6 h-6 mr-2 text-purple-400" />
                Your Stats
              </h2>
              <Stats />
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Crown className="w-6 h-6 mr-2 text-purple-400" />
                Leaderboard
              </h2>
              <Leaderboard />
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Quick Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <div className="flex items-center text-purple-400 mb-2">
                    <Timer className="w-4 h-4 mr-2" />
                    <span className="text-sm">Avg. Speed</span>
                  </div>
                  <p className="text-2xl font-bold text-white">75 WPM</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <div className="flex items-center text-purple-400 mb-2">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-sm">Global Rank</span>
                  </div>
                  <p className="text-2xl font-bold text-white">#42</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;