
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Wallet,
  Receipt,
  CalendarDays,
  BarChart3,
  TrendingUp,
  Check,
  Utensils,
  Car,
  ShoppingBag,
  House,
  Zap,
  Wifi,
} from "lucide-react";

const Logo = ({ size = "h-10 w-10" }) => (
  <img
    src="/suitcase.png"
    alt="Expensekontrol logo"
    className={`${size} shrink-0 object-contain`}
  />
);

const peso = (amount) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(amount);

const features = [
  {
    icon: Wallet,
    title: "Plan your finances",
    description:
      "Know how much you can spend after accounting for your income, bills, and savings goals.",
  },
  {
    icon: Receipt,
    title: "Track every transaction",
    description:
      "Keep your daily expenses organized by category so you can understand where your money goes.",
  },
  {
    icon: CalendarDays,
    title: "Stay ahead of bills",
    description:
      "Keep upcoming payments visible and make room for important expenses before they are due.",
  },
  {
    icon: BarChart3,
    title: "Understand your habits",
    description:
      "Review spending patterns and use clear summaries to make more informed financial decisions.",
  },
];

const transactions = [
  { icon: Utensils, name: "Food & dining", date: "Today", amount: -280 },
  { icon: Car, name: "Transportation", date: "Yesterday", amount: -150 },
  { icon: ShoppingBag, name: "Shopping", date: "Yesterday", amount: -890 },
];

const categories = [
  { name: "Food & dining", amount: 5200, percent: 72, icon: Utensils },
  { name: "Transportation", amount: 2400, percent: 42, icon: Car },
  { name: "Shopping", amount: 3600, percent: 58, icon: ShoppingBag },
];

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -inset-4 rounded-[2rem] bg-orange-500/10 blur-3xl" />

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#171717] p-4 shadow-2xl sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="h-9 w-9" />
            <div>
              <p className="font-semibold text-white">Overview</p>
              <p className="text-xs text-gray-500">Your financial snapshot</p>
            </div>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-400">
            This month
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-orange-500 p-4 text-black">
            <p className="text-xs font-medium text-black/70">Monthly income</p>
            <p className="mt-2 text-xl font-bold">{peso(35000)}</p>
            <div className="mt-3 flex items-center gap-1 text-xs">
              <TrendingUp size={14} />
              <span>Planned income</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#202020] p-4">
            <p className="text-xs text-gray-400">Expenses</p>
            <p className="mt-2 text-xl font-bold text-white">{peso(14250)}</p>
            <p className="mt-3 text-xs text-gray-500">Monthly spending</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#202020] p-4">
            <p className="text-xs text-gray-400">Remaining</p>
            <p className="mt-2 text-xl font-bold text-emerald-400">
              {peso(20750)}
            </p>
            <p className="mt-3 text-xs text-gray-500">Income minus expenses</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#202020] p-4">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Spending plan</p>
              <BarChart3 size={17} className="text-orange-400" />
            </div>

            <div className="flex h-28 items-end gap-3">
              {[42, 68, 48, 84, 58, 74, 52].map((height, index) => (
                <div
                  key={index}
                  className="flex flex-1 flex-col justify-end"
                >
                  <div
                    className={`rounded-t-md ${
                      index === 3 ? "bg-orange-400" : "bg-orange-400/30"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-between text-[10px] text-gray-500">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#202020] p-4">
            <p className="mb-4 text-sm font-semibold text-white">
              Spending categories
            </p>

            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.name}>
                  <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                    <span className="text-gray-300">{category.name}</span>
                    <span className="text-gray-400">
                      {peso(category.amount)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-orange-400"
                      style={{ width: `${category.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-[#202020] p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-white">
              Recent transactions
            </p>
            <span className="text-xs text-orange-400">Example activity</span>
          </div>

          <div className="space-y-4">
            {transactions.map((transaction) => {
              const Icon = transaction.icon;

              return (
                <div
                  key={transaction.name}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white/5 p-2">
                      <Icon size={16} className="text-gray-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white">{transaction.name}</p>
                      <p className="text-xs text-gray-500">
                        {transaction.date}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-white">
                    −{peso(Math.abs(transaction.amount))}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-3 text-center text-[10px] text-gray-600">
          Illustrative preview · Not connected to your account data
        </p>
      </div>
    </div>
  );
}

export const Home = () => {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0c0c0c] text-white">
      {/* Navigation */}
      <header className="border-b border-white/[0.08]">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <Logo />
            <span className="text-lg font-bold tracking-tight">
              Expensekontrol
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-gray-400 md:flex">
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#how-it-works" className="transition hover:text-white">
              How it works
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden px-3 py-2 text-sm text-gray-300 transition hover:text-white sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-orange-400"
            >
              Get started <ArrowRight size={16} />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:py-28">
        <div className="absolute left-0 top-20 -z-0 h-64 w-64 rounded-full bg-orange-500/10 blur-[100px]" />

        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/[0.08] px-3 py-1.5 text-xs font-medium text-orange-300">
            <span className="h-2 w-2 rounded-full bg-orange-400" />
            Take control of your finances
          </div>

          <h1 className="max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Your money.
            <br />
            Your plan.
            <br />
            <span className="text-orange-400">Your control.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-gray-400 sm:text-lg">
            Make every peso count. Organize your expenses, plan upcoming bills,
            and understand your spending with one simple financial dashboard.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-semibold text-black transition hover:bg-orange-400"
            >
              Start managing your money <ArrowRight size={18} />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3.5 font-medium text-white transition hover:bg-white/5"
            >
              Explore features
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-gray-400">
            {["Track spending", "Plan payments", "See your progress"].map(
              (item) => (
                <span key={item} className="flex items-center gap-2">
                  <Check size={15} className="text-orange-400" />
                  {item}
                </span>
              )
            )}
          </div>
        </div>

        <div className="relative z-10">
          <DashboardPreview />
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="scroll-mt-20 border-y border-white/[0.06] bg-[#111111] px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
              Everything in one place
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Better money habits start here.
            </h2>
            <p className="mt-4 leading-7 text-gray-400">
              Get a clearer picture of your finances and make everyday money
              decisions with more confidence.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-white/[0.08] bg-[#171717] p-6 transition hover:-translate-y-1 hover:border-orange-400/30"
                >
                  <div className="mb-5 inline-flex rounded-xl bg-orange-500/10 p-3 text-orange-400">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
              Simple by design
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              A clearer view of your money, in three steps.
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-gray-400">
              Build a routine that helps you stay aware of what comes in, what
              goes out, and what you have left.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                number: "01",
                title: "Record your income",
                description:
                  "Start with the money you earn and the budget you want to follow.",
              },
              {
                number: "02",
                title: "Organize your expenses",
                description:
                  "Track spending and keep upcoming payments in view.",
              },
              {
                number: "03",
                title: "Review and adjust",
                description:
                  "Use your summaries to spot habits and make a plan for next month.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="flex gap-4 rounded-2xl border border-white/[0.08] bg-[#141414] p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-sm font-bold text-orange-400">
                  {step.number}
                </div>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="px-5 pb-20 sm:px-8 sm:pb-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-orange-400/20 bg-[#17130f] px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="absolute left-1/2 top-0 h-40 w-96 -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
              <Logo size="h-11 w-11" />
            </div>

            <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              Your financial future starts with one step.
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-400">
              Start organizing your money today and build a financial routine
              that works for you.
            </p>

            <Link
              to="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-semibold text-black transition hover:bg-orange-400"
            >
              Create your account <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] px-5 py-7 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="h-7 w-7" />
            <span className="font-semibold">
              Expense<span className="text-orange-400">kontrol</span>
            </span>
          </Link>

          <p className="text-center text-xs text-gray-500">
            Spend mindfully. Plan confidently. Take control.
          </p>

          <div className="flex gap-5 text-sm text-gray-400">
            <Link to="/login" className="transition hover:text-white">
              Log in
            </Link>
            <Link to="/signup" className="transition hover:text-white">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
};
