import { NextRequest, NextResponse } from 'next/server'
import { getEventInterestedUsers, getDiscordAvatarUrl } from '@/lib/discord'

export const dynamic = 'force-dynamic'

/**
 * GET /api/discord/events/[eventId]/interested-users
 *
 * Returns a list of users who marked "interested" in the Discord event
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params

    // Fetch interested users from Discord API
    const discordUsers = await getEventInterestedUsers(eventId)

    // Transform to simpler format with avatar URLs
    const users = discordUsers.map(eventUser => ({
      userId: eventUser.user.id,
      username: eventUser.user.global_name || eventUser.user.username,
      avatarUrl: getDiscordAvatarUrl(
        eventUser.user.id,
        eventUser.member?.avatar || eventUser.user.avatar,
        eventUser.user.discriminator
      ),
    }))

    return NextResponse.json({ users, count: users.length })
  } catch (error) {
    console.error('Failed to fetch interested users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interested users' },
      { status: 500 }
    )
  }
}
