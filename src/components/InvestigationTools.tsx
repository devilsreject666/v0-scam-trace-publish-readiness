import { useState, useCallback } from 'react';
import {
  Globe, Phone, Search, Shield, AlertTriangle, CheckCircle2,
  Lock, Server, MapPin, Wifi, ExternalLink,
  Loader2, Copy, ArrowRight, Eye, Hash, Activity, Calendar, Clock
} from 'lucide-react';
import { lookupDomain, lookupPhoneNumber, type DomainData, type PhoneData } from '@/lib/api/osint';

type ToolTab = 'domain' | 'phone';

export function InvestigationTools() {
  const [activeTab, setActiveTab] = useState<ToolTab>('domain');
  const [domainInput, setDomainInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [domainResult, setDomainResult] = useState<DomainData | null>(null);
  const [phoneResult, setPhoneResult] = useState<PhoneData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleDomainScan = useCallback(async () => {
    const domain = domainInput.trim() || 'example.com';
    setDomainInput(domain);
    setScanning(true);
    setError(null);
    setDomainResult(null);

    try {
      const result = await lookupDomain(domain);
      setDomainResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lookup domain');
    } finally {
      setScanning(false);
    }
  }, [domainInput]);

  const handlePhoneScan = useCallback(async () => {
    const phone = phoneInput.trim() || '+1 555 123 4567';
    setPhoneInput(phone);
    setScanning(true);
    setError(null);
    setPhoneResult(null);

    try {
      const result = await lookupPhoneNumber(phone);
      setPhoneResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lookup phone number');
    } finally {
      setScanning(false);
    }
  }, [phoneInput]);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return { text: 'text-[#ff4d6a]', bg: 'bg-[rgba(255,45,85,0.1)]', border: 'border-[rgba(255,45,85,0.3)]', label: 'CRITICAL', glow: 'shadow-[0_0_20px_rgba(255,45,85,0.2)]' };
    if (score >= 60) return { text: 'text-[#ff9500]', bg: 'bg-[rgba(255,136,0,0.1)]', border: 'border-[rgba(255,136,0,0.3)]', label: 'HIGH', glow: 'shadow-[0_0_20px_rgba(255,136,0,0.2)]' };
    if (score >= 40) return { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'MEDIUM', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.15)]' };
    return { text: 'text-[#00ff96]', bg: 'bg-[rgba(0,255,150,0.1)]', border: 'border-[rgba(0,255,150,0.3)]', label: 'LOW', glow: 'shadow-[0_0_20px_rgba(0,255,150,0.2)]' };
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section id="osint-tools" className="relative py-24">
      {/* Animated background */}
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-[rgba(255,136,0,0.04)] blur-[150px] animate-ambient" />
        <div className="absolute left-1/3 bottom-1/4 h-[400px] w-[400px] rounded-full bg-[rgba(0,240,255,0.03)] blur-[120px] animate-ambient delay-300" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="glass-badge glass-badge-orange mb-4 inline-flex">
            <Search className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">OSINT Investigation Tools</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Domain & Phone <span className="gradient-text">Intelligence</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Real-time WHOIS/RDAP lookups, phone number validation, and risk assessment. 
            All data pulled from live APIs — no mock data.
          </p>
        </div>

        {/* Tool tabs - Liquid glass style */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {([
            { key: 'domain' as const, label: 'Domain Checker', icon: Globe, color: 'text-[#00f0ff]' },
            { key: 'phone' as const, label: 'Phone Lookup', icon: Phone, color: 'text-[#00ff96]' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setError(null); }}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300 backdrop-blur-xl ${
                activeTab === tab.key
                  ? 'bg-[rgba(255,255,255,0.1)] text-white border border-[rgba(0,255,200,0.3)] shadow-[0_0_20px_rgba(0,255,150,0.15)]'
                  : 'bg-[rgba(255,255,255,0.03)] text-slate-400 hover:text-white hover:bg-[rgba(255,255,255,0.06)] border border-transparent'
              }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.key ? tab.color : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error display */}
        {error && (
          <div className="mx-auto mb-6 max-w-2xl rounded-xl border border-[rgba(255,45,85,0.3)] bg-[rgba(255,45,85,0.1)] p-4 text-center">
            <p className="text-sm text-[#ff4d6a]">{error}</p>
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
                    placeholder="Enter domain name (e.g., google.com)"
                    className="glass-input w-full pl-12 text-sm"
                    value={domainInput}
                    onChange={e => setDomainInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleDomainScan()}
                  />
                </div>
                <button
                  onClick={handleDomainScan}
                  disabled={scanning}
                  className="btn-primary flex items-center gap-2 px-6 py-3.5 text-sm disabled:opacity-50"
                >
                  {scanning && activeTab === 'domain' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {scanning && activeTab === 'domain' ? 'Checking...' : 'Check Domain'}
                </button>
              </div>
              {scanning && activeTab === 'domain' && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Querying RDAP/WHOIS servers...</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#00ff96] to-[#00f0ff] animate-shimmer" style={{ width: '100%' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Domain Results */}
            {domainResult && (
              <div className="animate-fade-in-up">
                {/* Risk score banner */}
                <div className={`mb-6 rounded-xl border p-6 backdrop-blur-xl ${getRiskColor(domainResult.riskScore).border} ${getRiskColor(domainResult.riskScore).bg} ${getRiskColor(domainResult.riskScore).glow}`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(10,10,15,0.6)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)]">
                        <span className={`text-3xl font-extrabold ${getRiskColor(domainResult.riskScore).text}`}>{domainResult.riskScore}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-white">{domainResult.domain}</h3>
                          <span className={`glass-badge ${getRiskColor(domainResult.riskScore).bg} ${getRiskColor(domainResult.riskScore).text} border ${getRiskColor(domainResult.riskScore).border}`}>
                            {getRiskColor(domainResult.riskScore).label} RISK
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                          {domainResult.ageInDays > 0 ? `${domainResult.ageInDays} days old` : 'Age unknown'} 
                          {domainResult.registrar && ` • ${domainResult.registrar}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => copyText(JSON.stringify(domainResult, null, 2))}
                        className="btn-secondary flex items-center gap-1.5 px-4 py-2 text-xs"
                      >
                        {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-[#00ff96]" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? 'Copied!' : 'Copy Report'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* WHOIS Info */}
                  <div className="glass-card-premium rounded-xl p-5">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                      <Globe className="h-4 w-4 text-[#00f0ff]" /> WHOIS Information
                    </h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Registrar', value: domainResult.registrar || 'Unknown' },
                        { label: 'Created', value: formatDate(domainResult.creationDate), icon: Calendar },
                        { label: 'Expires', value: formatDate(domainResult.expirationDate), icon: Clock },
                        { label: 'Domain Age', value: domainResult.ageInDays > 0 ? `${domainResult.ageInDays} days` : 'Unknown', highlight: domainResult.ageInDays < 30 },
                        { label: 'Country', value: domainResult.registrantCountry || 'Unknown' },
                        { label: 'Organization', value: domainResult.registrantOrg || 'Unknown' },
                        { label: 'DNSSEC', value: domainResult.dnssec ? 'Enabled' : 'Disabled' },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center text-xs border-b border-[rgba(255,255,255,0.05)] pb-2">
                          <span className="text-slate-400 flex items-center gap-1">
                            {item.label}
                          </span>
                          <span className={`font-mono ${item.highlight ? 'text-[#ff4d6a] font-medium' : 'text-white'}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="glass-card-premium rounded-xl p-5">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                      <Server className="h-4 w-4 text-[#a855f7]" /> Technical Details
                    </h4>
                    <div className="space-y-3">
                      {[
                        { label: 'IP Address', value: domainResult.ipAddress || 'Not resolved' },
                        { label: 'Nameservers', value: domainResult.nameServers.length > 0 ? domainResult.nameServers[0] : 'Unknown' },
                        { label: 'Status', value: domainResult.status.length > 0 ? domainResult.status[0] : 'Unknown' },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center text-xs border-b border-[rgba(255,255,255,0.05)] pb-2">
                          <span className="text-slate-400">{item.label}</span>
                          <span className="text-white font-mono truncate max-w-[150px]">{item.value}</span>
                        </div>
                      ))}
                    </div>

                    {domainResult.nameServers.length > 1 && (
                      <div className="mt-4 rounded-lg bg-[rgba(10,10,15,0.5)] p-3">
                        <div className="text-xs text-slate-400 mb-2">All Nameservers:</div>
                        <div className="space-y-1">
                          {domainResult.nameServers.map((ns, i) => (
                            <div key={i} className="text-xs font-mono text-[#00f0ff]">{ns}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Risk Factors */}
                  <div className="glass-card-premium rounded-xl p-5 md:col-span-2 lg:col-span-1">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                      <AlertTriangle className="h-4 w-4 text-[#ff4d6a]" /> Risk Analysis ({domainResult.riskFactors.length})
                    </h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {domainResult.riskFactors.map((factor, idx) => (
                        <div key={idx} className="flex items-start gap-2 rounded-lg bg-[rgba(255,45,85,0.05)] border border-[rgba(255,45,85,0.15)] p-2.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-[#ff4d6a] flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-300">{factor}</span>
                        </div>
                      ))}
                    </div>
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
                    placeholder="Enter phone number (e.g., +1 555 123 4567)"
                    className="glass-input w-full pl-12 text-sm"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handlePhoneScan()}
                  />
                </div>
                <button
                  onClick={handlePhoneScan}
                  disabled={scanning}
                  className="btn-primary flex items-center gap-2 px-6 py-3.5 text-sm disabled:opacity-50"
                >
                  {scanning && activeTab === 'phone' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {scanning && activeTab === 'phone' ? 'Looking up...' : 'Lookup Number'}
                </button>
              </div>
              {scanning && activeTab === 'phone' && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Analyzing phone number...</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#00ff96] to-[#00f0ff] animate-shimmer" style={{ width: '100%' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Phone Results */}
            {phoneResult && (
              <div className="animate-fade-in-up">
                {/* Risk score banner */}
                <div className={`mb-6 rounded-xl border p-6 backdrop-blur-xl ${getRiskColor(phoneResult.riskScore).border} ${getRiskColor(phoneResult.riskScore).bg} ${getRiskColor(phoneResult.riskScore).glow}`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(10,10,15,0.6)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)]">
                        <span className={`text-3xl font-extrabold ${getRiskColor(phoneResult.riskScore).text}`}>{phoneResult.riskScore}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-white font-mono">{phoneResult.number}</h3>
                          <span className={`glass-badge ${getRiskColor(phoneResult.riskScore).bg} ${getRiskColor(phoneResult.riskScore).text} border ${getRiskColor(phoneResult.riskScore).border}`}>
                            {getRiskColor(phoneResult.riskScore).label} RISK
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                          {phoneResult.valid ? 'Valid format' : 'Invalid format'} • {phoneResult.countryName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Phone Details */}
                  <div className="glass-card-premium rounded-xl p-5">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                      <Phone className="h-4 w-4 text-[#00ff96]" /> Number Details
                    </h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Country', value: phoneResult.countryName || 'Unknown' },
                        { label: 'Country Code', value: phoneResult.countryCode ? `+${phoneResult.countryCode}` : 'Unknown' },
                        { label: 'Location', value: phoneResult.location || 'Unknown' },
                        { label: 'Line Type', value: phoneResult.lineType.toUpperCase(), highlight: phoneResult.lineType === 'voip' },
                        { label: 'Carrier', value: phoneResult.carrier || 'Unknown' },
                        { label: 'Valid Format', value: phoneResult.valid ? 'Yes' : 'No' },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center text-xs border-b border-[rgba(255,255,255,0.05)] pb-2">
                          <span className="text-slate-400">{item.label}</span>
                          <span className={`font-mono ${item.highlight ? 'text-[#ff9500] font-medium' : 'text-white'}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk Factors */}
                  <div className="glass-card-premium rounded-xl p-5">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                      <AlertTriangle className="h-4 w-4 text-[#ff4d6a]" /> Risk Analysis
                    </h4>
                    <div className="space-y-2">
                      {phoneResult.riskFactors.map((factor, idx) => (
                        <div key={idx} className={`flex items-start gap-2 rounded-lg p-2.5 ${
                          factor.includes('VoIP') || factor.includes('fraud') || factor.includes('Nigerian')
                            ? 'bg-[rgba(255,45,85,0.05)] border border-[rgba(255,45,85,0.15)]'
                            : 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]'
                        }`}>
                          {factor.includes('Standard') ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#00ff96] flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="h-3.5 w-3.5 text-[#ff9500] flex-shrink-0 mt-0.5" />
                          )}
                          <span className="text-xs text-slate-300">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Note */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-500">
            Data sourced from RDAP/WHOIS servers and phone validation APIs. Results are for investigative purposes only.
          </p>
        </div>
      </div>
    </section>
  );
}
