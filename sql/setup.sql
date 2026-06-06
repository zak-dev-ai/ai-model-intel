-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- Project: jkoxrftlslylfmugjomd

-- Sponsorship table for the Featured Model card
CREATE TABLE IF NOT EXISTS sponsorships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  website_url TEXT NOT NULL,
  model_name TEXT NOT NULL,
  description TEXT NOT NULL,
  logo_url TEXT,
  amount_paid DECIMAL(10,2) DEFAULT 99.00,
  payment_status TEXT DEFAULT 'pending',
  payment_id TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow public read of active sponsorships
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active"
ON sponsorships FOR SELECT
TO anon
USING (is_active = true AND payment_status = 'completed');

-- Allow public insert (pending until payment confirmed via webhook)
CREATE POLICY "Anyone insert"
ON sponsorships FOR INSERT
TO anon
WITH CHECK (true);

-- Allow public update (needed for webhook activation + cron expiry)
CREATE POLICY "Anyone update"
ON sponsorships FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Performance
CREATE INDEX IF NOT EXISTS idx_sponsorships_active ON sponsorships(is_active, payment_status);
CREATE INDEX IF NOT EXISTS idx_sponsorships_end_date ON sponsorships(end_date);

SELECT 'sponsorships table ready' AS status;
