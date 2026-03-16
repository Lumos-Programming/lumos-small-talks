import { formatWeekDate } from '@/lib/utils'
import { getWeekData } from '@/lib/firebase'
import { Alice, Alike_Angular } from 'next/font/google'

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
      spacing: 'md',
      contents: [
        {
          type: 'box',
          layout: 'vertical',
          flex: 1,
          contents: [
            {
              type: 'image',
              url: talk.presenterAvatar || 'https://mini-lt.lumos-ynu.jp/images/miniLT.jpg',
              size: '30px',
              align: 'center',
            },
            {
              type: 'box',
              layout: 'vertical',
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: '5px',
              paddingBottom: '5px',
              paddingStart: '5px',
              paddingEnd: '5px',
              background: {
                type: 'linearGradient',
                angle: '135deg',
                startColor: '#6778df',
                endColor: '#7354ae',
              },
              contents: [
                {
                  type: 'text',
                  text: talk.presenterName,
                  size: '15px',
                  color: '#ffffff',
                  align: 'center',
                  wrap: true,
                }
              ],
            },
          ],
        },
        {
          type: 'text',
          text: `${talk.title}`,
          flex: 2,
          size: 'md',
          color: '#262626',
          weight: 'bold',
          wrap: true,
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
      header: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '20px',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            justifyContent: 'center',
            paddingAll: '18px',
            contents: [
              {
                type: 'text',
                text: 'Lumos Mini LT',
                weight: 'bold',
                size: 'xxl',
                color: '#ffffff',
                align: 'center',
                wrap: true,
              }
            ]
          }
       ],
       background: {
          type: 'linearGradient',
          angle: '135deg',
          startColor: '#6778df',
          endColor: '#7354ae',
        }
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: `${dateText}のminiLT予定`,
            weight: 'bold',
            size: 'lg',
            color: '#1f2937',
            offsetBottom: '10px',
            wrap: true,
          },
          ...talkBody,
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'link',
            color: '#ffffff',
            action: {
              type: 'uri',
              label: '発表内容を詳しくみる',
              uri: eventUrl,
            },
          },
        ],
        background: {
          type: 'linearGradient',
          angle: '135deg',
          startColor: '#f87515',
          endColor: '#eab108',
        }
      },
    },
  }
}
