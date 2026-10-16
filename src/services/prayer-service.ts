import {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  Madhab,
  HighLatitudeRule,
  CalculationParameters,
} from 'adhan';
import {
  DailyPrayerSchedule,
  DailyPrayerScheduleSchema,
  MonthlyPrayerSchedule,
  MonthlyPrayerScheduleSchema,
  PrayerCalculationConfig,
  PrayerName,
  NextPrayerInfo,
  CalculationMethodId,
} from '../types/prayer';


const ARABIC_GREGORIAN_MONTHS: Record<number, string> = {
  1: 'يناير',
  2: 'فبراير',
  3: 'مارس',
  4: 'أبريل',
  5: 'مايو',
  6: 'يونيو',
  7: 'يوليو',
  8: 'أغسطس',
  9: 'سبتمبر',
  10: 'أكتوبر',
  11: 'نوفمبر',
  12: 'ديسمبر',
};

const ARABIC_HIJRI_MONTHS: Record<number, string> = {
  1: 'محرم',
  2: 'صفر',
  3: 'ربيع الأول',
  4: 'ربيع الثاني',
  5: 'جمادى الأولى',
  6: 'جمادى الآخرة',
  7: 'رجب',
  8: 'شعبان',
  9: 'رمضان',
  10: 'شوال',
  11: 'ذو القعدة',
  12: 'ذو الحجة',
};

const PRAYER_NAMES_AR: Record<PrayerName, string> = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

export interface CalculateDailyParams {
  coordinates: { latitude: number; longitude: number };
  timezone: string;
  date: Date;
  config: PrayerCalculationConfig;
}

export interface CalculateMonthlyParams {
  coordinates: { latitude: number; longitude: number };
  timezone: string;
  year: number;
  month: number; // 1-12
  config: PrayerCalculationConfig;
}

export class PrayerTimeService {
  /**
   * Resolve adhan library calculation parameters from our domain method configuration
   */
  public resolveCalculationParameters(config: PrayerCalculationConfig): CalculationParameters {
    let params: CalculationParameters;

    switch (config.method) {
      case 'MAKKAH':
        params = CalculationMethod.UmmAlQura();
        break;
      case 'EGYPT':
        params = CalculationMethod.Egyptian();
        break;
      case 'KUWAIT':
        params = CalculationMethod.Kuwait();
        break;
      case 'QATAR':
        params = CalculationMethod.Qatar();
        break;
      case 'GULF':
        // Gulf Region (AlAdhan Method 8): 19.5 deg Fajr, 90 min Isha interval
        params = new CalculationParameters('Dubai', 19.5, 0);
        params.ishaInterval = 90;
        break;
      case 'MOROCCO':
        // Moroccan Ministry of Islamic Affairs uses 19.0 deg Fajr and 17.0 deg Isha
        params = new CalculationParameters('MoonsightingCommittee', 19.0, 17.0);
        break;
      case 'FRANCE':
        // Union des Organisations Islamiques de France (UOIF): 12.0 deg Fajr and 12.0 deg Isha
        params = new CalculationParameters('Other', 12.0, 12.0);
        break;
      case 'TURKEY':
        params = CalculationMethod.Turkey();
        break;
      case 'TEHRAN':
        params = CalculationMethod.Tehran();
        break;
      case 'ISNA':
        params = CalculationMethod.NorthAmerica();
        break;
      case 'KARACHI':
        params = CalculationMethod.Karachi();
        break;
      case 'SINGAPORE':
        params = CalculationMethod.Singapore();
        break;
      case 'MWL':
      default:
        params = CalculationMethod.MuslimWorldLeague();
        break;
    }

    if (config.madhhab === 'hanafi') {
      params.madhab = Madhab.Hanafi;
    } else {
      params.madhab = Madhab.Shafi;
    }

    if (config.highLatitudeRule === 'seventh_of_the_night') {
      params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
    } else if (config.highLatitudeRule === 'twilight_angle') {
      params.highLatitudeRule = HighLatitudeRule.TwilightAngle;
    } else if (config.highLatitudeRule === 'middle_of_the_night') {
      params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
    }

    if (config.adjustments) {
      params.adjustments.fajr = config.adjustments.fajr || 0;
      params.adjustments.sunrise = config.adjustments.sunrise || 0;
      params.adjustments.dhuhr = config.adjustments.dhuhr || 0;
      params.adjustments.asr = config.adjustments.asr || 0;
      params.adjustments.maghrib = config.adjustments.maghrib || 0;
      params.adjustments.isha = config.adjustments.isha || 0;
    }

    return params;
  }

  /**
   * Format a Date into 24-hour HH:mm string for a specific IANA timezone
   */
  public formatTimeInTimezone(date: Date, timezone: string): string {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(date);
  }

  /**
   * Generate Hijri Date representation
   */
  public getHijriDate(date: Date, timezone: string): {
    day: number;
    month: { number: number; ar: string; en: string };
    year: number;
    formattedAr: string;
  } {
    try {
      const hijriFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
        timeZone: timezone,
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      });
      const parts = hijriFormatter.formatToParts(date);
      let day = 1;
      let monthNum = 1;
      let year = 1448;

      parts.forEach(p => {
        if (p.type === 'day') day = parseInt(p.value, 10);
        if (p.type === 'month') monthNum = parseInt(p.value, 10);
        if (p.type === 'year') year = parseInt(p.value, 10);
      });

      const monthAr = ARABIC_HIJRI_MONTHS[monthNum] || `شهر ${monthNum}`;
      return {
        day,
        month: {
          number: monthNum,
          ar: monthAr,
          en: `Month ${monthNum}`,
        },
        year,
        formattedAr: `${day} ${monthAr} ${year} هـ`,
      };
    } catch {
      // Fallback
      return {
        day: 1,
        month: { number: 1, ar: 'محرم', en: 'Muharram' },
        year: 1448,
        formattedAr: '1 محرم 1448 هـ',
      };
    }
  }

  /**
   * Determine whether a given IANA timezone represents Morocco.
   */
  public isMoroccanTimezone(timezone: string): boolean {
    return timezone === 'Africa/Casablanca' || timezone === 'Africa/El_Aaiun';
  }

  /**
   * Resolve presentation timezone for prayer schedule.
   *
   * The Moroccan Ministry of Endowments and Islamic Affairs (Habous) calculates
   * and publishes official prayer times strictly in Greenwich Mean Time (GMT / UTC+0),
   * whereas civil administration uses GMT+1 (Africa/Casablanca) outside Ramadan.
   * To prevent a 1-hour discrepancy and maintain 100% fidelity to official Moroccan tables,
   * Moroccan prayer times are presented in GMT/UTC by default ('gmt' policy).
   *
   * For all other countries, presentation timezone remains their native IANA timezone.
   */
  public resolveDisplayTimezone(timezone: string, config?: PrayerCalculationConfig): string {
    if (this.isMoroccanTimezone(timezone) || config?.method === 'MOROCCO') {
      if (config?.moroccoTimePolicy === 'civil') {
        return timezone;
      }
      return 'UTC';
    }
    return timezone;
  }

  /**
   * Calculate prayer schedule for a single calendar date
   */
  public calculateDailySchedule(params: CalculateDailyParams): DailyPrayerSchedule {
    const { coordinates, timezone, date, config } = params;

    // Validate inputs
    if (
      !coordinates ||
      typeof coordinates.latitude !== 'number' ||
      typeof coordinates.longitude !== 'number' ||
      isNaN(coordinates.latitude) ||
      isNaN(coordinates.longitude) ||
      coordinates.latitude < -90 ||
      coordinates.latitude > 90 ||
      coordinates.longitude < -180 ||
      coordinates.longitude > 180
    ) {
      throw new Error(`Invalid geographic coordinates: ${JSON.stringify(coordinates)}`);
    }

    if (!timezone || typeof timezone !== 'string') {
      throw new Error(`Invalid timezone string: ${timezone}`);
    }

    const displayTimezone = this.resolveDisplayTimezone(timezone, config);

    // Extract calendar date in the city's geographical timezone to prevent server/browser midnight drift
    const dateParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
    const [gYear, gMonth, gDay] = dateParts.split('-').map((v) => parseInt(v, 10));

    // Construct local midday Date for adhan engine
    const calculationDate = new Date(gYear, gMonth - 1, gDay, 12, 0, 0);

    const adhanCoords = new Coordinates(coordinates.latitude, coordinates.longitude);
    const calculationParams = this.resolveCalculationParameters(config);

    const prayerTimes = new PrayerTimes(adhanCoords, calculationDate, calculationParams);

    // Verify calculation output dates
    if (!prayerTimes.fajr || isNaN(prayerTimes.fajr.getTime())) {
      throw new Error(`Astronomical calculation failed to produce valid times for date: ${date.toISOString()}`);
    }

    const timings = {
      fajr: this.formatTimeInTimezone(prayerTimes.fajr, displayTimezone),
      sunrise: this.formatTimeInTimezone(prayerTimes.sunrise, displayTimezone),
      dhuhr: this.formatTimeInTimezone(prayerTimes.dhuhr, displayTimezone),
      asr: this.formatTimeInTimezone(prayerTimes.asr, displayTimezone),
      maghrib: this.formatTimeInTimezone(prayerTimes.maghrib, displayTimezone),
      isha: this.formatTimeInTimezone(prayerTimes.isha, displayTimezone),
    };

    // Gregorian details
    const weekdayFormatter = new Intl.DateTimeFormat('ar-MA', { timeZone: timezone, weekday: 'long' });
    const enMonthFormatter = new Intl.DateTimeFormat('en-US', { timeZone: timezone, month: 'long' });
    const weekdayAr = weekdayFormatter.format(calculationDate);

    const gregorian = {
      day: gDay,
      month: {
        number: gMonth,
        ar: ARABIC_GREGORIAN_MONTHS[gMonth] || `شهر ${gMonth}`,
        en: enMonthFormatter.format(calculationDate),
      },
      year: gYear,
      weekdayAr,
      formattedIso: `${gYear}-${String(gMonth).padStart(2, '0')}-${String(gDay).padStart(2, '0')}`,
      formattedAr: `${weekdayAr} ${gDay} ${ARABIC_GREGORIAN_MONTHS[gMonth]} ${gYear}`,
    };

    const hijri = this.getHijriDate(calculationDate, timezone);

    // Compute Next Prayer
    const now = new Date();
    const currentPrayerName = prayerTimes.currentPrayer() as PrayerName | 'none';
    const nextPrayerName = prayerTimes.nextPrayer() as PrayerName | 'none';

    let nextPrayerInfo: NextPrayerInfo | undefined;
    if (nextPrayerName && nextPrayerName !== 'none') {
      const nextPrayerDate = prayerTimes.timeForPrayer(nextPrayerName);
      if (nextPrayerDate) {
        const remainingSec = Math.max(0, Math.floor((nextPrayerDate.getTime() - now.getTime()) / 1000));
        nextPrayerInfo = {
          current: currentPrayerName && currentPrayerName !== 'none' ? currentPrayerName : null,
          next: nextPrayerName,
          nextPrayerNameAr: PRAYER_NAMES_AR[nextPrayerName] || nextPrayerName,
          timeFormatted: this.formatTimeInTimezone(nextPrayerDate, displayTimezone),
          targetTimestampMs: nextPrayerDate.getTime(),
          secondsRemaining: remainingSec,
        };
      }
    }

    const meta = {
      provider: 'adhan_astronomical' as const,
      calculationMethodName: calculationParams.method || config.method,
      calculationAuthority: this.getMethodAuthorityName(config.method),
      fajrAngle: calculationParams.fajrAngle,
      ishaAngle: calculationParams.ishaAngle,
      ishaIntervalMinutes: calculationParams.ishaInterval,
      timezone,
      displayTimezone,
      computedAt: new Date().toISOString(),
      isFallback: false,
    };

    const result: DailyPrayerSchedule = {
      dateIso: gregorian.formattedIso,
      gregorian,
      hijri,
      timings,
      nextPrayer: nextPrayerInfo,
      meta,
    };

    return DailyPrayerScheduleSchema.parse(result);
  }

  /**
   * Calculate entire monthly timetable (e.g. 28-31 days)
   */
  public calculateMonthlySchedule(params: CalculateMonthlyParams): MonthlyPrayerSchedule {
    const { coordinates, timezone, year, month, config } = params;

    if (month < 1 || month > 12) {
      throw new Error(`Invalid month: ${month}. Month must be between 1 and 12.`);
    }

    // Number of days in the month
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: DailyPrayerSchedule[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
      const daily = this.calculateDailySchedule({
        coordinates,
        timezone,
        date,
        config,
      });
      days.push(daily);
    }

    const result: MonthlyPrayerSchedule = {
      year,
      month,
      days,
      meta: days[0].meta,
    };

    return MonthlyPrayerScheduleSchema.parse(result);
  }

  private getMethodAuthorityName(method: CalculationMethodId): string {
    switch (method) {
      case 'MOROCCO':
        return 'وزارة الأوقاف والشؤون الإسلامية بالمغرب';
      case 'MAKKAH':
        return 'جامعة أم القرى، مكة المكرمة';
      case 'EGYPT':
        return 'الهيئة المصرية العامة للمساحة';
      case 'KUWAIT':
        return 'وزارة الأوقاف والشؤون الإسلامية بالكويت';
      case 'QATAR':
        return 'وزارة الأوقاف والشؤون الإسلامية بقطر';
      case 'TURKEY':
        return 'رئاسة الشؤون الدينية التركية (Diyanet)';
      case 'FRANCE':
        return 'اتحاد المنظمات الإسلامية في فرنسا (UOIF)';
      case 'ISNA':
        return 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)';
      case 'KARACHI':
        return 'جامعة العلوم الإسلامية بكراتشي';
      case 'SINGAPORE':
        return 'مجلس أوغاما إسلام سينغابورا (MUIS)';
      case 'TEHRAN':
        return 'معهد الجيوفيزياء بجامعة طهران';
      case 'GULF':
        return 'حساب منطقة الخليج العربي';
      case 'MWL':
      default:
        return 'رابطة العالم الإسلامي (MWL)';
    }
  }
}

export const prayerTimeService = new PrayerTimeService();
