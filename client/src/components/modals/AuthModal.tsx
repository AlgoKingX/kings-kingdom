import React, { useState } from 'react';
import { Crown, X } from 'lucide-react';
import { toast } from 'sonner';
import { User, getUsers, saveUsers } from '@/lib/store';

interface AuthModalProps {
  onClose: () => void;
  onAuth: (user: User) => void;
}

export const AuthModal = ({ onClose, onAuth }: AuthModalProps) => {
  const [isSignup, setIsSignup] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (!username || !password) {
      toast.error('Username and password required!');
      return;
    }

    const users = getUsers();
    
    if (isSignup) {
      if (users.find(u => u.username === username)) {
        toast.error('Username already exists!');
        return;
      }
      
      const newUser: User = {
        id: Date.now(),
        username,
        email,
        password,
        wallet: null,
        points: 100, // Welcome bonus
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        referredBy: null,
        totalSpins: 0,
        totalWinnings: 0,
        joinedAt: new Date().toISOString(),
        blocked: false,
        loginStreak: 1,
        lastLoginDate: new Date().toISOString().split('T')[0],
        inventory: [],
        level: 1,
        xp: 0
      };
      
      users.push(newUser);
      saveUsers(users);
      onAuth(newUser);
      toast.success('Welcome to the Kingdom!');
    } else {
      const user = users.find(u => u.username === username && u.password === password);
      if (!user) {
        toast.error('Invalid credentials!');
        return;
      }
      if (user.blocked) {
        toast.error('Account blocked. Contact admin.');
        return;
      }
      onAuth(user);
      toast.success('Welcome back, King!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-purple-900 to-black rounded-2xl p-8 max-w-md w-full border-2 border-purple-500 shadow-[0_0_50px_rgba(147,51,234,0.5)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold flex items-center gap-2 font-orbitron text-white">
            <Crown className="w-8 h-8 text-yellow-400" />
            {isSignup ? 'Join Kingdom' : 'Welcome Back'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-all"
          />
          
          {isSignup && (
            <input
              type="email"
              placeholder="Email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-all"
            />
          )}
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-all"
          />

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-lg font-bold text-white shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-[1.02]"
          >
            {isSignup ? 'Create Account' : 'Login'}
          </button>

          <button
            onClick={() => setIsSignup(!isSignup)}
            className="w-full text-sm text-gray-400 hover:text-white transition-colors"
          >
            {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};
