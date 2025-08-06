import React, { useState, useEffect } from "react";
import { Database, Score } from "../lib/supabase";
import { useUser } from "../contexts/UserContext";
import { useTheme } from "../contexts/ThemeContext";

export const Leaderboard: React.FC = () => {
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const { isDark } = useTheme();

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const leaderboard = await Database.getLeaderboard(10);
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

  const getScoreColor = (score: number): string => {
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    if (score >= 50) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8 px-4">
        <div
          className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full mb-4 ${
            isDark
              ? "bg-gradient-to-r from-yellow-800/30 to-orange-800/30"
              : "bg-gradient-to-r from-yellow-100 to-orange-100"
          }`}
        >
          <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
          <span
            className={`text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}
          >
            Global Competition
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
          🏆 Leaderboard
        </h1>
        <p
          className={`text-sm sm:text-base ${isDark ? "text-slate-400" : "text-slate-600"}`}
        >
          Top 10 Perfect Circle Masters
        </p>
      </div>

      <div
        className={`rounded-3xl shadow-2xl border overflow-hidden transition-colors duration-300 ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"
        }`}
      >
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl sm:text-2xl">👑</span>
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-white">
                  Hall of Fame
                </h2>
                <p className="text-orange-100 text-xs sm:text-sm">
                  Top scoring players
                </p>
              </div>
            </div>
            <button
              onClick={loadLeaderboard}
              disabled={isLoading}
              className="px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 disabled:opacity-50 transition-all duration-200 backdrop-blur-sm text-sm"
            >
              {isLoading ? (
                <span className="flex items-center space-x-1">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span className="hidden sm:inline">Loading</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1">
                  <span>🔄</span>
                  <span className="hidden sm:inline">Refresh</span>
                </span>
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
              <p className="text-slate-600 font-medium">
                Loading global rankings...
              </p>
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-slate-500 text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                No champions yet!
              </h3>
              <p className="text-slate-600 mb-4">
                Be the first to claim the throne
              </p>
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full">
                <span className="text-purple-600">👑</span>
                <span className="text-purple-800 font-medium">
                  First place awaits you
                </span>
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
                        ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-lg"
                        : isCurrentUser
                          ? "bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 shadow-md"
                          : "bg-slate-50 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {isPodium && (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 transform rotate-12 translate-x-4 -translate-y-4 rounded-lg opacity-20"></div>
                    )}

                    <div className="flex items-center justify-between p-4 sm:p-6">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div
                          className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl font-bold text-sm sm:text-lg ${
                            position === 1
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white"
                              : position === 2
                                ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white"
                                : position === 3
                                  ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                                  : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {position <= 3
                            ? getPositionMedal(position)
                            : `#${position}`}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p
                              className={`text-sm sm:text-lg font-semibold truncate ${
                                isPodium
                                  ? "text-orange-900"
                                  : isCurrentUser
                                    ? "text-purple-900"
                                    : isDark
                                      ? "text-slate-200"
                                      : "text-slate-800"
                              }`}
                            >
                              {score.user?.name || "Unknown Player"}
                            </p>
                            {score.user?.country_flag && (
                              <span
                                className="text-lg shrink-0"
                                title={score.user.country_name}
                              >
                                {score.user.country_flag}
                              </span>
                            )}
                            {isCurrentUser && (
                              <span className="inline-flex items-center bg-purple-500 text-white px-2 py-0.5 rounded-full text-xs font-medium shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          {isPodium && (
                            <span className="inline-flex items-center space-x-1 bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                              <span>🏆</span>
                              <span className="hidden sm:inline">Champion</span>
                            </span>
                          )}
                          <p className="text-slate-500 text-xs">
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
                          className={`text-xl sm:text-3xl font-bold mb-1 ${getScoreColor(score.score)}`}
                        >
                          {score.score.toFixed(1)}%
                        </div>
                        <div className="text-slate-500 text-xs sm:text-sm">
                          {score.score >= 90
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
            <div className="text-slate-500">Updated in real-time</div>
          </div>
        </div>
      </div>
    </div>
  );
};
