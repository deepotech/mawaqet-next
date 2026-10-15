/**
 * Prayer config helper — maps a city's numeric method ID
 * to a PrayerCalculationConfig suitable for the adhan engine.
 */
import { PrayerCalculationConfig } from '@/types/prayer';
import { toCalculationMethodId } from '@/lib/data';

/**
 * Build a PrayerCalculationConfig from a city's numeric methodId and latitude.
 * High-latitude rule is applied for cities above 48° (Scandinavia, Canada, etc.)
 */
export function buildPrayerConfig(
  methodId: number,
  latitude: number,
): PrayerCalculationConfig {
  const method = toCalculationMethodId(methodId);

  // High-latitude rule — required for latitudes above ~48°
  let highLatitudeRule: PrayerCalculationConfig['highLatitudeRule'] | undefined;
  if (Math.abs(latitude) >= 48) {
    highLatitudeRule = 'seventh_of_the_night';
  }

  const config: PrayerCalculationConfig = { method };
  if (highLatitudeRule) config.highLatitudeRule = highLatitudeRule;
  return config;
}
