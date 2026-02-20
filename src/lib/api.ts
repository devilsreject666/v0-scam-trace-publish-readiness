/* ================================================================
   ScamTrace — Real-Time API Utility Module
   All external API calls and risk-scoring algorithms.
   ================================================================ */

const ETHERSCAN_API = 'https://api.etherscan.io/api';
const BLOCKSTREAM_API = 'https://blockstream.info/api';
const WHODAT_API = 'https://who-dat.as93.net';
const IPQUERY_API = 'https://api.ipquery.io';
const NUMVERIFY_API = 'https://apilayer.net/api/validate';

const ETH_KEY = import.meta.env.VITE_ETHERSCAN_KEY || '';
const NUMVERIFY_KEY = import.meta.env.VITE_NUMVERIFY_KEY || '';

/* ------------------------------------------------------------------ */
/*  Domain / WHOIS Lookup (who-dat.as93.net — free, no key)           */
/* ------------------------------------------------------------------ */

export interface WhoisResult {
  domain: string;
  registrar: string;
  registeredDate: string;
  expiryDate: string;
  domainAgeDays: number;
  domainAge: string;
  nameservers: string[];
  registrantCountry: string;
  registrantOrg: string;
  whoisPrivacy: boolean;
  rawStatus: string[];
}

function parseDateStr(d: string | undefined | null): string {
  if (!d) return 'Unknown';
  try {
    return new Date(d).toISOString().split('T')[0];
  } catch {
    return d;
  }
}

function computeDomainAge(regDate: string | undefined | null): { days: number; label: string } {
  if (!regDate) return { days: -1, label: 'Unknown' };
  try {
    const reg = new Date(regDate);
    const now = new Date();
    const diffMs = now.getTime() - reg.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days < 1) return { days: 0, label: 'Less than 1 day' };
    if (days < 30) return { days, label: `${days} days` };
    if (days < 365) return { days, label: `${Math.floor(days / 30)} months` };
    const years = Math.floor(days / 365);
    return { days, label: `${years} year${years > 1 ? 's' : ''}` };
  } catch {
    return { days: -1, label: 'Unknown' };
  }
}

export async function whoisLookup(domain: string): Promise<WhoisResult> {
  const clean = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
  const res = await fetch(`${WHODAT_API}/${encodeURIComponent(clean)}`);
  if (!res.ok) throw new Error(`WHOIS lookup failed (HTTP ${res.status})`);
  const data = await res.json();

  const regDate = data.events?.find((e: { action: string }) => e.action === 'registration')?.date
    || data.events?.[0]?.date;
  const expDate = data.events?.find((e: { action: string }) => e.action === 'expiration')?.date;

  const age = computeDomainAge(regDate);

  // Extract registrant info
  const registrant = data.entities?.find((e: { roles?: string[] }) =>
    e.roles?.includes('registrant')
  );
  const registrar = data.entities?.find((e: { roles?: string[] }) =>
    e.roles?.includes('registrar')
  );

  const registrarName = registrar?.vcardArray?.[1]?.find((v: string[]) => v[0] === 'fn')?.[3]
    || registrar?.publicIds?.[0]?.identifier
    || data.entities?.[0]?.vcardArray?.[1]?.find((v: string[]) => v[0] === 'fn')?.[3]
    || 'Unknown';

  const registrantCountry = registrant?.vcardArray?.[1]?.find((v: string[]) => v[0] === 'adr')?.[3]?.country
    || data.entities?.[0]?.vcardArray?.[1]?.find((v: string[]) => v[0] === 'adr')?.[3]?.country
    || 'Redacted';

  const registrantOrg = registrant?.vcardArray?.[1]?.find((v: string[]) => v[0] === 'org')?.[3]
    || 'Redacted for Privacy';

  const nameservers = data.nameservers?.map((ns: { ldhName?: string }) => ns.ldhName || '') || [];

  const hasPrivacy = !!(
    data.entities?.some((e: { remarks?: Array<{ description?: string[] }> }) =>
      e.remarks?.some((r: { description?: string[] }) =>
        r.description?.some((d: string) => /privacy|redact|proxy|protect/i.test(d))
      )
    ) || registrantOrg.toLowerCase().includes('privacy') || registrantOrg.toLowerCase().includes('redact')
  );

  return {
    domain: clean,
    registrar: registrarName,
    registeredDate: parseDateStr(regDate),
    expiryDate: parseDateStr(expDate),
    domainAgeDays: age.days,
    domainAge: age.label,
    nameservers: nameservers.filter(Boolean),
    registrantCountry,
    registrantOrg,
    whoisPrivacy: hasPrivacy,
    rawStatus: data.status || [],
  };
}

/* ------------------------------------------------------------------ */
/*  Domain Risk Scoring                                                */
/* ------------------------------------------------------------------ */

const RISKY_TLDS = ['.xyz', '.top', '.club', '.buzz', '.click', '.link', '.online',
  '.site', '.store', '.tk', '.ml', '.ga', '.cf', '.gq', '.work', '.icu', '.rest'];

export interface DomainRiskResult {
  riskScore: number;
  flags: string[];
  phishing: boolean;
}

export function calculateDomainRisk(whois: WhoisResult, ipData?: IpLookupResult): DomainRiskResult {
  let score = 0;
  const flags: string[] = [];

  // Domain age
  if (whois.domainAgeDays >= 0 && whois.domainAgeDays < 30) {
    score += 35;
    flags.push(`Domain age under 30 days (${whois.domainAge}) — HIGH RISK`);
  } else if (whois.domainAgeDays >= 0 && whois.domainAgeDays < 90) {
    score += 20;
    flags.push(`Domain age under 90 days (${whois.domainAge}) — suspicious`);
  } else if (whois.domainAgeDays >= 0 && whois.domainAgeDays < 365) {
    score += 10;
    flags.push(`Domain age under 1 year (${whois.domainAge})`);
  }

  // TLD risk
  const tld = '.' + whois.domain.split('.').pop();
  if (RISKY_TLDS.includes(tld.toLowerCase())) {
    score += 15;
    flags.push(`${tld} TLD commonly used for throwaway scam domains`);
  }

  // WHOIS privacy
  if (whois.whoisPrivacy) {
    score += 10;
    flags.push('Registered with WHOIS privacy — common in scam sites');
  }

  // Country indicators
  if (whois.registrantCountry === 'Redacted') {
    score += 5;
    flags.push('Registrant information fully redacted');
  }

  // Nameservers
  if (whois.nameservers.length === 0) {
    score += 10;
    flags.push('No nameservers configured — domain may be parked');
  }

  // IP-based flags
  if (ipData) {
    if (ipData.isVpn || ipData.isProxy) {
      score += 10;
      flags.push('Hosting IP associated with VPN/proxy services');
    }
    if (ipData.isTor) {
      score += 15;
      flags.push('Hosting IP is a Tor exit node');
    }
  }

  // Suspicious domain name patterns
  const suspiciousPatterns = [
    /(?:secure|verify|login|update|account|confirm)/i,
    /(?:binance|coinbase|metamask|trust.?wallet|phantom)/i,
    /(?:airdrop|giveaway|claim|reward|bonus)/i,
  ];
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(whois.domain)) {
      score += 15;
      flags.push(`Domain name matches known phishing patterns (${pattern.source.replace(/[()]/g, '')})`);
      break;
    }
  }

  const phishing = suspiciousPatterns.some(p => p.test(whois.domain));
  return { riskScore: Math.min(100, score), flags, phishing };
}

/* ------------------------------------------------------------------ */
/*  IP Intelligence (ipquery.io — free, no key, no CORS issues)       */
/* ------------------------------------------------------------------ */

export interface IpLookupResult {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  isp: string;
  org: string;
  asn: string;
  isVpn: boolean;
  isProxy: boolean;
  isTor: boolean;
  isMobile: boolean;
  isHosting: boolean;
  riskScore: number;
  lat: number;
  lng: number;
  flags: string[];
}

export async function ipLookup(ip: string): Promise<IpLookupResult> {
  const res = await fetch(`${IPQUERY_API}/${encodeURIComponent(ip.trim())}`);
  if (!res.ok) throw new Error(`IP lookup failed (HTTP ${res.status})`);
  const data = await res.json();

  const loc = data.location || {};
  const isp_info = data.isp || {};
  const risk = data.risk || {};

  let riskScore = 0;
  const flags: string[] = [];

  const isVpn = !!risk.is_vpn;
  const isProxy = !!risk.is_proxy;
  const isTor = !!risk.is_tor;
  const isHosting = !!risk.is_datacenter;
  const isMobile = !!risk.is_mobile;

  if (isTor) { riskScore += 40; flags.push('Tor exit node — used for anonymized traffic'); }
  if (isVpn) { riskScore += 25; flags.push('VPN detected — IP masked'); }
  if (isProxy) { riskScore += 20; flags.push('Proxy/anonymizer detected'); }
  if (isHosting) { riskScore += 10; flags.push('IP belongs to a data center / hosting provider'); }
  if (risk.risk_score != null) {
    riskScore = Math.max(riskScore, Math.round(risk.risk_score * 100));
  }

  return {
    ip: ip.trim(),
    country: loc.country || 'Unknown',
    countryCode: loc.country_code || '',
    region: loc.state || loc.region || 'Unknown',
    city: loc.city || 'Unknown',
    isp: isp_info.isp || 'Unknown',
    org: isp_info.org || isp_info.isp || 'Unknown',
    asn: isp_info.asn || 'Unknown',
    isVpn,
    isProxy,
    isTor,
    isMobile,
    isHosting,
    riskScore: Math.min(100, riskScore),
    lat: loc.latitude ?? 0,
    lng: loc.longitude ?? 0,
    flags,
  };
}

/* ------------------------------------------------------------------ */
/*  Phone Lookup (numverify.com — free tier, needs API key)            */
/* ------------------------------------------------------------------ */

export interface PhoneLookupResult {
  number: string;
  valid: boolean;
  country: string;
  countryCode: string;
  location: string;
  carrier: string;
  lineType: string;
  isVoip: boolean;
  isPrepaid: boolean;
  riskScore: number;
  flags: string[];
}

export async function phoneLookup(number: string): Promise<PhoneLookupResult> {
  if (!NUMVERIFY_KEY) {
    throw new Error('Phone lookup requires a Numverify API key. Set VITE_NUMVERIFY_KEY in your environment variables.');
  }

  const clean = number.replace(/[\s()-]/g, '');
  const res = await fetch(
    `${NUMVERIFY_API}?access_key=${NUMVERIFY_KEY}&number=${encodeURIComponent(clean)}&format=1`
  );
  if (!res.ok) throw new Error(`Phone lookup failed (HTTP ${res.status})`);
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.info || 'Phone lookup API error');
  }

  const lineType = data.line_type || 'unknown';
  const isVoip = lineType === 'voip' || lineType === 'special_services';
  const isPrepaid = lineType === 'prepaid';
  const carrier = data.carrier || 'Unknown';

  let riskScore = 0;
  const flags: string[] = [];

  if (!data.valid) {
    riskScore += 30;
    flags.push('Phone number validation failed — may be invalid or non-existent');
  }
  if (isVoip) {
    riskScore += 35;
    flags.push('VoIP number — commonly used for disposable fraud communications');
  }
  if (isPrepaid) {
    riskScore += 15;
    flags.push('Prepaid number — lower traceability');
  }
  if (!carrier || carrier === 'Unknown') {
    riskScore += 10;
    flags.push('Carrier information unavailable — suspicious');
  }

  return {
    number: data.international_format || clean,
    valid: !!data.valid,
    country: data.country_name || 'Unknown',
    countryCode: data.country_code || '',
    location: data.location || 'Unknown',
    carrier,
    lineType,
    isVoip,
    isPrepaid,
    riskScore: Math.min(100, riskScore),
    flags,
  };
}

/* ------------------------------------------------------------------ */
/*  Ethereum Address Analysis                                          */
/* ------------------------------------------------------------------ */

export interface EthAddressAnalysis {
  address: string;
  balance: string;
  balanceWei: string;
  txCount: number;
  firstTxTimestamp: number | null;
  walletAgeDays: number;
  walletAge: string;
  recentTxs: EthTx[];
  riskScore: number;
  flags: string[];
  totalReceived: string;
  uniqueInteractors: number;
}

export interface EthTx {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  isError: string;
  gasUsed: string;
  blockNumber: string;
}

// Known high-risk contract addresses (Tornado Cash routers, etc.)
const KNOWN_MIXERS = [
  '0xd90e2f925da726b50c4ed8d0fb90ad053324f31b', // Tornado Cash
  '0x722122df12d4e14e13ac3b6895a86e84145b6967', // Tornado Cash Router
  '0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc', // Tornado Cash 0.1 ETH
  '0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2936', // Tornado Cash 1 ETH
  '0x910cbd523d972eb0a6f4cae4618ad62622b39dbf', // Tornado Cash 10 ETH
  '0xa160cdab225685da1d56aa342ad8841c3b53f291', // Tornado Cash 100 ETH
].map(a => a.toLowerCase());

export async function ethAddressAnalysis(address: string): Promise<EthAddressAnalysis> {
  const apiKey = ETH_KEY || 'YourApiKeyToken';

  const [balRes, txRes] = await Promise.all([
    fetch(`${ETHERSCAN_API}?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`),
    fetch(`${ETHERSCAN_API}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=asc&apikey=${apiKey}`),
  ]);

  const [balData, txData] = await Promise.all([balRes.json(), txRes.json()]);

  let balance = '0';
  if (balData.status === '1') {
    balance = (parseInt(balData.result) / 1e18).toFixed(6);
  }

  const txs: EthTx[] = txData.status === '1' && Array.isArray(txData.result) ? txData.result : [];
  const txCount = txs.length;

  // Calculate wallet age
  let firstTxTimestamp: number | null = null;
  let walletAgeDays = 0;
  let walletAge = 'Unknown';
  if (txs.length > 0) {
    firstTxTimestamp = parseInt(txs[0].timeStamp);
    const now = Date.now() / 1000;
    walletAgeDays = Math.floor((now - firstTxTimestamp) / 86400);
    if (walletAgeDays < 1) walletAge = 'Less than 1 day';
    else if (walletAgeDays < 30) walletAge = `${walletAgeDays} days`;
    else if (walletAgeDays < 365) walletAge = `${Math.floor(walletAgeDays / 30)} months`;
    else walletAge = `${Math.floor(walletAgeDays / 365)} years`;
  }

  // Compute risk signals
  let riskScore = 0;
  const flags: string[] = [];

  // Wallet age check
  if (walletAgeDays < 14 && walletAgeDays >= 0 && txs.length > 0) {
    riskScore += 30;
    flags.push(`Wallet is ${walletAge} old — extremely suspicious for receiving large amounts`);
  } else if (walletAgeDays < 60 && txs.length > 0) {
    riskScore += 15;
    flags.push(`Wallet is ${walletAge} old — relatively new`);
  }

  // Check for mixer interactions
  const uniqueAddresses = new Set<string>();
  let mixerInteractions = 0;
  let totalReceivedWei = BigInt(0);

  for (const tx of txs) {
    uniqueAddresses.add(tx.from.toLowerCase());
    uniqueAddresses.add(tx.to.toLowerCase());
    if (tx.to.toLowerCase() === address.toLowerCase()) {
      totalReceivedWei += BigInt(tx.value || '0');
    }
    if (KNOWN_MIXERS.includes(tx.to.toLowerCase()) || KNOWN_MIXERS.includes(tx.from.toLowerCase())) {
      mixerInteractions++;
    }
  }

  if (mixerInteractions > 0) {
    riskScore += 25;
    flags.push(`${mixerInteractions} interaction(s) with known mixer/tumbler contracts`);
  }

  // Many senders in short period
  const recentIncoming = txs.filter(t =>
    t.to.toLowerCase() === address.toLowerCase() &&
    Date.now() / 1000 - parseInt(t.timeStamp) < 172800 // 48 hours
  );
  if (recentIncoming.length >= 10) {
    riskScore += 15;
    flags.push(`${recentIncoming.length} incoming transactions in last 48 hours from multiple senders`);
  }

  const totalReceived = (Number(totalReceivedWei) / 1e18).toFixed(4);

  // Get last N transactions (most recent) for display
  const recentTxs = [...txs].reverse().slice(0, 25);

  return {
    address,
    balance,
    balanceWei: balData.result || '0',
    txCount,
    firstTxTimestamp,
    walletAgeDays,
    walletAge,
    recentTxs,
    riskScore: Math.min(100, riskScore),
    flags,
    totalReceived,
    uniqueInteractors: uniqueAddresses.size,
  };
}

/* ------------------------------------------------------------------ */
/*  BTC Address Analysis                                               */
/* ------------------------------------------------------------------ */

export interface BtcAddressAnalysis {
  address: string;
  balance: string;
  txCount: number;
  walletAgeDays: number;
  walletAge: string;
  riskScore: number;
  flags: string[];
  recentTxs: BtcTx[];
}

export interface BtcTx {
  txid: string;
  status: { confirmed: boolean; block_height: number; block_time: number };
  vin: { prevout: { scriptpubkey_address: string; value: number } }[];
  vout: { scriptpubkey_address: string; value: number }[];
}

export async function btcAddressAnalysis(address: string): Promise<BtcAddressAnalysis> {
  const [statsRes, txRes] = await Promise.all([
    fetch(`${BLOCKSTREAM_API}/address/${address}`),
    fetch(`${BLOCKSTREAM_API}/address/${address}/txs`),
  ]);

  if (!statsRes.ok) throw new Error('BTC address not found');
  const stats = await statsRes.json();

  const funded = stats.chain_stats?.funded_txo_sum ?? 0;
  const spent = stats.chain_stats?.spent_txo_sum ?? 0;
  const bal = funded - spent;
  const txCount = stats.chain_stats?.tx_count ?? 0;

  let txs: BtcTx[] = [];
  if (txRes.ok) {
    txs = await txRes.json();
  }

  // Wallet age
  let walletAgeDays = 0;
  let walletAge = 'Unknown';
  const confirmedTxs = txs.filter(t => t.status.confirmed && t.status.block_time);
  if (confirmedTxs.length > 0) {
    const oldest = Math.min(...confirmedTxs.map(t => t.status.block_time));
    const now = Date.now() / 1000;
    walletAgeDays = Math.floor((now - oldest) / 86400);
    if (walletAgeDays < 1) walletAge = 'Less than 1 day';
    else if (walletAgeDays < 30) walletAge = `${walletAgeDays} days`;
    else if (walletAgeDays < 365) walletAge = `${Math.floor(walletAgeDays / 30)} months`;
    else walletAge = `${Math.floor(walletAgeDays / 365)} years`;
  }

  let riskScore = 0;
  const flags: string[] = [];

  if (walletAgeDays < 14 && confirmedTxs.length > 0) {
    riskScore += 25;
    flags.push(`BTC wallet is ${walletAge} old — very new`);
  }

  // Many UTXOs from different addresses could indicate mixing
  if (txs.some(tx => tx.vin.length >= 5)) {
    riskScore += 15;
    flags.push('Transactions with many inputs detected — possible CoinJoin/mixing activity');
  }

  return {
    address,
    balance: (bal / 1e8).toFixed(8),
    txCount,
    walletAgeDays,
    walletAge,
    riskScore: Math.min(100, riskScore),
    flags,
    recentTxs: txs.slice(0, 20),
  };
}

/* ------------------------------------------------------------------ */
/*  DNS resolution helper (get IP from domain)                         */
/* ------------------------------------------------------------------ */

export async function resolveHostIP(domain: string): Promise<string | null> {
  try {
    // Use dns.google.com as a public DNS-over-HTTPS resolver
    const clean = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(clean)}&type=A`);
    if (!res.ok) return null;
    const data = await res.json();
    const aRecord = data.Answer?.find((r: { type: number }) => r.type === 1);
    return aRecord?.data || null;
  } catch {
    return null;
  }
}
