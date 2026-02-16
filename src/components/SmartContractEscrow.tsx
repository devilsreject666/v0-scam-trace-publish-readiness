import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield, Clock, AlertTriangle, CheckCircle2, Lock, Send,
  Eye, XCircle, ArrowRight, Loader2, Timer, Zap, FileText,
  Copy, Activity, Wallet, Globe, ChevronDown, Info
} from 'lucide-react';

type EscrowStep = 'input' | 'simulating' | 'review' | 'cooling' | 'confirm' | 'sent' | 'monitoring';

interface SimulationResult {
  destinationAge: string;
  pastScamActivity: boolean;
  scamReports: number;
  mixerExposure: boolean;
  bridgeActivity: boolean;
  canWithdrawInstantly: boolean;
  riskScore: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  estimatedRecovery: string;
  connectedClusters: number;
  flags: string[];
}

const mockSimulation: SimulationResult = {
  destinationAge: '8 days',
  pastScamActivity: true,
  scamReports: 7,
  mixerExposure: true,
  bridgeActivity: true,
  canWithdrawInstantly: true,
  riskScore: 94,
  riskLevel: 'critical',
  estimatedRecovery: '<5%',
  connectedClusters: 3,
  flags: [
    'Wallet is 8 days old — extremely suspicious for receiving large amounts',
    'Connected to 3 known scam clusters in our database',
    '7 prior scam reports from other victims',
    'Funds from this wallet have passed through Tornado Cash (2 interactions)',
    'Cross-chain bridge activity detected (ETH → Polygon → Arbitrum)',
    'Funds can be withdrawn instantly — no time lock on destination',
    'Similar address pattern to known pig-butchering operation wallets',
    'Destination has received 45.2 ETH in last 48 hours from 12 unique senders',
  ],
};

export function SmartContractEscrow() {
  const [step, setStep] = useState<EscrowStep>('input');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [chain, setChain] = useState('Ethereum');
  const [cooldownHours, setCooldownHours] = useState(6);
  const [simProgress, setSimProgress] = useState(0);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [confirmText, setConfirmText] = useState('');
  const [acceptedRisk, setAcceptedRisk] = useState(false);
  const [, setTrackingActive] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const escrowIdRef = useRef('');

  const requiredConfirmText = 'Once sent, these funds may not be recoverable';

  const handleSimulate = useCallback(() => {
    if (!address.trim()) setAddress('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D');
    if (!amount.trim()) setAmount('2.5');
    escrowIdRef.current = 'ESC-' + Date.now().toString(36).toUpperCase();
    setStep('simulating');
    setSimProgress(0);
  }, [address, amount]);

  // Simulation progress
  useEffect(() => {
    if (step !== 'simulating') return;
    const interval = setInterval(() => {
      setSimProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setSimulation(mockSimulation);
          setTimeout(() => setStep('review'), 400);
          return 100;
        }
        return p + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [step]);

  const handleStartCooldown = () => {
    setStep('cooling');
    setCooldownRemaining(cooldownHours * 3600);
  };

  // Cooldown timer (accelerated for demo — 1 real second = 600 cooldown seconds)
  useEffect(() => {
    if (step !== 'cooling') return;
    cooldownRef.current = setInterval(() => {
      setCooldownRemaining(r => {
        if (r <= 0) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          setStep('confirm');
          return 0;
        }
        return r - 600; // accelerated
      });
    }, 1000);
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, [step]);

  const handleCancelDuringCooldown = () => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setStep('input');
    setSimulation(null);
    setAcceptedRisk(false);
    setConfirmText('');
  };

  const handleFinalSend = () => {
    if (confirmText.trim().toLowerCase() !== requiredConfirmText.toLowerCase()) return;
    if (!acceptedRisk) return;
    setStep('sent');
    setTrackingActive(true);
    setTimeout(() => setStep('monitoring'), 2000);
  };

  const handleReset = () => {
    setStep('input');
    setAddress('');
    setAmount('');
    setSimulation(null);
    setSimProgress(0);
    setCooldownRemaining(0);
    setConfirmText('');
    setAcceptedRisk(false);
    setTrackingActive(false);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address).catch(() => {});
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const cooldownPct = cooldownHours > 0 ? ((cooldownHours * 3600 - cooldownRemaining) / (cooldownHours * 3600)) * 100 : 0;

  const simSteps = [
    { threshold: 10, label: 'Checking destination wallet age...' },
    { threshold: 25, label: 'Querying scam databases...' },
    { threshold: 40, label: 'Analyzing transaction history...' },
    { threshold: 55, label: 'Detecting mixer & bridge exposure...' },
    { threshold: 70, label: 'Checking withdrawal patterns...' },
    { threshold: 85, label: 'Assessing recovery likelihood...' },
    { threshold: 95, label: 'Generating risk assessment...' },
  ];

  return (
    <section id="escrow" className="relative py-24 grid-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-1/4 h-[500px] w-[500px] rounded-full bg-cyber-green/[0.04] blur-[150px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-cyber-blue/[0.03] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-green/20 bg-cyber-green/[0.06] px-4 py-1.5">
            <Lock className="h-3.5 w-3.5 text-cyber-green" />
            <span className="text-xs font-medium text-cyber-green">Smart Contract Escrow</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Escrow <span className="gradient-text">Protection Layer</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Funds are held in a time-delayed escrow before release. Pre-send simulation shows exactly where funds go,
            whether they can be withdrawn instantly, and the likelihood of irreversible loss. This is prevention, not recovery.
          </p>
        </div>

        {/* Process timeline */}
        <div className="mb-12 mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Eye, label: 'Simulate', desc: 'Pre-send analysis', active: step === 'simulating' || step === 'review', done: ['cooling','confirm','sent','monitoring'].includes(step) },
              { icon: Timer, label: 'Cool Down', desc: 'Time-delayed hold', active: step === 'cooling', done: ['confirm','sent','monitoring'].includes(step) },
              { icon: Lock, label: 'Confirm', desc: 'Explicit consent', active: step === 'confirm', done: ['sent','monitoring'].includes(step) },
              { icon: Activity, label: 'Monitor', desc: 'Real-time tracking', active: step === 'monitoring', done: false },
            ].map((s, i) => (
              <div key={s.label} className={`glass-card rounded-xl p-4 text-center transition-all ${
                s.active ? 'border-cyber-green/30 bg-cyber-green/[0.03]' :
                s.done ? 'border-cyber-green/20 bg-cyber-green/[0.02]' : ''
              }`}>
                <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${
                  s.done ? 'bg-cyber-green/10' : s.active ? 'bg-cyber-green/10 animate-pulse-glow' : 'bg-white/5'
                }`}>
                  {s.done ? <CheckCircle2 className="h-5 w-5 text-cyber-green" /> : <s.icon className={`h-5 w-5 ${s.active ? 'text-cyber-green' : 'text-slate-500'}`} />}
                </div>
                <div className={`text-sm font-bold ${s.active || s.done ? 'text-white' : 'text-slate-500'}`}>
                  {i + 1}. {s.label}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-3xl">
          {/* ==================== INPUT ==================== */}
          {step === 'input' && (
            <div className="animate-fade-in-up space-y-6">
              <div className="glass-card rounded-2xl p-8">
                <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
                  <Shield className="h-5 w-5 text-cyber-green" />
                  Protected Transfer — Escrow Mode
                </h3>

                {/* Warning banner */}
                <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-400">Harm Reduction Mode</p>
                      <p className="mt-1 text-xs text-slate-400">
                        This mode is designed for high-risk situations. Crypto transactions may be irreversible.
                        ScamTrace cannot guarantee recovery — but we can help reduce harm and enable rapid response
                        by introducing delay, transparency, and real-time monitoring.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">Network</label>
                    <div className="relative">
                      <select value={chain} onChange={e => setChain(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-white/10 bg-dark-900 px-4 py-3 text-sm text-white outline-none focus:border-cyber-green/50 transition cursor-pointer">
                        {['Ethereum', 'Bitcoin', 'Polygon', 'Arbitrum', 'BSC', 'Avalanche'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">Recipient Address</label>
                    <div className="relative">
                      <Wallet className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input type="text" placeholder={chain === 'Bitcoin' ? 'bc1q... or 1... BTC address' : '0x... address'}
                        className="w-full rounded-xl border border-white/10 bg-dark-900 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 font-mono transition"
                        value={address} onChange={e => setAddress(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">Amount</label>
                    <div className="relative">
                      <input type="text" placeholder="0.00"
                        className="w-full rounded-xl border border-white/10 bg-dark-900 px-4 py-3 pr-16 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 font-mono transition"
                        value={amount} onChange={e => setAmount(e.target.value)} />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        {chain === 'Bitcoin' ? 'BTC' : chain === 'Polygon' ? 'MATIC' : 'ETH'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">Cooling-Off Period</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 6, 24].map(h => (
                        <button key={h} onClick={() => setCooldownHours(h)}
                          className={`rounded-xl border py-3 text-sm font-medium transition ${
                            cooldownHours === h
                              ? 'border-cyber-green/30 bg-cyber-green/10 text-cyber-green'
                              : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white hover:border-white/20'
                          }`}>
                          {h} hour{h > 1 ? 's' : ''}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] text-slate-500">
                      During this period, you can cancel the transaction, upload evidence, or re-scan the destination. This kills scammer urgency tactics.
                    </p>
                  </div>
                </div>

                <button onClick={handleSimulate}
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyber-green to-cyber-blue py-4 text-base font-bold text-dark-900 transition hover:shadow-lg hover:shadow-cyber-green/20 flex items-center justify-center gap-2">
                  <Eye className="h-5 w-5" /> Simulate Transaction
                </button>
              </div>
            </div>
          )}

          {/* ==================== SIMULATING ==================== */}
          {step === 'simulating' && (
            <div className="animate-fade-in-up">
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-cyber-green/10 animate-pulse-glow">
                  <Zap className="h-10 w-10 text-cyber-green" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Pre-Send Simulation</h3>
                <p className="text-sm text-slate-400 mb-6">
                  Analyzing destination before any funds leave your wallet...
                </p>

                <div className="mb-4 h-2 overflow-hidden rounded-full bg-dark-700">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyber-green to-cyber-blue transition-all duration-100"
                    style={{ width: `${simProgress}%` }} />
                </div>
                <span className="text-sm font-bold text-cyber-green">{simProgress}%</span>

                <div className="mt-6 space-y-2 text-left">
                  {simSteps.map((s, i) => {
                    const done = simProgress >= s.threshold + 10;
                    const active = simProgress >= s.threshold && !done;
                    return (
                      <div key={i} className={`flex items-center gap-2 text-xs ${done ? 'text-cyber-green' : active ? 'text-white' : 'text-slate-600'}`}>
                        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : active ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <div className="h-3.5 w-3.5 rounded-full border border-slate-700" />}
                        {s.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================== REVIEW ==================== */}
          {step === 'review' && simulation && (
            <div className="animate-fade-in-up space-y-6">
              {/* AI Results Banner - User must review before proceeding */}
              <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/[0.03] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-cyber-red" />
                  <h3 className="text-lg font-bold text-cyber-red">
                    ⚠️ AI EXTRACTION RESULTS — REVIEW BEFORE PROCEEDING
                  </h3>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  ScamTrace AI has analyzed the destination. The following data is presented for <strong className="text-white">your review and confirmation</strong> before any action is taken. No autonomous reporting occurs without your explicit consent.
                </p>

                {/* Risk Score */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-dark-900/80 border border-red-500/20">
                    <span className="text-4xl font-extrabold text-cyber-red">{simulation.riskScore}</span>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">CRITICAL RISK</div>
                    <div className="text-sm text-slate-400">
                      This address has a {simulation.riskScore}/100 risk score. Estimated recovery: <span className="text-cyber-red font-bold">{simulation.estimatedRecovery}</span>
                    </div>
                  </div>
                </div>

                {/* Key findings grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mb-6">
                  {[
                    { label: 'Wallet Age', value: simulation.destinationAge, bad: true },
                    { label: 'Scam Reports', value: `${simulation.scamReports} reports`, bad: true },
                    { label: 'Mixer Exposure', value: simulation.mixerExposure ? 'Yes — Tornado Cash' : 'None', bad: simulation.mixerExposure },
                    { label: 'Bridge Activity', value: simulation.bridgeActivity ? 'Multi-chain' : 'None', bad: simulation.bridgeActivity },
                    { label: 'Instant Withdraw', value: simulation.canWithdrawInstantly ? '⚠️ Yes' : 'Time-locked', bad: simulation.canWithdrawInstantly },
                    { label: 'Scam Clusters', value: `${simulation.connectedClusters} connected`, bad: simulation.connectedClusters > 0 },
                  ].map(item => (
                    <div key={item.label} className={`rounded-lg border p-3 ${item.bad ? 'border-red-500/20 bg-red-500/[0.03]' : 'border-green-500/20 bg-green-500/[0.03]'}`}>
                      <div className="text-xs text-slate-500">{item.label}</div>
                      <div className={`text-sm font-medium mt-0.5 ${item.bad ? 'text-red-400' : 'text-green-400'}`}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Detailed flags */}
                <div className="space-y-1.5 mb-6 max-h-[200px] overflow-y-auto">
                  {simulation.flags.map((flag, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">{flag}</span>
                    </div>
                  ))}
                </div>

                {/* Destination info */}
                <div className="rounded-lg bg-dark-900/50 p-3 font-mono text-xs text-slate-500 space-y-1 mb-4">
                  <div className="flex items-center gap-2">
                    <span>Destination:</span>
                    <span className="text-white">{address || '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'}</span>
                    <button onClick={copyAddress} className="text-slate-400 hover:text-white transition">
                      {copiedAddr ? <CheckCircle2 className="h-3 w-3 text-cyber-green" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                  <div>Amount: <span className="text-white">{amount || '2.5'} {chain === 'Bitcoin' ? 'BTC' : 'ETH'}</span></div>
                  <div>Network: <span className="text-white">{chain}</span></div>
                  <div>Escrow ID: <span className="text-cyber-green">{escrowIdRef.current}</span></div>
                </div>

                <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.03] p-3">
                  <p className="text-xs text-slate-400">
                    <span className="text-amber-400 font-medium">What happens next:</span> If you proceed, funds will enter a {cooldownHours}-hour cooling-off escrow. During this time you can cancel at any point. After the delay, you must type a confirmation phrase and explicitly approve the release.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyber-green/10 border border-cyber-green/20 py-4 text-sm font-bold text-cyber-green hover:bg-cyber-green/20 transition">
                  <CheckCircle2 className="h-4 w-4" /> Cancel — Don't Send
                </button>
                <button onClick={handleStartCooldown}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-cyber-red/30 bg-cyber-red/10 py-4 text-sm font-bold text-cyber-red hover:bg-cyber-red/20 transition">
                  <Timer className="h-4 w-4" /> Proceed to {cooldownHours}h Escrow Hold
                </button>
              </div>
            </div>
          )}

          {/* ==================== COOLING OFF ==================== */}
          {step === 'cooling' && (
            <div className="animate-fade-in-up">
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-cyber-blue/30 bg-dark-900/50 animate-border-pulse">
                  <Clock className="h-12 w-12 text-cyber-blue" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Cooling-Off Period Active</h3>
                <p className="text-sm text-slate-400 mb-6">
                  Funds are held in escrow. You can cancel anytime during this period.
                </p>

                <div className="text-5xl font-mono font-extrabold text-cyber-blue mb-4">
                  {formatTime(Math.max(0, cooldownRemaining))}
                </div>

                <div className="mb-6 h-2 overflow-hidden rounded-full bg-dark-700 max-w-md mx-auto">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyber-blue to-cyber-green transition-all"
                    style={{ width: `${cooldownPct}%` }} />
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-6">
                  <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
                    <div className="text-xs text-slate-500">Amount Held</div>
                    <div className="text-sm font-bold text-white mt-0.5">{amount || '2.5'} {chain === 'Bitcoin' ? 'BTC' : 'ETH'}</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
                    <div className="text-xs text-slate-500">Destination</div>
                    <div className="text-sm font-bold text-white mt-0.5 font-mono truncate">{(address || '0x7a25...dEad').slice(0, 12)}...</div>
                  </div>
                </div>

                <div className="space-y-3 max-w-md mx-auto mb-6">
                  <p className="text-xs text-slate-500">During this time, you can:</p>
                  {[
                    'Cancel the transaction and recover your funds',
                    'Upload additional evidence to the chat portal',
                    'Re-scan the destination address',
                    'Generate a preliminary evidence packet',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyber-green flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 max-w-md mx-auto">
                  <button onClick={handleCancelDuringCooldown}
                    className="flex-1 rounded-xl bg-cyber-green/10 border border-cyber-green/20 py-3.5 text-sm font-bold text-cyber-green hover:bg-cyber-green/20 transition flex items-center justify-center gap-2">
                    <XCircle className="h-4 w-4" /> Cancel & Recover Funds
                  </button>
                  <a href="#chat-evidence"
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white hover:bg-white/10 transition">
                    <FileText className="h-4 w-4" /> Upload Evidence
                  </a>
                </div>

                <p className="mt-4 text-[10px] text-slate-600">
                  Escrow ID: {escrowIdRef.current} • Funds remain under your control until final confirmation
                </p>
              </div>
            </div>
          )}

          {/* ==================== FINAL CONFIRM ==================== */}
          {step === 'confirm' && (
            <div className="animate-fade-in-up space-y-6">
              <div className="glass-card rounded-2xl border-cyber-red/30 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                    <AlertTriangle className="h-6 w-6 text-cyber-red" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Final Confirmation Required</h3>
                    <p className="text-sm text-slate-400">Cooling-off period complete. This is your last chance to cancel.</p>
                  </div>
                </div>

                <div className="mb-6 rounded-lg bg-dark-900/50 p-4 space-y-2 font-mono text-xs text-slate-400">
                  <div>Destination: <span className="text-white">{address || '0x7a250d...dEad'}</span></div>
                  <div>Amount: <span className="text-white">{amount || '2.5'} {chain === 'Bitcoin' ? 'BTC' : 'ETH'}</span></div>
                  <div>Risk Score: <span className="text-cyber-red font-bold">94/100 CRITICAL</span></div>
                  <div>Recovery Likelihood: <span className="text-cyber-red font-bold">&lt;5%</span></div>
                </div>

                <div className="mb-4">
                  <label className="text-xs text-slate-400 block mb-2">
                    Type the following sentence exactly to proceed:
                  </label>
                  <div className="rounded-lg bg-red-500/[0.03] border border-red-500/20 p-3 mb-3">
                    <p className="text-sm text-red-300 font-medium italic">&ldquo;{requiredConfirmText}&rdquo;</p>
                  </div>
                  <input type="text" placeholder="Type the sentence above..."
                    className="w-full rounded-xl border border-white/10 bg-dark-900 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-red/50 transition"
                    value={confirmText} onChange={e => setConfirmText(e.target.value)} />
                  {confirmText.length > 0 && (
                    <div className={`mt-2 text-xs ${confirmText.trim().toLowerCase() === requiredConfirmText.toLowerCase() ? 'text-cyber-green' : 'text-cyber-red'}`}>
                      {confirmText.trim().toLowerCase() === requiredConfirmText.toLowerCase() ? '✓ Sentence matches' : '✕ Sentence does not match'}
                    </div>
                  )}
                </div>

                <label className="flex items-start gap-2 cursor-pointer mb-6">
                  <input type="checkbox" checked={acceptedRisk} onChange={e => setAcceptedRisk(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-white/20 bg-dark-900 accent-cyber-red flex-shrink-0" />
                  <span className="text-xs text-slate-400">
                    I have reviewed the AI analysis. I understand this address is flagged as CRITICAL risk with {simulation?.scamReports} scam reports.
                    I acknowledge that recovery is estimated at {simulation?.estimatedRecovery}. I choose to proceed with full fund tracking enabled.
                  </span>
                </label>

                <div className="flex gap-3">
                  <button onClick={handleReset}
                    className="flex-1 rounded-xl bg-cyber-green/10 border border-cyber-green/20 py-3.5 text-sm font-bold text-cyber-green hover:bg-cyber-green/20 transition flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Cancel — Keep My Funds
                  </button>
                  <button onClick={handleFinalSend}
                    disabled={confirmText.trim().toLowerCase() !== requiredConfirmText.toLowerCase() || !acceptedRisk}
                    className="flex-1 rounded-xl border border-cyber-red/30 bg-cyber-red/10 py-3.5 text-sm font-bold text-cyber-red transition hover:bg-cyber-red/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <Send className="h-4 w-4" /> Release from Escrow
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SENT SUCCESS ==================== */}
          {step === 'sent' && (
            <div className="animate-fade-in-up">
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-cyber-blue/10">
                  <Send className="h-10 w-10 text-cyber-blue" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Transaction Released</h3>
                <p className="text-sm text-slate-400">Real-time monitoring is now active. Initializing tracking pipeline...</p>
                <Loader2 className="mx-auto mt-4 h-6 w-6 text-cyber-green animate-spin" />
              </div>
            </div>
          )}

          {/* ==================== MONITORING ==================== */}
          {step === 'monitoring' && (
            <div className="animate-fade-in-up space-y-6">
              <div className="glass-card rounded-2xl border-cyber-green/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyber-green/10 animate-pulse-glow">
                    <Activity className="h-5 w-5 text-cyber-green" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">🔴 LIVE — Real-Time Fund Monitoring</h3>
                    <p className="text-sm text-slate-400">Every movement is logged with timestamps for evidence</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-cyber-green animate-pulse" />
                    <span className="text-xs text-cyber-green font-medium">TRACKING</span>
                  </div>
                </div>

                <div className="rounded-lg bg-dark-900/50 p-4 font-mono text-xs space-y-1 text-slate-400 mb-4">
                  <div>Escrow ID: <span className="text-cyber-green">{escrowIdRef.current}</span></div>
                  <div>Tracking: <span className="text-white">{address || '0x7a250d...dEad'}</span></div>
                  <div>Amount: <span className="text-white">{amount || '2.5'} {chain === 'Bitcoin' ? 'BTC' : 'ETH'}</span></div>
                  <div>Status: <span className="text-cyber-red font-bold">FUNDS IN MOTION</span></div>
                </div>

                {/* Live alerts */}
                <div className="space-y-2">
                  {[
                    { time: '00:00:03', event: 'Transaction confirmed on-chain', level: 'info', icon: CheckCircle2 },
                    { time: '00:02:15', event: 'Recipient wallet split — 2 outbound txns detected', level: 'high', icon: AlertTriangle },
                    { time: '00:05:42', event: 'Tornado Cash deposit detected (1.5 ETH)', level: 'critical', icon: AlertTriangle },
                    { time: '00:08:18', event: 'Bridge to Polygon initiated (1.0 ETH → Hop Protocol)', level: 'high', icon: Globe },
                    { time: '00:12:55', event: '⚡ EXCHANGE DEPOSIT: Binance hot wallet (0.8 ETH)', level: 'critical', icon: Shield },
                    { time: '00:12:56', event: '🚨 AUTO-GENERATING FREEZE PACKET FOR BINANCE', level: 'critical', icon: FileText },
                  ].map((alert, i) => (
                    <div key={i} className={`flex items-start gap-3 rounded-lg border p-3 animate-fade-in ${
                      alert.level === 'critical' ? 'border-red-500/20 bg-red-500/[0.03]' :
                      alert.level === 'high' ? 'border-orange-500/20 bg-orange-500/[0.03]' :
                      'border-white/5 bg-white/[0.02]'
                    }`} style={{ animationDelay: `${i * 300}ms` }}>
                      <alert.icon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                        alert.level === 'critical' ? 'text-cyber-red' :
                        alert.level === 'high' ? 'text-cyber-orange' : 'text-cyber-green'
                      }`} />
                      <div className="flex-grow">
                        <span className="text-xs text-slate-300">{alert.event}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">+{alert.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auto-generated freeze packet */}
              <div className="glass-card rounded-2xl border-cyber-orange/30 p-6 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyber-orange/10">
                    <FileText className="h-5 w-5 text-cyber-orange" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">🚨 Freeze Packet Auto-Generated</h3>
                    <p className="text-sm text-slate-400">Exchange deposit detected — evidence packet ready for Binance</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Exchange', value: 'Binance' },
                    { label: 'Amount', value: '0.8 ETH' },
                    { label: 'Wallet Graph', value: '✓ Included' },
                    { label: 'TX Hashes', value: '6 transactions' },
                    { label: 'Timestamps', value: '✓ Verified' },
                    { label: 'User Statement', value: '✓ Attached' },
                  ].map(item => (
                    <div key={item.label} className="rounded-lg bg-white/[0.02] border border-white/5 p-2.5">
                      <div className="text-[10px] text-slate-500">{item.label}</div>
                      <div className="text-xs font-medium text-white">{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <a href="#evidence" className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyber-green to-cyber-blue py-3 text-sm font-bold text-dark-900 hover:shadow-lg hover:shadow-cyber-green/20 transition">
                    <FileText className="h-4 w-4" /> View Full Evidence Packet
                  </a>
                  <button className="flex items-center justify-center gap-2 rounded-xl border border-cyber-orange/20 bg-cyber-orange/10 px-5 py-3 text-sm font-bold text-cyber-orange hover:bg-cyber-orange/20 transition">
                    <Send className="h-4 w-4" /> Send Freeze Request
                  </button>
                </div>
              </div>

              <div className="text-center">
                <button onClick={handleReset} className="text-sm text-slate-400 hover:text-white transition">
                  Start New Escrow Transaction
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom disclaimer */}
        <div className="mt-12 mx-auto max-w-3xl text-center">
          <div className="rounded-xl border border-white/5 bg-dark-800/50 p-4">
            <p className="text-[10px] text-slate-600 leading-relaxed">
              <strong className="text-slate-500">Legal Notice:</strong> ScamTrace does not custody funds permanently.
              The escrow is a temporary protection layer. ScamTrace cannot guarantee recovery of funds once released.
              All evidence is generated for reporting purposes only. ScamTrace does not enforce law, identify real people,
              or encourage direct contact with suspects. Forensic intelligence is provided for authorized investigation and
              fraud documentation only.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
