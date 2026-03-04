import { Button } from './ui'
import Link from 'next/link'
import { getRelativeWeekId, formatWeekDate } from '@/lib/utils'

interface WeekNavigatorProps {
  currentWeek: string
  baseUrl: string
}

export function WeekNavigator({ currentWeek, baseUrl }: WeekNavigatorProps) {
  // イベント開催中かチェック（月曜21:00〜22:00の間）
  const now = new Date()
  const isMonday = now.getDay() === 1
  const hour = now.getHours()
  const isDuringEvent = isMonday && hour >= 21

  // イベント基準の週を計算
  // イベント開催中（月曜21:00〜24:00）: 前回=先週、今回=今週、次回=来週
  // イベント前（火曜〜次の月曜21:00前）: 前回=先週、次回=今週、次々回=来週
  let prevWeek, centerWeek, nextWeek

  if (isDuringEvent) {
    // イベント開催中
    prevWeek = getRelativeWeekId(-1) // 先週
    centerWeek = getRelativeWeekId(0) // 今週
    nextWeek = getRelativeWeekId(1) // 来週
  } else {
    // 火曜〜次の月曜21:00前
    prevWeek = getRelativeWeekId(0) // 今週
    centerWeek = getRelativeWeekId(1) // 来週
    nextWeek = getRelativeWeekId(2) // 再来週
  }

  const prevDate = formatWeekDate(prevWeek)
  const centerDate = formatWeekDate(centerWeek)
  const nextDate = formatWeekDate(nextWeek)

  return (
    <div className="flex items-center justify-center gap-3">
      <Link href={`${baseUrl}?week=${prevWeek}`}>
        <Button
          variant={currentWeek === prevWeek ? 'default' : 'outline'}
          className={
            currentWeek === prevWeek
              ? 'bg-gradient-primary flex flex-col items-start py-2 h-auto'
              : 'hover:bg-purple-50 flex flex-col items-start py-2 h-auto'
          }
        >
          <span className="text-xs">← 前回</span>
          <span className="text-xs font-normal opacity-70">{prevDate}</span>
        </Button>
      </Link>
      <Link href={`${baseUrl}?week=${centerWeek}`}>
        <Button
          variant={currentWeek === centerWeek ? 'default' : 'outline'}
          className={
            currentWeek === centerWeek
              ? 'bg-gradient-primary px-6 flex flex-col py-2 h-auto'
              : 'hover:bg-purple-50 px-6 flex flex-col py-2 h-auto'
          }
        >
          <span className="text-sm">{isDuringEvent ? '📅 今回' : '📅 次回'}</span>
          <span className="text-xs font-normal opacity-70">{centerDate}</span>
        </Button>
      </Link>
      <Link href={`${baseUrl}?week=${nextWeek}`}>
        <Button
          variant={currentWeek === nextWeek ? 'default' : 'outline'}
          className={
            currentWeek === nextWeek
              ? 'bg-gradient-primary flex flex-col items-end py-2 h-auto'
              : 'hover:bg-purple-50 flex flex-col items-end py-2 h-auto'
          }
        >
          <span className="text-xs">{isDuringEvent ? '次回' : '次々回'} →</span>
          <span className="text-xs font-normal opacity-70">{nextDate}</span>
        </Button>
      </Link>
    </div>
  )
}
