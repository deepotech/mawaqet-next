import { describe, it, expect } from 'vitest';
import { prayerTimeService } from '../src/services/prayer-service';

describe('Prayer Calculation Comparison Fixtures & Regional Parity', () => {
  // Test reference date: October 14, 2026
  const refDate = new Date('2026-10-14T12:00:00Z');

  it('computes Casablanca, Morocco with Moroccan Habous / Moonsighting conventions (Method 15)', () => {
    const result = prayerTimeService.calculateDailySchedule({
      coordinates: { latitude: 33.599976, longitude: -7.616367 },
      timezone: 'Africa/Casablanca',
      date: refDate,
      config: { method: 'MOROCCO' },
    });

    expect(result.timings).toBeDefined();
    // Verify sequence: Fajr < Sunrise < Dhuhr < Asr < Maghrib < Isha
    expect(result.timings.fajr < result.timings.sunrise).toBe(true);
    expect(result.timings.sunrise < result.timings.dhuhr).toBe(true);
    expect(result.timings.dhuhr < result.timings.asr).toBe(true);
    expect(result.timings.asr < result.timings.maghrib).toBe(true);
    expect(result.timings.maghrib < result.timings.isha).toBe(true);

    expect(result.meta.calculationAuthority).toContain('وزارة الأوقاف والشؤون الإسلامية بالمغرب');
  });

  it('computes Riyadh, Saudi Arabia with Umm Al-Qura conventions (Method 4)', () => {
    const result = prayerTimeService.calculateDailySchedule({
      coordinates: { latitude: 24.640833, longitude: 46.772742 },
      timezone: 'Asia/Riyadh',
      date: refDate,
      config: { method: 'MAKKAH' },
    });

    expect(result.timings).toBeDefined();
    expect(result.meta.ishaIntervalMinutes).toBe(90); // Umm Al-Qura standard 90 min interval
    expect(result.meta.calculationAuthority).toContain('جامعة أم القرى');
  });

  it('computes Cairo, Egypt with Egyptian Survey Authority conventions (Method 3)', () => {
    const result = prayerTimeService.calculateDailySchedule({
      coordinates: { latitude: 30.044420, longitude: 31.235712 },
      timezone: 'Africa/Cairo',
      date: refDate,
      config: { method: 'EGYPT' },
    });

    expect(result.timings).toBeDefined();
    expect(result.meta.fajrAngle).toBe(19.5);
    expect(result.meta.ishaAngle).toBe(17.5);
    expect(result.meta.calculationAuthority).toContain('الهيئة المصرية العامة للمساحة');
  });

  it('documents Baghdad, Iraq calculation variance between legacy Method 8, MWL, and Tehran conventions', () => {
    const baghdadCoords = { latitude: 33.338649, longitude: 44.393869 };
    const baghdadTz = 'Asia/Baghdad';

    // 1. Legacy setting: Gulf Region (Method 8)
    const legacySchedule = prayerTimeService.calculateDailySchedule({
      coordinates: baghdadCoords,
      timezone: baghdadTz,
      date: refDate,
      config: { method: 'GULF' },
    });

    // 2. Standard Sunni convention: Muslim World League (MWL)
    const mwlSchedule = prayerTimeService.calculateDailySchedule({
      coordinates: baghdadCoords,
      timezone: baghdadTz,
      date: refDate,
      config: { method: 'MWL' },
    });

    // 3. Standard Shia convention: Tehran Leva Institute
    const tehranSchedule = prayerTimeService.calculateDailySchedule({
      coordinates: baghdadCoords,
      timezone: baghdadTz,
      date: refDate,
      config: { method: 'TEHRAN' },
    });

    // Discrepancy documented: MWL and Tehran apply a +1 minute safety offset after solar noon,
    // whereas raw Gulf calculation does not, resulting in 11:48 (Gulf) vs 11:49 (MWL/Tehran).
    expect(legacySchedule.timings.dhuhr).toBe('11:48');
    expect(mwlSchedule.timings.dhuhr).toBe('11:49');
    expect(tehranSchedule.timings.dhuhr).toBe('11:48');

    // Document expected variations:
    // Tehran Maghrib includes twilight delay (~10-15 min after sunset)
    expect(tehranSchedule.timings.maghrib >= mwlSchedule.timings.maghrib).toBe(true);

    // Gulf method Isha is +90 min after Maghrib, whereas MWL uses 17 deg angle
    expect(legacySchedule.timings.isha).not.toBe(mwlSchedule.timings.isha);
  });

  it('documents Damascus, Syria calculation parity between legacy Method 8 and MWL', () => {
    const damascusCoords = { latitude: 33.513807, longitude: 36.276528 };
    const damascusTz = 'Asia/Damascus';

    const legacySchedule = prayerTimeService.calculateDailySchedule({
      coordinates: damascusCoords,
      timezone: damascusTz,
      date: refDate,
      config: { method: 'GULF' },
    });

    const mwlSchedule = prayerTimeService.calculateDailySchedule({
      coordinates: damascusCoords,
      timezone: damascusTz,
      date: refDate,
      config: { method: 'MWL' },
    });

    // Discrepancy documented: Damascus Dhuhr is 12:21 under legacy Gulf vs 12:22 under MWL (+1 min safety offset)
    expect(legacySchedule.timings.dhuhr).toBe('12:21');
    expect(mwlSchedule.timings.dhuhr).toBe('12:22');
    expect(legacySchedule.timings.fajr).toBeDefined();
    expect(mwlSchedule.timings.fajr).toBeDefined();
  });
});
