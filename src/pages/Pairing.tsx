import { useEffect, useState } from 'react'
import { api, clearToken, getBuddyStatus, generatePairingCode, acceptPairingCode } from '../lib/api'
import type { BuddyStatusResponse } from '../lib/api'

type Props = {
  onLogout?: () => void
}

export default function Pairing({ onLogout }: Props = {}) {
  const [code, setCode] = useState<string>('')
  const [generated, setGenerated] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [buddyStatus, setBuddyStatus] = useState<BuddyStatusResponse | null>(null)

  useEffect(() => {
    getBuddyStatus()
      .then(setBuddyStatus)
      .catch(() => {})
  }, [])

  async function generate() {
    const res = await generatePairingCode()
    setGenerated(res.code)
    setStatus(`Share this code. Expires: ${new Date(res.expires_at).toLocaleString()}`)
  }

  async function accept() {
    const result = await acceptPairingCode(code)
    setStatus(result.message || 'Paired!')
    // Refresh buddy status
    getBuddyStatus()
      .then(setBuddyStatus)
      .catch(() => {})
  }

  async function unpair() {
    await api(`/api/pairing/unpair`, { method: 'POST' })
    setStatus('Unpaired')
    // Refresh buddy status
    getBuddyStatus()
      .then(setBuddyStatus)
      .catch(() => {})
  }

  const handleLogout = () => {
    clearToken()
    onLogout?.()
  }

  return (
    <div style={{ maxWidth: 480, margin: '1rem auto', padding: 16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <h3 style={{ margin: 0 }}>Buddy Pairing</h3>
        {buddyStatus?.is_buddy && (
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#22c55e',
            border: '2px solid var(--bg-secondary)'
          }} />
        )}
      </div>
      <button onClick={generate} disabled={buddyStatus?.is_buddy} style={{ width:'100%', padding:10, opacity: buddyStatus?.is_buddy ? 0.6 : 1, cursor: buddyStatus?.is_buddy ? 'not-allowed' : 'pointer', marginTop: 8 }}>Generate Code</button>
      {generated && <div style={{ marginTop:8, fontSize:24, fontWeight:600, textAlign:'center' }}>{generated}</div>}
      <div style={{ marginTop:12 }}>
        <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Enter buddy code" style={{ width:'100%', padding:8 }} />
        <button onClick={accept} disabled={buddyStatus?.is_buddy} style={{ width:'100%', padding:10, marginTop:8, opacity: buddyStatus?.is_buddy ? 0.6 : 1, cursor: buddyStatus?.is_buddy ? 'not-allowed' : 'pointer' }}>Accept Pair</button>
      </div>
      <button onClick={unpair} style={{ width:'100%', padding:10, marginTop:8 }} className="danger">Unpair</button>
      {status && <div style={{ marginTop:8 }}>{status}</div>}

      {/* Logout Section */}
      <div style={{
        marginTop: 32,
        paddingTop: 16,
        borderTop: '1px solid var(--border-color)'
      }}>
        <button
          onClick={handleLogout}
          style={{ width: '100%', padding: 12 }}
          className="danger"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

