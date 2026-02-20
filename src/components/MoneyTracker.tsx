import { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, Wallet, Globe, BarChart3,
  ArrowRight, AlertTriangle, Shield, PieChart, Loader2, Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

type TrackerView = 'overview' | 'wallet' | 'domain' | 'type';

interface CaseRow {
  id: string;
  title: string;
  status: string;
  scam_type: string;
  total_loss: number;
  created_at: string;
}

interface EvidenceRow {
  type: string;
  value: string;
  label: string;
  case_id: string;
}

interface CaseStats {
  totalLoss: number;
  caseCount: number;
  avgLoss: number;
  openCases: number;
  frozenCount: number;
  scamTypes: { type: string; count: number; loss: number }[];
  walletEvidence: { value: string; count: number; loss: number }[];
  domainEvidence: { value: string; count: number; loss: number }[];
}

function formatUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export function MoneyTracker() {
  const { user } = useAuth();
  const [view, setView] = useState<TrackerView>('overview');
  const [stats, setStats] = useState<CaseStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;

    async function fetchStats() {
      try {
        const [casesRes, evidenceRes] = await Promise.all([
          supabase.from('cases').select('id, title, status, scam_type, total_loss, created_at'),
          supabase.from('evidence').select('type, value, label, case_id'),
        ]);

        if (cancelled) return;

        const cases: CaseRow[] = casesRes.data || [];
        const evidence: EvidenceRow[] = evidenceRes.data || [];

        const totalLoss = cases.reduce((s, c) => s + (c.total_loss || 0), 0);
        const openCases = cases.filter(c => c.status === 'open').length;
        const frozenCount = cases.filter(c => c.status === 'frozen' || c.status === 'resolved').length;
        const avgLoss = cases.length > 0 ? totalLoss / cases.length : 0;

        // Map case_id -> total_loss for quick lookup
        const caseLossMap = new Map(cases.map(c => [c.id, c.total_loss || 0]));

        // Group by scam type
        const typeMap = new Map<string, { count: number; loss: number }>();
        for (const c of cases) {
          const type = c.scam_type || 'Other';
          const existing = typeMap.get(type) || { count: 0, loss: 0 };
          existing.count++;
          existing.loss += c.total_loss || 0;
          typeMap.set(type, existing);
        }

        // Group wallet & domain evidence
        const walletMap = new Map<string, { count: number; loss: number }>();
        const domainMap = new Map<string, { count: number; loss: number }>();
        for (const e of evidence) {
          const key = e.value || e.label;
          if (!key) continue;
          const caseLoss = caseLossMap.get(e.case_id) || 0;
          if (e.type === 'wallet') {
            const ex = walletMap.get(key) || { count: 0, loss: 0 };
            ex.count++; ex.loss += caseLoss;
            walletMap.set(key, ex);
          }
          if (e.type === 'domain' || e.type === 'url') {
            const ex = domainMap.get(key) || { count: 0, loss: 0 };
            ex.count++; ex.loss += caseLoss;
            domainMap.set(key, ex);
          }
        }

        setStats({
          totalLoss,
          caseCount: cases.length,
          avgLoss,
          openCases,
          frozenCount,
          scamTypes: [...typeMap.entries()].map(([type, d]) => ({ type, ...d })).sort((a, b) => b.loss - a.loss),
          walletEvidence: [...walletMap.entries()].map(([value, d]) => ({ value, ...d })).sort((a, b) => b.loss - a.loss).slice(0, 5),
          domainEvidence: [...domainMap.entries()].map(([value, d]) => ({ value, ...d })).sort((a, b) => b.loss - a.loss).slice(0, 5),
        });
      } catch {
        // Supabase may not be configured yet
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, [user]);

  const totalPct = stats ? stats.scamTypes.reduce((s, t) => s + t.count, 0) || 1 : 1;

  return (
    <section id="money-tracker" className="relative py-24 grid-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-1/3 top-1/3 h-[500px] w-[500px] rounded-full bg-cyber-orange/[0.03] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-orange/20 bg-cyber-orange/[0.06] px-4 py-1.5">
            <DollarSign className="h-3.5 w-3.5 text-cyber-orange" />
            <span className="text-xs font-medium text-cyber-orange">Money Tracker</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Loss <span className="gradient-text">Intelligence</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Track reported losses, aggregate totals by wallet, domain, or scam type. Real-time financial intelligence from your ScamTrace cases.
          </p>
        </div>

        {/* View tabs */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {([
            { key: 'overview' as const, label: 'Overview', icon: BarChart3 },
            { key: 'wallet' as const, label: 'By Wallet', icon: Wallet },
            { key: 'domain' as const, label: 'By Domain', icon: Globe },
            { key: 'type' as const, label: 'By Scam Type', icon: PieChart },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                view === tab.key ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-cyber-orange" />
          </div>
        )}

        {/* Not logged in */}
        {!loading && !user && (
          <div className="mx-auto max-w-md glass-card rounded-xl p-8 text-center">
            <Info className="h-8 w-8 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Sign In Required</h3>
            <p className="text-sm text-slate-400">Sign in to view loss intelligence data from your submitted cases.</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && user && stats && stats.caseCount === 0 && (
          <div className="mx-auto max-w-md glass-card rounded-xl p-8 text-center">
            <DollarSign className="h-8 w-8 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Cases Yet</h3>
            <p className="text-sm text-slate-400 mb-4">Submit your first scam report to start tracking financial losses.</p>
            <a href="#submit" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyber-green to-cyber-blue px-5 py-2.5 text-sm font-bold text-dark-900">
              Submit a Report <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        )}

        {/* ---- Data views ---- */}
        {!loading && stats && stats.caseCount > 0 && (
          <>
            {/* Overview */}
            {view === 'overview' && (
              <div className="animate-fade-in space-y-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: 'Total Reported Loss', value: formatUSD(stats.totalLoss), sub: `${stats.caseCount} case${stats.caseCount !== 1 ? 's' : ''}`, color: 'text-cyber-red', icon: DollarSign },
                    { label: 'Average Loss', value: formatUSD(stats.avgLoss), sub: 'Per case', color: 'text-cyber-orange', icon: TrendingUp },
                    { label: 'Cases Resolved/Frozen', value: String(stats.frozenCount), sub: `${stats.caseCount > 0 ? Math.round(stats.frozenCount / stats.caseCount * 100) : 0}% of cases`, color: 'text-cyber-green', icon: Shield },
                    { label: 'Open Investigations', value: String(stats.openCases), sub: 'Active cases', color: 'text-cyber-blue', icon: Wallet },
                  ].map(s => (
                    <div key={s.label} className="glass-card-premium rounded-xl p-5">
                      <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
                      <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                      <div className="text-[10px] text-slate-600 mt-0.5">{s.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Top wallets & domains */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="text-sm font-bold text-white mb-4">Top Loss by Wallet</h3>
                    {stats.walletEvidence.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No wallet evidence submitted yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {stats.walletEvidence.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/5 p-3">
                            <span className="text-xs font-bold text-slate-600 w-5">#{i + 1}</span>
                            <div className="flex-grow min-w-0">
                              <code className="text-xs font-mono text-white truncate block">{item.value}</code>
                              <div className="text-[10px] text-slate-500 mt-0.5">{item.count} report{item.count !== 1 ? 's' : ''}</div>
                            </div>
                            <span className="text-sm font-bold text-cyber-red">{formatUSD(item.loss)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="glass-card rounded-xl p-6">
                    <h3 className="text-sm font-bold text-white mb-4">Top Loss by Domain</h3>
                    {stats.domainEvidence.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No domain evidence submitted yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {stats.domainEvidence.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/5 p-3">
                            <span className="text-xs font-bold text-slate-600 w-5">#{i + 1}</span>
                            <div className="flex-grow min-w-0">
                              <code className="text-xs font-mono text-blue-400 truncate block">{item.value}</code>
                              <div className="text-[10px] text-slate-500 mt-0.5">{item.count} report{item.count !== 1 ? 's' : ''}</div>
                            </div>
                            <span className="text-sm font-bold text-cyber-red">{formatUSD(item.loss)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* By Wallet */}
            {view === 'wallet' && (
              <div className="animate-fade-in">
                <div className="glass-card rounded-xl overflow-hidden">
                  {stats.walletEvidence.length === 0 ? (
                    <p className="text-sm text-slate-500 py-8 text-center">No wallet evidence submitted yet. Submit a case with wallet addresses to see data here.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-white/5 text-xs text-slate-500">
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Wallet Address</th>
                            <th className="px-4 py-3">Associated Loss</th>
                            <th className="px-4 py-3">Reports</th>
                            <th className="px-4 py-3">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.walletEvidence.map((item, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                              <td className="px-4 py-3 text-xs text-slate-600">{i + 1}</td>
                              <td className="px-4 py-3 font-mono text-xs text-white truncate max-w-xs">{item.value}</td>
                              <td className="px-4 py-3 text-sm font-bold text-cyber-red">{formatUSD(item.loss)}</td>
                              <td className="px-4 py-3 text-xs text-slate-400">{item.count}</td>
                              <td className="px-4 py-3">
                                <a href="#tracker" className="text-xs text-cyber-green hover:underline flex items-center gap-1">
                                  Trace <ArrowRight className="h-3 w-3" />
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* By Domain */}
            {view === 'domain' && (
              <div className="animate-fade-in">
                <div className="glass-card rounded-xl overflow-hidden">
                  {stats.domainEvidence.length === 0 ? (
                    <p className="text-sm text-slate-500 py-8 text-center">No domain evidence submitted yet. Submit a case with domains/URLs to see data here.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-white/5 text-xs text-slate-500">
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Domain</th>
                            <th className="px-4 py-3">Associated Loss</th>
                            <th className="px-4 py-3">Reports</th>
                            <th className="px-4 py-3">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.domainEvidence.map((item, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                              <td className="px-4 py-3 text-xs text-slate-600">{i + 1}</td>
                              <td className="px-4 py-3 font-mono text-xs text-blue-400">{item.value}</td>
                              <td className="px-4 py-3 text-sm font-bold text-cyber-red">{formatUSD(item.loss)}</td>
                              <td className="px-4 py-3 text-xs text-slate-400">{item.count}</td>
                              <td className="px-4 py-3">
                                <a href="#osint-tools" className="text-xs text-cyber-blue hover:underline flex items-center gap-1">
                                  Check <ArrowRight className="h-3 w-3" />
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* By Type */}
            {view === 'type' && (
              <div className="animate-fade-in">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {stats.scamTypes.map(item => {
                    const pct = Math.round((item.count / totalPct) * 100);
                    const colorMap: Record<string, { icon: typeof AlertTriangle; color: string; bg: string }> = {
                      'Pig Butchering': { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
                      'Crypto Investment': { icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                      'Phishing': { icon: Globe, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                      'Rug Pull': { icon: Wallet, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                      'Romance Scam': { icon: Shield, color: 'text-pink-400', bg: 'bg-pink-500/10' },
                    };
                    const cfg = colorMap[item.type] || { icon: BarChart3, color: 'text-slate-400', bg: 'bg-slate-500/10' };

                    return (
                      <div key={item.type} className="glass-card-premium rounded-xl p-6">
                        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${cfg.bg} mb-3`}>
                          <cfg.icon className={`h-5 w-5 ${cfg.color}`} />
                        </div>
                        <h4 className="text-base font-bold text-white">{item.type}</h4>
                        <div className="mt-2 text-2xl font-extrabold text-cyber-red">{formatUSD(item.loss)}</div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <span>{item.count} report{item.count !== 1 ? 's' : ''}</span>
                          <span>{pct}% of total</span>
                        </div>
                        <div className="mt-3 h-1.5 rounded-full bg-dark-700 overflow-hidden">
                          <div className={`h-full rounded-full ${cfg.bg.replace('/10', '/40')} transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
