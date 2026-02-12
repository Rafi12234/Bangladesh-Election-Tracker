// Input validation and sanitization utilities
// SECURITY: Prevents XSS, injection, and invalid data

/**
 * Sanitize a string by removing HTML tags and dangerous characters.
 * Used for all user-facing text inputs (candidate names, news content, etc.)
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')          // Strip HTML tags
    .replace(/[<>"'&]/g, (ch) => {   // Escape remaining special chars
      const map: Record<string, string> = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' };
      return map[ch] || ch;
    })
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate vote count: must be a non-negative integer within a sane range.
 */
export function validateVoteCount(value: unknown): number {
  const num = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  if (!Number.isFinite(num) || num < 0 || num > 10_000_000) return 0;
  return Math.floor(num);
}

/**
 * Validate constituency ID format.
 * Must be lowercase alphanumeric with hyphens, apostrophes, and spaces.
 */
export function isValidConstituencyId(id: string): boolean {
  if (typeof id !== 'string' || id.length === 0 || id.length > 100) return false;
  return /^[a-z0-9][a-z0-9'\s-]*[a-z0-9]$/.test(id);
}

/**
 * Validate party ID format (lowercase alphanumeric with hyphens).
 */
export function isValidPartyId(id: string): boolean {
  if (typeof id !== 'string' || id.length === 0 || id.length > 50) return false;
  return /^[a-z][a-z0-9-]*$/.test(id);
}

/**
 * Validate election status value.
 */
export function isValidStatus(status: string): status is 'partial' | 'completed' {
  return status === 'partial' || status === 'completed';
}

/**
 * Sanitize news article content — strips script tags but allows basic formatting.
 */
export function sanitizeNewsContent(input: string, maxLength: number = 50_000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip script tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')                        // Strip event handlers
    .replace(/javascript:/gi, '')                                         // Strip javascript: URIs
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate email format.
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string' || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Rate limiter for client-side operations.
 * Returns true if the action is allowed, false if rate-limited.
 */
const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(key: string, maxRequests: number = 10, windowMs: number = 60_000): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(key) || [];
  
  // Remove expired timestamps
  const valid = timestamps.filter(t => now - t < windowMs);
  
  if (valid.length >= maxRequests) return false;
  
  valid.push(now);
  rateLimitMap.set(key, valid);
  return true;
}
