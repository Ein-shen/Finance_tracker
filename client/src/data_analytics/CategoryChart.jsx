import React from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'

export const CategoryChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="theme-text font-mono">No category data yet.</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="category" />
        <YAxis />
        <Bar dataKey="total" fill="#2f6fed" />
      </BarChart>
    </ResponsiveContainer>
  )
}