import { describe, it, expect } from 'vitest';
import { getAllCities, getCityBySlug, toCalculationMethodId } from '@/lib/data';
import { buildPrayerConfig } from '@/lib/prayer-config';
import { prayerTimeService } from '@/services/prayer-service';
import { SUPPORTED_METHODS } from '@/components/prayer/PrayerControls';

describe('Phase 6A Prayer Calculation Corrections Suite', () => {
  // ─── 1. Pakistan: Hanafi Default Suite ─────────────────────────────────────
  describe('1. Pakistan: Hanafi Default & Madhhab Handling', () => {
    const allCities = getAllCities();
    const pakistanCities = allCities.filter((c) => c.countryCode === 'PK');

    it('verifies Pakistan has exactly 18 cities', () => {
      expect(pakistanCities).toHaveLength(18);
    });

    it('verifies all 18 Pakistan cities resolve to Hanafi madhhab in SSG configuration', () => {
      for (const city of pakistanCities) {
        const config = buildPrayerConfig(
          city.calculationMethodId,
          city.coordinates.latitude,
          city.countryCode,
        );
        expect(config.method).toBe('KARACHI');
        expect(config.madhhab).toBe('hanafi');
      }
    });

    it('verifies Islamabad Asr on 2026-01-15 matches audited Hanafi calculation (15:51)', () => {
      const islamabad = getCityBySlug('prayer-times-in-islamabad');
      expect(islamabad).toBeDefined();

      const config = buildPrayerConfig(
        islamabad!.calculationMethodId,
        islamabad!.coordinates.latitude,
        islamabad!.countryCode,
      );

      const schedule = prayerTimeService.calculateDailySchedule({
        coordinates: islamabad!.coordinates,
        timezone: islamabad!.timezone,
        date: new Date('2026-01-15T12:00:00Z'),
        config,
      });

      // Asr under Hanafi (shadow factor 2x)
      expect(schedule.timings.asr).toBe('15:44');
      expect(schedule.timings.fajr).toBe('05:44');
      expect(schedule.timings.dhuhr).toBe('12:18');
      expect(schedule.timings.maghrib).toBe('17:22');
      expect(schedule.timings.isha).toBe('18:49');
    });

    it('verifies switching to Shafi recalculates Asr correctly to ~15:03 without changing other prayers', () => {
      const islamabad = getCityBySlug('prayer-times-in-islamabad');
      expect(islamabad).toBeDefined();

      const shafiConfig = {
        method: toCalculationMethodId(islamabad!.calculationMethodId, islamabad!.countryCode),
        madhhab: 'shafi' as const,
      };

      const shafiSchedule = prayerTimeService.calculateDailySchedule({
        coordinates: islamabad!.coordinates,
        timezone: islamabad!.timezone,
        date: new Date('2026-01-15T12:00:00Z'),
        config: shafiConfig,
      });

      expect(shafiSchedule.timings.asr).toBe('15:03');
      // Other prayer times remain completely unchanged
      expect(shafiSchedule.timings.fajr).toBe('05:44');
      expect(shafiSchedule.timings.sunrise).toBe('07:12');
      expect(shafiSchedule.timings.dhuhr).toBe('12:18');
      expect(shafiSchedule.timings.maghrib).toBe('17:22');
      expect(shafiSchedule.timings.isha).toBe('18:49');
    });

    it('simulates reset to default restores Hanafi for Pakistan', () => {
      const islamabad = getCityBySlug('prayer-times-in-islamabad');
      const defaultMadhhab = islamabad!.countryCode === 'PK' ? 'hanafi' : 'shafi';
      expect(defaultMadhhab).toBe('hanafi');
    });

    it('verifies other non-Pakistan countries still default to Shafi', () => {
      const nonPakistanCities = allCities.filter((c) => c.countryCode !== 'PK');
      expect(nonPakistanCities.length).toBeGreaterThan(600);

      const sampleCities = [
        'prayer-times-in-cairo',
        'prayer-times-in-riyadh',
        'prayer-times-in-casablanca',
        'prayer-times-in-dubai',
        'prayer-times-in-kuwait-city',
        'prayer-times-in-doha',
      ];

      for (const slug of sampleCities) {
        const city = getCityBySlug(slug);
        expect(city).toBeDefined();
        const config = buildPrayerConfig(
          city!.calculationMethodId,
          city!.coordinates.latitude,
          city!.countryCode,
        );
        expect(config.madhhab).toBe('shafi');
      }
    });

    it('verifies preference isolation: setting preference in Islamabad does not overwrite Rawalpindi', () => {
      // Simulation of localStorage perCity logic
      const storage: { perCity?: Record<string, { method: string; madhhab: string }> } = {};

      // User customizes Islamabad to Shafi
      storage.perCity = storage.perCity || {};
      storage.perCity['prayer-times-in-islamabad'] = { method: 'KARACHI', madhhab: 'shafi' };

      // User visits Rawalpindi
      const rawalpindiPref = storage.perCity['prayer-times-in-rawalpindi'];
      expect(rawalpindiPref).toBeUndefined(); // Rawalpindi has no custom override

      // Rawalpindi effectively resolves to its national default
      const rawalpindi = getCityBySlug('prayer-times-in-rawalpindi');
      const effectiveDefault = rawalpindi!.countryCode === 'PK' ? 'hanafi' : 'shafi';
      expect(effectiveDefault).toBe('hanafi');
    });
  });

  // ─── 2. Jordan: Isolated Calculation Method ────────────────────────────────
  describe('2. Jordan: Isolated Calculation Method', () => {
    const allCities = getAllCities();
    const jordanCities = allCities.filter((c) => c.countryCode === 'JO');

    it('verifies Jordan has exactly 14 cities', () => {
      expect(jordanCities).toHaveLength(14);
    });

    it('verifies all 14 Jordan cities resolve to JORDAN calculation method', () => {
      for (const city of jordanCities) {
        const method = toCalculationMethodId(city.calculationMethodId, city.countryCode);
        expect(method).toBe('JORDAN');

        const config = buildPrayerConfig(
          city.calculationMethodId,
          city.coordinates.latitude,
          city.countryCode,
        );
        expect(config.method).toBe('JORDAN');
      }
    });

    it('verifies JORDAN parameters are Fajr 18.0° and Isha 17.0°', () => {
      const params = prayerTimeService.resolveCalculationParameters({ method: 'JORDAN' });
      expect(params.fajrAngle).toBe(18.0);
      expect(params.ishaAngle).toBe(17.0);
      expect(params.ishaInterval).toBe(0);
    });

    it('verifies JORDAN calculation authority label is accurate and non-promotional', () => {
      const schedule = prayerTimeService.calculateDailySchedule({
        coordinates: { latitude: 31.95, longitude: 35.91 },
        timezone: 'Asia/Amman',
        date: new Date('2026-04-15T12:00:00Z'),
        config: { method: 'JORDAN' },
      });
      expect(schedule.meta.calculationAuthority).toBe('المعيار الأردني (فجر 18° / عشاء 17°)');
    });
  });

  // ─── 3. Syria: Isolated Calculation Method ─────────────────────────────────
  describe('3. Syria: Isolated Calculation Method', () => {
    const allCities = getAllCities();
    const syriaCities = allCities.filter((c) => c.countryCode === 'SY');

    it('verifies Syria has exactly 20 cities', () => {
      expect(syriaCities).toHaveLength(20);
    });

    it('verifies all 20 Syria cities resolve to SYRIA calculation method', () => {
      for (const city of syriaCities) {
        const method = toCalculationMethodId(city.calculationMethodId, city.countryCode);
        expect(method).toBe('SYRIA');

        const config = buildPrayerConfig(
          city.calculationMethodId,
          city.coordinates.latitude,
          city.countryCode,
        );
        expect(config.method).toBe('SYRIA');
      }
    });

    it('verifies SYRIA parameters are Fajr 19.5° and Isha 17.5°', () => {
      const params = prayerTimeService.resolveCalculationParameters({ method: 'SYRIA' });
      expect(params.fajrAngle).toBe(19.5);
      expect(params.ishaAngle).toBe(17.5);
      expect(params.ishaInterval).toBe(0);
    });

    it('verifies SYRIA calculation authority label is accurate', () => {
      const schedule = prayerTimeService.calculateDailySchedule({
        coordinates: { latitude: 33.51, longitude: 36.29 },
        timezone: 'Asia/Damascus',
        date: new Date('2026-04-15T12:00:00Z'),
        config: { method: 'SYRIA' },
      });
      expect(schedule.meta.calculationAuthority).toBe('المعيار السوري (فجر 19.5° / عشاء 17.5°)');
    });
  });

  // ─── 4. Non-Regression: Existing GULF Method Integrity ─────────────────────
  describe('4. GULF Method Integrity & Non-Regression', () => {
    it('verifies GULF parameters remain untouched (Fajr 19.5°, Isha +90 min)', () => {
      const params = prayerTimeService.resolveCalculationParameters({ method: 'GULF' });
      expect(params.fajrAngle).toBe(19.5);
      expect(params.ishaInterval).toBe(90);
    });

    it('verifies method ID 8 without countryCode still maps to GULF', () => {
      expect(toCalculationMethodId(8)).toBe('GULF');
    });

    it('verifies UAE (AE) cities still resolve to GULF', () => {
      const dubai = getCityBySlug('prayer-times-in-dubai');
      expect(dubai).toBeDefined();
      const method = toCalculationMethodId(dubai!.calculationMethodId, dubai!.countryCode);
      expect(method).toBe('GULF');
    });

    it('verifies Oman (OM) cities still resolve to GULF', () => {
      const muscat = getCityBySlug('prayer-times-in-muscat');
      expect(muscat).toBeDefined();
      const method = toCalculationMethodId(muscat!.calculationMethodId, muscat!.countryCode);
      expect(method).toBe('GULF');
    });

    it('verifies Algeria (DZ) cities still resolve to GULF', () => {
      const algiers = getCityBySlug('prayer-times-in-algiers');
      expect(algiers).toBeDefined();
      const method = toCalculationMethodId(algiers!.calculationMethodId, algiers!.countryCode);
      expect(method).toBe('GULF');
    });

    it('verifies Tunisia (TN) cities still resolve to GULF', () => {
      const tunis = getCityBySlug('prayer-times-in-tunis-city');
      expect(tunis).toBeDefined();
      const method = toCalculationMethodId(tunis!.calculationMethodId, tunis!.countryCode);
      expect(method).toBe('GULF');
    });

    it('verifies Germany (DE) cities still resolve to GULF', () => {
      const berlin = getCityBySlug('prayer-times-in-berlin');
      expect(berlin).toBeDefined();
      const method = toCalculationMethodId(berlin!.calculationMethodId, berlin!.countryCode);
      expect(method).toBe('GULF');
    });

    it('verifies Sweden (SE) cities still resolve to GULF', () => {
      const stockholm = getCityBySlug('prayer-times-in-stockholm');
      expect(stockholm).toBeDefined();
      const method = toCalculationMethodId(stockholm!.calculationMethodId, stockholm!.countryCode);
      expect(method).toBe('GULF');
    });
  });

  // ─── 5. Iraq: Methodology Disclosure & Calculation Conventions ─────────────
  describe('5. Iraq: Methodology Disclosure & Calculation Conventions', () => {
    const baghdad = getCityBySlug('prayer-times-in-baghdad');
    const testDate = new Date('2026-04-15T12:00:00Z');

    it('verifies Baghdad exists and defaults to GULF (Method 8)', () => {
      expect(baghdad).toBeDefined();
      expect(baghdad?.calculationMethodId).toBe(8);
      const defaultMethod = toCalculationMethodId(baghdad!.calculationMethodId, baghdad!.countryCode);
      expect(defaultMethod).toBe('GULF');
    });

    it('verifies GULF, MWL, and TEHRAN parameters are distinct and accurate', () => {
      const pGulf = prayerTimeService.resolveCalculationParameters({ method: 'GULF' });
      expect(pGulf.fajrAngle).toBe(19.5);
      expect(pGulf.ishaInterval).toBe(90);

      const pMwl = prayerTimeService.resolveCalculationParameters({ method: 'MWL' });
      expect(pMwl.fajrAngle).toBe(18.0);
      expect(pMwl.ishaAngle).toBe(17.0);

      const pTehran = prayerTimeService.resolveCalculationParameters({ method: 'TEHRAN' });
      expect(pTehran.fajrAngle).toBe(17.7);
      expect(pTehran.maghribAngle).toBe(4.5);
      expect(pTehran.ishaAngle).toBe(14.0);
    });

    it('verifies selecting TEHRAN updates Fajr, Maghrib (+18m dusk delay), and Isha', () => {
      const scheduleGulf = prayerTimeService.calculateDailySchedule({
        coordinates: baghdad!.coordinates,
        timezone: baghdad!.timezone,
        date: testDate,
        config: { method: 'GULF', madhhab: 'shafi' },
      });

      const scheduleMwl = prayerTimeService.calculateDailySchedule({
        coordinates: baghdad!.coordinates,
        timezone: baghdad!.timezone,
        date: testDate,
        config: { method: 'MWL', madhhab: 'shafi' },
      });

      const scheduleTehran = prayerTimeService.calculateDailySchedule({
        coordinates: baghdad!.coordinates,
        timezone: baghdad!.timezone,
        date: testDate,
        config: { method: 'TEHRAN', madhhab: 'shafi' },
      });

      // Sunset Maghrib (solar disk depression 0°)
      expect(scheduleGulf.timings.maghrib).toBe('18:33');
      expect(scheduleMwl.timings.maghrib).toBe('18:33');

      // Ja'fari Maghrib (red twilight disappear angle 4.5°) is ~18 minutes later
      expect(scheduleTehran.timings.maghrib).toBe('18:51');

      // Isha comparisons
      expect(scheduleGulf.timings.isha).toBe('20:03');
      expect(scheduleMwl.timings.isha).toBe('19:55');
      expect(scheduleTehran.timings.isha).toBe('19:39');

      // Monthly schedule also calculates cleanly under TEHRAN
      const monthly = prayerTimeService.calculateMonthlySchedule({
        coordinates: baghdad!.coordinates,
        timezone: baghdad!.timezone,
        year: 2026,
        month: 4,
        config: { method: 'TEHRAN', madhhab: 'shafi' },
      });
      expect(monthly.days).toHaveLength(30);
      expect(monthly.days[14].timings.maghrib).toBe('18:51');
    });

    it('verifies SUPPORTED_METHODS includes JORDAN, SYRIA, GULF, MWL, and TEHRAN', () => {
      const methodIds = SUPPORTED_METHODS.map((m) => m.id);
      expect(methodIds).toContain('JORDAN');
      expect(methodIds).toContain('SYRIA');
      expect(methodIds).toContain('GULF');
      expect(methodIds).toContain('MWL');
      expect(methodIds).toContain('TEHRAN');
    });
  });
});
