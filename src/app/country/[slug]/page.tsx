import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  getAllCountries,
  getCountryBySlug,
  getCitiesByCountryId,
  toCalculationMethodId,
} from '@/lib/data';
import AdContainer from '@/components/ads/AdContainer';
import CountryCitiesList from '@/components/country/CountryCitiesList';
import IqamahDisclaimer from '@/components/prayer/IqamahDisclaimer';

// ─── Static Params ────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  const countries = getAllCountries();
  return countries.map((c) => ({ slug: c.slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country) return { title: 'صفحة غير موجودة' };

  const year = new Date().getFullYear();
  const title = `مواقيت الصلاة في ${country.nameAr} ${year} - mawaqetsalat.com`;
  const description = `مواقيت الصلاة اليوم في جميع مدن ${country.nameAr} — أوقات الفجر، الشروق، الظهر، العصر، المغرب، والعشاء`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://mawaqetsalat.com/country/${country.slug}/`,
    },
    openGraph: {
      title,
      description,
      url: `https://mawaqetsalat.com/country/${country.slug}/`,
      type: 'website',
      locale: 'ar_MA',
    },
  };
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default async function CountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const country = getCountryBySlug(slug);

  if (!country) notFound();

  const cities = getCitiesByCountryId(country.id);
  const allCountries = getAllCountries();
  const otherCountries = allCountries.filter((c) => c.id !== country.id);

  const year = new Date().getFullYear();
  const defaultMethod = toCalculationMethodId(country.defaultMethodId);

  // ── Structured data — BreadcrumbList ──────────────────────────────────────
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://mawaqetsalat.com/' },
      {
        '@type': 'ListItem',
        position: 2,
        name: country.nameAr,
        item: `https://mawaqetsalat.com/country/${country.slug}/`,
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

      {/* ── Header Ad ── */}
      <AdContainer placement="header_ads" slotId={process.env.NEXT_PUBLIC_AD_SLOT_HEADER ?? ''} className="py-2" />

      {/* ── Breadcrumb ── */}
      <nav
        aria-label="مسار التنقل"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-sm text-gray-500"
      >
        <ol className="flex items-center gap-1" role="list">
          <li><Link href="/" className="hover:text-teal-700 transition-colors">الرئيسية</Link></li>
          <li aria-hidden="true" className="text-gray-300">/</li>
          <li className="text-gray-700 font-medium" aria-current="page">{country.nameAr}</li>
        </ol>
      </nav>

      {/* ── Page Header ── */}
      <header className="bg-gradient-to-b from-teal-700 to-teal-600 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-5">
          <Image
            src={country.flagUrl}
            alt={`علم ${country.nameAr}`}
            width={72}
            height={54}
            className="rounded-lg shadow-lg border border-teal-500/30"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              مواقيت الصلاة في {country.nameAr}
            </h1>
            <p className="text-teal-100 text-sm mt-1">
              أوقات الصلاة اليومية الدقيقة لـ <strong className="text-white">{cities.length} مدينة</strong> في {country.nameAr} — لعام {year}
            </p>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Country calculation method overview */}
        <div className="bg-teal-50/60 rounded-2xl border border-teal-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-teal-900">
          <div>
            <span className="font-bold block">المعيار الفلكي المعتمد في {country.nameAr}:</span>
            <span className="text-xs text-teal-700 mt-0.5 block">
              طريقة الحساب: <strong>{defaultMethod}</strong> — حساب محلي دقيق وفق شروق وغروب الشمس وزوايا الفجر والعشاء الشرعية.
            </span>
          </div>
          <span className="text-xs bg-teal-100 text-teal-800 px-3 py-1 rounded-full font-semibold self-start sm:self-auto">
            {cities.length} مدينة مسجلة
          </span>
        </div>

        {/* Cities Section with Instant Search */}
        <section aria-labelledby="cities-heading">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-teal-100 pb-3">
            <h2 id="cities-heading" className="text-xl font-bold text-teal-800">
              مدن {country.nameAr} ({cities.length} مدينة)
            </h2>
            <span className="text-xs text-gray-500">
              اختر مدينتك لعرض جدول مواقيت الصلاة والعد التنازلي والجدول الشهري
            </span>
          </div>

          <CountryCitiesList
            cities={cities.map((c) => ({
              id: c.id,
              slug: c.slug,
              nameAr: c.nameAr,
              nameEn: c.nameEn,
              verificationStatus: c.verificationStatus,
            }))}
            countryName={country.nameAr}
          />
        </section>

        {/* Iqamah & Mosque disclaimer */}
        <IqamahDisclaimer />

        {/* Country content */}
        {country.contentAr && (
          <section className="prose prose-sm max-w-none text-gray-700 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs" aria-labelledby="country-content-heading">
            <h2 id="country-content-heading" className="text-lg font-bold text-teal-800 mb-3 not-prose">
              عن مواقيت الصلاة في {country.nameAr}
            </h2>
            <div dangerouslySetInnerHTML={{ __html: country.contentAr }} />
          </section>
        )}

        {/* After cities ad */}
        <AdContainer placement="after_cities_ads" slotId={process.env.NEXT_PUBLIC_AD_SLOT_AFTER_CITIES ?? ''} className="my-8" />

        {/* Other countries */}
        <section className="mt-8" aria-labelledby="other-countries-heading">
          <div className="flex items-center justify-between mb-4 border-b border-teal-100 pb-2">
            <h2 id="other-countries-heading" className="text-lg font-bold text-teal-800">
              دول أخرى
            </h2>
            <Link
              href="/countries/"
              className="text-xs text-teal-600 hover:text-teal-800 font-semibold"
            >
              عرض جميع الدول ←
            </Link>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" role="list">
            {otherCountries.slice(0, 16).map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/country/${other.slug}/`}
                  className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-xs hover:border-teal-400 hover:shadow-md transition-all group"
                >
                  <Image
                    src={other.flagUrl}
                    alt={`علم ${other.nameAr}`}
                    width={24}
                    height={18}
                    className="rounded-xs shrink-0 object-cover"
                  />
                  <span className="text-xs font-semibold text-gray-800 group-hover:text-teal-700 transition-colors truncate">
                    {other.nameAr}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Footer Ad */}
      <AdContainer placement="footer_ads" slotId={process.env.NEXT_PUBLIC_AD_SLOT_FOOTER ?? ''} className="py-2" />
    </>
  );
}
