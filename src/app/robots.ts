import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',       // Internal API routes
          '/_next/',     // Next.js internals
          '/embd/',      // Embed widget — low SEO value
        ],
      },
    ],
    sitemap: 'https://mawaqetsalat.com/sitemap.xml',
    host: 'https://mawaqetsalat.com',
  };
}
