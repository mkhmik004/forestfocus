'use client';

import React, { useState, useEffect } from 'react';

interface Tree {
  id: string;
  stage: 'seedling' | 'sapling' | 'tree';
  plantedAt: Date;
  completedSessions: number;
  name?: string;
}

interface TreeGrowthSystemProps {
  trees: Tree[];
  onTreeUpdate: (trees: Tree[]) => void;
  className?: string;
}

const GROWTH_THRESHOLDS = {
  seedling: 0,    // 0 sessions to plant
  sapling: 3,     // 3 sessions to become sapling
  tree: 8        // 8 sessions to become full tree
};

const TREE_ANIMATIONS = {
  seedling: 'animate-pulse',
  sapling: 'animate-bounce',
  tree: 'animate-none'
};

const TREE_COLORS = {
  seedling: 'text-green-400',
  sapling: 'text-green-500', 
  tree: 'text-green-600'
};

export default function TreeGrowthSystem({ trees, onTreeUpdate, className = '' }: TreeGrowthSystemProps) {
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [showGrowthAnimation, setShowGrowthAnimation] = useState<string | null>(null);

  // Check for tree growth when sessions are completed
  useEffect(() => {
    const updatedTrees = trees.map(tree => {
      let newStage = tree.stage;
      
      if (tree.completedSessions >= GROWTH_THRESHOLDS.tree && tree.stage !== 'tree') {
        newStage = 'tree';
        triggerGrowthAnimation(tree.id);
      } else if (tree.completedSessions >= GROWTH_THRESHOLDS.sapling && tree.stage === 'seedling') {
        newStage = 'sapling';
        triggerGrowthAnimation(tree.id);
      }
      
      return { ...tree, stage: newStage };
    });
    
    // Only update if there are actual changes
    const hasChanges = updatedTrees.some((tree, index) => tree.stage !== trees[index]?.stage);
    if (hasChanges) {
      onTreeUpdate(updatedTrees);
    }
  }, [trees, onTreeUpdate]);

  const triggerGrowthAnimation = (treeId: string) => {
    setShowGrowthAnimation(treeId);
    setTimeout(() => setShowGrowthAnimation(null), 2000);
  };

  const getTreeEmoji = (stage: Tree['stage']) => {
    switch (stage) {
      case 'seedling': return '🌱';
      case 'sapling': return '🌿';
      case 'tree': return '🌳';
      default: return '🌱';
    }
  };

  const getGrowthProgress = (tree: Tree) => {
    const current = tree.completedSessions;
    let nextThreshold: number;
    let currentThreshold: number;
    
    if (tree.stage === 'seedling') {
      currentThreshold = GROWTH_THRESHOLDS.seedling;
      nextThreshold = GROWTH_THRESHOLDS.sapling;
    } else if (tree.stage === 'sapling') {
      currentThreshold = GROWTH_THRESHOLDS.sapling;
      nextThreshold = GROWTH_THRESHOLDS.tree;
    } else {
      return 100; // Fully grown
    }
    
    const progress = Math.min(100, ((current - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
    return Math.max(0, progress);
  };

  const getNextStageInfo = (tree: Tree) => {
    if (tree.stage === 'seedling') {
      const needed = GROWTH_THRESHOLDS.sapling - tree.completedSessions;
      return needed > 0 ? `${needed} sessions to sapling 🌿` : 'Ready to grow! 🌿';
    } else if (tree.stage === 'sapling') {
      const needed = GROWTH_THRESHOLDS.tree - tree.completedSessions;
      return needed > 0 ? `${needed} sessions to tree 🌳` : 'Ready to grow! 🌳';
    }
    return 'Fully grown! 🌳';
  };

  const plantNewTree = () => {
    const newTree: Tree = {
      id: Date.now().toString(),
      stage: 'seedling',
      plantedAt: new Date(),
      completedSessions: 0,
      name: `Tree ${trees.length + 1}`
    };
    
    onTreeUpdate([...trees, newTree]);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tree Growth Overview */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4 text-green-800 dark:text-green-200">
          🌳 Your Forest Growth
        </h3>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl mb-2">🌱</div>
            <div className="text-sm font-medium text-green-700 dark:text-green-300">
              {trees.filter(t => t.stage === 'seedling').length} Seedlings
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🌿</div>
            <div className="text-sm font-medium text-green-700 dark:text-green-300">
              {trees.filter(t => t.stage === 'sapling').length} Saplings
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🌳</div>
            <div className="text-sm font-medium text-green-700 dark:text-green-300">
              {trees.filter(t => t.stage === 'tree').length} Trees
            </div>
          </div>
        </div>
        
        <button
          onClick={plantNewTree}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
        >
          🌱 Plant New Tree
        </button>
      </div>

      {/* Individual Trees */}
      <div className="grid gap-4">
        {trees.map((tree) => {
          const progress = getGrowthProgress(tree);
          const isAnimating = showGrowthAnimation === tree.id;
          
          return (
            <div
              key={tree.id}
              className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-2 transition-all duration-300 ${
                selectedTree?.id === tree.id ? 'border-green-500 shadow-green-200 dark:shadow-green-800' : 'border-gray-200 dark:border-gray-700'
              } ${isAnimating ? 'scale-105 shadow-xl' : ''}`}
              onClick={() => setSelectedTree(selectedTree?.id === tree.id ? null : tree)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`text-3xl ${TREE_COLORS[tree.stage]} ${TREE_ANIMATIONS[tree.stage]} ${isAnimating ? 'animate-bounce' : ''}`}>
                    {getTreeEmoji(tree.stage)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {tree.name || `Tree ${tree.id.slice(-4)}`}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {tree.stage} • {tree.completedSessions} sessions
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {Math.round(progress)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Growth
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      tree.stage === 'tree' ? 'bg-green-600' : 'bg-green-400'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {getNextStageInfo(tree)}
                </p>
              </div>
              
              {/* Expanded Details */}
              {selectedTree?.id === tree.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Planted:</span>
                    <span className="text-gray-900 dark:text-white">
                      {tree.plantedAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Sessions:</span>
                    <span className="text-gray-900 dark:text-white">
                      {tree.completedSessions}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Stage:</span>
                    <span className="text-gray-900 dark:text-white capitalize">
                      {tree.stage} {getTreeEmoji(tree.stage)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {trees.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Start Your Forest Journey
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Complete focus sessions to grow your virtual trees!
          </p>
          <button
            onClick={plantNewTree}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200"
          >
            🌱 Plant Your First Tree
          </button>
        </div>
      )}
    </div>
  );
}