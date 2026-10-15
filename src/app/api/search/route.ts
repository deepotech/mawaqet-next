import { NextResponse } from 'next/server';
import { z } from 'zod';
import { searchCities, findClosestCity } from '@/lib/data';

// ─── Query schema ─────────────────────────────────────────────────────────────
const QuerySchema = z.object({
  q: z
    .string()
    .max(100, 'Query too long')
    .optional()
    .transform((s) => (s ? s.trim() : '')),
  lat: z
    .string()
    .optional()
    .transform((s) => (s ? parseFloat(s) : undefined))
    .refine((v) => v === undefined || (!isNaN(v) && v >= -90 && v <= 90), {
      message: 'خط العرض يجب أن يكون بين -90 و 90',
    }),
  lon: z
    .string()
    .optional()
    .transform((s) => (s ? parseFloat(s) : undefined))
    .refine((v) => v === undefined || (!isNaN(v) && v >= -180 && v <= 180), {
      message: 'خط الطول يجب أن يكون بين -180 و 180',
    }),
  limit: z
    .string()
    .optional()
    .transform((s) => {
      const n = parseInt(s ?? '10', 10);
      return isNaN(n) || n < 1 ? 10 : Math.min(n, 20);
    }),
});

// ─── Response schema (documented contract) ────────────────────────────────────
export interface SearchResult {
  slug: string;
  nameArabic: string;
  nameEnglish: string;
  country: string;
  countryCode: string;
  urlPath: string;
  distanceKm?: number;
}

/**
 * GET /api/search?q={query}&lat={lat}&lon={lon}&limit={n}
 *
 * Returns an array of SearchResult objects.
 * - q: optional text search, 2–100 chars
 * - lat / lon: optional GPS coordinates for reverse geocoding to closest city
 * - limit: optional, 1–20, default 10
 *
 * Errors are returned as { error: string } with appropriate HTTP status.
 * No filesystem paths, stack traces, or internal details are exposed.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const parsed = QuerySchema.safeParse({
    q: searchParams.get('q') ?? undefined,
    lat: searchParams.get('lat') ?? undefined,
    lon: searchParams.get('lon') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'استعلام غير صالح', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { q = '', lat, lon, limit } = parsed.data;

  // 1. Geolocation lookup if lat and lon provided
  if (lat !== undefined && lon !== undefined) {
    try {
      const closest = findClosestCity(lat, lon);
      if (!closest) {
        return NextResponse.json([], { status: 200 });
      }

      const geoResult: SearchResult = {
        slug: closest.city.slug,
        nameArabic: closest.city.nameAr,
        nameEnglish: closest.city.nameEn,
        country: closest.country.nameAr,
        countryCode: closest.country.code,
        urlPath: closest.city.urlPath,
        distanceKm: closest.distanceKm,
      };

      return NextResponse.json([geoResult], {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    } catch {
      return NextResponse.json({ error: 'حدث خطأ في تحديد أقرب مدينة' }, { status: 500 });
    }
  }

  // 2. Text query lookup
  if (q.length < 2) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const results = searchCities(q, limit);

    const response: SearchResult[] = results.map(({ city, country }) => ({
      slug: city.slug,
      nameArabic: city.nameAr,
      nameEnglish: city.nameEn,
      country: country.nameAr,
      countryCode: country.code,
      urlPath: city.urlPath,
    }));

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch {
    // Do not expose internal error details
    return NextResponse.json({ error: 'حدث خطأ في البحث، يرجى المحاولة لاحقاً' }, { status: 500 });
  }
}
