import React, { useState } from 'react';
import { PerfectCircle } from './PerfectCircle';
import { Leaderboard } from './Leaderboard';
import { UserNameInput } from './UserNameInput';
import { Header } from './Header';
import { UserProvider, useUser } from '../contexts/UserContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { isSupabaseEnabled } from '../lib/supabase';

type View = 'game' | 'leaderboard';

const GameContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('game');
  const { userBestScore } = useUser();
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50'
    }`}>
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        userBestScore={userBestScore}
      />

      {currentView === 'game' ? (
        <div className="pb-16">
          {/* 1. Canvas First - Main Game Area */}
          <div className="px-4 pt-4">
            <PerfectCircle onShowLeaderboard={() => setCurrentView('leaderboard')} />
          </div>

          {/* 2. Quick Leaderboard Preview */}
          <div className="px-4 mt-8">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                    🏆
                  </span>
                  Quick Standings
                </h3>
                <button
                  onClick={() => setCurrentView('leaderboard')}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 text-sm"
                >
                  View All
                </button>
              </div>
              <div className="text-center py-4 text-slate-500">
                <p className="text-sm">Tap "View All" to see the full leaderboard</p>
              </div>
            </div>
          </div>

          {/* 3. Player Profile Card - Bottom */}
          <div className="px-4 mt-8">
            <UserNameInput />
          </div>
        </div>
      ) : (
        <div className="pb-16">
          {/* Leaderboard View */}
          <div className="pt-4">
            <Leaderboard />
          </div>

          {/* Back to Game Button */}
          <div className="flex justify-center mt-8 px-4">
            <button
              onClick={() => setCurrentView('game')}
              className="w-full max-w-md px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              🎯 Back to Game
            </button>
          </div>

          {/* Player Profile in Leaderboard View */}
          <div className="px-4 mt-8">
            <UserNameInput />
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
    <ThemeProvider>
      <UserProvider>
        <GameContent />
      </UserProvider>
    </ThemeProvider>
  );
};
