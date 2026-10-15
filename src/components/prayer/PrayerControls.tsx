'use client';

import { useState } from 'react';
import type { CalculationMethodId, Madhhab } from '@/types/prayer';

export interface MethodOption {
  id: CalculationMethodId;
  nameAr: string;
  authority: string;
  parameters: string;
}

export const SUPPORTED_METHODS: MethodOption[] = [
  {
    id: 'MOROCCO',
    nameAr: 'وزارة الأوقاف والشؤون الإسلامية بالمغرب',
    authority: 'المملكة المغربية',
    parameters: 'فجر 19.0° / عشاء 17.0°',
  },
  {
    id: 'MAKKAH',
    nameAr: 'جامعة أم القرى، مكة المكرمة',
    authority: 'المملكة العربية السعودية',
    parameters: 'فجر 18.5° / عشاء بعد 90 دقيقة',
  },
  {
    id: 'EGYPT',
    nameAr: 'الهيئة المصرية العامة للمساحة',
    authority: 'جمهورية مصر العربية',
    parameters: 'فجر 19.5° / عشاء 17.5°',
  },
  {
    id: 'KUWAIT',
    nameAr: 'وزارة الأوقاف والشؤون الإسلامية بالكويت',
    authority: 'دولة الكويت',
    parameters: 'فجر 18.0° / عشاء 17.5°',
  },
  {
    id: 'QATAR',
    nameAr: 'وزارة الأوقاف والشؤون الإسلامية بقطر',
    authority: 'دولة قطر',
    parameters: 'فجر 18.0° / عشاء بعد 90 دقيقة',
  },
  {
    id: 'TURKEY',
    nameAr: 'رئاسة الشؤون الدينية التركية (Diyanet)',
    authority: 'الجمهورية التركية',
    parameters: 'فجر 18.0° / عشاء 17.0°',
  },
  {
    id: 'TEHRAN',
    nameAr: 'معهد الجيوفيزياء بجامعة طهران',
    authority: 'جامعة طهران / التقويم الشرعي',
    parameters: 'فجر 17.7° / مغرب بزاوية الشفق 4.5° / عشاء 14.0°',
  },
  {
    id: 'GULF',
    nameAr: 'معيار منطقة الخليج العربي',
    authority: 'دبي والخليج (المعيار التراثي للموقع)',
    parameters: 'فجر 19.5° / عشاء بعد 90 دقيقة',
  },
  {
    id: 'MWL',
    nameAr: 'رابطة العالم الإسلامي (MWL)',
    authority: 'مكة المكرمة / معيار دولي',
    parameters: 'فجر 18.0° / عشاء 17.0°',
  },
  {
    id: 'ISNA',
    nameAr: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)',
    authority: 'أمريكا الشمالية وكندا',
    parameters: 'فجر 15.0° / عشاء 15.0°',
  },
  {
    id: 'KARACHI',
    nameAr: 'جامعة العلوم الإسلامية بكراتشي',
    authority: 'باكستان وشبه القارة الهندية',
    parameters: 'فجر 18.0° / عشاء 18.0°',
  },
  {
    id: 'SINGAPORE',
    nameAr: 'المجلس الإسلامي السنغافوري (MUIS)',
    authority: 'سنغافورة وجنوب شرق آسيا',
    parameters: 'فجر 20.0° / عشاء 18.0°',
  },
];

export interface PrayerControlsProps {
  currentMethod: CalculationMethodId;
  defaultMethod: CalculationMethodId;
  currentMadhhab: Madhhab;
  defaultMadhhab: Madhhab;
  countryCode: string;
  cityName: string;
  countryName: string;
  isCustomized: boolean;
  isIndependentlyVerified: boolean;
  onMethodChange: (method: CalculationMethodId) => void;
  onMadhhabChange: (madhhab: Madhhab) => void;
  onReset: () => void;
}

export default function PrayerControls({
  currentMethod,
  defaultMethod,
  currentMadhhab,
  defaultMadhhab,
  countryCode,
  cityName,
  countryName,
  isCustomized,
  isIndependentlyVerified,
  onMethodChange,
  onMadhhabChange,
  onReset,
}: PrayerControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeMethodObj = SUPPORTED_METHODS.find((m) => m.id === currentMethod);
  const isIraqOrSyria = countryCode === 'IQ' || countryCode === 'SY';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      {/* ── Summary & Trigger Bar ── */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/70 border-b border-gray-100">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">
              إعدادات حساب مواقيت الصلاة في {cityName}
            </h3>
            {/* Customization Badge */}
            {isCustomized ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                معدل وفق اختيارك
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
                الإعداد الافتراضي للمدينة
              </span>
            )}

            {/* Evidence Verification Badge */}
            {isIndependentlyVerified ? (
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                title="تمت مطابقة مواقيت هذه المدينة مع مراجع فلكية ورسمية مستقلة"
              >
                مستوى التحقق 4 (مقارنة معتمدة)
              </span>
            ) : (
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                title="مواقيت فلكية محسوبة وفق الإحداثيات والمعايير الإقليمية"
              >
                مستوى التحقق 3 (حساب فلكي إقليمي)
              </span>
            )}
          </div>

          <p className="text-xs text-gray-600">
            الطريقة: <strong className="text-gray-800">{activeMethodObj?.nameAr ?? currentMethod}</strong>
            {' — '}
            المذهب في العصر: <strong className="text-gray-800">{currentMadhhab === 'hanafi' ? 'الحنفي (ظل الشيء مثليه)' : 'الجمهور (الشافعي، المالكي، الحنبلي)'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {isCustomized && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              استعادة الافتراضي
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3.5 py-1.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <span>{isOpen ? 'إخفاء الخيارات' : 'تخصيص الطريقة والمذهب'}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Expandable Controls Panel ── */}
      {isOpen && (
        <div className="p-5 sm:p-6 space-y-6 bg-white" dir="rtl">
          {/* 1. Asr Madhab Control */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-bold text-gray-900 mb-1">
              مذهب حساب وقت صلاة العصر (طول الظل)
            </legend>
            <p className="text-xs text-gray-500 mb-2">
              يؤثر اختيار المذهب على وقت صلاة العصر فقط، بينما تظل سائر الصلوات دون تغيير.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  currentMadhhab === 'shafi'
                    ? 'border-teal-500 bg-teal-50/50 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="madhhab"
                  value="shafi"
                  checked={currentMadhhab === 'shafi'}
                  onChange={() => onMadhhabChange('shafi')}
                  className="mt-0.5 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <span className="block text-sm font-bold text-gray-900">
                    الجمهور (الشافعي، المالكي، الحنبلي){defaultMadhhab === 'shafi' ? ' — الافتراضي' : ''}
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    يدخل وقت العصر إذا صار ظل كل شيء مثله سوى ظل الزوال (المعيار الشائع في معظم العالم الإسلامي).
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  currentMadhhab === 'hanafi'
                    ? 'border-teal-500 bg-teal-50/50 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="madhhab"
                  value="hanafi"
                  checked={currentMadhhab === 'hanafi'}
                  onChange={() => onMadhhabChange('hanafi')}
                  className="mt-0.5 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <span className="block text-sm font-bold text-gray-900">
                    المذهب الحنفي
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    يدخل وقت العصر إذا صار ظل كل شيء مثليه سوى ظل الزوال (يتأخر العصر قرابة 45-60 دقيقة).
                  </span>
                </div>
              </label>
            </div>
          </fieldset>

          {/* 2. Special Iraq & Syria Regional Options */}
          {isIraqOrSyria && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-blue-700 font-bold text-sm">
                  📌 إيضاح هام لخيارات الحساب في {countryName}:
                </span>
              </div>
              <p className="text-xs text-blue-900 leading-relaxed">
                في {countryName}، تختلف الجهات الفقهية في تحديد الزوايا الفلكية؛ فالأوقاف السنية
                تعتمد غالباً معيار <strong>رابطة العالم الإسلامي</strong> (18° / 17°)، بينما تعتمد
                المراجع الشيعية معيار <strong>معهد الجيوفيزياء بطهران</strong> (17.7° وتأخير المغرب
                لمغيب الشفق الأحمر)، في حين اعتمدت قاعدة البيانات التراثية للموقع <strong>معيار الخليج</strong>.
                الموقع يعرض هذه الخيارات بموضوعية وحياد كامل دون إلزام:
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onMethodChange('GULF')}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                    currentMethod === 'GULF'
                      ? 'bg-blue-700 text-white border-blue-700'
                      : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  معيار الخليج (الافتراضي التراثي)
                </button>
                <button
                  type="button"
                  onClick={() => onMethodChange('MWL')}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                    currentMethod === 'MWL'
                      ? 'bg-blue-700 text-white border-blue-700'
                      : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  رابطة العالم الإسلامي (معتمد الأوقاف السنية)
                </button>
                <button
                  type="button"
                  onClick={() => onMethodChange('TEHRAN')}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                    currentMethod === 'TEHRAN'
                      ? 'bg-blue-700 text-white border-blue-700'
                      : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  معهد طهران (معتمد المراجع الشيعية)
                </button>
              </div>
            </div>
          )}

          {/* 3. All Calculation Methods Selector */}
          <div className="space-y-2">
            <label htmlFor="calculation-method-select" className="block text-sm font-bold text-gray-900">
              طريقة الحساب الفلكية المعتمدة
            </label>
            <p className="text-xs text-gray-500">
              اختر الهيئة أو الطريقة الفلكية لحساب زاويتي الفجر والعشاء.
            </p>
            <select
              id="calculation-method-select"
              value={currentMethod}
              onChange={(e) => onMethodChange(e.target.value as CalculationMethodId)}
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 px-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              {SUPPORTED_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nameAr} ({m.parameters}) {m.id === defaultMethod ? '— [افتراضي المدينة]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Active Method Parameters Summary */}
          {activeMethodObj && (
            <div className="bg-gray-50 rounded-xl p-3.5 text-xs text-gray-600 border border-gray-200">
              <span className="font-bold text-gray-800">{activeMethodObj.nameAr}:</span>{' '}
              {activeMethodObj.parameters} — الجهة: {activeMethodObj.authority}.
            </div>
          )}

          {/* 5. Safe Usage Disclaimer */}
          <div className="text-xs text-gray-500 leading-relaxed pt-2 border-t border-gray-100">
            <strong>تذكير:</strong> تغيير إعدادات الحساب يتم حفظه محلياً في متصفحك لراحتك.
            تغيير الطريقة أو المذهب يؤثر على الحسابات الفلكية المعروضة على هذه الصفحة فقط،
            ولا يغير مواعيد الإقامة أو صلاة الجماعة المعتمدة داخل المساجد.
          </div>
        </div>
      )}
    </div>
  );
}
