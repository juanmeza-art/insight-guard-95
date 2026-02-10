import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type Proposal = {
  id: string;
  name: string;
  status: string;
  list_builder: string | null;
  creative_builder: string | null;
  csm: string | null;
  seller: string | null;
  company: string | null;
  total_budget: number;
  influencers_budget: number;
  sub_campaign_budget: number;
  take_rate_pct: number;
  creators_expected: number;
  audience_country: string | null;
  musical_genre: string | null;
  currency: string | null;
  deal_created_date: string | null;
  proposal_board_start_date: string | null;
  proposal_delivery_date: string | null;
  building_proposal_start_date: string | null;
  pending_approval_start_date: string | null;
  execution_board_start_date: string | null;
  days_building_proposal: number | null;
  timing_of_delivery: string | null;
  proposal_adjustments: number;
  declined_reasons: string | null;
  monday_item_id: string | null;
  created_at: string;
};

export function useProposals() {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: async (): Promise<Proposal[]> => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as Proposal[];
    },
  });
}
