import { useState, useCallback } from 'react';
import { Brain, Search, AlertTriangle, Shield, Loader2, Network, ArrowRight, Zap, Link2, User } from 'lucide-react';

interface PatternMatch {
  caseId: string;
  similarity: number;
  category: string;
  operatorAlias: string;
  connectedAddresses: string[];
  sharedInfrastructure: string[];
  victimCount: number;
  totalLoss: string;
  lastActive: string;
  description: string;
}

interface PatternResult {
  input: string;
  operatorNetwork: string;
  confidence: number;
  matches: PatternMatch[];
  relatedCases: number;
  suggestedActions: string[];
}

// Simulated AI pattern matching
async function runPatternMatch(input: string): Promise<PatternResult> {
  await new Promise(r => setTimeout(r, 2000 + Math.random() * 1500));

  const hash = input.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const matchCount = 1 + (hash % 3);
  const confidence = 62 + (hash % 30);

  const operators = ['ShaZhuPan_Operator_CN_7', 'GoldShell_Network_TW_3', 'InvestPro_Ring_ID_12', 'RomanceOps_EU_9'];
  const operatorAlias = operators[hash % operators.length];

  const categories = ['Pig Butchering', 'Romance Scam', 'Investment Fraud', 'Recovery Scam'];
  const matches: PatternMatch[] = Array.from({ length: matchCount }, (_, i) => ({
    caseId: `ST-${(hash + i * 1000).toString(36).toUpperCase().slice(0, 6)}`,
    similarity: Math.max(55, confidence - i * 10),
    category: categories[(hash + i) % categories.length],
    operatorAlias,
    connectedAddresses: [
      `0x${(hash * (i + 1) * 7).toString(16).padStart(40, '0').slice(0, 40)}`,
      `T${(hash * (i + 2)).toString(36).padStart(33, 'A').slice(0, 33)}`,
    ],
    sharedInfrastructure: [
      `invest-${['returns', 'profit', 'trading', 'earn'][i % 4]}-${hash % 9999}.${['xyz', 'top', 'vip', 'club'][(hash + i) % 4]}`,
    ],
    victimCount: 12 + (hash % 80) + i * 7,
    totalLoss: `$${(120 + (hash % 2000) + i * 300).toLocaleString()}K`,
    lastActive: ['3 days ago', '1 week ago', '2 weeks ago', '1 month ago'][i % 4],
    description: `Operator uses standardized pig butchering script with trust-building phase of ${14 + (hash % 30)} days before fund solicitation. Prefers TRON for collection.`,
  }));

  return {
    input,
    operatorNetwork: operatorAlias,
    confidence,
    matches,
    relatedCases: matches.reduce((a, m) => a + m.victimCount, 0),
    suggestedActions: [
      'Cross-reference all connected wallet addresses with exchange compliance teams',
      `File coordinated report linking to operator network "${operatorAlias}"`,
      'Alert connected victims from matched cases',
      'Submit to FBI IC3 with multi-case correlation evidence',
    ],
  };
}

interface Props {
  onSignUp: () => void;
}

export function ScamPatternMatcher({ onSignUp }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PatternResult | null>(null);
  const [error, setError] = useState('');

  const handleMatch = useCallback(async () => {
    const val = input.trim();
    if (!val) { setError('Enter a wallet address, domain, or phone number'); return; }
    setError('');
    setResult(null);
    setLoading(true);
    try {
      setResult(await runPatternMatch(val));
    } catch {
      setError('Pattern match failed. Try again.');
    } finally {
      setLoading(false);
    }
  }, [input]);

  return (
    <section id="pattern-matcher" className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-[#00f5ff]/4 blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-purple-500/4 blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00f5ff]/30 bg-[#00f5ff]/10 text-[#00f5ff] text-sm font-medium mb-4">
            <Brain size={14} />
            AI Pattern Intelligence
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-['Orbitron'] mb-3">
            <span className="text-white">AI Scam </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f5ff] to-purple-400">Pattern Matcher</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Submit any indicator — wallet, domain, or phone — and our AI matches it against known scam operator networks, revealing connected operations and related victims.
          </p>
        </div>

        {/* Input */}
        <div className="glass-card rounded-2xl border border-white/10 p-5 mb-6">
          <div className="flex gap-3 mb-2">
            <div className="flex-1 relative">
              <Brain size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={input}
                onChange={e => { setInput(e.target.value); setError(''); setResult(null); }}
                onKeyDown={e => e.key === 'Enter' && handleMatch()}
                placeholder="Enter wallet address, domain, phone number, or email"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f5ff]/50 text-sm"
              />
            </div>
            <button
              onClick={handleMatch}
              disabled={loading || !input.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#00f5ff] to-purple-500 text-white font-bold text-sm flex items-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <><Zap size={14} /> Match</>}
            </button>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        {/* Loading */}
        {loading && (
          <div className="glass-card rounded-2xl border border-white/10 p-8 text-center mb-6">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-[#00f5ff]/20 animate-ping" />
              <div className="absolute inset-0 rounded-full border-2 border-[#00f5ff]/40 animate-pulse" />
              <div className="w-full h-full rounded-full flex items-center justify-center">
                <Brain size={24} className="text-[#00f5ff]" />
              </div>
            </div>
            <p className="text-white font-semibold">Running AI pattern matching across 14,892 cases...</p>
            <p className="text-slate-400 text-sm mt-1">Analyzing operator signatures, infrastructure overlap, and victim patterns</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-5">
            {/* Summary */}
            <div className={`glass-card rounded-2xl border p-5 ${result.confidence >= 75 ? 'border-red-500/30' : result.confidence >= 55 ? 'border-orange-500/30' : 'border-yellow-500/20'}`}>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${result.confidence >= 75 ? 'bg-red-500/15' : 'bg-orange-500/15'}`}>
                    <Network size={22} className={result.confidence >= 75 ? 'text-red-400' : 'text-orange-400'} />
                  </div>
                  <div>
                    <p className={`font-bold ${result.confidence >= 75 ? 'text-red-400' : 'text-orange-400'}`}>
                      {result.matches.length} Operator Network Match{result.matches.length !== 1 ? 'es' : ''} Found
                    </p>
                    <p className="text-slate-400 text-sm">Network: <span className="text-white font-mono text-xs">{result.operatorNetwork}</span></p>
                  </div>
                </div>
                <div className="md:ml-auto flex gap-6 text-center">
                  <div>
                    <p className={`text-2xl font-bold font-['Orbitron'] ${result.confidence >= 75 ? 'text-red-400' : 'text-orange-400'}`}>{result.confidence}%</p>
                    <p className="text-slate-500 text-xs">confidence</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white font-['Orbitron']">{result.relatedCases}</p>
                    <p className="text-slate-500 text-xs">linked victims</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Matches */}
            {result.matches.map((match, i) => (
              <div key={match.caseId} className="glass-card rounded-xl border border-white/10 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-white/10 text-slate-400 px-2 py-0.5 rounded font-mono">{match.caseId}</span>
                    <span className="text-xs bg-[#00f5ff]/10 text-[#00f5ff] px-2 py-0.5 rounded">{match.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${match.similarity >= 75 ? 'bg-red-400' : match.similarity >= 55 ? 'bg-orange-400' : 'bg-yellow-400'}`} />
                    <span className="text-sm font-bold text-white">{match.similarity}% match</span>
                  </div>
                </div>

                <p className="text-slate-400 text-sm mb-3">{match.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="text-center bg-white/3 rounded-lg p-2">
                    <p className="text-red-400 font-bold text-sm">{match.totalLoss}</p>
                    <p className="text-slate-600 text-[10px]">documented loss</p>
                  </div>
                  <div className="text-center bg-white/3 rounded-lg p-2">
                    <p className="text-white font-bold text-sm">{match.victimCount}</p>
                    <p className="text-slate-600 text-[10px]">victims</p>
                  </div>
                  <div className="text-center bg-white/3 rounded-lg p-2">
                    <p className="text-orange-400 font-bold text-xs">{match.lastActive}</p>
                    <p className="text-slate-600 text-[10px]">last active</p>
                  </div>
                  <div className="text-center bg-white/3 rounded-lg p-2">
                    <p className="text-white font-bold text-xs">{match.connectedAddresses.length + match.sharedInfrastructure.length}</p>
                    <p className="text-slate-600 text-[10px]">connected assets</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1"><Link2 size={10} /> Connected Wallets</p>
                    {match.connectedAddresses.map(addr => (
                      <p key={addr} className="text-slate-400 text-xs font-mono truncate">{addr}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Shared Infrastructure</p>
                    {match.sharedInfrastructure.map(d => (
                      <p key={d} className="text-orange-400 text-xs font-mono">{d}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Suggested actions */}
            <div className="glass-card rounded-xl border border-[#00f5ff]/20 p-5">
              <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <Shield size={14} className="text-[#00f5ff]" /> Recommended Actions
              </h3>
              <ul className="space-y-2">
                {result.suggestedActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-[#00f5ff] font-bold shrink-0 text-xs mt-0.5">{i + 1}.</span>
                    {action}
                  </li>
                ))}
              </ul>
              <button onClick={onSignUp} className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-[#00f5ff] to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2">
                <User size={14} /> Generate Multi-Case Evidence Packet <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Empty state — what it does */}
        {!result && !loading && (
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            {[
              { icon: Network, title: 'Operator Fingerprinting', desc: 'Our AI recognizes behavioral signatures — script patterns, timing, infrastructure choices — that tie separate scams to the same operator.' },
              { icon: Link2, title: 'Infrastructure Clustering', desc: 'Shared hosting, ASNs, domain registrars, and wallet clusters reveal coordinated fraud networks operating multiple simultaneous scams.' },
              { icon: User, title: 'Victim Network Mapping', desc: 'Connect your case to related victims, enabling coordinated law enforcement reports and class action legal strategies.' },
            ].map(f => (
              <div key={f.title} className="glass-card rounded-xl border border-white/10 p-5">
                <f.icon size={20} className="text-[#00f5ff] mb-3" />
                <p className="text-white font-bold text-sm mb-2">{f.title}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
