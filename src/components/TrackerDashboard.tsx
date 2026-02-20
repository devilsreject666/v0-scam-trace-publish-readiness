import { useState, useCallback } from 'react';
import {
  Search, AlertTriangle, ArrowRight, ExternalLink, Copy, CheckCircle2,
  GitBranch, Shuffle, ArrowLeftRight, Landmark, Clock, Shield,
  Loader2, RefreshCw, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { ethAddressAnalysis, btcAddressAnalysis, type EthTx, type BtcTx } from '@/lib/api';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface WalletNode {
  id: string;
  address: string;
  label: string;
  type: 'origin' | 'intermediate' | 'exchange' | 'unknown';
  amount: string;
  chain: string;
  risk: 'critical' | 'high' | 'medium' | 'low';
  x: number;
  y: number;
  timestamp: string;
}

interface TrackerTransaction {
  from: string;
  to: string;
  amount: string;
  hash: string;
  chain: string;
  timestamp: string;
  flagged: boolean;
}

type DetectedChain = 'eth' | 'btc';
type ActiveTab = 'graph' | 'transactions' | 'alerts';

const riskColors = {
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', fill: '#ff3366' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', fill: '#ff8800' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', fill: '#eab308' },
  low: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', fill: '#00ff88' },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function shortenAddr(addr: string) {
  if (!addr) return '';
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function detectChain(q: string): DetectedChain | null {
  const s = q.trim();
  if (/^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(s)) return 'btc';
  if (/^0x[a-fA-F0-9]{40}$/.test(s)) return 'eth';
  return null;
}

function riskFromScore(score: number): 'critical' | 'high' | 'medium' | 'low' {
  if (score >= 70) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

/* ------------------------------------------------------------------ */
/*  Build wallet graph from real ETH transactions                      */
/* ------------------------------------------------------------------ */

function buildEthGraph(originAddress: string, txs: EthTx[], riskScore: number): { nodes: WalletNode[]; edges: { from: string; to: string }[]; transactions: TrackerTransaction[] } {
  const nodes: WalletNode[] = [];
  const edges: { from: string; to: string }[] = [];
  const transactions: TrackerTransaction[] = [];
  const addressMap = new Map<string, string>(); // address -> nodeId
  const originLower = originAddress.toLowerCase();

  // Origin node
  const originId = 'n0';
  addressMap.set(originLower, originId);
  nodes.push({
    id: originId, address: originAddress, label: 'Queried Wallet',
    type: 'origin', amount: '', chain: 'Ethereum',
    risk: riskFromScore(riskScore), x: 80, y: 250,
    timestamp: txs[0]?.timeStamp ? new Date(parseInt(txs[0].timeStamp) * 1000).toISOString() : '',
  });

  // Process transactions and build graph
  const uniqueCounterparties = new Map<string, { count: number; totalValue: number; lastTime: number }>();

  for (const tx of txs) {
    const counterparty = tx.from.toLowerCase() === originLower ? tx.to.toLowerCase() : tx.from.toLowerCase();
    const val = parseFloat(tx.value) / 1e18;
    const existing = uniqueCounterparties.get(counterparty);
    if (existing) {
      existing.count++;
      existing.totalValue += val;
      existing.lastTime = Math.max(existing.lastTime, parseInt(tx.timeStamp || '0'));
    } else {
      uniqueCounterparties.set(counterparty, { count: 1, totalValue: val, lastTime: parseInt(tx.timeStamp || '0') });
    }

    transactions.push({
      from: shortenAddr(tx.from),
      to: shortenAddr(tx.to),
      amount: `${(parseFloat(tx.value) / 1e18).toFixed(4)} ETH`,
      hash: tx.hash,
      chain: 'Ethereum',
      timestamp: tx.timeStamp ? new Date(parseInt(tx.timeStamp) * 1000).toLocaleString() : '',
      flagged: val > 1,
    });
  }

  // Take top 12 counterparties by total value
  const topCounterparties = [...uniqueCounterparties.entries()]
    .sort((a, b) => b[1].totalValue - a[1].totalValue)
    .slice(0, 12);

  const cols = Math.ceil(topCounterparties.length / 4);
  topCounterparties.forEach(([addr, info], idx) => {
    const nodeId = `n${idx + 1}`;
    addressMap.set(addr, nodeId);
    const col = Math.floor(idx / 4);
    const row = idx % 4;
    nodes.push({
      id: nodeId, address: addr, label: `Wallet ${idx + 1}`,
      type: info.count > 3 ? 'exchange' : 'intermediate',
      amount: `${info.totalValue.toFixed(4)} ETH`,
      chain: 'Ethereum',
      risk: info.totalValue > 5 ? 'high' : info.totalValue > 1 ? 'medium' : 'low',
      x: 280 + col * 200, y: 80 + row * 120,
      timestamp: info.lastTime ? new Date(info.lastTime * 1000).toISOString() : '',
    });
    edges.push({ from: originId, to: nodeId });
  });

  return { nodes, edges, transactions };
}

function buildBtcGraph(originAddress: string, txs: BtcTx[], riskScore: number): { nodes: WalletNode[]; edges: { from: string; to: string }[]; transactions: TrackerTransaction[] } {
  const nodes: WalletNode[] = [];
  const edges: { from: string; to: string }[] = [];
  const transactions: TrackerTransaction[] = [];

  const originId = 'n0';
  nodes.push({
    id: originId, address: originAddress, label: 'Queried Wallet',
    type: 'origin', amount: '', chain: 'Bitcoin',
    risk: riskFromScore(riskScore), x: 80, y: 250,
    timestamp: txs[0]?.status.block_time ? new Date(txs[0].status.block_time * 1000).toISOString() : '',
  });

  const counterparties = new Map<string, { count: number; totalSat: number }>();
  for (const tx of txs) {
    const totalOut = tx.vout.reduce((s, v) => s + v.value, 0);
    for (const vout of tx.vout) {
      const addr = vout.scriptpubkey_address;
      if (!addr || addr === originAddress) continue;
      const existing = counterparties.get(addr);
      if (existing) { existing.count++; existing.totalSat += vout.value; }
      else counterparties.set(addr, { count: 1, totalSat: vout.value });
    }
    transactions.push({
      from: shortenAddr(tx.vin[0]?.prevout?.scriptpubkey_address || 'coinbase'),
      to: shortenAddr(tx.vout[0]?.scriptpubkey_address || 'unknown'),
      amount: `${(totalOut / 1e8).toFixed(8)} BTC`,
      hash: tx.txid,
      chain: 'Bitcoin',
      timestamp: tx.status.block_time ? new Date(tx.status.block_time * 1000).toLocaleString() : 'Unconfirmed',
      flagged: tx.vin.length >= 5,
    });
  }

  const top = [...counterparties.entries()].sort((a, b) => b[1].totalSat - a[1].totalSat).slice(0, 12);
  top.forEach(([addr, info], idx) => {
    const nodeId = `n${idx + 1}`;
    nodes.push({
      id: nodeId, address: addr, label: `BTC Wallet ${idx + 1}`,
      type: info.count > 3 ? 'exchange' : 'intermediate',
      amount: `${(info.totalSat / 1e8).toFixed(8)} BTC`,
      chain: 'Bitcoin', risk: info.totalSat > 1e8 ? 'high' : 'low',
      x: 280 + Math.floor(idx / 4) * 200, y: 80 + (idx % 4) * 120,
      timestamp: '',
    });
    edges.push({ from: originId, to: nodeId });
  });

  return { nodes, edges, transactions };
}

/* ------------------------------------------------------------------ */
/*  SVG Node Icon                                                      */
/* ------------------------------------------------------------------ */

function NodeIcon({ type, x, y, color }: { type: string; x: number; y: number; color: string }) {
  const s = 7;
  switch (type) {
    case 'origin':
      return (
        <g>
          <circle cx={x} cy={y} r={s} fill="none" stroke={color} strokeWidth="1.5" />
          <line x1={x - 4} y1={y - 4} x2={x + 4} y2={y + 4} stroke={color} strokeWidth="1.5" />
          <line x1={x + 4} y1={y - 4} x2={x - 4} y2={y + 4} stroke={color} strokeWidth="1.5" />
        </g>
      );
    case 'exchange':
      return (
        <g>
          <rect x={x - s} y={y - 2} width={s * 2} height={s + 2} fill="none" stroke={color} strokeWidth="1.5" rx="1" />
          <line x1={x - s} y1={y + 2} x2={x + s} y2={y + 2} stroke={color} strokeWidth="1" />
        </g>
      );
    default:
      return <circle cx={x} cy={y} r="5" fill={color} opacity="0.8" />;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TrackerDashboard() {
  const [address, setAddress] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [selectedNode, setSelectedNode] = useState<WalletNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('graph');
  const [error, setError] = useState('');

  // Real data state
  const [chain, setChain] = useState<DetectedChain>('eth');
  const [nodes, setNodes] = useState<WalletNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<{ from: string; to: string }[]>([]);
  const [transactions, setTransactions] = useState<TrackerTransaction[]>([]);
  const [totalTraced, setTotalTraced] = useState('0');
  const [riskScore, setRiskScore] = useState(0);
  const [walletAge, setWalletAge] = useState('Unknown');
  const [balance, setBalance] = useState('0');

  const handleScan = useCallback(async () => {
    const input = address.trim();
    if (!input) return;

    const detected = detectChain(input);
    if (!detected) {
      setError('Enter a valid Ethereum (0x...) or Bitcoin (bc1.../1.../3...) address.');
      return;
    }

    setChain(detected);
    setIsScanning(true);
    setScanComplete(false);
    setSelectedNode(null);
    setError('');
    setNodes([]);
    setGraphEdges([]);
    setTransactions([]);

    try {
      if (detected === 'eth') {
        const analysis = await ethAddressAnalysis(input);
        const graph = buildEthGraph(input, analysis.recentTxs, analysis.riskScore);
        // Update origin node with balance
        if (graph.nodes.length > 0) {
          graph.nodes[0].amount = `${analysis.balance} ETH`;
        }
        setNodes(graph.nodes);
        setGraphEdges(graph.edges);
        setTransactions(graph.transactions);
        setTotalTraced(analysis.totalReceived);
        setRiskScore(analysis.riskScore);
        setWalletAge(analysis.walletAge);
        setBalance(analysis.balance);
      } else {
        const analysis = await btcAddressAnalysis(input);
        const graph = buildBtcGraph(input, analysis.recentTxs, analysis.riskScore);
        if (graph.nodes.length > 0) {
          graph.nodes[0].amount = `${analysis.balance} BTC`;
        }
        setNodes(graph.nodes);
        setGraphEdges(graph.edges);
        setTransactions(graph.transactions);
        setTotalTraced(analysis.balance);
        setRiskScore(analysis.riskScore);
        setWalletAge(analysis.walletAge);
        setBalance(analysis.balance);
      }
      setScanComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blockchain data. Check the address and try again.');
    } finally {
      setIsScanning(false);
    }
  }, [address]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const alertCount = transactions.filter(t => t.flagged).length;
  const isBtc = chain === 'btc';
  const unit = isBtc ? 'BTC' : 'ETH';

  return (
    <section id="tracker" className="relative py-24 grid-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-1/4 top-0 h-[500px] w-[500px] rounded-full bg-cyber-green/[0.03] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-green/20 bg-cyber-green/5 px-4 py-1.5">
            <span className="text-xs font-medium text-cyber-green">Live Investigation Dashboard</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Fund <span className="gradient-text">Tracker</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Enter any ETH or BTC address to trace fund movement using real blockchain data from Etherscan and Blockstream APIs.
          </p>
        </div>

        {/* Search bar */}
        <div className="mx-auto mb-10 max-w-3xl">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Enter ETH (0x...) or BTC (bc1.../1.../3...) address..."
                className="w-full rounded-xl border border-white/10 bg-dark-800 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/30"
                value={address}
                onChange={e => setAddress(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScan()}
              />
            </div>
            <button
              onClick={handleScan}
              disabled={isScanning || !address.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyber-green to-cyber-blue px-6 py-3.5 text-sm font-bold text-dark-900 shadow-lg shadow-cyber-green/20 transition-all hover:shadow-cyber-green/40 disabled:opacity-50"
            >
              {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {isScanning ? 'Scanning...' : 'Trace'}
            </button>
          </div>

          {/* Scanning indicator */}
          {isScanning && (
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-xs text-slate-400">
                <span>Fetching real blockchain data from {chain === 'eth' ? 'Etherscan' : 'Blockstream'}...</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-dark-700">
                <div className="h-full rounded-full bg-gradient-to-r from-cyber-green to-cyber-blue animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}
        </div>

        {/* Dashboard */}
        {scanComplete && (
          <div className="animate-fade-in-up">
            {/* Chain badge */}
            <div className="mb-4 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                isBtc ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}>
                {isBtc ? 'Bitcoin' : 'Ethereum'}
              </span>
              <span className="text-xs text-slate-500">Real-time data from {isBtc ? 'Blockstream' : 'Etherscan'} API</span>
            </div>

            {/* Risk summary cards */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
              <div className="glass-card rounded-xl p-4">
                <div className="text-xs text-slate-400">Balance</div>
                <div className="mt-1 text-xl font-bold text-white">{balance} {unit}</div>
              </div>
              <div className="glass-card rounded-xl p-4">
                <div className="text-xs text-slate-400">Total Received</div>
                <div className="mt-1 text-xl font-bold text-cyber-orange">{totalTraced} {unit}</div>
              </div>
              <div className="glass-card rounded-xl p-4">
                <div className="text-xs text-slate-400">Wallets Found</div>
                <div className="mt-1 text-xl font-bold text-cyber-orange">{nodes.length}</div>
                <div className="text-xs text-slate-500">{chain === 'eth' ? 'Ethereum' : 'Bitcoin'}</div>
              </div>
              <div className="glass-card rounded-xl p-4">
                <div className="text-xs text-slate-400">Risk Score</div>
                <div className={`mt-1 text-xl font-bold ${riskScore >= 70 ? 'text-cyber-red' : riskScore >= 40 ? 'text-cyber-orange' : 'text-cyber-green'}`}>{riskScore}/100</div>
                <div className={`text-xs ${riskScore >= 70 ? 'text-red-400' : riskScore >= 40 ? 'text-orange-400' : 'text-green-400'}`}>
                  {riskScore >= 70 ? 'CRITICAL' : riskScore >= 40 ? 'MEDIUM' : 'LOW'}
                </div>
              </div>
              <div className="glass-card rounded-xl p-4 col-span-2 sm:col-span-1">
                <div className="text-xs text-slate-400">Wallet Age</div>
                <div className="mt-1 text-xl font-bold text-white">{walletAge}</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-4 flex flex-wrap items-center gap-1 rounded-lg border border-white/5 bg-dark-800 p-1 w-fit">
              {([
                { key: 'graph' as ActiveTab, label: 'Wallet Graph' },
                { key: 'transactions' as ActiveTab, label: `Transactions (${transactions.length})` },
                { key: 'alerts' as ActiveTab, label: `Alerts (${alertCount})` },
              ]).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab.key ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <button
                onClick={() => { setScanComplete(false); setTimeout(() => handleScan(), 100); }}
                className="ml-2 rounded-md p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
                title="Re-scan"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {/* Graph View */}
            {activeTab === 'graph' && (
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <div className="glass-card overflow-hidden rounded-xl">
                    <div className="border-b border-white/5 px-4 py-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-white">Fund Flow Visualization</span>
                      <span className="text-xs text-slate-500">Real data | Click nodes for details</span>
                    </div>
                    <div className="relative bg-dark-900/50 p-2 overflow-x-auto">
                      {nodes.length > 0 ? (
                        <svg viewBox="0 0 900 520" className="w-full" style={{ minHeight: 380, minWidth: 600 }}>
                          <defs>
                            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                              <polygon points="0 0, 8 3, 0 6" fill={isBtc ? '#f59e0b' : '#4f46e5'} opacity="0.6" />
                            </marker>
                            <marker id="arrowhead-active" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                              <polygon points="0 0, 8 3, 0 6" fill="#00ff88" opacity="0.8" />
                            </marker>
                            <filter id="glow">
                              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                              <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>

                          {/* Grid */}
                          {Array.from({ length: 19 }).map((_, i) => (
                            <line key={`gv${i}`} x1={i * 50} y1="0" x2={i * 50} y2="520" stroke="rgba(99,102,241,0.04)" />
                          ))}
                          {Array.from({ length: 11 }).map((_, i) => (
                            <line key={`gh${i}`} x1="0" y1={i * 48} x2="900" y2={i * 48} stroke="rgba(99,102,241,0.04)" />
                          ))}

                          {/* Edges */}
                          {graphEdges.map((edge, idx) => {
                            const fromNode = nodes.find(n => n.id === edge.from);
                            const toNode = nodes.find(n => n.id === edge.to);
                            if (!fromNode || !toNode) return null;
                            const midX = (fromNode.x + toNode.x) / 2;
                            const midY = (fromNode.y + toNode.y) / 2 + (idx % 2 === 0 ? -20 : 20);
                            const isActive = hoveredNode === edge.from || hoveredNode === edge.to ||
                              selectedNode?.id === edge.from || selectedNode?.id === edge.to;
                            return (
                              <path
                                key={`e${idx}`}
                                d={`M ${fromNode.x + 20} ${fromNode.y} Q ${midX} ${midY} ${toNode.x - 20} ${toNode.y}`}
                                fill="none"
                                stroke={isActive ? '#00ff88' : isBtc ? '#f59e0b' : '#4f46e5'}
                                strokeWidth={isActive ? 2.5 : 1.5}
                                strokeDasharray="6 3"
                                markerEnd={isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                                opacity={isActive ? 0.9 : 0.5}
                                className="transition-all duration-300"
                              />
                            );
                          })}

                          {/* Nodes */}
                          {nodes.map(node => {
                            const rc = riskColors[node.risk];
                            const isSelected = selectedNode?.id === node.id;
                            const isHovered = hoveredNode === node.id;
                            return (
                              <g
                                key={node.id}
                                className="cursor-pointer"
                                onClick={() => setSelectedNode(node)}
                                onMouseEnter={() => setHoveredNode(node.id)}
                                onMouseLeave={() => setHoveredNode(null)}
                              >
                                {(isSelected || isHovered) && (
                                  <circle cx={node.x} cy={node.y} r="28" fill={rc.fill} opacity="0.15" filter="url(#glow)" />
                                )}
                                <circle
                                  cx={node.x} cy={node.y} r="18"
                                  fill="#111827"
                                  stroke={isBtc ? '#f59e0b' : rc.fill}
                                  strokeWidth={isSelected ? 3 : 2}
                                  opacity={isSelected || isHovered ? 1 : 0.8}
                                />
                                <NodeIcon type={node.type} x={node.x} y={node.y} color={isBtc ? '#f59e0b' : rc.fill} />
                                <text x={node.x} y={node.y + 32} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">{node.label}</text>
                                <text x={node.x} y={node.y + 44} textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">{node.amount}</text>
                              </g>
                            );
                          })}
                        </svg>
                      ) : (
                        <div className="flex items-center justify-center py-20 text-center">
                          <p className="text-sm text-slate-500">No graph data to display.</p>
                        </div>
                      )}
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 border-t border-white/5 px-4 py-3">
                      {[
                        { color: '#ff3366', label: 'Critical Risk' },
                        { color: '#ff8800', label: 'High Risk' },
                        { color: '#eab308', label: 'Medium Risk' },
                        { color: '#00ff88', label: 'Low Risk' },
                      ].map(l => (
                        <div key={l.label} className="flex items-center gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
                          <span className="text-xs text-slate-400">{l.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Node detail panel */}
                <div className="glass-card rounded-xl p-5 flex flex-col">
                  <h4 className="mb-4 text-sm font-medium text-white">
                    {selectedNode ? 'Wallet Details' : 'Select a Node'}
                  </h4>
                  {selectedNode ? (
                    <div className="space-y-4 flex-grow">
                      <div>
                        <div className="text-xs text-slate-400">Address</div>
                        <div className="mt-1 flex items-center gap-2">
                          <code className={`text-sm font-mono break-all ${isBtc ? 'text-amber-400' : 'text-cyber-blue'}`}>{selectedNode.address}</code>
                          <button onClick={() => copyToClipboard(selectedNode.address)} className="text-slate-400 hover:text-white flex-shrink-0">
                            {copiedHash === selectedNode.address ? <CheckCircle2 className="h-3.5 w-3.5 text-cyber-green" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-slate-400">Label</div>
                          <div className="mt-1 text-sm text-white">{selectedNode.label}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Chain</div>
                          <div className="mt-1 text-sm text-white">{selectedNode.chain}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Amount</div>
                          <div className="mt-1 text-sm text-white">{selectedNode.amount}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Risk</div>
                          <div className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${riskColors[selectedNode.risk].bg} ${riskColors[selectedNode.risk].text}`}>
                            {selectedNode.risk.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      {selectedNode.timestamp && (
                        <div>
                          <div className="text-xs text-slate-400">Timestamp</div>
                          <div className="mt-1 flex items-center gap-1.5 text-sm text-white">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {new Date(selectedNode.timestamp).toLocaleString()}
                          </div>
                        </div>
                      )}
                      <a href={isBtc ? `https://blockstream.info/address/${selectedNode.address}` : `https://etherscan.io/address/${selectedNode.address}`}
                        target="_blank" rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-cyber-blue hover:underline">
                        View on {isBtc ? 'Blockstream' : 'Etherscan'} <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ) : (
                    <div className="flex flex-grow flex-col items-center justify-center gap-3 text-center py-12">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                        <Search className="h-7 w-7 text-slate-600" />
                      </div>
                      <p className="text-sm text-slate-500">Click any node on the graph to view wallet details and risk assessment</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transaction list */}
            {activeTab === 'transactions' && (
              <div className="glass-card overflow-hidden rounded-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-xs text-slate-400">
                        <th className="px-4 py-3 font-medium">Time</th>
                        <th className="px-4 py-3 font-medium">From</th>
                        <th className="px-4 py-3 font-medium">To</th>
                        <th className="px-4 py-3 font-medium">Amount</th>
                        <th className="px-4 py-3 font-medium">Chain</th>
                        <th className="px-4 py-3 font-medium">Hash</th>
                        <th className="px-4 py-3 font-medium">Flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx, idx) => (
                        <tr key={idx} className={`border-b border-white/5 transition hover:bg-white/[0.02] ${isBtc ? 'bg-amber-500/[0.02]' : ''}`}>
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-400">{tx.timestamp}</td>
                          <td className={`px-4 py-3 font-mono text-xs ${isBtc ? 'text-amber-400' : 'text-cyber-blue'}`}>{tx.from}</td>
                          <td className={`px-4 py-3 font-mono text-xs ${isBtc ? 'text-amber-400' : 'text-cyber-blue'}`}>{tx.to}</td>
                          <td className="whitespace-nowrap px-4 py-3 font-medium text-white">{tx.amount}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium ${isBtc ? 'text-amber-400' : 'text-blue-400'}`}>{tx.chain}</span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => copyToClipboard(tx.hash)}
                              className="flex items-center gap-1 font-mono text-xs text-slate-400 hover:text-white transition"
                            >
                              {tx.hash.slice(0, 10)}...
                              {copiedHash === tx.hash ? (
                                <CheckCircle2 className="h-3 w-3 text-cyber-green" />
                              ) : (
                                <ExternalLink className="h-3 w-3" />
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            {tx.flagged ? (
                              <AlertTriangle className="h-4 w-4 text-cyber-red" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-slate-600" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="border-t border-white/5 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-slate-500">{transactions.length} real transactions traced on {isBtc ? 'Bitcoin' : 'Ethereum'}</span>
                  <span className="text-xs text-cyber-red">{alertCount} flagged</span>
                </div>
              </div>
            )}

            {/* Alerts */}
            {activeTab === 'alerts' && (
              <div className="space-y-3">
                {transactions.filter(t => t.flagged).length > 0 ? (
                  transactions.filter(t => t.flagged).map((tx, idx) => (
                    <div key={idx} className="glass-card flex items-start gap-4 rounded-xl p-4 border-red-500/20">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                        <AlertTriangle className="h-4 w-4 text-cyber-red" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="text-sm font-medium text-white">Flagged Transaction</h5>
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-red-500/10 text-red-400">HIGH VALUE</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          {tx.amount} transferred from {tx.from} to {tx.to} on {tx.chain}
                        </p>
                        <div className="mt-2 flex items-center gap-4 flex-wrap">
                          <span className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Clock className="h-3 w-3" />{tx.timestamp}
                          </span>
                          <button onClick={() => copyToClipboard(tx.hash)} className="text-xs font-medium text-cyber-green hover:underline">
                            Copy Hash
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="glass-card rounded-xl p-8 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-cyber-green mb-3" />
                    <p className="text-sm text-slate-400">No flagged transactions found for this address.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
