import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import type { WalletGraph, WalletNode, GraphEdge } from '@/lib/graph-engine';
import { getRiskGrade, getRiskColor, getRoleColor } from '@/lib/graph-engine';
import { X, ZoomIn, ZoomOut, Maximize2, Lock, Unlock } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  role: WalletNode['role'];
  riskScore: number;
  totalIn: number;
  totalOut: number;
  txCount: number;
  degree: number;
  label?: string;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  id: string;
  value: number;
  txCount: number;
  chain: string;
}

interface D3ForceGraphProps {
  graph: WalletGraph;
  onNodeClick?: (address: string) => void;
  colorBy?: 'role' | 'risk';
  highlightedEdges?: Set<string>;
  width?: number;
  height?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function D3ForceGraph({
  graph,
  onNodeClick,
  colorBy = 'role',
  highlightedEdges,
  width: externalWidth,
  height: externalHeight,
}: D3ForceGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<D3Node, D3Link> | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: D3Node } | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [frozen, setFrozen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: externalWidth ?? 800, height: externalHeight ?? 600 });

  // Resize observer
  useEffect(() => {
    if (externalWidth && externalHeight) return;
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [externalWidth, externalHeight]);

  const getNodeColor = useCallback(
    (node: D3Node) => {
      if (colorBy === 'risk') {
        return getRiskColor(getRiskGrade(node.riskScore));
      }
      return getRoleColor(node.role);
    },
    [colorBy],
  );

  // Main D3 render
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width: w, height: h } = dimensions;

    // Build D3 data
    const nodes: D3Node[] = Array.from(graph.nodes.values()).map((n) => ({
      id: n.id,
      role: n.role,
      riskScore: n.riskScore,
      totalIn: n.totalIn,
      totalOut: n.totalOut,
      txCount: n.txCount,
      degree: n.degree,
      label: n.label,
    }));

    const nodeIds = new Set(nodes.map((n) => n.id));
    const links: D3Link[] = Array.from(graph.edges.values())
      .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
      .map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        value: e.value,
        txCount: e.txCount,
        chain: e.chain,
      }));

    // Zoom behavior
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoomBehavior);

    const g = svg.append('g');

    // Arrow markers
    const defs = svg.append('defs');
    defs
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'rgba(255,255,255,0.3)');

    defs
      .append('marker')
      .attr('id', 'arrow-highlight')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#00ff88');

    // Glow filter
    const filter = defs.append('filter').attr('id', 'glow');
    filter
      .append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Edges
    const maxEdgeValue = Math.max(...links.map((l) => l.value), 1);

    const link = g
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', (d) =>
        highlightedEdges?.has(d.id) ? '#00ff88' : 'rgba(255,255,255,0.12)',
      )
      .attr('stroke-width', (d) => Math.max(1, (d.value / maxEdgeValue) * 5))
      .attr('stroke-opacity', (d) => (highlightedEdges?.has(d.id) ? 0.9 : 0.4))
      .attr('marker-end', (d) =>
        highlightedEdges?.has(d.id) ? 'url(#arrow-highlight)' : 'url(#arrow)',
      );

    // Nodes
    const maxDegree = Math.max(...nodes.map((n) => n.degree), 1);

    const node = g
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d) => {
        if (d.id === graph.rootAddress) return 14;
        return Math.max(5, 4 + (d.degree / maxDegree) * 10);
      })
      .attr('fill', (d) => getNodeColor(d))
      .attr('stroke', (d) =>
        selectedNode === d.id ? '#fff' : 'rgba(255,255,255,0.15)',
      )
      .attr('stroke-width', (d) => (selectedNode === d.id ? 2.5 : 1))
      .attr('cursor', 'pointer')
      .style('filter', (d) => (d.id === graph.rootAddress ? 'url(#glow)' : 'none'))
      .on('mouseover', function (event, d) {
        d3.select(this).attr('stroke', '#fff').attr('stroke-width', 2.5);
        const [x, y] = d3.pointer(event, containerRef.current);
        setTooltip({ x, y, node: d });
      })
      .on('mouseout', function (_, d) {
        if (selectedNode !== d.id) {
          d3.select(this)
            .attr('stroke', 'rgba(255,255,255,0.15)')
            .attr('stroke-width', 1);
        }
        setTooltip(null);
      })
      .on('click', (_, d) => {
        setSelectedNode(d.id);
        onNodeClick?.(d.id);
      });

    // Labels for high-degree nodes
    const labelThreshold = Math.max(3, maxDegree * 0.3);
    g.append('g')
      .selectAll('text')
      .data(nodes.filter((n) => n.degree >= labelThreshold || n.id === graph.rootAddress))
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -16)
      .attr('fill', 'rgba(255,255,255,0.7)')
      .attr('font-size', '10px')
      .attr('pointer-events', 'none')
      .text((d) => d.label ?? `${d.id.slice(0, 6)}...${d.id.slice(-4)}`);

    // Drag behavior
    const drag = d3
      .drag<SVGCircleElement, D3Node>()
      .on('start', (event, d) => {
        if (!event.active) simulationRef.current?.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulationRef.current?.alphaTarget(0);
        if (!frozen) {
          d.fx = null;
          d.fy = null;
        }
      });

    node.call(drag);

    // Force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink<D3Node, D3Link>(links)
          .id((d) => d.id)
          .distance(80),
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(w / 2, h / 2))
      .force('collision', d3.forceCollide().radius(20))
      .on('tick', () => {
        link
          .attr('x1', (d) => (d.source as D3Node).x!)
          .attr('y1', (d) => (d.source as D3Node).y!)
          .attr('x2', (d) => (d.target as D3Node).x!)
          .attr('y2', (d) => (d.target as D3Node).y!);

        node.attr('cx', (d) => d.x!).attr('cy', (d) => d.y!);

        // Update labels
        g.selectAll<SVGTextElement, D3Node>('text')
          .attr('x', (d) => d.x!)
          .attr('y', (d) => d.y!);
      });

    simulationRef.current = simulation;

    // Zoom controls
    const zoomIn = () => svg.transition().duration(300).call(zoomBehavior.scaleBy, 1.3);
    const zoomOut = () => svg.transition().duration(300).call(zoomBehavior.scaleBy, 0.7);
    const fitAll = () => {
      const bounds = g.node()?.getBBox();
      if (!bounds) return;
      const fullW = bounds.width || w;
      const fullH = bounds.height || h;
      const midX = bounds.x + fullW / 2;
      const midY = bounds.y + fullH / 2;
      const scale = 0.8 / Math.max(fullW / w, fullH / h);
      svg
        .transition()
        .duration(500)
        .call(
          zoomBehavior.transform,
          d3.zoomIdentity.translate(w / 2 - midX * scale, h / 2 - midY * scale).scale(scale),
        );
    };

    // Expose zoom functions
    (containerRef.current as HTMLDivElement & { _zoom: { in: () => void; out: () => void; fit: () => void } })._zoom = {
      in: zoomIn,
      out: zoomOut,
      fit: fitAll,
    };

    // Center after initial layout
    setTimeout(fitAll, 1000);

    return () => {
      simulation.stop();
    };
  }, [graph, dimensions, colorBy, highlightedEdges, getNodeColor, selectedNode, onNodeClick, frozen]);

  const handleZoomIn = () => {
    (containerRef.current as HTMLDivElement & { _zoom?: { in: () => void } })?._zoom?.in();
  };
  const handleZoomOut = () => {
    (containerRef.current as HTMLDivElement & { _zoom?: { out: () => void } })?._zoom?.out();
  };
  const handleFit = () => {
    (containerRef.current as HTMLDivElement & { _zoom?: { fit: () => void } })?._zoom?.fit();
  };

  const toggleFreeze = () => {
    setFrozen((f) => {
      const next = !f;
      if (next) {
        simulationRef.current?.stop();
      } else {
        simulationRef.current?.alpha(0.3).restart();
      }
      return next;
    });
  };

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[400px]">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      />

      {/* Zoom controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded-lg bg-dark-700/80 border border-white/10 text-white/70 hover:text-white hover:bg-dark-600 transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded-lg bg-dark-700/80 border border-white/10 text-white/70 hover:text-white hover:bg-dark-600 transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={handleFit}
          className="p-1.5 rounded-lg bg-dark-700/80 border border-white/10 text-white/70 hover:text-white hover:bg-dark-600 transition-colors"
          aria-label="Fit to view"
        >
          <Maximize2 size={16} />
        </button>
        <button
          onClick={toggleFreeze}
          className={`p-1.5 rounded-lg border transition-colors ${
            frozen
              ? 'bg-cyber-green/20 border-cyber-green/40 text-cyber-green'
              : 'bg-dark-700/80 border-white/10 text-white/70 hover:text-white hover:bg-dark-600'
          }`}
          aria-label={frozen ? 'Unfreeze layout' : 'Freeze layout'}
        >
          {frozen ? <Lock size={16} /> : <Unlock size={16} />}
        </button>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 glass-card rounded-lg px-3 py-2 text-xs max-w-[220px]"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <p className="font-mono text-cyber-green truncate">{tooltip.node.id}</p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: getNodeColor(tooltip.node) }}
            />
            <span className="capitalize text-white/70">{tooltip.node.role}</span>
            <span className="text-white/40">|</span>
            <span className="text-white/70">Risk: {tooltip.node.riskScore}</span>
          </div>
          <div className="mt-1 text-white/50">
            In: {tooltip.node.totalIn.toFixed(4)} / Out: {tooltip.node.totalOut.toFixed(4)}
          </div>
        </div>
      )}

      {/* Selected node panel */}
      {selectedNode && (
        <div className="absolute bottom-3 left-3 right-3 glass-card rounded-xl p-4 animate-fade-in-up">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Selected Wallet</p>
              <p className="font-mono text-sm text-cyber-green break-all">{selectedNode}</p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              aria-label="Close panel"
            >
              <X size={14} />
            </button>
          </div>
          {(() => {
            const nodeData = graph.nodes.get(selectedNode);
            if (!nodeData) return null;
            const grade = getRiskGrade(nodeData.riskScore);
            return (
              <div className="grid grid-cols-4 gap-3 mt-3">
                <div>
                  <p className="text-[10px] text-white/40 uppercase">Role</p>
                  <p className="text-sm capitalize" style={{ color: getRoleColor(nodeData.role) }}>
                    {nodeData.role}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase">Risk</p>
                  <p className="text-sm font-bold" style={{ color: getRiskColor(grade) }}>
                    {nodeData.riskScore}/100
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase">Transactions</p>
                  <p className="text-sm text-white/90">{nodeData.txCount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase">Connections</p>
                  <p className="text-sm text-white/90">{nodeData.degree}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
