import type { VercelRequest, VercelResponse } from '@vercel/node';

/* -----------------------------------------------------------------------
   /api/osint-domain
   Query: ?domain=example.com
   Aggregates: WHOIS (whoisxmlapi), VirusTotal, IPinfo, SSL check
   All API keys come from Vercel env vars — never exposed to the client.
   Falls back gracefully when keys are absent (returns partial data).
----------------------------------------------------------------------- */

const VT_KEY = process.env.VIRUSTOTAL_API_KEY ?? '';
const WHOIS_KEY = process.env.WHOISXML_API_KEY ?? '';
const IPINFO_TOKEN = process.env.IPINFO_TOKEN ?? '';

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const domain = (req.query.domain as string ?? '').trim().toLowerCase()
    .replace(/^https?:\/\//, '').replace(/\/.*$/, '');

  if (!domain || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain)) {
    return res.status(400).json({ error: 'Invalid domain format' });
  }

  /* ---- 1. DNS / IP resolution ---------------------------------------- */
  let resolvedIp = '';
  let hosting = { provider: 'Unknown', ip: '', location: 'Unknown', asn: 'Unknown', org: 'Unknown' };
  try {
    const dnsRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`);
    const dnsData = await dnsRes.json();
    resolvedIp = dnsData?.Answer?.[0]?.data ?? '';

    if (resolvedIp && IPINFO_TOKEN) {
      const ipRes = await fetch(`https://ipinfo.io/${resolvedIp}?token=${IPINFO_TOKEN}`);
      const ipData = await safeJson(ipRes);
      if (ipData) {
        hosting = {
          provider: ipData.company?.name ?? ipData.org?.replace(/^AS\d+ /, '') ?? 'Unknown',
          ip: resolvedIp,
          location: [ipData.city, ipData.country].filter(Boolean).join(', ') || 'Unknown',
          asn: ipData.asn?.asn ?? ipData.org?.split(' ')[0] ?? 'Unknown',
          org: ipData.org ?? 'Unknown',
        };
      }
    } else if (resolvedIp) {
      // Fallback: free ipapi
      const ipRes = await fetch(`https://ipapi.co/${resolvedIp}/json/`);
      const ipData = await safeJson(ipRes);
      if (ipData && !ipData.error) {
        hosting = {
          provider: ipData.org ?? 'Unknown',
          ip: resolvedIp,
          location: [ipData.city, ipData.country_name].filter(Boolean).join(', ') || 'Unknown',
          asn: `AS${ipData.asn ?? ''}`,
          org: ipData.org ?? 'Unknown',
        };
      }
    }
  } catch { /* ignore */ }

  /* ---- 2. WHOIS ----------------------------------------------------- */
  let whois: Record<string, unknown> = {};
  let registrar = 'Unknown';
  let registeredDate = 'Unknown';
  let expiryDate = 'Unknown';
  let registrantCountry = 'Unknown';
  let registrantOrg = 'REDACTED FOR PRIVACY';
  let nameservers: string[] = [];
  let domainAge = 'Unknown';
  let whoisPrivacy = false;

  if (WHOIS_KEY) {
    try {
      const whoisRes = await fetch(
        `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${WHOIS_KEY}&domainName=${domain}&outputFormat=JSON`
      );
      const whoisData = await safeJson(whoisRes);
      whois = whoisData?.WhoisRecord ?? {};

      const rec = whois as Record<string, unknown>;
      registrar = (rec.registrarName as string) ?? 'Unknown';
      const ns = (rec.nameServers as Record<string, unknown>)?.hostNames;
      nameservers = Array.isArray(ns) ? (ns as string[]).slice(0, 4) : [];

      const regAt = (rec.createdDate as string) ?? '';
      const expAt = (rec.expiresDate as string) ?? '';
      registeredDate = regAt ? regAt.split('T')[0] : 'Unknown';
      expiryDate = expAt ? expAt.split('T')[0] : 'Unknown';

      const registrant = rec.registrant as Record<string, unknown> | undefined;
      registrantCountry = (registrant?.country as string) ?? 'Unknown';
      registrantOrg = (registrant?.organization as string) ?? 'REDACTED FOR PRIVACY';
      if (!registrantOrg || registrantOrg.length < 2) registrantOrg = 'REDACTED FOR PRIVACY';

      // Privacy detection heuristics
      const privacyKeywords = ['privacy', 'redacted', 'whoisguard', 'domains by proxy', 'withheld', 'protected'];
      const orgLower = registrantOrg.toLowerCase();
      whoisPrivacy = privacyKeywords.some(k => orgLower.includes(k));

      // Domain age
      if (regAt) {
        const days = Math.floor((Date.now() - new Date(regAt).getTime()) / 86400000);
        domainAge = days < 30 ? `${days} days` : days < 365 ? `${Math.floor(days / 30)} months` : `${Math.floor(days / 365)} years`;
      }
    } catch { /* ignore */ }
  } else {
    // No WHOIS key — try RDAP (free, no key)
    try {
      const rdapRes = await fetch(`https://rdap.org/domain/${domain}`);
      if (rdapRes.ok) {
        const rdap = await rdapRes.json();
        registrar = rdap.entities?.find((e: Record<string, unknown>) => (e.roles as string[])?.includes('registrar'))?.vcardArray?.[1]?.find((a: unknown[]) => a[0] === 'fn')?.[3] ?? 'Unknown';
        const events = rdap.events ?? [];
        registeredDate = events.find((e: Record<string, unknown>) => e.eventAction === 'registration')?.eventDate?.split('T')[0] ?? 'Unknown';
        expiryDate = events.find((e: Record<string, unknown>) => e.eventAction === 'expiration')?.eventDate?.split('T')[0] ?? 'Unknown';
        nameservers = (rdap.nameservers ?? []).map((n: Record<string, unknown>) => (n.ldhName as string) ?? '').filter(Boolean).slice(0, 4);
        if (registeredDate !== 'Unknown') {
          const days = Math.floor((Date.now() - new Date(registeredDate).getTime()) / 86400000);
          domainAge = days < 30 ? `${days} days` : days < 365 ? `${Math.floor(days / 30)} months` : `${Math.floor(days / 365)} years`;
        }
      }
    } catch { /* ignore */ }
  }

  /* ---- 3. VirusTotal ------------------------------------------------ */
  let riskScore = 20;
  let phishing = false;
  let vtFlags: string[] = [];
  let scamReports = 0;

  if (VT_KEY) {
    try {
      const vtRes = await fetch(
        `https://www.virustotal.com/api/v3/domains/${domain}`,
        { headers: { 'x-apikey': VT_KEY } }
      );
      const vtData = await safeJson(vtRes);
      const stats = vtData?.data?.attributes?.last_analysis_stats ?? {};
      const malicious: number = stats.malicious ?? 0;
      const suspicious: number = stats.suspicious ?? 0;
      const total: number = Object.values(stats).reduce((a: number, b: unknown) => a + (b as number), 0 as number);
      scamReports = malicious + suspicious;

      if (total > 0) {
        riskScore = Math.min(100, Math.round(((malicious * 3 + suspicious) / total) * 100));
      }
      phishing = (vtData?.data?.attributes?.categories as Record<string, string> ?? {})[VT_KEY]?.includes?.('phishing') ?? false;

      const results = vtData?.data?.attributes?.last_analysis_results ?? {};
      vtFlags = Object.values(results as Record<string, Record<string, string>>)
        .filter(r => r.category === 'malicious' || r.category === 'suspicious')
        .slice(0, 5)
        .map(r => `${r.engine_name}: ${r.result}`);
    } catch { /* ignore */ }
  }

  /* ---- 4. Risk scoring (heuristics layered on top) ------------------ */
  const tld = domain.split('.').pop() ?? '';
  const highRiskTLDs = ['xyz', 'top', 'tk', 'ml', 'ga', 'cf', 'gq', 'pw', 'cc', 'info', 'biz'];
  const flags: string[] = [...vtFlags];

  if (domainAge !== 'Unknown' && domainAge.includes('days')) {
    const d = parseInt(domainAge);
    if (d < 30) { riskScore = Math.max(riskScore, 60); flags.push(`Domain is only ${d} days old — HIGH RISK (new domains commonly used in scams)`); }
  }
  if (whoisPrivacy) { riskScore = Math.min(100, riskScore + 10); flags.push('WHOIS privacy enabled — identity of domain owner is hidden'); }
  if (highRiskTLDs.includes(tld)) { riskScore = Math.min(100, riskScore + 15); flags.push(`.${tld} TLD is commonly used for disposable scam domains`); }

  const hostedOnFreeHost = ['hostinger', 'namecheap', 'godaddy'].some(h => hosting.provider.toLowerCase().includes(h));
  if (hostedOnFreeHost) flags.push(`Hosted on ${hosting.provider} — commonly used by low-budget fraudulent sites`);

  // SSL check via SSL Labs (no key required)
  let ssl = { issuer: 'Unknown', valid: false, grade: 'N/A', expiry: 'Unknown' };
  try {
    const sslRes = await fetch(`https://api.ssllabs.com/api/v3/analyze?host=${domain}&fromCache=on&maxAge=24`);
    if (sslRes.ok) {
      const sslData = await sslRes.json();
      const ep = sslData?.endpoints?.[0];
      if (ep) {
        ssl = {
          issuer: ep.details?.cert?.issuerLabel ?? 'Unknown',
          valid: sslData.status === 'READY' && ep.grade !== 'T',
          grade: ep.grade ?? 'N/A',
          expiry: ep.details?.cert?.notAfter
            ? new Date(ep.details.cert.notAfter).toISOString().split('T')[0]
            : 'Unknown',
        };
        if (ssl.issuer.includes("Let's Encrypt")) {
          flags.push("Free Let's Encrypt SSL — free certificates are often used by phishing/scam sites");
        }
      }
    }
  } catch { /* ignore */ }

  riskScore = Math.min(100, riskScore);

  return res.status(200).json({
    domain,
    registrar,
    registeredDate,
    expiryDate,
    domainAge,
    nameservers,
    registrantCountry,
    registrantOrg,
    ssl,
    hosting,
    riskScore,
    flags,
    scamReports,
    phishing,
    whoisPrivacy,
  });
}
