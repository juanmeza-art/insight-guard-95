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
            <TableHead className="text-[10px] uppercase tracking-wider">Team</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider">Status</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider w-[140px]">Progress</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-center">Influencers</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-center">UGC</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-center">Sent</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-center">Completed</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-center">Days</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-center">Risk</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map(c => {
            const config = riskConfig[c.risk_score] || riskConfig[1];
            const Icon = config.icon;
            return (
              <TableRow key={c.id} className="border-border/30 hover:bg-muted/30">
                <TableCell className="text-xs font-medium max-w-[200px] truncate">{c.campaign_name ?? 'Untitled'}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.team_name ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">{c.sal_status ?? 'N/A'}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={c.progress_pct} className="h-1.5 flex-1" />
                    <span className="text-[10px] font-mono w-8 text-right">{c.progress_pct}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-mono text-center">{c.num_influencers}</TableCell>
                <TableCell className="text-xs font-mono text-center">{c.num_ugc}</TableCell>
                <TableCell className="text-xs font-mono text-center">{c.count_sent}</TableCell>
                <TableCell className="text-xs font-mono text-center">{c.count_completed}</TableCell>
                <TableCell className="text-xs font-mono text-center">{c.days_active}</TableCell>
                <TableCell className="text-center">
                  <Badge className={`${config.badge} border-0 text-[10px] font-semibold`}>
                    <Icon className="h-3 w-3 mr-0.5" />
                    {config.label}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
