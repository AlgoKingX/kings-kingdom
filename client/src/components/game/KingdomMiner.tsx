import React, { useState, useEffect } from 'react';
import { Pickaxe, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { User, getUsers, saveUsers, getGameConfig, addTransaction, addXp } from '@/lib/store';

interface KingdomMinerProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
}

export const KingdomMiner = ({ user, onUpdateUser }: KingdomMinerProps) => {
  const [mining, setMining] = useState(false);
  const [energy, setEnergy] = useState(100);
  const [clicks, setClicks] = useState(0);
  const config = getGameConfig();

  useEffect(() => {
    // Regenerate energy
    const interval = setInterval(() => {
      setEnergy(prev => Math.min(100, prev + 5));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMine = (e: React.MouseEvent) => {
    if (!user) {
      toast.error('Login to mine!');
      return;
    }
    if (energy < 10) {
      toast.error('Not enough energy! Wait for recharge.');
      return;
    }

    setMining(true);
    setEnergy(prev => prev - 10);
    setClicks(prev => prev + 1);

    // Visual effect
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const floatingText = document.createElement('div');
    floatingText.className = 'absolute text-yellow-400 font-bold text-xl animate-bounce pointer-events-none';
    floatingText.style.left = `${x}px`;
    floatingText.style.top = `${y}px`;
    floatingText.innerText = `+${config.minerRate}`;
    (e.target as HTMLElement).appendChild(floatingText);
    setTimeout(() => floatingText.remove(), 1000);

    // Calculate mining rate with upgrades
    let miningRate = config.minerRate;
    if (user.inventory) {
      const ironPickaxe = user.inventory.find(i => i.itemId === 'miner_mk2');
      const diamondDrill = user.inventory.find(i => i.itemId === 'miner_mk3');
      
      if (ironPickaxe) miningRate += 1;
      if (diamondDrill) miningRate += 5;
    }

    // Update points
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].points += miningRate;

      // Add XP (1 XP per click)
      const { user: updatedUser, leveledUp } = addXp(users[userIndex], 1);
      users[userIndex] = updatedUser;

      if (leveledUp) {
        toast.success(`LEVEL UP! You are now Level ${updatedUser.level}!`);
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
      
      // Log transaction every 10 clicks to avoid spamming logs
      if (clicks % 10 === 0) {
        import('@/lib/store').then(({ addTransaction }) => {
          addTransaction({
            userId: user.id,
            username: user.username,
            type: 'MINER_CLAIM',
            amount: miningRate * 10,
            description: 'Mined resources in Kingdom Miner',
            status: 'COMPLETED'
          });
        });
      }
    }

    setTimeout(() => setMining(false), 100);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/20 to-gray-900/20 rounded-2xl p-8 border border-slate-500/30 backdrop-blur-sm relative overflow-hidden">
      <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2 font-orbitron text-white">
        <Pickaxe className="w-6 h-6 text-slate-400" />
        Kingdom Miner
      </h3>

      <div className="flex flex-col items-center gap-6">
        {/* Energy Bar */}
        <div className="w-full max-w-xs bg-black/40 rounded-full h-4 border border-white/10 relative overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-300"
            style={{ width: `${energy}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
            <Zap className="w-3 h-3 mr-1 fill-white" /> {energy}% ENERGY
          </div>
        </div>

        {/* Mine Button */}
        <button
          onMouseDown={handleMine}
          className={`relative w-48 h-48 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border-4 border-slate-600 shadow-[0_0_30px_rgba(148,163,184,0.2)] flex items-center justify-center transition-transform active:scale-95 ${mining ? 'scale-95' : ''}`}
        >
          <div className="absolute inset-2 rounded-full border border-white/10" />
          <Pickaxe className={`w-20 h-20 text-slate-300 ${mining ? 'rotate-[-45deg]' : ''} transition-transform duration-100`} />
          <div className="absolute bottom-8 text-xs text-slate-400 font-mono">CLICK TO MINE</div>
        </button>

        <div className="text-center">
          <p className="text-yellow-400 font-bold text-xl">
            +{(() => {
              let rate = config.minerRate;
              if (user?.inventory) {
                if (user.inventory.some(i => i.itemId === 'miner_mk2')) rate += 1;
                if (user.inventory.some(i => i.itemId === 'miner_mk3')) rate += 5;
              }
              return rate;
            })()} PTS / Click
          </p>
          <p className="text-xs text-gray-500 mt-1">Mine resources to build your kingdom!</p>
        </div>
      </div>
    </div>
  );
};
