import type { Metadata } from 'next';
import { getAllCities } from '@/lib/data';
import { buildPrayerConfig } from '@/lib/prayer-config';
import { prayerTimeService } from '@/services/prayer-service';
import { PRAYER_NAMES, type PrayerKey } from '@/lib/design-tokens';

export const metadata: Metadata = {
  title: 'مواقيت الصلاة — ويدجت التضمين',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EmbedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const citySlugParam = typeof params['city-s'] === 'string' ? params['city-s'] : 'casablanca';
  const cityArParam = typeof params['city-ar'] === 'string' ? params['city-ar'] : '';

  const cities = getAllCities();
  const matchedCity =
    cities.find((c) => c.slug === `prayer-times-in-${citySlugParam}` || c.nameEn.toLowerCase() === citySlugParam.toLowerCase()) ||
    cities[0];

  const cityName = cityArParam || matchedCity.nameAr;
  const config = buildPrayerConfig(matchedCity.calculationMethodId, matchedCity.coordinates.latitude);
  const now = new Date();

  let timings = { fajr: '—', sunrise: '—', dhuhr: '—', asr: '—', maghrib: '—', isha: '—' };
  try {
    const daily = prayerTimeService.calculateDailySchedule({
      coordinates: matchedCity.coordinates,
      timezone: matchedCity.timezone,
      date: now,
      config,
    });
    timings = daily.timings;
  } catch {
    // fallback
  }

  const dateFormatted = new Intl.DateTimeFormat('ar-MA', {
    timeZone: matchedCity.timezone,
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  }).format(now);

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm max-w-sm mx-auto font-sans" dir="rtl">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h1 className="text-base font-bold text-teal-800">مواقيت الصلاة في {cityName}</h1>
          <p className="text-xs text-gray-500">{dateFormatted}</p>
        </div>
        <span className="text-xl">🕌</span>
      </div>

      <ul className="divide-y divide-gray-100 my-2">
        {PRAYER_NAMES.map(({ key, arabicLabel }) => (
          <li key={key} className="py-2.5 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">{arabicLabel}</span>
            <span className="font-mono font-bold text-teal-900">{timings[key as PrayerKey]}</span>
          </li>
        ))}
      </ul>

      <div className="pt-2 border-t border-gray-100 text-center">
        <a
          href={`https://mawaqetsalat.com${matchedCity.urlPath}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-teal-600 hover:text-teal-800 hover:underline"
        >
          المزيد على مواقيت الصلاة
        </a>
      </div>
    </div>
  );
}
