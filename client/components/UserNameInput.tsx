import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

export const UserNameInput: React.FC = () => {
  const { userName, setUserName, isLoading, userBestScore } = useUser();
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
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">👤</span>
          </div>
          <span className="text-slate-700 font-medium">Player Profile</span>
        </div>
        {userBestScore > 0 && (
          <div className="text-right">
            <div className="text-xs text-slate-500">Personal Best</div>
            <div className="text-lg font-bold text-purple-600">{userBestScore.toFixed(1)}%</div>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter your display name"
            maxLength={20}
            autoFocus
          />
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
                '✓ Save'
              )}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-all duration-200"
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold text-slate-800">{userName}</div>
            <div className="text-sm text-slate-500">Tap to change name</div>
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
      )}
    </div>
  );
};
