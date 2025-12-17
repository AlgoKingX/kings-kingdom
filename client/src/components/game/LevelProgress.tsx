import React from 'react';
import { Star } from 'lucide-react';
import { User, getLevelProgress, getXpForNextLevel } from '@/lib/store';

interface LevelProgressProps {
  user: User;
}

export const LevelProgress = ({ user }: LevelProgressProps) => {
  const progress = getLevelProgress(user.xp || 0, user.level || 1);
  const nextLevelXp = getXpForNextLevel(user.level || 1);

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-purple-500/30 flex items-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg shadow-purple-500/20">
          <span className="font-bold text-white text-lg">{user.level || 1}</span>
        </div>
        <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1 border border-black">
          <Star className="w-3 h-3 text-black fill-black" />
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between items-end mb-1">
          <h4 className="font-bold text-white text-sm">Level {user.level || 1}</h4>
          <span className="text-xs text-purple-300 font-mono">
            {Math.floor(progress)}%
          </span>
        </div>
        
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-[10px] text-gray-500 mt-1 text-right">
          Next Level: {nextLevelXp} XP needed
        </p>
      </div>
    </div>
  );
};
