import { describe, it, expect } from 'vitest';
import { prayerTimeService } from '@/services/prayer-service';
import {
  isCityIndependentlyVerified,
  INDEPENDENTLY_VERIFIED_CITY_SLUGS,
  getAllCities,
} from '@/lib/data';
import { SUPPORTED_METHODS } from '@/components/prayer/PrayerControls';
import type { CalculationMethodId } from '@/types/prayer';

describe('Prayer Controls & Calculation Engine Quality Assurance', () => {
  const testDate = new Date('2026-10-14T12:00:00Z');

  describe('Asr Madhab Control (Standard vs Hanafi)', () => {
    const testCities = [
      { name: 'Casablanca', coords: { latitude: 33.599976, longitude: -7.616367 }, tz: 'Africa/Casablanca', method: 'MOROCCO' as CalculationMethodId },
      { name: 'Riyadh', coords: { latitude: 24.640833, longitude: 46.772742 }, tz: 'Asia/Riyadh', method: 'MAKKAH' as CalculationMethodId },
      { name: 'Cairo', coords: { latitude: 30.044420, longitude: 31.235712 }, tz: 'Africa/Cairo', method: 'EGYPT' as CalculationMethodId },
      { name: 'Baghdad', coords: { latitude: 33.338649, longitude: 44.393869 }, tz: 'Asia/Baghdad', method: 'GULF' as CalculationMethodId },
    ];

    for (const city of testCities) {
      it(`accurately shifts Asr timing for ${city.name} when switching to Hanafi madhab`, () => {
        const standardSchedule = prayerTimeService.calculateDailySchedule({
          coordinates: city.coords,
          timezone: city.tz,
          date: testDate,
          config: { method: city.method, madhhab: 'shafi' },
        });

        const hanafiSchedule = prayerTimeService.calculateDailySchedule({
          coordinates: city.coords,
          timezone: city.tz,
          date: testDate,
          config: { method: city.method, madhhab: 'hanafi' },
        });

        // Hanafi Asr must be strictly later than Standard Asr (2x shadow vs 1x shadow)
        expect(hanafiSchedule.timings.asr > standardSchedule.timings.asr).toBe(true);

        // All other prayers must remain identical
        expect(hanafiSchedule.timings.fajr).toBe(standardSchedule.timings.fajr);
        expect(hanafiSchedule.timings.sunrise).toBe(standardSchedule.timings.sunrise);
        expect(hanafiSchedule.timings.dhuhr).toBe(standardSchedule.timings.dhuhr);
        expect(hanafiSchedule.timings.maghrib).toBe(standardSchedule.timings.maghrib);
        expect(hanafiSchedule.timings.isha).toBe(standardSchedule.timings.isha);
      });
    }
  });

  describe('Supported Calculation Methods Completeness', () => {
    it('verifies all 12 genuinely implemented methods produce valid and sequential prayer times', () => {
      expect(SUPPORTED_METHODS).toHaveLength(12);

      const ammanCoords = { latitude: 31.953949, longitude: 35.910635 };
      const ammanTz = 'Asia/Amman';

      for (const methodItem of SUPPORTED_METHODS) {
        const schedule = prayerTimeService.calculateDailySchedule({
          coordinates: ammanCoords,
          timezone: ammanTz,
          date: testDate,
          config: { method: methodItem.id, madhhab: 'shafi' },
        });

        expect(schedule.timings.fajr).toMatch(/^([01]\d|2[0-3]):([0-5]\d)$/);
        expect(schedule.timings.sunrise).toMatch(/^([01]\d|2[0-3]):([0-5]\d)$/);
        expect(schedule.timings.dhuhr).toMatch(/^([01]\d|2[0-3]):([0-5]\d)$/);
        expect(schedule.timings.asr).toMatch(/^([01]\d|2[0-3]):([0-5]\d)$/);
        expect(schedule.timings.maghrib).toMatch(/^([01]\d|2[0-3]):([0-5]\d)$/);
        expect(schedule.timings.isha).toMatch(/^([01]\d|2[0-3]):([0-5]\d)$/);

        // Sequence check: Fajr < Sunrise < Dhuhr < Asr < Maghrib < Isha
        expect(schedule.timings.fajr < schedule.timings.sunrise).toBe(true);
        expect(schedule.timings.sunrise < schedule.timings.dhuhr).toBe(true);
        expect(schedule.timings.dhuhr < schedule.timings.asr).toBe(true);
        expect(schedule.timings.asr < schedule.timings.maghrib).toBe(true);
        expect(schedule.timings.maghrib < schedule.timings.isha).toBe(true);
      }
    });
  });

  describe('Iraq and Syria Regional Conventions', () => {
    const baghdadCoords = { latitude: 33.338649, longitude: 44.393869 };
    const baghdadTz = 'Asia/Baghdad';

    it('documents the distinction between Gulf (legacy default), MWL (Sunni), and Tehran (Shia) conventions', () => {
      const gulfSchedule = prayerTimeService.calculateDailySchedule({
        coordinates: baghdadCoords,
        timezone: baghdadTz,
        date: testDate,
        config: { method: 'GULF' },
      });

      const mwlSchedule = prayerTimeService.calculateDailySchedule({
        coordinates: baghdadCoords,
        timezone: baghdadTz,
        date: testDate,
        config: { method: 'MWL' },
      });

      const tehranSchedule = prayerTimeService.calculateDailySchedule({
        coordinates: baghdadCoords,
        timezone: baghdadTz,
        date: testDate,
        config: { method: 'TEHRAN' },
      });

      // Gulf Isha is 90 minutes after Maghrib (17:30 + 90 min = 19:00)
      expect(gulfSchedule.timings.isha).toBe('19:00');

      // MWL Isha uses 17-degree twilight angle (earlier than Gulf fixed 90 min)
      expect(mwlSchedule.timings.isha).toBe('18:48');

      // Tehran Maghrib includes twilight delay until eastern redness clears (later than solar sunset)
      expect(tehranSchedule.timings.maghrib > mwlSchedule.timings.maghrib).toBe(true);
      expect(tehranSchedule.timings.maghrib).toBe('17:48');
      expect(mwlSchedule.timings.maghrib).toBe('17:30');
    });
  });

  describe('Verification Evidence Tiers & Level 4 Hubs Integrity', () => {
    it('accurately identifies exactly 42 representative Level 4 verified hubs', () => {
      expect(INDEPENDENTLY_VERIFIED_CITY_SLUGS.size).toBe(42);

      expect(isCityIndependentlyVerified('prayer-times-in-casablanca')).toBe(true);
      expect(isCityIndependentlyVerified('prayer-times-in-riyadh')).toBe(true);
      expect(isCityIndependentlyVerified('prayer-times-in-cairo')).toBe(true);
      expect(isCityIndependentlyVerified('prayer-times-in-baghdad')).toBe(true);
      expect(isCityIndependentlyVerified('prayer-times-in-damascus')).toBe(true);
      expect(isCityIndependentlyVerified('prayer-times-in-istanbul')).toBe(true);
    });

    it('ensures non-hub cities are NOT falsely labeled as independently verified', () => {
      const allCities = getAllCities();
      const verifiedCount = allCities.filter((c) => isCityIndependentlyVerified(c.slug)).length;
      const unverifiedCount = allCities.filter((c) => !isCityIndependentlyVerified(c.slug)).length;

      expect(verifiedCount).toBe(42);
      expect(unverifiedCount).toBe(328 - 42); // exactly 286 cities are Level 1-3 regional configurations
    });
  });
});
