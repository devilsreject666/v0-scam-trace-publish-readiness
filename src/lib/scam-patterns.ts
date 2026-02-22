/**
 * Scam pattern detection engine.
 * Analyzes wallet transaction graphs for common scam topologies:
 * - Peel chain (sequential small withdrawals)
 * - Rapid dispersal (fan-out to many wallets)
 * - Mixer interaction (high-degree intermediary nodes)
 * - Time-compressed bursts (high tx volume in short windows)
 * - Layered funneling (multi-hop consolidation)
 */

import type { WalletGraph, GraphEdge } from './graph-engine';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PatternType =
  | 'peel_chain'
  | 'rapid_dispersal'
  | 'mixer_interaction'
  | 'time_compressed_burst'
  | 'layered_funnel';

export interface DetectedPattern {
  type: PatternType;
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;     // 0-100
  involvedWallets: string[];
  involvedEdges: string[];
  metadata: Record<string, unknown>;
}

export interface PatternAnalysis {
  patterns: DetectedPattern[];
  overallSeverity: 'low' | 'medium' | 'high' | 'critical';
  scamLikelihood: number; // 0-100
  summary: string;
}

// ---------------------------------------------------------------------------
// Pattern detectors
// ---------------------------------------------------------------------------

function detectPeelChain(graph: WalletGraph): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  // Find linear chains: A -> B -> C -> D where each hop is a single connection
  // and amounts decrease at each step
  const adjacencyOut = new Map<string, GraphEdge[]>();
  for (const edge of graph.edges.values()) {
    if (!adjacencyOut.has(edge.source)) adjacencyOut.set(edge.source, []);
    adjacencyOut.get(edge.source)!.push(edge);
  }

  function findChain(start: string, visited: Set<string>): string[] {
    const chain = [start];
    let current = start;
    visited.add(current);

    while (true) {
      const outEdges = adjacencyOut.get(current) ?? [];
      // Node should have 1-2 outgoing edges (peel characteristic)
      if (outEdges.length === 0 || outEdges.length > 2) break;

      const nextEdge = outEdges.find((e) => !visited.has(e.target));
      if (!nextEdge) break;

      visited.add(nextEdge.target);
      chain.push(nextEdge.target);
      current = nextEdge.target;
    }

    return chain;
  }

  const visited = new Set<string>();
  const root = graph.rootAddress;

  const chain = findChain(root, visited);
  if (chain.length >= 4) {
    // Check for decreasing values
    const edgeValues: number[] = [];
    for (let i = 0; i < chain.length - 1; i++) {
      const edges = adjacencyOut.get(chain[i]) ?? [];
      const edge = edges.find((e) => e.target === chain[i + 1]);
      if (edge) edgeValues.push(edge.value);
    }

    const isDecreasing = edgeValues.every((v, i) => i === 0 || v <= edgeValues[i - 1] * 1.1);

    if (isDecreasing || chain.length >= 5) {
      patterns.push({
        type: 'peel_chain',
        label: 'Peel Chain',
        description: `Sequential chain of ${chain.length} wallets with diminishing transfer amounts, characteristic of peel-chain laundering.`,
        severity: chain.length >= 6 ? 'critical' : 'high',
        confidence: Math.min(95, 50 + chain.length * 8),
        involvedWallets: chain,
        involvedEdges: chain.slice(0, -1).map((addr, i) => {
          const edges = adjacencyOut.get(addr) ?? [];
          return edges.find((e) => e.target === chain[i + 1])?.id ?? '';
        }).filter(Boolean),
        metadata: { chainLength: chain.length, valueProgression: edgeValues },
      });
    }
  }

  return patterns;
}

function detectRapidDispersal(graph: WalletGraph): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  for (const node of graph.nodes.values()) {
    // Find nodes that send to 5+ unique recipients
    const outEdges = Array.from(graph.edges.values()).filter((e) => e.source === node.id);
    const uniqueTargets = new Set(outEdges.map((e) => e.target));

    if (uniqueTargets.size >= 5) {
      // Check if dispersal happened in a short time window
      const allTimestamps = outEdges.flatMap((e) => e.timestamps);
      if (allTimestamps.length === 0) continue;

      const minTime = Math.min(...allTimestamps);
      const maxTime = Math.max(...allTimestamps);
      const windowHours = (maxTime - minTime) / 3600;

      if (windowHours < 24) {
        patterns.push({
          type: 'rapid_dispersal',
          label: 'Rapid Dispersal',
          description: `Wallet ${node.id.slice(0, 10)}... dispersed funds to ${uniqueTargets.size} addresses within ${windowHours.toFixed(1)} hours.`,
          severity: uniqueTargets.size >= 10 ? 'critical' : 'high',
          confidence: Math.min(90, 40 + uniqueTargets.size * 5),
          involvedWallets: [node.id, ...uniqueTargets],
          involvedEdges: outEdges.map((e) => e.id),
          metadata: { fanOut: uniqueTargets.size, windowHours, totalValue: outEdges.reduce((s, e) => s + e.value, 0) },
        });
      }
    }
  }

  return patterns;
}

function detectMixerInteraction(graph: WalletGraph): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  for (const node of graph.nodes.values()) {
    // Mixer characteristics: high degree, roughly equal in/out, many counterparties
    if (node.degree >= 10 && node.id !== graph.rootAddress) {
      const ratio = node.totalIn > 0 ? node.totalOut / node.totalIn : 0;
      const isBalanced = ratio > 0.8 && ratio < 1.2;

      if (isBalanced) {
        patterns.push({
          type: 'mixer_interaction',
          label: 'Potential Mixer/Tumbler',
          description: `Wallet ${node.id.slice(0, 10)}... shows mixer-like behavior with ${node.degree} counterparties and balanced in/out flows.`,
          severity: 'high',
          confidence: Math.min(85, 30 + node.degree * 3),
          involvedWallets: [node.id],
          involvedEdges: Array.from(graph.edges.values())
            .filter((e) => e.source === node.id || e.target === node.id)
            .map((e) => e.id),
          metadata: { degree: node.degree, inOutRatio: ratio },
        });
      }
    }
  }

  return patterns;
}

function detectTimeCompressedBurst(graph: WalletGraph): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  for (const node of graph.nodes.values()) {
    const timeWindow = node.lastSeen - node.firstSeen;
    // High activity in under 1 hour
    if (timeWindow > 0 && timeWindow < 3600 && node.txCount >= 5) {
      patterns.push({
        type: 'time_compressed_burst',
        label: 'Time-Compressed Burst',
        description: `Wallet ${node.id.slice(0, 10)}... executed ${node.txCount} transactions in ${Math.round(timeWindow / 60)} minutes.`,
        severity: node.txCount >= 10 ? 'critical' : 'medium',
        confidence: Math.min(80, 30 + node.txCount * 5),
        involvedWallets: [node.id],
        involvedEdges: [],
        metadata: { txCount: node.txCount, windowSeconds: timeWindow },
      });
    }
  }

  return patterns;
}

function detectLayeredFunnel(graph: WalletGraph): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  // Find consolidation: multiple wallets sending to same destination
  const incomingMap = new Map<string, GraphEdge[]>();
  for (const edge of graph.edges.values()) {
    if (!incomingMap.has(edge.target)) incomingMap.set(edge.target, []);
    incomingMap.get(edge.target)!.push(edge);
  }

  for (const [target, inEdges] of incomingMap) {
    const uniqueSources = new Set(inEdges.map((e) => e.source));
    if (uniqueSources.size >= 4) {
      // Check if the target then sends onwards (funnel behavior)
      const outEdges = Array.from(graph.edges.values()).filter((e) => e.source === target);
      if (outEdges.length > 0) {
        patterns.push({
          type: 'layered_funnel',
          label: 'Layered Funneling',
          description: `${uniqueSources.size} wallets converge funds into ${target.slice(0, 10)}... which then forwards to ${outEdges.length} destination(s).`,
          severity: uniqueSources.size >= 8 ? 'critical' : 'high',
          confidence: Math.min(85, 35 + uniqueSources.size * 5),
          involvedWallets: [target, ...uniqueSources, ...outEdges.map((e) => e.target)],
          involvedEdges: [...inEdges.map((e) => e.id), ...outEdges.map((e) => e.id)],
          metadata: { sources: uniqueSources.size, destinations: outEdges.length },
        });
      }
    }
  }

  return patterns;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function analyzePatterns(graph: WalletGraph): PatternAnalysis {
  const allPatterns: DetectedPattern[] = [
    ...detectPeelChain(graph),
    ...detectRapidDispersal(graph),
    ...detectMixerInteraction(graph),
    ...detectTimeCompressedBurst(graph),
    ...detectLayeredFunnel(graph),
  ];

  // Sort by severity and confidence
  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  allPatterns.sort((a, b) => {
    const sevDiff = severityOrder[b.severity] - severityOrder[a.severity];
    return sevDiff !== 0 ? sevDiff : b.confidence - a.confidence;
  });

  // Compute overall severity
  let overallSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (allPatterns.some((p) => p.severity === 'critical')) overallSeverity = 'critical';
  else if (allPatterns.some((p) => p.severity === 'high')) overallSeverity = 'high';
  else if (allPatterns.some((p) => p.severity === 'medium')) overallSeverity = 'medium';

  // Scam likelihood combines pattern count, severity, and confidence
  const scamLikelihood = Math.min(
    100,
    allPatterns.reduce((sum, p) => {
      return sum + severityOrder[p.severity] * (p.confidence / 100) * 10;
    }, 0),
  );

  // Generate summary
  const patternNames = [...new Set(allPatterns.map((p) => p.label))];
  const summary = allPatterns.length === 0
    ? 'No suspicious patterns detected in the transaction graph.'
    : `Detected ${allPatterns.length} suspicious pattern(s): ${patternNames.join(', ')}. Overall scam likelihood: ${Math.round(scamLikelihood)}%.`;

  return {
    patterns: allPatterns,
    overallSeverity,
    scamLikelihood: Math.round(scamLikelihood),
    summary,
  };
}

export function getPatternIcon(type: PatternType): string {
  switch (type) {
    case 'peel_chain': return 'Link';
    case 'rapid_dispersal': return 'Zap';
    case 'mixer_interaction': return 'Shuffle';
    case 'time_compressed_burst': return 'Clock';
    case 'layered_funnel': return 'GitMerge';
  }
}

export function getSeverityColor(severity: DetectedPattern['severity']): string {
  switch (severity) {
    case 'critical': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#eab308';
    case 'low': return '#22c55e';
  }
}
