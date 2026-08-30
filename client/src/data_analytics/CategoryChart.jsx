import { BarChart, Bar, ResponsiveContainer, YAxis, XAxis, CartesianGrid, Tooltip, Legend } from "recharts"

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null

  const spent = payload.find(p => p.dataKey === 'spent')?.value
  const upcoming = payload.find(p => p.dataKey === 'upcoming')?.value

  return (
    <div className="p-4 bg-slate-900 flex flex-col gap-2 rounded-md">
      <p className="font-medium text-lg text-white capitalize">{label}</p>
      <p className="text-sm flex items-center gap-2 text-blue-400">
        <span className="w-2 h-2 bg-blue-400 inline-block" />
        Spent:
        <span className="ml-2 text-white">₱{spent}</span>
      </p>
      <p className="text-sm flex items-center gap-2 text-indigo-400">
        <span className="w-2 h-2 bg-indigo-400 inline-block" />
        Upcoming:
        <span className="ml-2 text-white">₱{upcoming}</span>
      </p>
    </div>
  )
}

export const CategoryChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center theme-text font-mono">
        No category data yet.
      </div>
    )
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <YAxis />
          <XAxis dataKey="name" />
          <CartesianGrid strokeDasharray="5 5" />
          <Bar dataKey="spent" fill="#2563eb" />
          <Bar dataKey="upcoming" fill="#8b5cf6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}