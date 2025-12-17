import React from 'react';
import { ShoppingBag, Zap, Pickaxe, Crown, Check } from 'lucide-react';
import { toast } from 'sonner';
import { User, SHOP_ITEMS, ShopItem, getUsers, saveUsers, addTransaction } from '@/lib/store';

interface ShopProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
}

export const Shop = ({ user, onUpdateUser }: ShopProps) => {
  const handlePurchase = (item: ShopItem) => {
    if (!user) {
      toast.error('Login to access the Royal Shop!');
      return;
    }

    if (user.points < item.price) {
      toast.error(`Not enough points! Need ${item.price - user.points} more.`);
      return;
    }

    // Check if already owned (for non-consumables)
    const existingItem = user.inventory?.find(i => i.itemId === item.id);
    if (existingItem && item.type !== 'BOOST') {
      toast.error('You already own this item!');
      return;
    }

    if (confirm(`Purchase ${item.name} for ${item.price} points?`)) {
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex !== -1) {
        // Deduct points
        users[userIndex].points -= item.price;

        // Add to inventory
        const inventory = users[userIndex].inventory || [];
        const existingIndex = inventory.findIndex(i => i.itemId === item.id);

        if (existingIndex !== -1) {
          inventory[existingIndex].quantity += 1;
        } else {
          inventory.push({
            itemId: item.id,
            quantity: 1,
            activeUntil: item.duration 
              ? new Date(Date.now() + item.duration * 60 * 60 * 1000).toISOString() 
              : undefined
          });
        }
        users[userIndex].inventory = inventory;

        saveUsers(users);
        onUpdateUser(users[userIndex]);

        // Log transaction
        addTransaction({
          userId: user.id,
          username: user.username,
          type: 'SHOP_PURCHASE',
          amount: -item.price,
          description: `Purchased ${item.name}`,
          status: 'COMPLETED'
        });

        toast.success(`Successfully purchased ${item.name}!`);
      }
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'pickaxe': return <Pickaxe className="w-6 h-6 text-gray-300" />;
      case 'drill': return <Pickaxe className="w-6 h-6 text-blue-400" />;
      case 'potion': return <Zap className="w-6 h-6 text-purple-400" />;
      case 'crown': return <Crown className="w-6 h-6 text-yellow-400" />;
      default: return <ShoppingBag className="w-6 h-6" />;
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30">
      <h3 className="text-xl font-bold font-orbitron text-white mb-6 flex items-center gap-2">
        <ShoppingBag className="w-6 h-6 text-pink-400" />
        Royal Shop
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {SHOP_ITEMS.map(item => {
          const owned = user?.inventory?.some(i => i.itemId === item.id);
          const canAfford = (user?.points || 0) >= item.price;

          return (
            <div 
              key={item.id}
              className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-purple-500/50 transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="bg-black/40 p-2 rounded-lg">
                  {getIcon(item.icon)}
                </div>
                {owned && item.type !== 'BOOST' && (
                  <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> OWNED
                  </span>
                )}
              </div>

              <h4 className="font-bold text-white mb-1">{item.name}</h4>
              <p className="text-xs text-gray-400 mb-4 h-8 line-clamp-2">
                {item.description}
              </p>

              <button
                onClick={() => handlePurchase(item)}
                disabled={owned && item.type !== 'BOOST'}
                className={`w-full py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  owned && item.type !== 'BOOST'
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                    : canAfford
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-white/10 text-gray-500 hover:bg-white/20'
                }`}
              >
                {item.price} PTS
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
