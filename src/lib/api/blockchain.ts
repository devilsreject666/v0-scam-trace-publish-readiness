// Real Blockchain API Service
// Uses Blockchair API for BTC/ETH lookups

export interface BlockchainAddressData {
  address: string;
  chain: 'bitcoin' | 'ethereum';
  balance: number;
  balanceUSD: number;
  totalReceived: number;
  totalSent: number;
  transactionCount: number;
  firstSeen: string | null;
  lastSeen: string | null;
  transactions: BlockchainTransaction[];
  riskScore: number;
  riskFactors: string[];
  isContract?: boolean;
}

export interface BlockchainTransaction {
  hash: string;
  blockHeight: number;
  time: string;
  inputValue: number;
  outputValue: number;
  fee: number;
  isIncoming: boolean;
  counterparties: string[];
}

interface BlockchairBTCAddress {
  address: {
    balance: number;
    received: number;
    spent: number;
    transaction_count: number;
    first_seen_receiving: string | null;
    last_seen_receiving: string | null;
  };
  transactions: string[];
}

interface BlockchairETHAddress {
  address: {
    balance: string;
    received_approximate: string;
    spent_approximate: string;
    transaction_count: number;
    first_seen_receiving: string | null;
    last_seen_receiving: string | null;
    type: string;
  };
  transactions: Array<{
    hash: string;
    block_id: number;
    time: string;
    value: string;
    sender: string;
    recipient: string;
  }>;
}

// Known mixer/high-risk addresses for risk scoring
const HIGH_RISK_PATTERNS = [
  'tornado', 'mixer', 'wasabi', 'coinjoin', 'chipmixer',
  'blender', 'sinbad', 'bestmixer', 'helix'
];

const KNOWN_EXCHANGE_PATTERNS = [
  'binance', 'coinbase', 'kraken', 'bitfinex', 'huobi',
  'okx', 'kucoin', 'bybit', 'ftx', 'gemini'
];

function calculateRiskScore(data: {
  transactionCount: number;
  age: number; // days
  balance: number;
  avgTxSize: number;
  hasHighRiskInteraction: boolean;
}): { score: number; factors: string[] } {
  let score = 20; // Base risk
  const factors: string[] = [];

  // New address (less than 30 days)
  if (data.age < 30) {
    score += 25;
    factors.push('New address (< 30 days old)');
  } else if (data.age < 90) {
    score += 10;
    factors.push('Relatively new address (< 90 days)');
  }

  // High transaction velocity
  if (data.transactionCount > 100 && data.age < 30) {
    score += 30;
    factors.push('Unusually high transaction velocity');
  }

  // Large balance with few transactions (potential consolidation)
  if (data.balance > 10000 && data.transactionCount < 5) {
    score += 20;
    factors.push('Large balance with minimal activity');
  }

  // Very small transactions (potential dusting)
  if (data.avgTxSize < 0.001) {
    score += 15;
    factors.push('Micro-transactions detected (possible dusting)');
  }

  // High risk interactions
  if (data.hasHighRiskInteraction) {
    score += 35;
    factors.push('Interaction with known high-risk addresses');
  }

  // No recent activity
  if (data.age > 365 && data.transactionCount > 0) {
    score -= 10;
    factors.push('Established address with history');
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    factors: factors.length > 0 ? factors : ['Standard activity profile']
  };
}

export async function lookupBitcoinAddress(address: string): Promise<BlockchainAddressData> {
  try {
    // Use Blockchair API
    const response = await fetch(
      `https://api.blockchair.com/bitcoin/dashboards/address/${address}?limit=10`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data[address]) {
      throw new Error('Address not found');
    }

    const addressData: BlockchairBTCAddress = data.data[address];
    const btcPrice = data.context?.market_price_usd || 65000;

    // Calculate balance in BTC (satoshis to BTC)
    const balanceBTC = addressData.address.balance / 100000000;
    const receivedBTC = addressData.address.received / 100000000;
    const sentBTC = addressData.address.spent / 100000000;

    // Calculate age
    const firstSeen = addressData.address.first_seen_receiving;
    const age = firstSeen 
      ? Math.floor((Date.now() - new Date(firstSeen).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Risk calculation
    const riskResult = calculateRiskScore({
      transactionCount: addressData.address.transaction_count,
      age,
      balance: balanceBTC * btcPrice,
      avgTxSize: receivedBTC / Math.max(1, addressData.address.transaction_count),
      hasHighRiskInteraction: false // Would need deeper analysis
    });

    return {
      address,
      chain: 'bitcoin',
      balance: balanceBTC,
      balanceUSD: balanceBTC * btcPrice,
      totalReceived: receivedBTC,
      totalSent: sentBTC,
      transactionCount: addressData.address.transaction_count,
      firstSeen: addressData.address.first_seen_receiving,
      lastSeen: addressData.address.last_seen_receiving,
      transactions: [], // Would need separate API call for full tx details
      riskScore: riskResult.score,
      riskFactors: riskResult.factors
    };
  } catch (error) {
    console.error('Bitcoin lookup error:', error);
    throw error;
  }
}

export async function lookupEthereumAddress(address: string): Promise<BlockchainAddressData> {
  try {
    // Use Blockchair API for Ethereum
    const response = await fetch(
      `https://api.blockchair.com/ethereum/dashboards/address/${address}?limit=10&erc_20=true`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data[address.toLowerCase()]) {
      throw new Error('Address not found');
    }

    const addressData: BlockchairETHAddress = data.data[address.toLowerCase()];
    const ethPrice = data.context?.market_price_usd || 3500;

    // Balance in ETH (wei to ETH)
    const balanceETH = parseFloat(addressData.address.balance) / 1e18;
    const receivedETH = parseFloat(addressData.address.received_approximate) / 1e18;
    const spentETH = parseFloat(addressData.address.spent_approximate) / 1e18;

    // Calculate age
    const firstSeen = addressData.address.first_seen_receiving;
    const age = firstSeen 
      ? Math.floor((Date.now() - new Date(firstSeen).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Check if it's a contract
    const isContract = addressData.address.type === 'contract';

    // Risk calculation
    const riskResult = calculateRiskScore({
      transactionCount: addressData.address.transaction_count,
      age,
      balance: balanceETH * ethPrice,
      avgTxSize: receivedETH / Math.max(1, addressData.address.transaction_count),
      hasHighRiskInteraction: false
    });

    // Adjust risk for contracts
    if (isContract) {
      riskResult.factors.push('Smart contract address detected');
      riskResult.score = Math.min(100, riskResult.score + 10);
    }

    // Map transactions
    const transactions: BlockchainTransaction[] = (addressData.transactions || []).slice(0, 10).map(tx => ({
      hash: tx.hash,
      blockHeight: tx.block_id,
      time: tx.time,
      inputValue: parseFloat(tx.value) / 1e18,
      outputValue: parseFloat(tx.value) / 1e18,
      fee: 0,
      isIncoming: tx.recipient.toLowerCase() === address.toLowerCase(),
      counterparties: [tx.sender.toLowerCase() === address.toLowerCase() ? tx.recipient : tx.sender]
    }));

    return {
      address,
      chain: 'ethereum',
      balance: balanceETH,
      balanceUSD: balanceETH * ethPrice,
      totalReceived: receivedETH,
      totalSent: spentETH,
      transactionCount: addressData.address.transaction_count,
      firstSeen: addressData.address.first_seen_receiving,
      lastSeen: addressData.address.last_seen_receiving,
      transactions,
      riskScore: riskResult.score,
      riskFactors: riskResult.factors,
      isContract
    };
  } catch (error) {
    console.error('Ethereum lookup error:', error);
    throw error;
  }
}

export function detectAddressType(address: string): 'bitcoin' | 'ethereum' | 'unknown' {
  // Bitcoin addresses
  if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) {
    return 'bitcoin';
  }
  // Bitcoin Bech32
  if (/^bc1[a-z0-9]{39,59}$/i.test(address)) {
    return 'bitcoin';
  }
  // Ethereum addresses
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return 'ethereum';
  }
  return 'unknown';
}

export async function lookupAddress(address: string): Promise<BlockchainAddressData> {
  const type = detectAddressType(address);
  
  if (type === 'bitcoin') {
    return lookupBitcoinAddress(address);
  } else if (type === 'ethereum') {
    return lookupEthereumAddress(address);
  } else {
    throw new Error('Unsupported address format. Please enter a valid Bitcoin or Ethereum address.');
  }
}

// Fetch live blockchain stats for the hero demo
export async function fetchLiveBlockchainStats(): Promise<{
  btcPrice: number;
  ethPrice: number;
  btcBlockHeight: number;
  ethBlockHeight: number;
  btcTxLast24h: number;
  ethTxLast24h: number;
}> {
  try {
    const [btcStats, ethStats] = await Promise.all([
      fetch('https://api.blockchair.com/bitcoin/stats').then(r => r.json()),
      fetch('https://api.blockchair.com/ethereum/stats').then(r => r.json())
    ]);

    return {
      btcPrice: btcStats.data?.market_price_usd || 65000,
      ethPrice: ethStats.data?.market_price_usd || 3500,
      btcBlockHeight: btcStats.data?.blocks || 850000,
      ethBlockHeight: ethStats.data?.blocks || 20000000,
      btcTxLast24h: btcStats.data?.transactions_24h || 400000,
      ethTxLast24h: ethStats.data?.transactions_24h || 1200000
    };
  } catch {
    // Return fallback data
    return {
      btcPrice: 65000,
      ethPrice: 3500,
      btcBlockHeight: 850000,
      ethBlockHeight: 20000000,
      btcTxLast24h: 400000,
      ethTxLast24h: 1200000
    };
  }
}
