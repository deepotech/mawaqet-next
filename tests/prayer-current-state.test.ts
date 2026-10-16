/**
 * prayer-current-state.test.ts
 *
 * Tests for the current/next prayer determination logic in PrayerTimeService.
 *
 * Reference schedule for Marrakesh, 2026-10-16 (GMT/UTC display):
 *   Fajr    05:10 UTC
 *   Sunrise 06:36 UTC  ← not a fard prayer
 *   Dhuhr   12:18 UTC
 *   Asr     15:31 UTC
 *   Maghrib 17:59 UTC
 *   Isha    19:15 UTC
 *
 * We inject `now` explicitly via the `now` parameter of calculateDailySchedule
 * so tests are fully deterministic regardless of system clock or TZ.
 */

import { describe, it, expect } from 'vitest';
import { prayerTimeService } from '../src/services/prayer-service';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const marrakeshCoords = { latitude: 31.6299931, longitude: -7.999987428 };
const marrakeshTz = 'Africa/Casablanca';
const moroccoConfig = { method: 'MOROCCO' as const };

/**
 * Calculate a daily schedule with both `date` (for calendar resolution) and
 * `now` (for prayer state evaluation) injected explicitly.
 */
function getSchedule(nowIso: string, dateIso = nowIso) {
  return prayerTimeService.calculateDailySchedule({
    coordinates: marrakeshCoords,
    timezone: marrakeshTz,
    date: new Date(dateIso),
    config: moroccoConfig,
    now: new Date(nowIso),
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Prayer current/next state — Marrakesh 2026-10-16', () => {
  /**
   * 1. Before Dhuhr
   * Clock: 10:00 UTC → after Fajr (05:10), after Sunrise (06:36), before Dhuhr (12:18)
   * Expected: current=fajr, next=dhuhr
   */
  it('before Dhuhr: current=fajr, next=dhuhr', () => {
    const s = getSchedule('2026-10-16T10:00:00Z');
    expect(s.nextPrayer).toBeDefined();
    expect(s.nextPrayer!.current).toBe('fajr');
    expect(s.nextPrayer!.next).toBe('dhuhr');
    // Sunrise must never be surfaced as current or next
    expect(s.nextPrayer!.current).not.toBe('sunrise');
    expect(s.nextPrayer!.next).not.toBe('sunrise');
  });

  /**
   * 2. After Dhuhr, before Asr
   * Clock: 13:00 UTC → after Dhuhr (12:18), before Asr (15:31)
   * Expected: current=dhuhr, next=asr
   */
  it('after Dhuhr before Asr: current=dhuhr, next=asr', () => {
    const s = getSchedule('2026-10-16T13:00:00Z');
    expect(s.nextPrayer).toBeDefined();
    expect(s.nextPrayer!.current).toBe('dhuhr');
    expect(s.nextPrayer!.next).toBe('asr');
  });

  /**
   * 3. After Asr, before Maghrib
   * Clock: 16:00 UTC → after Asr (15:31), before Maghrib (17:59)
   * Expected: current=asr, next=maghrib
   */
  it('after Asr before Maghrib: current=asr, next=maghrib', () => {
    const s = getSchedule('2026-10-16T16:00:00Z');
    expect(s.nextPrayer).toBeDefined();
    expect(s.nextPrayer!.current).toBe('asr');
    expect(s.nextPrayer!.next).toBe('maghrib');
  });

  /**
   * 4. After Maghrib, before Isha
   * Clock: 18:30 UTC → after Maghrib (17:59), before Isha (19:15)
   * Expected: current=maghrib, next=isha
   */
  it('after Maghrib before Isha: current=maghrib, next=isha', () => {
    const s = getSchedule('2026-10-16T18:30:00Z');
    expect(s.nextPrayer).toBeDefined();
    expect(s.nextPrayer!.current).toBe('maghrib');
    expect(s.nextPrayer!.next).toBe('isha');
  });

  /**
   * 5. Exactly at Isha time
   * Clock: 19:15 UTC = Isha time exactly
   * Expected: current=isha, next=fajr (tomorrow)
   */
  it('exactly at Isha: current=isha, next=fajr (tomorrow)', () => {
    const s = getSchedule('2026-10-16T19:15:00Z');
    expect(s.nextPrayer).toBeDefined();
    expect(s.nextPrayer!.current).toBe('isha');
    expect(s.nextPrayer!.next).toBe('fajr');
    // Next target must be strictly after the current clock
    expect(s.nextPrayer!.targetTimestampMs).toBeGreaterThan(
      new Date('2026-10-16T19:15:00Z').getTime(),
    );
    expect(s.nextPrayer!.secondsRemaining).toBeGreaterThan(0);
  });

  /**
   * 6. After Isha — the bug scenario
   * Clock: 19:16 UTC = 1 minute after Isha
   * Expected: current=isha, next=fajr (tomorrow), NOT dhuhr
   *
   * This is the exact bug scenario from the issue report:
   * «في وقت العشاء، تعرض الواجهة الرسالة حان وقت الظهر»
   */
  it('after Isha (bug scenario): current=isha, next=fajr — never dhuhr', () => {
    const s = getSchedule('2026-10-16T19:16:00Z');
    expect(s.nextPrayer).toBeDefined();
    // current must be isha, NOT null and NOT dhuhr
    expect(s.nextPrayer!.current).toBe('isha');
    // next must be fajr (tomorrow's), NOT dhuhr
    expect(s.nextPrayer!.next).toBe('fajr');
    expect(s.nextPrayer!.next).not.toBe('dhuhr');
    expect(s.nextPrayer!.current).not.toBe('dhuhr');
    // Countdown target is a future timestamp
    expect(s.nextPrayer!.targetTimestampMs).toBeGreaterThan(
      new Date('2026-10-16T19:16:00Z').getTime(),
    );
    // Remaining seconds must be positive
    expect(s.nextPrayer!.secondsRemaining).toBeGreaterThan(0);
  });

  /**
   * 7. After midnight
   * Clock: 00:30 UTC on 2026-10-17 → before Fajr (~05:09 for Oct 17)
   * Expected: next=fajr for Oct 17
   */
  it('after midnight (00:30 UTC Oct 17): next=fajr for Oct 17', () => {
    const s = getSchedule('2026-10-17T00:30:00Z');
    expect(s.nextPrayer).toBeDefined();
    expect(s.nextPrayer!.next).toBe('fajr');
    expect(s.nextPrayer!.targetTimestampMs).toBeGreaterThan(
      new Date('2026-10-17T00:30:00Z').getTime(),
    );
  });

  /**
   * 8. Sunrise is never the next fard prayer
   * Clock: 05:11 UTC → just after Fajr (05:10), before Sunrise (06:36)
   * Expected: current=fajr, next=dhuhr (not sunrise)
   */
  it('just after Fajr: next=dhuhr, sunrise is skipped', () => {
    const s = getSchedule('2026-10-16T05:11:00Z');
    expect(s.nextPrayer).toBeDefined();
    expect(s.nextPrayer!.current).toBe('fajr');
    expect(s.nextPrayer!.next).not.toBe('sunrise');
    expect(s.nextPrayer!.next).toBe('dhuhr');
  });

  /**
   * 9. Server TZ mismatch resilience
   * The schedule for 2026-10-16 must always yield the correct Marrakesh times
   * regardless of what the server's local timezone offset is, because the
   * service resolves the calendar date using the city's IANA timezone.
   *
   * We simulate "late evening UTC" where a UTC+1 server would think it's
   * Oct 17, but Africa/Casablanca is still on UTC so it should be Oct 16.
   */
  it('timezone mismatch resilience: correct Oct 16 schedule at 22:30 UTC', () => {
    const s = prayerTimeService.calculateDailySchedule({
      coordinates: marrakeshCoords,
      timezone: marrakeshTz,
      date: new Date('2026-10-16T22:30:00Z'),
      config: moroccoConfig,
      now: new Date('2026-10-16T22:30:00Z'),
    });
    // Timings must match the canonical Oct 16 Marrakesh schedule
    expect(s.timings.fajr).toBe('05:10');
    expect(s.timings.dhuhr).toBe('12:18');
    expect(s.timings.isha).toBe('19:15');
    expect(s.dateIso).toBe('2026-10-16');
    // After 19:15, current=isha and next=fajr (tomorrow)
    expect(s.nextPrayer).toBeDefined();
    expect(s.nextPrayer!.current).toBe('isha');
    expect(s.nextPrayer!.next).toBe('fajr');
  });

  /**
   * 10. nextPrayer is always defined — never undefined after Isha
   * The service must always populate nextPrayer even after the last prayer,
   * using tomorrow's Fajr as the fallback target.
   */
  it('nextPrayer is always defined — never undefined after Isha', () => {
    const s = getSchedule('2026-10-16T21:00:00Z');
    expect(s.nextPrayer).toBeDefined();
    expect(s.nextPrayer!.next).toBeDefined();
    expect(s.nextPrayer!.secondsRemaining).toBeGreaterThan(0);
    expect(s.nextPrayer!.targetTimestampMs).toBeGreaterThan(
      new Date('2026-10-16T21:00:00Z').getTime(),
    );
  });

  /**
   * 11. secondsRemaining is always ≥ 0 for any valid target
   */
  it('secondsRemaining is always non-negative', () => {
    for (const iso of [
      '2026-10-16T04:00:00Z',
      '2026-10-16T10:00:00Z',
      '2026-10-16T13:00:00Z',
      '2026-10-16T16:00:00Z',
      '2026-10-16T18:30:00Z',
      '2026-10-16T19:30:00Z',
      '2026-10-16T23:00:00Z',
    ]) {
      const s = getSchedule(iso);
      expect(s.nextPrayer?.secondsRemaining ?? 0).toBeGreaterThanOrEqual(0);
    }
  });
});
