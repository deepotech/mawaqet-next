import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <p className="text-6xl font-extrabold text-teal-200 mb-4">404</p>
      <h1 className="text-2xl font-bold text-teal-800 mb-3">
        الصفحة غير موجودة
      </h1>
      <p className="text-gray-500 text-sm mb-8 max-w-sm">
        الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          href="/"
          className="rounded-lg bg-teal-700 text-white px-5 py-2.5 text-sm font-semibold hover:bg-teal-800 transition-colors focus-visible:outline-2 focus-visible:outline-teal-600"
        >
          العودة للرئيسية
        </Link>
        <Link
          href="/country/prayer-times-in-morocco/"
          className="rounded-lg border border-gray-300 text-gray-700 px-5 py-2.5 text-sm font-semibold hover:border-teal-400 hover:text-teal-700 transition-colors"
        >
          مواقيت المغرب
        </Link>
      </div>
    </div>
  );
}
