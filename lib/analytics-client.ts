/**
 * Client-side Analytics Tracking
 * Fast, non-blocking analytics event tracking
 */

export async function trackAnalyticsEvent(
  cardId: string,
  eventType: 'view' | 'link_click' | 'qr_scan' | 'share',
  metadata?: Record<string, any>
) {
  try {
    // Fire and forget - don't block UI
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardId,
        eventType,
        metadata: {
          ...metadata,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
      }),
      // Use keepalive for better reliability
      keepalive: true,
    }).catch((error) => {
      // Silently fail - analytics shouldn't break the app
      console.warn('Analytics tracking failed:', error);
    });
  } catch (error) {
    console.warn('Analytics tracking error:', error);
  }
}
