"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PLANS, getScansRemaining, type PlanKey } from "@/lib/plans";
import {
  Shield,
  Search,
  FileText,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

interface DashboardData {
  profile: {
    full_name: string;
    plan: PlanKey;
    scan_count_month: number;
    scan_month: string;
  } | null;
  recentScans: Array<{
    id: string;
    address: string;
    chain: string;
    created_at: string;
    risk_indicators: Array<{ severity: string; label: string }>;
  }>;
  caseCount: number;
  pendingProtections: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const [profileRes, scansRes, casesRes, protectRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, plan, scan_count_month, scan_month")
          .eq("id", user.id)
          .single(),
        supabase
          .from("wallet_scans")
          .select("id, address, chain, created_at, risk_indicators")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("cases")
          .select("id", { count: "exact" })
          .eq("user_id", user.id),
        supabase
          .from("cooling_off_transactions")
          .select("id", { count: "exact" })
          .eq("user_id", user.id)
          .eq("status", "pending"),
      ]);

      setData({
        profile: profileRes.data as DashboardData["profile"],
        recentScans: (scansRes.data || []) as DashboardData["recentScans"],
        caseCount: casesRes.count || 0,
        pendingProtections: protectRes.count || 0,
      });
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-pulse-glow rounded-xl p-8 glass-card">
          <Shield className="h-8 w-8 text-cyber-green/50 mx-auto animate-pulse" />
          <p className="mt-3 text-sm text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const plan = (data?.profile?.plan || "free") as PlanKey;
  const scanCount = data?.profile?.scan_count_month || 0;
  const scansRemaining = getScansRemaining(plan, scanCount);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back,{" "}
          <span className="gradient-text">
            {data?.profile?.full_name || "Investigator"}
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Your investigation dashboard overview
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="glass-card-premium rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyber-green/10">
              <Search className="h-5 w-5 text-cyber-green" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {scanCount}
              </div>
              <div className="text-xs text-muted">Scans This Month</div>
            </div>
          </div>
          {scansRemaining !== null && (
            <div className="text-xs text-muted-foreground">
              {scansRemaining} remaining ({PLANS[plan].scans} total)
            </div>
          )}
          {scansRemaining === null && (
            <div className="text-xs text-cyber-green">Unlimited scans</div>
          )}
        </div>

        <div className="glass-card-premium rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyber-blue/10">
              <FileText className="h-5 w-5 text-cyber-blue" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {data?.caseCount || 0}
              </div>
              <div className="text-xs text-muted">Active Cases</div>
            </div>
          </div>
        </div>

        <div className="glass-card-premium rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyber-orange/10">
              <Clock className="h-5 w-5 text-cyber-orange" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {data?.pendingProtections || 0}
              </div>
              <div className="text-xs text-muted">Pending Holds</div>
            </div>
          </div>
        </div>

        <div className="glass-card-premium rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground capitalize">
                {plan}
              </div>
              <div className="text-xs text-muted">Current Plan</div>
            </div>
          </div>
          {plan === "free" && (
            <Link
              href="/pricing"
              className="text-xs text-cyber-green hover:underline"
            >
              Upgrade plan
            </Link>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Link
          href="/scan"
          className="glass-card-premium rounded-xl p-6 flex items-center gap-4 hover:border-cyber-green/20 transition"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyber-green/10">
            <Search className="h-6 w-6 text-cyber-green" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">New Scan</h3>
            <p className="text-xs text-muted">
              Scan a wallet address for risk
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted ml-auto" />
        </Link>

        <Link
          href="/report"
          className="glass-card-premium rounded-xl p-6 flex items-center gap-4 hover:border-cyber-blue/20 transition"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyber-blue/10">
            <AlertTriangle className="h-6 w-6 text-cyber-blue" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Report Scam</h3>
            <p className="text-xs text-muted">Submit a new scam report</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted ml-auto" />
        </Link>

        <Link
          href="/protect"
          className="glass-card-premium rounded-xl p-6 flex items-center gap-4 hover:border-cyber-orange/20 transition"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyber-orange/10">
            <Shield className="h-6 w-6 text-cyber-orange" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Protect Transaction
            </h3>
            <p className="text-xs text-muted">Add cooling-off hold</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted ml-auto" />
        </Link>
      </div>

      {/* Recent scans */}
      <div className="glass-card-premium rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Recent Scans</h2>
          <Link
            href="/dashboard/scans"
            className="text-xs text-cyber-green hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {data?.recentScans && data.recentScans.length > 0 ? (
          <div className="flex flex-col gap-3">
            {data.recentScans.map((scan) => (
              <div
                key={scan.id}
                className="glass-card rounded-lg p-4 flex items-center gap-4"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dark-800 text-xs font-bold text-muted uppercase">
                  {scan.chain}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-mono text-foreground truncate">
                    {scan.address}
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(scan.created_at).toLocaleString()}
                  </p>
                </div>
                {scan.risk_indicators && scan.risk_indicators.length > 0 ? (
                  <div className="flex items-center gap-1.5 text-xs text-cyber-orange">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {scan.risk_indicators.length} risk
                    {scan.risk_indicators.length > 1 ? "s" : ""}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-cyber-green">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Clean
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted">
            <Search className="h-8 w-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No scans yet. Start by scanning an address.</p>
            <Link
              href="/scan"
              className="mt-3 inline-flex items-center gap-1 text-sm text-cyber-green hover:underline"
            >
              Scan now <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
