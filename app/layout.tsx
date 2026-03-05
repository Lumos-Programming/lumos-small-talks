import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { VersionInfo } from '@/components/version-info'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Mini LT プロジェクト - Lumos',
  description: 'Lumosが運営する毎週月曜日のLT発表プログラム',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground h-full flex flex-col`}
      >
        <div className="flex-1">{children}</div>
        <footer className="w-full mt-auto">
          <VersionInfo />
        </footer>
      </body>
    </html>
  )
}
