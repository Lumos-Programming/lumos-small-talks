import { NextRequest, NextResponse } from 'next/server'

function detectLineContext(userAgent: string | null) {
  const ua = userAgent ?? ''
  const isLine = /Line\//i.test(ua)
  const isLiff = /\bLIFF\b/i.test(ua)

  return {
    isLine,
    isLiff,
    isLineInAppBrowser: isLine && !isLiff,
  }
}

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const ua = request.headers.get('user-agent')

  const { isLineInAppBrowser } = detectLineContext(ua)

  const alreadyExternal = url.searchParams.get('openExternalBrowser') === '1'

  if (isLineInAppBrowser && !alreadyExternal) {
    url.searchParams.set('openExternalBrowser', '1')
    return NextResponse.redirect(url, 302)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/submit'],
}
