import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { TeamKPI } from '@/types/team-kpi';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  data: TeamKPI[];
}

const riskConfig: Record<number, { badge: string; label: string; icon: typeof CheckCircle }> = {
  1: { badge: 'bg-[hsl(var(--risk-low))]/15 text-[hsl(var(--risk-low))]', label: 'Low', icon: CheckCircle },
  2: { badge: 'bg-[hsl(var(--risk-medium))]/15 text-[hsl(var(--risk-medium))]', label: 'Med', icon: AlertCircle },
  3: { badge: 'bg-[hsl(var(--risk-high))]/15 text-[hsl(var(--risk-high))]', label: 'High', icon: AlertTriangle },
};

export function CampaignListView({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.risk_score - a.risk_score);

  return (
    <div className="glass-card rounded-lg border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-[10px] uppercase tracking-wider">Campaign</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider">Manager</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider">Client</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-right">Budget</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-right">Spent</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-center">Impressions</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider w-[140px]">Spent %</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-center">Risk</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-center">Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map(c => {
            const config = riskConfig[c.risk_score] || riskConfig[1];
            const Icon = config.icon;
            const spentPct = c.budget > 0 ? Math.min((c.spent / c.budget) * 100, 100) : 0;
            return (
              <TableRow key={c.id} className="border-border/30 hover:bg-muted/30">
                <TableCell className="text-xs font-medium max-w-[200px] truncate">{c.campaign_name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.campaign_manager}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.client_name}</TableCell>
                <TableCell className="text-xs font-mono text-right">${(c.budget / 1000).toFixed(1)}K</TableCell>
                <TableCell className="text-xs font-mono text-right">${(c.spent / 1000).toFixed(1)}K</TableCell>
                <TableCell className="text-xs font-mono text-center">{(c.impressions / 1000).toFixed(0)}K</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={spentPct} className="h-1.5 flex-1" />
                    <span className="text-[10px] font-mono w-8 text-right">{spentPct.toFixed(0)}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={`${config.badge} border-0 text-[10px] font-semibold`}>
                    <Icon className="h-3 w-3 mr-0.5" />
                    {config.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-[10px]">{c.role}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
