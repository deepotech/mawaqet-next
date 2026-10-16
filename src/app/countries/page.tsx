import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllCountries, getCitiesByCountryId } from '@/lib/data';
import AdContainer from '@/components/ads/AdContainer';

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'مواقيت الصلاة حسب الدولة — جميع الدول',
  description:
    'اختر دولتك لعرض مواقيت الصلاة الدقيقة في جميع مدنها — الفجر، الشروق، الظهر، العصر، المغرب، والعشاء لأكثر من 38 دولة.',
  alternates: {
    canonical: 'https://mawaqetsalat.com/countries/',
  },
  openGraph: {
    title: 'مواقيت الصلاة حسب الدولة — جميع الدول',
    description:
      'اختر دولتك لعرض مواقيت الصلاة الدقيقة في جميع مدنها لأكثر من 38 دولة.',
    url: 'https://mawaqetsalat.com/countries/',
    type: 'website',
    locale: 'ar_MA',
  },
};

// ─── Page Component ───────────────────────────────────────────────────────────
export default function CountriesPage() {
  const countries = getAllCountries();

  // Attach real city counts from data layer
  const countriesWithCounts = countries.map((country) => ({
    ...country,
    citiesCount: getCitiesByCountryId(country.id).length,
  }));

  // ── Structured data — ItemList ─────────────────────────────────────────────
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'مواقيت الصلاة حسب الدولة',
    numberOfItems: countries.length,
    itemListElement: countriesWithCounts.map((country, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: country.nameAr,
      url: `https://mawaqetsalat.com/country/${country.slug}/`,
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'الرئيسية',
        item: 'https://mawaqetsalat.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'جميع الدول',
        item: 'https://mawaqetsalat.com/countries/',
      },
    ],
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      {/* ── Header Ad ── */}
      <AdContainer
        placement="header_ads"
        slotId={process.env.NEXT_PUBLIC_AD_SLOT_HEADER ?? ''}
        className="py-2"
      />

      {/* ── Breadcrumb ── */}
      <nav
        aria-label="مسار التنقل"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-sm text-gray-500"
      >
        <ol className="flex items-center gap-1" role="list">
          <li>
            <Link href="/" className="hover:text-teal-700 transition-colors">
              الرئيسية
            </Link>
          </li>
          <li aria-hidden="true" className="text-gray-300">
            /
          </li>
          <li className="text-gray-700 font-medium" aria-current="page">
            جميع الدول
          </li>
        </ol>
      </nav>

      {/* ── Page Header ── */}
      <header className="bg-gradient-to-b from-teal-700 to-teal-600 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
            مواقيت الصلاة حسب الدولة
          </h1>
          <p className="text-teal-100 text-sm mt-2">
            اختر دولتك لعرض أوقات الصلاة الدقيقة في جميع مدنها —{' '}
            <strong className="text-white">{countries.length} دولة</strong>
          </p>
        </div>
      </header>

      {/* ── Countries Grid ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section aria-labelledby="countries-list-heading">
          <h2
            id="countries-list-heading"
            className="text-xl font-bold text-teal-800 mb-6 border-b border-teal-100 pb-2"
          >
            جميع الدول ({countries.length} دولة)
          </h2>

          <ul
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            role="list"
          >
            {countriesWithCounts.map((country) => (
              <li key={country.slug}>
                <Link
                  href={`/country/${country.slug}/`}
                  className="flex flex-col items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 py-4 shadow-sm hover:border-teal-400 hover:shadow-md transition-all group focus-visible:outline-2 focus-visible:outline-teal-600 focus-visible:outline-offset-2 text-center h-full"
                >
                  <Image
                    src={country.flagUrl}
                    alt={`علم ${country.nameAr}`}
                    width={48}
                    height={36}
                    className="rounded-md shadow-sm border border-gray-100 shrink-0 object-cover"
                  />
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-teal-700 transition-colors leading-snug">
                    {country.nameAr}
                  </span>
                  <span className="text-xs text-gray-400">
                    {country.citiesCount} مدينة
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── After countries ad ── */}
        <AdContainer
          placement="after_cities_ads"
          slotId={process.env.NEXT_PUBLIC_AD_SLOT_AFTER_CITIES ?? ''}
          className="my-8"
        />
      </main>

      {/* ── Footer Ad ── */}
      <AdContainer
        placement="footer_ads"
        slotId={process.env.NEXT_PUBLIC_AD_SLOT_FOOTER ?? ''}
        className="py-2"
      />
    </>
  );
}
