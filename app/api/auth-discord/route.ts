import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    console.error('Discord OAuth error:', error)
    return NextResponse.redirect(new URL('/api/auth/error?error=OAuthCallback', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/api/auth/error?error=MissingCode', request.url))
  }

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

    // Create a session using NextAuth's signIn
    // We need to store the Discord user data temporarily and use it in the session
    // For now, we'll redirect to a custom session creation endpoint
    const sessionUrl = new URL('/api/auth/create-session', request.url)
    sessionUrl.searchParams.set('userId', discordUser.id)
    sessionUrl.searchParams.set('username', discordUser.username)
    sessionUrl.searchParams.set('discriminator', discordUser.discriminator || '0')
    sessionUrl.searchParams.set(
      'avatar',
      `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
    )
    sessionUrl.searchParams.set('accessToken', accessToken)

    return NextResponse.redirect(sessionUrl)
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/api/auth/error?error=CallbackError', request.url))
  }
}
