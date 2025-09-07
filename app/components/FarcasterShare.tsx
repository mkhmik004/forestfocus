'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

interface FarcasterShareProps {
  userStats: {
    totalSessions: number;
    leafCoins: number;
    treesPlanted: number;
    currentStreak: number;
  };
  personalForest: {
    id: string;
    stage: 'seedling' | 'sapling' | 'tree';
    plantedAt: Date;
    completedSessions: number;
  }[];
}

type ShareType = 'milestone' | 'session' | 'tree' | 'streak';

interface ShareTemplate {
  type: ShareType;
  title: string;
  description: string;
  emoji: string;
  generateText: (stats: FarcasterShareProps['userStats'], forest: FarcasterShareProps['personalForest']) => string;
}

const SHARE_TEMPLATES: ShareTemplate[] = [
  {
    type: 'session',
    title: 'Session Complete',
    description: 'Share your latest focus session',
    emoji: '🍅',
    generateText: (stats) => 
      `Just completed another focus session on @forestfocus! 🍅\n\n📊 Total sessions: ${stats.totalSessions}\n🪙 LeafCoins earned: ${stats.leafCoins}\n🔥 Current streak: ${stats.currentStreak}\n\nStay focused, stay productive! 🌱 #ProductivityGaming #Focus`
  },
  {
    type: 'tree',
    title: 'New Tree Planted',
    description: 'Celebrate planting a new tree',
    emoji: '🌳',
    generateText: (stats, forest) => {
      const matureTrees = forest.filter(t => t.stage === 'tree').length;
      return `🌳 Just planted tree #${stats.treesPlanted} in my @forestfocus forest!\n\n🌱 Seedlings: ${forest.filter(t => t.stage === 'seedling').length}\n🌿 Saplings: ${forest.filter(t => t.stage === 'sapling').length}\n🌳 Mature trees: ${matureTrees}\n\nEvery focus session grows my digital forest! 🌲 #ProductivityGaming`;
    }
  },
  {
    type: 'milestone',
    title: 'Milestone Achievement',
    description: 'Share major milestones',
    emoji: '🏆',
    generateText: (stats) => {
      let milestone = '';
      if (stats.totalSessions >= 100) milestone = '💯 100+ focus sessions';
      else if (stats.totalSessions >= 50) milestone = '🎯 50+ focus sessions';
      else if (stats.totalSessions >= 25) milestone = '⭐ 25+ focus sessions';
      else if (stats.totalSessions >= 10) milestone = '🚀 10+ focus sessions';
      else milestone = `🎉 ${stats.totalSessions} focus sessions`;
      
      return `🏆 Milestone unlocked on @forestfocus!\n\n${milestone}\n🪙 ${stats.leafCoins} LeafCoins earned\n🌳 ${stats.treesPlanted} trees planted\n\nProductivity gamification works! 💪 #ProductivityGaming #Focus`;
    }
  },
  {
    type: 'streak',
    title: 'Streak Update',
    description: 'Share your current streak',
    emoji: '🔥',
    generateText: (stats) => 
      `🔥 ${stats.currentStreak}-session streak on @forestfocus!\n\nConsistency is key to building productive habits. Every session counts! 💪\n\n📈 Total sessions: ${stats.totalSessions}\n🌳 Trees planted: ${stats.treesPlanted}\n\n#ProductivityGaming #FocusStreak`
  }
];

export default function FarcasterShare({ userStats, personalForest }: FarcasterShareProps) {
  const { address } = useAccount();
  const [selectedTemplate, setSelectedTemplate] = useState<ShareTemplate | null>(null);
  const [customText, setCustomText] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleTemplateSelect = (template: ShareTemplate) => {
    setSelectedTemplate(template);
    setCustomText(template.generateText(userStats, personalForest));
  };

  const shareToFarcaster = async () => {
    if (!customText.trim()) return;
    
    setIsSharing(true);
    
    try {
      // Create the Farcaster cast URL with the text
      const castText = encodeURIComponent(customText);
      const farcasterUrl = `https://warpcast.com/~/compose?text=${castText}`;
      
      // Open Farcaster in a new window
      window.open(farcasterUrl, '_blank', 'width=600,height=700');
      
      // Close modal after a short delay
      setTimeout(() => {
        setShowModal(false);
        setSelectedTemplate(null);
        setCustomText('');
      }, 1000);
      
    } catch (error) {
      console.error('Error sharing to Farcaster:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const getRecommendedTemplate = (): ShareTemplate => {
    // Recommend based on recent achievements
    if (userStats.currentStreak >= 5) {
      return SHARE_TEMPLATES.find(t => t.type === 'streak') || SHARE_TEMPLATES[0];
    }
    if (userStats.totalSessions > 0 && userStats.totalSessions % 10 === 0) {
      return SHARE_TEMPLATES.find(t => t.type === 'milestone') || SHARE_TEMPLATES[0];
    }
    if (personalForest.length > 0) {
      return SHARE_TEMPLATES.find(t => t.type === 'tree') || SHARE_TEMPLATES[0];
    }
    return SHARE_TEMPLATES[0];
  };

  if (!address) {
    return (
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
          <span className="text-lg">🔗</span>
          <span className="font-medium">Connect wallet to share on Farcaster</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Quick Share Button */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold mb-1">Share Progress</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Share your ForestFocus journey on Farcaster
            </p>
          </div>
          <div className="text-2xl">🔗</div>
        </div>
        
        {/* Quick Share Options */}
        <div className="space-y-3">
          <button
            onClick={() => {
              const recommended = getRecommendedTemplate();
              handleTemplateSelect(recommended);
              setShowModal(true);
            }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <span>{getRecommendedTemplate().emoji}</span>
            <span>Share {getRecommendedTemplate().title}</span>
          </button>
          
          <button
            onClick={() => setShowModal(true)}
            className="w-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            More Share Options
          </button>
        </div>
        
        {/* Stats Preview */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-purple-600">{userStats.totalSessions}</div>
              <div className="text-xs text-gray-500">Sessions</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{userStats.treesPlanted}</div>
              <div className="text-xs text-gray-500">Trees</div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Share on Farcaster</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              
              {/* Template Selection */}
              {!selectedTemplate && (
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold mb-3">Choose what to share:</h4>
                  {SHARE_TEMPLATES.map((template) => (
                    <button
                      key={template.type}
                      onClick={() => handleTemplateSelect(template)}
                      className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{template.emoji}</span>
                        <div>
                          <div className="font-medium">{template.title}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {template.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Text Editor */}
              {selectedTemplate && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-xl">{selectedTemplate.emoji}</span>
                    <span className="font-semibold">{selectedTemplate.title}</span>
                    <button
                      onClick={() => {
                        setSelectedTemplate(null);
                        setCustomText('');
                      }}
                      className="ml-auto text-sm text-blue-600 hover:text-blue-700"
                    >
                      Change
                    </button>
                  </div>
                  
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Write your cast..."
                    className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
                    maxLength={320}
                  />
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{customText.length}/320 characters</span>
                    <span className="text-purple-600">@forestfocus</span>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={shareToFarcaster}
                      disabled={!customText.trim() || isSharing}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                    >
                      {isSharing ? (
                        <span>Sharing...</span>
                      ) : (
                        <>
                          <span>🔗</span>
                          <span>Share Cast</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}