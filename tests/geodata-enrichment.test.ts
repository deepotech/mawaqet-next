import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { CountrySchema, CitySchema } from '../src/types/location';

describe('Geographic Data Enrichment & Relationship Integrity', () => {
  const countries = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/normalized/countries.json'), 'utf8')
  );
  const cities = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/normalized/cities.json'), 'utf8')
  );
  const summary = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/normalized/enrichment-summary.json'), 'utf8')
  );

  it('contains exactly 38 countries conforming to CountrySchema', () => {
    expect(countries.length).toBe(38);
    countries.forEach((c: any) => {
      expect(() => CountrySchema.parse(c)).not.toThrow();
    });
  });

  it('contains exactly 328 cities conforming to CitySchema', () => {
    expect(cities.length).toBe(328);
    cities.forEach((c: any) => {
      expect(() => CitySchema.parse(c)).not.toThrow();
    });
  });

  it('ensures all 328 city slugs are globally unique', () => {
    const slugs = new Set();
    cities.forEach((c: any) => {
      expect(slugs.has(c.slug)).toBe(false);
      slugs.add(c.slug);
    });
  });

  it('ensures all 38 country slugs are globally unique', () => {
    const slugs = new Set();
    countries.forEach((c: any) => {
      expect(slugs.has(c.slug)).toBe(false);
      slugs.add(c.slug);
    });
  });

  it('verifies 100% of cities have valid coordinates (0 missing coordinates)', () => {
    expect(summary.missingCoordinatesCount).toBe(0);
    cities.forEach((c: any) => {
      expect(c.coordinates).not.toBeNull();
      expect(c.coordinates.latitude).toBeGreaterThanOrEqual(-90);
      expect(c.coordinates.latitude).toBeLessThanOrEqual(90);
      expect(c.coordinates.longitude).toBeGreaterThanOrEqual(-180);
      expect(c.coordinates.longitude).toBeLessThanOrEqual(180);
    });
  });

  it('verifies 100% of cities have valid IANA timezones (0 missing timezones)', () => {
    expect(summary.missingTimezonesCount).toBe(0);
    cities.forEach((c: any) => {
      expect(c.timezone).toBeTruthy();
      expect(c.timezone.length).toBeGreaterThan(2);
      expect(c.timezone).toMatch(/^[A-Za-z_]+\/[A-Za-z_]+(\/[A-Za-z_]+)?$/);
    });
  });

  it('ensures every city belongs to a valid country record', () => {
    const countryIds = new Set(countries.map((c: any) => c.id));
    cities.forEach((c: any) => {
      expect(countryIds.has(c.countryId)).toBe(true);
    });
  });

  it('verifies data provenance is documented for every city', () => {
    cities.forEach((c: any) => {
      const hasValidSource = ['GeoNames', 'OpenStreetMap'].some(src => c.enrichmentSource.includes(src));
      expect(hasValidSource).toBe(true);
      expect(c.verificationStatus).toMatch(/verified_exact|verified_regional/);
    });
  });
});
