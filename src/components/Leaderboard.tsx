import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

const leaderboardData = [
  { rank: 1, name: 'SpeedDemon', wpm: 150, earnings: '2,500 TYPR' },
  { rank: 2, name: 'TypeMaster', wpm: 145, earnings: '2,000 TYPR' },
  { rank: 3, name: 'SwiftKeys', wpm: 140, earnings: '1,500 TYPR' },
  { rank: 4, name: 'RapidType', wpm: 135, earnings: '1,000 TYPR' },
  { rank: 5, name: 'KeyWarrior', wpm: 130, earnings: '750 TYPR' },
];

function Leaderboard() {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-purple-300 font-mono">{rank}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {leaderboardData.map((player) => (
        <div
          key={player.rank}
          className="bg-white/10 rounded-lg p-4 flex items-center justify-between hover:bg-white/20 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 flex items-center justify-center">
              {getRankIcon(player.rank)}
            </div>
            <div>
              <p className="text-white font-medium">{player.name}</p>
              <p className="text-purple-300 text-sm">{player.wpm} WPM</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-purple-200">{player.earnings}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Leaderboard;