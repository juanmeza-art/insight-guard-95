import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

function parseNum(val: string | undefined): number {
  if (!val) return 0;
  const clean = val.replace(/[%,$]/g, '').trim();
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
}

function parseDate(val: string | undefined): string | null {
  if (!val || val.trim() === '') return null;
  const v = val.trim();
  // Handle M/D/YYYY format
  const parts = v.split('/');
  if (parts.length === 3) {
    const [m, d, y] = parts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // Handle YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  return null;
}

function daysBetween(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(0, Math.round((e.getTime() - s.getTime()) / 86400000));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Temporary one-time import - accepts import-key header
  const importKey = req.headers.get("x-import-key");
  if (importKey !== "bulk-import-2026") {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const csvText = await req.text();
    const lines = csvText.split('\n').filter(l => l.trim().length > 0);
    
    if (lines.length < 2) {
      return new Response(
        JSON.stringify({ error: "CSV must have header + data rows" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const headers = parseCSVLine(lines[0]);
    const col = (row: string[], name: string) => {
      const idx = headers.indexOf(name);
      return idx >= 0 ? row[idx] : undefined;
    };

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const BATCH_SIZE = 200;
    let inserted = 0;
    let errors: string[] = [];

    // Parse all rows
    const teamRows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const fields = parseCSVLine(lines[i]);
      if (fields.length < 5) continue;

      const execStart = parseDate(col(fields, 'Execution Timeline - Start'));
      const execEnd = parseDate(col(fields, 'Execution Timeline - End'));
      const campaignId = col(fields, 'Campaign ID');

      teamRows.push({
        monday_id: campaignId || `csv-import-${i}`,
        campaign_name: col(fields, 'Name') || null,
        team_name: col(fields, 'C. Manager') || null,
        sal_status: col(fields, 'Status') || 'Ongoing',
        output_count: parseNum(col(fields, 'Executed Amount')),
        target_value: parseNum(col(fields, 'Total Budget')),
        risk_score: 1,
        progress_pct: parseNum(col(fields, '% Progress')),
        num_influencers: parseNum(col(fields, '# Influencers')),
        num_ugc: parseNum(col(fields, '# UGC')),
        days_active: daysBetween(execStart, execEnd),
        count_sent: parseNum(col(fields, '# Posts')),
        count_completed: parseNum(col(fields, '# Published')),
        company: col(fields, 'Company') || null,
        executed_amount: parseNum(col(fields, 'Executed Amount')),
        executed_take_rate_pct: parseNum(col(fields, 'Executed Take Rate %')),
        execution_start: execStart,
        execution_end: execEnd,
        currency: col(fields, 'Currency') || 'USD',
        created_at: parseDate(col(fields, 'Execution Board Start Date')) || 
                    parseDate(col(fields, 'Deal Created Date')) || 
                    new Date().toISOString(),
      });
    }

    // Batch upsert
    for (let i = 0; i < teamRows.length; i += BATCH_SIZE) {
      const batch = teamRows.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from("team_kpis")
        .upsert(batch, { onConflict: "monday_id" });

      if (error) {
        errors.push(`Batch ${Math.floor(i / BATCH_SIZE)}: ${error.message}`);
      } else {
        inserted += batch.length;
      }
    }

    return new Response(
      JSON.stringify({ success: true, total: teamRows.length, inserted, errors }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Import error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
