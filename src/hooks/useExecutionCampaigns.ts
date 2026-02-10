import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type ExecutionCampaign = Tables<'execution_campaigns'>;

export function useExecutionCampaigns() {
  return useQuery({
    queryKey: ['execution-campaigns'],
    queryFn: async (): Promise<ExecutionCampaign[]> => {
      const { data, error } = await supabase
        .from('execution_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });
}
