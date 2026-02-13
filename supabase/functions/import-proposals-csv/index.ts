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
    const colIndex = (name: string, ...aliases: string[]) => {
      let idx = headers.indexOf(name);
      for (const a of aliases) { if (idx < 0) idx = headers.indexOf(a); }
      return idx;
    };

    // Detect format: DB export uses "campaign_name", Monday uses "Name"
    const isDbFormat = headers.includes("campaign_name");

    const iName = isDbFormat ? colIndex("campaign_name") : colIndex("Name");
    const iStatus = colIndex("Status", "status");
    const iListBuilder = colIndex("List Builder", "list_builder");
    const iSeller = colIndex("Seller", "seller_name", "seller");
    const iCompany = colIndex("Company", "company");
    const iTotalBudget = colIndex("Total Budget", "budget", "total_budget");
    const iCreativeBuilder = colIndex("Creative Builder", "creative_builder");
    const iDealCreated = colIndex("Deal Created Date", "deal_created_date");
    const iProposalBoard = colIndex("Proposal Board Start Date", "proposal_board_start_date");
    const iCSM = colIndex("CSM", "csm");
    const iAudienceCountry = colIndex("Audience Country", "audience_country");
    const iMusicalGenre = colIndex("Musical Genre", "musical_genre");
    const iInfluencersBudget = colIndex("Influencers Budget", "influencers_budget");
    const iSubCampaignBudget = colIndex("Sub-Campaign Budget", "sub_campaign_budget");
    const iTakeRate = colIndex("Take Rate %", "take_rate_pct");
    const iCreatorsExpected = colIndex("# Creators Expected", "creators_expected");
    const iCurrency = colIndex("Currency", "currency");
    const iAdjustments = colIndex("# Proposal Adjustments", "proposal_adjustments");
    const iDeclinedReasons = colIndex("Declined Reasons", "declined_reasons");
    const iDeliveryDate = colIndex("Proposal Delivery Date", "proposal_delivery_date");
    const iBuildingStart = colIndex("Building Proposal Start Date", "building_proposal_start");
    const iPendingStart = colIndex("Pending Approval Start Date", "pending_approval_start");
    const iExecutionBoard = colIndex("Execution Board Start Date", "Execution board start date");
    const iDaysBuilding = colIndex("Days Building Proposal", "days_building_proposal");
    const iTimingDelivery = colIndex("Timing of Delivery", "timing_of_delivery");
    const iItemId = colIndex("Item ID", "monday_id");
    const iSellerSLA = colIndex("Seller SLA", "seller_sla");
    const iLBSLA = colIndex("LB SLA", "lb_sla");
    const iDaysAfterApproved = colIndex("days_after_approved");

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
            days_after_approved: iDaysAfterApproved >= 0 ? parseNum(cols[iDaysAfterApproved]) : null,
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
