import { format, addWeeks, parseISO } from 'date-fns'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ja } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getWeekId(date: Date = new Date()): string {
  // ISOWeek format: 2026-W09
  return format(date, "RRRR-'W'II")
}

export function getRelativeWeekId(offset: number): string {
  const date = addWeeks(new Date(), offset)
  return getWeekId(date)
}

export function getWeekDateFromWeekId(weekId: string): Date {
  // weekId format: "2026-W09"
  const [year, week] = weekId.split('-W')
  // ISO week date format: 2026-W09-1 (Monday)
  const isoDate = `${year}-W${week.padStart(2, '0')}-1`
  return parseISO(isoDate)
}

export function formatWeekDate(weekId: string): string {
  try {
    const monday = getWeekDateFromWeekId(weekId)
    return format(monday, 'M月d日(E)', { locale: ja })
  } catch {
    return weekId
  }
}
