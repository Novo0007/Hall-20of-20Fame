import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';

export const UserNameInput: React.FC = () => {
  const { userName, setUserName, isLoading, userBestScore } = useUser();
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
    <div className="bg-card border border-border rounded-lg p-4 w-full max-w-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Player</span>
        {userBestScore > 0 && (
          <span className="text-sm text-muted-foreground">
            Best: {userBestScore.toFixed(1)}%
          </span>
        )}
      </div>
      
      {isEditing ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter your name"
            maxLength={20}
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={isLoading || !tempName.trim()}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '...' : '✓'}
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-foreground font-medium">{userName}</span>
          <button
            onClick={() => {
              setIsEditing(true);
              setTempName(userName);
            }}
            className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};
