import { format, addWeeks } from 'date-fns';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getWeekId(date: Date = new Date()): string {
  // ISOWeek format: 2026-W09
  return format(date, "RRRR-'W'II");
}

export function getRelativeWeekId(offset: number): string {
  const date = addWeeks(new Date(), offset);
  return getWeekId(date);
}
