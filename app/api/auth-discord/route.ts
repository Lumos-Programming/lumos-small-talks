import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { encode } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    console.error('Discord OAuth error:', error)
    return NextResponse.redirect(new URL('/api/auth/error?error=OAuthCallback', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/api/auth/error?error=MissingCode', request.url))
  }

  // Validate state parameter to prevent CSRF
  const cookieStore = await cookies()
  const storedState = cookieStore.get('discord_oauth_state')?.value

  if (!state || !storedState || state !== storedState) {
    console.error('OAuth state mismatch or missing')
    return NextResponse.redirect(new URL('/api/auth/error?error=InvalidState', request.url))
  }

  // Clear the state cookie after validation
  cookieStore.delete('discord_oauth_state')

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.AUTH_DISCORD_ID!,
        client_secret: process.env.AUTH_DISCORD_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${request.nextUrl.origin}/api/auth-discord`,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Token exchange failed:', errorData)
      return NextResponse.redirect(new URL('/api/auth/error?error=TokenExchange', request.url))
    }

    const tokens = await tokenResponse.json()
    const accessToken = tokens.access_token

    // Fetch user info
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!userResponse.ok) {
      console.error('Failed to fetch user info')
      return NextResponse.redirect(new URL('/api/auth/error?error=UserInfo', request.url))
    }

    const discordUser = await userResponse.json()

    // Check guild membership (if configured)
    const guildId = process.env.DISCORD_GUILD_ID
    if (guildId) {
      const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!guildsResponse.ok) {
        console.error('Failed to fetch guilds')
        return NextResponse.redirect(new URL('/api/auth/error?error=GuildCheck', request.url))
      }

      const guilds = await guildsResponse.json()
      const isMember = guilds.some((g: { id: string }) => g.id === guildId)

      if (!isMember) {
        return NextResponse.redirect(
          new URL('/api/auth/error?error=AccessDenied&message=NotGuildMember', request.url)
        )
      }
    }

    // Check admin role
    let isAdmin = false
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

    // Create session cookie directly here (avoid exposing token in URL)
    const secret = process.env.AUTH_SECRET
    if (!secret) {
      throw new Error('AUTH_SECRET is not defined')
    }

    // Handle null avatar case
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : null

    const token = await encode({
      secret,
      token: {
        sub: discordUser.id,
        name: discordUser.username,
        picture: avatarUrl,
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
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/api/auth/error?error=CallbackError', request.url))
  }
}
