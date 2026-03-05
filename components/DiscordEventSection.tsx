'use client'

import { useState } from 'react'
import { InterestedUsers } from './InterestedUsers'
import { DiscordEventCTA } from './DiscordEventCTA'

type DiscordEventSectionProps = {
  eventId: string
  eventUrl?: string
  currentUserId?: string
}

export function DiscordEventSection({
  eventId,
  eventUrl,
  currentUserId,
}: DiscordEventSectionProps) {
  const [isUserInterested, setIsUserInterested] = useState(false)

  return (
    <div className="space-y-3 mb-4">
      {!isUserInterested && <DiscordEventCTA eventUrl={eventUrl} />}
      <InterestedUsers
        eventId={eventId}
        currentUserId={currentUserId}
        onUserInterestedChange={setIsUserInterested}
      />
    </div>
  )
}
