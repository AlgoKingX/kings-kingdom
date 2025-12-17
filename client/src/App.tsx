import React, { useState, useEffect } from 'react';
import { Wallet, Crown, Trophy, Sparkles, Coins, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { Route, Switch, useLocation } from 'wouter';

// Components
import { AuthModal } from '@/components/modals/AuthModal';
import { WalletConnectModal } from '@/components/modals/WalletConnectModal';
import { SpinWheel } from '@/components/game/SpinWheel';
import { CoinFlipGame } from '@/components/game/CoinFlipGame';
import { LuckyDraw } from '@/components/game/LuckyDraw';
import { ReferralsSection } from '@/components/game/ReferralsSection';
import { GiveawaysSection } from '@/components/game/GiveawaysSection';
import { KingdomMiner } from '@/components/game/KingdomMiner';
import { DailyLoginStreak } from '@/components/game/DailyLoginStreak';
import { Leaderboard } from '@/components/game/Leaderboard';
import { Shop } from '@/components/game/Shop';
import { LevelProgress } from '@/components/game/LevelProgress';
// Pages
import Admin from '@/pages/Admin';

// Store
import { User, Giveaway, initializeDemo, getUsers, getGiveaways } from '@/lib/store';

function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    initializeDemo();
    setGiveaways(getGiveaways());
    
    // Check for saved session
    const savedUser = localStorage.getItem('kk_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleAuth = (u: User) => {
    setUser(u);
    localStorage.setItem('kk_current_user', JSON.stringify(u));
    setShowAuth(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('kk_current_user');
    toast.success('Logged out successfully');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('kk_current_user', JSON.stringify(updatedUser));
  };

  // make sure to consider if you need authentication for certain routes
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30">
      {/* Hero Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center opacity-40 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/crown-icon.png" alt="Logo" className="w-10 h-10" />
            <h1 className="text-2xl font-bold font-orbitron bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              KINGS KINGDOM
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-6 mr-4">
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-400">Balance</span>
                    <span className="font-bold text-yellow-400 font-mono">{user.points} PTS</span>
                  </div>
                  {user.wallet ? (
                    <div className="flex items-center gap-2 bg-purple-900/30 px-3 py-1.5 rounded-full border border-purple-500/30">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-mono text-purple-200">
                        {user.wallet.substring(0, 4)}...{user.wallet.substring(user.wallet.length - 4)}
                      </span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setShowWalletConnect(true)}
                      className="text-xs bg-yellow-500/10 text-yellow-400 px-3 py-1.5 rounded-full border border-yellow-500/30 hover:bg-yellow-500/20 transition-colors"
                    >
                      Connect Wallet
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                  {user.username === 'AlgoKingX' && (
                    <button 
                      onClick={() => setLocation('/admin')}
                      className="p-2 hover:bg-white/5 rounded-full transition-colors text-purple-400 hover:text-purple-300"
                      title="Admin Panel"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  )}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold text-lg shadow-lg">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Connect / Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-12 space-y-16">
        
        {/* Welcome Section */}
        {!user && (
          <div className="text-center space-y-6 py-12">
            <h2 className="text-5xl md:text-7xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500 animate-pulse">
              RULE THE KINGDOM
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The ultimate web3 playground for degen traders. Spin, flip, and win exclusive rewards, SOL airdrops, and whitelist spots.
            </p>
            <button 
              onClick={() => setShowAuth(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-bold text-xl shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all hover:scale-105"
            >
              Start Playing Now
            </button>
          </div>
        )}

        {/* Stats Grid (Only visible when logged in) */}
        {user && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-purple-900/20 rounded-xl p-6 border border-purple-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Trophy className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Wins</p>
                  <p className="text-2xl font-bold text-white">{user.totalWinnings}</p>
                </div>
              </div>
            </div>
            <div className="bg-pink-900/20 rounded-xl p-6 border border-pink-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-500/20 rounded-lg">
                  <Sparkles className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Spins</p>
                  <p className="text-2xl font-bold text-white">{user.totalSpins}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-900/20 rounded-xl p-6 border border-yellow-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Coins className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Current Points</p>
                  <p className="text-2xl font-bold text-white">{user.points}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game Center */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <SpinWheel user={user} onUpdateUser={handleUpdateUser} />
          <div className="space-y-8">
            <CoinFlipGame user={user} onUpdateUser={handleUpdateUser} />
            <div className="grid md:grid-cols-2 gap-6">
              <DailyLoginStreak user={user} onUpdateUser={handleUpdateUser} />
              {user && <LevelProgress user={user} />}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <LuckyDraw user={user} onUpdateUser={handleUpdateUser} />
              <ReferralsSection user={user} />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <KingdomMiner user={user} onUpdateUser={handleUpdateUser} />
              <div className="space-y-6">
                <Leaderboard />
                <Shop user={user} onUpdateUser={handleUpdateUser} />
              </div>
            </div>
          </div>
        </div>

        {/* Giveaways */}
        <GiveawaysSection user={user} giveaways={giveaways} />

        {/* Roadmap / Coming Soon */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl p-8 border border-white/10 backdrop-blur-sm">
          <h3 className="text-2xl font-bold mb-8 text-center font-orbitron">🔥 EXPANSION PACKS 🔥</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: '🎨', title: 'NFT Market', desc: 'Trade exclusive kingdom assets' },
              { icon: '🏆', title: 'Leaderboards', desc: 'Weekly prizes for top kings' },
              { icon: '⚡', title: 'Staking', desc: 'Earn passive yield on NFTs' },
              { icon: '🎮', title: 'PvP Battles', desc: 'Wager points against others' }
            ].map((item, i) => (
              <div key={i} className="bg-black/40 p-4 rounded-xl border border-white/5 hover:border-purple-500/50 transition-colors text-center group">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                <h4 className="font-bold text-white mb-1">{item.title}</h4>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/80 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
            <img src="/images/crown-icon.png" alt="Logo" className="w-6 h-6 grayscale" />
            <span className="font-orbitron font-bold">KINGS KINGDOM</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2025 Kings Kingdom. Built for the community.
          </p>
        </div>
      </footer>

      {/* Modals */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuth={handleAuth} />}
      {showWalletConnect && user && (
        <WalletConnectModal user={user} onConnect={handleUpdateUser} onClose={() => setShowWalletConnect(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <>
      <Toaster position="top-center" theme="dark" />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/admin" component={Admin} />
      </Switch>
    </>
  );
}

export default App;
