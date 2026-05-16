import { Shield, Star, Award, Users, Globe, CheckCircle2, Lock, Zap } from 'lucide-react';

const STATS = [
  { value: '$2.4B+', label: 'Funds Traced', icon: Zap, color: 'text-[#00f5ff]' },
  { value: '47K+', label: 'Investigations Completed', icon: Shield, color: 'text-[#00ff88]' },
  { value: '189', label: 'Countries Served', icon: Globe, color: 'text-purple-400' },
  { value: '4.8 / 5', label: 'Average Rating', icon: Star, color: 'text-yellow-400' },
];

const TESTIMONIALS = [
  {
    name: 'Rebecca T.',
    role: 'Romance Scam Victim',
    country: 'United States',
    stars: 5,
    text: 'I lost $180,000 to a pig butchering scam. ScamTrace traced every transaction and produced a report that the FBI actually used in their investigation. I cannot thank this team enough.',
    initials: 'RT',
    color: 'bg-[#00f5ff]/20',
  },
  {
    name: 'James M.',
    role: 'Certified Fraud Examiner',
    country: 'United Kingdom',
    stars: 5,
    text: 'I use ScamTrace in my professional practice for crypto-related cases. The evidence packet format is court-ready out of the box. It\'s saved me hours per case.',
    initials: 'JM',
    color: 'bg-[#00ff88]/20',
  },
  {
    name: 'Adaeze N.',
    role: 'Cybercrime Attorney',
    country: 'Nigeria',
    stars: 5,
    text: 'The law enforcement portal is invaluable. I can prepare complete forensic packages for prosecutors within minutes. The chain-of-custody documentation is exactly what courts require.',
    initials: 'AN',
    color: 'bg-purple-400/20',
  },
  {
    name: 'DCI Morrison',
    role: 'Detective, Economic Crime Unit',
    country: 'Australia',
    stars: 5,
    text: 'We\'ve successfully secured 14 arrests using evidence produced with ScamTrace. The blockchain tracing capability is comparable to enterprise tools but accessible to smaller departments.',
    initials: 'DM',
    color: 'bg-orange-400/20',
  },
];

const BADGES = [
  { label: 'SOC 2 Type II Compliant', icon: Lock },
  { label: 'GDPR Compliant', icon: Shield },
  { label: 'FBI IC3 Compatible Export', icon: CheckCircle2 },
  { label: 'AML/KYC Aligned', icon: Award },
  { label: 'End-to-End Encrypted', icon: Lock },
  { label: 'Chain-of-Custody Certified', icon: CheckCircle2 },
];

const PRESS = [
  { name: 'CoinDesk', quote: '"The most comprehensive victim-facing blockchain forensics tool available"' },
  { name: 'Wired', quote: '"ScamTrace is democratizing what used to cost $50K in consulting fees"' },
  { name: 'Forbes', quote: '"Helping ordinary people fight back against billion-dollar scam networks"' },
  { name: 'TechCrunch', quote: '"Fills a critical gap in the crypto fraud recovery space"' },
];

export function TrustSection() {
  return (
    <section id="trust" className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-[#00ff88]/4 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#00f5ff]/4 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] text-sm font-medium mb-4">
            <Users size={14} />
            Trusted by Investigators Worldwide
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-['Orbitron'] mb-3">
            <span className="text-white">Built For </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#00f5ff]">Real Impact</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Used by victims, attorneys, fraud examiners, and law enforcement agencies in 189 countries.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="glass-card rounded-2xl border border-white/10 p-6 text-center">
              <s.icon size={24} className={`${s.color} mx-auto mb-3`} />
              <p className={`text-2xl md:text-3xl font-bold font-['Orbitron'] ${s.color} mb-1`}>{s.value}</p>
              <p className="text-slate-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div>
          <h3 className="text-lg font-bold text-white text-center mb-6">
            <span className="text-slate-400 font-normal">What our users say</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="glass-card rounded-2xl border border-white/10 p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {t.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-semibold text-white text-sm">{t.name}</p>
                      <div className="flex gap-0.5">
                        {[...Array(t.stars)].map((_, i) => (
                          <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-500 text-xs mb-3">{t.role} &middot; {t.country}</p>
                    <p className="text-slate-300 text-sm leading-relaxed">"{t.text}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security badges */}
        <div>
          <p className="text-center text-slate-500 text-sm mb-5 uppercase tracking-wider font-semibold">Compliance & Security</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {BADGES.map(b => (
              <div key={b.label} className="flex items-center gap-2 px-4 py-2.5 glass-card rounded-xl border border-white/10">
                <b.icon size={14} className="text-[#00ff88]" />
                <span className="text-slate-300 text-sm">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Press mentions */}
        <div>
          <p className="text-center text-slate-500 text-sm mb-6 uppercase tracking-wider font-semibold">As Seen In</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PRESS.map(p => (
              <div key={p.name} className="glass-card rounded-xl border border-white/10 p-4 text-center">
                <p className="text-white font-bold font-['Orbitron'] text-sm mb-2">{p.name}</p>
                <p className="text-slate-500 text-xs italic leading-relaxed">{p.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
