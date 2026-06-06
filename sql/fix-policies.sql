-- Fix RLS policies for sponsorships table
-- The INSERT policy wasn't applied correctly. Run this.

DROP POLICY IF EXISTS "Anyone insert" ON sponsorships;
DROP POLICY IF EXISTS "Anyone update" ON sponsorships;

CREATE POLICY "Anyone insert" ON sponsorships 
  FOR INSERT TO anon 
  WITH CHECK (true);

CREATE POLICY "Anyone update" ON sponsorships 
  FOR UPDATE TO anon 
  USING (true) 
  WITH CHECK (true);

-- Verify policies
SELECT tablename, policyname, cmd, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'sponsorships';
