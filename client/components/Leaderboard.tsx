import React, { useState, useEffect } from 'react';
import { Database, Score } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';

export const Leaderboard: React.FC = () => {
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const leaderboard = await Database.getLeaderboard(10);
      setScores(leaderboard);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPositionMedal = (position: number): string => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${position}`;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2 rounded-full mb-6">
          <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
          <span className="text-slate-700 text-sm font-medium">Global Competition</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
          🏆 Leaderboard
        </h1>
        <p className="text-slate-600 text-lg md:text-xl">
          Top 10 Perfect Circle Masters
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">👑</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Hall of Fame</h2>
                <p className="text-orange-100">Highest scoring players worldwide</p>
              </div>
            </div>
            <button
              onClick={loadLeaderboard}
              disabled={isLoading}
              className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 disabled:opacity-50 transition-all duration-200 backdrop-blur-sm"
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Loading</span>
                </span>
              ) : (
                '🔄 Refresh'
              )}
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
                <span className="text-white text-2xl">⭕</span>
              </div>
              <p className="text-slate-600 font-medium">Loading global rankings...</p>
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-slate-500 text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No champions yet!</h3>
              <p className="text-slate-600 mb-4">Be the first to claim the throne</p>
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full">
                <span className="text-purple-600">👑</span>
                <span className="text-purple-800 font-medium">First place awaits you</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {scores.slice(0, 10).map((score, index) => {
                const position = index + 1;
                const isCurrentUser = user && score.user_id === user.id;
                const isPodium = position <= 3;

                return (
                  <div
                    key={score.id}
                    className={`relative overflow-hidden rounded-2xl transition-all duration-200 hover:scale-[1.02] ${
                      isPodium
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-lg'
                        : isCurrentUser
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 shadow-md'
                        : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isPodium && (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 transform rotate-12 translate-x-4 -translate-y-4 rounded-lg opacity-20"></div>
                    )}

                    <div className="flex items-center justify-between p-6">
                      <div className="flex items-center space-x-6">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg ${
                          position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                          position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                          position === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {position <= 3 ? getPositionMedal(position) : `#${position}`}
                        </div>

                        <div>
                          <div className="flex items-center space-x-3">
                            <p className={`text-lg font-semibold ${
                              isPodium ? 'text-orange-900' :
                              isCurrentUser ? 'text-purple-900' :
                              'text-slate-800'
                            }`}>
                              {score.user?.name || 'Unknown Player'}
                            </p>
                            {isCurrentUser && (
                              <span className="inline-flex items-center space-x-1 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                <span>👤</span>
                                <span>You</span>
                              </span>
                            )}
                            {isPodium && (
                              <span className="inline-flex items-center space-x-1 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                <span>🏆</span>
                                <span>Champion</span>
                              </span>
                            )}
                          </div>
                          <p className="text-slate-500 text-sm">
                            {new Date(score.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-3xl font-bold mb-1 ${getScoreColor(score.score)}`}>
                          {score.score.toFixed(1)}%
                        </div>
                        <div className="text-slate-500 text-sm">
                          {score.score >= 90 ? 'Perfect' :
                           score.score >= 70 ? 'Excellent' :
                           score.score >= 50 ? 'Good' : 'Fair'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-slate-600">
            <div className="flex items-center space-x-4 mb-2 sm:mb-0">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Live rankings</span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span>Best score per player</span>
            </div>
            <div className="text-slate-500">
              Updated in real-time
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
