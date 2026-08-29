import { BarChart, Bar, ResponsiveContainer, YAxis, XAxis, CartesianGrid, Tooltip, Legend } from "recharts"

const productsales = [
  { name: 'shen', product1: 3000, product2: 2000 },
  { name: 'hilom', product1: 4000, product2: 1000 },
  { name: 'ouch', product1: 500, product2: 9000 },
]

// 1. Define the tooltip component FIRST, outside/above SalesChart
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white p-2 border rounded">
      <p className="font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.dataKey}: {entry.value}
        </p>
      ))}
    </div>
  )
}

// 2. Use it inside SalesChart via the `content` prop
export const BarChart = () => {
  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={productsales}>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <YAxis />
          <XAxis dataKey="name" />
          <CartesianGrid strokeDasharray="5 5" />
          <Area
            dataKey="product1"
            type="monotone"
            stroke="#2563eb"
            fill="#3b82f6"
            stackId="1"
          />
          <Area
            type="monotone"
            dataKey="product2"
            stroke="#7c3aed"
            fill="#8b5cf6"
            stackId="1"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}