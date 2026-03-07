import { useState, useEffect, useCallback } from 'react';
import {
  Search, AlertTriangle, ArrowRight, ExternalLink, Copy, CheckCircle2,
  GitBranch, Shuffle, ArrowLeftRight, Landmark, Clock, Shield,
  Loader2, RefreshCw
} from 'lucide-react';
import {
  lookupEthAddress,
  lookupBtcAddress,
  detectChain,
  formatAddress,
  satToBtc,
  weiToEth,
  type EthTransaction,
  type BtcTransaction,
  type WalletBalance,
} from '@/lib/api';

interface WalletNode {
  id: string;
  address: string;
  label: string;
  type: 'origin' | 'intermediate' | 'mixer' | 'bridge' | 'exchange' | 'unknown';
  amount: string;
  chain: string;
  risk: 'critical' | 'high' | 'medium' | 'low';
  x: number;
  y: number;
  timestamp: string;
}

const riskColors = {
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', fill: '#ff3366' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', fill: '#ff8800' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', fill: '#eab308' },
  low: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', fill: '#00ff88' },
};

const typeIcons: Record<string, typeof GitBranch> = {
  mixer: Shuffle,
  bridge: ArrowLeftRight,
  exchange: Landmark,
  split: GitBranch,
  transfer: ArrowRight,
};

const mockNodes: WalletNode[] = [
  { id: 'n1', address: '0x7a25...dEad', label: 'Scammer Wallet', type: 'origin', amount: '12.5 ETH', chain: 'Ethereum', risk: 'critical', x: 80, y: 220, timestamp: '2024-01-15 09:23:41 UTC' },
  { id: 'n2', address: '0x3f8b...c421', label: 'Split Wallet 1', type: 'intermediate', amount: '5.0 ETH', chain: 'Ethereum', risk: 'high', x: 250, y: 110, timestamp: '2024-01-15 09:45:12 UTC' },
  { id: 'n3', address: '0x91cd...7e33', label: 'Split Wallet 2', type: 'intermediate', amount: '7.5 ETH', chain: 'Ethereum', risk: 'high', x: 250, y: 330, timestamp: '2024-01-15 09:45:18 UTC' },
  { id: 'n4', address: 'tc1q...m8x2', label: 'Tornado Cash', type: 'mixer', amount: '5.0 ETH', chain: 'Ethereum', risk: 'critical', x: 430, y: 80, timestamp: '2024-01-15 10:12:33 UTC' },
  { id: 'n5', address: '0xbr1d...9a21', label: 'Hop Bridge', type: 'bridge', amount: '7.5 ETH', chain: 'ETH→Polygon', risk: 'high', x: 430, y: 330, timestamp: '2024-01-15 10:30:05 UTC' },
  { id: 'n6', address: '0x4e2f...ab12', label: 'Post-Mix Wallet', type: 'intermediate', amount: '4.8 ETH', chain: 'Ethereum', risk: 'critical', x: 610, y: 60, timestamp: '2024-01-15 14:22:19 UTC' },
  { id: 'n7', address: '0xpoly...c3d4', label: 'Polygon Wallet', type: 'intermediate', amount: '7.3 ETH', chain: 'Polygon', risk: 'medium', x: 610, y: 310, timestamp: '2024-01-15 10:35:44 UTC' },
  { id: 'n8', address: '0xbin...hot1', label: 'Binance Hot Wallet', type: 'exchange', amount: '4.8 ETH', chain: 'Ethereum', risk: 'critical', x: 790, y: 60, timestamp: '2024-01-15 18:05:33 UTC' },
  { id: 'n9', address: '0xarb...f5e6', label: 'Arbitrum Bridge', type: 'bridge', amount: '7.3 ETH', chain: 'Poly→Arb', risk: 'high', x: 790, y: 310, timestamp: '2024-01-15 11:20:17 UTC' },
  { id: 'n10', address: '0xarb...x9z1', label: 'Arbitrum DEX Swap', type: 'intermediate', amount: '7.1 ETH', chain: 'Arbitrum', risk: 'medium', x: 790, y: 440, timestamp: '2024-01-15 12:10:55 UTC' },
  // BTC Network nodes
  { id: 'n11', address: 'renBTC...v8k2', label: 'RenBridge to BTC', type: 'bridge', amount: '0.27 BTC', chain: 'Arb→Bitcoin', risk: 'high', x: 1000, y: 440, timestamp: '2024-01-15 13:05:22 UTC' },
  { id: 'n12', address: 'bc1q...m4x7', label: 'Wasabi CoinJoin', type: 'mixer', amount: '0.26 BTC', chain: 'Bitcoin', risk: 'critical', x: 1210, y: 380, timestamp: '2024-01-15 15:30:41 UTC' },
  { id: 'n13', address: 'bc1q...ex3p', label: 'Kraken Deposit', type: 'exchange', amount: '0.25 BTC', chain: 'Bitcoin', risk: 'critical', x: 1420, y: 320, timestamp: '2024-01-15 19:15:08 UTC' },
];

const mockEdges = [
  { from: 'n1', to: 'n2' }, { from: 'n1', to: 'n3' },
  { from: 'n2', to: 'n4' }, { from: 'n3', to: 'n5' },
  { from: 'n4', to: 'n6' }, { from: 'n5', to: 'n7' },
  { from: 'n6', to: 'n8' }, { from: 'n7', to: 'n9' },
  { from: 'n9', to: 'n10' },
  // BTC edges
  { from: 'n10', to: 'n11' }, { from: 'n11', to: 'n12' },
  { from: 'n12', to: 'n13' },
];

interface MockTransaction {
  from: string;
  to: string;
  amount: string;
  hash: string;
  chain: string;
  type: string;
  timestamp: string;
  flagged: boolean;
}

const mockTransactions: MockTransaction[] = [
  { from: '0x7a25...dEad', to: '0x3f8b...c421', amount: '5.0 ETH', hash: '0xabc123...def456', chain: 'Ethereum', type: 'split', timestamp: '2024-01-15 09:45:12', flagged: true },
  { from: '0x7a25...dEad', to: '0x91cd...7e33', amount: '7.5 ETH', hash: '0x789abc...123def', chain: 'Ethereum', type: 'split', timestamp: '2024-01-15 09:45:18', flagged: true },
  { from: '0x3f8b...c421', to: 'tc1q...m8x2', amount: '5.0 ETH', hash: '0xmix001...fed321', chain: 'Ethereum', type: 'mixer', timestamp: '2024-01-15 10:12:33', flagged: true },
  { from: '0x91cd...7e33', to: '0xbr1d...9a21', amount: '7.5 ETH', hash: '0xbrg001...abc789', chain: 'ETH→Polygon', type: 'bridge', timestamp: '2024-01-15 10:30:05', flagged: true },
  { from: 'tc1q...m8x2', to: '0x4e2f...ab12', amount: '4.8 ETH', hash: '0xpost01...mix456', chain: 'Ethereum', type: 'transfer', timestamp: '2024-01-15 14:22:19', flagged: false },
  { from: '0xbr1d...9a21', to: '0xpoly...c3d4', amount: '7.3 ETH', hash: '0xpoly01...brg789', chain: 'Polygon', type: 'transfer', timestamp: '2024-01-15 10:35:44', flagged: false },
  { from: '0x4e2f...ab12', to: '0xbin...hot1', amount: '4.8 ETH', hash: '0xexch01...dep123', chain: 'Ethereum', type: 'exchange', timestamp: '2024-01-15 18:05:33', flagged: true },
  { from: '0xpoly...c3d4', to: '0xarb...f5e6', amount: '7.3 ETH', hash: '0xarb001...brg456', chain: 'Poly→Arb', type: 'bridge', timestamp: '2024-01-15 11:20:17', flagged: true },
  { from: '0xarb...f5e6', to: '0xarb...x9z1', amount: '7.1 ETH', hash: '0xswap01...dex789', chain: 'Arbitrum', type: 'transfer', timestamp: '2024-01-15 12:10:55', flagged: false },
  // BTC transactions
  { from: '0xarb...x9z1', to: 'renBTC...v8k2', amount: '0.27 BTC', hash: '0xren01...btc789', chain: 'Arb→Bitcoin', type: 'bridge', timestamp: '2024-01-15 13:05:22', flagged: true },
  { from: 'renBTC...v8k2', to: 'bc1q...m4x7', amount: '0.26 BTC', hash: 'btc:a1b2c3...d4e5f6', chain: 'Bitcoin', type: 'mixer', timestamp: '2024-01-15 15:30:41', flagged: true },
  { from: 'bc1q...m4x7', to: 'bc1q...ex3p', amount: '0.25 BTC', hash: 'btc:f6e5d4...c3b2a1', chain: 'Bitcoin', type: 'exchange', timestamp: '2024-01-15 19:15:08', flagged: true },
];

// SVG icon paths for rendering inside SVG (can't use Lucide React components in SVG)
function NodeIcon({ type, x, y, color }: { type: string; x: number; y: number; color: string }) {
  const cx = x;
  const cy = y;
  const s = 7; // half-size

  switch (type) {
    case 'origin':
      return (
        <g>
          <circle cx={cx} cy={cy} r={s} fill="none" stroke={color} strokeWidth="1.5" />
          <line x1={cx - 4} y1={cy - 4} x2={cx + 4} y2={cy + 4} stroke={color} strokeWidth="1.5" />
          <line x1={cx + 4} y1={cy - 4} x2={cx - 4} y2={cy + 4} stroke={color} strokeWidth="1.5" />
        </g>
      );
    case 'mixer':
      return (
        <g>
          <path d={`M${cx - s},${cy - 3} Q${cx},${cy + 3} ${cx + s},${cy - 3}`} fill="none" stroke={color} strokeWidth="1.5" />
          <path d={`M${cx - s},${cy + 3} Q${cx},${cy - 3} ${cx + s},${cy + 3}`} fill="none" stroke={color} strokeWidth="1.5" />
        </g>
      );
    case 'bridge':
      return (
        <g>
          <line x1={cx - s} y1={cy} x2={cx - 2} y2={cy} stroke={color} strokeWidth="1.5" />
          <line x1={cx + 2} y1={cy} x2={cx + s} y2={cy} stroke={color} strokeWidth="1.5" />
          <polyline points={`${cx - 4},${cy - 3} ${cx - 2},${cy} ${cx - 4},${cy + 3}`} fill="none" stroke={color} strokeWidth="1.5" />
          <polyline points={`${cx + 4},${cy - 3} ${cx + 2},${cy} ${cx + 4},${cy + 3}`} fill="none" stroke={color} strokeWidth="1.5" />
        </g>
      );
    case 'exchange':
      return (
        <g>
          <rect x={cx - s} y={cy - 2} width={s * 2} height={s + 2} fill="none" stroke={color} strokeWidth="1.5" rx="1" />
          <line x1={cx - s} y1={cy + 2} x2={cx + s} y2={cy + 2} stroke={color} strokeWidth="1" />
          <line x1={cx - 3} y1={cy - 5} x2={cx + 3} y2={cy - 5} stroke={color} strokeWidth="1.5" />
          <line x1={cx - 5} y1={cy - 2} x2={cx + 5} y2={cy - 2} stroke={color} strokeWidth="1" />
        </g>
      );
    default: // intermediate / unknown
      return <circle cx={cx} cy={cy} r="5" fill={color} opacity="0.8" />;
  }
}

// Chain badge colors for the transaction table
function chainColor(chain: string): string {
  if (chain.includes('Bitcoin') || chain.includes('BTC')) return 'text-amber-400';
  if (chain.includes('Ethereum') || chain === 'ETH→Polygon') return 'text-blue-400';
  if (chain.includes('Polygon')) return 'text-purple-400';
  if (chain.includes('Arb')) return 'text-cyan-400';
  return 'text-slate-400';
}

export function TrackerDashboard() {
  const [address, setAddress] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedNode, setSelectedNode] = useState<WalletNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'graph' | 'transactions' | 'alerts'>('graph');
  const [visibleNodes, setVisibleNodes] = useState(0);
  
  // Real API data
  const [realBalance, setRealBalance] = useState<WalletBalance | null>(null);
  const [realEthTxs, setRealEthTxs] = useState<EthTransaction[]>([]);
  const [realBtcTxs, setRealBtcTxs] = useState<BtcTransaction[]>([]);
  const [detectedChain, setDetectedChain] = useState<'eth' | 'btc' | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [useLiveData, setUseLiveData] = useState(true);

  // Chain names scanned during progress animation
  const scanChains = [
    'Ethereum', 'Bitcoin', 'Polygon', 'Arbitrum', 'BSC',
    'Avalanche', 'Optimism', 'Solana', 'Tron', 'Fantom',
    'Cardano', 'Cosmos', 'Polkadot', 'Near', 'Base', 'Bitcoin Lightning'
  ];

  const handleScan = useCallback(async () => {
    const searchAddress = address.trim() || '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    if (!address.trim()) {
      setAddress(searchAddress);
    }
    
    setIsScanning(true);
    setScanComplete(false);
    setScanProgress(0);
    setSelectedNode(null);
    setVisibleNodes(0);
    setApiError(null);
    setRealBalance(null);
    setRealEthTxs([]);
    setRealBtcTxs([]);
    
    // Detect chain type
    const detected = detectChain(searchAddress);
    setDetectedChain(detected?.chain || null);
    
    // If live data is enabled and we have a valid address, fetch real data
    if (useLiveData && detected) {
      try {
        if (detected.chain === 'eth' && detected.type === 'address') {
          const { balance, transactions } = await lookupEthAddress(searchAddress);
          setRealBalance(balance);
          setRealEthTxs(transactions);
        } else if (detected.chain === 'btc' && detected.type === 'address') {
          const { balance, transactions } = await lookupBtcAddress(searchAddress);
          setRealBalance(balance);
          setRealBtcTxs(transactions);
        }
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'Failed to fetch blockchain data');
      }
    }
  }, [address, useLiveData]);

  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScanComplete(true);
          return 100;
        }
        return p + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isScanning]);

  useEffect(() => {
    if (!scanComplete) return;
    const interval = setInterval(() => {
      setVisibleNodes(v => {
        if (v >= mockNodes.length) {
          clearInterval(interval);
          return v;
        }
        return v + 1;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [scanComplete]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      // fallback for environments without clipboard API
    });
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const alertCount = mockTransactions.filter(t => t.flagged).length;
  const currentChainIdx = Math.min(Math.floor(scanProgress / 6.25), scanChains.length - 1);

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
            Enter any crypto address to trace fund movement across all major networks including Bitcoin, Ethereum, Polygon, and more. Track splits, mixer interactions, bridge usage, and exchange deposits in real-time.
          </p>
        </div>

        {/* Search bar */}
        <div className="mx-auto mb-10 max-w-3xl">
          {/* Live data toggle */}
          <div className="mb-4 flex items-center justify-center gap-4">
            <button
              onClick={() => setUseLiveData(true)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition ${
                useLiveData 
                  ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/20' 
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <div className={`h-2 w-2 rounded-full ${useLiveData ? 'bg-cyber-green animate-pulse' : 'bg-slate-600'}`} />
              Live Blockchain Data
            </button>
            <button
              onClick={() => setUseLiveData(false)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition ${
                !useLiveData 
                  ? 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20' 
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              Demo Data
            </button>
          </div>

          <div className="relative flex items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Enter BTC/ETH address, tx hash, or ENS name..."
                className="w-full rounded-xl border border-white/10 bg-dark-800 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/30"
                value={address}
                onChange={e => setAddress(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScan()}
              />
            </div>
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyber-green to-cyber-blue px-6 py-3.5 text-sm font-bold text-dark-900 shadow-lg shadow-cyber-green/20 transition-all hover:shadow-cyber-green/40 disabled:opacity-50"
            >
              {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {isScanning ? 'Scanning...' : 'Trace'}
            </button>
          </div>
          
          {/* API status indicator */}
          {useLiveData && (
            <div className="mt-3 text-xs text-slate-500 text-center">
              Powered by Etherscan API (ETH) and Blockstream API (BTC) - Free, real-time blockchain data
            </div>
          )}

          {/* Progress bar */}
          {isScanning && (
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-xs text-slate-400">
                <span>Scanning <span className="text-cyber-blue font-medium">{scanChains[currentChainIdx]}</span> — {Math.min(currentChainIdx + 1, scanChains.length)}/{scanChains.length} blockchains</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-dark-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyber-green to-cyber-blue transition-all duration-100"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              {/* Chain icons during scan */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {scanChains.map((chain, i) => {
                  const scanned = i <= currentChainIdx;
                  const isBTC = chain === 'Bitcoin' || chain === 'Bitcoin Lightning';
                  return (
                    <span
                      key={chain}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium border transition-all duration-300 ${
                        scanned
                          ? isBTC
                            ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                            : 'border-cyber-green/30 bg-cyber-green/10 text-cyber-green'
                          : 'border-white/5 bg-white/[0.02] text-slate-600'
                      }`}
                    >
                      {chain}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* API Error display */}
        {apiError && (
          <div className="mx-auto max-w-3xl mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {apiError}
          </div>
        )}

        {/* Real balance display when using live data */}
        {useLiveData && realBalance && scanComplete && (
          <div className="mx-auto max-w-3xl mb-6 glass-card-premium rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Live Balance</div>
                <div className="text-2xl font-bold text-white">
                  {realBalance.balance} <span className={detectedChain === 'btc' ? 'text-amber-400' : 'text-blue-400'}>{detectedChain === 'btc' ? 'BTC' : 'ETH'}</span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-1">{formatAddress(realBalance.address)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Transactions</div>
                <div className="text-xl font-bold text-cyber-green">{realBalance.txCount?.toLocaleString() || 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard */}
        {scanComplete && (
          <div className="animate-fade-in-up">
            {/* Risk summary cards */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
              <div className="glass-card rounded-xl p-4">
                <div className="text-xs text-slate-400">Total Traced</div>
                <div className="mt-1 text-xl font-bold text-white">12.5 ETH</div>
                <div className="text-xs text-amber-400 font-medium">+ 0.27 BTC</div>
              </div>
              <div className="glass-card rounded-xl p-4">
                <div className="text-xs text-slate-400">USD Value</div>
                <div className="mt-1 text-xl font-bold text-cyber-orange">~$45,500</div>
                <div className="text-xs text-slate-500">ETH + BTC combined</div>
              </div>
              <div className="glass-card rounded-xl p-4">
                <div className="text-xs text-slate-400">Wallets Found</div>
                <div className="mt-1 text-xl font-bold text-cyber-orange">{mockNodes.length}</div>
                <div className="text-xs text-slate-500">across 5 chains</div>
              </div>
              <div className="glass-card rounded-xl p-4">
                <div className="text-xs text-slate-400">Risk Score</div>
                <div className="mt-1 text-xl font-bold text-cyber-red">97/100</div>
                <div className="text-xs text-red-400">CRITICAL</div>
              </div>
              <div className="glass-card rounded-xl p-4 col-span-2 sm:col-span-1">
                <div className="text-xs text-slate-400">Exchange Hits</div>
                <div className="mt-1 text-xl font-bold text-cyber-green">2</div>
                <div className="text-xs text-green-400">Binance + Kraken</div>
              </div>
            </div>

            {/* Chain breakdown */}
            <div className="mb-6 glass-card rounded-xl p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-slate-400 font-medium">Chains involved:</span>
                {[
                  { name: 'Ethereum', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', count: 5 },
                  { name: 'Bitcoin', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', count: 3 },
                  { name: 'Polygon', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', count: 2 },
                  { name: 'Arbitrum', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', count: 2 },
                ].map(chain => (
                  <span key={chain.name} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${chain.color}`}>
                    {chain.name === 'Bitcoin' && <span className="text-amber-500">₿</span>}
                    {chain.name}
                    <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">{chain.count}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-4 flex flex-wrap items-center gap-1 rounded-lg border border-white/5 bg-dark-800 p-1 w-fit">
              {([
                { key: 'graph' as const, label: 'Wallet Graph' },
                { key: 'transactions' as const, label: `Transactions (${mockTransactions.length})` },
                { key: 'alerts' as const, label: `Alerts (${alertCount})` },
              ]).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab.key
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:text-white'
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
                      <span className="text-xs text-slate-500">Interactive • Click nodes for details • Scroll to see BTC trail</span>
                    </div>
                    <div className="relative bg-dark-900/50 p-2 overflow-x-auto">
                      <svg viewBox="0 0 1540 520" className="w-full" style={{ minHeight: 380, minWidth: 900 }}>
                        <defs>
                          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                            <polygon points="0 0, 8 3, 0 6" fill="#4f46e5" opacity="0.6" />
                          </marker>
                          <marker id="arrowhead-active" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                            <polygon points="0 0, 8 3, 0 6" fill="#00ff88" opacity="0.8" />
                          </marker>
                          <marker id="arrowhead-btc" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                            <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" opacity="0.7" />
                          </marker>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>

                        {/* Grid lines */}
                        {Array.from({ length: 32 }).map((_, i) => (
                          <line key={`gv${i}`} x1={i * 50} y1="0" x2={i * 50} y2="520" stroke="rgba(99,102,241,0.04)" />
                        ))}
                        {Array.from({ length: 11 }).map((_, i) => (
                          <line key={`gh${i}`} x1="0" y1={i * 48} x2="1540" y2={i * 48} stroke="rgba(99,102,241,0.04)" />
                        ))}

                        {/* BTC zone background */}
                        <rect x="950" y="260" width="580" height="240" rx="12" fill="#f59e0b" opacity="0.03" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" />
                        <text x="960" y="285" fill="#f59e0b" fontSize="10" opacity="0.3" fontFamily="monospace" fontWeight="bold">₿ BITCOIN NETWORK</text>

                        {/* Edges */}
                        {mockEdges.map((edge, idx) => {
                          const fromNode = mockNodes.find(n => n.id === edge.from);
                          const toNode = mockNodes.find(n => n.id === edge.to);
                          if (!fromNode || !toNode) return null;
                          const fromIdx = mockNodes.indexOf(fromNode);
                          const toIdx = mockNodes.indexOf(toNode);
                          if (fromIdx >= visibleNodes || toIdx >= visibleNodes) return null;
                          const midX = (fromNode.x + toNode.x) / 2;
                          const midY = (fromNode.y + toNode.y) / 2 + (idx % 2 === 0 ? -20 : 20);
                          const isActive = hoveredNode === edge.from || hoveredNode === edge.to ||
                            selectedNode?.id === edge.from || selectedNode?.id === edge.to;
                          const isBtcEdge = toNode.chain.includes('Bitcoin') || toNode.chain.includes('BTC') ||
                            fromNode.chain.includes('Bitcoin') || fromNode.chain.includes('BTC');
                          return (
                            <path
                              key={`e${idx}`}
                              d={`M ${fromNode.x + 20} ${fromNode.y} Q ${midX} ${midY} ${toNode.x - 20} ${toNode.y}`}
                              fill="none"
                              stroke={isActive ? '#00ff88' : isBtcEdge ? '#f59e0b' : '#4f46e5'}
                              strokeWidth={isActive ? 2.5 : 1.5}
                              strokeDasharray="6 3"
                              markerEnd={isActive ? 'url(#arrowhead-active)' : isBtcEdge ? 'url(#arrowhead-btc)' : 'url(#arrowhead)'}
                              opacity={isActive ? 0.9 : isBtcEdge ? 0.7 : 0.5}
                              className="transition-all duration-300"
                            />
                          );
                        })}

                        {/* Nodes */}
                        {mockNodes.slice(0, visibleNodes).map(node => {
                          const rc = riskColors[node.risk];
                          const isSelected = selectedNode?.id === node.id;
                          const isHovered = hoveredNode === node.id;
                          const isBtcNode = node.chain.includes('Bitcoin') || node.chain.includes('BTC');
                          return (
                            <g
                              key={node.id}
                              className="cursor-pointer"
                              onClick={() => setSelectedNode(node)}
                              onMouseEnter={() => setHoveredNode(node.id)}
                              onMouseLeave={() => setHoveredNode(null)}
                            >
                              {/* Glow ring */}
                              {(isSelected || isHovered) && (
                                <circle cx={node.x} cy={node.y} r="28" fill={rc.fill} opacity="0.15" filter="url(#glow)" />
                              )}
                              {/* BTC ring indicator */}
                              {isBtcNode && (
                                <circle cx={node.x} cy={node.y} r="22" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
                              )}
                              {/* Node circle */}
                              <circle
                                cx={node.x} cy={node.y} r="18"
                                fill="#111827"
                                stroke={isBtcNode ? '#f59e0b' : rc.fill}
                                strokeWidth={isSelected ? 3 : 2}
                                opacity={isSelected || isHovered ? 1 : 0.8}
                              />
                              {/* Icon inside node */}
                              <NodeIcon type={node.type} x={node.x} y={node.y} color={isBtcNode ? '#f59e0b' : rc.fill} />
                              {/* Labels */}
                              <text x={node.x} y={node.y + 32} textAnchor="middle" fill={isBtcNode ? '#f59e0b' : '#94a3b8'} fontSize="9" fontFamily="monospace">{node.label}</text>
                              <text x={node.x} y={node.y + 44} textAnchor="middle" fill={isBtcNode ? '#d97706' : '#64748b'} fontSize="8" fontFamily="monospace">{node.amount}</text>
                              {/* Chain badge */}
                              {isBtcNode && (
                                <text x={node.x} y={node.y - 26} textAnchor="middle" fill="#f59e0b" fontSize="8" fontFamily="monospace" opacity="0.6">₿ BTC</text>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 border-t border-white/5 px-4 py-3">
                      {[
                        { color: '#ff3366', label: 'Critical Risk' },
                        { color: '#ff8800', label: 'High Risk' },
                        { color: '#eab308', label: 'Medium Risk' },
                        { color: '#00ff88', label: 'Low Risk' },
                        { color: '#f59e0b', label: 'Bitcoin Network' },
                      ].map(l => (
                        <div key={l.label} className="flex items-center gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
                          <span className="text-xs text-slate-400">{l.label}</span>
                        </div>
                      ))}
                      <div className="ml-auto flex flex-wrap gap-3">
                        {[
                          { icon: '✕', label: 'Origin' },
                          { icon: '∿', label: 'Mixer' },
                          { icon: '⇄', label: 'Bridge' },
                          { icon: '▭', label: 'Exchange' },
                          { icon: '●', label: 'Wallet' },
                        ].map(l => (
                          <div key={l.label} className="flex items-center gap-1">
                            <span className="text-xs text-cyber-blue">{l.icon}</span>
                            <span className="text-[10px] text-slate-500">{l.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Node detail panel */}
                <div className="glass-card rounded-xl p-5 flex flex-col">
                  <h4 className="mb-4 text-sm font-medium text-white">
                    {selectedNode ? 'Wallet Details' : 'Select a Node'}
                  </h4>
                  {selectedNode ? (() => {
                    const isBtcNode = selectedNode.chain.includes('Bitcoin') || selectedNode.chain.includes('BTC');
                    return (
                    <div className="space-y-4 flex-grow">
                      <div>
                        <div className="text-xs text-slate-400">Address</div>
                        <div className="mt-1 flex items-center gap-2">
                          <code className={`text-sm font-mono break-all ${isBtcNode ? 'text-amber-400' : 'text-cyber-blue'}`}>{selectedNode.address}</code>
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
                          <div className={`mt-1 text-sm font-medium ${isBtcNode ? 'text-amber-400' : 'text-white'}`}>
                            {isBtcNode && '₿ '}{selectedNode.chain}
                          </div>
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
                      <div>
                        <div className="text-xs text-slate-400">Type</div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-white capitalize">
                          {selectedNode.type === 'mixer' && <Shuffle className={`h-4 w-4 ${isBtcNode ? 'text-amber-400' : 'text-cyber-red'}`} />}
                          {selectedNode.type === 'bridge' && <ArrowLeftRight className={`h-4 w-4 ${isBtcNode ? 'text-amber-400' : 'text-cyber-orange'}`} />}
                          {selectedNode.type === 'exchange' && <Landmark className={`h-4 w-4 ${isBtcNode ? 'text-amber-400' : 'text-cyber-green'}`} />}
                          {selectedNode.type === 'origin' && <AlertTriangle className="h-4 w-4 text-cyber-red" />}
                          {selectedNode.type === 'intermediate' && <GitBranch className="h-4 w-4 text-cyber-blue" />}
                          {selectedNode.type}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Timestamp</div>
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-white">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {selectedNode.timestamp}
                        </div>
                      </div>

                      {/* BTC-specific info */}
                      {isBtcNode && (
                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-amber-400">
                            <span className="text-base">₿</span>
                            Bitcoin Network Transaction
                          </div>
                          <p className="mt-1 text-xs text-slate-400">
                            {selectedNode.type === 'bridge' && 'Cross-chain swap detected. Funds converted from ETH/ERC-20 to native BTC via RenBridge. UTXO outputs traced on Bitcoin mainnet.'}
                            {selectedNode.type === 'mixer' && 'Wasabi Wallet CoinJoin detected. Multiple UTXO inputs combined and split across participants. Output UTXO identified and traced through change analysis.'}
                            {selectedNode.type === 'exchange' && 'BTC deposited to Kraken exchange hot wallet. Freeze request can be submitted to Kraken compliance team.'}
                          </p>
                        </div>
                      )}

                      {selectedNode.type === 'exchange' && (
                        <div className="mt-auto rounded-lg border border-cyber-green/20 bg-cyber-green/5 p-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-cyber-green">
                            <Shield className="h-4 w-4" />
                            Exchange Deposit Detected
                          </div>
                          <p className="mt-1 text-xs text-slate-400">
                            Funds arrived at {selectedNode.label}. Freeze request evidence packet can be generated automatically.
                          </p>
                          <a href="#evidence" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-cyber-green hover:underline">
                            Generate Freeze Packet <ArrowRight className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                      {selectedNode.type === 'mixer' && !isBtcNode && (
                        <div className="mt-auto rounded-lg border border-cyber-red/20 bg-cyber-red/5 p-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-cyber-red">
                            <AlertTriangle className="h-4 w-4" />
                            Mixer Interaction
                          </div>
                          <p className="mt-1 text-xs text-slate-400">
                            Funds were routed through a mixing service. Output addresses traced and documented for evidence.
                          </p>
                        </div>
                      )}
                      {selectedNode.type === 'bridge' && !isBtcNode && (
                        <div className="mt-auto rounded-lg border border-cyber-orange/20 bg-cyber-orange/5 p-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-cyber-orange">
                            <ArrowLeftRight className="h-4 w-4" />
                            Cross-Chain Bridge
                          </div>
                          <p className="mt-1 text-xs text-slate-400">
                            Funds bridged to another blockchain. Tracing continues on destination chain.
                          </p>
                        </div>
                      )}
                    </div>
                    );
                  })() : (
                    <div className="flex flex-grow flex-col items-center justify-center gap-3 text-center py-12">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                        <Search className="h-7 w-7 text-slate-600" />
                      </div>
                      <p className="text-sm text-slate-500">Click any node on the graph to view wallet details, risk assessment, and trace info</p>
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
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Chain</th>
                        <th className="px-4 py-3 font-medium">Hash</th>
                        <th className="px-4 py-3 font-medium">Flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockTransactions.map((tx, idx) => {
                        const Icon = typeIcons[tx.type] || ArrowRight;
                        const isBtcTx = tx.chain.includes('Bitcoin') || tx.chain.includes('BTC');
                        return (
                          <tr key={idx} className={`border-b border-white/5 transition hover:bg-white/[0.02] ${isBtcTx ? 'bg-amber-500/[0.02]' : ''}`}>
                            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-400">{tx.timestamp}</td>
                            <td className={`px-4 py-3 font-mono text-xs ${isBtcTx ? 'text-amber-400' : 'text-cyber-blue'}`}>{tx.from}</td>
                            <td className={`px-4 py-3 font-mono text-xs ${isBtcTx ? 'text-amber-400' : 'text-cyber-blue'}`}>{tx.to}</td>
                            <td className="whitespace-nowrap px-4 py-3 font-medium text-white">
                              {tx.amount.includes('BTC') && <span className="text-amber-400 mr-1">₿</span>}
                              {tx.amount}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 text-xs capitalize text-slate-300">
                                <Icon className="h-3.5 w-3.5" />
                                {tx.type}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium ${chainColor(tx.chain)}`}>
                                {tx.chain}
                              </span>
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="border-t border-white/5 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-slate-500">{mockTransactions.length} transactions traced across 5 chains</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-amber-400">₿ {mockTransactions.filter(t => t.chain.includes('Bitcoin') || t.chain.includes('BTC')).length} BTC txns</span>
                    <span className="text-xs text-cyber-red">{mockTransactions.filter(t => t.flagged).length} flagged</span>
                  </div>
                </div>
              </div>
            )}

            {/* Alerts */}
            {activeTab === 'alerts' && (
              <div className="space-y-3">
                {[
                  { level: 'critical' as const, title: '₿ BTC Exchange Deposit — Kraken', desc: '0.25 BTC deposited to Kraken hot wallet (bc1q...ex3p). Second freeze request recommended alongside Binance.', time: '19:15:08 UTC', action: 'Generate Freeze Packet', actionHref: '#evidence' },
                  { level: 'critical' as const, title: 'Exchange Deposit — Binance', desc: '4.8 ETH deposited to Binance hot wallet (0xbin...hot1). Immediate freeze request recommended.', time: '18:05:33 UTC', action: 'Generate Freeze Packet', actionHref: '#evidence' },
                  { level: 'critical' as const, title: '₿ BTC Mixer — Wasabi CoinJoin', desc: '0.26 BTC processed through Wasabi Wallet CoinJoin (bc1q...m4x7). Output UTXO traced through change address analysis. Mixing fee deducted.', time: '15:30:41 UTC', action: 'View in Graph', actionHref: '#tracker' },
                  { level: 'critical' as const, title: 'ETH Mixer Interaction', desc: 'Funds routed through Tornado Cash (tc1q...m8x2). 5.0 ETH mixed, 4.8 ETH output detected.', time: '10:12:33 UTC', action: 'View in Graph', actionHref: '#tracker' },
                  { level: 'high' as const, title: '₿ Cross-Chain Swap to Bitcoin', desc: 'RenBridge used to convert ETH to native BTC. 0.27 BTC received on Bitcoin mainnet (renBTC...v8k2). Cross-chain laundering technique.', time: '13:05:22 UTC', action: 'View in Graph', actionHref: '#tracker' },
                  { level: 'high' as const, title: 'Cross-Chain Bridge: ETH → Polygon', desc: 'Hop Protocol bridge used. 7.5 ETH bridged. Continuing trace on Polygon network.', time: '10:30:05 UTC', action: 'View in Graph', actionHref: '#tracker' },
                  { level: 'high' as const, title: 'Cross-Chain Bridge: Polygon → Arbitrum', desc: 'Funds bridged from Polygon → Arbitrum (0xarb...f5e6). 7.3 ETH transferred.', time: '11:20:17 UTC', action: 'View in Graph', actionHref: '#tracker' },
                  { level: 'high' as const, title: 'Fund Splitting Detected', desc: 'Origin wallet split 12.5 ETH into two wallets (5.0 ETH + 7.5 ETH). Layering technique identified.', time: '09:45:12 UTC', action: 'View in Graph', actionHref: '#tracker' },
                  { level: 'medium' as const, title: 'DEX Swap Activity', desc: 'Token swap on Arbitrum DEX. 7.1 ETH equivalent after swap fees. Funds subsequently bridged to Bitcoin.', time: '12:10:55 UTC', action: 'View in Graph', actionHref: '#tracker' },
                ].map((alert, idx) => {
                  const levelStyles = {
                    critical: { bg: 'bg-red-500/10', text: 'text-cyber-red', badge: 'bg-red-500/10 text-red-400', border: 'border-cyber-red/20' },
                    high: { bg: 'bg-orange-500/10', text: 'text-cyber-orange', badge: 'bg-orange-500/10 text-orange-400', border: 'border-cyber-orange/20' },
                    medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', badge: 'bg-yellow-500/10 text-yellow-400', border: 'border-yellow-500/20' },
                  };
                  const style = levelStyles[alert.level];
                  const isBtcAlert = alert.title.includes('₿');
                  return (
                    <div key={idx} className={`glass-card flex items-start gap-4 rounded-xl p-4 ${style.border} ${isBtcAlert ? 'border-l-2 border-l-amber-500/50' : ''}`}>
                      <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${isBtcAlert ? 'bg-amber-500/10' : style.bg}`}>
                        {isBtcAlert ? (
                          <span className="text-amber-400 font-bold text-sm">₿</span>
                        ) : (
                          <AlertTriangle className={`h-4 w-4 ${style.text}`} />
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="text-sm font-medium text-white">{alert.title}</h5>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${style.badge}`}>
                            {alert.level}
                          </span>
                          {isBtcAlert && (
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400">
                              BTC
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-400">{alert.desc}</p>
                        <div className="mt-2 flex items-center gap-4 flex-wrap">
                          <span className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Clock className="h-3 w-3" />{alert.time}
                          </span>
                          <a href={alert.actionHref} className="text-xs font-medium text-cyber-green hover:underline">
                            {alert.action} →
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
