import React from 'react'
import { Link } from 'react-router-dom'
export const Home = () => {

  
  return (
    <main className="min-h-screen w-full  text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10  backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <a href="#" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl ">
              <img
                src="/suitcase.png"
                alt="Expensekontrol"
                className="h-10 w-10 object-contain"
              />
            </div>

            <span className="text-lg font-bold tracking-tight">
              Expensekontrol
            </span>
          </a>

          

           <Link
            to="/login"
            className="rounded-xl bg-white/5 px-4 py-2.5 text-sm font-bold  transition hover:bg-white/10"
          >
            Login
          </Link>
            
          
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gray-300/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-8 lg:py-32">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-gray-400/20 bg-gray-300/10 px-4 py-2 text-xs font-mono uppercase tracking-[0.18em] text-blue-300">
              Personal Finance Platform
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              Take control of
              <span className="block text-blue-400">
                your spending.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg  font-mono leading-8 ">
              Expensekontrol helps you organize your expenses, understand your
              spending, and build better financial habits through a clean,
              modern web experience.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">


              <Link
                to="/signup"
               className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-bold text-white transition hover:bg-white/10"
              >
                Signup
              
              </Link>

              
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-white/30 p-4 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="overflow-hidden rounded-2xl border border-white/10 theme-card">
               

                {/* Chart */}
                <div className="m-5 h-48 rounded-2xl border border-white/10 bg-gradient-to-b from-blue-500/[0.07] to-transparent p-4">
                  <div className="flex h-full items-end gap-2">
                    {[35, 55, 42, 70, 48, 78, 62, 90, 74, 95, 68, 86].map(
                      (height, index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-t-md bg-blue-300/70 transition hover:bg-blue-400"
                          style={{ height: `${height}%` }}
                        />
                      )
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 p-5 pt-0">

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-slate-500"> Total Transactions</p>
                    <p className="mt-1 font-bold">₱5,000</p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-slate-500">Total Schedule</p>
                    <p className="mt-1 font-bold">₱3,000</p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-slate-500">Total Expenses</p>
                    <p className="mt-1 font-bold">₱8,000</p>
                  </div>

                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-400">
              Why Expensekontrol
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Built for financial clarity.
            </h2>

            <p className="mt-5 text-lg leading-8 text-gray/10">
              Keep your spending organized and get a clearer picture of where
              your money goes.
            </p>
          </div>

          <div className="mt-14 font-mono grid gap-5 md:grid-cols-3">
            <FeatureCard
              number="01"
              title="Track spending"
              description="Keep your expenses organized in one place instead of relying on scattered notes or spreadsheets."
            />

            <FeatureCard
              number="02"
              title="Understand your money"
              description="Turn individual transactions into a clearer overview of your spending and financial activity."
            />

            <FeatureCard
              number="03"
              title="Access anywhere"
              description="Use a modern web application designed to make managing your finances simple and accessible."
            />
          </div>
        </div>
      </section>

      

      {/* CTA */}
      <section id="about" className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center lg:px-8">
          <div className="rounded-3xl border border-gray-400/20 bg-gray-300/[0.06] p-10 sm:p-14">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-400">
              Try it yourself
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              See Expensekontrol in action.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
              Explore the live application and see how the project works in a
              real production environment.
            </p>

           
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className=" flex items-center justify-center mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row lg:px-8">
          <p>© 2026 Expensekontrol</p>


        </div>
      </footer>
    </main>
  )
}

const FeatureCard = ({ number, title, description }) => {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.05]">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-gray-300/10 text-sm font-black text-blue-400">
        {number}
      </div>

      <h3 className="mt-6 text-xl font-bold">{title}</h3>

      <p className="mt-3 leading-7 text-slate-400">
        {description}
      </p>
    </div>
  )
}

const TechBox = ({ title, value }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-widest text-slate-500">
        {title}
      </p>

      <p className="mt-2 font-bold text-white">{value}</p>
    </div>
  )
}