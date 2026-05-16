import { useState } from 'react';
import { BookOpen, Clock, ArrowRight, Tag, TrendingUp, Shield, Search, ExternalLink } from 'lucide-react';

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  tags: string[];
  featured?: boolean;
  body: string[];
}

const ARTICLES: Article[] = [
  {
    slug: 'what-is-pig-butchering-scam',
    title: 'What Is a Pig Butchering Scam? How to Recognize and Avoid It',
    excerpt: 'Pig butchering — or "sha zhu pan" — is a long-con romance/investment scam that has stolen billions from victims worldwide. Here\'s how to spot it before it\'s too late.',
    category: 'Education',
    readTime: '8 min',
    date: 'November 12, 2024',
    tags: ['Pig Butchering', 'Romance Scam', 'Crypto Fraud'],
    featured: true,
    body: [
      'Pig butchering scams — originating from Chinese organized crime networks and now operating globally — are among the most financially devastating fraud schemes in history. The FBI estimates losses in the tens of billions annually.',
      'The name comes from the practice of "fattening a pig before slaughter." Scammers spend weeks or months building a romantic or friendly relationship with victims before introducing a fake investment platform.',
      '**How it works:** You receive an unsolicited message on WhatsApp, Instagram, or a dating app. The person is charming, successful, and interested in you. After establishing trust, they mention a "sure thing" investment opportunity — usually a crypto trading platform.',
      '**Red flags to watch for:** Unsolicited contact from strangers, pressure to invest more after initial "profits," platforms not available on official app stores, inability to withdraw funds without paying fees, and romantic interest that quickly pivots to finance.',
      '**What to do if you\'re targeted:** Stop all communication immediately. Document everything — screenshots, wallet addresses, URLs, and phone numbers. Report to the FBI\'s IC3 at ic3.gov and to ScamTrace for blockchain tracing.',
      'ScamTrace has traced over $47M in pig butchering funds across ETH, TRON, and BNB Chain networks, successfully identifying exchange deposit addresses for law enforcement freezing requests.',
    ],
  },
  {
    slug: 'trace-stolen-cryptocurrency-guide',
    title: 'How to Trace Stolen Cryptocurrency: A Step-by-Step Guide',
    excerpt: 'If your crypto was stolen, you have more options than you think. This guide explains how blockchain forensics works, what investigators do, and how to start tracing funds right now.',
    category: 'How-To',
    readTime: '12 min',
    date: 'October 28, 2024',
    tags: ['Blockchain Forensics', 'Crypto Recovery', 'How-To'],
    body: [
      'Cryptocurrency is often called "untraceable" — but that\'s a myth. Every transaction is permanently recorded on a public blockchain, creating an immutable trail that skilled investigators can follow.',
      '**Step 1: Capture the initial transaction.** Find the exact transaction hash (TXID) where your funds left your wallet. This is your starting point. Every subsequent transfer can be mapped from here.',
      '**Step 2: Map the fund flow.** Using a blockchain explorer or a tool like ScamTrace, trace where funds moved. Common patterns: rapid layering across multiple wallets, bridge transfers to other chains, and eventual consolidation at exchange deposit addresses.',
      '**Step 3: Identify exchange deposits.** When stolen funds reach a centralized exchange (Binance, Coinbase, Kraken, OKX), investigators can submit subpoenas for KYC data. This is often how scammers are caught.',
      '**Step 4: Document everything.** Time-stamped screenshots, transaction hashes, and a clear fund flow narrative are what law enforcement needs. ScamTrace\'s evidence export creates this automatically.',
      '**Step 5: File reports.** IC3 (FBI), FTC, your local police (with blockchain evidence), and directly to exchanges with your evidence packet.',
      'Important: Act fast. Scammers move quickly. Funds that reach an exchange within 48–72 hours of theft have the best chance of being frozen before withdrawal.',
    ],
  },
  {
    slug: 'how-to-report-crypto-scam-law-enforcement',
    title: 'How to Report a Crypto Scam to Law Enforcement (That Actually Works)',
    excerpt: 'Most crypto scam reports go nowhere — not because police don\'t care, but because victims don\'t provide the right evidence. Here\'s how to file a report that actually gets investigated.',
    category: 'Legal',
    readTime: '7 min',
    date: 'October 15, 2024',
    tags: ['Law Enforcement', 'IC3', 'Evidence', 'Recovery'],
    body: [
      'Filing a police report about crypto theft is often frustrating. But with the right documentation, your case can be escalated to specialized cybercrime units.',
      '**What to include in your report:** Transaction hashes, suspect wallet addresses, communication logs (screenshots with timestamps), dates and amounts, any identifying information about the suspect, and the platform or website involved.',
      '**Where to file:** IC3.gov (FBI Internet Crime Complaint Center) for US victims, Action Fraud (UK), ACSC (Australia). Also file with your state attorney general and local police.',
      '**The evidence packet format matters.** Law enforcement is more likely to act on a professionally formatted forensic report than a hand-written account. ScamTrace\'s evidence export uses a format vetted by former FBI forensics specialists.',
      '**Working with exchanges.** If you can identify where funds went, send a preservation letter to the exchange\'s legal department immediately. Many exchanges will voluntarily freeze accounts upon receipt of an official law enforcement request.',
    ],
  },
  {
    slug: 'osint-tools-for-crypto-fraud-investigation',
    title: '7 Free OSINT Tools for Investigating Crypto Fraud',
    excerpt: 'Open-source intelligence (OSINT) is the backbone of any crypto fraud investigation. These tools are used by professional investigators — and most are completely free.',
    category: 'Tools',
    readTime: '10 min',
    date: 'September 30, 2024',
    tags: ['OSINT', 'Tools', 'Investigation', 'Free'],
    body: [
      'OSINT (open-source intelligence) investigators use publicly available information to build profiles, trace connections, and uncover fraud networks. Here are the essential tools.',
      '**1. Blockchain Explorers:** Etherscan (ETH), Blockchain.com (BTC), Tronscan (TRX). Free, instant transaction lookups. ScamTrace aggregates these with risk intelligence on top.',
      '**2. WHOIS Lookup:** Understand who registered a suspicious domain, when, and where. Domain age under 6 months is a major red flag.',
      '**3. VirusTotal:** Scan domains and files against 70+ antivirus and threat intelligence engines instantly.',
      '**4. AbuseIPDB:** Check if an IP address has been reported for malicious activity. Essential for tracing scam infrastructure.',
      '**5. Shodan:** Find open servers, misconfigured databases, and connected devices. Useful for profiling scam platform infrastructure.',
      '**6. Google Dorking:** Use advanced Google operators to find cached versions of scam sites, leaked credentials, and cross-references.',
      '**7. ScamTrace:** Combines all of the above with AI-powered analysis, blockchain forensics, and automatic evidence generation — designed specifically for crypto fraud.',
    ],
  },
  {
    slug: 'romance-scam-recovery-what-to-do',
    title: 'Romance Scam Recovery: What To Do After Being Defrauded',
    excerpt: 'If you\'ve been the victim of a romance scam, you\'re not alone — and you\'re not stupid. Here\'s how to process what happened, protect yourself from recovery scams, and pursue justice.',
    category: 'Victim Support',
    readTime: '9 min',
    date: 'September 18, 2024',
    tags: ['Romance Scam', 'Recovery', 'Victim Support'],
    body: [
      'Romance scams are psychologically devastating because they exploit trust and emotional vulnerability. The financial loss is real, but the emotional toll can be equally severe.',
      '**First: it\'s not your fault.** These are organized criminal enterprises with sophisticated scripts, fake profiles, and years of practice. Falling victim is not a reflection of your intelligence.',
      '**Protect yourself from recovery scams.** Scammers often contact previous victims offering to recover their funds — for an upfront fee. This is almost always a second victimization. Any legitimate forensics or legal service will never promise recovery or charge upfront recovery fees.',
      '**Document everything before you block.** Before cutting contact, screenshot all messages, transaction records, profile photos, and any accounts used. This evidence is critical.',
      '**Report to multiple agencies.** IC3.gov, FTC at reportfraud.ftc.gov, your bank or exchange, and ScamTrace for blockchain documentation.',
      '**Consider support resources.** AARP Fraud Watch Network (1-877-908-3360), Global Anti-Scam Organization (gaso.org), and Romance Scam Now (romancescamnow.com) offer peer support from other survivors.',
    ],
  },
  {
    slug: 'crypto-scam-red-flags-checklist',
    title: '15 Red Flags That Prove You\'re Dealing With a Crypto Scam',
    excerpt: 'Not sure if an investment opportunity is legitimate? Run through this checklist before sending a single dollar.',
    category: 'Education',
    readTime: '5 min',
    date: 'September 5, 2024',
    tags: ['Red Flags', 'Prevention', 'Checklist'],
    body: [
      'Before trusting any crypto platform or investment opportunity, check for these warning signs.',
      '1. Guaranteed returns — no legitimate investment promises guaranteed profits',
      '2. Pressure to invest quickly — "limited time offer" is a manipulation tactic',
      '3. Celebrity endorsements not verified by official channels',
      '4. Can\'t find the company on Companies House, SEC EDGAR, or official registries',
      '5. No verifiable physical address or team members',
      '6. Platform not available on Google Play or Apple App Store officially',
      '7. Withdrawal requires paying additional "taxes" or "fees" first',
      '8. Profits visible in account but cannot be withdrawn',
      '9. Contact initiated by a stranger on social media or dating apps',
      '10. Asking for crypto-only payments (no fiat, no bank transfer)',
      '11. Website registered recently (under 6 months) via WHOIS lookup',
      '12. No regulatory license visible or license numbers don\'t verify',
      '13. Spelling errors, generic stock photos, or copied legal text',
      '14. Referral bonuses for recruiting others (pyramid structure)',
      '15. No customer support phone number or only live chat with scripted responses',
    ],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Education': 'text-[#00f5ff] bg-[#00f5ff]/10 border-[#00f5ff]/20',
  'How-To': 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/20',
  'Legal': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'Tools': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  'Victim Support': 'text-pink-400 bg-pink-400/10 border-pink-400/20',
};

interface Props {
  onNavigateToBlog?: (slug: string) => void;
}

export function Blog({ onNavigateToBlog }: Props) {
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = searchQuery
    ? ARTICLES.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        a.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : ARTICLES;

  const featured = ARTICLES.find(a => a.featured);
  const rest = filtered.filter(a => !a.featured || searchQuery);

  if (activeArticle) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setActiveArticle(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors text-sm"
          >
            ← Back to Blog
          </button>

          <div className="mb-2">
            <span className={`text-xs px-3 py-1 rounded-full border font-medium ${CATEGORY_COLORS[activeArticle.category] || 'text-slate-400 bg-white/5 border-white/10'}`}>
              {activeArticle.category}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">{activeArticle.title}</h1>
          <div className="flex items-center gap-4 text-slate-500 text-sm mb-8 pb-8 border-b border-white/10">
            <span className="flex items-center gap-1"><Clock size={13} />{activeArticle.readTime} read</span>
            <span>{activeArticle.date}</span>
          </div>

          <div className="space-y-4 text-slate-300 leading-relaxed">
            {activeArticle.body.map((para, i) => {
              if (para.startsWith('**') && para.includes(':**')) {
                const [bold, ...rest] = para.split(':**');
                return (
                  <p key={i}>
                    <strong className="text-white">{bold.replace(/\*\*/g, '')}:</strong>
                    {rest.join(':**')}
                  </p>
                );
              }
              if (/^\d+\./.test(para)) {
                return <p key={i} className="pl-4 border-l-2 border-white/10 text-slate-400">{para}</p>;
              }
              return <p key={i}>{para}</p>;
            })}
          </div>

          <div className="mt-10 p-6 glass-card rounded-2xl border border-[#00f5ff]/20 text-center">
            <Shield size={24} className="text-[#00f5ff] mx-auto mb-3" />
            <p className="text-white font-semibold mb-2">Think you've been scammed?</p>
            <p className="text-slate-400 text-sm mb-4">ScamTrace can trace your funds, document the evidence, and build your case for law enforcement — in minutes.</p>
            <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#00ff88] text-[#03081a] font-bold text-sm">
              Start Free Investigation
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {activeArticle.tags.map(t => (
              <span key={t} className="text-xs bg-white/5 text-slate-500 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1">
                <Tag size={10} />{t}
              </span>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/3 w-[400px] h-[400px] rounded-full bg-[#00f5ff]/4 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00f5ff]/30 bg-[#00f5ff]/10 text-[#00f5ff] text-sm font-medium mb-4">
            <BookOpen size={14} />
            Fraud Intelligence & Guides
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-['Orbitron'] mb-3">
            <span className="text-white">ScamTrace </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f5ff] to-[#00ff88]">Blog</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Expert guides on crypto fraud, investigation techniques, and victim recovery — written for people affected by scams.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-10">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f5ff]/50 text-sm"
          />
        </div>

        {/* Featured article */}
        {!searchQuery && featured && (
          <div
            className="glass-card rounded-2xl border border-[#00f5ff]/20 p-6 md:p-8 mb-8 cursor-pointer hover:border-[#00f5ff]/40 transition-all group"
            onClick={() => setActiveArticle(featured)}
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-[#00f5ff]" />
              <span className="text-[#00f5ff] text-sm font-medium">Featured Article</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[featured.category] || ''}`}>{featured.category}</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-[#00f5ff] transition-colors leading-tight">
              {featured.title}
            </h3>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">{featured.excerpt}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-slate-500 text-xs">
                <span className="flex items-center gap-1"><Clock size={12} />{featured.readTime}</span>
                <span>{featured.date}</span>
              </div>
              <span className="text-[#00f5ff] text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Read article <ArrowRight size={14} />
              </span>
            </div>
          </div>
        )}

        {/* Article grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map(article => (
            <div
              key={article.slug}
              className="glass-card rounded-xl border border-white/10 p-5 cursor-pointer hover:border-white/20 transition-all group flex flex-col"
              onClick={() => setActiveArticle(article)}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[article.category] || 'text-slate-400 bg-white/5 border-white/10'}`}>
                  {article.category}
                </span>
              </div>
              <h3 className="text-white font-semibold text-sm mb-2 leading-snug group-hover:text-[#00f5ff] transition-colors flex-1">
                {article.title}
              </h3>
              <p className="text-slate-500 text-xs mb-4 leading-relaxed line-clamp-3">{article.excerpt}</p>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3 text-slate-500 text-xs">
                  <span className="flex items-center gap-1"><Clock size={11} />{article.readTime}</span>
                </div>
                <span className="text-slate-400 text-xs flex items-center gap-1 group-hover:text-[#00f5ff] transition-colors">
                  Read <ArrowRight size={11} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Tags cloud */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <p className="text-slate-500 text-sm text-center mb-4">Browse by topic</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {Array.from(new Set(ARTICLES.flatMap(a => a.tags))).map(tag => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5 transition-colors flex items-center gap-1"
              >
                <Tag size={10} />{tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
