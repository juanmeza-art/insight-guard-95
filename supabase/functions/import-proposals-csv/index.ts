import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

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
        result.push(current.trim());
        current = "";
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
  const n = Number(val.replace(/[^0-9.\-]/g, ""));
  return isNaN(n) ? 0 : n;
}

function parseDate(val: string | undefined): string | null {
  if (!val || val === "") return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(val)) return val.slice(0, 10);
  return null;
}

function parseIntVal(val: string | undefined): number | null {
  if (!val || val === "") return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify webhook secret for import operations
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

    const body = await req.json().catch(() => ({}));
    const filePath = String(body.file_path || "proposals.csv").slice(0, 200);

    // Validate file path - only allow safe characters
    if (!/^[a-zA-Z0-9_\-\.\/]+\.csv$/.test(filePath) || filePath.includes("..")) {
      return new Response(
        JSON.stringify({ error: "Invalid file path" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: fileData, error: dlError } = await supabase.storage
      .from("imports")
      .download(filePath);

    if (dlError || !fileData) {
      return new Response(
        JSON.stringify({ error: "File download failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const text = await fileData.text();
    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      return new Response(
        JSON.stringify({ error: "CSV has no data rows" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit total rows
    if (lines.length > 10001) {
      return new Response(
        JSON.stringify({ error: "CSV too large (max 10000 data rows)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const headers = parseCSVLine(lines[0]);
    const colIndex = (name: string) => headers.indexOf(name);

    const iName = colIndex("Name");
    const iStatus = colIndex("Status");
    const iListBuilder = colIndex("List Builder");
    const iSeller = colIndex("Seller");
    const iCompany = colIndex("Company");
    const iTotalBudget = colIndex("Total Budget");
    const iCreativeBuilder = colIndex("Creative Builder");
    const iDealCreated = colIndex("Deal Created Date");
    const iProposalBoard = colIndex("Proposal Board Start Date");
    const iCSM = colIndex("CSM");
    const iAudienceCountry = colIndex("Audience Country");
    const iMusicalGenre = colIndex("Musical Genre");
    const iInfluencersBudget = colIndex("Influencers Budget");
    const iSubCampaignBudget = colIndex("Sub-Campaign Budget");
    const iTakeRate = colIndex("Take Rate %");
    const iCreatorsExpected = colIndex("# Creators Expected");
    const iCurrency = colIndex("Currency");
    const iAdjustments = colIndex("# Proposal Adjustments");
    const iDeclinedReasons = colIndex("Declined Reasons");
    const iDeliveryDate = colIndex("Proposal Delivery Date");
    const iBuildingStart = colIndex("Building Proposal Start Date");
    const iPendingStart = colIndex("Pending Approval Start Date");
    const iExecutionBoard = colIndex("Execution Board Start Date");
    const iDaysBuilding = colIndex("Days Building Proposal");
    const iTimingDelivery = colIndex("Timing of Delivery");
    const iItemId = colIndex("Item ID");
    const iSellerSLA = colIndex("Seller SLA");
    const iLBSLA = colIndex("LB SLA");

    const target = body.target || "proposals";

    let insertedProposals = 0;
    let insertedAudit = 0;
    let errors = 0;
    const BATCH_SIZE = 200;

    for (let i = 1; i < lines.length; i += BATCH_SIZE) {
      const proposalsBatch: any[] = [];
      const auditBatch: any[] = [];

      for (let j = i; j < Math.min(i + BATCH_SIZE, lines.length); j++) {
        const cols = parseCSVLine(lines[j]);
        const name = iName >= 0 ? cols[iName] : "";
        if (!name) continue;

        const mondayId = iItemId >= 0 ? cols[iItemId] : "";
        const mid = mondayId || `csv-${j}-${Date.now()}`;

        if (target === "proposals" || target === "both") {
          proposalsBatch.push({
            monday_item_id: mid,
            name,
            status: (iStatus >= 0 ? cols[iStatus] : "") || "To Do",
            list_builder: iListBuilder >= 0 ? cols[iListBuilder] || null : null,
            creative_builder: iCreativeBuilder >= 0 ? cols[iCreativeBuilder] || null : null,
            csm: iCSM >= 0 ? cols[iCSM] || null : null,
            seller: iSeller >= 0 ? cols[iSeller] || null : null,
            company: iCompany >= 0 ? cols[iCompany] || null : null,
            total_budget: iTotalBudget >= 0 ? parseNum(cols[iTotalBudget]) : 0,
            influencers_budget: iInfluencersBudget >= 0 ? parseNum(cols[iInfluencersBudget]) : 0,
            sub_campaign_budget: iSubCampaignBudget >= 0 ? parseNum(cols[iSubCampaignBudget]) : 0,
            take_rate_pct: iTakeRate >= 0 ? parseNum(cols[iTakeRate]) : 0,
            creators_expected: iCreatorsExpected >= 0 ? parseNum(cols[iCreatorsExpected]) : 0,
            audience_country: iAudienceCountry >= 0 ? cols[iAudienceCountry] || null : null,
            musical_genre: iMusicalGenre >= 0 ? cols[iMusicalGenre] || null : null,
            currency: (iCurrency >= 0 ? cols[iCurrency] : "") || "USD",
            deal_created_date: iDealCreated >= 0 ? parseDate(cols[iDealCreated]) : null,
            proposal_board_start_date: iProposalBoard >= 0 ? parseDate(cols[iProposalBoard]) : null,
            proposal_delivery_date: iDeliveryDate >= 0 ? parseDate(cols[iDeliveryDate]) : null,
            building_proposal_start_date: iBuildingStart >= 0 ? parseDate(cols[iBuildingStart]) : null,
            pending_approval_start_date: iPendingStart >= 0 ? parseDate(cols[iPendingStart]) : null,
            execution_board_start_date: iExecutionBoard >= 0 ? parseDate(cols[iExecutionBoard]) : null,
            days_building_proposal: iDaysBuilding >= 0 ? parseIntVal(cols[iDaysBuilding]) : null,
            timing_of_delivery: iTimingDelivery >= 0 ? cols[iTimingDelivery] || null : null,
            proposal_adjustments: iAdjustments >= 0 ? parseNum(cols[iAdjustments]) : 0,
            declined_reasons: iDeclinedReasons >= 0 ? cols[iDeclinedReasons] || null : null,
          });
        }

        if (target === "proposals_audit" || target === "both") {
          auditBatch.push({
            monday_id: mid,
            campaign_name: name,
            status: (iStatus >= 0 ? cols[iStatus] : "") || "To Do",
            company: iCompany >= 0 ? cols[iCompany] || null : null,
            seller_name: iSeller >= 0 ? cols[iSeller] || null : null,
            list_builder: iListBuilder >= 0 ? cols[iListBuilder] || null : null,
            csm: iCSM >= 0 ? cols[iCSM] || null : null,
            budget: iTotalBudget >= 0 ? parseNum(cols[iTotalBudget]) : 0,
            take_rate_pct: iTakeRate >= 0 ? parseNum(cols[iTakeRate]) : 0,
            currency: (iCurrency >= 0 ? cols[iCurrency] : "") || "USD",
            audience_country: iAudienceCountry >= 0 ? cols[iAudienceCountry] || null : null,
            musical_genre: iMusicalGenre >= 0 ? cols[iMusicalGenre] || null : null,
            proposal_adjustments: iAdjustments >= 0 ? parseNum(cols[iAdjustments]) : 0,
            building_proposal_start: iBuildingStart >= 0 ? parseDate(cols[iBuildingStart]) : null,
            pending_approval_start: iPendingStart >= 0 ? parseDate(cols[iPendingStart]) : null,
            proposal_delivery_date: iDeliveryDate >= 0 ? parseDate(cols[iDeliveryDate]) : null,
            days_since_pending: iDaysBuilding >= 0 ? parseIntVal(cols[iDaysBuilding]) ?? 0 : 0,
            seller_sla: iSellerSLA >= 0 ? cols[iSellerSLA] || "NO" : "NO",
            lb_sla: iLBSLA >= 0 ? cols[iLBSLA] || "NO" : "NO",
            risk_score: 1,
          });
        }
      }

      if (proposalsBatch.length > 0) {
        const { error } = await supabase
          .from("proposals")
          .upsert(proposalsBatch, { onConflict: "monday_item_id" });
        if (error) {
          console.error(`Proposals batch error at row ${i}:`, error.message);
          errors += proposalsBatch.length;
        } else {
          insertedProposals += proposalsBatch.length;
        }
      }

      if (auditBatch.length > 0) {
        const { error } = await supabase
          .from("proposals_audit")
          .upsert(auditBatch, { onConflict: "monday_id" });
        if (error) {
          console.error(`Audit batch error at row ${i}:`, error.message);
          errors += auditBatch.length;
        } else {
          insertedAudit += auditBatch.length;
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, insertedProposals, insertedAudit, errors, totalRows: lines.length - 1 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Import error:", err);
    return new Response(
      JSON.stringify({ error: "Error processing import" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
