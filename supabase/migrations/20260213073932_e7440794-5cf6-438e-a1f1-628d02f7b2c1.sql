-- Drop the overly permissive storage policy on imports bucket
-- Service role bypasses RLS by default, so edge functions will continue to work
DROP POLICY IF EXISTS "Service role manages imports" ON storage.objects;