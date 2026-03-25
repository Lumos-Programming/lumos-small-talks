import { buildNextEventFlexMessage } from '../lib/line-flex'
import * as fs from 'fs'
import * as path from 'path'

if (require.main === module) {
  // サンプルデータ
  const weekId = '2026-W09'
  const weekData = {
    weekString: '2026-W09',
    eventStartTime: '21:00',
    talks: [
      {
        id: 'sample-id-1',
        title: 'サンプル発表1',
        description: 'これはサンプルの説明です。Markdownも使えます。',
        duration: 5,
        presenterUid: 'sample-uid-1',
        presenterName: 'サンプル発表者1',
        presenterAvatar: 'https://mini-lt.lumos-ynu.jp/images/icon_sample_01.jpg',
        order: 1,
        createdAt: Date.now()
      },
      {
        id: 'sample-id-2',
        title: 'サンプル発表2',
        description: 'もう一つのサンプル発表です。',
        duration: 3,
        presenterUid: 'sample-uid-2',
        presenterName: 'サンプル発表者2',
        presenterAvatar: 'https://mini-lt.lumos-ynu.jp/images/icon_sample_02.jpg',
        order: 2,
        createdAt: Date.now()
      }
    ],
    discordEventUrl: 'https://mini-lt.lumos-ynu.jp'
  }

  // LINE Flex Message を生成
  const message = buildNextEventFlexMessage(weekId, weekData)

  // JSON を整形してファイルに出力 (contents の bubble のみ)
  const json = JSON.stringify(message.contents, null, 2)
  const outputPath = path.join(__dirname, '..', 'line_flex_sample.txt')
  fs.writeFileSync(outputPath, json)

  console.log(`LINE Flex Message のサンプルJSONを ${outputPath} に出力しました。`)
}