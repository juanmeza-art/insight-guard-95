
ALTER TABLE public.execution_campaigns
ADD COLUMN risk_score integer NOT NULL DEFAULT 1,
ADD COLUMN ai_insight text NOT NULL DEFAULT '';
