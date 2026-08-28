

import { AreaChart, Area, ResponsiveContainer } from "recharts"

const productsales = [
     {name: 'shen',
      product1: 3000,
      product2: 2000,
     },


     {name: 'hilom',
      product1: 4000,
      product2: 1000,
     },

     {name: 'ouch',
      product1: 500,
      product2: 9000,
     },
    ]

export const SalesChart = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
    <AreaChart width={500} height={400} data={productsales}>
        <Area dataKey="product1" 
          type="monotone"
          datakey="product"
          stroke="#2563eb"
          fill="#3b82f6"
        />
    </AreaChart>
    </ResponsiveContainer>
    
  )
}
