import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { TeamKPI } from '@/types/team-kpi';

export function useTeamKPIs() {
  const queryClient = useQueryClient();

  // Realtime subscription for n8n live inserts
  useEffect(() => {
    const channel = supabase
      .channel('team-kpis-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'team_kpis' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['team-kpis'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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
        team_name: row.team_name,
        sal_status: row.sal_status,
        output_count: Number(row.output_count ?? 0),
        target_value: Number(row.target_value ?? 0),
        risk_score: Number(row.risk_score ?? 1),
        ai_insight: row.ai_insight,
        action_required: row.action_required,
        progress_pct: Number(row.progress_pct ?? 0),
        num_influencers: Number(row.num_influencers ?? 0),
        num_ugc: Number(row.num_ugc ?? 0),
        days_active: Number(row.days_active ?? 0),
        count_sent: Number(row.count_sent ?? 0),
        count_completed: Number(row.count_completed ?? 0),
        monday_id: row.monday_id,
        created_at: row.created_at,
      }));
    },
  });
}
