// Constants used throughout the application

// Election configuration
export const ELECTION_CONFIG = {
  TOTAL_SEATS: 300,
  MAJORITY_SEATS: 151,
  ELECTION_NAME: 'Bangladesh Parliamentary Election 2026',
  ELECTION_DATE: '2026-01-XX', // Update with actual date
} as const;

// Election editorial header information
export const UPCOMING_ELECTION = {
  title: 'Bangladesh Parliamentary Election 2026',
  description: 'Follow live results and updates from the 12th National Parliamentary Election of Bangladesh as the nation votes to shape its democratic future.',
  dateLabel: 'January 7, 2026', // Update with actual date
  type: 'Parliamentary Election',
  country: 'Bangladesh',
  status: 'upcoming' as const, // Change to 'live' or 'completed' as needed
} as const;

// Party colors for consistent styling
export const PARTY_COLORS: Record<string, string> = {
  al: '#00A651',
  bnp: '#E4002B',
  'jp-ershad': '#FFD700',
  jamaat: '#006400',
  independent: '#6B7280',
  other: '#9CA3AF',
  pending: '#E5E7EB',
} as const;

// Result status labels
export const RESULT_STATUS = {
  pending: { label: 'Pending', color: 'bg-gray-200 text-gray-700' },
  partial: { label: 'Counting', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Declared', color: 'bg-green-100 text-green-800' },
} as const;

// Map configuration
export const MAP_CONFIG = {
  CENTER: [23.5, 90.3] as [number, number], // Bangladesh center
  ZOOM: 7,
  MIN_ZOOM: 5,
  MAX_ZOOM: 12,
  BOUNDS: [
    [20.0, 87.0], // Southwest - extended for full visibility
    [27.0, 93.5], // Northeast - extended for full visibility
  ] as [[number, number], [number, number]],
} as const;

// Firestore collection names
export const COLLECTIONS = {
  PARTIES: 'parties',
  CONSTITUENCIES: 'constituencies',
  CANDIDATES: 'candidates',
  RESULTS: 'results',
  SUMMARY: 'summary',
  ADMIN_USERS: 'adminUsers',
} as const;

// Cache keys for localStorage
export const CACHE_KEYS = {
  PARTIES: 'cache_parties',
  CONSTITUENCIES: 'cache_constituencies',
  GEOJSON: 'cache_geojson',
  SUMMARY: 'cache_summary',
} as const;

// Cache TTL in milliseconds
export const CACHE_TTL = {
  PARTIES: 24 * 60 * 60 * 1000, // 24 hours
  CONSTITUENCIES: 24 * 60 * 60 * 1000,
  GEOJSON: 7 * 24 * 60 * 60 * 1000, // 7 days
  SUMMARY: 30 * 1000, // 30 seconds
} as const;

// API rate limits
export const RATE_LIMITS = {
  MAX_REQUESTS_PER_MINUTE: 60,
  DEBOUNCE_MS: 300,
  THROTTLE_MS: 100,
} as const;

// Responsive breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Animation durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;
