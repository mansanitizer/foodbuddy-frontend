import React, { useState, useEffect } from 'react'
import { getBuddies, removeBuddy } from '../lib/api'
import type { BuddyInfo } from '../lib/api'
import BuddyCard from './BuddyCard'

interface BuddyListProps {
  onRemoveBuddy?: (buddyId: number) => void
}

const BuddyList: React.FC<BuddyListProps> = ({ onRemoveBuddy }) => {
  const [buddies, setBuddies] = useState<BuddyInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBuddies()
  }, [])

  const fetchBuddies = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getBuddies()
      setBuddies(response.buddies)
    } catch (error) {
      console.error('Failed to fetch buddies:', error)
      setError('Failed to load buddies')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveBuddy = async (buddyId: number) => {
    if (!confirm('Are you sure you want to remove this buddy?')) {
      return
    }

    try {
      setError(null)
      await removeBuddy(buddyId)
      
      // Remove from local state
      setBuddies(prev => prev.filter(buddy => buddy.id !== buddyId))
      
      // Notify parent component
      onRemoveBuddy?.(buddyId)
    } catch (error) {
      console.error('Failed to remove buddy:', error)
      setError('Failed to remove buddy')
    }
  }

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading buddies...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ color: '#ef4444', marginBottom: '12px' }}>{error}</div>
        <button
          onClick={fetchBuddies}
          style={{
            backgroundColor: 'var(--accent-orange)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        margin: '0 0 16px 0'
      }}>
        Your Meal Buddies ({buddies.length})
      </h3>
      
      {buddies.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ marginBottom: '12px' }}>No buddies yet.</div>
          <div style={{ fontSize: '14px' }}>Use pairing codes to connect with friends!</div>
        </div>
      ) : (
        <div>
          {buddies.map((buddy) => (
            <BuddyCard
              key={buddy.id}
              buddy={buddy}
              onRemove={() => handleRemoveBuddy(buddy.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default BuddyList
