import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { encode } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')
  const username = searchParams.get('username')
  const avatar = searchParams.get('avatar')
  const accessToken = searchParams.get('accessToken')

  if (!userId || !username || !accessToken) {
    return NextResponse.redirect(new URL('/api/auth/error?error=InvalidSession', request.url))
  }

  try {
    // Check admin role
    let isAdmin = false
    const guildId = process.env.DISCORD_GUILD_ID
    const adminRoleId = process.env.ADMIN_ROLE_ID

    if (guildId && adminRoleId) {
      try {
        const res = await fetch(`https://discord.com/api/users/@me/guilds/${guildId}/member`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        const member = await res.json()
        isAdmin = member.roles?.includes(adminRoleId) || false
      } catch (e) {
        console.error('Failed to fetch guild member info', e)
      }
    }

    // Create a JWT token manually
    const secret = process.env.AUTH_SECRET
    if (!secret) {
      throw new Error('AUTH_SECRET is not defined')
    }

    const token = await encode({
      secret,
      token: {
        sub: userId,
        name: username,
        picture: avatar,
        isAdmin,
        email: null,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
      },
      maxAge: 30 * 24 * 60 * 60,
      salt:
        process.env.NODE_ENV === 'production'
          ? '__Secure-authjs.session-token'
          : 'authjs.session-token',
    })

    // Set the session token cookie
    const cookieStore = await cookies()
    const cookieName =
      process.env.NODE_ENV === 'production'
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token'

    cookieStore.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })

    // Redirect to submit page
    return NextResponse.redirect(new URL('/submit', request.url))
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.redirect(new URL('/api/auth/error?error=SessionCreation', request.url))
  }
}
