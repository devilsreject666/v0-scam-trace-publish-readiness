import { useState } from 'react';
import {
  Shield, Users, FileText, AlertTriangle, TrendingUp,
  CheckCircle2, XCircle, Eye, Download, Search,
  DollarSign, Globe, BarChart3, Clock, Activity, Flag,
  ChevronDown, Wallet, Filter
} from 'lucide-react';

interface ScamCase {
  id: string;
  type: string;
  status: 'pending' | 'reviewed' | 'confirmed' | 'rejected';
  reporter: string;
  date: string;
  loss: string;
  entities: number;
  risk: 'critical' | 'high' | 'medium';
  wallets: number;
}

const mockCases: ScamCase[] = [
  { id: 'SC-8K2F', type: 'Pig Butchering', status: 'pending', reporter: 'anonymous_user_42', date: '2024-01-15', loss: '$45,000', entities: 8, risk: 'critical', wallets: 3 },
  { id: 'SC-9J3X', type: 'Phishing', status: 'pending', reporter: 'sarah_m_inv', date: '2024-01-15', loss: '$12,500', entities: 5, risk: 'high', wallets: 1 },
  { id: 'SC-7H1W', type: 'Crypto Investment', status: 'reviewed', reporter: 'detective_chen', date: '2024-01-14', loss: '$78,000', entities: 12, risk: 'critical', wallets: 5 },
  { id: 'SC-6G4V', type: 'Romance Scam', status: 'confirmed', reporter: 'fraud_team_eu', date: '2024-01-14', loss: '$23,000', entities: 6, risk: 'high', wallets: 2 },
  { id: 'SC-5F2U', type: 'Rug Pull', status: 'confirmed', reporter: 'crypto_watch', date: '2024-01-13', loss: '$156,000', entities: 15, risk: 'critical', wallets: 8 },
  { id: 'SC-4E8T', type: 'Impersonation', status: 'rejected', reporter: 'test_user', date: '2024-01-13', loss: '$0', entities: 1, risk: 'medium', wallets: 0 },
  { id: 'SC-3D6S', type: 'Marketplace Fraud', status: 'reviewed', reporter: 'buyer_protect', date: '2024-01-12', loss: '$3,200', entities: 4, risk: 'medium', wallets: 1 },
  { id: 'SC-2C4R', type: 'Ponzi Scheme', status: 'confirmed', reporter: 'fbi_liaison', date: '2024-01-11', loss: '$890,000', entities: 28, risk: 'critical', wallets: 14 },
];

const statusStyles = {
  pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  reviewed: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  confirmed: { bg: 'bg-cyber-green/10', text: 'text-cyber-green', border: 'border-cyber-green/20' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
};

type AdminTab = 'overview' | 'reports' | 'patterns' | 'intelligence';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<ScamCase | null>(null);

  const filteredCases = mockCases.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchFilter && !c.id.toLowerCase().includes(searchFilter.toLowerCase()) && !c.type.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    return true;
  });

  const stats = {
    totalCases: mockCases.length,
    pending: mockCases.filter(c => c.status === 'pending').length,
    confirmed: mockCases.filter(c => c.status === 'confirmed').length,
    totalLoss: '$1.2M',
    walletsTracked: mockCases.reduce((a, c) => a + c.wallets, 0),
    entitiesExtracted: mockCases.reduce((a, c) => a + c.entities, 0),
  };

  return (
    <section id="admin" className="relative py-24 grid-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-cyber-blue/[0.03] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-400/[0.06] px-4 py-1.5">
            <Shield className="h-3.5 w-3.5 text-brand-400" />
            <span className="text-xs font-medium text-brand-400">Admin Dashboard</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Intelligence <span className="gradient-text">Command Center</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Review reports, flag confirmed scams, detect patterns, export aggregated intelligence, and moderate submissions.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {([
            { key: 'overview' as const, label: 'Overview', icon: BarChart3 },
            { key: 'reports' as const, label: 'Reports', icon: FileText },
            { key: 'patterns' as const, label: 'Pattern Detection', icon: Activity },
            { key: 'intelligence' as const, label: 'Intelligence Export', icon: Download },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ==================== OVERVIEW ==================== */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in space-y-6">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: 'Total Cases', value: stats.totalCases, icon: FileText, color: 'text-white' },
                { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-yellow-400' },
                { label: 'Confirmed Scams', value: stats.confirmed, icon: Flag, color: 'text-cyber-green' },
                { label: 'Total Loss', value: stats.totalLoss, icon: DollarSign, color: 'text-cyber-red' },
                { label: 'Wallets Tracked', value: stats.walletsTracked, icon: Wallet, color: 'text-amber-400' },
                { label: 'Entities Found', value: stats.entitiesExtracted, icon: Search, color: 'text-cyber-blue' },
              ].map(s => (
                <div key={s.label} className="glass-card rounded-xl p-4">
                  <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Charts area */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Scam types breakdown */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-cyber-blue" />
                  Scam Types Distribution
                </h3>
                <div className="space-y-3">
                  {[
                    { type: 'Pig Butchering', count: 34, pct: 28, color: 'bg-red-500' },
                    { type: 'Crypto Investment', count: 28, pct: 23, color: 'bg-orange-500' },
                    { type: 'Phishing', count: 22, pct: 18, color: 'bg-yellow-500' },
                    { type: 'Rug Pull / DeFi', count: 18, pct: 15, color: 'bg-purple-500' },
                    { type: 'Romance Scam', count: 12, pct: 10, color: 'bg-pink-500' },
                    { type: 'Other', count: 8, pct: 6, color: 'bg-slate-500' },
                  ].map(item => (
                    <div key={item.type}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">{item.type}</span>
                        <span className="text-slate-500">{item.count} ({item.pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-dark-700 overflow-hidden">
                        <div className={`h-full rounded-full ${item.color} transition-all`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent activity */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyber-green" />
                  Real-Time Activity Feed
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {[
                    { time: '2 min ago', event: 'New report submitted', detail: 'SC-8K2F — Pig Butchering, $45,000 loss', type: 'new' },
                    { time: '8 min ago', event: 'Wallet flagged', detail: '0x7a25...dEad linked to 3 additional cases', type: 'flag' },
                    { time: '15 min ago', event: 'Pattern detected', detail: 'Same phone number in 4 reports', type: 'pattern' },
                    { time: '23 min ago', event: 'Case confirmed', detail: 'SC-5F2U — Rug Pull confirmed, $156K', type: 'confirm' },
                    { time: '45 min ago', event: 'Exchange alert', detail: 'Binance freeze request sent for SC-7H1W', type: 'exchange' },
                    { time: '1 hr ago', event: 'Evidence uploaded', detail: '12 screenshots added to SC-6G4V', type: 'evidence' },
                    { time: '2 hrs ago', event: 'Domain flagged', detail: 'crypto-invest-returns.xyz added to blocklist', type: 'domain' },
                    { time: '3 hrs ago', event: 'Report rejected', detail: 'SC-4E8T — Insufficient evidence', type: 'reject' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg bg-white/[0.02] p-3">
                      <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
                        item.type === 'new' ? 'bg-yellow-400' :
                        item.type === 'flag' ? 'bg-red-400' :
                        item.type === 'pattern' ? 'bg-purple-400' :
                        item.type === 'confirm' ? 'bg-cyber-green' :
                        item.type === 'exchange' ? 'bg-cyan-400' :
                        item.type === 'reject' ? 'bg-red-400' :
                        'bg-blue-400'
                      }`} />
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-white">{item.event}</span>
                          <span className="text-[10px] text-slate-600">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* System health */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-cyber-green" />
                System Health
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: 'API Status', value: 'Operational', color: 'text-cyber-green', dot: 'bg-cyber-green' },
                  { label: 'Blockchain Indexer', value: '16/16 chains', color: 'text-cyber-green', dot: 'bg-cyber-green' },
                  { label: 'AI Pipeline', value: 'Processing', color: 'text-cyan-400', dot: 'bg-cyan-400' },
                  { label: 'Database', value: '99.99% uptime', color: 'text-cyber-green', dot: 'bg-cyber-green' },
                ].map(s => (
                  <div key={s.label} className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
                    <div className="text-xs text-slate-500 mb-1">{s.label}</div>
                    <div className={`flex items-center gap-1.5 text-sm font-medium ${s.color}`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${s.dot} animate-pulse`} />
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== REPORTS ==================== */}
        {activeTab === 'reports' && (
          <div className="animate-fade-in space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search case ID or type..."
                  className="w-full rounded-xl border border-white/10 bg-dark-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 transition"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="appearance-none rounded-xl border border-white/10 bg-dark-800 py-2.5 pl-8 pr-10 text-sm text-white outline-none focus:border-cyber-green/50 transition cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
              </div>
              <button className="flex items-center gap-2 rounded-xl bg-cyber-green/10 border border-cyber-green/20 px-4 py-2.5 text-sm text-cyber-green hover:bg-cyber-green/20 transition">
                <Download className="h-4 w-4" /> Export CSV
              </button>
            </div>

            {/* Cases table */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-xs text-slate-500">
                      <th className="px-4 py-3 font-medium">Case ID</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Reporter</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Loss</th>
                      <th className="px-4 py-3 font-medium">Entities</th>
                      <th className="px-4 py-3 font-medium">Risk</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCases.map(c => {
                      const ss = statusStyles[c.status];
                      return (
                        <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                          <td className="px-4 py-3 font-mono text-xs text-cyber-green font-medium">{c.id}</td>
                          <td className="px-4 py-3 text-white text-xs">{c.type}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${ss.bg} ${ss.text} ${ss.border}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400 font-mono">{c.reporter}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{c.date}</td>
                          <td className="px-4 py-3 text-xs font-medium text-white">{c.loss}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{c.entities}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              c.risk === 'critical' ? 'bg-red-500/10 text-red-400' :
                              c.risk === 'high' ? 'bg-orange-500/10 text-orange-400' :
                              'bg-yellow-500/10 text-yellow-400'
                            }`}>{c.risk}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setSelectedCase(c)}
                                className="rounded p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition"
                                title="Review"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              {c.status === 'pending' && (
                                <>
                                  <button className="rounded p-1.5 text-slate-400 hover:bg-green-500/10 hover:text-cyber-green transition" title="Approve">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button className="rounded p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition" title="Reject">
                                    <XCircle className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-white/5 px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">{filteredCases.length} of {mockCases.length} cases</span>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Users className="h-3.5 w-3.5" />
                  {new Set(mockCases.map(c => c.reporter)).size} unique reporters
                </div>
              </div>
            </div>

            {/* Case detail modal */}
            {selectedCase && (
              <div className="glass-card rounded-xl border-cyber-green/20 p-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Case {selectedCase.id}</h3>
                  <button onClick={() => setSelectedCase(null)} className="text-slate-400 hover:text-white transition">
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-4">
                  {[
                    { label: 'Type', value: selectedCase.type },
                    { label: 'Loss', value: selectedCase.loss },
                    { label: 'Entities', value: String(selectedCase.entities) },
                    { label: 'Wallets', value: String(selectedCase.wallets) },
                  ].map(item => (
                    <div key={item.label} className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
                      <div className="text-xs text-slate-500">{item.label}</div>
                      <div className="text-sm font-medium text-white mt-1">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button className="flex items-center gap-1.5 rounded-lg bg-cyber-green/10 border border-cyber-green/20 px-4 py-2 text-xs font-medium text-cyber-green hover:bg-cyber-green/20 transition">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Confirm Scam
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition">
                    <XCircle className="h-3.5 w-3.5" /> Reject Report
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-xs font-medium text-white hover:bg-white/10 transition">
                    <Flag className="h-3.5 w-3.5" /> Flag for Review
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg bg-cyber-blue/10 border border-cyber-blue/20 px-4 py-2 text-xs font-medium text-cyber-blue hover:bg-cyber-blue/20 transition">
                    <Download className="h-3.5 w-3.5" /> Export Report
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== PATTERN DETECTION ==================== */}
        {activeTab === 'patterns' && (
          <div className="animate-fade-in space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Wallet reuse */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-amber-400" />
                  Wallet Reuse Detection
                </h3>
                <div className="space-y-3">
                  {[
                    { wallet: '0x7a25...dEad', cases: 12, loss: '$245,000', chain: 'Ethereum' },
                    { wallet: 'bc1q...0wlh', cases: 8, loss: '$89,000', chain: 'Bitcoin' },
                    { wallet: 'TJYmz...hzXz', cases: 6, loss: '$67,000', chain: 'TRON' },
                    { wallet: '0x4e2f...ab12', cases: 4, loss: '$34,000', chain: 'Ethereum' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/5 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 flex-shrink-0">
                        <span className="text-xs font-bold text-amber-400">{item.cases}</span>
                      </div>
                      <div className="flex-grow min-w-0">
                        <code className="text-xs font-mono text-white">{item.wallet}</code>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-500">{item.chain}</span>
                          <span className="text-[10px] text-red-400">{item.loss} total loss</span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">{item.cases} cases</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Domain clusters */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-400" />
                  Domain Clustering
                </h3>
                <div className="space-y-3">
                  {[
                    { pattern: 'crypto-*-returns.xyz', matches: 23, registrar: 'NameSilo', hosting: 'Hostinger' },
                    { pattern: 'binance-*-verify.com', matches: 15, registrar: 'Namecheap', hosting: 'Cloudflare' },
                    { pattern: '*-trading-ai.net', matches: 9, registrar: 'GoDaddy', hosting: 'AWS' },
                    { pattern: 'metamask-*.io', matches: 7, registrar: 'Tucows', hosting: 'DigitalOcean' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/5 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 flex-shrink-0">
                        <span className="text-xs font-bold text-blue-400">{item.matches}</span>
                      </div>
                      <div className="flex-grow min-w-0">
                        <code className="text-xs font-mono text-white">{item.pattern}</code>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-500">{item.registrar}</span>
                          <span className="text-[10px] text-slate-500">{item.hosting}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Language patterns */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-cyber-orange" />
                  Language Pattern Detection
                </h3>
                <div className="space-y-2">
                  {[
                    { phrase: '"guaranteed returns"', count: 45, tactic: 'False promises' },
                    { phrase: '"limited time offer"', count: 38, tactic: 'Artificial urgency' },
                    { phrase: '"AI trading bot"', count: 31, tactic: 'Tech mystique' },
                    { phrase: '"verified by Binance"', count: 27, tactic: 'Brand impersonation' },
                    { phrase: '"send seed phrase"', count: 19, tactic: 'Credential theft' },
                    { phrase: '"only X spots left"', count: 15, tactic: 'Scarcity tactic' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/5 p-2.5">
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-cyber-orange font-mono">{item.phrase}</code>
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">{item.tactic}</span>
                      </div>
                      <span className="text-xs text-slate-500">{item.count}×</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* IP overlaps */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                  IP & Infrastructure Overlap
                </h3>
                <div className="space-y-3">
                  {[
                    { ip: '185.220.101.42', domains: 8, cases: 15, location: 'Germany (Tor)' },
                    { ip: '91.234.56.78', domains: 5, cases: 9, location: 'Russia' },
                    { ip: '45.132.78.123', domains: 3, cases: 6, location: 'Netherlands (VPN)' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/5 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 flex-shrink-0">
                        <Globe className="h-4 w-4 text-cyan-400" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <code className="text-xs font-mono text-white">{item.ip}</code>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                          <span>{item.domains} domains</span>
                          <span>{item.cases} cases</span>
                          <span>{item.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== INTELLIGENCE EXPORT ==================== */}
        {activeTab === 'intelligence' && (
          <div className="animate-fade-in">
            <div className="mx-auto max-w-2xl space-y-6">
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Download className="h-5 w-5 text-cyber-green" />
                  Export Aggregated Intelligence
                </h3>
                <p className="text-sm text-slate-400 mb-6">
                  Export scam intelligence data in formats compatible with law enforcement and compliance teams.
                </p>

                <div className="space-y-3">
                  {[
                    { format: 'PDF Report', desc: 'Comprehensive report with charts, timelines, and evidence — FTC/IC3 compatible', icon: FileText, color: 'text-red-400' },
                    { format: 'JSON Data', desc: 'Structured JSON with all entities, relationships, and metadata for API integration', icon: '{ }', color: 'text-cyan-400' },
                    { format: 'CSV Spreadsheet', desc: 'Flat file with all cases, wallets, domains, and loss data for analysis', icon: BarChart3, color: 'text-green-400' },
                    { format: 'FTC Template', desc: 'Pre-filled Federal Trade Commission complaint form', icon: Shield, color: 'text-blue-400' },
                    { format: 'IC3 Template', desc: 'FBI Internet Crime Complaint Center submission format', icon: Shield, color: 'text-purple-400' },
                    { format: 'LEA Package', desc: 'Complete law enforcement agency package with evidence chain', icon: FileText, color: 'text-amber-400' },
                  ].map(item => (
                    <button key={item.format} className="w-full flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition text-left">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 flex-shrink-0">
                        {typeof item.icon === 'string' ? (
                          <span className={`text-sm font-mono font-bold ${item.color}`}>{item.icon}</span>
                        ) : (
                          <item.icon className={`h-5 w-5 ${item.color}`} />
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="text-sm font-medium text-white">{item.format}</div>
                        <div className="text-xs text-slate-400">{item.desc}</div>
                      </div>
                      <Download className="h-4 w-4 text-slate-500 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Audit log */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  Audit Log (Last 24h)
                </h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto text-xs font-mono text-slate-500">
                  <div>[14:23:41] admin@scamtrace.com — Confirmed case SC-5F2U</div>
                  <div>[14:15:08] system — Pattern alert: Wallet 0x7a25 found in new report</div>
                  <div>[13:45:22] admin@scamtrace.com — Exported intelligence report (PDF)</div>
                  <div>[12:30:11] system — Rate limit triggered: IP 91.234.56.78</div>
                  <div>[11:22:05] admin@scamtrace.com — Rejected case SC-4E8T</div>
                  <div>[10:15:33] system — New report SC-8K2F submitted</div>
                  <div>[09:45:18] system — Database backup completed</div>
                  <div>[08:30:00] system — Daily threat feed updated (142 new indicators)</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
