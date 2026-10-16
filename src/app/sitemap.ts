import { MetadataRoute } from 'next';
import { getAllCities, getAllCountries } from '@/lib/data';

const BASE_URL = 'https://mawaqetsalat.com';

/**
 * Sitemap — covers all 328 city pages + 38 country pages + static pages.
 * Excludes /sample-page/ (retired), /embd/ (low value), and internal routes.
 *
 * Total: 328 + 38 + 4 static = 370 URLs
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const cities = getAllCities();
  const countries = getAllCountries();
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/countries/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/imsakia-ramadan/`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/developers/`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9/`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Country pages (38)
  const countryPages: MetadataRoute.Sitemap = countries.map((c) => ({
    url: `${BASE_URL}/country/${c.slug}/`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // City pages (328) — priority based on whether city has GSC clicks
  // Top cities get priority 0.9, others 0.7
  const highValueSlugs = new Set([
    'prayer-times-in-baghdad', 'prayer-times-in-casablanca', 'prayer-times-in-erbil',
    'prayer-times-in-najaf', 'prayer-times-in-agadir', 'prayer-times-in-basra',
    'prayer-times-in-beni-mellal', 'prayer-times-in-safi', 'prayer-times-in-temara',
    'prayer-times-in-oujda', 'prayer-times-in-rabat', 'prayer-times-in-homs',
    'prayer-times-in-berkane', 'prayer-times-in-errachidia', 'prayer-times-in-damascus',
    'prayer-times-in-sulaymaniyah', 'prayer-times-in-mosul', 'prayer-times-in-marrakesh',
    'prayer-times-in-tangier', 'prayer-times-in-sale', 'prayer-times-in-meknes',
    'prayer-times-in-nador', 'prayer-times-in-latakia', 'prayer-times-in-kenitra',
    'prayer-times-in-tetouan', 'prayer-times-in-taza',
  ]);

  const cityPages: MetadataRoute.Sitemap = cities.map((c) => ({
    url: `${BASE_URL}${c.urlPath}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: highValueSlugs.has(c.slug) ? 0.9 : 0.7,
  }));

  return [...staticPages, ...countryPages, ...cityPages];
}
