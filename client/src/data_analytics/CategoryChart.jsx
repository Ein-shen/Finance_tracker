import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts'

export const CategoryChart = ({ spending, upcoming }) => {
  return (
    <div className="flex flex-col gap-8 mt-6">

      <div>
        <h2 className="theme-text font-mono text-lg mb-2">
          Spending by Category
        </h2>

        {!spending || spending.length === 0 ? (
          <p className="theme-text font-mono">
            No spending data yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={spending}>
              <XAxis dataKey="category" />
              <YAxis />
              <Bar
                dataKey="total"
                fill="#2f6fed"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div>
        <h2 className="theme-text font-mono text-lg mb-2">
          Upcoming Bills by Category
        </h2>

        {!upcoming || upcoming.length === 0 ? (
          <p className="theme-text font-mono">
            No upcoming bills.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={upcoming}>
              <XAxis dataKey="category" />
              <YAxis />
              <Bar
                dataKey="total"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  )
}