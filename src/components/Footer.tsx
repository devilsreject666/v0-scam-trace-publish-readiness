import { Shield, Github, Twitter, Mail, ArrowRight } from 'lucide-react';
import { Disclaimer } from './Disclaimer';

interface FooterProps {
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export function Footer({ onOpenPrivacy, onOpenTerms }: FooterProps) {
  return (
    <footer className="border-t border-white/5 bg-dark-900">
      {/* CTA Banner */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-px overflow-hidden rounded-b-2xl border border-t-0 border-white/5 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800 p-8 sm:p-12">
          <div className="absolute inset-0 bg-gradient-to-r from-cyber-green/[0.03] via-transparent to-cyber-blue/[0.03]" />
          <div className="relative flex flex-col items-center text-center">
            <h3 className="text-2xl font-bold text-white sm:text-3xl">
              Ready to start monitoring?
            </h3>
            <p className="mt-3 max-w-xl text-sm text-slate-400">
              Join thousands of users documenting and reporting crypto fraud. Start with our free plan — no credit card required.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a href="#tracker" className="btn-primary text-sm px-6 py-3 flex items-center gap-2">
                Launch ScamTrace <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#pricing" className="btn-secondary text-sm px-6 py-3">
                View Plans
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyber-green to-cyber-blue">
                <Shield className="h-5 w-5 text-dark-900" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-white">
                Scam<span className="text-cyber-green">Trace</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Transaction monitoring and forensic documentation platform for blockchain users.
              Trace fund movements, generate evidence, and report fraud.
            </p>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-xs font-medium text-slate-400 mb-2">Get threat intelligence updates</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-grow rounded-lg border border-white/10 bg-dark-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 transition"
                />
                <button className="rounded-lg bg-cyber-green/10 px-3 py-2 text-sm font-medium text-cyber-green transition hover:bg-cyber-green/20">
                  <Mail className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white hover:border-white/20">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white hover:border-white/20">
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm font-semibold text-white">Products</h4>
            <ul className="mt-4 space-y-2.5">
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
                  <a href={link.href} className="text-sm text-slate-400 transition hover:text-cyber-green">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white">Resources</h4>
            <ul className="mt-4 space-y-2.5">
              {['Documentation', 'API Reference', 'Blog', 'Case Studies', 'Tutorials', 'Community Forum'].map(link => (
                <li key={link}>
                  <a href="#" className="text-sm text-slate-400 transition hover:text-cyber-green">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white">Company</h4>
            <ul className="mt-4 space-y-2.5">
              <li><a href="#" className="text-sm text-slate-400 transition hover:text-cyber-green">About Us</a></li>
              <li><a href="#" className="text-sm text-slate-400 transition hover:text-cyber-green">Careers</a></li>
              <li><a href="#" className="text-sm text-slate-400 transition hover:text-cyber-green">Contact</a></li>
              <li>
                <button onClick={onOpenPrivacy} className="text-sm text-slate-400 transition hover:text-cyber-green text-left">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={onOpenTerms} className="text-sm text-slate-400 transition hover:text-cyber-green text-left">
                  Terms of Service
                </button>
              </li>
              <li><a href="#" className="text-sm text-slate-400 transition hover:text-cyber-green">Security & SOC 2</a></li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <Disclaimer className="mt-12 pt-8 border-t border-white/5" />

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} ScamTrace, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="h-1.5 w-1.5 rounded-full bg-cyber-green animate-pulse" />
              All systems operational
            </span>
            <span className="text-xs text-slate-600">v3.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
