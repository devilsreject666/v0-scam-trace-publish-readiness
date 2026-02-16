import { useState } from 'react';
import {
  Shield, AlertTriangle, Send, Eye, EyeOff, ArrowRight,
  CheckCircle2, XCircle, Copy, Wallet, ChevronDown, Info, 
  CheckCircle, Activity
} from 'lucide-react';

export function ScamShieldWallet() {
  const [sendAddress, setSendAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [riskChecked, setRiskChecked] = useState(false);
  const [acceptedRisk, setAcceptedRisk] = useState(false);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [selectedChain, setSelectedChain] = useState('Bitcoin');
  const [showTooltip, setShowTooltip] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const handleSendCheck = () => {
    if (sendAddress.trim() && sendAmount.trim()) {
      setShowWarning(true);
      setRiskChecked(true);
    }
  };

  const handleCancel = () => {
    setShowWarning(false);
    setRiskChecked(false);
    setSendAddress('');
    setSendAmount('');
    setAcceptedRisk(false);
  };

  const handleSendWithTracking = () => {
    if (!acceptedRisk) return;
    setSendSuccess(true);
    setTimeout(() => {
      setSendSuccess(false);
      setShowWarning(false);
      setRiskChecked(false);
      setSendAddress('');
      setSendAmount('');
      setAcceptedRisk(false);
    }, 3000);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText('0x8f3a...b2c1').catch(() => {});
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <section id="scam-wallet" className="relative py-24 grid-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-1/3 top-1/4 h-[500px] w-[500px] rounded-full bg-cyber-red/[0.03] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-red/20 bg-cyber-red/5 px-4 py-1.5">
            <Shield className="h-3.5 w-3.5 text-cyber-red" />
            <span className="text-xs font-medium text-cyber-red">Scam Shield Wallet</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Protected <span className="gradient-text">Crypto Wallet</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            For users who choose to proceed with sending funds — our integrated wallet automatically tracks every coin.
            Even as scammers split, mix, or bridge funds, every movement is logged and traceable.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Wallet Card */}
            <div className="lg:col-span-2">
              <div className="glass-card overflow-hidden rounded-2xl">
                {/* Wallet header gradient */}
                <div className="bg-gradient-to-br from-brand-700 via-brand-800 to-dark-900 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-cyber-green" />
                      <span className="text-sm font-medium text-white">ScamTrace Wallet</span>
                    </div>
                    <button onClick={() => setShowBalance(!showBalance)} className="text-slate-400 hover:text-white transition">
                      {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="mt-6">
                    <div className="text-xs text-slate-400">Total Balance</div>
                    <div className="mt-1 text-3xl font-bold text-white">
                      {showBalance ? '$6,935.50' : '••••••'}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs flex-wrap">
                    <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-white">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyber-green animate-pulse" />
                      Connected
                    </div>
                    <div className="rounded-full bg-white/10 px-2 py-1 text-white font-mono">
                      0x8f3a...b2c1
                    </div>
                    <button onClick={handleCopyAddress} className="text-slate-400 hover:text-white transition">
                      {copiedAddress ? <CheckCircle className="h-3.5 w-3.5 text-cyber-green" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Token list */}
                <div className="p-4">
                  <div className="text-xs font-medium text-slate-400 mb-3">Assets</div>
                  {[
                    { token: 'BTC', amount: '0.0425', usd: '$2,650.00', chain: 'Bitcoin', color: 'bg-amber-500/20 text-amber-400' },
                    { token: 'ETH', amount: '1.25', usd: '$2,875.00', chain: 'Ethereum', color: 'bg-blue-500/20 text-blue-400' },
                    { token: 'MATIC', amount: '850.00', usd: '$680.00', chain: 'Polygon', color: 'bg-purple-500/20 text-purple-400' },
                    { token: 'USDT', amount: '500.00', usd: '$500.00', chain: 'Ethereum', color: 'bg-green-500/20 text-green-400' },
                    { token: 'ARB', amount: '200.50', usd: '$230.50', chain: 'Arbitrum', color: 'bg-cyan-500/20 text-cyan-400' },
                  ].map(asset => (
                    <div key={asset.token} className="flex items-center justify-between border-b border-white/5 py-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${asset.color}`}>
                          {asset.token.slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{asset.token}</div>
                          <div className="text-xs text-slate-500">{asset.chain}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">{showBalance ? asset.amount : '•••'}</div>
                        <div className="text-xs text-slate-500">{showBalance ? asset.usd : '•••'}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Tracking status */}
                <div className="border-t border-white/5 p-4">
                  <div className="flex items-center gap-2 text-xs">
                    <Activity className="h-3.5 w-3.5 text-cyber-green" />
                    <span className="text-slate-400">Active Tracking:</span>
                    <span className="text-cyber-green font-medium">2 addresses monitored</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Send form with protection */}
            <div className="lg:col-span-3 space-y-4">
              {/* Send success message */}
              {sendSuccess && (
                <div className="glass-card rounded-xl border-cyber-green/30 p-4 animate-fade-in-up">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-cyber-green flex-shrink-0" />
                    <div>
                      <h4 className="text-base font-bold text-cyber-green">Transaction Sent with Tracking</h4>
                      <p className="text-sm text-slate-400 mt-1">
                        Fund tracking is active. You&apos;ll receive alerts for all fund movements including splits, mixer interactions, bridge transfers, and exchange deposits.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="glass-card rounded-xl p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                  <Send className="h-5 w-5 text-cyber-blue" />
                  Send Funds
                  <span className="ml-auto flex items-center gap-1.5 text-xs text-cyber-green">
                    <Shield className="h-3.5 w-3.5" />
                    Protection Active
                  </span>
                </h3>

                <div className="space-y-4">
                  {/* Chain selector */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Network</label>
                    <div className="relative">
                      <select
                        value={selectedChain}
                        onChange={e => setSelectedChain(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-white/10 bg-dark-900 px-4 py-2.5 text-sm text-white outline-none focus:border-cyber-green/50 transition cursor-pointer"
                      >
                        {['Bitcoin', 'Ethereum', 'Polygon', 'Arbitrum', 'BSC', 'Avalanche', 'Optimism'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Recipient */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Recipient Address</label>
                    <input
                      type="text"
                      placeholder={selectedChain === 'Bitcoin' ? 'bc1q... or 1... or 3... BTC address' : '0x... or ENS name'}
                      className="w-full rounded-lg border border-white/10 bg-dark-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 font-mono transition"
                      value={sendAddress}
                      onChange={e => { setSendAddress(e.target.value); setShowWarning(false); setRiskChecked(false); setAcceptedRisk(false); }}
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Amount</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="0.00"
                        className="w-full rounded-lg border border-white/10 bg-dark-900 px-4 py-2.5 pr-16 text-sm text-white placeholder-slate-500 outline-none focus:border-cyber-green/50 font-mono transition"
                        value={sendAmount}
                        onChange={e => setSendAmount(e.target.value)}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">{selectedChain === 'Bitcoin' ? 'BTC' : selectedChain === 'Polygon' ? 'MATIC' : selectedChain === 'BSC' ? 'BNB' : selectedChain === 'Avalanche' ? 'AVAX' : 'ETH'}</span>
                    </div>
                  </div>

                  {/* Tracking toggle */}
                  <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-cyber-green" />
                      <span className="text-sm text-white">Enable Fund Tracking</span>
                      <div className="relative">
                        <button 
                          onMouseEnter={() => setShowTooltip(true)}
                          onMouseLeave={() => setShowTooltip(false)}
                          onClick={() => setShowTooltip(!showTooltip)}
                          className="text-slate-500 hover:text-slate-300 transition"
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                        {showTooltip && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-dark-700 p-3 text-xs text-slate-300 shadow-xl border border-white/10 z-10">
                            When enabled, ScamTrace will automatically monitor and log all movements of sent funds, including splits, mixer interactions, bridge transfers, and exchange deposits.
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-dark-700" />
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setTrackingEnabled(!trackingEnabled)}
                      className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${trackingEnabled ? 'bg-cyber-green' : 'bg-dark-600'}`}
                      role="switch"
                      aria-checked={trackingEnabled}
                    >
                      <div 
                        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200"
                        style={{ transform: trackingEnabled ? 'translateX(22px)' : 'translateX(2px)' }}
                      />
                    </button>
                  </div>

                  {/* Check risk button */}
                  {!riskChecked && (
                    <button
                      onClick={handleSendCheck}
                      disabled={!sendAddress.trim() || !sendAmount.trim()}
                      className="w-full rounded-xl border border-cyber-blue/30 bg-cyber-blue/10 py-3 text-sm font-bold text-cyber-blue transition hover:bg-cyber-blue/20 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Check Address Risk Before Sending
                    </button>
                  )}
                </div>
              </div>

              {/* Warning panel */}
              {showWarning && !sendSuccess && (
                <div className="animate-fade-in-up glass-card rounded-xl border-cyber-red/30 p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                      <AlertTriangle className="h-5 w-5 text-cyber-red" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-base font-bold text-cyber-red">⚠️ HIGH RISK ADDRESS DETECTED</h4>
                      <p className="mt-2 text-sm text-slate-400">
                        This address has been flagged in our database with the following risks:
                      </p>
                      <ul className="mt-3 space-y-2">
                        {[
                          'Associated with 12 reported scam incidents',
                          selectedChain === 'Bitcoin'
                            ? 'Connected to known BTC mixer services (Wasabi CoinJoin, Whirlpool)'
                            : 'Connected to known mixer services (Tornado Cash)',
                          'Funds traced to sanctioned entities',
                          selectedChain === 'Bitcoin'
                            ? 'UTXO pattern consistent with BTC laundering via peel chains'
                            : 'Pattern consistent with pig butchering scam',
                          selectedChain === 'Bitcoin'
                            ? 'Address linked to cross-chain bridge deposits from Ethereum'
                            : 'Cross-chain bridge activity detected to Bitcoin network',
                        ].map(risk => (
                          <li key={risk} className="flex items-start gap-2 text-sm text-red-300">
                            <XCircle className="h-4 w-4 flex-shrink-0 text-cyber-red mt-0.5" />
                            {risk}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-4 rounded-lg border border-cyber-green/20 bg-cyber-green/5 p-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-cyber-green">
                          <Shield className="h-4 w-4" />
                          ScamTrace Protection
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          If you proceed, ScamTrace will automatically track all fund movements from this address.
                          Any exchange deposits, mixer interactions, or bridge transfers will trigger instant alerts.
                          A freeze-ready evidence packet will be generated automatically.
                        </p>
                      </div>

                      <label className="mt-4 flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={acceptedRisk}
                          onChange={e => setAcceptedRisk(e.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-white/20 bg-dark-900 accent-cyber-red flex-shrink-0"
                        />
                        <span className="text-xs text-slate-400 select-none">
                          I understand the risks. I acknowledge this address has been flagged as high-risk
                          and I choose to proceed with fund tracking enabled.
                        </span>
                      </label>

                      <div className="mt-4 flex gap-3 flex-col sm:flex-row">
                        <button
                          onClick={handleCancel}
                          className="flex-1 rounded-xl bg-cyber-green/10 py-3 text-sm font-bold text-cyber-green transition hover:bg-cyber-green/20 flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Cancel — Stay Safe
                        </button>
                        <button
                          onClick={handleSendWithTracking}
                          disabled={!acceptedRisk}
                          className="flex-1 rounded-xl border border-cyber-red/30 bg-cyber-red/10 py-3 text-sm font-bold text-cyber-red transition hover:bg-cyber-red/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                          <Send className="h-4 w-4" />
                          Send with Tracking
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
