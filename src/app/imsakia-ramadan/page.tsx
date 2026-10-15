import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import AdContainer from '@/components/ads/AdContainer';
import CitySearch from '@/components/search/CitySearch';
import { getAllCountries } from '@/lib/data';

export const metadata: Metadata = {
  title: 'إمساكية رمضان 2026 — مواقيت الإمساك والإفطار | مواقيت الصلاة',
  description: 'إمساكية شهر رمضان المبارك 2026 / 1447 لجميع مدن ودول العالم — أوقات الإمساك وأذان الفجر وموعد أذان المغرب والإفطار بدقة.',
  alternates: {
    canonical: 'https://mawaqetsalat.com/imsakia-ramadan/',
  },
};

export default function ImsakiaRamadanPage() {
  const countries = getAllCountries();
  const year = new Date().getFullYear();

  return (
    <>
      <AdContainer placement="header_ads" slotId={process.env.NEXT_PUBLIC_AD_SLOT_HEADER ?? ''} className="py-2" />

      <nav aria-label="مسار التنقل" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm text-gray-500">
        <ol className="flex items-center gap-1" role="list">
          <li><Link href="/" className="hover:text-teal-700 transition-colors">الرئيسية</Link></li>
          <li aria-hidden="true" className="text-gray-300">/</li>
          <li className="text-gray-700 font-medium" aria-current="page">إمساكية رمضان {year}</li>
        </ol>
      </nav>

      <header className="bg-gradient-to-b from-teal-700 to-teal-600 text-white py-12 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="text-4xl mb-3 inline-block">🌙</span>
          <h1 className="text-2xl sm:text-4xl font-extrabold mb-3">
            إمساكية شهر رمضان المبارك {year}
          </h1>
          <p className="text-teal-100 text-sm sm:text-base mb-6 max-w-xl mx-auto">
            مواعيد الإمساك والإفطار وأوقات الصلوات الخمس طيلة أيام شهر رمضان المبارك لكافة المدن والدول.
          </p>
          <div className="flex justify-center">
            <CitySearch placeholder="ابحث عن مدينتك لعرض الإمساكية..." navigateOnSelect />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <section aria-labelledby="featured-countries">
          <h2 id="featured-countries" className="text-xl font-bold text-teal-800 mb-6 border-b border-teal-100 pb-2">
            إمساكية رمضان حسب الدولة
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {countries.map((country) => (
              <Link
                key={country.slug}
                href={`/country/${country.slug}/`}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-teal-400 hover:shadow-md transition-all group"
              >
                <Image
                  src={country.flagUrl}
                  alt={`علم ${country.nameAr}`}
                  width={28}
                  height={21}
                  className="rounded-sm shrink-0"
                />
                <span className="text-sm font-semibold text-gray-800 group-hover:text-teal-700 transition-colors">
                  {country.nameAr}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-teal-50 rounded-2xl border border-teal-100 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-teal-800 mb-3">كيفية حساب موعد الإمساك والإفطار</h2>
          <p className="text-gray-700 text-sm leading-relaxed mb-3">
            يبدأ وقت الصيام شرعاً من طلوع الفجر الصادق (أذان الفجر)، ويُستحب الإمساك قبله بدقائق احتياطاً.
            ويحل وقت الإفطار مع غروب كامل قرص الشمس ودخول وقت صلاة المغرب بحسب التوقيت الفلكي الدقيق لكل مدينة.
          </p>
          <p className="text-gray-700 text-sm leading-relaxed">
            للحصول على الجدول اليومي والشهري الدقيق، اختر دولتك ومدينتك من القائمة أعلاه لمشاهدة التوقيت المعتمد رسمياً في بلدك.
          </p>
        </section>
      </main>

      <AdContainer placement="footer_ads" slotId={process.env.NEXT_PUBLIC_AD_SLOT_FOOTER ?? ''} className="py-2" />
    </>
  );
}
