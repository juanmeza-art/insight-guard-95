import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ExecutionCampaign = {
  id: string;
  name: string;
  status: string;
  list_builder: string | null;
  campaign_manager: string | null;
  csm: string | null;
  seller: string | null;
  company: string | null;
  total_budget: number;
  executed_amount: number;
  executed_take_rate_pct: number;
  influencers_budget: number;
  sub_campaign_budget: number;
  take_rate_pct: number;
  num_influencers: number;
  num_ugc: number;
  num_tiktoks: number;
  num_ig_reels: number;
  num_ig_posts: number;
  num_ig_stories: number;
  num_youtube: number;
  num_posts: number;
  num_published: number;
  progress_pct: number;
  views: number | null;
  engagement: number | null;
  cpm: number | null;
  cpe: number | null;
  er_pct: number | null;
  musical_genre: string | null;
  audience_country: string | null;
  currency: string | null;
  execution_start: string | null;
  execution_end: string | null;
  deal_created_date: string | null;
  execution_board_start_date: string | null;
  ongoing_start_date: string | null;
  building_reports_start_date: string | null;
  completed_date: string | null;
  monday_item_id: string | null;
  created_at: string;
};

export function useExecutionCampaigns(statusFilter?: string) {
  return useQuery({
    queryKey: ['execution-campaigns', statusFilter],
    queryFn: async (): Promise<ExecutionCampaign[]> => {
      let query = supabase
        .from('execution_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as ExecutionCampaign[];
    },
  });
}
