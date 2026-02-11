
-- Add missing columns requested by user
ALTER TABLE public.team_kpis ADD COLUMN IF NOT EXISTS num_ugc bigint DEFAULT 0;
ALTER TABLE public.team_kpis ADD COLUMN IF NOT EXISTS days_active bigint DEFAULT 0;
ALTER TABLE public.team_kpis ADD COLUMN IF NOT EXISTS count_sent bigint DEFAULT 0;
ALTER TABLE public.team_kpis ADD COLUMN IF NOT EXISTS count_completed bigint DEFAULT 0;

-- Enable RLS with public read
ALTER TABLE public.team_kpis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read team_kpis"
ON public.team_kpis FOR SELECT
USING (true);

CREATE POLICY "Service role can insert team_kpis"
ON public.team_kpis FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update team_kpis"
ON public.team_kpis FOR UPDATE
USING (true);
