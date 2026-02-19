import type { VercelRequest, VercelResponse } from '@vercel/node';

// Recursive fund tracer for ETH and BTC addresses
// Follows fund flows across multiple hops using Etherscan/Blockstream

const ETHERSCAN_API = 'https://api.etherscan.io/api';
const BLOCKSTREAM_API = 'https://blockstream.info/api';

interface TraceNode {
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

interface TraceEdge {
  from: string;
  to: string;
  amount: string;
  hash: string;
  chain: string;
  type: string;
  timestamp: string;
  flagged: boolean;
}

// Known exchange/mixer/bridge addresses for labeling
const KNOWN_LABELS: Record<string, { label: string; type: TraceNode['type'] }> = {
  // Ethereum exchanges
  '0x28c6c06298d514db089934071355e5743bf21d60': { label: 'Binance Hot Wallet', type: 'exchange' },
  '0x21a31ee1afc51d94c2efccaa2092ad1028285549': { label: 'Binance Hot Wallet 2', type: 'exchange' },
  '0xdfd5293d8e347dfe59e90efd55b2956a1343963d': { label: 'Binance Hot Wallet 3', type: 'exchange' },
  '0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43': { label: 'Coinbase', type: 'exchange' },
  '0x71660c4005ba85c37ccec55d0c4493e66fe775d3': { label: 'Coinbase 2', type: 'exchange' },
  '0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0': { label: 'Kraken', type: 'exchange' },
  '0x2910543af39aba0cd09dbb2d50200b3e800a63d2': { label: 'Kraken 2', type: 'exchange' },
  '0xd9d1e6e8f91bcea4dbbd5a3bdb1e1c5e6e3f6e6d': { label: 'KuCoin', type: 'exchange' },
  // Tornado Cash (mixer)
  '0xd90e2f925da726b50c4ed8d0fb90ad053324f31b': { label: 'Tornado Cash', type: 'mixer' },
  '0x722122df12d4e14e13ac3b6895a86e84145b6967': { label: 'Tornado Cash Router', type: 'mixer' },
  '0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc': { label: 'Tornado Cash 0.1', type: 'mixer' },
  '0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2936': { label: 'Tornado Cash 1', type: 'mixer' },
  '0x910cbd523d972eb0a6f4cae4618ad62622b39dbf': { label: 'Tornado Cash 10', type: 'mixer' },
  '0xa160cdab225685da1d56aa342ad8841c3b53f291': { label: 'Tornado Cash 100', type: 'mixer' },
  // Bridges
  '0x3ee18b2214aff97000d974cf647e7c347e8fa585': { label: 'Wormhole Bridge', type: 'bridge' },
  '0x40ec5b33f54e0e8a33a975908c5ba1c14e5bbbdf': { label: 'Polygon Bridge', type: 'bridge' },
  '0x99c9fc46f92e8a1c0dec1b1747d010903e884be1': { label: 'Optimism Bridge', type: 'bridge' },
  '0x4dbd4fc535ac27206064b68ffcf827b0a60bab3f': { label: 'Arbitrum Bridge', type: 'bridge' },
};

function detectChain(addr: string): 'eth' | 'btc' | null {
  if (/^0x[a-fA-F0-9]{40}$/.test(addr)) return 'eth';
  if (/^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(addr)) return 'btc';
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { address, maxHops = 3 } = req.body;
  if (!address || typeof address !== 'string') return res.status(400).json({ error: 'address is required' });

  const chain = detectChain(address.trim());
  if (!chain) return res.status(400).json({ error: 'Invalid address format. Enter ETH (0x...) or BTC (1.../3.../bc1...) address.' });

  try {
    const hops = Math.min(Math.max(1, maxHops), 4); // Cap at 4 hops to avoid rate limits
    if (chain === 'eth') {
      const result = await traceEth(address.trim().toLowerCase(), hops);
      return res.status(200).json(result);
    } else {
      const result = await traceBtc(address.trim(), hops);
      return res.status(200).json(result);
    }
  } catch (err) {
    console.error('Trace error:', err);
    return res.status(500).json({ error: 'Blockchain trace failed. API rate limits may apply.' });
  }
}

async function traceEth(origin: string, maxHops: number) {
  const ethKey = process.env.ETHERSCAN_API_KEY || process.env.VITE_ETHERSCAN_KEY || '';
  const nodes: TraceNode[] = [];
  const edges: TraceEdge[] = [];
  const visited = new Set<string>();
  const queue: { addr: string; hop: number; parentId: string | null }[] = [{ addr: origin, hop: 0, parentId: null }];
  let nodeCounter = 0;
  let totalValueWei = BigInt(0);

  while (queue.length > 0 && nodes.length < 30) {
    const current = queue.shift()!;
    const addr = current.addr.toLowerCase();
    if (visited.has(addr)) continue;
    visited.add(addr);

    // Fetch transactions (outgoing) for this address
    const txUrl = `${ETHERSCAN_API}?module=account&action=txlist&address=${addr}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${ethKey}`;
    const txRes = await fetch(txUrl);
    const txData = await txRes.json() as { status: string; result: { hash: string; from: string; to: string; value: string; timeStamp: string; isError: string }[] };

    // Fetch balance
    const balUrl = `${ETHERSCAN_API}?module=account&action=balance&address=${addr}&tag=latest&apikey=${ethKey}`;
    const balRes = await fetch(balUrl);
    const balData = await balRes.json() as { result: string };
    const balEth = (parseInt(balData.result || '0') / 1e18).toFixed(4);

    // Create node
    const nodeId = `n${++nodeCounter}`;
    const known = KNOWN_LABELS[addr];
    const isOrigin = current.hop === 0;

    // Calculate node position in a flow layout
    const xPos = 80 + current.hop * 220;
    const yPos = 60 + (nodes.filter(n => Math.abs(n.x - xPos) < 50).length) * 120 + (nodeCounter % 3) * 60;

    nodes.push({
      id: nodeId,
      address: addr,
      label: known?.label || (isOrigin ? 'Origin Wallet' : `Wallet ${nodeCounter}`),
      type: known?.type || (isOrigin ? 'origin' : 'intermediate'),
      amount: `${balEth} ETH`,
      chain: 'Ethereum',
      risk: known?.type === 'mixer' ? 'critical' : known?.type === 'exchange' ? 'critical' : isOrigin ? 'critical' : 'high',
      x: xPos,
      y: yPos,
      timestamp: txData.status === '1' && txData.result.length > 0
        ? new Date(parseInt(txData.result[0].timeStamp) * 1000).toISOString()
        : new Date().toISOString(),
    });

    // Create edge from parent
    if (current.parentId) {
      const parentNode = nodes.find(n => n.id === current.parentId);
      if (parentNode) {
        edges.push({
          from: current.parentId,
          to: nodeId,
          amount: `${balEth} ETH`,
          hash: '',
          chain: 'Ethereum',
          type: known?.type || 'transfer',
          timestamp: nodes[nodes.length - 1].timestamp,
          flagged: !!known,
        });
      }
    }

    // Follow outgoing transactions to next hop
    if (current.hop < maxHops && txData.status === '1') {
      const outgoing = txData.result
        .filter(tx => tx.from.toLowerCase() === addr && tx.isError === '0' && BigInt(tx.value) > BigInt(0))
        .slice(0, 5); // Limit branches

      for (const tx of outgoing) {
        const toAddr = tx.to.toLowerCase();
        if (!visited.has(toAddr)) {
          totalValueWei += BigInt(tx.value);

          // Add edge with tx details
          edges.push({
            from: nodeId,
            to: `pending_${toAddr}`,
            amount: `${(parseInt(tx.value) / 1e18).toFixed(4)} ETH`,
            hash: tx.hash,
            chain: 'Ethereum',
            type: KNOWN_LABELS[toAddr]?.type || 'transfer',
            timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
            flagged: !!KNOWN_LABELS[toAddr] || BigInt(tx.value) > BigInt('1000000000000000000'),
          });

          queue.push({ addr: toAddr, hop: current.hop + 1, parentId: nodeId });
        }
      }
    }

    // Small delay to respect rate limits
    if (queue.length > 0) await sleep(250);
  }

  // Fix pending edges
  for (const edge of edges) {
    if (edge.to.startsWith('pending_')) {
      const targetAddr = edge.to.replace('pending_', '');
      const targetNode = nodes.find(n => n.address === targetAddr);
      if (targetNode) edge.to = targetNode.id;
      else edges.splice(edges.indexOf(edge), 1);
    }
  }

  const totalEth = Number(totalValueWei) / 1e18;
  const exchangeHits = nodes.filter(n => n.type === 'exchange');
  const mixerHits = nodes.filter(n => n.type === 'mixer');

  return {
    chain: 'eth',
    nodes,
    edges: edges.filter(e => !e.to.startsWith('pending_')),
    summary: {
      totalTraced: `${totalEth.toFixed(4)} ETH`,
      usdValue: `~$${(totalEth * 3500).toLocaleString()}`,
      walletsFound: nodes.length,
      chainsInvolved: ['Ethereum'],
      riskScore: mixerHits.length > 0 ? 97 : exchangeHits.length > 0 ? 85 : 60,
      exchangeHits: exchangeHits.map(n => n.label),
      mixerHits: mixerHits.map(n => n.label),
    },
  };
}

async function traceBtc(origin: string, maxHops: number) {
  const nodes: TraceNode[] = [];
  const edges: TraceEdge[] = [];
  const visited = new Set<string>();
  const queue: { addr: string; hop: number; parentId: string | null }[] = [{ addr: origin, hop: 0, parentId: null }];
  let nodeCounter = 0;
  let totalSats = 0;

  while (queue.length > 0 && nodes.length < 25) {
    const current = queue.shift()!;
    if (visited.has(current.addr)) continue;
    visited.add(current.addr);

    // Fetch address stats
    const statsRes = await fetch(`${BLOCKSTREAM_API}/address/${current.addr}`);
    if (!statsRes.ok) continue;
    const stats = await statsRes.json() as {
      chain_stats: { funded_txo_sum: number; spent_txo_sum: number; tx_count: number };
    };

    const funded = stats.chain_stats.funded_txo_sum || 0;
    const spent = stats.chain_stats.spent_txo_sum || 0;
    const balance = (funded - spent) / 1e8;

    // Fetch transactions
    const txRes = await fetch(`${BLOCKSTREAM_API}/address/${current.addr}/txs`);
    let txs: {
      txid: string;
      status: { block_time?: number };
      vout: { scriptpubkey_address?: string; value: number }[];
      vin: { prevout?: { scriptpubkey_address?: string; value: number } }[];
    }[] = [];
    if (txRes.ok) txs = await txRes.json();

    const nodeId = `n${++nodeCounter}`;
    const isOrigin = current.hop === 0;
    const xPos = 80 + current.hop * 220;
    const yPos = 60 + (nodes.filter(n => Math.abs(n.x - xPos) < 50).length) * 120;

    nodes.push({
      id: nodeId,
      address: current.addr,
      label: isOrigin ? 'Origin Wallet' : `BTC Wallet ${nodeCounter}`,
      type: isOrigin ? 'origin' : 'intermediate',
      amount: `${balance.toFixed(8)} BTC`,
      chain: 'Bitcoin',
      risk: isOrigin ? 'critical' : 'high',
      x: xPos,
      y: yPos,
      timestamp: txs.length > 0 && txs[0].status.block_time
        ? new Date(txs[0].status.block_time * 1000).toISOString()
        : new Date().toISOString(),
    });

    if (current.parentId) {
      edges.push({
        from: current.parentId,
        to: nodeId,
        amount: `${balance.toFixed(8)} BTC`,
        hash: '',
        chain: 'Bitcoin',
        type: 'transfer',
        timestamp: nodes[nodes.length - 1].timestamp,
        flagged: false,
      });
    }

    // Follow outgoing: find txs where this address is an input
    if (current.hop < maxHops) {
      const outTxs = txs
        .filter(tx => tx.vin.some(v => v.prevout?.scriptpubkey_address === current.addr))
        .slice(0, 4);

      for (const tx of outTxs) {
        const outputs = tx.vout
          .filter(v => v.scriptpubkey_address && v.scriptpubkey_address !== current.addr)
          .slice(0, 3);

        for (const out of outputs) {
          if (out.scriptpubkey_address && !visited.has(out.scriptpubkey_address)) {
            totalSats += out.value;
            edges.push({
              from: nodeId,
              to: `pending_${out.scriptpubkey_address}`,
              amount: `${(out.value / 1e8).toFixed(8)} BTC`,
              hash: tx.txid,
              chain: 'Bitcoin',
              type: 'transfer',
              timestamp: tx.status.block_time
                ? new Date(tx.status.block_time * 1000).toISOString()
                : new Date().toISOString(),
              flagged: out.value > 10000000, // > 0.1 BTC
            });
            queue.push({ addr: out.scriptpubkey_address, hop: current.hop + 1, parentId: nodeId });
          }
        }
      }
    }

    if (queue.length > 0) await sleep(300);
  }

  // Fix pending edges
  for (const edge of edges) {
    if (edge.to.startsWith('pending_')) {
      const targetAddr = edge.to.replace('pending_', '');
      const targetNode = nodes.find(n => n.address === targetAddr);
      if (targetNode) edge.to = targetNode.id;
    }
  }

  const totalBtc = totalSats / 1e8;

  return {
    chain: 'btc',
    nodes,
    edges: edges.filter(e => !e.to.startsWith('pending_')),
    summary: {
      totalTraced: `${totalBtc.toFixed(8)} BTC`,
      usdValue: `~$${(totalBtc * 95000).toLocaleString()}`,
      walletsFound: nodes.length,
      chainsInvolved: ['Bitcoin'],
      riskScore: 70,
      exchangeHits: [],
      mixerHits: [],
    },
  };
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
