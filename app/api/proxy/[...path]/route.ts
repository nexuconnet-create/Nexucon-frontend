import { NextRequest, NextResponse } from 'next/server';

const isProd = process.env.NODE_ENV === 'production';
const envUrl = process.env.NEXT_PUBLIC_API_URL || '';
const validEnvUrl = envUrl.startsWith('http') ? envUrl : null;
const BACKEND_BASE = (validEnvUrl || 'https://nexucon-backend.onrender.com').replace(/\/$/, '');

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = (path || []).join('/');
  const search = req.nextUrl.search || '';
  
  // Format target backend URL with trailing slash before query parameters
  const targetUrl = `${BACKEND_BASE}/api/v1/${pathStr}/${search}`.replace(/([^:])\/{2,}/g, '$1/').replace(/\/\?/, '/?');

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': req.headers.get('user-agent') || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }

  const contentType = req.headers.get('content-type');
  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  let body: any = undefined;
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    try {
      body = await req.text();
    } catch {
      body = undefined;
    }
  }

  const executeFetch = async (attempt: number = 1): Promise<Response> => {
    try {
      return await fetch(targetUrl, {
        method: req.method,
        headers,
        body: body || undefined,
        cache: 'no-store',
        signal: AbortSignal.timeout(60000)
      });
    } catch (err: any) {
      if (attempt < 2) {
        console.warn(`[Proxy Retry] Retrying connection to ${targetUrl} (attempt ${attempt + 1})...`);
        return await executeFetch(attempt + 1);
      }
      throw err;
    }
  };

  try {
    const backendRes = await executeFetch(1);

    const responseContentType = backendRes.headers.get('content-type') || '';
    const resText = await backendRes.text();

    return new NextResponse(resText, {
      status: backendRes.status,
      headers: {
        'Content-Type': responseContentType || 'application/json'
      }
    });
  } catch (err: any) {
    console.error(`[Proxy Error] Failed to connect to backend at ${targetUrl}:`, err.message);
    return NextResponse.json({
      success: false,
      error: 'Backend connection error',
      message: err.message || 'Unable to connect to backend server'
    }, { status: 502 });
  }
}

export async function GET(req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, props);
}

export async function POST(req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, props);
}

export async function PUT(req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, props);
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, props);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, props);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie'
    }
  });
}
