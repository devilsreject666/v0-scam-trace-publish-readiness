import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Chrome, Zap, Eye, Bell, Lock, ArrowRight, Star, Users } from 'lucide-react';

const FEATURES = [
  {
    icon: Shield,
    title: 'Real-Time Domain Protection',
    desc: 'Automatic risk check on every page you visit. Flagged domains show an instant warning banner before you interact.',
    color: 'text-[#00ff88]',
  },
  {
    icon: Eye,
    title: 'Wallet Address Scanner',
    desc: 'Hover over any crypto address on a webpage to see its risk score, transaction history, and scam database status.',
    color: 'text-[#00f5ff]',
  },
  {
    icon: Bell,
    title: 'Phishing Site Alerts',
    desc: 'Identifies exchange impersonators and phishing pages before you enter credentials. Works on mobile banking redirects too.',
    color: 'text-yellow-400',
  },
  {
    icon: Zap,
    title: 'Investment Scam Detection',
    desc: 'AI model trained on 50,000+ scam sites. Detects fake trading platforms even when they mimic legitimate exchanges.',
    color: 'text-orange-400',
  },
  {
    icon: Lock,
    title: 'Privacy-First Design',
    desc: 'No browsing history stored. Domain checks are hashed before sending. Your data never leaves your device in identifiable form.',
    color: 'text-purple-400',
  },
  {
    icon: Users,
    title: 'Community Threat Feed',
    desc: 'Powered by 47,000+ active ScamTrace users. New scam sites reported by one user protect all users within minutes.',
    color: 'text-pink-400',
  },
];

const SCREENSHOTS_MOCK = [
  { state: 'safe', label: 'Safe Site', color: 'border-[#00ff88]/30 bg-[#00ff88]/5', badge: 'VERIFIED SAFE', badgeColor: 'bg-[#00ff88]/20 text-[#00ff88]' },
  { state: 'warning', label: 'Suspicious Domain', color: 'border-yellow-400/30 bg-yellow-400/5', badge: 'CAUTION', badgeColor: 'bg-yellow-400/20 text-yellow-400' },
  { state: 'danger', label: 'Known Scam Site', color: 'border-red-500/40 bg-red-500/8', badge: '⚠ SCAM DETECTED', badgeColor: 'bg-red-500/20 text-red-400' },
];

interface Props {
  onSignUp: () => void;
  onBack: () => void;
}

export function ChromeExtensionPage({ onSignUp, onBack }: Props) {
  const [email, setEmail] = useState('');
  const [notified, setNotified] = useState(false);

  const handleNotify = () => {
    if (email.includes('@')) {
      setNotified(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#03081a] text-slate-100 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-10 text-sm transition-colors">
          ← Back to ScamTrace
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-sm font-medium mb-4">
            <Chrome size={14} /> Browser Extension — Coming Soon
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-['Orbitron'] text-white mb-4">
            ScamTrace <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Shield</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            Passive browser protection that warns you before visiting scam sites, hovering over fraudulent wallets, or interacting with phishing domains. Free forever.
          </p>

          {/* Waitlist CTA */}
          {notified ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] font-semibold">
              <CheckCircle2 size={16} /> You're on the waitlist! We'll notify you at launch.
            </div>
          ) : (
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50 text-sm"
              />
              <button onClick={handleNotify} className="px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 text-[#03081a] font-bold text-sm shrink-0 hover:opacity-90">
                Notify Me
              </button>
            </div>
          )}
          <p className="text-slate-600 text-xs mt-3">Free Chrome & Firefox extension · No account required for basic protection</p>
        </div>

        {/* Extension preview mockup */}
        <div className="flex flex-wrap justify-center gap-4 mb-14">
          {SCREENSHOTS_MOCK.map(s => (
            <div key={s.state} className={`glass-card rounded-xl border ${s.color} p-4 w-64`}>
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-1">
                  {['bg-red-400', 'bg-yellow-400', 'bg-[#00ff88]'].map(c => (
                    <div key={c} className={`w-2.5 h-2.5 rounded-full ${c}`} />
                  ))}
                </div>
                <div className="flex-1 h-5 bg-white/10 rounded-full" />
                <Shield size={14} className="text-[#00f5ff]" />
              </div>
              {/* Fake page content */}
              <div className="space-y-1.5 mb-3">
                <div className="h-3 bg-white/10 rounded w-4/5" />
                <div className="h-3 bg-white/10 rounded w-full" />
                <div className="h-3 bg-white/10 rounded w-3/5" />
              </div>
              {/* Extension overlay */}
              <div className={`rounded-lg p-2 ${s.badgeColor.includes('00ff88') ? 'bg-[#00ff88]/10' : s.badgeColor.includes('yellow') ? 'bg-yellow-400/10' : 'bg-red-500/10'}`}>
                <div className="flex items-center gap-2">
                  {s.state === 'safe' ? <CheckCircle2 size={12} className="text-[#00ff88]" /> : <AlertTriangle size={12} className={s.state === 'danger' ? 'text-red-400' : 'text-yellow-400'} />}
                  <span className={`text-[10px] font-bold ${s.badgeColor.split(' ')[1]}`}>{s.badge}</span>
                </div>
                <p className="text-slate-400 text-[9px] mt-0.5">
                  {s.state === 'safe' ? 'Verified — no threat signals detected' : s.state === 'warning' ? 'Domain registered 3 days ago — proceed with caution' : 'Listed in ScamTrace database — 134 reports'}
                </p>
              </div>
              <p className="text-center text-slate-600 text-[10px] mt-2">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <h2 className="text-2xl font-bold text-white text-center mb-8">What ScamTrace Shield Does</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
          {FEATURES.map(f => (
            <div key={f.title} className="glass-card rounded-xl border border-white/10 p-5">
              <f.icon size={20} className={`${f.color} mb-3`} />
              <p className="text-white font-semibold text-sm mb-2">{f.title}</p>
              <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="glass-card rounded-2xl border border-yellow-500/20 p-8 mb-10">
          <h2 className="text-xl font-bold text-white text-center mb-6">Why Build a Browser Extension?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3 text-slate-300 text-sm">
              <p><strong className="text-white">Passive protection = viral growth.</strong> Every install protects a user who may not know to check ScamTrace manually — and every protected save becomes a word-of-mouth referral.</p>
              <p><strong className="text-white">Free tier drives paid upgrades.</strong> The extension provides basic protection for free. When users click "Full Investigation" on a flagged domain, they're taken directly to the Pro signup flow.</p>
            </div>
            <div className="space-y-3 text-slate-300 text-sm">
              <p><strong className="text-white">Community intel network.</strong> 47,000+ users collectively report new scam sites faster than any single threat intelligence team — creating a self-reinforcing protection network.</p>
              <p><strong className="text-white">Distribution channel.</strong> Chrome Extension stores have 3B+ monthly active users. A well-rated security extension surfaces in search results for "crypto scam protection" with no ad spend.</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="glass-card rounded-2xl border border-white/10 p-8 mb-10">
          <h2 className="text-xl font-bold text-white text-center mb-6">Development Roadmap</h2>
          <div className="space-y-4">
            {[
              { phase: 'Phase 1', status: 'In Progress', title: 'Domain Risk Checker', desc: 'Real-time domain check on page load. Banner alert for flagged sites.' },
              { phase: 'Phase 2', status: 'Planned', title: 'Wallet Address Hover', desc: 'Hover any ETH/BTC/TRX address to see risk score and database status.' },
              { phase: 'Phase 3', status: 'Planned', title: 'AI Content Analysis', desc: 'Detect scam language patterns in page content — even on unknown domains.' },
              { phase: 'Phase 4', status: 'Future', title: 'Community Reporting', desc: 'One-click reporting of new scam sites directly to ScamTrace database.' },
            ].map(item => (
              <div key={item.phase} className="flex items-start gap-4">
                <div className="w-20 text-right shrink-0">
                  <p className="text-white text-xs font-bold">{item.phase}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${item.status === 'In Progress' ? 'bg-[#00ff88]/20 text-[#00ff88]' : item.status === 'Planned' ? 'bg-[#00f5ff]/20 text-[#00f5ff]' : 'bg-white/10 text-slate-400'}`}>
                    {item.status}
                  </span>
                </div>
                <div className="border-l border-white/10 pl-4">
                  <p className="text-white font-semibold text-sm">{item.title}</p>
                  <p className="text-slate-500 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          {notified ? (
            <div>
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] font-semibold mb-4">
                <CheckCircle2 size={16} /> You're on the early access list
              </div>
              <p className="text-slate-400 text-sm">While you wait, use ScamTrace's full web platform to protect yourself now.</p>
              <button onClick={onSignUp} className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#00ff88] text-[#03081a] font-bold flex items-center gap-2 mx-auto">
                <Shield size={16} /> Use ScamTrace Now <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">Get Early Access</h3>
              <p className="text-slate-400 mb-6">Be first to know when ScamTrace Shield launches. Early users get Pro plan free for 3 months.</p>
              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50 text-sm"
                />
                <button onClick={handleNotify} className="px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 text-[#03081a] font-bold text-sm hover:opacity-90">
                  Join Waitlist
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 mt-3">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
                <span className="text-slate-400 text-xs ml-1">Based on 247 ScamTrace platform reviews</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
