import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import BottomNav from './components/BottomNav'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Pairing from './pages/Pairing'
import ShareMeal from './pages/ShareMeal'
import Timeline from './pages/Timeline'
import Suggestions from './pages/Suggestions'
import NotificationTest from './pages/NotificationTest'
import { NotificationManager } from './components/NotificationManager'

// Add error boundary component to catch React errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          backgroundColor: '#111827',
          color: 'white',
          textAlign: 'center'
        }}>
          <h1>FoodBuddy - Something went wrong</h1>
          <p>There was an error loading the application. Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Refresh Page
          </button>
          {this.state.error && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary>Error Details</summary>
              <pre style={{ fontSize: '12px', marginTop: '10px' }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

function RoutesWithAnimations({ authed, onAuthed }: { authed: boolean; onAuthed: () => void }) {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
        <Routes location={location}>
          <Route path="/auth" element={authed ? <Navigate to="/timeline" replace /> : <Auth onSuccess={onAuthed} />} />
          <Route path="/onboarding" element={authed ? <Onboarding /> : <Navigate to="/auth" replace />} />
          <Route path="/pair" element={authed ? <Pairing /> : <Navigate to="/auth" replace />} />
          <Route path="/share" element={authed ? <ShareMeal /> : <Navigate to="/auth" replace />} />
          <Route path="/timeline" element={authed ? <Timeline /> : <Navigate to="/auth" replace />} />
          <Route path="/suggestions" element={authed ? <Suggestions /> : <Navigate to="/auth" replace />} />
          <Route path="/notifications-test" element={authed ? <NotificationTest /> : <Navigate to="/auth" replace />} />
          <Route path="*" element={<Navigate to={authed ? '/timeline' : '/auth'} replace />} />
        </Routes>
        {authed && <BottomNav />}
        {authed && <NotificationManager />}
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
	const [authed, setAuthed] = useState<boolean>(!!localStorage.getItem('token'))

	useEffect(() => {
		setAuthed(!!localStorage.getItem('token'))
	}, [])

	return (
		<ErrorBoundary>
			<div style={{ minHeight: '100vh' }}>
				<BrowserRouter>
					<RoutesWithAnimations authed={authed} onAuthed={() => setAuthed(true)} />
				</BrowserRouter>
			</div>
		</ErrorBoundary>
	)
}

export default App
