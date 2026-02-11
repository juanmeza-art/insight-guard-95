export type TeamKPI = {
  id: string;
  campaign_name: string;
  client_name: string;
  campaign_manager: string;
  role: 'CSM' | 'Seller';
  risk_score: 1 | 2 | 3;
  ai_insight: string;
  action_required: string;
  status: 'active' | 'paused' | 'completed';
  budget: number;
  spent: number;
  impressions: number;
  conversions: number;
  execution_days: number;
  created_at: string;
};
