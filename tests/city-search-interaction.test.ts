import { describe, it, expect, vi } from 'vitest';
import { searchCities, normalizeArabic } from '@/lib/data';
import { GET, SearchResult } from '@/app/api/search/route';

describe('Search Component Interaction & Logic Tests', () => {
  describe('Arabic Normalization for Search Input', () => {
    it('normalizes alef variants (أ, إ, آ, ٱ -> ا)', () => {
      expect(normalizeArabic('الإسكندرية')).toBe('الاسكندريه');
      expect(normalizeArabic('أسيوط')).toBe('اسيوط');
      expect(normalizeArabic('آسفي')).toBe('اسفي');
    });

    it('normalizes teh marbuta and alef maksura (ة -> ه, ى -> ي)', () => {
      expect(normalizeArabic('مكة المكرمة')).toBe('مكه المكرمه');
      expect(normalizeArabic('القرى')).toBe('القري');
    });

    it('strips tashkeel diacritics and tatweel', () => {
      expect(normalizeArabic('بَغْدَادُ')).toBe('بغداد');
      expect(normalizeArabic('دِمَـشْق')).toBe('دمشق');
    });

    it('matches user queries typed without hamza against accented city names', () => {
      const resultsWithoutHamza = searchCities('الاسكندرية');
      expect(resultsWithoutHamza.length).toBeGreaterThan(0);
      expect(resultsWithoutHamza[0].city.slug).toBe('prayer-times-in-alexandria');

      const resultsWithHamza = searchCities('الإسكندرية');
      expect(resultsWithHamza.length).toBeGreaterThan(0);
      expect(resultsWithHamza[0].city.slug).toBe('prayer-times-in-alexandria');
    });

    it('matches user queries typed without "ال" against cities having "ال"', () => {
      const results = searchCities('رياض');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].city.slug).toBe('prayer-times-in-riyadh');
    });
  });

  describe('Search API Contract & Canonical URL Selection', () => {
    it('always returns canonical urlPath in the format /city/[slug]/ for selection navigation', async () => {
      const req = new Request('http://localhost:3000/api/search/?q=baghdad');
      const res = await GET(req);
      expect(res.status).toBe(200);

      const results: SearchResult[] = await res.json();
      expect(results.length).toBeGreaterThan(0);

      for (const item of results) {
        // Selection must navigate to canonical city URL
        expect(item.urlPath).toBe(`/city/${item.slug}/`);
        expect(item.urlPath).toMatch(/^\/city\/[a-z0-9_-]+\/$/);
      }
    });

    it('returns empty array when query is less than 2 characters (preventing unnecessary network traffic)', async () => {
      const req1 = new Request('http://localhost:3000/api/search/?q=');
      const res1 = await GET(req1);
      expect(await res1.json()).toEqual([]);

      const req2 = new Request('http://localhost:3000/api/search/?q=b');
      const res2 = await GET(req2);
      expect(await res2.json()).toEqual([]);
    });

    it('preserves verified canonical city URLs for top hubs', async () => {
      const topTestHubs = [
        { query: 'casablanca', expectedSlug: 'prayer-times-in-casablanca', expectedPath: '/city/prayer-times-in-casablanca/' },
        { query: 'baghdad', expectedSlug: 'prayer-times-in-baghdad', expectedPath: '/city/prayer-times-in-baghdad/' },
        { query: 'riyadh', expectedSlug: 'prayer-times-in-riyadh', expectedPath: '/city/prayer-times-in-riyadh/' },
        { query: 'cairo', expectedSlug: 'prayer-times-in-cairo', expectedPath: '/city/prayer-times-in-cairo/' },
      ];

      for (const hub of topTestHubs) {
        const req = new Request(`http://localhost:3000/api/search/?q=${hub.query}`);
        const res = await GET(req);
        const data: SearchResult[] = await res.json();

        expect(data[0].slug).toBe(hub.expectedSlug);
        expect(data[0].urlPath).toBe(hub.expectedPath);
      }
    });
  });

  describe('Search State & Race Condition Safeguards Simulation', () => {
    it('simulates client-side request sequencing and stale response rejection', async () => {
      let activeRequestId = 0;
      let committedData: SearchResult[] = [];

      // Helper function simulating the CitySearch requestId guard
      async function dispatchSimulatedSearch(query: string, delayMs: number) {
        const requestId = ++activeRequestId;
        await new Promise((resolve) => setTimeout(resolve, delayMs));

        const req = new Request(`http://localhost:3000/api/search/?q=${query}`);
        const res = await GET(req);
        const data: SearchResult[] = await res.json();

        // Stale response guard
        if (requestId === activeRequestId) {
          committedData = data;
        }
      }

      // Dispatch slow initial query 'ca' (delay 50ms)
      const p1 = dispatchSimulatedSearch('ca', 50);
      // Dispatch fast subsequent query 'baghdad' (delay 10ms)
      const p2 = dispatchSimulatedSearch('baghdad', 10);

      await Promise.all([p1, p2]);

      // Even though 'ca' finished last, activeRequestId moved to 2 ('baghdad'),
      // so committedData must be 'baghdad' results!
      expect(committedData[0].slug).toBe('prayer-times-in-baghdad');
    });

    it('simulates abort controller cleanup without crashing', () => {
      const abortController = new AbortController();
      expect(abortController.signal.aborted).toBe(false);
      abortController.abort();
      expect(abortController.signal.aborted).toBe(true);
    });

    it('simulates keyboard navigation index cycling', () => {
      const resultsCount = 5;
      let activeIndex = -1;

      // Down arrow
      const handleArrowDown = () => {
        activeIndex = activeIndex < resultsCount - 1 ? activeIndex + 1 : 0;
      };

      // Up arrow
      const handleArrowUp = () => {
        activeIndex = activeIndex > 0 ? activeIndex - 1 : resultsCount - 1;
      };

      handleArrowDown();
      expect(activeIndex).toBe(0);
      handleArrowDown();
      expect(activeIndex).toBe(1);

      // Arrow up goes back
      handleArrowUp();
      expect(activeIndex).toBe(0);

      // Arrow up at top wraps to end
      handleArrowUp();
      expect(activeIndex).toBe(4);

      // Arrow down wraps to start
      handleArrowDown();
      expect(activeIndex).toBe(0);
    });
  });

  describe('Geolocation Haversine Distance & Nearest City Matching', () => {
    it('accurately resolves Rabat for coordinates in Morocco', async () => {
      const { findClosestCity, haversineDistanceKm } = await import('@/lib/data');
      // Test haversine distance between Rabat (34.020882, -6.841650) and Casablanca (33.5731104, -7.5898434) ~ 87 km
      const dist = haversineDistanceKm(34.020882, -6.841650, 33.5731104, -7.5898434);
      expect(dist).toBeGreaterThan(80);
      expect(dist).toBeLessThan(95);

      const closest = findClosestCity(34.02, -6.84);
      expect(closest).not.toBeNull();
      expect(closest?.city.slug).toBe('prayer-times-in-rabat');
      expect(closest?.distanceKm).toBeLessThan(5);
    });

    it('returns null when coordinates are invalid or out of range', async () => {
      const { findClosestCity } = await import('@/lib/data');
      expect(findClosestCity(999, 0)).toBeNull();
      expect(findClosestCity(NaN, 50)).toBeNull();
    });
  });
});
