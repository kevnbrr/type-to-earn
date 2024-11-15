import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSolanaWallet } from '../hooks/useSolanaWallet';

function Stats() {
  const { connected, publicKey } = useSolanaWallet();

  // In a real app, you would fetch this data from your backend based on the user's public key
  const getUserStats = () => {
    if (!connected || !publicKey) {
      return {
        bestSpeed: '-- ',
        testsCompleted: '--',
        avgAccuracy: '--',
        history: []
      };
    }

    return {
      bestSpeed: '85',
      testsCompleted: '42',
      avgAccuracy: '97',
      history: [
        { time: '1d', wpm: 65, accuracy: 92 },
        { time: '2d', wpm: 68, accuracy: 94 },
        { time: '3d', wpm: 72, accuracy: 95 },
        { time: '4d', wpm: 70, accuracy: 93 },
        { time: '5d', wpm: 75, accuracy: 96 },
        { time: '6d', wpm: 73, accuracy: 94 },
        { time: '7d', wpm: 78, accuracy: 97 },
      ]
    };
  };

  const stats = getUserStats();

  return (
    <div className="space-y-6">
      {!connected ? (
        <div className="text-center py-8">
          <p className="text-purple-300">Connect your wallet to view your typing statistics</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-purple-300 text-sm">Best Speed</p>
              <p className="text-2xl font-bold text-white">{stats.bestSpeed} WPM</p>
              <p className="text-purple-300 text-xs mt-1">Today at 14:30</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-purple-300 text-sm">Tests Completed</p>
              <p className="text-2xl font-bold text-white">{stats.testsCompleted}</p>
              <p className="text-purple-300 text-xs mt-1">Last 7 days</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-purple-300 text-sm">Avg. Accuracy</p>
              <p className="text-2xl font-bold text-white">{stats.avgAccuracy}%</p>
              <p className="text-purple-300 text-xs mt-1">Last 7 days</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="time" stroke="#ffffff60" />
                <YAxis yAxisId="left" stroke="#8b5cf6" />
                <YAxis yAxisId="right" orientation="right" stroke="#22d3ee" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #ffffff20',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="wpm"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6' }}
                  name="WPM"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={{ fill: '#22d3ee' }}
                  name="Accuracy %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

export default Stats;