// Google Analytics utilities
// Provides helper functions for tracking events and page views

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

/**
 * Track a custom event in Google Analytics
 * @param eventName - Name of the event (e.g., 'button_click', 'constituency_view')
 * @param eventParams - Optional parameters for the event
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  try {
    window.gtag('event', eventName, eventParams);
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

/**
 * Track a page view in Google Analytics
 * Automatically called by Next.js router, but can be used manually if needed
 * @param url - The URL to track
 * @param title - Optional page title
 */
export function trackPageView(url: string, title?: string): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  if (!gaId) return;

  try {
    window.gtag('config', gaId, {
      page_path: url,
      page_title: title || document.title,
    });
  } catch (error) {
    console.error('Analytics page view error:', error);
  }
}

/**
 * Check if Google Analytics is loaded and ready
 */
export function isAnalyticsReady(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Track constituency interactions
 */
export function trackConstituencyView(constituencyId: string): void {
  trackEvent('constituency_view', {
    constituency_id: constituencyId,
  });
}

/**
 * Track search activity
 */
export function trackSearch(searchTerm: string, resultsCount: number): void {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
}

/**
 * Track news article views
 */
export function trackNewsView(articleId: string, articleTitle: string): void {
  trackEvent('news_view', {
    article_id: articleId,
    article_title: articleTitle,
  });
}

/**
 * Track map interactions
 */
export function trackMapInteraction(action: string, details?: string): void {
  trackEvent('map_interaction', {
    action,
    details: details || '',
  });
}
