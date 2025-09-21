import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Pairing from './pages/Pairing'
import ShareMeal from './pages/ShareMeal'
import Timeline from './pages/Timeline'
import Profile from './pages/Profile'

function App() {
	const [authed, setAuthed] = useState<boolean>(!!localStorage.getItem('token'))

	useEffect(() => {
		setAuthed(!!localStorage.getItem('token'))
	}, [])

	return (
		<div style={{ minHeight: '100vh' }}>
			<BrowserRouter>
				<Routes>
					<Route path="/auth" element={authed ? <Navigate to="/timeline" replace /> : <Auth onSuccess={() => setAuthed(true)} />} />
					<Route path="/onboarding" element={authed ? <Onboarding /> : <Navigate to="/auth" replace />} />
					<Route path="/pair" element={authed ? <Pairing /> : <Navigate to="/auth" replace />} />
					<Route path="/share" element={authed ? <ShareMeal /> : <Navigate to="/auth" replace />} />
					<Route path="/timeline" element={authed ? <Timeline /> : <Navigate to="/auth" replace />} />
					<Route path="/profile" element={authed ? <Profile /> : <Navigate to="/auth" replace />} />
					<Route path="*" element={<Navigate to={authed ? '/timeline' : '/auth'} replace />} />
				</Routes>
			</BrowserRouter>
		</div>
	)
}

export default App
