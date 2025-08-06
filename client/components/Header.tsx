import React from 'react';

interface HeaderProps {
  currentView: 'game' | 'leaderboard';
  onNavigate: (view: 'game' | 'leaderboard') => void;
  userBestScore: number;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, userBestScore }) => {
  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900">
      {/* Background pattern */}
      <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"}></div>
      
      <div className="relative px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl sm:text-2xl font-bold">⭕</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Perfect Circle</h1>
              <p className="text-purple-200 text-xs sm:text-sm">Master the Art of Precision</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => onNavigate('game')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentView === 'game'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <span className="hidden sm:inline">🎯 Game</span>
              <span className="sm:hidden">🎯</span>
            </button>
            <button
              onClick={() => onNavigate('leaderboard')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentView === 'leaderboard'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <span className="hidden sm:inline">🏆 Leaderboard</span>
              <span className="sm:hidden">🏆</span>
            </button>
          </nav>

          {/* User Stats */}
          {userBestScore > 0 && (
            <div className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <span className="text-purple-200 text-sm">Personal Best:</span>
              <span className="text-yellow-400 font-bold text-lg">{userBestScore.toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
