import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { Coordinates, PrayerTimes, CalculationMethod, CalculationParameters } from 'adhan';
import { RawCity, RawCountry } from '@/lib/data';

describe('Phase 6A — Expansion Batch 3: Pakistan (4), Jordan (4), Syria (3), UAE (3), Qatar (2), Kuwait (2) Verification', () => {
  const citiesPath = path.join(__dirname, '../data/normalized/cities.json');
  const countriesPath = path.join(__dirname, '../data/normalized/countries.json');
  const legacyUrlsPath = path.join(__dirname, '../data/migration/legacy-urls.json');

  const cities: RawCity[] = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
  const countries: RawCountry[] = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));
  const legacyUrls: any[] = JSON.parse(fs.readFileSync(legacyUrlsPath, 'utf8'));

  const batch3Cities = cities.filter((c) => c.id >= 662 && c.id <= 679);

  describe('1. Dataset Volume and ID Sequencing', () => {
    it('contains exactly 679 cities and 40 countries', () => {
      expect(cities).toHaveLength(679);
      expect(countries).toHaveLength(40);
    });

    it('contains exactly 18 new cities in the expansion range 662..679', () => {
      expect(batch3Cities).toHaveLength(18);
      batch3Cities.forEach((city, index) => {
        expect(city.id).toBe(662 + index);
      });
    });

    it('ensures all 679 city IDs and slugs are unique (zero collisions)', () => {
      const ids = new Set(cities.map((c) => c.id));
      const slugs = new Set(cities.map((c) => c.slug));
      expect(ids.size).toBe(679);
      expect(slugs.size).toBe(679);
    });

    it('verifies all 18 new cities follow canonical slug and urlPath formats', () => {
      batch3Cities.forEach((city) => {
        expect(city.slug).toMatch(/^prayer-times-in-[a-z0-9_-]+$/);
        expect(city.urlPath).toBe(`/city/${city.slug}/`);
      });
    });

    it('confirms expected Sitemap URL total: 724 (5 static + 40 countries + 679 cities)', () => {
      const staticPages = 5;
      const expectedSitemapUrls = staticPages + countries.length + cities.length;
      expect(expectedSitemapUrls).toBe(724);
    });
  });

  describe('2. Exclusion of Syrian Quneitra and Preservation of Moroccan Kenitra', () => {
    it('strictly confirms absence of Syrian Quneitra from cities dataset', () => {
      const syrianQuneitra = cities.find(
        (c) =>
          c.slug === 'prayer-times-in-quneitra' ||
          (c.countryCode === 'SY' && c.nameAr.includes('قنيطرة'))
      );
      expect(syrianQuneitra).toBeUndefined();
    });

    it('confirms Moroccan Kenitra (ID: 225) remains intact and untouched', () => {
      const kenitra = cities.find((c) => c.id === 225)!;
      expect(kenitra).toBeDefined();
      expect(kenitra.slug).toBe('prayer-times-in-kenitra');
      expect(kenitra.countryCode).toBe('MA');
      expect(kenitra.nameAr).toBe('القنيطرة');
      expect(kenitra.nameEn).toBe('kenitra');
      expect(kenitra.calculationMethodId).toBe(15);
    });
  });

  describe('3. Country Totals & Specific City Allocations', () => {
    it('synchronizes Pakistan (PK) to exactly 18 cities with method 12', () => {
      const pk = countries.find((c) => c.code === 'PK')!;
      expect(pk.totalCities).toBe(18);
      const pkCities = cities.filter((c) => c.countryCode === 'PK');
      expect(pkCities).toHaveLength(18);

      const pkBatch3 = batch3Cities.filter((c) => c.countryCode === 'PK');
      expect(pkBatch3).toHaveLength(4);
      const expectedSlugs = [
        'prayer-times-in-islamabad',
        'prayer-times-in-gwadar',
        'prayer-times-in-abbottabad',
        'prayer-times-in-mardan',
      ];
      pkBatch3.forEach((c) => {
        expect(expectedSlugs).toContain(c.slug);
        expect(c.countryId).toBe(39);
        expect(c.calculationMethodId).toBe(12);
        expect(c.timezone).toBe('Asia/Karachi');
      });
    });

    it('synchronizes Jordan (JO) to exactly 14 cities with method 8', () => {
      const jo = countries.find((c) => c.code === 'JO')!;
      expect(jo.totalCities).toBe(14);
      const joCities = cities.filter((c) => c.countryCode === 'JO');
      expect(joCities).toHaveLength(14);

      const joBatch3 = batch3Cities.filter((c) => c.countryCode === 'JO');
      expect(joBatch3).toHaveLength(4);
      const expectedSlugs = [
        'prayer-times-in-tafilah',
        'prayer-times-in-ajloun',
        'prayer-times-in-ramtha',
        'prayer-times-in-wadi-musa',
      ];
      joBatch3.forEach((c) => {
        expect(expectedSlugs).toContain(c.slug);
        expect(c.countryId).toBe(16);
        expect(c.calculationMethodId).toBe(8);
        expect(c.timezone).toBe('Asia/Amman');
      });
    });

    it('synchronizes Syria (SY) to exactly 20 cities with method 8', () => {
      const sy = countries.find((c) => c.code === 'SY')!;
      expect(sy.totalCities).toBe(20);
      const syCities = cities.filter((c) => c.countryCode === 'SY');
      expect(syCities).toHaveLength(20);

      const syBatch3 = batch3Cities.filter((c) => c.countryCode === 'SY');
      expect(syBatch3).toHaveLength(3);
      const expectedSlugs = [
        'prayer-times-in-jableh',
        'prayer-times-in-douma',
        'prayer-times-in-salamiyah',
      ];
      syBatch3.forEach((c) => {
        expect(expectedSlugs).toContain(c.slug);
        expect(c.countryId).toBe(10);
        expect(c.calculationMethodId).toBe(8);
        expect(c.timezone).toBe('Asia/Damascus');
      });
    });

    it('synchronizes UAE (AE) to exactly 11 cities with method 8', () => {
      const ae = countries.find((c) => c.code === 'AE')!;
      expect(ae.totalCities).toBe(11);
      const aeCities = cities.filter((c) => c.countryCode === 'AE');
      expect(aeCities).toHaveLength(11);

      const aeBatch3 = batch3Cities.filter((c) => c.countryCode === 'AE');
      expect(aeBatch3).toHaveLength(3);
      const expectedSlugs = [
        'prayer-times-in-khor-fakkan',
        'prayer-times-in-madinat-zayed',
        'prayer-times-in-al-ruwais',
      ];
      aeBatch3.forEach((c) => {
        expect(expectedSlugs).toContain(c.slug);
        expect(c.countryId).toBe(6);
        expect(c.calculationMethodId).toBe(8);
        expect(c.timezone).toBe('Asia/Dubai');
      });
    });

    it('synchronizes Qatar (QA) to exactly 8 cities with method 10', () => {
      const qa = countries.find((c) => c.code === 'QA')!;
      expect(qa.totalCities).toBe(8);
      const qaCities = cities.filter((c) => c.countryCode === 'QA');
      expect(qaCities).toHaveLength(8);

      const qaBatch3 = batch3Cities.filter((c) => c.countryCode === 'QA');
      expect(qaBatch3).toHaveLength(2);
      const expectedSlugs = [
        'prayer-times-in-lusail',
        'prayer-times-in-madinat-ash-shamal',
      ];
      qaBatch3.forEach((c) => {
        expect(expectedSlugs).toContain(c.slug);
        expect(c.countryId).toBe(7);
        expect(c.calculationMethodId).toBe(10);
        expect(c.timezone).toBe('Asia/Qatar');
      });
    });

    it('synchronizes Kuwait (KW) to exactly 10 cities with method 9', () => {
      const kw = countries.find((c) => c.code === 'KW')!;
      expect(kw.totalCities).toBe(10);
      const kwCities = cities.filter((c) => c.countryCode === 'KW');
      expect(kwCities).toHaveLength(10);

      const kwBatch3 = batch3Cities.filter((c) => c.countryCode === 'KW');
      expect(kwBatch3).toHaveLength(2);
      const expectedSlugs = [
        'prayer-times-in-sabah-al-ahmad',
        'prayer-times-in-al-wafra',
      ];
      kwBatch3.forEach((c) => {
        expect(expectedSlugs).toContain(c.slug);
        expect(c.countryId).toBe(8);
        expect(c.calculationMethodId).toBe(9);
        expect(c.timezone).toBe('Asia/Kuwait');
      });
    });
  });

  describe('4. Geographic Coordinate Integrity & Terrestrial Bounds', () => {
    it('all 18 Batch 3 cities have valid WGS-84 coordinates within valid terrestrial limits', () => {
      batch3Cities.forEach((city) => {
        expect(city.coordinates.latitude).toBeGreaterThanOrEqual(-90);
        expect(city.coordinates.latitude).toBeLessThanOrEqual(90);
        expect(city.coordinates.longitude).toBeGreaterThanOrEqual(-180);
        expect(city.coordinates.longitude).toBeLessThanOrEqual(180);
      });
    });

    it('validates Pakistan coordinates within Pakistan bounding box', () => {
      batch3Cities
        .filter((c) => c.countryCode === 'PK')
        .forEach((c) => {
          expect(c.coordinates.latitude).toBeGreaterThan(23);
          expect(c.coordinates.latitude).toBeLessThan(37);
          expect(c.coordinates.longitude).toBeGreaterThan(60);
          expect(c.coordinates.longitude).toBeLessThan(78);
        });
    });

    it('validates Arabian Gulf (AE, QA, KW) coordinates within Gulf bounding box', () => {
      batch3Cities
        .filter((c) => ['AE', 'QA', 'KW'].includes(c.countryCode))
        .forEach((c) => {
          expect(c.coordinates.latitude).toBeGreaterThan(22);
          expect(c.coordinates.latitude).toBeLessThan(31);
          expect(c.coordinates.longitude).toBeGreaterThan(46);
          expect(c.coordinates.longitude).toBeLessThan(57);
        });
    });

    it('validates Levant (JO, SY) coordinates within Levant bounding box', () => {
      batch3Cities
        .filter((c) => ['JO', 'SY'].includes(c.countryCode))
        .forEach((c) => {
          expect(c.coordinates.latitude).toBeGreaterThan(29);
          expect(c.coordinates.latitude).toBeLessThan(38);
          expect(c.coordinates.longitude).toBeGreaterThan(34);
          expect(c.coordinates.longitude).toBeLessThan(43);
        });
    });
  });

  describe('5. Astronomical Solvability (4 Seasons)', () => {
    const seasons = [
      new Date('2026-01-15'), // Winter
      new Date('2026-04-15'), // Spring
      new Date('2026-07-15'), // Summer
      new Date('2026-10-15'), // Autumn
    ];

    function getMethodParams(methodId: number) {
      if (methodId === 8) {
        const p = new CalculationParameters('Other', 19.5, 0);
        p.ishaInterval = 90;
        return p;
      }
      if (methodId === 9) return CalculationMethod.Kuwait();
      if (methodId === 10) return CalculationMethod.Qatar();
      if (methodId === 12) return CalculationMethod.Karachi();
      throw new Error(`Unexpected methodId: ${methodId}`);
    }

    it('produces valid non-NaN timestamps for all 18 Batch 3 cities across all 4 seasons', () => {
      batch3Cities.forEach((city) => {
        const coords = new Coordinates(
          city.coordinates.latitude,
          city.coordinates.longitude
        );
        const params = getMethodParams(city.calculationMethodId);
        expect(params).toBeDefined();

        seasons.forEach((date) => {
          const pt = new PrayerTimes(coords, date, params);
          expect(pt.fajr).toBeInstanceOf(Date);
          expect(pt.sunrise).toBeInstanceOf(Date);
          expect(pt.dhuhr).toBeInstanceOf(Date);
          expect(pt.asr).toBeInstanceOf(Date);
          expect(pt.maghrib).toBeInstanceOf(Date);
          expect(pt.isha).toBeInstanceOf(Date);
          expect(isNaN(pt.fajr.getTime())).toBe(false);
          expect(isNaN(pt.isha.getTime())).toBe(false);
        });
      });
    });
  });

  describe('6. Historical Data Protection & Legacy URLs', () => {
    it('preserves all 661 pre-Batch-3 city records intact', () => {
      const preCities = cities.filter((c) => c.id <= 661);
      expect(preCities).toHaveLength(661);
      preCities.forEach((city, index) => {
        expect(city.id).toBe(index + 1);
      });
    });

    it('preserves 100% of the 372 historical legacy URLs without any collision', () => {
      expect(legacyUrls).toHaveLength(372);
      const batch3Slugs = new Set(batch3Cities.map((c) => c.slug));
      const batch3Paths = new Set(batch3Cities.map((c) => c.urlPath));

      legacyUrls.forEach((entry) => {
        expect(batch3Slugs.has(entry.legacySlug)).toBe(false);
        expect(batch3Paths.has(entry.originalPath)).toBe(false);
      });
    });
  });
});
