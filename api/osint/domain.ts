import type { VercelRequest, VercelResponse } from '@vercel/node';

// Real WHOIS + DNS + reputation lookup for domains
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { domain } = req.body;
  if (!domain || typeof domain !== 'string') return res.status(400).json({ error: 'domain is required' });

  // Sanitize: strip protocol and paths
  const clean = domain.replace(/^https?:\/\//, '').split('/')[0].toLowerCase().trim();

  try {
    // Parallel: WHOIS via RDAP, DNS resolution, Google Safe Browsing
    const [rdapRes, dnsRes, safeBrowseRes] = await Promise.all([
      fetch(`https://rdap.org/domain/${clean}`).catch(() => null),
      fetch(`https://dns.google/resolve?name=${clean}&type=A`).catch(() => null),
      checkSafeBrowsing(clean),
    ]);

    // Parse RDAP WHOIS
    let whois: Record<string, unknown> = {};
    if (rdapRes && rdapRes.ok) {
      whois = await rdapRes.json();
    }

    // Parse DNS
    let dnsData: Record<string, unknown> = {};
    let hostingIp = '';
    if (dnsRes && dnsRes.ok) {
      dnsData = await dnsRes.json();
      const answers = (dnsData as { Answer?: { data: string }[] }).Answer;
      if (answers && answers.length > 0) {
        hostingIp = answers[0].data;
      }
    }

    // IP geolocation for hosting info
    let ipGeo: Record<string, unknown> = {};
    if (hostingIp) {
      const geoRes = await fetch(`http://ip-api.com/json/${hostingIp}?fields=status,country,regionName,city,isp,org,as,hosting`).catch(() => null);
      if (geoRes && geoRes.ok) {
        ipGeo = await geoRes.json();
      }
    }

    // Extract WHOIS dates
    const events = (whois as { events?: { eventAction: string; eventDate: string }[] }).events || [];
    const registration = events.find(e => e.eventAction === 'registration')?.eventDate || '';
    const expiration = events.find(e => e.eventAction === 'expiration')?.eventDate || '';
    const lastChanged = events.find(e => e.eventAction === 'last changed')?.eventDate || '';

    // Extract nameservers
    const nsRecords = (whois as { nameservers?: { ldhName: string }[] }).nameservers || [];
    const nameservers = nsRecords.map(ns => ns.ldhName);

    // Extract registrar
    const entities = (whois as { entities?: { roles: string[]; vcardArray?: unknown[] }[] }).entities || [];
    const registrarEntity = entities.find(e => e.roles?.includes('registrar'));
    const registrar = registrarEntity?.vcardArray
      ? extractVcardName(registrarEntity.vcardArray)
      : (whois as { name?: string }).name || 'Unknown';

    // Calculate domain age
    const ageMs = registration ? Date.now() - new Date(registration).getTime() : 0;
    const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
    const domainAge = ageDays > 365
      ? `${Math.floor(ageDays / 365)} years`
      : ageDays > 30
        ? `${Math.floor(ageDays / 30)} months`
        : `${ageDays} days`;

    // Build risk flags
    const flags: string[] = [];
    let riskScore = 0;

    if (ageDays < 30) { flags.push('Domain age under 30 days -- HIGH RISK'); riskScore += 30; }
    else if (ageDays < 90) { flags.push('Domain age under 90 days -- elevated risk'); riskScore += 15; }

    const tld = clean.split('.').pop()?.toLowerCase() || '';
    const riskyTlds = ['xyz', 'top', 'club', 'online', 'site', 'icu', 'buzz', 'rest', 'monster'];
    if (riskyTlds.includes(tld)) { flags.push(`.${tld} TLD commonly used for throwaway scam domains`); riskScore += 15; }

    // Check WHOIS privacy
    const whoisStr = JSON.stringify(whois).toLowerCase();
    const hasPrivacy = whoisStr.includes('privacy') || whoisStr.includes('redacted') || whoisStr.includes('withheld');
    if (hasPrivacy) { flags.push('WHOIS privacy enabled -- common in scam sites'); riskScore += 10; }

    // Hosting country mismatch detection
    const registrantCountry = extractCountryFromWhois(whois);
    const hostingCountry = (ipGeo as { country?: string }).country || 'Unknown';
    if (registrantCountry && hostingCountry && registrantCountry !== hostingCountry && registrantCountry !== 'Unknown') {
      flags.push(`Geographic mismatch: registrant in ${registrantCountry}, hosted in ${hostingCountry}`);
      riskScore += 10;
    }

    if (safeBrowseRes.isPhishing) { flags.push('Listed in Google Safe Browsing as phishing/malware'); riskScore += 25; }

    if (nameservers.length === 0) { flags.push('No nameservers found -- domain may be parked or suspended'); riskScore += 10; }

    // Free hosting providers
    const ispLower = ((ipGeo as { isp?: string }).isp || '').toLowerCase();
    const freeHosters = ['cloudflare', 'hostinger', 'namecheap', 'godaddy'];
    if (freeHosters.some(h => ispLower.includes(h))) {
      flags.push(`Hosted on ${(ipGeo as { isp?: string }).isp} -- commonly used for disposable sites`);
      riskScore += 5;
    }

    riskScore = Math.min(100, Math.max(0, riskScore));

    // Count reports from our DB
    const scamReports = 0; // Will be enriched from Supabase on frontend

    const result = {
      domain: clean,
      registrar: typeof registrar === 'string' ? registrar : 'Unknown',
      registeredDate: registration ? new Date(registration).toISOString().split('T')[0] : 'Unknown',
      expiryDate: expiration ? new Date(expiration).toISOString().split('T')[0] : 'Unknown',
      lastChanged: lastChanged ? new Date(lastChanged).toISOString().split('T')[0] : '',
      domainAge,
      nameservers,
      registrantCountry: registrantCountry || 'Unknown',
      registrantOrg: hasPrivacy ? 'REDACTED FOR PRIVACY' : extractOrgFromWhois(whois),
      ssl: { issuer: 'Pending check', valid: true, grade: 'N/A', expiry: '' },
      hosting: {
        provider: (ipGeo as { isp?: string }).isp || 'Unknown',
        ip: hostingIp || 'Unknown',
        location: hostingCountry,
        asn: (ipGeo as { as?: string }).as || '',
      },
      riskScore,
      flags,
      scamReports,
      phishing: safeBrowseRes.isPhishing,
      whoisPrivacy: hasPrivacy,
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error('Domain OSINT error:', err);
    return res.status(500).json({ error: 'Failed to lookup domain' });
  }
}

// Helpers
function extractVcardName(vcardArray: unknown[]): string {
  try {
    if (Array.isArray(vcardArray) && vcardArray.length >= 2) {
      const props = vcardArray[1] as unknown[][];
      const fnProp = props.find(p => p[0] === 'fn');
      return fnProp ? String(fnProp[3]) : 'Unknown';
    }
  } catch { /* ignore */ }
  return 'Unknown';
}

function extractCountryFromWhois(whois: Record<string, unknown>): string {
  try {
    const entities = (whois as { entities?: { roles: string[]; vcardArray?: unknown[] }[] }).entities || [];
    const registrant = entities.find(e => e.roles?.includes('registrant'));
    if (registrant?.vcardArray && Array.isArray(registrant.vcardArray) && registrant.vcardArray.length >= 2) {
      const props = registrant.vcardArray[1] as unknown[][];
      const adrProp = props.find(p => p[0] === 'adr');
      if (adrProp) {
        const adrVal = adrProp[3];
        if (Array.isArray(adrVal)) return String(adrVal[adrVal.length - 1]) || 'Unknown';
      }
    }
  } catch { /* ignore */ }
  return 'Unknown';
}

function extractOrgFromWhois(whois: Record<string, unknown>): string {
  try {
    const entities = (whois as { entities?: { roles: string[]; vcardArray?: unknown[] }[] }).entities || [];
    const registrant = entities.find(e => e.roles?.includes('registrant'));
    if (registrant?.vcardArray && Array.isArray(registrant.vcardArray) && registrant.vcardArray.length >= 2) {
      const props = registrant.vcardArray[1] as unknown[][];
      const orgProp = props.find(p => p[0] === 'org');
      if (orgProp) return String(orgProp[3]);
    }
  } catch { /* ignore */ }
  return 'Unknown';
}

async function checkSafeBrowsing(domain: string): Promise<{ isPhishing: boolean }> {
  const key = process.env.GOOGLE_SAFE_BROWSING_KEY;
  if (!key) return { isPhishing: false };
  try {
    const res = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: { clientId: 'scamtrace', clientVersion: '1.0' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url: `http://${domain}` }, { url: `https://${domain}` }],
        },
      }),
    });
    const data = await res.json();
    return { isPhishing: !!(data as { matches?: unknown[] }).matches?.length };
  } catch {
    return { isPhishing: false };
  }
}
