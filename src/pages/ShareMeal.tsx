import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { API_BASE } from '../lib/api'

export default function ShareMeal() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [mealName, setMealName] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  async function submit() {
    if (!files || files.length === 0) return
    setError(null)
    setUploading(true)
    const form = new FormData()
    for (let i = 0; i < files.length; i++) form.append('images', files[i])
    if (mealName) form.append('meal_name', mealName)
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API_BASE}/meals/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      })
      if (!res.ok) {
        const text = await res.text()
        setError(text)
        return
      }
      setResult(await res.json())
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '1rem auto', padding: 16 }}>
      <h3>Share a meal</h3>
      <input type="file" accept="image/*" multiple onChange={e=>setFiles(e.target.files)} style={{ display:'block', width:'100%', marginBottom:8 }} />
      <input placeholder="Meal name (optional)" value={mealName} onChange={e=>setMealName(e.target.value)} style={{ display:'block', width:'100%', marginBottom:8, padding:8 }} />
      <button onClick={submit} disabled={uploading || !files?.length} style={{ width:'100%', padding:10, opacity: uploading || !files?.length ? 0.6 : 1, cursor: uploading || !files?.length ? 'not-allowed' : 'pointer' }}>{uploading ? 'Uploading…' : 'Upload'}</button>
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Uploading…</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <motion.span
                animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
                style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }}
              />
              <motion.span
                animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
                style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }}
              />
              <motion.span
                animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <div style={{ color:'red', marginTop:8 }}>{error}</div>}
      {result && (
        <div style={{ marginTop:12 }}>
          <img src={result.image_url} style={{ maxWidth:'100%', borderRadius:8 }} />
          <div style={{ marginTop:8 }}>
            <div><strong>{result.meal_name}</strong> — {result.calories ?? '?'} kcal</div>
            <div>Protein {result.macros?.protein_g ?? '-'}g, Carbs {result.macros?.carbs_g ?? '-'}g, Fat {result.macros?.fat_g ?? '-'}g</div>
            <div>Confidence: {Math.round((result.confidence_score ?? 0)*100)}%</div>
          </div>
        </div>
      )}
    </div>
  )
}

