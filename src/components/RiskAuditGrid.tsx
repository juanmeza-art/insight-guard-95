import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { ExecutionCampaign } from '@/hooks/useExecutionCampaigns';
import { motion } from 'framer-motion';
import { Users, DollarSign, BarChart3 } from 'lucide-react';

interface Props {
  data: ExecutionCampaign[];
}

function getBudgetStatus(campaign: ExecutionCampaign) {
  const executed = Number(campaign.executed_amount);
  const budget = Number(campaign.total_budget);
  if (budget === 0) return { label: 'N/A', color: 'bg-muted text-muted-foreground' };
  const ratio = executed / budget;
  if (ratio > 1.1) return { label: 'Over Budget', color: 'bg-[hsl(var(--risk-high))]/15 text-[hsl(var(--risk-high))]' };
  if (ratio > 0.9) return { label: 'Near Limit', color: 'bg-[hsl(var(--risk-medium))]/15 text-[hsl(var(--risk-medium))]' };
  return { label: 'On Track', color: 'bg-[hsl(var(--risk-low))]/15 text-[hsl(var(--risk-low))]' };
}

export function RiskAuditGrid({ data }: Props) {
  const sorted = [...data].sort((a, b) => Number(b.total_budget) - Number(a.total_budget));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {sorted.map((c, i) => {
        const budgetStatus = getBudgetStatus(c);
        const progress = Number(c.progress_pct);
        return (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className="glass-card hover:shadow-lg hover:shadow-primary/5 transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold truncate">{c.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.campaign_manager} · {c.company}</p>
                  </div>
                  <Badge className={`${budgetStatus.color} border-0 text-[10px] font-semibold shrink-0 ml-2`}>
                    {budgetStatus.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-mono font-medium">{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground">{c.num_published} / {c.num_posts} posts published</p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <DollarSign className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs font-mono font-medium">${(Number(c.total_budget) / 1000).toFixed(1)}K</p>
                    <p className="text-[10px] text-muted-foreground">Budget</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <BarChart3 className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs font-mono font-medium">${(Number(c.executed_amount) / 1000).toFixed(1)}K</p>
                    <p className="text-[10px] text-muted-foreground">Executed</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <Users className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs font-mono font-medium">{c.num_influencers}</p>
                    <p className="text-[10px] text-muted-foreground">Creators</p>
                  </div>
                </div>

                {/* Team info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                  <span>CSM: <span className="text-foreground">{c.csm || '—'}</span></span>
                  <span>Take Rate: <span className="font-mono text-foreground">{Number(c.take_rate_pct)}%</span></span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
