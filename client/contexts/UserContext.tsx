import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Database, User } from '../lib/supabase';
import { Country } from '../lib/countries';

interface UserContextType {
  user: User | null;
  userName: string;
  userCountry: Country | null;
  setUserName: (name: string) => Promise<void>;
  setUserCountry: (country: Country) => Promise<void>;
  isLoading: boolean;
  userBestScore: number;
  refreshUserBestScore: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserNameState] = useState<string>('Anonymous');
  const [userCountry, setUserCountryState] = useState<Country | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userBestScore, setUserBestScore] = useState<number>(0);

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('perfect-circle-username');
    const savedCountry = localStorage.getItem('perfect-circle-country');

    if (savedName) {
      setUserNameState(savedName);
      handleUserNameChange(savedName);
    }

    if (savedCountry) {
      try {
        const country = JSON.parse(savedCountry) as Country;
        setUserCountryState(country);
      } catch (error) {
        console.error('Failed to parse saved country:', error);
      }
    }
  }, []);

  const handleUserNameChange = async (name: string) => {
    setIsLoading(true);
    try {
      const userData = await Database.getOrCreateUser(name);
      if (userData) {
        setUser(userData);
        const bestScore = await Database.getUserBestScore(userData.id);
        setUserBestScore(bestScore);
      }
    } catch (error) {
      console.error('Error setting user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUserName = async (name: string) => {
    setUserNameState(name);
    localStorage.setItem('perfect-circle-username', name);
    await handleUserNameChange(name);
  };

  const refreshUserBestScore = async () => {
    if (user) {
      const bestScore = await Database.getUserBestScore(user.id);
      setUserBestScore(bestScore);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        userName,
        setUserName,
        isLoading,
        userBestScore,
        refreshUserBestScore,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
