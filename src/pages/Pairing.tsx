import { useState } from 'react'
import { api } from '../lib/api'

export default function Pairing() {
  const [code, setCode] = useState<string>('')
  const [generated, setGenerated] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  async function generate() {
    const res = await api<{ code: string; expires_at: string }>(`/pairing/generate`, { method: 'POST' })
    setGenerated(res.code)
    setStatus(`Share this code. Expires: ${new Date(res.expires_at).toLocaleString()}`)
  }

  async function accept() {
    await api(`/pairing/accept`, { method: 'POST', body: JSON.stringify({ code }) })
    setStatus('Paired!')
  }

  async function unpair() {
    await api(`/pairing/unpair`, { method: 'POST' })
    setStatus('Unpaired')
  }

  return (
    <div style={{ maxWidth: 480, margin: '1rem auto', padding: 16 }}>
      <h3>Buddy Pairing</h3>
      <button onClick={generate} style={{ width:'100%', padding:10 }}>Generate Code</button>
      {generated && <div style={{ marginTop:8, fontSize:24, fontWeight:600, textAlign:'center' }}>{generated}</div>}
      <div style={{ marginTop:12 }}>
        <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Enter buddy code" style={{ width:'100%', padding:8 }} />
        <button onClick={accept} style={{ width:'100%', padding:10, marginTop:8 }}>Accept Pair</button>
      </div>
      <button onClick={unpair} style={{ width:'100%', padding:10, marginTop:8 }} className="danger">Unpair</button>
      {status && <div style={{ marginTop:8 }}>{status}</div>}
    </div>
  )
}

