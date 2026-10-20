'use client';

/**
 * GoogleAnalytics — GA4 client component for Next.js App Router
 *
 * Responsibilities:
 * 1. Loads the gtag.js script once (strategy="afterInteractive")
 * 2. Initialises GA4 with send_page_view: false to prevent a duplicate
 *    page_view on the first render (we fire it manually in the effect)
 * 3. Sends a page_view event on every client-side navigation by watching
 *    usePathname() + useSearchParams()
 *
 * Must be wrapped in <Suspense> by the caller because useSearchParams()
 * opts the subtree out of static rendering (Next.js 15 requirement).
 */

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag: (...args: any[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer: any[];
  }
}

interface GoogleAnalyticsProps {
  gaId: string;
}

export default function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;

    const url =
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

    window.gtag('event', 'page_view', {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return (
    <>
      {/* Load the gtag.js library — deferred until after page is interactive */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />

      {/*
       * Initialise dataLayer and configure the GA4 property.
       * send_page_view: false → we send page_view manually in the effect above
       * so that SPA navigations are tracked without duplicating the first hit.
       */}
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { send_page_view: false });`}
      </Script>
    </>
  );
}
