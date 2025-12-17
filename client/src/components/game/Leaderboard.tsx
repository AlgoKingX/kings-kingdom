import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';
import { User, getUsers } from '@/lib/store';

export const Leaderboard = () => {
  const [topUsers, setTopUsers] = useState<User[]>([]);

  useEffect(() => {
    const users = getUsers();
    // Sort by points descending and take top 10
    const sorted = users
      .filter(u => u.username !== 'AlgoKingX') // Exclude admin
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);
    setTopUsers(sorted);
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 1: return <Medal className="w-5 h-5 text-gray-300" />;
      case 2: return <Medal className="w-5 h-5 text-orange-400" />;
      default: return <span className="text-gray-500 font-bold w-5 text-center">{index + 1}</span>;
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30 h-full">
      <h3 className="text-xl font-bold font-orbitron text-white mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-400" />
        Kingdom Leaders
      </h3>

      <div className="space-y-2">
        {topUsers.map((user, index) => (
          <div 
            key={user.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              index === 0 
                ? 'bg-gradient-to-r from-yellow-900/20 to-transparent border-yellow-500/30' 
                : 'bg-white/5 border-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
                {getRankIcon(index)}
              </div>
              <div>
                <div className="font-bold text-white flex items-center gap-2">
                  {user.username}
                  {user.inventory?.some(i => i.itemId === 'crown_badge') && (
                    <Crown className="w-3 h-3 text-yellow-400" />
                  )}
                </div>
                <div className="text-xs text-gray-500">Wins: {user.totalWinnings}</div>
              </div>
            </div>
            <div className="font-mono font-bold text-purple-400">
              {user.points.toLocaleString()}
            </div>
          </div>
        ))}

        {topUsers.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No kings have risen yet.
          </div>
        )}
      </div>
    </div>
  );
};
