import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_DOMAIN = process.env.NEXT_PUBLIC_ADMIN_DOMAIN || 'adriandelrosario.live'
const PREVIEW_BASE = process.env.NEXT_PUBLIC_PREVIEW_BASE || 'adriandelrosario.live'
const FIRST_TENANT_DOMAIN = process.env.NEXT_PUBLIC_FIRST_TENANT_DOMAIN || 'adriandelrosario.com'
const FIRST_TENANT_SLUG = process.env.NEXT_PUBLIC_FIRST_TENANT_SLUG || 'adrian'
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || ''

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const host = hostname.split(':')[0] // strip port for local dev
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Never rewrite Next.js internals, Payload API, or media files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    /\.(?:jpg|jpeg|png|gif|webp|svg|avif|ico|woff2?)$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  // 1. localhost — pass through (dev uses direct /[slug] routes)
  if (host === 'localhost' || host === '127.0.0.1') {
    return NextResponse.next()
  }

  // 2. Admin domain — pass through to Payload admin
  if (host === ADMIN_DOMAIN || host === `www.${ADMIN_DOMAIN}`) {
    return NextResponse.next()
  }

  // 3. Preview subdomains: {slug}.adriandelrosario.live → /[slug]
  if (host.endsWith(`.${PREVIEW_BASE}`)) {
    const slug = host.replace(`.${PREVIEW_BASE}`, '')
    url.pathname = `/${slug}${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(url)
  }

  // 4. First tenant domain: adriandelrosario.com → /adrian
  if (host === FIRST_TENANT_DOMAIN || host === `www.${FIRST_TENANT_DOMAIN}`) {
    url.pathname = `/${FIRST_TENANT_SLUG}${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(url)
  }

  // 5. Custom domains — look up tenant slug via Payload REST API
  if (SERVER_URL) {
    try {
      const res = await fetch(
        `${SERVER_URL}/api/tenants?where[domain][equals]=${encodeURIComponent(host)}&limit=1`,
        { next: { revalidate: 300 } },
      )
      if (res.ok) {
        const data = await res.json()
        const tenant = data.docs?.[0]
        if (tenant?.slug) {
          url.pathname = `/${tenant.slug}${pathname === '/' ? '' : pathname}`
          return NextResponse.rewrite(url)
        }
      }
    } catch (_) {
      // lookup failed — fall through to Next.js 404
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
