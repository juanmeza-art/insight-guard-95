
-- Create execution_campaigns table for Monday.com execution board
CREATE TABLE public.execution_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'To Do',
  list_builder TEXT,
  campaign_manager TEXT,
  csm TEXT,
  seller TEXT,
  company TEXT,
  total_budget NUMERIC NOT NULL DEFAULT 0,
  executed_amount NUMERIC NOT NULL DEFAULT 0,
  executed_take_rate_pct NUMERIC NOT NULL DEFAULT 0,
  influencers_budget NUMERIC NOT NULL DEFAULT 0,
  sub_campaign_budget NUMERIC NOT NULL DEFAULT 0,
  take_rate_pct NUMERIC NOT NULL DEFAULT 0,
  num_influencers INTEGER NOT NULL DEFAULT 0,
  num_ugc INTEGER NOT NULL DEFAULT 0,
  num_tiktoks INTEGER NOT NULL DEFAULT 0,
  num_ig_reels INTEGER NOT NULL DEFAULT 0,
  num_ig_posts INTEGER NOT NULL DEFAULT 0,
  num_ig_stories INTEGER NOT NULL DEFAULT 0,
  num_youtube INTEGER NOT NULL DEFAULT 0,
  num_posts INTEGER NOT NULL DEFAULT 0,
  num_published INTEGER NOT NULL DEFAULT 0,
  progress_pct NUMERIC NOT NULL DEFAULT 0,
  views BIGINT,
  engagement BIGINT,
  cpm NUMERIC,
  cpe NUMERIC,
  er_pct NUMERIC,
  musical_genre TEXT,
  audience_country TEXT,
  currency TEXT DEFAULT 'USD',
  execution_start DATE,
  execution_end DATE,
  deal_created_date DATE,
  execution_board_start_date DATE,
  ongoing_start_date DATE,
  building_reports_start_date DATE,
  completed_date DATE,
  monday_item_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.execution_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read execution_campaigns"
ON public.execution_campaigns FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert execution_campaigns"
ON public.execution_campaigns FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update execution_campaigns"
ON public.execution_campaigns FOR UPDATE USING (true);

CREATE POLICY "Authenticated users can delete execution_campaigns"
ON public.execution_campaigns FOR DELETE USING (true);
