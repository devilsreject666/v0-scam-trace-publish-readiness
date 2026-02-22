"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Eye,
  Play,
  CheckCircle2,
} from "lucide-react";

function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
}: {
  target: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 40;
          const increment = target / steps;
          let current = 0;
          const interval = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(interval);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-2xl font-bold text-foreground sm:text-3xl">
      {prefix}
      {count}
      {suffix}
    </div>
  );
}

const terminalLines = [
  {
    text: "$ scamtrace investigate --full 0x7a250d...dEad",
    color: "text-cyber-green",
    delay: 0,
  },
  {
    text: "[SCAN] Querying Etherscan API for address history...",
    color: "text-muted",
    prefix: "text-cyber-blue",
    prefixText: "[INFO]",
    delay: 800,
  },
  {
    text: "[ETH] Balance: 4.821 ETH -- 142 transactions found",
    color: "text-muted",
    prefix: "text-accent",
    prefixText: "[ETH]",
    delay: 1600,
  },
  {
    text: "[RISK] High transaction velocity detected -- 38 txns in 24h",
    color: "text-muted",
    prefix: "text-blue-400",
    prefixText: "[RISK]",
    delay: 2400,
  },
  {
    text: "[ALERT] Wallet age under 7 days -- abnormal volume spike",
    color: "text-muted",
    prefix: "text-cyber-orange",
    prefixText: "[ALERT]",
    delay: 3200,
  },
  {
    text: "[CRITICAL] 3 risk indicators flagged -- risk score: 87/100",
    color: "text-muted",
    prefix: "text-cyber-red",
    prefixText: "[CRITICAL]",
    delay: 4000,
  },
  {
    text: "Scan saved to dashboard -- evidence export available",
    color: "text-cyber-green",
    delay: 5000,
  },
  {
    text: "Cooling-off protection enabled -- 30 min hold active",
    color: "text-cyber-green",
    delay: 5600,
  },
];

export function Hero() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const animStarted = useRef(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animStarted.current) {
          animStarted.current = true;
          terminalLines.forEach((_, idx) => {
            setTimeout(
              () => setVisibleLines(idx + 1),
              terminalLines[idx].delay
            );
          });
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setShowCursor((c) => !c), 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden pt-16 grid-bg"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-cyber-green/[0.06] blur-[140px]" />
        <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-cyber-blue/[0.05] blur-[120px]" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-16 sm:px-6 lg:px-8 lg:py-28">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyber-green/20 bg-cyber-green/[0.06] px-5 py-2 animate-fade-in-up">
          <span className="h-2 w-2 rounded-full bg-cyber-green animate-pulse" />
          <span className="text-xs font-semibold text-cyber-green tracking-wide uppercase">
            Live Monitoring Active
          </span>
        </div>

        <h1 className="max-w-5xl text-center text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in-up text-balance">
          <span className="block">Trace Every Coin.</span>
          <span className="block gradient-text mt-2">Expose Every Scam.</span>
        </h1>

        <p
          className="mt-6 max-w-2xl text-center text-lg text-muted sm:text-xl animate-fade-in-up opacity-0 delay-200"
          style={{ animationFillMode: "forwards" }}
        >
          Blockchain transaction monitoring and fraud documentation. Scan ETH
          and BTC addresses in real-time, flag risk indicators, and build
          structured evidence for investigation — no blockchain expertise required.
        </p>

        <div
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row animate-fade-in-up opacity-0 delay-300"
          style={{ animationFillMode: "forwards" }}
        >
          <Link
            href="/scan"
            className="group flex items-center gap-2 btn-primary text-base"
          >
            <Play className="h-4 w-4" />
            Start Tracing Now
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <a href="#features" className="btn-secondary text-base flex items-center gap-2">
            See How It Works
          </a>
        </div>

        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 animate-fade-in-up opacity-0 delay-400"
          style={{ animationFillMode: "forwards" }}
        >
          {[
            "Real-time Data",
            "Etherscan Powered",
            "Blockstream Verified",
            "Supabase Auth",
          ].map((badge) => (
            <div
              key={badge}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-cyber-green/60" />
              {badge}
            </div>
          ))}
        </div>

        <div className="mt-16 grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { value: 2, suffix: "", label: "Chains Supported", icon: Shield },
            { value: 2, suffix: "", label: "API Providers", icon: Globe },
            { value: 3, prefix: "<", suffix: "s", label: "Scan Speed", icon: Zap },
            { value: 24, suffix: "/7", label: "Always Available", icon: Eye },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card-premium rounded-xl p-5 text-center"
            >
              <stat.icon className="mx-auto mb-2 h-5 w-5 text-cyber-green/80" />
              <AnimatedCounter
                target={stat.value}
                suffix={stat.suffix}
                prefix={stat.prefix}
              />
              <div className="mt-1 text-xs text-muted">{stat.label}</div>
            </div>
          ))}
        </div>

        <div
          className="relative mt-16 w-full max-w-5xl animate-fade-in-up opacity-0 delay-500"
          style={{ animationFillMode: "forwards" }}
        >
          <div className="animate-pulse-glow rounded-2xl border border-border bg-dark-800/80 p-1 shadow-2xl backdrop-blur">
            <div className="rounded-xl bg-dark-900 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-cyber-red/60" />
                <span className="h-3 w-3 rounded-full bg-cyber-orange/60" />
                <span className="h-3 w-3 rounded-full bg-cyber-green/60" />
                <span className="ml-3 text-xs text-muted-foreground font-mono">
                  scamtrace://live-investigation
                </span>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyber-green animate-pulse" />
                  <span className="text-[10px] text-cyber-green font-medium">
                    LIVE
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 font-mono text-xs sm:text-sm min-h-[220px]">
                {terminalLines.slice(0, visibleLines).map((line, idx) => (
                  <div
                    key={idx}
                    className={`animate-slide-in-left ${line.color}`}
                  >
                    {line.prefixText ? (
                      <>
                        <span className={line.prefix}>{line.prefixText}</span>{" "}
                        {line.text.replace(`${line.prefixText} `, "")}
                      </>
                    ) : (
                      line.text
                    )}
                  </div>
                ))}
                {visibleLines < terminalLines.length && (
                  <div className="text-cyber-green">
                    <span
                      className={
                        showCursor ? "opacity-100" : "opacity-0"
                      }
                    >
                      {"▊"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-cyber-green/10 via-cyber-blue/10 to-transparent blur-3xl" />
        </div>

        <div
          className="mt-20 text-center w-full animate-fade-in-up opacity-0 delay-500"
          style={{ animationFillMode: "forwards" }}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
            Built for investigators & fraud prevention teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            {[
              "Fraud Teams",
              "Compliance Depts",
              "Victim Advocates",
              "Legal Counsel",
              "Forensic Analysts",
            ].map((org) => (
              <div
                key={org}
                className="text-sm font-bold text-muted tracking-wider uppercase"
              >
                {org}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
