import React, { useState } from "react";
import { useUser } from "../contexts/UserContext";
import { useTheme } from "../contexts/ThemeContext";
import { CountrySelector } from "./CountrySelector";

export const UserNameInput: React.FC = () => {
  const {
    userName,
    userCountry,
    setUserName,
    setUserCountry,
    isLoading,
    userBestScore,
  } = useUser();
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const handleSave = async () => {
    if (tempName.trim() && tempName.trim() !== userName) {
      await setUserName(tempName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempName(userName);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div
      className={`rounded-2xl shadow-lg border p-6 w-full transition-colors duration-300 ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">👤</span>
          </div>
          <span
            className={`font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}
          >
            Player Profile
          </span>
          {userCountry && (
            <div className="flex items-center space-x-1 ml-2">
              <span className="text-lg">{userCountry.flag}</span>
            </div>
          )}
        </div>
        {userBestScore > 0 && (
          <div className="text-right">
            <div
              className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Personal Best
            </div>
            <div className="text-lg font-bold text-purple-400">
              {userBestScore.toFixed(1)}%
            </div>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              Display Name
            </label>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={handleKeyPress}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-slate-200 placeholder-slate-400"
                  : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-500"
              }`}
              placeholder="Enter your display name"
              maxLength={20}
              autoFocus
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              Country
            </label>
            <CountrySelector
              selectedCountry={userCountry}
              onCountrySelect={setUserCountry}
              autoDetect={!userCountry}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isLoading || !tempName.trim()}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Saving</span>
                </span>
              ) : (
                "✓ Save"
              )}
            </button>
            <button
              onClick={handleCancel}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                isDark
                  ? "bg-gray-600 text-slate-200 hover:bg-gray-500"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div
                className={`text-xl font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}
              >
                {userName}
              </div>
              <div
                className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                Player name
              </div>
            </div>
            <button
              onClick={() => {
                setIsEditing(true);
                setTempName(userName);
              }}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              ✏️ Edit
            </button>
          </div>

          {/* Country Display */}
          <div className="flex items-center justify-between">
            <div>
              <div
                className={`text-lg font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}
              >
                {userCountry ? (
                  <span className="flex items-center space-x-2">
                    <span className="text-xl">{userCountry.flag}</span>
                    <span>{userCountry.name}</span>
                  </span>
                ) : (
                  <span
                    className={`${isDark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    🌍 No country selected
                  </span>
                )}
              </div>
              <div
                className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                {userCountry ? "Representing" : "Tap edit to select country"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
