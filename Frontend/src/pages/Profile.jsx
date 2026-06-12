import { useState, useEffect } from 'react'
import { useAuth } from '../context/useAuth'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'

export default function Profile() {
  const { user, updateSessionUser } = useAuth()
  const navigate = useNavigate()
  
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    location: '',
    website: '',
    profilePicture: '',
    coverPicture: '',
  })
  
  const [activeTab, setActiveTab] = useState('yo')
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusType, setStatusType] = useState('success')
  const [stats, setStats] = useState({ posts: 0, stars: 0 })
  const [statsLoading, setStatsLoading] = useState(true)
  const [userPosts, setUserPosts] = useState([])
  const [achievements, setAchievements] = useState([])
  const [achievementsLoading, setAchievementsLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (profile?._id) {
      fetchProfileStats()
      fetchUserAchievements()
    }
  }, [profile?._id])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await apiService.getProfile()
      if (res.success && res.data) {
        setProfile(res.data)
        setEditForm({
          username: res.data.username || '',
          bio: res.data.bio || '',
          location: res.data.location || '',
          website: res.data.website || '',
          profilePicture: res.data.profilePicture || '',
          coverPicture: res.data.coverPicture || '',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setStatusMessage('Error al cargar la información del perfil.')
      setStatusType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e, field) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setStatusMessage('La imagen es demasiado grande. El límite es de 2MB.')
        setStatusType('error')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditForm((prev) => ({ ...prev, [field]: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveChanges = async (e) => {
    e.preventDefault()
    setStatusMessage('')
    
    if (editForm.username.trim().length < 3) {
      setStatusMessage('El nombre de usuario debe tener al menos 3 caracteres.')
      setStatusType('error')
      return
    }

    try {
      const res = await apiService.updateProfile(editForm)
      if (res.success && res.data) {
        setProfile(res.data)
        // Actualizar datos de sesión del contexto
        updateSessionUser({
          username: res.data.username,
          profilePicture: res.data.profilePicture,
        })
        setIsEditing(false)
        setStatusMessage('Perfil actualizado con éxito.')
        setStatusType('success')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setStatusMessage(error.response?.data?.message || 'Error al actualizar el perfil.')
      setStatusType('error')
    }
  }

  const fetchProfileStats = async () => {
    if (!profile?._id) return

    try {
      setStatsLoading(true)
      const res = await apiService.getUserPosts({ userId: profile._id, limit: 1000 })
      const posts = Array.isArray(res?.data) ? res.data : []
      const totalStars = posts.reduce((sum, post) => sum + (post.stars || 0), 0)

      setStats({
        posts: posts.length,
        stars: totalStars,
      })
      setUserPosts(posts)
    } catch (error) {
      console.error('Error fetching profile stats:', error)
      setStats({ posts: 0, stars: 0 })
      setUserPosts([])
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchUserAchievements = async () => {
    if (!profile?._id) return

    try {
      setAchievementsLoading(true)
      const res = await apiService.getUserAchievements(profile._id)
      setAchievements(res.data || [])
    } catch (error) {
      console.error('Error fetching user achievements:', error)
      setAchievements([])
    } finally {
      setAchievementsLoading(false)
    }
  }

  const formatCount = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`
    return value.toLocaleString('es-ES')
  }

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen text-slate-100">
        <div className="text-center p-8 bg-slate-900/40 rounded-3xl border border-slate-800/80 backdrop-blur-md">
          <p className="text-slate-400">Cargando perfil...</p>
        </div>
      </main>
    )
  }

  const displayName = profile?.username 
    ? profile.username.charAt(0).toUpperCase() + profile.username.slice(1) 
    : 'Usuario'
  const displayHandle = profile?.username ? `@${profile.username}` : '@usuario'

  return (
    <main className="flex-1 max-w-5xl mx-auto p-4 md:p-6 text-slate-100 min-h-screen relative">
      <div className="flex flex-col gap-6">
        
        {/* Status Message toast */}
        {statusMessage && (
          <div className={`rounded-3xl border px-4 py-3 text-sm flex items-center justify-between ${
            statusType === 'success' 
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200' 
              : 'border-red-500 bg-red-500/10 text-red-200'
          }`}>
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage('')} className="material-symbols-outlined text-sm hover:text-white">close</button>
          </div>
        )}

        {/* Cover Banner and Portrait */}
        <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 relative">
          <div 
            className="h-44 md:h-52 w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative bg-cover bg-center"
            style={profile?.coverPicture ? { backgroundImage: `url(${profile.coverPicture})` } : {}}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
          </div>
          <div className="px-6 pb-6">
            <div className="relative flex flex-col md:flex-row md:items-end md:justify-between -mt-16 md:-mt-12 gap-4">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 border-slate-900 bg-slate-800 shadow-2xl overflow-hidden shrink-0">
                  {profile?.profilePicture ? (
                    <img src={profile.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-blue-600 flex items-center justify-center font-bold text-white text-4xl uppercase select-none">
                      {displayName[0]}
                    </div>
                  )}
                </div>
                <div className="mb-2">
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    {displayName}
                    <span className="material-symbols-outlined text-blue-500 font-fill text-xl" title="Cuenta Verificada">verified</span>
                  </h1>
                  <p className="text-sm text-slate-400 font-medium">{displayHandle}</p>
                </div>
              </div>
              
              {/* Profile Action Buttons */}
              <div className="flex gap-3 mb-2 shrink-0">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex h-10 items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 text-sm transition-all duration-200 shadow-lg shadow-blue-900/20"
                >
                  Editar Perfil
                </button>
                <button
                  onClick={() => setOptionsOpen((prev) => !prev)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 text-white hover:bg-slate-850 transition-colors"
                >
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
              </div>

              {optionsOpen && (
                <div className="absolute right-0 top-12 z-50 rounded-2xl border border-slate-800 bg-slate-950 p-2 text-sm text-slate-300 shadow-xl w-48 flex flex-col">
                  <button onClick={() => { navigate('/achievements'); setOptionsOpen(false) }} className="text-left rounded-xl px-4 py-2 hover:bg-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-blue-500">workspace_premium</span> Ver logros
                  </button>
                  <button onClick={() => { navigate('/rewards'); setOptionsOpen(false) }} className="text-left rounded-xl px-4 py-2 hover:bg-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-blue-500">stars</span> Recompensas
                  </button>
                  <button onClick={() => { navigate('/config'); setOptionsOpen(false) }} className="text-left rounded-xl px-4 py-2 hover:bg-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-blue-500">settings</span> Configuración
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <nav className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('yo')}
            className={`relative px-6 py-4 text-sm font-bold transition-colors ${
              activeTab === 'yo' ? 'border-b-2 border-blue-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Yo
          </button>
          <button
            onClick={() => setActiveTab('acerca')}
            className={`px-6 py-4 text-sm font-bold transition-colors ${
              activeTab === 'acerca' ? 'border-b-2 border-blue-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Acerca de mí
          </button>
          <button
            onClick={() => navigate('/achievements')}
            className="px-6 py-4 text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            Logros
            <span className="material-symbols-outlined text-sm font-fill text-blue-500">workspace_premium</span>
          </button>
        </nav>

        {/* Grid and Sidebar Split */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Main Grid Content */}
          <div className="lg:col-span-8">
            {activeTab === 'yo' ? (
              userPosts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {userPosts.map((post) => (
                    <div
                      key={post._id}
                      className="aspect-square overflow-hidden rounded-lg bg-slate-900 border border-slate-800 group cursor-pointer relative"
                      onClick={() => navigate('/player/large')}
                    >
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.content ? post.content.slice(0, 80) : 'Publicación'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4 text-slate-300 text-sm text-center">
                          {post.content ? post.content : 'Publicación sin imagen'}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white text-xs font-semibold">
                        <div className="flex items-center justify-between w-full">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-lg text-yellow-500">star</span>
                            {formatCount(post.stars || 0)}
                          </span>
                          <span className="text-slate-300">{new Date(post.createdAt).toLocaleDateString('es-ES')}</span>
                        </div>
                        {post.content && (
                          <p className="mt-2 text-xs text-slate-200 truncate">
                            {post.content}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-slate-400 text-center">
                  <p className="text-sm">Aún no has publicado contenido. Publica algo en el hub principal para verlo aquí.</p>
                </div>
              )
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col gap-4">
                <h3 className="font-bold text-white text-lg">Biografía extendida</h3>
                <p className="text-slate-350 text-sm leading-relaxed whitespace-pre-wrap">
                  {profile?.bio || 'Sin biografía especificada. Haz clic en "Editar Perfil" para agregar una biografía.'}
                </p>
                <div className="space-y-3 mt-2 border-t border-slate-800/80 pt-4">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <span className="material-symbols-outlined text-lg text-blue-500">location_on</span>
                    <span>{profile?.location || 'No especificada'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <span className="material-symbols-outlined text-lg text-blue-500">calendar_today</span>
                    <span>Unido en {new Date(profile?.createdAt || Date.now()).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <span className="material-symbols-outlined text-lg text-blue-500">link</span>
                    {profile?.website ? (
                      <a className="text-blue-400 hover:underline" href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noreferrer">{profile.website}</a>
                    ) : (
                      <span>No especificado</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Details */}
          <aside className="space-y-6 lg:col-span-4">
            
            {/* Short Bio Widget */}
            {activeTab === 'yo' && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Acerca de mí</h3>
                <p className="mb-4 text-sm leading-relaxed text-slate-350 whitespace-pre-wrap">
                  {profile?.bio || 'Sin biografía aún. Edita tu perfil para completarlo.'}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <span className="material-symbols-outlined text-lg text-blue-500">location_on</span>
                    <span>{profile?.location || 'No especificada'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <span className="material-symbols-outlined text-lg text-blue-500">link</span>
                    {profile?.website ? (
                      <a className="text-blue-400 hover:underline truncate" href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noreferrer">{profile.website}</a>
                    ) : (
                      <span>No especificado</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Badges / Insignias Widget */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Insignias</h3>
                <button
                  onClick={() => navigate('/achievements')}
                  className="text-xs font-semibold text-blue-500 hover:underline bg-transparent border-none cursor-pointer"
                >
                  Ver todo
                </button>
              </div>
              {achievementsLoading ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center text-slate-400">
                  Cargando insignias...
                </div>
              ) : achievements.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {achievements.slice(0, 4).map((achievement) => (
                    <div
                      key={achievement._id}
                      className="group relative flex aspect-square items-center justify-center rounded-lg bg-slate-800 transition-all hover:bg-blue-600 hover:text-white cursor-pointer"
                      title={achievement.name}
                      onClick={() => navigate('/achievements')}
                    >
                      {achievement.icon ? (
                        achievement.icon.startsWith('http') || achievement.icon.startsWith('/') ? (
                          <img src={achievement.icon} alt={achievement.name} className="h-6 w-6 object-contain" />
                        ) : (
                          <span className="material-symbols-outlined text-lg">{achievement.icon}</span>
                        )
                      ) : (
                        <span className="material-symbols-outlined text-lg">emoji_events</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 text-center text-slate-400">
                  Aún no tienes logros desbloqueados.
                </div>
              )}
            </div>

            {/* User Statistics Widget */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Estadísticas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xl font-bold text-white">{formatCount(profile?.followers?.length ?? 0)}</p>
                  <p className="text-xs text-slate-400">Seguidores</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{formatCount(profile?.following?.length ?? 0)}</p>
                  <p className="text-xs text-slate-400">Siguiendo</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{statsLoading ? '…' : formatCount(stats.posts)}</p>
                  <p className="text-xs text-slate-400">Publicaciones</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{statsLoading ? '…' : formatCount(stats.stars)}</p>
                  <p className="text-xs text-slate-400">Stars Recibidas</p>
                </div>
              </div>
            </div>

          </aside>
        </div>
        
      </div>

      {/* Edit Profile Modal (Glassmorphic) */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl glass-card max-h-[90vh] flex flex-col">
            <header className="px-6 py-4 border-b border-slate-850 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-white">Editar Perfil</h2>
              <button 
                onClick={() => setIsEditing(false)} 
                className="size-8 rounded-full flex items-center justify-center hover:bg-slate-900 text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <form onSubmit={handleSaveChanges} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Pictures selectors */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-300">Imágenes de perfil</label>
                
                {/* Cover selection preview */}
                <div className="relative h-36 rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden flex items-center justify-center group">
                  {editForm.coverPicture ? (
                    <img src={editForm.coverPicture} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-slate-500">Sin foto de portada seleccionada</span>
                  )}
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition text-xs font-bold gap-2">
                    <span className="material-symbols-outlined">upload</span> Cambiar Portada
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileChange(e, 'coverPicture')} 
                      className="hidden" 
                    />
                  </label>
                </div>

                {/* Avatar selection preview */}
                <div className="flex items-center gap-4">
                  <div className="relative size-20 rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden flex items-center justify-center group shrink-0">
                    {editForm.profilePicture ? (
                      <img src={editForm.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-blue-600 flex items-center justify-center font-bold text-white text-2xl uppercase">
                        {editForm.username[0] || '?'}
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition text-[10px] font-bold text-center">
                      Subir
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileChange(e, 'profilePicture')} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Foto de perfil</p>
                    <p className="text-xs text-slate-500">Se recomienda una imagen cuadrada de hasta 2MB.</p>
                  </div>
                </div>
              </div>

              {/* Username Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Nombre de usuario</label>
                <input 
                  type="text" 
                  value={editForm.username} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white"
                  placeholder="Tu nombre de usuario"
                  required
                />
              </div>

              {/* Bio Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Biografía</label>
                <textarea 
                  value={editForm.bio} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white resize-none"
                  placeholder="Escribe algo sobre ti..."
                  rows="3"
                />
              </div>

              {/* Grid Location and Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">Ubicación</label>
                  <input 
                    type="text" 
                    value={editForm.location} 
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white"
                    placeholder="Ej. Madrid, España"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">Sitio Web</label>
                  <input 
                    type="text" 
                    value={editForm.website} 
                    onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white"
                    placeholder="Ej. miweb.com"
                  />
                </div>
              </div>

            </form>

            <footer className="px-6 py-4 border-t border-slate-850 flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white transition text-xs font-bold"
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={handleSaveChanges}
                className="px-6 py-2.5 rounded-2xl bg-white text-slate-950 hover:bg-slate-200 transition text-xs font-bold"
              >
                Guardar Cambios
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  )
}
