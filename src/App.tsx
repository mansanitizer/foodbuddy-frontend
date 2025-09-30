import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BottomNav from './components/BottomNav'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Pairing from './pages/Pairing'
import ShareMeal from './pages/ShareMeal'
import Timeline from './pages/Timeline'
import Suggestions from './pages/Suggestions'
import NotificationTest from './pages/NotificationTest'
import Buddies from './pages/Buddies'
import { NotificationManager } from './components/NotificationManager'

function RoutesWithAnimations({ authed, onAuthed }: { authed: boolean; onAuthed: () => void }) {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }}>
        <Routes location={location}>
          <Route path="/auth" element={authed ? <Navigate to="/timeline" replace /> : <Auth onSuccess={onAuthed} />} />
          <Route path="/onboarding" element={authed ? <Onboarding /> : <Navigate to="/auth" replace />} />
          <Route path="/pair" element={authed ? <Pairing /> : <Navigate to="/auth" replace />} />
          <Route path="/buddies" element={authed ? <Buddies /> : <Navigate to="/auth" replace />} />
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
		<div style={{ minHeight: '100vh' }}>
			<BrowserRouter>
        <RoutesWithAnimations authed={authed} onAuthed={() => setAuthed(true)} />
			</BrowserRouter>
		</div>
	)
}

export default App
