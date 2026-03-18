import { formatWeekDate } from '@/lib/utils'
import { getWeekData } from '@/lib/firebase'
import { Alice, Alike_Angular, Margarine } from 'next/font/google'
import { off } from 'process'
import { a } from 'vitest/dist/chunks/suite.d.FvehnV49.js'

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
  const timeText = weekData.eventStartTime || '21:00'

  const talks = weekData.talks
    .sort((a, b) => a.order - b.order)
    .map((talk, i) => ({
      type: 'box',
      layout: 'horizontal',
      spacing: 'md',
      margin: 'xl',
      justifyContent: 'center',
      alignItems: 'center',
      contents: [
        {
          type: 'box',
          layout: 'vertical',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          spacing: 'sm',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              width: '35px',
              height: '35px',
              cornerRadius: 'xxl',
              contents: [
                  {
                    type: 'image',
                    url: talk.presenterAvatar || 'https://mini-lt.lumos-ynu.jp/images/miniLT.jpg',
                    size: 'full',
                    aspectMode: 'cover',
                    aspectRatio: '1:1',
                    gravity: 'center',
                  }
              ],
            },
            {
              type: 'box',
              layout: 'vertical',
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: '5px',
              paddingBottom: '5px',
              paddingStart: '15px',
              paddingEnd: '15px',
              cornerRadius: 'xl',
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
                  size: '13px',
                  color: '#ffffff',
                  align: 'center',
                  weight: 'bold',
                  wrap: true,
                }
              ],
            },
          ],
        },
        {
          type: 'text',
          text: `${i + 1}. ${talk.title}`,
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
    altText: `Lumos Mini LT ${dateText} ${timeText} 更新情報`,
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
            text: `${dateText} ${timeText}~`,
            weight: 'bold',
            size: 'lg',
            color: '#1f2937',
            align: 'center',
            wrap: true,
          },
          {
            type: 'text',
            text: '@ Discord mini-lt ボイスチャンネル',
            size: 'xs',
            color: '#535353',
            align: 'center',
            wrap: true,
          },
          ...talkBody,
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        paddingTop: '0px',
        paddingBottom: '20px',
        paddingStart: '20px',
        paddingEnd: '20px',
        spacing: 'xs',
        contents: [
          {
            type: 'text',
            text: '発表登録・参加登録お待ちしています！',
            size: 'xs',
            color: '#535353',
            align: 'center',
            wrap: true,
          },
          {
            type: 'text',
            text: 'はじめての人や聞き専も大歓迎！！',
            size: 'xs',
            color: '#535353',
            align: 'center',
            wrap: true,
          },
          {
            type: 'box',
            layout: 'vertical',
            justifyContent: 'center',
            cornerRadius: 'md',
            margin: 'sm',
            background: {
            type: 'linearGradient',
            angle: '135deg',
            startColor: '#f87515',
            endColor: '#eab108',
          },
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
            ]
          },
        ],
      },
    },
  }
}
