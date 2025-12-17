import React, { useEffect } from 'react';
import { Calendar, CheckCircle, Flame } from 'lucide-react';
import { toast } from 'sonner';
import { User, getUsers, saveUsers, addTransaction } from '@/lib/store';

interface DailyLoginStreakProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
}

export const DailyLoginStreak = ({ user, onUpdateUser }: DailyLoginStreakProps) => {
  useEffect(() => {
    if (!user) return;

    const checkLoginStreak = () => {
      const today = new Date().toISOString().split('T')[0];
      const lastLogin = user.lastLoginDate;

      // If already logged in today, do nothing
      if (lastLogin === today) return;

      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex === -1) return;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = 1;
      let reward = 10;

      // Check if streak continues
      if (lastLogin === yesterdayStr) {
        newStreak = (user.loginStreak || 0) + 1;
        reward = Math.min(100, newStreak * 10); // Cap reward at 100 points
      }

      // Update user
      users[userIndex].lastLoginDate = today;
      users[userIndex].loginStreak = newStreak;
      users[userIndex].points += reward;
      
      saveUsers(users);
      onUpdateUser(users[userIndex]);

      // Log transaction
      addTransaction({
        userId: user.id,
        username: user.username,
        type: 'DAILY_LOGIN',
        amount: reward,
        description: `Daily Login Streak: Day ${newStreak}`,
        status: 'COMPLETED'
      });

      toast.success(`Daily Login! +${reward} Points (Day ${newStreak})`);
    };

    checkLoginStreak();
  }, [user?.id]); // Only run when user ID changes (login)

  if (!user) return null;

  return (
    <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-xl p-4 border border-orange-500/30 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-orange-500/20 p-2 rounded-lg">
          <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
        </div>
        <div>
          <h4 className="font-bold text-white flex items-center gap-2">
            Daily Streak
            <span className="text-xs bg-orange-500 text-black px-2 py-0.5 rounded-full font-bold">
              {user.loginStreak || 1} Days
            </span>
          </h4>
          <p className="text-xs text-gray-400">Login daily to increase rewards!</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-yellow-400">
          +{(user.loginStreak || 1) * 10}
        </div>
        <div className="text-xs text-gray-500">Next Reward</div>
      </div>
    </div>
  );
};
