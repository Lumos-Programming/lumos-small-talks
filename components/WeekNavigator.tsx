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
  const isDuringEvent = isMonday && hour >= 21 && hour < 22

  // イベント基準の週を計算
  // 月曜21:00以降は「次回」が次の週になる
  const offset = isDuringEvent ? 0 : 1

  const prevWeek = getRelativeWeekId(offset - 2)
  const centerWeek = getRelativeWeekId(offset - 1)
  const nextWeek = getRelativeWeekId(offset)

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
