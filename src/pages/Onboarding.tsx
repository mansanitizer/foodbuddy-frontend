import { useState } from 'react'
import { api } from '../lib/api'

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
      <h3>Onboarding</h3>
      <input placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} style={{ display:'block', width:'100%', marginBottom:8, padding:8 }} />
      <input placeholder="Age" type="number" value={age} onChange={e=>setAge(e.target.value ? Number(e.target.value) : '')} style={{ display:'block', width:'100%', marginBottom:8, padding:8 }} />
      <select value={gender} onChange={e=>setGender(e.target.value)} style={{ display:'block', width:'100%', marginBottom:8, padding:8 }}>
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
        <input placeholder="Custom restrictions" onChange={e=> e.target.value && setDiets(v => [...v, e.target.value])} style={{ display:'block', width:'100%', marginTop:8, padding:8 }} />
      </div>
      <div style={{ margin:'8px 0' }}>
        <div>Fitness Goals</div>
        {GOALS.map(g => (
          <label key={g} style={{ display:'inline-block', marginRight:12 }}>
            <input type="checkbox" checked={goals.includes(g)} onChange={e=> setGoals(v => e.target.checked ? [...v, g] : v.filter(x=>x!==g)) } /> {g}
          </label>
        ))}
      </div>
      <input placeholder="Height (cm)" type="number" value={heightCm} onChange={e=>setHeightCm(e.target.value ? Number(e.target.value) : '')} style={{ display:'block', width:'100%', marginBottom:8, padding:8 }} />
      <input placeholder="Weight (kg)" type="number" value={weightKg} onChange={e=>setWeightKg(e.target.value ? Number(e.target.value) : '')} style={{ display:'block', width:'100%', marginBottom:8, padding:8 }} />
      <select value={activity} onChange={e=>setActivity(e.target.value)} style={{ display:'block', width:'100%', marginBottom:8, padding:8 }}>
        {ACTIVITY.map(a => <option key={a}>{a}</option>)}
      </select>
      <button onClick={save} disabled={saving} style={{ width:'100%', padding:10 }}>{saving ? 'Saving...' : 'Continue'}</button>
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

