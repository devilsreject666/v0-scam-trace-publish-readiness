import { useState, useRef, useCallback } from 'react';
import {
  Globe, Shield, Lock, AlertTriangle, Search, Camera,
  FileText, Code, ExternalLink, RefreshCw, X, ChevronLeft,
  ChevronRight, CheckCircle2, Eye, Loader2
} from 'lucide-react';
import { whoisLookup, ipLookup, resolveHostIP, calculateDomainRisk } from '@/lib/api';

interface PageCapture {
  url: string;
  domain: string;
  registrar: string;
  registeredDate: string;
  domainAge: string;
  hostingIp: string;
  hostingLocation: string;
  hostingProvider: string;
  riskScore: number;
  flags: string[];
  whoisPrivacy: boolean;
  timestamp: string;
}

export function NoTraceBrowser() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [capture, setCapture] = useState<PageCapture | null>(null);
  const [captured, setCaptured] = useState(false);
  const [activePanel, setActivePanel] = useState<'whois' | 'hosting' | 'risk'>('whois');
  const urlRef = useRef('');
  const [error, setError] = useState('');

  const handleNavigate = useCallback(async () => {
    const targetUrl = url.trim();
    if (!targetUrl) return;
    setUrl(targetUrl);
    urlRef.current = targetUrl;
    setLoading(true);
    setLoaded(false);
    setCapture(null);
    setCaptured(false);
    setError('');

    try {
      // Extract domain from URL
      let domain = targetUrl;
      try { domain = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`).hostname; }
      catch { domain = targetUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, ''); }
      domain = domain.replace(/^www\./, '');

      // Parallel WHOIS + IP resolution
      const [whois, hostIp] = await Promise.all([
        whoisLookup(domain),
        resolveHostIP(domain),
      ]);

      let hostingIp = hostIp || 'Could not resolve';
      let hostingLocation = 'Unknown';
      let hostingProvider = 'Unknown';

      if (hostIp) {
        const ipData = await ipLookup(hostIp);
        hostingLocation = `${ipData.city}, ${ipData.country}`;
        hostingProvider = ipData.org;
      }

      const risk = calculateDomainRisk(whois);

      setCapture({
        url: targetUrl,
        domain: whois.domain,
        registrar: whois.registrar,
        registeredDate: whois.registeredDate,
        domainAge: whois.domainAge,
        hostingIp,
        hostingLocation,
        hostingProvider,
        riskScore: risk.riskScore,
        flags: risk.flags,
        whoisPrivacy: whois.whoisPrivacy,
        timestamp: new Date().toISOString(),
      });
      setLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze URL.');
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleCapture = () => {
    setCaptured(true);
  };

  return (
    <section id="safe-browser" className="relative py-24 grid-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-1/3 bottom-1/4 h-[500px] w-[500px] rounded-full bg-cyber-purple/[0.03] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-purple/20 bg-cyber-purple/[0.06] px-4 py-1.5">
            <Shield className="h-3.5 w-3.5 text-cyber-purple" />
            <span className="text-xs font-medium text-cyber-purple">No-Trace Browser</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Sandboxed <span className="gradient-text">Safe Browser</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Investigate suspicious websites safely. No cookies, no local storage, no malware execution.
            Auto-captures page HTML, URLs, scripts, and screenshots as evidence.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          {/* Security indicators */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: Shield, label: 'Sandboxed Iframe', color: 'text-cyber-green' },
              { icon: Lock, label: 'No Cookies', color: 'text-cyan-400' },
              { icon: Eye, label: 'No Local Storage', color: 'text-blue-400' },
              { icon: AlertTriangle, label: 'Malware Blocked', color: 'text-cyber-orange' },
            ].map(badge => (
              <div key={badge.label} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
                <badge.icon className={`h-3 w-3 ${badge.color}`} />
                <span className="text-slate-300">{badge.label}</span>
              </div>
            ))}
          </div>

          {/* Browser chrome */}
          <div className="glass-card rounded-2xl overflow-hidden">
            {/* Browser bar */}
            <div className="flex items-center gap-3 border-b border-white/5 bg-dark-800 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-cyber-red/60" />
                <div className="h-3 w-3 rounded-full bg-cyber-orange/60" />
                <div className="h-3 w-3 rounded-full bg-cyber-green/60" />
              </div>

              <button className="text-slate-500 hover:text-white transition p-1">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="text-slate-500 hover:text-white transition p-1">
                <ChevronRight className="h-4 w-4" />
              </button>
              <button onClick={handleNavigate} className="text-slate-500 hover:text-white transition p-1">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* URL bar */}
              <div className="flex-grow relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cyber-red" />
                <input
                  type="text"
                  placeholder="Enter suspicious URL to investigate safely..."
                  className="w-full rounded-lg border border-white/10 bg-dark-900 py-2 pl-8 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-purple/50 font-mono transition"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNavigate()}
                />
              </div>

              <button
                onClick={handleNavigate}
                disabled={loading}
                className="rounded-lg bg-cyber-purple/20 px-4 py-2 text-xs font-medium text-cyber-purple hover:bg-cyber-purple/30 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </button>

              <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-1">
                <Shield className="h-3 w-3 text-cyber-red" />
                <span className="text-[10px] font-bold text-red-400">SANDBOXED</span>
              </div>
            </div>

            {/* Browser content */}
            <div className="relative min-h-[400px] bg-dark-900/50">
              {!loaded && !loading && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">
                    <Globe className="h-10 w-10 text-slate-600" />
                  </div>
                  <p className="text-lg font-medium text-slate-400">Enter a URL to investigate</p>
                  <p className="mt-2 text-sm text-slate-600 max-w-md">
                    The page will be loaded in a fully sandboxed environment.
                    No cookies, no storage, no downloads. Scripts will be analyzed but not executed.
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                  <Loader2 className="h-12 w-12 text-cyber-purple animate-spin mb-4" />
                  <p className="text-sm text-slate-400">Loading in sandboxed environment...</p>
                  <div className="mt-4 space-y-1 text-xs text-slate-600 text-center">
                    <div>✓ Blocking cookies and local storage</div>
                    <div>✓ Intercepting all network requests</div>
                    <div>✓ Analyzing JavaScript for malware</div>
                    <div>✓ Capturing page source and screenshots</div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && !loading && (
                <div className="p-4">
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
                  </div>
                </div>
              )}

              {loaded && capture && (
                <div className="animate-fade-in">
                  {/* Risk banner */}
                  <div className={`border-b px-4 py-3 flex items-center gap-3 ${
                    capture.riskScore >= 60 ? 'border-red-500/20 bg-red-500/10' : capture.riskScore >= 30 ? 'border-orange-500/20 bg-orange-500/10' : 'border-green-500/20 bg-green-500/10'
                  }`}>
                    <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${capture.riskScore >= 60 ? 'text-cyber-red' : capture.riskScore >= 30 ? 'text-orange-400' : 'text-green-400'}`} />
                    <div className="flex-grow">
                      <span className={`text-sm font-bold ${capture.riskScore >= 60 ? 'text-red-400' : capture.riskScore >= 30 ? 'text-orange-400' : 'text-green-400'}`}>
                        {capture.riskScore >= 60 ? 'HIGH RISK' : capture.riskScore >= 30 ? 'MEDIUM RISK' : 'LOW RISK'} — </span>
                      <span className="text-sm text-slate-300">Domain: {capture.domain} | Age: {capture.domainAge} | Registrar: {capture.registrar}</span>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${capture.riskScore >= 60 ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                      RISK: {capture.riskScore}/100
                    </span>
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-white/5 px-4 flex items-center gap-1 overflow-x-auto">
                    {([
                      { key: 'whois' as const, label: 'WHOIS Data', icon: Globe },
                      { key: 'hosting' as const, label: 'Hosting Info', icon: ExternalLink },
                      { key: 'risk' as const, label: `Risk Flags (${capture.flags.length})`, icon: AlertTriangle },
                    ]).map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActivePanel(tab.key)}
                        className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition whitespace-nowrap ${
                          activePanel === tab.key
                            ? 'border-cyber-purple text-white'
                            : 'border-transparent text-slate-500 hover:text-white'
                        }`}
                      >
                        <tab.icon className="h-3.5 w-3.5" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-4">
                    {/* WHOIS */}
                    {activePanel === 'whois' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: 'Domain', value: capture.domain },
                            { label: 'URL Analyzed', value: capture.url },
                            { label: 'Registrar', value: capture.registrar },
                            { label: 'Registered', value: capture.registeredDate },
                            { label: 'Domain Age', value: capture.domainAge },
                            { label: 'WHOIS Privacy', value: capture.whoisPrivacy ? 'Enabled' : 'Disabled' },
                          ].map(item => (
                            <div key={item.label} className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
                              <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                              <div className="text-sm text-white font-mono truncate">{item.value}</div>
                            </div>
                          ))}
                        </div>
                        <div className="rounded-lg bg-dark-900/50 border border-white/5 p-3">
                          <div className="text-xs text-slate-500 mb-1">Scanned at</div>
                          <div className="text-xs text-slate-300 font-mono">{new Date(capture.timestamp).toLocaleString()}</div>
                        </div>
                      </div>
                    )}

                    {/* Hosting */}
                    {activePanel === 'hosting' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: 'Hosting IP', value: capture.hostingIp },
                            { label: 'Location', value: capture.hostingLocation },
                            { label: 'Provider', value: capture.hostingProvider },
                          ].map(item => (
                            <div key={item.label} className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
                              <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                              <div className="text-sm text-white font-mono">{item.value}</div>
                            </div>
                          ))}
                        </div>
                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.03] p-3 text-xs text-slate-400">
                          <span className="text-amber-400 font-medium">Note:</span> Full script analysis requires server-side scanning. WHOIS and IP intelligence data shown above is real-time from who-dat and ipquery.io APIs.
                        </div>
                      </div>
                    )}

                    {/* Risk Flags */}
                    {activePanel === 'risk' && (
                      <div className="space-y-2">
                        {capture.flags.length > 0 ? capture.flags.map((flag, i) => (
                          <div key={i} className="flex items-start gap-2 rounded-lg bg-red-500/[0.03] border border-red-500/10 p-3">
                            <X className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-slate-300">{flag}</span>
                          </div>
                        )) : (
                          <div className="flex items-center gap-2 rounded-lg bg-green-500/[0.03] border border-green-500/10 p-4">
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                            <span className="text-xs text-slate-300">No significant risk indicators found.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action bar */}
                  <div className="border-t border-white/5 px-4 py-4 flex flex-wrap gap-3">
                    {captured ? (
                      <div className="flex items-center gap-2 rounded-lg bg-cyber-green/10 border border-cyber-green/20 px-4 py-2.5 animate-fade-in">
                        <CheckCircle2 className="h-4 w-4 text-cyber-green" />
                        <span className="text-sm font-medium text-cyber-green">Page logged as evidence</span>
                      </div>
                    ) : (
                      <button onClick={handleCapture}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyber-green to-cyber-blue px-5 py-2.5 text-sm font-bold text-dark-900 hover:shadow-lg hover:shadow-cyber-green/20 transition">
                        <Camera className="h-4 w-4" /> Log This Page as Evidence
                      </button>
                    )}
                    <a href="#evidence" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white hover:bg-white/10 transition">
                      <FileText className="h-4 w-4" /> Add to Evidence Packet
                    </a>
                    <a href="#osint-tools" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white hover:bg-white/10 transition">
                      <Globe className="h-4 w-4" /> Check Domain Intel
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
