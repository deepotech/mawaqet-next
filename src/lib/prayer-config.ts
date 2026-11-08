/**
 * Prayer config helper — maps a city's numeric method ID
 * to a PrayerCalculationConfig suitable for the adhan engine.
 */
import { PrayerCalculationConfig, Madhhab } from '@/types/prayer';
import { toCalculationMethodId } from '@/lib/data';

/**
 * Build a PrayerCalculationConfig from a city's numeric methodId, latitude, and optional countryCode.
 * High-latitude rule is applied for cities above 48° (Scandinavia, Canada, etc.)
 */
export function buildPrayerConfig(
  methodId: number,
  latitude: number,
  countryCode?: string,
): PrayerCalculationConfig {
  const method = toCalculationMethodId(methodId, countryCode);

  // Madhhab default: Pakistan uses Hanafi (Method 12 / PK), all other countries default to Shafi
  const madhhab: Madhhab = countryCode === 'PK' || method === 'KARACHI' ? 'hanafi' : 'shafi';

  // High-latitude rule — required for latitudes above ~48°
  let highLatitudeRule: PrayerCalculationConfig['highLatitudeRule'] | undefined;
  if (Math.abs(latitude) >= 48) {
    highLatitudeRule = 'seventh_of_the_night';
  }

  const config: PrayerCalculationConfig = { method, madhhab };
  if (highLatitudeRule) config.highLatitudeRule = highLatitudeRule;
  return config;
}
