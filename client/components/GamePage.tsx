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
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        userBestScore={userBestScore}
      />

      {currentView === "games" ? (
        <div className="pb-16">
          {/* Claymorphism Game Selection */}
          <div className="px-4 pt-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-full mb-6 bg-gradient-to-r from-purple-200 to-pink-200 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_8px_24px_rgba(0,0,0,0.1)] border border-purple-300/30">
                <span className="w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-lg"></span>
                <span className="text-sm font-semibold text-purple-800">
                  Choose Your Adventure
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent mb-4 clay-text-shadow">
                Choose Your Game
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 font-medium">
                Select a game to play and compete for the Hall of Fame
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Perfect Circle Game - Claymorphism Card */}
              <div
                className="group relative overflow-hidden rounded-[2rem] cursor-pointer transition-all duration-300 hover:scale-105"
                onClick={() => handleGameSelect("perfect_circle")}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 shadow-[0_16px_40px_rgba(0,0,0,0.15)] border border-blue-300/30"></div>
                <div className="relative h-80 p-8 bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-sm border border-white/50 rounded-[2rem] shadow-[inset_0_2px_4px_rgba(255,255,255,0.9)]">
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-300 to-purple-400 flex items-center justify-center mb-6 shadow-[0_8px_24px_rgba(0,0,0,0.15)] border border-blue-200/50 group-hover:animate-clay-float">
                      <span className="text-4xl">⭕ </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-slate-800 clay-text-shadow">
                      Perfect Circle
                    </h3>
                    <p className="text-slate-600 mb-6 text-base leading-relaxed">
                      Draw the most perfect circle you can! Test your precision
                      and steady hand.
                    </p>
                    <div className="px-6 py-3 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-2xl text-sm font-bold shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-blue-300/30 group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)] transition-all duration-200">
                      Play Now
                    </div>
                  </div>
                </div>
              </div>

              {/* Balloon Pop Game - Claymorphism Card */}
              <div
                className="group relative overflow-hidden rounded-[2rem] cursor-pointer transition-all duration-300 hover:scale-105"
                onClick={() => handleGameSelect("balloon_pop")}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-200 via-pink-200 to-orange-200 shadow-[0_16px_40px_rgba(0,0,0,0.15)] border border-red-300/30"></div>
                <div className="relative h-80 p-8 bg-gradient-to-br from-white/80 to-red-50/80 backdrop-blur-sm border border-white/50 rounded-[2rem] shadow-[inset_0_2px_4px_rgba(255,255,255,0.9)]">
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-300 to-pink-400 flex items-center justify-center mb-6 shadow-[0_8px_24px_rgba(0,0,0,0.15)] border border-red-200/50 group-hover:animate-clay-bounce">
                      <span className="text-4xl">🎈</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-slate-800 clay-text-shadow">
                      Balloon Pop
                    </h3>
                    <p className="text-slate-600 mb-6 text-base leading-relaxed">
                      Pop fast-falling balloons! Test your speed and reflexes in
                      this exciting challenge.
                    </p>
                    <div className="px-6 py-3 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-2xl text-sm font-bold shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-red-300/30 group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)] transition-all duration-200">
                      Play Now
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hall of Fame Button - Claymorphism */}
          <div className="px-4 mt-12 text-center">
            <button
              onClick={() => setCurrentView("leaderboard")}
              className="px-10 py-5 bg-gradient-to-r from-yellow-300 to-orange-400 text-white rounded-[1.5rem] font-bold text-xl hover:from-yellow-400 hover:to-orange-500 transition-all duration-200 shadow-[0_12px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.25)] border border-yellow-200/50 hover:scale-105"
            >
              🏆 View Hall of Fame
            </button>
          </div>

          {/* Player Profile Card - Claymorphism */}
          <div className="px-4 mt-12">
            <UserNameInput />
          </div>
        </div>
      ) : currentView === "perfect_circle" ? (
        <div className="pb-16">
          <div className="px-4 pt-6">
            <div className="mb-6">
              <button
                onClick={() => setCurrentView("games")}
                className="flex items-center space-x-3 text-purple-600 hover:text-purple-700 transition-colors px-4 py-2 rounded-xl bg-gradient-to-r from-white/80 to-purple-100/80 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/50 hover:shadow-[0_6px_16px_rgba(0,0,0,0.15)]"
              >
                <span className="text-lg">←</span>
                <span className="font-semibold">Back to Games</span>
              </button>
            </div>
            <PerfectCircle
              onShowLeaderboard={() => showLeaderboardForGame("perfect_circle")}
            />
          </div>
        </div>
      ) : currentView === "balloon_pop" ? (
        <div className="pb-16">
          <div className="px-4 pt-6">
            <div className="mb-6">
              <button
                onClick={() => setCurrentView("games")}
                className="flex items-center space-x-3 text-red-600 hover:text-red-700 transition-colors px-4 py-2 rounded-xl bg-gradient-to-r from-white/80 to-red-100/80 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/50 hover:shadow-[0_6px_16px_rgba(0,0,0,0.15)]"
              >
                <span className="text-lg">←</span>
                <span className="font-semibold">Back to Games</span>
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
          <div className="pt-6">
            <Leaderboard gameFilter={leaderboardFilter} />
          </div>

          {/* Back to Games Button - Claymorphism */}
          <div className="flex justify-center mt-12 px-4">
            <button
              onClick={() => setCurrentView("games")}
              className="w-full max-w-md px-8 py-5 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-[1.5rem] font-bold text-lg hover:from-purple-500 hover:to-pink-600 transition-all duration-200 shadow-[0_12px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.25)] border border-purple-300/30 hover:scale-105"
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

      {/* Made In India Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <div className="flex justify-center pb-4">
          <div className="px-6 py-3 bg-gradient-to-r from-orange-200 via-white to-green-200 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.15)] border border-orange-300/30 backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-sm font-semibold">
              <span className="text-orange-600">Made In India</span>
              <span className="text-slate-600">By</span>
              <span className="text-purple-600 font-bold">NNC</span>
              <span className="text-slate-600">With Love</span>
              <span className="text-red-500 text-base animate-pulse">💖😘</span>
            </div>
          </div>
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
