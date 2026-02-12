ALTER TABLE public.proposals_audit 
ADD COLUMN seller_sla text DEFAULT 'NO',
ADD COLUMN lb_sla text DEFAULT 'NO';