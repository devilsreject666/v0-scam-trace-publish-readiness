import { Search, GitBranch, Target, Scan, Database, FileText, ArrowRight, Shield, Cpu, AlertTriangle, CheckCircle2, MessageCircle, Globe, Phone, Lock } from 'lucide-react';

const coreFeatures = [
  {
    id: 'discover',
    icon: Search,
    gradient: 'from-[#00f5ff] to-[#00ff88]',
    glowColor: 'rgba(0,245,255,0.3)',
    borderColor: 'rgba(0,245,255,0.2)',
    title: 'Discover',
    subtitle: 'Identify High-Risk Targets Instantly',
    description: 'Surface critical leads in seconds with plain-language, AI-powered insights — no blockchain expertise required. Instantly triage any crypto address, domain, or phone number and highlight cross-chain links to illicit activity.',
    bullets: [
      'AI-powered risk scoring for any address',
      'Cross-chain link detection (ETH, BTC, & more)',
      'Domain WHOIS & phone number intelligence',
      'Telegram/WhatsApp chat analysis',
    ],
  },
  {
    id: 'analyze',
    icon: GitBranch,
    gradient: 'from-[#0066ff] to-[#00f5ff]',
    glowColor: 'rgba(0,102,255,0.3)',
    borderColor: 'rgba(0,102,255,0.2)',
    title: 'Analyze',
    subtitle: 'Trace Funds Across Chains in Real-Time',
    description: 'Follow the money across blockchains including Bitcoin, Ethereum, and more. Navigate mixers (Tornado Cash, Wasabi CoinJoin), bridges, swaps, and smart contracts with automated analysis.',
    bullets: [
      'Multi-chain tracing (BTC, ETH, Polygon, Arbitrum & more)',
      'BTC CoinJoin & ETH mixer detection',
      'Network visualization with UTXO flow',
      'Entity identification & clustering',
    ],
  },
  {
    id: 'pursue',
    icon: Target,
    gradient: 'from-[#bf00ff] to-[#ff00aa]',
    glowColor: 'rgba(191,0,255,0.3)',
    borderColor: 'rgba(191,0,255,0.2)',
    title: 'Pursue',
    subtitle: 'Turn Intelligence Into Impact',
    description: 'Strengthen cases and disrupt illicit activity. Auto-generate freeze-ready evidence packets with timestamped wallet graphs, transaction hashes, chat evidence, and user statements.',
    bullets: [
      'Freeze-ready evidence packets',
      'Chat & OSINT evidence integration',
      'Exchange contact automation',
      'Court-admissible documentation',
    ],
  },
];

const tools = [
  {
    icon: Scan,
    iconColor: 'text-[#00f5ff]',
    iconBg: 'bg-[rgba(0,245,255,0.1)]',
    iconGlow: 'rgba(0,245,255,0.4)',
    title: 'Wallet Scan',
    description: 'Reveal seizable crypto from any recovery seed. Uncovers balances and illicit links across 45+ wallets and 16 blockchains — including Bitcoin and privacy coins. Fully offline.',
    href: '#tracker',
  },
  {
    icon: MessageCircle,
    iconColor: 'text-[#00e5ff]',
    iconBg: 'bg-[rgba(0,229,255,0.1)]',
    iconGlow: 'rgba(0,229,255,0.4)',
    title: 'Chat Evidence Portal',
    description: 'Connect Telegram or WhatsApp to upload scam conversations. AI extracts wallet addresses, URLs, phone numbers, emails, and builds a prosecution-ready timeline automatically.',
    href: '#chat-evidence',
  },
  {
    icon: Globe,
    iconColor: 'text-[#4d88ff]',
    iconBg: 'bg-[rgba(77,136,255,0.1)]',
    iconGlow: 'rgba(77,136,255,0.4)',
    title: 'Domain Checker',
    description: 'Instant WHOIS lookup, domain age analysis, hosting provider, SSL certificate inspection, DNS records, and cross-reference against scam databases with risk scoring.',
    href: '#osint-tools',
  },
  {
    icon: Phone,
    iconColor: 'text-[#00ff88]',
    iconBg: 'bg-[rgba(0,255,136,0.1)]',
    iconGlow: 'rgba(0,255,136,0.4)',
    title: 'Phone Number Lookup',
    description: 'Carrier identification, VoIP detection, geographic location, and fraud database cross-referencing. Detect disposable numbers used by scammers instantly.',
    href: '#osint-tools',
  },
  {
    icon: Lock,
    iconColor: 'text-[#00ffaa]',
    iconBg: 'bg-[rgba(0,255,170,0.1)]',
    iconGlow: 'rgba(0,255,170,0.4)',
    title: 'Smart Contract Escrow',
    description: 'Time-delayed escrow holds funds before release. Pre-send simulation reveals risk. Cooling-off period kills scammer urgency. Cancel anytime before final confirmation.',
    href: '#escrow',
  },
  {
    icon: Shield,
    iconColor: 'text-[#ff8800]',
    iconBg: 'bg-[rgba(255,136,0,0.1)]',
    iconGlow: 'rgba(255,136,0,0.4)',
    title: 'Scam Shield Wallet',
    description: 'Integrated multi-chain wallet (BTC, ETH & more) that tracks every coin sent. Even as scammers split, mix, or bridge funds, every movement is logged.',
    href: '#scam-wallet',
  },
  {
    icon: FileText,
    iconColor: 'text-[#bf00ff]',
    iconBg: 'bg-[rgba(191,0,255,0.1)]',
    iconGlow: 'rgba(191,0,255,0.4)',
    title: 'Evidence Builder',
    description: 'Auto-generate comprehensive evidence packets with timestamped wallet graphs, chat evidence, OSINT data, transaction hashes, and user statements — ready for exchange freeze requests.',
    href: '#evidence',
  },
  {
    icon: Database,
    iconColor: 'text-[#00d4ff]',
    iconBg: 'bg-[rgba(0,212,255,0.1)]',
    iconGlow: 'rgba(0,212,255,0.4)',
    title: 'Real-Time Monitoring',
    description: 'Proactively detect and monitor crypto threats. Track emerging activity in real-time and get alerts when flagged addresses make moves on any chain.',
    href: '#tracker',
  },
  {
    icon: Cpu,
    iconColor: 'text-[#ff00aa]',
    iconBg: 'bg-[rgba(255,0,170,0.1)]',
    iconGlow: 'rgba(255,0,170,0.4)',
    title: 'AI Investigation Engine',
    description: 'Advanced ML models trained on millions of illicit transactions. Automatically classifies patterns, detects social engineering in chats, and predicts fund movement.',
    href: '#tracker',
  },
  {
    icon: AlertTriangle,
    iconColor: 'text-[#ff3366]',
    iconBg: 'bg-[rgba(255,51,102,0.1)]',
    iconGlow: 'rgba(255,51,102,0.4)',
    title: 'Smart Alerts',
    description: 'Instant notifications when tracked funds hit exchange wallets, interact with mixers, or cross bridges. Never miss a critical moment.',
    href: '#tracker',
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 grid-bg">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-1/4 h-[600px] w-[600px] rounded-full bg-[rgba(0,245,255,0.04)] blur-[160px]" />
        <div className="absolute left-0 bottom-1/4 h-[500px] w-[500px] rounded-full bg-[rgba(191,0,255,0.04)] blur-[150px]" />
      </div>

      {/* Top section divider */}
      <div className="section-divider mb-0" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">

        {/* Section header */}
        <div className="mb-20 text-center">
          <div className="mb-4 inline-flex items-center gap-2 badge-neon">
            <span>Investigation Pipeline</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl heading-3d">
            From Discovery to <span className="gradient-text">Documentation</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            A complete monitoring workflow that transforms raw blockchain data, chat evidence, and OSINT intelligence into actionable insights and documented evidence.
          </p>
        </div>

        {/* Core 3-step pipeline */}
        <div className="mb-24 space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
          {coreFeatures.map((feature, idx) => (
            <div key={feature.id} id={feature.id} className="group relative">
              {idx < coreFeatures.length - 1 && (
                <div className="hidden lg:block absolute top-12 -right-4 w-8 h-px bg-gradient-to-r from-[rgba(0,245,255,0.3)] to-transparent z-10" />
              )}
              <div className="glass-card-premium rounded-2xl p-8 h-full flex flex-col"
                style={{ '--hover-glow': feature.glowColor } as React.CSSProperties}>

                {/* Top glow line matching feature color */}
                <div className={`absolute top-0 left-0 right-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-[${feature.borderColor}] to-transparent opacity-60`} />

                <div className="mb-6 flex items-center gap-4">
                  <div className={`relative flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                    style={{ boxShadow: `0 0 20px ${feature.glowColor}, 0 4px 15px rgba(0,0,0,0.4)` }}>
                    <feature.icon className="h-6 w-6 text-[#020510]" strokeWidth={2.5} />
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(0,245,255,0.15)] bg-[rgba(0,245,255,0.05)] text-xs font-bold text-[#00f5ff] font-[Orbitron,sans-serif]">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                </div>

                <h3 className="mb-1 text-2xl font-bold text-white font-[Orbitron,sans-serif] [letter-spacing:0.05em]">{feature.title}</h3>
                <p className="mb-4 text-sm font-semibold text-[#00f5ff] [text-shadow:0_0_10px_rgba(0,245,255,0.5)]">{feature.subtitle}</p>
                <p className="mb-6 text-sm leading-relaxed text-slate-400 flex-grow">{feature.description}</p>

                <ul className="space-y-2.5">
                  {feature.bullets.map(b => (
                    <li key={b} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#00ff88] [filter:drop-shadow(0_0_4px_rgba(0,255,136,0.6))]" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Tools grid header */}
        <div className="mb-12 text-center">
          <h3 className="text-2xl font-bold text-white sm:text-3xl heading-3d">
            Powerful Tools at <span className="gradient-text-cyan">Your Fingertips</span>
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Every tool you need to investigate, track, and build cases against crypto fraud — including chat analysis, domain checking, and phone lookup.
          </p>
        </div>

        {/* Tools grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" id="wallet-scan">
          {tools.map(tool => (
            <div key={tool.title}
              className="glass-card group rounded-2xl p-6 cursor-default"
              style={{ '--hover-icon-glow': tool.iconGlow } as React.CSSProperties}
            >
              {/* Animated neon border on hover via CSS */}
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${tool.iconBg} transition-all duration-300 group-hover:shadow-[0_0_20px_var(--hover-icon-glow,rgba(0,245,255,0.4))]`}>
                <tool.icon className={`h-5 w-5 ${tool.iconColor} transition-all duration-300 group-hover:scale-110`}
                  style={{ filter: `drop-shadow(0 0 4px ${tool.iconGlow})` }} />
              </div>
              <h4 className="mb-2 text-base font-bold text-white group-hover:text-[#00f5ff] transition-colors duration-300">{tool.title}</h4>
              <p className="text-sm leading-relaxed text-slate-400">{tool.description}</p>
              <a href={tool.href}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#00f5ff] hover:text-white transition-all duration-200 group/link">
                Try it now
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="section-divider mt-24" />
    </section>
  );
}
