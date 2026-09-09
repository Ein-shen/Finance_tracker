const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const API_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl