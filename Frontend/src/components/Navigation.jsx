import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function Navigation() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleNavigation = (path) => {
    navigate(path)
    setIsMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/create-account')
    setIsMenuOpen(false)
  }

  return (
    <nav className={`navigation glass-card ${isMenuOpen ? 'navigation-open' : ''}`}>
      <div className="navigation-header">
        <div className="navigation-brand">
          <span className="material-symbols-outlined nav-logo">bolt</span>
          <div>
            <p className="nav-label">Realart</p>
            <p className="nav-subtitle">Panel</p>
          </div>
        </div>

        <button
          type="button"
          className="mobile-nav-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Mostrar menú"
        >
          <span className="material-symbols-outlined">
            {isMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      <div className="navigation-menu">
        <button onClick={() => handleNavigation('/')} className="nav-button">
          <span className="material-symbols-outlined">home</span>
          <span>Inicio</span>
        </button>

        <button onClick={() => handleNavigation('/dmi')} className="nav-button">
          <span className="material-symbols-outlined">mail</span>
          <span>Mensajes</span>
        </button>

        <button onClick={() => handleNavigation('/lapses')} className="nav-button">
          <span className="material-symbols-outlined">timelapse</span>
          <span>Lapses</span>
        </button>

        <button onClick={() => handleNavigation('/achievements')} className="nav-button">
          <span className="material-symbols-outlined">workspace_premium</span>
          <span>Logros</span>
        </button>

        <button onClick={() => handleNavigation('/rewards')} className="nav-button">
          <span className="material-symbols-outlined">stars</span>
          <span>Recompensas</span>
        </button>

        <button onClick={() => handleNavigation('/profile')} className="nav-button">
          <span className="material-symbols-outlined">person</span>
          <span>Perfil</span>
        </button>

        <button onClick={() => handleNavigation('/config')} className="nav-button">
          <span className="material-symbols-outlined">settings</span>
          <span>Configuración</span>
        </button>

        <hr className="nav-divider" />

        <button onClick={handleLogout} className="nav-button nav-button-logout">
          <span className="material-symbols-outlined">logout</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </nav>
  )
}
