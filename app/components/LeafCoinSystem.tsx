'use client';

import React, { useState, useEffect } from 'react';

interface LeafCoinSystemProps {
  totalCoins: number;
  className?: string;
  transactions?: CoinTransaction[];
  animatingCoins?: number;
  showCoinAnimation?: boolean;
}

interface CoinTransaction {
  id: string;
  amount: number;
  reason: string;
  timestamp: Date;
  type: 'earned' | 'spent';
}

const COIN_REWARDS = {
  focusSession: 10,
  streakBonus: 5,
  treeGrowth: 15,
  dailyGoal: 25,
  weeklyGoal: 50
};

export default function LeafCoinSystem({ 
  totalCoins, 
  className = '',
  transactions: propTransactions,
  animatingCoins: propAnimatingCoins,
  showCoinAnimation: propShowCoinAnimation
}: LeafCoinSystemProps) {
  const [transactions, setTransactions] = useState<CoinTransaction[]>(propTransactions || []);
  const [showTransactions, setShowTransactions] = useState(false);

  // Load transactions from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('leafcoin-transactions');
    if (savedTransactions) {
      const parsed = JSON.parse(savedTransactions);
      const transactionsWithDates = parsed.map((t: CoinTransaction & { timestamp: string }) => ({
        ...t,
        timestamp: new Date(t.timestamp)
      }));
      setTransactions(transactionsWithDates);
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('leafcoin-transactions', JSON.stringify(transactions));
    }
  }, [transactions]);



  const getRecentTransactions = () => {
    return transactions.slice(0, 5);
  };

  const getTodaysEarnings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return transactions
      .filter(t => t.timestamp >= today && t.type === 'earned')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getWeeklyEarnings = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return transactions
      .filter(t => t.timestamp >= weekAgo && t.type === 'earned')
      .reduce((sum, t) => sum + t.amount, 0);
  };



  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Coin Display */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-2xl p-6 relative overflow-hidden">
        {/* Animated Coins */}
        {propShowCoinAnimation && (
          <div className="absolute top-4 right-4 animate-bounce text-2xl font-bold text-yellow-600">
            +{propAnimatingCoins || 0} 🍃
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl animate-pulse">🍃</div>
            <div>
              <h3 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                {totalCoins.toLocaleString()}
              </h3>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                LeafCoins
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowTransactions(!showTransactions)}
            className="text-sm text-yellow-700 hover:text-yellow-800 dark:text-yellow-300 dark:hover:text-yellow-200 font-medium"
          >
            {showTransactions ? 'Hide History' : 'View History'}
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">
              {getTodaysEarnings()}
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">
              Today&apos;s Earnings
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">
              {getWeeklyEarnings()}
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">
              This Week
            </div>
          </div>
        </div>
      </div>

      {/* Earning Opportunities */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
          💰 Earning Opportunities
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Complete Focus Session</span>
            <span className="font-medium text-yellow-600">+{COIN_REWARDS.focusSession} 🍃</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Daily Streak Bonus</span>
            <span className="font-medium text-yellow-600">+{COIN_REWARDS.streakBonus} 🍃</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Tree Growth Milestone</span>
            <span className="font-medium text-yellow-600">+{COIN_REWARDS.treeGrowth} 🍃</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Daily Goal (4 sessions)</span>
            <span className="font-medium text-yellow-600">+{COIN_REWARDS.dailyGoal} 🍃</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Weekly Goal (20 sessions)</span>
            <span className="font-medium text-yellow-600">+{COIN_REWARDS.weeklyGoal} 🍃</span>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      {showTransactions && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            📊 Recent Transactions
          </h4>
          
          {transactions.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">🍃</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No transactions yet. Complete a focus session to earn your first LeafCoins!
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {getRecentTransactions().map((transaction) => (
                <div
                  key={transaction.id}
                  className={`flex justify-between items-center p-3 rounded-lg ${
                    transaction.type === 'earned'
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : 'bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {transaction.reason}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {transaction.timestamp.toLocaleDateString()} at{' '}
                      {transaction.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div
                    className={`font-bold ${
                      transaction.type === 'earned'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {transaction.type === 'earned' ? '+' : ''}{transaction.amount} 🍃
                  </div>
                </div>
              ))}
              
              {transactions.length > 5 && (
                <div className="text-center pt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Showing recent 5 of {transactions.length} transactions
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Define ref type
export interface LeafCoinSystemRef {
  addCoins: (amount: number, reason: string) => void;
  spendCoins: (amount: number, reason: string) => boolean;
  COIN_REWARDS: typeof COIN_REWARDS;
}

// Create a component that can be used with forwardRef
const LeafCoinSystemWithRefImpl = React.forwardRef<LeafCoinSystemRef, LeafCoinSystemProps & { onCoinsUpdate: (coins: number) => void }>((props, ref) => {
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [animatingCoins, setAnimatingCoins] = useState(0);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);

  const addCoins = (amount: number, reason: string) => {
    const newTransaction: CoinTransaction = {
      id: Date.now().toString(),
      amount,
      reason,
      timestamp: new Date(),
      type: 'earned'
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    const newTotal = props.totalCoins + amount;
    props.onCoinsUpdate(newTotal);
    
    setAnimatingCoins(amount);
    setShowCoinAnimation(true);
    setTimeout(() => setShowCoinAnimation(false), 2000);
  };

  const spendCoins = (amount: number, reason: string): boolean => {
    if (props.totalCoins < amount) {
      return false;
    }
    
    const newTransaction: CoinTransaction = {
      id: Date.now().toString(),
      amount: -amount,
      reason,
      timestamp: new Date(),
      type: 'spent'
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    const newTotal = props.totalCoins - amount;
    props.onCoinsUpdate(newTotal);
    return true;
  };

  React.useImperativeHandle(ref, () => ({
    addCoins,
    spendCoins,
    COIN_REWARDS
  }));

  return (
    <LeafCoinSystem 
      {...props} 
      transactions={transactions}
      animatingCoins={animatingCoins}
      showCoinAnimation={showCoinAnimation}
    />
  );
});

LeafCoinSystemWithRefImpl.displayName = 'LeafCoinSystemWithRef';

// Export the component
export const LeafCoinSystemWithRef = LeafCoinSystemWithRefImpl;