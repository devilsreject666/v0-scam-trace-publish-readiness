import { DollarSign, Users, TrendingUp, Share2, Link2, CheckCircle2, ArrowRight, Copy, Gift, Zap, Shield } from 'lucide-react';
import { useState } from 'react';

const TIERS = [
  {
    name: 'Affiliate',
    commission: '20%',
    threshold: '$0',
    color: 'from-slate-400 to-slate-500',
    glowColor: 'rgba(148,163,184,0.2)',
    borderColor: 'rgba(148,163,184,0.2)',
    features: [
      '20% recurring commission',
      'All subscription plans',
      'Real-time dashboard',
      'Payout via PayPal or crypto',
      '30-day cookie window',
    ],
    cta: 'Apply as Affiliate',
  },
  {
    name: 'Partner',
    commission: '25%',
    threshold: '$500/mo revenue',
    color: 'from-[#00f5ff] to-[#0066ff]',
    glowColor: 'rgba(0,245,255,0.3)',
    borderColor: 'rgba(0,245,255,0.3)',
    features: [
      '25% recurring commission',
      'Co-branded landing pages',
      'Priority affiliate support',
      'Dedicated account manager',
      '60-day cookie window',
      'Quarterly bonus payouts',
    ],
    cta: 'Apply as Partner',
    popular: true,
  },
  {
    name: 'Strategic',
    commission: '30%',
    threshold: 'Law firm / Agency',
    color: 'from-[#bf00ff] to-[#ff00aa]',
    glowColor: 'rgba(191,0,255,0.25)',
    borderColor: 'rgba(191,0,255,0.2)',
    features: [
      '30% recurring commission',
      'Custom integration options',
      'White-label sub-accounts',
      'Revenue share on sub-licenses',
      'Legal co-marketing rights',
      'Annual revenue guarantees',
    ],
    cta: 'Contact Partnerships',
  },
];

const TARGET_PARTNERS = [
  { type: 'Lawyers & Attorneys', icon: Shield, desc: 'Refer clients facing crypto fraud cases. Earn 30% on every plan they subscribe to.' },
  { type: 'Recovery Firms', icon: TrendingUp, desc: 'Enhance your recovery services with ScamTrace tools and earn on every referral.' },
  { type: 'Financial Advisors', icon: DollarSign, desc: 'Protect clients proactively. Refer them for monitoring, earn passively.' },
  { type: 'Security Researchers', icon: Zap, desc: 'Content creators and researchers who educate about crypto fraud.' },
  { type: 'NGOs & Victim Groups', icon: Users, desc: 'Support victims and earn to fund your organization\'s operations.' },
  { type: 'Cybersecurity Companies', icon: Link2, desc: 'Bundle ScamTrace into your service offering or integrate via API.' },
];

interface Props {
  onSignUp: () => void;
  onBack: () => void;
}

export function AffiliatePage({ onSignUp, onBack }: Props) {
  const [copied, setCopied] = useState(false);
  const demoLink = 'https://scamtrace.store/?ref=YOUR_CODE';

  const handleCopy = () => {
    navigator.clipboard.writeText(demoLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#03081a] text-slate-100 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-10 text-sm transition-colors">
          ← Back to ScamTrace
        </button>

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] text-sm font-medium mb-4">
            <Gift size={14} /> Referral & Affiliate Program
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-['Orbitron'] text-white mb-4">
            Earn Up to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#00f5ff]">30% Recurring</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Refer lawyers, victims, investigators, and security professionals to ScamTrace. Earn commission on every subscription they purchase — forever.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {[
            { value: '30%', label: 'Max Commission', icon: DollarSign, color: 'text-[#00ff88]' },
            { value: 'Recurring', label: 'Lifetime Payments', icon: TrendingUp, color: 'text-[#00f5ff]' },
            { value: '60 days', label: 'Cookie Window', icon: Share2, color: 'text-purple-400' },
            { value: '$500+', label: 'Avg Partner/Month', icon: Gift, color: 'text-yellow-400' },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-2xl border border-white/10 p-5 text-center">
              <s.icon size={22} className={`${s.color} mx-auto mb-2`} />
              <p className={`text-2xl font-bold font-['Orbitron'] ${s.color} mb-1`}>{s.value}</p>
              <p className="text-slate-400 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Demo referral link preview */}
        <div className="glass-card rounded-2xl border border-[#00ff88]/20 p-6 mb-14">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1">
              <p className="text-white font-semibold mb-1">Your unique referral link</p>
              <p className="text-slate-400 text-sm">Share this link and earn commission on every signup</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="flex-1 md:w-64 bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-slate-400 truncate">
                {demoLink}
              </div>
              <button onClick={handleCopy} className="px-4 py-3 rounded-xl border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] text-sm font-semibold flex items-center gap-2 hover:bg-[#00ff88]/20 transition-colors">
                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Tiers */}
        <h2 className="text-2xl font-bold text-white text-center mb-8">Commission Tiers</h2>
        <div className="grid md:grid-cols-3 gap-5 mb-14">
          {TIERS.map(tier => (
            <div
              key={tier.name}
              className="glass-card rounded-2xl p-6 border relative"
              style={{ borderColor: tier.borderColor, boxShadow: `0 0 20px ${tier.glowColor}30` }}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-[#00f5ff] to-[#0066ff] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">Most Popular</span>
                </div>
              )}
              <div className={`inline-flex text-4xl font-extrabold font-['Orbitron'] bg-gradient-to-r ${tier.color} bg-clip-text text-transparent mb-1`}>
                {tier.commission}
              </div>
              <p className="text-white font-bold text-lg mb-0.5">{tier.name}</p>
              <p className="text-slate-500 text-xs mb-5">{tier.threshold}</p>
              <ul className="space-y-2.5 mb-6">
                {tier.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 size={13} className="text-[#00ff88] shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onSignUp}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                style={{ background: `linear-gradient(135deg, ${tier.color.includes('ff88') ? '#00ff88, #00f5ff' : tier.color.includes('bf00ff') ? '#bf00ff, #ff00aa' : '#00f5ff, #0066ff'})`, color: tier.color.includes('ff88') ? '#03081a' : 'white' }}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Who it's for */}
        <h2 className="text-2xl font-bold text-white text-center mb-8">Who Should Partner With ScamTrace</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-14">
          {TARGET_PARTNERS.map(p => (
            <div key={p.type} className="glass-card rounded-xl border border-white/10 p-5">
              <p.icon size={20} className="text-[#00ff88] mb-3" />
              <p className="text-white font-semibold text-sm mb-1">{p.type}</p>
              <p className="text-slate-500 text-xs leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="glass-card rounded-2xl border border-white/10 p-8 mb-10">
          <h2 className="text-xl font-bold text-white text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Apply', desc: 'Submit your affiliate application. Approval within 24–48 hours.' },
              { step: '2', title: 'Get Your Link', desc: 'Receive a unique referral link and marketing materials.' },
              { step: '3', title: 'Refer', desc: 'Share your link with clients, your audience, or your network.' },
              { step: '4', title: 'Earn', desc: 'Receive commission on every subscription — for as long as they stay.' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00f5ff] to-[#00ff88] flex items-center justify-center text-[#03081a] font-bold mx-auto mb-3">
                  {s.step}
                </div>
                <p className="text-white font-semibold text-sm mb-1">{s.title}</p>
                <p className="text-slate-500 text-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button onClick={onSignUp} className="px-10 py-4 rounded-2xl bg-gradient-to-r from-[#00ff88] to-[#00f5ff] text-[#03081a] font-extrabold text-lg flex items-center gap-3 mx-auto hover:opacity-90 transition-opacity">
            <Gift size={20} /> Apply to Affiliate Program <ArrowRight size={18} />
          </button>
          <p className="text-slate-500 text-sm mt-3">No application fee · Free to join · Paid monthly</p>
        </div>
      </div>
    </div>
  );
}
