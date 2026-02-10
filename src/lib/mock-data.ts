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

const managers = ['Valentina Martinez', 'Carlos Pena', 'Pedro Arredondo', 'Justin Ortiz', 'Laura Rojas'];
const clients = ['Sony Music Mexico', 'Warner Reprise Label', 'Columbia Records', 'Universal Music Latin', 'RCA Records', 'Atlantic Records', 'Interscope', 'Def Jam', 'Republic Records', 'Island Records'];
const statuses: TeamKPI['status'][] = ['active', 'paused', 'completed'];
const roles: TeamKPI['role'][] = ['CSM', 'Seller'];

const insights = [
  'CTR dropped 15% week-over-week. Consider refreshing ad creatives.',
  'Budget pacing ahead of schedule — projected overspend by 20%.',
  'High engagement rate but low conversions. Landing page optimization recommended.',
  'Campaign performing above benchmark. Consider scaling budget.',
  'Audience fatigue detected. Recommend new targeting segments.',
  'Strong ROAS at 4.2x. Opportunity to increase daily spend.',
  'Delivery issues detected — ad set not spending. Check targeting.',
  'Competitor activity surge detected. Adjust bid strategy.',
  'Seasonal trend favoring performance. Maximize exposure now.',
  'Creative A outperforming B by 3x. Consolidate spend.',
];

const actions = [
  'Update creatives and A/B test new variations by Friday.',
  'Reduce daily budget by 15% to maintain monthly target.',
  'Redesign landing page CTA and run conversion test.',
  'Submit budget increase request for next sprint.',
  'Build 3 new lookalike audiences from top converters.',
  'Increase daily budget cap from $500 to $750.',
  'Review targeting parameters and expand geo-targeting.',
  'Adjust CPC bids upward by 10% across all ad sets.',
  'Launch weekend-heavy schedule to capitalize on trend.',
  'Pause underperforming creative B and reallocate budget.',
];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateKPIs(): TeamKPI[] {
  const kpis: TeamKPI[] = [];
  const months = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02'];

  for (let i = 0; i < 40; i++) {
    const risk = (randomBetween(1, 3)) as 1 | 2 | 3;
    const budget = randomBetween(5000, 80000);
    kpis.push({
      id: `kpi-${i + 1}`,
      campaign_name: `${clients[i % clients.length]} - Campaign ${Math.ceil((i + 1) / 4)}`,
      client_name: clients[i % clients.length],
      campaign_manager: managers[i % managers.length],
      role: roles[i % 2],
      risk_score: risk,
      ai_insight: insights[i % insights.length],
      action_required: actions[i % actions.length],
      status: statuses[i % 3],
      budget,
      spent: Math.round(budget * (randomBetween(30, 95) / 100)),
      impressions: randomBetween(50000, 2000000),
      conversions: randomBetween(50, 5000),
      execution_days: randomBetween(7, 90),
      created_at: `${months[i % months.length]}-${String(randomBetween(1, 28)).padStart(2, '0')}T00:00:00Z`,
    });
  }
  return kpis;
}

export const mockKPIs = generateKPIs();
export const campaignManagers = managers;
export const roleOptions = roles;
