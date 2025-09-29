import React from 'react'
import type { BuddyInfo } from '../lib/api'

interface BuddyCardProps {
  buddy: BuddyInfo
  onRemove: () => void
}

const BuddyCard: React.FC<BuddyCardProps> = ({ buddy, onRemove }) => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: '1px solid var(--border-color)'
    }}>
      <div style={{ flex: 1 }}>
        <h4 style={{
          margin: '0 0 8px 0',
          color: 'var(--text-primary)',
          fontSize: '16px',
          fontWeight: '600'
        }}>
          {buddy.name || buddy.email}
        </h4>
        
        {buddy.age && (
          <p style={{
            margin: '0 0 4px 0',
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            Age: {buddy.age}
          </p>
        )}
        
        {buddy.activity_level && (
          <p style={{
            margin: '0 0 4px 0',
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            Activity: {buddy.activity_level}
          </p>
        )}
        
        {buddy.dietary_preferences && buddy.dietary_preferences.length > 0 && (
          <p style={{
            margin: '0 0 4px 0',
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            Diet: {buddy.dietary_preferences.join(', ')}
          </p>
        )}
        
        {buddy.daily_calorie_target && (
          <p style={{
            margin: '0',
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            Target: {buddy.daily_calorie_target} kcal/day
          </p>
        )}
      </div>
      
      <button 
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: '20px',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px'
        }}
        title="Remove buddy"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        ✕
      </button>
    </div>
  )
}

export default BuddyCard
