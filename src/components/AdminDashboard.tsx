import { useState, useEffect, useCallback } from 'react';
import {
  Shield, Users, FileText, AlertTriangle, TrendingUp,
  CheckCircle2, XCircle, Eye, Download, Search,
  DollarSign, Globe, BarChart3, Clock, Activity, Flag,
  ChevronDown, Wallet, Filter, Loader2, Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface ScamCase {
  id: string;
  title: string;
  scam_type: string;
  status: string;
  total_loss: number;
  created_at: string;
  user_id: string;
}

interface EvidenceRow {
  type: string;
  value: string;
  label: string;
  case_id: string;
}

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  open: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  investigating: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  frozen: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  resolved: { bg: 'bg-cyber-green/10', text: 'text-cyber-green', border: 'border-cyber-green/20' },
  closed: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
};

type AdminTab = 'overview' | 'reports' | 'patterns' | 'intelligence';

function formatUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<ScamCase | null>(null);
  const [cases, setCases] = useState<ScamCase[]>([]);
  const [evidence, setEvidence] = useState<EvidenceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const [casesRes, evidenceRes] = await Promise.all([
        supabase.from('cases').select('*').order('created_at', { ascending: false }),
        supabase.from('evidence').select('type, value, label, case_id'),
      ]);
      setCases(casesRes.data || []);
      setEvidence(evidenceRes.data || []);
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredCases = cases.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchFilter && !c.id.toLowerCase().includes(searchFilter.toLowerCase()) && !c.scam_type?.toLowerCase().includes(searchFilter.toLowerCase()) && !c.title?.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    return true;
  });

  const totalLoss = cases.reduce((a, c) => a + (c.total_loss || 0), 0);
  const openCases = cases.filter(c => c.status === 'open').length;
  const resolvedCases = cases.filter(c => c.status === 'resolved' || c.status === 'frozen').length;

  // Compute wallet reuse from evidence
  const walletReuse = (() => {
    const map = new Map<string, Set<string>>();
    for (const e of evidence) {
      if (e.type === 'wallet' && e.value) {
        if (!map.has(e.value)) map.set(e.value, new Set());
        map.get(e.value)!.add(e.case_id);
      }
    }
    return [...map.entries()]
      .filter(([, caseIds]) => caseIds.size > 1)
      .map(([wallet, caseIds]) => ({ wallet, cases: caseIds.size }))
      .sort((a, b) => b.cases - a.cases)
      .slice(0, 5);
  })();

  // Compute domain clusters
  const domainClusters = (() => {
    const map = new Map<string, Set<string>>();
    for (const e of evidence) {
      if ((e.type === 'domain' || e.type === 'url') && e.value) {
        const domain = e.value.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        if (!map.has(domain)) map.set(domain, new Set());
        map.get(domain)!.add(e.case_id);
      }
    }
    return [...map.entries()]
      .filter(([, caseIds]) => caseIds.size > 1)
      .map(([domain, caseIds]) => ({ domain, cases: caseIds.size }))
      .sort((a, b) => b.cases - a.cases)
      .slice(0, 5);
  })();

  // Scam type distribution
  const scamTypeDist = (() => {
    const map = new Map<string, number>();
    for (const c of cases) {
      const type = c.scam_type || 'Other';
      map.set(type, (map.get(type) || 0) + 1);
    }
    const total = cases.length || 1;
    return [...map.entries()]
      .map(([type, count]) => ({ type, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  })();

  // Case status update
  const updateCaseStatus = async (caseId: string, newStatus: string) => {
    const { error } = await supabase.from('cases').update({ status: newStatus }).eq('id', caseId);
    if (!error) {
      setCases(prev => prev.map(c => c.id === caseId ? { ...c, status: newStatus } : c));
      if (selectedCase?.id === caseId) setSelectedCase(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // CSV export from real data
  const exportCSV = () => {
    const header = 'Case ID,Title,Type,Status,Loss,Created\n';
    const rows = cases.map(c =>
      `${c.id},"${c.title || ''}","${c.scam_type || ''}",${c.status},${c.total_loss || 0},${c.created_at}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `scamtrace-cases-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
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
            Review reports, flag confirmed scams, detect patterns, and export aggregated intelligence.
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

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
          </div>
        )}

        {/* Not logged in */}
        {!loading && !user && (
          <div className="mx-auto max-w-md glass-card rounded-xl p-8 text-center">
            <Info className="h-8 w-8 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Sign In Required</h3>
            <p className="text-sm text-slate-400">Sign in to access the command center and manage cases.</p>
          </div>
        )}

        {!loading && user && (
          <>
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="animate-fade-in space-y-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                  {[
                    { label: 'Total Cases', value: cases.length, icon: FileText, color: 'text-white' },
                    { label: 'Open', value: openCases, icon: Clock, color: 'text-yellow-400' },
                    { label: 'Resolved/Frozen', value: resolvedCases, icon: Flag, color: 'text-cyber-green' },
                    { label: 'Total Loss', value: formatUSD(totalLoss), icon: DollarSign, color: 'text-cyber-red' },
                    { label: 'Wallet Evidence', value: evidence.filter(e => e.type === 'wallet').length, icon: Wallet, color: 'text-amber-400' },
                    { label: 'Total Evidence', value: evidence.length, icon: Search, color: 'text-cyber-blue' },
                  ].map(s => (
                    <div key={s.label} className="glass-card rounded-xl p-4">
                      <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
                      <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Scam types */}
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-cyber-blue" />
                      Scam Types Distribution
                    </h3>
                    {scamTypeDist.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No cases submitted yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {scamTypeDist.map(item => (
                          <div key={item.type}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-300">{item.type}</span>
                              <span className="text-slate-500">{item.count} ({item.pct}%)</span>
                            </div>
                            <div className="h-2 rounded-full bg-dark-700 overflow-hidden">
                              <div className="h-full rounded-full bg-cyber-blue transition-all" style={{ width: `${item.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent cases */}
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-cyber-green" />
                      Recent Cases
                    </h3>
                    {cases.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No cases yet.</p>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {cases.slice(0, 10).map(c => {
                          const ss = statusStyles[c.status] || statusStyles.open;
                          return (
                            <div key={c.id} className="flex items-start gap-3 rounded-lg bg-white/[0.02] p-3">
                              <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${ss.bg.replace('/10', '/60')}`} />
                              <div className="flex-grow min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-white truncate">{c.title || c.scam_type || 'Untitled'}</span>
                                  <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase ${ss.bg} ${ss.text} ${ss.border}`}>{c.status}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  {c.scam_type} {c.total_loss ? `- ${formatUSD(c.total_loss)}` : ''} - {new Date(c.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* REPORTS */}
            {activeTab === 'reports' && (
              <div className="animate-fade-in space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search case title or type..."
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
                      <option value="open">Open</option>
                      <option value="investigating">Investigating</option>
                      <option value="frozen">Frozen</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                  </div>
                  <button onClick={exportCSV} className="flex items-center gap-2 rounded-xl bg-cyber-green/10 border border-cyber-green/20 px-4 py-2.5 text-sm text-cyber-green hover:bg-cyber-green/20 transition">
                    <Download className="h-4 w-4" /> Export CSV
                  </button>
                </div>

                <div className="glass-card rounded-xl overflow-hidden">
                  {filteredCases.length === 0 ? (
                    <p className="text-sm text-slate-500 py-8 text-center">
                      {cases.length === 0 ? 'No cases submitted yet. Submit your first scam report.' : 'No cases match your filters.'}
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-white/5 text-xs text-slate-500">
                            <th className="px-4 py-3 font-medium">Title</th>
                            <th className="px-4 py-3 font-medium">Type</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Loss</th>
                            <th className="px-4 py-3 font-medium">Date</th>
                            <th className="px-4 py-3 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCases.map(c => {
                            const ss = statusStyles[c.status] || statusStyles.open;
                            return (
                              <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                                <td className="px-4 py-3 text-xs text-white truncate max-w-[200px]">{c.title || 'Untitled'}</td>
                                <td className="px-4 py-3 text-xs text-slate-400">{c.scam_type || '-'}</td>
                                <td className="px-4 py-3">
                                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${ss.bg} ${ss.text} ${ss.border}`}>
                                    {c.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-xs font-medium text-white">{c.total_loss ? formatUSD(c.total_loss) : '-'}</td>
                                <td className="px-4 py-3 text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString()}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => setSelectedCase(c)} className="rounded p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition" title="View">
                                      <Eye className="h-3.5 w-3.5" />
                                    </button>
                                    {c.status === 'open' && (
                                      <>
                                        <button onClick={() => updateCaseStatus(c.id, 'investigating')} className="rounded p-1.5 text-slate-400 hover:bg-blue-500/10 hover:text-blue-400 transition" title="Investigate">
                                          <CheckCircle2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button onClick={() => updateCaseStatus(c.id, 'closed')} className="rounded p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition" title="Close">
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
                  )}
                  {filteredCases.length > 0 && (
                    <div className="border-t border-white/5 px-4 py-3 flex items-center justify-between">
                      <span className="text-xs text-slate-500">{filteredCases.length} of {cases.length} cases</span>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Users className="h-3.5 w-3.5" />
                        {cases.length} total case{cases.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </div>

                {/* Case detail */}
                {selectedCase && (
                  <div className="glass-card rounded-xl border-cyber-green/20 p-6 animate-fade-in-up">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">{selectedCase.title || 'Untitled Case'}</h3>
                      <button onClick={() => setSelectedCase(null)} className="text-slate-400 hover:text-white transition">
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-4">
                      {[
                        { label: 'Type', value: selectedCase.scam_type || '-' },
                        { label: 'Status', value: selectedCase.status },
                        { label: 'Loss', value: selectedCase.total_loss ? formatUSD(selectedCase.total_loss) : '-' },
                        { label: 'Date', value: new Date(selectedCase.created_at).toLocaleDateString() },
                      ].map(item => (
                        <div key={item.label} className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
                          <div className="text-xs text-slate-500">{item.label}</div>
                          <div className="text-sm font-medium text-white mt-1">{item.value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => updateCaseStatus(selectedCase.id, 'resolved')} className="flex items-center gap-1.5 rounded-lg bg-cyber-green/10 border border-cyber-green/20 px-4 py-2 text-xs font-medium text-cyber-green hover:bg-cyber-green/20 transition">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Mark Resolved
                      </button>
                      <button onClick={() => updateCaseStatus(selectedCase.id, 'frozen')} className="flex items-center gap-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 text-xs font-medium text-cyan-400 hover:bg-cyan-500/20 transition">
                        <Shield className="h-3.5 w-3.5" /> Freeze Funds
                      </button>
                      <button onClick={() => updateCaseStatus(selectedCase.id, 'closed')} className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition">
                        <XCircle className="h-3.5 w-3.5" /> Close Case
                      </button>
                      <button onClick={() => updateCaseStatus(selectedCase.id, 'investigating')} className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-xs font-medium text-white hover:bg-white/10 transition">
                        <Flag className="h-3.5 w-3.5" /> Investigate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PATTERN DETECTION */}
            {activeTab === 'patterns' && (
              <div className="animate-fade-in space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Wallet reuse */}
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-amber-400" />
                      Wallet Reuse Detection
                    </h3>
                    {walletReuse.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No wallet reuse patterns detected yet. Submit more cases to enable pattern detection.</p>
                    ) : (
                      <div className="space-y-3">
                        {walletReuse.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/5 p-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 flex-shrink-0">
                              <span className="text-xs font-bold text-amber-400">{item.cases}</span>
                            </div>
                            <div className="flex-grow min-w-0">
                              <code className="text-xs font-mono text-white truncate block">{item.wallet}</code>
                              <span className="text-[10px] text-slate-500">Found in {item.cases} cases</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Domain clusters */}
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-400" />
                      Domain Clustering
                    </h3>
                    {domainClusters.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No domain clusters detected yet. Submit cases with domain evidence to enable clustering.</p>
                    ) : (
                      <div className="space-y-3">
                        {domainClusters.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/5 p-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 flex-shrink-0">
                              <span className="text-xs font-bold text-blue-400">{item.cases}</span>
                            </div>
                            <div className="flex-grow min-w-0">
                              <code className="text-xs font-mono text-white truncate block">{item.domain}</code>
                              <span className="text-[10px] text-slate-500">Found in {item.cases} cases</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Scam type breakdown */}
                  <div className="glass-card rounded-xl p-6 lg:col-span-2">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-cyber-orange" />
                      Scam Type Trends
                    </h3>
                    {scamTypeDist.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No case data available for trend analysis.</p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {scamTypeDist.map(item => (
                          <div key={item.type} className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/5 p-3">
                            <div>
                              <span className="text-xs text-white font-medium">{item.type}</span>
                              <div className="text-[10px] text-slate-500 mt-0.5">{item.pct}% of reports</div>
                            </div>
                            <span className="text-sm font-bold text-cyber-orange">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* INTELLIGENCE EXPORT */}
            {activeTab === 'intelligence' && (
              <div className="animate-fade-in">
                <div className="mx-auto max-w-2xl space-y-6">
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Download className="h-5 w-5 text-cyber-green" />
                      Export Case Intelligence
                    </h3>
                    <p className="text-sm text-slate-400 mb-6">
                      Export your scam intelligence data. All exports are generated from your real case data.
                    </p>

                    <div className="space-y-3">
                      {[
                        { format: 'CSV Spreadsheet', desc: `Export all ${cases.length} cases with loss data and evidence as CSV`, icon: BarChart3, color: 'text-green-400', action: exportCSV },
                        { format: 'JSON Data', desc: 'Structured JSON with all entities, relationships, and metadata', icon: FileText, color: 'text-cyan-400', action: () => {
                          const blob = new Blob([JSON.stringify({ cases, evidence }, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a'); a.href = url; a.download = `scamtrace-data-${new Date().toISOString().split('T')[0]}.json`; a.click();
                          URL.revokeObjectURL(url);
                        }},
                        { format: 'Evidence Summary', desc: 'Wallet and domain evidence list for law enforcement submission', icon: Shield, color: 'text-blue-400', action: () => {
                          const wallets = evidence.filter(e => e.type === 'wallet').map(e => e.value);
                          const domains = evidence.filter(e => e.type === 'domain' || e.type === 'url').map(e => e.value);
                          const text = `ScamTrace Evidence Summary\nGenerated: ${new Date().toISOString()}\n\nWallet Addresses:\n${wallets.join('\n') || 'None'}\n\nDomains/URLs:\n${domains.join('\n') || 'None'}\n\nTotal Cases: ${cases.length}\nTotal Loss: ${formatUSD(totalLoss)}`;
                          const blob = new Blob([text], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a'); a.href = url; a.download = `scamtrace-evidence-${new Date().toISOString().split('T')[0]}.txt`; a.click();
                          URL.revokeObjectURL(url);
                        }},
                      ].map(item => (
                        <button key={item.format} onClick={item.action} className="w-full flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition text-left">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 flex-shrink-0">
                            <item.icon className={`h-5 w-5 ${item.color}`} />
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
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
