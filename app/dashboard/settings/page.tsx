"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PLANS, type PlanKey } from "@/lib/plans";
import Link from "next/link";
import {
  Shield,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

interface ProfileData {
  full_name: string;
  email: string;
  plan: PlanKey;
  scan_count_month: number;
  stripe_customer_id: string | null;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name, plan, scan_count_month, stripe_customer_id")
        .eq("id", user.id)
        .single();

      if (data) {
        const p = {
          ...data,
          email: user.email || "",
        } as ProfileData;
        setProfile(p);
        setName(p.full_name || "");
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ full_name: name })
      .eq("id", user.id);

    setSuccess(true);
    setSaving(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  const plan = profile?.plan || "free";
  const scanLimit = PLANS[plan].scans;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-foreground mb-8">
        Account Settings
      </h1>

      <div className="flex flex-col gap-8">
        <div className="glass-card-premium rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Profile</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-dark-900 px-4 py-3 text-sm text-foreground outline-none focus:border-cyber-green/50 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="w-full rounded-xl border border-border bg-dark-800 px-4 py-3 text-sm text-muted cursor-not-allowed"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </button>
              {success && (
                <span className="flex items-center gap-1 text-sm text-cyber-green">
                  <CheckCircle2 className="h-4 w-4" /> Saved
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card-premium rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Subscription
          </h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyber-green" />
                <span className="text-base font-bold text-foreground capitalize">
                  {plan} Plan
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">
                {scanLimit === Infinity
                  ? "Unlimited scans per month"
                  : `${scanLimit} scans per month (${profile?.scan_count_month || 0} used)`}
              </p>
            </div>
            {plan === "free" && (
              <Link
                href="/pricing"
                className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
              >
                Upgrade <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
          {profile?.stripe_customer_id && (
            <p className="text-xs text-muted-foreground">
              Billing managed through Stripe. Contact support to manage your
              subscription.
            </p>
          )}
        </div>

        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-2">
            Danger Zone
          </h2>
          <p className="text-sm text-muted mb-4">
            Contact support to delete your account and all associated data.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" />
            This action is permanent and cannot be undone.
          </div>
        </div>
      </div>
    </div>
  );
}
