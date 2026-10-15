/**
 * Design Tokens — MawaqetSalat.com
 * Single source of truth for colors, typography, and spacing.
 * Used by Tailwind CSS config and component JSX class references.
 */

export const colors = {
  /** Primary brand teal — matches legacy #008080 */
  primary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488', // primary interactive (buttons, links)
    700: '#0f766e', // header background
    800: '#115e59',
    900: '#134e4a',
  },

  /** Prayer-time row states */
  prayer: {
    nextHighlight: '#ccfbf1',   // teal-100 — upcoming prayer highlight
    activeRow: '#14b8a6',       // teal-500 — current prayer row
    fajrColor: '#1e3a5f',       // deep blue for Fajr
    sunriseColor: '#f59e0b',    // amber for Sunrise/Shuruq
    dhuhrColor: '#0d9488',      // teal for Dhuhr
    asrColor: '#0ea5e9',        // sky for Asr
    maghribColor: '#dc2626',    // red for Maghrib (sunset)
    ishaColor: '#6366f1',       // indigo for Isha
  },

  /** UI surface tokens */
  surface: {
    card: '#ffffff',
    page: '#f9fafb',            // gray-50
    border: '#e5e7eb',          // gray-200
    muted: '#6b7280',           // gray-500
  },
} as const;

export const typography = {
  /** Arabic-optimized font stack */
  fontFamilyArabic: "'Tajawal', 'IBM Plex Sans Arabic', 'Cairo', Arial, sans-serif",
  /** Base sizes (rem) */
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  lineHeights: {
    arabic: '1.8',  // Arabic text needs more line-height
    tight: '1.25',
    normal: '1.5',
  },
} as const;

/** Named prayer list in display order */
export const PRAYER_NAMES = [
  { key: 'fajr',    arabicLabel: 'الفجر',    englishLabel: 'Fajr' },
  { key: 'sunrise', arabicLabel: 'الشروق',   englishLabel: 'Sunrise' },
  { key: 'dhuhr',   arabicLabel: 'الظهر',    englishLabel: 'Dhuhr' },
  { key: 'asr',     arabicLabel: 'العصر',    englishLabel: 'Asr' },
  { key: 'maghrib', arabicLabel: 'المغرب',   englishLabel: 'Maghrib' },
  { key: 'isha',    arabicLabel: 'العشاء',   englishLabel: 'Isha' },
] as const;

export type PrayerKey = (typeof PRAYER_NAMES)[number]['key'];
