'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

type InterestedUser = {
  userId: string
  username: string
  avatarUrl: string
}

export function InterestedUsers({ eventId }: { eventId: string }) {
  const [users, setUsers] = useState<InterestedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInterestedUsers() {
      try {
        setLoading(true)
        const response = await fetch(`/api/discord/events/${eventId}/interested-users`)
        if (!response.ok) {
          throw new Error('Failed to fetch interested users')
        }
        const data = await response.json()
        setUsers(data.users || [])
      } catch (err) {
        console.error('Error fetching interested users:', err)
        setError('参加者情報の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchInterestedUsers()
  }, [eventId])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
        <span>参加者を読み込み中...</span>
      </div>
    )
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>
  }

  if (users.length === 0) {
    return <div className="text-sm text-muted-foreground">興味あり👀 ...まだ誰もいないみたい</div>
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-gray-700">興味あり👀 ({users.length})</span>
      <div className="flex flex-wrap gap-0.5">
        {users.map(user => (
          <div key={user.userId} className="group relative" title={user.username}>
            <Image
              src={user.avatarUrl}
              alt={user.username}
              width={32}
              height={32}
              className="rounded-full border-2 border-purple-200 hover:border-purple-400 transition-all"
            />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {user.username}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
