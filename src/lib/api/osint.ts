// Real OSINT API Service
// Domain WHOIS/RDAP and Phone Number Lookups

export interface DomainData {
  domain: string;
  registrar: string | null;
  registrarUrl: string | null;
  creationDate: string | null;
  expirationDate: string | null;
  updatedDate: string | null;
  status: string[];
  nameServers: string[];
  dnssec: boolean;
  registrantCountry: string | null;
  registrantOrg: string | null;
  ageInDays: number;
  riskScore: number;
  riskFactors: string[];
  ipAddress: string | null;
  hostingProvider: string | null;
  sslIssuer: string | null;
  sslValidFrom: string | null;
  sslValidTo: string | null;
}

export interface PhoneData {
  number: string;
  valid: boolean;
  countryCode: string;
  countryName: string;
  location: string | null;
  carrier: string | null;
  lineType: 'mobile' | 'landline' | 'voip' | 'unknown';
  riskScore: number;
  riskFactors: string[];
}

// RDAP servers for different TLDs
const RDAP_SERVERS: Record<string, string> = {
  'com': 'https://rdap.verisign.com/com/v1',
  'net': 'https://rdap.verisign.com/net/v1',
  'org': 'https://rdap.publicinterestregistry.org/rdap/org/v1',
  'io': 'https://rdap.nic.io',
  'co': 'https://rdap.nic.co',
  'app': 'https://rdap.nic.google',
  'dev': 'https://rdap.nic.google',
};

function extractTLD(domain: string): string {
  const parts = domain.toLowerCase().split('.');
  return parts[parts.length - 1];
}

function calculateDomainRisk(data: {
  ageInDays: number;
  hasPrivacyProtection: boolean;
  isNewRegistrar: boolean;
  hasSuspiciousNameservers: boolean;
  isVoipPhone?: boolean;
}): { score: number; factors: string[] } {
  let score = 15;
  const factors: string[] = [];

  // Very new domain (< 30 days)
  if (data.ageInDays < 30) {
    score += 40;
    factors.push('Domain registered less than 30 days ago');
  } else if (data.ageInDays < 90) {
    score += 25;
    factors.push('Domain less than 90 days old');
  } else if (data.ageInDays < 365) {
    score += 10;
    factors.push('Domain less than 1 year old');
  }

  // Privacy protection (common for scams)
  if (data.hasPrivacyProtection) {
    score += 15;
    factors.push('WHOIS privacy protection enabled');
  }

  // New registrar
  if (data.isNewRegistrar) {
    score += 10;
    factors.push('Recently changed registrar');
  }

  // Suspicious nameservers
  if (data.hasSuspiciousNameservers) {
    score += 20;
    factors.push('Suspicious nameserver configuration');
  }

  if (factors.length === 0) {
    factors.push('Standard domain configuration');
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    factors
  };
}

export async function lookupDomain(domain: string): Promise<DomainData> {
  // Clean the domain
  const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  const tld = extractTLD(cleanDomain);

  try {
    // Try RDAP first (modern, JSON-based WHOIS)
    const rdapServer = RDAP_SERVERS[tld] || 'https://rdap.org';
    
    const response = await fetch(`${rdapServer}/domain/${cleanDomain}`, {
      headers: {
        'Accept': 'application/rdap+json, application/json'
      }
    });

    if (!response.ok) {
      // Fallback to a public WHOIS API
      return await fallbackWhoisLookup(cleanDomain);
    }

    const data = await response.json();

    // Parse RDAP response
    const events = data.events || [];
    const creationEvent = events.find((e: { eventAction: string }) => e.eventAction === 'registration');
    const expirationEvent = events.find((e: { eventAction: string }) => e.eventAction === 'expiration');
    const updateEvent = events.find((e: { eventAction: string }) => e.eventAction === 'last changed');

    const creationDate = creationEvent?.eventDate || null;
    const expirationDate = expirationEvent?.eventDate || null;
    const updatedDate = updateEvent?.eventDate || null;

    // Calculate age
    const ageInDays = creationDate
      ? Math.floor((Date.now() - new Date(creationDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Get nameservers
    const nameServers = data.nameservers?.map((ns: { ldhName: string }) => ns.ldhName) || [];

    // Get registrar
    const registrarEntity = data.entities?.find((e: { roles: string[] }) => e.roles?.includes('registrar'));
    const registrar = registrarEntity?.vcardArray?.[1]?.find((v: string[]) => v[0] === 'fn')?.[3] || 
                     registrarEntity?.publicIds?.[0]?.identifier || null;

    // Get registrant info (often hidden due to privacy)
    const registrantEntity = data.entities?.find((e: { roles: string[] }) => e.roles?.includes('registrant'));
    const registrantOrg = registrantEntity?.vcardArray?.[1]?.find((v: string[]) => v[0] === 'org')?.[3] || null;
    const registrantCountry = registrantEntity?.vcardArray?.[1]?.find((v: string[]) => v[0] === 'adr')?.[3]?.country || null;

    // Status
    const status = data.status || [];
    
    // DNSSEC
    const dnssec = data.secureDNS?.delegationSigned || false;

    // Check for privacy protection
    const hasPrivacyProtection = !registrantOrg || 
      registrantOrg.toLowerCase().includes('privacy') ||
      registrantOrg.toLowerCase().includes('redacted') ||
      registrantOrg.toLowerCase().includes('protected');

    // Calculate risk
    const riskResult = calculateDomainRisk({
      ageInDays,
      hasPrivacyProtection,
      isNewRegistrar: false,
      hasSuspiciousNameservers: nameServers.some((ns: string) => 
        ns.includes('park') || ns.includes('sedopark') || ns.includes('bodis')
      )
    });

    // Try to get IP and hosting info
    let ipAddress: string | null = null;
    let hostingProvider: string | null = null;

    try {
      const dnsResponse = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=A`);
      const dnsData = await dnsResponse.json();
      ipAddress = dnsData.Answer?.[0]?.data || null;
    } catch {
      // DNS lookup failed, continue without IP
    }

    return {
      domain: cleanDomain,
      registrar,
      registrarUrl: registrarEntity?.links?.[0]?.href || null,
      creationDate,
      expirationDate,
      updatedDate,
      status,
      nameServers,
      dnssec,
      registrantCountry,
      registrantOrg: hasPrivacyProtection ? 'Privacy Protected' : registrantOrg,
      ageInDays,
      riskScore: riskResult.score,
      riskFactors: riskResult.factors,
      ipAddress,
      hostingProvider,
      sslIssuer: null,
      sslValidFrom: null,
      sslValidTo: null
    };
  } catch (error) {
    console.error('Domain lookup error:', error);
    return await fallbackWhoisLookup(cleanDomain);
  }
}

async function fallbackWhoisLookup(domain: string): Promise<DomainData> {
  // Use a fallback WHOIS API
  try {
    const response = await fetch(`https://whois.freeaiapi.xyz/?name=${domain}`);
    
    if (!response.ok) {
      throw new Error('WHOIS lookup failed');
    }

    const data = await response.json();

    const creationDate = data.creation_date || data.created || null;
    const ageInDays = creationDate
      ? Math.floor((Date.now() - new Date(creationDate).getTime()) / (1000 * 60 * 60 * 24))
      : 365; // Default to 1 year if unknown

    const riskResult = calculateDomainRisk({
      ageInDays,
      hasPrivacyProtection: !data.registrant_name || data.registrant_name.includes('Privacy'),
      isNewRegistrar: false,
      hasSuspiciousNameservers: false
    });

    return {
      domain,
      registrar: data.registrar || null,
      registrarUrl: data.registrar_url || null,
      creationDate,
      expirationDate: data.expiration_date || data.expires || null,
      updatedDate: data.updated_date || null,
      status: data.status ? [data.status] : [],
      nameServers: data.name_servers || [],
      dnssec: data.dnssec === 'signed',
      registrantCountry: data.registrant_country || null,
      registrantOrg: data.registrant_org || data.registrant_name || null,
      ageInDays,
      riskScore: riskResult.score,
      riskFactors: riskResult.factors,
      ipAddress: null,
      hostingProvider: null,
      sslIssuer: null,
      sslValidFrom: null,
      sslValidTo: null
    };
  } catch {
    // Return minimal data with high risk score
    return {
      domain,
      registrar: null,
      registrarUrl: null,
      creationDate: null,
      expirationDate: null,
      updatedDate: null,
      status: [],
      nameServers: [],
      dnssec: false,
      registrantCountry: null,
      registrantOrg: null,
      ageInDays: 0,
      riskScore: 50,
      riskFactors: ['Unable to retrieve complete WHOIS data'],
      ipAddress: null,
      hostingProvider: null,
      sslIssuer: null,
      sslValidFrom: null,
      sslValidTo: null
    };
  }
}

export async function lookupPhoneNumber(phone: string): Promise<PhoneData> {
  // Clean the phone number
  const cleanPhone = phone.replace(/[^0-9+]/g, '');

  try {
    // Use a public phone validation API
    // Note: NumVerify requires API key, using fallback analysis
    
    // Parse the phone number to extract country code
    let countryCode = '';
    let countryName = 'Unknown';
    let location: string | null = null;

    if (cleanPhone.startsWith('+1') || cleanPhone.startsWith('1')) {
      countryCode = '1';
      countryName = 'United States/Canada';
      // Area code analysis for US/Canada
      const areaCode = cleanPhone.replace(/^\+?1/, '').substring(0, 3);
      location = getUSAreaCodeLocation(areaCode);
    } else if (cleanPhone.startsWith('+44') || cleanPhone.startsWith('44')) {
      countryCode = '44';
      countryName = 'United Kingdom';
    } else if (cleanPhone.startsWith('+91') || cleanPhone.startsWith('91')) {
      countryCode = '91';
      countryName = 'India';
    } else if (cleanPhone.startsWith('+86') || cleanPhone.startsWith('86')) {
      countryCode = '86';
      countryName = 'China';
    } else if (cleanPhone.startsWith('+234') || cleanPhone.startsWith('234')) {
      countryCode = '234';
      countryName = 'Nigeria';
    }

    // Determine line type heuristically
    let lineType: 'mobile' | 'landline' | 'voip' | 'unknown' = 'unknown';
    
    // Check for known VoIP prefixes
    const voipPrefixes = ['800', '888', '877', '866', '855', '844', '833', '822'];
    const mobilePatterns = ['2', '3', '4', '5', '6', '7', '8', '9'];
    
    if (countryCode === '1') {
      const prefix = cleanPhone.replace(/^\+?1/, '').substring(0, 3);
      if (voipPrefixes.includes(prefix)) {
        lineType = 'voip';
      } else {
        lineType = 'mobile'; // Most US numbers are mobile now
      }
    }

    // Calculate risk score
    let riskScore = 20;
    const riskFactors: string[] = [];

    if (lineType === 'voip') {
      riskScore += 30;
      riskFactors.push('VoIP/Toll-free number (commonly used by scammers)');
    }

    if (countryCode === '234') {
      riskScore += 25;
      riskFactors.push('Nigerian country code (high fraud region)');
    }

    if (!countryCode) {
      riskScore += 15;
      riskFactors.push('Unable to identify country of origin');
    }

    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      riskScore += 20;
      riskFactors.push('Invalid phone number length');
    }

    if (riskFactors.length === 0) {
      riskFactors.push('Standard phone number format');
    }

    return {
      number: cleanPhone,
      valid: cleanPhone.length >= 10 && cleanPhone.length <= 15,
      countryCode,
      countryName,
      location,
      carrier: null, // Would need paid API
      lineType,
      riskScore: Math.min(100, Math.max(0, riskScore)),
      riskFactors
    };
  } catch (error) {
    console.error('Phone lookup error:', error);
    return {
      number: cleanPhone,
      valid: false,
      countryCode: '',
      countryName: 'Unknown',
      location: null,
      carrier: null,
      lineType: 'unknown',
      riskScore: 50,
      riskFactors: ['Unable to validate phone number']
    };
  }
}

function getUSAreaCodeLocation(areaCode: string): string | null {
  const areaCodes: Record<string, string> = {
    '201': 'New Jersey', '202': 'Washington DC', '203': 'Connecticut',
    '205': 'Alabama', '206': 'Washington', '207': 'Maine',
    '208': 'Idaho', '209': 'California', '210': 'Texas',
    '212': 'New York', '213': 'California', '214': 'Texas',
    '215': 'Pennsylvania', '216': 'Ohio', '217': 'Illinois',
    '218': 'Minnesota', '219': 'Indiana', '224': 'Illinois',
    '225': 'Louisiana', '228': 'Mississippi', '229': 'Georgia',
    '231': 'Michigan', '234': 'Ohio', '239': 'Florida',
    '240': 'Maryland', '248': 'Michigan', '251': 'Alabama',
    '252': 'North Carolina', '253': 'Washington', '254': 'Texas',
    '256': 'Alabama', '260': 'Indiana', '262': 'Wisconsin',
    '267': 'Pennsylvania', '269': 'Michigan', '270': 'Kentucky',
    '276': 'Virginia', '281': 'Texas', '301': 'Maryland',
    '302': 'Delaware', '303': 'Colorado', '304': 'West Virginia',
    '305': 'Florida', '307': 'Wyoming', '308': 'Nebraska',
    '309': 'Illinois', '310': 'California', '312': 'Illinois',
    '313': 'Michigan', '314': 'Missouri', '315': 'New York',
    '316': 'Kansas', '317': 'Indiana', '318': 'Louisiana',
    '319': 'Iowa', '320': 'Minnesota', '321': 'Florida',
    '323': 'California', '325': 'Texas', '330': 'Ohio',
    '331': 'Illinois', '334': 'Alabama', '336': 'North Carolina',
    '337': 'Louisiana', '339': 'Massachusetts', '347': 'New York',
    '351': 'Massachusetts', '352': 'Florida', '360': 'Washington',
    '361': 'Texas', '386': 'Florida', '401': 'Rhode Island',
    '402': 'Nebraska', '404': 'Georgia', '405': 'Oklahoma',
    '406': 'Montana', '407': 'Florida', '408': 'California',
    '409': 'Texas', '410': 'Maryland', '412': 'Pennsylvania',
    '413': 'Massachusetts', '414': 'Wisconsin', '415': 'California',
    '417': 'Missouri', '419': 'Ohio', '423': 'Tennessee',
    '424': 'California', '425': 'Washington', '430': 'Texas',
    '432': 'Texas', '434': 'Virginia', '435': 'Utah',
    '440': 'Ohio', '442': 'California', '443': 'Maryland',
    '469': 'Texas', '470': 'Georgia', '475': 'Connecticut',
    '478': 'Georgia', '479': 'Arkansas', '480': 'Arizona',
    '484': 'Pennsylvania', '501': 'Arkansas', '502': 'Kentucky',
    '503': 'Oregon', '504': 'Louisiana', '505': 'New Mexico',
    '507': 'Minnesota', '508': 'Massachusetts', '509': 'Washington',
    '510': 'California', '512': 'Texas', '513': 'Ohio',
    '515': 'Iowa', '516': 'New York', '517': 'Michigan',
    '518': 'New York', '520': 'Arizona', '530': 'California',
    '540': 'Virginia', '541': 'Oregon', '551': 'New Jersey',
    '559': 'California', '561': 'Florida', '562': 'California',
    '563': 'Iowa', '567': 'Ohio', '570': 'Pennsylvania',
    '571': 'Virginia', '573': 'Missouri', '574': 'Indiana',
    '575': 'New Mexico', '580': 'Oklahoma', '585': 'New York',
    '586': 'Michigan', '601': 'Mississippi', '602': 'Arizona',
    '603': 'New Hampshire', '605': 'South Dakota', '606': 'Kentucky',
    '607': 'New York', '608': 'Wisconsin', '609': 'New Jersey',
    '610': 'Pennsylvania', '612': 'Minnesota', '614': 'Ohio',
    '615': 'Tennessee', '616': 'Michigan', '617': 'Massachusetts',
    '618': 'Illinois', '619': 'California', '620': 'Kansas',
    '623': 'Arizona', '626': 'California', '630': 'Illinois',
    '631': 'New York', '636': 'Missouri', '641': 'Iowa',
    '646': 'New York', '650': 'California', '651': 'Minnesota',
    '657': 'California', '660': 'Missouri', '661': 'California',
    '662': 'Mississippi', '678': 'Georgia', '681': 'West Virginia',
    '682': 'Texas', '701': 'North Dakota', '702': 'Nevada',
    '703': 'Virginia', '704': 'North Carolina', '706': 'Georgia',
    '707': 'California', '708': 'Illinois', '712': 'Iowa',
    '713': 'Texas', '714': 'California', '715': 'Wisconsin',
    '716': 'New York', '717': 'Pennsylvania', '718': 'New York',
    '719': 'Colorado', '720': 'Colorado', '724': 'Pennsylvania',
    '725': 'Nevada', '727': 'Florida', '731': 'Tennessee',
    '732': 'New Jersey', '734': 'Michigan', '737': 'Texas',
    '740': 'Ohio', '747': 'California', '754': 'Florida',
    '757': 'Virginia', '760': 'California', '762': 'Georgia',
    '763': 'Minnesota', '765': 'Indiana', '769': 'Mississippi',
    '770': 'Georgia', '772': 'Florida', '773': 'Illinois',
    '774': 'Massachusetts', '775': 'Nevada', '779': 'Illinois',
    '781': 'Massachusetts', '785': 'Kansas', '786': 'Florida',
    '801': 'Utah', '802': 'Vermont', '803': 'South Carolina',
    '804': 'Virginia', '805': 'California', '806': 'Texas',
    '808': 'Hawaii', '810': 'Michigan', '812': 'Indiana',
    '813': 'Florida', '814': 'Pennsylvania', '815': 'Illinois',
    '816': 'Missouri', '817': 'Texas', '818': 'California',
    '828': 'North Carolina', '830': 'Texas', '831': 'California',
    '832': 'Texas', '843': 'South Carolina', '845': 'New York',
    '847': 'Illinois', '848': 'New Jersey', '850': 'Florida',
    '856': 'New Jersey', '857': 'Massachusetts', '858': 'California',
    '859': 'Kentucky', '860': 'Connecticut', '862': 'New Jersey',
    '863': 'Florida', '864': 'South Carolina', '865': 'Tennessee',
    '870': 'Arkansas', '872': 'Illinois', '878': 'Pennsylvania',
    '901': 'Tennessee', '903': 'Texas', '904': 'Florida',
    '906': 'Michigan', '907': 'Alaska', '908': 'New Jersey',
    '909': 'California', '910': 'North Carolina', '912': 'Georgia',
    '913': 'Kansas', '914': 'New York', '915': 'Texas',
    '916': 'California', '917': 'New York', '918': 'Oklahoma',
    '919': 'North Carolina', '920': 'Wisconsin', '925': 'California',
    '928': 'Arizona', '931': 'Tennessee', '936': 'Texas',
    '937': 'Ohio', '940': 'Texas', '941': 'Florida',
    '947': 'Michigan', '949': 'California', '951': 'California',
    '952': 'Minnesota', '954': 'Florida', '956': 'Texas',
    '970': 'Colorado', '971': 'Oregon', '972': 'Texas',
    '973': 'New Jersey', '978': 'Massachusetts', '979': 'Texas',
    '980': 'North Carolina', '985': 'Louisiana', '989': 'Michigan',
  };

  return areaCodes[areaCode] || null;
}
