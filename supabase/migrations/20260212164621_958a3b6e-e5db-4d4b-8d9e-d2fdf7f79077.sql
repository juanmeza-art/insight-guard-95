
-- Fix PUBLIC_DATA_EXPOSURE: Restrict SELECT policies to authenticated users only

-- proposals table
DROP POLICY IF EXISTS "Anyone can read proposals" ON public.proposals;
CREATE POLICY "Authenticated users can read proposals"
ON public.proposals FOR SELECT
TO authenticated
USING (true);

-- proposals_audit table
DROP POLICY IF EXISTS "Anyone can read proposals_audit" ON public.proposals_audit;
CREATE POLICY "Authenticated users can read proposals_audit"
ON public.proposals_audit FOR SELECT
TO authenticated
USING (true);

-- team_kpis table
DROP POLICY IF EXISTS "Anyone can read team_kpis" ON public.team_kpis;
CREATE POLICY "Authenticated users can read team_kpis"
ON public.team_kpis FOR SELECT
TO authenticated
USING (true);
