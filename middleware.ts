import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  // Skip static files, Next internals, and API requests
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isInspectorHost =
    hostname.startsWith('inspector.') ||
    hostname.includes('inspector.localhost') ||
    hostname.includes('inspector-');

  if (isInspectorHost) {
    // Safety fallback: if someone on inspector domain is directed to /government/login or similar, redirect to /inspector/login
    if (pathname.startsWith('/government') || pathname.startsWith('/client') || pathname.startsWith('/professional')) {
      url.pathname = '/inspector/login';
      return NextResponse.redirect(url);
    }

    // If request is already pointing to /inspector, allow it
    if (pathname.startsWith('/inspector')) {
      return NextResponse.next();
    }

    // Rewrite root or relative paths under inspector domain to /inspector equivalents
    if (pathname === '/') {
      url.pathname = '/inspector';
      return NextResponse.rewrite(url);
    }

    url.pathname = `/inspector${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
