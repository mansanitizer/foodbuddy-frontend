import { useState } from 'react'
import { api, setToken, API_BASE } from '../lib/api'

type Props = { onSuccess: () => void }

export default function Auth({ onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      // Ensure navigation even if parent state lags
      window.location.assign('/timeline')
    } catch (err: any) {
      setError(err.message || 'Error')
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto', padding: 16 }}>
      <h2>Food with benefits</h2>
      <form onSubmit={handleSubmit}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" type="email" required style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }} />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" required style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }} />
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: 10 }}>{isLogin ? 'Sign In' : 'Sign Up'}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} style={{ marginTop: 8, width: '100%', padding: 10 }}>
        {isLogin ? 'Create account' : 'Have an account? Sign in'}
      </button>
    </div>
  )
}

