import { z } from 'zod';

export const CountrySchema = z.object({
  id: z.number().int().positive(),
  slug: z.string().min(1),
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  code: z.string().length(2), // ISO 3166-1 alpha-2
  flagUrl: z.string().url().or(z.string().startsWith('/')),
  defaultMethodId: z.number().int().positive(),
  contentAr: z.string().optional(),
  legacyPostId: z.number().int().positive(),
  totalCities: z.number().int().nonnegative(),
});

export type Country = z.infer<typeof CountrySchema>;

export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type Coordinates = z.infer<typeof CoordinatesSchema>;

export const CityVerificationStatusSchema = z.enum([
  'verified_exact',
  'verified_regional',
  'unresolved_ambiguous',
  'missing_coordinates',
]);

export type CityVerificationStatus = z.infer<typeof CityVerificationStatusSchema>;

export const CitySchema = z.object({
  id: z.number().int().positive(),
  countryId: z.number().int().positive(),
  countryCode: z.string().length(2),
  slug: z.string().min(1), // Original legacy slug, e.g. prayer-times-in-baghdad
  urlPath: z.string().min(1), // e.g. /city/prayer-times-in-baghdad/
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  coordinates: CoordinatesSchema.nullable(),
  timezone: z.string().min(1).nullable(), // IANA timezone, e.g. Asia/Baghdad
  calculationMethodId: z.number().int().positive().nullable(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  contentAr: z.string().optional(),
  legacyPostId: z.number().int().positive(),
  verificationStatus: CityVerificationStatusSchema,
  enrichmentSource: z.string(), // Provenance note, e.g. "GeoNames v1", "OpenStreetMap", "Unresolved"
  notes: z.string().optional(),
});

export type City = z.infer<typeof CitySchema>;

export const CityAliasSchema = z.object({
  cityId: z.number().int().positive(),
  alias: z.string().min(1),
  locale: z.enum(['ar', 'en', 'fr']),
  isPrimary: z.boolean().default(false),
});

export type CityAlias = z.infer<typeof CityAliasSchema>;
