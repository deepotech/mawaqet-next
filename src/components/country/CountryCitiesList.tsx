'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { normalizeArabic } from '@/lib/data';

interface CityItem {
  id: number;
  slug: string;
  nameAr: string;
  nameEn: string;
  verificationStatus: string;
}

interface CountryCitiesListProps {
  cities: CityItem[];
  countryName: string;
}

export default function CountryCitiesList({ cities, countryName }: CountryCitiesListProps) {
  const [filterQuery, setFilterQuery] = useState('');

  const filtered = useMemo(() => {
    const qRaw = filterQuery.trim();
    if (!qRaw) return cities;

    const qLower = qRaw.toLowerCase();
    const qNorm = normalizeArabic(qRaw);
    const qWithoutAl = qNorm.startsWith('ال') ? qNorm.slice(2) : qNorm;

    return cities.filter((c) => {
      const arNorm = normalizeArabic(c.nameAr);
      const enLower = c.nameEn.toLowerCase();
      const arWithoutAl = arNorm.startsWith('ال') ? arNorm.slice(2) : arNorm;

      return (
        arNorm.includes(qNorm) ||
        enLower.includes(qLower) ||
        (qWithoutAl.length >= 2 && arWithoutAl.includes(qWithoutAl))
      );
    });
  }, [cities, filterQuery]);

  return (
    <div className="space-y-4">
      {/* Quick Search within Country */}
      {cities.length > 8 && (
        <div className="relative max-w-md">
          <label htmlFor="country-cities-filter" className="sr-only">
            ابحث في مدن {countryName}
          </label>
          <input
            id="country-cities-filter"
            type="search"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder={`ابحث في مدن ${countryName}...`}
            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pr-10 pl-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-xs"
            dir="rtl"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
          </span>
          {filterQuery && (
            <button
              type="button"
              onClick={() => setFilterQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              aria-label="مسح البحث"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Counter when filtering */}
      {filterQuery && (
        <p className="text-xs text-gray-500">
          تم العثور على {filtered.length} من أصل {cities.length} مدينة
        </p>
      )}

      {/* Grid of Cities */}
      {filtered.length > 0 ? (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3" role="list">
          {filtered.map((city) => (
            <li key={city.slug}>
              <Link
                href={`/city/${city.slug}/`}
                className="block rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm font-semibold text-gray-800 hover:border-teal-400 hover:text-teal-700 hover:shadow-md transition-all shadow-xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="block group-hover:text-teal-700 transition-colors">
                    {city.nameAr}
                  </span>
                  <span className="text-gray-300 group-hover:text-teal-500 transition-colors text-xs font-mono">
                    ←
                  </span>
                </div>
                <span className="text-[11px] text-gray-600 block font-normal mt-0.5 font-mono">
                  {city.nameEn}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-8 text-center bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600">
            لا توجد مدينة في {countryName} تطابق &ldquo;<strong className="text-gray-900">{filterQuery}</strong>&rdquo;
          </p>
          <button
            type="button"
            onClick={() => setFilterQuery('')}
            className="mt-3 text-xs text-teal-600 font-semibold hover:underline"
          >
            عرض جميع المدن ({cities.length})
          </button>
        </div>
      )}
    </div>
  );
}
