import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../lib/api'
import { NotificationSettings } from '../components/NotificationSettings'

type Summary = {
  current_streak_days: number
  total_meals_logged: number
  average_daily_calories?: number
  goal_adherence_percent?: number
}

const DIETS = ['Omnivore','Vegetarian','Vegan','Keto','Paleo','Mediterranean']
const GOALS = ['Weight Loss','Weight Gain','Muscle Building','Maintenance','Athletic Performance']
const ACTIVITY = ['Sedentary','Lightly active','Moderately active','Very active','Extremely active']

export default function Onboarding() {
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
  const [hasExistingProfile, setHasExistingProfile] = useState(false)
  const [editing, setEditing] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    api<Summary>('/analytics/summary').then(setSummary).catch(() => {})
  }, [])

  useEffect(() => {
    // Prefill from /users/me and lock fields if data exists
    ;(async () => {
      try {
        const u = await api<any>('/users/me')
        const dietary = Array.isArray(u?.dietary_preferences) ? u.dietary_preferences as string[] : []
        const goalList = Array.isArray(u?.fitness_goals) ? u.fitness_goals as string[] : []
        
        // Prefill all fields from API response
        if (u?.name) setName(u.name)
        if (typeof u?.age === 'number') setAge(u.age)
        if (u?.gender) setGender(u.gender)
        if (typeof u?.height_cm === 'number') setHeightCm(u.height_cm)
        if (typeof u?.weight_kg === 'number') setWeightKg(u.weight_kg)
        if (u?.activity_level) setActivity(u.activity_level)
        if (dietary.length) setDiets(dietary)
        if (goalList.length) setGoals(goalList)

        // Check if any profile data exists (excluding macro_targets)
        const exists = Boolean(
          (u?.name && u.name.trim() !== '') ||
          typeof u?.age === 'number' ||
          typeof u?.height_cm === 'number' ||
          typeof u?.weight_kg === 'number' ||
          (Array.isArray(u?.dietary_preferences) && u.dietary_preferences.length > 0) ||
          (Array.isArray(u?.fitness_goals) && u.fitness_goals.length > 0) ||
          u?.gender ||
          u?.activity_level
        )
        setHasExistingProfile(exists)
        setEditing(!exists) // first-time users can edit immediately
      } catch {
        // If /users/me fails, allow editing as onboarding
        setHasExistingProfile(false)
        setEditing(true)
      } finally {
        setLoadingUser(false)
      }
    })()
  }, [])

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

  const fieldsDisabled = hasExistingProfile && !editing

  return (
    <div style={{ maxWidth: 560, margin: '1rem auto', padding: 16, paddingBottom: 120 }}>
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
      <input placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} disabled={fieldsDisabled} style={{ display:'block', width:'100%', marginBottom:8, padding:10, backgroundColor:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:8, color:'var(--text-primary)' }} />
      <input placeholder="Age" type="number" value={age} onChange={e=>setAge(e.target.value ? Number(e.target.value) : '')} disabled={fieldsDisabled} style={{ display:'block', width:'100%', marginBottom:8, padding:10, backgroundColor:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:8, color:'var(--text-primary)' }} />
      <select value={gender} onChange={e=>setGender(e.target.value)} disabled={fieldsDisabled} style={{ display:'block', width:'100%', marginBottom:8, padding:10, backgroundColor:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:8, color:'var(--text-primary)' }}>
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
            <input type="checkbox" checked={diets.includes(d)} disabled={fieldsDisabled} onChange={e=> setDiets(v => e.target.checked ? [...v, d] : v.filter(x=>x!==d)) } /> {d}
          </label>
        ))}
        <input placeholder="Custom restrictions" disabled={fieldsDisabled} onChange={e=> e.target.value && setDiets(v => [...v, e.target.value])} style={{ display:'block', width:'100%', marginTop:8, padding:10, backgroundColor:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:8, color:'var(--text-primary)' }} />
      </div>
      <div style={{ margin:'8px 0' }}>
        <div>Fitness Goals</div>
        {GOALS.map(g => (
          <label key={g} style={{ display:'inline-block', marginRight:12 }}>
            <input type="checkbox" checked={goals.includes(g)} disabled={fieldsDisabled} onChange={e=> setGoals(v => e.target.checked ? [...v, g] : v.filter(x=>x!==g)) } /> {g}
          </label>
        ))}
      </div>
      <input placeholder="Height (cm)" type="number" value={heightCm} onChange={e=>setHeightCm(e.target.value ? Number(e.target.value) : '')} disabled={fieldsDisabled} style={{ display:'block', width:'100%', marginBottom:8, padding:10, backgroundColor:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:8, color:'var(--text-primary)' }} />
      <input placeholder="Weight (kg)" type="number" value={weightKg} onChange={e=>setWeightKg(e.target.value ? Number(e.target.value) : '')} disabled={fieldsDisabled} style={{ display:'block', width:'100%', marginBottom:8, padding:10, backgroundColor:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:8, color:'var(--text-primary)' }} />
      <select value={activity} onChange={e=>setActivity(e.target.value)} disabled={fieldsDisabled} style={{ display:'block', width:'100%', marginBottom:8, padding:10, backgroundColor:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:8, color:'var(--text-primary)' }}>
        {ACTIVITY.map(a => <option key={a}>{a}</option>)}
      </select>

      {/* Notification Settings */}
      <NotificationSettings />

      {hasExistingProfile && !editing && (
        <motion.button whileTap={{ scale: 0.98 }} onClick={() => {
          if (confirm('Editing may impact your suggestions. Proceed?')) {
            setEditing(true)
          }
        }} disabled={loadingUser} style={{ width:'100%', padding:12 }}>
          Edit details
        </motion.button>
      )}

      {(!hasExistingProfile || editing) && (
        <motion.button whileTap={{ scale: 0.98 }} onClick={save} disabled={saving || loadingUser} style={{ width:'100%', padding:12 }}>
          {saving ? 'Saving...' : hasExistingProfile ? 'Save' : 'Continue'}
        </motion.button>
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

