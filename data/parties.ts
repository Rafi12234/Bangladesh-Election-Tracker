// All registered political parties of Bangladesh
// Includes alliance assignments and independent candidate support

import { Party } from '@/types';

export const parties: Party[] = [
  // BNP Alliance (2026)
  {
    id: 'bnp',
    name: 'Bangladesh Nationalist Party (BNP)',
    shortName: 'BNP',
    color: '#EF4444',
    symbol: '🌾',
    order: 1,
    allianceId: 'bnp',
    isIndependent: false,
  },
  {
    id: 'nagorik-oikko',
    name: 'Nagorik Oikko',
    shortName: 'NO',
    color: '#4169E1',
    symbol: '🔷',
    order: 2,
    allianceId: 'bnp',
    isIndependent: false,
  },
  {
    id: 'gonoodhikar',
    name: 'Gonoodhikar Porishad',
    shortName: 'GDP',
    color: '#BC8F8F',
    symbol: '🔰',
    order: 3,
    allianceId: 'bnp',
    isIndependent: false,
  },
  {
    id: 'bd-biplobe-workers',
    name: 'Bangladesh Biplobe Workers Party',
    shortName: 'BBWP',
    color: '#DC143C',
    symbol: '⚒️',
    order: 4,
    allianceId: 'bnp',
    isIndependent: false,
  },
  {
    id: 'jamiyate-ulamaye',
    name: 'Jamiyate Ulamaye Islam Bangladesh',
    shortName: 'JUIB',
    color: '#D2B48C',
    symbol: '📖',
    order: 5,
    allianceId: 'bnp',
    isIndependent: false,
  },
  {
    id: 'ganosamhati',
    name: 'Ganosamhati Andolon',
    shortName: 'GSA',
    color: '#DEB887',
    symbol: '✌️',
    order: 6,
    allianceId: 'bnp',
    isIndependent: false,
  },
  {
    id: 'bd-jatiya-party-bjp',
    name: 'Bangladesh Jatiya Party-BJP',
    shortName: 'BJP',
    color: '#FF6347',
    symbol: '🪷',
    order: 7,
    allianceId: 'bnp',
    isIndependent: false,
  },
  {
    id: 'npp',
    name: "National People's Party",
    shortName: 'NPP',
    color: '#6B8E23',
    symbol: '🌾',
    order: 8,
    allianceId: 'bnp',
    isIndependent: false,
  },
  {
    id: 'ndm',
    name: 'National Democratic Movement (NDM)',
    shortName: 'NDM',
    color: '#9ACD32',
    symbol: '🚩',
    order: 9,
    allianceId: 'bnp',
    isIndependent: false,
  },

  // Jamaat-e-Islami NCP Alliance (2026)
  {
    id: 'jamaat',
    name: 'Bangladesh Jamaat-e-Islami',
    shortName: 'JI',
    color: '#22C55E',
    symbol: '⚖️',
    order: 10,
    allianceId: 'jamaat',
    isIndependent: false,
  },
  {
    id: 'jatiyo-nagarik',
    name: 'Jatiyo Nagarik Party (NCP)',
    shortName: 'NCP',
    color: '#EEE8AA',
    symbol: '🌐',
    order: 11,
    allianceId: 'jamaat',
    isIndependent: false,
  },
  {
    id: 'bd-khalafat-majlish',
    name: 'Bangladesh Khalafat Majlish',
    shortName: 'BKM',
    color: '#32CD32',
    symbol: '📿',
    order: 12,
    allianceId: 'jamaat',
    isIndependent: false,
  },
  {
    id: 'khalafat-majlish',
    name: 'Khalafat Majlish',
    shortName: 'KM',
    color: '#6B8E23',
    symbol: '📿',
    order: 13,
    allianceId: 'jamaat',
    isIndependent: false,
  },
  {
    id: 'ldp',
    name: 'Liberal Democratic Party (LDP)',
    shortName: 'LDP',
    color: '#20B2AA',
    symbol: '📖',
    order: 14,
    allianceId: 'jamaat',
    isIndependent: false,
  },
  {
    id: 'bd-nejame',
    name: 'Bangladesh Nejame Party',
    shortName: 'BNP2',
    color: '#98FB98',
    symbol: '⭐',
    order: 15,
    allianceId: 'jamaat',
    isIndependent: false,
  },
  {
    id: 'ab-party',
    name: 'Amar Bangladesh Party (AB Party)',
    shortName: 'AB',
    color: '#7B68EE',
    symbol: '🇧🇩',
    order: 16,
    allianceId: 'jamaat',
    isIndependent: false,
  },
  {
    id: 'bd-development',
    name: 'Bangladesh Development Party',
    shortName: 'BDP',
    color: '#5F9EA0',
    symbol: '🏗️',
    order: 17,
    allianceId: 'jamaat',
    isIndependent: false,
  },
  {
    id: 'jatiyo-ganotantric',
    name: 'Jatiyo Ganotantric Party',
    shortName: 'JGP',
    color: '#F0E68C',
    symbol: '🏛️',
    order: 18,
    allianceId: 'jamaat',
    isIndependent: false,
  },
  {
    id: 'bd-labour',
    name: 'Bangladesh Labour Party',
    shortName: 'BLP',
    color: '#CD5C5C',
    symbol: '⚙️',
    order: 19,
    allianceId: 'jamaat',
    isIndependent: false,
  },

  // Other Major Parties (not in alliances)
  {
    id: 'gano-forum',
    name: 'Gano Forum',
    shortName: 'GF',
    color: '#9370DB',
    symbol: '🏠',
    order: 20,
    allianceId: null,
    isIndependent: false,
  },
  {
    id: 'islami-andolan',
    name: 'Islami Andolan Bangladesh',
    shortName: 'IAB',
    color: '#2F4F4F',
    symbol: '☪️',
    order: 21,
    allianceId: null,
    isIndependent: false,
  },
  {
    id: 'islamic-front',
    name: 'Bangladesh Islamic Front',
    shortName: 'BIF',
    color: '#556B2F',
    symbol: '🕌',
    order: 22,
    allianceId: null,
    isIndependent: false,
  },
  {
    id: 'jatiya-party',
    name: 'Jatiya Party',
    shortName: 'JP',
    color: '#FFD700',
    symbol: '🌻',
    order: 23,
    allianceId: null,
    isIndependent: false,
  },
  {
    id: 'jatiyo-party-jp',
    name: 'Jatiyo Party-JP',
    shortName: 'JP2',
    color: '#FFA500',
    symbol: '🌻',
    order: 24,
    allianceId: null,
    isIndependent: false,
  },
  {
    id: 'jsd',
    name: 'Jatiya Samajtantrik Dal (JSD)',
    shortName: 'JSD',
    color: '#8B0000',
    symbol: '✊',
    order: 25,
    allianceId: null,
    isIndependent: false,
  },

  // All Other Registered Parties
  {
    id: 'amjanatar-dol',
    name: 'Amjanatar Dol',
    shortName: 'AD',
    color: '#8A2BE2',
    symbol: '🔶',
    order: 31,
    allianceId: null,
    isIndependent: false,
  },
  {
    id: 'bd-communist',
    name: 'Bangladesh Communist Party',
    shortName: 'BCP',
    color: '#B22222',
    symbol: '☭',
    order: 33,
    allianceId: null,
    isIndependent: false,
  },
  {
    id: 'bd-congress',
    name: 'Bangladesh Congress',
    shortName: 'BC',
    color: '#4682B4',
    symbol: '🏛️',
    order: 34,
    allianceId: null,
    isIndependent: false,
  },

  {
    id: 'bd-equal-rights',
    name: 'Bangladesh Equal Rights Party',
    shortName: 'BERP',
    color: '#48D1CC',
    symbol: '⚖️',
    order: 36,
    allianceId: null,
    isIndependent: false,
  },

  {
    id: 'bd-jatiya-party',
    name: 'Bangladesh Jatiya Party',
    shortName: 'BJP2',
    color: '#FFA07A',
    symbol: '🔺',
    order: 38,
    allianceId: null,
    isIndependent: false,
  },
  {
    id: 'bd-kalyan',
    name: 'Bangladesh Kalyan Party',
    shortName: 'BKP',
    color: '#87CEEB',
    symbol: '🕊️',
    order: 39,
    allianceId: null,
    isIndependent: false,
  },
  {
    id: 'bd-khalafat-andolon',
    name: 'Bangladesh Khalafat Andolon',
    shortName: 'BKA',
    color: '#228B22',
    symbol: '🌙',
    order: 40,
    allianceId: null,
    isIndependent: false,
  },

  {
    id: 'bd-minority-janata',
    name: 'Bangladesh Minority Janata Party (BJMP)',
    shortName: 'BJMP',
    color: '#DDA0DD',
    symbol: '🤝',
    order: 43,
    allianceId: null,
    isIndependent: false,
  },
  {
    id: 'bd-muslim-league',
    name: 'Bangladesh Muslim League',
    shortName: 'BML',
    color: '#3CB371',
    symbol: '🌟',
    order: 44,
    allianceId: null,
    isIndependent: false,
  },
  {
    id: 'bd-nap',
    name: 'Bangladesh National Awami Party (Bangladesh NAP)',
    shortName: 'NAP',
    color: '#FA8072',
    symbol: '🚩',
    order: 45,
    allianceId: null,
    isIndependent: false,
  },
  {
    id: 'bd-jasad',
    name: 'Bangladesh National Socialist Party - Bangladesh Jasad',
    shortName: 'Jasad',
    color: '#E9967A',
    symbol: '✊',
    order: 46,
    allianceId: null,
    isIndependent: false,
  },
  {
    id: 'bd-nationalist-front',
    name: 'Bangladesh Nationalist Front',
    shortName: 'BNF',
    color: '#F08080',
    symbol: '🛡️',
    order: 47,
    allianceId: null,
    isIndependent: false,
  },

  {
    id: 'bd-republican',
    name: 'Bangladesh Republican Party',
    shortName: 'BRP',
    color: '#AFEEEE',
    symbol: '🗽',
    order: 49,
    allianceId: null,
    isIndependent: false,
  },
  {
    id: 'bd-samajtantrik-dal',
    name: 'Bangladesh Samajtantrik Dal',
    shortName: 'BSD',
    color: '#DB7093',
    symbol: '🔴',
    order: 50,
    allianceId: null,
    isIndependent: false,
  },
  {
    id: 'bd-samajtantrik-dol',
    name: 'Bangladesh Samajtantrik Dol (Marksbadi)',
    shortName: 'BSDM',
    color: '#FF69B4',
    symbol: '⭐',
    order: 51,
    allianceId: null,
    isIndependent: false,
  },
  {
    id: 'bd-supreme-party',
    name: 'Bangladesh Supreme Party (BSP)',
    shortName: 'BSP',
    color: '#FFB6C1',
    symbol: '👑',
    order: 52,
    allianceId: null,
    isIndependent: false,
  },
  {
    id: 'gano-front',
    name: 'Gano Front',
    shortName: 'GFr',
    color: '#FFC0CB',
    symbol: '🚀',
    order: 53,
    allianceId: null,
    isIndependent: false,
  },

  {
    id: 'gonotantri',
    name: 'Gonotantri Party',
    shortName: 'GP',
    color: '#D2691E',
    symbol: '🎯',
    order: 55,
    allianceId: null,
    isIndependent: false,
  },

  {
    id: 'insaniat-biplab',
    name: 'Insaniat Biplab Bangladesh',
    shortName: 'IBB',
    color: '#F4A460',
    symbol: '💫',
    order: 57,
    allianceId: null,
    isIndependent: false,
  },
  {
    id: 'islamic-front-bd',
    name: 'Islamic Front Bangladesh',
    shortName: 'IFB',
    color: '#DAA520',
    symbol: '☪️',
    order: 58,
    allianceId: null,
    isIndependent: false,
  },
  {
    id: 'islami-oikya-jote',
    name: 'Islami Oikya Jote',
    shortName: 'IOJ',
    color: '#B8860B',
    symbol: '🌙',
    order: 59,
    allianceId: null,
    isIndependent: false,
  },
  {
    id: 'jaker-party',
    name: 'Jaker Party',
    shortName: 'JkP',
    color: '#CD853F',
    symbol: '⚡',
    order: 60,
    allianceId: null,
    isIndependent: false,
  },

  {
    id: 'jonotar-dol',
    name: 'Jonotar Dol',
    shortName: 'JD',
    color: '#BDB76B',
    symbol: '🎪',
    order: 64,
    allianceId: null,
    isIndependent: false,
  },


  // Independent Candidate
  {
    id: 'independent',
    name: 'Independent Candidate',
    shortName: 'IND',
    color: '#6B7280',
    symbol: '👤',
    order: 99,
    allianceId: null,
    isIndependent: true,
  },
];

// Alliance definitions
export const alliances = {
  bnp: {
    id: 'bnp',
    name: 'BNP Alliance',
    shortName: 'BNP',
    color: '#EF4444',
    symbol: '🤝',
  },
  jamaat: {
    id: 'jamaat',
    name: 'Jamaat-e-Islami NCP Alliance',
    shortName: 'Jamaat-NCP',
    color: '#22C55E',
    symbol: '🤝',
  },
  others: {
    id: 'others',
    name: 'Others & Independents',
    shortName: 'Others',
    color: '#FBBF24',
    symbol: '❓',
  },
} as const;

// Get party by ID
export function getPartyById(partyId: string): Party | undefined {
  return parties.find(p => p.id === partyId);
}

// Get party by full name (e.g., "Bangladesh Nationalist Party (BNP)")
export function getPartyByName(name: string): Party | undefined {
  if (!name) return undefined;
  const lower = name.trim().toLowerCase();
  return parties.find(p => p.name.toLowerCase() === lower);
}

/**
 * Normalize a party key that might be either a party ID ('bnp') or
 * a full party name ('Bangladesh Nationalist Party (BNP)') to a party ID.
 * Returns the key as-is if no match is found.
 */
export function normalizePartyKey(key: string): string {
  if (!key) return key;
  
  const normalized = key.trim();
  
  // Already a valid party ID?
  if (getPartyById(normalized)) return normalized;
  
  // Try matching by full name (exact match)
  const byName = getPartyByName(normalized);
  if (byName) return byName.id;
  
  // Try matching by short name (e.g., "BNP")
  const byShortName = parties.find(p => 
    p.shortName.toLowerCase() === normalized.toLowerCase()
  );
  if (byShortName) return byShortName.id;
  
  // Try fuzzy matching by checking if the key contains party identifiers
  const lowerKey = normalized.toLowerCase();
  
  // Check for common party name variations
  if (lowerKey.includes('bnp') || lowerKey.includes('jatiotabadi') || lowerKey.includes('nationalist')) {
    const bnp = parties.find(p => p.id === 'bnp');
    if (bnp) return bnp.id;
  }
  
  if (lowerKey.includes('jamaat') || lowerKey.includes('islami')) {
    const jamaat = parties.find(p => p.id === 'jamaat');
    if (jamaat) return jamaat.id;
  }
  
  if (lowerKey.includes('awami') || lowerKey.includes('league')) {
    const al = parties.find(p => p.id === 'al');
    if (al) return al.id;
  }
  
  if (lowerKey.includes('jatiya') || lowerKey.includes('ershad')) {
    const jp = parties.find(p => p.id === 'jp-ershad');
    if (jp) return jp.id;
  }
  
  // Try matching any party where the key contains the shortName
  for (const party of parties) {
    if (lowerKey.includes(party.shortName.toLowerCase())) {
      return party.id;
    }
  }
  
  // Return as-is (could be an independent/unknown)
  return normalized;
}

// Get party color with fallback
export function getPartyColor(partyId: string): string {
  return getPartyById(partyId)?.color || '#6B7280';
}

// Get parties by alliance
export function getPartiesByAlliance(allianceId: string | null): Party[] {
  if (allianceId === null) {
    return parties.filter(p => p.allianceId === null && !p.isIndependent);
  }
  return parties.filter(p => p.allianceId === allianceId);
}

// Get all parties for dropdown (excluding independent)
export function getAllSelectableParties(): Party[] {
  return parties.filter(p => !p.isIndependent).sort((a, b) => a.order - b.order);
}

// Get independent candidate option
export function getIndependentOption(): Party | undefined {
  return parties.find(p => p.isIndependent);
}

// Party ID to display name map for quick lookup
export const partyNames: Record<string, string> = parties.reduce(
  (acc, party) => ({ ...acc, [party.id]: party.shortName }),
  {}
);
