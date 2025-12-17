import React, { useState, useEffect } from 'react';
import { 
  Users, Trophy, Coins, Settings, Search, Trash2, Edit2, 
  Plus, Save, X, Check, Ban, AlertTriangle, Download,
  Zap, Gift, History, Percent, Sliders, Twitter
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  User, Giveaway, GameConfig, Transaction,
  getUsers, saveUsers, getGiveaways, saveGiveaways,
  getGameConfig, saveGameConfig, getTransactions, addTransaction
} from '@/lib/store';
import { useLocation } from 'wouter';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'users' | 'giveaways' | 'game' | 'transactions'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [gameConfig, setGameConfig] = useState<GameConfig>(getGameConfig());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingGiveaway, setEditingGiveaway] = useState<Giveaway | null>(null);
  const [airdropAmount, setAirdropAmount] = useState(100);
  const [location, setLocation] = useLocation();

  // Load data
  useEffect(() => {
    // Check admin access
    const currentUser = JSON.parse(localStorage.getItem('kk_current_user') || 'null');
    if (!currentUser || currentUser.username !== 'AlgoKingX') {
      toast.error('Access denied. Only the King can enter here.');
      setLocation('/');
      return;
    }

    setUsers(getUsers());
    setGiveaways(getGiveaways());
    setGameConfig(getGameConfig());
    setTransactions(getTransactions());
  }, [location, setLocation]);

  // User Management Functions
  const handleUpdateUser = (updatedUser: User) => {
    const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(newUsers);
    saveUsers(newUsers);
    setEditingUser(null);
    
    // Log manual adjustment
    const oldUser = users.find(u => u.id === updatedUser.id);
    if (oldUser && oldUser.points !== updatedUser.points) {
      const diff = updatedUser.points - oldUser.points;
      addTransaction({
        userId: updatedUser.id,
        username: updatedUser.username,
        type: 'MANUAL_ADJUSTMENT',
        amount: diff,
        description: `Admin manual adjustment: ${diff > 0 ? '+' : ''}${diff} points`,
        status: 'COMPLETED'
      });
      setTransactions(getTransactions());
    }
    
    toast.success('User updated successfully');
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      const newUsers = users.filter(u => u.id !== userId);
      setUsers(newUsers);
      saveUsers(newUsers);
      toast.success('User deleted');
    }
  };

  const toggleBlockUser = (user: User) => {
    handleUpdateUser({ ...user, blocked: !user.blocked });
  };

  // Global Airdrop
  const handleGlobalAirdrop = () => {
    if (confirm(`Are you sure you want to airdrop ${airdropAmount} points to ALL users?`)) {
      const newUsers = users.map(u => {
        if (u.username === 'AlgoKingX') return u; // Skip admin
        return { ...u, points: u.points + airdropAmount };
      });
      setUsers(newUsers);
      saveUsers(newUsers);
      
      // Log transaction
      addTransaction({
        userId: 0,
        username: 'SYSTEM',
        type: 'AIRDROP',
        amount: airdropAmount * users.length,
        description: `Global Airdrop of ${airdropAmount} points`,
        status: 'COMPLETED'
      });
      setTransactions(getTransactions());
      
      toast.success(`Successfully airdropped ${airdropAmount} points to everyone!`);
    }
  };

  // Game Config
  const handleSaveConfig = () => {
    saveGameConfig(gameConfig);
    toast.success('Game configuration saved!');
  };

  // Giveaway Management Functions
  const handleSaveGiveaway = (giveaway: Giveaway) => {
    let newGiveaways;
    if (giveaways.find(g => g.id === giveaway.id)) {
      newGiveaways = giveaways.map(g => g.id === giveaway.id ? giveaway : g);
    } else {
      newGiveaways = [...giveaways, giveaway];
    }
    setGiveaways(newGiveaways);
    saveGiveaways(newGiveaways);
    setEditingGiveaway(null);
    toast.success('Giveaway saved');
  };

  const handleDeleteGiveaway = (id: number) => {
    if (confirm('Delete this giveaway?')) {
      const newGiveaways = giveaways.filter(g => g.id !== id);
      setGiveaways(newGiveaways);
      saveGiveaways(newGiveaways);
      toast.success('Giveaway deleted');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.wallet?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            KINGDOM ADMIN
          </h1>
          <button 
            onClick={() => setLocation('/')}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            Back to Kingdom
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeTab === 'users' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Users className="w-5 h-5" /> Users
          </button>
          <button
            onClick={() => setActiveTab('giveaways')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeTab === 'giveaways' 
                ? 'bg-pink-600 text-white' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Trophy className="w-5 h-5" /> Giveaways
          </button>
          <button
            onClick={() => setActiveTab('game')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeTab === 'game' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Sliders className="w-5 h-5" /> Game Config
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeTab === 'transactions' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <History className="w-5 h-5" /> Transactions
          </button>
        </div>

        {/* Users Panel */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users by name or wallet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div className="bg-purple-900/20 px-6 py-3 rounded-lg border border-purple-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="font-bold">{users.length} Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={airdropAmount}
                    onChange={(e) => setAirdropAmount(parseInt(e.target.value))}
                    className="w-20 bg-black/40 border border-white/10 rounded px-2 py-1 text-sm"
                  />
                  <button 
                    onClick={handleGlobalAirdrop}
                    className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm font-bold flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" /> Airdrop All
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Points</th>
                    <th className="p-4">Wallet</th>
                    <th className="p-4">Stats</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold text-xs">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold">{user.username}</p>
                            <p className="text-xs text-gray-500">{user.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-yellow-400">{user.points}</td>
                      <td className="p-4 text-sm font-mono text-gray-400">
                        {user.wallet ? (
                          <span className="text-green-400">{user.wallet.substring(0, 6)}...</span>
                        ) : (
                          <span className="text-gray-600">Not connected</span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-gray-400">
                        <div>Spins: {user.totalSpins}</div>
                        <div>Wins: {user.totalWinnings}</div>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => setEditingUser(user)}
                          className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => toggleBlockUser(user)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.blocked 
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                              : 'hover:bg-red-500/20 text-gray-400 hover:text-red-400'
                          }`}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Giveaways Panel */}
        {activeTab === 'giveaways' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button 
                onClick={() => setEditingGiveaway({
                  id: Date.now(),
                  title: '',
                  prize: '',
                  endDate: '',
                  active: true,
                  tweetLink: '',
                  maxEntries: 5,
                  entryCost: 0,
                  description: ''
                })}
                className="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" /> Create Giveaway
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {giveaways.map(giveaway => (
                <div key={giveaway.id} className="bg-black/40 rounded-xl p-6 border border-white/10 relative group">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditingGiveaway(giveaway)}
                      className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteGiveaway(giveaway.id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${giveaway.active ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-gray-400">{giveaway.active ? 'Active' : 'Ended'}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{giveaway.title}</h3>
                  <p className="text-pink-400 font-bold mb-4">{giveaway.prize}</p>
                  
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex justify-between">
                      <span>Ends: {giveaway.endDate}</span>
                      <span className="text-yellow-400">Cost: {giveaway.entryCost} PTS</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Entries: {giveaway.maxEntries}</span>
                      {giveaway.tweetLink && (
                        <a href={giveaway.tweetLink} target="_blank" className="text-blue-400 hover:underline flex items-center gap-1">
                          <Twitter className="w-3 h-3" /> Tweet Link
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Game Config Panel */}
        {activeTab === 'game' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-black/40 rounded-xl p-8 border border-white/10">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Percent className="w-5 h-5 text-yellow-400" /> Win Rates
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Spin Wheel Win Rate</span>
                    <span className="text-yellow-400">{gameConfig.spinWinRate}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={gameConfig.spinWinRate}
                    onChange={(e) => setGameConfig({...gameConfig, spinWinRate: parseInt(e.target.value)})}
                    className="w-full accent-yellow-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Percentage chance of landing on a winning slice</p>
                </div>
                <div>
                  <label className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Coin Flip Win Rate</span>
                    <span className="text-yellow-400">{gameConfig.coinFlipWinRate}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={gameConfig.coinFlipWinRate}
                    onChange={(e) => setGameConfig({...gameConfig, coinFlipWinRate: parseInt(e.target.value)})}
                    className="w-full accent-yellow-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Percentage chance of user winning the flip</p>
                </div>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-8 border border-white/10">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" /> Game Settings
              </h3>
              <div className="space-y-6">
                <div>
              <label className="block text-sm text-gray-400 mb-1">Global Point Multiplier</label>
              <input
                type="number"
                value={gameConfig.globalMultiplier}
                onChange={(e) => setGameConfig({ ...gameConfig, globalMultiplier: parseFloat(e.target.value) })}
                className="w-full bg-black/40 border border-white/10 rounded p-2 text-white"
                step="0.1"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Global XP Multiplier</label>
              <input
                type="number"
                value={gameConfig.xpMultiplier || 1}
                onChange={(e) => setGameConfig({ ...gameConfig, xpMultiplier: parseFloat(e.target.value) })}
                className="w-full bg-black/40 border border-white/10 rounded p-2 text-white"
                step="0.1"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">Set to 2 for Double XP Events!</p>
            </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Spin Cooldown (Hours)</label>
                    <input 
                      type="number" 
                      value={gameConfig.spinCooldown}
                      onChange={(e) => setGameConfig({...gameConfig, spinCooldown: parseInt(e.target.value)})}
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Lucky Draw Cooldown (Hours)</label>
                    <input 
                      type="number" 
                      value={gameConfig.luckyDrawCooldown}
                      onChange={(e) => setGameConfig({...gameConfig, luckyDrawCooldown: parseInt(e.target.value)})}
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleSaveConfig}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold mt-4"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Panel */}
        {activeTab === 'transactions' && (
          <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                <tr>
                  <th className="p-4">Time</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-sm text-gray-400">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        tx.type === 'AIRDROP' ? 'bg-yellow-500/20 text-yellow-400' :
                        tx.type === 'GAME_WIN' ? 'bg-green-500/20 text-green-400' :
                        tx.type === 'GAME_LOSS' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-4 font-bold">{tx.username}</td>
                    <td className="p-4 text-sm text-gray-300">{tx.description}</td>
                    <td className="p-4 text-right font-mono text-yellow-400">{tx.amount}</td>
                    <td className="p-4 text-right">
                      <span className="text-green-400 text-xs">COMPLETED</span>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#1a0b2e] rounded-xl p-8 max-w-md w-full border border-purple-500/30">
              <h3 className="text-2xl font-bold mb-6">Edit User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Points Balance</label>
                  <input 
                    type="number" 
                    value={editingUser.points}
                    onChange={(e) => setEditingUser({...editingUser, points: parseInt(e.target.value)})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Wallet Address</label>
                  <input 
                    type="text" 
                    value={editingUser.wallet || ''}
                    onChange={(e) => setEditingUser({...editingUser, wallet: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => handleUpdateUser(editingUser)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-bold"
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={() => setEditingUser(null)}
                    className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Giveaway Modal */}
        {editingGiveaway && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#1a0b2e] rounded-xl p-8 max-w-md w-full border border-pink-500/30 overflow-y-auto max-h-[90vh]">
              <h3 className="text-2xl font-bold mb-6">
                {giveaways.find(g => g.id === editingGiveaway.id) ? 'Edit Giveaway' : 'New Giveaway'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <input 
                    type="text" 
                    value={editingGiveaway.title}
                    onChange={(e) => setEditingGiveaway({...editingGiveaway, title: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Prize</label>
                  <input 
                    type="text" 
                    value={editingGiveaway.prize}
                    onChange={(e) => setEditingGiveaway({...editingGiveaway, prize: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">End Date</label>
                  <input 
                    type="date" 
                    value={editingGiveaway.endDate}
                    onChange={(e) => setEditingGiveaway({...editingGiveaway, endDate: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tweet Link (for tasks)</label>
                  <input 
                    type="text" 
                    placeholder="https://twitter.com/..."
                    value={editingGiveaway.tweetLink}
                    onChange={(e) => setEditingGiveaway({...editingGiveaway, tweetLink: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description / Requirements</label>
                  <textarea 
                    placeholder="e.g. Follow @AlgoKingX, RT & Like pinned tweet..."
                    value={editingGiveaway.description || ''}
                    onChange={(e) => setEditingGiveaway({...editingGiveaway, description: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 h-24 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Max Entries</label>
                    <input 
                      type="number" 
                      value={editingGiveaway.maxEntries}
                      onChange={(e) => setEditingGiveaway({...editingGiveaway, maxEntries: parseInt(e.target.value)})}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Entry Cost (Points)</label>
                    <input 
                      type="number" 
                      value={editingGiveaway.entryCost}
                      onChange={(e) => setEditingGiveaway({...editingGiveaway, entryCost: parseInt(e.target.value)})}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={editingGiveaway.active}
                      onChange={(e) => setEditingGiveaway({...editingGiveaway, active: e.target.checked})}
                      className="rounded border-gray-600 text-pink-600 focus:ring-pink-500"
                    />
                    <span>Active</span>
                  </label>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => handleSaveGiveaway(editingGiveaway)}
                    className="flex-1 bg-pink-600 hover:bg-pink-700 py-2 rounded-lg font-bold"
                  >
                    Save Giveaway
                  </button>
                  <button 
                    onClick={() => setEditingGiveaway(null)}
                    className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
