'use server'

import { revalidatePath } from 'next/cache'
import { getWeekData } from '@/lib/firebase'
import { getNextEventWeekId, formatWeekDate } from '@/lib/utils'

type LineFlexBubble = {
  type: 'bubble'
  header?: Record<string, unknown>
  body?: Record<string, unknown>
  footer?: Record<string, unknown>
}

type LineFlexMessage = {
  type: 'flex'
  altText: string
  contents: LineFlexBubble
}

function buildNextEventFlexMessage(weekId: string, weekData: Awaited<ReturnType<typeof getWeekData>>): LineFlexMessage {
  const dateText = formatWeekDate(weekId)

  const talks = weekData.talks
    .sort((a, b) => a.order - b.order)
    .map((talk, i) => ({
      type: 'box',
      layout: 'baseline',
      spacing: 'sm',
      contents: [
        {
          type: 'text',
          text: `${i + 1}.`,
          size: 'sm',
          color: '#555555',
          flex: 0,
        },
        {
          type: 'text',
          text: talk.title,
          size: 'sm',
          color: '#262626',
          weight: 'bold',
          wrap: true,
          flex: 5,
        },
      ],
    }))

  const talkBody = talks.length
    ? talks
    : [
        {
          type: 'text',
          text: 'まだ発表が登録されていません。',
          size: 'sm',
          color: '#999999',
          wrap: true,
        },
      ]

  return {
    type: 'flex',
    altText: `Lumos Mini LT ${dateText} 更新情報`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `次回イベント (${dateText})`,
            weight: 'bold',
            size: 'lg',
            color: '#1f2937',
            wrap: true,
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'text',
            text: '今週のLT予定',
            weight: 'bold',
            size: 'md',
            color: '#1f2937',
          },
          ...talkBody,
          {
            type: 'text',
            text: '詳細・参加登録: https://mini-lt.lumos-ynu.jp',
            size: 'xs',
            color: '#999999',
            wrap: true,
            margin: 'md',
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '※ 週次の予定はサイトの登録情報に基づきます',
            size: 'xs',
            color: '#aaaaaa',
            wrap: true,
          },
        ],
      },
    },
  }
}

export async function sendLineNextEvent(): Promise<void> {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN
  const toUserId = process.env.LINE_PUSH_TARGET_ID

  if (!channelAccessToken) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN が設定されていません')
  }
  if (!toUserId) {
    throw new Error('LINE_PUSH_TARGET_ID が設定されていません')
  }

  const weekId = getNextEventWeekId()
  const weekData = await getWeekData(weekId)

  const lineMessage = buildNextEventFlexMessage(weekId, weekData)

  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({
      to: toUserId,
      messages: [lineMessage],
    }),
  })

  if (!response.ok) {
    const bodyText = await response.text()
    throw new Error(`LINE メッセージ送信に失敗しました: ${response.status} ${response.statusText} - ${bodyText}`)
  }

  revalidatePath('/admin')
  revalidatePath('/')
}
