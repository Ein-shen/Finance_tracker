import { BarChart, Bar, ResponsiveContainer, YAxis, XAxis, CartesianGrid, Tooltip, Legend } from "recharts"

const productsales = [
  { name: 'shen', product1: 3000, product2: 2000 },
  { name: 'hilom', product1: 4000, product2: 1000 },
  { name: 'ouch', product1: 500, product2: 9000 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null

  const revenue = payload.find(p => p.dataKey === 'product1')?.value
  const profit = payload.find(p => p.dataKey === 'product2')?.value

  return (
    <div className="p-4 bg-slate-900 flex flex-col gap-2 rounded-md">
      <p className="font-medium text-lg text-white">{label}</p>
      <p className="text-sm flex items-center gap-2 text-blue-400">
        <span className="w-2 h-2 bg-blue-400 inline-block" />
        Revenue:
        <span className="ml-2 text-white">${revenue}</span>
      </p>
      <p className="text-sm flex items-center gap-2 text-indigo-400">
        <span className="w-2 h-2 bg-indigo-400 inline-block" />
        Profit:
        <span className="ml-2 text-white">${profit}</span>
      </p>
    </div>
  )
}

export const LineChartComponent = () => {
  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChartComponent 
        
        width={500}
        height={300}
        data={productsales}
        margin={{
            right:300
        }}>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <YAxis />
          <XAxis dataKey="name" />
          <CartesianGrid strokeDasharray="5 5" />
          <Bar type="monotone" dataKey="revenue" fill="#2563eb" />
          <Bar type="monotone" dataKey="profit" fill="#8b5cf6" />
        </LineChartComponent>
      </ResponsiveContainer>
    </div>
  )
}