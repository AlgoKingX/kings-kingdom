// Types
export interface User {
  id: number;
  username: string;
  email?: string;
  password?: string;
  wallet: string | null;
  points: number;
  referralCode: string;
  referredBy: string | null;
  totalSpins: number;
  totalWinnings: number;
  joinedAt: string;
  blocked: boolean;
  lastLoginDate?: string;
  loginStreak: number;
  inventory: InventoryItem[]; // New: User inventory
  level: number;
  xp: number;
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
  activeUntil?: string; // For temporary boosts
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'BOOST' | 'MINER_UPGRADE' | 'COSMETIC';
  effectValue: number; // e.g., 2x multiplier, +5 miner rate
  duration?: number; // in hours, for boosts
  icon: string;
}

export interface Giveaway {
  id: number;
  title: string;
  prize: string;
  endDate: string;
  active: boolean;
  tweetLink: string;
  maxEntries: number;
  entryCost: number;
  description?: string;
}

export interface GiveawayEntry {
  id: number;
  userId: number;
  giveawayId: number;
  proofLink?: string;
  timestamp: string;
}

export interface Interaction {
  userId: number;
  username: string;
  type: string;
  reward?: string;
  timestamp: string;
}

export interface GameConfig {
  spinWinRate: number;
  coinFlipWinRate: number;
  luckyDrawCooldown: number;
  spinCooldown: number;
  globalMultiplier: number;
  minerRate: number;
  xpMultiplier: number;
}

export interface Transaction {
  id: number;
  userId: number;
  username: string;
  type: 'AIRDROP' | 'GAME_WIN' | 'GAME_LOSS' | 'MANUAL_ADJUSTMENT' | 'PAYOUT' | 'GIVEAWAY_ENTRY' | 'MINER_CLAIM' | 'DAILY_LOGIN' | 'SHOP_PURCHASE';
  amount: number;
  description: string;
  timestamp: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

// Data Management
export const getUsers = (): User[] => JSON.parse(localStorage.getItem('kk_users') || '[]');
export const saveUsers = (users: User[]) => localStorage.setItem('kk_users', JSON.stringify(users));

export const getGiveaways = (): Giveaway[] => JSON.parse(localStorage.getItem('kk_giveaways') || '[]');
export const saveGiveaways = (giveaways: Giveaway[]) => localStorage.setItem('kk_giveaways', JSON.stringify(giveaways));

export const getGiveawayEntries = (): GiveawayEntry[] => JSON.parse(localStorage.getItem('kk_entries') || '[]');
export const saveGiveawayEntries = (entries: GiveawayEntry[]) => localStorage.setItem('kk_entries', JSON.stringify(entries));

export const getInteractions = (): Interaction[] => JSON.parse(localStorage.getItem('kk_interactions') || '[]');
export const saveInteractions = (interactions: Interaction[]) => localStorage.setItem('kk_interactions', JSON.stringify(interactions));

export const getGameConfig = (): GameConfig => {
  const stored = JSON.parse(localStorage.getItem('kk_game_config') || '{}');
  const defaults = {
    spinWinRate: 40,
    coinFlipWinRate: 50,
    luckyDrawCooldown: 12,
    spinCooldown: 24,
    globalMultiplier: 1,
    minerRate: 1,
    xpMultiplier: 1
  };
  return { ...defaults, ...stored };
};
export const saveGameConfig = (config: GameConfig) => localStorage.setItem('kk_game_config', JSON.stringify(config));

export const getTransactions = (): Transaction[] => JSON.parse(localStorage.getItem('kk_transactions') || '[]');
export const saveTransactions = (transactions: Transaction[]) => localStorage.setItem('kk_transactions', JSON.stringify(transactions));

export const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
  const transactions = getTransactions();
  transactions.unshift({
    ...transaction,
    id: Date.now(),
    timestamp: new Date().toISOString()
  });
  saveTransactions(transactions);
};

// Shop Items Configuration
export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'miner_mk2',
    name: 'Iron Pickaxe',
    description: 'Increases mining rate by +1 point per click',
    price: 500,
    type: 'MINER_UPGRADE',
    effectValue: 1,
    icon: 'pickaxe'
  },
  {
    id: 'miner_mk3',
    name: 'Diamond Drill',
    description: 'Increases mining rate by +5 points per click',
    price: 2500,
    type: 'MINER_UPGRADE',
    effectValue: 5,
    icon: 'drill'
  },
  {
    id: 'xp_boost_2x',
    name: '2x Point Potion',
    description: 'Double points from all games for 1 hour',
    price: 1000,
    type: 'BOOST',
    effectValue: 2,
    duration: 1,
    icon: 'potion'
  },
  {
    id: 'crown_badge',
    name: 'Golden Crown',
    description: 'Exclusive profile badge for true Kings',
    price: 10000,
    type: 'COSMETIC',
    effectValue: 0,
    icon: 'crown'
  }
];

// Initialize demo data
export const initializeDemo = () => {
  if (getGiveaways().length === 0) {
    saveGiveaways([
      {
        id: Date.now() + 1,
        title: '👑 Genesis King Giveaway',
        prize: '5 SOL + Exclusive NFT',
        endDate: '2025-01-31',
        active: true,
        tweetLink: 'https://twitter.com/KingsKingdom/status/123456789',
        maxEntries: 5,
        entryCost: 50,
        description: 'Follow @AlgoKingX, RT & Like the pinned tweet to enter!'
      },
      {
        id: Date.now() + 2,
        title: '💎 Diamond Hands Challenge',
        prize: '2 SOL + Whitelist Spot',
        endDate: '2025-01-25',
        active: true,
        tweetLink: 'https://twitter.com/KingsKingdom/status/987654321',
        maxEntries: 5,
        entryCost: 25,
        description: 'Exclusive whitelist spot for the upcoming mint. Must be Level 5+ to enter.'
      }
    ]);
  }
  
  // Initialize admin user if not exists
  const users = getUsers();
  if (!users.find(u => u.username === 'AlgoKingX')) {
    users.push({
      id: 1,
      username: 'AlgoKingX',
      password: 'password123', // Default password, should be changed
      email: 'admin@kingskingdom.com',
      wallet: null,
      points: 999999,
      referralCode: 'KING',
      referredBy: null,
      totalSpins: 0,
      totalWinnings: 0,
      joinedAt: new Date().toISOString(),
      blocked: false,
      loginStreak: 0,
      inventory: [],
      level: 1,
      xp: 0
    });
    saveUsers(users);
  }
};

// XP System Helpers
export const calculateLevel = (xp: number): number => {
  // Level 1: 0-100 XP
  // Level 2: 101-300 XP
  // Level 3: 301-600 XP
  // Formula: Level = floor(sqrt(xp / 100)) + 1
  // Or simpler: Each level requires Level * 100 XP
  let level = 1;
  let requiredXp = 100;
  
  while (xp >= requiredXp) {
    xp -= requiredXp;
    level++;
    requiredXp = level * 100;
  }
  
  return level;
};

export const getXpForNextLevel = (level: number): number => {
  return level * 100;
};

export const getLevelProgress = (xp: number, level: number): number => {
  let currentLevelXp = xp;
  for (let i = 1; i < level; i++) {
    currentLevelXp -= i * 100;
  }
  const required = level * 100;
  return Math.min(100, Math.max(0, (currentLevelXp / required) * 100));
};

export const addXp = (user: User, amount: number): { user: User, leveledUp: boolean } => {
  const config = getGameConfig();
  const multiplier = config.xpMultiplier || 1;
  const finalAmount = Math.floor(amount * multiplier);
  
  const newXp = (user.xp || 0) + finalAmount;
  const newLevel = calculateLevel(newXp);
  const leveledUp = newLevel > (user.level || 1);
  
  return {
    user: {
      ...user,
      xp: newXp,
      level: newLevel
    },
    leveledUp
  };
};
