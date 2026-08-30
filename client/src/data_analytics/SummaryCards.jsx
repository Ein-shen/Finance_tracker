import React from 'react'

export const SummaryCards = ({ cards }) => {
  if (!cards || cards.length === 0) return null

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="theme-card theme-border border-2 rounded-md p-4 flex-1"
        >
          <p className="theme-text font-mono text-sm opacity-70">{c.label}</p>
          <p className="theme-text font-mono text-2xl font-bold">{c.value}</p>
        </div>
      ))}
    </div>
  )
}