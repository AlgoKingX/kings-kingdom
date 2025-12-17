import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import Confetti from 'react-confetti';
import { toast } from 'sonner';
import { User, getUsers, saveUsers, getInteractions, saveInteractions, addXp } from '@/lib/store';

interface SpinWheelProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
}

export const SpinWheel = ({ user, onUpdateUser }: SpinWheelProps) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [canSpin, setCanSpin] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const prizes = [
    { label: '10 Points', color: '#9333ea', value: 10 },
    { label: '25 Points', color: '#db2777', value: 25 },
    { label: '50 Points', color: '#eab308', value: 50 },
    { label: '15 Points', color: '#f59e0b', value: 15 },
    { label: '100 Points', color: '#10b981', value: 100 },
    { label: 'Try Again', color: '#ef4444', value: 0 },
    { label: '5 Points', color: '#3b82f6', value: 5 },
    { label: 'Jackpot!', color: '#fcd34d', value: 500 }
  ];

  useEffect(() => {
    if (!user) return;
    const checkSpin = () => {
      const lastSpin = localStorage.getItem(`lastSpin_${user.id}`);
      if (lastSpin) {
        const nextSpin = parseInt(lastSpin) + 24 * 60 * 60 * 1000; // 24 hours
        const now = Date.now();
        if (now < nextSpin) {
          setCanSpin(false);
          const diff = nextSpin - now;
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setCanSpin(true);
          setTimeLeft('');
        }
      }
    };
    
    checkSpin();
    const interval = setInterval(checkSpin, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const spin = () => {
    if (!user) {
      toast.error('Please login to spin!');
      return;
    }
    if (!canSpin || spinning) return;

    setSpinning(true);
    setResult(null);
    
    const newRotation = rotation + 1800 + Math.random() * 360;
    setRotation(newRotation);

    setTimeout(async () => {
      const actualRotation = newRotation % 360;
      const sliceSize = 360 / prizes.length;
      const prizeIndex = Math.floor(((360 - actualRotation) % 360) / sliceSize);
      const prize = prizes[prizeIndex];
      
      setResult(prize);
      setSpinning(false);
      setCanSpin(false);
      
      localStorage.setItem(`lastSpin_${user.id}`, Date.now().toString());
      
      if (prize.value > 0) {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex].points += prize.value;
          users[userIndex].totalSpins += 1;
          users[userIndex].totalWinnings += prize.value;

          // Add XP (10 XP per spin + bonus for winning)
          const xpGain = 10 + (prize.value > 0 ? 5 : 0);
          const { user: updatedUser, leveledUp } = addXp(users[userIndex], xpGain);
          users[userIndex] = updatedUser;

          if (leveledUp) {
            toast.success(`LEVEL UP! You are now Level ${updatedUser.level}!`);
            // Log transaction for level up bonus
            const { addTransaction } = await import('@/lib/store');
            addTransaction({
              userId: user.id,
              username: user.username,
              type: 'MANUAL_ADJUSTMENT',
              amount: updatedUser.level * 50,
              description: `Level Up Bonus (Lvl ${updatedUser.level})`,
              status: 'COMPLETED'
            });
            users[userIndex].points += updatedUser.level * 50;
          }

          saveUsers(users);
          onUpdateUser(users[userIndex]);
          
          const interactions = getInteractions();
          interactions.push({
            userId: user.id,
            username: user.username,
            type: 'spin_win',
            reward: prize.label,
            timestamp: new Date().toISOString()
          });
          saveInteractions(interactions);

          // Log transaction
          const { addTransaction } = await import('@/lib/store');
          addTransaction({
            userId: user.id,
            username: user.username,
            type: 'GAME_WIN',
            amount: prize.value,
            description: `Won ${prize.label} on Spin Wheel`,
            status: 'COMPLETED'
          });
          
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
          toast.success(`You won ${prize.label}!`);
        }
      } else {
        toast.info('Better luck next time!');
      }
    }, 5000);
  };

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30 flex flex-col items-center relative overflow-hidden shadow-[0_0_30px_rgba(147,51,234,0.2)]">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 font-orbitron text-white">
        <Sparkles className="w-6 h-6 text-yellow-400" />
        Daily Spin Wheel
      </h3>
      
      <div className="relative w-80 h-80 mb-8">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 w-8 h-8 bg-white rotate-45 shadow-lg border-4 border-purple-600 rounded-sm" />
        
        {/* Wheel */}
        <div 
          className="w-full h-full rounded-full border-8 border-purple-900 shadow-[0_0_50px_rgba(147,51,234,0.4)] relative overflow-hidden transition-transform duration-[5000ms] cubic-bezier(0.1, 0.7, 0.1, 1)"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {prizes.map((prize, i) => (
            <div
              key={i}
              className="absolute w-1/2 h-1/2 origin-bottom-right top-0 left-0 border-r border-b border-white/10"
              style={{
                transform: `rotate(${i * (360 / prizes.length)}deg)`,
                backgroundColor: prize.color,
                clipPath: 'polygon(0 0, 100% 0, 100% 100%)'
              }}
            >
              <span 
                className="absolute left-8 top-12 text-white font-bold text-xs transform -rotate-45 origin-center drop-shadow-md"
                style={{ width: '100px', textAlign: 'center' }}
              >
                {prize.label}
              </span>
            </div>
          ))}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <img src="/images/spin-wheel-center.png" alt="Center" className="w-16 h-16 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <button
        onClick={spin}
        disabled={!canSpin || spinning}
        className={`px-12 py-4 rounded-full font-bold text-xl shadow-lg transition-all transform hover:scale-105 ${
          !canSpin || spinning
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:shadow-yellow-500/50'
        }`}
      >
        {spinning ? 'Spinning...' : canSpin ? 'SPIN NOW' : `Next Spin: ${timeLeft}`}
      </button>
      
      {!user && <p className="mt-4 text-sm text-gray-400">Login to spin for free rewards!</p>}
    </div>
  );
};
