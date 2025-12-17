import React from 'react';
import { Users, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '@/lib/store';

interface ReferralsSectionProps {
  user: User | null;
}

export const ReferralsSection = ({ user }: ReferralsSectionProps) => {
  const copyCode = () => {
    if (user) {
      navigator.clipboard.writeText(user.referralCode);
      toast.success('Referral code copied!');
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl p-8 border border-blue-500/30 backdrop-blur-sm">
      <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2 font-orbitron text-white">
        <Users className="w-6 h-6 text-cyan-400" />
        Referral Program
      </h3>
      
      <div className="space-y-4">
        <div className="bg-black/40 rounded-lg p-4 border border-blue-500/20">
          <p className="text-sm text-gray-300 mb-2">Your Referral Code</p>
          <div className="flex gap-2">
            <code className="flex-1 bg-black/60 p-3 rounded text-cyan-400 font-mono text-lg text-center border border-blue-500/30">
              {user ? user.referralCode : 'LOGIN'}
            </code>
            <button 
              onClick={copyCode}
              disabled={!user}
              className="bg-blue-600 hover:bg-blue-500 px-4 rounded text-white transition-colors disabled:opacity-50"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-500/20">
            <p className="text-2xl font-bold text-white">50</p>
            <p className="text-xs text-gray-400">Points per Invite</p>
          </div>
          <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-500/20">
            <p className="text-2xl font-bold text-white">10%</p>
            <p className="text-xs text-gray-400">Commission</p>
          </div>
        </div>
        
        <p className="text-xs text-gray-400 text-center mt-4">
          Share your code with friends to earn bonus points and commissions on their winnings!
        </p>
      </div>
    </div>
  );
};
