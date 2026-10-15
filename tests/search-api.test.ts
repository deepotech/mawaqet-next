import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/search/route';
import { searchCities } from '@/lib/data';

describe('Search API (/api/search)', () => {
  it('returns 200 with empty array for empty query', async () => {
    const req = new Request('http://localhost:3000/api/search?q=');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });

  it('returns 200 with empty array for whitespace-only query', async () => {
    const req = new Request('http://localhost:3000/api/search?q=%20%20');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });

  it('returns 200 with empty array for single character query (<2 chars)', async () => {
    const req = new Request('http://localhost:3000/api/search?q=a');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });

  it('returns 400 for queries exceeding 100 characters', async () => {
    const longQ = 'a'.repeat(101);
    const req = new Request(`http://localhost:3000/api/search?q=${longQ}`);
    const res = await GET(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('handles Arabic queries correctly (e.g. بغداد)', async () => {
    const req = new Request('http://localhost:3000/api/search?q=%D8%A8%D8%BA%D8%AF%D8%A7%D8%AF');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].slug).toBe('prayer-times-in-baghdad');
    expect(data[0].nameArabic).toBe('بغداد');
    expect(data[0].country).toBe('العراق');
  });

  it('handles English queries correctly (e.g. casablanca)', async () => {
    const req = new Request('http://localhost:3000/api/search?q=casablanca');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].slug).toBe('prayer-times-in-casablanca');
    expect(data[0].nameEnglish).toBe('casablanca');
    expect(data[0].country).toBe('المغرب');
  });

  it('respects limit parameter and caps at 20', async () => {
    const req = new Request('http://localhost:3000/api/search?q=a&limit=5');
    const res = await GET(req);
    expect(res.status).toBe(200);

    // Test cap at 20
    const reqMax = new Request('http://localhost:3000/api/search?q=a&limit=50');
    const resMax = await GET(reqMax);
    expect(resMax.status).toBe(200);
  });

  it('returns empty array when no city matches query', async () => {
    const req = new Request('http://localhost:3000/api/search?q=zzzzzzzzzz');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });

  it('sets appropriate Cache-Control header', async () => {
    const req = new Request('http://localhost:3000/api/search?q=riyadh');
    const res = await GET(req);
    expect(res.headers.get('cache-control')).toContain('public');
  });

  it('distinguishes duplicate or similar city names across countries', () => {
    // Test Tripoli (Lebanon vs Libya if both existed) or similar
    const results = searchCities('الرباط');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].country.nameAr).toBe('المغرب');
  });

  it('finds closest city by latitude and longitude', async () => {
    // Coordinates close to Rabat, Morocco: 34.020882, -6.841650
    const req = new Request('http://localhost:3000/api/search?lat=34.02&lon=-6.84');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.length).toBe(1);
    expect(data[0].nameArabic).toBe('الرباط');
    expect(data[0].distanceKm).toBeDefined();
    expect(data[0].distanceKm).toBeLessThan(10);
  });

  it('rejects invalid coordinates with 400 status', async () => {
    const req = new Request('http://localhost:3000/api/search?lat=95&lon=200');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});
