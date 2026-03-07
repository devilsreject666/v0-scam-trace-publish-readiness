/**
 * ScamTrace API Utilities
 * Integrates multiple free, open-source APIs for blockchain and OSINT investigations
 */

// ============================================================================
// TYPES
// ============================================================================

export interface DomainResult {
  domain: string;
  registrar: string;
  registeredDate: string;
  expiryDate: string;
  domainAge: string;
  nameservers: string[];
  registrantCountry: string;
  registrantOrg: string;
  ssl: { issuer: string; valid: boolean; grade: string; expiry: string };
  hosting: { provider: string; ip: string; location: string; asn: string };
  riskScore: number;
  flags: string[];
  scamReports: number;
  phishing: boolean;
  whoisPrivacy: boolean;
}

export interface PhoneResult {
  number: string;
  carrier: string;
  type: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  timezone: string;
  isVoip: boolean;
  isPrepaid: boolean;
  riskScore: number;
  scamReports: number;
  flags: string[];
  valid: boolean;
}

export interface IpResult {
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
  isHosting: boolean;
  riskScore: number;
  flags: string[];
  abuseReports: number;
  lat: number;
  lng: number;
  timezone: string;
}

export interface UrlScanResult {
  url: string;
  safe: boolean;
  threats: string[];
  malicious: boolean;
  phishing: boolean;
  riskScore: number;
  categories: string[];
  ipAddress: string;
  country: string;
}

export interface EthTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  isError: string;
  gasUsed: string;
  blockNumber: string;
  functionName?: string;
  contractAddress?: string;
}

export interface BtcTransaction {
  txid: string;
  status: { confirmed: boolean; block_height: number; block_time: number };
  vin: { prevout: { scriptpubkey_address: string; value: number } }[];
  vout: { scriptpubkey_address: string; value: number }[];
  fee: number;
  size: number;
}

export interface WalletBalance {
  address: string;
  balance: string;
  chain: 'eth' | 'btc';
  txCount?: number;
}

// ============================================================================
// API ENDPOINTS (Free & Open Source)
// ============================================================================

const APIS = {
  // Blockchain APIs
  etherscan: 'https://api.etherscan.io/api',
  blockstream: 'https://blockstream.info/api',
  blockchair: 'https://api.blockchair.com',
  
  // Domain/WHOIS APIs (free tiers)
  whoisxml: 'https://www.whoisxmlapi.com/whoisserver/WhoisService',
  rdap: 'https://rdap.verisign.com/com/v1/domain', // Free RDAP for .com domains
  
  // IP Geolocation (free APIs)
  ipapi: 'https://ipapi.co', // 1000 req/day free
  ipinfo: 'https://ipinfo.io', // 50k req/month free
  ipgeolocation: 'https://api.ipgeolocation.io/ipgeo',
  
  // URL/Malware Scanning (free APIs)
  urlhaus: 'https://urlhaus-api.abuse.ch/v1',
  phishtank: 'https://checkurl.phishtank.com/checkurl',
  safebrowsing: 'https://safebrowsing.googleapis.com/v4/threatMatches:find',
  
  // Phone validation (free APIs)
  numverify: 'https://apilayer.net/api/validate',
  
  // Threat Intelligence
  abuseipdb: 'https://api.abuseipdb.com/api/v2',
  virustotal: 'https://www.virustotal.com/api/v3',
};

// Environment variable keys for optional API keys
const API_KEYS = {
  etherscan: import.meta.env.VITE_ETHERSCAN_KEY || '',
  abuseipdb: import.meta.env.VITE_ABUSEIPDB_KEY || '',
  virustotal: import.meta.env.VITE_VIRUSTOTAL_KEY || '',
  ipinfo: import.meta.env.VITE_IPINFO_KEY || '',
  numverify: import.meta.env.VITE_NUMVERIFY_KEY || '',
};

// ============================================================================
// DOMAIN LOOKUP APIs (Free)
// ============================================================================

/**
 * Lookup domain information using free RDAP (Registration Data Access Protocol)
 * Works for .com, .net, .org, and many other TLDs
 */
export async function lookupDomain(domain: string): Promise<DomainResult> {
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
  
  // Get TLD to determine RDAP server
  const tld = cleanDomain.split('.').pop() || 'com';
  const rdapServers: Record<string, string> = {
    com: 'https://rdap.verisign.com/com/v1/domain',
    net: 'https://rdap.verisign.com/net/v1/domain',
    org: 'https://rdap.publicinterestregistry.org/rdap/domain',
    io: 'https://rdap.nic.io/domain',
    xyz: 'https://rdap.centralnic.com/xyz/domain',
    app: 'https://rdap.nic.google/domain',
    dev: 'https://rdap.nic.google/domain',
  };
  
  const rdapBase = rdapServers[tld] || `https://rdap.org/domain`;
  
  try {
    // RDAP lookup (free, no API key needed)
    const rdapRes = await fetch(`${rdapBase}/${cleanDomain}`, {
      headers: { Accept: 'application/rdap+json' },
    });
    
    let domainData: Partial<DomainResult> = {
      domain: cleanDomain,
      registrar: 'Unknown',
      registeredDate: 'Unknown',
      expiryDate: 'Unknown',
      domainAge: 'Unknown',
      nameservers: [],
      registrantCountry: 'Unknown',
      registrantOrg: 'REDACTED FOR PRIVACY',
      whoisPrivacy: true,
      scamReports: 0,
      phishing: false,
    };
    
    if (rdapRes.ok) {
      const rdap = await rdapRes.json();
      
      // Extract registration dates
      const events = rdap.events || [];
      const registered = events.find((e: { eventAction: string }) => e.eventAction === 'registration');
      const expires = events.find((e: { eventAction: string }) => e.eventAction === 'expiration');
      
      domainData.registeredDate = registered?.eventDate?.split('T')[0] || 'Unknown';
      domainData.expiryDate = expires?.eventDate?.split('T')[0] || 'Unknown';
      
      // Calculate domain age
      if (registered?.eventDate) {
        const regDate = new Date(registered.eventDate);
        const now = new Date();
        const days = Math.floor((now.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24));
        domainData.domainAge = days < 30 ? `${days} days` : days < 365 ? `${Math.floor(days / 30)} months` : `${Math.floor(days / 365)} years`;
      }
      
      // Extract nameservers
      domainData.nameservers = (rdap.nameservers || []).map((ns: { ldhName: string }) => ns.ldhName).slice(0, 4);
      
      // Extract registrar
      const registrarEntity = (rdap.entities || []).find((e: { roles: string[] }) => e.roles?.includes('registrar'));
      domainData.registrar = registrarEntity?.vcardArray?.[1]?.find((v: string[]) => v[0] === 'fn')?.[3] || 
                           registrarEntity?.publicIds?.[0]?.identifier || 'Unknown';
      
      // Check for privacy protection
      const registrant = (rdap.entities || []).find((e: { roles: string[] }) => e.roles?.includes('registrant'));
      domainData.whoisPrivacy = !registrant || registrant.vcardArray?.[1]?.some((v: string[]) => 
        v[3]?.toLowerCase?.()?.includes('privacy') || v[3]?.toLowerCase?.()?.includes('redacted')
      );
    }
    
    // DNS lookup for IP (using DNS-over-HTTPS)
    let ipAddress = '';
    try {
      const dnsRes = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=A`);
      if (dnsRes.ok) {
        const dns = await dnsRes.json();
        ipAddress = dns.Answer?.[0]?.data || '';
      }
    } catch { /* ignore DNS errors */ }
    
    // IP geolocation for hosting info
    let hostingInfo = { provider: 'Unknown', ip: ipAddress, location: 'Unknown', asn: 'Unknown' };
    if (ipAddress) {
      try {
        const ipRes = await fetch(`https://ipapi.co/${ipAddress}/json/`);
        if (ipRes.ok) {
          const ip = await ipRes.json();
          hostingInfo = {
            provider: ip.org || ip.isp || 'Unknown',
            ip: ipAddress,
            location: [ip.city, ip.country_name].filter(Boolean).join(', ') || 'Unknown',
            asn: ip.asn || 'Unknown',
          };
          domainData.registrantCountry = ip.country_name || 'Unknown';
        }
      } catch { /* ignore */ }
    }
    
    // Calculate risk score based on indicators
    const flags: string[] = [];
    let riskScore = 20; // Base score
    
    // Age risk
    if (domainData.domainAge?.includes('days')) {
      const days = parseInt(domainData.domainAge);
      if (days < 7) {
        flags.push('Domain registered within last 7 days — CRITICAL RISK');
        riskScore += 30;
      } else if (days < 30) {
        flags.push('Domain age under 30 days — HIGH RISK');
        riskScore += 20;
      }
    }
    
    // TLD risk
    const riskyTlds = ['xyz', 'top', 'club', 'work', 'click', 'link', 'gq', 'ml', 'tk', 'ga', 'cf'];
    if (riskyTlds.includes(tld)) {
      flags.push(`.${tld} TLD commonly used for disposable scam domains`);
      riskScore += 15;
    }
    
    // Privacy protection
    if (domainData.whoisPrivacy) {
      flags.push('WHOIS privacy enabled — identity obscured');
      riskScore += 10;
    }
    
    // Check for known scam patterns in domain name
    const scamPatterns = ['verify', 'secure', 'login', 'wallet', 'support', 'help', 'recovery', 'claim', 'airdrop'];
    if (scamPatterns.some(p => cleanDomain.includes(p))) {
      flags.push('Domain contains scam-associated keywords');
      riskScore += 15;
    }
    
    // Check for brand impersonation
    const brandPatterns = ['binance', 'coinbase', 'metamask', 'crypto', 'bitcoin', 'ethereum', 'uniswap', 'opensea'];
    if (brandPatterns.some(b => cleanDomain.includes(b)) && !cleanDomain.endsWith('.com')) {
      flags.push('Potential brand impersonation detected');
      riskScore += 20;
    }
    
    return {
      domain: cleanDomain,
      registrar: domainData.registrar || 'Unknown',
      registeredDate: domainData.registeredDate || 'Unknown',
      expiryDate: domainData.expiryDate || 'Unknown',
      domainAge: domainData.domainAge || 'Unknown',
      nameservers: domainData.nameservers || [],
      registrantCountry: domainData.registrantCountry || 'Unknown',
      registrantOrg: domainData.registrantOrg || 'REDACTED FOR PRIVACY',
      ssl: { issuer: 'Unknown', valid: true, grade: 'N/A', expiry: 'N/A' },
      hosting: hostingInfo,
      riskScore: Math.min(100, riskScore),
      flags,
      scamReports: 0,
      phishing: riskScore >= 70,
      whoisPrivacy: domainData.whoisPrivacy || false,
    };
  } catch (error) {
    console.error('[ScamTrace] Domain lookup error:', error);
    throw new Error('Failed to lookup domain information');
  }
}

// ============================================================================
// IP GEOLOCATION & THREAT INTELLIGENCE (Free APIs)
// ============================================================================

/**
 * Lookup IP address information using free ipapi.co API
 * 1000 requests/day free tier
 */
export async function lookupIp(ip: string): Promise<IpResult> {
  const cleanIp = ip.trim();
  
  // Validate IP format
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  if (!ipv4Regex.test(cleanIp) && !ipv6Regex.test(cleanIp)) {
    throw new Error('Invalid IP address format');
  }
  
  try {
    // Primary: ipapi.co (free, no key required, 1000/day)
    const res = await fetch(`https://ipapi.co/${cleanIp}/json/`);
    
    if (!res.ok) {
      throw new Error('IP lookup failed');
    }
    
    const data = await res.json();
    
    if (data.error) {
      throw new Error(data.reason || 'IP lookup failed');
    }
    
    const flags: string[] = [];
    let riskScore = 10;
    
    // Check for known Tor exit nodes
    const knownTorExits = ['185.220.', '51.15.', '104.244.', '199.249.', '45.33.'];
    const isTor = knownTorExits.some(prefix => cleanIp.startsWith(prefix));
    if (isTor) {
      flags.push('IP matches known Tor exit node pattern');
      riskScore += 30;
    }
    
    // Check for VPN/Proxy indicators
    const vpnProviders = ['nordvpn', 'expressvpn', 'cyberghost', 'private internet', 'mullvad', 'proton'];
    const isVpn = vpnProviders.some(v => (data.org || '').toLowerCase().includes(v));
    if (isVpn) {
      flags.push('VPN provider detected');
      riskScore += 20;
    }
    
    // Check for hosting/datacenter IPs
    const hostingIndicators = ['amazon', 'aws', 'google', 'microsoft', 'azure', 'digitalocean', 'linode', 'vultr', 'ovh', 'hetzner'];
    const isHosting = hostingIndicators.some(h => (data.org || '').toLowerCase().includes(h));
    if (isHosting) {
      flags.push('Cloud/hosting provider IP — not a residential connection');
      riskScore += 15;
    }
    
    // High-risk countries (common sources of scam activity)
    const highRiskCountries = ['RU', 'CN', 'NG', 'IN', 'PH', 'UA', 'RO'];
    if (highRiskCountries.includes(data.country_code)) {
      flags.push('IP located in high-risk region for fraud activity');
      riskScore += 15;
    }
    
    return {
      ip: cleanIp,
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || '',
      region: data.region || 'Unknown',
      city: data.city || 'Unknown',
      isp: data.org || 'Unknown',
      org: data.org || 'Unknown',
      asn: data.asn || 'Unknown',
      isVpn,
      isProxy: false,
      isTor,
      isHosting,
      riskScore: Math.min(100, riskScore),
      flags,
      abuseReports: 0,
      lat: data.latitude || 0,
      lng: data.longitude || 0,
      timezone: data.timezone || 'Unknown',
    };
  } catch (error) {
    console.error('[ScamTrace] IP lookup error:', error);
    throw new Error('Failed to lookup IP information');
  }
}

// ============================================================================
// PHONE NUMBER VALIDATION (Free via libphonenumber logic)
// ============================================================================

/**
 * Validate and analyze phone numbers
 * Uses pattern matching since free phone APIs have limited data
 */
export async function lookupPhone(phone: string): Promise<PhoneResult> {
  // Clean the phone number
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  if (cleanPhone.length < 7 || cleanPhone.length > 15) {
    throw new Error('Invalid phone number length');
  }
  
  // Country code detection
  const countryPatterns: Record<string, { code: string; name: string; length: number[] }> = {
    '1': { code: 'US/CA', name: 'United States/Canada', length: [11] },
    '44': { code: 'GB', name: 'United Kingdom', length: [12, 13] },
    '91': { code: 'IN', name: 'India', length: [12] },
    '86': { code: 'CN', name: 'China', length: [13] },
    '234': { code: 'NG', name: 'Nigeria', length: [13, 14] },
    '63': { code: 'PH', name: 'Philippines', length: [12] },
    '7': { code: 'RU', name: 'Russia', length: [11] },
    '880': { code: 'BD', name: 'Bangladesh', length: [13] },
  };
  
  let countryCode = 'Unknown';
  let countryName = 'Unknown';
  let numberWithoutCountry = cleanPhone;
  
  // Try to detect country code
  for (const [prefix, info] of Object.entries(countryPatterns)) {
    if (cleanPhone.startsWith('+' + prefix) || cleanPhone.startsWith(prefix)) {
      countryCode = info.code;
      countryName = info.name;
      numberWithoutCountry = cleanPhone.replace(new RegExp(`^\\+?${prefix}`), '');
      break;
    }
  }
  
  const flags: string[] = [];
  let riskScore = 15;
  
  // VoIP number detection (common VoIP area codes in US)
  const voipPrefixes = ['332', '838', '959', '206', '253', '425']; // TextNow, Google Voice, etc.
  const isVoip = countryCode.includes('US') && voipPrefixes.some(p => numberWithoutCountry.startsWith(p));
  if (isVoip) {
    flags.push('VoIP number detected — commonly used for disposable fraud communications');
    riskScore += 25;
  }
  
  // High-risk country codes
  const highRiskCountries = ['NG', 'PH', 'IN', 'BD'];
  if (highRiskCountries.some(c => countryCode.includes(c))) {
    flags.push('Phone number from high-risk region for scam activity');
    riskScore += 20;
  }
  
  // Short codes / premium numbers
  if (numberWithoutCountry.length < 7) {
    flags.push('Short code or premium number — may be used for SMS scams');
    riskScore += 15;
  }
  
  // Format the display number
  const formatted = cleanPhone.startsWith('+') ? cleanPhone : '+' + cleanPhone;
  
  return {
    number: formatted,
    carrier: isVoip ? 'VoIP Provider (TextNow/Google Voice)' : 'Unknown Carrier',
    type: isVoip ? 'VoIP / Virtual' : 'Mobile',
    country: countryName,
    countryCode,
    region: 'Unknown',
    city: 'Unknown',
    timezone: 'Unknown',
    isVoip,
    isPrepaid: false,
    riskScore: Math.min(100, riskScore),
    scamReports: 0,
    flags,
    valid: cleanPhone.length >= 10,
  };
}

// ============================================================================
// URL/MALWARE SCANNING (Free APIs)
// ============================================================================

/**
 * Check URL against URLhaus malware database (free, no API key)
 */
export async function scanUrl(url: string): Promise<UrlScanResult> {
  const cleanUrl = url.trim();
  
  try {
    // URLhaus lookup (free, no key required)
    const urlhausRes = await fetch(`${APIS.urlhaus}/url/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `url=${encodeURIComponent(cleanUrl)}`,
    });
    
    let malicious = false;
    let threats: string[] = [];
    let categories: string[] = [];
    
    if (urlhausRes.ok) {
      const data = await urlhausRes.json();
      if (data.query_status === 'ok' && data.url_info) {
        malicious = true;
        threats.push(`URLhaus: Listed as malicious (${data.url_info.threat || 'malware'})`);
        if (data.url_info.tags) {
          categories = data.url_info.tags;
        }
      }
    }
    
    // Extract domain and check patterns
    const domain = cleanUrl.replace(/^https?:\/\//, '').split('/')[0];
    
    // Phishing detection via URL patterns
    const phishingPatterns = [
      'login', 'signin', 'verify', 'secure', 'account', 'wallet',
      'update', 'confirm', 'support', 'help', 'recover', 'unlock',
      'suspended', 'blocked', 'limited', 'unusual', 'activity'
    ];
    
    const hasPhishingPattern = phishingPatterns.some(p => cleanUrl.toLowerCase().includes(p));
    
    // Brand impersonation check
    const brandNames = ['paypal', 'google', 'apple', 'microsoft', 'amazon', 'facebook', 'netflix', 
                        'binance', 'coinbase', 'metamask', 'ledger', 'bank', 'chase', 'wellsfargo'];
    const hasBrandName = brandNames.some(b => domain.toLowerCase().includes(b));
    const isOfficialDomain = brandNames.some(b => domain.toLowerCase() === `${b}.com` || domain.endsWith(`.${b}.com`));
    
    if (hasBrandName && !isOfficialDomain) {
      threats.push('Potential brand impersonation detected');
      malicious = true;
    }
    
    // Calculate risk score
    let riskScore = 10;
    if (malicious) riskScore += 50;
    if (hasPhishingPattern) riskScore += 20;
    if (hasBrandName && !isOfficialDomain) riskScore += 25;
    
    // Get IP for URL
    let ipAddress = '';
    let country = 'Unknown';
    try {
      const dnsRes = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
      if (dnsRes.ok) {
        const dns = await dnsRes.json();
        ipAddress = dns.Answer?.[0]?.data || '';
        
        if (ipAddress) {
          const ipRes = await fetch(`https://ipapi.co/${ipAddress}/json/`);
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            country = ipData.country_name || 'Unknown';
          }
        }
      }
    } catch { /* ignore */ }
    
    return {
      url: cleanUrl,
      safe: !malicious && riskScore < 50,
      threats,
      malicious,
      phishing: hasPhishingPattern || (hasBrandName && !isOfficialDomain),
      riskScore: Math.min(100, riskScore),
      categories,
      ipAddress,
      country,
    };
  } catch (error) {
    console.error('[ScamTrace] URL scan error:', error);
    throw new Error('Failed to scan URL');
  }
}

// ============================================================================
// BLOCKCHAIN APIs (Using existing Etherscan & Blockstream)
// ============================================================================

const ETHERSCAN_KEY = API_KEYS.etherscan || 'YourApiKeyToken';

/**
 * Lookup Ethereum address transactions
 */
export async function lookupEthAddress(address: string): Promise<{ balance: WalletBalance; transactions: EthTransaction[] }> {
  const [balRes, txRes] = await Promise.all([
    fetch(`${APIS.etherscan}?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_KEY}`),
    fetch(`${APIS.etherscan}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc&apikey=${ETHERSCAN_KEY}`),
  ]);
  
  const [balData, txData] = await Promise.all([balRes.json(), txRes.json()]);
  
  const balance: WalletBalance = {
    address,
    balance: balData.status === '1' ? (parseInt(balData.result) / 1e18).toFixed(6) : '0',
    chain: 'eth',
    txCount: txData.result?.length || 0,
  };
  
  const transactions: EthTransaction[] = txData.status === '1' && Array.isArray(txData.result) 
    ? txData.result.slice(0, 50) 
    : [];
  
  return { balance, transactions };
}

/**
 * Lookup Bitcoin address transactions via Blockstream
 */
export async function lookupBtcAddress(address: string): Promise<{ balance: WalletBalance; transactions: BtcTransaction[] }> {
  const [statsRes, txRes] = await Promise.all([
    fetch(`${APIS.blockstream}/address/${address}`),
    fetch(`${APIS.blockstream}/address/${address}/txs`),
  ]);
  
  if (!statsRes.ok) throw new Error('BTC address not found');
  
  const stats = await statsRes.json();
  const funded = stats.chain_stats.funded_txo_sum ?? 0;
  const spent = stats.chain_stats.spent_txo_sum ?? 0;
  const bal = funded - spent;
  
  const balance: WalletBalance = {
    address,
    balance: (bal / 1e8).toFixed(8),
    chain: 'btc',
    txCount: stats.chain_stats.tx_count,
  };
  
  let transactions: BtcTransaction[] = [];
  if (txRes.ok) {
    transactions = await txRes.json();
    transactions = transactions.slice(0, 30);
  }
  
  return { balance, transactions };
}

/**
 * Trace Ethereum funds through multiple hops
 */
export async function traceEthFunds(address: string, depth: number = 3): Promise<{ nodes: any[]; edges: any[] }> {
  const nodes: any[] = [];
  const edges: any[] = [];
  const visited = new Set<string>();
  
  async function traceSingleAddress(addr: string, level: number, parentId?: string) {
    if (level > depth || visited.has(addr.toLowerCase())) return;
    visited.add(addr.toLowerCase());
    
    const nodeId = `node-${nodes.length}`;
    
    try {
      const { balance, transactions } = await lookupEthAddress(addr);
      
      // Add node
      nodes.push({
        id: nodeId,
        address: addr,
        label: level === 0 ? 'Source Wallet' : `Hop ${level}`,
        balance: balance.balance,
        txCount: balance.txCount,
        level,
      });
      
      // Add edge from parent
      if (parentId) {
        edges.push({ from: parentId, to: nodeId });
      }
      
      // Trace outgoing transactions (limit to prevent explosion)
      const outgoing = transactions.filter(tx => tx.from.toLowerCase() === addr.toLowerCase()).slice(0, 5);
      
      for (const tx of outgoing) {
        if (tx.to && !visited.has(tx.to.toLowerCase())) {
          await traceSingleAddress(tx.to, level + 1, nodeId);
        }
      }
    } catch (error) {
      console.error(`[ScamTrace] Error tracing address ${addr}:`, error);
    }
  }
  
  await traceSingleAddress(address, 0);
  
  return { nodes, edges };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function formatAddress(addr: string): string {
  if (!addr || addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function satToBtc(sat: number): string {
  return (sat / 1e8).toFixed(8);
}

export function weiToEth(wei: string | number): string {
  const num = typeof wei === 'string' ? parseInt(wei) : wei;
  return (num / 1e18).toFixed(6);
}

export function detectChain(input: string): { chain: 'eth' | 'btc'; type: 'address' | 'tx' } | null {
  const s = input.trim();
  // BTC address (legacy, segwit, taproot)
  if (/^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(s)) return { chain: 'btc', type: 'address' };
  // BTC txid (64 hex chars, no 0x)
  if (/^[a-fA-F0-9]{64}$/.test(s)) return { chain: 'btc', type: 'tx' };
  // ETH address
  if (/^0x[a-fA-F0-9]{40}$/.test(s)) return { chain: 'eth', type: 'address' };
  // ETH tx hash
  if (/^0x[a-fA-F0-9]{64}$/.test(s)) return { chain: 'eth', type: 'tx' };
  return null;
}
