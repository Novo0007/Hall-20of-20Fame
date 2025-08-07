import React, { useState, useEffect } from "react";
import { Database, Score } from "../lib/supabase";
import { useUser } from "../contexts/UserContext";
import { useTheme } from "../contexts/ThemeContext";

interface LeaderboardProps {
  gameFilter?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ gameFilter }) => {
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string>(gameFilter || "all");
  const { user } = useUser();
  const { isDark } = useTheme();

  // Update selectedGame when gameFilter prop changes
  useEffect(() => {
    if (gameFilter) {
      setSelectedGame(gameFilter);
    }
  }, [gameFilter]);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedGame]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const gameType = selectedGame === "all" ? undefined : selectedGame;
      const leaderboard = await Database.getLeaderboard(10, gameType);
      setScores(leaderboard);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPositionMedal = (position: number): string => {
    switch (position) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${position}`;
    }
  };

  const getScoreColor = (score: number, gameType: string): string => {
    if (gameType === "balloon_pop") {
      if (score >= 50) return "text-green-500";
      if (score >= 30) return "text-yellow-500";
      if (score >= 15) return "text-orange-500";
      return "text-red-500";
    } else {
      if (score >= 90) return "text-green-500";
      if (score >= 70) return "text-yellow-500";
      if (score >= 50) return "text-orange-500";
      return "text-red-500";
    }
  };

  const getGameDisplayName = (gameType: string): string => {
    switch (gameType) {
      case "perfect_circle":
        return "Perfect Circle";
      case "balloon_pop":
        return "Balloon Pop";
      default:
        return gameType;
    }
  };

  const getGameEmoji = (gameType: string): string => {
    switch (gameType) {
      case "perfect_circle":
        return "⭕";
      case "balloon_pop":
        return "🎈";
      default:
        return "🎯";
    }
  };

  const getScoreUnit = (gameType: string): string => {
    switch (gameType) {
      case "perfect_circle":
        return "%";
      case "balloon_pop":
        return " balloons";
      default:
        return "";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Claymorphism Header */}
      <div className="text-center mb-8 px-4">
        <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-full mb-6 bg-gradient-to-r from-yellow-200 to-orange-200 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_8px_24px_rgba(0,0,0,0.1)] border border-yellow-300/30">
          <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse shadow-lg"></span>
          <span className="text-sm font-semibold text-orange-800">
            Global Competition
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4 clay-text-shadow">
          🏆 Hall of Fame
        </h1>
        <p className="text-base sm:text-lg text-slate-600 font-medium">
          Top 10 Champions Across All Games
        </p>
      </div>

      <div className="rounded-[2rem] shadow-[0_16px_40px_rgba(0,0,0,0.15)] border border-orange-200/50 overflow-hidden transition-colors duration-300 bg-gradient-to-br from-white to-orange-50">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_8px_24px_rgba(0,0,0,0.2)] bg-gradient-to-br from-white/30 to-white/10 border border-white/20">
                <span className="text-white text-2xl sm:text-3xl">👑</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white clay-text-shadow">
                  Hall of Fame
                </h2>
                <p className="text-orange-100 text-sm sm:text-base font-medium">
                  Top scoring champions
                </p>
              </div>
            </div>
            <button
              onClick={loadLeaderboard}
              disabled={isLoading}
              className="px-4 py-3 bg-white/20 text-white rounded-2xl hover:bg-white/30 disabled:opacity-50 transition-all duration-200 backdrop-blur-sm text-sm font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/20"
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span className="hidden sm:inline">Loading</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <span>🔄</span>
                  <span className="hidden sm:inline">Refresh</span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Game Filter with Claymorphism */}
        <div className="px-6 py-5 bg-gradient-to-r from-orange-100 to-yellow-100 border-b border-orange-200/50">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedGame("all")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                selectedGame === "all"
                  ? "bg-gradient-to-r from-white to-orange-50 text-orange-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_6px_16px_rgba(0,0,0,0.1)] border border-white/50"
                  : "bg-white/40 text-orange-600 hover:bg-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/30"
              }`}
            >
              🏆 All Games
            </button>
            <button
              onClick={() => setSelectedGame("perfect_circle")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                selectedGame === "perfect_circle"
                  ? "bg-gradient-to-r from-white to-blue-50 text-blue-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_6px_16px_rgba(0,0,0,0.1)] border border-white/50"
                  : "bg-white/40 text-orange-600 hover:bg-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/30"
              }`}
            >
              ⭕ Perfect Circle
            </button>
            <button
              onClick={() => setSelectedGame("balloon_pop")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                selectedGame === "balloon_pop"
                  ? "bg-gradient-to-r from-white to-red-50 text-red-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_6px_16px_rgba(0,0,0,0.1)] border border-white/50"
                  : "bg-white/40 text-orange-600 hover:bg-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/30"
              }`}
            >
              🎈 Balloon Pop
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center mb-6 mx-auto animate-clay-pulse shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
                <span className="text-white text-3xl">⭕</span>
              </div>
              <p className="text-slate-600 font-semibold text-lg">
                Loading global rankings...
              </p>
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mb-8 mx-auto shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
                <span className="text-slate-500 text-4xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                No champions yet!
              </h3>
              <p className="text-slate-600 mb-6 text-lg">
                Be the first to claim the throne
              </p>
              <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-200 to-pink-200 px-6 py-3 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.1)] border border-purple-300/30">
                <span className="text-purple-600 text-xl">👑</span>
                <span className="text-purple-800 font-semibold">
                  First place awaits you
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {scores.slice(0, 10).map((score, index) => {
                const position = index + 1;
                const isCurrentUser = user && score.user_id === user.id;
                const isPodium = position <= 3;

                return (
                  <div
                    key={score.id}
                    className={`relative overflow-hidden rounded-[1.5rem] transition-all duration-200 hover:scale-[1.02] ${
                      isPodium
                        ? "bg-gradient-to-r from-yellow-100 to-orange-100 shadow-[0_12px_32px_rgba(0,0,0,0.15)] border-2 border-yellow-300/50"
                        : isCurrentUser
                          ? "bg-gradient-to-r from-purple-100 to-pink-100 shadow-[0_8px_24px_rgba(0,0,0,0.12)] border-2 border-purple-300/50"
                          : "bg-gradient-to-r from-slate-50 to-white shadow-[0_6px_20px_rgba(0,0,0,0.08)] border border-slate-200/50 hover:bg-gradient-to-r hover:from-slate-100 hover:to-white"
                    }`}
                  >
                    {isPodium && (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 transform rotate-12 translate-x-4 -translate-y-4 rounded-lg opacity-20 shadow-lg"></div>
                    )}

                    <div className="flex items-center justify-between p-6 sm:p-8">
                      <div className="flex items-center space-x-4 sm:space-x-6">
                        <div
                          className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl font-bold text-base sm:text-xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] border ${
                            position === 1
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white border-yellow-300/50"
                              : position === 2
                                ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white border-gray-200/50"
                                : position === 3
                                  ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white border-orange-300/50"
                                  : "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-700 border-slate-300/50"
                          }`}
                        >
                          {position <= 3
                            ? getPositionMedal(position)
                            : `#${position}`}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <p
                              className={`text-sm sm:text-lg font-bold truncate ${
                                isPodium
                                  ? "text-orange-900"
                                  : isCurrentUser
                                    ? "text-purple-900"
                                    : "text-slate-800"
                              }`}
                            >
                              {score.user?.name || "Unknown Player"}
                            </p>
                            {score.user?.country_flag && (
                              <div className="flex items-center space-x-2 shrink-0">
                                <span
                                  className="text-xl bg-white/90 rounded-full w-10 h-10 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/50"
                                  title={score.user.country_name}
                                >
                                  {score.user.country_flag}
                                </span>
                                <span className="text-sm font-semibold text-slate-600">
                                  {score.user.country_name}
                                </span>
                              </div>
                            )}
                            {isCurrentUser && (
                              <span className="inline-flex items-center bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-blue-300/30">
                              <span>{getGameEmoji(score.game_type)}</span>
                              <span>{getGameDisplayName(score.game_type)}</span>
                            </span>
                          </div>
                          {isPodium && (
                            <span className="inline-flex items-center space-x-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold mt-2 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                              <span>🏆</span>
                              <span className="hidden sm:inline">Champion</span>
                            </span>
                          )}
                          <p className="text-slate-500 text-xs mt-1">
                            {new Date(score.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div
                          className={`text-xl sm:text-3xl font-bold mb-2 clay-text-shadow ${getScoreColor(score.score, score.game_type)}`}
                        >
                          {score.game_type === "balloon_pop"
                            ? Math.floor(score.score)
                            : score.score.toFixed(1)}
                          {getScoreUnit(score.game_type)}
                        </div>
                        <div className="text-slate-500 text-xs sm:text-sm font-semibold">
                          {score.game_type === "balloon_pop"
                            ? score.score >= 50
                              ? "Amazing"
                              : score.score >= 30
                                ? "Great"
                                : score.score >= 15
                                  ? "Good"
                                  : "Try Again"
                            : score.score >= 90
                              ? "Perfect"
                              : score.score >= 70
                                ? "Great"
                                : score.score >= 50
                                  ? "Good"
                                  : "Fair"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-slate-100 to-orange-50 px-6 sm:px-8 py-5 border-t border-slate-200/50">
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600">
            <div className="flex items-center space-x-4 mb-2 sm:mb-0">
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="font-semibold">Live rankings</span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="font-medium">
                Best score per player per game
              </span>
            </div>
            <div className="text-slate-500 font-medium">
              Updated in real-time
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
