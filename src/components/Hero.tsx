import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Shield, Zap, Globe, Eye, Play, CheckCircle2 } from 'lucide-react';

function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 40;
          const increment = target / steps;
          let current = 0;
          const interval = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(interval);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-2xl font-bold text-white sm:text-3xl font-[Orbitron,sans-serif] [text-shadow:0_0_15px_rgba(0,245,255,0.5)]">
      {prefix}{count}{suffix}
    </div>
  );
}

const terminalLines = [
  { text: '$ scamtrace investigate --full 0x7a250d...dEad', color: 'text-[#00f5ff]', delay: 0 },
  { text: '[SCAN] Tracing address across 16 blockchains...', color: 'text-slate-400', prefix: 'text-[#00f5ff]', prefixText: '[INFO]', delay: 800 },
  { text: '[CHAT] Analyzing Telegram conversation... 3 wallets, 2 URLs extracted', color: 'text-slate-400', prefix: 'text-cyan-400', prefixText: '[CHAT]', delay: 1600 },
  { text: '[OSINT] Domain crypto-invest-returns.xyz — 12 days old, CRITICAL risk', color: 'text-slate-400', prefix: 'text-blue-400', prefixText: '[OSINT]', delay: 2400 },
  { text: '[ALERT] 3 mixer interactions: Tornado Cash + Wasabi CoinJoin detected', color: 'text-slate-400', prefix: 'text-[#ff8800]', prefixText: '[ALERT]', delay: 3200 },
  { text: '[CRITICAL] Exchange deposits: Binance (4.8 ETH) + Kraken (0.25 BTC)', color: 'text-slate-400', prefix: 'text-[#ff3366]', prefixText: '[CRITICAL]', delay: 4000 },
  { text: '✓ Evidence packet generated — chat logs, OSINT, wallet graph included', color: 'text-[#00ff88]', delay: 5000 },
  { text: '✓ Freeze requests ready for Binance + Kraken — 2 exchanges flagged', color: 'text-[#00ff88]', delay: 5600 },
];

export function Hero({ onGetStarted }: { onGetStarted?: () => void }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const animStarted = useRef(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animStarted.current) {
          animStarted.current = true;
          terminalLines.forEach((_, idx) => {
            setTimeout(() => setVisibleLines(idx + 1), terminalLines[idx].delay);
          });
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setShowCursor(c => !c), 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden pt-16 grid-bg-dense">
      {/* Animated ambient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] rounded-full bg-[rgba(0,245,255,0.07)] blur-[160px] animate-float" style={{ animationDuration: '8s' }} />
        <div className="absolute right-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-[rgba(191,0,255,0.06)] blur-[140px] animate-float" style={{ animationDuration: '11s', animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/2 h-[500px] w-[500px] rounded-full bg-[rgba(0,102,255,0.05)] blur-[140px] animate-float" style={{ animationDuration: '9s', animationDelay: '4s' }} />
        {/* Moving scan line across hero */}
        <div className="scan-line top-1/3" style={{ animationDuration: '4s' }} />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-16 sm:px-6 lg:px-8 lg:py-28">

        {/* Live badge */}
        <div className="mb-8 badge-neon-green animate-fade-in-up flex items-center gap-2">
          <div className="live-dot" />
          <span>Live Monitoring Active</span>
        </div>

        {/* Hero heading */}
        <h1 className="max-w-5xl text-center text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in-up text-balance heading-3d">
          <span className="block text-white">Trace Every Coin.</span>
          <span className="block gradient-text mt-2 text-5xl sm:text-6xl md:text-7xl lg:text-8xl">Expose Every Scam.</span>
        </h1>

        {/* Subtitle in glass pill */}
        <div className="mt-8 glass-card-static rounded-2xl px-6 py-4 max-w-2xl text-center animate-fade-in-up opacity-0 delay-200" style={{ animationFillMode: 'forwards' }}>
          <p className="text-base text-slate-300 sm:text-lg leading-relaxed">
            AI-powered transaction monitoring and forensic documentation. Trace fund movements across chains,
            identify mixer & bridge activity, and auto-generate evidence packets —{' '}
            <span className="text-[#00f5ff] font-medium">no blockchain expertise required.</span>
          </p>
        </div>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row animate-fade-in-up opacity-0 delay-300" style={{ animationFillMode: 'forwards' }}>
          <button onClick={onGetStarted}
            className="group flex items-center gap-2.5 btn-primary text-base font-bold cursor-pointer px-8 py-4 rounded-xl">
            <Play className="h-4 w-4" />
            Start Tracing Now
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
          </button>
          <a href="#features"
            className="btn-secondary text-base flex items-center gap-2 px-8 py-4 rounded-xl">
            See How It Works
          </a>
        </div>

        {/* Trust indicators */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 animate-fade-in-up opacity-0 delay-400" style={{ animationFillMode: 'forwards' }}>
          {['SOC 2 Compliant', 'GDPR Ready', 'End-to-End Encrypted', 'Offline Wallet Scan'].map(badge => (
            <div key={badge} className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#00ff88] [filter:drop-shadow(0_0_4px_rgba(0,255,136,0.6))]" />
              {badge}
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { value: 45, suffix: '+', label: 'Wallets Supported', icon: Shield, color: 'text-[#00f5ff]' },
            { value: 16, suffix: '+', label: 'Blockchains', icon: Globe, color: 'text-[#bf00ff]' },
            { value: 3, prefix: '<', suffix: 's', label: 'Triage Speed', icon: Zap, color: 'text-[#00ff88]' },
            { value: 24, suffix: '/7', label: 'Real-time Monitoring', icon: Eye, color: 'text-[#ff8800]' },
          ].map(stat => (
            <div key={stat.label} className="glass-card-premium rounded-2xl p-5 text-center group hover:scale-105 transition-transform duration-300">
              <stat.icon className={`mx-auto mb-2 h-5 w-5 ${stat.color} animate-glow-breath`} />
              <AnimatedCounter target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              <div className="mt-1 text-xs text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Animated terminal */}
        <div className="relative mt-16 w-full max-w-5xl animate-fade-in-up opacity-0 delay-500" style={{ animationFillMode: 'forwards' }}>
          {/* Outer glow wrapper */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[rgba(0,245,255,0.15)] via-[rgba(191,0,255,0.1)] to-[rgba(0,245,255,0.15)] blur-xl animate-neon-pulse pointer-events-none" />

          <div className="relative terminal-bg rounded-2xl p-1 animate-neon-pulse">
            {/* Scan line inside terminal */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              <div className="scan-line" style={{ animationDuration: '3s', top: '50%' }} />
            </div>
            <div className="rounded-xl bg-[rgba(2,5,16,0.95)] p-5 sm:p-6">
              {/* Terminal header */}
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#ff3366] shadow-[0_0_6px_rgba(255,51,102,0.8)]" />
                <div className="h-3 w-3 rounded-full bg-[#ff8800] shadow-[0_0_6px_rgba(255,136,0,0.8)]" />
                <div className="h-3 w-3 rounded-full bg-[#00ff88] shadow-[0_0_6px_rgba(0,255,136,0.8)]" />
                <span className="ml-3 text-xs text-slate-500 font-mono">scamtrace://live-investigation</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="live-dot h-1.5 w-1.5" />
                  <span className="text-[10px] text-[#00ff88] font-bold tracking-widest uppercase [text-shadow:0_0_8px_rgba(0,255,136,0.8)]">LIVE</span>
                </div>
              </div>
              {/* Terminal lines */}
              <div className="space-y-2 font-mono text-xs sm:text-sm min-h-[220px]">
                {terminalLines.slice(0, visibleLines).map((line, idx) => (
                  <div key={idx} className={`animate-slide-in-left ${line.color}`}>
                    {line.prefixText ? (
                      <>
                        <span className={`font-bold ${line.prefix}`}>{line.prefixText}</span>{' '}
                        {line.text.replace(`${line.prefixText} `, '')}
                      </>
                    ) : (
                      line.text
                    )}
                  </div>
                ))}
                {visibleLines < terminalLines.length && (
                  <div className="text-[#00f5ff] [text-shadow:0_0_8px_rgba(0,245,255,0.8)]">
                    <span className={showCursor ? 'opacity-100' : 'opacity-0'}>▊</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trusted by section */}
        <div className="mt-20 text-center w-full animate-fade-in-up opacity-0 delay-600" style={{ animationFillMode: 'forwards' }}>
          <p className="text-xs text-slate-500 uppercase tracking-[0.2em] mb-6">Built for investigators & fraud prevention teams</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {['Fraud Teams', 'Compliance Depts', 'Victim Advocates', 'Legal Counsel', 'Forensic Analysts'].map(org => (
              <div key={org} className="text-sm font-bold text-slate-500 tracking-wider uppercase hover:text-[#00f5ff] transition-colors duration-300 cursor-default">
                {org}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
