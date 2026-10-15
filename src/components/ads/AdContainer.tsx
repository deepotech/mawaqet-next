'use client';

import Script from 'next/script';

interface AdContainerProps {
  /** AdSense slot ID — must be provided per placement */
  slotId: string;
  /** One of the four defined placements */
  placement: 'header_ads' | 'after_pt_ads' | 'after_cities_ads' | 'footer_ads';
  /** Optional additional className for the wrapper */
  className?: string;
}

/**
 * AdContainer — lazy-hydrated AdSense wrapper.
 *
 * - Reads the publisher ID from the NEXT_PUBLIC_ADSENSE_CLIENT_ID env var.
 * - Only renders the ad unit when the var is set (safe for dev/staging).
 * - AdSense script is loaded with strategy="afterInteractive" to avoid
 *   blocking LCP / INP.
 * - Must be a Client Component because the adsbygoogle push relies on the
 *   browser window object.
 */
export default function AdContainer({ slotId, placement, className = '' }: AdContainerProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  // Don't render anything in dev/staging when the env var is absent
  if (!clientId) return null;

  return (
    <>
      {/* Load AdSense script once per page — Next.js deduplicates by src */}
      <Script
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />

      <div
        className={`ad-container ad-${placement} overflow-hidden text-center ${className}`}
        data-placement={placement}
        aria-label="إعلان"
        aria-hidden="true"
      >
        <ins
          className="adsbygoogle block"
          style={{ display: 'block' }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        {/* Push the ad unit; runs only client-side after hydration */}
        <Script id={`adsense-push-${placement}`} strategy="afterInteractive">
          {`(adsbygoogle = window.adsbygoogle || []).push({});`}
        </Script>
      </div>
    </>
  );
}
