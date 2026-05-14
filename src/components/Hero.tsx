import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Shield, Zap, Globe, Eye, Play, CheckCircle2, Activity } from 'lucide-react';
import { fetchLiveBlockchainStats } from '@/lib/api/blockchain';

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
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  );
}

interface LiveStats {
  btcPrice: number;
  ethPrice: number;
  btcBlockHeight: number;
  ethBlockHeight: number;
  btcTxLast24h: number;
  ethTxLast24h: number;
}

export function Hero({ onGetStarted }: { onGetStarted?: () => void }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  const [isLive, setIsLive] = useState(false);
  const animStarted = useRef(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Fetch live blockchain stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await fetchLiveBlockchainStats();
        setLiveStats(stats);
        setIsLive(true);
      } catch {
        // Use fallback stats
        setLiveStats({
          btcPrice: 65000,
          ethPrice: 3500,
          btcBlockHeight: 850000,
          ethBlockHeight: 20000000,
          btcTxLast24h: 400000,
          ethTxLast24h: 1200000
        });
      }
    };
    loadStats();
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Generate dynamic terminal lines based on live data
  const terminalLines = [
    { text: '$ scamtrace connect --live --multi-chain', color: 'text-[#00ff96]', delay: 0 },
    { text: `[SYNC] Connected to Bitcoin network (block ${liveStats?.btcBlockHeight?.toLocaleString() || '850,000'})`, color: 'text-slate-400', prefix: 'text-[#00f0ff]', prefixText: '[SYNC]', delay: 600 },
    { text: `[SYNC] Connected to Ethereum network (block ${liveStats?.ethBlockHeight?.toLocaleString() || '20,000,000'})`, color: 'text-slate-400', prefix: 'text-[#00f0ff]', prefixText: '[SYNC]', delay: 1200 },
    { text: `[LIVE] BTC/USD: $${liveStats?.btcPrice?.toLocaleString() || '65,000'} | ETH/USD: $${liveStats?.ethPrice?.toLocaleString() || '3,500'}`, color: 'text-slate-400', prefix: 'text-[#00ff96]', prefixText: '[LIVE]', delay: 1800 },
    { text: `[SCAN] Monitoring ${((liveStats?.btcTxLast24h || 400000) + (liveStats?.ethTxLast24h || 1200000)).toLocaleString()} transactions (last 24h)`, color: 'text-slate-400', prefix: 'text-cyan-400', prefixText: '[SCAN]', delay: 2400 },
    { text: '[ALERT] Suspicious pattern detected: 0x7a25...dEad', color: 'text-slate-400', prefix: 'text-[#ff8800]', prefixText: '[ALERT]', delay: 3200 },
    { text: '[TRACE] Following fund flow across 3 chains: ETH → Polygon → Arbitrum', color: 'text-slate-400', prefix: 'text-[#a855f7]', prefixText: '[TRACE]', delay: 4000 },
    { text: '[CRITICAL] Mixer interaction detected: Tornado Cash (4.2 ETH flagged)', color: 'text-slate-400', prefix: 'text-[#ff3366]', prefixText: '[CRITICAL]', delay: 4800 },
    { text: '[SUCCESS] Evidence packet generated — ready for exchange submission', color: 'text-[#00ff96]', delay: 5600 },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animStarted.current && liveStats) {
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
  }, [liveStats]);

  useEffect(() => {
    const interval = setInterval(() => setShowCursor(c => !c), 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden pt-16">
      {/* Animated background */}
      <div className="animated-bg" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-50" />

      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] rounded-full bg-[rgba(0,255,150,0.04)] blur-[150px] animate-ambient" />
        <div className="absolute right-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-[rgba(0,240,255,0.03)] blur-[140px] animate-ambient delay-200" />
        <div className="absolute bottom-1/4 left-1/2 h-[500px] w-[500px] rounded-full bg-[rgba(168,85,247,0.03)] blur-[140px] animate-ambient delay-400" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-16 sm:px-6 lg:px-8 lg:py-28">
        {/* Live Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[rgba(0,255,150,0.3)] bg-[rgba(0,255,150,0.08)] px-5 py-2 animate-fade-in-up backdrop-blur-xl shadow-[0_0_20px_rgba(0,255,150,0.15)]">
          <div className={`h-2 w-2 rounded-full ${isLive ? 'bg-[#00ff96] animate-pulse shadow-[0_0_10px_rgba(0,255,150,0.8)]' : 'bg-slate-500'}`} />
          <span className="text-xs font-semibold text-[#00ff96] tracking-wide uppercase">
            {isLive ? 'Live Monitoring Active' : 'Connecting...'}
          </span>
          {isLive && <Activity className="h-3 w-3 text-[#00ff96] animate-pulse" />}
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
            <div key={badge} className="glass-badge text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#00ff96]" />
              {badge}
            </div>
          ))}
        </div>

        {/* Live Stats bar with real data */}
        <div className="mt-16 grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { value: 45, suffix: '+', label: 'Wallets Supported', icon: Shield },
            { value: 16, suffix: '+', label: 'Blockchains', icon: Globe },
            { value: 3, prefix: '<', suffix: 's', label: 'Triage Speed', icon: Zap },
            { value: 24, suffix: '/7', label: 'Real-time Monitoring', icon: Eye },
          ].map(stat => (
            <div key={stat.label} className="glass-card-premium rounded-xl p-5 text-center group">
              <stat.icon className="mx-auto mb-2 h-5 w-5 text-[#00ff96] opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110" />
              <AnimatedCounter target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              <div className="mt-1 text-xs text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Live price ticker */}
        {liveStats && (
          <div className="mt-6 flex items-center gap-4 animate-fade-in">
            <div className="glass-badge glass-badge-green">
              <span className="font-mono">BTC</span>
              <span className="font-bold">${liveStats.btcPrice.toLocaleString()}</span>
            </div>
            <div className="glass-badge glass-badge-cyan">
              <span className="font-mono">ETH</span>
              <span className="font-bold">${liveStats.ethPrice.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Animated terminal demo with LIVE data */}
        <div className="relative mt-12 w-full max-w-5xl animate-fade-in-up opacity-0 delay-500" style={{ animationFillMode: 'forwards' }}>
          <div className="rounded-2xl border border-[rgba(0,255,200,0.15)] bg-[rgba(13,13,20,0.9)] p-1 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_60px_rgba(0,255,150,0.08)] backdrop-blur-2xl animate-neon-pulse">
            <div className="rounded-xl bg-[rgba(10,10,15,0.95)] p-5 sm:p-6">
              {/* Terminal header */}
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#ff3366] shadow-[0_0_6px_rgba(255,51,102,0.6)]" />
                <div className="h-3 w-3 rounded-full bg-[#ff8800] shadow-[0_0_6px_rgba(255,136,0,0.6)]" />
                <div className="h-3 w-3 rounded-full bg-[#00ff96] shadow-[0_0_6px_rgba(0,255,150,0.6)]" />
                <span className="ml-3 text-xs text-slate-500 font-mono">scamtrace://live-investigation</span>
                <div className="ml-auto flex items-center gap-2">
                  {isLive && (
                    <span className="glass-badge-green text-[10px] px-2 py-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00ff96] animate-pulse inline-block mr-1" />
                      LIVE DATA
                    </span>
                  )}
                </div>
              </div>
              {/* Terminal lines with typing animation */}
              <div className="space-y-2 font-mono text-xs sm:text-sm min-h-[260px]">
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
                  <div className="text-[#00ff96]">
                    <span className={showCursor ? 'opacity-100' : 'opacity-0'}>▊</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Enhanced glow */}
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-r from-[rgba(0,255,150,0.08)] via-[rgba(0,240,255,0.08)] to-[rgba(168,85,247,0.08)] blur-3xl animate-ambient" />
        </div>

        {/* Trusted by section */}
        <div className="mt-20 text-center w-full animate-fade-in-up opacity-0 delay-600" style={{ animationFillMode: 'forwards' }}>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-6">Built for investigators & fraud prevention teams</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            {['Fraud Teams', 'Compliance Depts', 'Victim Advocates', 'Legal Counsel', 'Forensic Analysts'].map(org => (
              <div key={org} className="text-sm font-bold text-slate-400 tracking-wider uppercase">{org}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
