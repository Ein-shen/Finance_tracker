import React from 'react'

export const SummaryCards = ({ data }) => {
  if (!data) return null

  return <div>Total Spent: ${data.totalSpent ?? 0}</div>
}