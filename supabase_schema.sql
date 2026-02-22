--Database Schema for Quijote Run

-- 1. Marathons table
CREATE TABLE marathons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Workouts table
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marathon_id UUID REFERENCES marathons(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User Progress table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  sensations TEXT,
  discomfort TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, workout_id)
);

-- 4. Initial Data
INSERT INTO marathons (name, date) VALUES 
('Barcelona Marathon', '2026-03-15T09:00:00Z'),
('Madrid Marathon', '2026-04-26T09:00:00Z');

-- 5. RLS Policies (Row Level Security)
ALTER TABLE marathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Marathons: Everyone can read
CREATE POLICY "Allow public read marathons" ON marathons FOR SELECT USING (true);

-- Workouts: Everyone can read
CREATE POLICY "Allow public read workouts" ON workouts FOR SELECT USING (true);

-- User Progress: Users can only see and edit their own progress
CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Admin access (Simplified for this demo, usually handled via roles)
-- In a real app, you'd check a custom claim or a profiles table.
-- For this request, we'll handle the "admin" logic in the frontend as requested (admin/admin).
