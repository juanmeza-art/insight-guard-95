-- Add missing columns to team_kpis
ALTER TABLE public.team_kpis
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS executed_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS executed_take_rate_pct numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS execution_start date,
ADD COLUMN IF NOT EXISTS execution_end date,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';

-- Add missing columns to proposals_audit
ALTER TABLE public.proposals_audit
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS proposal_delivery_date date,
ADD COLUMN IF NOT EXISTS audience_country text,
ADD COLUMN IF NOT EXISTS musical_genre text;