import { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';

const faqs = [
  {
    q: 'Do I need blockchain expertise to use ScamTrace?',
    a: 'Not at all. ScamTrace is designed for everyday users. Our AI translates complex blockchain data into plain-language insights. Simply paste an address and we handle the rest — tracing funds across chains, detecting mixers and bridges, and generating evidence packets automatically.',
  },
  {
    q: 'How does the Chat Evidence Portal work?',
    a: 'Connect your Telegram or WhatsApp account, or upload chat exports and screenshots directly. Our AI uses OCR and natural language processing to automatically extract wallet addresses, URLs, phone numbers, emails, and IP addresses from conversations. It builds a chronological timeline of the scam progression and flags manipulation tactics like urgency, fake social proof, and impersonation.',
  },
  {
    q: 'What does the Domain Checker and Phone Lookup do?',
    a: 'The Domain Checker provides instant WHOIS data, domain age, SSL certificate analysis, hosting provider details, DNS records, and cross-references against scam databases. The Phone Lookup identifies carriers, detects VoIP/disposable numbers, provides geographic location, and checks fraud databases. Both tools generate risk scores and can be added directly to your evidence packet.',
  },
  {
    q: 'How does the Smart Contract Escrow work?',
    a: 'When you send funds through ScamTrace, they enter a time-delayed escrow. Before funds leave, our AI runs a pre-send simulation showing: where funds will go, whether they can be withdrawn instantly, past scam activity, and the likelihood of irreversible loss. You then choose a cooling-off period (1, 6, or 24 hours) during which you can cancel and recover your funds. After the delay, you must type a confirmation phrase verbatim and explicitly approve release. This is prevention, not recovery — it stops scammer urgency tactics.',
  },
  {
    q: 'What happens after funds are released from escrow?',
    a: 'Real-time monitoring activates immediately. ScamTrace watches every movement: wallet splits, mixer interactions (Tornado Cash, Wasabi CoinJoin), bridge usage, and exchange deposits. If funds hit an exchange, we auto-generate a freeze-ready evidence packet with timestamped wallet graphs, transaction hashes, and your statement — ready to submit to the exchange compliance team.',
  },
  {
    q: 'How does the Scam Shield Wallet work?',
    a: 'If you choose to send funds despite a risk warning, the Scam Shield Wallet automatically tracks every coin movement. Even as scammers split funds, use CoinJoin mixing, route through bridges, or deposit into exchanges — every step is logged with timestamps and transaction hashes. This creates an irrefutable evidence trail.',
  },
  {
    q: 'Which blockchains are supported?',
    a: 'ScamTrace supports 16+ blockchains including Bitcoin (with full UTXO/CoinJoin analysis), Ethereum, Polygon, Arbitrum, BSC, Avalanche, Optimism, Solana, Tron, Fantom, Cardano, Cosmos, Polkadot, Near, Base, and Bitcoin Lightning. Cross-chain bridge and swap detection works across all supported networks.',
  },
  {
    q: 'How does the freeze-ready evidence packet work?',
    a: 'When exchange deposits are detected, ScamTrace auto-generates a comprehensive evidence packet containing: timestamped wallet graphs, all transaction hashes, chat evidence from Telegram/WhatsApp, OSINT data from domain and phone lookups, victim statements, risk assessments, and pre-filled freeze request templates for each exchange. Packets are SHA-256 integrity-verified and accepted by major exchanges.',
  },
  {
    q: 'Can ScamTrace detect Tornado Cash and Wasabi CoinJoin?',
    a: 'Yes. Our AI engine specializes in mixer detection. For Ethereum, we trace funds through Tornado Cash deposits and withdrawals using advanced heuristics. For Bitcoin, we analyze Wasabi Wallet CoinJoin transactions using change address analysis and UTXO clustering to trace funds through multiple rounds of mixing.',
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. ScamTrace is SOC 2 compliant with end-to-end encryption. Chat evidence is analyzed client-side and never stored on our servers. The Wallet Scan feature operates fully offline — seed phrases never leave your device. Enterprise plans offer on-premise deployment for government agencies.',
  },
  {
    q: 'How does the subscription work? Can I cancel anytime?',
    a: 'All plans come with a 14-day free trial — no credit card required. Subscriptions are managed through Stripe and can be cancelled anytime. The app is available on iOS and Android. Yearly plans save 20% compared to monthly billing.',
  },
  {
    q: 'What happens when exchange deposits are detected?',
    a: 'When tracked funds hit an exchange hot wallet, ScamTrace triggers a critical alert and automatically prepares a freeze-ready evidence packet. The packet includes pre-filled freeze request templates with the exchange compliance team contact information, transaction details, chat evidence, OSINT data, and supporting documentation. You can send freeze requests directly from the platform.',
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="relative py-24 grid-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[400px] w-[400px] rounded-full bg-cyber-blue/[0.03] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-blue/20 bg-cyber-blue/[0.06] px-4 py-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-cyber-blue" />
            <span className="text-xs font-medium text-cyber-blue">Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Got Questions? <span className="gradient-text">We Have Answers</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`glass-card rounded-xl transition-all duration-300 ${
                  isOpen ? 'border-cyber-green/20 bg-white/[0.04]' : ''
                }`}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="flex w-full items-center gap-4 px-6 py-5 text-left"
                >
                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isOpen ? 'bg-cyber-green/10' : 'bg-white/5'
                  }`}>
                    <span className={`text-sm font-bold transition-colors ${isOpen ? 'text-cyber-green' : 'text-slate-500'}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <span className={`flex-grow text-sm sm:text-base font-medium transition-colors ${isOpen ? 'text-white' : 'text-slate-300'}`}>
                    {faq.q}
                  </span>
                  <ChevronDown className={`h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyber-green' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
                  <div className="px-6 pl-[72px]">
                    <p className="text-sm leading-relaxed text-slate-400">{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 glass-card-premium rounded-2xl p-8 text-center">
          <MessageCircle className="mx-auto h-8 w-8 text-cyber-green/60 mb-4" />
          <h3 className="text-lg font-bold text-white">Still have questions?</h3>
          <p className="mt-2 text-sm text-slate-400">Our support team is available 24/7 to help you get started.</p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#pricing" className="btn-primary text-sm px-6 py-3 flex items-center gap-2">
              Start Free Trial
            </a>
            <button className="btn-secondary text-sm px-6 py-3">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
