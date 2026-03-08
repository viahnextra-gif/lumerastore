import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// GTM/GA4 initialization - replace IDs when available
const GTM_ID = ''; // e.g. 'GTM-XXXXXXX'
const GA4_ID = ''; // e.g. 'G-XXXXXXXXXX'

export function initAnalytics() {
  if (!GTM_ID && !GA4_ID) return;

  window.dataLayer = window.dataLayer || [];

  if (GTM_ID) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    document.head.appendChild(script);
  }

  if (GA4_ID) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(script);
    window.dataLayer.push(['js', new Date()]);
    window.dataLayer.push(['config', GA4_ID]);
  }
}

// Track custom events
export function trackEvent(eventName: string, params?: Record<string, any>) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });
}

// Pageview tracker component
export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackEvent('page_view', {
      page_path: location.pathname,
      page_search: location.search,
    });
  }, [location.pathname, location.search]);

  return null;
}
