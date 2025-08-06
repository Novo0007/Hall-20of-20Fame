import React, { useState } from 'react';
import { PerfectCircle } from './PerfectCircle';
import { Leaderboard } from './Leaderboard';
import { UserNameInput } from './UserNameInput';
import { Header } from './Header';
import { UserProvider, useUser } from '../contexts/UserContext';
import { isSupabaseEnabled } from '../lib/supabase';

type View = 'game' | 'leaderboard';

const GameContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('game');
  const { userBestScore } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        userBestScore={userBestScore}
      />

      {currentView === 'game' ? (
        <div className="pt-8">
          {/* User Name Input */}
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-md px-4">
              <UserNameInput />
            </div>
          </div>

          <PerfectCircle onShowLeaderboard={() => setCurrentView('leaderboard')} />
        </div>
      ) : (
        <div className="pt-8 pb-16">
          {/* User Name Input */}
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-md px-4">
              <UserNameInput />
            </div>
          </div>

          <Leaderboard />

          <div className="flex justify-center mt-12">
            <button
              onClick={() => setCurrentView('game')}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              🎯 Back to Game
            </button>
          </div>
        </div>
      )}

      {/* Database Connection Status */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className={`px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-sm transition-all duration-200 ${
          isSupabaseEnabled
            ? 'bg-green-500/90 text-white shadow-lg'
            : 'bg-orange-500/90 text-white shadow-lg'
        }`}>
          {isSupabaseEnabled ? (
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span>Database Connected</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              <span>Offline Mode</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const GamePage: React.FC = () => {
  return (
    <UserProvider>
      <GameContent />
    </UserProvider>
  );
};
