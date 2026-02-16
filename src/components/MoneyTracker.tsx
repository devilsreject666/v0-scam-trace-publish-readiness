import { useState } from 'react';
import {
  DollarSign, TrendingUp, Wallet, Globe, BarChart3,
  ArrowRight, AlertTriangle, Shield, PieChart
} from 'lucide-react';

type TrackerView = 'overview' | 'wallet' | 'domain' | 'type';

export function MoneyTracker() {
  const [view, setView] = useState<TrackerView>('overview');

  return (
    <section id="money-tracker" className="relative py-24 grid-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-1/3 top-1/3 h-[500px] w-[500px] rounded-full bg-cyber-orange/[0.03] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-orange/20 bg-cyber-orange/[0.06] px-4 py-1.5">
            <DollarSign className="h-3.5 w-3.5 text-cyber-orange" />
            <span className="text-xs font-medium text-cyber-orange">Money Tracker</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Loss <span className="gradient-text">Intelligence</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Track reported losses, aggregate totals by wallet, domain, or scam type. Real-time financial intelligence from the ScamTrace network.
          </p>
        </div>

        {/* View tabs */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {([
            { key: 'overview' as const, label: 'Overview', icon: BarChart3 },
            { key: 'wallet' as const, label: 'By Wallet', icon: Wallet },
            { key: 'domain' as const, label: 'By Domain', icon: Globe },
            { key: 'type' as const, label: 'By Scam Type', icon: PieChart },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                view === tab.key ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {view === 'overview' && (
          <div className="animate-fade-in space-y-6">
            {/* Big stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Total Reported Loss', value: '$4.8M', change: '+$230K this week', color: 'text-cyber-red', icon: DollarSign },
                { label: 'Average Loss', value: '$12,400', change: 'Per victim', color: 'text-cyber-orange', icon: TrendingUp },
                { label: 'Funds Frozen', value: '$1.2M', change: '25% recovery rate', color: 'text-cyber-green', icon: Shield },
                { label: 'Active Traces', value: '847', change: 'Across 16 chains', color: 'text-cyber-blue', icon: Wallet },
              ].map(s => (
                <div key={s.label} className="glass-card-premium rounded-xl p-5">
                  <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
                  <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                  <div className="text-[10px] text-slate-600 mt-0.5">{s.change}</div>
                </div>
              ))}
            </div>

            {/* Loss over time */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyber-orange" />
                Reported Losses — Last 30 Days
              </h3>
              <div className="flex items-end gap-1 h-40">
                {[28, 42, 35, 55, 48, 62, 45, 70, 58, 85, 72, 90, 68, 95, 78,
                  88, 65, 75, 82, 92, 70, 85, 95, 88, 78, 92, 100, 85, 90, 95].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t transition-all hover:opacity-100 ${
                        h > 80 ? 'bg-gradient-to-t from-red-500/60 to-red-400/40' :
                        h > 60 ? 'bg-gradient-to-t from-orange-500/60 to-orange-400/40' :
                        'bg-gradient-to-t from-cyber-green/40 to-cyber-green/20'
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-slate-600">
                <span>30 days ago</span>
                <span>Today</span>
              </div>
            </div>

            {/* Top 5 wallets by loss */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Top Loss by Wallet</h3>
                <div className="space-y-3">
                  {[
                    { addr: '0x7a25...dEad', loss: '$890,000', reports: 28, chain: 'ETH' },
                    { addr: 'bc1q...0wlh', loss: '$456,000', reports: 15, chain: 'BTC' },
                    { addr: 'TJYmz...hzXz', loss: '$234,000', reports: 12, chain: 'TRX' },
                    { addr: '0x91cd...7e33', loss: '$178,000', reports: 9, chain: 'ETH' },
                    { addr: 'bc1q...ex3p', loss: '$145,000', reports: 7, chain: 'BTC' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/5 p-3">
                      <span className="text-xs font-bold text-slate-600 w-5">#{i + 1}</span>
                      <div className="flex-grow min-w-0">
                        <code className="text-xs font-mono text-white">{item.addr}</code>
                        <div className="text-[10px] text-slate-500 mt-0.5">{item.reports} reports • {item.chain}</div>
                      </div>
                      <span className="text-sm font-bold text-cyber-red">{item.loss}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Top Loss by Domain</h3>
                <div className="space-y-3">
                  {[
                    { domain: 'crypto-invest-returns.xyz', loss: '$345,000', reports: 23 },
                    { domain: 'binance-secure-verify.com', loss: '$267,000', reports: 18 },
                    { domain: 'defi-yield-pro.net', loss: '$189,000', reports: 11 },
                    { domain: 'metamask-verify.io', loss: '$156,000', reports: 9 },
                    { domain: 'eth-airdrop-claim.com', loss: '$98,000', reports: 7 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/5 p-3">
                      <span className="text-xs font-bold text-slate-600 w-5">#{i + 1}</span>
                      <div className="flex-grow min-w-0">
                        <code className="text-xs font-mono text-blue-400 truncate block">{item.domain}</code>
                        <div className="text-[10px] text-slate-500 mt-0.5">{item.reports} reports</div>
                      </div>
                      <span className="text-sm font-bold text-cyber-red">{item.loss}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* By Wallet */}
        {view === 'wallet' && (
          <div className="animate-fade-in">
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-xs text-slate-500">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Wallet Address</th>
                      <th className="px-4 py-3">Chain</th>
                      <th className="px-4 py-3">Total Loss</th>
                      <th className="px-4 py-3">Reports</th>
                      <th className="px-4 py-3">Risk</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { addr: '0x7a250d5630B4cF539739dF2...', chain: 'Ethereum', loss: '$890,000', reports: 28, risk: 'critical' },
                      { addr: 'bc1qxy2kgdygjrsqtzq2n0yr...', chain: 'Bitcoin', loss: '$456,000', reports: 15, risk: 'critical' },
                      { addr: 'TJYmzLp4vLGHN4Rz8dUwR5c...', chain: 'TRON', loss: '$234,000', reports: 12, risk: 'critical' },
                      { addr: '0x91cd4e3f5b7a8c2d6e1f0b...', chain: 'Ethereum', loss: '$178,000', reports: 9, risk: 'high' },
                      { addr: 'bc1qex3p7d8k2m4n5r6s7t8u...', chain: 'Bitcoin', loss: '$145,000', reports: 7, risk: 'high' },
                      { addr: '0x4e2fab12c7d8e9f0a1b2c3d...', chain: 'Polygon', loss: '$89,000', reports: 5, risk: 'high' },
                      { addr: '0xarb5f6e7d8c9b0a1f2e3d4c...', chain: 'Arbitrum', loss: '$56,000', reports: 3, risk: 'medium' },
                    ].map((item, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                        <td className="px-4 py-3 text-xs text-slate-600">{i + 1}</td>
                        <td className="px-4 py-3 font-mono text-xs text-white">{item.addr}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{item.chain}</td>
                        <td className="px-4 py-3 text-sm font-bold text-cyber-red">{item.loss}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{item.reports}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            item.risk === 'critical' ? 'bg-red-500/10 text-red-400' :
                            item.risk === 'high' ? 'bg-orange-500/10 text-orange-400' :
                            'bg-yellow-500/10 text-yellow-400'
                          }`}>{item.risk}</span>
                        </td>
                        <td className="px-4 py-3">
                          <a href="#tracker" className="text-xs text-cyber-green hover:underline flex items-center gap-1">
                            Trace <ArrowRight className="h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* By Domain */}
        {view === 'domain' && (
          <div className="animate-fade-in">
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-xs text-slate-500">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Domain</th>
                      <th className="px-4 py-3">Total Loss</th>
                      <th className="px-4 py-3">Reports</th>
                      <th className="px-4 py-3">Domain Age</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { domain: 'crypto-invest-returns.xyz', loss: '$345,000', reports: 23, age: '12 days', status: 'active' },
                      { domain: 'binance-secure-verify.com', loss: '$267,000', reports: 18, age: '8 days', status: 'taken down' },
                      { domain: 'defi-yield-pro.net', loss: '$189,000', reports: 11, age: '21 days', status: 'active' },
                      { domain: 'metamask-verify.io', loss: '$156,000', reports: 9, age: '5 days', status: 'active' },
                      { domain: 'eth-airdrop-claim.com', loss: '$98,000', reports: 7, age: '3 days', status: 'active' },
                    ].map((item, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                        <td className="px-4 py-3 text-xs text-slate-600">{i + 1}</td>
                        <td className="px-4 py-3 font-mono text-xs text-blue-400">{item.domain}</td>
                        <td className="px-4 py-3 text-sm font-bold text-cyber-red">{item.loss}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{item.reports}</td>
                        <td className="px-4 py-3 text-xs text-cyber-red font-medium">{item.age}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            item.status === 'active' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                          }`}>{item.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <a href="#osint-tools" className="text-xs text-cyber-blue hover:underline flex items-center gap-1">
                            Check <ArrowRight className="h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* By Type */}
        {view === 'type' && (
          <div className="animate-fade-in">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { type: 'Pig Butchering', loss: '$1.8M', count: 34, pct: 38, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
                { type: 'Crypto Investment', loss: '$980K', count: 28, pct: 20, icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { type: 'Phishing', loss: '$650K', count: 22, pct: 14, icon: Globe, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                { type: 'Rug Pull / DeFi', loss: '$520K', count: 18, pct: 11, icon: Wallet, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { type: 'Romance Scam', loss: '$430K', count: 12, pct: 9, icon: Shield, color: 'text-pink-400', bg: 'bg-pink-500/10' },
                { type: 'Other', loss: '$420K', count: 8, pct: 8, icon: BarChart3, color: 'text-slate-400', bg: 'bg-slate-500/10' },
              ].map(item => (
                <div key={item.type} className="glass-card-premium rounded-xl p-6">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${item.bg} mb-3`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <h4 className="text-base font-bold text-white">{item.type}</h4>
                  <div className="mt-2 text-2xl font-extrabold text-cyber-red">{item.loss}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span>{item.count} reports</span>
                    <span>•</span>
                    <span>{item.pct}% of total</span>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-dark-700 overflow-hidden">
                    <div className={`h-full rounded-full ${item.bg.replace('/10', '/40')} transition-all`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
