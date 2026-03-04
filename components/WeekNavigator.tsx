import { Button } from './ui'
import Link from 'next/link'
import { getRelativeWeekId, getWeekId, formatWeekDate } from '@/lib/utils'

interface WeekNavigatorProps {
  currentWeek: string;
  baseUrl: string;
}

export function WeekNavigator({ currentWeek, baseUrl }: WeekNavigatorProps) {
  const prevWeek = getRelativeWeekId(-1)
  const todayWeek = getWeekId()
  const nextWeek = getRelativeWeekId(1)

  const prevDate = formatWeekDate(prevWeek)
  const todayDate = formatWeekDate(todayWeek)
  const nextDate = formatWeekDate(nextWeek)

  return (
    <div className="flex items-center justify-center gap-3">
      <Link href={`${baseUrl}?week=${prevWeek}`}>
        <Button
          variant={currentWeek === prevWeek ? 'default' : 'outline'}
          className={currentWeek === prevWeek ? 'bg-gradient-primary flex flex-col items-start py-2 h-auto' : 'hover:bg-purple-50 flex flex-col items-start py-2 h-auto'}
        >
          <span className="text-xs">← 前週</span>
          <span className="text-xs font-normal opacity-70">{prevDate}</span>
        </Button>
      </Link>
      <Link href={`${baseUrl}?week=${todayWeek}`}>
        <Button
          variant={currentWeek === todayWeek ? 'default' : 'outline'}
          className={currentWeek === todayWeek ? 'bg-gradient-primary px-6 flex flex-col py-2 h-auto' : 'hover:bg-purple-50 px-6 flex flex-col py-2 h-auto'}
        >
          <span className="text-sm">📅 今週</span>
          <span className="text-xs font-normal opacity-70">{todayDate}</span>
        </Button>
      </Link>
      <Link href={`${baseUrl}?week=${nextWeek}`}>
        <Button
          variant={currentWeek === nextWeek ? 'default' : 'outline'}
          className={currentWeek === nextWeek ? 'bg-gradient-primary flex flex-col items-end py-2 h-auto' : 'hover:bg-purple-50 flex flex-col items-end py-2 h-auto'}
        >
          <span className="text-xs">次週 →</span>
          <span className="text-xs font-normal opacity-70">{nextDate}</span>
        </Button>
      </Link>
    </div>
  )
}
