import { Button } from './ui'
import Link from 'next/link'
import { getRelativeWeekId, getWeekId } from '@/lib/utils'

interface WeekNavigatorProps {
  currentWeek: string;
  baseUrl: string;
}

export function WeekNavigator({ currentWeek, baseUrl }: WeekNavigatorProps) {
  const prevWeek = getRelativeWeekId(-1)
  const todayWeek = getWeekId()
  const nextWeek = getRelativeWeekId(1)

  return (
    <div className="flex items-center justify-center space-x-2 my-6">
      <Link href={`${baseUrl}?week=${prevWeek}`}>
        <Button variant={currentWeek === prevWeek ? 'default' : 'outline'}>＜ 前週</Button>
      </Link>
      <Link href={`${baseUrl}?week=${todayWeek}`}>
        <Button variant={currentWeek === todayWeek ? 'default' : 'outline'}>今週</Button>
      </Link>
      <Link href={`${baseUrl}?week=${nextWeek}`}>
        <Button variant={currentWeek === nextWeek ? 'default' : 'outline'}>次週 ＞</Button>
      </Link>
    </div>
  )
}
