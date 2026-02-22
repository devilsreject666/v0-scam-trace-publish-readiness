"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/client";
import {
  Shield,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Timer,
} from "lucide-react";

interface CoolingTransaction {
  id: string;
  destination_wallet: string;
  amount: number;
  blockchain: string;
  delay_minutes: number;
  status: string;
  created_at: string;
  unlock_at: string;
  resolved_at: string | null;
}

export default function ProtectPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<CoolingTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [form, setForm] = useState({
    destinationWallet: "",
    amount: "",
    delayMinutes: 30,
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoadingTx(false);
      return;
    }

    const { data } = await supabase
      .from("cooling_off_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    setTransactions((data || []) as CoolingTransaction[]);
    setLoadingTx(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/protect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create hold");
        return;
      }

      setSuccess(data.message);
      setForm({ destinationWallet: "", amount: "", delayMinutes: 30 });
      loadTransactions();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (txId: string, action: "approve" | "cancel") => {
    try {
      const res = await fetch("/api/protect", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: txId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      loadTransactions();
    } catch {
      setError("Failed to update transaction.");
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-24 grid-bg">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-12">
          <div className="text-center mb-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-orange/20 bg-cyber-orange/[0.06] px-4 py-1.5">
              <Shield className="h-3.5 w-3.5 text-cyber-orange" />
              <span className="text-xs font-medium text-cyber-orange">
                Cooling-Off Protection
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl text-balance">
              Pre-Send <span className="gradient-text">Transaction Hold</span>
            </h1>
            <p className="mt-3 max-w-xl mx-auto text-muted">
              Add a time-delayed hold before sending crypto. Cancel anytime
              during the cooling-off period if something feels wrong.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="glass-card-premium rounded-2xl p-8 mb-10"
          >
            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Destination Wallet Address
                </label>
                <input
                  type="text"
                  value={form.destinationWallet}
                  onChange={(e) =>
                    setForm({ ...form, destinationWallet: e.target.value })
                  }
                  required
                  placeholder="0x... or 1.../3.../bc1..."
                  className="w-full rounded-xl border border-border bg-dark-900 px-4 py-3 text-sm font-mono text-foreground placeholder-muted-foreground outline-none focus:border-cyber-green/50 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Amount
                  </label>
                  <input
                    type="text"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    required
                    placeholder="e.g. 0.5"
                    className="w-full rounded-xl border border-border bg-dark-900 px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-cyber-green/50 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Delay (minutes)
                  </label>
                  <select
                    value={form.delayMinutes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        delayMinutes: parseInt(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-border bg-dark-900 px-4 py-3 text-sm text-foreground outline-none focus:border-cyber-green/50 transition"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-cyber-red text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-cyber-green text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating
                    hold...
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4" /> Create Cooling-Off Hold
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="glass-card-premium rounded-2xl p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Your Transaction Holds
            </h2>
            {loadingTx ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted" />
              </div>
            ) : transactions.length > 0 ? (
              <div className="flex flex-col gap-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {tx.status === "pending" && (
                          <Timer className="h-4 w-4 text-cyber-orange" />
                        )}
                        {tx.status === "approved" && (
                          <CheckCircle2 className="h-4 w-4 text-cyber-green" />
                        )}
                        {tx.status === "cancelled" && (
                          <XCircle className="h-4 w-4 text-muted" />
                        )}
                        {tx.status === "expired" && (
                          <Clock className="h-4 w-4 text-muted" />
                        )}
                        <span className="text-sm font-bold text-foreground capitalize">
                          {tx.status}
                        </span>
                      </div>
                      <span className="text-xs text-muted">
                        {new Date(tx.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-muted mb-2 truncate">
                      To: {tx.destination_wallet}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">
                        {tx.amount} {tx.blockchain.toUpperCase()}
                      </span>
                      {tx.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted">
                            Unlocks:{" "}
                            {new Date(tx.unlock_at).toLocaleTimeString()}
                          </span>
                          <button
                            onClick={() => handleAction(tx.id, "cancel")}
                            className="rounded-lg bg-cyber-red/10 px-3 py-1.5 text-xs font-medium text-cyber-red hover:bg-cyber-red/20 transition"
                          >
                            Cancel
                          </button>
                          {new Date(tx.unlock_at) <= new Date() && (
                            <button
                              onClick={() => handleAction(tx.id, "approve")}
                              className="rounded-lg bg-cyber-green/10 px-3 py-1.5 text-xs font-medium text-cyber-green hover:bg-cyber-green/20 transition"
                            >
                              Release
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted">
                <Shield className="h-8 w-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No transaction holds yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
