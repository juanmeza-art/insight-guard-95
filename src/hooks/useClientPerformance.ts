import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ClientPerformanceRow = {
  id: number;
  created_at: string | null;
  monday_id: string | null;
  campaign_name: string | null;
  team_name: string | null;
  sal_status: string | null;
  output_count: number;
  target_value: number;
  num_influencers: number;
  num_ugc: number;
  company: string | null;
  executed_take_rate_pct: number;
  execution_start: string | null;
  execution_end: string | null;
  views: number;
  engagements: number;
  cpm: number;
  cpe: number;
  er_pct: number;
};

export function useClientPerformance() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('client-performance-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'client_performance' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['client-performance'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['client-performance'],
    queryFn: async (): Promise<ClientPerformanceRow[]> => {
      let allData: any[] = [];
      let from = 0;
      const pageSize = 1000;
      while (true) {
        const { data, error } = await supabase
          .from('client_performance')
          .select('*')
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .range(from, from + pageSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        allData = allData.concat(data);
        if (data.length < pageSize) break;
        from += pageSize;
      }

      return allData.map((row: any) => ({
        id: row.id,
        created_at: row.created_at,
        monday_id: row.monday_id,
        campaign_name: row.campaign_name,
        team_name: row.team_name,
        sal_status: row.sal_status,
        output_count: Number(row.output_count ?? 0),
        target_value: Number(row.target_value ?? 0),
        num_influencers: Number(row.num_influencers ?? 0),
        num_ugc: Number(row.num_ugc ?? 0),
        company: row.company,
        executed_take_rate_pct: Number(row.executed_take_rate_pct ?? 0),
        execution_start: row.execution_start,
        execution_end: row.execution_end,
        views: Number(row.views ?? 0),
        engagements: Number(row.engagements ?? 0),
        cpm: Number(row.cpm ?? 0),
        cpe: Number(row.cpe ?? 0),
        er_pct: Number(row.er_pct ?? 0),
      }));
    },
  });
}
