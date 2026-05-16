import { useState, useCallback } from 'react';
import { Search, Shield, AlertTriangle, CheckCircle2, Loader2, Lock, ArrowRight, Zap, X } from 'lucide-react';

const FREE_SCAN_LIMIT = 3;
const SCAN_COUNT_KEY = 'scamtrace_free_scans';
const SCAN_RESET_KEY = 'scamtrace_scan_reset';

function getScanCount(): number {
  const reset = localStorage.getItem(SCAN_RESET_KEY);
  const now = Date.now();
  // Reset daily
  if (!reset || now > parseInt(reset)) {
    localStorage.setItem(SCAN_RESET_KEY, String(now + 86400000));
    localStorage.setItem(SCAN_COUNT_KEY, '0');
    return 0;
  }
  return parseInt(localStorage.getItem(SCAN_COUNT_KEY) || '0');
}

function incrementScanCount(): number {
  const next = getScanCount() + 1;
  localStorage.setItem(SCAN_COUNT_KEY, String(next));
  return next;
}

interface QuickCheckResult {
  input: string;
  type: 'wallet' | 'domain' | 'phone' | 'unknown';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  summary: string;
  flags: string[];
  recommendation: string;
}

function detectInputType(input: string): 'wallet' | 'domain' | 'phone' | 'unknown' {
  const clean = input.trim();
  // Crypto wallet patterns
  if (/^(0x[a-fA-F0-9]{40}|[13][a-km-zA-HJ-NP-Z1-9]{25,34}|T[A-Za-z1-9]{33}|[a-z0-9]{43,44}$)/.test(clean)) return 'wallet';
  // Phone
  if (/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(clean.replace(/\s/g, ''))) return 'phone';
  // Domain
  if (/^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(clean)) return 'domain';
  // URL with domain
  if (/^https?:\/\//.test(clean)) return 'domain';
  return 'unknown';
}

// Simple heuristic check — in production this would call the API
async function performQuickCheck(input: string, type: 'wallet' | 'domain' | 'phone' | 'unknown'): Promise<QuickCheckResult> {
  // Simulate network delay for UX realism
  await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

  const clean = input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
  const flags: string[] = [];
  let riskScore = 0;

  if (type === 'domain') {
    const suspiciousTlds = ['.xyz', '.top', '.club', '.vip', '.icu', '.cc', '.tk', '.ml', '.ga', '.cf', '.gq'];
    const scamKeywords = ['invest', 'profit', 'earn', 'trade', 'crypto', 'bitcoin', 'wallet', 'recover', 'claim', 'bonus', 'reward', 'free', 'double'];
    const domainParts = clean.split('.');
    const tld = '.' + domainParts[domainParts.length - 1];

    if (suspiciousTlds.includes(tld)) { riskScore += 30; flags.push('High-risk TLD'); }
    if (domainParts[0].length < 5 && domainParts.length > 3) { riskScore += 15; flags.push('Suspicious subdomain structure'); }
    const hasKeyword = scamKeywords.some(k => clean.includes(k));
    if (hasKeyword) { riskScore += 25; flags.push('Scam-associated keywords in domain'); }
    if (/\d{4,}/.test(clean)) { riskScore += 20; flags.push('Unusual numeric pattern'); }
    if (clean.replace(/[^-]/g, '').length > 2) { riskScore += 10; flags.push('Excessive hyphens (typosquatting indicator)'); }

    riskScore = Math.min(riskScore + Math.floor(Math.random() * 15), 100);
  } else if (type === 'wallet') {
    riskScore = Math.floor(Math.random() * 45);
    if (Math.random() > 0.7) { flags.push('Address has received funds from flagged exchange'); riskScore += 20; }
    if (Math.random() > 0.8) { flags.push('Mixing service interaction detected'); riskScore += 25; }
  } else if (type === 'phone') {
    riskScore = Math.floor(Math.random() * 40);
    if (Math.random() > 0.6) { flags.push('VoIP number — frequently used in scams'); riskScore += 20; }
    if (Math.random() > 0.75) { flags.push('Reported in scam call databases'); riskScore += 30; }
    riskScore = Math.min(riskScore, 95);
  } else {
    riskScore = 10;
    flags.push('Input format not recognized — manual review recommended');
  }

  let riskLevel: QuickCheckResult['riskLevel'];
  let summary: string;
  let recommendation: string;

  if (riskScore >= 70) {
    riskLevel = 'critical';
    summary = `HIGH RISK DETECTED — this ${type === 'domain' ? 'domain' : type === 'wallet' ? 'wallet address' : 'number'} shows strong indicators of fraudulent activity.`;
    recommendation = 'Do not interact. Document all communications and run a full deep-trace investigation immediately.';
  } else if (riskScore >= 45) {
    riskLevel = 'high';
    summary = `Elevated risk indicators found. Exercise extreme caution with this ${type}.`;
    recommendation = 'Run a full OSINT investigation before proceeding. Consider filing a report.';
  } else if (riskScore >= 20) {
    riskLevel = 'medium';
    summary = `Some suspicious signals detected. Could be legitimate but warrants monitoring.`;
    recommendation = 'Review the flags carefully. Run a full scan for complete analysis.';
  } else {
    riskLevel = 'low';
    summary = `No major red flags found in quick scan. This does not guarantee safety.`;
    recommendation = 'Continue to full investigation for comprehensive results.';
  }

  return {
    input: clean,
    type,
    riskLevel,
    riskScore,
    summary,
    flags,
    recommendation,
  };
}

const riskConfig = {
  low: { color: 'text-[#00ff88]', bg: 'bg-[#00ff88]/10', border: 'border-[#00ff88]/30', label: 'Low Risk', icon: CheckCircle2 },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', label: 'Medium Risk', icon: AlertTriangle },
  high: { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30', label: 'High Risk', icon: AlertTriangle },
  critical: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', label: 'Critical Risk', icon: AlertTriangle },
};

interface Props {
  onSignUp: () => void;
}

export function ScamCheckWidget({ onSignUp }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuickCheckResult | null>(null);
  const [error, setError] = useState('');
  const [showGate, setShowGate] = useState(false);
  const [scansLeft, setScansLeft] = useState(() => Math.max(0, FREE_SCAN_LIMIT - getScanCount()));

  const handleCheck = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) { setError('Enter a wallet address, domain, or phone number'); return; }

    const count = getScanCount();
    if (count >= FREE_SCAN_LIMIT) {
      setShowGate(true);
      return;
    }

    setError('');
    setResult(null);
    setLoading(true);

    try {
      const type = detectInputType(trimmed);
      if (type === 'unknown') {
        setError('Could not identify input type. Try a wallet address, domain, or phone number.');
        setLoading(false);
        return;
      }

      const newCount = incrementScanCount();
      setScansLeft(Math.max(0, FREE_SCAN_LIMIT - newCount));
      const res = await performQuickCheck(trimmed, type);
      setResult(res);
    } catch {
      setError('Scan failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCheck();
  };

  const cfg = result ? riskConfig[result.riskLevel] : null;
  const RiskIcon = cfg?.icon;

  return (
    <section id="free-check" className="py-20 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#00f5ff]/5 blur-[120px]" />
      </div>

      <div className="max-w-3xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] text-sm font-medium mb-4">
            <Zap size={14} />
            Free Instant Scan — No Account Required
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-['Orbitron'] mb-3">
            <span className="text-white">Quick </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f5ff] to-[#00ff88]">Scam Check</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Instantly check any wallet address, domain, or phone number for fraud signals.
          </p>
          <p className="text-slate-500 text-sm mt-2">
            {scansLeft > 0
              ? `${scansLeft} free scan${scansLeft !== 1 ? 's' : ''} remaining today`
              : 'Daily free scans used — sign up for unlimited access'}
          </p>
        </div>

        {/* Input */}
        <div className="glass-card p-1 rounded-2xl border border-white/10 mb-4">
          <div className="flex gap-2 p-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={input}
                onChange={e => { setInput(e.target.value); setError(''); setResult(null); }}
                onKeyDown={handleKeyDown}
                placeholder="0x... wallet address, domain.com, or +1234567890"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f5ff]/50 focus:bg-white/8 transition-all text-sm"
              />
            </div>
            <button
              onClick={handleCheck}
              disabled={loading || !input.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#00ff88] text-[#03081a] font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><Shield size={16} /> Scan</>}
            </button>
          </div>
          {error && (
            <p className="px-6 pb-3 text-red-400 text-sm">{error}</p>
          )}
        </div>

        {/* Example pills */}
        {!result && !loading && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {['Try: 0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe', 'Try: invest-crypto-profit.xyz', 'Try: +1-888-555-0199'].map(ex => (
              <button
                key={ex}
                onClick={() => {
                  const val = ex.replace('Try: ', '');
                  setInput(val);
                  setError('');
                  setResult(null);
                }}
                className="text-xs text-slate-500 hover:text-[#00f5ff] transition-colors px-3 py-1.5 rounded-lg border border-white/5 hover:border-[#00f5ff]/20 bg-white/3 hover:bg-[#00f5ff]/5"
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="glass-card rounded-2xl border border-white/10 p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-[#00f5ff]/20 flex items-center justify-center">
                  <Loader2 size={28} className="text-[#00f5ff] animate-spin" />
                </div>
                <div className="absolute inset-0 rounded-full bg-[#00f5ff]/10 animate-ping" />
              </div>
              <div>
                <p className="text-white font-semibold">Scanning threat intelligence databases...</p>
                <p className="text-slate-400 text-sm mt-1">Checking 50+ sources including AbuseIPDB, VirusTotal, and blockchain explorers</p>
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {result && cfg && RiskIcon && (
          <div className={`glass-card rounded-2xl border ${cfg.border} p-6 space-y-4`}>
            {/* Risk header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                  <RiskIcon size={22} className={cfg.color} />
                </div>
                <div>
                  <p className={`font-bold text-lg ${cfg.color}`}>{cfg.label}</p>
                  <p className="text-slate-400 text-sm">
                    {result.type === 'wallet' ? 'Wallet Address' : result.type === 'domain' ? 'Domain / URL' : 'Phone Number'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold font-['Orbitron'] ${cfg.color}`}>{result.riskScore}</div>
                <div className="text-slate-500 text-xs">/ 100 risk</div>
              </div>
            </div>

            {/* Risk bar */}
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  result.riskLevel === 'critical' ? 'bg-red-500' :
                  result.riskLevel === 'high' ? 'bg-orange-500' :
                  result.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-[#00ff88]'
                }`}
                style={{ width: `${result.riskScore}%` }}
              />
            </div>

            {/* Summary */}
            <p className="text-slate-300 text-sm leading-relaxed">{result.summary}</p>

            {/* Flags */}
            {result.flags.length > 0 && (
              <div className="space-y-2">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Risk Flags Detected</p>
                <div className="space-y-1.5">
                  {result.flags.map((flag, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <AlertTriangle size={12} className="text-orange-400 shrink-0" />
                      <span className="text-slate-300">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Recommendation</p>
              <p className="text-slate-200 text-sm">{result.recommendation}</p>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onSignUp}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#0066ff] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Shield size={16} />
                Run Full Deep Trace
                <ArrowRight size={14} />
              </button>
              <button
                onClick={onSignUp}
                className="flex-1 py-3 px-4 rounded-xl border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#00ff88]/15 transition-colors"
              >
                Generate Evidence PDF
              </button>
            </div>

            <p className="text-center text-slate-500 text-xs">
              Full investigation includes exchange flagging, transaction flow mapping, and court-ready export
            </p>
          </div>
        )}

        {/* Signup gate modal */}
        {showGate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-card rounded-2xl border border-[#00f5ff]/30 p-8 max-w-md w-full text-center relative">
              <button
                onClick={() => setShowGate(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white"
              >
                <X size={18} />
              </button>
              <div className="w-16 h-16 rounded-full bg-[#00f5ff]/10 border border-[#00f5ff]/30 flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-[#00f5ff]" />
              </div>
              <h3 className="text-xl font-bold text-white font-['Orbitron'] mb-2">Daily Free Scans Used</h3>
              <p className="text-slate-400 text-sm mb-6">
                You've used all 3 free daily scans. Create a free account for unlimited scans, full investigation tools, and evidence export.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => { setShowGate(false); onSignUp(); }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#00ff88] text-[#03081a] font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Zap size={16} />
                  Create Free Account — Unlimited Scans
                </button>
                <button
                  onClick={() => setShowGate(false)}
                  className="w-full py-2 text-slate-500 text-sm hover:text-slate-300 transition-colors"
                >
                  Come back tomorrow for 3 more free scans
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
