'use client'

import { Button } from '@/components/ui'

export function DiscordLoginButton() {
  const handleDeepLinkLogin = () => {
    // Use custom deep link OAuth flow
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID

    if (!clientId) {
      console.error('NEXT_PUBLIC_DISCORD_CLIENT_ID is not configured')
      // Fallback to standard login if client ID is not set
      handleStandardLogin()
      return
    }

    const redirectUri = `${window.location.origin}/api/auth-discord`

    // Generate a cryptographically secure state parameter and persist it
    const stateBytes = new Uint8Array(16)
    window.crypto.getRandomValues(stateBytes)
    const state = Array.from(stateBytes, (b) => b.toString(16).padStart(2, '0')).join('')

    // Set cookie using a function to avoid ESLint error
    const setCookie = (name: string, value: string, options: string) => {
      document.cookie = `${name}=${value}; ${options}`
    }
    setCookie('discord_oauth_state', encodeURIComponent(state), 'Path=/; Secure; SameSite=Lax; Max-Age=600')

    // Build the deep link with properly formatted parameters, including state
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify guilds guilds.members.read',
      state,
    })

    const deepLink = `discord:///oauth2/authorize?${params.toString()}`

    // Navigate to deep link
    window.location.assign(deepLink)
  }

  const handleStandardLogin = () => {
    // Use standard NextAuth flow
    window.location.assign('/api/auth/signin?callbackUrl=/submit')
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleDeepLinkLogin}
        size="lg"
        className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-6 text-lg font-semibold"
      >
        <span className="mr-2">📱</span>
        Discordアプリでログイン
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">または</span>
        </div>
      </div>

      <Button
        onClick={handleStandardLogin}
        size="lg"
        variant="outline"
        className="w-full border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2] hover:text-white py-6 text-lg font-semibold"
      >
        <span className="mr-2">🌐</span>
        ブラウザでログイン
      </Button>
    </div>
  )
}
