import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TeamKPI } from '@/lib/mock-data';

export function useTeamKPIs() {
  return useQuery({
    queryKey: ['team-kpis'],
    queryFn: async (): Promise<TeamKPI[]> => {
      const { data, error } = await supabase
        .from('team_kpis')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data ?? []).map((row: any) => ({
        id: row.id,
        campaign_name: row.campaign_name,
        client_name: row.client_name,
        campaign_manager: row.campaign_manager,
        role: row.role as TeamKPI['role'],
        risk_score: row.risk_score as TeamKPI['risk_score'],
        ai_insight: row.ai_insight,
        action_required: row.action_required,
        status: row.status as TeamKPI['status'],
        budget: Number(row.budget),
        spent: Number(row.spent),
        impressions: row.impressions,
        conversions: row.conversions,
        execution_days: row.execution_days,
        created_at: row.created_at,
      }));
    },
  });
}
