import { useEffect, useState } from 'react'
import { api, clearToken } from '../lib/api'

type Summary = {
  current_streak_days: number
  total_meals_logged: number
  average_daily_calories?: number
  goal_adherence_percent?: number
}

type Props = {
  onLogout: () => void
}

export default function Profile({ onLogout }: Props) {
  const [summary, setSummary] = useState<Summary | null>(null)

  useEffect(() => {
    api<Summary>('/analytics/summary').then(setSummary)
  }, [])

  const handleLogout = () => {
    clearToken()
    onLogout()
  }

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
      <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={handleLogout}
          style={{ width: '100%', padding: 10 }}
          className="danger"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

