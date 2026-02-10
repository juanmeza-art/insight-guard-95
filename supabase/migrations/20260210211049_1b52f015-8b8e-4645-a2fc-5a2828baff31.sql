
-- Create team_kpis table
CREATE TABLE public.team_kpis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  campaign_manager TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('CSM', 'Seller')),
  risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 1 AND 3),
  ai_insight TEXT NOT NULL DEFAULT '',
  action_required TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  budget NUMERIC NOT NULL DEFAULT 0,
  spent NUMERIC NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  execution_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_kpis ENABLE ROW LEVEL SECURITY;

-- Allow public read access (dashboard is viewable by all)
CREATE POLICY "Anyone can read team_kpis"
  ON public.team_kpis FOR SELECT
  USING (true);

-- Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can insert team_kpis"
  ON public.team_kpis FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update team_kpis"
  ON public.team_kpis FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete team_kpis"
  ON public.team_kpis FOR DELETE
  TO authenticated
  USING (true);
