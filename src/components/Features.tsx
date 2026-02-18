import { Search, GitBranch, Target, Scan, Database, FileText, ArrowRight, Shield, Cpu, AlertTriangle, CheckCircle2, MessageCircle, Globe, Phone, Lock } from 'lucide-react';

const coreFeatures = [
  {
    id: 'discover',
    icon: Search,
    color: 'from-cyber-green to-emerald-400',
    glow: 'shadow-cyber-green/10',
    title: 'Case Management',
    subtitle: 'Organize Incidents Into Structured Cases',
    description: 'Create and manage fraud cases with notes, evidence, and metadata. Keep all information organized in one place for each investigation you are working on.',
    bullets: [
      'Structured case organization',
      'Evidence attachment & metadata',
      'Notes and investigation logs',
      'Multi-case management',
    ],
  },
  {
    id: 'analyze',
    icon: GitBranch,
    color: 'from-cyber-blue to-blue-400',
    glow: 'shadow-cyber-blue/10',
    title: 'Blockchain Analysis',
    subtitle: 'Document Transaction Flows',
    description: 'Input public transaction hashes and addresses to document fund flows. Analyze blockchain data to build a clear picture of how funds moved.',
    bullets: [
      'Public transaction documentation',
      'Address and hash analysis',
      'Fund flow visualization',
      'Chronological event timelines',
    ],
  },
  {
    id: 'pursue',
    icon: Target,
    color: 'from-cyber-purple to-violet-400',
    glow: 'shadow-cyber-purple/10',
    title: 'Forensic Reports',
    subtitle: 'Export Professional Documentation',
    description: 'Generate professional forensic reports for legal or investigative use. All entries include timestamps and immutable logs to maintain data integrity.',
    bullets: [
      'Professional PDF report export',
      'Timestamped evidence logs',
      'Immutable audit trails',
      'Investigation-ready documentation',
    ],
  },
];

const tools = [
  {
    icon: Scan,
    color: 'text-cyber-green',
    bg: 'bg-cyber-green/10',
    borderHover: 'hover:border-cyber-green/20',
    title: 'Wallet Scan',
    description: 'Reveal seizable crypto from any recovery seed. Uncovers balances and illicit links across 45+ wallets and 16 blockchains — including Bitcoin and privacy coins. Fully offline.',
    href: '#tracker',
  },
  {
    icon: MessageCircle,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    borderHover: 'hover:border-cyan-400/20',
    title: 'Chat Evidence Portal',
    description: 'Connect Telegram or WhatsApp to upload scam conversations. AI extracts wallet addresses, URLs, phone numbers, emails, and builds a prosecution-ready timeline automatically.',
    href: '#chat-evidence',
  },
  {
    icon: Globe,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    borderHover: 'hover:border-blue-400/20',
    title: 'Domain Checker',
    description: 'Instant WHOIS lookup, domain age analysis, hosting provider, SSL certificate inspection, DNS records, and cross-reference against scam databases with risk scoring.',
    href: '#osint-tools',
  },
  {
    icon: Phone,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    borderHover: 'hover:border-green-400/20',
    title: 'Phone Number Lookup',
    description: 'Carrier identification, VoIP detection, geographic location, and fraud database cross-referencing. Detect disposable numbers used by scammers instantly.',
    href: '#osint-tools',
  },
  {
    icon: Lock,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    borderHover: 'hover:border-emerald-400/20',
    title: 'Smart Contract Escrow',
    description: 'Time-delayed escrow holds funds before release. Pre-send simulation reveals risk. Cooling-off period kills scammer urgency. Cancel anytime before final confirmation.',
    href: '#escrow',
  },
  {
    icon: Shield,
    color: 'text-cyber-orange',
    bg: 'bg-cyber-orange/10',
    borderHover: 'hover:border-cyber-orange/20',
    title: 'Scam Shield Wallet',
    description: 'Integrated multi-chain wallet (BTC, ETH & more) that tracks every coin sent. Even as scammers split, mix, or bridge funds, every movement is logged.',
    href: '#scam-wallet',
  },
  {
    icon: FileText,
    color: 'text-cyber-purple',
    bg: 'bg-cyber-purple/10',
    borderHover: 'hover:border-cyber-purple/20',
    title: 'Evidence Builder',
    description: 'Auto-generate comprehensive evidence packets with timestamped wallet graphs, chat evidence, OSINT data, transaction hashes, and user statements — ready for exchange freeze requests.',
    href: '#evidence',
  },
  {
    icon: Database,
    color: 'text-cyber-blue',
    bg: 'bg-cyber-blue/10',
    borderHover: 'hover:border-cyber-blue/20',
    title: 'Real-Time Monitoring',
    description: 'Proactively detect and monitor crypto threats. Track emerging activity in real-time and get alerts when flagged addresses make moves on any chain.',
    href: '#tracker',
  },
  {
    icon: Cpu,
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    borderHover: 'hover:border-pink-400/20',
    title: 'AI Investigation Engine',
    description: 'Advanced ML models trained on millions of illicit transactions. Automatically classifies patterns, detects social engineering in chats, and predicts fund movement.',
    href: '#tracker',
  },
  {
    icon: AlertTriangle,
    color: 'text-cyber-red',
    bg: 'bg-cyber-red/10',
    borderHover: 'hover:border-cyber-red/20',
    title: 'Smart Alerts',
    description: 'Instant notifications when tracked funds hit exchange wallets, interact with mixers, or cross bridges. Never miss a critical moment.',
    href: '#tracker',
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 grid-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-cyber-green/[0.03] blur-[150px]" />
        <div className="absolute left-0 bottom-1/4 h-[500px] w-[500px] rounded-full bg-cyber-purple/[0.03] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-20 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-blue/20 bg-cyber-blue/[0.06] px-4 py-1.5">
            <span className="text-xs font-medium text-cyber-blue">What ScamTrace Does</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Structured Tools for <span className="gradient-text">Fraud Documentation</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            ScamTrace provides structured tools to create and manage fraud cases, analyze blockchain transactions, build evidence timelines, and export professional forensic reports. All data remains under your control.
          </p>
        </div>

        {/* Core 3-step pipeline */}
        <div className="mb-24 space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
          {coreFeatures.map((feature, idx) => (
            <div key={feature.id} id={feature.id} className="group relative">
              {idx < coreFeatures.length - 1 && (
                <div className="hidden lg:block absolute top-12 -right-4 w-8 h-px bg-gradient-to-r from-white/10 to-white/5 z-10" />
              )}
              <div className={`glass-card-premium rounded-2xl p-8 h-full flex flex-col hover:shadow-xl ${feature.glow}`}>
                <div className="mb-6 flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                    <feature.icon className="h-6 w-6 text-dark-900" strokeWidth={2.5} />
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-dark-800 text-xs font-bold text-slate-400">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                </div>

                <h3 className="mb-1 text-2xl font-bold text-white">{feature.title}</h3>
                <p className="mb-4 text-sm font-medium text-cyber-green">{feature.subtitle}</p>
                <p className="mb-6 text-sm leading-relaxed text-slate-400 flex-grow">{feature.description}</p>

                <ul className="space-y-2.5">
                  {feature.bullets.map(b => (
                    <li key={b} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-cyber-green/70" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Tools grid */}
        <div className="mb-10 text-center">
          <h3 className="text-2xl font-bold text-white sm:text-3xl">Core Features</h3>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Documentation and analysis tools for investigating crypto fraud -- from evidence collection to report generation.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" id="wallet-scan">
          {tools.map(tool => (
            <div key={tool.title} className={`glass-card-premium rounded-xl p-6 ${tool.borderHover}`}>
              <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${tool.bg}`}>
                <tool.icon className={`h-5 w-5 ${tool.color}`} />
              </div>
              <h4 className="mb-2 text-lg font-bold text-white">{tool.title}</h4>
              <p className="text-sm leading-relaxed text-slate-400">{tool.description}</p>
              <a href={tool.href} className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-cyber-green hover:underline transition">
                Try it now <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
