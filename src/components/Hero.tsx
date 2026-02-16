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
    <div ref={ref} className="text-2xl font-bold text-white sm:text-3xl">
      {prefix}{count}{suffix}
    </div>
  );
}

const terminalLines = [
  { text: '$ scamtrace investigate --full 0x7a250d...dEad', color: 'text-cyber-green', delay: 0 },
  { text: '[SCAN] Tracing address across 16 blockchains...', color: 'text-slate-400', prefix: 'text-cyber-blue', prefixText: '[INFO]', delay: 800 },
  { text: '[CHAT] Analyzing Telegram conversation... 3 wallets, 2 URLs extracted', color: 'text-slate-400', prefix: 'text-cyan-400', prefixText: '[CHAT]', delay: 1600 },
  { text: '[OSINT] Domain crypto-invest-returns.xyz — 12 days old, CRITICAL risk', color: 'text-slate-400', prefix: 'text-blue-400', prefixText: '[OSINT]', delay: 2400 },
  { text: '[ALERT] 3 mixer interactions: Tornado Cash + Wasabi CoinJoin detected', color: 'text-slate-400', prefix: 'text-cyber-orange', prefixText: '[ALERT]', delay: 3200 },
  { text: '[CRITICAL] Exchange deposits: Binance (4.8 ETH) + Kraken (0.25 BTC)', color: 'text-slate-400', prefix: 'text-cyber-red', prefixText: '[CRITICAL]', delay: 4000 },
  { text: '✓ Evidence packet generated — chat logs, OSINT, wallet graph included', color: 'text-cyber-green', delay: 5000 },
  { text: '✓ Freeze requests ready for Binance + Kraken — 2 exchanges flagged', color: 'text-cyber-green', delay: 5600 },
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
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden pt-16 grid-bg">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-cyber-green/[0.06] blur-[140px]" />
        <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-cyber-blue/[0.05] blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/2 h-[400px] w-[400px] rounded-full bg-cyber-purple/[0.04] blur-[120px]" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-16 sm:px-6 lg:px-8 lg:py-28">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyber-green/20 bg-cyber-green/[0.06] px-5 py-2 animate-fade-in-up">
          <div className="h-2 w-2 rounded-full bg-cyber-green animate-pulse" />
          <span className="text-xs font-semibold text-cyber-green tracking-wide uppercase">Live Monitoring Active</span>
        </div>

        <h1 className="max-w-5xl text-center text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in-up text-balance">
          <span className="block">Trace Every Coin.</span>
          <span className="block gradient-text mt-2">Expose Every Scam.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-center text-lg text-slate-400 sm:text-xl animate-fade-in-up opacity-0 delay-200" style={{ animationFillMode: 'forwards' }}>
          AI-powered transaction monitoring and forensic documentation. Trace fund movements across chains,
          identify mixer & bridge activity, and auto-generate evidence packets — no blockchain expertise required.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row animate-fade-in-up opacity-0 delay-300" style={{ animationFillMode: 'forwards' }}>
          <button onClick={onGetStarted}
            className="group flex items-center gap-2 btn-primary text-base cursor-pointer">
            <Play className="h-4 w-4" />
            Start Tracing Now
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
          <a href="#features" className="btn-secondary text-base flex items-center gap-2">
            See How It Works
          </a>
        </div>

        {/* Trust indicators */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 animate-fade-in-up opacity-0 delay-400" style={{ animationFillMode: 'forwards' }}>
          {[
            'SOC 2 Compliant',
            'GDPR Ready',
            'End-to-End Encrypted',
            'Offline Wallet Scan',
          ].map(badge => (
            <div key={badge} className="flex items-center gap-1.5 text-xs text-slate-500">
              <CheckCircle2 className="h-3.5 w-3.5 text-cyber-green/60" />
              {badge}
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { value: 45, suffix: '+', label: 'Wallets Supported', icon: Shield },
            { value: 16, suffix: '+', label: 'Blockchains', icon: Globe },
            { value: 3, prefix: '<', suffix: 's', label: 'Triage Speed', icon: Zap },
            { value: 24, suffix: '/7', label: 'Real-time Monitoring', icon: Eye },
          ].map(stat => (
            <div key={stat.label} className="glass-card-premium rounded-xl p-5 text-center">
              <stat.icon className="mx-auto mb-2 h-5 w-5 text-cyber-green/80" />
              <AnimatedCounter target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              <div className="mt-1 text-xs text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Animated terminal demo */}
        <div className="relative mt-16 w-full max-w-5xl animate-fade-in-up opacity-0 delay-500" style={{ animationFillMode: 'forwards' }}>
          <div className="animate-pulse-glow rounded-2xl border border-white/10 bg-dark-800/80 p-1 shadow-2xl backdrop-blur">
            <div className="rounded-xl bg-dark-900 p-5 sm:p-6">
              {/* Terminal header */}
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-cyber-red/60" />
                <div className="h-3 w-3 rounded-full bg-cyber-orange/60" />
                <div className="h-3 w-3 rounded-full bg-cyber-green/60" />
                <span className="ml-3 text-xs text-slate-500 font-mono">scamtrace://live-investigation</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyber-green animate-pulse" />
                  <span className="text-[10px] text-cyber-green font-medium">LIVE</span>
                </div>
              </div>
              {/* Terminal lines with typing animation */}
              <div className="space-y-2 font-mono text-xs sm:text-sm min-h-[220px]">
                {terminalLines.slice(0, visibleLines).map((line, idx) => (
                  <div key={idx} className={`animate-slide-in-left ${line.color}`}>
                    {line.prefixText ? (
                      <>
                        <span className={line.prefix}>{line.prefixText}</span>{' '}
                        {line.text.replace(`${line.prefixText} `, '')}
                      </>
                    ) : (
                      line.text
                    )}
                  </div>
                ))}
                {visibleLines < terminalLines.length && (
                  <div className="text-cyber-green">
                    <span className={showCursor ? 'opacity-100' : 'opacity-0'}>▊</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Glow */}
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-cyber-green/10 via-cyber-blue/10 to-cyber-purple/10 blur-3xl" />
        </div>

        {/* Trusted by section */}
        <div className="mt-20 text-center w-full animate-fade-in-up opacity-0 delay-600" style={{ animationFillMode: 'forwards' }}>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-6">Built for investigators & fraud prevention teams</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            {['Fraud Teams', 'Compliance Depts', 'Victim Advocates', 'Legal Counsel', 'Forensic Analysts'].map(org => (
              <div key={org} className="text-sm font-bold text-slate-400 tracking-wider uppercase">{org}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
