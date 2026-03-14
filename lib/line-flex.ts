import { formatWeekDate } from '@/lib/utils'
import { getWeekData } from '@/lib/firebase'

export type LineFlexBubble = {
  type: 'bubble'
  hero?: Record<string, unknown>
  header?: Record<string, unknown>
  body?: Record<string, unknown>
  footer?: Record<string, unknown>
}

export type LineFlexMessage = {
  type: 'flex'
  altText: string
  contents: LineFlexBubble
}

export function buildNextEventFlexMessage(weekId: string, weekData: Awaited<ReturnType<typeof getWeekData>>): LineFlexMessage {
  const dateText = formatWeekDate(weekId)

  const talks = weekData.talks
    .sort((a, b) => a.order - b.order)
    .map((talk, i) => ({
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      contents: [
        {
          type: 'image',
          url: talk.presenterAvatar || 'https://mini-lt.lumos-ynu.jp/images/miniLT.jpg',
          size: 'xxs',
          aspectRatio: '1:1',
          aspectMode: 'cover',
          gravity: 'center',
        },
        {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: talk.presenterName,
              size: 'xs',
              color: '#555555',
              weight: 'bold',
              wrap: true,
            },
            {
              type: 'text',
              text: `${i + 1}. ${talk.title}`,
              size: 'sm',
              color: '#262626',
              wrap: true,
            },
          ],
          flex: 1,
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

  const eventUrl = weekData.discordEventUrl || 'https://mini-lt.lumos-ynu.jp'

  return {
    type: 'flex',
    altText: `Lumos Mini LT ${dateText} 更新情報`,
    contents: {
      type: 'bubble',
      hero: {
        type: 'image',
        url: 'https://mini-lt.lumos-ynu.jp/images/miniLT.jpg',
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'text',
            text: `${dateText}のminiLT予定`,
            weight: 'bold',
            size: 'md',
            color: '#1f2937',
            wrap: true,
          },
          ...talkBody,
          {
            type: 'text',
            text: '「聞いてみたい！」という方は気軽に「興味あり」をタップ',
            size: 'sm',
            color: '#666666',
            wrap: true,
            margin: 'md',
          },
          {
            type: 'separator',
            margin: 'md',
          },
          {
            type: 'text',
            text: '詳細はこちら：',
            size: 'xs',
            color: '#999999',
            wrap: true,
          },
          {
            type: 'text',
            text: 'https://mini-lt.lumos-ynu.jp',
            size: 'xs',
            color: '#0000EE',
            wrap: true,
            action: {
              type: 'uri',
              label: '詳細はこちら',
              uri: 'https://mini-lt.lumos-ynu.jp',
            },
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#0077CC',
            action: {
              type: 'uri',
              label: '興味あり',
              uri: eventUrl,
            },
          },
        ],
      },
    },
  }
}
