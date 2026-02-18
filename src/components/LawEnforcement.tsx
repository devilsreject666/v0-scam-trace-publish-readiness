import { Shield, FileText, Clock, Globe, CheckCircle2, ArrowRight, Scale, Lock, XCircle, Users } from 'lucide-react';

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
            <span className="text-xs font-medium text-cyber-blue">Law Enforcement & Investigators</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl text-balance">
            Digital Evidence Management for <span className="gradient-text">Blockchain Fraud</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            ScamTrace is a digital evidence management system for blockchain-related fraud. We provide tooling to help investigators document, preserve, and report on crypto incidents.
          </p>
        </div>

        {/* What we provide */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-16">
          {[
            {
              icon: FileText,
              title: 'Document Incidents',
              desc: 'Create structured case files for crypto-related fraud incidents with organized notes, evidence, and metadata.',
            },
            {
              icon: Lock,
              title: 'Preserve Evidence',
              desc: 'Maintain chain-of-custody records with timestamped evidence logs and immutable audit trails for all case data.',
            },
            {
              icon: Clock,
              title: 'Reconstruct Timelines',
              desc: 'Build chronological event timelines from transaction data and evidence to reconstruct the sequence of events.',
            },
            {
              icon: Globe,
              title: 'Generate Reports',
              desc: 'Export standardized, professional forensic reports suitable for exchange submissions or law enforcement filings.',
            },
            {
              icon: Users,
              title: 'Case Organization',
              desc: 'Organize multiple investigations with structured case management, searchable evidence, and categorized data.',
            },
            {
              icon: Shield,
              title: 'Data Integrity',
              desc: 'All entries include timestamps and immutable logs. Data is user-submitted and remains under your control.',
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

        {/* What ScamTrace Is / Is Not */}
        <div className="grid gap-6 sm:grid-cols-2 mb-16">
          <div className="glass-card-premium rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-cyber-green" />
              What ScamTrace Is
            </h2>
            <ul className="space-y-3">
              {[
                'A documentation and analysis platform',
                'A forensic reporting system',
                'A case organization tool',
                'A blockchain transaction documentation tool',
                'An evidence preservation system',
              ].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-cyber-green" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card-premium rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <XCircle className="h-5 w-5 text-cyber-red" />
              What ScamTrace Is Not
            </h2>
            <ul className="space-y-3">
              {[
                'A recovery service',
                'A law enforcement agency',
                'A blockchain surveillance provider',
                'A transaction reversal system',
                'A financial or legal advisor',
              ].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <XCircle className="h-4 w-4 flex-shrink-0 text-cyber-red/70" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Legitimate Use Cases */}
        <div className="glass-card-premium rounded-2xl p-8 sm:p-10 mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Legitimate Use Cases</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              'Victim case documentation',
              'OSINT investigations',
              'Internal compliance audits',
              'Media research',
              'Academic analysis',
              'Law enforcement case support',
            ].map(item => (
              <div key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-cyber-green" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Data Policy */}
        <div className="glass-card-premium rounded-2xl p-8 sm:p-10 mb-16">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <Shield className="h-6 w-6 text-cyber-green" />
            Data Policy
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
            All data is user-submitted. ScamTrace does not access private wallets, hidden blockchains, or proprietary databases.
            All case data remains private and accessible only to the account owner unless explicitly shared.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to get started?</h2>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto">
            Contact us for a personalized demo or to discuss how ScamTrace can support your investigation workflow.
          </p>
          <button onClick={onRequestDemo} className="btn-primary text-sm px-8 py-3.5 inline-flex items-center gap-2">
            Request a Demo <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
