import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import CitySearch from '@/components/search/CitySearch';
import AdContainer from '@/components/ads/AdContainer';

export const metadata: Metadata = {
  title: 'مواقيت الصلاة | أوقات الصلاة لجميع مدن العالم',
  description:
    'مواقيت الصلاة اليوم في جميع مدن العالم بدقة عالية. الفجر، الشروق، الظهر، العصر، المغرب والعشاء لأكثر من 328 مدينة.',
  alternates: { canonical: 'https://mawaqetsalat.com/' },
  openGraph: {
    title: 'مواقيت الصلاة | أوقات الصلاة لجميع مدن العالم',
    description: 'مواقيت الصلاة اليوم في أكثر من 328 مدينة حول العالم',
    url: 'https://mawaqetsalat.com/',
  },
};

// ─── Static data — will be replaced by DB queries in Phase 3 ──────────────────
const FEATURED_COUNTRIES = [
  { slug: 'prayer-times-in-morocco',      nameAr: 'المغرب',       flag: 'ma' },
  { slug: 'prayer-times-in-iraq',         nameAr: 'العراق',       flag: 'iq' },
  { slug: 'prayer-times-in-saudi-arabia', nameAr: 'السعودية',     flag: 'sa' },
  { slug: 'prayer-times-in-eqypt',        nameAr: 'مصر',          flag: 'eg' },
  { slug: 'prayer-times-in-algeria',      nameAr: 'الجزائر',      flag: 'dz' },
  { slug: 'prayer-times-in-turkey',       nameAr: 'تركيا',        flag: 'tr' },
  { slug: 'prayer-times-in-jordan',       nameAr: 'الأردن',       flag: 'jo' },
  { slug: 'prayer-times-in-kuwait',       nameAr: 'الكويت',       flag: 'kw' },
] as const;

const TOP_CITIES = [
  { slug: 'prayer-times-in-baghdad',    nameAr: 'بغداد',        country: 'العراق' },
  { slug: 'prayer-times-in-casablanca', nameAr: 'الدار البيضاء', country: 'المغرب' },
  { slug: 'prayer-times-in-rabat',      nameAr: 'الرباط',       country: 'المغرب' },
  { slug: 'prayer-times-in-riyadh',     nameAr: 'الرياض',       country: 'السعودية' },
  { slug: 'prayer-times-in-cairo',      nameAr: 'القاهرة',      country: 'مصر' },
  { slug: 'prayer-times-in-istanbul',   nameAr: 'إسطنبول',      country: 'تركيا' },
  { slug: 'prayer-times-in-amman',      nameAr: 'عمّان',         country: 'الأردن' },
  { slug: 'prayer-times-in-dubai',      nameAr: 'دبي',          country: 'الإمارات' },
  { slug: 'prayer-times-in-algiers',    nameAr: 'الجزائر العاصمة', country: 'الجزائر' },
  { slug: 'prayer-times-in-kuwait-city',nameAr: 'مدينة الكويت', country: 'الكويت' },
  { slug: 'prayer-times-in-basra',      nameAr: 'البصرة',       country: 'العراق' },
  { slug: 'prayer-times-in-mosul',      nameAr: 'الموصل',       country: 'العراق' },
] as const;
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      {/* ── Header Ad ── */}
      <AdContainer
        placement="header_ads"
        slotId={process.env.NEXT_PUBLIC_AD_SLOT_HEADER ?? ''}
        className="py-2"
      />

      {/* ── Hero / Search ─────────────────────────────────────────── */}
      <section
        className="bg-gradient-to-b from-teal-700 to-teal-600 text-white py-14 px-4"
        aria-labelledby="hero-heading"
      >
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/salat.png"
              alt="شعار مواقيت الصلاة"
              width={64}
              height={64}
              priority
              className="rounded-xl shadow-lg"
            />
          </div>
          <h1
            id="hero-heading"
            className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight"
          >
            مواقيت الصلاة
          </h1>
          <p className="text-teal-100 text-base sm:text-lg mb-8 leading-relaxed max-w-xl mx-auto">
            أوقات الصلاة الدقيقة لأكثر من <strong className="text-white">328 مدينة</strong> و
            <strong className="text-white"> 38 دولة</strong> حول العالم
          </p>

          {/* City Search */}
          <div className="flex justify-center">
            <CitySearch
              placeholder="ابحث عن مدينتك... مثال: بغداد، الرباط"
              navigateOnSelect
            />
          </div>
        </div>
      </section>

      {/* ── After prayer-time ad ── */}
      <AdContainer
        placement="after_pt_ads"
        slotId={process.env.NEXT_PUBLIC_AD_SLOT_AFTER_PT ?? ''}
        className="py-2"
      />

      {/* ── Featured Countries ────────────────────────────────────── */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        aria-labelledby="countries-heading"
      >
        <h2
          id="countries-heading"
          className="text-xl font-bold text-teal-800 mb-6 border-b border-teal-100 pb-2"
        >
          الدول
        </h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" role="list">
          {FEATURED_COUNTRIES.map(({ slug, nameAr, flag }) => (
            <li key={slug}>
              <Link
                href={`/country/${slug}/`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm hover:border-teal-400 hover:shadow-md transition-all group focus-visible:outline-2 focus-visible:outline-teal-600 focus-visible:outline-offset-2"
              >
                <Image
                  src={`/flags/${flag}.png`}
                  alt={`علم ${nameAr}`}
                  width={32}
                  height={24}
                  className="rounded-sm shrink-0 object-cover"
                />
                <span className="text-sm font-semibold text-gray-800 group-hover:text-teal-700 transition-colors">
                  {nameAr}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Link to all countries */}
        <div className="mt-5 text-center">
          <Link
            href="/countries/"
            className="inline-block text-sm text-teal-600 hover:text-teal-800 font-medium underline underline-offset-4 transition-colors"
          >
            عرض جميع الدول ←
          </Link>
        </div>
      </section>

      {/* ── After cities ad ── */}
      <AdContainer
        placement="after_cities_ads"
        slotId={process.env.NEXT_PUBLIC_AD_SLOT_AFTER_CITIES ?? ''}
        className="py-2 max-w-7xl mx-auto px-4"
      />

      {/* ── Top Cities ────────────────────────────────────────────── */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        aria-labelledby="cities-heading"
      >
        <h2
          id="cities-heading"
          className="text-xl font-bold text-teal-800 mb-6 border-b border-teal-100 pb-2"
        >
          أبرز المدن
        </h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" role="list">
          {TOP_CITIES.map(({ slug, nameAr, country }) => (
            <li key={slug}>
              <Link
                href={`/city/${slug}/`}
                className="block rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm hover:border-teal-400 hover:shadow-md transition-all group focus-visible:outline-2 focus-visible:outline-teal-600 focus-visible:outline-offset-2"
              >
                <p className="text-sm font-semibold text-gray-800 group-hover:text-teal-700 transition-colors">
                  {nameAr}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">{country}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Informational Section ─────────────────────────────────── */}
      <section className="bg-teal-50 border-t border-teal-100 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-teal-800 mb-4">
            مواقيت الصلاة الدقيقة لكل مكان في العالم
          </h2>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
            يوفر موقع مواقيت الصلاة أوقات الصلاة المحسوبة بدقة عالية لأكثر من 328 مدينة
            حول العالم، مع مراعاة الطريقة الحسابية المعتمدة في كل بلد.
            استخدم خاصية البحث لإيجاد مدينتك والحصول على جدول أوقات الصلاة اليومي والشهري.
          </p>
        </div>
      </section>

      {/* ── Footer Ad ── */}
      <AdContainer
        placement="footer_ads"
        slotId={process.env.NEXT_PUBLIC_AD_SLOT_FOOTER ?? ''}
        className="py-2"
      />
    </>
  );
}
