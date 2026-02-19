import { useState, useRef } from 'react';
import {
  Globe, Shield, Lock, AlertTriangle, Search, Camera,
  FileText, Code, ExternalLink, RefreshCw, X, ChevronLeft,
  ChevronRight, CheckCircle2, Eye, Loader2
} from 'lucide-react';
import { analyzePage, type BrowserAnalysis } from '@/lib/api';

interface PageCapture {
  url: string;
  title: string;
  scripts: string[];
  links: string[];
  malwareDetected: boolean;
  riskScore: number;
  flags: string[];
  timestamp: string;
}

export function NoTraceBrowser() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [capture, setCapture] = useState<PageCapture | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [activePanel, setActivePanel] = useState<'preview' | 'scripts' | 'links'>('preview');
  const [error, setError] = useState('');
  const urlRef = useRef('');

  const handleNavigate = async () => {
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
      const result: BrowserAnalysis = await analyzePage(targetUrl);
      setCapture({
        url: result.url,
        title: result.title,
        scripts: result.scripts,
        links: result.links,
        malwareDetected: result.malwareDetected,
        riskScore: result.riskScore,
        flags: result.flags,
        timestamp: result.timestamp,
      });
      setLoaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to analyze URL');
    }
    setLoading(false);
  };

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
              {error && (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertTriangle className="h-10 w-10 text-red-400 mb-3" />
                  <p className="text-sm text-red-400 font-medium mb-1">Analysis Failed</p>
                  <p className="text-xs text-slate-500 max-w-md text-center">{error}</p>
                  <button onClick={handleNavigate} className="mt-4 text-xs text-cyber-purple hover:underline">Try again</button>
                </div>
              )}

              {!loaded && !loading && !error && (
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

              {loaded && capture && (
                <div className="animate-fade-in">
                  {/* Malware warning banner */}
                  {capture.malwareDetected && (
                    <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-3 flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-cyber-red flex-shrink-0" />
                      <div className="flex-grow">
                        <span className="text-sm font-bold text-red-400">⚠️ MALWARE DETECTED — </span>
                        <span className="text-sm text-slate-300">Wallet drainer, keylogger, and C2 communication found in page scripts</span>
                      </div>
                      <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-400">RISK: {capture.riskScore}/100</span>
                    </div>
                  )}

                  {/* Tabs */}
                  <div className="border-b border-white/5 px-4 flex items-center gap-1 overflow-x-auto">
                    {([
                      { key: 'preview' as const, label: 'Page Preview', icon: Eye },
                      { key: 'scripts' as const, label: `Scripts (${capture.scripts.length})`, icon: Code },
                      { key: 'links' as const, label: `Links (${capture.links.length})`, icon: ExternalLink },
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
                    {/* Preview */}
                    {activePanel === 'preview' && (
                      <div className="space-y-4">
                        {/* Simulated page render */}
                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 relative overflow-hidden">
                          <div className="absolute top-2 right-2 rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[9px] font-bold text-red-400">
                            SANDBOXED RENDER
                          </div>
                          <div className="max-w-md mx-auto text-center space-y-4">
                            <div className="text-2xl font-bold text-white">🚀 CryptoInvest Pro</div>
                            <div className="text-sm text-amber-400 font-bold">GUARANTEED 300% RETURNS IN 14 DAYS</div>
                            <div className="rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4">
                              <div className="text-xs text-slate-400">⏰ LIMITED TIME — Only 3 spots remaining!</div>
                              <div className="text-2xl font-mono font-bold text-red-400 mt-2">23:59:47</div>
                              <div className="text-[10px] text-slate-500 mt-1">(Fake countdown — resets on reload)</div>
                            </div>
                            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
                              ⚠️ This page contains a wallet drainer that attempts to steal your crypto when you connect
                            </div>
                          </div>
                        </div>

                        {/* Page metadata */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
                            <div className="text-xs text-slate-500 mb-1">Page Title</div>
                            <div className="text-sm text-white font-mono">{capture.title}</div>
                          </div>
                          <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
                            <div className="text-xs text-slate-500 mb-1">URL</div>
                            <div className="text-sm text-cyber-red font-mono truncate">{capture.url}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Scripts */}
                    {activePanel === 'scripts' && (
                      <div className="space-y-2">
                        <div className="text-xs text-slate-400 mb-3">Detected JavaScript — scripts analyzed but NOT executed:</div>
                        {capture.scripts.map((script, i) => {
                          const isMalicious = script.includes('SUSPICIOUS') || script.includes('MALICIOUS') || script.includes('CRITICAL');
                          return (
                            <div key={i} className={`flex items-start gap-3 rounded-lg border p-3 ${
                              isMalicious ? 'border-red-500/20 bg-red-500/[0.03]' : 'border-white/5 bg-white/[0.02]'
                            }`}>
                              <Code className={`h-4 w-4 flex-shrink-0 mt-0.5 ${isMalicious ? 'text-cyber-red' : 'text-slate-500'}`} />
                              <div>
                                <code className="text-xs text-slate-300 font-mono">{script}</code>
                              </div>
                              {isMalicious && (
                                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[9px] font-bold text-red-400 flex-shrink-0">THREAT</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Links */}
                    {activePanel === 'links' && (
                      <div className="space-y-2">
                        <div className="text-xs text-slate-400 mb-3">Outbound links found on page:</div>
                        {capture.links.map((link, i) => {
                          const isPhishing = link.includes('PHISHING');
                          return (
                            <div key={i} className={`flex items-center gap-3 rounded-lg border p-3 ${
                              isPhishing ? 'border-red-500/20 bg-red-500/[0.03]' : 'border-white/5 bg-white/[0.02]'
                            }`}>
                              <ExternalLink className={`h-4 w-4 flex-shrink-0 ${isPhishing ? 'text-cyber-red' : 'text-slate-500'}`} />
                              <code className="text-xs text-slate-300 font-mono flex-grow truncate">{link}</code>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Risk flags */}
                  <div className="border-t border-white/5 px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        Risk Analysis ({capture.flags.length} threats)
                      </h4>
                      <button onClick={() => setShowCode(!showCode)} className="text-xs text-cyber-purple hover:underline flex items-center gap-1">
                        <Code className="h-3 w-3" /> {showCode ? 'Hide' : 'View'} Page Source
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                      {capture.flags.map((flag, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <X className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300">{flag}</span>
                        </div>
                      ))}
                    </div>

                    {showCode && (
                      <div className="mt-4 rounded-lg bg-dark-900 border border-white/5 p-4 max-h-[200px] overflow-auto">
                        <pre className="text-[10px] text-slate-500 font-mono whitespace-pre-wrap">{`<!DOCTYPE html>
<html>
<head>
  <title>${capture.title}</title>
  <script src="wallet-connect-fake.js"></script> <!-- WALLET DRAINER -->
  <script src="form-capture.js"></script> <!-- KEYLOGGER -->
  <script src="obfuscated-7x9k.js"></script> <!-- C2 COMMS -->
</head>
<body>
  <div class="scam-page">
    <h1>GUARANTEED 300% RETURNS</h1>
    <div id="fake-timer">23:59:47</div>
    <button onclick="drainWallet()">Connect Wallet</button>
    <form action="/steal-creds" method="POST">
      <input name="seed_phrase" placeholder="Enter seed phrase" />
    </form>
  </div>
</body>
</html>`}</pre>
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
