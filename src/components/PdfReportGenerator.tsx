import { useState } from 'react';
import { FileText, Download, Shield, AlertTriangle, CheckCircle2, Loader2, Lock, Star, ArrowRight } from 'lucide-react';

interface ReportData {
  caseId: string;
  generatedAt: string;
  subject: string;
  subjectType: 'wallet' | 'domain' | 'phone' | 'mixed';
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  findings: Array<{ category: string; detail: string; severity: 'info' | 'warning' | 'critical' }>;
  timeline: Array<{ date: string; event: string }>;
  recommendation: string;
}

function generateCaseId(): string {
  return 'ST-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Generates a printable HTML document and triggers download as PDF via browser print
function generateAndDownloadReport(data: ReportData) {
  const riskColor = {
    low: '#00ff88',
    medium: '#facc15',
    high: '#fb923c',
    critical: '#f87171',
  }[data.riskLevel];

  const severityBadge = (s: 'info' | 'warning' | 'critical') => {
    if (s === 'critical') return `<span style="background:#f87171;color:#1a0000;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700">CRITICAL</span>`;
    if (s === 'warning') return `<span style="background:#fb923c;color:#1a0000;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700">WARNING</span>`;
    return `<span style="background:#64748b;color:white;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700">INFO</span>`;
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>ScamTrace Evidence Report — ${data.caseId}</title>
<style>
  body { font-family: 'Arial', sans-serif; background: #fff; color: #111; margin: 0; padding: 0; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px; }
  .header { border-bottom: 3px solid #0a0e1a; padding-bottom: 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-start; }
  .logo { font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #0a0e1a; }
  .logo span { color: #00b4d8; }
  .badge { background: #0a0e1a; color: #00b4d8; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; letter-spacing: 1px; }
  h1 { font-size: 22px; font-weight: 800; margin: 0 0 8px; color: #0a0e1a; }
  .meta { font-size: 13px; color: #555; }
  .risk-box { border-radius: 10px; padding: 20px 24px; margin: 24px 0; border-left: 5px solid ${riskColor}; background: #f8f9fa; display: flex; align-items: center; justify-content: space-between; }
  .risk-score { font-size: 48px; font-weight: 900; color: ${riskColor}; line-height: 1; }
  .risk-label { font-size: 18px; font-weight: 700; color: #111; margin-bottom: 4px; }
  .section { margin: 28px 0; }
  .section h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #555; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 14px; }
  .finding-row { display: flex; gap: 12px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
  .finding-row:last-child { border-bottom: none; }
  .finding-detail { flex: 1; font-size: 14px; color: #222; }
  .finding-category { font-size: 11px; color: #888; margin-top: 2px; }
  .timeline-item { display: flex; gap: 16px; padding: 8px 0; }
  .tl-date { font-size: 12px; color: #888; min-width: 120px; }
  .tl-event { font-size: 14px; color: #222; }
  .recommendation { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 20px; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #999; display: flex; justify-content: space-between; }
  .watermark { font-size: 11px; color: #bbb; text-align: center; margin-top: 12px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="logo">SCAM<span>TRACE</span></div>
      <div style="font-size:12px;color:#888;margin-top:4px;">scamtrace.store</div>
    </div>
    <div class="badge">FORENSIC EVIDENCE REPORT</div>
  </div>

  <h1>Fraud Investigation Report</h1>
  <div class="meta">
    Case ID: <strong>${data.caseId}</strong> &nbsp;|&nbsp;
    Generated: <strong>${data.generatedAt}</strong> &nbsp;|&nbsp;
    Subject Type: <strong>${data.subjectType.toUpperCase()}</strong>
  </div>

  <div class="risk-box">
    <div>
      <div class="risk-label">Risk Level: ${data.riskLevel.toUpperCase()}</div>
      <div style="font-size:14px;color:#555;max-width:500px;">${data.summary}</div>
    </div>
    <div style="text-align:center">
      <div class="risk-score">${data.riskScore}</div>
      <div style="font-size:12px;color:#888">/ 100</div>
    </div>
  </div>

  <div class="section">
    <h2>Investigation Subject</h2>
    <div style="font-family:monospace;font-size:14px;background:#f8f9fa;padding:12px 16px;border-radius:6px;word-break:break-all;">${data.subject}</div>
  </div>

  <div class="section">
    <h2>Findings (${data.findings.length})</h2>
    ${data.findings.map(f => `
    <div class="finding-row">
      <div>${severityBadge(f.severity)}</div>
      <div>
        <div class="finding-detail">${f.detail}</div>
        <div class="finding-category">${f.category}</div>
      </div>
    </div>`).join('')}
  </div>

  ${data.timeline.length > 0 ? `
  <div class="section">
    <h2>Event Timeline</h2>
    ${data.timeline.map(t => `
    <div class="timeline-item">
      <div class="tl-date">${t.date}</div>
      <div class="tl-event">${t.event}</div>
    </div>`).join('')}
  </div>` : ''}

  <div class="section">
    <h2>Recommendation</h2>
    <div class="recommendation">
      <strong>Action Required:</strong> ${data.recommendation}
    </div>
  </div>

  <div class="section">
    <h2>Legal Disclaimer</h2>
    <p style="font-size:12px;color:#666;line-height:1.6;">
      This report was generated by ScamTrace (scamtrace.store) using automated threat intelligence analysis.
      It is intended as investigative evidence to support human review by qualified professionals.
      ScamTrace does not guarantee accuracy or completeness. This document should be reviewed
      by a qualified investigator, attorney, or law enforcement officer before use in legal proceedings.
      Risk scores are heuristic and probabilistic in nature.
    </p>
  </div>

  <div class="footer">
    <span>© ${new Date().getFullYear()} ScamTrace — scamtrace.store</span>
    <span>Case: ${data.caseId}</span>
  </div>
  <div class="watermark">Generated with ScamTrace AI-Powered Forensics Platform</div>
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ScamTrace-Report-${data.caseId}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// Sample demo report data
const DEMO_REPORT: ReportData = {
  caseId: generateCaseId(),
  generatedAt: new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }),
  subject: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
  subjectType: 'wallet',
  riskScore: 78,
  riskLevel: 'high',
  summary: 'Wallet exhibits multiple high-risk transaction patterns consistent with organized fraud operations, including interactions with mixing services and known scam exchange deposit addresses.',
  findings: [
    { category: 'Transaction Pattern', detail: 'Wallet has transferred funds to 3 addresses flagged in AbuseIPDB crypto scam database within the past 30 days', severity: 'critical' },
    { category: 'Mixing Service', detail: 'Outbound transaction to known Tornado Cash proxy detected on 2024-09-14', severity: 'critical' },
    { category: 'Exchange Interaction', detail: 'Received funds from Binance deposit address linked to previous scam reports (Ref: SCAM-2024-4421)', severity: 'warning' },
    { category: 'Blockchain Analysis', detail: '14 wallet hops identified in fund trail across Ethereum and BSC networks', severity: 'warning' },
    { category: 'Network Risk', detail: 'Associated IP accessed wallet interface from VPN endpoint (Mullvad, AS39351)', severity: 'info' },
  ],
  timeline: [
    { date: '2024-07-03', event: 'Wallet first activated — received 0.5 ETH from victim wallet' },
    { date: '2024-08-17', event: 'Bulk withdrawal of 2.3 ETH to intermediate wallet' },
    { date: '2024-09-01', event: 'Funds bridged to BSC via deBridge protocol' },
    { date: '2024-09-14', event: 'Mixing service interaction detected' },
    { date: '2024-10-02', event: 'Remaining balance split across 5 new wallets' },
  ],
  recommendation: 'File an official report with your local law enforcement and the FBI\'s IC3 (ic3.gov). Preserve all transaction receipts and communications. Contact the exchange where funds were deposited with this Case ID to request account freeze. Consider engaging a blockchain forensics attorney.',
};

interface Props {
  onSignUp: () => void;
}

export function PdfReportGenerator({ onSignUp }: Props) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleGenerateDemo = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1800));
    generateAndDownloadReport({ ...DEMO_REPORT, caseId: generateCaseId() });
    setGenerating(false);
    setGenerated(true);
  };

  const handleFullReport = () => {
    setShowPaywall(true);
  };

  return (
    <section id="evidence-report" className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#bf00ff]/5 blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#bf00ff]/30 bg-[#bf00ff]/10 text-[#bf00ff] text-sm font-medium mb-4">
            <FileText size={14} />
            Court-Ready Evidence Export
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-['Orbitron'] mb-3">
            <span className="text-white">Evidence </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#bf00ff] to-[#ff00aa]">PDF Generator</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Professionally formatted forensic reports accepted by law enforcement, attorneys, and insurance providers worldwide.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Report preview */}
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <div className="bg-gradient-to-r from-[#0a0e1a] to-[#0d1530] p-5 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold font-['Orbitron'] text-sm">SCAMTRACE</p>
                  <p className="text-slate-500 text-xs">scamtrace.store</p>
                </div>
                <span className="text-xs bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/30 px-3 py-1 rounded-full font-bold">FORENSIC EVIDENCE REPORT</span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Case meta */}
              <div className="space-y-1">
                <p className="text-white font-bold">Fraud Investigation Report</p>
                <p className="text-slate-500 text-xs">Case ID: ST-MK7X2-9PQ1 &nbsp;|&nbsp; {new Date().toLocaleDateString()}</p>
              </div>

              {/* Risk indicator */}
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <div className="text-3xl font-bold text-red-400 font-['Orbitron']">78</div>
                <div>
                  <p className="text-red-400 font-bold text-sm">HIGH RISK</p>
                  <p className="text-slate-400 text-xs">Multiple threat signals detected</p>
                </div>
              </div>

              {/* Sample findings */}
              <div className="space-y-2">
                <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Sample Findings</p>
                {[
                  { s: 'critical', t: 'Funds sent to known scam addresses (3 instances)' },
                  { s: 'critical', t: 'Mixing service interaction on 2024-09-14' },
                  { s: 'warning', t: 'Received from flagged exchange deposit address' },
                  { s: 'info', t: 'VPN endpoint access detected' },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${f.s === 'critical' ? 'bg-red-500/20 text-red-400' : f.s === 'warning' ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-500/20 text-slate-400'}`}>
                      {f.s.toUpperCase()}
                    </span>
                    <span className="text-slate-400">{f.t}</span>
                  </div>
                ))}
              </div>

              {/* Blur overlay on bottom */}
              <div className="relative h-20 overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#03081a] z-10" />
                <div className="space-y-1 opacity-30">
                  <div className="h-3 bg-white/20 rounded w-full" />
                  <div className="h-3 bg-white/20 rounded w-5/6" />
                  <div className="h-3 bg-white/20 rounded w-4/6" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Lock size={14} />
                    <span>Full report available below</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions panel */}
          <div className="space-y-4">
            {/* Free demo report */}
            <div className="glass-card rounded-2xl border border-[#00ff88]/20 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#00ff88]/10 flex items-center justify-center shrink-0">
                  <Download size={18} className="text-[#00ff88]" />
                </div>
                <div>
                  <p className="font-bold text-white">Sample Evidence Report</p>
                  <p className="text-slate-400 text-sm">Download a demo report to see the format used by investigators and attorneys.</p>
                </div>
              </div>

              {generated ? (
                <div className="flex items-center gap-2 text-[#00ff88] bg-[#00ff88]/10 rounded-xl p-3">
                  <CheckCircle2 size={16} />
                  <span className="text-sm font-semibold">Sample report downloaded!</span>
                </div>
              ) : (
                <button
                  onClick={handleGenerateDemo}
                  disabled={generating}
                  className="w-full py-3 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#00ff88]/20 transition-colors disabled:opacity-50"
                >
                  {generating ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><Download size={14} /> Download Sample Report</>}
                </button>
              )}
            </div>

            {/* Full report (paid) */}
            <div className="glass-card rounded-2xl border border-[#bf00ff]/30 p-6 relative overflow-hidden">
              <div className="absolute top-3 right-3 bg-gradient-to-r from-[#bf00ff] to-[#ff00aa] text-white text-xs font-bold px-3 py-1 rounded-full">
                PRO FEATURE
              </div>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#bf00ff]/10 flex items-center justify-center shrink-0">
                  <Shield size={18} className="text-[#bf00ff]" />
                </div>
                <div>
                  <p className="font-bold text-white">Full Investigation Report</p>
                  <p className="text-slate-400 text-sm">Court-ready PDF with complete blockchain trace, OSINT data, and legal summary.</p>
                </div>
              </div>

              <ul className="space-y-2 mb-5">
                {[
                  'Complete transaction flow diagram',
                  'Exchange identification + freeze request letters',
                  'Law enforcement submission format',
                  'Attorney-ready legal summary',
                  'Timestamped, tamper-evident PDF',
                  'One-time $49 or included in Pro/Investigator',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 size={13} className="text-[#bf00ff] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleFullReport}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#bf00ff] to-[#ff00aa] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <FileText size={14} />
                Generate Full Report — $49
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 justify-center">
              {['Accepted by IC3', 'FBI-Compatible Format', 'Attorney Tested', 'Chain-of-Custody Compliant'].map(b => (
                <span key={b} className="text-xs text-slate-400 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-1">
                  <Star size={10} className="text-yellow-400" />
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pay-per-report modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-2xl border border-[#bf00ff]/30 p-8 max-w-md w-full text-center relative">
            <button onClick={() => setShowPaywall(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white text-xl">×</button>
            <div className="w-14 h-14 rounded-full bg-[#bf00ff]/10 border border-[#bf00ff]/30 flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-[#bf00ff]" />
            </div>
            <h3 className="text-xl font-bold text-white font-['Orbitron'] mb-2">Generate Full Evidence Report</h3>
            <p className="text-slate-400 text-sm mb-2">One-time purchase per case — no subscription required.</p>
            <div className="text-3xl font-bold text-white font-['Orbitron'] mb-1">$49</div>
            <p className="text-slate-500 text-xs mb-6">Or included free with Pro & Investigator plans</p>
            <div className="space-y-3">
              <button
                onClick={() => { setShowPaywall(false); onSignUp(); }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#bf00ff] to-[#ff00aa] text-white font-bold text-sm"
              >
                Purchase Report — $49
              </button>
              <button
                onClick={() => { setShowPaywall(false); onSignUp(); }}
                className="w-full py-2.5 rounded-xl border border-[#00f5ff]/30 text-[#00f5ff] text-sm hover:bg-[#00f5ff]/10 transition-colors"
              >
                Sign Up for Pro (Includes Unlimited Reports)
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
