import { describe, it, expect } from 'vitest';
import { CountrySchema, CitySchema, CityAliasSchema } from '../src/types/location';
import {
  DailyPrayerScheduleSchema,
  MonthlyPrayerScheduleSchema,
  PrayerCalculationConfigSchema,
  PrayerTimesMapSchema,
  FacilityOpeningHoursSchema,
  MosqueIqamahScheduleSchema,
} from '../src/types/prayer';

describe('Domain Types & Zod Schemas', () => {
  it('validates CountrySchema correctly', () => {
    const validCountry = {
      id: 1,
      slug: 'prayer-times-in-morocco',
      nameAr: 'المغرب',
      nameEn: 'morocco',
      code: 'MA',
      flagUrl: '/flags/ma.png',
      defaultMethodId: 15,
      legacyPostId: 289,
      totalCities: 30,
    };
    expect(() => CountrySchema.parse(validCountry)).not.toThrow();
  });

  it('rejects invalid country code', () => {
    const invalidCountry = {
      id: 1,
      slug: 'invalid',
      nameAr: 'بلد',
      nameEn: 'country',
      code: 'MAROC', // Not 2 characters
      flagUrl: '/flags/ma.png',
      defaultMethodId: 15,
      legacyPostId: 1,
      totalCities: 5,
    };
    expect(() => CountrySchema.parse(invalidCountry)).toThrow();
  });

  it('validates CitySchema with coordinates and timezone', () => {
    const validCity = {
      id: 1,
      countryId: 1,
      countryCode: 'MA',
      slug: 'prayer-times-in-casablanca',
      urlPath: '/city/prayer-times-in-casablanca/',
      nameAr: 'الدار البيضاء',
      nameEn: 'casablanca',
      coordinates: { latitude: 33.599976, longitude: -7.616367 },
      timezone: 'Africa/Casablanca',
      calculationMethodId: 15,
      legacyPostId: 31,
      verificationStatus: 'verified_exact',
      enrichmentSource: 'GeoNames (city-timezones)',
    };
    expect(() => CitySchema.parse(validCity)).not.toThrow();
  });

  it('validates architectural separation between calculated times and facility hours', () => {
    const facilityHours = {
      opensAt: '04:30',
      closesAt: '22:00',
      isOpenBetweenPrayersOnly: false,
      wheelchairAccessible: true,
      womenSectionAvailable: true,
    };
    expect(() => FacilityOpeningHoursSchema.parse(facilityHours)).not.toThrow();

    const iqamahSchedule = {
      fajr: { type: 'offset_after_adhan', value: 20 },
      dhuhr: { type: 'offset_after_adhan', value: 15 },
      asr: { type: 'offset_after_adhan', value: 15 },
      maghrib: { type: 'offset_after_adhan', value: 10 },
      isha: { type: 'offset_after_adhan', value: 20 },
      lastUpdated: new Date().toISOString(),
    };
    expect(() => MosqueIqamahScheduleSchema.parse(iqamahSchedule)).not.toThrow();
  });

  it('validates PrayerTimesMapSchema requires HH:mm format', () => {
    const validTimes = {
      fajr: '05:15',
      sunrise: '06:40',
      dhuhr: '12:30',
      asr: '15:45',
      maghrib: '18:15',
      isha: '19:35',
    };
    expect(() => PrayerTimesMapSchema.parse(validTimes)).not.toThrow();

    const invalidTimes = {
      ...validTimes,
      fajr: '5:15', // missing leading zero
    };
    expect(() => PrayerTimesMapSchema.parse(invalidTimes)).toThrow();
  });
});
