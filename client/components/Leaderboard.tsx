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
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">🏆 Leaderboard</h2>
          <button
            onClick={loadLeaderboard}
            disabled={isLoading}
            className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 disabled:opacity-50"
          >
            {isLoading ? '⟳' : '🔄'}
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin text-2xl mb-2">⭕</div>
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        ) : scores.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">No scores yet!</p>
            <p className="text-sm text-muted-foreground">Be the first to set a record</p>
          </div>
        ) : (
          <div className="space-y-2">
            {scores.map((score, index) => {
              const position = index + 1;
              const isCurrentUser = user && score.user_id === user.id;
              
              return (
                <div
                  key={score.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isCurrentUser 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'bg-secondary/50 hover:bg-secondary/70'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-medium w-8 text-center">
                      {getPositionMedal(position)}
                    </span>
                    <div>
                      <p className={`font-medium ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                        {score.user?.name || 'Unknown'}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(score.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(score.score)}`}>
                      {score.score.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Only your highest score is shown • Updated in real-time</p>
        </div>
      </div>
    </div>
  );
};
