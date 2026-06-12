import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import { useAuth } from '../context/useAuth'

export default function CreateAccount() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: '',
    userType: 'User',
    subType: 'Personal',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const subTypeOptions =
    formData.userType === 'Creator'
      ? ['Personal', 'Empresarial']
      : ['Personal', 'Infantil', 'Empresarial']

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      if (name === 'userType' && value === 'Creator' && prev.subType === 'Infantil') {
        return { ...prev, userType: value, subType: 'Personal' }
      }
      return { ...prev, [name]: value }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!isLogin && formData.userType === 'Creator' && formData.subType === 'Infantil') {
      setError('No es posible crear una cuenta de creador con subtipo Infantil.')
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        const session = await apiService.login(formData.email, formData.password)
        login(session.data)
        navigate('/')
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden')
          setLoading(false)
          return
        }
        const session = await apiService.register({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          userType: formData.userType,
          subType: formData.subType,
        })
        login(session.data)
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error en la autenticación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 font-display flex items-center justify-center p-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-full sm:max-w-4xl lg:max-w-6xl rounded-[2rem] overflow-hidden glass-card border border-slate-800 bg-slate-950/95">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="bg-white text-black rounded-xl p-3 shadow-lg shadow-white/10">
              <span className="material-symbols-outlined text-2xl">rocket_launch</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Realart</p>
              <h1 className="text-xl font-bold text-white">Join the community</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
            }}
            className="inline-flex min-w-[140px] max-w-[220px] items-center justify-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            {isLogin ? 'Sign In' : 'Create'}
          </button>
        </header>

        <main className="px-6 py-8 sm:px-8 sm:py-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                {isLogin ? 'Accede a tu cuenta' : 'Únete a Realart'}
              </p>
              <h2 className="text-3xl font-extrabold text-white">
                {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
              </h2>
              <p className="text-sm text-slate-400">
                Selecciona tu camino y configura tu perfil para empezar a crear en la comunidad.
              </p>
            </div>

            {!isLogin && (
              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500 mb-4">Soy...</p>
                <div className="grid grid-cols-2 gap-3">
                  {['User', 'Creator'].map((type) => (
                    <label
                      key={type}
                      className={`cursor-pointer rounded-3xl border p-4 transition ${
                        formData.userType === type
                          ? 'border-white bg-white/10 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="userType"
                        value={type}
                        checked={formData.userType === type}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <div className="font-bold">{type}</div>
                      <p className="text-xs text-slate-500 mt-2">
                        {type === 'User'
                          ? 'Explora y comparte tu contenido.'
                          : 'Crea contenido premium para tu audiencia.'}
                      </p>
                    </label>
                  ))}
                </div>
              </section>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Usuario</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Confirmar contraseña</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {!isLogin && (
                <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500 mb-4">Subtipo de cuenta</p>
                  <div className="grid gap-3">
                    {subTypeOptions.map((subType) => (
                      <label
                        key={subType}
                        className={`cursor-pointer rounded-3xl border p-4 transition ${
                          formData.subType === subType
                            ? 'border-white bg-white/10 text-white'
                            : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="subType"
                          value={subType}
                          checked={formData.subType === subType}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <div className="font-bold">{subType}</div>
                        <p className="text-xs text-slate-500 mt-2">
                          {subType === 'Personal'
                            ? 'Uso individual'
                            : subType === 'Infantil'
                            ? 'Ambiente seguro para menores'
                            : 'Herramientas para empresas'}
                        </p>
                      </label>
                    ))}
                  </div>
                  {formData.userType === 'Creator' && (
                    <p className="text-xs text-slate-500 mt-3">
                      Los creadores no pueden escoger el subtipo Infantil.
                    </p>
                  )}
                </section>
              )}

              {error && (
                <div className="rounded-3xl border border-red-500 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="min-w-[220px] max-w-[360px] w-full rounded-3xl bg-white px-6 py-4 text-sm font-bold text-slate-950 transition hover:bg-slate-200 disabled:opacity-50"
              >
                {loading ? 'Procesando...' : isLogin ? 'Continuar' : 'Continuar'}
              </button>
            </form>

            <div className="text-center text-sm text-slate-500">
              <p>
                {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setError('')
                  }}
                  className="font-semibold text-white hover:underline"
                >
                  {isLogin ? 'Crear una' : 'Iniciar Sesión'}
                </button>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
