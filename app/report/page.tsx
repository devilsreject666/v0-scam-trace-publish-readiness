"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/client";
import {
  AlertTriangle,
  Upload,
  Loader2,
  CheckCircle2,
  ArrowRight,
  FileText,
} from "lucide-react";

export default function ReportPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    scamType: "",
    scammerWallet: "",
    amount: "",
    blockchain: "eth",
    description: "",
    contactMethod: "",
    evidenceText: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Please sign in to submit a report.");
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from("cases").insert({
        user_id: user.id,
        title: `${form.scamType} - ${form.scammerWallet.slice(0, 10)}...`,
        description: form.description,
        status: "open",
      });

      if (insertError) {
        setError("Failed to submit report. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-24 grid-bg">
          <div className="mx-auto max-w-2xl px-4 pt-16 text-center">
            <div className="glass-card-premium rounded-2xl p-12">
              <CheckCircle2 className="h-16 w-16 text-cyber-green mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-foreground mb-3">
                Report Submitted
              </h1>
              <p className="text-muted mb-6">
                Your scam report has been filed and a case has been opened. You
                can track its progress from your dashboard.
              </p>
              <Link
                href="/dashboard"
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-24 grid-bg">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-12">
          <div className="text-center mb-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-red/20 bg-cyber-red/[0.06] px-4 py-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-cyber-red" />
              <span className="text-xs font-medium text-cyber-red">
                Scam Report Portal
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl text-balance">
              Report a <span className="gradient-text">Crypto Scam</span>
            </h1>
            <p className="mt-3 max-w-xl mx-auto text-muted">
              Submit details about the scam. Your report will create a case that
              you can track and add evidence to from your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="glass-card-premium rounded-2xl p-8">
            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Scam Type
                </label>
                <select
                  value={form.scamType}
                  onChange={(e) =>
                    setForm({ ...form, scamType: e.target.value })
                  }
                  required
                  className="w-full rounded-xl border border-border bg-dark-900 px-4 py-3 text-sm text-foreground outline-none focus:border-cyber-green/50 transition"
                >
                  <option value="">Select scam type...</option>
                  <option value="Investment Fraud">Investment Fraud</option>
                  <option value="Phishing">Phishing</option>
                  <option value="Rug Pull">Rug Pull</option>
                  <option value="Romance Scam">Romance Scam</option>
                  <option value="Fake Exchange">Fake Exchange</option>
                  <option value="Ponzi Scheme">Ponzi Scheme</option>
                  <option value="Impersonation">Impersonation</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Scammer Wallet Address
                </label>
                <input
                  type="text"
                  value={form.scammerWallet}
                  onChange={(e) =>
                    setForm({ ...form, scammerWallet: e.target.value })
                  }
                  required
                  placeholder="0x... or 1.../3.../bc1..."
                  className="w-full rounded-xl border border-border bg-dark-900 px-4 py-3 text-sm font-mono text-foreground placeholder-muted-foreground outline-none focus:border-cyber-green/50 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Amount Lost
                  </label>
                  <input
                    type="text"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    placeholder="e.g. 0.5 ETH"
                    className="w-full rounded-xl border border-border bg-dark-900 px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-cyber-green/50 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Blockchain
                  </label>
                  <select
                    value={form.blockchain}
                    onChange={(e) =>
                      setForm({ ...form, blockchain: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-dark-900 px-4 py-3 text-sm text-foreground outline-none focus:border-cyber-green/50 transition"
                  >
                    <option value="eth">Ethereum</option>
                    <option value="btc">Bitcoin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  How did the scammer contact you?
                </label>
                <input
                  type="text"
                  value={form.contactMethod}
                  onChange={(e) =>
                    setForm({ ...form, contactMethod: e.target.value })
                  }
                  placeholder="e.g. Telegram, Twitter DM, email"
                  className="w-full rounded-xl border border-border bg-dark-900 px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-cyber-green/50 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Describe what happened
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                  rows={5}
                  placeholder="Provide as much detail as possible: timeline of events, promises made, links shared, etc."
                  className="w-full rounded-xl border border-border bg-dark-900 px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-cyber-green/50 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Paste any evidence (chat logs, URLs, transaction hashes)
                </label>
                <textarea
                  value={form.evidenceText}
                  onChange={(e) =>
                    setForm({ ...form, evidenceText: e.target.value })
                  }
                  rows={4}
                  placeholder="Paste chat messages, suspicious URLs, tx hashes, or any other evidence"
                  className="w-full rounded-xl border border-border bg-dark-900 px-4 py-3 text-sm font-mono text-foreground placeholder-muted-foreground outline-none focus:border-cyber-green/50 transition resize-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-cyber-red text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                  {error.includes("sign in") && (
                    <Link
                      href="/auth/login"
                      className="text-cyber-green hover:underline ml-1"
                    >
                      Sign in
                    </Link>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" /> Submit Report
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 glass-card rounded-xl p-6">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-cyber-blue flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">
                  What happens after you report?
                </h3>
                <ul className="flex flex-col gap-1.5 text-xs text-muted">
                  <li>1. A case is created in your dashboard with the scam details</li>
                  <li>2. You can add additional evidence, chat logs, and screenshots</li>
                  <li>3. Use the Evidence Builder to generate freeze-ready packets</li>
                  <li>4. Export documentation for law enforcement or exchange submissions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
