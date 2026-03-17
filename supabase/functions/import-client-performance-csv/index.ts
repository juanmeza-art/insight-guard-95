import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] ?? "").trim();
    });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
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
      } else if (ch === ",") {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify webhook secret
  const secret = req.headers.get("x-webhook-secret");
  const expectedSecret = Deno.env.get("WEBHOOK_SECRET");
  if (!expectedSecret) {
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  if (secret !== expectedSecret) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Download CSV from storage
    const { data: file, error: dlErr } = await supabase.storage
      .from("imports")
      .download("client_performance_import.csv");

    if (dlErr || !file) {
      return new Response(
        JSON.stringify({ error: "CSV not found in storage", details: dlErr }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const text = await file.text();
    const rows = parseCSV(text);
    console.log(`Parsed ${rows.length} rows`);

    const safeNum = (v: string | undefined, def = 0): number => {
      if (!v || v === "") return def;
      const n = Number(v);
      return isNaN(n) || !isFinite(n) ? def : n;
    };

    const safeStr = (v: string | undefined): string | null =>
      v && v !== "" ? v.slice(0, 500) : null;

    const mapped = rows.map((r) => ({
      monday_id: safeStr(r["monday_id"]),
      campaign_name: safeStr(r["campaign_name"]),
      company: safeStr(r["company"]),
      sal_status: safeStr(r["status"]) ?? "Ongoing",
      target_value: Math.round(safeNum(r["budget"])),
      executed_take_rate_pct: safeNum(r["take_rate_pct"]),
      execution_start: safeStr(r["building_proposal_start"]),
      execution_end: safeStr(r["Execution board start date"]),
      team_name: safeStr(r["seller_name"]),
    }));

    // Batch upsert in chunks of 500
    const chunkSize = 500;
    let total = 0;
    for (let i = 0; i < mapped.length; i += chunkSize) {
      const chunk = mapped.slice(i, i + chunkSize);
      const { error } = await supabase
        .from("client_performance")
        .upsert(chunk, { onConflict: "monday_id" });
      if (error) {
        console.error("Upsert error at chunk", i, error);
        return new Response(
          JSON.stringify({ error: "Upsert failed", details: error, at: i }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      total += chunk.length;
    }

    return new Response(
      JSON.stringify({ success: true, count: total }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Import error:", err);
    return new Response(
      JSON.stringify({ error: "Processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
