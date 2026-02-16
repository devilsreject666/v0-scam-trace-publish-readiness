import { TrendingUp, Clock, Shield, ArrowRight, ExternalLink } from 'lucide-react';

export function CaseStudies() {
  const studies = [
    {
      tag: 'Pig Butchering',
      color: 'text-cyber-red border-cyber-red/20 bg-cyber-red/5',
      title: 'Romance Scam Tracing Across 3 Chains',
      summary: 'A victim lost $82,000 to a romance-based investment scam. Using ScamTrace, funds were traced through Ethereum, across a bridge to Polygon, and into a centralized exchange deposit address within 4 hours.',
      stats: [
        { icon: TrendingUp, label: 'Amount Traced', value: '$82,000' },
        { icon: Clock, label: 'Investigation Time', value: '4 hours' },
        { icon: Shield, label: 'Evidence Items', value: '23 items' },
      ],
      outcome: 'Evidence packet submitted to exchange compliance team. Funds frozen pending law enforcement review.',
    },
    {
      tag: 'Rug Pull',
      color: 'text-cyber-orange border-cyber-orange/20 bg-cyber-orange/5',
      title: 'DeFi Rug Pull Fund Flow Analysis',
      summary: 'A DeFi project team drained $1.2M in liquidity. ScamTrace identified the deployer wallet, traced funds through Tornado Cash, and mapped withdrawal patterns to 4 exchange deposit addresses.',
      stats: [
        { icon: TrendingUp, label: 'Amount Traced', value: '$1.2M' },
        { icon: Clock, label: 'Investigation Time', value: '6 hours' },
        { icon: Shield, label: 'Wallets Mapped', value: '47 wallets' },
      ],
      outcome: 'Detailed fund flow report generated. Four exchange freeze requests submitted with supporting evidence.',
    },
    {
      tag: 'Phishing',
      color: 'text-cyber-blue border-cyber-blue/20 bg-cyber-blue/5',
      title: 'NFT Phishing Campaign Documentation',
      summary: 'A coordinated phishing campaign targeted NFT holders through fake approval transactions. ScamTrace correlated 12 victim wallets, identified the drainer contract, and traced proceeds to a mixer.',
      stats: [
        { icon: TrendingUp, label: 'Amount Traced', value: '$340,000' },
        { icon: Clock, label: 'Victims Linked', value: '12 wallets' },
        { icon: Shield, label: 'Domains Flagged', value: '8 domains' },
      ],
      outcome: 'Comprehensive report provided to law enforcement. Drainer contract flagged across all supported chains.',
    },
  ];

  return (
    <section id="case-studies" className="relative py-24 grid-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/3 h-[500px] w-[500px] rounded-full bg-cyber-green/[0.03] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-green/20 bg-cyber-green/[0.06] px-4 py-1.5">
            <span className="text-xs font-medium text-cyber-green">Anonymized Case Studies</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Real Investigations, <span className="gradient-text">Real Results</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            See how ScamTrace has been used to document and investigate real crypto fraud cases. All details anonymized to protect ongoing investigations.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {studies.map(study => (
            <div key={study.title} className="glass-card-premium rounded-2xl overflow-hidden flex flex-col">
              <div className="p-6 flex-grow">
                <span className={`inline-block rounded-full border px-3 py-1 text-xs font-medium mb-4 ${study.color}`}>
                  {study.tag}
                </span>
                <h3 className="text-lg font-bold text-white mb-3">{study.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">{study.summary}</p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {study.stats.map(stat => (
                    <div key={stat.label} className="text-center rounded-lg bg-dark-900/50 p-3">
                      <stat.icon className="h-4 w-4 mx-auto mb-1 text-cyber-green/70" />
                      <div className="text-sm font-bold text-white">{stat.value}</div>
                      <div className="text-[10px] text-slate-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/5 p-6 bg-dark-900/30">
                <p className="text-xs text-slate-400 mb-3">
                  <span className="font-medium text-slate-300">Outcome:</span> {study.outcome}
                </p>
                <button className="text-xs font-medium text-cyber-green hover:underline flex items-center gap-1">
                  Read Full Case Study <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            All case studies are anonymized and presented for educational purposes. Specific outcomes depend on jurisdiction, exchange policies, and cooperation of relevant parties. ScamTrace does not guarantee fund recovery.
          </p>
        </div>
      </div>
    </section>
  );
}
