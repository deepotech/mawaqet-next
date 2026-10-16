import { describe, it, expect } from 'vitest';
import { prayerTimeService } from '../src/services/prayer-service';

describe('Prayer Time Calculation Service Contract', () => {
  const casablancaCoords = { latitude: 33.599976, longitude: -7.616367 };
  const casablancaTz = 'Africa/Casablanca';
  const testDate = new Date('2026-10-14T12:00:00Z');

  it('calculates valid daily prayer times conforming to schema', () => {
    const schedule = prayerTimeService.calculateDailySchedule({
      coordinates: casablancaCoords,
      timezone: casablancaTz,
      date: testDate,
      config: { method: 'MOROCCO', madhhab: 'shafi' },
    });

    expect(schedule.timings.fajr).toMatch(/^([01]\d|2[0-3]):([0-5]\d)$/);
    expect(schedule.timings.sunrise).toMatch(/^([01]\d|2[0-3]):([0-5]\d)$/);
    expect(schedule.timings.dhuhr).toMatch(/^([01]\d|2[0-3]):([0-5]\d)$/);
    expect(schedule.timings.asr).toMatch(/^([01]\d|2[0-3]):([0-5]\d)$/);
    expect(schedule.timings.maghrib).toMatch(/^([01]\d|2[0-3]):([0-5]\d)$/);
    expect(schedule.timings.isha).toMatch(/^([01]\d|2[0-3]):([0-5]\d)$/);

    expect(schedule.meta.provider).toBe('adhan_astronomical');
    expect(schedule.meta.timezone).toBe(casablancaTz);
    expect(schedule.hijri.year).toBeGreaterThanOrEqual(1448);
  });

  it('generates a complete monthly schedule with correct day count', () => {
    // October 2026 has 31 days
    const monthlyOct = prayerTimeService.calculateMonthlySchedule({
      coordinates: casablancaCoords,
      timezone: casablancaTz,
      year: 2026,
      month: 10,
      config: { method: 'MOROCCO' },
    });
    expect(monthlyOct.days.length).toBe(31);
    expect(monthlyOct.month).toBe(10);
    expect(monthlyOct.year).toBe(2026);

    // November 2026 has 30 days
    const monthlyNov = prayerTimeService.calculateMonthlySchedule({
      coordinates: casablancaCoords,
      timezone: casablancaTz,
      year: 2026,
      month: 11,
      config: { method: 'MOROCCO' },
    });
    expect(monthlyNov.days.length).toBe(30);

    // February 2026 has 28 days
    const monthlyFeb = prayerTimeService.calculateMonthlySchedule({
      coordinates: casablancaCoords,
      timezone: casablancaTz,
      year: 2026,
      month: 2,
      config: { method: 'MOROCCO' },
    });
    expect(monthlyFeb.days.length).toBe(28);
  });

  it('correctly shifts Asr timing when Hanafi madhhab is configured', () => {
    const shafiSchedule = prayerTimeService.calculateDailySchedule({
      coordinates: casablancaCoords,
      timezone: casablancaTz,
      date: testDate,
      config: { method: 'MOROCCO', madhhab: 'shafi' },
    });

    const hanafiSchedule = prayerTimeService.calculateDailySchedule({
      coordinates: casablancaCoords,
      timezone: casablancaTz,
      date: testDate,
      config: { method: 'MOROCCO', madhhab: 'hanafi' },
    });

    // Hanafi Asr is later than Shafi Asr
    expect(shafiSchedule.timings.asr).not.toBe(hanafiSchedule.timings.asr);
    expect(hanafiSchedule.timings.asr > shafiSchedule.timings.asr).toBe(true);

    // Fajr, Dhuhr, and Maghrib should remain identical
    expect(shafiSchedule.timings.fajr).toBe(hanafiSchedule.timings.fajr);
    expect(shafiSchedule.timings.dhuhr).toBe(hanafiSchedule.timings.dhuhr);
    expect(shafiSchedule.timings.maghrib).toBe(hanafiSchedule.timings.maghrib);
  });

  it('rejects invalid coordinates with descriptive errors', () => {
    expect(() =>
      prayerTimeService.calculateDailySchedule({
        coordinates: { latitude: 95.0, longitude: 0 }, // Lat > 90
        timezone: casablancaTz,
        date: testDate,
        config: { method: 'MOROCCO' },
      })
    ).toThrow(/Invalid geographic coordinates/);

    expect(() =>
      prayerTimeService.calculateDailySchedule({
        coordinates: { latitude: NaN, longitude: 0 },
        timezone: casablancaTz,
        date: testDate,
        config: { method: 'MOROCCO' },
      })
    ).toThrow(/Invalid geographic coordinates/);
  });

  it('rejects invalid month query in monthly schedule', () => {
    expect(() =>
      prayerTimeService.calculateMonthlySchedule({
        coordinates: casablancaCoords,
        timezone: casablancaTz,
        year: 2026,
        month: 13, // Invalid month
        config: { method: 'MOROCCO' },
      })
    ).toThrow(/Invalid month/);
  });

  describe('Morocco Prayer Time Presentation Policy & Regional Parity', () => {
    const marrakeshCoords = { latitude: 31.6299931, longitude: -7.999987428 };
    const dateOct16 = new Date('2026-10-16T12:00:00Z');

    it('displays Marrakesh prayer times in GMT (UTC+0) matching Moroccan Habous standard', () => {
      const schedule = prayerTimeService.calculateDailySchedule({
        coordinates: marrakeshCoords,
        timezone: 'Africa/Casablanca',
        date: dateOct16,
        config: { method: 'MOROCCO' },
      });

      // Astronomical Dhuhr transit at Marrakesh longitude (-8.0°) is 12:18 GMT
      expect(schedule.timings.dhuhr).toBe('12:18');
      expect(schedule.timings.fajr).toBe('05:10');
      expect(schedule.timings.sunrise).toBe('06:36');
      expect(schedule.timings.asr).toBe('15:31');
      expect(schedule.timings.maghrib).toBe('17:59');
      expect(schedule.timings.isha).toBe('19:15');

      expect(schedule.meta.displayTimezone).toBe('UTC');
      expect(schedule.meta.timezone).toBe('Africa/Casablanca');
    });

    it('supports explicit civil timezone override for Morocco if requested', () => {
      const schedule = prayerTimeService.calculateDailySchedule({
        coordinates: marrakeshCoords,
        timezone: 'Africa/Casablanca',
        date: dateOct16,
        config: { method: 'MOROCCO', moroccoTimePolicy: 'civil' },
      });

      expect(schedule.meta.displayTimezone).toBe('Africa/Casablanca');
    });

    it('guarantees date normalization prevents host machine midnight drift', () => {
      // 23:30 UTC on Oct 16 is already Oct 17 02:30 in Riyadh (UTC+3)
      const lateNightUtc = new Date('2026-10-16T23:30:00Z');

      const riyadhSchedule = prayerTimeService.calculateDailySchedule({
        coordinates: { latitude: 24.640833, longitude: 46.772742 },
        timezone: 'Asia/Riyadh',
        date: lateNightUtc,
        config: { method: 'MAKKAH' },
      });

      // Riyadh calendar date must be resolved to Oct 17
      expect(riyadhSchedule.gregorian.day).toBe(17);
      expect(riyadhSchedule.dateIso).toBe('2026-10-17');
    });

    it('ensures non-Moroccan cities remain completely unaffected by Moroccan time policy', () => {
      const riyadh = prayerTimeService.calculateDailySchedule({
        coordinates: { latitude: 24.640833, longitude: 46.772742 },
        timezone: 'Asia/Riyadh',
        date: dateOct16,
        config: { method: 'MAKKAH' },
      });
      expect(riyadh.meta.displayTimezone).toBe('Asia/Riyadh');
      expect(riyadh.meta.timezone).toBe('Asia/Riyadh');

      const cairo = prayerTimeService.calculateDailySchedule({
        coordinates: { latitude: 30.044420, longitude: 31.235712 },
        timezone: 'Africa/Cairo',
        date: dateOct16,
        config: { method: 'EGYPT' },
      });
      expect(cairo.meta.displayTimezone).toBe('Africa/Cairo');

      const baghdad = prayerTimeService.calculateDailySchedule({
        coordinates: { latitude: 33.338649, longitude: 44.393869 },
        timezone: 'Asia/Baghdad',
        date: dateOct16,
        config: { method: 'GULF' },
      });
      expect(baghdad.meta.displayTimezone).toBe('Asia/Baghdad');
      expect(baghdad.timings.dhuhr).toBe('11:48');
    });
  });
});
