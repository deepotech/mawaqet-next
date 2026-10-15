import type { Metadata } from 'next';
import Script from 'next/script';
import { Tajawal } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';

// Load Tajawal via next/font for automatic subsetting & no layout shift
const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700', '800'],
  display: 'swap',
  variable: '--font-tajawal',
});

export const metadata: Metadata = {
  title: {
    default: 'مواقيت الصلاة | أوقات الصلاة لجميع مدن العالم',
    template: '%s | مواقيت الصلاة',
  },
  description: 'مواقيت الصلاة اليوم في جميع مدن العالم بدقة عالية — الفجر، الشروق، الظهر، العصر، المغرب، العشاء',
  metadataBase: new URL('https://mawaqetsalat.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_MA',
    siteName: 'مواقيت الصلاة',
  },
  verification: {
    google: 'CYJSyxTsV4b7XbSze2wiTr7nKTp1Ch5CCpPCJQbpcs8',
    yandex: '0bb69223fb081911',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <head>
        {/* AdSense publisher verification meta (non-blocking) */}
        {ADSENSE_ID && (
          <meta name="google-adsense-account" content={ADSENSE_ID} />
        )}
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased flex flex-col min-h-screen">
        {/* Skip-to-content for keyboard / screen reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-50 focus:bg-teal-700 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium focus:shadow-lg"
        >
          تخطى إلى المحتوى الرئيسي
        </a>

        <Header />

        <main id="main-content" className="flex-1 w-full">
          {children}
        </main>

        <Footer />

        {/* Google Analytics 4 — loaded only when env var is set */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}', { page_path: window.location.pathname });`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
