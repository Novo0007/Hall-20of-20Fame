import React, { useState } from 'react';
import { PerfectCircle } from './PerfectCircle';
import { Leaderboard } from './Leaderboard';
import { UserNameInput } from './UserNameInput';
import { UserProvider } from '../contexts/UserContext';

type View = 'game' | 'leaderboard';

export const GamePage: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('game');

  return (
    <UserProvider>
      <div className="min-h-screen bg-background">
        {currentView === 'game' ? (
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md mb-6">
              <UserNameInput />
            </div>
            
            <PerfectCircle onShowLeaderboard={() => setCurrentView('leaderboard')} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md mb-6">
              <UserNameInput />
            </div>
            
            <Leaderboard />
            
            <div className="mt-6">
              <button
                onClick={() => setCurrentView('game')}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                🎯 Back to Game
              </button>
            </div>
          </div>
        )}
        
        {/* Database Connection Status */}
        <div className="fixed bottom-4 right-4 text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-2">
          {import.meta.env.VITE_SUPABASE_URL ? (
            <span className="text-green-400">● Connected to Supabase</span>
          ) : (
            <span className="text-orange-400">⚠ Configure Supabase to save scores</span>
          )}
        </div>
      </div>
    </UserProvider>
  );
};
