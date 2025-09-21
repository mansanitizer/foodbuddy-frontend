import { useEffect, useState } from 'react'
import { api } from '../lib/api'

type Summary = {
  current_streak_days: number
  total_meals_logged: number
  average_daily_calories?: number
  goal_adherence_percent?: number
}

export default function Profile() {
  const [summary, setSummary] = useState<Summary | null>(null)

  useEffect(() => {
    api<Summary>('/analytics/summary').then(setSummary)
  }, [])

  return (
    <div style={{ maxWidth: 560, margin: '1rem auto', padding: 16 }}>
      <h3>Profile</h3>
      {summary && (
        <div>
          <div><strong>Current streak</strong>: {summary.current_streak_days} days</div>
          <div><strong>Total meals</strong>: {summary.total_meals_logged}</div>
          <div><strong>Avg daily calories</strong>: {summary.average_daily_calories ?? '-'}</div>
          <div><strong>Goal adherence</strong>: {summary.goal_adherence_percent ?? '-'}%</div>
        </div>
      )}
    </div>
  )
}

