/**
 * Graph engine for building, traversing, and analyzing wallet transaction graphs.
 * BFS/DFS traversal, centrality metrics, wallet classification, risk scoring.
 */

import type { NormalizedTx, Chain } from './blockchain-api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WalletRole = 'suspect' | 'connected' | 'bystander' | 'unaffected';
export type RiskGrade = 'low' | 'moderate' | 'high' | 'critical';

export interface WalletNode {
  id: string;                 // wallet address
  role: WalletRole;
  totalIn: number;
  totalOut: number;
  txCount: number;
  firstSeen: number;          // unix timestamp
  lastSeen: number;
  chains: Set<Chain>;
  degree: number;             // number of unique counterparties
  betweennessCentrality: number;
  closenessCentrality: number;
  clusterCoefficient: number;
  riskScore: number;          // 0-100
  label?: string;             // optional label
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  value: number;
  txCount: number;
  chain: Chain;
  timestamps: number[];
}

export interface WalletGraph {
  nodes: Map<string, WalletNode>;
  edges: Map<string, GraphEdge>;
  rootAddress: string;
  totalValueMoved: number;
  totalWallets: number;
}

export interface GraphMetrics {
  totalValueMoved: number;
  totalWallets: number;
  totalEdges: number;
  avgDegree: number;
  maxDegree: number;
  maxDegreWallet: string;
  density: number;
  avgClusterCoefficient: number;
  riskDistribution: Record<RiskGrade, number>;
}

// ---------------------------------------------------------------------------
// Graph building
// ---------------------------------------------------------------------------

function makeEdgeId(from: string, to: string, chain: Chain): string {
  return `${from}->${to}@${chain}`;
}

function ensureNode(graph: WalletGraph, address: string): WalletNode {
  let node = graph.nodes.get(address);
  if (!node) {
    node = {
      id: address,
      role: 'unaffected',
      totalIn: 0,
      totalOut: 0,
      txCount: 0,
      firstSeen: Infinity,
      lastSeen: 0,
      chains: new Set(),
      degree: 0,
      betweennessCentrality: 0,
      closenessCentrality: 0,
      clusterCoefficient: 0,
      riskScore: 0,
    };
    graph.nodes.set(address, node);
  }
  return node;
}

export function buildGraph(transactions: NormalizedTx[], rootAddress: string): WalletGraph {
  const graph: WalletGraph = {
    nodes: new Map(),
    edges: new Map(),
    rootAddress: rootAddress.toLowerCase(),
    totalValueMoved: 0,
    totalWallets: 0,
  };

  for (const tx of transactions) {
    if (!tx.from || !tx.to || tx.value === 0) continue;

    const fromNode = ensureNode(graph, tx.from);
    const toNode = ensureNode(graph, tx.to);

    fromNode.totalOut += tx.value;
    fromNode.txCount++;
    fromNode.chains.add(tx.chain);
    fromNode.firstSeen = Math.min(fromNode.firstSeen, tx.timestamp);
    fromNode.lastSeen = Math.max(fromNode.lastSeen, tx.timestamp);

    toNode.totalIn += tx.value;
    toNode.txCount++;
    toNode.chains.add(tx.chain);
    toNode.firstSeen = Math.min(toNode.firstSeen, tx.timestamp);
    toNode.lastSeen = Math.max(toNode.lastSeen, tx.timestamp);

    const edgeId = makeEdgeId(tx.from, tx.to, tx.chain);
    let edge = graph.edges.get(edgeId);
    if (!edge) {
      edge = {
        id: edgeId,
        source: tx.from,
        target: tx.to,
        value: 0,
        txCount: 0,
        chain: tx.chain,
        timestamps: [],
      };
      graph.edges.set(edgeId, edge);
    }
    edge.value += tx.value;
    edge.txCount++;
    edge.timestamps.push(tx.timestamp);

    graph.totalValueMoved += tx.value;
  }

  // Compute degrees
  const degreeMap = new Map<string, Set<string>>();
  for (const edge of graph.edges.values()) {
    if (!degreeMap.has(edge.source)) degreeMap.set(edge.source, new Set());
    if (!degreeMap.has(edge.target)) degreeMap.set(edge.target, new Set());
    degreeMap.get(edge.source)!.add(edge.target);
    degreeMap.get(edge.target)!.add(edge.source);
  }
  for (const [addr, neighbors] of degreeMap) {
    const node = graph.nodes.get(addr);
    if (node) node.degree = neighbors.size;
  }

  graph.totalWallets = graph.nodes.size;

  // Classify nodes
  classifyNodes(graph);

  // Compute centrality metrics
  computeCentrality(graph, degreeMap);

  // Compute cluster coefficients
  computeClusterCoefficients(graph, degreeMap);

  // Compute risk scores
  computeRiskScores(graph);

  return graph;
}

// ---------------------------------------------------------------------------
// Node classification
// ---------------------------------------------------------------------------

function classifyNodes(graph: WalletGraph): void {
  const root = graph.rootAddress;
  const adjacency = new Map<string, Set<string>>();

  for (const edge of graph.edges.values()) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, new Set());
    if (!adjacency.has(edge.target)) adjacency.set(edge.target, new Set());
    adjacency.get(edge.source)!.add(edge.target);
    adjacency.get(edge.target)!.add(edge.source);
  }

  // BFS from root to determine distance
  const distances = new Map<string, number>();
  const queue: string[] = [root];
  distances.set(root, 0);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const dist = distances.get(current)!;
    const neighbors = adjacency.get(current) ?? new Set();
    for (const neighbor of neighbors) {
      if (!distances.has(neighbor)) {
        distances.set(neighbor, dist + 1);
        queue.push(neighbor);
      }
    }
  }

  for (const node of graph.nodes.values()) {
    const dist = distances.get(node.id);
    if (node.id === root) {
      node.role = 'suspect';
    } else if (dist === 1) {
      node.role = 'connected';
    } else if (dist !== undefined && dist <= 3) {
      node.role = 'bystander';
    } else {
      node.role = 'unaffected';
    }
  }
}

// ---------------------------------------------------------------------------
// Centrality (approximate for performance)
// ---------------------------------------------------------------------------

function computeCentrality(graph: WalletGraph, degreeMap: Map<string, Set<string>>): void {
  const nodes = Array.from(graph.nodes.keys());
  const n = nodes.length;
  if (n <= 1) return;

  // Betweenness centrality (Brandes' algorithm, simplified for medium graphs)
  const betweenness = new Map<string, number>();
  for (const v of nodes) betweenness.set(v, 0);

  // Only sample up to 50 source nodes for performance
  const sampleSize = Math.min(50, n);
  const sampleNodes = nodes.slice(0, sampleSize);

  for (const s of sampleNodes) {
    const stack: string[] = [];
    const pred = new Map<string, string[]>();
    const sigma = new Map<string, number>();
    const dist = new Map<string, number>();
    const delta = new Map<string, number>();

    for (const v of nodes) {
      pred.set(v, []);
      sigma.set(v, 0);
      dist.set(v, -1);
      delta.set(v, 0);
    }

    sigma.set(s, 1);
    dist.set(s, 0);
    const queue: string[] = [s];

    while (queue.length > 0) {
      const v = queue.shift()!;
      stack.push(v);
      const neighbors = degreeMap.get(v) ?? new Set();
      for (const w of neighbors) {
        if (dist.get(w)! < 0) {
          queue.push(w);
          dist.set(w, dist.get(v)! + 1);
        }
        if (dist.get(w) === dist.get(v)! + 1) {
          sigma.set(w, sigma.get(w)! + sigma.get(v)!);
          pred.get(w)!.push(v);
        }
      }
    }

    while (stack.length > 0) {
      const w = stack.pop()!;
      for (const v of pred.get(w)!) {
        delta.set(v, delta.get(v)! + (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!));
      }
      if (w !== s) {
        betweenness.set(w, betweenness.get(w)! + delta.get(w)!);
      }
    }
  }

  // Normalize
  const scale = n > 2 ? 1 / ((n - 1) * (n - 2)) : 1;
  for (const node of graph.nodes.values()) {
    node.betweennessCentrality = (betweenness.get(node.id) ?? 0) * scale;
  }

  // Closeness centrality
  for (const s of nodes) {
    let totalDist = 0;
    let reachable = 0;
    const visited = new Set<string>([s]);
    const queue2: [string, number][] = [[s, 0]];

    while (queue2.length > 0) {
      const [v, d] = queue2.shift()!;
      const neighbors = degreeMap.get(v) ?? new Set();
      for (const w of neighbors) {
        if (!visited.has(w)) {
          visited.add(w);
          totalDist += d + 1;
          reachable++;
          queue2.push([w, d + 1]);
        }
      }
    }

    const node = graph.nodes.get(s);
    if (node && reachable > 0) {
      node.closenessCentrality = reachable / totalDist;
    }
  }
}

// ---------------------------------------------------------------------------
// Cluster coefficient
// ---------------------------------------------------------------------------

function computeClusterCoefficients(graph: WalletGraph, degreeMap: Map<string, Set<string>>): void {
  for (const node of graph.nodes.values()) {
    const neighbors = degreeMap.get(node.id);
    if (!neighbors || neighbors.size < 2) {
      node.clusterCoefficient = 0;
      continue;
    }

    let triangles = 0;
    const neighborArr = Array.from(neighbors);
    for (let i = 0; i < neighborArr.length; i++) {
      for (let j = i + 1; j < neighborArr.length; j++) {
        const ni = degreeMap.get(neighborArr[i]);
        if (ni?.has(neighborArr[j])) triangles++;
      }
    }

    const k = neighbors.size;
    node.clusterCoefficient = (2 * triangles) / (k * (k - 1));
  }
}

// ---------------------------------------------------------------------------
// Risk scoring
// ---------------------------------------------------------------------------

function computeRiskScores(graph: WalletGraph): void {
  const root = graph.rootAddress;
  const maxVal = Math.max(...Array.from(graph.nodes.values()).map((n) => n.totalIn + n.totalOut), 1);

  for (const node of graph.nodes.values()) {
    let score = 0;

    // Proximity to suspect
    if (node.id === root) score += 40;
    else if (node.role === 'connected') score += 25;
    else if (node.role === 'bystander') score += 10;

    // Value proportion
    score += Math.min(20, ((node.totalIn + node.totalOut) / maxVal) * 20);

    // High degree (potential mixer/hub)
    score += Math.min(15, node.degree * 1.5);

    // High betweenness (bridge/relay)
    score += Math.min(15, node.betweennessCentrality * 1000);

    // Rapid activity (short time window with many txs)
    const timeWindow = node.lastSeen - node.firstSeen;
    if (timeWindow > 0 && timeWindow < 3600 && node.txCount > 5) {
      score += 10; // time-compressed burst
    }

    node.riskScore = Math.min(100, Math.round(score));
  }
}

// ---------------------------------------------------------------------------
// Risk grading
// ---------------------------------------------------------------------------

export function getRiskGrade(score: number): RiskGrade {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'moderate';
  return 'low';
}

export function getRiskColor(grade: RiskGrade): string {
  switch (grade) {
    case 'critical': return '#ef4444';
    case 'high': return '#f97316';
    case 'moderate': return '#eab308';
    case 'low': return '#22c55e';
  }
}

export function getRoleColor(role: WalletRole): string {
  switch (role) {
    case 'suspect': return '#ef4444';
    case 'connected': return '#f97316';
    case 'bystander': return '#eab308';
    case 'unaffected': return '#6b7280';
  }
}

// ---------------------------------------------------------------------------
// Metrics computation
// ---------------------------------------------------------------------------

export function computeGraphMetrics(graph: WalletGraph): GraphMetrics {
  const nodes = Array.from(graph.nodes.values());
  const n = nodes.length;
  const e = graph.edges.size;

  const degrees = nodes.map((n) => n.degree);
  const maxDeg = Math.max(...degrees, 0);
  const maxDegNode = nodes.find((n) => n.degree === maxDeg);

  const riskDistribution: Record<RiskGrade, number> = {
    low: 0,
    moderate: 0,
    high: 0,
    critical: 0,
  };

  for (const node of nodes) {
    const grade = getRiskGrade(node.riskScore);
    riskDistribution[grade]++;
  }

  return {
    totalValueMoved: graph.totalValueMoved,
    totalWallets: n,
    totalEdges: e,
    avgDegree: n > 0 ? degrees.reduce((a, b) => a + b, 0) / n : 0,
    maxDegree: maxDeg,
    maxDegreWallet: maxDegNode?.id ?? '',
    density: n > 1 ? (2 * e) / (n * (n - 1)) : 0,
    avgClusterCoefficient: n > 0 ? nodes.reduce((sum, n) => sum + n.clusterCoefficient, 0) / n : 0,
    riskDistribution,
  };
}

// ---------------------------------------------------------------------------
// Serialization for Supabase storage
// ---------------------------------------------------------------------------

export function serializeGraph(graph: WalletGraph): object {
  return {
    rootAddress: graph.rootAddress,
    totalValueMoved: graph.totalValueMoved,
    totalWallets: graph.totalWallets,
    nodes: Array.from(graph.nodes.values()).map((n) => ({
      ...n,
      chains: Array.from(n.chains),
    })),
    edges: Array.from(graph.edges.values()),
  };
}

export function deserializeGraph(data: Record<string, unknown>): WalletGraph {
  const raw = data as {
    rootAddress: string;
    totalValueMoved: number;
    totalWallets: number;
    nodes: Array<Omit<WalletNode, 'chains'> & { chains: Chain[] }>;
    edges: GraphEdge[];
  };

  const nodes = new Map<string, WalletNode>();
  for (const n of raw.nodes) {
    nodes.set(n.id, { ...n, chains: new Set(n.chains) });
  }

  const edges = new Map<string, GraphEdge>();
  for (const e of raw.edges) {
    edges.set(e.id, e);
  }

  return {
    nodes,
    edges,
    rootAddress: raw.rootAddress,
    totalValueMoved: raw.totalValueMoved,
    totalWallets: raw.totalWallets,
  };
}
