import React from 'react'

export const SummaryCards = ({ data }) => {
  if (!data) return null

  return (
    <div className="theme-text font-mono">
      <p>Total Spent: ₱{data.totalSpent}</p>
    </div>
  )
}