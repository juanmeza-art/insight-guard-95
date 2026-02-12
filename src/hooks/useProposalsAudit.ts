import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ProposalAudit = {
  id: number;
  monday_id: string | null;
  campaign_name: string | null;
  company: string | null;
  status: string | null;
  budget: number;
  take_rate_pct: number;
  proposal_adjustments: number;
  seller_name: string | null;
  csm: string | null;
  list_builder: string | null;
  building_proposal_start: string | null;
  pending_approval_start: string | null;
  days_since_pending: number;
  risk_score: number;
  ai_insight: string | null;
  action_required: string | null;
  created_at: string | null;
  seller_sla: string | null;
  lb_sla: string | null;
};

export function useProposalsAudit() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('proposals-audit-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'proposals_audit' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['proposals-audit'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['proposals-audit'],
    queryFn: async (): Promise<ProposalAudit[]> => {
      const { data, error } = await supabase
        .from('proposals_audit')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data ?? []).map((row: any) => ({
        id: row.id,
        monday_id: row.monday_id,
        campaign_name: row.campaign_name,
        company: row.company,
        status: row.status,
        budget: Number(row.budget ?? 0),
        take_rate_pct: Number(row.take_rate_pct ?? 0),
        proposal_adjustments: Number(row.proposal_adjustments ?? 0),
        seller_name: row.seller_name,
        csm: row.csm,
        list_builder: row.list_builder,
        building_proposal_start: row.building_proposal_start,
        pending_approval_start: row.pending_approval_start,
        days_since_pending: Number(row.days_since_pending ?? 0),
        risk_score: Number(row.risk_score ?? 1),
        ai_insight: row.ai_insight,
        action_required: row.action_required,
        created_at: row.created_at,
        seller_sla: row.seller_sla,
        lb_sla: row.lb_sla,
      }));
    },
  });
}
