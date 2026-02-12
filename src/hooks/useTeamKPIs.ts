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
      // Fetch all rows (bypass 1000-row default limit)
      let allData: any[] = [];
      let from = 0;
      const pageSize = 1000;
      while (true) {
        const { data, error } = await supabase
          .from('team_kpis')
          .select('*')
          .order('created_at', { ascending: false })
          .range(from, from + pageSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        allData = allData.concat(data);
        if (data.length < pageSize) break;
        from += pageSize;
      }

      return (allData ?? []).map((row: any) => ({
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
        company: row.company,
        executed_amount: Number(row.executed_amount ?? 0),
        executed_take_rate_pct: Number(row.executed_take_rate_pct ?? 0),
        execution_start: row.execution_start,
        execution_end: row.execution_end,
        currency: row.currency,
      }));
    },
  });
}
