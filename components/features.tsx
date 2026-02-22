"use client";

import Link from "next/link";
import {
  Search,
  GitBranch,
  Target,
  Scan,
  Database,
  FileText,
  ArrowRight,
  Shield,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
  Globe,
  Lock,
} from "lucide-react";

const coreFeatures = [
  {
    id: "discover",
    icon: Search,
    color: "from-cyber-green to-emerald-400",
    glow: "shadow-cyber-green/10",
    title: "Discover",
    subtitle: "Identify High-Risk Targets Instantly",
    description:
      "Surface critical leads in seconds with plain-language, AI-powered insights. Instantly triage any crypto address, domain, or phone number and highlight cross-chain links to illicit activity.",
    bullets: [
      "AI-powered risk scoring for any address",
      "Cross-chain link detection (ETH, BTC & more)",
      "Domain WHOIS & phone number intelligence",
      "Telegram/WhatsApp chat analysis",
    ],
  },
  {
    id: "analyze",
    icon: GitBranch,
    color: "from-cyber-blue to-blue-400",
    glow: "shadow-cyber-blue/10",
    title: "Analyze",
    subtitle: "Trace Funds Across Chains in Real-Time",
    description:
      "Follow the money across blockchains including Bitcoin, Ethereum, and more. Navigate mixers, bridges, swaps, and smart contracts with automated analysis.",
    bullets: [
      "Multi-chain tracing (BTC, ETH, Polygon & more)",
      "BTC CoinJoin & ETH mixer detection",
      "Network visualization with UTXO flow",
      "Entity identification & clustering",
    ],
  },
  {
    id: "pursue",
    icon: Target,
    color: "from-accent to-blue-300",
    glow: "shadow-accent/10",
    title: "Pursue",
    subtitle: "Turn Intelligence Into Impact",
    description:
      "Strengthen cases and disrupt illicit activity. Auto-generate freeze-ready evidence packets with timestamped wallet graphs, transaction hashes, chat evidence, and user statements.",
    bullets: [
      "Freeze-ready evidence packets",
      "Chat & OSINT evidence integration",
      "Exchange contact automation",
      "Court-admissible documentation",
    ],
  },
];

const tools = [
  {
    icon: Scan,
    color: "text-cyber-green",
    bg: "bg-cyber-green/10",
    borderHover: "hover:border-cyber-green/20",
    title: "Wallet Scan",
    description:
      "Reveal risk indicators from any wallet address. Uncovers balances and illicit links across blockchains — including Bitcoin and Ethereum.",
    href: "/scan",
  },
  {
    icon: MessageCircle,
    color: "text-accent",
    bg: "bg-accent/10",
    borderHover: "hover:border-accent/20",
    title: "Chat Evidence Portal",
    description:
      "Upload scam conversations. AI extracts wallet addresses, URLs, phone numbers, emails, and builds a prosecution-ready timeline automatically.",
    href: "/report",
  },
  {
    icon: Globe,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    borderHover: "hover:border-blue-400/20",
    title: "Domain Checker",
    description:
      "Instant WHOIS lookup, domain age analysis, hosting provider, SSL certificate inspection, DNS records, and cross-reference against scam databases.",
    href: "/scan",
  },
  {
    icon: Lock,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    borderHover: "hover:border-emerald-400/20",
    title: "Cooling-Off Protection",
    description:
      "Time-delayed holds before release. Pre-send simulation reveals risk. Cooling-off period kills scammer urgency. Cancel anytime before confirmation.",
    href: "/protect",
  },
  {
    icon: Shield,
    color: "text-cyber-orange",
    bg: "bg-cyber-orange/10",
    borderHover: "hover:border-cyber-orange/20",
    title: "Scam Shield Wallet",
    description:
      "Integrated multi-chain wallet (BTC, ETH & more) that tracks every coin sent. Even as scammers split, mix, or bridge funds, every movement is logged.",
    href: "/scan",
  },
  {
    icon: FileText,
    color: "text-accent",
    bg: "bg-accent/10",
    borderHover: "hover:border-accent/20",
    title: "Evidence Builder",
    description:
      "Auto-generate comprehensive evidence packets with timestamped wallet graphs, chat evidence, OSINT data, transaction hashes, and user statements.",
    href: "/dashboard/cases",
  },
  {
    icon: Database,
    color: "text-cyber-blue",
    bg: "bg-cyber-blue/10",
    borderHover: "hover:border-cyber-blue/20",
    title: "Real-Time Monitoring",
    description:
      "Proactively detect and monitor crypto threats. Track emerging activity in real-time and get alerts when flagged addresses make moves on any chain.",
    href: "/dashboard",
  },
  {
    icon: Cpu,
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    borderHover: "hover:border-pink-400/20",
    title: "AI Investigation Engine",
    description:
      "Advanced ML models trained on millions of illicit transactions. Automatically classifies patterns, detects social engineering, and predicts fund movement.",
    href: "/scan",
  },
  {
    icon: AlertTriangle,
    color: "text-cyber-red",
    bg: "bg-cyber-red/10",
    borderHover: "hover:border-cyber-red/20",
    title: "Smart Alerts",
    description:
      "Instant notifications when tracked funds hit exchange wallets, interact with mixers, or cross bridges. Never miss a critical moment.",
    href: "/dashboard",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 grid-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-cyber-green/[0.03] blur-[150px]" />
        <div className="absolute left-0 bottom-1/4 h-[500px] w-[500px] rounded-full bg-accent/[0.03] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-blue/20 bg-cyber-blue/[0.06] px-4 py-1.5">
            <span className="text-xs font-medium text-cyber-blue">
              Investigation Pipeline
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl lg:text-5xl text-balance">
            From Discovery to{" "}
            <span className="gradient-text">Documentation</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            A complete monitoring workflow that transforms raw blockchain data,
            chat evidence, and OSINT intelligence into actionable insights and
            documented evidence.
          </p>
        </div>

        <div className="mb-24 grid gap-8 lg:grid-cols-3">
          {coreFeatures.map((feature, idx) => (
            <div key={feature.id} className="group relative">
              <div
                className={`glass-card-premium rounded-2xl p-8 h-full flex flex-col hover:shadow-xl ${feature.glow}`}
              >
                <div className="mb-6 flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}
                  >
                    <feature.icon
                      className="h-6 w-6 text-dark-900"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-dark-800 text-xs font-bold text-muted">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                </div>

                <h3 className="mb-1 text-2xl font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="mb-4 text-sm font-medium text-cyber-green">
                  {feature.subtitle}
                </p>
                <p className="mb-6 text-sm leading-relaxed text-muted flex-grow">
                  {feature.description}
                </p>

                <ul className="flex flex-col gap-2.5">
                  {feature.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-2 text-sm text-foreground/80"
                    >
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-cyber-green/70" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-10 text-center">
          <h3 className="text-2xl font-bold text-foreground sm:text-3xl text-balance">
            Powerful Tools at Your Fingertips
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Every tool you need to investigate, track, and build cases against
            crypto fraud.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className={`glass-card-premium rounded-xl p-6 ${tool.borderHover}`}
            >
              <div
                className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${tool.bg}`}
              >
                <tool.icon className={`h-5 w-5 ${tool.color}`} />
              </div>
              <h4 className="mb-2 text-lg font-bold text-foreground">
                {tool.title}
              </h4>
              <p className="text-sm leading-relaxed text-muted">
                {tool.description}
              </p>
              <Link
                href={tool.href}
                className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-cyber-green hover:underline transition"
              >
                Try it now <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
