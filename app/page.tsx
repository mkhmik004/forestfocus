'use client';

import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';
import { useState, useEffect, useRef } from 'react';
import PomodoroTimer from './components/PomodoroTimer';
import CommunityForest from './components/CommunityForest';
import FarcasterShare from './components/FarcasterShare';
import TreeGrowthSystem from './components/TreeGrowthSystem';
import { LeafCoinSystemWithRef } from './components/LeafCoinSystem';
import PersonalForestDashboard from './components/PersonalForestDashboard';

interface Tree {
  id: string;
  stage: 'seedling' | 'sapling' | 'tree';
  plantedAt: Date;
  completedSessions: number;
}

interface UserStats {
  totalSessions: number;
  leafCoins: number;
  treesPlanted: number;
  currentStreak: number;
}

export default function App() {
  const { address, isConnected } = useAccount();
  // const [showDashboard, setShowDashboard] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    totalSessions: 0,
    leafCoins: 0,
    treesPlanted: 0,
    currentStreak: 0,
  });
  
  const leafCoinRef = useRef<{
    addCoins: (amount: number, reason: string) => void;
    spendCoins: (amount: number, reason: string) => boolean;
    COIN_REWARDS: {
      focusSession: number;
      streakBonus: number;
      treeGrowth: number;
      dailyGoal: number;
      weeklyGoal: number;
    };
  }>(null);
  const [personalForest, setPersonalForest] = useState<Tree[]>([]);
  // const [currentSessionCount, setCurrentSessionCount] = useState(0);
  const [showCommunityForest, setShowCommunityForest] = useState(false);

  const TreeIcon = () => (
    <svg className="w-full h-full text-green-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L8 8h3v12h2V8h3l-4-6z" />
      <circle cx="12" cy="18" r="3" fill="currentColor" opacity="0.7" />
    </svg>
  );

  const LeafIcon = () => (
    <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
    </svg>
  );

  // Load user data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && isConnected && address) {
      const savedStats = localStorage.getItem(`forestfocus-stats-${address}`);
      const savedForest = localStorage.getItem(`forestfocus-forest-${address}`);
      
      if (savedStats) {
        setUserStats(JSON.parse(savedStats));
      }
      
      if (savedForest) {
        const forest = JSON.parse(savedForest);
        setPersonalForest(forest.map((tree: Tree & { plantedAt: string }) => ({
          ...tree,
          plantedAt: new Date(tree.plantedAt)
        })));
      }
    }
  }, [isConnected, address]);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isConnected && address) {
      localStorage.setItem(`forestfocus-stats-${address}`, JSON.stringify(userStats));
    }
  }, [userStats, isConnected, address]);

  useEffect(() => {
    if (typeof window !== 'undefined' && isConnected && address) {
      localStorage.setItem(`forestfocus-forest-${address}`, JSON.stringify(personalForest));
    }
  }, [personalForest, isConnected, address]);

  const handleSessionComplete = () => {
    const newTotalSessions = userStats.totalSessions + 1;
    
    // Award base coins for focus session
    leafCoinRef.current?.addCoins(10, 'Focus Session Completed');
    
    // Check for streak bonus (every 3 consecutive days)
    const today = new Date().toDateString();
    const lastSessionDate = typeof window !== 'undefined' ? localStorage.getItem('lastSessionDate') : null;
    if (lastSessionDate !== today) {
      const streak = userStats.currentStreak + 1;
      if (streak % 3 === 0) {
        leafCoinRef.current?.addCoins(5, `${streak}-Day Streak Bonus`);
      }
      setUserStats((prev: UserStats) => ({ ...prev, currentStreak: streak }));
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastSessionDate', today);
      }
    }
    
    // Check for daily goal (4 sessions)
    if (newTotalSessions % 4 === 0) {
      leafCoinRef.current?.addCoins(25, 'Daily Goal Achieved');
    }
    
    // Check for weekly goal (20 sessions)
    if (newTotalSessions % 20 === 0) {
      leafCoinRef.current?.addCoins(50, 'Weekly Goal Achieved');
    }
    
    const newStats = {
      ...userStats,
      totalSessions: newTotalSessions,
      leafCoins: userStats.leafCoins + 10, // Earn 10 LeafCoins per session
      currentStreak: userStats.currentStreak + 1,
    };
    setUserStats(newStats);
    // Session count tracking removed

    // Plant a new tree every 4 sessions (1 Pomodoro cycle)
    if ((newStats.totalSessions) % 4 === 0) {
      plantNewTree();
      leafCoinRef.current?.addCoins(15, 'New Tree Planted');
    } else {
      // Grow existing trees
      growTrees();
    }
  };

  const handleSessionStart = () => {
    // Could add session start logic here
  };

  const plantNewTree = () => {
    const newTree: Tree = {
      id: `tree-${Date.now()}`,
      stage: 'seedling',
      plantedAt: new Date(),
      completedSessions: 0,
    };
    
    setPersonalForest(prev => [...prev, newTree]);
    setUserStats((prev: UserStats) => ({ ...prev, treesPlanted: prev.treesPlanted + 1 }));
  };

  const growTrees = () => {
    setPersonalForest((prev: Tree[]) => prev.map((tree: Tree) => {
      const newCompletedSessions = tree.completedSessions + 1;
      let newStage = tree.stage;
      const previousStage = tree.stage;
      
      // Growth stages based on sessions
      if (newCompletedSessions >= 12 && tree.stage === 'sapling') {
        newStage = 'tree';
      } else if (newCompletedSessions >= 4 && tree.stage === 'seedling') {
        newStage = 'sapling';
      }
      
      // Award coins for tree growth
      if (newStage !== previousStage) {
        leafCoinRef.current?.addCoins(15, `Tree Grew to ${newStage}`);
      }
      
      return {
        ...tree,
        completedSessions: newCompletedSessions,
        stage: newStage,
      };
    }));
  };



  const handleShareTree = (treeId: string) => {
    // Mark tree as shared (could add a shared flag to tree interface if needed)
    console.log(`Tree ${treeId} shared to community`);
  };
  
  const handleCoinsUpdate = (newCoins: number) => {
    setUserStats((prev: UserStats) => ({ ...prev, leafCoins: newCoins }));
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900">
        {/* Header */}
        <header className="pt-6 pr-6">
          <div className="flex justify-end">
            <Wallet>
              <ConnectWallet className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-semibold transition-colors">
                <Avatar className="h-6 w-6" />
                <Name />
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                  <EthBalance />
                </Identity>
                <WalletDropdownLink
                  icon="wallet"
                  href="https://keys.coinbase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Wallet
                </WalletDropdownLink>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-grow flex items-center justify-center px-4 py-8">
          <div className="max-w-4xl w-full text-center">
            <div className="mb-6 sm:mb-8 flex justify-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16">
                <TreeIcon />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6">
              Forest<span className="text-green-600">Focus</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Gamify your productivity. Grow virtual trees. Earn LeafCoin. 
              Build your forest while staying focused.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 max-w-3xl mx-auto">
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
                <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">🍅</div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Focus Sessions</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Start Pomodoro sessions and stay focused on your tasks</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
                <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">🌱</div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Grow Trees</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Watch your virtual trees grow from seedlings to full trees</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg sm:col-span-2 md:col-span-1">
                <div className="flex items-center justify-center mb-3 sm:mb-4">
                  <LeafIcon />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Earn LeafCoin</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Get rewarded with LeafCoin for completed sessions</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl max-w-sm sm:max-w-md mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Ready to Start Growing?</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                Connect your wallet to begin your productivity journey
              </p>
              <Wallet>
                <ConnectWallet className="w-full bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-colors">
                  Connect Wallet & Start
                </ConnectWallet>
              </Wallet>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Built on Base • Powered by OnchainKit</p>
        </footer>
      </div>
    );
  }

  // Dashboard view for connected users
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-16 sm:h-16">
                <TreeIcon />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                Forest<span className="text-green-600">Focus</span>
              </h1>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-800 px-3 py-2 rounded-full">
                 <LeafIcon />
                 <span className="font-semibold text-sm sm:text-base">{userStats.leafCoins} LeafCoin</span>
               </div>
              
              <Wallet>
                <ConnectWallet className="w-full sm:w-auto">
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8" />
                  <Name className="text-sm sm:text-base truncate max-w-[120px] sm:max-w-none" />
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <Avatar />
                    <Name />
                    <Address className="text-xs sm:text-sm" />
                    <EthBalance />
                  </Identity>
                  <WalletDropdownLink
                    icon="wallet"
                    href="https://keys.coinbase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Wallet
                  </WalletDropdownLink>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Focus Timer and LeafCoin System */}
           <div className="lg:col-span-2 space-y-4 sm:space-y-6">
             <PomodoroTimer 
               onSessionComplete={handleSessionComplete}
               onSessionStart={handleSessionStart}
             />
             <LeafCoinSystemWithRef 
               ref={leafCoinRef}
               totalCoins={userStats.leafCoins}
               onCoinsUpdate={handleCoinsUpdate}
             />
           </div>

          {/* Personal Forest */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                 <h3 className="text-lg sm:text-xl font-bold">🌳 Personal Forest</h3>
                 <button
                   onClick={() => setShowCommunityForest(!showCommunityForest)}
                   className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                 >
                   {showCommunityForest ? '← Back to Personal' : 'View Community →'}
                 </button>
               </div>
               
               {showCommunityForest ? (
                 <CommunityForest 
                   userTrees={personalForest}
                   onShareTree={handleShareTree}
                 />
               ) : (
                 <TreeGrowthSystem 
                   trees={personalForest}
                   onTreeUpdate={setPersonalForest}
                 />
               )}
               
               {/* Farcaster Share */}
               <div className="mt-4 sm:mt-6">
                 <FarcasterShare 
                   userStats={userStats}
                   personalForest={personalForest}
                 />
               </div>
             </div>
            
            <PersonalForestDashboard 
              trees={personalForest}
              userStats={userStats}
              className=""
            />
          </div>
        </div>
      </main>
    </div>
  );
}
