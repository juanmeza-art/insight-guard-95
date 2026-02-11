export type TeamKPI = {
  id: number;
  campaign_name: string | null;
  team_name: string | null;
  sal_status: string | null;
  output_count: number;
  target_value: number;
  risk_score: number;
  ai_insight: string | null;
  action_required: string | null;
  progress_pct: number;
  num_influencers: number;
  num_ugc: number;
  days_active: number;
  count_sent: number;
  count_completed: number;
  monday_id: string | null;
  created_at: string | null;
};
