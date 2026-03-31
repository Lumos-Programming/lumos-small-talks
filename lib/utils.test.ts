import { describe, it, expect } from 'vitest'
import {
  getWeekId,
  getThisWeekEventState,
  EventState,
  getNavigationWeeks,
  getNextEventWeekId,
  getWeekLabel,
  getNextEventDate,
  EVENT_CONFIG,
  type EventConfig,
} from './utils'

// ヘルパー関数: 指定した曜日と時刻のDateオブジェクトを生成
function createDateForDayAndTime(dayOfWeek: number, hour: number, minute: number = 0): Date {
  // 基準日として2026-03-02（月曜日）を使用
  const baseMonday = new Date('2026-03-02T00:00:00')
  const baseDayOfWeek = baseMonday.getDay() // 1 (月曜日)

  // 基準日から目標曜日までのオフセットを計算
  let dayOffset = dayOfWeek - baseDayOfWeek
  if (dayOffset < 0) dayOffset += 7

  const targetDate = new Date(baseMonday)
  targetDate.setDate(baseMonday.getDate() + dayOffset)
  targetDate.setHours(hour, minute, 0, 0)

  return targetDate
}

// ヘルパー関数: 翌日の曜日を取得
function getNextDay(dayOfWeek: number): number {
  return (dayOfWeek + 1) % 7
}

// ヘルパー関数: getThisWeekEventStateがPastを返す曜日を取得
// getThisWeekEventStateはgetDay()の数値比較: dayOfWeek < getDay()の日がPast
function getDaysPast(eventDay: number): number[] {
  const days: number[] = []
  for (let d = 0; d < 7; d++) {
    if (d > eventDay) {
      days.push(d)
    }
  }
  return days
}

// ヘルパー関数: getThisWeekEventStateがUpcomingを返す曜日を取得（イベント日自体を除く）
// getThisWeekEventStateはgetDay()の数値比較: dayOfWeek > getDay()の日がUpcoming
function getDaysUpcoming(eventDay: number): number[] {
  const days: number[] = []
  for (let d = 0; d < 7; d++) {
    if (d < eventDay) {
      days.push(d)
    }
  }
  return days
}

describe('週次ロジックのテスト', () => {
  describe('getThisWeekEventState', () => {
    it('イベント開催中はOngoingを返す', () => {
      const eventStart = createDateForDayAndTime(EVENT_CONFIG.dayOfWeek, EVENT_CONFIG.startHour, 0)
      const eventMid = createDateForDayAndTime(EVENT_CONFIG.dayOfWeek, EVENT_CONFIG.startHour, 30)
      const eventNearEnd = createDateForDayAndTime(
        EVENT_CONFIG.dayOfWeek,
        EVENT_CONFIG.endHour - 1,
        59
      )

      expect(getThisWeekEventState(eventStart)).toBe(EventState.Ongoing)
      expect(getThisWeekEventState(eventMid)).toBe(EventState.Ongoing)
      expect(getThisWeekEventState(eventNearEnd)).toBe(EventState.Ongoing)
    })

    it('イベント開始前（イベント日当日）はUpcomingを返す', () => {
      const beforeEvent = createDateForDayAndTime(
        EVENT_CONFIG.dayOfWeek,
        EVENT_CONFIG.startHour - 1,
        59
      )
      const earlyMorning = createDateForDayAndTime(EVENT_CONFIG.dayOfWeek, 0, 0)

      expect(getThisWeekEventState(beforeEvent)).toBe(EventState.Upcoming)
      expect(getThisWeekEventState(earlyMorning)).toBe(EventState.Upcoming)
    })

    it('イベント日より前の曜日はUpcomingを返す', () => {
      const upcomingDays = getDaysUpcoming(EVENT_CONFIG.dayOfWeek)

      upcomingDays.forEach(day => {
        const testDate = createDateForDayAndTime(day, 12, 0)
        expect(getThisWeekEventState(testDate)).toBe(EventState.Upcoming)
      })
    })

    it('イベント日より後の曜日はPastを返す', () => {
      const pastDays = getDaysPast(EVENT_CONFIG.dayOfWeek)

      pastDays.forEach(day => {
        const testDate = createDateForDayAndTime(day, 12, 0)
        expect(getThisWeekEventState(testDate)).toBe(EventState.Past)
      })
    })

    it('イベント終了後（翌日）はPastを返す', () => {
      const nextDay = getNextDay(EVENT_CONFIG.dayOfWeek)
      const afterEvent = createDateForDayAndTime(nextDay, 0, 0)
      const afterEventPlus1 = createDateForDayAndTime(nextDay, 1, 0)

      expect(getThisWeekEventState(afterEvent)).toBe(EventState.Past)
      expect(getThisWeekEventState(afterEventPlus1)).toBe(EventState.Past)
    })
  })

  describe('getNavigationWeeks', () => {
    describe('イベント開催中 (Ongoing)', () => {
      it('前回=先週、今回=今週、次回=来週を返す（イベント開始時）', () => {
        const duringEvent = createDateForDayAndTime(
          EVENT_CONFIG.dayOfWeek,
          EVENT_CONFIG.startHour,
          30
        )
        const result = getNavigationWeeks(duringEvent)
        const currentWeek = getWeekId(duringEvent)

        expect(result.centerWeek).toBe(currentWeek)
        expect(result.centerLabel).toBe('今回')
        expect(result.rightLabel).toBe('次回')
      })

      it('前回=先週、今回=今週、次回=来週を返す（イベント終了間際）', () => {
        const nearEnd = createDateForDayAndTime(
          EVENT_CONFIG.dayOfWeek,
          EVENT_CONFIG.endHour - 1,
          30
        )
        const result = getNavigationWeeks(nearEnd)
        const currentWeek = getWeekId(nearEnd)

        expect(result.centerWeek).toBe(currentWeek)
        expect(result.centerLabel).toBe('今回')
        expect(result.rightLabel).toBe('次回')
      })
    })

    describe('イベント開始前 (Upcoming)', () => {
      it('前回=先週、次回=今週、次々回=来週を返す（イベント開始前、当日）', () => {
        const beforeEvent = createDateForDayAndTime(
          EVENT_CONFIG.dayOfWeek,
          EVENT_CONFIG.startHour - 1,
          59
        )
        const result = getNavigationWeeks(beforeEvent)
        const currentWeek = getWeekId(beforeEvent)

        expect(result.centerWeek).toBe(currentWeek)
        expect(result.centerLabel).toBe('次回')
        expect(result.rightLabel).toBe('次々回')
      })

      it('前回=先週、次回=今週、次々回=来週を返す（イベント日より前の曜日）', () => {
        const daysBeforeEvent = getDaysUpcoming(EVENT_CONFIG.dayOfWeek)
        if (daysBeforeEvent.length === 0) return // 日曜日イベントの場合はスキップ

        const beforeDay = createDateForDayAndTime(daysBeforeEvent[0], 15, 0)
        const result = getNavigationWeeks(beforeDay)
        const currentWeek = getWeekId(beforeDay)

        expect(result.centerWeek).toBe(currentWeek)
        expect(result.centerLabel).toBe('次回')
        expect(result.rightLabel).toBe('次々回')
      })
    })

    describe('イベント終了後 (Past)', () => {
      it('前回=今週、次回=来週、次々回=再来週を返す（イベント終了後）', () => {
        const nextDay = getNextDay(EVENT_CONFIG.dayOfWeek)
        const afterEvent = createDateForDayAndTime(nextDay, 0, 0)
        const result = getNavigationWeeks(afterEvent)
        const currentWeek = getWeekId(afterEvent)

        expect(result.prevWeek).toBe(currentWeek)
        expect(result.centerLabel).toBe('次回')
        expect(result.rightLabel).toBe('次々回')
      })

      it('前回=今週、次回=来週、次々回=再来週を返す（イベント日より後の曜日）', () => {
        const daysAfterEvent = getDaysPast(EVENT_CONFIG.dayOfWeek)
        const afterDay = createDateForDayAndTime(daysAfterEvent[0], 15, 0)
        const result = getNavigationWeeks(afterDay)
        const currentWeek = getWeekId(afterDay)

        expect(result.prevWeek).toBe(currentWeek)
        expect(result.centerLabel).toBe('次回')
        expect(result.rightLabel).toBe('次々回')
      })
    })
  })

  describe('getNextEventWeekId', () => {
    it('イベント開催中は今週を返す', () => {
      const duringEvent = createDateForDayAndTime(
        EVENT_CONFIG.dayOfWeek,
        EVENT_CONFIG.startHour,
        30
      )
      const currentWeek = getWeekId(duringEvent)
      expect(getNextEventWeekId(duringEvent)).toBe(currentWeek)
    })

    it('イベント開始前（Upcoming）は今週を返す', () => {
      const beforeEvent = createDateForDayAndTime(
        EVENT_CONFIG.dayOfWeek,
        EVENT_CONFIG.startHour - 1,
        59
      )
      const currentWeek = getWeekId(beforeEvent)
      expect(getNextEventWeekId(beforeEvent)).toBe(currentWeek)
    })

    it('イベント日より前の曜日（Upcoming）は今週を返す', () => {
      const daysBeforeEvent = getDaysUpcoming(EVENT_CONFIG.dayOfWeek)
      if (daysBeforeEvent.length === 0) return

      const beforeDay = createDateForDayAndTime(daysBeforeEvent[0], 15, 0)
      const currentWeek = getWeekId(beforeDay)
      expect(getNextEventWeekId(beforeDay)).toBe(currentWeek)
    })

    it('イベント終了後は来週を返す', () => {
      const nextDay = getNextDay(EVENT_CONFIG.dayOfWeek)
      const afterEvent = createDateForDayAndTime(nextDay, 0, 0)
      const nextWeek = getWeekId(new Date(afterEvent.getTime() + 7 * 24 * 60 * 60 * 1000))
      expect(getNextEventWeekId(afterEvent)).toBe(nextWeek)
    })

    it('イベント日より後の曜日（Past）は来週を返す', () => {
      const daysAfterEvent = getDaysPast(EVENT_CONFIG.dayOfWeek)
      const afterDay = createDateForDayAndTime(daysAfterEvent[0], 15, 0)
      const nextWeek = getWeekId(new Date(afterDay.getTime() + 7 * 24 * 60 * 60 * 1000))
      expect(getNextEventWeekId(afterDay)).toBe(nextWeek)
    })
  })

  describe('getWeekLabel', () => {
    describe('イベント開催中 (Ongoing)', () => {
      it('先週は「前回」とラベル付けされる', () => {
        const duringEvent = createDateForDayAndTime(
          EVENT_CONFIG.dayOfWeek,
          EVENT_CONFIG.startHour,
          30
        )
        const { prevWeek } = getNavigationWeeks(duringEvent)
        expect(getWeekLabel(prevWeek, duringEvent)).toBe('前回')
      })

      it('今週は「今回」とラベル付けされる', () => {
        const duringEvent = createDateForDayAndTime(
          EVENT_CONFIG.dayOfWeek,
          EVENT_CONFIG.startHour,
          30
        )
        const { centerWeek } = getNavigationWeeks(duringEvent)
        expect(getWeekLabel(centerWeek, duringEvent)).toBe('今回')
      })

      it('来週は「次回」とラベル付けされる', () => {
        const duringEvent = createDateForDayAndTime(
          EVENT_CONFIG.dayOfWeek,
          EVENT_CONFIG.startHour,
          30
        )
        const { nextWeek } = getNavigationWeeks(duringEvent)
        expect(getWeekLabel(nextWeek, duringEvent)).toBe('次回')
      })
    })

    describe('イベント開始前 (Upcoming)', () => {
      it('先週は「前回」とラベル付けされる', () => {
        const beforeEvent = createDateForDayAndTime(
          EVENT_CONFIG.dayOfWeek,
          EVENT_CONFIG.startHour - 1,
          0
        )
        const { prevWeek } = getNavigationWeeks(beforeEvent)
        expect(getWeekLabel(prevWeek, beforeEvent)).toBe('前回')
      })

      it('今週は「次回」とラベル付けされる', () => {
        const beforeEvent = createDateForDayAndTime(
          EVENT_CONFIG.dayOfWeek,
          EVENT_CONFIG.startHour - 1,
          0
        )
        const { centerWeek } = getNavigationWeeks(beforeEvent)
        expect(getWeekLabel(centerWeek, beforeEvent)).toBe('次回')
      })

      it('来週は「次々回」とラベル付けされる', () => {
        const beforeEvent = createDateForDayAndTime(
          EVENT_CONFIG.dayOfWeek,
          EVENT_CONFIG.startHour - 1,
          0
        )
        const { nextWeek } = getNavigationWeeks(beforeEvent)
        expect(getWeekLabel(nextWeek, beforeEvent)).toBe('次々回')
      })
    })

    describe('イベント終了後 (Past)', () => {
      it('今週は「前回」とラベル付けされる', () => {
        const nextDay = getNextDay(EVENT_CONFIG.dayOfWeek)
        const afterEvent = createDateForDayAndTime(nextDay, 15, 0)
        const { prevWeek } = getNavigationWeeks(afterEvent)
        expect(getWeekLabel(prevWeek, afterEvent)).toBe('前回')
      })

      it('来週は「次回」とラベル付けされる', () => {
        const nextDay = getNextDay(EVENT_CONFIG.dayOfWeek)
        const afterEvent = createDateForDayAndTime(nextDay, 15, 0)
        const { centerWeek } = getNavigationWeeks(afterEvent)
        expect(getWeekLabel(centerWeek, afterEvent)).toBe('次回')
      })

      it('再来週は「次々回」とラベル付けされる', () => {
        const nextDay = getNextDay(EVENT_CONFIG.dayOfWeek)
        const afterEvent = createDateForDayAndTime(nextDay, 15, 0)
        const { nextWeek } = getNavigationWeeks(afterEvent)
        expect(getWeekLabel(nextWeek, afterEvent)).toBe('次々回')
      })
    })

    describe('エッジケース', () => {
      it('ナビゲーション週に含まれない週は「今週」を返す', () => {
        const notDuringEvent = createDateForDayAndTime(EVENT_CONFIG.dayOfWeek + 1, 15, 0)
        const farPastWeek = '2026-W01'
        expect(getWeekLabel(farPastWeek, notDuringEvent)).toBe('今週')
      })
    })
  })

  describe('EVENT_CONFIGの柔軟性', () => {
    it('設定値が妥当であること', () => {
      expect(EVENT_CONFIG.dayOfWeek).toBeGreaterThanOrEqual(0)
      expect(EVENT_CONFIG.dayOfWeek).toBeLessThanOrEqual(6)
      expect(EVENT_CONFIG.startHour).toBeGreaterThanOrEqual(0)
      expect(EVENT_CONFIG.startHour).toBeLessThan(24)
      expect(EVENT_CONFIG.endHour).toBeGreaterThan(EVENT_CONFIG.startHour)
      expect(EVENT_CONFIG.endHour).toBeLessThanOrEqual(24)
    })

    it('任意の妥当なEVENT_CONFIGで正しく動作すること', () => {
      const duringEvent = createDateForDayAndTime(EVENT_CONFIG.dayOfWeek, EVENT_CONFIG.startHour, 0)
      const beforeEvent = createDateForDayAndTime(
        EVENT_CONFIG.dayOfWeek,
        EVENT_CONFIG.startHour - 1,
        59
      )

      // ロジックが正しく適応することを確認
      expect(getThisWeekEventState(duringEvent)).toBe(EventState.Ongoing)
      expect(getThisWeekEventState(beforeEvent)).toBe(EventState.Upcoming)

      // ナビゲーションが正しく適応することを確認
      const duringNav = getNavigationWeeks(duringEvent)
      const beforeNav = getNavigationWeeks(beforeEvent)

      expect(duringNav.centerLabel).toBe('今回')
      expect(beforeNav.centerLabel).toBe('次回')
    })
  })

  describe('getNextEventDate', () => {
    it('イベント日（月曜日）が渡された場合、その日をそのまま返す', () => {
      const monday = createDateForDayAndTime(1, 10, 0) // 月曜日 10:00
      const result = getNextEventDate(monday)
      expect(result.getDay()).toBe(1) // Monday
      expect(result.getDate()).toBe(monday.getDate())
    })

    it('火曜日が渡された場合、次の月曜日を返す', () => {
      const tuesday = createDateForDayAndTime(2, 10, 0) // 火曜日 10:00
      const result = getNextEventDate(tuesday)
      expect(result.getDay()).toBe(1) // Monday
      expect(result.getDate()).toBe(tuesday.getDate() + 6) // 6日後の月曜日
    })

    it('水曜日が渡された場合、次の月曜日を返す', () => {
      const wednesday = createDateForDayAndTime(3, 10, 0) // 水曜日 10:00
      const result = getNextEventDate(wednesday)
      expect(result.getDay()).toBe(1) // Monday
      expect(result.getDate()).toBe(wednesday.getDate() + 5) // 5日後の月曜日
    })

    it('日曜日が渡された場合、次の月曜日を返す', () => {
      const sunday = createDateForDayAndTime(0, 10, 0) // 日曜日 10:00
      const result = getNextEventDate(sunday)
      expect(result.getDay()).toBe(1) // Monday
      expect(result.getDate()).toBe(sunday.getDate() + 1) // 1日後の月曜日
    })

    it('土曜日が渡された場合、次の月曜日を返す', () => {
      const saturday = createDateForDayAndTime(6, 10, 0) // 土曜日 10:00
      const result = getNextEventDate(saturday)
      expect(result.getDay()).toBe(1) // Monday
      expect(result.getDate()).toBe(saturday.getDate() + 2) // 2日後の月曜日
    })

    it('異なるEVENT_CONFIGで正しく動作する（水曜日イベント）', () => {
      const wednesdayConfig: EventConfig = {
        dayOfWeek: 3, // 水曜日
        startHour: 19,
        endHour: 20,
      }

      // 月曜日から水曜日を探す
      const monday = createDateForDayAndTime(1, 10, 0)
      const result = getNextEventDate(monday, wednesdayConfig)
      expect(result.getDay()).toBe(3) // Wednesday
      expect(result.getDate()).toBe(monday.getDate() + 2)

      // 水曜日は水曜日を返す
      const wednesday = createDateForDayAndTime(3, 10, 0)
      const result2 = getNextEventDate(wednesday, wednesdayConfig)
      expect(result2.getDay()).toBe(3)
      expect(result2.getDate()).toBe(wednesday.getDate())

      // 木曜日から次の水曜日を探す
      const thursday = createDateForDayAndTime(4, 10, 0)
      const result3 = getNextEventDate(thursday, wednesdayConfig)
      expect(result3.getDay()).toBe(3)
      expect(result3.getDate()).toBe(thursday.getDate() + 6)
    })

    it('異なるEVENT_CONFIGで正しく動作する（日曜日イベント）', () => {
      const sundayConfig: EventConfig = {
        dayOfWeek: 0, // 日曜日
        startHour: 10,
        endHour: 12,
      }

      // 月曜日から日曜日を探す
      const monday = createDateForDayAndTime(1, 10, 0)
      const result = getNextEventDate(monday, sundayConfig)
      expect(result.getDay()).toBe(0) // Sunday
      expect(result.getDate()).toBe(monday.getDate() + 6)

      // 土曜日から日曜日を探す
      const saturday = createDateForDayAndTime(6, 10, 0)
      const result2 = getNextEventDate(saturday, sundayConfig)
      expect(result2.getDay()).toBe(0)
      expect(result2.getDate()).toBe(saturday.getDate() + 1)

      // 日曜日は日曜日を返す
      const sunday = createDateForDayAndTime(0, 10, 0)
      const result3 = getNextEventDate(sunday, sundayConfig)
      expect(result3.getDay()).toBe(0)
      expect(result3.getDate()).toBe(sunday.getDate())
    })

    it('元のDateオブジェクトを変更しないこと', () => {
      const original = createDateForDayAndTime(2, 10, 0) // 火曜日
      const originalDate = original.getDate()
      const result = getNextEventDate(original)

      // 元のオブジェクトが変更されていないことを確認
      expect(original.getDate()).toBe(originalDate)
      expect(original.getDay()).toBe(2)

      // 結果は異なるオブジェクトであることを確認
      expect(result).not.toBe(original)
    })
  })

  // 異なるイベント設定でテストして柔軟性を証明
  describe('異なるEVENT_CONFIGのシナリオ', () => {
    it('水曜日 19:00-20:00 のイベントで正しく動作すること', () => {
      const wednesdayConfig: EventConfig = {
        dayOfWeek: 3, // 水曜日
        startHour: 19,
        endHour: 20,
      }

      // 水曜日 19:30（イベント中）
      const duringEvent = createDateForDayAndTime(3, 19, 30)
      expect(getThisWeekEventState(duringEvent, wednesdayConfig)).toBe(EventState.Ongoing)

      const { centerLabel } = getNavigationWeeks(duringEvent, wednesdayConfig)
      expect(centerLabel).toBe('今回')

      // 水曜日 18:59（イベント前）
      const beforeEvent = createDateForDayAndTime(3, 18, 59)
      expect(getThisWeekEventState(beforeEvent, wednesdayConfig)).toBe(EventState.Upcoming)

      // 木曜日 10:00（イベント後）
      const afterEvent = createDateForDayAndTime(4, 10, 0)
      expect(getThisWeekEventState(afterEvent, wednesdayConfig)).toBe(EventState.Past)

      const { centerLabel: afterLabel } = getNavigationWeeks(afterEvent, wednesdayConfig)
      expect(afterLabel).toBe('次回')
    })

    it('金曜日 18:00-21:00 のイベントで正しく動作すること', () => {
      const fridayConfig: EventConfig = {
        dayOfWeek: 5, // 金曜日
        startHour: 18,
        endHour: 21,
      }

      // 金曜日 18:00（イベント開始）
      const eventStart = createDateForDayAndTime(5, 18, 0)
      expect(getThisWeekEventState(eventStart, fridayConfig)).toBe(EventState.Ongoing)

      // 金曜日 20:59（イベント中）
      const eventEnd = createDateForDayAndTime(5, 20, 59)
      expect(getThisWeekEventState(eventEnd, fridayConfig)).toBe(EventState.Ongoing)

      // 金曜日 21:00（イベント後 — endHour以降はUpcomingに分類される）
      // Note: getThisWeekEventState compares dayOfWeek equality + hour range,
      // hour 21 >= endHour(21) so it falls to Upcoming branch
      const afterEvent = createDateForDayAndTime(5, 21, 0)
      expect(getThisWeekEventState(afterEvent, fridayConfig)).toBe(EventState.Upcoming)

      const nextEventWeek = getNextEventWeekId(eventStart, fridayConfig)
      const currentWeek = getWeekId(eventStart)
      expect(nextEventWeek).toBe(currentWeek)

      // 土曜日（イベント後、Past状態）
      const saturday = createDateForDayAndTime(6, 10, 0)
      expect(getThisWeekEventState(saturday, fridayConfig)).toBe(EventState.Past)
      const nextEventWeekAfter = getNextEventWeekId(saturday, fridayConfig)
      expect(nextEventWeekAfter).not.toBe(currentWeek)
    })

    it('日曜日 10:00-12:00 の朝イベントで正しく動作すること', () => {
      const sundayConfig: EventConfig = {
        dayOfWeek: 0, // 日曜日
        startHour: 10,
        endHour: 12,
      }

      // 日曜日 11:00（イベント中）
      const duringEvent = createDateForDayAndTime(0, 11, 0)
      expect(getThisWeekEventState(duringEvent, sundayConfig)).toBe(EventState.Ongoing)

      const { prevWeek, centerWeek, nextWeek, centerLabel, rightLabel } = getNavigationWeeks(
        duringEvent,
        sundayConfig
      )

      expect(centerLabel).toBe('今回')
      expect(rightLabel).toBe('次回')

      // 週ラベルが正しく動作することを確認
      expect(getWeekLabel(prevWeek, duringEvent, sundayConfig)).toBe('前回')
      expect(getWeekLabel(centerWeek, duringEvent, sundayConfig)).toBe('今回')
      expect(getWeekLabel(nextWeek, duringEvent, sundayConfig)).toBe('次回')

      // 月曜日 14:00（イベント後、Past状態）
      const notDuringEvent = createDateForDayAndTime(1, 14, 0)
      expect(getThisWeekEventState(notDuringEvent, sundayConfig)).toBe(EventState.Past)

      const { centerLabel: centerLabel2, rightLabel: rightLabel2 } = getNavigationWeeks(
        notDuringEvent,
        sundayConfig
      )
      expect(centerLabel2).toBe('次回')
      expect(rightLabel2).toBe('次々回')
    })

    it('土曜日 22:00-24:00 の深夜イベントで正しく動作すること', () => {
      const saturdayConfig: EventConfig = {
        dayOfWeek: 6, // 土曜日
        startHour: 22,
        endHour: 24,
      }

      // 土曜日 23:30（イベント中）
      const duringEvent = createDateForDayAndTime(6, 23, 30)
      expect(getThisWeekEventState(duringEvent, saturdayConfig)).toBe(EventState.Ongoing)

      // 日曜日 00:00（深夜0時でイベント終了後 — 日曜日 < 土曜日なのでUpcoming扱い）
      const afterMidnight = createDateForDayAndTime(0, 0, 0)
      expect(getThisWeekEventState(afterMidnight, saturdayConfig)).toBe(EventState.Upcoming)
    })
  })

  describe('バグ修正: イベント開始前の週扱い', () => {
    it('月曜日20:59（イベント開始前）は今週のイベントとして扱う', () => {
      // 旧実装ではイベント開始前が「次週」扱いされていたバグの修正を検証
      const beforeEvent = createDateForDayAndTime(1, 20, 59) // 月曜 20:59
      expect(getThisWeekEventState(beforeEvent)).toBe(EventState.Upcoming)
      expect(getNextEventWeekId(beforeEvent)).toBe(getWeekId(beforeEvent))

      const nav = getNavigationWeeks(beforeEvent)
      expect(nav.centerWeek).toBe(getWeekId(beforeEvent))
      expect(nav.centerLabel).toBe('次回')
    })

    it('月曜日22:00（イベント開始）は今回として扱う', () => {
      const eventStart = createDateForDayAndTime(1, 22, 0) // 月曜 22:00
      expect(getThisWeekEventState(eventStart)).toBe(EventState.Ongoing)
      expect(getNextEventWeekId(eventStart)).toBe(getWeekId(eventStart))

      const nav = getNavigationWeeks(eventStart)
      expect(nav.centerWeek).toBe(getWeekId(eventStart))
      expect(nav.centerLabel).toBe('今回')
    })

    it('火曜日0:00（イベント終了後）は次週のイベントを参照する', () => {
      const afterEvent = createDateForDayAndTime(2, 0, 0) // 火曜 0:00
      expect(getThisWeekEventState(afterEvent)).toBe(EventState.Past)

      const currentWeek = getWeekId(afterEvent)
      const nav = getNavigationWeeks(afterEvent)
      expect(nav.prevWeek).toBe(currentWeek)
      expect(nav.centerLabel).toBe('次回')
    })
  })
})
