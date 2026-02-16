import { Shield, Lock, Eye, Server, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

interface CompliancePageProps {
  onBack: () => void;
}

export function CompliancePage({ onBack }: CompliancePageProps) {
  return (
    <section className="min-h-screen bg-dark-900 pt-20 pb-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <button onClick={onBack} className="mb-8 text-sm text-slate-400 hover:text-white transition flex items-center gap-1">
          {'<-'} Back to Home
        </button>

        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-green/20 bg-cyber-green/[0.06] px-4 py-1.5">
            <Shield className="h-3.5 w-3.5 text-cyber-green" />
            <span className="text-xs font-medium text-cyber-green">Security & Compliance</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl text-balance">
            Enterprise-Grade <span className="gradient-text">Security</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
            ScamTrace is built with security and regulatory compliance as foundational principles.
          </p>
        </div>

        <div className="space-y-8">
          {[
            {
              icon: Lock,
              title: 'Data Encryption',
              items: [
                'AES-256 encryption for all data at rest',
                'TLS 1.3 for all data in transit',
                'Wallet Scan operates fully offline -- seed phrases never leave your device',
                'Client-side encryption for sensitive evidence files',
              ],
            },
            {
              icon: Eye,
              title: 'Access Controls',
              items: [
                'Role-based access control (RBAC) with granular permissions',
                'Multi-factor authentication support',
                'Session management with automatic timeout',
                'IP allowlisting for enterprise accounts',
              ],
            },
            {
              icon: Server,
              title: 'Infrastructure',
              items: [
                'SOC 2 Type II certified cloud infrastructure',
                'Geographic data residency options (US, EU, APAC)',
                'Automated backups with point-in-time recovery',
                '99.9% uptime SLA for enterprise plans',
              ],
            },
            {
              icon: FileText,
              title: 'Regulatory Compliance',
              items: [
                'GDPR compliant with Data Processing Agreement available',
                'CCPA compliant with opt-out mechanisms',
                'Regular third-party penetration testing',
                'Annual SOC 2 audit reports available upon request',
              ],
            },
          ].map(section => (
            <div key={section.title} className="glass-card-premium rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyber-green/10">
                  <section.icon className="h-5 w-5 text-cyber-green" />
                </div>
                <h2 className="text-xl font-bold text-white">{section.title}</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {section.items.map(item => (
                  <div key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-cyber-green mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-400 mb-6">
            Need more details? Request our full security whitepaper or schedule a call with our security team.
          </p>
          <a href="mailto:security@scamtrace.com" className="btn-primary text-sm px-6 py-3 inline-flex items-center gap-2">
            Contact Security Team <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
