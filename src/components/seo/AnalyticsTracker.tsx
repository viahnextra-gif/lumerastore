import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
  }
}

// Replace these IDs when you have them
const GTM_ID = ''; // e.g. 'GTM-XXXXXXX'
const GA4_ID = ''; // e.g. 'G-XXXXXXXXXX'
const META_PIXEL_ID = ''; // e.g. '123456789'

export function initAnalytics() {
  window.dataLayer = window.dataLayer || [];

  // GTM
  if (GTM_ID) {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    document.head.appendChild(s);
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  }

  // GA4
  if (GA4_ID) {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(s);
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID, { send_page_view: false });
  }

  // Meta Pixel
  if (META_PIXEL_ID) {
    const s = document.createElement('script');
    s.textContent = `
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
      (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init','${META_PIXEL_ID}');fbq('track','PageView');
    `;
    document.head.appendChild(s);
  }
}

// Track custom events — pushes to dataLayer, GA4, and Meta Pixel
export function trackEvent(eventName: string, params?: Record<string, any>) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });

  // GA4
  if (GA4_ID && window.gtag) {
    window.gtag('event', eventName, params);
  }

  // Meta Pixel standard events mapping
  if (META_PIXEL_ID && window.fbq) {
    const metaMap: Record<string, string> = {
      generate_lead: 'Lead',
      sign_up: 'CompleteRegistration',
      begin_checkout: 'InitiateCheckout',
      purchase: 'Purchase',
      add_to_cart: 'AddToCart',
      page_view: 'PageView',
    };
    const fbEvent = metaMap[eventName];
    if (fbEvent) window.fbq('track', fbEvent, params);
    else window.fbq('trackCustom', eventName, params);
  }
}

// Convenience helpers
export const trackLead = (source: string) => trackEvent('generate_lead', { source });
export const trackSignUp = (method: string) => trackEvent('sign_up', { method });
export const trackWhatsAppClick = (source: string) => trackEvent('whatsapp_click', { source, outbound: true });
export const trackAddToCart = (productId: string, price: number) => trackEvent('add_to_cart', { product_id: productId, value: price, currency: 'BRL' });
export const trackCheckout = (value: number) => trackEvent('begin_checkout', { value, currency: 'BRL' });
export const trackPurchase = (orderId: string, value: number) => trackEvent('purchase', { transaction_id: orderId, value, currency: 'BRL' });

// Pageview tracker component
export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackEvent('page_view', {
      page_path: location.pathname,
      page_search: location.search,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);

  return null;
}
