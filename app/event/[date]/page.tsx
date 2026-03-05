import { getWeekData } from '@/lib/firebase'
import { getWeekId, getNextEventDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ date: string }>
}

export default async function EventRedirectPage({ params }: PageProps) {
  const { date } = await params

  // Parse date string (format: YYYY-MM-DD)
  let targetDate: Date
  try {
    targetDate = new Date(date)
    // Check if date is valid
    if (isNaN(targetDate.getTime())) {
      // Invalid date: use today
      targetDate = new Date()
    }
  } catch {
    // Parse error: use today
    targetDate = new Date()
  }

  // Find the next event date from the target date
  const eventDate = getNextEventDate(targetDate)

  // Get week ID from the calculated event date
  const weekId = getWeekId(eventDate)

  // Fetch week data to get Discord event URL
  const weekData = await getWeekData(weekId)

  // If no Discord event exists, redirect to home page for that week
  const redirectUrl = weekData.discordEventUrl || `/?week=${weekId}`

  return (
    <html>
      <head>
        <title>Redirecting to Discord Event...</title>
        <meta httpEquiv="refresh" content={`0;url=${redirectUrl}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.location.href = "${redirectUrl}";`,
          }}
        />
      </head>
      <body>
        <div style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '50px' }}>
          <h1>Redirecting...</h1>
          <p>
            Discord イベントにリダイレクトしています...
            <br />
            自動的にリダイレクトされない場合は
            <a href={redirectUrl} style={{ color: '#5865F2', textDecoration: 'underline' }}>
              こちらをクリック
            </a>
            してください。
          </p>
        </div>
      </body>
    </html>
  )
}
