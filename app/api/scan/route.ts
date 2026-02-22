import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scanAddress, detectChain } from "@/lib/blockchain";
import { canScan, type PlanKey } from "@/lib/plans";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const chain = detectChain(address.trim());
    if (!chain) {
      return NextResponse.json(
        { error: "Invalid address format. Supported: ETH (0x...) or BTC (1.../3.../bc1...)" },
        { status: 400 }
      );
    }

    // Check plan limits
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, scan_count_month, scan_month")
      .eq("id", user.id)
      .single();

    const plan = (profile?.plan || "free") as PlanKey;
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    let scanCount = profile?.scan_count_month || 0;

    // Reset count if new month
    if (profile?.scan_month !== currentMonth) {
      scanCount = 0;
    }

    if (!canScan(plan, scanCount)) {
      return NextResponse.json(
        {
          error: "Monthly scan limit reached. Upgrade your plan for more scans.",
          limit: true,
        },
        { status: 429 }
      );
    }

    // Perform the scan
    const result = await scanAddress(address.trim(), chain);

    // Log the scan and increment count
    await supabase.from("wallet_scans").insert({
      user_id: user.id,
      address: address.trim(),
      chain,
      scan_type: "address",
      result,
      risk_indicators: result.riskIndicators,
    });

    // Update scan count
    await supabase
      .from("profiles")
      .update({
        scan_count_month: scanCount + 1,
        scan_month: currentMonth,
      })
      .eq("id", user.id);

    return NextResponse.json({
      success: true,
      result,
      scansUsed: scanCount + 1,
    });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
