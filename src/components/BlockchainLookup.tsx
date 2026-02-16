import { useState } from 'react';
import { Search, ExternalLink, AlertTriangle, CheckCircle2, Clock, ArrowRight, Loader2 } from 'lucide-react';

interface TxResult {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  isError: string;
  gasUsed: string;
  blockNumber: string;
}

interface BalanceResult {
  balance: string;
  address: string;
}

export function BlockchainLookup({ caseId }: { caseId: string }) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'address' | 'tx'>('address');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<TxResult[]>([]);
  const [balance, setBalance] = useState<BalanceResult | null>(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const ETHERSCAN_API = 'https://api.etherscan.io/api';
  // Free tier API key for demo -- users should set their own
  const API_KEY = 'YourApiKeyToken';

  const lookupAddress = async (address: string) => {
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      // Fetch balance
      const balRes = await fetch(`${ETHERSCAN_API}?module=account&action=balance&address=${address}&tag=latest&apikey=${API_KEY}`);
      const balData = await balRes.json();

      if (balData.status === '1') {
        const ethBalance = (parseInt(balData.result) / 1e18).toFixed(6);
        setBalance({ balance: ethBalance, address });
      }

      // Fetch recent transactions
      const txRes = await fetch(`${ETHERSCAN_API}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc&apikey=${API_KEY}`);
      const txData = await txRes.json();

      if (txData.status === '1' && Array.isArray(txData.result)) {
        setTransactions(txData.result.slice(0, 20));
      } else {
        setTransactions([]);
      }
    } catch {
      setError('Failed to fetch blockchain data. Check the address and try again.');
    }
    setLoading(false);
  };

  const lookupTx = async (hash: string) => {
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const res = await fetch(`${ETHERSCAN_API}?module=proxy&action=eth_getTransactionByHash&txhash=${hash}&apikey=${API_KEY}`);
      const data = await res.json();

      if (data.result) {
        const tx = data.result;
        setTransactions([{
          hash: tx.hash,
          from: tx.from,
          to: tx.to ?? 'Contract Creation',
          value: (parseInt(tx.value, 16) / 1e18).toFixed(6),
          timeStamp: '',
          isError: '0',
          gasUsed: parseInt(tx.gas, 16).toString(),
          blockNumber: parseInt(tx.blockNumber, 16).toString(),
        }]);
        setBalance(null);
      } else {
        setError('Transaction not found.');
      }
    } catch {
      setError('Failed to fetch transaction data.');
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setTransactions([]);
    setBalance(null);

    if (q.startsWith('0x') && q.length === 66) {
      setMode('tx');
      lookupTx(q);
    } else if (q.startsWith('0x') && q.length === 42) {
      setMode('address');
      lookupAddress(q);
    } else {
      setError('Enter a valid Ethereum address (0x... 42 chars) or transaction hash (0x... 66 chars).');
    }
  };

  const shortenAddr = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Enter Ethereum address (0x...) or transaction hash"
            className="w-full rounded-xl border border-white/10 bg-dark-800 py-3 pl-10 pr-4 text-sm text-white font-mono placeholder-slate-500 outline-none focus:border-cyber-green/50 transition"
          />
        </div>
        <button type="submit" disabled={loading}
          className="btn-primary text-sm px-6 py-3 flex items-center gap-2 whitespace-nowrap disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Lookup
        </button>
      </form>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Balance card */}
      {balance && (
        <div className="glass-card-premium rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-slate-400">Ethereum Address</h4>
            <a href={`https://etherscan.io/address/${balance.address}`} target="_blank" rel="noopener noreferrer"
              className="text-xs text-cyber-green hover:underline flex items-center gap-1">
              View on Etherscan <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <p className="text-xs text-slate-500 font-mono mb-2">{balance.address}</p>
          <div className="text-2xl font-bold text-white">{balance.balance} <span className="text-sm text-slate-400">ETH</span></div>
        </div>
      )}

      {/* Transactions */}
      {searched && !loading && transactions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-3">
            {mode === 'address' ? `Recent Transactions (${transactions.length})` : 'Transaction Details'}
          </h4>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {transactions.map((tx, i) => (
              <div key={i} className="glass-card rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {tx.isError === '0' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-cyber-green flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-cyber-red flex-shrink-0" />
                      )}
                      <span className="text-xs font-mono text-slate-300 truncate">{shortenAddr(tx.hash)}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>From: <span className="text-slate-300 font-mono">{shortenAddr(tx.from)}</span></span>
                      <span><ArrowRight className="h-3 w-3 inline" /></span>
                      <span>To: <span className="text-slate-300 font-mono">{shortenAddr(tx.to)}</span></span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-white">{parseFloat(tx.value || '0') > 0 ? `${parseFloat(tx.value).toFixed(4)} ETH` : '0 ETH'}</div>
                    {tx.timeStamp && (
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 justify-end mt-0.5">
                        <Clock className="h-3 w-3" />
                        {new Date(parseInt(tx.timeStamp) * 1000).toLocaleDateString()}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-600">Block #{tx.blockNumber}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {searched && !loading && transactions.length === 0 && !error && (
        <div className="text-center py-12 glass-card rounded-xl">
          <Search className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No transactions found</p>
          <p className="text-xs text-slate-500 mt-1">This address may have no activity or the API rate limit was reached.</p>
        </div>
      )}

      {!searched && (
        <div className="text-center py-12 glass-card rounded-xl">
          <Search className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Search the Ethereum blockchain</p>
          <p className="text-xs text-slate-500 mt-1">Enter an Ethereum address or transaction hash to view balance and transaction history.</p>
        </div>
      )}
    </div>
  );
}
