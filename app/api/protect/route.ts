import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { detectChain } from "@/lib/blockchain";

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
    const { destinationWallet, amount, delayMinutes = 30 } = body;

    if (!destinationWallet || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const chain = detectChain(destinationWallet);
    if (!chain) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    const delay = Math.min(60, Math.max(15, delayMinutes));
    const unlockAt = new Date(Date.now() + delay * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("cooling_off_transactions")
      .insert({
        user_id: user.id,
        destination_wallet: destinationWallet,
        amount: parseFloat(amount),
        blockchain: chain,
        delay_minutes: delay,
        status: "pending",
        unlock_at: unlockAt,
      })
      .select()
      .single();

    if (error) {
      console.error("Protect insert error:", error);
      return NextResponse.json(
        { error: "Failed to create cooling-off hold" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction: data,
      unlockAt,
      message: `Transaction held for ${delay} minutes. You can cancel anytime before ${new Date(unlockAt).toLocaleTimeString()}.`,
    });
  } catch (error) {
    console.error("Protect error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { transactionId, action } = body;

    if (!transactionId || !["approve", "cancel"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { data: txn } = await supabase
      .from("cooling_off_transactions")
      .select("*")
      .eq("id", transactionId)
      .eq("user_id", user.id)
      .single();

    if (!txn) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (txn.status !== "pending") {
      return NextResponse.json(
        { error: "Transaction already resolved" },
        { status: 400 }
      );
    }

    if (action === "approve" && new Date(txn.unlock_at) > new Date()) {
      return NextResponse.json(
        { error: "Cooling-off period has not expired yet" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("cooling_off_transactions")
      .update({
        status: action === "approve" ? "approved" : "cancelled",
        resolved_at: new Date().toISOString(),
      })
      .eq("id", transactionId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update transaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, transaction: data });
  } catch (error) {
    console.error("Protect PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
