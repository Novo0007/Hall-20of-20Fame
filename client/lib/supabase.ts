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
    if (!supabase) {
      console.warn('Supabase not configured - using mock user');
      return {
        id: 'mock-user-' + name.toLowerCase().replace(/\s+/g, '-'),
        name,
        created_at: new Date().toISOString(),
      };
    }

    try {
      // First, try to find existing user by name
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('name', name)
        .single();

      // Handle schema cache issues
      if (findError?.code === 'PGRST205') {
        console.warn('Schema cache not ready, using temporary user');
        return {
          id: 'temp-user-' + name.toLowerCase().replace(/\s+/g, '-'),
          name,
          created_at: new Date().toISOString(),
        };
      }

      if (existingUser && !findError) {
        return existingUser;
      }

      // If user doesn't exist, create new one
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ name }])
        .select()
        .single();

      // Handle schema cache issues
      if (createError?.code === 'PGRST205') {
        console.warn('Schema cache not ready, using temporary user');
        return {
          id: 'temp-user-' + name.toLowerCase().replace(/\s+/g, '-'),
          name,
          created_at: new Date().toISOString(),
        };
      }

      if (createError) {
        console.error('Error creating user:', JSON.stringify(createError, null, 2));
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
    if (!supabase) {
      console.warn('Supabase not configured - score not saved');
      return true; // Return true to not break the flow
    }

    try {
      const { error } = await supabase
        .from('scores')
        .insert([{ user_id: userId, score }]);

      // Handle schema cache issues
      if (error?.code === 'PGRST205') {
        console.warn('Schema cache not ready, score not saved yet');
        return true; // Return true to not break the game flow
      }

      if (error) {
        console.error('Error submitting score:', JSON.stringify(error, null, 2));
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
    if (!supabase) {
      console.warn('Supabase not configured - returning empty leaderboard');
      return [];
    }

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

      // Handle schema cache issues
      if (error?.code === 'PGRST205') {
        console.warn('Schema cache not ready, showing empty leaderboard');
        return [];
      }

      if (error) {
        console.error('Error fetching leaderboard:', JSON.stringify(error, null, 2));
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
    if (!supabase) {
      return 0;
    }

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
