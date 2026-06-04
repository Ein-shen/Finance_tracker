import React, { useState, useEffect } from 'react'

const CACHE_KEY = 'summaryCardsData'

export const SummaryCards = ({ cards }) => {
  // Fall back to whatever was cached last time, so the cards don't
  // disappear if the parent hasn't passed fresh data down yet.
  const [cachedCards] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })

  // Whenever real cards arrive from the parent, save them for next time
  useEffect(() => {
    if (cards && cards.length > 0) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cards))
      } catch (error) {
        console.error('Failed to save summary cards cache:', error)
      }
    }
  }, [cards])

  const displayCards = cards && cards.length > 0 ? cards : cachedCards

  if (!displayCards || displayCards.length === 0) return null

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {displayCards.map((c) => (
        <div
          key={c.label}
          className="text-center   theme-card rounded-md p-4 flex-1"
        >
          <p className="text-center theme-text font-mono text-sm opacity-70">{c.label}</p>
          <p className="text-center    font-mono text-2xl text-red-500 font-bold">-{c.value}</p>
        </div>
      ))}
    </div>
  )
}