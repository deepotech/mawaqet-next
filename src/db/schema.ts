import { pgTable, serial, varchar, text, integer, doublePrecision, boolean, timestamp, jsonb, time } from 'drizzle-orm/pg-core';

export const countries = pgTable('countries', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 128 }).notNull().unique(), // e.g. prayer-times-in-morocco
  nameAr: varchar('name_ar', { length: 128 }).notNull(),
  nameEn: varchar('name_en', { length: 128 }).notNull(),
  code: varchar('code', { length: 4 }).notNull(), // ISO-3166-1 alpha-2
  flagUrl: varchar('flag_url', { length: 512 }).notNull(),
  defaultMethodId: integer('default_method_id').notNull(),
  contentAr: text('content_ar'),
  legacyPostId: integer('legacy_post_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const cities = pgTable('cities', {
  id: serial('id').primaryKey(),
  countryId: integer('country_id').references(() => countries.id).notNull(),
  slug: varchar('slug', { length: 128 }).notNull().unique(), // e.g. prayer-times-in-casablanca
  urlPath: varchar('url_path', { length: 255 }).notNull().unique(), // /city/prayer-times-in-casablanca/
  nameAr: varchar('name_ar', { length: 128 }).notNull(),
  nameEn: varchar('name_en', { length: 128 }).notNull(),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  timezone: varchar('timezone', { length: 64 }),
  methodId: integer('method_id'),
  seoTitle: varchar('seo_title', { length: 255 }),
  seoDescription: text('seo_description'),
  contentAr: text('content_ar'),
  legacyPostId: integer('legacy_post_id').notNull(),
  verificationStatus: varchar('verification_status', { length: 32 }).notNull(),
  enrichmentSource: varchar('enrichment_source', { length: 128 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const cityAliases = pgTable('city_aliases', {
  id: serial('id').primaryKey(),
  cityId: integer('city_id').references(() => cities.id).notNull(),
  alias: varchar('alias', { length: 128 }).notNull(),
  locale: varchar('locale', { length: 10 }).notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
});

// Decoupled Mosque Schema (Isolated, for future expansion)
export const mosques = pgTable('mosques', {
  id: serial('id').primaryKey(),
  cityId: integer('city_id').references(() => cities.id).notNull(),
  slug: varchar('slug', { length: 128 }).notNull().unique(),
  nameAr: varchar('name_ar', { length: 255 }).notNull(),
  addressAr: varchar('address_ar', { length: 512 }),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  facilityOpeningTime: time('facility_opening_time'),
  facilityClosingTime: time('facility_closing_time'),
  jummahKhutbahTime: time('jummah_khutbah_time'),
  jummahPrayerTime: time('jummah_prayer_time'),
  iqamahOffsets: jsonb('iqamah_offsets'),
  isVerified: boolean('is_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
