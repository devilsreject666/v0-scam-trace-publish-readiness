import { useState, useCallback } from 'react';
import {
  Globe, Phone, Search, Shield, AlertTriangle, CheckCircle2,
  Lock, Server, MapPin, Wifi, ExternalLink,
  Loader2, Copy, ArrowRight, Eye, Activity, X
} from 'lucide-react';

const OSINT_SCAN_KEY = 'scamtrace_osint_scans';
const OSINT_RESET_KEY = 'scamtrace_osint_reset';
const FREE_OSINT_LIMIT = 3;

function getOsintScanCount(): number {
  const reset = localStorage.getItem(OSINT_RESET_KEY);
  const now = Date.now();
  if (!reset || now > parseInt(reset)) {
    localStorage.setItem(OSINT_RESET_KEY, String(now + 86400000));
    localStorage.setItem(OSINT_SCAN_KEY, '0');
    return 0;
  }
  return parseInt(localStorage.getItem(OSINT_SCAN_KEY) || '0');
}

function incrementOsintCount(): number {
  const next = getOsintScanCount() + 1;
  localStorage.setItem(OSINT_SCAN_KEY, String(next));
  return next;
}

type ToolTab = 'domain' | 'phone' | 'ip';

interface DomainResult {
  domain: string;
  registrar: string;
  registeredDate: string;
  expiryDate: string;
  domainAge: string;
  nameservers: string[];
  registrantCountry: string;
  registrantOrg: string;
  ssl: { issuer: string; valid: boolean; grade: string; expiry: string };
  hosting: { provider: string; ip: string; location: string; asn: string };
  riskScore: number;
  flags: string[];
  scamReports: number;
  phishing: boolean;
  whoisPrivacy: boolean;
}

interface PhoneResult {
  number: string;
  carrier: string;
  type: string;
  country: string;
  region: string;
  city: string;
  timezone: string;
  isVoip: boolean;
  isPrepaid: boolean;
  riskScore: number;
  scamReports: number;
  flags: string[];
  recentActivity: string[];
  linkedPlatforms: string[];
}

interface IpResult {
  ip: string;
  country: string;
  region: string;
  city: string;
  isp: string;
  org: string;
  asn: string;
  isVpn: boolean;
  isProxy: boolean;
  isTor: boolean;
  isHosting: boolean;
  riskScore: number;
  flags: string[];
  abuseReports: number;
  lat: number;
  lng: number;
}

export function InvestigationTools({ onSignUp }: { onSignUp?: () => void } = {}) {
  const [activeTab, setActiveTab] = useState<ToolTab>('domain');
  const [domainInput, setDomainInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [ipInput, setIpInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [domainResult, setDomainResult] = useState<DomainResult | null>(null);
  const [phoneResult, setPhoneResult] = useState<PhoneResult | null>(null);
  const [ipResult, setIpResult] = useState<IpResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [showRateGate, setShowRateGate] = useState(false);
  const [scansLeft, setScansLeft] = useState(() => Math.max(0, FREE_OSINT_LIMIT - getOsintScanCount()));

  const runProgressBar = useCallback((onComplete: () => void) => {
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 90) { clearInterval(interval); onComplete(); return 90; }
        return p + 4;
      });
    }, 60);
    return interval;
  }, []);

  const checkRateLimit = (): boolean => {
    const count = getOsintScanCount();
    if (count >= FREE_OSINT_LIMIT) {
      setShowRateGate(true);
      return false;
    }
    const next = incrementOsintCount();
    setScansLeft(Math.max(0, FREE_OSINT_LIMIT - next));
    return true;
  };

  const handleDomainScan = useCallback(async () => {
    if (!checkRateLimit()) return;
    const q = domainInput.trim() || 'crypto-invest-returns.xyz';
    if (!domainInput.trim()) setDomainInput(q);
    setScanning(true);
    setScanError(null);
    setDomainResult(null);

    let done = false;
    const bar = setInterval(() => {
      setScanProgress(p => {
        if (done || p >= 90) return p;
        return Math.min(p + 3, 90);
      });
    }, 60);

    try {
      const res = await fetch(`/api/osint-domain?domain=${encodeURIComponent(q)}`);
      const data = await res.json();
      clearInterval(bar);
      if (!res.ok) { setScanError(data.error ?? 'Lookup failed'); }
      else { setDomainResult(data); }
    } catch {
      clearInterval(bar);
      setScanError('Network error — check your connection and try again.');
    } finally {
      done = true;
      setScanProgress(100);
      setScanning(false);
    }
  }, [domainInput, runProgressBar]);

  const handlePhoneScan = useCallback(async () => {
    if (!checkRateLimit()) return;
    const q = phoneInput.trim() || '+13325550147';
    if (!phoneInput.trim()) setPhoneInput(q);
    setScanning(true);
    setScanError(null);
    setPhoneResult(null);

    let done = false;
    const bar = setInterval(() => {
      setScanProgress(p => { if (done || p >= 90) return p; return Math.min(p + 3, 90); });
    }, 60);

    try {
      const res = await fetch(`/api/osint-phone?phone=${encodeURIComponent(q)}`);
      const data = await res.json();
      clearInterval(bar);
      if (!res.ok) setScanError(data.error ?? 'Lookup failed');
      else setPhoneResult(data);
    } catch {
      clearInterval(bar);
      setScanError('Network error — check your connection and try again.');
    } finally {
      done = true;
      setScanProgress(100);
      setScanning(false);
    }
  }, [phoneInput]);

  const handleIpScan = useCallback(async () => {
    if (!checkRateLimit()) return;
    const q = ipInput.trim() || '185.220.101.42';
    if (!ipInput.trim()) setIpInput(q);
    setScanning(true);
    setScanError(null);
    setIpResult(null);

    let done = false;
    const bar = setInterval(() => {
      setScanProgress(p => { if (done || p >= 90) return p; return Math.min(p + 3, 90); });
    }, 60);

    try {
      const res = await fetch(`/api/osint-ip?ip=${encodeURIComponent(q)}`);
      const data = await res.json();
      clearInterval(bar);
      if (!res.ok) setScanError(data.error ?? 'Lookup failed');
      else setIpResult(data);
    } catch {
      clearInterval(bar);
      setScanError('Network error — check your connection and try again.');
    } finally {
      done = true;
      setScanProgress(100);
      setScanning(false);
    }
  }, [ipInput]);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'CRITICAL' };
    if (score >= 60) return { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'HIGH' };
    if (score >= 40) return { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'MEDIUM' };
    return { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'LOW' };
  };

  return (
    <section id="osint-tools" className="relative py-24 grid-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-cyber-orange/[0.03] blur-[150px]" />
        <div className="absolute left-1/3 bottom-1/4 h-[400px] w-[400px] rounded-full bg-cyber-blue/[0.03] blur-[120px]" />
      </div>

      {/* Rate limit gate modal */}
      {showRateGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-2xl border border-[#00f5ff]/30 p-8 max-w-md w-full text-center relative">
            <button onClick={() => setShowRateGate(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
              <X size={18} />
            </button>
            <div className="w-16 h-16 rounded-full bg-[#00f5ff]/10 border border-[#00f5ff]/30 flex items-center justify-center mx-auto mb-4">
              <Lock size={28} className="text-[#00f5ff]" />
            </div>
            <h3 className="text-xl font-bold text-white font-['Orbitron'] mb-2">Daily Scans Limit Reached</h3>
            <p className="text-slate-400 text-sm mb-6">
              You've used all {FREE_OSINT_LIMIT} free OSINT scans for today. Sign up for a free account to get unlimited scans.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { setShowRateGate(false); onSignUp?.(); }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#00ff88] text-[#03081a] font-bold text-sm"
              >
                Create Free Account — Unlimited Scans
              </button>
              <button onClick={() => setShowRateGate(false)} className="w-full py-2 text-slate-500 text-sm hover:text-slate-300 transition-colors">
                Come back tomorrow for {FREE_OSINT_LIMIT} more free scans
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="badge-neon mb-4">
            <Search className="h-3.5 w-3.5" />
            OSINT Investigation Tools
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Domain & Phone <span className="gradient-text">Intelligence</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Instantly investigate suspicious domains, phone numbers, and IP addresses.
            Real-time WHOIS, hosting intel, carrier data, VPN detection, and threat database cross-referencing.
          </p>
          {scansLeft < FREE_OSINT_LIMIT && (
            <p className="mt-3 text-sm text-slate-500">
              {scansLeft > 0 ? `${scansLeft} free scan${scansLeft !== 1 ? 's' : ''} remaining today` : 'Daily free scans used — sign up for unlimited access'}
            </p>
          )}
        </div>

        {/* Tool tabs */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {([
            { key: 'domain' as const, label: 'Domain Checker', icon: Globe, color: 'text-blue-400' },
            { key: 'phone' as const, label: 'Phone Lookup', icon: Phone, color: 'text-green-400' },
            { key: 'ip' as const, label: 'IP Intelligence', icon: Wifi, color: 'text-purple-400' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setScanError(null); }}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white/10 text-white border border-white/10 shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.key ? tab.color : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error Banner */}
        {scanError && (
          <div className="mx-auto mb-6 max-w-2xl flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {scanError}
          </div>
        )}

        {/* ==================== DOMAIN CHECKER ==================== */}
        {activeTab === 'domain' && (
          <div className="animate-fade-in">
            <div className="mx-auto mb-8 max-w-2xl">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-grow">
                  <Globe className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Enter domain name (e.g., suspicious-crypto.xyz)"
                    className="input-neon w-full py-3.5 pl-12 pr-4 text-sm text-white"
                    value={domainInput}
                    onChange={e => setDomainInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !scanning && handleDomainScan()}
                  />
                </div>
                <button
                  onClick={handleDomainScan}
                  disabled={scanning}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition disabled:opacity-50"
                >
                  {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {scanning ? 'Scanning...' : 'Check Domain'}
                </button>
              </div>
              {scanning && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Querying WHOIS, DNS, hosting, and VirusTotal threat database...</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-dark-700">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-100" style={{ width: `${scanProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            {domainResult && (
              <div className="animate-fade-in-up">
                <div className={`mb-6 rounded-xl border p-6 ${getRiskColor(domainResult.riskScore).border} ${getRiskColor(domainResult.riskScore).bg}`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-dark-900/50">
                        <span className={`text-3xl font-extrabold font-orbitron ${getRiskColor(domainResult.riskScore).text}`}>{domainResult.riskScore}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-bold text-white">{domainResult.domain}</h3>
                          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getRiskColor(domainResult.riskScore).border} ${getRiskColor(domainResult.riskScore).text}`}>
                            {getRiskColor(domainResult.riskScore).label} RISK
                          </span>
                          {domainResult.phishing && (
                            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-400">⚠ PHISHING</span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                          {domainResult.scamReports} threat detections
                          {domainResult.whoisPrivacy && ' • Privacy-protected WHOIS'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href="#evidence" className="flex items-center gap-1.5 rounded-lg bg-cyber-green/10 px-4 py-2 text-xs font-medium text-cyber-green hover:bg-cyber-green/20 transition">
                        <Shield className="h-3.5 w-3.5" /> Add to Evidence
                      </a>
                      <a
                        href={`https://www.virustotal.com/gui/domain/${domainResult.domain}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 transition"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> VirusTotal
                      </a>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* WHOIS */}
                  <div className="glass-card rounded-xl p-5">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                      <Globe className="h-4 w-4 text-blue-400" /> WHOIS Information
                    </h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Registrar', value: domainResult.registrar },
                        { label: 'Registered', value: domainResult.registeredDate },
                        { label: 'Expires', value: domainResult.expiryDate },
                        { label: 'Domain Age', value: domainResult.domainAge, highlight: domainResult.domainAge.includes('days') },
                        { label: 'Country', value: domainResult.registrantCountry },
                        { label: 'Organization', value: domainResult.registrantOrg },
                        { label: 'WHOIS Privacy', value: domainResult.whoisPrivacy ? '⚠️ Enabled' : '✓ Disabled' },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                          <span className="text-slate-400">{item.label}</span>
                          <span className={`font-mono ${item.highlight ? 'text-cyber-red font-medium' : 'text-white'}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SSL + Hosting */}
                  <div className="glass-card rounded-xl p-5">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                      <Lock className="h-4 w-4 text-green-400" /> SSL Certificate
                    </h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Issuer', value: domainResult.ssl.issuer },
                        { label: 'Valid', value: domainResult.ssl.valid ? '✓ Valid' : '✕ Invalid' },
                        { label: 'Grade', value: domainResult.ssl.grade },
                        { label: 'Expires', value: domainResult.ssl.expiry },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                          <span className="text-slate-400">{item.label}</span>
                          <span className="text-white font-mono">{item.value}</span>
                        </div>
                      ))}
                    </div>

                    <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-3 mt-6">
                      <Server className="h-4 w-4 text-purple-400" /> Hosting
                    </h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Provider', value: domainResult.hosting.provider },
                        { label: 'IP Address', value: domainResult.hosting.ip },
                        { label: 'Location', value: domainResult.hosting.location },
                        { label: 'ASN', value: domainResult.hosting.asn },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                          <span className="text-slate-400">{item.label}</span>
                          <span className="text-white font-mono">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk Flags */}
                  <div className="glass-card rounded-xl p-5 md:col-span-2 lg:col-span-1">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                      <AlertTriangle className="h-4 w-4 text-red-400" /> Risk Indicators ({domainResult.flags.length})
                    </h4>
                    {domainResult.flags.length > 0 ? (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {domainResult.flags.map((flag, idx) => (
                          <div key={idx} className="flex items-start gap-2 rounded-lg bg-red-500/[0.03] border border-red-500/10 p-2.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-slate-300">{flag}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg bg-green-500/5 border border-green-500/10 p-3">
                        <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span className="text-xs text-slate-300">No significant risk indicators detected</span>
                      </div>
                    )}
                    {domainResult.nameservers.length > 0 && (
                      <div className="mt-4 rounded-lg bg-dark-900/50 p-3">
                        <div className="flex items-center gap-2 text-xs">
                          <Eye className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-slate-400">NS: {domainResult.nameservers.join(', ')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== PHONE LOOKUP ==================== */}
        {activeTab === 'phone' && (
          <div className="animate-fade-in">
            <div className="mx-auto mb-8 max-w-2xl">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-grow">
                  <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Enter phone number with country code (e.g., +1 332 555 0147)"
                    className="input-neon w-full py-3.5 pl-12 pr-4 text-sm text-white"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !scanning && handlePhoneScan()}
                  />
                </div>
                <button
                  onClick={handlePhoneScan}
                  disabled={scanning}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition disabled:opacity-50"
                >
                  {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {scanning ? 'Looking up...' : 'Lookup Number'}
                </button>
              </div>
              {scanning && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Querying carrier data, fraud intelligence, and threat feeds...</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-dark-700">
                    <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-100" style={{ width: `${scanProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            {phoneResult && (
              <div className="animate-fade-in-up">
                <div className={`mb-6 rounded-xl border p-6 ${getRiskColor(phoneResult.riskScore).border} ${getRiskColor(phoneResult.riskScore).bg}`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-dark-900/50">
                        <span className={`text-3xl font-extrabold font-orbitron ${getRiskColor(phoneResult.riskScore).text}`}>{phoneResult.riskScore}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-bold text-white font-mono">{phoneResult.number}</h3>
                          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getRiskColor(phoneResult.riskScore).border} ${getRiskColor(phoneResult.riskScore).text}`}>
                            {getRiskColor(phoneResult.riskScore).label} RISK
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                          {phoneResult.carrier} • {phoneResult.scamReports} reports
                          {phoneResult.isVoip && ' • ⚠️ VoIP Number'}
                          {phoneResult.isPrepaid && ' • Prepaid'}
                        </p>
                      </div>
                    </div>
                    <a href="#evidence" className="flex items-center gap-1.5 rounded-lg bg-cyber-green/10 px-4 py-2 text-xs font-medium text-cyber-green hover:bg-cyber-green/20 transition">
                      <Shield className="h-3.5 w-3.5" /> Add to Evidence
                    </a>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="glass-card rounded-xl p-5">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                      <Phone className="h-4 w-4 text-green-400" /> Carrier Information
                    </h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Carrier', value: phoneResult.carrier },
                        { label: 'Type', value: phoneResult.type, highlight: phoneResult.isVoip },
                        { label: 'VoIP', value: phoneResult.isVoip ? '⚠️ Yes — Virtual/Disposable' : '✓ No' },
                        { label: 'Prepaid', value: phoneResult.isPrepaid ? '⚠️ Yes' : '✓ No' },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                          <span className="text-slate-400">{item.label}</span>
                          <span className={`font-mono ${item.highlight ? 'text-cyber-red font-medium' : 'text-white'}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>

                    <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-3 mt-6">
                      <MapPin className="h-4 w-4 text-cyan-400" /> Location
                    </h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Country', value: phoneResult.country },
                        { label: 'Region', value: phoneResult.region },
                        { label: 'City', value: phoneResult.city },
                        { label: 'Timezone', value: phoneResult.timezone },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                          <span className="text-slate-400">{item.label}</span>
                          <span className="text-white font-mono">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card rounded-xl p-5">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                      <AlertTriangle className="h-4 w-4 text-orange-400" /> Risk Indicators ({phoneResult.flags.length})
                    </h4>
                    {phoneResult.flags.length > 0 ? (
                      <div className="space-y-2">
                        {phoneResult.flags.map((flag, idx) => (
                          <div key={idx} className="flex items-start gap-2 rounded-lg bg-orange-500/[0.03] border border-orange-500/10 p-2.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-slate-300">{flag}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg bg-green-500/5 border border-green-500/10 p-3">
                        <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span className="text-xs text-slate-300">No fraud indicators found for this number</span>
                      </div>
                    )}

                    {phoneResult.linkedPlatforms.length > 0 && (
                      <div className="mt-4">
                        <div className="text-xs font-medium text-slate-400 mb-2">Linked Platforms</div>
                        <div className="flex flex-wrap gap-1.5">
                          {phoneResult.linkedPlatforms.map(p => (
                            <span key={p} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-white">{p}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="glass-card rounded-xl p-5 md:col-span-2 lg:col-span-1">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                      <Activity className="h-4 w-4 text-cyan-400" /> Intelligence Report
                    </h4>
                    {phoneResult.recentActivity.length > 0 ? (
                      <div className="relative pl-6">
                        <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-orange-400 to-red-400 opacity-30" />
                        {phoneResult.recentActivity.map((activity, idx) => (
                          <div key={idx} className="relative mb-4 last:mb-0">
                            <div className="absolute -left-4 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-orange-400 bg-dark-900" />
                            <p className="text-xs text-slate-300">{activity}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No recent scam activity found in intelligence feeds.</p>
                    )}

                    <div className="mt-4 rounded-lg border border-cyber-blue/20 bg-cyber-blue/5 p-3">
                      <p className="text-xs text-slate-400">
                        <span className="text-cyber-blue font-medium">Data sources:</span> IPQualityScore fraud database, NumVerify carrier API, Abstract Phone Validation. Add this number to your evidence packet if involved in a scam.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== IP INTELLIGENCE ==================== */}
        {activeTab === 'ip' && (
          <div className="animate-fade-in">
            <div className="mx-auto mb-8 max-w-2xl">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-grow">
                  <Wifi className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Enter IP address (e.g., 185.220.101.42)"
                    className="input-neon w-full py-3.5 pl-12 pr-4 text-sm text-white"
                    value={ipInput}
                    onChange={e => setIpInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !scanning && handleIpScan()}
                  />
                </div>
                <button
                  onClick={handleIpScan}
                  disabled={scanning}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition disabled:opacity-50"
                >
                  {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {scanning ? 'Scanning...' : 'Scan IP'}
                </button>
              </div>
              {scanning && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Querying geolocation, ASN, VPN detection, and AbuseIPDB...</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-dark-700">
                    <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-500 transition-all duration-100" style={{ width: `${scanProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            {ipResult && (
              <div className="animate-fade-in-up">
                <div className={`mb-6 rounded-xl border p-6 ${getRiskColor(ipResult.riskScore).border} ${getRiskColor(ipResult.riskScore).bg}`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-dark-900/50">
                        <span className={`text-3xl font-extrabold font-orbitron ${getRiskColor(ipResult.riskScore).text}`}>{ipResult.riskScore}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-bold text-white font-mono">{ipResult.ip}</h3>
                          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getRiskColor(ipResult.riskScore).border} ${getRiskColor(ipResult.riskScore).text}`}>
                            {getRiskColor(ipResult.riskScore).label} RISK
                          </span>
                          {ipResult.isTor && <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400">TOR EXIT</span>}
                          {ipResult.isVpn && <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-400">VPN</span>}
                          {ipResult.isProxy && <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold text-yellow-400">PROXY</span>}
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                          {ipResult.isp} • {ipResult.abuseReports} abuse reports • {ipResult.city}, {ipResult.country}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => copyText(ipResult.ip)} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-white hover:bg-white/10 transition">
                      {copied === ipResult.ip ? <CheckCircle2 className="h-3.5 w-3.5 text-cyber-green" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied === ipResult.ip ? 'Copied' : 'Copy IP'}
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="glass-card rounded-xl p-5">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                      <MapPin className="h-4 w-4 text-cyan-400" /> Geolocation
                    </h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Country', value: ipResult.country },
                        { label: 'Region', value: ipResult.region },
                        { label: 'City', value: ipResult.city },
                        { label: 'Coordinates', value: `${ipResult.lat.toFixed(4)}, ${ipResult.lng.toFixed(4)}` },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                          <span className="text-slate-400">{item.label}</span>
                          <span className="text-white font-mono">{item.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 rounded-lg bg-dark-900/50 border border-white/5 p-5 text-center">
                      <MapPin className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                      <p className="text-xs text-slate-500">{ipResult.city}{ipResult.city && ipResult.country ? ', ' : ''}{ipResult.country}</p>
                      <p className="text-[10px] text-slate-600 mt-1">{ipResult.lat.toFixed(4)}°, {ipResult.lng.toFixed(4)}°</p>
                    </div>
                  </div>

                  <div className="glass-card rounded-xl p-5">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                      <Server className="h-4 w-4 text-blue-400" /> Network Information
                    </h4>
                    <div className="space-y-3">
                      {[
                        { label: 'ISP', value: ipResult.isp },
                        { label: 'Organization', value: ipResult.org },
                        { label: 'ASN', value: ipResult.asn },
                        { label: 'VPN', value: ipResult.isVpn ? '⚠️ Detected' : '✓ Not detected' },
                        { label: 'Proxy', value: ipResult.isProxy ? '⚠️ Detected' : '✓ Not detected' },
                        { label: 'Tor', value: ipResult.isTor ? '⚠️ Exit Node' : '✓ Not detected' },
                        { label: 'Hosting', value: ipResult.isHosting ? 'Data Center' : 'Residential' },
                        { label: 'Abuse Reports', value: String(ipResult.abuseReports) },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                          <span className="text-slate-400">{item.label}</span>
                          <span className="text-white font-mono">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card rounded-xl p-5 md:col-span-2 lg:col-span-1">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                      <AlertTriangle className="h-4 w-4 text-red-400" /> Threat Indicators
                    </h4>
                    {ipResult.flags.length > 0 ? (
                      <div className="space-y-2">
                        {ipResult.flags.map((flag, idx) => (
                          <div key={idx} className="flex items-start gap-2 rounded-lg bg-red-500/[0.03] border border-red-500/10 p-2.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-slate-300">{flag}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg bg-green-500/5 border border-green-500/10 p-3">
                        <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span className="text-xs text-slate-300">No threat indicators found for this IP</span>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <a href="#evidence" className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-cyber-green/10 border border-cyber-green/20 px-3 py-2 text-xs font-medium text-cyber-green hover:bg-cyber-green/20 transition">
                        <Shield className="h-3.5 w-3.5" /> Add to Evidence
                      </a>
                      <a
                        href={`https://www.abuseipdb.com/check/${ipResult.ip}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-cyber-blue/10 border border-cyber-blue/20 px-3 py-2 text-xs font-medium text-cyber-blue hover:bg-cyber-blue/20 transition"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> AbuseIPDB
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick actions footer */}
        <div className="mt-12 glass-card-premium rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Found suspicious indicators?</h3>
            <p className="text-sm text-slate-400">Combine OSINT results with blockchain tracing for a complete investigation.</p>
          </div>
          <div className="flex gap-3">
            <a href="#tracker" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyber-green to-cyber-blue px-5 py-3 text-sm font-bold text-dark-900 hover:shadow-lg hover:shadow-cyber-green/20 transition">
              <ArrowRight className="h-4 w-4" /> Trace Funds
            </a>
            <a href="#chat-evidence" className="btn-secondary text-sm px-5 py-3 flex items-center gap-2">
              <ExternalLink className="h-4 w-4" /> Upload Evidence
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
