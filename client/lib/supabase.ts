import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that we have proper Supabase credentials
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return url.includes('supabase.co');
  } catch {
    return false;
  }
};

const isSupabaseConfigured = supabaseUrl && supabaseAnonKey &&
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
}

export interface Score {
  id: string;
  user_id: string;
  score: number;
  created_at: string;
  user?: User;
}

// Database operations
export class Database {
  // Get or create user by name
  static async getOrCreateUser(name: string): Promise<User | null> {
    try {
      // First, try to find existing user by name
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('name', name)
        .single();

      if (existingUser && !findError) {
        return existingUser;
      }

      // If user doesn't exist, create new one
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ name }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return null;
      }

      return newUser;
    } catch (error) {
      console.error('Error in getOrCreateUser:', error);
      return null;
    }
  }

  // Submit a new score for a user
  static async submitScore(userId: string, score: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('scores')
        .insert([{ user_id: userId, score }]);

      if (error) {
        console.error('Error submitting score:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in submitScore:', error);
      return false;
    }
  }

  // Get highest score for each user (leaderboard)
  static async getLeaderboard(limit: number = 10): Promise<Score[]> {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select(`
          id,
          user_id,
          score,
          created_at,
          user:users(id, name, created_at)
        `)
        .order('score', { ascending: false });

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }

      // Group by user and keep only highest score per user
      const userBestScores = new Map<string, Score>();
      
      data?.forEach((score) => {
        const existingScore = userBestScores.get(score.user_id);
        if (!existingScore || score.score > existingScore.score) {
          userBestScores.set(score.user_id, score);
        }
      });

      // Convert to array, sort by score, and limit results
      return Array.from(userBestScores.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error in getLeaderboard:', error);
      return [];
    }
  }

  // Get user's best score
  static async getUserBestScore(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('score')
        .eq('user_id', userId)
        .order('score', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return 0;
      }

      return data.score;
    } catch (error) {
      console.error('Error getting user best score:', error);
      return 0;
    }
  }
}
