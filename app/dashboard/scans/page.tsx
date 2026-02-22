"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface WalletScan {
  id: string;
  address: string;
  chain: string;
  scan_type: string;
  result: {
    balance?: string;
    txCount?: number;
    riskScore?: number | null;
  };
  risk_indicators: Array<{
    severity: string;
    label: string;
    description: string;
  }>;
  created_at: string;
}

export default function ScansPage() {
  const [scans, setScans] = useState<WalletScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("wallet_scans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setScans((data || []) as WalletScan[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Scan History</h1>
          <p className="mt-1 text-sm text-muted">
            All your past blockchain address scans
          </p>
        </div>
        <Link
          href="/scan"
          className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
        >
          <Search className="h-4 w-4" /> New Scan
        </Link>
      </div>

      {scans.length > 0 ? (
        <div className="flex flex-col gap-4">
          {scans.map((scan) => (
            <div key={scan.id} className="glass-card-premium rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-dark-800 text-xs font-bold text-muted uppercase">
                    {scan.chain}
                  </div>
                  <div>
                    <p className="text-sm font-mono text-foreground truncate max-w-md">
                      {scan.address}
                    </p>
                    <p className="text-xs text-muted">
                      {new Date(scan.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {scan.result?.riskScore !== null &&
                  scan.result?.riskScore !== undefined ? (
                    <div
                      className={`text-xl font-bold ${
                        scan.result.riskScore >= 70
                          ? "text-cyber-red"
                          : scan.result.riskScore >= 40
                            ? "text-cyber-orange"
                            : "text-cyber-green"
                      }`}
                    >
                      {scan.result.riskScore}
                    </div>
                  ) : (
                    <div className="text-xl font-bold text-muted">N/A</div>
                  )}
                  <div className="text-xs text-muted">Risk Score</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted mb-3">
                {scan.result?.balance && <span>Balance: {scan.result.balance}</span>}
                {scan.result?.txCount !== undefined && (
                  <span>Transactions: {scan.result.txCount}</span>
                )}
              </div>

              {scan.risk_indicators && scan.risk_indicators.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {scan.risk_indicators.map((indicator, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        indicator.severity === "critical"
                          ? "bg-cyber-red/10 text-cyber-red border-cyber-red/20"
                          : indicator.severity === "high"
                            ? "bg-cyber-orange/10 text-cyber-orange border-cyber-orange/20"
                            : indicator.severity === "medium"
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      <AlertTriangle className="h-2.5 w-2.5" />
                      {indicator.label}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-cyber-green">
                  <CheckCircle2 className="h-3.5 w-3.5" /> No risk indicators
                  detected
                </div>
              )}

              <div className="mt-3">
                <a
                  href={
                    scan.chain === "eth"
                      ? `https://etherscan.io/address/${scan.address}`
                      : `https://blockstream.info/address/${scan.address}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-cyber-green hover:underline"
                >
                  View on{" "}
                  {scan.chain === "eth" ? "Etherscan" : "Blockstream"}{" "}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card-premium rounded-2xl p-12 text-center">
          <Search className="h-12 w-12 mx-auto mb-4 text-muted opacity-30" />
          <h2 className="text-lg font-bold text-foreground mb-2">
            No scans yet
          </h2>
          <p className="text-sm text-muted mb-6">
            Start scanning blockchain addresses to see results here.
          </p>
          <Link
            href="/scan"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm"
          >
            Start Scanning <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
