export default function IqamahDisclaimer() {
  return (
    <div
      className="rounded-2xl border border-teal-200 bg-teal-50/70 p-5 text-gray-800 shadow-sm"
      role="note"
      aria-label="تنبيه هام حول مواقيت الصلاة والإقامة"
    >
      <div className="flex items-start gap-3">
        <span className="text-teal-700 text-xl shrink-0 mt-0.5" aria-hidden="true">
          🕌
        </span>
        <div className="space-y-1.5 text-sm leading-relaxed">
          <h3 className="font-bold text-teal-900">
            تنبيه هام حول مواقيت الصلاة ومواعيد الإقامة في المساجد
          </h3>
          <p className="text-gray-700">
            المواقيت المعروضة في هذا الموقع هي <strong>مواقيت فلكية شرعية محسوبة</strong> لدخول
            وقت كل صلاة بناءً على الإحداثيات الجغرافية والمعايير الفلكية المعتمدة لكل مدينة.
          </p>
          <p className="text-gray-600 text-xs">
            <strong>مواعيد الإقامة وساعات المساجد:</strong> تختلف فترات الانتظار بين الأذان
            والإقامة وساعات فتح المساجد وفق تنظيم كل مسجد وتوجيهات إدارات الأوقاف المحلية،
            ولا يحدد هذا الموقع مواعيد الإقامة أو صلاة الجماعة الخاصة بأي مسجد محدد.
          </p>
        </div>
      </div>
    </div>
  );
}
