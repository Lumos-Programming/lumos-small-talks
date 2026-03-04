import Link from 'next/link'

export function Header() {
  return (
    <header className="bg-gradient-primary animate-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
      <div className="container mx-auto px-4 py-6 max-w-5xl relative">
        <Link href="/">
          <div className="text-center text-white cursor-pointer hover:opacity-90 transition-opacity">
            {/* Lumos Logo Area */}
            <div className="flex items-center justify-center mb-3">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center">
                    {/* Placeholder for Lumos Logo - replace with actual logo */}
                    <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">L</span>
                  </div>
                  <span className="text-base font-bold">Lumos</span>
                </div>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold mb-1 tracking-tight">
              Mini LT プロジェクト
            </h1>
            {/*<p className="text-sm text-white/90">*/}
            {/*  ☕️ 気軽に雑談ベースで共有する場*/}
            {/*</p>*/}
          </div>
        </Link>
      </div>
    </header>
  )
}
