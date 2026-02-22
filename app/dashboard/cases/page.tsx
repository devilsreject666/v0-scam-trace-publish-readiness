"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  FileText,
  Loader2,
  ArrowRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface Case {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "bg-cyber-green/10 text-cyber-green border-cyber-green/20",
    in_progress: "bg-cyber-blue/10 text-cyber-blue border-cyber-blue/20",
    closed: "bg-muted/10 text-muted border-border",
    resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  const icons: Record<string, React.ReactNode> = {
    open: <AlertTriangle className="h-2.5 w-2.5" />,
    in_progress: <Clock className="h-2.5 w-2.5" />,
    closed: <XCircle className="h-2.5 w-2.5" />,
    resolved: <CheckCircle2 className="h-2.5 w-2.5" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${styles[status] || styles.open}`}
    >
      {icons[status] || icons.open}
      {status.replace("_", " ")}
    </span>
  );
}

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("cases")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setCases((data || []) as Case[]);
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
          <h1 className="text-2xl font-bold text-foreground">Your Cases</h1>
          <p className="mt-1 text-sm text-muted">
            Track and manage your investigation cases
          </p>
        </div>
        <Link
          href="/report"
          className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
        >
          <AlertTriangle className="h-4 w-4" /> Report Scam
        </Link>
      </div>

      {cases.length > 0 ? (
        <div className="flex flex-col gap-4">
          {cases.map((c) => (
            <div key={c.id} className="glass-card-premium rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-bold text-foreground">
                      {c.title}
                    </h3>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-sm text-muted line-clamp-2">
                    {c.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">
                  Created: {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card-premium rounded-2xl p-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted opacity-30" />
          <h2 className="text-lg font-bold text-foreground mb-2">
            No cases yet
          </h2>
          <p className="text-sm text-muted mb-6">
            Submit a scam report to open your first case.
          </p>
          <Link
            href="/report"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm"
          >
            Report a Scam <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
