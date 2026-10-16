import { z } from 'zod';

/**
 * Calculation Method Identifier
 * Maps to established regional authorities and calculation conventions.
 */
export const CalculationMethodIdSchema = z.enum([
  'MWL', // Muslim World League (18/17)
  'ISNA', // Islamic Society of North America (15/15)
  'EGYPT', // Egyptian General Authority of Survey (19.5/17.5) - Method 3
  'MAKKAH', // Umm Al-Qura University, Makkah - Method 4
  'KARACHI', // University of Islamic Sciences, Karachi (18/18)
  'TEHRAN', // Institute of Geophysics, University of Tehran
  'GULF', // Gulf Region (19.5/90min) - Method 8 (Legacy default fallback)
  'KUWAIT', // Kuwait Ministry of Awqaf - Method 9
  'QATAR', // Qatar Ministry of Awqaf - Method 10
  'SINGAPORE', // Majlis Ugama Islam Singapura
  'FRANCE', // Union des Organisations Islamiques de France (12/12)
  'TURKEY', // Diyanet İşleri Başkanlığı - Method 13
  'MOROCCO', // Ministry of Endowments and Islamic Affairs / Moonsighting - Method 15
]);

export type CalculationMethodId = z.infer<typeof CalculationMethodIdSchema>;

export const MadhhabSchema = z.enum(['shafi', 'hanafi']);
export type Madhhab = z.infer<typeof MadhhabSchema>;

export const HighLatitudeRuleSchema = z.enum([
  'middle_of_the_night',
  'seventh_of_the_night',
  'twilight_angle',
]);
export type HighLatitudeRule = z.infer<typeof HighLatitudeRuleSchema>;

export const MinuteAdjustmentsSchema = z.object({
  fajr: z.number().int().default(0),
  sunrise: z.number().int().default(0),
  dhuhr: z.number().int().default(0),
  asr: z.number().int().default(0),
  maghrib: z.number().int().default(0),
  isha: z.number().int().default(0),
});
export type MinuteAdjustments = z.infer<typeof MinuteAdjustmentsSchema>;

export const MoroccoTimePolicySchema = z.enum(['gmt', 'civil']);
export type MoroccoTimePolicy = z.infer<typeof MoroccoTimePolicySchema>;

export const PrayerCalculationConfigSchema = z.object({
  method: CalculationMethodIdSchema,
  madhhab: MadhhabSchema.optional().default('shafi'),
  highLatitudeRule: HighLatitudeRuleSchema.optional(),
  adjustments: MinuteAdjustmentsSchema.optional(),
  moroccoTimePolicy: MoroccoTimePolicySchema.optional().default('gmt'),
});
export type PrayerCalculationConfig = z.input<typeof PrayerCalculationConfigSchema>;

export const PrayerNameSchema = z.enum([
  'fajr',
  'sunrise',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
]);
export type PrayerName = z.infer<typeof PrayerNameSchema>;

export const PrayerTimesMapSchema = z.object({
  fajr: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/), // HH:mm
  sunrise: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  dhuhr: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  asr: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  maghrib: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  isha: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
});
export type PrayerTimesMap = z.infer<typeof PrayerTimesMapSchema>;

export const HijriDateSchema = z.object({
  day: z.number().int().min(1).max(30),
  month: z.object({
    number: z.number().int().min(1).max(12),
    ar: z.string(),
    en: z.string(),
  }),
  year: z.number().int(),
  formattedAr: z.string(),
});
export type HijriDate = z.infer<typeof HijriDateSchema>;

export const GregorianDateSchema = z.object({
  day: z.number().int().min(1).max(31),
  month: z.object({
    number: z.number().int().min(1).max(12),
    ar: z.string(),
    en: z.string(),
  }),
  year: z.number().int(),
  weekdayAr: z.string(),
  formattedIso: z.string(), // YYYY-MM-DD
  formattedAr: z.string(),
});
export type GregorianDate = z.infer<typeof GregorianDateSchema>;

export const PrayerProviderMetadataSchema = z.object({
  provider: z.enum(['adhan_astronomical', 'aladhan_api_cache', 'fallback_offline']),
  calculationMethodName: z.string(),
  calculationAuthority: z.string(),
  fajrAngle: z.number().optional(),
  ishaAngle: z.number().optional(),
  ishaIntervalMinutes: z.number().optional(),
  timezone: z.string(),
  displayTimezone: z.string().optional(),
  computedAt: z.string().datetime(),
  isFallback: z.boolean().default(false),
});
export type PrayerProviderMetadata = z.infer<typeof PrayerProviderMetadataSchema>;

export const NextPrayerInfoSchema = z.object({
  current: PrayerNameSchema.nullable(),
  next: PrayerNameSchema,
  nextPrayerNameAr: z.string(),
  timeFormatted: z.string(),
  targetTimestampMs: z.number().int(),
  secondsRemaining: z.number().int(),
});
export type NextPrayerInfo = z.infer<typeof NextPrayerInfoSchema>;

/**
 * Pure Calculated Day Schedule (Astronomical)
 */
export const DailyPrayerScheduleSchema = z.object({
  dateIso: z.string(), // YYYY-MM-DD
  gregorian: GregorianDateSchema,
  hijri: HijriDateSchema,
  timings: PrayerTimesMapSchema,
  nextPrayer: NextPrayerInfoSchema.optional(),
  meta: PrayerProviderMetadataSchema,
});
export type DailyPrayerSchedule = z.infer<typeof DailyPrayerScheduleSchema>;

export const MonthlyPrayerScheduleSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  days: z.array(DailyPrayerScheduleSchema),
  meta: PrayerProviderMetadataSchema,
});
export type MonthlyPrayerSchedule = z.infer<typeof MonthlyPrayerScheduleSchema>;

// ============================================================================
// ARCHITECTURAL ISOLATION: Mosque, Iqamah, Jummah & Facility Concepts
// These types exist to strictly preserve domain separation and prevent conflating
// calculated times with iqamah schedules or facility opening hours.
// ============================================================================

export const IqamahOffsetRuleSchema = z.object({
  type: z.enum(['fixed_time', 'offset_after_adhan']),
  value: z.union([z.string(), z.number().int()]), // e.g., "13:30" or 15 (minutes)
});

export const MosqueIqamahScheduleSchema = z.object({
  fajr: IqamahOffsetRuleSchema,
  dhuhr: IqamahOffsetRuleSchema,
  asr: IqamahOffsetRuleSchema,
  maghrib: IqamahOffsetRuleSchema,
  isha: IqamahOffsetRuleSchema,
  lastUpdated: z.string().datetime(),
});

export const JummahScheduleSchema = z.object({
  khutbahTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  prayerTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  notes: z.string().optional(),
});

export const FacilityOpeningHoursSchema = z.object({
  opensAt: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  closesAt: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  isOpenBetweenPrayersOnly: z.boolean().default(false),
  wheelchairAccessible: z.boolean().default(true),
  womenSectionAvailable: z.boolean().default(true),
});
