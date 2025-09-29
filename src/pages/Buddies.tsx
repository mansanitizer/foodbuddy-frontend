import { useState, useEffect } from 'react'
import { getBuddyStatus } from '../lib/api'
import BuddyList from '../components/BuddyList'
import BuddyStatus from '../components/BuddyStatus'

export default function Buddies() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBuddyStatus()
  }, [])

  const fetchBuddyStatus = async () => {
    try {
      setLoading(true)
      await getBuddyStatus()
    } catch (error) {
      console.error('Failed to fetch buddy status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveBuddy = () => {
    // Refresh buddy status when a buddy is removed
    fetchBuddyStatus()
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      paddingBottom: '80px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            fwb
          </div>
        </div>
        <button
          onClick={() => window.location.href = '/pair'}
          style={{
            backgroundColor: 'var(--accent-orange)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Add Buddy
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <BuddyStatus />
        <BuddyList onRemoveBuddy={handleRemoveBuddy} />
      </div>
    </div>
  )
}
