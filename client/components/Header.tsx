import React from "react";
import { useTheme } from "../contexts/ThemeContext";

interface HeaderProps {
  currentView: "games" | "perfect_circle" | "balloon_pop" | "leaderboard";
  onNavigate: (
    view: "games" | "perfect_circle" | "balloon_pop" | "leaderboard",
  ) => void;
  userBestScore: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  userBestScore,
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200">
      {/* Claymorphism Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 192, 203, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(147, 197, 253, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 50% 50%, rgba(196, 181, 253, 0.3) 0%, transparent 50%)`,
          }}
        />
      </div>

      <div className="relative px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo/Brand with Claymorphism */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_8px_24px_rgba(0,0,0,0.15)] bg-gradient-to-br from-yellow-300 to-orange-400 border border-yellow-200/50">
              <span className="text-white text-xl sm:text-2xl font-bold drop-shadow-sm">
                ⭕
              </span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 clay-text-shadow">
                Perfect Circle: Hall of Fame
              </h1>
              <p className="text-purple-700 text-xs sm:text-sm font-medium hidden sm:block">
                Master the Art of Precision
              </p>
            </div>
          </div>

          {/* Navigation with Claymorphism */}
          <nav className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => onNavigate("games")}
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 text-sm shadow-[0_4px_12px_rgba(0,0,0,0.1)] border ${
                currentView === "games" ||
                currentView === "perfect_circle" ||
                currentView === "balloon_pop"
                  ? "bg-gradient-to-r from-white to-pink-50 text-slate-800 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_8px_24px_rgba(0,0,0,0.2)] border-white/50"
                  : "bg-gradient-to-r from-white/70 to-purple-100/70 text-slate-700 hover:bg-gradient-to-r hover:from-white hover:to-pink-100 border-white/30"
              }`}
            >
              <span className="hidden sm:inline">🎯 Games</span>
              <span className="sm:hidden text-lg">🎯</span>
            </button>
            <button
              onClick={() => onNavigate("leaderboard")}
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 text-sm shadow-[0_4px_12px_rgba(0,0,0,0.1)] border ${
                currentView === "leaderboard"
                  ? "bg-gradient-to-r from-white to-yellow-50 text-slate-800 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_8px_24px_rgba(0,0,0,0.2)] border-white/50"
                  : "bg-gradient-to-r from-white/70 to-purple-100/70 text-slate-700 hover:bg-gradient-to-r hover:from-white hover:to-yellow-100 border-white/30"
              }`}
            >
              <span className="hidden sm:inline">🏆 Hall of Fame</span>
              <span className="sm:hidden text-lg">🏆</span>
            </button>

            {/* Dark Mode Toggle with Claymorphism */}
            <button
              onClick={toggleTheme}
              className="px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-white/70 to-blue-100/70 text-slate-700 hover:bg-gradient-to-r hover:from-white hover:to-blue-100 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/30"
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              <span className="text-lg">{isDark ? "☀️" : "🌙"}</span>
            </button>
          </nav>

          {/* User Stats with Claymorphism */}
          {userBestScore > 0 && (
            <div className="hidden lg:flex items-center space-x-3 bg-gradient-to-r from-white/80 to-purple-100/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_8px_24px_rgba(0,0,0,0.15)] border border-white/30">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
                <span className="text-white text-sm font-bold">🎯</span>
              </div>
              <div>
                <div className="text-purple-700 text-xs font-medium">
                  Personal Best
                </div>
                <div className="text-yellow-600 font-bold text-lg clay-text-shadow">
                  {userBestScore.toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom gradient border */}
      <div className="h-1 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 shadow-[0_2px_8px_rgba(0,0,0,0.1)]"></div>
    </header>
  );
};
