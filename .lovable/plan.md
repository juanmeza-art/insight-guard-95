
# Team Performance Dashboard

A new "Team Performance" page with OKR-style goal tracking at the top and four analytical charts below, all using existing data from `proposals_audit` and `team_kpis`.

---

## Section 1: OKR Goal Tracker

A hero section with three visual elements:

- **Quarterly Goal**: "Achieve TPV Music Execution Goal" with target of **$1,901,116** (hardcoded for now, editable later)
- **Monthly Goal (February)**: **$700,000** target
- **Progress Bars**: Two animated progress bars showing % attained vs. each goal, calculated from `team_kpis` data (sum of `target_value` for campaigns with `execution_start` in the relevant period)
- **AI Insight**: A button/card that calls the existing `campaign-insights` edge function to generate a strategic comment on current progress

The quarterly goal will cover Q1 2026 (Jan-Mar), and the monthly goal will filter to February 2026. Progress is computed as `SUM(target_value)` from `team_kpis` where `execution_start` falls within the period.

---

## Section 2: Charts (below the OKR section)

### Chart 1 -- Monthly Volume of Requests by Status (last 6 months)
- **Source**: `proposals_audit`
- **Type**: Stacked bar chart
- **X-axis**: Month (last 6 months from today)
- **Y-axis**: Count of proposals
- **Stacks**: One color per status (To Do, Building Proposal, Pending Approval, Approved, Declined, etc.)
- **Date field**: `building_proposal_start` (fallback to `created_at`)

### Chart 2 -- Monthly Budget by Status (last 6 months)
- **Source**: `proposals_audit`
- **Type**: Stacked bar chart
- **X-axis**: Month (last 6 months)
- **Y-axis**: Budget ($)
- **Stacks**: Same status colors as Chart 1

### Chart 3 -- Daily Proposals Requested (current month view)
- **Source**: `proposals_audit`
- **Type**: Bar chart
- **X-axis**: Day of the current month (1-28/29/30/31)
- **Y-axis**: Count of proposals created that day
- **Date field**: `building_proposal_start` (fallback to `created_at`)
- Includes a month selector to navigate to previous months

### Chart 4 -- Campaigns & Influencers by Quarter
- **Source**: `team_kpis`
- **Type**: Grouped bar chart with dual axis
- **Filter**: Statuses "Ongoing", "Recently Completed", "Completed"
- **X-axis**: Quarter (e.g., Q1 '25, Q2 '25, ...)
- **Y-axis left**: Count of campaigns + influencers (bars)
- **Y-axis right**: Optional budget line

---

## Technical Plan

### New files:
1. **`src/pages/TeamPerformance.tsx`** -- Main page component containing:
   - OKR section with `Progress` component from `@/components/ui/progress.tsx`
   - AI Insight card reusing the `AIInsightButton` pattern
   - Four chart cards using `recharts` (BarChart, stacked bars)
   - All data sourced from `useProposalsAudit()` and `useTeamKPIs()` hooks (no new DB tables needed)

### Modified files:
2. **`src/App.tsx`** -- Add route `/team-performance` pointing to the new page
3. **`src/components/AppSidebar.tsx`** -- Add nav item "Team Performance" with a `Target` icon between "Role Performance" and the bottom

### No database changes needed
All data comes from existing `proposals_audit` and `team_kpis` tables. The OKR goals ($1,901,116 and $700,000) will be hardcoded constants that can be updated easily.
