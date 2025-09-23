import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api, clearToken } from '../lib/api'

type Summary = {
  current_streak_days: number
  total_meals_logged: number
  average_daily_calories?: number
  goal_adherence_percent?: number
}

type Props = {
  onLogout?: () => void
}

const DIETS = ['Omnivore','Vegetarian','Vegan','Keto','Paleo','Mediterranean']
const GOALS = ['Weight Loss','Weight Gain','Muscle Building','Maintenance','Athletic Performance']
const ACTIVITY = ['Sedentary','Lightly active','Moderately active','Very active','Extremely active']

export default function Onboarding({ onLogout }: Props = {}) {
  const [name, setName] = useState('')
  const [age, setAge] = useState<number | ''>('')
  const [gender, setGender] = useState('')
  const [diets, setDiets] = useState<string[]>([])
  const [goals, setGoals] = useState<string[]>([])
  const [heightCm, setHeightCm] = useState<number | ''>('')
  const [weightKg, setWeightKg] = useState<number | ''>('')
  const [activity, setActivity] = useState('Sedentary')
  const [saving, setSaving] = useState(false)
  const [summary, setSummary] = useState<Summary | null>(null)

  useEffect(() => {
    api<Summary>('/analytics/summary').then(setSummary)
  }, [])

  const handleLogout = () => {
    clearToken()
    onLogout?.()
  }

  async function save() {
    setSaving(true)
    const tdee = calcTDEE(Number(weightKg), Number(heightCm), Number(age), gender, activity)
    const daily = Math.round(tdee)
    await api('/users/me', {
      method: 'PUT',
      body: JSON.stringify({
        name,
        age: age ? Number(age) : undefined,
        gender,
        dietary_preferences: diets,
        fitness_goals: goals,
        height_cm: heightCm ? Number(heightCm) : undefined,
        weight_kg: weightKg ? Number(weightKg) : undefined,
        activity_level: activity,
        tdee: daily,
        daily_calorie_target: daily,
        macro_targets: { protein_percent: 30, carbs_percent: 40, fat_percent: 30 },
      }),
    })
    setSaving(false)
    location.href = '/timeline'
  }

  return (
    <div style={{ maxWidth: 560, margin: '1rem auto', padding: 16 }}>
      {/* Statistics Section */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            marginBottom: 24,
            padding: 16,
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 12,
            border: '1px solid var(--border-color)'
          }}
        >
          <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>Your Progress</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <strong style={{ color: 'var(--accent-color)' }}>Current streak</strong>
              <div style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{summary.current_streak_days} days</div>
            </div>
            <div>
              <strong style={{ color: 'var(--accent-color)' }}>Total meals</strong>
              <div style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{summary.total_meals_logged}</div>
            </div>
            <div>
              <strong style={{ color: 'var(--accent-color)' }}>Avg daily calories</strong>
              <div style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{summary.average_daily_calories ?? '-'}</div>
            </div>
            <div>
              <strong style={{ color: 'var(--accent-color)' }}>Goal adherence</strong>
              <div style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{summary.goal_adherence_percent ?? '-'}%</div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.h3 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>Onboarding</motion.h3>
      <input placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} style={{ display:'block', width:'100%', marginBottom:8, padding:10, backgroundColor:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:8, color:'var(--text-primary)' }} />
      <input placeholder="Age" type="number" value={age} onChange={e=>setAge(e.target.value ? Number(e.target.value) : '')} style={{ display:'block', width:'100%', marginBottom:8, padding:10, backgroundColor:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:8, color:'var(--text-primary)' }} />
      <select value={gender} onChange={e=>setGender(e.target.value)} style={{ display:'block', width:'100%', marginBottom:8, padding:10, backgroundColor:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:8, color:'var(--text-primary)' }}>
        <option value="">Gender</option>
        <option>Male</option>
        <option>Female</option>
        <option>Other</option>
        <option>Prefer not to say</option>
      </select>
      <div style={{ margin:'8px 0' }}>
        <div>Dietary Preferences</div>
        {DIETS.map(d => (
          <label key={d} style={{ display:'inline-block', marginRight:12 }}>
            <input type="checkbox" checked={diets.includes(d)} onChange={e=> setDiets(v => e.target.checked ? [...v, d] : v.filter(x=>x!==d)) } /> {d}
          </label>
        ))}
        <input placeholder="Custom restrictions" onChange={e=> e.target.value && setDiets(v => [...v, e.target.value])} style={{ display:'block', width:'100%', marginTop:8, padding:10, backgroundColor:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:8, color:'var(--text-primary)' }} />
      </div>
      <div style={{ margin:'8px 0' }}>
        <div>Fitness Goals</div>
        {GOALS.map(g => (
          <label key={g} style={{ display:'inline-block', marginRight:12 }}>
            <input type="checkbox" checked={goals.includes(g)} onChange={e=> setGoals(v => e.target.checked ? [...v, g] : v.filter(x=>x!==g)) } /> {g}
          </label>
        ))}
      </div>
      <input placeholder="Height (cm)" type="number" value={heightCm} onChange={e=>setHeightCm(e.target.value ? Number(e.target.value) : '')} style={{ display:'block', width:'100%', marginBottom:8, padding:10, backgroundColor:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:8, color:'var(--text-primary)' }} />
      <input placeholder="Weight (kg)" type="number" value={weightKg} onChange={e=>setWeightKg(e.target.value ? Number(e.target.value) : '')} style={{ display:'block', width:'100%', marginBottom:8, padding:10, backgroundColor:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:8, color:'var(--text-primary)' }} />
      <select value={activity} onChange={e=>setActivity(e.target.value)} style={{ display:'block', width:'100%', marginBottom:8, padding:10, backgroundColor:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:8, color:'var(--text-primary)' }}>
        {ACTIVITY.map(a => <option key={a}>{a}</option>)}
      </select>
      <motion.button whileTap={{ scale: 0.98 }} onClick={save} disabled={saving} style={{ width:'100%', padding:12 }}>
        {saving ? 'Saving...' : 'Continue'}
      </motion.button>

      {/* Logout Section */}
      {onLogout && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          style={{
            marginTop: 32,
            paddingTop: 16,
            borderTop: '1px solid var(--border-color)'
          }}
        >
          <button
            onClick={handleLogout}
            style={{ width: '100%', padding: 12 }}
            className="danger"
          >
            Logout
          </button>
        </motion.div>
      )}
    </div>
  )
}

function calcTDEE(weightKg: number, heightCm: number, age: number, gender: string, activity: string): number {
  // Mifflin-St Jeor
  const s = gender === 'Male' ? 5 : -161
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + s
  const factor: Record<string, number> = {
    'Sedentary': 1.2,
    'Lightly active': 1.375,
    'Moderately active': 1.55,
    'Very active': 1.725,
    'Extremely active': 1.9,
  }
  return bmr * (factor[activity] || 1.2)
}

