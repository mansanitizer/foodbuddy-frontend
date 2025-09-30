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

// Canonicalization helpers for diet tags
const CANONICAL_MAP: Record<string, string> = {
  'gluten free': 'gluten-free',
  'glutenfree': 'gluten-free',
  'no gluten': 'gluten-free',
  'dairy free': 'dairy-free',
  'lactose free': 'lactose-free',
  'nut free': 'nut-free',
  'peanut free': 'peanut-free',
  'shellfish free': 'shellfish-free',
  'no pork': 'no-pork',
  'no beef': 'no-beef',
}

function normalizeTag(input: string): string {
  const trimmed = (input || '').trim().toLowerCase()
  if (!trimmed) return ''
  const compact = trimmed.replace(/[_]+/g, ' ').replace(/\s+/g, ' ')
  if (CANONICAL_MAP[compact]) return CANONICAL_MAP[compact]
  // Default canonicalization: replace spaces with hyphens
  return compact.replace(/\s+/g, '-')
}

function normalizeAndDedupe(tags: string[]): string[] {
  const result: string[] = []
  const seen = new Set<string>()
  for (const t of tags) {
    const n = normalizeTag(t)
    if (!n) continue
    if (!seen.has(n)) {
      seen.add(n)
      result.push(n)
    }
  }
  return result
}

export default function Onboarding() {
  const [name, setName] = useState('')
  const [age, setAge] = useState<number | ''>('')
  const [gender, setGender] = useState('')
  const [diets, setDiets] = useState<string[]>([])
  const [dietQuery, setDietQuery] = useState('')
  const [goals, setGoals] = useState<string[]>([])
  const [heightCm, setHeightCm] = useState<number | ''>('')
  const [weightKg, setWeightKg] = useState<number | ''>('')
  const [activity, setActivity] = useState('Sedentary')
  const [saving, setSaving] = useState(false)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [hasExistingProfile, setHasExistingProfile] = useState(false)
  const [editing, setEditing] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)

  function commitDietQuery() {
    const normalized = normalizeTag(dietQuery)
    if (!normalized) return
    setDiets(v => normalizeAndDedupe([...v, normalized]))
    setDietQuery('')
  }

  useEffect(() => {
    api<Summary>('/analytics/summary').then(setSummary).catch(() => {})
  }, [])

  useEffect(() => {
    // Prefill from /users/me and lock fields if data exists
    ;(async () => {
      try {
        const u = await api<any>('/users/me')
        const dietary = Array.isArray(u?.dietary_preferences) ? (u.dietary_preferences as string[]) : []
        const goalList = Array.isArray(u?.fitness_goals) ? u.fitness_goals as string[] : []
        
        // Prefill all fields from API response
        if (u?.name) setName(u.name)
        if (typeof u?.age === 'number') setAge(u.age)
        if (u?.gender) setGender(u.gender)
        if (typeof u?.height_cm === 'number') setHeightCm(u.height_cm)
        if (typeof u?.weight_kg === 'number') setWeightKg(u.weight_kg)
        if (u?.activity_level) setActivity(u.activity_level)
        if (dietary.length) setDiets(normalizeAndDedupe(dietary))
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
    const finalDiets = normalizeAndDedupe(diets)
    await api('/users/me', {
      method: 'PUT',
      body: JSON.stringify({
        name,
        age: age ? Number(age) : undefined,
        gender,
        dietary_preferences: finalDiets,
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
        {DIETS.map(d => {
          const canonical = normalizeTag(d)
          const checked = diets.includes(canonical)
          return (
            <label key={d} style={{ display:'inline-block', marginRight:12 }}>
              <input
                type="checkbox"
                checked={checked}
                disabled={fieldsDisabled}
                onChange={e => {
                  if (e.target.checked) {
                    setDiets(v => normalizeAndDedupe([...v, canonical]))
                  } else {
                    setDiets(v => v.filter(x => x !== canonical))
                  }
                }}
              /> {d}
            </label>
          )
        })}

        {/* Chips */}
        {diets.length > 0 && (
          <div style={{ marginTop:8, display:'flex', flexWrap:'wrap', gap:8 }}>
            {diets.map(tag => (
              <span key={tag} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'4px 8px', borderRadius:16, backgroundColor:'var(--bg-tertiary)', color:'var(--text-secondary)', border:'1px solid var(--border-color)' }}>
                {tag}
                {!fieldsDisabled && (
                  <button
                    type="button"
                    onClick={() => setDiets(v => v.filter(t => t !== tag))}
                    style={{ background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer' }}
                    aria-label={`Remove ${tag}`}
                  >✕</button>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Add custom tags with confirm-only commit */}
        <div style={{ display:'flex', gap:8, marginTop:8 }}>
          <input
            placeholder="Add custom (e.g., gluten-free, lactose-free)"
            value={dietQuery}
            onChange={e => setDietQuery(e.target.value)}
            onKeyDown={e => {
              if (fieldsDisabled) return
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault()
                commitDietQuery()
              }
            }}
            disabled={fieldsDisabled}
            style={{ flex:1, padding:10, backgroundColor:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:8, color:'var(--text-primary)' }}
          />
          <button type="button" disabled={fieldsDisabled || !dietQuery.trim()} onClick={commitDietQuery} style={{ padding:'0 12px' }}>Add</button>
        </div>
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

