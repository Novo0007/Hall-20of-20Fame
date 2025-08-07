import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Database, User } from "../lib/supabase";
import { Country } from "../lib/countries";

interface UserContextType {
  user: User | null;
  userName: string;
  userCountry: Country | null;
  setUserName: (name: string) => Promise<void>;
  setUserCountry: (country: Country) => Promise<void>;
  isLoading: boolean;
  userBestScore: number;
  userBestScores: { [gameType: string]: number };
  getUserBestScore: (gameType: string) => number;
  refreshUserBestScore: () => Promise<void>;
  refreshUserBestScores: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserNameState] = useState<string>("Anonymous");
  const [userCountry, setUserCountryState] = useState<Country | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userBestScore, setUserBestScore] = useState<number>(0);
  const [userBestScores, setUserBestScores] = useState<{
    [gameType: string]: number;
  }>({});

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem("perfect-circle-username");
    const savedCountry = localStorage.getItem("perfect-circle-country");

    if (savedName) {
      setUserNameState(savedName);
      handleUserNameChange(savedName);
    }

    if (savedCountry) {
      try {
        const country = JSON.parse(savedCountry) as Country;
        setUserCountryState(country);
      } catch (error) {
        console.error("Failed to parse saved country:", error);
      }
    }
  }, []);

  const handleUserNameChange = async (name: string) => {
    setIsLoading(true);
    try {
      const countryData = userCountry
        ? {
            code: userCountry.code,
            name: userCountry.name,
            flag: userCountry.flag,
          }
        : undefined;

      const userData = await Database.getOrCreateUser(name, countryData);
      if (userData) {
        setUser(userData);
        // Load best scores for all games
        const perfectCircleScore = await Database.getUserBestScore(
          userData.id,
          "perfect_circle",
        );
        const balloonPopScore = await Database.getUserBestScore(
          userData.id,
          "balloon_pop",
        );

        setUserBestScore(perfectCircleScore); // Keep for backward compatibility
        setUserBestScores({
          perfect_circle: perfectCircleScore,
          balloon_pop: balloonPopScore,
        });
      }
    } catch (error) {
      console.error("Error setting user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUserName = async (name: string) => {
    setUserNameState(name);
    localStorage.setItem("perfect-circle-username", name);
    await handleUserNameChange(name);
  };

  const setUserCountry = async (country: Country) => {
    setUserCountryState(country);
    localStorage.setItem("perfect-circle-country", JSON.stringify(country));

    // Update user in database if user exists
    if (user) {
      setIsLoading(true);
      try {
        await Database.updateUser(user.id, {
          country_code: country.code,
          country_name: country.name,
          country_flag: country.flag,
        });

        // Update local user state
        setUser((prev) =>
          prev
            ? {
                ...prev,
                country_code: country.code,
                country_name: country.name,
                country_flag: country.flag,
              }
            : null,
        );
      } catch (error) {
        console.error("Error updating user country:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const refreshUserBestScore = async () => {
    if (user) {
      const bestScore = await Database.getUserBestScore(
        user.id,
        "perfect_circle",
      );
      setUserBestScore(bestScore);
    }
  };

  const refreshUserBestScores = async () => {
    if (user) {
      const perfectCircleScore = await Database.getUserBestScore(
        user.id,
        "perfect_circle",
      );
      const balloonPopScore = await Database.getUserBestScore(
        user.id,
        "balloon_pop",
      );

      setUserBestScore(perfectCircleScore);
      setUserBestScores({
        perfect_circle: perfectCircleScore,
        balloon_pop: balloonPopScore,
      });
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        userName,
        userCountry,
        setUserName,
        setUserCountry,
        isLoading,
        userBestScore,
        userBestScores,
        getUserBestScore: (gameType: string) => userBestScores[gameType] || 0,
        refreshUserBestScore,
        refreshUserBestScores,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
