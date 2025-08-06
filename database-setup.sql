-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scores table
CREATE TABLE IF NOT EXISTS scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a game leaderboard)
CREATE POLICY "Anyone can read users" ON users FOR SELECT USING (true);
CREATE POLICY "Anyone can insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read scores" ON scores FOR SELECT USING (true);
CREATE POLICY "Anyone can insert scores" ON scores FOR INSERT WITH CHECK (true);

-- Create a function to get leaderboard (highest score per user)
CREATE OR REPLACE FUNCTION get_leaderboard(result_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  score DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE,
  user_name TEXT,
  user_created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE sql
AS $$
  WITH ranked_scores AS (
    SELECT 
      s.id,
      s.user_id,
      s.score,
      s.created_at,
      u.name as user_name,
      u.created_at as user_created_at,
      ROW_NUMBER() OVER (PARTITION BY s.user_id ORDER BY s.score DESC, s.created_at ASC) as rn
    FROM scores s
    JOIN users u ON s.user_id = u.id
  )
  SELECT 
    id,
    user_id,
    score,
    created_at,
    user_name,
    user_created_at
  FROM ranked_scores 
  WHERE rn = 1 
  ORDER BY score DESC, created_at ASC 
  LIMIT result_limit;
$$;
