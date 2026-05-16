import { Shield, Github, Twitter, Mail, ArrowRight } from 'lucide-react';
import { Disclaimer } from './Disclaimer';

interface FooterProps {
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onNavigate?: (page: string) => void;
}

export function Footer({ onOpenPrivacy, onOpenTerms, onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-[rgba(0,245,255,0.08)] bg-[rgba(2,5,16,0.95)] backdrop-blur-xl">
      {/* Top glow line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[rgba(0,245,255,0.3)] via-50% to-transparent" />

      {/* CTA Banner */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl my-10 glass-card-neon p-8 sm:p-12">
          {/* Inner ambient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,245,255,0.03)] via-transparent to-[rgba(191,0,255,0.03)] pointer-events-none" />
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-[rgba(0,245,255,0.06)] blur-3xl" />

          <div className="relative flex flex-col items-center text-center">
            <h3 className="text-2xl font-bold text-white sm:text-3xl heading-3d">
              Ready to start <span className="gradient-text">monitoring?</span>
            </h3>
            <p className="mt-3 max-w-xl text-sm text-slate-400">
              Join thousands of users documenting and reporting crypto fraud. Start with our free plan — no credit card required.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a href="#tracker" className="btn-primary text-sm px-7 py-3.5 flex items-center gap-2 rounded-xl font-bold">
                Launch ScamTrace <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#pricing" className="btn-secondary text-sm px-7 py-3.5 rounded-xl">
                View Plans
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">

          {/* Brand col */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00f5ff] to-[#bf00ff] shadow-[0_0_15px_rgba(0,245,255,0.35)] group-hover:shadow-[0_0_25px_rgba(0,245,255,0.6)] transition-all duration-300">
                <Shield className="h-5 w-5 text-[#020510]" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-white font-[Space_Grotesk,sans-serif]">
                Scam<span className="text-[#00f5ff] [text-shadow:0_0_10px_rgba(0,245,255,0.7)]">Trace</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Transaction monitoring and forensic documentation platform for blockchain users.
              Trace fund movements, generate evidence, and report fraud.
            </p>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Get threat intelligence updates</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="input-neon flex-grow px-4 py-2.5 text-sm"
                />
                <button className="rounded-xl bg-[rgba(0,245,255,0.1)] border border-[rgba(0,245,255,0.2)] px-3.5 py-2.5 text-[#00f5ff] transition-all duration-200 hover:bg-[rgba(0,245,255,0.18)] hover:shadow-[0_0_15px_rgba(0,245,255,0.2)]">
                  <Mail className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              {[Twitter, Github].map((Icon, i) => (
                <a key={i} href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(0,245,255,0.1)] text-slate-400 transition-all duration-200 hover:bg-[rgba(0,245,255,0.08)] hover:text-[#00f5ff] hover:border-[rgba(0,245,255,0.3)] hover:shadow-[0_0_12px_rgba(0,245,255,0.2)]">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#00f5ff] [text-shadow:0_0_8px_rgba(0,245,255,0.5)] mb-5">Products</h4>
            <ul className="space-y-3">
              {[
                { label: 'Live Monitor', href: '#tracker' },
                { label: 'Report a Scam', href: '#submit-report' },
                { label: 'Chat Evidence Portal', href: '#chat-evidence' },
                { label: 'Domain Checker', href: '#osint-tools' },
                { label: 'Phone Lookup', href: '#osint-tools' },
                { label: 'No-Trace Browser', href: '#safe-browser' },
                { label: 'Smart Contract Escrow', href: '#escrow' },
                { label: 'ScamTrace Wallet', href: '#scam-wallet' },
                { label: 'Evidence Vault', href: '#evidence' },
              ].map(link => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-slate-400 transition-all duration-200 hover:text-[#00f5ff] hover:translate-x-1 inline-block">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#00f5ff] [text-shadow:0_0_8px_rgba(0,245,255,0.5)] mb-5">Resources</h4>
            <ul className="space-y-3">
              {['Documentation', 'API Reference', 'Blog', 'Case Studies', 'Tutorials', 'Community Forum'].map(link => (
                <li key={link}>
                  <a href="#" className="text-sm text-slate-400 transition-all duration-200 hover:text-[#00f5ff] hover:translate-x-1 inline-block">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#00f5ff] [text-shadow:0_0_8px_rgba(0,245,255,0.5)] mb-5">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-slate-400 hover:text-[#00f5ff] transition-all duration-200 hover:translate-x-1 inline-block">About Us</a></li>
              <li>
                <button onClick={() => onNavigate?.('law-enforcement')} className="text-sm text-slate-400 hover:text-[#00f5ff] transition-all duration-200 text-left hover:translate-x-1">
                  Law Enforcement
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('compliance')} className="text-sm text-slate-400 hover:text-[#00f5ff] transition-all duration-200 text-left hover:translate-x-1">
                  Security & Compliance
                </button>
              </li>
              <li>
                <button onClick={onOpenPrivacy} className="text-sm text-slate-400 hover:text-[#00f5ff] transition-all duration-200 text-left hover:translate-x-1">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={onOpenTerms} className="text-sm text-slate-400 hover:text-[#00f5ff] transition-all duration-200 text-left hover:translate-x-1">
                  Terms of Service
                </button>
              </li>
              <li><a href="mailto:contact@scamtrace.com" className="text-sm text-slate-400 hover:text-[#00f5ff] transition-all duration-200 hover:translate-x-1 inline-block">Contact</a></li>
            </ul>
          </div>
        </div>

        <Disclaimer className="mt-12 pt-8 border-t border-[rgba(0,245,255,0.06)]" />

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[rgba(0,245,255,0.06)] pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} ScamTrace, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="live-dot h-1.5 w-1.5" />
              All systems operational
            </span>
            <span className="text-xs text-slate-600 font-[Orbitron,sans-serif] tracking-wider">v3.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
