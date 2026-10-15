import type { Metadata } from 'next';
import Link from 'next/link';
import AdContainer from '@/components/ads/AdContainer';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | مواقيت الصلاة',
  description: 'سياسة الخصوصية وبيان سرية المعلومات لموقع مواقيت الصلاة mawaqetsalat.com',
  alternates: {
    canonical: 'https://mawaqetsalat.com/سياسة-الخصوصية/',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <AdContainer placement="header_ads" slotId={process.env.NEXT_PUBLIC_AD_SLOT_HEADER ?? ''} className="py-2" />

      <nav aria-label="مسار التنقل" className="max-w-4xl mx-auto px-4 sm:px-6 py-4 text-sm text-gray-500">
        <ol className="flex items-center gap-1" role="list">
          <li><Link href="/" className="hover:text-teal-700 transition-colors">الرئيسية</Link></li>
          <li aria-hidden="true" className="text-gray-300">/</li>
          <li className="text-gray-700 font-medium" aria-current="page">سياسة الخصوصية</li>
        </ol>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <article className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-10 prose prose-teal max-w-none">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-teal-800 mb-6">
            الخصوصية وبيان سريّة المعلومات
          </h1>

          <p className="text-gray-700 leading-relaxed">
            نقدر مخاوفكم واهتمامكم بشأن خصوصية بياناتكم على شبكة الإنترنت. لقد تم إعداد هذه السياسة لمساعدتكم في تفهم طبيعة البيانات التي نقوم بتجميعها منكم عند زيارتكم لموقعنا وكيفية تعاملنا مع هذه البيانات الشخصية.
          </p>

          <h2 className="text-xl font-bold text-teal-700 mt-6 mb-3">التصفح</h2>
          <p className="text-gray-700 leading-relaxed">
            لم نقم بتصميم هذا الموقع من أجل تجميع بياناتك الشخصية من جهاز الكمبيوتر أو هاتفك أثناء تصفحك لهذا الموقع، وإنما سيتم فقط استخدام البيانات المقدمة من قبلك بمعرفتك ومحض إرادتك مثل الموقع الجغرافي لحساب مواقيت الصلاة بدقة.
          </p>

          <h2 className="text-xl font-bold text-teal-700 mt-6 mb-3">عنوان بروتوكول شبكة الإنترنت (IP)</h2>
          <p className="text-gray-700 leading-relaxed">
            في أي وقت تزور فيه أي موقع إنترنت بما فيها هذا الموقع، سيقوم السيرفر المضيف بتسجيل عنوان بروتوكول شبكة الإنترنت (IP) الخاص بك، تاريخ ووقت الزيارة، ونوع متصفح الإنترنت الذي تستخدمه والعنوان URL الخاص بأي موقع إنترنت يقوم بإحالتك إلى هذا الموقع.
          </p>

          <h2 className="text-xl font-bold text-teal-700 mt-6 mb-3">ملفات تعريف الارتباط (Cookies) وإعلانات Google</h2>
          <p className="text-gray-700 leading-relaxed">
            يستخدم هذا الموقع إعلانات Google AdSense و Google Analytics. قد تستخدم جهات خارجية، بما في ذلك Google، ملفات تعريف الارتباط لعرض الإعلانات استنادًا إلى زيارات المستخدم السابقة لموقعنا أو لمواقع أخرى على الويب.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>تستخدم Google ملفات تعريف الارتباط لعرض الإعلانات على موقعنا.</li>
            <li>يمكن للمستخدمين إلغاء الاشتراك في الإعلانات المخصصة عبر زيارة <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-teal-600 underline">إعدادات الإعلانات من Google</a>.</li>
          </ul>

          <h2 className="text-xl font-bold text-teal-700 mt-6 mb-3">إفشاء المعلومات</h2>
          <p className="text-gray-700 leading-relaxed">
            سنحافظ في كافة الأوقات على خصوصية وسرية كافة البيانات الشخصية التي نتحصل عليها. ولن يتم إفشاء هذه المعلومات إلا إذا كان ذلك مطلوباً بموجب أي قانون أو عندما نعتقد بحسن نية أن مثل هذا الإجراء سيكون مطلوباً أو مرغوباً فيه للتمشي مع القانون، أو للدفاع عن أو حماية حقوق الملكية الخاصة بهذا الموقع.
          </p>

          <h2 className="text-xl font-bold text-teal-700 mt-6 mb-3">الاتصال بنا</h2>
          <p className="text-gray-700 leading-relaxed">
            يمكنكم الاتصال بنا عند الحاجة من خلال الضغط على رابط اتصل بنا المتوفر في معلومات الموقع أو إرسال استفساركم عبر شبكات التواصل الاجتماعي الرسمية المرفقة في أسفل الصفحة.
          </p>
        </article>
      </main>

      <AdContainer placement="footer_ads" slotId={process.env.NEXT_PUBLIC_AD_SLOT_FOOTER ?? ''} className="py-2" />
    </>
  );
}
