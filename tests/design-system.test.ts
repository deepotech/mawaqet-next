/**
 * Phase 2 — Design System Unit Tests
 *
 * Tests that design tokens, component exports, and type contracts
 * are well-formed. These are structural / import tests that run
 * without a DOM or a running Next.js server (Vitest, Node environment).
 */

import { describe, it, expect } from 'vitest';
import { PRAYER_NAMES, colors, typography } from '@/lib/design-tokens';

describe('Design Tokens', () => {
  it('exports exactly 6 prayer names', () => {
    expect(PRAYER_NAMES).toHaveLength(6);
  });

  it('prayer names include all required keys', () => {
    const keys = PRAYER_NAMES.map((p) => p.key);
    expect(keys).toContain('fajr');
    expect(keys).toContain('sunrise');
    expect(keys).toContain('dhuhr');
    expect(keys).toContain('asr');
    expect(keys).toContain('maghrib');
    expect(keys).toContain('isha');
  });

  it('every prayer has both Arabic and English labels', () => {
    for (const p of PRAYER_NAMES) {
      expect(p.arabicLabel).toBeTruthy();
      expect(p.englishLabel).toBeTruthy();
    }
  });

  it('primary color palette has teal-600 as primary interactive', () => {
    expect(colors.primary[600]).toBe('#0d9488');
  });

  it('prayer row colors are defined for all 6 prayers', () => {
    const defined = Object.keys(colors.prayer);
    const required = ['nextHighlight', 'activeRow', 'fajrColor', 'sunriseColor', 'dhuhrColor', 'asrColor', 'maghribColor', 'ishaColor'];
    for (const key of required) {
      expect(defined).toContain(key);
    }
  });

  it('Arabic font stack includes Tajawal', () => {
    expect(typography.fontFamilyArabic).toContain('Tajawal');
  });

  it('Arabic line height is greater than standard (1.5)', () => {
    const lh = parseFloat(typography.lineHeights.arabic);
    expect(lh).toBeGreaterThan(1.5);
  });
});
