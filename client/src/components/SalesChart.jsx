import { AreaChart, Area, ResponsiveContainer } from "recharts"

const productsales = [
  { name: 'shen', product1: 3000, product2: 2000 },
  { name: 'hilom', product1: 4000, product2: 1000 },
  { name: 'ouch', product1: 500, product2: 9000 },
]

export const SalesChart = () => {
  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={productsales}>
          <Area
            dataKey="product1"
            type="monotone"
            stroke="#2563eb"
            fill="#3b82f6"
          />

          <Area
            type="monotone" 
            dataKey="product2"
            stroke="#7c3aed"
            fill="#8b5cf6"
            stackId='1'
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}