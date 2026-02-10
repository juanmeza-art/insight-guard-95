import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { campaignManagers, roleOptions } from '@/lib/mock-data';

interface FiltersProps {
  selectedManager: string;
  onManagerChange: (v: string) => void;
  selectedRole: string;
  onRoleChange: (v: string) => void;
}

export function DashboardFilters({ selectedManager, onManagerChange, selectedRole, onRoleChange }: FiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <Select value={selectedManager} onValueChange={onManagerChange}>
        <SelectTrigger className="w-[200px] glass-card">
          <SelectValue placeholder="All Managers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Managers</SelectItem>
          {campaignManagers.map(m => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedRole} onValueChange={onRoleChange}>
        <SelectTrigger className="w-[140px] glass-card">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          {roleOptions.map(r => (
            <SelectItem key={r} value={r}>{r}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
