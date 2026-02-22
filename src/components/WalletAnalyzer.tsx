import { useState, useMemo } from 'react';
import {
  Search,
  Activity,
  Shield,
  AlertTriangle,
  TrendingUp,
  Network,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Download,
  Link,
  Zap,
  Shuffle,
  Clock,
  GitMerge,
  BarChart3,
  Eye,
} from 'lucide-react';
import { fetchAllTransactions, SUPPORTED_CHAINS, getChainInfo } from '@/lib/blockchain-api';
import type { Chain, NormalizedTx } from '@/lib/blockchain-api';
import { buildGraph, computeGraphMetrics, getRiskGrade, getRiskColor, getRoleColor, serializeGraph } from '@/lib/graph-engine';
import type { WalletGraph, GraphMetrics, RiskGrade } from '@/lib/graph-engine';
import { analyzePatterns } from '@/lib/scam-patterns';
import type { PatternAnalysis, DetectedPattern } from '@/lib/scam-patterns';
import D3ForceGraph from './D3ForceGraph';
import { useAuth } from '@/context/AuthContext';
import { useSubscription, TIER_NAMES } from '@/context/SubscriptionContext';
import { supabase } from '@/lib/supabase';
import { exportTransactionsCSV, exportGraphJSON, exportForensicPDF } from '@/lib/export';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colors[severity] ?? colors.low}`}>
      {severity}
    </span>
  );
}

function PatternIcon({ type }: { type: DetectedPattern['type'] }) {
  const icons: Record<string, typeof Link> = {
    peel_chain: Link,
    rapid_dispersal: Zap,
    mixer_interaction: Shuffle,
    time_compressed_burst: Clock,
    layered_funnel: GitMerge,
  };
  const Icon = icons[type] ?? AlertTriangle;
  return <Icon size={16} />;
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: typeof Activity;
  color: string;
}) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg" style={{ background: `${color}20` }}>
          <Icon size={14} style={{ color }} />
        </div>
        <span className="text-xs text-white/50 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}

function RiskDistributionBar({ distribution }: { distribution: Record<RiskGrade, number> }) {
  const total = Object.values(distribution).reduce((s, v) => s + v, 0);
  if (total === 0) return null;

  const segments: { grade: RiskGrade; pct: number }[] = (
    ['critical', 'high', 'moderate', 'low'] as RiskGrade[]
  ).map((g) => ({
    grade: g,
    pct: (distribution[g] / total) * 100,
  }));

  return (
    <div className="flex items-center gap-1 w-full h-3 rounded-full overflow-hidden bg-dark-700">
      {segments.map(
        (s) =>
          s.pct > 0 && (
            <div
              key={s.grade}
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${s.pct}%`, background: getRiskColor(s.grade) }}
              title={`${s.grade}: ${distribution[s.grade]}`}
            />
          ),
      )}
    </div>
  );
}

function TransactionTable({ transactions, chain }: { transactions: NormalizedTx[]; chain: Chain }) {
  const [sortField, setSortField] = useState<'timestamp' | 'value'>('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const sorted = useMemo(() => {
    const copy = [...transactions];
    copy.sort((a, b) => {
      const m = sortDir === 'asc' ? 1 : -1;
      return sortField === 'timestamp'
        ? (a.timestamp - b.timestamp) * m
        : (a.value - b.value) * m;
    });
    return copy;
  }, [transactions, sortField, sortDir]);

  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(sorted.length / pageSize);
  const info = getChainInfo(chain);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field ? (
      sortDir === 'asc' ? (
        <ChevronUp size={12} />
      ) : (
        <ChevronDown size={12} />
      )
    ) : null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs text-white/50 uppercase tracking-wider">
            <th className="pb-2 pr-4">Hash</th>
            <th className="pb-2 pr-4">From</th>
            <th className="pb-2 pr-4">To</th>
            <th className="pb-2 pr-4 cursor-pointer select-none" onClick={() => toggleSort('value')}>
              <span className="flex items-center gap-1">
                Value ({info.asset}) <SortIcon field="value" />
              </span>
            </th>
            <th className="pb-2 pr-4 cursor-pointer select-none" onClick={() => toggleSort('timestamp')}>
              <span className="flex items-center gap-1">
                Time <SortIcon field="timestamp" />
              </span>
            </th>
            <th className="pb-2">Dir</th>
          </tr>
        </thead>
        <tbody>
          {paged.map((tx) => (
            <tr key={tx.hash} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <td className="py-2 pr-4">
                <a
                  href={`${info.explorerBase}/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-cyber-blue hover:underline flex items-center gap-1"
                >
                  {tx.hash.slice(0, 10)}...
                  <ExternalLink size={10} />
                </a>
              </td>
              <td className="py-2 pr-4 font-mono text-white/70 truncate max-w-[120px]">
                {tx.from.slice(0, 8)}...{tx.from.slice(-4)}
              </td>
              <td className="py-2 pr-4 font-mono text-white/70 truncate max-w-[120px]">
                {tx.to.slice(0, 8)}...{tx.to.slice(-4)}
              </td>
              <td className="py-2 pr-4 font-mono text-white/90">{tx.value.toFixed(6)}</td>
              <td className="py-2 pr-4 text-white/60">
                {new Date(tx.timestamp * 1000).toLocaleString()}
              </td>
              <td className="py-2">
                <span
                  className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                    tx.direction === 'in'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {tx.direction}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-xs text-white/50">
          <span>
            Page {page + 1} of {totalPages} ({sorted.length} transactions)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2 py-1 rounded bg-dark-600 hover:bg-dark-500 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-2 py-1 rounded bg-dark-600 hover:bg-dark-500 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function WalletAnalyzer() {
  const { user } = useAuth();
  const { plan, limits, canPerformScan, incrementUsage, usage, getUpgradeMessage } = useSubscription();
  const [address, setAddress] = useState('');
  const [chain, setChain] = useState<Chain>('ethereum');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Analysis results
  const [transactions, setTransactions] = useState<NormalizedTx[]>([]);
  const [graph, setGraph] = useState<WalletGraph | null>(null);
  const [metrics, setMetrics] = useState<GraphMetrics | null>(null);
  const [patterns, setPatterns] = useState<PatternAnalysis | null>(null);

  // UI state
  const [colorBy, setColorBy] = useState<'role' | 'risk'>('role');
  const [activeTab, setActiveTab] = useState<'graph' | 'patterns' | 'transactions'>('graph');
  const [expandedPattern, setExpandedPattern] = useState<number | null>(null);
  const [highlightedEdges, setHighlightedEdges] = useState<Set<string>>(new Set());
  const [selectedNodeAddress, setSelectedNodeAddress] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!address.trim()) return;

    // Subscription gating
    if (!canPerformScan) {
      setError(`Scan limit reached (${limits.scansPerMonth}/month on ${TIER_NAMES[plan]} plan). ${getUpgradeMessage('more scans')}`);
      return;
    }

    setLoading(true);
    setError(null);
    setGraph(null);
    setMetrics(null);
    setPatterns(null);
    setTransactions([]);

    try {
      const txs = await fetchAllTransactions(address.trim().toLowerCase(), chain);
      if (txs.length === 0) {
        setError('No transactions found for this address on the selected chain.');
        setLoading(false);
        return;
      }

      setTransactions(txs);

      const walletGraph = buildGraph(txs, address.trim().toLowerCase());
      setGraph(walletGraph);

      const graphMetrics = computeGraphMetrics(walletGraph);
      setMetrics(graphMetrics);

      const patternAnalysis = analyzePatterns(walletGraph);
      setPatterns(patternAnalysis);

      // Save analysis to Supabase and track usage if user is logged in
      if (user) {
        const serialized = serializeGraph(walletGraph);
        await supabase.from('wallet_analyses').insert({
          user_id: user.id,
          input_address: address.trim().toLowerCase(),
          chain,
          graph_data: serialized,
          metrics: graphMetrics,
          scam_correlation: patternAnalysis,
          risk_grade: getRiskGrade(
            Math.max(...Array.from(walletGraph.nodes.values()).map((n) => n.riskScore), 0),
          ),
          total_value_moved: graphMetrics.totalValueMoved,
          total_wallets: graphMetrics.totalWallets,
        });
        await incrementUsage('wallet_scan');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePatternHover = (pattern: DetectedPattern | null) => {
    if (pattern) {
      setHighlightedEdges(new Set(pattern.involvedEdges));
    } else {
      setHighlightedEdges(new Set());
    }
  };

  const overallGrade = metrics
    ? getRiskGrade(Math.max(...Array.from(graph?.nodes.values() ?? []).map((n) => n.riskScore), 0))
    : null;

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Wallet Forensic Analyzer</h1>
            <p className="text-white/50">
              Trace fund flows, detect scam patterns, and build evidence-grade analysis reports.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-white/40 uppercase tracking-wider">Plan</p>
              <p className="text-sm font-medium text-cyber-green">{TIER_NAMES[plan]}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40 uppercase tracking-wider">Scans</p>
              <p className="text-sm font-medium text-white">
                {usage.scansThisMonth}
                <span className="text-white/40">
                  /{limits.scansPerMonth === Infinity ? 'Unlimited' : limits.scansPerMonth}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="glass-card rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="Enter wallet address (0x... or Bitcoin address)"
                className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-white/10 rounded-xl text-white placeholder-white/30 font-mono text-sm focus:border-cyber-green/50 focus:outline-none transition-colors"
              />
            </div>
            <select
              value={chain}
              onChange={(e) => setChain(e.target.value as Chain)}
              className="px-4 py-3 bg-dark-700 border border-white/10 rounded-xl text-white text-sm focus:border-cyber-green/50 focus:outline-none transition-colors"
            >
              {SUPPORTED_CHAINS.map((c) => (
                <option key={c} value={c}>
                  {getChainInfo(c).name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAnalyze}
              disabled={loading || !address.trim()}
              className="btn-primary px-6 py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Network size={16} />
                  Analyze
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
            <AlertTriangle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-4 h-24 animate-shimmer" />
              ))}
            </div>
            <div className="glass-card rounded-xl h-[500px] animate-shimmer" />
          </div>
        )}

        {/* Results */}
        {graph && metrics && patterns && !loading && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Export toolbar */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-white/40 uppercase tracking-wider mr-2">Export:</span>
              {limits.csvExport && (
                <button
                  onClick={() => exportTransactionsCSV(transactions, `scamtrace-${address.slice(0, 10)}.csv`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-xs transition-colors"
                >
                  <Download size={12} /> CSV
                </button>
              )}
              {limits.jsonExport ? (
                <button
                  onClick={() => exportGraphJSON(graph, metrics, patterns, `scamtrace-graph-${address.slice(0, 10)}.json`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-xs transition-colors"
                >
                  <Download size={12} /> JSON Graph
                </button>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 border border-white/5 text-white/30 text-xs cursor-not-allowed"
                  title={getUpgradeMessage('JSON export')}
                >
                  <Download size={12} /> JSON (Pro+)
                </button>
              )}
              {limits.pdfExport ? (
                <button
                  onClick={() => exportForensicPDF(graph, metrics, patterns, transactions, chain)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-green/10 border border-cyber-green/20 text-cyber-green hover:bg-cyber-green/20 text-xs transition-colors"
                >
                  <Download size={12} /> PDF Report
                </button>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 border border-white/5 text-white/30 text-xs cursor-not-allowed"
                  title={getUpgradeMessage('PDF reports')}
                >
                  <Download size={12} /> PDF (Starter+)
                </button>
              )}
            </div>
            {/* Metric cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                label="Wallets Found"
                value={metrics.totalWallets}
                icon={Network}
                color="#00d4ff"
              />
              <MetricCard
                label="Total Value Moved"
                value={`${metrics.totalValueMoved.toFixed(4)} ${getChainInfo(chain).asset}`}
                icon={TrendingUp}
                color="#00ff88"
              />
              <MetricCard
                label="Patterns Detected"
                value={patterns.patterns.length}
                icon={AlertTriangle}
                color={patterns.patterns.length > 0 ? '#ff8800' : '#22c55e'}
              />
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="p-1.5 rounded-lg"
                    style={{ background: overallGrade ? `${getRiskColor(overallGrade)}20` : undefined }}
                  >
                    <Shield size={14} style={{ color: overallGrade ? getRiskColor(overallGrade) : '#6b7280' }} />
                  </div>
                  <span className="text-xs text-white/50 uppercase tracking-wider">Risk Grade</span>
                </div>
                <p
                  className="text-xl font-bold uppercase"
                  style={{ color: overallGrade ? getRiskColor(overallGrade) : '#fff' }}
                >
                  {overallGrade ?? 'N/A'}
                </p>
                <div className="mt-2">
                  <RiskDistributionBar distribution={metrics.riskDistribution} />
                </div>
              </div>
            </div>

            {/* Scam likelihood bar */}
            {patterns.scamLikelihood > 0 && (
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70">Scam Likelihood</span>
                  <span className="text-sm font-bold" style={{ color: getRiskColor(getRiskGrade(patterns.scamLikelihood)) }}>
                    {patterns.scamLikelihood}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-dark-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${patterns.scamLikelihood}%`,
                      background: `linear-gradient(90deg, #22c55e, #eab308, #f97316, #ef4444)`,
                    }}
                  />
                </div>
                <p className="text-xs text-white/40 mt-2">{patterns.summary}</p>
              </div>
            )}

            {/* Tab navigation */}
            <div className="flex items-center gap-1 p-1 bg-dark-800 rounded-xl w-fit">
              {(['graph', 'patterns', 'transactions'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    activeTab === tab
                      ? 'bg-dark-600 text-white'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  {tab === 'graph' && <Network size={14} className="inline mr-1.5 -mt-0.5" />}
                  {tab === 'patterns' && <AlertTriangle size={14} className="inline mr-1.5 -mt-0.5" />}
                  {tab === 'transactions' && <BarChart3 size={14} className="inline mr-1.5 -mt-0.5" />}
                  {tab}
                </button>
              ))}

              {/* Color toggle */}
              {activeTab === 'graph' && (
                <div className="ml-4 flex items-center gap-2 text-xs text-white/50">
                  <span>Color:</span>
                  <button
                    onClick={() => setColorBy('role')}
                    className={`px-2 py-1 rounded ${colorBy === 'role' ? 'bg-dark-500 text-white' : 'hover:text-white/70'}`}
                  >
                    Role
                  </button>
                  <button
                    onClick={() => setColorBy('risk')}
                    className={`px-2 py-1 rounded ${colorBy === 'risk' ? 'bg-dark-500 text-white' : 'hover:text-white/70'}`}
                  >
                    Risk
                  </button>
                </div>
              )}
            </div>

            {/* Graph tab */}
            {activeTab === 'graph' && (
              <div className="glass-card rounded-xl overflow-hidden" style={{ height: 560 }}>
                <D3ForceGraph
                  graph={graph}
                  colorBy={colorBy}
                  highlightedEdges={highlightedEdges}
                  onNodeClick={setSelectedNodeAddress}
                />
              </div>
            )}

            {/* Patterns tab */}
            {activeTab === 'patterns' && !limits.patternDetection && (
              <div className="glass-card rounded-xl p-12 text-center">
                <AlertTriangle size={40} className="mx-auto mb-4 text-yellow-400/60" />
                <p className="text-white/70 text-lg font-medium">Pattern Detection Locked</p>
                <p className="text-white/40 text-sm mt-2">
                  {getUpgradeMessage('pattern detection')}
                </p>
              </div>
            )}
            {activeTab === 'patterns' && limits.patternDetection && (
              <div className="space-y-3">
                {patterns.patterns.length === 0 ? (
                  <div className="glass-card rounded-xl p-12 text-center">
                    <Shield size={40} className="mx-auto mb-4 text-green-400/60" />
                    <p className="text-white/70 text-lg font-medium">No Suspicious Patterns Detected</p>
                    <p className="text-white/40 text-sm mt-1">
                      The transaction graph does not exhibit known scam topologies.
                    </p>
                  </div>
                ) : (
                  patterns.patterns.map((pattern, i) => (
                    <div
                      key={i}
                      className="glass-card rounded-xl overflow-hidden transition-all"
                      onMouseEnter={() => handlePatternHover(pattern)}
                      onMouseLeave={() => handlePatternHover(null)}
                    >
                      <button
                        onClick={() => setExpandedPattern(expandedPattern === i ? null : i)}
                        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
                      >
                        <div
                          className="p-2 rounded-lg"
                          style={{
                            background: `${
                              pattern.severity === 'critical'
                                ? '#ef4444'
                                : pattern.severity === 'high'
                                  ? '#f97316'
                                  : pattern.severity === 'medium'
                                    ? '#eab308'
                                    : '#22c55e'
                            }20`,
                          }}
                        >
                          <PatternIcon type={pattern.type} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{pattern.label}</span>
                            <SeverityBadge severity={pattern.severity} />
                            <span className="text-xs text-white/40">
                              {pattern.confidence}% confidence
                            </span>
                          </div>
                          <p className="text-xs text-white/50 mt-0.5 line-clamp-1">
                            {pattern.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTab('graph');
                              setHighlightedEdges(new Set(pattern.involvedEdges));
                            }}
                            className="p-1.5 rounded-lg bg-dark-600 hover:bg-dark-500 text-white/50 hover:text-white transition-colors"
                            title="View in graph"
                          >
                            <Eye size={14} />
                          </button>
                          {expandedPattern === i ? (
                            <ChevronUp size={16} className="text-white/40" />
                          ) : (
                            <ChevronDown size={16} className="text-white/40" />
                          )}
                        </div>
                      </button>

                      {expandedPattern === i && (
                        <div className="px-4 pb-4 border-t border-white/5 pt-3 animate-fade-in">
                          <p className="text-sm text-white/60 mb-3">{pattern.description}</p>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="text-white/40 uppercase tracking-wider mb-1">
                                Involved Wallets
                              </p>
                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                {pattern.involvedWallets.slice(0, 10).map((w) => (
                                  <p key={w} className="font-mono text-cyber-green/80 truncate">
                                    {w}
                                  </p>
                                ))}
                                {pattern.involvedWallets.length > 10 && (
                                  <p className="text-white/30">
                                    +{pattern.involvedWallets.length - 10} more
                                  </p>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-white/40 uppercase tracking-wider mb-1">Metadata</p>
                              <pre className="text-white/50 bg-dark-800 rounded-lg p-2 overflow-x-auto">
                                {JSON.stringify(pattern.metadata, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Transactions tab */}
            {activeTab === 'transactions' && (
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">
                    Transaction History ({transactions.length})
                  </h3>
                  <button
                    onClick={() => {
                      // Quick CSV export
                      const headers = 'hash,from,to,value,timestamp,chain,direction\n';
                      const rows = transactions
                        .map(
                          (tx) =>
                            `${tx.hash},${tx.from},${tx.to},${tx.value},${new Date(tx.timestamp * 1000).toISOString()},${tx.chain},${tx.direction}`,
                        )
                        .join('\n');
                      const blob = new Blob([headers + rows], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `scamtrace-txs-${address.slice(0, 10)}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-600 hover:bg-dark-500 text-white/60 hover:text-white text-xs transition-colors"
                  >
                    <Download size={12} />
                    Export CSV
                  </button>
                </div>
                <TransactionTable transactions={transactions} chain={chain} />
              </div>
            )}

            {/* Graph legend */}
            {activeTab === 'graph' && (
              <div className="glass-card rounded-xl p-4">
                <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Legend</p>
                <div className="flex flex-wrap gap-4 text-xs">
                  {colorBy === 'role'
                    ? (['suspect', 'connected', 'bystander', 'unaffected'] as const).map((role) => (
                        <div key={role} className="flex items-center gap-1.5">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ background: getRoleColor(role) }}
                          />
                          <span className="text-white/60 capitalize">{role}</span>
                        </div>
                      ))
                    : (['critical', 'high', 'moderate', 'low'] as const).map((grade) => (
                        <div key={grade} className="flex items-center gap-1.5">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ background: getRiskColor(grade) }}
                          />
                          <span className="text-white/60 capitalize">{grade}</span>
                        </div>
                      ))}
                </div>
              </div>
            )}

            {/* Selected node details */}
            {selectedNodeAddress && graph.nodes.get(selectedNodeAddress) && (
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-white">Wallet Details</h3>
                  <button
                    onClick={() => setSelectedNodeAddress(null)}
                    className="text-xs text-white/40 hover:text-white"
                  >
                    Clear
                  </button>
                </div>
                {(() => {
                  const node = graph.nodes.get(selectedNodeAddress)!;
                  const grade = getRiskGrade(node.riskScore);
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-white/40 mb-1">Address</p>
                        <p className="font-mono text-cyber-green break-all text-xs">{node.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-1">Role / Risk</p>
                        <p>
                          <span className="capitalize" style={{ color: getRoleColor(node.role) }}>
                            {node.role}
                          </span>
                          {' / '}
                          <span className="font-bold" style={{ color: getRiskColor(grade) }}>
                            {node.riskScore}/100
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-1">Total In / Out</p>
                        <p className="text-white/80">
                          {node.totalIn.toFixed(4)} / {node.totalOut.toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-1">Centrality</p>
                        <p className="text-white/80">
                          B: {node.betweennessCentrality.toFixed(4)} / C:{' '}
                          {node.closenessCentrality.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
