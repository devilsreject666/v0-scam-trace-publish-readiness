import { useState } from 'react';
import { Bell, Wallet, Globe, Plus, Trash2, CheckCircle2, AlertTriangle, Activity, Lock, Zap, Mail } from 'lucide-react';

type MonitorType = 'wallet' | 'domain';

interface MonitorEntry {
  id: string;
  type: MonitorType;
  value: string;
  label: string;
  status: 'active' | 'alert' | 'clean';
  lastChecked: string;
  alerts: number;
}

const DEMO_ENTRIES: MonitorEntry[] = [
  {
    id: '1', type: 'wallet', value: '0xde0B295669a9FD93...7BAe',
    label: 'My ETH Wallet', status: 'alert', lastChecked: '2 min ago', alerts: 2,
  },
  {
    id: '2', type: 'domain', value: 'mybusiness.com',
    label: 'Business Domain', status: 'clean', lastChecked: '5 min ago', alerts: 0,
  },
  {
    id: '3', type: 'wallet', value: 'TRx8HkprKQxLqhHF...cGqD',
    label: 'TRON Wallet', status: 'active', lastChecked: '1 min ago', alerts: 0,
  },
];

const ALERT_TYPES = [
  { icon: Activity, color: 'text-[#00f5ff]', label: 'Inbound transaction from flagged wallet', time: '14 min ago', severity: 'high' },
  { icon: AlertTriangle, color: 'text-orange-400', label: 'Wallet address appeared in new scam report', time: '2 hrs ago', severity: 'medium' },
  { icon: Globe, color: 'text-red-400', label: 'Domain WHOIS changed — new registrant detected', time: '1 day ago', severity: 'info' },
];

interface Props {
  onSignUp: () => void;
}

export function MonitoringAlerts({ onSignUp }: Props) {
  const [newValue, setNewValue] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [monitorType, setMonitorType] = useState<MonitorType>('wallet');
  const [showAddForm, setShowAddForm] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSaved, setEmailSaved] = useState(false);

  const statusConfig = {
    alert: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', label: 'Alert', dot: 'bg-red-400' },
    clean: { color: 'text-[#00ff88]', bg: 'bg-[#00ff88]/10', border: 'border-[#00ff88]/30', label: 'Clean', dot: 'bg-[#00ff88]' },
    active: { color: 'text-[#00f5ff]', bg: 'bg-[#00f5ff]/10', border: 'border-[#00f5ff]/30', label: 'Monitoring', dot: 'bg-[#00f5ff]' },
  };

  const handleSaveEmail = () => {
    if (email.includes('@')) {
      setEmailSaved(true);
    }
  };

  return (
    <section id="monitoring" className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-[#00f5ff]/5 blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00f5ff]/30 bg-[#00f5ff]/10 text-[#00f5ff] text-sm font-medium mb-4">
            <Bell size={14} />
            Real-Time Threat Monitoring
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-['Orbitron'] mb-3">
            <span className="text-white">Wallet & Domain </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f5ff] to-[#00ff88]">Monitoring</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Get instant alerts when your wallet addresses or domains appear in new scam reports, threat databases, or suspicious transaction patterns.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Monitor list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold">Active Monitors</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 text-sm text-[#00f5ff] hover:text-white transition-colors"
              >
                <Plus size={14} />
                Add Monitor
              </button>
            </div>

            {/* Add form */}
            {showAddForm && (
              <div className="glass-card rounded-xl border border-[#00f5ff]/30 p-4 space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setMonitorType('wallet')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${monitorType === 'wallet' ? 'bg-[#00f5ff]/20 text-[#00f5ff] border border-[#00f5ff]/30' : 'bg-white/5 text-slate-400 border border-white/10'}`}
                  >
                    <Wallet size={12} className="inline mr-1.5" />Wallet
                  </button>
                  <button
                    onClick={() => setMonitorType('domain')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${monitorType === 'domain' ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30' : 'bg-white/5 text-slate-400 border border-white/10'}`}
                  >
                    <Globe size={12} className="inline mr-1.5" />Domain
                  </button>
                </div>
                <input
                  type="text"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="Label (e.g. My ETH Wallet)"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#00f5ff]/50"
                />
                <input
                  type="text"
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  placeholder={monitorType === 'wallet' ? '0x... wallet address' : 'yourdomain.com'}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#00f5ff]/50"
                />
                <button
                  onClick={() => { onSignUp(); setShowAddForm(false); }}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#00f5ff] to-[#00ff88] text-[#03081a] font-bold text-sm"
                >
                  Sign Up to Activate Monitor
                </button>
                <p className="text-center text-slate-500 text-xs">Free account includes 3 monitors. Pro includes unlimited.</p>
              </div>
            )}

            {/* Demo entries */}
            {DEMO_ENTRIES.map(entry => {
              const cfg = statusConfig[entry.status];
              const TypeIcon = entry.type === 'wallet' ? Wallet : Globe;
              return (
                <div key={entry.id} className={`glass-card rounded-xl border ${cfg.border} p-4`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <TypeIcon size={16} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-white font-semibold text-sm">{entry.label}</p>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${cfg.dot} ${entry.status === 'active' ? 'animate-pulse' : ''}`} />
                          <span className={`text-xs ${cfg.color} font-medium`}>{cfg.label}</span>
                        </div>
                      </div>
                      <p className="text-slate-500 text-xs font-mono truncate mt-0.5">{entry.value}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-slate-600 text-xs">Last checked: {entry.lastChecked}</span>
                        {entry.alerts > 0 && (
                          <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                            {entry.alerts} new alert{entry.alerts > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="text-slate-600 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Unlock CTA */}
            <div className="glass-card rounded-xl border border-white/10 p-4 flex items-center gap-3 opacity-60">
              <Lock size={16} className="text-slate-500" />
              <span className="text-slate-500 text-sm">+ Add up to unlimited monitors with Pro plan</span>
              <button onClick={onSignUp} className="ml-auto text-[#00f5ff] text-xs hover:underline">Upgrade</button>
            </div>
          </div>

          {/* Alert feed + email setup */}
          <div className="space-y-4">
            {/* Recent alerts */}
            <div className="glass-card rounded-xl border border-white/10 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm">Recent Alerts</h3>
                <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">3 new</span>
              </div>
              <div className="space-y-3">
                {ALERT_TYPES.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className={`w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5`}>
                      <a.icon size={12} className={a.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 text-xs leading-snug">{a.label}</p>
                      <p className="text-slate-600 text-[10px] mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={onSignUp} className="w-full mt-4 py-2 rounded-lg border border-white/10 text-slate-400 text-xs hover:border-[#00f5ff]/30 hover:text-[#00f5ff] transition-colors">
                View All Alerts
              </button>
            </div>

            {/* Email alerts setup */}
            <div className="glass-card rounded-xl border border-[#00ff88]/20 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Mail size={14} className="text-[#00ff88]" />
                <h3 className="text-white font-semibold text-sm">Email Alerts</h3>
              </div>
              <p className="text-slate-400 text-xs mb-3">Get instant email notifications when threats are detected.</p>

              {emailSaved ? (
                <div className="flex items-center gap-2 text-[#00ff88] bg-[#00ff88]/10 rounded-lg p-2.5">
                  <CheckCircle2 size={13} />
                  <span className="text-xs font-semibold">Email saved! Sign up to activate.</span>
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#00ff88]/50 mb-2"
                  />
                  <button
                    onClick={handleSaveEmail}
                    className="w-full py-2 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs font-semibold hover:bg-[#00ff88]/20 transition-colors"
                  >
                    Enable Email Alerts
                  </button>
                </>
              )}
            </div>

            {/* Alert types */}
            <div className="glass-card rounded-xl border border-white/10 p-4">
              <h3 className="text-white font-semibold text-sm mb-3">What We Monitor</h3>
              <ul className="space-y-2">
                {[
                  'New transactions from/to flagged wallets',
                  'Appearance in scam reports',
                  'Exchange interactions',
                  'Mixer/bridge activity',
                  'Domain WHOIS changes',
                  'SSL certificate expiry',
                  'New phishing database entries',
                  'IP geolocation anomalies',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
                    <Zap size={10} className="text-[#00f5ff] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
