import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware — handles:
 * 1. /sample-page/ → 301 to homepage (retired WP boilerplate page)
 * 2. /%d8%b3%d9%8a%d8%a7%d8%b3%d8%a9-%d8%a7%d9%84%d8%ae%d8%b5%d9%88%d8%b5%d9%8a%d8%a9/ → 301 to canonical /سياسة-الخصوصية/
 *
 * Excludes static assets, API routes, and Next.js internals.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. /sample-page/ — retired WP default page (0 clicks, 0 impressions)
  if (pathname === '/sample-page' || pathname === '/sample-page/') {
    return NextResponse.redirect(new URL('/', request.url), { status: 301 });
  }

  // 2. /country/prayer-times-in-egypt/ → canonical /country/prayer-times-in-eqypt/
  if (pathname === '/country/prayer-times-in-egypt' || pathname === '/country/prayer-times-in-egypt/') {
    return NextResponse.redirect(new URL('/country/prayer-times-in-eqypt/', request.url), { status: 301 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image
     * - api routes
     * - static files (e.g. .png, .jpg, .ico, .txt)
     */
    '/((?!_next/static|_next/image|api|flags|.*\\..*).*)',
  ],
};
