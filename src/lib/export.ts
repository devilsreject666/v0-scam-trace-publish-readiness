/**
 * Evidence-grade export utilities: PDF reports, CSV, and JSON graph export.
 */

import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import type { WalletGraph, GraphMetrics, RiskGrade } from './graph-engine';
import { getRiskGrade, serializeGraph } from './graph-engine';
import type { PatternAnalysis } from './scam-patterns';
import type { NormalizedTx, Chain } from './blockchain-api';
import { getChainInfo } from './blockchain-api';

// ---------------------------------------------------------------------------
// CSV Export
// ---------------------------------------------------------------------------

export function exportTransactionsCSV(transactions: NormalizedTx[], filename?: string): void {
  const headers = [
    'hash',
    'from',
    'to',
    'value',
    'value_usd',
    'timestamp',
    'date',
    'chain',
    'asset',
    'block_number',
    'direction',
    'is_error',
  ];

  const rows = transactions.map((tx) =>
    [
      tx.hash,
      tx.from,
      tx.to,
      tx.value.toString(),
      tx.valueUsd.toString(),
      tx.timestamp.toString(),
      new Date(tx.timestamp * 1000).toISOString(),
      tx.chain,
      tx.asset,
      tx.blockNumber.toString(),
      tx.direction,
      tx.isError ? 'true' : 'false',
    ].join(','),
  );

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, filename ?? `scamtrace-transactions-${Date.now()}.csv`);
}

// ---------------------------------------------------------------------------
// JSON Graph Export
// ---------------------------------------------------------------------------

export function exportGraphJSON(
  graph: WalletGraph,
  metrics: GraphMetrics,
  patterns: PatternAnalysis,
  filename?: string,
): void {
  const data = {
    exportedAt: new Date().toISOString(),
    tool: 'ScamTrace Forensic Analyzer',
    version: '1.0.0',
    graph: serializeGraph(graph),
    metrics,
    patternAnalysis: {
      ...patterns,
      patterns: patterns.patterns.map((p) => ({
        ...p,
        involvedWallets: p.involvedWallets,
        involvedEdges: p.involvedEdges,
      })),
    },
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  saveAs(blob, filename ?? `scamtrace-graph-${graph.rootAddress.slice(0, 10)}-${Date.now()}.json`);
}

// ---------------------------------------------------------------------------
// PDF Report
// ---------------------------------------------------------------------------

function riskGradeLabel(grade: RiskGrade): string {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export async function exportForensicPDF(
  graph: WalletGraph,
  metrics: GraphMetrics,
  patterns: PatternAnalysis,
  transactions: NormalizedTx[],
  chain: Chain,
  graphCanvasDataUrl?: string,
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const chainInfo = getChainInfo(chain);
  const overallGrade = getRiskGrade(
    Math.max(...Array.from(graph.nodes.values()).map((n) => n.riskScore), 0),
  );

  // ---------- Helper functions ----------
  const addText = (text: string, size: number, color: [number, number, number] = [255, 255, 255], bold = false) => {
    doc.setFontSize(size);
    doc.setTextColor(...color);
    if (bold) doc.setFont('helvetica', 'bold');
    else doc.setFont('helvetica', 'normal');
  };

  const checkPage = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const drawLine = () => {
    doc.setDrawColor(60, 60, 80);
    doc.line(margin, y, pageWidth - margin, y);
    y += 3;
  };

  // ---------- Background ----------
  doc.setFillColor(10, 14, 26);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');

  // ---------- Header ----------
  addText('SCAMTRACE', 24, [0, 255, 136], true);
  doc.text('SCAMTRACE', margin, y + 8);
  y += 10;

  addText('Forensic Wallet Analysis Report', 12, [180, 180, 200]);
  doc.text('Forensic Wallet Analysis Report', margin, y + 5);
  y += 10;

  addText(`Generated: ${new Date().toLocaleString()}`, 8, [120, 120, 140]);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y + 3);
  y += 8;

  drawLine();
  y += 2;

  // ---------- Subject Section ----------
  checkPage(40);
  addText('INVESTIGATION SUBJECT', 11, [0, 212, 255], true);
  doc.text('INVESTIGATION SUBJECT', margin, y + 4);
  y += 10;

  addText(`Address: ${graph.rootAddress}`, 9, [200, 200, 220]);
  doc.text(`Address: ${graph.rootAddress}`, margin, y + 3);
  y += 7;

  addText(`Chain: ${chainInfo.name} (${chainInfo.asset})`, 9, [200, 200, 220]);
  doc.text(`Chain: ${chainInfo.name} (${chainInfo.asset})`, margin, y + 3);
  y += 7;

  addText(`Risk Grade: ${riskGradeLabel(overallGrade)}`, 9, [200, 200, 220]);
  doc.text(`Risk Grade: ${riskGradeLabel(overallGrade)}`, margin, y + 3);
  y += 10;

  drawLine();
  y += 2;

  // ---------- Summary Metrics ----------
  checkPage(50);
  addText('ANALYSIS METRICS', 11, [0, 212, 255], true);
  doc.text('ANALYSIS METRICS', margin, y + 4);
  y += 10;

  const metricLines = [
    `Total Wallets in Graph: ${metrics.totalWallets}`,
    `Total Edges (Flows): ${metrics.totalEdges}`,
    `Total Value Moved: ${metrics.totalValueMoved.toFixed(6)} ${chainInfo.asset}`,
    `Average Degree: ${metrics.avgDegree.toFixed(2)}`,
    `Max Degree: ${metrics.maxDegree} (${metrics.maxDegreWallet.slice(0, 20)}...)`,
    `Graph Density: ${metrics.density.toFixed(4)}`,
    `Avg Cluster Coefficient: ${metrics.avgClusterCoefficient.toFixed(4)}`,
    `Scam Likelihood: ${patterns.scamLikelihood}%`,
  ];

  for (const line of metricLines) {
    addText(line, 9, [180, 180, 200]);
    doc.text(line, margin + 2, y + 3);
    y += 6;
  }

  y += 4;
  drawLine();
  y += 2;

  // ---------- Risk Distribution ----------
  checkPage(30);
  addText('RISK DISTRIBUTION', 11, [0, 212, 255], true);
  doc.text('RISK DISTRIBUTION', margin, y + 4);
  y += 10;

  const distLines = [
    `Critical: ${metrics.riskDistribution.critical} wallets`,
    `High: ${metrics.riskDistribution.high} wallets`,
    `Moderate: ${metrics.riskDistribution.moderate} wallets`,
    `Low: ${metrics.riskDistribution.low} wallets`,
  ];
  const distColors: [number, number, number][] = [
    [239, 68, 68],
    [249, 115, 22],
    [234, 179, 8],
    [34, 197, 94],
  ];

  for (let i = 0; i < distLines.length; i++) {
    addText(distLines[i], 9, distColors[i]);
    doc.text(distLines[i], margin + 2, y + 3);
    y += 6;
  }

  y += 4;
  drawLine();
  y += 2;

  // ---------- Detected Patterns ----------
  checkPage(30);
  addText('DETECTED PATTERNS', 11, [0, 212, 255], true);
  doc.text('DETECTED PATTERNS', margin, y + 4);
  y += 10;

  if (patterns.patterns.length === 0) {
    addText('No suspicious patterns detected.', 9, [34, 197, 94]);
    doc.text('No suspicious patterns detected.', margin + 2, y + 3);
    y += 8;
  } else {
    for (const pattern of patterns.patterns) {
      checkPage(25);

      const sevColor: [number, number, number] =
        pattern.severity === 'critical'
          ? [239, 68, 68]
          : pattern.severity === 'high'
            ? [249, 115, 22]
            : pattern.severity === 'medium'
              ? [234, 179, 8]
              : [34, 197, 94];

      addText(`[${pattern.severity.toUpperCase()}] ${pattern.label} (${pattern.confidence}% confidence)`, 9, sevColor, true);
      doc.text(
        `[${pattern.severity.toUpperCase()}] ${pattern.label} (${pattern.confidence}% confidence)`,
        margin + 2,
        y + 3,
      );
      y += 6;

      // Wrap description
      addText(pattern.description, 8, [160, 160, 180]);
      const descLines = doc.splitTextToSize(pattern.description, contentWidth - 4);
      doc.text(descLines, margin + 4, y + 3);
      y += descLines.length * 4 + 2;

      addText(`Involved wallets: ${pattern.involvedWallets.length}`, 8, [120, 120, 140]);
      doc.text(`Involved wallets: ${pattern.involvedWallets.length}`, margin + 4, y + 3);
      y += 8;
    }
  }

  drawLine();
  y += 2;

  // ---------- Graph Snapshot ----------
  if (graphCanvasDataUrl) {
    checkPage(100);
    addText('GRAPH VISUALIZATION', 11, [0, 212, 255], true);
    doc.text('GRAPH VISUALIZATION', margin, y + 4);
    y += 8;

    try {
      doc.addImage(graphCanvasDataUrl, 'PNG', margin, y, contentWidth, contentWidth * 0.6);
      y += contentWidth * 0.6 + 5;
    } catch {
      addText('Graph image could not be embedded.', 8, [120, 120, 140]);
      doc.text('Graph image could not be embedded.', margin + 2, y + 3);
      y += 8;
    }

    drawLine();
    y += 2;
  }

  // ---------- Top Transactions ----------
  doc.addPage();
  doc.setFillColor(10, 14, 26);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
  y = margin;

  addText('TRANSACTION SAMPLE (Top 50 by Value)', 11, [0, 212, 255], true);
  doc.text('TRANSACTION SAMPLE (Top 50 by Value)', margin, y + 4);
  y += 10;

  const topTxs = [...transactions].sort((a, b) => b.value - a.value).slice(0, 50);

  for (const tx of topTxs) {
    checkPage(12);
    if (y + 8 > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      doc.setFillColor(10, 14, 26);
      doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
      y = margin;
    }

    const txLine = `${tx.hash.slice(0, 16)}... | ${tx.value.toFixed(6)} ${chainInfo.asset} | ${tx.from.slice(0, 10)} -> ${tx.to.slice(0, 10)} | ${new Date(tx.timestamp * 1000).toLocaleDateString()}`;
    addText(txLine, 7, [160, 160, 180]);
    doc.text(txLine, margin + 2, y + 3);
    y += 5;
  }

  // ---------- Footer ----------
  y += 10;
  drawLine();
  addText('This report was generated by ScamTrace Forensic Analyzer.', 7, [100, 100, 120]);
  doc.text('This report was generated by ScamTrace Forensic Analyzer.', margin, y + 3);
  y += 4;
  addText('For investigative use only. Verify all findings independently.', 7, [100, 100, 120]);
  doc.text('For investigative use only. Verify all findings independently.', margin, y + 3);

  // Save
  doc.save(`scamtrace-report-${graph.rootAddress.slice(0, 10)}-${Date.now()}.pdf`);
}
