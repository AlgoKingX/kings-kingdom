import React, { useState, useEffect } from 'react';
import { Gift } from 'lucide-react';
import { toast } from 'sonner';
import { User, getUsers, saveUsers, getInteractions, saveInteractions } from '@/lib/store';

interface LuckyDrawProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
}

export const LuckyDraw = ({ user, onUpdateUser }: LuckyDrawProps) => {
  const [drawing, setDrawing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [canDraw, setCanDraw] = useState(true);

  useEffect(() => {
    if (!user) return;
    const lastDraw = localStorage.getItem(`lastDraw_${user.id}`);
    if (lastDraw) {
      const nextDraw = parseInt(lastDraw) + 12 * 60 * 60 * 1000; // 12 hours
      if (Date.now() < nextDraw) setCanDraw(false);
    }
  }, [user]);

  const handleDraw = () => {
    if (!user || !canDraw || drawing) return;
    
    setDrawing(true);
    setResult(null);
    
    setTimeout(() => {
      const rewards = [
        { type: 'points', value: 10, label: '10 Points' },
        { type: 'points', value: 25, label: '25 Points' },
        { type: 'points', value: 50, label: '50 Points' },
        { type: 'entry', value: 1, label: 'Extra Giveaway Entry' },
        { type: 'points', value: 5, label: '5 Points' },
      ];
      
      const reward = rewards[Math.floor(Math.random() * rewards.length)];
      setResult(reward);
      setDrawing(false);
      setCanDraw(false);
      
      localStorage.setItem(`lastDraw_${user.id}`, Date.now().toString());
      
      const interactions = getInteractions();
      interactions.push({
        userId: user.id,
        username: user.username,
        type: 'lucky_draw',
        reward: reward.label,
        timestamp: new Date().toISOString()
      });
      saveInteractions(interactions);
      
      if (reward.type === 'points') {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex].points += reward.value;
          saveUsers(users);
          onUpdateUser(users[userIndex]);

          // Log transaction
          import('@/lib/store').then(({ addTransaction }) => {
            addTransaction({
              userId: user.id,
              username: user.username,
              type: 'GAME_WIN',
              amount: reward.value,
              description: `Won ${reward.label} in Lucky Draw`,
              status: 'COMPLETED'
            });
          });
        }
      }
      
      toast.success(`You drew: ${reward.label}`);
    }, 2000);
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-purple-500/30 backdrop-blur-sm">
      <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2 font-orbitron text-white">
        <Gift className="w-6 h-6 text-pink-400" />
        Lucky Draw
      </h3>
      
      <div className="flex flex-col items-center gap-6">
        <div className={`w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-5xl shadow-lg ${drawing ? 'animate-bounce' : ''}`}>
          {result ? '🎁' : '❓'}
        </div>
        
        {result && (
          <div className="text-center animate-fade-in">
            <p className="text-xl font-bold text-pink-400">{result.label}</p>
            <p className="text-sm text-gray-400">Added to your account!</p>
          </div>
        )}
        
        <button
          onClick={handleDraw}
          disabled={!canDraw || drawing || !user}
          className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
            !canDraw || drawing || !user
              ? 'bg-gray-700 cursor-not-allowed text-gray-500'
              : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-pink-500/30'
          }`}
        >
          {drawing ? 'Drawing...' : canDraw ? 'Draw Card' : 'Cooldown Active'}
        </button>
        
        {!user && <p className="text-gray-400 text-sm">Login to draw!</p>}
        {!canDraw && !drawing && <p className="text-gray-400 text-xs">Available every 12 hours</p>}
      </div>
    </div>
  );
};
