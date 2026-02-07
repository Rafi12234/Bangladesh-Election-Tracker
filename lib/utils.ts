// Utility functions for formatting and calculations

/**
 * Format number with commas (e.g., 1,234,567)
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
}

/**
 * Format percentage with specified decimal places
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

/**
 * Calculate margin between winner and runner-up
 */
export function calculateMargin(votes: Record<string, number>): {
  margin: number;
  marginPercentage: number;
  winnerId: string | null;
  runnerUpId: string | null;
} {
  const sortedEntries = Object.entries(votes).sort(([, a], [, b]) => b - a);
  
  if (sortedEntries.length === 0) {
    return { margin: 0, marginPercentage: 0, winnerId: null, runnerUpId: null };
  }
  
  const winner = sortedEntries[0];
  const runnerUp = sortedEntries[1];
  const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0);
  
  const margin = runnerUp ? winner[1] - runnerUp[1] : winner[1];
  const marginPercentage = calculatePercentage(margin, totalVotes);
  
  return {
    margin,
    marginPercentage,
    winnerId: winner[0],
    runnerUpId: runnerUp ? runnerUp[0] : null,
  };
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for scroll/resize events
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Get relative time string (e.g., "2 minutes ago")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

/**
 * Generate color shade based on percentage
 */
export function getShadeColor(baseColor: string, percentage: number): string {
  // Convert hex to RGB
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust opacity based on percentage (0.3 to 1)
  const opacity = 0.3 + (percentage / 100) * 0.7;
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Classname utility (minimal cn function)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Sleep utility for testing
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Check if we're on client side
 */
export const isClient = typeof window !== 'undefined';

/**
 * Check if we're in development mode
 */
export const isDev = process.env.NODE_ENV === 'development';
