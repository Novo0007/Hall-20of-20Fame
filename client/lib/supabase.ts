import { createClient } from "@supabase/supabase-js";

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that we have proper Supabase credentials
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return url.includes("supabase.co");
  } catch {
    return false;
  }
};

const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  isValidUrl(supabaseUrl) &&
  supabaseAnonKey.length > 20; // Basic validation for anon key

// Only create client if properly configured
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Export configuration status
export const isSupabaseEnabled = !!supabase;

// Types for our database tables
export interface User {
  id: string;
  name: string;
  created_at: string;
  country_code?: string;
  country_name?: string;
  country_flag?: string;
}

export interface Score {
  id: string;
  user_id: string;
  score: number;
  game_type: string;
  created_at: string;
  user?: User;
}

// Database operations
export class Database {
  // Get or create user by name
  static async getOrCreateUser(
    name: string,
    country?: { code: string; name: string; flag: string },
  ): Promise<User | null> {
    if (!supabase) {
      console.warn("Supabase not configured - using mock user");
      return {
        id: "mock-user-" + name.toLowerCase().replace(/\s+/g, "-"),
        name,
        created_at: new Date().toISOString(),
        country_code: country?.code,
        country_name: country?.name,
        country_flag: country?.flag,
      };
    }

    try {
      // First, try to find existing user by name
      const { data: existingUser, error: findError } = await supabase
        .from("users")
        .select("*")
        .eq("name", name)
        .single();

      // Handle schema cache issues
      if (findError?.code === "PGRST205") {
        console.warn("Schema cache not ready, using temporary user");
        return {
          id: "temp-user-" + name.toLowerCase().replace(/\s+/g, "-"),
          name,
          created_at: new Date().toISOString(),
        };
      }

      if (existingUser && !findError) {
        return existingUser;
      }

      // If user doesn't exist, create new one
      const userData: any = { name };
      if (country) {
        userData.country_code = country.code;
        userData.country_name = country.name;
        userData.country_flag = country.flag;
      }

      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([userData])
        .select()
        .single();

      // Handle schema cache issues
      if (createError?.code === "PGRST205") {
        console.warn("Schema cache not ready, using temporary user");
        return {
          id: "temp-user-" + name.toLowerCase().replace(/\s+/g, "-"),
          name,
          created_at: new Date().toISOString(),
        };
      }

      if (createError) {
        console.error(
          "Error creating user:",
          JSON.stringify(createError, null, 2),
        );
        return null;
      }

      return newUser;
    } catch (error) {
      console.error("Error in getOrCreateUser:", error);
      return null;
    }
  }

  // Submit a new score for a user (only if it's their best score)
  static async submitScore(
    userId: string,
    score: number,
    gameType: string = "perfect_circle",
  ): Promise<boolean> {
    if (!supabase) {
      console.warn("Supabase not configured - score not saved");
      return true; // Return true to not break the flow
    }

    try {
      // First check if user has a better score already for this game type
      const currentBest = await this.getUserBestScore(userId, gameType);

      // Only save if this is a new personal best
      if (score <= currentBest) {
        console.log(
          `Score ${score} not saved - current best is ${currentBest}`,
        );
        return true; // Not an error, just not a new best
      }

      const { error } = await supabase
        .from("scores")
        .insert([{ user_id: userId, score, game_type: gameType }]);

      // Handle schema cache issues
      if (error?.code === "PGRST205") {
        console.warn("Schema cache not ready, score not saved yet");
        return true; // Return true to not break the game flow
      }

      if (error) {
        console.error(
          "Error submitting score:",
          JSON.stringify(error, null, 2),
        );
        return false;
      }

      console.log(`New personal best saved: ${score}`);
      return true;
    } catch (error) {
      console.error("Error in submitScore:", error);
      return false;
    }
  }

  // Get highest score for each user (leaderboard)
  static async getLeaderboard(
    limit: number = 10,
    gameType?: string,
  ): Promise<Score[]> {
    if (!supabase) {
      console.warn("Supabase not configured - returning empty leaderboard");
      return [];
    }

    try {
      let query = supabase
        .from("scores")
        .select(
          `
          id,
          user_id,
          score,
          game_type,
          created_at,
          user:users(id, name, created_at, country_code, country_name, country_flag)
        `,
        )
        .order("score", { ascending: false });

      if (gameType) {
        query = query.eq("game_type", gameType);
      }

      const { data, error } = await query;

      // Handle schema cache issues
      if (error?.code === "PGRST205") {
        console.warn("Schema cache not ready, showing empty leaderboard");
        return [];
      }

      if (error) {
        console.error(
          "Error fetching leaderboard:",
          JSON.stringify(error, null, 2),
        );
        return [];
      }

      // Group by user and game type, keep only highest score per user per game
      const userBestScores = new Map<string, Score>();

      data?.forEach((score) => {
        const key = `${score.user_id}_${score.game_type}`;
        const existingScore = userBestScores.get(key);
        if (!existingScore || score.score > existingScore.score) {
          userBestScores.set(key, score);
        }
      });

      // Convert to array, sort by score, and limit results
      return Array.from(userBestScores.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error("Error in getLeaderboard:", error);
      return [];
    }
  }

  // Get user's best score
  static async getUserBestScore(
    userId: string,
    gameType: string = "perfect_circle",
  ): Promise<number> {
    if (!supabase) {
      return 0;
    }

    try {
      const { data, error } = await supabase
        .from("scores")
        .select("score")
        .eq("user_id", userId)
        .eq("game_type", gameType)
        .order("score", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return 0;
      }

      return data.score;
    } catch (error) {
      console.error("Error getting user best score:", error);
      return 0;
    }
  }

  // Update user information
  static async updateUser(
    userId: string,
    updates: Partial<User>,
  ): Promise<boolean> {
    if (!supabase) {
      console.warn("Supabase not configured - user update not saved");
      return true;
    }

    try {
      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", userId);

      if (error) {
        console.error("Error updating user:", JSON.stringify(error, null, 2));
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updateUser:", error);
      return false;
    }
  }
}
