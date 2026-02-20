import { useState, useCallback } from 'react';
import {
  Globe, Phone, Search, Shield, AlertTriangle, CheckCircle2,
  Lock, Server, MapPin, Wifi, ExternalLink,
  Loader2, Copy, ArrowRight, Eye, Hash, Activity
} from 'lucide-react';
import {
  whoisLookup, ipLookup, phoneLookup, resolveHostIP,
  calculateDomainRisk,
  type WhoisResult, type IpLookupResult, type PhoneLookupResult, type DomainRiskResult
} from '@/lib/api';

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
  hosting: { provider: string; ip: string; location: string; asn: string };
  riskScore: number;
  flags: string[];
  phishing: boolean;
  whoisPrivacy: boolean;
}

interface PhoneResult {
  number: string;
  carrier: string;
  type: string;
  country: string;
  location: string;
  isVoip: boolean;
  isPrepaid: boolean;
  riskScore: number;
  flags: string[];
  valid: boolean;
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
  lat: number;
  lng: number;
}

export function InvestigationTools() {
  const [activeTab, setActiveTab] = useState<ToolTab>('domain');
  const [domainInput, setDomainInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [ipInput, setIpInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [domainResult, setDomainResult] = useState<DomainResult | null>(null);
  const [phoneResult, setPhoneResult] = useState<PhoneResult | null>(null);
  const [ipResult, setIpResult] = useState<IpResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Domain Scan (real API) ---------- */
  const handleDomainScan = useCallback(async () => {
    const input = domainInput.trim();
    if (!input) return;
    setScanning(true);
    setDomainResult(null);
    setError(null);
    try {
      // Step 1: WHOIS lookup via who-dat
      const whois: WhoisResult = await whoisLookup(input);
      // Step 2: Resolve domain IP and get hosting info
      const hostIp = await resolveHostIP(input);
      let ipData: IpLookupResult | undefined;
      let hosting = { provider: 'Unknown', ip: 'Unknown', location: 'Unknown', asn: 'Unknown' };
      if (hostIp) {
        ipData = await ipLookup(hostIp);
        hosting = { provider: ipData.org, ip: hostIp, location: `${ipData.city}, ${ipData.country}`, asn: ipData.asn };
      }
      // Step 3: Calculate risk score
      const risk: DomainRiskResult = calculateDomainRisk(whois, ipData);

      setDomainResult({
        domain: whois.domain,
        registrar: whois.registrar,
        registeredDate: whois.registeredDate,
        expiryDate: whois.expiryDate,
        domainAge: whois.domainAge,
        nameservers: whois.nameservers,
        registrantCountry: whois.registrantCountry,
        registrantOrg: whois.registrantOrg,
        hosting,
        riskScore: risk.riskScore,
        flags: risk.flags,
        phishing: risk.phishing,
        whoisPrivacy: whois.whoisPrivacy,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Domain lookup failed. Check the domain and try again.');
    } finally {
      setScanning(false);
    }
  }, [domainInput]);

  /* ---------- Phone Scan (real API) ---------- */
  const handlePhoneScan = useCallback(async () => {
    const input = phoneInput.trim();
    if (!input) return;
    setScanning(true);
    setPhoneResult(null);
    setError(null);
    try {
      const result: PhoneLookupResult = await phoneLookup(input);
      setPhoneResult({
        number: result.number,
        carrier: result.carrier,
        type: result.lineType,
        country: result.country,
        location: result.location,
        isVoip: result.isVoip,
        isPrepaid: result.isPrepaid,
        riskScore: result.riskScore,
        flags: result.flags,
        valid: result.valid,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Phone lookup failed.');
    } finally {
      setScanning(false);
    }
  }, [phoneInput]);

  /* ---------- IP Scan (real API) ---------- */
  const handleIpScan = useCallback(async () => {
    const input = ipInput.trim();
    if (!input) return;
    setScanning(true);
    setIpResult(null);
    setError(null);
    try {
      const result: IpLookupResult = await ipLookup(input);
      setIpResult({
        ip: result.ip,
        country: result.country,
        region: result.region,
        city: result.city,
        isp: result.isp,
        org: result.org,
        asn: result.asn,
        isVpn: result.isVpn,
        isProxy: result.isProxy,
        isTor: result.isTor,
        isHosting: result.isHosting,
        riskScore: result.riskScore,
        flags: result.flags,
        lat: result.lat,
        lng: result.lng,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'IP lookup failed.');
    } finally {
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

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-orange/20 bg-cyber-orange/[0.06] px-4 py-1.5">
            <Search className="h-3.5 w-3.5 text-cyber-orange" />
            <span className="text-xs font-medium text-cyber-orange">OSINT Investigation Tools</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Domain & Phone <span className="gradient-text">Intelligence</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Instantly investigate suspicious domains, phone numbers, and IP addresses.
            Get WHOIS data, hosting info, carrier details, VPN detection, and risk analysis — all from real-time APIs.
          </p>
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
              onClick={() => { setActiveTab(tab.key); setError(null); }}
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

        {/* Error display */}
        {error && (
          <div className="mx-auto mb-6 max-w-2xl">
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          </div>
        )}

        {/* ==================== DOMAIN CHECKER ==================== */}
        {activeTab === 'domain' && (
          <div className="animate-fade-in">
            {/* Search */}
            <div className="mx-auto mb-8 max-w-2xl">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-grow">
                  <Globe className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Enter domain name (e.g., example.com)"
                    className="w-full rounded-xl border border-white/10 bg-dark-800 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-400/50 transition"
                    value={domainInput}
                    onChange={e => setDomainInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleDomainScan()}
                  />
                </div>
                <button
                  onClick={handleDomainScan}
                  disabled={scanning || !domainInput.trim()}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition disabled:opacity-50"
                >
                  {scanning && activeTab === 'domain' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {scanning && activeTab === 'domain' ? 'Checking...' : 'Check Domain'}
                </button>
              </div>
              {scanning && activeTab === 'domain' && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Querying WHOIS, DNS, and IP intelligence APIs...</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-dark-700">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Domain Results */}
            {domainResult && (
              <div className="animate-fade-in-up">
                {/* Risk score banner */}
                <div className={`mb-6 rounded-xl border p-6 ${getRiskColor(domainResult.riskScore).border} ${getRiskColor(domainResult.riskScore).bg}`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-dark-900/50">
                        <span className={`text-3xl font-extrabold ${getRiskColor(domainResult.riskScore).text}`}>{domainResult.riskScore}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-white">{domainResult.domain}</h3>
                          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getRiskColor(domainResult.riskScore).border} ${getRiskColor(domainResult.riskScore).text}`}>
                            {getRiskColor(domainResult.riskScore).label} RISK
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                          {domainResult.phishing ? 'Domain matches known phishing patterns' : 'No phishing patterns detected'} | Age: {domainResult.domainAge}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href="#evidence" className="flex items-center gap-1.5 rounded-lg bg-cyber-green/10 px-4 py-2 text-xs font-medium text-cyber-green hover:bg-cyber-green/20 transition">
                        <Shield className="h-3.5 w-3.5" /> Add to Evidence
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
                        { label: 'Domain Age', value: domainResult.domainAge, highlight: true },
                        { label: 'Country', value: domainResult.registrantCountry },
                        { label: 'Organization', value: domainResult.registrantOrg },
                        { label: 'WHOIS Privacy', value: domainResult.whoisPrivacy ? 'Enabled' : 'Disabled' },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                          <span className="text-slate-400">{item.label}</span>
                          <span className={`font-mono ${item.highlight ? 'text-cyber-red font-medium' : 'text-white'}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hosting & DNS */}
                  <div className="glass-card rounded-xl p-5">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                      <Server className="h-4 w-4 text-purple-400" /> Hosting & DNS
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

                    {domainResult.nameservers.length > 0 && (
                      <>
                        <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-3 mt-6">
                          <Eye className="h-4 w-4 text-cyan-400" /> Nameservers
                        </h4>
                        <div className="space-y-2">
                          {domainResult.nameservers.map((ns, i) => (
                            <div key={i} className="rounded-lg bg-dark-900/50 px-3 py-2">
                              <code className="text-xs text-slate-300 font-mono">{ns}</code>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
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
                      <div className="flex items-center gap-2 rounded-lg bg-green-500/[0.03] border border-green-500/10 p-4">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <span className="text-xs text-slate-300">No significant risk indicators found for this domain.</span>
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
                    placeholder="Enter phone number with country code (e.g., +14155552671)"
                    className="w-full rounded-xl border border-white/10 bg-dark-800 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-green-400/50 transition"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handlePhoneScan()}
                  />
                </div>
                <button
                  onClick={handlePhoneScan}
                  disabled={scanning || !phoneInput.trim()}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition disabled:opacity-50"
                >
                  {scanning && activeTab === 'phone' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {scanning && activeTab === 'phone' ? 'Looking up...' : 'Lookup Number'}
                </button>
              </div>
              {scanning && activeTab === 'phone' && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Querying carrier data and phone intelligence APIs...</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-dark-700">
                    <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
              )}
            </div>

            {phoneResult && (
              <div className="animate-fade-in-up">
                {/* Risk banner */}
                <div className={`mb-6 rounded-xl border p-6 ${getRiskColor(phoneResult.riskScore).border} ${getRiskColor(phoneResult.riskScore).bg}`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-dark-900/50">
                        <span className={`text-3xl font-extrabold ${getRiskColor(phoneResult.riskScore).text}`}>{phoneResult.riskScore}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-white font-mono">{phoneResult.number}</h3>
                          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getRiskColor(phoneResult.riskScore).border} ${getRiskColor(phoneResult.riskScore).text}`}>
                            {getRiskColor(phoneResult.riskScore).label} RISK
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                          {phoneResult.carrier} | {phoneResult.isVoip ? 'VoIP Number' : phoneResult.type} | {phoneResult.valid ? 'Valid' : 'Invalid'}
                        </p>
                      </div>
                    </div>
                    <a href="#evidence" className="flex items-center gap-1.5 rounded-lg bg-cyber-green/10 px-4 py-2 text-xs font-medium text-cyber-green hover:bg-cyber-green/20 transition">
                      <Shield className="h-3.5 w-3.5" /> Add to Evidence
                    </a>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Carrier info */}
                  <div className="glass-card rounded-xl p-5">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                      <Phone className="h-4 w-4 text-green-400" /> Carrier Information
                    </h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Carrier', value: phoneResult.carrier },
                        { label: 'Line Type', value: phoneResult.type, highlight: phoneResult.isVoip },
                        { label: 'VoIP', value: phoneResult.isVoip ? 'Yes — Disposable' : 'No' },
                        { label: 'Prepaid', value: phoneResult.isPrepaid ? 'Yes' : 'No' },
                        { label: 'Valid', value: phoneResult.valid ? 'Yes' : 'No' },
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
                        { label: 'Location', value: phoneResult.location },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                          <span className="text-slate-400">{item.label}</span>
                          <span className="text-white font-mono">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk flags */}
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
                      <div className="flex items-center gap-2 rounded-lg bg-green-500/[0.03] border border-green-500/10 p-4">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <span className="text-xs text-slate-300">No significant risk indicators detected.</span>
                      </div>
                    )}

                    <div className="mt-4 rounded-lg border border-cyber-green/20 bg-cyber-green/5 p-3">
                      <p className="text-xs text-slate-400">
                        <span className="text-cyber-green font-medium">Tip:</span> VoIP numbers are commonly used by scammers for disposable communications. Add this number to your evidence packet.
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
                    placeholder="Enter IP address (e.g., 8.8.8.8)"
                    className="w-full rounded-xl border border-white/10 bg-dark-800 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-400/50 transition"
                    value={ipInput}
                    onChange={e => setIpInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleIpScan()}
                  />
                </div>
                <button
                  onClick={handleIpScan}
                  disabled={scanning || !ipInput.trim()}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition disabled:opacity-50"
                >
                  {scanning && activeTab === 'ip' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {scanning && activeTab === 'ip' ? 'Scanning...' : 'Scan IP'}
                </button>
              </div>
              {scanning && activeTab === 'ip' && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Querying geolocation, ASN, VPN/proxy detection APIs...</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-dark-700">
                    <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-500 animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
              )}
            </div>

            {ipResult && (
              <div className="animate-fade-in-up">
                {/* Risk banner */}
                <div className={`mb-6 rounded-xl border p-6 ${getRiskColor(ipResult.riskScore).border} ${getRiskColor(ipResult.riskScore).bg}`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-dark-900/50">
                        <span className={`text-3xl font-extrabold ${getRiskColor(ipResult.riskScore).text}`}>{ipResult.riskScore}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-bold text-white font-mono">{ipResult.ip}</h3>
                          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getRiskColor(ipResult.riskScore).border} ${getRiskColor(ipResult.riskScore).text}`}>
                            {getRiskColor(ipResult.riskScore).label} RISK
                          </span>
                          {ipResult.isTor && <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400">TOR EXIT</span>}
                          {ipResult.isVpn && <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-400">VPN</span>}
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                          {ipResult.isp} | {ipResult.city}, {ipResult.country}
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
                  {/* Geolocation */}
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

                    {/* Map placeholder */}
                    <div className="mt-4 rounded-lg bg-dark-900/50 border border-white/5 p-8 text-center">
                      <MapPin className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                      <p className="text-xs text-slate-500">{ipResult.city}, {ipResult.country}</p>
                      <p className="text-[10px] text-slate-600 mt-1">{ipResult.lat.toFixed(4)}, {ipResult.lng.toFixed(4)}</p>
                    </div>
                  </div>

                  {/* Network info */}
                  <div className="glass-card rounded-xl p-5">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                      <Server className="h-4 w-4 text-blue-400" /> Network Information
                    </h4>
                    <div className="space-y-3">
                      {[
                        { label: 'ISP', value: ipResult.isp },
                        { label: 'Organization', value: ipResult.org },
                        { label: 'ASN', value: ipResult.asn },
                        { label: 'VPN', value: ipResult.isVpn ? 'Detected' : 'Not detected' },
                        { label: 'Proxy', value: ipResult.isProxy ? 'Detected' : 'Not detected' },
                        { label: 'Tor', value: ipResult.isTor ? 'Exit Node' : 'Not detected' },
                        { label: 'Hosting', value: ipResult.isHosting ? 'Data Center' : 'Residential' },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                          <span className="text-slate-400">{item.label}</span>
                          <span className="text-white font-mono">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Flags */}
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
                      <div className="flex items-center gap-2 rounded-lg bg-green-500/[0.03] border border-green-500/10 p-4">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <span className="text-xs text-slate-300">No significant threat indicators detected for this IP.</span>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <a href="#evidence" className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-cyber-green/10 border border-cyber-green/20 px-3 py-2 text-xs font-medium text-cyber-green hover:bg-cyber-green/20 transition">
                        <Shield className="h-3.5 w-3.5" /> Add to Evidence
                      </a>
                      <a href="#tracker" className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-cyber-blue/10 border border-cyber-blue/20 px-3 py-2 text-xs font-medium text-cyber-blue hover:bg-cyber-blue/20 transition">
                        <Hash className="h-3.5 w-3.5" /> Cross-Reference
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
