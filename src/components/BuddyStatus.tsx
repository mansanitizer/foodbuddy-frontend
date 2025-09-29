import React, { useState, useEffect } from 'react'
import { getBuddyStatus } from '../lib/api'
import type { BuddyStatusResponse } from '../lib/api'

const BuddyStatus: React.FC = () => {
  const [status, setStatus] = useState<BuddyStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBuddyStatus()
  }, [])

  const fetchBuddyStatus = async () => {
    try {
      setLoading(true)
      const data = await getBuddyStatus()
      setStatus(data)
    } catch (error) {
      console.error('Failed to fetch buddy status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '12px',
        padding: '16px',
        textAlign: 'center',
        marginBottom: '16px'
      }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading buddy status...</div>
      </div>
    )
  }

  if (!status) return null

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {status.is_buddy ? (
        <span style={{
          color: '#22c55e',
          fontSize: '16px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#22c55e'
          }}></div>
          Connected with {status.buddy_count} buddy{status.buddy_count !== 1 ? 'ies' : ''}
        </span>
      ) : (
        <span style={{
          color: 'var(--text-secondary)',
          fontSize: '16px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--text-muted)'
          }}></div>
          No buddies connected
        </span>
      )}
    </div>
  )
}

export default BuddyStatus
