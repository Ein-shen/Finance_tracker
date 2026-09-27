import React, { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts'

const CACHE_KEY = 'categoryChartData'

export const CategoryChart = ({ data }) => {
  // Fall back to whatever was cached last time, so the chart doesn't
  // flash empty if the parent hasn't passed fresh data down yet.
  const [cachedData] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })

  // Whenever real data arrives from the parent, save it for next time
  useEffect(() => {
    if (data && data.length > 0) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data))
      } catch (error) {
        console.error('Failed to save category chart cache:', error)
      }
    }
  }, [data])

  const displayData = data && data.length > 0 ? data : cachedData

  // No data
  if (!displayData || displayData.length === 0) {
    return (
      <div className="theme-text font-mono">
        No category data yet.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={displayData}>

        <XAxis dataKey="category" />

        <YAxis />

        <Bar dataKey="total">
          {displayData.map((entry, index) => (
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