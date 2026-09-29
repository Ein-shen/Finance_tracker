export const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 theme-card">
      <div className="flex h-full items-center px-4 sm:px-8">
        <button className="flex flex-row items-center gap-2 py-6">
          <img src="/suitcase.png" alt="Suitcase" className="w-10 h-12" />
          <h1 className="font-mono text-lg">Expense Tracker</h1>
        </button>
      </div>
    </header>
  )
}