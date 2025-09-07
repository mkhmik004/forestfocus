'use client';

import React, { useState, useEffect } from 'react';

interface Tree {
  id: string;
  stage: 'seedling' | 'sapling' | 'tree';
  plantedAt: Date;
  completedSessions: number;
  name?: string;
}

interface UserStats {
  totalSessions: number;
  leafCoins: number;
  treesPlanted: number;
  currentStreak: number;
}

interface SessionData {
  id: string;
  date: Date;
  duration: number; // in minutes
  type: 'focus' | 'shortBreak' | 'longBreak';
  completed: boolean;
}

interface PersonalForestDashboardProps {
  trees: Tree[];
  userStats: UserStats;
  className?: string;
}

export default function PersonalForestDashboard({ trees, userStats, className = '' }: PersonalForestDashboardProps) {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [showDetailedStats, setShowDetailedStats] = useState(false);

  // Load session data from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('forest-sessions');
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      const sessionsWithDates = parsed.map((s: { id: string; date: string; duration: number; type: string; completed: boolean }) => ({
        ...s,
        date: new Date(s.date)
      }));
      setSessions(sessionsWithDates);
    }
  }, []);

  // Save session data whenever it changes
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('forest-sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const getFilteredSessions = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (selectedTimeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }
    
    return sessions.filter(session => session.date >= startDate && session.completed);
  };

  const getProductivityStats = () => {
    const filteredSessions = getFilteredSessions();
    const focusSessions = filteredSessions.filter(s => s.type === 'focus');
    
    const totalFocusTime = focusSessions.reduce((sum, s) => sum + s.duration, 0);
    const averageSessionLength = focusSessions.length > 0 ? totalFocusTime / focusSessions.length : 0;
    const dailyAverage = focusSessions.length / (selectedTimeRange === 'week' ? 7 : selectedTimeRange === 'month' ? 30 : 365);
    
    return {
      totalSessions: focusSessions.length,
      totalFocusTime,
      averageSessionLength,
      dailyAverage
    };
  };

  const getWeeklyProgress = () => {
    const now = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const daySessions = sessions.filter(s => 
        s.date >= dayStart && s.date < dayEnd && s.type === 'focus' && s.completed
      );
      
      weekData.push({
        date: dayStart,
        sessions: daySessions.length,
        focusTime: daySessions.reduce((sum, s) => sum + s.duration, 0)
      });
    }
    
    return weekData;
  };

  const getTreeGrowthStats = () => {
    const seedlings = trees.filter(t => t.stage === 'seedling').length;
    const saplings = trees.filter(t => t.stage === 'sapling').length;
    const fullTrees = trees.filter(t => t.stage === 'tree').length;
    
    const totalTrees = trees.length;
    const growthRate = totalTrees > 0 ? ((saplings + fullTrees) / totalTrees) * 100 : 0;
    
    return {
      seedlings,
      saplings,
      fullTrees,
      totalTrees,
      growthRate
    };
  };

  const getMostProductiveDay = () => {
    const dayStats = new Map<string, number>();
    
    sessions.forEach(session => {
      if (session.type === 'focus' && session.completed) {
        const dayKey = session.date.toLocaleDateString('en-US', { weekday: 'long' });
        dayStats.set(dayKey, (dayStats.get(dayKey) || 0) + 1);
      }
    });
    
    let maxDay = '';
    let maxSessions = 0;
    
    dayStats.forEach((sessions, day) => {
      if (sessions > maxSessions) {
        maxSessions = sessions;
        maxDay = day;
      }
    });
    
    return { day: maxDay, sessions: maxSessions };
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const productivityStats = getProductivityStats();
  const weeklyProgress = getWeeklyProgress();
  const treeStats = getTreeGrowthStats();
  const mostProductiveDay = getMostProductiveDay();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🌳 Personal Forest Dashboard
        </h2>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as 'week' | 'month' | 'year')}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
          
          <button
            onClick={() => setShowDetailedStats(!showDetailedStats)}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {showDetailedStats ? 'Simple View' : 'Detailed View'}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {productivityStats.totalSessions}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">
            Focus Sessions
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {formatTime(productivityStats.totalFocusTime)}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">
            Focus Time
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {treeStats.totalTrees}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">
            Trees Planted
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
            {userStats.currentStreak}
          </div>
          <div className="text-sm text-yellow-600 dark:text-yellow-400">
            Day Streak
          </div>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          📊 Weekly Progress
        </h3>
        
        <div className="flex items-end justify-between h-32 gap-2">
          {weeklyProgress.map((day, index) => {
            const maxSessions = Math.max(...weeklyProgress.map(d => d.sessions));
            const height = maxSessions > 0 ? (day.sessions / maxSessions) * 100 : 0;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all duration-300 hover:from-green-600 hover:to-green-500"
                    style={{ height: `${height}%`, minHeight: day.sessions > 0 ? '8px' : '2px' }}
                  ></div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {day.sessions}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tree Growth Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          🌳 Forest Growth Overview
        </h3>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl mb-2">🌱</div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {treeStats.seedlings}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Seedlings</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-2">🌿</div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {treeStats.saplings}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Saplings</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-2">🌳</div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {treeStats.fullTrees}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Full Trees</div>
          </div>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Growth Rate:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {treeStats.growthRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      {showDetailedStats && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Productivity Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              🎯 Productivity Insights
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Average Session:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatTime(Math.round(productivityStats.averageSessionLength))}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Daily Average:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {productivityStats.dailyAverage.toFixed(1)} sessions
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Most Productive Day:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {mostProductiveDay.day || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total LeafCoins:</span>
                <span className="font-medium text-yellow-600 dark:text-yellow-400">
                  {userStats.leafCoins} 🍃
                </span>
              </div>
            </div>
          </div>
          
          {/* Recent Trees */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              🌱 Recent Trees
            </h3>
            
            {trees.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🌱</div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No trees planted yet. Complete focus sessions to grow your forest!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {trees.slice(-5).reverse().map((tree) => (
                  <div key={tree.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {tree.stage === 'seedling' ? '🌱' : tree.stage === 'sapling' ? '🌿' : '🌳'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {tree.name || `Tree ${tree.id.slice(-4)}`}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {tree.completedSessions} sessions • {tree.plantedAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {tree.stage}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}