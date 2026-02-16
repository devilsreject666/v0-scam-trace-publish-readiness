import { useState, useEffect } from 'react';
import { Shield, Menu, X, ChevronDown, LogOut } from 'lucide-react';
import type { UserProfile } from './AuthModal';

interface NavbarProps {
  user?: UserProfile | null;
  onSignIn?: () => void;
  onSignUp?: () => void;
  onLogout?: () => void;
}

export function Navbar({ user, onSignIn, onSignUp, onLogout }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const productItems = [
    { name: 'Live Monitor', desc: 'Real-time transaction monitoring', href: '#tracker' },
    { name: 'Report a Scam', desc: 'Submit scam reports with AI extraction', href: '#submit-report' },
    { name: 'Chat Evidence Portal', desc: 'Upload Telegram/WhatsApp chats', href: '#chat-evidence' },
    { name: 'Domain & Phone Intel', desc: 'OSINT investigation tools', href: '#osint-tools' },
    { name: 'No-Trace Browser', desc: 'Sandboxed safe browsing', href: '#safe-browser' },
    { name: 'Smart Contract Escrow', desc: 'Time-delayed escrow holds', href: '#escrow' },
    { name: 'ScamTrace Wallet', desc: 'Monitored transaction interface', href: '#scam-wallet' },
    { name: 'Money Tracker', desc: 'Loss intelligence & aggregation', href: '#money-tracker' },
    { name: 'Evidence Vault', desc: 'Forensic evidence documentation', href: '#evidence' },
    { name: 'Admin Dashboard', desc: 'Intelligence command center', href: '#admin' },
  ];

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Dashboard', href: '#tracker' },
    { label: 'Report', href: '#submit-report' },
    { label: 'Tools', href: '#osint-tools' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'border-b border-white/5 bg-dark-900/90 backdrop-blur-xl shadow-xl shadow-black/20' : 'bg-transparent'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyber-green to-cyber-blue transition-shadow group-hover:shadow-lg group-hover:shadow-cyber-green/20">
              <Shield className="h-5 w-5 text-dark-900" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Scam<span className="text-cyber-green">Trace</span>
            </span>
          </a>

          <div className="hidden items-center gap-1 md:flex">
            <div className="relative"
              onMouseEnter={() => setProductsOpen(true)}
              onMouseLeave={() => setProductsOpen(false)}
            >
              <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white">
                Products <ChevronDown className={`h-3.5 w-3.5 transition-transform ${productsOpen ? 'rotate-180' : ''}`} />
              </button>
              {productsOpen && (
                <div className="absolute left-0 top-full mt-1 w-72 rounded-xl border border-white/10 bg-dark-800/95 p-2 shadow-2xl backdrop-blur-xl">
                  {productItems.map(item => (
                    <a key={item.name} href={item.href}
                      className="block rounded-lg px-3 py-2.5 transition hover:bg-white/5"
                      onClick={() => setProductsOpen(false)}
                    >
                      <div className="text-sm font-medium text-white">{item.name}</div>
                      <div className="text-xs text-slate-400">{item.desc}</div>
                    </a>
                  ))}
                </div>
              )}
            </div>
            {navLinks.map(item => (
              <a key={item.label} href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white">
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyber-green to-cyber-blue text-[10px] font-bold text-dark-900">
                    {user.avatar}
                  </div>
                  <span className="text-sm text-white">{user.name}</span>
                  {user.role === 'admin' && (
                    <span className="rounded-full bg-cyber-purple/10 px-1.5 py-0.5 text-[9px] font-bold text-cyber-purple">ADMIN</span>
                  )}
                </div>
                <button onClick={onLogout} className="rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-white transition flex items-center gap-1.5">
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <button onClick={onSignIn} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white">
                  Sign In
                </button>
                <button onClick={onSignUp}
                  className="btn-primary text-sm px-5 py-2.5 rounded-lg inline-flex items-center gap-1.5">
                  Launch App
                </button>
              </>
            )}
          </div>

          <button className="md:hidden text-white p-1" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/5 bg-dark-900/98 backdrop-blur-xl md:hidden animate-fade-in">
          <div className="space-y-1 px-4 py-4">
            {[
              { label: 'Features', href: '#features' },
              { label: 'Live Monitor', href: '#tracker' },
              { label: 'Report Scam', href: '#submit-report' },
              { label: 'Chat Evidence', href: '#chat-evidence' },
              { label: 'OSINT Tools', href: '#osint-tools' },
              { label: 'Safe Browser', href: '#safe-browser' },
              { label: 'Escrow', href: '#escrow' },
              { label: 'ScamTrace Wallet', href: '#scam-wallet' },
              { label: 'Money Tracker', href: '#money-tracker' },
              { label: 'Evidence Vault', href: '#evidence' },
              { label: 'Admin', href: '#admin' },
              { label: 'Pricing', href: '#pricing' },
            ].map(item => (
              <a key={item.label} href={item.href}
                className="block rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5"
                onClick={() => setMobileOpen(false)}>
                {item.label}
              </a>
            ))}
            <div className="pt-3 border-t border-white/5">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-white">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyber-green to-cyber-blue text-[10px] font-bold text-dark-900">{user.avatar}</div>
                    {user.name}
                  </div>
                  <button onClick={() => { onLogout?.(); setMobileOpen(false); }} className="text-sm text-slate-400">Sign Out</button>
                </div>
              ) : (
                <button
                  onClick={() => { onSignUp?.(); setMobileOpen(false); }}
                  className="block w-full btn-primary text-center text-sm py-3 rounded-lg">
                  Launch App
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
