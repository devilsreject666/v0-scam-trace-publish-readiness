"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Zap,
  Shield,
  Crown,
  Star,
  Lock,
  CreditCard,

} from "lucide-react";
import { Disclaimer } from "./disclaimer";
import { PLANS } from "@/lib/plans";

const plans = [
  {
    name: "Free",
    productId: "free" as const,
    icon: Shield,
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Basic monitoring for personal use",
    color: "from-slate-400 to-slate-500",
    features: [
      `${PLANS.free.scans} address scans per month`,
      "Basic risk scoring",
      "Single blockchain support",
      "Community support",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Starter",
    productId: "starter" as const,
    icon: Zap,
    monthlyPrice: 9,
    yearlyPrice: 7,
    description: "Evidence templates & basic tools",
    color: "from-cyber-green to-emerald-500",
    features: [
      `${PLANS.starter.scans} address scans per month`,
      "Risk indicator analysis",
      "ETH & BTC blockchain support",
      "Evidence templates",
      "Scan history dashboard",
      "Email support",
    ],
    cta: "Start 14-Day Free Trial",
    popular: false,
  },
  {
    name: "Pro",
    productId: "pro" as const,
    icon: Star,
    monthlyPrice: 19,
    yearlyPrice: 15,
    description: "Scam reports & monitoring dashboard",
    color: "from-cyber-blue to-blue-400",
    features: [
      "Unlimited address scans",
      "ETH & BTC blockchain support",
      "Transaction history analysis",
      "Scam report submission",
      "Full monitoring dashboard",
      "Cooling-off protection",
      "Evidence exports (PDF)",
      "Priority support",
    ],
    cta: "Start 14-Day Free Trial",
    popular: true,
  },
  {
    name: "Investigator",
    productId: "investigator" as const,
    icon: Crown,
    monthlyPrice: 49,
    yearlyPrice: 39,
    description: "Full suite & live monitoring",
    color: "from-accent to-blue-300",
    features: [
      "Everything in Pro",
      "Unlimited scans & reports",
      "Advanced risk indicators",
      "Auto evidence packet generation",
      "Case management dashboard",
      "Cooling-off with custom delays",
      "Full scan history & exports",
      "BTC & ETH deep analysis",
      "Dedicated support",
    ],
    cta: "Start Investigation",
    popular: false,
  },
];

export function Pricing() {
  const [yearly, setYearly] = useState(true);

  const handleSelectPlan = async (plan: (typeof plans)[0]) => {
    if (plan.productId === "free") {
      window.location.href = "/auth/sign-up";
      return;
    }
    // Redirect to API checkout
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: plan.productId,
        yearly,
      }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <section id="pricing" className="relative py-24 grid-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-0 h-[600px] w-[600px] rounded-full bg-accent/[0.03] blur-[160px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.06] px-4 py-1.5">
            <span className="text-xs font-medium text-accent">
              Subscription Plans
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl lg:text-5xl text-balance">
            Choose Your <span className="gradient-text">Plan</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            From individual monitoring to professional investigation tools.
            Start free, upgrade anytime.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-dark-800/80 p-1.5 backdrop-blur">
            <button
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                !yearly
                  ? "bg-white/10 text-foreground shadow-lg"
                  : "text-muted hover:text-foreground/80"
              }`}
              onClick={() => setYearly(false)}
            >
              Monthly
            </button>
            <button
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                yearly
                  ? "bg-gradient-to-r from-cyber-green to-cyber-blue text-dark-900 shadow-lg shadow-cyber-green/20"
                  : "text-muted hover:text-foreground/80"
              }`}
              onClick={() => setYearly(true)}
            >
              Yearly{" "}
              <span className="ml-1 rounded-full bg-dark-900/30 px-2 py-0.5 text-[10px] font-bold">
                {"-20%"}
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative glass-card-premium rounded-2xl p-6 flex flex-col ${
                plan.popular
                  ? "ring-2 ring-cyber-green/30 bg-cyber-green/[0.02]"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyber-green to-cyber-blue px-5 py-1.5 text-xs font-bold text-dark-900 shadow-lg shadow-cyber-green/20">
                  Most Popular
                </div>
              )}

              <div
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${plan.color} shadow-lg`}
              >
                <plan.icon
                  className="h-5 w-5 text-dark-900"
                  strokeWidth={2.5}
                />
              </div>

              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted">{plan.description}</p>

              <div className="my-6">
                {plan.monthlyPrice === 0 ? (
                  <div className="text-3xl font-extrabold text-foreground">
                    $0
                    <span className="text-base font-normal text-muted">
                      /mo
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-extrabold text-foreground">
                      ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                      <span className="text-base font-normal text-muted">
                        /mo
                      </span>
                    </div>
                    {yearly && (
                      <div className="mt-1 text-xs text-cyber-green">
                        Save $
                        {(plan.monthlyPrice - plan.yearlyPrice) * 12}/year
                      </div>
                    )}
                  </>
                )}
              </div>

              <ul className="mb-8 flex-grow flex flex-col gap-3">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-sm text-foreground/80"
                  >
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyber-green" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full rounded-xl py-3 text-sm font-bold transition-all ${
                  plan.popular
                    ? "btn-primary shadow-lg"
                    : "border border-border bg-white/5 text-foreground hover:bg-white/10 hover:border-white/20"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              No credit card for free trial
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              Secured by Stripe
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              {"Real-time blockchain data"}
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Cancel anytime
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground max-w-lg">
            All plans include a 14-day free trial. Subscriptions managed through
            Stripe.
          </p>
        </div>

        <Disclaimer className="mt-12" />
      </div>
    </section>
  );
}
