import React from 'react'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts'

export const CategoryChart = ({ data }) => {
  // No data
  if (!data || data.length === 0) {
    return (
      <div className="theme-text font-mono">
        No category data yet.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>

        <XAxis dataKey="category" />

        <YAxis />

        <Bar dataKey="total">
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={index % 2 === 0 ? '#2f6fed' : '#8b5cf6'}
            />
          ))}
        </Bar>

      </BarChart>
    </ResponsiveContainer>
  )
}