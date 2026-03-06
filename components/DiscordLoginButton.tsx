'use client'

import { Button } from '@/components/ui'

export function DiscordLoginButton() {
  const handleDeepLinkLogin = () => {
    // Use custom deep link OAuth flow
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
    const redirectUri = `${window.location.origin}/api/auth-discord`

    // Build the deep link with properly formatted parameters
    const params = new URLSearchParams({
      client_id: clientId || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify guilds guilds.members.read',
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
