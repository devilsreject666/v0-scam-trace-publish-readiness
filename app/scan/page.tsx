"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Search,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import type { ScanResult, RiskIndicator } from "@/lib/blockchain/types";

function RiskBadge({ severity }: { severity: RiskIndicator["severity"] }) {
  const styles = {
    low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    high: "bg-cyber-orange/10 text-cyber-orange border-cyber-orange/20",
    critical: "bg-cyber-red/10 text-cyber-red border-cyber-red/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[severity]}`}
    >
      {severity}
    </span>
  );
}

export default function ScanPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scansUsed, setScansUsed] = useState<number | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.limit) {
          setError(data.error);
        } else if (res.status === 401) {
          setError("Please sign in to scan addresses.");
        } else {
          setError(data.error || "Scan failed");
        }
        return;
      }

      setResult(data.result);
      setScansUsed(data.scansUsed);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number | null) => {
    if (score === null) return "text-muted";
    if (score >= 70) return "text-cyber-red";
    if (score >= 40) return "text-cyber-orange";
    if (score >= 20) return "text-yellow-400";
    return "text-cyber-green";
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-24 grid-bg">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-12">
          <div className="text-center mb-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-green/20 bg-cyber-green/[0.06] px-4 py-1.5">
              <Search className="h-3.5 w-3.5 text-cyber-green" />
              <span className="text-xs font-medium text-cyber-green">
                Wallet Risk Scanner
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl text-balance">
              Scan Any <span className="gradient-text">Blockchain Address</span>
            </h1>
            <p className="mt-3 max-w-xl mx-auto text-muted">
              Enter an Ethereum (0x...) or Bitcoin (1.../3.../bc1...) address to
              get an instant risk assessment.
            </p>
          </div>

          <form onSubmit={handleScan} className="mb-10">
            <div className="glass-card-premium rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
                    className="w-full rounded-xl border border-border bg-dark-900 py-4 pl-12 pr-4 text-sm font-mono text-foreground placeholder-muted-foreground outline-none focus:border-cyber-green/50 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !address.trim()}
                  className="btn-primary px-8 py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Scanning...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" /> Scan Address
                    </>
                  )}
                </button>
              </div>
              {scansUsed !== null && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Scans used this month: {scansUsed}
                </p>
              )}
            </div>
          </form>

          {error && (
            <div className="mb-8 glass-card rounded-xl p-6">
              <div className="flex items-center gap-3 text-cyber-red">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{error}</p>
                  {error.includes("sign in") && (
                    <Link
                      href="/auth/login"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-cyber-green hover:underline"
                    >
                      Sign in <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                  {error.includes("limit") && (
                    <Link
                      href="/pricing"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-cyber-green hover:underline"
                    >
                      Upgrade plan <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="glass-card-premium rounded-2xl p-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Scan Results
                  </h2>
                  <p className="text-xs font-mono text-muted mt-1 break-all">
                    {result.address}
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className={`text-3xl font-extrabold ${getRiskColor(result.riskScore)}`}
                  >
                    {result.riskScore !== null
                      ? result.riskScore
                      : "N/A"}
                  </div>
                  <div className="text-xs text-muted">Risk Score</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="glass-card rounded-lg p-3">
                  <div className="text-xs text-muted mb-1">Chain</div>
                  <div className="text-sm font-bold text-foreground uppercase">
                    {result.chain}
                  </div>
                </div>
                <div className="glass-card rounded-lg p-3">
                  <div className="text-xs text-muted mb-1">Balance</div>
                  <div className="text-sm font-bold text-foreground">
                    {result.balance || "Unknown"}
                  </div>
                </div>
                <div className="glass-card rounded-lg p-3">
                  <div className="text-xs text-muted mb-1">Transactions</div>
                  <div className="text-sm font-bold text-foreground">
                    {result.txCount ?? "Unknown"}
                  </div>
                </div>
                <div className="glass-card rounded-lg p-3">
                  <div className="text-xs text-muted mb-1">First Seen</div>
                  <div className="text-sm font-bold text-foreground">
                    {result.firstSeen
                      ? new Date(result.firstSeen).toLocaleDateString()
                      : "Unknown"}
                  </div>
                </div>
              </div>

              {result.riskIndicators.length > 0 ? (
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3">
                    Risk Indicators
                  </h3>
                  <div className="flex flex-col gap-3">
                    {result.riskIndicators.map((indicator, idx) => (
                      <div
                        key={idx}
                        className="glass-card rounded-lg p-4 flex items-start gap-3"
                      >
                        <AlertTriangle
                          className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                            indicator.severity === "critical"
                              ? "text-cyber-red"
                              : indicator.severity === "high"
                                ? "text-cyber-orange"
                                : indicator.severity === "medium"
                                  ? "text-yellow-400"
                                  : "text-emerald-400"
                          }`}
                        />
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-foreground">
                              {indicator.label}
                            </span>
                            <RiskBadge severity={indicator.severity} />
                          </div>
                          <p className="text-xs text-muted">
                            {indicator.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-muted">
                  <CheckCircle2 className="h-5 w-5 text-cyber-green" />
                  <p className="text-sm">
                    Insufficient intelligence to assess risk. No known risk
                    indicators detected from available data sources.
                  </p>
                </div>
              )}

              <div className="mt-6 flex items-center gap-4">
                <a
                  href={
                    result.chain === "eth"
                      ? `https://etherscan.io/address/${result.address}`
                      : `https://blockstream.info/address/${result.address}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-cyber-green hover:underline"
                >
                  View on{" "}
                  {result.chain === "eth" ? "Etherscan" : "Blockstream"}{" "}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
