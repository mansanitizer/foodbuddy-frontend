import { motion } from 'framer-motion'

export default function BottomNav() {
  function go(path: string) {
    window.location.assign(path)
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 20px',
      height: '80px',
      zIndex: 100
    }}>
      {/* Left side buttons */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <button style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          fontSize: '12px'
        }} onClick={() => go('/timeline')}>
          <span style={{ fontSize: '20px' }}>🏠</span>
          Home
        </button>

        <button
          onClick={() => go('/suggestions')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '20px' }}>💡</span>
          Suggestions
        </button>
      </div>

      {/* Center (+) button */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => go('/share')}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent-orange)',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
          cursor: 'pointer'
        }}
      >
        +
      </motion.button>

      {/* Right side buttons */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <button
          onClick={() => go('/buddies')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '20px' }}>👥</span>
          Buddies
        </button>

        <button
          onClick={() => go('/onboarding')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '20px' }}>⚙️</span>
          Settings
        </button>
      </div>
    </div>
  )
}


