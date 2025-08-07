import React, { useState } from "react";
import { PerfectCircle } from "./PerfectCircle";
import { BalloonGame } from "./BalloonGame";
import { Leaderboard } from "./Leaderboard";
import { UserNameInput } from "./UserNameInput";
import { Header } from "./Header";
import { UserProvider, useUser } from "../contexts/UserContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { isSupabaseEnabled } from "../lib/supabase";

type View = "games" | "perfect_circle" | "balloon_pop" | "leaderboard";
type GameType = "perfect_circle" | "balloon_pop";

const GameContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>("games");
  const [currentGame, setCurrentGame] = useState<GameType>("perfect_circle");
  const [leaderboardFilter, setLeaderboardFilter] = useState<string>("all");
  const { userBestScore } = useUser();
  const { isDark } = useTheme();

  const handleGameSelect = (game: GameType) => {
    setCurrentGame(game);
    setCurrentView(game);
  };

  const showLeaderboardForGame = (gameType: string) => {
    setLeaderboardFilter(gameType);
    setCurrentView("leaderboard");
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50"
      }`}
    >
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        userBestScore={userBestScore}
      />

      {currentView === "games" ? (
        <div className="pb-16">
          {/* Game Selection */}
          <div className="px-4 pt-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-2">
                Choose Your Game
              </h2>
              <p className={`text-sm sm:text-base ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Select a game to play and compete for the Hall of Fame
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Perfect Circle Game */}
              <div
                className={`relative overflow-hidden rounded-3xl border-2 border-transparent bg-gradient-to-br p-1 hover:scale-105 transition-all duration-300 cursor-pointer ${
                  isDark
                    ? "from-blue-500 via-purple-500 to-pink-500"
                    : "from-blue-400 via-purple-400 to-pink-400"
                }`}
                onClick={() => handleGameSelect("perfect_circle")}
              >
                <div
                  className={`relative h-64 rounded-2xl p-6 ${
                    isDark ? "bg-gray-900" : "bg-white"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-6xl mb-4">⭕</div>
                    <h3 className="text-xl font-bold mb-2">Perfect Circle</h3>
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Draw the most perfect circle you can! Test your precision and steady hand.
                    </p>
                    <div className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-medium">
                      Play Now
                    </div>
                  </div>
                </div>
              </div>

              {/* Balloon Pop Game */}
              <div
                className={`relative overflow-hidden rounded-3xl border-2 border-transparent bg-gradient-to-br p-1 hover:scale-105 transition-all duration-300 cursor-pointer ${
                  isDark
                    ? "from-red-500 via-pink-500 to-purple-500"
                    : "from-red-400 via-pink-400 to-purple-400"
                }`}
                onClick={() => handleGameSelect("balloon_pop")}
              >
                <div
                  className={`relative h-64 rounded-2xl p-6 ${
                    isDark ? "bg-gray-900" : "bg-white"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-6xl mb-4">🎈</div>
                    <h3 className="text-xl font-bold mb-2">Balloon Pop</h3>
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Pop as many balloons as you can in 30 seconds! Test your speed and reflexes.
                    </p>
                    <div className="mt-4 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full text-sm font-medium">
                      Play Now
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hall of Fame Button */}
          <div className="px-4 mt-8 text-center">
            <button
              onClick={() => setCurrentView("leaderboard")}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl font-semibold text-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              🏆 View Hall of Fame
            </button>
          </div>

          {/* Player Profile Card */}
          <div className="px-4 mt-8">
            <UserNameInput />
          </div>
        </div>
      ) : currentView === "perfect_circle" ? (
        <div className="pb-16">
          <div className="px-4 pt-4">
            <div className="mb-4">
              <button
                onClick={() => setCurrentView("games")}
                className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
              >
                <span>←</span>
                <span>Back to Games</span>
              </button>
            </div>
            <PerfectCircle
              onShowLeaderboard={() => showLeaderboardForGame("perfect_circle")}
            />
          </div>
        </div>
      ) : currentView === "balloon_pop" ? (
        <div className="pb-16">
          <div className="px-4 pt-4">
            <div className="mb-4">
              <button
                onClick={() => setCurrentView("games")}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <span>←</span>
                <span>Back to Games</span>
              </button>
            </div>
            <BalloonGame
              onShowLeaderboard={() => showLeaderboardForGame("balloon_pop")}
            />
          </div>
        </div>
      ) : (
        <div className="pb-16">
          {/* Leaderboard View */}
          <div className="pt-4">
            <Leaderboard gameFilter={leaderboardFilter} />
          </div>

          {/* Back to Games Button */}
          <div className="flex justify-center mt-8 px-4">
            <button
              onClick={() => setCurrentView("games")}
              className="w-full max-w-md px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              🎯 Back to Games
            </button>
          </div>

          {/* Player Profile in Leaderboard View */}
          <div className="px-4 mt-8">
            <UserNameInput />
          </div>
        </div>
      )}
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
