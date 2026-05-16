import { Building2, Shield, Code2, Globe, CheckCircle2, ArrowRight, Zap, Lock, BarChart3, Users, Star } from 'lucide-react';

const PLANS = [
  {
    name: 'Firm License',
    price: '$499',
    period: '/month',
    desc: 'For law firms and private investigation agencies',
    gradient: 'from-[#00f5ff] to-[#0066ff]',
    glowColor: 'rgba(0,245,255,0.25)',
    features: [
      'ScamTrace platform under your brand',
      'Up to 20 investigator seats',
      'Custom logo & color scheme',
      'Client portal access',
      'Court-ready evidence templates',
      'Priority support (4hr SLA)',
      'Quarterly business reviews',
    ],
  },
  {
    name: 'Enterprise License',
    price: '$1,999',
    period: '/month',
    desc: 'For financial institutions and compliance teams',
    gradient: 'from-[#bf00ff] to-[#ff00aa]',
    glowColor: 'rgba(191,0,255,0.3)',
    features: [
      'Everything in Firm License',
      'Unlimited investigator seats',
      'Full custom domain & branding',
      'API access (10K calls/day)',
      'SSO / SAML integration',
      'Dedicated infrastructure',
      'Custom data retention policies',
      'Compliance reporting (AML/KYC)',
      '24/7 support with SLA guarantee',
    ],
    popular: true,
  },
  {
    name: 'Platform License',
    price: 'Custom',
    period: '',
    desc: 'For SaaS companies integrating blockchain forensics',
    gradient: 'from-yellow-400 to-orange-400',
    glowColor: 'rgba(250,204,21,0.2)',
    features: [
      'Full source-code licensing',
      'Unrestricted API access',
      'Sub-tenant management',
      'Revenue share on sub-licenses',
      'Co-development options',
      'White-glove onboarding',
      'Custom AI model training',
      'Regulatory compliance consulting',
    ],
  },
];

const USE_CASES = [
  { org: 'Law Firms', example: 'Crypto theft litigation, asset recovery, evidence preparation for court', icon: Shield },
  { org: 'Banks & Fintechs', example: 'Transaction monitoring, customer fraud alerts, AML compliance workflows', icon: BarChart3 },
  { org: 'Insurance Companies', example: 'Fraud claim investigation, policy loss verification, subrogation support', icon: Lock },
  { org: 'Cybersecurity Firms', example: 'Bundle blockchain forensics into MSSP or SOC offerings', icon: Code2 },
  { org: 'Government Agencies', example: 'Law enforcement, FIUs, regulatory bodies requiring certified tools', icon: Building2 },
  { org: 'Recovery Consultancies', example: 'Build a full service offering around ScamTrace capabilities', icon: Users },
];

interface Props {
  onBack: () => void;
  onContact: () => void;
}

export function WhiteLabelPage({ onBack, onContact }: Props) {
  return (
    <div className="min-h-screen bg-[#03081a] text-slate-100 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-10 text-sm transition-colors">
          ← Back to ScamTrace
        </button>

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-medium mb-4">
            <Building2 size={14} /> White-Label Licensing
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-['Orbitron'] text-white mb-4">
            ScamTrace <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-[#ff00aa]">White-Label</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            License the full ScamTrace platform under your brand. Give your clients enterprise-grade blockchain forensics, OSINT tools, and evidence generation — built and maintained by us.
          </p>
        </div>

        {/* Value props */}
        <div className="grid md:grid-cols-3 gap-4 mb-14">
          {[
            { icon: Zap, title: 'Launch in Days', desc: 'Your branded platform live in 48–72 hours. No development required.' },
            { icon: Globe, title: 'Your Brand Everywhere', desc: 'Custom domain, logo, colors, and client-facing materials.' },
            { icon: Star, title: 'We Handle Everything', desc: 'API upkeep, data pipeline maintenance, updates — all included.' },
          ].map(f => (
            <div key={f.title} className="glass-card rounded-2xl border border-white/10 p-6 text-center">
              <f.icon size={24} className="text-purple-400 mx-auto mb-3" />
              <p className="text-white font-bold mb-2">{f.title}</p>
              <p className="text-slate-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Plans */}
        <h2 className="text-2xl font-bold text-white text-center mb-8">Licensing Plans</h2>
        <div className="grid md:grid-cols-3 gap-5 mb-14">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className="glass-card rounded-2xl p-6 border relative"
              style={{ borderColor: plan.popular ? 'rgba(191,0,255,0.35)' : 'rgba(255,255,255,0.08)', boxShadow: `0 0 20px ${plan.glowColor}40` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-[#bf00ff] to-[#ff00aa] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">Most Popular</span>
                </div>
              )}
              <p className="text-white font-bold text-lg mb-0.5">{plan.name}</p>
              <p className="text-slate-500 text-xs mb-4">{plan.desc}</p>
              <div className="mb-5">
                <span className={`text-4xl font-extrabold font-['Orbitron'] bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>{plan.price}</span>
                <span className="text-slate-400 text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 size={13} className="text-[#00ff88] shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onContact}
                className="w-full py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
                style={{ background: `linear-gradient(135deg, ${plan.gradient.replace('from-', '').replace('to-', '').replace('[', '').replace(']', '').split(' ').join(', ')})` }}
              >
                {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>

        {/* Use cases */}
        <h2 className="text-2xl font-bold text-white text-center mb-8">Who Uses ScamTrace White-Label</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
          {USE_CASES.map(u => (
            <div key={u.org} className="glass-card rounded-xl border border-white/10 p-5">
              <u.icon size={18} className="text-purple-400 mb-3" />
              <p className="text-white font-semibold text-sm mb-1">{u.org}</p>
              <p className="text-slate-500 text-xs leading-relaxed">{u.example}</p>
            </div>
          ))}
        </div>

        {/* What's included */}
        <div className="glass-card rounded-2xl border border-purple-500/20 p-8 mb-10">
          <h2 className="text-xl font-bold text-white text-center mb-6">What's Included in Every License</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              'Blockchain wallet tracing (16+ chains)',
              'Domain & IP OSINT intelligence',
              'Phone number fraud scoring',
              'Court-ready PDF evidence export',
              'Scam database (14,892+ entries)',
              'Real-time wallet monitoring',
              'AI pattern matching engine',
              'Email breach intelligence',
              'Embedded Stripe billing',
              'Supabase auth & user management',
              'Vercel/cloud deployment',
              'Ongoing model & database updates',
            ].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle2 size={13} className="text-purple-400 shrink-0" />{f}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Ready to Launch Your Platform?</h3>
          <p className="text-slate-400 mb-6">Schedule a 30-minute demo call and we'll show you exactly what's possible.</p>
          <button onClick={onContact} className="px-10 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-[#ff00aa] text-white font-extrabold text-lg flex items-center gap-3 mx-auto hover:opacity-90 transition-opacity">
            <Building2 size={20} /> Schedule White-Label Demo <ArrowRight size={18} />
          </button>
          <p className="text-slate-500 text-sm mt-3">No commitment · 30-min call · Custom quote within 24hrs</p>
        </div>
      </div>
    </div>
  );
}
