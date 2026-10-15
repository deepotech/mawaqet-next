import type { Metadata } from 'next';
import Link from 'next/link';
import AdContainer from '@/components/ads/AdContainer';

export const metadata: Metadata = {
  title: 'المطورون — إضافة مواقيت الصلاة لموقعك | مواقيت الصلاة',
  description: 'أدوات المطورين وكود تضمين مواقيت الصلاة لموقعك الإلكتروني أو تطبيقك بسهولة وبشكل مجاني.',
  alternates: {
    canonical: 'https://mawaqetsalat.com/developers/',
  },
};

export default function DevelopersPage() {

  return (
    <>
      <AdContainer placement="header_ads" slotId={process.env.NEXT_PUBLIC_AD_SLOT_HEADER ?? ''} className="py-2" />

      <nav aria-label="مسار التنقل" className="max-w-4xl mx-auto px-4 sm:px-6 py-4 text-sm text-gray-500">
        <ol className="flex items-center gap-1" role="list">
          <li><Link href="/" className="hover:text-teal-700 transition-colors">الرئيسية</Link></li>
          <li aria-hidden="true" className="text-gray-300">/</li>
          <li className="text-gray-700 font-medium" aria-current="page">المطورون</li>
        </ol>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <header className="mb-8 text-center sm:text-start">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-teal-800 mb-3">
            أدوات المطورين — تضمين مواقيت الصلاة
          </h1>
          <p className="text-gray-600 leading-relaxed">
            يمكنك تضمين جدول مواقيت الصلاة الخاص بأي مدينة في موقعك مجاناً عبر كود الـ iframe المباشر.
          </p>
        </header>

        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-bold text-teal-700">كود التضمين السريع (Widget Embed)</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            انسخ الكود البرمجي أدناه وضعه في أي مكان داخل صفحة موقعك الإلكتروني:
          </p>

          <div className="bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-xs sm:text-sm overflow-x-auto text-left" dir="ltr">
            {`<iframe
  src="https://mawaqetsalat.com/embd/?city-s=casablanca&country-s=morocco&city-ar=الدار%20البيضاء"
  width="100%"
  height="480"
  frameborder="0"
  scrolling="no"
  style="border: none; overflow: hidden; max-width: 450px;"
  title="مواقيت الصلاة"
></iframe>`}
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-base font-bold text-gray-800 mb-3">المعلمات المدعومة (Parameters):</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li><code className="text-teal-700 font-bold">city-s</code>: اسم المدينة بالإنجليزية (مثال: casablanca, baghdad, riyadh).</li>
              <li><code className="text-teal-700 font-bold">country-s</code>: اسم الدولة بالإنجليزية (مثال: morocco, iraq, saudi arabia).</li>
              <li><code className="text-teal-700 font-bold">city-ar</code>: اسم المدينة بالعربية للعرض في رأس الويدجت.</li>
              <li><code className="text-teal-700 font-bold">design-color</code>: كود اللون الأساسي بصيغة HEX (افتراضي: 0d9488).</li>
            </ul>
          </div>
        </section>

        <section className="mt-8 bg-teal-50 border border-teal-100 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-teal-800 mb-3">واجهة برمجة التطبيقات (Search API)</h2>
          <p className="text-gray-700 text-sm mb-4">
            يوفر الموقع واجهة بحث عامة ومجانية للبحث عن المدن والمواقيت:
          </p>
          <div className="bg-white p-3 rounded-lg border border-teal-200 font-mono text-xs text-left" dir="ltr">
            GET https://mawaqetsalat.com/api/search?q=بغداد
          </div>
        </section>
      </main>

      <AdContainer placement="footer_ads" slotId={process.env.NEXT_PUBLIC_AD_SLOT_FOOTER ?? ''} className="py-2" />
    </>
  );
}
