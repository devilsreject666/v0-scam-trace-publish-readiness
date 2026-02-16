import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, Shield } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Fraud Investigation Lead',
    company: 'Major US Bank',
    avatar: 'SM',
    color: 'from-cyber-green to-emerald-500',
    stars: 5,
    text: 'ScamTrace helped us recover over $2.3M in stolen crypto within 72 hours. The automated evidence packets were accepted by three different exchanges for immediate freeze requests. This tool is indispensable.',
    metric: '$2.3M recovered',
  },
  {
    name: 'James Rodriguez',
    role: 'Cybercrime Detective',
    company: 'Law Enforcement Agency',
    avatar: 'JR',
    color: 'from-cyber-blue to-blue-500',
    stars: 5,
    text: "Before ScamTrace, tracing funds across chains took us weeks. Now I can trace a scammer's entire laundering path — through mixers, bridges, and into exchanges — in under an hour. The BTC UTXO tracing is phenomenal.",
    metric: '95% faster investigations',
  },
  {
    name: 'Elena Volkova',
    role: 'Compliance Director',
    company: 'Top 10 Crypto Exchange',
    avatar: 'EV',
    color: 'from-cyber-purple to-violet-500',
    stars: 5,
    text: 'The freeze-ready evidence packets from ScamTrace meet our compliance standards out of the box. We process freeze requests 3x faster when they come with ScamTrace documentation. Highly recommended.',
    metric: '3x faster freeze processing',
  },
  {
    name: 'David Chen',
    role: 'Scam Victim & Advocate',
    company: 'Crypto Fraud Awareness',
    avatar: 'DC',
    color: 'from-cyber-orange to-amber-500',
    stars: 5,
    text: "I lost $45,000 to a pig butchering scam. ScamTrace helped me trace my funds through Tornado Cash, across two bridges, and into a Binance deposit. The evidence packet got my funds frozen within 24 hours. I'm getting my money back.",
    metric: '$45K frozen in 24hrs',
  },
  {
    name: 'Maria Santos',
    role: 'Digital Forensics Analyst',
    company: 'International Agency',
    avatar: 'MS',
    color: 'from-pink-500 to-rose-500',
    stars: 5,
    text: 'The Wasabi CoinJoin detection is best-in-class. ScamTrace traced a suspect through three rounds of CoinJoin mixing and identified the exchange deposit. No other tool in our arsenal could do that.',
    metric: 'CoinJoin defeated',
  },
];

export function Testimonials() {
  const [active, setActive] = useState(0);

  const next = () => setActive(a => (a + 1) % testimonials.length);
  const prev = () => setActive(a => (a - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="relative py-24 grid-bg overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-1/3 h-[500px] w-[500px] rounded-full bg-cyber-purple/[0.04] blur-[150px]" />
        <div className="absolute left-0 bottom-1/4 h-[400px] w-[400px] rounded-full bg-cyber-green/[0.03] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-green/20 bg-cyber-green/[0.06] px-4 py-1.5">
            <Shield className="h-3.5 w-3.5 text-cyber-green" />
            <span className="text-xs font-medium text-cyber-green">Trusted Worldwide</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Real Results From <span className="gradient-text">Real Investigators</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            See how fraud investigators, law enforcement, and scam victims use ScamTrace to recover stolen funds and build airtight cases.
          </p>
        </div>

        {/* Stats banner */}
        <div className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { value: '$127M+', label: 'Funds Traced' },
            { value: '14,500+', label: 'Cases Resolved' },
            { value: '98.7%', label: 'Accuracy Rate' },
            { value: '142', label: 'Countries Active' },
          ].map(s => (
            <div key={s.label} className="glass-card-premium rounded-xl p-5 text-center">
              <div className="text-2xl font-extrabold text-white">{s.value}</div>
              <div className="mt-1 text-xs text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonial carousel */}
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className={`transition-all duration-500 ${
                  idx === active ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
                }`}
              >
                <div className="glass-card-premium rounded-2xl p-8 sm:p-10">
                  <Quote className="h-10 w-10 text-cyber-green/20 mb-6" />
                  
                  <p className="text-lg sm:text-xl leading-relaxed text-slate-200 font-medium">
                    &ldquo;{t.text}&rdquo;
                  </p>

                  <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-sm font-bold text-dark-900`}>
                        {t.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{t.name}</div>
                        <div className="text-sm text-slate-400">{t.role}</div>
                        <div className="text-xs text-slate-500">{t.company}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: t.stars }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <div className="rounded-full bg-cyber-green/10 px-3 py-1 text-xs font-bold text-cyber-green">
                        {t.metric}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button onClick={prev} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActive(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === active ? 'w-8 bg-cyber-green' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
            <button onClick={next} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
