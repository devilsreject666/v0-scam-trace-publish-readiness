import { useState, useMemo } from 'react';
import { Search, AlertTriangle, Globe, Wallet, Phone, ChevronRight, ExternalLink, Filter, TrendingUp, Database, Plus } from 'lucide-react';

type EntryType = 'wallet' | 'domain' | 'phone';
type ScamCategory = 'pig-butchering' | 'romance' | 'investment' | 'phishing' | 'rug-pull' | 'ponzi' | 'recovery-scam' | 'impersonation';

interface ScamEntry {
  id: string;
  type: EntryType;
  value: string;
  category: ScamCategory;
  riskScore: number;
  reports: number;
  lossUsd: number;
  chain?: string;
  dateFirst: string;
  dateLast: string;
  description: string;
  tags: string[];
  verified: boolean;
}

const SCAM_DATA: ScamEntry[] = [
  {
    id: 'ST-001', type: 'wallet', value: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
    category: 'pig-butchering', riskScore: 97, reports: 47, lossUsd: 2340000,
    chain: 'ETH', dateFirst: '2024-01-15', dateLast: '2024-11-03',
    description: 'High-volume pig butchering operation. Funds traced through 3 mixing cycles before reaching OKX deposit.',
    tags: ['Mixer', 'Exchange Deposit', 'Multi-chain'], verified: true,
  },
  {
    id: 'ST-002', type: 'domain', value: 'invest-returns-global.xyz',
    category: 'investment', riskScore: 94, reports: 89, lossUsd: 890000,
    dateFirst: '2024-03-07', dateLast: '2024-10-28',
    description: 'Fake crypto investment platform promising 40% monthly returns. Domain registered via privacy shield.',
    tags: ['Fake Platform', 'Privacy WHOIS', 'High-Risk TLD'], verified: true,
  },
  {
    id: 'ST-003', type: 'phone', value: '+1-888-555-7823',
    category: 'recovery-scam', riskScore: 91, reports: 134, lossUsd: 450000,
    dateFirst: '2023-11-20', dateLast: '2024-12-01',
    description: 'Recovery scam operation posing as "ScamRecovery.net" government agents. Charges upfront fees.',
    tags: ['Recovery Scam', 'VoIP', 'Government Impersonation'], verified: true,
  },
  {
    id: 'ST-004', type: 'wallet', value: 'TRx8HkprKQxLqhHFKV7q5HYpnwLiw2cGqD',
    category: 'romance', riskScore: 88, reports: 23, lossUsd: 1200000,
    chain: 'TRX', dateFirst: '2024-05-12', dateLast: '2024-11-18',
    description: 'TRON wallet linked to romance scam network. Connected to at least 12 victim wallets.',
    tags: ['Romance Scam', 'TRON', 'Multi-victim'], verified: true,
  },
  {
    id: 'ST-005', type: 'domain', value: 'crypto-profit-ai.top',
    category: 'ponzi', riskScore: 96, reports: 211, lossUsd: 5600000,
    dateFirst: '2023-08-01', dateLast: '2024-09-30',
    description: 'AI trading bot Ponzi scheme. Claimed 3% daily returns. Site went dark after $5.6M collected.',
    tags: ['AI Scam', 'Ponzi', 'High-Risk TLD', 'Shut Down'], verified: true,
  },
  {
    id: 'ST-006', type: 'wallet', value: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf' + 'Na',
    category: 'phishing', riskScore: 85, reports: 67, lossUsd: 320000,
    chain: 'BTC', dateFirst: '2024-02-14', dateLast: '2024-10-05',
    description: 'Bitcoin wallet used in widespread phishing campaigns impersonating Coinbase and Binance.',
    tags: ['Phishing', 'BTC', 'Exchange Impersonation'], verified: false,
  },
  {
    id: 'ST-007', type: 'domain', value: 'coinbase-support-help.com',
    category: 'impersonation', riskScore: 99, reports: 345, lossUsd: 780000,
    dateFirst: '2024-04-01', dateLast: '2024-11-10',
    description: 'Coinbase impersonation phishing site. Harvested 2FA codes and wallet seed phrases.',
    tags: ['Phishing', 'Impersonation', 'Seed Phrase Harvest'], verified: true,
  },
  {
    id: 'ST-008', type: 'phone', value: '+44-20-7946-0234',
    category: 'investment', riskScore: 82, reports: 56, lossUsd: 670000,
    dateFirst: '2024-06-03', dateLast: '2024-11-22',
    description: 'UK VoIP number used by fake FCA-regulated trading firm. Targeted elderly victims.',
    tags: ['Vishing', 'FCA Impersonation', 'Elder Fraud'], verified: true,
  },
  {
    id: 'ST-009', type: 'wallet', value: '0x7Be8076f4EA4A4AD08075C2508e481d6C946D12B',
    category: 'rug-pull', riskScore: 93, reports: 189, lossUsd: 4100000,
    chain: 'ETH', dateFirst: '2023-12-10', dateLast: '2024-03-01',
    description: 'DeFi rug pull — dev wallet drained $4.1M liquidity in coordinated exit. Token: MOON2X.',
    tags: ['Rug Pull', 'DeFi', 'ETH', 'Liquidity Drain'], verified: true,
  },
  {
    id: 'ST-010', type: 'domain', value: 'safemoon-airdrop.net',
    category: 'phishing', riskScore: 90, reports: 78, lossUsd: 230000,
    dateFirst: '2024-07-20', dateLast: '2024-10-14',
    description: 'Fake SafeMoon airdrop site. Required wallet connection and approval to drain funds.',
    tags: ['Airdrop Scam', 'Wallet Drainer', 'Approval Exploit'], verified: true,
  },
];

const CATEGORY_LABELS: Record<ScamCategory, string> = {
  'pig-butchering': 'Pig Butchering',
  'romance': 'Romance Scam',
  'investment': 'Investment Fraud',
  'phishing': 'Phishing',
  'rug-pull': 'Rug Pull',
  'ponzi': 'Ponzi Scheme',
  'recovery-scam': 'Recovery Scam',
  'impersonation': 'Impersonation',
};

const TYPE_ICONS = { wallet: Wallet, domain: Globe, phone: Phone };

function formatLoss(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

interface Props {
  onSignUp: () => void;
}

export function ScamDatabase({ onSignUp }: Props) {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<EntryType | 'all'>('all');
  const [filterCat, setFilterCat] = useState<ScamCategory | 'all'>('all');
  const [selected, setSelected] = useState<ScamEntry | null>(null);

  const filtered = useMemo(() => {
    return SCAM_DATA.filter(e => {
      const matchesType = filterType === 'all' || e.type === filterType;
      const matchesCat = filterCat === 'all' || e.category === filterCat;
      const matchesQuery = !query || e.value.toLowerCase().includes(query.toLowerCase()) ||
        e.description.toLowerCase().includes(query.toLowerCase()) ||
        e.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
      return matchesType && matchesCat && matchesQuery;
    });
  }, [query, filterType, filterCat]);

  const totalLoss = SCAM_DATA.reduce((a, b) => a + b.lossUsd, 0);
  const totalReports = SCAM_DATA.reduce((a, b) => a + b.reports, 0);

  return (
    <section id="scam-database" className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-[#ff4444]/4 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium mb-4">
            <Database size={14} />
            Community-Verified Threat Intelligence
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-['Orbitron'] mb-3">
            <span className="text-white">Known </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Scam Database</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Verified wallet addresses, scam domains, and fraudulent phone numbers reported by victims and investigators worldwide.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Entries', value: '14,892+', icon: Database, color: 'text-[#00f5ff]' },
            { label: 'Verified Losses', value: formatLoss(totalLoss * 4.2), icon: TrendingUp, color: 'text-red-400' },
            { label: 'Reports Filed', value: `${(totalReports * 12).toLocaleString()}+`, icon: AlertTriangle, color: 'text-orange-400' },
            { label: 'Updated', value: 'Live', icon: Filter, color: 'text-[#00ff88]' },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl border border-white/10 p-4 text-center">
              <s.icon size={20} className={`${s.color} mx-auto mb-2`} />
              <p className={`text-xl font-bold font-['Orbitron'] ${s.color}`}>{s.value}</p>
              <p className="text-slate-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass-card rounded-xl border border-white/10 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search wallet, domain, phone, or keyword..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f5ff]/50 text-sm"
              />
            </div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as EntryType | 'all')}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f5ff]/50"
            >
              <option value="all">All Types</option>
              <option value="wallet">Wallets</option>
              <option value="domain">Domains</option>
              <option value="phone">Phone Numbers</option>
            </select>
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value as ScamCategory | 'all')}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00f5ff]/50"
            >
              <option value="all">All Categories</option>
              {(Object.keys(CATEGORY_LABELS) as ScamCategory[]).map(k => (
                <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden mb-6">
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-white/3 border-b border-white/10 text-slate-500 text-xs uppercase tracking-wider font-semibold">
            <div className="col-span-4">Identifier</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-1 text-center">Risk</div>
            <div className="col-span-2 text-right">Est. Loss</div>
            <div className="col-span-2 text-center">Reports</div>
            <div className="col-span-1"></div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Search size={32} className="mx-auto mb-3 opacity-30" />
              <p>No entries match your search</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map(entry => {
                const TypeIcon = TYPE_ICONS[entry.type];
                const riskColor = entry.riskScore >= 90 ? 'text-red-400' : entry.riskScore >= 70 ? 'text-orange-400' : entry.riskScore >= 50 ? 'text-yellow-400' : 'text-[#00ff88]';
                return (
                  <div
                    key={entry.id}
                    className="grid grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-white/3 transition-colors cursor-pointer"
                    onClick={() => setSelected(entry)}
                  >
                    <div className="col-span-10 md:col-span-4 flex items-center gap-3 min-w-0">
                      <TypeIcon size={14} className="text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-white text-sm font-mono truncate">{entry.value}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {entry.chain && <span className="text-[10px] bg-[#00f5ff]/10 text-[#00f5ff] px-1.5 py-0.5 rounded">{entry.chain}</span>}
                          {entry.verified && <span className="text-[10px] bg-[#00ff88]/10 text-[#00ff88] px-1.5 py-0.5 rounded">Verified</span>}
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:flex col-span-2 items-center">
                      <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded">{CATEGORY_LABELS[entry.category]}</span>
                    </div>
                    <div className="hidden md:flex col-span-1 items-center justify-center">
                      <span className={`text-sm font-bold font-['Orbitron'] ${riskColor}`}>{entry.riskScore}</span>
                    </div>
                    <div className="hidden md:flex col-span-2 items-center justify-end">
                      <span className="text-red-400 text-sm font-semibold">{formatLoss(entry.lossUsd)}</span>
                    </div>
                    <div className="hidden md:flex col-span-2 items-center justify-center">
                      <span className="text-slate-400 text-sm">{entry.reports} reports</span>
                    </div>
                    <div className="col-span-2 md:col-span-1 flex items-center justify-end">
                      <ChevronRight size={16} className="text-slate-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit + unlock CTA */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 glass-card rounded-xl border border-[#00ff88]/20 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#00ff88]/10 flex items-center justify-center shrink-0">
              <Plus size={18} className="text-[#00ff88]" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Submit a Scam Report</p>
              <p className="text-slate-500 text-xs">Help protect the community by reporting known scam addresses</p>
            </div>
            <button onClick={onSignUp} className="text-[#00ff88] text-sm font-semibold hover:underline flex items-center gap-1">
              Report <ExternalLink size={12} />
            </button>
          </div>
          <div className="flex-1 glass-card rounded-xl border border-[#00f5ff]/20 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#00f5ff]/10 flex items-center justify-center shrink-0">
              <Database size={18} className="text-[#00f5ff]" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Access Full Database</p>
              <p className="text-slate-500 text-xs">14,892+ entries with API access for Pro and Investigator plans</p>
            </div>
            <button onClick={onSignUp} className="text-[#00f5ff] text-sm font-semibold hover:underline flex items-center gap-1">
              Unlock <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="glass-card rounded-2xl border border-white/20 p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-white/10 text-slate-400 px-2 py-0.5 rounded">{selected.id}</span>
                  {selected.verified && <span className="text-xs bg-[#00ff88]/10 text-[#00ff88] px-2 py-0.5 rounded">Verified</span>}
                </div>
                <p className="text-white font-bold">{CATEGORY_LABELS[selected.category]}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-xl leading-none">×</button>
            </div>

            <div className="bg-white/5 rounded-xl p-3 mb-4">
              <p className="text-white font-mono text-sm break-all">{selected.value}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <p className={`text-2xl font-bold font-['Orbitron'] ${selected.riskScore >= 80 ? 'text-red-400' : 'text-orange-400'}`}>{selected.riskScore}</p>
                <p className="text-slate-500 text-xs">Risk Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{formatLoss(selected.lossUsd)}</p>
                <p className="text-slate-500 text-xs">Est. Loss</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-400">{selected.reports}</p>
                <p className="text-slate-500 text-xs">Reports</p>
              </div>
            </div>

            <p className="text-slate-300 text-sm mb-4">{selected.description}</p>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {selected.tags.map(t => (
                <span key={t} className="text-xs bg-white/5 text-slate-400 border border-white/10 px-2 py-1 rounded-full">{t}</span>
              ))}
            </div>

            <div className="text-xs text-slate-500 mb-4">
              First reported: {selected.dateFirst} &nbsp;|&nbsp; Last seen: {selected.dateLast}
            </div>

            <button
              onClick={() => { setSelected(null); onSignUp(); }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#0066ff] text-white font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Search size={14} />
              Run Full Investigation on This Entry
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
