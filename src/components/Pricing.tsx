import { Check, Zap, Shield, Crown, Star, Lock, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { Disclaimer } from './Disclaimer';
import { StripeCheckout } from './StripeCheckout';

const plans = [
  {
    name: 'Free',
    productId: 'free',
    icon: Shield,
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Basic monitoring for personal use',
    gradient: 'from-slate-400 to-slate-500',
    glowColor: 'rgba(148,163,184,0.25)',
    borderColor: 'rgba(148,163,184,0.2)',
    features: [
      '3 address scans per day',
      'Basic risk scoring',
      'Single blockchain support',
      'Community support',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Starter',
    productId: 'starter',
    icon: Zap,
    monthlyPrice: 9,
    yearlyPrice: 7,
    description: 'Evidence templates & basic tools',
    gradient: 'from-[#00ff88] to-[#00d4aa]',
    glowColor: 'rgba(0,255,136,0.25)',
    borderColor: 'rgba(0,255,136,0.2)',
    features: [
      '25 address scans per day',
      'AI-powered risk analysis',
      '5 blockchains supported',
      'Evidence templates',
      '1 domain check per day',
      '1 phone lookup per day',
      'Email support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    productId: 'pro',
    icon: Star,
    monthlyPrice: 19,
    yearlyPrice: 15,
    description: 'Scam reports & monitoring dashboard',
    gradient: 'from-[#00f5ff] to-[#0066ff]',
    glowColor: 'rgba(0,245,255,0.35)',
    borderColor: 'rgba(0,245,255,0.35)',
    features: [
      'Unlimited address scans',
      '16+ blockchains (incl. BTC)',
      'Fund flow visualization',
      'Scam report submission',
      'Monitoring dashboard',
      'Unlimited domain checks',
      'Unlimited phone lookups',
      'Chat evidence portal (5/mo)',
      'Evidence exports',
      'Priority support',
    ],
    cta: 'Subscribe Now',
    popular: true,
  },
  {
    name: 'Investigator',
    productId: 'investigator',
    icon: Crown,
    monthlyPrice: 49,
    yearlyPrice: 39,
    description: 'Full suite & live monitoring',
    gradient: 'from-[#bf00ff] to-[#ff00aa]',
    glowColor: 'rgba(191,0,255,0.25)',
    borderColor: 'rgba(191,0,255,0.2)',
    features: [
      'Everything in Pro',
      'Unlimited chat evidence uploads',
      'Telegram & WhatsApp integration',
      'Auto evidence packet generation',
      'Exchange freeze templates',
      'Smart Contract Escrow',
      'ScamTrace Wallet',
      'Real-time post-send monitoring',
      'IP intelligence & OSINT',
      'BTC UTXO deep analysis',
      'API access',
      'Dedicated support',
    ],
    cta: 'Start Investigation',
    popular: false,
  },
];

interface PricingProps {
  onSelectPlan?: () => void;
}

export function Pricing({ onSelectPlan }: PricingProps) {
  const [yearly, setYearly] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ productId: string; name: string } | null>(null);

  const handleSelectPlan = (plan: typeof plans[0]) => {
    if (plan.productId === 'free') {
      onSelectPlan?.();
      return;
    }
    setSelectedPlan({ productId: plan.productId, name: plan.name });
    setCheckoutOpen(true);
  };

  return (
    <section id="pricing" className="relative py-24 grid-bg">
      {/* Ambient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/3 top-0 h-[700px] w-[700px] rounded-full bg-[rgba(191,0,255,0.04)] blur-[180px]" />
        <div className="absolute right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[rgba(0,245,255,0.03)] blur-[150px]" />
      </div>

      <div className="section-divider mb-0" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <div className="mb-16 text-center">
          <div className="mb-4 badge-neon-purple inline-flex items-center gap-2">
            <span>Subscription Plans</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl heading-3d">
            Choose Your <span className="gradient-text">Plan</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            From individual monitoring to professional investigation tools. Start free, upgrade anytime.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[rgba(0,245,255,0.15)] bg-[rgba(2,5,16,0.8)] p-1.5 backdrop-blur-xl">
            <button
              className={`rounded-full px-6 py-2 text-sm font-semibold transition-all duration-300 ${
                !yearly
                  ? 'bg-[rgba(0,245,255,0.1)] text-[#00f5ff] border border-[rgba(0,245,255,0.25)] shadow-[0_0_15px_rgba(0,245,255,0.15)]'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              onClick={() => setYearly(false)}
            >
              Monthly
            </button>
            <button
              className={`rounded-full px-6 py-2 text-sm font-semibold transition-all duration-300 ${
                yearly
                  ? 'btn-primary shadow-[0_0_20px_rgba(0,245,255,0.3)]'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              onClick={() => setYearly(true)}
            >
              Yearly <span className="ml-1.5 rounded-full bg-[rgba(0,0,0,0.3)] px-2 py-0.5 text-[10px] font-bold tracking-wider">−20%</span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map(plan => (
            <div key={plan.name}
              className={`relative flex flex-col rounded-2xl p-6 transition-all duration-500 glass-card-3d ${
                plan.popular
                  ? 'pricing-card-featured'
                  : 'glass-card-premium'
              }`}
              style={{
                boxShadow: plan.popular
                  ? `0 0 40px ${plan.glowColor}, 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(0,245,255,0.15)`
                  : `0 0 20px ${plan.glowColor}30, 0 10px 30px rgba(0,0,0,0.4)`,
              }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="rounded-full bg-gradient-to-r from-[#00f5ff] to-[#0066ff] px-5 py-1.5 text-xs font-bold text-[#020510] shadow-[0_0_20px_rgba(0,245,255,0.5)] tracking-wider uppercase whitespace-nowrap">
                    ★ Most Popular
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${plan.gradient} shadow-lg`}
                style={{ boxShadow: `0 0 20px ${plan.glowColor}, 0 4px 15px rgba(0,0,0,0.4)` }}>
                <plan.icon className="h-6 w-6 text-[#020510]" strokeWidth={2.5} />
              </div>

              <h3 className="text-xl font-bold text-white font-[Orbitron,sans-serif] tracking-wider">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-400">{plan.description}</p>

              {/* Price */}
              <div className="my-6">
                {plan.monthlyPrice === 0 ? (
                  <div className="text-4xl font-extrabold text-white font-[Orbitron,sans-serif] [text-shadow:0_0_20px_rgba(148,163,184,0.3)]">
                    $0<span className="text-base font-normal text-slate-400">/mo</span>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl font-extrabold font-[Orbitron,sans-serif]"
                      style={{ color: plan.popular ? '#00f5ff' : '#fff', textShadow: `0 0 20px ${plan.glowColor}` }}>
                      ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                      <span className="text-base font-normal text-slate-400">/mo</span>
                    </div>
                    {yearly && (
                      <div className="mt-1.5 text-xs font-semibold" style={{ color: plan.popular ? '#00ff88' : 'rgba(0,255,136,0.7)' }}>
                        Save ${(plan.monthlyPrice - plan.yearlyPrice) * 12}/year
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Features */}
              <ul className="mb-8 flex-grow space-y-3">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#00ff88]"
                      style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,136,0.6))' }} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full rounded-xl py-3.5 text-sm font-bold transition-all duration-300 tracking-wide ${
                  plan.popular
                    ? 'btn-primary shadow-[0_0_25px_rgba(0,245,255,0.35)]'
                    : 'border border-[rgba(0,245,255,0.15)] bg-[rgba(0,245,255,0.05)] text-[#00f5ff] hover:bg-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.3)] hover:shadow-[0_0_15px_rgba(0,245,255,0.15)]'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Pay-per-report card */}
        <div className="mt-10 glass-card-static rounded-2xl border border-[rgba(191,0,255,0.2)] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#bf00ff] to-[#ff00aa] flex items-center justify-center"
            style={{ boxShadow: '0 0 25px rgba(191,0,255,0.4)' }}>
            <Star className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white font-[Orbitron,sans-serif]">Pay-Per-Report</h3>
              <span className="text-xs bg-[rgba(191,0,255,0.15)] text-[#bf00ff] border border-[rgba(191,0,255,0.3)] px-2 py-0.5 rounded-full font-semibold">No Subscription</span>
            </div>
            <p className="text-slate-400 text-sm">
              Need one court-ready evidence PDF? Pay once, no subscription required. Includes complete blockchain trace, OSINT findings, exchange contact letters, and law enforcement submission format.
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              {['Blockchain trace included', 'Exchange freeze letter', 'IC3/FBI compatible', 'Tamper-evident PDF'].map(f => (
                <span key={f} className="text-xs text-slate-400 flex items-center gap-1">
                  <Check className="h-3 w-3 text-[#00ff88]" />{f}
                </span>
              ))}
            </div>
          </div>
          <div className="text-center md:text-right flex-shrink-0">
            <div className="text-3xl font-extrabold text-white font-[Orbitron,sans-serif] mb-1" style={{ textShadow: '0 0 20px rgba(191,0,255,0.4)' }}>
              $49
            </div>
            <p className="text-slate-500 text-xs mb-3">one-time per case</p>
            <button
              onClick={() => { setSelectedPlan({ productId: 'report', name: 'Evidence Report' }); setCheckoutOpen(true); }}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #bf00ff, #ff00aa)', boxShadow: '0 0 20px rgba(191,0,255,0.35)' }}
            >
              Generate Report — $49
            </button>
          </div>
        </div>

        {/* Trust footer */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="glass-card-static rounded-2xl px-8 py-5 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400">
            {[
              { icon: Lock, label: 'Secured by Stripe' },
              { icon: Smartphone, label: 'iOS & Android ready' },
              { icon: Shield, label: 'Cancel anytime' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-slate-400 hover:text-[#00f5ff] transition-colors duration-200">
                <Icon className="h-4 w-4 text-[#00f5ff]" style={{ filter: 'drop-shadow(0 0 4px rgba(0,245,255,0.5))' }} />
                {label}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-600 max-w-lg">
            Subscriptions managed through Stripe. Cancel anytime.
          </p>
        </div>

        <Disclaimer className="mt-12" />
      </div>

      {selectedPlan && (
        <StripeCheckout
          isOpen={checkoutOpen}
          onClose={() => {
            setCheckoutOpen(false);
            setSelectedPlan(null);
          }}
          productId={selectedPlan.productId}
          productName={selectedPlan.name}
          yearly={yearly}
        />
      )}

      <div className="section-divider mt-24" />
    </section>
  );
}
