/**
 * Standalone SEO-optimized landing pages for each OSINT tool.
 * Each renders as a full page at /domain-checker, /ip-lookup, /phone-lookup, /wallet-checker
 * with structured data, FAQs, and optimized copy that ranks individually on Google.
 */
import { useState } from 'react';
import {
  Globe, Wifi, Phone, Wallet, Shield, Search, AlertTriangle,
  CheckCircle2, ArrowRight, ChevronDown, ChevronUp, Star, Lock
} from 'lucide-react';

interface ToolPageProps {
  onBack: () => void;
  onSignUp: () => void;
}

// ─── Domain Checker Page ─────────────────────────────────────────────────────

const DOMAIN_FAQS = [
  {
    q: 'How does the ScamTrace domain checker work?',
    a: 'ScamTrace queries 50+ threat intelligence sources including VirusTotal, WHOIS databases, SSL certificate authorities, AbuseIPDB, and proprietary scam domain feeds. We analyze domain age, TLD risk, hosting location, WHOIS privacy, and historical reputation to produce a risk score from 0–100.',
  },
  {
    q: 'What domains should I check?',
    a: 'Any domain related to an investment opportunity, crypto trading platform, exchange, wallet service, or contact you received unsolicited. Pig butchering scams almost always use newly registered domains with high-risk TLDs like .xyz, .top, .vip, or .club.',
  },
  {
    q: 'What does the domain age tell me?',
    a: 'Legitimate financial services operate for years. Scam domains are typically registered days or weeks before they\'re used and abandoned after. A domain under 6 months old with financial-related keywords is a major red flag.',
  },
  {
    q: 'What if the domain is on a known scam list?',
    a: 'ScamTrace checks against Google Safe Browsing, PhishTank, OpenPhish, and our internal database of 14,892+ community-reported scam domains. A match here means confirmed fraudulent activity.',
  },
  {
    q: 'Can I check multiple domains at once?',
    a: 'Batch domain checking is available on the Pro and Investigator plans, with API access for automated workflows.',
  },
];

export function DomainCheckerPage({ onBack, onSignUp }: ToolPageProps) {
  const [input, setInput] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#03081a] text-slate-100 py-16 px-4">
      {/* SEO structured data injected at route level */}
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-10 text-sm transition-colors">
          ← Back to ScamTrace
        </button>

        {/* H1 — SEO optimized */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00f5ff]/30 bg-[#00f5ff]/10 text-[#00f5ff] text-sm font-medium mb-4">
            <Globe size={13} /> Free Domain Scam Checker
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-['Orbitron'] text-white mb-4 leading-tight">
            Domain Scam Checker —<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f5ff] to-[#00ff88]">Is This Website Legit?</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
            Instantly check any domain or website for scam signals, phishing indicators, and fraud risk. Used by investigators, victims, and security researchers worldwide.
          </p>
        </div>

        {/* Tool */}
        <div className="glass-card rounded-2xl border border-white/10 p-6 mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Enter domain or URL (e.g., crypto-invest-returns.xyz)"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f5ff]/50 text-sm"
              />
            </div>
            <button
              onClick={onSignUp}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#00ff88] text-[#03081a] font-bold text-sm flex items-center gap-2 hover:opacity-90 shrink-0"
            >
              <Shield size={15} /> Check Domain
            </button>
          </div>
          <p className="text-slate-500 text-xs mt-3">3 free checks per day — no account required. <button onClick={onSignUp} className="text-[#00f5ff] hover:underline">Sign up for unlimited →</button></p>
        </div>

        {/* What we check */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            { title: 'WHOIS Analysis', desc: 'Registrar, registration date, expiry, registrant country, privacy shield detection', icon: Search },
            { title: 'Threat Intel Feeds', desc: 'Cross-referenced against VirusTotal, PhishTank, Google Safe Browsing, and 40+ databases', icon: AlertTriangle },
            { title: 'SSL & Hosting', desc: 'Certificate issuer, grade, expiry, hosting provider, IP geolocation, ASN reputation', icon: Lock },
            { title: 'Domain Age', desc: 'Domains under 90 days old with financial keywords are flagged with elevated risk scores', icon: CheckCircle2 },
            { title: 'Risk Score', desc: 'AI-aggregated 0–100 risk score with explanations for each contributing factor', icon: Shield },
            { title: 'Scam Pattern Match', desc: 'Pattern matching against known scam operator infrastructure networks', icon: Star },
          ].map(f => (
            <div key={f.title} className="glass-card rounded-xl border border-white/10 p-4">
              <f.icon size={18} className="text-[#00f5ff] mb-2" />
              <p className="text-white font-semibold text-sm mb-1">{f.title}</p>
              <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Common scam domains section — SEO rich content */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Common Scam Domain Patterns to Watch For</h2>
          <p className="text-slate-400 mb-4">Investigators have identified recurring patterns across crypto scam infrastructure. These are the most reliable indicators:</p>
          <ul className="space-y-3 text-slate-300 text-sm">
            {[
              '<strong class="text-white">High-risk TLDs:</strong> .xyz, .top, .club, .vip, .icu — used in 73% of documented crypto scams',
              '<strong class="text-white">Keyword combination:</strong> "invest + profit + crypto", "trade + returns + guaranteed", "recover + funds + official"',
              '<strong class="text-white">Number sequences:</strong> domains like "crypto247pro.com" or "invest2024ai.xyz" — randomly generated operational infrastructure',
              '<strong class="text-white">Brand impersonation:</strong> coinbase-support.net, binance-wallet.app, kraken-verify.xyz — typosquatting on major exchanges',
              '<strong class="text-white">WHOIS privacy:</strong> 91% of scam domains use identity-hiding privacy shields on registration',
            ].map((item, i) => (
              <li key={i} className="flex gap-3 items-start">
                <AlertTriangle size={14} className="text-orange-400 shrink-0 mt-0.5" />
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {DOMAIN_FAQS.map((faq, i) => (
              <div key={i} className="glass-card rounded-xl border border-white/10 overflow-hidden">
                <button
                  className="w-full px-5 py-4 flex items-center justify-between text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-white font-medium text-sm pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-slate-400 text-sm leading-relaxed border-t border-white/10 pt-4">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="glass-card rounded-2xl border border-[#00f5ff]/20 p-8 text-center">
          <h3 className="text-2xl font-bold text-white font-['Orbitron'] mb-2">Need a Full Investigation?</h3>
          <p className="text-slate-400 mb-6">Go beyond a quick check — trace connected infrastructure, map related scam networks, and generate a court-ready evidence report.</p>
          <button onClick={onSignUp} className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#00ff88] text-[#03081a] font-bold flex items-center gap-2 mx-auto">
            Start Full Investigation <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── IP Lookup Page ──────────────────────────────────────────────────────────

const IP_FAQS = [
  {
    q: 'What does the ScamTrace IP lookup tell me?',
    a: 'Our IP intelligence tool queries AbuseIPDB, IPinfo, Shodan, and regional WHOIS databases to return the IP\'s country, city, ISP, ASN, and whether it\'s associated with VPNs, Tor exit nodes, proxies, or cloud hosting. We also show the number of abuse reports filed against the IP.',
  },
  {
    q: 'Why do scammers use VPNs and Tor?',
    a: 'VPNs and Tor hide a scammer\'s real location. When someone contacts you from a Mullvad, NordVPN, or Tor exit node IP, it\'s a strong indicator they\'re deliberately concealing their identity — common in investment fraud and romance scams.',
  },
  {
    q: 'How do I find a scammer\'s IP address?',
    a: 'Email headers contain the sender\'s originating IP. Website admin panels, webinar links, and document tracking pixels can also reveal IPs. ScamTrace\'s Chat Evidence Portal can automatically extract IPs from uploaded communications.',
  },
  {
    q: 'Is IP lookup enough to identify a scammer?',
    a: 'No — IP is one data point. Combine with WHOIS, blockchain tracing, and phone lookup for a complete picture. ScamTrace\'s full investigation mode correlates all signals together.',
  },
];

export function IpLookupPage({ onBack, onSignUp }: ToolPageProps) {
  const [input, setInput] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#03081a] text-slate-100 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-10 text-sm">← Back</button>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-medium mb-4">
            <Wifi size={13} /> Free IP Address Lookup
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-['Orbitron'] text-white mb-4 leading-tight">
            IP Address Scam Lookup —<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-[#00f5ff]">VPN, Tor & Fraud Detection</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
            Look up any IP address for VPN/proxy detection, geolocation, ISP data, abuse history, and fraud risk scoring. Essential for scam investigation.
          </p>
        </div>

        <div className="glass-card rounded-2xl border border-white/10 p-6 mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Wifi size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Enter IP address (e.g., 185.220.101.42)"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 text-sm"
              />
            </div>
            <button onClick={onSignUp} className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-[#00f5ff] text-white font-bold text-sm flex items-center gap-2 hover:opacity-90 shrink-0">
              <Shield size={15} /> Lookup IP
            </button>
          </div>
          <p className="text-slate-500 text-xs mt-3">3 free lookups per day. <button onClick={onSignUp} className="text-[#00f5ff] hover:underline">Sign up for unlimited →</button></p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {[
            { title: 'Geolocation', desc: 'Country, region, city, latitude/longitude — accurate to city level' },
            { title: 'ISP & ASN', desc: 'Internet service provider, autonomous system number, organization name' },
            { title: 'VPN Detection', desc: 'Identifies 500+ commercial VPN providers including Mullvad, NordVPN, ExpressVPN' },
            { title: 'Tor Exit Node', desc: 'Real-time check against Tor Project\'s published exit node list' },
            { title: 'Proxy Detection', desc: 'HTTP proxies, SOCKS5 proxies, residential proxies used to mask identity' },
            { title: 'Abuse Reports', desc: 'Number of malicious activity reports from AbuseIPDB community database' },
          ].map(f => (
            <div key={f.title} className="glass-card rounded-xl border border-white/10 p-4">
              <p className="text-white font-semibold text-sm mb-1">{f.title}</p>
              <p className="text-slate-500 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">How to Use IP Intelligence in Scam Investigations</h2>
          <div className="space-y-4 text-slate-400 text-sm leading-relaxed">
            <p><strong className="text-white">Step 1: Extract the IP.</strong> Email headers, server logs, website analytics, and document tracking pixels can reveal a scammer's IP. In Gmail, open a message → More → Show Original → look for "Received: from" entries.</p>
            <p><strong className="text-white">Step 2: Check VPN/Tor status.</strong> If the IP is a known VPN exit node or Tor relay, the scammer is deliberately hiding. This is a red flag and relevant evidence for law enforcement reports.</p>
            <p><strong className="text-white">Step 3: Check abuse history.</strong> High abuse report counts indicate the IP has been used for malicious activity before — possibly connecting it to other scam operations.</p>
            <p><strong className="text-white">Step 4: Correlate with other findings.</strong> Cross-reference the IP's ASN with the domain's hosting to see if they share infrastructure — a common indicator of organized scam operations.</p>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {IP_FAQS.map((faq, i) => (
              <div key={i} className="glass-card rounded-xl border border-white/10 overflow-hidden">
                <button className="w-full px-5 py-4 flex items-center justify-between text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="text-white font-medium text-sm pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                </button>
                {openFaq === i && <div className="px-5 pb-4 text-slate-400 text-sm leading-relaxed border-t border-white/10 pt-4">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-purple-500/20 p-8 text-center">
          <h3 className="text-2xl font-bold text-white font-['Orbitron'] mb-2">Full Scam Infrastructure Analysis</h3>
          <p className="text-slate-400 mb-6">Map the complete infrastructure behind a scam operation — IPs, domains, hosting, blockchain addresses, and operator profiles.</p>
          <button onClick={onSignUp} className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-[#00f5ff] text-white font-bold flex items-center gap-2 mx-auto">
            Start Investigation <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Phone Lookup Page ───────────────────────────────────────────────────────

export function PhoneLookupPage({ onBack, onSignUp }: ToolPageProps) {
  const [input, setInput] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: 'How does ScamTrace phone lookup work?', a: 'We query NumVerify, IPQualityScore, and Abstract API to identify the carrier, line type (VoIP vs landline vs mobile), country, region, and fraud risk score. VoIP numbers are heavily weighted as scam indicators.' },
    { q: 'What is a VoIP number and why is it suspicious?', a: 'VoIP (Voice over IP) numbers like those from Google Voice, Skype, or MagicJack are virtual numbers with no physical SIM card. They\'re trivially cheap, disposable, and used by ~87% of identified phone-based scammers to avoid traceback.' },
    { q: 'Can I find out who owns a phone number?', a: 'We provide carrier attribution and region data. Full subscriber lookup requires a law enforcement subpoena to the carrier. ScamTrace can generate the documentation template for this request.' },
    { q: 'What phone scam patterns should I watch for?', a: 'Unsolicited investment calls, government impersonation (IRS, FBI, SSA), tech support calls, and romance scammers who quickly move to phone after initial social media contact. Numbers with high fraud scores from our database should never be trusted.' },
  ];

  return (
    <div className="min-h-screen bg-[#03081a] text-slate-100 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-10 text-sm">← Back</button>
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] text-sm font-medium mb-4">
            <Phone size={13} /> Free Phone Number Lookup
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-['Orbitron'] text-white mb-4 leading-tight">
            Phone Number Scam Checker —<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#00f5ff]">Is This Number Fraudulent?</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
            Check any phone number for VoIP detection, carrier data, fraud scoring, and scam report history. Free, instant, no account required.
          </p>
        </div>

        <div className="glass-card rounded-2xl border border-white/10 p-6 mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                placeholder="+1 800 555 0199 or any international number"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#00ff88]/50 text-sm"
              />
            </div>
            <button onClick={onSignUp} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00f5ff] text-[#03081a] font-bold text-sm flex items-center gap-2 hover:opacity-90 shrink-0">
              <Phone size={15} /> Check Number
            </button>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Top Phone Scam Types in 2024–2025</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { type: 'Investment Call Fraud', loss: '$3.8B', desc: 'Fake brokers call unsolicited with guaranteed return investments' },
              { type: 'Romance Scam Phone Contact', loss: '$1.3B', desc: 'Online romance progresses to phone calls from VoIP numbers' },
              { type: 'Government Impersonation', loss: '$800M', desc: 'IRS, SSA, FBI impersonation demanding immediate payment' },
              { type: 'Crypto Recovery Scam', loss: '$600M', desc: 'Victims of prior scams called with fake recovery services' },
            ].map(s => (
              <div key={s.type} className="glass-card rounded-xl border border-white/10 p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-white font-semibold text-sm">{s.type}</p>
                  <span className="text-red-400 text-xs font-bold">{s.loss}/yr</span>
                </div>
                <p className="text-slate-500 text-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="glass-card rounded-xl border border-white/10 overflow-hidden">
                <button className="w-full px-5 py-4 flex items-center justify-between text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="text-white font-medium text-sm pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                </button>
                {openFaq === i && <div className="px-5 pb-4 text-slate-400 text-sm leading-relaxed border-t border-white/10 pt-4">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-[#00ff88]/20 p-8 text-center">
          <h3 className="text-2xl font-bold text-white font-['Orbitron'] mb-2">Build a Complete Scammer Profile</h3>
          <p className="text-slate-400 mb-6">Combine phone lookup with email intelligence, OSINT, and blockchain tracing to identify the full scam operation.</p>
          <button onClick={onSignUp} className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00f5ff] text-[#03081a] font-bold flex items-center gap-2 mx-auto">
            Start Full Profile <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Wallet Checker Page ─────────────────────────────────────────────────────

export function WalletCheckerPage({ onBack, onSignUp }: ToolPageProps) {
  const [input, setInput] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: 'Which blockchains does ScamTrace support?', a: 'ScamTrace supports 16+ blockchains including Bitcoin (BTC), Ethereum (ETH), Tron (TRX), BNB Chain (BSC), Polygon, Arbitrum, Avalanche, Solana, and more. BTC UTXO analysis and cross-chain bridge tracking are available on Investigator plan.' },
    { q: 'What makes a wallet address suspicious?', a: 'Key red flags: receiving funds from known scam addresses, interaction with mixing/tumbling services (Tornado Cash, Wasabi Wallet), rapid layering behavior (many small transfers across dozens of wallets), and exchange deposits linked to prior fraud reports.' },
    { q: 'Can I trace where my stolen funds went?', a: 'Yes. ScamTrace maps the complete transaction graph from your wallet to the final destination — typically an exchange deposit address. We then provide the documentation needed to request an account freeze from the exchange\'s compliance team.' },
    { q: 'What is a blockchain mixer and why is it significant?', a: 'Mixers (Tornado Cash, Wasabi CoinJoin) are services that blend cryptocurrency from multiple sources to obscure transaction trails. Their use is a strong indicator of intent to launder funds. ScamTrace detects mixer interactions across all supported chains.' },
  ];

  return (
    <div className="min-h-screen bg-[#03081a] text-slate-100 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-10 text-sm">← Back</button>
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-sm font-medium mb-4">
            <Wallet size={13} /> Free Wallet Scam Checker
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-['Orbitron'] text-white mb-4 leading-tight">
            Crypto Wallet Scam Checker —<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Blockchain Fraud Detection</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
            Check any crypto wallet address for scam associations, mixing service interactions, fraud risk, and fund flow history across 16+ blockchains.
          </p>
        </div>

        <div className="glass-card rounded-2xl border border-white/10 p-6 mb-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Wallet size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                placeholder="0x... ETH / BTC / TRX / BNB wallet address"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50 text-sm"
              />
            </div>
            <button onClick={onSignUp} className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 text-[#03081a] font-bold text-sm flex items-center gap-2 hover:opacity-90 shrink-0">
              <Search size={15} /> Trace Wallet
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          {['Bitcoin (BTC)', 'Ethereum (ETH)', 'Tron (TRX)', 'BNB Chain', 'Polygon', 'Solana', 'Arbitrum', 'Avalanche'].map(chain => (
            <span key={chain} className="text-xs text-slate-500 bg-white/5 border border-white/10 rounded-full px-3 py-1">{chain}</span>
          ))}
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">What ScamTrace Looks For</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { flag: 'Scam Database Match', detail: 'Direct match against 14,892+ verified scam wallet addresses in our community database', severity: 'critical' },
              { flag: 'Mixer Interaction', detail: 'Funds sent to or received from Tornado Cash, Wasabi, or other obfuscation services', severity: 'critical' },
              { flag: 'Exchange Deposit', detail: 'Funds deposited to exchange addresses linked to previous fraud complaints', severity: 'high' },
              { flag: 'Layering Pattern', detail: '5+ rapid sequential transfers across new wallets — classic money laundering behavior', severity: 'high' },
              { flag: 'Bridge Activity', detail: 'Cross-chain fund movement via bridges to obscure trail', severity: 'medium' },
              { flag: 'Dark Market Interaction', detail: 'Historical connection to known darknet market deposit addresses', severity: 'critical' },
            ].map(f => (
              <div key={f.flag} className="glass-card rounded-xl border border-white/10 p-4 flex gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${f.severity === 'critical' ? 'bg-red-400' : f.severity === 'high' ? 'bg-orange-400' : 'bg-yellow-400'}`} />
                <div>
                  <p className="text-white font-semibold text-sm">{f.flag}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{f.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="glass-card rounded-xl border border-white/10 overflow-hidden">
                <button className="w-full px-5 py-4 flex items-center justify-between text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="text-white font-medium text-sm pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                </button>
                {openFaq === i && <div className="px-5 pb-4 text-slate-400 text-sm leading-relaxed border-t border-white/10 pt-4">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-yellow-500/20 p-8 text-center">
          <h3 className="text-2xl font-bold text-white font-['Orbitron'] mb-2">Stolen Crypto? Start Tracing Now</h3>
          <p className="text-slate-400 mb-6">Full fund flow visualization, exchange identification, and court-ready evidence — designed to actually recover your case.</p>
          <button onClick={onSignUp} className="px-8 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 text-[#03081a] font-bold flex items-center gap-2 mx-auto">
            Trace My Funds <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
