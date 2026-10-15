'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface CityResult {
  slug: string;
  nameArabic: string;
  nameEnglish: string;
  country: string;
  countryCode?: string;
  urlPath: string;
  distanceKm?: number;
}

export interface CitySearchProps {
  /** Placeholder text */
  placeholder?: string;
  /** Called when the user selects a result */
  onSelect?: (city: CityResult) => void;
  /** If true, navigates to the city page on selection */
  navigateOnSelect?: boolean;
  /** Optional custom class name */
  className?: string;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** If true, renders the "استخدم موقعي" geolocation button */
  showGeolocationButton?: boolean;
}

/**
 * CitySearch — Client Component.
 *
 * Debounced city search with RTL keyboard navigation, live region accessibility,
 * loading indicator, API error handling, stale response guards, and empty states.
 * Supports explicit GPS geolocation matching to the nearest city in the dataset.
 */
export default function CitySearch({
  placeholder = 'ابحث عن مدينتك... مثال: بغداد، الرياض، القاهرة',
  onSelect,
  navigateOnSelect = true,
  className = '',
  autoFocus = false,
  showGeolocationButton = true,
}: CitySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [statusMessage, setStatusMessage] = useState('');

  // Geolocation states
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoInfo, setGeoInfo] = useState<{ city: CityResult; distanceKm?: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const handleSelect = useCallback(
    (city: CityResult) => {
      setQuery(city.nameArabic);
      setOpen(false);
      setActiveIndex(-1);
      setError(null);
      setStatusMessage(`تم اختيار ${city.nameArabic}`);
      onSelect?.(city);
      if (navigateOnSelect) {
        router.push(city.urlPath);
      }
    },
    [navigateOnSelect, onSelect, router],
  );

  const search = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setError(null);
      setOpen(false);
      setStatusMessage('');
      setLoading(false);
      return;
    }

    // Abort previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    setStatusMessage('جاري البحث...');

    try {
      const res = await fetch(`/api/search/?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      });

      // Discard stale response if a newer request was dispatched
      if (currentRequestId !== requestIdRef.current) return;

      if (!res.ok) {
        throw new Error('حدث خطأ في الخادم أثناء البحث');
      }

      const data: CityResult[] = await res.json();

      if (currentRequestId !== requestIdRef.current) return;

      setResults(data);
      setOpen(true);
      setActiveIndex(-1);

      if (data.length === 0) {
        setStatusMessage(`لا توجد نتائج لـ "${trimmed}"`);
      } else {
        setStatusMessage(`تم العثور على ${data.length} مدينة`);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was aborted due to new input — do nothing
        return;
      }
      if (currentRequestId === requestIdRef.current) {
        setError('تعذر تحميل نتائج البحث. يرجى المحاولة لاحقاً.');
        setResults([]);
        setOpen(true);
        setStatusMessage('حدث خطأ أثناء البحث');
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // Debounced input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      search(val);
    }, 250);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setError(null);
    setOpen(false);
    setActiveIndex(-1);
    setStatusMessage('تم مسح البحث');
    inputRef.current?.focus();
  };

  // Explicit geolocation handler
  const handleGeolocation = async () => {
    setGeoError(null);
    setGeoInfo(null);

    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setGeoError('خاصية تحديد الموقع الجغرافي غير مدعومة في متصفحك.');
      return;
    }

    setGeoLoading(true);
    setStatusMessage('جاري تحديد موقعك الجغرافي...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const res = await fetch(`/api/search/?lat=${lat}&lon=${lon}`);
          if (!res.ok) {
            throw new Error('فشل الاستعلام عن أقرب مدينة');
          }
          const data: CityResult[] = await res.json();
          if (data && data.length > 0) {
            const closest = data[0];
            setGeoInfo({ city: closest, distanceKm: closest.distanceKm });
            setStatusMessage(`تم العثور على أقرب مدينة: ${closest.nameArabic}`);
          } else {
            setGeoError('تعذر العثور على مدينة مدعومة في قاعدة البيانات بالقرب من موقعك.');
          }
        } catch {
          setGeoError('حدث خطأ أثناء الاتصال للبحث عن أقرب مدينة لموقعك.');
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === 1) {
          setGeoError('تم رفض إذن الوصول إلى موقعك. يرجى البحث عن مدينتك يدوياً في خانة البحث.');
        } else if (err.code === 2) {
          setGeoError('تعذر تحديد موقعك الحالي بدقة. يرجى كتابة اسم المدينة يدوياً.');
        } else if (err.code === 3) {
          setGeoError('استغرق تحديد الموقع وقتاً طويلاً. يرجى كتابة اسم مدينتك في خانة البحث.');
        } else {
          setGeoError('تعذر تحديد الموقع الجغرافي. يرجى استخدام البحث اليدوي.');
        }
      },
      {
        timeout: 10000,
        maximumAge: 60000,
        enableHighAccuracy: false,
      },
    );
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      if (results.length > 0) {
        setOpen(true);
        setActiveIndex(0);
        e.preventDefault();
        return;
      }
    }

    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      if (results.length > 0) setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      if (results.length > 0) setActiveIndex(results.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        handleSelect(results[activeIndex]);
      } else if (results.length === 1) {
        handleSelect(results[0]);
      }
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const listId = 'city-search-listbox';
  const errorId = 'city-search-error';

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-xl ${className}`}
      role="search"
      aria-label="البحث عن مواقيت الصلاة في المدن"
    >
      {/* Accessible live region for screen readers */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </div>

      {/* Input container */}
      <div className="relative">
        <label htmlFor="city-search-input" className="sr-only">
          ابحث عن مدينتك لمعرفة مواقيت الصلاة
        </label>
        <input
          id="city-search-input"
          ref={inputRef}
          type="search"
          inputMode="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open && results.length > 0 ? listId : undefined}
          aria-activedescendant={activeIndex >= 0 ? `city-option-${activeIndex}` : undefined}
          aria-busy={loading}
          aria-describedby={error ? errorId : undefined}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0 || error) setOpen(true);
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full rounded-2xl border-2 border-teal-200 bg-white py-3.5 pr-11 pl-11 text-base text-gray-900 placeholder:text-gray-400 shadow-md focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all duration-200"
          dir="rtl"
        />

        {/* Search icon (right side in RTL) */}
        <span
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-teal-600 pointer-events-none"
          aria-hidden="true"
        >
          {loading ? (
            <svg
              className="w-5 h-5 animate-spin"
              width={20}
              height={20}
              fill="none"
              viewBox="0 0 24 24"
              aria-label="جاري التحميل"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              width={20}
              height={20}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
          )}
        </span>

        {/* Clear button (left side in RTL) */}
        {query.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
            aria-label="مسح نص البحث"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden backdrop-blur-sm">
          {/* Error State */}
          {error && (
            <div
              id={errorId}
              role="alert"
              className="p-4 text-center text-sm text-red-600 bg-red-50 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Results List */}
          {!error && results.length > 0 && (
            <ul
              id={listId}
              ref={listRef}
              role="listbox"
              aria-label="نتائج البحث عن المدن"
              className="max-h-72 overflow-y-auto py-1 divide-y divide-gray-50 text-right"
              dir="rtl"
            >
              {results.map((city, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <li
                    key={city.slug}
                    id={`city-option-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer text-sm transition-colors duration-150 ${
                      isSelected
                        ? 'bg-teal-50 text-teal-900 border-r-4 border-teal-600 font-semibold'
                        : 'text-gray-800 hover:bg-teal-50/50'
                    }`}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(city);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{city.nameArabic}</span>
                      <span className="text-gray-400 text-xs font-normal">({city.nameEnglish})</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                      {city.country}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Empty State */}
          {!error && results.length === 0 && !loading && query.trim().length >= 2 && (
            <div className="py-6 px-4 text-center text-sm text-gray-500">
              <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>لا توجد نتائج مطابقة لـ &ldquo;<span className="font-semibold text-gray-700">{query}</span>&rdquo;</p>
              <p className="text-xs text-gray-400 mt-1">تأكد من كتابة اسم المدينة بالعربية أو الإنجليزية</p>
            </div>
          )}
        </div>
      )}

      {/* Geolocation Trigger Button */}
      {showGeolocationButton && (
        <div className="mt-2.5 flex items-center justify-center">
          <button
            type="button"
            onClick={handleGeolocation}
            disabled={geoLoading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100/90 border border-teal-200/90 px-3.5 py-1.5 rounded-full transition-all duration-150 focus-visible:outline-2 focus-visible:outline-teal-600 focus-visible:outline-offset-2 disabled:opacity-60 shadow-xs cursor-pointer"
            aria-label="استخدم موقعي لتحديد أقرب مدينة"
          >
            {geoLoading ? (
              <svg className="w-3.5 h-3.5 animate-spin text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            <span>{geoLoading ? 'جاري تحديد موقعك...' : 'استخدم موقعي الحالي'}</span>
          </button>
        </div>
      )}

      {/* Geolocation Success Card */}
      {geoInfo && (
        <div
          role="status"
          className="mt-3 p-3.5 rounded-xl bg-teal-50/90 border border-teal-200 text-xs text-teal-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs"
          dir="rtl"
        >
          <div className="flex items-center gap-2">
            <span className="text-base shrink-0" aria-hidden="true">📍</span>
            <div>
              <p className="font-semibold text-gray-900">
                أقرب مدينة لموقعك: <strong className="text-teal-800">{geoInfo.city.nameArabic}</strong> ({geoInfo.city.country})
              </p>
              {geoInfo.distanceKm !== undefined && (
                <p className="text-gray-500 text-[11px] mt-0.5">
                  المسافة التقريبية: {Math.round(geoInfo.distanceKm)} كم
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => handleSelect(geoInfo.city)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-teal-700 cursor-pointer shadow-xs"
            >
              عرض مواقيت الصلاة
            </button>
            <button
              type="button"
              onClick={() => setGeoInfo(null)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
              aria-label="إغلاق إشعار الموقع"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Geolocation Error Alert */}
      {geoError && (
        <div
          role="alert"
          className="mt-3 p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-center justify-between gap-2 shadow-xs"
          dir="rtl"
        >
          <div className="flex items-center gap-2">
            <span className="text-base text-amber-600 shrink-0" aria-hidden="true">⚠️</span>
            <p className="text-gray-800">{geoError}</p>
          </div>
          <button
            type="button"
            onClick={() => setGeoError(null)}
            className="p-1 text-amber-600 hover:text-amber-800 rounded-md shrink-0 transition-colors"
            aria-label="إغلاق التنبيه"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
