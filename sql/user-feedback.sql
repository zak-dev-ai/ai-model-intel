-- Run this in Supabase SQL Editor
-- Project: jkoxrftlslylfmugjomd

-- User feedback table for aimodelranks
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback TEXT NOT NULL,
  page_url TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'new'
);

-- Allow public insert (no auth needed) and read (admin panel uses anon key)
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback" ON user_feedback 
  FOR INSERT TO anon 
  WITH CHECK (true);

CREATE POLICY "Anyone can read feedback" ON user_feedback 
  FOR SELECT TO anon 
  USING (true);

CREATE POLICY "Anyone can update feedback" ON user_feedback 
  FOR UPDATE TO anon 
  USING (true);
