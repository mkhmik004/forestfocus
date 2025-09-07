'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface CommunityTree {
  id: string;
  ownerAddress: string;
  ownerName?: string;
  stage: 'seedling' | 'sapling' | 'tree';
  plantedAt: Date;
  completedSessions: number;
  isPublic: boolean;
  collaborators?: string[];
  isCollaborative?: boolean;
  challengeId?: string;
}

interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  targetTrees: number;
  currentTrees: number;
  participants: string[];
  startDate: Date;
  endDate: Date;
  reward: string;
  isActive: boolean;
}

interface CommunityForestProps {
  userTrees: {
    id: string;
    stage: 'seedling' | 'sapling' | 'tree';
    plantedAt: Date;
    completedSessions: number;
  }[];
  onShareTree: (treeId: string) => void;
}

function CommunityForest({ userTrees, onShareTree }: CommunityForestProps) {
  const { address } = useAccount();
  const [communityTrees, setCommunityTrees] = useState<CommunityTree[]>([]);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  // const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [selectedTree, setSelectedTree] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'forest' | 'challenges' | 'collaborate'>('forest');

  // Load community data from localStorage (simulating a backend)
  useEffect(() => {
    const savedCommunityTrees = localStorage.getItem('forestfocus-community-trees');
    if (savedCommunityTrees) {
      const trees = JSON.parse(savedCommunityTrees);
      setCommunityTrees(trees.map((tree: CommunityTree & { plantedAt: string }) => ({
        ...tree,
        plantedAt: new Date(tree.plantedAt)
      })));
    }

    const savedChallenges = localStorage.getItem('forestfocus-community-challenges');
    if (savedChallenges) {
      const challengeData = JSON.parse(savedChallenges);
      setChallenges(challengeData.map((challenge: CommunityChallenge & { startDate: string; endDate: string }) => ({
        ...challenge,
        startDate: new Date(challenge.startDate),
        endDate: new Date(challenge.endDate)
      })));
    } else {
      // Initialize with default challenges
      const defaultChallenges: CommunityChallenge[] = [
        {
          id: 'weekly-forest',
          title: '🌲 Weekly Forest Challenge',
          description: 'Plant 50 trees as a community this week!',
          targetTrees: 50,
          currentTrees: Math.floor(Math.random() * 30) + 10,
          participants: [],
          startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          reward: '🏆 Community Badge + 100 LeafCoins',
          isActive: true
        },
        {
          id: 'focus-marathon',
          title: '⏰ Focus Marathon',
          description: 'Complete 1000 focus sessions together!',
          targetTrees: 100,
          currentTrees: Math.floor(Math.random() * 60) + 20,
          participants: [],
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          reward: '🎯 Focus Master Badge + 200 LeafCoins',
          isActive: true
        }
      ];
      setChallenges(defaultChallenges);
      localStorage.setItem('forestfocus-community-challenges', JSON.stringify(defaultChallenges));
    }
  }, []);

  // Save community data to localStorage
  const saveCommunityTrees = (trees: CommunityTree[]) => {
    localStorage.setItem('forestfocus-community-trees', JSON.stringify(trees));
    setCommunityTrees(trees);
  };

  const saveChallenges = (challengeData: CommunityChallenge[]) => {
    localStorage.setItem('forestfocus-community-challenges', JSON.stringify(challengeData));
    setChallenges(challengeData);
  };

  const shareTreeToCommunity = (treeId: string, isCollaborative: boolean = false) => {
    const userTree = userTrees.find(t => t.id === treeId);
    if (!userTree || !address) return;

    const communityTree: CommunityTree = {
      ...userTree,
      ownerAddress: address,
      ownerName: `${address.slice(0, 6)}...${address.slice(-4)}`,
      isPublic: true,
      isCollaborative,
      collaborators: isCollaborative ? [address] : undefined,
    };

    const updatedTrees = [...communityTrees, communityTree];
    saveCommunityTrees(updatedTrees);
    onShareTree(treeId);
    setShowShareModal(false);
    setShowCollabModal(false);
    setSelectedTree(null);
  };

  const joinChallenge = (challengeId: string) => {
    if (!address) return;
    
    const updatedChallenges = challenges.map(challenge => {
      if (challenge.id === challengeId && !challenge.participants.includes(address)) {
        return {
          ...challenge,
          participants: [...challenge.participants, address]
        };
      }
      return challenge;
    });
    
    saveChallenges(updatedChallenges);
  };

  const collaborateOnTree = (treeId: string) => {
    if (!address) return;
    
    const updatedTrees = communityTrees.map(tree => {
      if (tree.id === treeId && tree.isCollaborative && tree.collaborators) {
        if (!tree.collaborators.includes(address)) {
          return {
            ...tree,
            collaborators: [...tree.collaborators, address]
          };
        }
      }
      return tree;
    });
    
    saveCommunityTrees(updatedTrees);
  };

  const getTreeEmoji = (stage: CommunityTree['stage']): string => {
    switch (stage) {
      case 'seedling': return '🌱';
      case 'sapling': return '🌿';
      case 'tree': return '🌳';
    }
  };

  const getTreeStageColor = (stage: CommunityTree['stage']): string => {
    switch (stage) {
      case 'seedling': return 'text-green-300';
      case 'sapling': return 'text-green-500';
      case 'tree': return 'text-green-700';
    }
  };

  const getStageLabel = (stage: CommunityTree['stage']): string => {
    switch (stage) {
      case 'seedling': return 'Seedling';
      case 'sapling': return 'Sapling';
      case 'tree': return 'Mature Tree';
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just planted';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  const sortedTrees = [...communityTrees].sort((a, b) => {
    // Sort by stage (mature trees first), then by completion date
    const stageOrder = { 'tree': 3, 'sapling': 2, 'seedling': 1 };
    if (stageOrder[a.stage] !== stageOrder[b.stage]) {
      return stageOrder[b.stage] - stageOrder[a.stage];
    }
    return b.plantedAt.getTime() - a.plantedAt.getTime();
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold mb-2">Community Forest</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {communityTrees.length} trees planted • {challenges.filter(c => c.isActive).length} active challenges
          </p>
        </div>
        
        <div className="flex space-x-2">
          {activeTab === 'forest' && (
            <>
              {/* View Mode Toggle */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 shadow-sm'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 shadow-sm'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  List
                </button>
              </div>
              
              {/* Share Tree Button */}
              {userTrees.length > 0 && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                >
                  Share Tree
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('forest')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'forest'
              ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          🌳 Forest
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'challenges'
              ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          🏆 Challenges
        </button>
        <button
          onClick={() => setActiveTab('collaborate')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'collaborate'
              ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          🤝 Collaborate
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'forest' && (
        <div>
          {communityTrees.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌍</div>
              <h4 className="text-lg font-semibold mb-2">No trees in the community forest yet</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Be the first to share your tree with the community!
              </p>
              {userTrees.length > 0 && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                >
                  Share Your First Tree
                </button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4' : 'space-y-3'}>
              {sortedTrees.map((tree) => (
                <div
                  key={`${tree.ownerAddress}-${tree.id}`}
                  className={`${
                    viewMode === 'grid'
                      ? 'bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center'
                      : 'bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center space-x-4'
                  } hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors relative`}
                >
                  {tree.isCollaborative && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      🤝 {tree.collaborators?.length || 1}
                    </div>
                  )}
                  {viewMode === 'grid' ? (
                    <>
                      <div className={`text-3xl mb-2 ${getTreeStageColor(tree.stage)}`}>
                        {getTreeEmoji(tree.stage)}
                      </div>
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {getStageLabel(tree.stage)}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        {tree.completedSessions} sessions
                      </div>
                      <div className="text-xs text-gray-400">
                        by {tree.ownerName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatTimeAgo(tree.plantedAt)}
                      </div>
                      {tree.isCollaborative && tree.collaborators && !tree.collaborators.includes(address || '') && (
                        <button
                          onClick={() => collaborateOnTree(tree.id)}
                          className="mt-2 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
                        >
                          Join
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <div className={`text-2xl ${getTreeStageColor(tree.stage)}`}>
                        {getTreeEmoji(tree.stage)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {getStageLabel(tree.stage)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatTimeAgo(tree.plantedAt)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {tree.completedSessions} sessions • by {tree.ownerName}
                          {tree.isCollaborative && (
                            <span className="ml-2 text-blue-500">🤝 Collaborative</span>
                          )}
                        </div>
                      </div>
                      {tree.isCollaborative && tree.collaborators && !tree.collaborators.includes(address || '') && (
                        <button
                          onClick={() => collaborateOnTree(tree.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Join
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="space-y-4">
          {challenges.filter(c => c.isActive).map((challenge) => {
            const progress = (challenge.currentTrees / challenge.targetTrees) * 100;
            const isParticipating = challenge.participants.includes(address || '');
            const daysLeft = Math.ceil((challenge.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={challenge.id} className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{challenge.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{challenge.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>👥 {challenge.participants.length} participants</span>
                      <span>⏰ {daysLeft} days left</span>
                    </div>
                  </div>
                  {!isParticipating && (
                    <button
                      onClick={() => joinChallenge(challenge.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                    >
                      Join Challenge
                    </button>
                  )}
                  {isParticipating && (
                    <div className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                      ✓ Joined
                    </div>
                  )}
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress: {challenge.currentTrees}/{challenge.targetTrees} trees</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  🎁 Reward: {challenge.reward}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'collaborate' && (
        <div>
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🤝</div>
            <h4 className="text-lg font-semibold mb-2">Collaborative Tree Planting</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Plant trees together with the community! Collaborative trees grow faster with multiple contributors.
            </p>
            {userTrees.length > 0 && (
              <button
                onClick={() => setShowCollabModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
              >
                Start Collaborative Tree
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communityTrees.filter(tree => tree.isCollaborative).map((tree) => (
              <div key={`collab-${tree.id}`} className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`text-2xl ${getTreeStageColor(tree.stage)}`}>
                      {getTreeEmoji(tree.stage)}
                    </div>
                    <div>
                      <div className="font-medium">{getStageLabel(tree.stage)}</div>
                      <div className="text-sm text-gray-500">{tree.completedSessions} sessions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      🤝 {tree.collaborators?.length || 1} collaborators
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mb-3">
                  Started by {tree.ownerName} • {formatTimeAgo(tree.plantedAt)}
                </div>
                
                {tree.collaborators && !tree.collaborators.includes(address || '') ? (
                  <button
                    onClick={() => collaborateOnTree(tree.id)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium text-sm transition-colors"
                  >
                    Join Collaboration
                  </button>
                ) : (
                  <div className="w-full bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 py-2 rounded-lg text-center font-medium text-sm">
                    ✓ You&apos;re collaborating
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {communityTrees.filter(tree => tree.isCollaborative).length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400">
                No collaborative trees yet. Start the first one!
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collaborative Tree Modal */}
      {showCollabModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <h4 className="text-lg font-bold mb-4">🤝 Start Collaborative Tree</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Choose a tree to make collaborative. Other community members can join and help it grow faster!
            </p>
            
            <div className="space-y-3 mb-6">
              {userTrees.map((tree) => (
                <button
                  key={tree.id}
                  onClick={() => setSelectedTree(tree.id)}
                  className={`w-full p-3 rounded-lg border-2 transition-colors ${
                    selectedTree === tree.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`text-2xl ${getTreeStageColor(tree.stage)}`}>
                      {getTreeEmoji(tree.stage)}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{getStageLabel(tree.stage)}</div>
                      <div className="text-sm text-gray-500">
                        {tree.completedSessions} sessions • {formatTimeAgo(tree.plantedAt)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCollabModal(false);
                  setSelectedTree(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedTree && shareTreeToCommunity(selectedTree, true)}
                disabled={!selectedTree}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
              >
                Start Collaboration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Tree Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <h4 className="text-lg font-bold mb-4">Share a Tree with the Community</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Choose one of your trees to share with the ForestFocus community!
            </p>
            
            <div className="space-y-3 mb-6">
              {userTrees.map((tree) => (
                <button
                  key={tree.id}
                  onClick={() => setSelectedTree(tree.id)}
                  className={`w-full p-3 rounded-lg border-2 transition-colors ${
                    selectedTree === tree.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`text-2xl ${getTreeStageColor(tree.stage)}`}>
                      {getTreeEmoji(tree.stage)}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{getStageLabel(tree.stage)}</div>
                      <div className="text-sm text-gray-500">
                        {tree.completedSessions} sessions • {formatTimeAgo(tree.plantedAt)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setSelectedTree(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedTree && shareTreeToCommunity(selectedTree)}
                disabled={!selectedTree}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
              >
                Share Tree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

CommunityForest.displayName = 'CommunityForest';

export default CommunityForest;