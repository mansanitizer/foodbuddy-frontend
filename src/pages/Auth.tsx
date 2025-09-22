import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { api, setToken, API_BASE } from '../lib/api'

type Props = { onSuccess: () => void }

export default function Auth({ onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      if (isLogin) {
        const form = new URLSearchParams()
        form.set('username', email)
        form.set('password', password)
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form.toString(),
        })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        setToken(data.access_token)
      } else {
        const data = await api<{ access_token: string }>(`/auth/signup`, {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
        setToken(data.access_token)
      }
      onSuccess()
      // After signup -> onboarding; after signin -> timeline
      navigate(isLogin ? '/timeline' : '/onboarding')
    } catch (err: any) {
      setError(err.message || 'Error')
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '3rem auto', padding: 16 }}>
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: 12 }}
      >
        Food with benefits
      </motion.h2>
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" type="email" required style={{ display: 'block', width: '100%', marginBottom: 8, padding: 10, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" required style={{ display: 'block', width: '100%', marginBottom: 8, padding: 10, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} />
        {error && <div style={{ backgroundColor: '#ef4444', color: 'white', borderRadius: 6, padding: '8px 10px', marginBottom: 8 }}>{error}</div>}
        <motion.button type="submit" whileTap={{ scale: 0.98 }} style={{ width: '100%', padding: 12 }}>
          {isLogin ? 'Sign In' : 'Sign Up'}
        </motion.button>
      </motion.form>
      <motion.button whileTap={{ scale: 0.98 }} onClick={() => setIsLogin(!isLogin)} style={{ marginTop: 8, width: '100%', padding: 12, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
        {isLogin ? 'Create account' : 'Have an account? Sign in'}
      </motion.button>
    </div>
  )
}

