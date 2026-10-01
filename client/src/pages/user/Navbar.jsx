import { ChevronDown } from 'lucide-react'

export const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 theme-card">
      <div className="flex h-full items-center px-4 sm:px-8">
        <button className="flex flex-row items-center gap-2 py-6">
          <img src="/suitcase.png" alt="Suitcase" className="w-10 h-12" />
          <h1 className="font-mono text-md sm:text-lg md:text-lg">Expense Tracker</h1>
        </button>

        <div className="ml-auto flex items-center gap-1">
          <div className="rounded-full border border-white bg-blue-500 px-4 py-4 text-xs"></div>

          <button type="button" className="rounded-lg p-1 opacity-60 transition hover:opacity-100">
            <ChevronDown size={18} />
          </button>
        </div>
       
      </div>
    </header>
  )
}