import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import MainHub from './pages/MainHub'
import CreateAccount from './pages/CreateAccount'
import DMI from './pages/DMI'
import Achievements from './pages/Achievements'
import Rewards from './pages/Rewards'
import Profile from './pages/Profile'
import Config from './pages/Config'
import ShortSection from './pages/ShortSection'
import VideoPlayer from './pages/VideoPlayer'
import LivePage from './pages/LivePage'
import Navigation from './components/Navigation'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function AppRoutes() {
  const location = useLocation()
  const isAuthRoute = location.pathname === '/create-account'

  return (
    <div className={isAuthRoute ? 'app-container app-container-auth' : 'app-container'}>
      <Routes>
        <Route path="/create-account" element={<CreateAccount />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={
            <div className="app-layout">
              <Navigation />
              <MainHub />
            </div>
          } />
          <Route path="/dmi" element={
            <div className="app-layout">
              <Navigation />
              <DMI />
            </div>
          } />
          <Route path="/achievements" element={
            <div className="app-layout">
              <Navigation />
              <Achievements />
            </div>
          } />
          <Route path="/rewards" element={
            <div className="app-layout">
              <Navigation />
              <Rewards />
            </div>
          } />
          <Route path="/profile" element={
            <div className="app-layout">
              <Navigation />
              <Profile />
            </div>
          } />
          <Route path="/config" element={
            <div className="app-layout">
              <Navigation />
              <Config />
            </div>
          } />
          {/* Lapses (formerly Shorts) — also keep /shorts as alias */}
          <Route path="/lapses" element={
            <div className="app-layout">
              <Navigation />
              <ShortSection />
            </div>
          } />
          <Route path="/shorts" element={<Navigate to="/lapses" replace />} />
          {/* Video player */}
          <Route path="/player/:type" element={
            <div className="app-layout">
              <Navigation />
              <VideoPlayer />
            </div>
          } />
          {/* Live streams — /live/new to start, /live/:roomId to watch */}
          <Route path="/live/:roomId" element={
            <div className="app-layout">
              <Navigation />
              <LivePage />
            </div>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppRoutes />
        </Router>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
