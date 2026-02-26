import { getWeekData } from '@/lib/firebase'
import { getWeekId } from '@/lib/utils'
import { LTCard } from '@/components/LTCard'
import { WeekNavigator } from '@/components/WeekNavigator'
import { Badge } from '@/components/ui'
import Link from 'next/link'

export default async function HomePage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const params = await searchParams
  const weekId = params.week || getWeekId()
  const data = await getWeekData(weekId)

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-2">今週のLTプログラム</h1>
        <p className="text-muted-foreground">毎週月曜日 21:00 開始</p>
        <div className="mt-4 flex items-center justify-center space-x-2">
          <span className="text-2xl font-mono bg-secondary px-3 py-1 rounded">{weekId}</span>
          <Badge className="bg-blue-600">開始 21:00</Badge>
        </div>
      </header>

      <WeekNavigator currentWeek={weekId} baseUrl="/" />

      {data.talks.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <p className="text-xl text-muted-foreground mb-4">まだ発表がありません。</p>
          <Link href="/submit" className="text-blue-500 hover:underline">
            /submit から最初の発表を登録しましょう！
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.talks.sort((a, b) => a.order - b.order).map((talk) => (
            <LTCard key={talk.id} talk={talk} />
          ))}
        </div>
      )}

      <footer className="mt-20 text-center border-t pt-8">
        <Link href="/submit">
          <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
            発表登録・管理（Discordログイン）
          </Badge>
        </Link>
      </footer>
    </main>
  )
}
