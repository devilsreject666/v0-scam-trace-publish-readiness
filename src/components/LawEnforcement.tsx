import { Shield, FileText, Clock, Globe, CheckCircle2, ArrowRight, Scale, Lock, Zap, Users } from 'lucide-react';

interface LawEnforcementProps {
  onRequestDemo: () => void;
  onBack: () => void;
}

export function LawEnforcement({ onRequestDemo, onBack }: LawEnforcementProps) {
  return (
    <section className="min-h-screen bg-dark-900 pt-20 pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <button onClick={onBack} className="mb-8 text-sm text-slate-400 hover:text-white transition flex items-center gap-1">
          {'<-'} Back to Home
        </button>

        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-blue/20 bg-cyber-blue/[0.06] px-4 py-1.5">
            <Scale className="h-3.5 w-3.5 text-cyber-blue" />
            <span className="text-xs font-medium text-cyber-blue">Law Enforcement & Government</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl text-balance">
            Built for <span className="gradient-text">Investigators</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            ScamTrace provides forensic-grade blockchain intelligence tools designed for law enforcement agencies, regulatory bodies, and government investigators.
          </p>
        </div>

        {/* Capabilities */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-16">
          {[
            {
              icon: Globe,
              title: 'Multi-Chain Tracing',
              desc: 'Follow fund movements across 16+ blockchains including Bitcoin, Ethereum, Polygon, and Arbitrum. Detect mixer interactions, bridge transfers, and exchange deposits.',
            },
            {
              icon: FileText,
              title: 'Evidence Packet Generation',
              desc: 'Auto-generate timestamped evidence packets with wallet graphs, transaction hashes, OSINT data, and chat evidence. Designed for exchange freeze requests.',
            },
            {
              icon: Clock,
              title: 'Real-Time Monitoring',
              desc: 'Set up watch lists for suspect addresses. Receive alerts when flagged wallets make movements, interact with exchanges, or cross bridges.',
            },
            {
              icon: Lock,
              title: 'Secure & Auditable',
              desc: 'SOC 2 compliant infrastructure with end-to-end encryption. Full audit trails for every investigation action. Data residency options available.',
            },
            {
              icon: Users,
              title: 'Team Collaboration',
              desc: 'Multi-user workspace with role-based access. Assign cases, share evidence, and coordinate investigations across jurisdictions.',
            },
            {
              icon: Zap,
              title: 'API Integration',
              desc: 'RESTful API for integration with existing case management systems. Batch address screening and automated risk scoring.',
            },
          ].map(item => (
            <div key={item.title} className="glass-card-premium rounded-2xl p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyber-blue/10">
                <item.icon className="h-5 w-5 text-cyber-blue" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-10">Investigation Workflow</h2>
          <div className="grid gap-6 sm:grid-cols-4">
            {[
              { step: '01', title: 'Submit Address', desc: 'Enter a suspect wallet address or transaction hash to begin investigation.' },
              { step: '02', title: 'Trace Funds', desc: 'Follow fund movements across chains, through mixers, bridges, and into exchange wallets.' },
              { step: '03', title: 'Build Evidence', desc: 'Compile timestamped evidence including wallet graphs, transaction records, and OSINT data.' },
              { step: '04', title: 'Generate Report', desc: 'Export evidence packets for exchange freeze requests or law enforcement filings.' },
            ].map(s => (
              <div key={s.step} className="glass-card rounded-xl p-6 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-cyber-green/20 bg-cyber-green/10 text-sm font-bold text-cyber-green">
                  {s.step}
                </div>
                <h4 className="font-bold text-white mb-1">{s.title}</h4>
                <p className="text-xs text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance */}
        <div className="glass-card-premium rounded-2xl p-8 sm:p-10 mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Shield className="h-6 w-6 text-cyber-green" />
            Security & Compliance
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              'SOC 2 Type II certified infrastructure',
              'End-to-end encryption for all data at rest and in transit',
              'GDPR and CCPA compliant data handling',
              'Full audit logging for investigation actions',
              'Role-based access control (RBAC)',
              'Data residency options (US, EU, APAC)',
              'Regular third-party security assessments',
              'No data shared with third parties without consent',
            ].map(item => (
              <div key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-cyber-green" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to get started?</h2>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto">
            Contact us for a personalized demo, volume pricing, or to discuss integration with your existing investigation workflow.
          </p>
          <button onClick={onRequestDemo} className="btn-primary text-sm px-8 py-3.5 inline-flex items-center gap-2">
            Request a Demo <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
