-- Fix proposals write policies: restrict to authenticated only
DROP POLICY "Authenticated users can insert proposals" ON public.proposals;
DROP POLICY "Authenticated users can update proposals" ON public.proposals;
DROP POLICY "Authenticated users can delete proposals" ON public.proposals;

CREATE POLICY "Authenticated users can insert proposals"
  ON public.proposals FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update proposals"
  ON public.proposals FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete proposals"
  ON public.proposals FOR DELETE TO authenticated USING (true);

-- Fix proposals_audit write policies: restrict to service_role only
DROP POLICY "Service role can insert proposals_audit" ON public.proposals_audit;
DROP POLICY "Service role can update proposals_audit" ON public.proposals_audit;

CREATE POLICY "Service role can insert proposals_audit"
  ON public.proposals_audit FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role can update proposals_audit"
  ON public.proposals_audit FOR UPDATE TO service_role USING (true);