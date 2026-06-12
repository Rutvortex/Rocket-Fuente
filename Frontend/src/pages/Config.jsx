import { useState, useEffect } from 'react'
import { apiService } from '../services/api'

export default function Config() {
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark')
  })
  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem('fontSize') || '16', 10)
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [statusType, setStatusType] = useState('success')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Dark Mode Side Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  // Font Size Side Effect
  useEffect(() => {
    document.documentElement.style.fontSize = fontSize + 'px'
    localStorage.setItem('fontSize', fontSize.toString())
  }, [fontSize])

  const handleDiscard = () => {
    if (window.confirm('¿Estás seguro de que deseas descartar los cambios?')) {
      // Reload defaults
      setDarkMode(true)
      setFontSize(16)
      setStatusMessage('Cambios descartados y valores restaurados.')
      setStatusType('info')
    }
  }

  const handleSave = () => {
    setStatusMessage('¡Preferencias guardadas exitosamente!')
    setStatusType('success')
  }

  const handle2FA = () => {
    setStatusMessage('Se inició la configuración de Autenticación de Dos Factores.')
    setStatusType('info')
  }

  const handleChangePassword = () => {
    setShowPasswordModal(true)
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault()
    const { currentPassword, newPassword, confirmPassword } = passwordForm

    if (!currentPassword.trim()) {
      setStatusMessage('La contraseña actual es requerida.')
      setStatusType('error')
      return
    }

    if (!newPassword.trim()) {
      setStatusMessage('La nueva contraseña es requerida.')
      setStatusType('error')
      return
    }

    if (newPassword.length < 8) {
      setStatusMessage('La contraseña debe tener al menos 8 caracteres.')
      setStatusType('error')
      return
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage('Las contraseñas no coinciden.')
      setStatusType('error')
      return
    }

    try {
      setPasswordLoading(true)
      await apiService.changePassword({
        currentPassword,
        newPassword
      })
      setStatusMessage('Contraseña cambiada exitosamente.')
      setStatusType('success')
      setShowPasswordModal(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setStatusMessage(error.response?.data?.message || 'Error al cambiar la contraseña.')
      setStatusType('error')
    } finally {
      setPasswordLoading(false)
    }
  }

  const closePasswordModal = () => {
    setShowPasswordModal(false)
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  // Calculate slider percentage for styling
  const min = 12
  const max = 24
  const percent = ((fontSize - min) / (max - min)) * 100

  // Filter sections dynamically
  const matchesSearch = (text) => text.toLowerCase().includes(searchQuery.toLowerCase())

  return (
    <main className="flex-1 max-w-4xl mx-auto p-6 md:p-10 text-slate-100 min-h-screen">
      <div className="flex flex-col gap-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-blue-500 font-fill">settings</span>
              Configuración de Realart
            </h1>
            <p className="text-slate-400 text-sm">
              Personaliza el aspecto y la seguridad de tu espacio de trabajo digital.
            </p>
          </div>
          
          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-500 text-white"
              placeholder="Buscar ajustes..."
            />
          </div>
        </div>

        {statusMessage && (
          <div className={`rounded-3xl border px-4 py-3 text-sm ${statusType === 'success' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200' : 'border-slate-700 bg-slate-900/80 text-slate-200'} mb-6`}>
            {statusMessage}
          </div>
        )}

        {/* Personalization Section */}
        {matchesSearch("Tema Estilo Personalización Dark Mode Color Font Letra") && (
          <section className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">brush</span>
              Tema y Estilo Visual
            </h2>
            <div className="grid gap-4">
              
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-5 rounded-xl border border-slate-800/60 bg-slate-900/40 hover:bg-slate-900/60 transition duration-200">
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-white">Modo Oscuro (Dark Mode)</p>
                  <p className="text-sm text-slate-400">Alternar entre temas oscuros y claros</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Font Size Slider */}
              <div className="flex flex-col gap-6 p-5 rounded-xl border border-slate-800/60 bg-slate-900/40 hover:bg-slate-900/60 transition duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-white">Tamaño de Fuente</p>
                    <p className="text-sm text-slate-400">Ajusta el tamaño del texto de la interfaz</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-blue-400 border border-slate-700">
                    {fontSize}px
                  </span>
                </div>
                <div className="relative w-full h-2 bg-slate-800 rounded-full">
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${percent}%` }}
                  ></div>
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-lg pointer-events-none"
                    style={{ left: `${percent}%`, transform: 'translate(-50%, -50%)' }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                  <span>Pequeño</span>
                  <span>Predeterminado</span>
                  <span>Grande</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Security Section */}
        {matchesSearch("Seguridad 2FA Clave Contraseña Security Password") && (
          <section className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">security</span>
              Seguridad y Privacidad
            </h2>
            <div className="grid gap-4">
              
              {/* Two-Factor Authentication */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800/60 bg-slate-900/40 hover:bg-slate-900/60 transition duration-200">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-blue-500 border border-slate-700">
                    <span className="material-symbols-outlined">verified_user</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-white">Autenticación de Dos Factores</p>
                    <p className="text-sm text-slate-400">Añade una capa de protección extra a tu cuenta</p>
                  </div>
                </div>
                <button
                  onClick={handle2FA}
                  className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
                >
                  Habilitar
                </button>
              </div>

              {/* Password Change */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800/60 bg-slate-900/40 hover:bg-slate-900/60 transition duration-200">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-blue-500 border border-slate-700">
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-white">Contraseña de Acceso</p>
                    <p className="text-sm text-slate-400">Último cambio hace 3 meses</p>
                  </div>
                </div>
                <button
                  onClick={handleChangePassword}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-lg transition-colors border border-slate-750"
                >
                  Cambiar Contraseña
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-800/80">
          <button
            onClick={handleDiscard}
            className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors"
          >
            Descartar Cambios
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-blue-900/20"
          >
            Guardar Preferencias
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-6">
              <h2 className="text-xl font-bold text-white">Cambiar Contraseña</h2>
              <button
                onClick={closePasswordModal}
                className="rounded-lg p-1 hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined text-slate-400 hover:text-white">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitPasswordChange} className="flex flex-col gap-4 p-6">
              {/* Current Password */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-300">Contraseña Actual</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Ingresa tu contraseña actual"
                  className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-300">Nueva Contraseña</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Ingresa tu nueva contraseña"
                  className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-slate-500">Mínimo 8 caracteres</p>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-300">Confirmar Contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirma tu nueva contraseña"
                  className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="flex-1 rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

