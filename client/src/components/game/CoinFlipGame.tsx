import React, { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import { toast } from 'sonner';
import { User, getUsers, saveUsers, addXp } from '@/lib/store';

interface CoinFlipGameProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
}

export const CoinFlipGame = ({ user, onUpdateUser }: CoinFlipGameProps) => {
  const [betAmount, setBetAmount] = useState(10);
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [canPlay, setCanPlay] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (!user) return;
    const lastPlay = localStorage.getItem(`lastCoinFlip_${user.id}`);
    if (lastPlay) {
      const nextPlay = parseInt(lastPlay) + 6 * 60 * 60 * 1000; // 6 hours
      if (Date.now() < nextPlay) setCanPlay(false);
    }
  }, [user]);

  const handleFlip = (choice: 'heads' | 'tails') => {
    if (!user || !canPlay || flipping) return;
    if (user.points < betAmount) {
      toast.error('Not enough points!');
      return;
    }

    setFlipping(true);
    setShowAnimation(true);
    setResult(null);

    setTimeout(() => {
      const outcome = Math.random() > 0.5 ? 'heads' : 'tails';
      const won = choice === outcome;
      
      setResult({ side: outcome, won });
      setFlipping(false);
      setShowAnimation(false);
      setCanPlay(false);
      
      localStorage.setItem(`lastCoinFlip_${user.id}`, Date.now().toString());
      
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        if (won) {
          users[userIndex].points += betAmount * 2;
          users[userIndex].totalWinnings += betAmount * 2;
          toast.success(`You won ${betAmount * 2} points!`);
        } else {
          users[userIndex].points -= betAmount;
          toast.error(`You lost ${betAmount} points.`);
        }

        // Add XP (5 XP per flip + 10 XP for winning)
        const xpGain = 5 + (won ? 10 : 0);
        const { user: updatedUser, leveledUp } = addXp(users[userIndex], xpGain);
        users[userIndex] = updatedUser;

        if (leveledUp) {
          toast.success(`LEVEL UP! You are now Level ${updatedUser.level}!`);
          // Log transaction for level up bonus
          import('@/lib/store').then(({ addTransaction }) => {
            addTransaction({
              userId: user.id,
              username: user.username,
              type: 'MANUAL_ADJUSTMENT',
              amount: updatedUser.level * 50,
              description: `Level Up Bonus (Lvl ${updatedUser.level})`,
              status: 'COMPLETED'
            });
          });
          users[userIndex].points += updatedUser.level * 50;
        }

        saveUsers(users);
        onUpdateUser(users[userIndex]);

        // Log transaction
        import('@/lib/store').then(({ addTransaction }) => {
          addTransaction({
            userId: user.id,
            username: user.username,
            type: won ? 'GAME_WIN' : 'GAME_LOSS',
            amount: won ? betAmount * 2 : betAmount,
            description: `${won ? 'Won' : 'Lost'} Coin Flip (${betAmount} pts bet)`,
            status: 'COMPLETED'
          });
        });
      }
    }, 2000);
  };

  return (
    <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-2xl p-8 border border-yellow-500/30 backdrop-blur-sm">
      <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2 font-orbitron text-white">
        <Coins className="w-6 h-6 text-yellow-400" />
        Coin Flip Challenge
      </h3>
      
      <div className="flex flex-col items-center gap-6">
        {/* Coin Animation */}
        <div className={`relative w-32 h-32 transition-all duration-500 ${showAnimation ? 'animate-spin' : ''}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-4xl font-bold text-black shadow-[0_0_30px_rgba(234,179,8,0.5)] border-4 border-yellow-300">
            {result ? (result.side === 'heads' ? '👑' : '💎') : '🪙'}
          </div>
        </div>
        
        {/* Bet Amount */}
        {!result && canPlay && user && (
          <div className="bg-black/40 rounded-lg p-4 w-full max-w-xs border border-white/10">
            <label className="text-sm text-gray-300 mb-2 block">Bet Amount (Points)</label>
            <input
              type="range"
              min="10"
              max={Math.min(100, user.points)}
              step="10"
              value={betAmount}
              onChange={(e) => setBetAmount(parseInt(e.target.value))}
              className="w-full accent-yellow-500"
              disabled={flipping}
            />
            <p className="text-center text-yellow-400 font-bold text-xl mt-2">{betAmount} Points</p>
            <p className="text-center text-xs text-gray-400">Win 2x your bet!</p>
          </div>
        )}
        
        {/* Choice Buttons */}
        {!result && canPlay && user && (
          <div className="flex gap-4 w-full">
            <button
              onClick={() => handleFlip('heads')}
              disabled={flipping || user.points < betAmount}
              className={`flex-1 py-3 rounded-lg font-bold text-lg transition-all ${
                flipping || user.points < betAmount
                  ? 'bg-gray-700 cursor-not-allowed text-gray-500'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg hover:shadow-purple-500/30'
              }`}
            >
              👑 Heads
            </button>
            <button
              onClick={() => handleFlip('tails')}
              disabled={flipping || user.points < betAmount}
              className={`flex-1 py-3 rounded-lg font-bold text-lg transition-all ${
                flipping || user.points < betAmount
                  ? 'bg-gray-700 cursor-not-allowed text-gray-500'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg hover:shadow-cyan-500/30'
              }`}
            >
              💎 Tails
            </button>
          </div>
        )}
        
        {/* Result */}
        {result && (
          <div className={`w-full ${result.won ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'} border rounded-lg p-6 text-center animate-pulse`}>
            <p className="text-2xl font-bold mb-2 text-white">
              {result.won ? '🎉 YOU WON! 🎉' : '💔 YOU LOST 💔'}
            </p>
            <p className="text-lg text-gray-200">
              Coin landed on: <span className="font-bold">{result.side === 'heads' ? '👑 Heads' : '💎 Tails'}</span>
            </p>
            <p className="text-sm mt-2 text-gray-300">
              {result.won ? `+${betAmount * 2} points!` : `-${betAmount} points`}
            </p>
          </div>
        )}
        
        {/* Status */}
        {!canPlay && !result && (
          <div className="bg-gray-800/50 rounded-lg p-4 text-center w-full border border-white/5">
            <p className="text-gray-300">Come back in 6 hours to play again!</p>
          </div>
        )}
        
        {!user && (
          <p className="text-gray-400 text-center">Login to play!</p>
        )}
        
        {user && user.points < 10 && canPlay && (
          <p className="text-red-400 text-center text-sm">Need at least 10 points to play!</p>
        )}
      </div>
    </div>
  );
};
