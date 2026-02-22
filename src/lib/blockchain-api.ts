/**
 * Unified multi-chain blockchain data ingestion layer.
 * Supports Ethereum, BSC, Polygon, Base, Arbitrum (EVM via Etherscan-compatible APIs)
 * and Bitcoin (Blockstream API).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Chain = 'ethereum' | 'bsc' | 'polygon' | 'base' | 'arbitrum' | 'bitcoin';

export interface NormalizedTx {
  hash: string;
  from: string;
  to: string;
  value: number;        // native units (ETH, BNB, MATIC, BTC, etc.)
  valueUsd: number;     // approximate USD at time of tx (0 if unknown)
  timestamp: number;    // unix seconds
  chain: Chain;
  asset: string;        // "ETH", "BNB", "MATIC", "BTC", etc.
  blockNumber: number;
  gasUsed?: number;
  isError?: boolean;
  direction: 'in' | 'out';
}

export interface FetchTxOptions {
  address: string;
  chain: Chain;
  startBlock?: number;
  endBlock?: number;
  page?: number;
  offset?: number;      // results per page (max 10000 for etherscan)
}

// ---------------------------------------------------------------------------
// Chain configuration
// ---------------------------------------------------------------------------

interface ChainConfig {
  name: string;
  explorerBase: string;
  apiBase: string;
  nativeAsset: string;
  decimals: number;
  envKey: string;
}

const CHAIN_CONFIGS: Record<Exclude<Chain, 'bitcoin'>, ChainConfig> = {
  ethereum: {
    name: 'Ethereum',
    explorerBase: 'https://etherscan.io',
    apiBase: 'https://api.etherscan.io/api',
    nativeAsset: 'ETH',
    decimals: 18,
    envKey: 'VITE_ETHERSCAN_API_KEY',
  },
  bsc: {
    name: 'BSC',
    explorerBase: 'https://bscscan.com',
    apiBase: 'https://api.bscscan.com/api',
    nativeAsset: 'BNB',
    decimals: 18,
    envKey: 'VITE_BSCSCAN_API_KEY',
  },
  polygon: {
    name: 'Polygon',
    explorerBase: 'https://polygonscan.com',
    apiBase: 'https://api.polygonscan.com/api',
    nativeAsset: 'MATIC',
    decimals: 18,
    envKey: 'VITE_POLYGONSCAN_API_KEY',
  },
  base: {
    name: 'Base',
    explorerBase: 'https://basescan.org',
    apiBase: 'https://api.basescan.org/api',
    nativeAsset: 'ETH',
    decimals: 18,
    envKey: 'VITE_BASESCAN_API_KEY',
  },
  arbitrum: {
    name: 'Arbitrum',
    explorerBase: 'https://arbiscan.io',
    apiBase: 'https://api.arbiscan.io/api',
    nativeAsset: 'ETH',
    decimals: 18,
    envKey: 'VITE_ARBISCAN_API_KEY',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getApiKey(chain: Exclude<Chain, 'bitcoin'>): string {
  const key = import.meta.env[CHAIN_CONFIGS[chain].envKey] ?? '';
  return key;
}

function weiToNative(weiStr: string, decimals: number): number {
  return parseFloat(weiStr) / Math.pow(10, decimals);
}

function satToBtc(sat: number): number {
  return sat / 1e8;
}

// ---------------------------------------------------------------------------
// EVM fetcher (Etherscan-compatible)
// ---------------------------------------------------------------------------

async function fetchEvmTransactions(opts: FetchTxOptions): Promise<NormalizedTx[]> {
  const chain = opts.chain as Exclude<Chain, 'bitcoin'>;
  const config = CHAIN_CONFIGS[chain];
  const apiKey = getApiKey(chain);

  const params = new URLSearchParams({
    module: 'account',
    action: 'txlist',
    address: opts.address,
    startblock: String(opts.startBlock ?? 0),
    endblock: String(opts.endBlock ?? 99999999),
    page: String(opts.page ?? 1),
    offset: String(opts.offset ?? 100),
    sort: 'asc',
  });

  if (apiKey) {
    params.set('apikey', apiKey);
  }

  const url = `${config.apiBase}?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${config.name} API error: ${response.status}`);

  const data = await response.json();
  if (data.status !== '1' || !Array.isArray(data.result)) {
    // status 0 with "No transactions found" is not an error
    if (data.message === 'No transactions found') return [];
    throw new Error(`${config.name} API: ${data.message ?? 'Unknown error'}`);
  }

  const addr = opts.address.toLowerCase();
  return data.result.map((tx: Record<string, string>) => ({
    hash: tx.hash,
    from: tx.from?.toLowerCase() ?? '',
    to: tx.to?.toLowerCase() ?? '',
    value: weiToNative(tx.value ?? '0', config.decimals),
    valueUsd: 0,
    timestamp: parseInt(tx.timeStamp ?? '0', 10),
    chain: opts.chain,
    asset: config.nativeAsset,
    blockNumber: parseInt(tx.blockNumber ?? '0', 10),
    gasUsed: parseInt(tx.gasUsed ?? '0', 10),
    isError: tx.isError === '1',
    direction: tx.from?.toLowerCase() === addr ? 'out' : 'in',
  }));
}

// ---------------------------------------------------------------------------
// Bitcoin fetcher (Blockstream)
// ---------------------------------------------------------------------------

interface BlockstreamVout {
  scriptpubkey_address?: string;
  value: number;
}

interface BlockstreamVin {
  prevout?: BlockstreamVout;
}

interface BlockstreamTx {
  txid: string;
  status: { block_height: number; block_time: number; confirmed: boolean };
  vin: BlockstreamVin[];
  vout: BlockstreamVout[];
}

async function fetchBitcoinTransactions(opts: FetchTxOptions): Promise<NormalizedTx[]> {
  const url = `https://blockstream.info/api/address/${opts.address}/txs`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Blockstream API error: ${response.status}`);

  const txs: BlockstreamTx[] = await response.json();
  const addr = opts.address.toLowerCase();

  return txs.map((tx) => {
    const inputAddresses = tx.vin.map((v) => v.prevout?.scriptpubkey_address?.toLowerCase() ?? '');
    const isOutgoing = inputAddresses.includes(addr);

    let value = 0;
    if (isOutgoing) {
      value = tx.vout.filter((v) => v.scriptpubkey_address?.toLowerCase() !== addr)
        .reduce((sum, v) => sum + v.value, 0);
    } else {
      value = tx.vout.filter((v) => v.scriptpubkey_address?.toLowerCase() === addr)
        .reduce((sum, v) => sum + v.value, 0);
    }

    const toAddr = isOutgoing
      ? (tx.vout.find((v) => v.scriptpubkey_address?.toLowerCase() !== addr)?.scriptpubkey_address ?? 'unknown')
      : addr;
    const fromAddr = isOutgoing
      ? addr
      : (inputAddresses.find((a) => a !== addr) ?? 'unknown');

    return {
      hash: tx.txid,
      from: fromAddr,
      to: toAddr,
      value: satToBtc(value),
      valueUsd: 0,
      timestamp: tx.status.block_time ?? 0,
      chain: 'bitcoin' as Chain,
      asset: 'BTC',
      blockNumber: tx.status.block_height ?? 0,
      direction: isOutgoing ? 'out' as const : 'in' as const,
    };
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function fetchTransactions(opts: FetchTxOptions): Promise<NormalizedTx[]> {
  if (opts.chain === 'bitcoin') {
    return fetchBitcoinTransactions(opts);
  }
  return fetchEvmTransactions(opts);
}

/**
 * Fetch all transactions with auto-pagination (EVM only, BTC returns first page).
 * Limit pages to prevent runaway requests.
 */
export async function fetchAllTransactions(
  address: string,
  chain: Chain,
  maxPages = 5,
): Promise<NormalizedTx[]> {
  const all: NormalizedTx[] = [];
  const pageSize = 100;

  for (let page = 1; page <= maxPages; page++) {
    const batch = await fetchTransactions({
      address,
      chain,
      page,
      offset: pageSize,
    });
    all.push(...batch);
    if (batch.length < pageSize) break;
  }

  return all;
}

/**
 * Returns chain info for UI display.
 */
export function getChainInfo(chain: Chain) {
  if (chain === 'bitcoin') {
    return { name: 'Bitcoin', asset: 'BTC', explorerBase: 'https://blockstream.info' };
  }
  const c = CHAIN_CONFIGS[chain];
  return { name: c.name, asset: c.nativeAsset, explorerBase: c.explorerBase };
}

export const SUPPORTED_CHAINS: Chain[] = ['ethereum', 'bsc', 'polygon', 'base', 'arbitrum', 'bitcoin'];
