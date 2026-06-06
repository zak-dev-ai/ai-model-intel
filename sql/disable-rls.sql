-- Simplest fix: disable RLS on sponsorships table
ALTER TABLE sponsorships DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'sponsorships';
