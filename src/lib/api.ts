// Centralized API client for all ScamTrace backend endpoints.
// In development, calls /api/* which are Vercel Serverless Functions.

const BASE = '/api';

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || 'Request failed');
  }
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || 'Request failed');
  }
  return res.json();
}

/* ------------------------------------------------------------------ */
/*  OSINT Investigation Tools                                          */
/* ------------------------------------------------------------------ */

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
  region: string;
  city: string;
  timezone: string;
  isVoip: boolean;
  isPrepaid: boolean;
  riskScore: number;
  scamReports: number;
  flags: string[];
  recentActivity: string[];
  linkedPlatforms: string[];
}

export interface IpResult {
  ip: string;
  country: string;
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
}

export function lookupDomain(domain: string) {
  return post<DomainResult>('/osint/domain', { domain });
}

export function lookupPhone(phone: string) {
  return post<PhoneResult>('/osint/phone', { phone });
}

export function lookupIp(ip: string) {
  return post<IpResult>('/osint/ip', { ip });
}

/* ------------------------------------------------------------------ */
/*  Blockchain Trace                                                    */
/* ------------------------------------------------------------------ */

export interface TraceNode {
  id: string;
  address: string;
  label: string;
  type: 'origin' | 'intermediate' | 'mixer' | 'bridge' | 'exchange' | 'unknown';
  amount: string;
  chain: string;
  risk: 'critical' | 'high' | 'medium' | 'low';
  x: number;
  y: number;
  timestamp: string;
}

export interface TraceEdge {
  from: string;
  to: string;
  amount: string;
  hash: string;
  chain: string;
  type: string;
  timestamp: string;
  flagged: boolean;
}

export interface TraceResult {
  chain: 'eth' | 'btc';
  nodes: TraceNode[];
  edges: TraceEdge[];
  summary: {
    totalTraced: string;
    usdValue: string;
    walletsFound: number;
    chainsInvolved: string[];
    riskScore: number;
    exchangeHits: string[];
    mixerHits: string[];
  };
}

export function traceAddress(address: string, maxHops = 3) {
  return post<TraceResult>('/blockchain/trace', { address, maxHops });
}

/* ------------------------------------------------------------------ */
/*  Scam Reports                                                        */
/* ------------------------------------------------------------------ */

export interface ScamReportPayload {
  scamType: string;
  url?: string;
  description: string;
  timeline?: string;
  lossAmount?: string;
  lossCurrency?: string;
  walletAddresses?: string;
  phoneNumbers?: string;
  emails?: string;
  usernames?: string;
  platform?: string;
  country?: string;
  userId?: string;
  caseId?: string;
}

export interface ScamReportResponse {
  report: Record<string, unknown>;
  caseId?: string;
  message: string;
}

export function submitScamReport(payload: ScamReportPayload) {
  return post<ScamReportResponse>('/reports/submit', payload as unknown as Record<string, unknown>);
}

/* ------------------------------------------------------------------ */
/*  Money Tracker / Report Stats                                        */
/* ------------------------------------------------------------------ */

export interface ReportStats {
  totalLoss: number;
  totalReports: number;
  averageLoss: number;
  topWallets: { address: string; loss: number; reports: number; chain: string }[];
  topDomains: { domain: string; loss: number; reports: number }[];
  byType: { type: string; loss: number; count: number }[];
  dailyLosses: { date: string; loss: number }[];
}

export function getReportStats() {
  return get<ReportStats>('/reports/stats');
}

/* ------------------------------------------------------------------ */
/*  No-Trace Browser                                                    */
/* ------------------------------------------------------------------ */

export interface BrowserAnalysis {
  url: string;
  domain: string;
  title: string;
  scripts: string[];
  links: string[];
  malwareDetected: boolean;
  riskScore: number;
  flags: string[];
  timestamp: string;
  scriptsFound: number;
  linksFound: number;
  htmlSize: number;
}

export function analyzePage(url: string) {
  return post<BrowserAnalysis>('/browser/analyze', { url });
}
