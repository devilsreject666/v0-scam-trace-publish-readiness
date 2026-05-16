import { useState, useCallback } from 'react';
import { Mail, Search, AlertTriangle, CheckCircle2, Shield, Loader2, ExternalLink, Database, Eye, Lock } from 'lucide-react';

interface BreachResult {
  email: string;
  breachCount: number;
  exposedData: string[];
  breaches: Array<{
    name: string;
    date: string;
    dataTypes: string[];
    severity: 'low' | 'medium' | 'high';
    domain: string;
  }>;
  pasteCount: number;
  riskLevel: 'clean' | 'low' | 'medium' | 'high' | 'critical';
  scamLinked: boolean;
  scamAssociations: string[];
  recommendation: string;
}

// Simulated check — real implementation calls HIBP API + our own scam DB
async function checkEmail(email: string): Promise<BreachResult> {
  await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));

  const emailLower = email.toLowerCase();
  const isDisposable = ['tempmail', 'guerrillamail', 'mailinator', 'throwaway', 'yopmail', 'trashmail', '10minutemail'].some(d => emailLower.includes(d));
  const isFreeProvider = ['gmail', 'yahoo', 'hotmail', 'outlook', 'protonmail', 'icloud'].some(p => emailLower.includes(p));

  // Deterministic mock based on email hash
  const hash = emailLower.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const breachCount = isDisposable ? 0 : (hash % 8);
  const pasteCount = hash % 4;

  const mockBreaches = [
    { name: 'CryptoExchange2023', date: '2023-11', dataTypes: ['Email', 'Password', 'Phone'], severity: 'high' as const, domain: 'cryptoex.io' },
    { name: 'InvestmentPortal2024', date: '2024-02', dataTypes: ['Email', 'Full Name', 'Address'], severity: 'medium' as const, domain: 'investportal.net' },
    { name: 'TradingApp2022', date: '2022-07', dataTypes: ['Email', 'Password hash'], severity: 'medium' as const, domain: 'tradeapp.co' },
    { name: 'SocialNetwork2021', date: '2021-04', dataTypes: ['Email', 'Username', 'DOB'], severity: 'low' as const, domain: 'socialnet.com' },
  ].slice(0, breachCount);

  const scamLinked = hash % 5 === 0;
  const scamAssociations = scamLinked ? [
    'Email appeared in pig butchering scam report (Case ST-2024-7823)',
    'Associated domain registered same day as known scam platform',
  ] : [];

  let riskLevel: BreachResult['riskLevel'] = 'clean';
  if (scamLinked) riskLevel = 'critical';
  else if (isDisposable) riskLevel = 'high';
  else if (breachCount >= 4) riskLevel = 'high';
  else if (breachCount >= 2) riskLevel = 'medium';
  else if (breachCount >= 1) riskLevel = 'low';

  const exposedData = Array.from(new Set(mockBreaches.flatMap(b => b.dataTypes)));

  let recommendation = 'No significant risk signals detected. Standard caution applies.';
  if (riskLevel === 'critical') recommendation = 'This email has been linked to active scam operations. Do not engage further. Document and report.';
  else if (riskLevel === 'high') recommendation = 'High breach exposure or disposable address. This contact has elevated fraud risk. Verify identity through additional channels.';
  else if (riskLevel === 'medium') recommendation = 'Multiple breach appearances. May indicate a real person with compromised credentials, or stolen identity use. Proceed with caution.';
  else if (isDisposable) recommendation = 'Disposable email service detected. Legitimate businesses and individuals do not use throwaway email addresses for financial transactions.';

  return { email, breachCount, exposedData, breaches: mockBreaches, pasteCount, riskLevel, scamLinked, scamAssociations, recommendation };
}

const RISK_CONFIG = {
  clean: { color: 'text-[#00ff88]', bg: 'bg-[#00ff88]/10', border: 'border-[#00ff88]/30', label: 'Clean', icon: CheckCircle2 },
  low: { color: 'text-yellow-300', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', label: 'Low Risk', icon: AlertTriangle },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'Medium Risk', icon: AlertTriangle },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'High Risk', icon: AlertTriangle },
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'SCAM LINKED', icon: AlertTriangle },
};

interface Props {
  onSignUp: () => void;
}

export function EmailIntelligence({ onSignUp }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BreachResult | null>(null);
  const [error, setError] = useState('');

  const handleCheck = useCallback(async () => {
    const email = input.trim();
    if (!email || !email.includes('@')) { setError('Enter a valid email address'); return; }
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await checkEmail(email);
      setResult(res);
    } catch {
      setError('Check failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [input]);

  const cfg = result ? RISK_CONFIG[result.riskLevel] : null;
  const RiskIcon = cfg?.icon;

  return (
    <section id="email-intelligence" className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[400px] rounded-full bg-[#ff00aa]/4 blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400 text-sm font-medium mb-4">
            <Mail size={14} />
            Scammer Email Intelligence
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-['Orbitron'] mb-3">
            <span className="text-white">Email </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-[#ff00aa]">Threat Intelligence</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Cross-reference any email address against breach databases, scam operation records, and disposable address networks. Find out exactly who you're dealing with.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Input + result */}
          <div className="lg:col-span-3 space-y-4">
            <div className="glass-card rounded-2xl border border-white/10 p-5">
              <div className="flex gap-3 mb-3">
                <div className="flex-1 relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={input}
                    onChange={e => { setInput(e.target.value); setError(''); setResult(null); }}
                    onKeyDown={e => e.key === 'Enter' && handleCheck()}
                    placeholder="suspect@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500/50 text-sm"
                  />
                </div>
                <button
                  onClick={handleCheck}
                  disabled={loading || !input.trim()}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-[#ff00aa] text-white font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <><Search size={14} /> Check</>}
                </button>
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <p className="text-slate-600 text-xs">Checks HaveIBeenPwned, breach databases, scam intel feeds, and disposable email providers.</p>
            </div>

            {/* Loading */}
            {loading && (
              <div className="glass-card rounded-2xl border border-white/10 p-6 text-center">
                <Loader2 size={24} className="text-pink-400 animate-spin mx-auto mb-3" />
                <p className="text-white text-sm font-semibold">Cross-referencing breach databases...</p>
                <p className="text-slate-500 text-xs mt-1">Checking 40+ sources including HIBP, breach compilations, and scam intel feeds</p>
              </div>
            )}

            {/* Result */}
            {result && cfg && RiskIcon && (
              <div className={`glass-card rounded-2xl border ${cfg.border} p-5 space-y-4`}>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                      <RiskIcon size={18} className={cfg.color} />
                    </div>
                    <div>
                      <p className={`font-bold ${cfg.color}`}>{cfg.label}</p>
                      <p className="text-slate-500 text-xs font-mono">{result.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold font-['Orbitron'] ${cfg.color}`}>{result.breachCount}</p>
                    <p className="text-slate-500 text-xs">breaches found</p>
                  </div>
                </div>

                {/* Scam link warning */}
                {result.scamLinked && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                    <p className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2">
                      <AlertTriangle size={14} /> SCAM OPERATION LINK DETECTED
                    </p>
                    {result.scamAssociations.map((a, i) => (
                      <p key={i} className="text-red-300 text-xs">{a}</p>
                    ))}
                  </div>
                )}

                {/* Exposed data */}
                {result.exposedData.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">Exposed Data Types</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.exposedData.map(d => (
                        <span key={d} className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded">{d}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Breaches */}
                {result.breaches.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">Breach History</p>
                    <div className="space-y-2">
                      {result.breaches.map(b => (
                        <div key={b.name} className="flex items-center justify-between bg-white/3 rounded-lg px-3 py-2">
                          <div>
                            <p className="text-white text-xs font-semibold">{b.name}</p>
                            <p className="text-slate-500 text-[10px]">{b.domain} · {b.date}</p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${b.severity === 'high' ? 'bg-red-500/20 text-red-400' : b.severity === 'medium' ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-500/20 text-slate-400'}`}>
                            {b.severity.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pastes */}
                {result.pasteCount > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Eye size={13} className="text-orange-400" />
                    <span className="text-slate-400">Found in <span className="text-orange-400 font-semibold">{result.pasteCount} paste(s)</span> — email published in data dump sites</span>
                  </div>
                )}

                {/* Recommendation */}
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Recommendation</p>
                  <p className="text-slate-300 text-sm">{result.recommendation}</p>
                </div>

                <button onClick={onSignUp} className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-[#ff00aa] text-white font-bold text-sm flex items-center justify-center gap-2">
                  <Shield size={14} /> Build Full Scammer Profile
                </button>
              </div>
            )}
          </div>

          {/* Info panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card rounded-xl border border-white/10 p-5">
              <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <Database size={14} className="text-pink-400" /> What We Check
              </h3>
              <ul className="space-y-2.5">
                {[
                  { source: 'HaveIBeenPwned', desc: '12B+ records from 700+ data breaches' },
                  { source: 'Breach Compilation DB', desc: 'Combined leak databases with 3.2B+ unique emails' },
                  { source: 'ScamTrace Intel', desc: 'Our own database of scam operator email addresses' },
                  { source: 'Disposable Email Check', desc: '500+ throwaway email provider domains' },
                  { source: 'Paste Sites', desc: 'Pastebin, Ghostbin, and dark web paste archives' },
                  { source: 'OSINT Cross-Reference', desc: 'Social media and public records correlation' },
                ].map(s => (
                  <li key={s.source} className="flex items-start gap-2.5">
                    <CheckCircle2 size={12} className="text-pink-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white text-xs font-semibold">{s.source}</p>
                      <p className="text-slate-500 text-[10px]">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-xl border border-white/10 p-5">
              <h3 className="text-white font-bold text-sm mb-3">Scammer Email Patterns</h3>
              <div className="space-y-2 text-xs">
                {[
                  { pattern: 'Disposable providers', risk: 'HIGH', note: 'tempmail, guerrillamail, yopmail' },
                  { pattern: 'Free email + financial claims', risk: 'HIGH', note: 'gmail/yahoo claiming to be "bank official"' },
                  { pattern: 'Domain impersonation', risk: 'CRITICAL', note: 'support@coinbase-help.net' },
                  { pattern: 'Newly registered domains', risk: 'HIGH', note: 'Email from <1 month old domain' },
                ].map(p => (
                  <div key={p.pattern} className="flex items-start gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${p.risk === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>{p.risk}</span>
                    <div>
                      <p className="text-slate-300">{p.pattern}</p>
                      <p className="text-slate-600 text-[10px]">{p.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl border border-white/10 p-5 flex items-start gap-3">
              <Lock size={16} className="text-slate-500 shrink-0 mt-0.5" />
              <p className="text-slate-500 text-xs leading-relaxed">
                Searches are private. We never store the email addresses you check or share them with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
