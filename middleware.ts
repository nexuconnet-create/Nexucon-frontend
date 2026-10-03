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
    // Safety fallback: if someone on inspector domain is directed to other logins, redirect to /inspector/login
    if (pathname.startsWith('/government') || pathname.startsWith('/client') || pathname.startsWith('/professional') || pathname.startsWith('/stakeholder')) {
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

  const isStakeholderHost =
    hostname.startsWith('stakeholder.') ||
    hostname.includes('stakeholder.localhost') ||
    hostname.includes('stakeholder-');

  if (isStakeholderHost) {
    // Safety fallback: if someone on stakeholder domain is directed to other logins, redirect to /stakeholder/login
    if (pathname.startsWith('/government') || pathname.startsWith('/client') || pathname.startsWith('/professional') || pathname.startsWith('/inspector')) {
      url.pathname = '/stakeholder/login';
      return NextResponse.redirect(url);
    }

    // If request is already pointing to /stakeholder, allow it
    if (pathname.startsWith('/stakeholder')) {
      return NextResponse.next();
    }

    // Rewrite root to /stakeholder/login so the first page that shows is the login page
    if (pathname === '/') {
      url.pathname = '/stakeholder/login';
      return NextResponse.rewrite(url);
    }

    // Rewrite /dashboard to /stakeholder
    if (pathname === '/dashboard') {
      url.pathname = '/stakeholder';
      return NextResponse.rewrite(url);
    }

    url.pathname = `/stakeholder${pathname}`;
    return NextResponse.rewrite(url);
  }

  const isGovernmentHost =
    hostname.startsWith('government.') ||
    hostname.includes('government.localhost') ||
    hostname.includes('government-');

  if (isGovernmentHost) {
    if (pathname.startsWith('/inspector') || pathname.startsWith('/stakeholder') || pathname.startsWith('/client') || pathname.startsWith('/professional')) {
      url.pathname = '/government/login';
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith('/government')) {
      return NextResponse.next();
    }

    if (pathname === '/') {
      url.pathname = '/government/login';
      return NextResponse.rewrite(url);
    }

    if (pathname === '/dashboard') {
      url.pathname = '/government/dashboard/command-center';
      return NextResponse.rewrite(url);
    }

    url.pathname = `/government${pathname}`;
    return NextResponse.rewrite(url);
  }

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(self)');
  return res;
}

  const isPtpHost =
    hostname.startsWith('ptp.') ||
    hostname.includes('ptp.localhost') ||
    hostname.includes('ptp-');

  if (isPtpHost) {
    // Safety fallback: prevent internal dashboard routes from leaking on public transparency domain
    if (
      pathname.startsWith('/government') ||
      pathname.startsWith('/client') ||
      pathname.startsWith('/professional') ||
      pathname.startsWith('/stakeholder') ||
      pathname.startsWith('/inspector')
    ) {
      url.pathname = '/login';
      return applySecurityHeaders(NextResponse.redirect(url));
    }

    // Dedicated auth and onboarding routes
    if (pathname === '/login') {
      url.pathname = '/ptp/login';
      return applySecurityHeaders(NextResponse.rewrite(url));
    }

    if (pathname === '/register') {
      url.pathname = '/ptp/register';
      return applySecurityHeaders(NextResponse.rewrite(url));
    }

    if (pathname === '/onboarding') {
      url.pathname = '/ptp/onboarding';
      return applySecurityHeaders(NextResponse.rewrite(url));
    }

    // Root serves the official Public Transparency Portal landing page
    if (pathname === '/') {
      url.pathname = '/transparency';
      return applySecurityHeaders(NextResponse.rewrite(url));
    }

    // If request is already pointing to /ptp, allow it
    if (pathname.startsWith('/ptp')) {
      return applySecurityHeaders(NextResponse.next());
    }

    // Public civic transparency routes (unauthenticated public access)
    if (pathname === '/transparency' || pathname === '/about' || pathname === '/info') {
      url.pathname = '/transparency';
      return applySecurityHeaders(NextResponse.rewrite(url));
    }

    if (pathname === '/verify') {
      url.pathname = '/transparency/verify';
      return applySecurityHeaders(NextResponse.rewrite(url));
    }

    if (pathname === '/search') {
      url.pathname = '/transparency/search';
      return applySecurityHeaders(NextResponse.rewrite(url));
    }

    if (pathname === '/map') {
      url.pathname = '/transparency/map';
      return applySecurityHeaders(NextResponse.rewrite(url));
    }

    if (pathname === '/notices') {
      url.pathname = '/transparency/notices';
      return applySecurityHeaders(NextResponse.rewrite(url));
    }

    if (pathname === '/documents') {
      url.pathname = '/transparency/documents';
      return applySecurityHeaders(NextResponse.rewrite(url));
    }

    if (pathname === '/report' || pathname === '/report-violation') {
      url.pathname = '/transparency/report-violation';
      return applySecurityHeaders(NextResponse.rewrite(url));
    }

    if (pathname.startsWith('/projects/')) {
      url.pathname = `/transparency${pathname}`;
      return applySecurityHeaders(NextResponse.rewrite(url));
    }

    // Authenticated dashboard routes
    if (pathname === '/dashboard') {
      url.pathname = '/ptp/dashboard';
      return applySecurityHeaders(NextResponse.rewrite(url));
    }

    if (pathname.startsWith('/dashboard/')) {
      url.pathname = `/ptp${pathname}`;
      return applySecurityHeaders(NextResponse.rewrite(url));
    }

    if (pathname === '/watchlist' || pathname === '/settings') {
      url.pathname = `/ptp/dashboard${pathname}`;
      return applySecurityHeaders(NextResponse.rewrite(url));
    }

    url.pathname = `/ptp${pathname}`;
    return applySecurityHeaders(NextResponse.rewrite(url));
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
