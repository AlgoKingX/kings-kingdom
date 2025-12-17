import React, { useState } from 'react';
import { Wallet, X } from 'lucide-react';
import { toast } from 'sonner';
import { User, getUsers, saveUsers } from '@/lib/store';

interface WalletConnectModalProps {
  user: User;
  onConnect: (user: User) => void;
  onClose: () => void;
}

export const WalletConnectModal = ({ user, onConnect, onClose }: WalletConnectModalProps) => {
  const [walletAddress, setWalletAddress] = useState('');

  const handleConnect = () => {
    if (!walletAddress || walletAddress.length < 32) {
      toast.error('Please enter a valid Solana wallet address');
      return;
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].wallet = walletAddress;
      saveUsers(users);
      onConnect({ ...users[userIndex] });
      toast.success('Wallet connected successfully!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-purple-900 to-black rounded-2xl p-8 max-w-md w-full border-2 border-purple-500 shadow-[0_0_50px_rgba(147,51,234,0.5)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 font-orbitron text-white">
            <Wallet className="w-6 h-6 text-purple-400" />
            Connect Wallet
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-300">
              💡 <strong>Enter your Solana wallet address</strong><br/>
              All rewards will be sent manually to this address
            </p>
          </div>

          <input
            type="text"
            placeholder="Your Solana wallet address (e.g., 7xKXt...)"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none transition-all"
          />

          <button
            onClick={handleConnect}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-lg font-bold text-white shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-[1.02]"
          >
            Connect Wallet
          </button>
          
          <p className="text-xs text-gray-400 text-center">
            Make sure you control this wallet address. All SOL/token distributions will be sent here.
          </p>
        </div>
      </div>
    </div>
  );
};
