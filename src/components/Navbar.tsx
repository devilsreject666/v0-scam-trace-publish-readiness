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
        ? 'backdrop-blur-2xl bg-[rgba(2,5,16,0.85)] border-b border-[rgba(0,245,255,0.1)] shadow-[0_4px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(0,245,255,0.05)]'
        : 'bg-transparent'
    }`}>
      {/* Top neon scan line on scroll */}
      {scrolled && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,245,255,0.4)] to-transparent" />
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group" onClick={() => onNavigate?.('home')}>
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#00f5ff] to-[#bf00ff] transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,245,255,0.6)] group-hover:scale-110">
              <Shield className="h-5 w-5 text-[#020510]" strokeWidth={2.5} />
            </div>
            <span className="font-[Space_Grotesk] text-xl font-bold tracking-tight text-white group-hover:text-[#00f5ff] transition-colors duration-300">
              Scam<span className="text-[#00f5ff] [text-shadow:0_0_10px_rgba(0,245,255,0.8),0_0_20px_rgba(0,245,255,0.4)]">Trace</span>
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-1 md:flex">
            {/* Products dropdown */}
            <div className="relative"
              onMouseEnter={() => setProductsOpen(true)}
              onMouseLeave={() => setProductsOpen(false)}
            >
              <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium uppercase tracking-widest text-slate-300 transition-all duration-200 hover:text-[#00f5ff] hover:bg-[rgba(0,245,255,0.05)]">
                Products <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${productsOpen ? 'rotate-180 text-[#00f5ff]' : ''}`} />
              </button>
              {productsOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl border border-[rgba(0,245,255,0.15)] bg-[rgba(2,5,16,0.95)] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(0,245,255,0.08)] backdrop-blur-2xl animate-fade-in">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,245,255,0.3)] to-transparent rounded-t-2xl" />
                  {productItems.map(item => (
                    <a key={item.name} href={item.href}
                      className="group/item block rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-[rgba(0,245,255,0.06)] hover:border-l-2 hover:border-[#00f5ff] hover:pl-[10px]"
                      onClick={() => setProductsOpen(false)}
                    >
                      <div className="text-sm font-semibold text-white group-hover/item:text-[#00f5ff] transition-colors">{item.name}</div>
                      <div className="text-xs text-slate-500">{item.desc}</div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {navLinks.map(item => (
              <a key={item.label} href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium uppercase tracking-widest text-slate-300 transition-all duration-200 hover:text-[#00f5ff] hover:bg-[rgba(0,245,255,0.05)] relative group/link">
                {item.label}
                <span className="absolute bottom-0 left-1/2 w-0 h-px bg-[#00f5ff] shadow-[0_0_8px_#00f5ff] transition-all duration-300 group-hover/link:w-4/5 group-hover/link:left-[10%]" />
              </a>
            ))}

            <button onClick={() => onNavigate?.('law-enforcement')}
              className="rounded-lg px-3 py-2 text-sm font-medium uppercase tracking-widest text-slate-300 transition-all duration-200 hover:text-[#00f5ff] hover:bg-[rgba(0,245,255,0.05)] flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5" /> Law Enforcement
            </button>
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <button onClick={() => onNavigate?.('dashboard')}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[#00f5ff] hover:bg-[rgba(0,245,255,0.08)] transition flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> My Cases
                </button>
                <div className="flex items-center gap-2 rounded-xl bg-[rgba(0,245,255,0.06)] border border-[rgba(0,245,255,0.15)] px-3 py-1.5 backdrop-blur-sm">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#00f5ff] to-[#bf00ff] text-[10px] font-bold text-[#020510] shadow-[0_0_10px_rgba(0,245,255,0.4)]">
                    {avatar}
                  </div>
                  <span className="text-sm text-white">{displayName}</span>
                  {profile?.role === 'admin' && (
                    <span className="rounded-full bg-[rgba(191,0,255,0.1)] border border-[rgba(191,0,255,0.3)] px-1.5 py-0.5 text-[9px] font-bold text-[#bf00ff]">ADMIN</span>
                  )}
                </div>
                <button onClick={() => signOut()} className="rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-[#00f5ff] transition flex items-center gap-1.5">
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <button onClick={onSignIn}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:text-[#00f5ff] hover:bg-[rgba(0,245,255,0.05)]">
                  Sign In
                </button>
                <button onClick={onRequestDemo}
                  className="rounded-xl border border-[rgba(0,245,255,0.25)] bg-[rgba(0,245,255,0.06)] px-4 py-2 text-sm font-medium text-[#00f5ff] hover:bg-[rgba(0,245,255,0.12)] hover:border-[rgba(0,245,255,0.45)] hover:shadow-[0_0_15px_rgba(0,245,255,0.2)] transition-all duration-200 backdrop-blur-sm">
                  Request Demo
                </button>
                <button onClick={onSignUp}
                  className="btn-primary text-sm px-5 py-2.5 rounded-xl inline-flex items-center gap-1.5 font-bold tracking-wide">
                  Launch App
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden rounded-lg p-2 text-slate-300 hover:text-[#00f5ff] hover:bg-[rgba(0,245,255,0.06)] transition-all duration-200"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen
              ? <X className="h-6 w-6 text-[#00f5ff] [filter:drop-shadow(0_0_6px_rgba(0,245,255,0.8))]" />
              : <Menu className="h-6 w-6" />
            }
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[rgba(0,245,255,0.1)] bg-[rgba(2,5,16,0.97)] backdrop-blur-2xl md:hidden animate-fade-in">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,245,255,0.3)] to-transparent" />
          <div className="space-y-1 px-4 py-5">
            {[
              { label: 'Features', href: '#features' },
              { label: 'Case Studies', href: '#case-studies' },
              { label: 'Live Monitor', href: '#tracker' },
              { label: 'Report Scam', href: '#submit-report' },
              { label: 'OSINT Tools', href: '#osint-tools' },
              { label: 'Pricing', href: '#pricing' },
            ].map(item => (
              <a key={item.label} href={item.href}
                className="flex items-center rounded-xl px-4 py-3 text-sm font-medium uppercase tracking-widest text-slate-300 hover:text-[#00f5ff] hover:bg-[rgba(0,245,255,0.06)] transition-all duration-200"
                onClick={() => setMobileOpen(false)}>
                <span className="mr-2 h-px w-3 bg-[rgba(0,245,255,0.4)]" />
                {item.label}
              </a>
            ))}
            <button onClick={() => { onNavigate?.('law-enforcement'); setMobileOpen(false); }}
              className="flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium uppercase tracking-widest text-slate-300 hover:text-[#00f5ff] hover:bg-[rgba(0,245,255,0.06)] transition-all duration-200">
              <span className="mr-2 h-px w-3 bg-[rgba(0,245,255,0.4)]" />
              Law Enforcement
            </button>
            <div className="pt-4 border-t border-[rgba(0,245,255,0.08)] space-y-2 mt-2">
              {user ? (
                <>
                  <button onClick={() => { onNavigate?.('dashboard'); setMobileOpen(false); }}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-[#00f5ff] hover:bg-[rgba(0,245,255,0.06)] transition">
                    <FileText className="h-4 w-4" /> My Cases
                  </button>
                  <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-2 text-sm text-white">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#00f5ff] to-[#bf00ff] text-[10px] font-bold text-[#020510] shadow-[0_0_10px_rgba(0,245,255,0.4)]">{avatar}</div>
                      {displayName}
                    </div>
                    <button onClick={() => { signOut(); setMobileOpen(false); }} className="text-sm text-slate-400 hover:text-[#00f5ff] transition">Sign Out</button>
                  </div>
                </>
              ) : (
                <>
                  <button onClick={() => { onRequestDemo?.(); setMobileOpen(false); }}
                    className="flex w-full items-center justify-center rounded-xl border border-[rgba(0,245,255,0.25)] bg-[rgba(0,245,255,0.06)] px-4 py-3 text-sm font-medium text-[#00f5ff]">
                    Request Demo
                  </button>
                  <button
                    onClick={() => { onSignUp?.(); setMobileOpen(false); }}
                    className="block w-full btn-primary text-center text-sm py-3 rounded-xl font-bold tracking-wide">
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
