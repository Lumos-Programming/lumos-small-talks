import { auth, signIn, signOut } from '@/lib/auth'
import { getWeekData, addTalk, updateTalk, deleteTalk } from '@/lib/firebase'
import { getWeekId } from '@/lib/utils'
import { WeekNavigator } from '@/components/WeekNavigator'
import { ManageTalks } from '@/components/ManageTalks'
import { Button, Badge } from '@/components/ui'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export default async function SubmitPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const session = await auth()
  const params = await searchParams
  const weekId = params.week || getWeekId()

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h1 className="text-2xl font-bold">発表登録にはログインが必要です</h1>
        <form action={async () => { "use server"; await signIn("discord") }}>
          <Button size="lg">Discordでログイン</Button>
        </form>
      </div>
    )
  }

  const data = await getWeekData(weekId)
  const myTalks = data.talks.filter(t => t.presenterUid === session.user?.id)

  const handleAction = async (formData: any) => {
    "use server"
    const userId = session.user?.id as string
    const userName = session.user?.name as string
    const userAvatar = session.user?.image as string

    if (formData.id) {
      await updateTalk(weekId, formData.id, {
        title: formData.title,
        description: formData.description,
      }, userId)
    } else {
      await addTalk(weekId, {
        title: formData.title,
        description: formData.description,
        presenterName: userName,
        presenterAvatar: userAvatar,
      }, userId)
    }
    revalidatePath('/submit')
    revalidatePath('/')
  }

  const handleDelete = async (talkId: string) => {
    "use server"
    const userId = session.user?.id as string
    await deleteTalk(weekId, talkId, userId)
    revalidatePath('/submit')
    revalidatePath('/')
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">発表の管理</h1>
        <div className="flex items-center space-x-4">
          <Badge>{session.user?.name}</Badge>
          <form action={async () => { "use server"; await signOut() }}>
            <Button variant="ghost" size="sm">ログアウト</Button>
          </form>
        </div>
      </div>

      <WeekNavigator currentWeek={weekId} baseUrl="/submit" />

      <ManageTalks 
        weekId={weekId} 
        myTalks={JSON.parse(JSON.stringify(myTalks))} 
        onAction={handleAction} 
        onDelete={handleDelete} 
      />
      
      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          ← 公開ページへ戻る
        </Link>
      </div>
    </main>
  )
}
