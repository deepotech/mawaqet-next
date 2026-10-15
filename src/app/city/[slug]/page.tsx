import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  getAllCities,
  getCityBySlug,
  getCountryById,
  getSiblingCities,
  toCalculationMethodId,
  isCityIndependentlyVerified,
} from '@/lib/data';
import { buildPrayerConfig } from '@/lib/prayer-config';
import { prayerTimeService } from '@/services/prayer-service';
import CityPrayerInteractive from '@/components/prayer/CityPrayerInteractive';
import NextPrayerCountdown from '@/components/prayer/NextPrayerCountdown';
import AdContainer from '@/components/ads/AdContainer';
import type { PrayerKey } from '@/lib/design-tokens';

// ─── Static Params ────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  const cities = getAllCities();
  return cities.map((c) => ({ slug: c.slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return { title: 'صفحة غير موجودة' };

  const country = getCountryById(city.countryId);
  const year = new Date().getFullYear();
  const titleSuffix = ` ${year} - mawaqetsalat.com`;

  return {
    title: `${city.seoTitle}${titleSuffix}`,
    description:
      city.seoDescription ||
      `مواقيت الصلاة في ${city.nameAr} اليوم — الفجر، الشروق، الظهر، العصر، المغرب، العشاء`,
    alternates: {
      canonical: `https://mawaqetsalat.com${city.urlPath}`,
    },
    openGraph: {
      title: `${city.seoTitle}${titleSuffix}`,
      description: city.seoDescription,
      url: `https://mawaqetsalat.com${city.urlPath}`,
      type: 'website',
      locale: 'ar_MA',
    },
    other: {
      'article:country': country?.nameAr ?? '',
    },
  };
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = getCityBySlug(slug);

  if (!city) notFound();

  const country = getCountryById(city.countryId);
  const siblings = getSiblingCities(city.id, city.countryId, 12);

  // ── Server-side Prayer Time Calculation (Defaults for SSR) ─────────────────
  const defaultMethod = toCalculationMethodId(city.calculationMethodId);
  const config = buildPrayerConfig(city.calculationMethodId, city.coordinates.latitude);
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;

  let dailySchedule = null;
  let monthlySchedule = null;
  let calcError: string | null = null;

  try {
    dailySchedule = prayerTimeService.calculateDailySchedule({
      coordinates: city.coordinates,
      timezone: city.timezone,
      date: now,
      config,
    });
    monthlySchedule = prayerTimeService.calculateMonthlySchedule({
      coordinates: city.coordinates,
      timezone: city.timezone,
      year,
      month,
      config,
    });
  } catch (err) {
    calcError = err instanceof Error ? err.message : 'خطأ في حساب مواقيت الصلاة';
  }

  // ── Hijri Date & Gregorian ────────────────────────────────────────────────
  const hijriDate = prayerTimeService.getHijriDate(now, city.timezone);
  const gregorianFormatted = new Intl.DateTimeFormat('ar-MA', {
    timeZone: city.timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(now);

  // ── Today's ISO date string ───────────────────────────────────────────────
  const todayIso = new Intl.DateTimeFormat('en-CA', { timeZone: city.timezone }).format(now);

  const nextPrayerKey = (dailySchedule?.nextPrayer?.next ?? 'none') as PrayerKey | 'none';
  const nextPrayerTimestampMs = dailySchedule?.nextPrayer?.targetTimestampMs ?? null;

  // ── Structured data — BreadcrumbList ──────────────────────────────────────
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://mawaqetsalat.com/' },
      country
        ? {
            '@type': 'ListItem',
            position: 2,
            name: country.nameAr,
            item: `https://mawaqetsalat.com/country/${country.slug}/`,
          }
        : null,
      {
        '@type': 'ListItem',
        position: country ? 3 : 2,
        name: city.nameAr,
        item: `https://mawaqetsalat.com${city.urlPath}`,
      },
    ].filter(Boolean),
  };

  const isIndependentlyVerifiedHub = isCityIndependentlyVerified(city.slug);

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
        <ol className="flex flex-wrap items-center gap-1" role="list">
          <li><Link href="/" className="hover:text-teal-700 transition-colors">الرئيسية</Link></li>
          {country && (
            <>
              <li aria-hidden="true" className="text-gray-300">/</li>
              <li>
                <Link href={`/country/${country.slug}/`} className="hover:text-teal-700 transition-colors">
                  {country.nameAr}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true" className="text-gray-300">/</li>
          <li className="text-gray-700 font-medium" aria-current="page">{city.nameAr}</li>
        </ol>
      </nav>

      {/* ── Page Header ── */}
      <header className="bg-gradient-to-b from-teal-700 to-teal-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            {country && (
              <Image
                src={country.flagUrl}
                alt={`علم ${country.nameAr}`}
                width={32}
                height={24}
                className="rounded-sm shadow"
              />
            )}
            <span className="text-teal-200 text-sm">{country?.nameAr}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-2">
            مواقيت الصلاة في {city.nameAr}
          </h1>
          <p className="text-teal-100 text-sm">
            {gregorianFormatted} — {hijriDate.formattedAr}
          </p>
        </div>
      </header>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Calculation Error Alert */}
        {calcError && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800" role="alert">
            <strong>تعذر حساب مواقيت الصلاة:</strong> {calcError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Right Column (2 spans): Interactive timetable & controls ── */}
          <div className="lg:col-span-2 space-y-6">
            {dailySchedule && monthlySchedule ? (
              <CityPrayerInteractive
                city={{
                  id: city.id,
                  slug: city.slug,
                  nameAr: city.nameAr,
                  nameEn: city.nameEn,
                  coordinates: city.coordinates,
                  timezone: city.timezone,
                  calculationMethodId: city.calculationMethodId,
                  countryId: city.countryId,
                  countryCode: country?.code ?? '',
                  verificationStatus: city.verificationStatus,
                }}
                country={country}
                defaultMethod={defaultMethod}
                isIndependentlyVerified={isIndependentlyVerifiedHub}
                initialDailySchedule={dailySchedule}
                initialMonthlySchedule={monthlySchedule}
                todayIso={todayIso}
                currentYear={year}
                currentMonth={month}
              />
            ) : null}

            {/* After prayer-time ad */}
            <AdContainer placement="after_pt_ads" slotId={process.env.NEXT_PUBLIC_AD_SLOT_AFTER_PT ?? ''} />
          </div>

          {/* ── Left Column (1 span): Desktop Countdown + City Info ── */}
          <aside className="space-y-6">
            {/* Countdown (Desktop) */}
            {dailySchedule && nextPrayerKey !== 'none' && nextPrayerTimestampMs && (
              <section aria-labelledby="countdown-heading" className="hidden lg:block">
                <h2 id="countdown-heading" className="sr-only">الصلاة القادمة</h2>
                <NextPrayerCountdown
                  nextPrayer={nextPrayerKey}
                  nextPrayerTime={new Date(nextPrayerTimestampMs)}
                />
              </section>
            )}

            {/* City Info Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
              <h2 className="text-base font-bold text-teal-800">بيانات {city.nameAr}</h2>
              <dl className="space-y-2.5 text-sm text-gray-600">
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <dt>الدولة</dt>
                  <dd className="font-semibold text-gray-800">{country?.nameAr ?? '—'}</dd>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <dt>المنطقة الزمنية</dt>
                  <dd className="font-medium text-gray-800 text-xs font-mono">{city.timezone}</dd>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <dt>التاريخ الهجري</dt>
                  <dd className="font-medium text-gray-800">{hijriDate.formattedAr}</dd>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <dt>طريقة الحساب الافتراضية</dt>
                  <dd className="font-medium text-gray-800 text-xs">{dailySchedule?.meta.calculationAuthority ?? 'رابطة العالم الإسلامي'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>مستوى التحقق الفلكي</dt>
                  <dd className="font-medium text-gray-800 text-xs">
                    {isIndependentlyVerifiedHub ? 'المستوى 4 (مقارنة معتمدة)' : 'المستوى 3 (حساب فلكي إقليمي)'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Country Link Card */}
            {country && (
              <Link
                href={`/country/${country.slug}/`}
                className="flex items-center gap-3 bg-teal-50 hover:bg-teal-100/80 border border-teal-200 rounded-2xl p-4 transition-all group shadow-xs"
              >
                <Image
                  src={country.flagUrl}
                  alt={`علم ${country.nameAr}`}
                  width={36}
                  height={27}
                  className="rounded-sm shadow-xs"
                />
                <div>
                  <p className="text-sm font-bold text-teal-900 group-hover:text-teal-700 transition-colors">
                    جميع مدن {country.nameAr}
                  </p>
                  <p className="text-xs text-teal-600 mt-0.5">{country.totalCities} مدينة مسجلة</p>
                </div>
              </Link>
            )}
          </aside>
        </div>

        {/* ── Legacy WordPress Editorial Content ── */}
        {city.contentAr && (
          <section className="mt-12 prose prose-sm max-w-none text-gray-700 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs" aria-labelledby="city-content-heading">
            <h2 id="city-content-heading" className="text-lg font-bold text-teal-800 mb-4 not-prose">
              نبذة ومعلومات إضافية عن مواقيت الصلاة في {city.nameAr}
            </h2>
            <div dangerouslySetInnerHTML={{ __html: city.contentAr }} />
          </section>
        )}

        {/* After cities ad */}
        <AdContainer placement="after_cities_ads" slotId={process.env.NEXT_PUBLIC_AD_SLOT_AFTER_CITIES ?? ''} className="my-8" />

        {/* ── Sister Cities in Same Country ── */}
        {siblings.length > 0 && (
          <section className="mt-8" aria-labelledby="siblings-heading">
            <h2 id="siblings-heading" className="text-lg font-bold text-teal-800 mb-4">
              مدن أخرى في {country?.nameAr}
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" role="list">
              {siblings.map((sibling) => (
                <li key={sibling.slug}>
                  <Link
                    href={`/city/${sibling.slug}/`}
                    className="block rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 hover:border-teal-400 hover:text-teal-700 transition-all shadow-xs"
                  >
                    {sibling.nameAr}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Footer Ad */}
      <AdContainer placement="footer_ads" slotId={process.env.NEXT_PUBLIC_AD_SLOT_FOOTER ?? ''} className="py-2" />
    </>
  );
}
