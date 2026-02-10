
-- Create proposals table for Monday.com proposals board data
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'To Do',
  list_builder TEXT,
  creative_builder TEXT,
  csm TEXT,
  seller TEXT,
  company TEXT,
  total_budget NUMERIC NOT NULL DEFAULT 0,
  influencers_budget NUMERIC NOT NULL DEFAULT 0,
  sub_campaign_budget NUMERIC NOT NULL DEFAULT 0,
  take_rate_pct NUMERIC NOT NULL DEFAULT 0,
  creators_expected INTEGER NOT NULL DEFAULT 0,
  audience_country TEXT,
  musical_genre TEXT,
  currency TEXT DEFAULT 'USD',
  deal_created_date DATE,
  proposal_board_start_date DATE,
  proposal_delivery_date DATE,
  building_proposal_start_date DATE,
  pending_approval_start_date DATE,
  execution_board_start_date DATE,
  days_building_proposal INTEGER,
  timing_of_delivery TEXT,
  proposal_adjustments INTEGER NOT NULL DEFAULT 0,
  declined_reasons TEXT,
  monday_item_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Public read access (same pattern as team_kpis)
CREATE POLICY "Anyone can read proposals"
ON public.proposals
FOR SELECT
USING (true);

-- Authenticated write access
CREATE POLICY "Authenticated users can insert proposals"
ON public.proposals
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update proposals"
ON public.proposals
FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete proposals"
ON public.proposals
FOR DELETE
USING (true);
