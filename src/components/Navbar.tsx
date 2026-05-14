import { useState, useEffect } from 'react';
import { Shield, Menu, X, ChevronDown, LogOut, Scale, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  onSignIn?: () => void;
  onSignUp?: () => void;
  onRequestDemo?: () => void;
  onNavigate?: (page: string) => void;
}

export function Navbar({ onSignIn, onSignUp, onRequestDemo, onNavigate }: NavbarProps) {
  const { user, profile, signOut } = useAuth();
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
  ];

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Case Studies', href: '#case-studies' },
    { label: 'Pricing', href: '#pricing' },
  ];

  const displayName = profile?.full_name ?? user?.email?.split('@')[0] ?? 'User';
  const avatar = displayName.substring(0, 2).toUpperCase();

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'border-b border-[rgba(0,255,200,0.1)] bg-[rgba(10,10,15,0.85)] backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.3)]' 
        : 'bg-transparent'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group" onClick={() => onNavigate?.('home')}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#00ff96] to-[#00f0ff] transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,255,150,0.4)]">
              <Shield className="h-5 w-5 text-[#0a0a0f]" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Scam<span className="text-[#00ff96]">Trace</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            <div className="relative"
              onMouseEnter={() => setProductsOpen(true)}
              onMouseLeave={() => setProductsOpen(false)}
            >
              <button className="btn-nav flex items-center gap-1 text-sm">
                Products <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${productsOpen ? 'rotate-180' : ''}`} />
              </button>
              {productsOpen && (
                <div className="absolute left-0 top-full mt-2 w-80 rounded-xl border border-[rgba(0,255,200,0.15)] bg-[rgba(13,13,20,0.95)] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_20px_rgba(0,255,150,0.05)] backdrop-blur-2xl animate-fade-in">
                  {productItems.map(item => (
                    <a key={item.name} href={item.href}
                      className="block rounded-lg px-3 py-2.5 transition-all duration-300 hover:bg-[rgba(0,255,200,0.06)] hover:shadow-[inset_0_0_20px_rgba(0,255,150,0.03)]"
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
              <a key={item.label} href={item.href} className="btn-nav text-sm">
                {item.label}
              </a>
            ))}
            <button onClick={() => onNavigate?.('law-enforcement')}
              className="btn-nav text-sm flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5" /> Law Enforcement
            </button>
          </div>

          {/* Desktop Auth */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <button onClick={() => onNavigate?.('dashboard')}
                  className="glass-badge glass-badge-green cursor-pointer transition-all duration-300 hover:scale-105">
                  <FileText className="h-3.5 w-3.5" /> My Cases
                </button>
                <div className="flex items-center gap-2 rounded-xl bg-[rgba(255,255,255,0.04)] backdrop-blur-xl border border-[rgba(0,255,200,0.1)] px-3 py-1.5 transition-all duration-300 hover:border-[rgba(0,255,200,0.2)] hover:bg-[rgba(255,255,255,0.06)]">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#00ff96] to-[#00f0ff] text-[10px] font-bold text-[#0a0a0f] shadow-[0_0_10px_rgba(0,255,150,0.3)]">
                    {avatar}
                  </div>
                  <span className="text-sm text-white">{displayName}</span>
                  {profile?.role === 'admin' && (
                    <span className="glass-badge-purple text-[9px] px-1.5 py-0.5">ADMIN</span>
                  )}
                </div>
                <button onClick={() => signOut()} 
                  className="btn-ghost text-sm flex items-center gap-1.5 text-slate-400 hover:text-white">
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <button onClick={onSignIn} 
                  className="btn-ghost text-sm font-medium">
                  Sign In
                </button>
                <button onClick={onRequestDemo} 
                  className="btn-secondary text-sm px-4 py-2">
                  Request Demo
                </button>
                <button onClick={onSignUp}
                  className="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-1.5">
                  Launch App
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white transition-all duration-300 hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(0,255,200,0.2)]" 
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[rgba(0,255,200,0.1)] bg-[rgba(10,10,15,0.98)] backdrop-blur-2xl md:hidden animate-fade-in">
          <div className="space-y-1 px-4 py-4">
            {[
              { label: 'Features', href: '#features' },
              { label: 'Case Studies', href: '#case-studies' },
              { label: 'Live Monitor', href: '#tracker' },
              { label: 'Report Scam', href: '#submit-report' },
              { label: 'OSINT Tools', href: '#osint-tools' },
              { label: 'Pricing', href: '#pricing' },
            ].map(item => (
              <a key={item.label} href={item.href}
                className="block rounded-xl px-4 py-3 text-sm text-slate-300 transition-all duration-300 hover:bg-[rgba(0,255,200,0.06)] hover:text-white"
                onClick={() => setMobileOpen(false)}>
                {item.label}
              </a>
            ))}
            <button onClick={() => { onNavigate?.('law-enforcement'); setMobileOpen(false); }}
              className="block w-full text-left rounded-xl px-4 py-3 text-sm text-slate-300 transition-all duration-300 hover:bg-[rgba(0,255,200,0.06)] hover:text-white">
              Law Enforcement
            </button>
            <div className="pt-4 border-t border-[rgba(0,255,200,0.1)] space-y-3">
              {user ? (
                <>
                  <button onClick={() => { onNavigate?.('dashboard'); setMobileOpen(false); }}
                    className="w-full btn-secondary text-sm py-3">
                    My Cases
                  </button>
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[rgba(255,255,255,0.04)]">
                    <div className="flex items-center gap-2 text-sm text-white">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#00ff96] to-[#00f0ff] text-[10px] font-bold text-[#0a0a0f] shadow-[0_0_10px_rgba(0,255,150,0.3)]">{avatar}</div>
                      {displayName}
                    </div>
                    <button onClick={() => { signOut(); setMobileOpen(false); }} className="text-sm text-slate-400 hover:text-white transition-colors">Sign Out</button>
                  </div>
                </>
              ) : (
                <>
                  <button onClick={() => { onRequestDemo?.(); setMobileOpen(false); }}
                    className="w-full btn-secondary text-sm py-3">
                    Request Demo
                  </button>
                  <button
                    onClick={() => { onSignUp?.(); setMobileOpen(false); }}
                    className="w-full btn-primary text-sm py-3">
                    Launch App
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
