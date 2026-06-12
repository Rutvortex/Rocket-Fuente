import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import { useSocket } from '../context/SocketContext'

const API_BASE = (import.meta.env.VITE_API_URL || '/api/v1').replace('/api/v1', '')

export default function LapsesSection() {
  const navigate = useNavigate()
  const { liveRooms } = useSocket()

  const [videos, setVideos] = useState([])
  const [loadingVideos, setLoadingVideos] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadingProgress, setUploadingProgress] = useState(false)
  const [videoFile, setVideoFile] = useState(null)
  const [videoTitle, setVideoTitle] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [statusType, setStatusType] = useState('success')
  const [filterMode, setFilterMode] = useState('recommended')
  const [hoveredId, setHoveredId] = useState(null)
  const videoPreviewRefs = useRef({})

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoadingVideos(true)
      const res = await apiService.getVideos()
      if (res.success && res.data) {
        setVideos(res.data)
      }
    } catch (err) {
      console.error('Error fetching lapses:', err)
    } finally {
      setLoadingVideos(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        setStatusMessage('El archivo es demasiado grande. El límite es de 500MB.')
        setStatusType('error')
        return
      }
      setVideoFile(file)
      if (!videoTitle) {
        setVideoTitle(file.name.substring(0, file.name.lastIndexOf('.')) || file.name)
      }
    }
  }

  const handleUploadVideo = async (e) => {
    e.preventDefault()
    if (!videoFile) {
      setStatusMessage('Por favor selecciona un archivo de video.')
      setStatusType('error')
      return
    }
    setStatusMessage('')
    setUploadingProgress(true)
    const formData = new FormData()
    formData.append('file', videoFile)
    try {
      const res = await apiService.uploadMedia(formData)
      if (res.success) {
        setStatusMessage('¡Lapse subido con éxito! Ya está disponible en la comunidad.')
        setStatusType('success')
        setVideoFile(null)
        setVideoTitle('')
        setIsUploading(false)
        fetchVideos()
      }
    } catch (error) {
      setStatusMessage(error.response?.data?.message || 'Error al subir el lapse.')
      setStatusType('error')
    } finally {
      setUploadingProgress(false)
    }
  }

  // Hover preview for trending lapses cards
  const handleCardHover = (id) => {
    setHoveredId(id)
    const vid = videoPreviewRefs.current[id]
    if (vid) {
      vid.currentTime = 0
      vid.play().catch(() => {})
    }
  }

  const handleCardLeave = (id) => {
    setHoveredId(null)
    const vid = videoPreviewRefs.current[id]
    if (vid) {
      vid.pause()
      vid.currentTime = 0
    }
  }

  // Split: first 5 videos shown as trending lapses, rest in community section
  const trendingLapses = videos.slice(0, 5)
  const communityVideos = filterMode === 'recommended' ? videos : videos.slice().reverse()

  return (
    <main className="flex-1 max-w-7xl mx-auto p-4 md:p-6 text-slate-100 min-h-screen">
      <div className="flex flex-col gap-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-blue-500 font-fill">timelapse</span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Lapses</h1>
              <p className="text-xs text-slate-500 mt-0.5">Videos cortos de la comunidad</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/live/new')}
              className="rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 flex items-center gap-2 shadow-lg shadow-red-900/30 transition"
            >
              <span className="material-symbols-outlined text-sm font-fill">sensors</span>
              Iniciar Directo
            </button>
            <button
              onClick={() => setIsUploading(true)}
              className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 flex items-center gap-2 shadow-lg shadow-blue-900/20 transition"
            >
              <span className="material-symbols-outlined text-sm font-fill">upload</span>
              Subir Lapse
            </button>
            <div className="relative w-full sm:w-60">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
              <input
                type="text"
                className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-500 text-white"
                placeholder="Buscar creadores o temas..."
              />
            </div>
          </div>
        </div>

        {/* ── Status toast ── */}
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

        {/* ── Upload Modal ── */}
        {isUploading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Subir Lapse</h2>
                <button
                  onClick={() => { setIsUploading(false); setVideoFile(null); setVideoTitle('') }}
                  className="size-8 rounded-full flex items-center justify-center hover:bg-slate-900 text-slate-400 hover:text-white"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </header>

              <form onSubmit={handleUploadVideo} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">Archivo de video</label>
                  <div className="border border-dashed border-slate-800 rounded-2xl p-6 text-center bg-slate-900/20 hover:border-slate-700 transition cursor-pointer relative">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <span className="material-symbols-outlined text-3xl text-slate-500 mb-2">upload_file</span>
                    <p className="text-xs text-slate-400">
                      {videoFile ? `Seleccionado: ${videoFile.name}` : 'Arrastra tu video aquí o haz clic para buscar'}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1">Límite: 500MB · MP4 recomendado</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">Título del lapse</label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                    placeholder="Título descriptivo del lapse"
                    required
                  />
                </div>

                {uploadingProgress && (
                  <div className="text-xs text-blue-400 text-center animate-pulse">
                    Subiendo lapse... Por favor no cierres esta ventana.
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setIsUploading(false); setVideoFile(null); setVideoTitle('') }}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition"
                    disabled={uploadingProgress}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-white text-slate-950 text-xs font-semibold hover:bg-slate-200 transition disabled:opacity-50"
                    disabled={uploadingProgress || !videoFile}
                  >
                    Subir
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Trending Lapses carousel (videos reales) ── */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-500 font-fill">bolt</span>
              <h2 className="text-lg font-bold text-white">Trending Lapses</h2>
              {trendingLapses.length > 0 && (
                <span className="text-[10px] bg-yellow-500/15 text-yellow-400 font-bold px-2 py-0.5 rounded-full border border-yellow-500/20">
                  {trendingLapses.length} en tendencia
                </span>
              )}
            </div>
          </div>

          {loadingVideos ? (
            <div className="flex gap-4 overflow-x-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-none w-52 md:w-56">
                  <div className="aspect-[9/16] rounded-xl bg-slate-900 border border-slate-800 animate-pulse" />
                  <div className="h-4 bg-slate-800 rounded mt-3 w-3/4 animate-pulse" />
                  <div className="h-3 bg-slate-900 rounded mt-2 w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          ) : trendingLapses.length === 0 ? (
            <div className="flex items-center gap-3 p-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
              <span className="material-symbols-outlined text-2xl">video_library</span>
              <span>Aún no hay lapses. ¡Sé el primero en subir uno!</span>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
              {trendingLapses.map((video) => {
                const videoUrl = `${API_BASE}${video.url}`
                const isHovered = hoveredId === video._id
                return (
                  <div
                    key={video._id}
                    onClick={() => navigate(`/player/${video._id}`)}
                    onMouseEnter={() => handleCardHover(video._id)}
                    onMouseLeave={() => handleCardLeave(video._id)}
                    className="flex-none w-52 md:w-56 group cursor-pointer"
                  >
                    <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 mb-3">
                      {/* Real video preview */}
                      <video
                        ref={(el) => { if (el) videoPreviewRefs.current[video._id] = el }}
                        src={videoUrl}
                        className="absolute inset-0 w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 z-10" />

                      {/* Bottom stats */}
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end z-20">
                        <div className="flex items-center gap-1 text-yellow-400">
                          <span className="material-symbols-outlined text-xs font-fill">star</span>
                          <span className="text-[11px] font-bold text-slate-200">{(video.size / (1024 * 1024)).toFixed(1)}MB</span>
                        </div>
                        <span className="text-[9px] text-slate-300 font-bold bg-black/50 px-1.5 py-0.5 rounded">
                          @{video.uploadedBy?.username || 'usuario'}
                        </span>
                      </div>

                      {/* Play button on hover */}
                      <div className={`absolute inset-0 flex items-center justify-center z-20 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="size-12 rounded-full bg-blue-600/90 flex items-center justify-center text-white border border-blue-400 shadow-lg shadow-blue-500/30">
                          <span className="material-symbols-outlined text-2xl font-fill">play_arrow</span>
                        </div>
                      </div>
                    </div>

                    <h3 className="font-semibold text-sm text-slate-200 line-clamp-1 group-hover:text-blue-400 transition-colors">
                      {video.originalName?.replace(/\.[^.]+$/, '') || 'Lapse sin título'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(video.createdAt).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Community videos + Live sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main: Community Lapses */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">explore</span>
                <h2 className="text-lg font-bold text-white">Lapses de la Comunidad</h2>
              </div>
              <div className="flex gap-2">
                {['recommended', 'recent'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      filterMode === mode
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/25'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode === 'recommended' ? 'Todos' : 'Recientes'}
                  </button>
                ))}
              </div>
            </div>

            {loadingVideos ? (
              <div className="text-center rounded-3xl border border-slate-800 bg-slate-900/40 p-8 text-slate-500">
                Cargando lapses de la comunidad...
              </div>
            ) : communityVideos.length === 0 ? (
              <div className="text-center rounded-3xl border border-slate-800 bg-slate-900/40 p-8 text-slate-500">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-600 block">timelapse</span>
                <p className="font-semibold text-slate-400">No hay lapses disponibles aún.</p>
                <p className="text-xs text-slate-500 mt-1">¡Sé el primero en subir uno!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {communityVideos.map((video) => {
                  const videoUrl = `${API_BASE}${video.url}`
                  return (
                    <div
                      key={video._id}
                      onClick={() => navigate(`/player/${video._id}`)}
                      className="group cursor-pointer bg-slate-900/30 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row gap-4 hover:border-slate-700 transition duration-200"
                    >
                      <div className="relative aspect-video w-full sm:w-56 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden shrink-0">
                        <video
                          src={videoUrl}
                          className="w-full h-full object-cover"
                          muted
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <span className="material-symbols-outlined text-white text-5xl font-fill">play_circle</span>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between grow">
                        <div>
                          <h3 className="font-bold text-base text-slate-200 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
                            {video.originalName?.replace(/\.[^.]+$/, '') || 'Lapse sin título'}
                          </h3>
                          <p className="text-xs text-slate-400 mt-2 font-medium">
                            Por @{video.uploadedBy?.username || 'Usuario'}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-4 font-semibold">
                          {new Date(video.createdAt).toLocaleDateString()} · {(video.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar: Live Streams */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">sensors</span>
                <h2 className="text-lg font-bold text-white">Directos en Vivo</h2>
              </div>
              {liveRooms.length > 0 && (
                <span className="text-[10px] bg-red-500/15 text-red-400 font-bold px-2 py-0.5 rounded-full border border-red-500/20 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                  {liveRooms.length} en vivo
                </span>
              )}
            </div>

            <div className="space-y-4">
              {liveRooms.length === 0 ? (
                <div className="p-5 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 text-xs">
                  <span className="material-symbols-outlined text-2xl block mb-2 text-slate-700">sensors_off</span>
                  No hay directos activos en este momento.
                  <button
                    onClick={() => navigate('/live/new')}
                    className="mt-3 block w-full py-2 border border-slate-700 rounded-lg hover:border-red-500 hover:text-red-400 transition font-semibold text-slate-400"
                  >
                    ¡Inicia el primero!
                  </button>
                </div>
              ) : (
                liveRooms.map((live) => (
                  <div
                    key={live.id}
                    onClick={() => navigate(`/live/${live.id}`)}
                    className="p-4 border border-slate-800 bg-slate-900/30 rounded-xl hover:border-red-900/50 transition duration-200 cursor-pointer flex flex-col gap-3 group"
                  >
                    <div className="relative rounded-lg bg-slate-950 aspect-video flex items-center justify-center border border-slate-800 overflow-hidden">
                      <span className="material-symbols-outlined text-4xl text-slate-700 group-hover:text-slate-600 transition">sensors</span>
                      <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded flex items-center gap-1 uppercase tracking-wider">
                        <span className="size-1.5 rounded-full bg-white animate-pulse" /> En Vivo
                      </div>
                      <div className="absolute bottom-2 left-2 text-[10px] text-white bg-black/60 px-2 py-0.5 rounded font-bold">
                        {live.viewers} viendo
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200 group-hover:text-red-400 transition-colors line-clamp-1">
                        {live.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">@{live.host}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => navigate('/live/new')}
              className="w-full py-3 border border-dashed border-slate-800 rounded-xl text-slate-400 hover:text-red-400 hover:border-red-800 transition text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              Iniciar nuevo directo
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
