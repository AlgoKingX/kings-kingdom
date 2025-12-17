import React, { useState } from 'react';
import { Trophy, Gift, Clock, Twitter, ArrowRight, ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { User, Giveaway, getGiveawayEntries, saveGiveawayEntries, getUsers, saveUsers, addTransaction } from '@/lib/store';

interface GiveawaysSectionProps {
  user: User | null;
  giveaways: Giveaway[];
  onUpdateUser?: (user: User) => void;
}

export const GiveawaysSection = ({ user, giveaways, onUpdateUser }: GiveawaysSectionProps) => {
  const [entries, setEntries] = useState(getGiveawayEntries());

  const getUserEntriesCount = (giveawayId: number) => {
    if (!user) return 0;
    return entries.filter(e => e.userId === user.id && e.giveawayId === giveawayId).length;
  };

  const handleEnter = (giveaway: Giveaway) => {
    if (!user) {
      toast.error('Please login to enter!');
      return;
    }

    const currentEntries = getUserEntriesCount(giveaway.id);
    if (currentEntries >= giveaway.maxEntries) {
      toast.error(`Max entries (${giveaway.maxEntries}) reached for this giveaway!`);
      return;
    }

    if (user.points < giveaway.entryCost) {
      toast.error(`Not enough points! Need ${giveaway.entryCost} points.`);
      return;
    }

    // Deduct points
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      // Prompt for tweet link
      const proofLink = prompt('Please paste the link to your Retweet/Comment to verify entry:');
      if (!proofLink) {
        toast.error('Entry cancelled. Proof link required.');
        return;
      }

      users[userIndex].points -= giveaway.entryCost;
      saveUsers(users);
      if (onUpdateUser) onUpdateUser(users[userIndex]);

      // Add entry
      const newEntries = [...entries, {
        id: Date.now(),
        userId: user.id,
        giveawayId: giveaway.id,
        proofLink: proofLink,
        timestamp: new Date().toISOString()
      }];
      setEntries(newEntries);
      saveGiveawayEntries(newEntries);

      // Log transaction
      addTransaction({
        userId: user.id,
        username: user.username,
        type: 'GIVEAWAY_ENTRY',
        amount: -giveaway.entryCost,
        description: `Entered giveaway: ${giveaway.title}`,
        status: 'COMPLETED'
      });

      toast.success('Successfully entered giveaway!');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-3xl font-bold font-orbitron text-white flex items-center gap-3">
        <Trophy className="w-8 h-8 text-yellow-400" />
        Active Giveaways
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {giveaways.filter(g => g.active).map(giveaway => {
          const userEntries = getUserEntriesCount(giveaway.id);
          const isMaxed = userEntries >= giveaway.maxEntries;

          return (
            <div key={giveaway.id} className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 border border-purple-500/30 hover:border-purple-500/60 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-purple-600 text-xs font-bold px-3 py-1 rounded-bl-lg">
                ACTIVE
              </div>
              
              <h4 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                {giveaway.title}
              </h4>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-300">
                  <Gift className="w-4 h-4 text-pink-400" />
                  <span>Prize: <span className="text-white font-bold">{giveaway.prize}</span></span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Ends: {giveaway.endDate}</span>
                </div>
                
                {/* Social Requirements */}
                <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <Twitter className="w-4 h-4" />
                    Required Tasks:
                  </div>
                  {giveaway.description ? (
                    <p className="text-xs text-gray-300 whitespace-pre-wrap">{giveaway.description}</p>
                  ) : (
                    <ul className="text-xs text-gray-300 list-disc list-inside space-y-1">
                      <li>Retweet & Like the post</li>
                      <li>Comment on the post</li>
                      <li>Follow @KingsKingdom</li>
                    </ul>
                  )}
                  {giveaway.tweetLink && (
                    <a 
                      href={giveaway.tweetLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs py-2 rounded transition-colors flex items-center justify-center gap-1"
                    >
                      Go to Tweet <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Entry Status */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Entry Cost: <span className="text-yellow-400 font-bold">{giveaway.entryCost} PTS</span></span>
                  <span className={`${isMaxed ? 'text-green-400' : 'text-gray-400'}`}>
                    Entries: <span className="font-bold text-white">{userEntries}</span>/{giveaway.maxEntries}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => handleEnter(giveaway)}
                disabled={isMaxed}
                className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                  isMaxed 
                    ? 'bg-green-600/20 text-green-400 cursor-not-allowed border border-green-500/30'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 text-white group-hover:bg-purple-600/20'
                }`}
              >
                {isMaxed ? (
                  <>Max Entries Reached <CheckCircle className="w-4 h-4" /></>
                ) : (
                  <>Enter Giveaway <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
