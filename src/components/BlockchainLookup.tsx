import { useState } from 'react';
import {
  Search, ExternalLink, AlertTriangle, CheckCircle2, Clock, ArrowRight,
  Loader2, Copy, Save, Wallet, ArrowUpRight, ArrowDownLeft, Hash, Link2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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

interface BtcTx {
  txid: string;
  status: { confirmed: boolean; block_height: number; block_time: number };
  vin: { prevout: { scriptpubkey_address: string; value: number } }[];
  vout: { scriptpubkey_address: string; value: number }[];
}

interface BalanceResult {
  balance: string;
  address: string;
  chain: 'eth' | 'btc';
  txCount?: number;
}

type Chain = 'eth' | 'btc';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const ETHERSCAN_API = 'https://api.etherscan.io/api';
const BLOCKSTREAM_API = 'https://blockstream.info/api';
// Etherscan free tier key -- users should provide their own via env
const ETH_KEY = import.meta.env.VITE_ETHERSCAN_KEY || 'YourApiKeyToken';

function detectChain(q: string): { chain: Chain; type: 'address' | 'tx' } | null {
  const s = q.trim();
  // BTC address (legacy, segwit, taproot)
  if (/^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(s)) return { chain: 'btc', type: 'address' };
  // BTC txid (64 hex chars, no 0x)
  if (/^[a-fA-F0-9]{64}$/.test(s)) return { chain: 'btc', type: 'tx' };
  // ETH address
  if (/^0x[a-fA-F0-9]{40}$/.test(s)) return { chain: 'eth', type: 'address' };
  // ETH tx hash
  if (/^0x[a-fA-F0-9]{64}$/.test(s)) return { chain: 'eth', type: 'tx' };
  return null;
}

function shortenAddr(addr: string) {
  if (!addr) return '';
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function satToBtc(sat: number) {
  return (sat / 1e8).toFixed(8);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BlockchainLookup({ caseId }: { caseId: string }) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [chain, setChain] = useState<Chain>('eth');
  const [loading, setLoading] = useState(false);
  const [ethTxs, setEthTxs] = useState<TxResult[]>([]);
  const [btcTxs, setBtcTxs] = useState<BtcTx[]>([]);
  const [balance, setBalance] = useState<BalanceResult | null>(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  /* ---------- ETH Lookups ---------- */
  const lookupEthAddress = async (address: string) => {
    const [balRes, txRes] = await Promise.all([
      fetch(`${ETHERSCAN_API}?module=account&action=balance&address=${address}&tag=latest&apikey=${ETH_KEY}`),
      fetch(`${ETHERSCAN_API}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=25&sort=desc&apikey=${ETH_KEY}`),
    ]);
    const [balData, txData] = await Promise.all([balRes.json(), txRes.json()]);
    if (balData.status === '1') {
      setBalance({ balance: (parseInt(balData.result) / 1e18).toFixed(6), address, chain: 'eth' });
    }
    if (txData.status === '1' && Array.isArray(txData.result)) {
      setEthTxs(txData.result.slice(0, 25));
    }
  };

  const lookupEthTx = async (hash: string) => {
    const res = await fetch(`${ETHERSCAN_API}?module=proxy&action=eth_getTransactionByHash&txhash=${hash}&apikey=${ETH_KEY}`);
    const data = await res.json();
    if (data.result) {
      const tx = data.result;
      setEthTxs([{
        hash: tx.hash,
        from: tx.from,
        to: tx.to ?? 'Contract Creation',
        value: (parseInt(tx.value, 16) / 1e18).toFixed(6),
        timeStamp: '',
        isError: '0',
        gasUsed: parseInt(tx.gas, 16).toString(),
        blockNumber: parseInt(tx.blockNumber, 16).toString(),
      }]);
    } else {
      setError('Transaction not found on Ethereum.');
    }
  };

  /* ---------- BTC Lookups ---------- */
  const lookupBtcAddress = async (address: string) => {
    const [statsRes, txRes] = await Promise.all([
      fetch(`${BLOCKSTREAM_API}/address/${address}`),
      fetch(`${BLOCKSTREAM_API}/address/${address}/txs`),
    ]);
    if (!statsRes.ok) throw new Error('BTC address not found');
    const stats = await statsRes.json();
    const funded = stats.chain_stats.funded_txo_sum ?? 0;
    const spent = stats.chain_stats.spent_txo_sum ?? 0;
    const bal = funded - spent;
    setBalance({
      balance: satToBtc(bal),
      address,
      chain: 'btc',
      txCount: stats.chain_stats.tx_count,
    });
    if (txRes.ok) {
      const txs: BtcTx[] = await txRes.json();
      setBtcTxs(txs.slice(0, 20));
    }
  };

  const lookupBtcTx = async (txid: string) => {
    const res = await fetch(`${BLOCKSTREAM_API}/tx/${txid}`);
    if (!res.ok) throw new Error('BTC transaction not found');
    const tx: BtcTx = await res.json();
    setBtcTxs([tx]);
  };

  /* ---------- Unified Search ---------- */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setEthTxs([]);
    setBtcTxs([]);
    setBalance(null);
    setError('');
    setSearched(true);
    setLoading(true);

    const detected = detectChain(q);
    if (!detected) {
      setError('Unrecognized format. Enter a valid Ethereum address (0x...40), ETH tx hash (0x...64), Bitcoin address (1.../3.../bc1...), or BTC txid (64 hex).');
      setLoading(false);
      return;
    }

    setChain(detected.chain);
    try {
      if (detected.chain === 'eth') {
        if (detected.type === 'address') await lookupEthAddress(q);
        else await lookupEthTx(q);
      } else {
        if (detected.type === 'address') await lookupBtcAddress(q);
        else await lookupBtcTx(q);
      }
    } catch {
      setError(`Failed to fetch ${detected.chain === 'eth' ? 'Ethereum' : 'Bitcoin'} data. Check the input and try again.`);
    }
    setLoading(false);
  };

  /* ---------- Save to evidence ---------- */
  const saveToEvidence = async (type: 'wallet' | 'transaction', label: string, value: string) => {
    if (!user) return;
    const { error: err } = await supabase.from('evidence').insert({
      case_id: caseId,
      user_id: user.id,
      type,
      label,
      value,
      tags: [chain === 'eth' ? 'ethereum' : 'bitcoin'],
    });
    if (!err) {
      setSaved(value);
      setTimeout(() => setSaved(null), 2000);
    }
  };

  const copyText = (t: string) => {
    navigator.clipboard.writeText(t).catch(() => {});
    setCopied(t);
    setTimeout(() => setCopied(null), 2000);
  };

  const hasTxs = ethTxs.length > 0 || btcTxs.length > 0;
  const txCount = chain === 'eth' ? ethTxs.length : btcTxs.length;

  return (
    <div>
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Enter ETH/BTC address or transaction hash..."
            className="w-full rounded-xl border border-white/10 bg-dark-800 py-3 pl-10 pr-4 text-sm text-white font-mono placeholder-slate-500 outline-none focus:border-cyber-green/50 transition"
          />
        </div>
        <button type="submit" disabled={loading}
          className="btn-primary text-sm px-6 py-3 flex items-center gap-2 whitespace-nowrap disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Lookup
        </button>
      </form>

      {/* Chain auto-detect badge */}
      {searched && !loading && !error && (
        <div className="mb-4 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
            chain === 'btc' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
          }`}>
            {chain === 'btc' ? <span className="text-amber-400 font-bold">{'B'}</span> : <span className="text-blue-400 font-bold">{'E'}</span>}
            {chain === 'btc' ? 'Bitcoin' : 'Ethereum'}
          </span>
          <span className="text-xs text-slate-500">Chain auto-detected</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Balance card */}
      {balance && (
        <div className="glass-card-premium rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              {balance.chain === 'btc' ? 'Bitcoin' : 'Ethereum'} Address
            </h4>
            <div className="flex items-center gap-2">
              <button onClick={() => saveToEvidence('wallet', `${balance.chain === 'btc' ? 'BTC' : 'ETH'} Wallet: ${shortenAddr(balance.address)}`, balance.address)}
                className="text-xs text-cyber-green hover:underline flex items-center gap-1">
                {saved === balance.address ? <CheckCircle2 className="h-3 w-3" /> : <Save className="h-3 w-3" />}
                {saved === balance.address ? 'Saved' : 'Save to Evidence'}
              </button>
              <a href={balance.chain === 'btc' ? `https://blockstream.info/address/${balance.address}` : `https://etherscan.io/address/${balance.address}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs text-cyber-blue hover:underline flex items-center gap-1">
                Explorer <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs text-slate-500 font-mono truncate">{balance.address}</p>
            <button onClick={() => copyText(balance.address)} className="flex-shrink-0 text-slate-500 hover:text-white">
              {copied === balance.address ? <CheckCircle2 className="h-3 w-3 text-cyber-green" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-white">{balance.balance}</span>
            <span className={`text-sm font-medium ${balance.chain === 'btc' ? 'text-amber-400' : 'text-blue-400'}`}>
              {balance.chain === 'btc' ? 'BTC' : 'ETH'}
            </span>
          </div>
          {balance.txCount != null && (
            <p className="text-xs text-slate-500 mt-1">{balance.txCount.toLocaleString()} total transactions</p>
          )}
        </div>
      )}

      {/* ETH Transactions */}
      {searched && !loading && chain === 'eth' && ethTxs.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
            <Hash className="h-4 w-4" /> Transactions ({ethTxs.length})
          </h4>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {ethTxs.map((tx, i) => {
              const isIncoming = balance?.address ? tx.to.toLowerCase() === balance.address.toLowerCase() : false;
              return (
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
                        <button onClick={() => copyText(tx.hash)} className="flex-shrink-0 text-slate-500 hover:text-white">
                          {copied === tx.hash ? <CheckCircle2 className="h-3 w-3 text-cyber-green" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          {isIncoming ? <ArrowDownLeft className="h-3 w-3 text-cyber-green" /> : <ArrowUpRight className="h-3 w-3 text-cyber-orange" />}
                          <span className="text-slate-300 font-mono">{shortenAddr(tx.from)}</span>
                        </span>
                        <ArrowRight className="h-3 w-3 text-slate-600" />
                        <span className="text-slate-300 font-mono">{shortenAddr(tx.to)}</span>
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
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                    <button onClick={() => saveToEvidence('transaction', `ETH TX: ${shortenAddr(tx.hash)}`, tx.hash)}
                      className="text-[10px] text-cyber-green hover:underline flex items-center gap-0.5">
                      {saved === tx.hash ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Save className="h-2.5 w-2.5" />}
                      {saved === tx.hash ? 'Saved' : 'Save'}
                    </button>
                    <a href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] text-cyber-blue hover:underline flex items-center gap-0.5">
                      <ExternalLink className="h-2.5 w-2.5" /> Etherscan
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BTC Transactions */}
      {searched && !loading && chain === 'btc' && btcTxs.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
            <Link2 className="h-4 w-4" /> Bitcoin Transactions ({btcTxs.length})
          </h4>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {btcTxs.map((tx, i) => {
              const totalIn = tx.vin.reduce((s, v) => s + (v.prevout?.value ?? 0), 0);
              const totalOut = tx.vout.reduce((s, v) => s + v.value, 0);
              const fee = totalIn - totalOut;
              return (
                <div key={i} className="glass-card rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {tx.status.confirmed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-cyber-green flex-shrink-0" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                        )}
                        <span className="text-xs font-mono text-amber-400 truncate">{shortenAddr(tx.txid)}</span>
                        <button onClick={() => copyText(tx.txid)} className="flex-shrink-0 text-slate-500 hover:text-white">
                          {copied === tx.txid ? <CheckCircle2 className="h-3 w-3 text-cyber-green" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {tx.status.confirmed ? `Block #${tx.status.block_height}` : 'Unconfirmed'}
                        {tx.status.block_time && ` | ${new Date(tx.status.block_time * 1000).toLocaleString()}`}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-amber-400">{satToBtc(totalOut)} BTC</div>
                      <div className="text-[10px] text-slate-500">Fee: {satToBtc(Math.max(0, fee))} BTC</div>
                    </div>
                  </div>

                  {/* Inputs / Outputs */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 mb-1 font-medium">Inputs ({tx.vin.length})</div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {tx.vin.slice(0, 5).map((v, j) => (
                          <div key={j} className="flex items-center justify-between gap-2 rounded-lg bg-dark-900/50 px-2 py-1">
                            <span className="font-mono text-slate-400 truncate">{shortenAddr(v.prevout?.scriptpubkey_address ?? 'coinbase')}</span>
                            <span className="text-amber-400 whitespace-nowrap">{v.prevout ? satToBtc(v.prevout.value) : '-'}</span>
                          </div>
                        ))}
                        {tx.vin.length > 5 && <div className="text-[10px] text-slate-600 pl-2">+{tx.vin.length - 5} more</div>}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 mb-1 font-medium">Outputs ({tx.vout.length})</div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {tx.vout.slice(0, 5).map((v, j) => (
                          <div key={j} className="flex items-center justify-between gap-2 rounded-lg bg-dark-900/50 px-2 py-1">
                            <span className="font-mono text-slate-400 truncate">{shortenAddr(v.scriptpubkey_address ?? 'OP_RETURN')}</span>
                            <span className="text-cyber-green whitespace-nowrap">{satToBtc(v.value)}</span>
                          </div>
                        ))}
                        {tx.vout.length > 5 && <div className="text-[10px] text-slate-600 pl-2">+{tx.vout.length - 5} more</div>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5">
                    <button onClick={() => saveToEvidence('transaction', `BTC TX: ${shortenAddr(tx.txid)}`, tx.txid)}
                      className="text-[10px] text-cyber-green hover:underline flex items-center gap-0.5">
                      {saved === tx.txid ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Save className="h-2.5 w-2.5" />}
                      {saved === tx.txid ? 'Saved' : 'Save'}
                    </button>
                    <a href={`https://blockstream.info/tx/${tx.txid}`} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5">
                      <ExternalLink className="h-2.5 w-2.5" /> Blockstream
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No results */}
      {searched && !loading && !hasTxs && !error && (
        <div className="text-center py-12 glass-card rounded-xl">
          <Search className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No transactions found</p>
          <p className="text-xs text-slate-500 mt-1">This address may have no activity or the API rate limit was reached.</p>
        </div>
      )}

      {/* Initial state */}
      {!searched && (
        <div className="text-center py-12 glass-card rounded-xl">
          <Search className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Search the blockchain</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Enter an Ethereum address, ETH tx hash, Bitcoin address, or BTC txid. The chain is auto-detected from the format.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-xs text-blue-400">
              <span className="font-bold">E</span> Ethereum (Etherscan API)
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <span className="font-bold">B</span> Bitcoin (Blockstream API)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
