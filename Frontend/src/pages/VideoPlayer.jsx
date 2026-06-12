import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { apiService } from '../services/api'

export default function VideoPlayer() {
  const { type } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [videoUrl, setVideoUrl] = useState('')
  const [videoTitle, setVideoTitle] = useState('The Brutalist Movement: A Comprehensive Study')
  const [videoCreator, setVideoCreator] = useState('Concrete Aesthetics')
  const [videoDescription, setVideoDescription] = useState('Explorando contenido visual de alta calidad compartido en la comunidad de Realart.')
  const [videoUploadedAt, setVideoUploadedAt] = useState('')
  const [videoViews, setVideoViews] = useState('1.2M vistas')
  const [videoUploaderProfile, setVideoUploaderProfile] = useState(null)
  const [suggestedVideos, setSuggestedVideos] = useState([])
  const videoRef = useRef(null)
  const playerContainerRef = useRef(null)

  const formatFileSize = (bytes) => {
    if (!bytes || Number.isNaN(bytes)) return ''
    const units = ['B', 'KB', 'MB', 'GB']
    let size = Number(bytes)
    let unit = units.shift()

    while (size >= 1024 && units.length > 0) {
      size /= 1024
      unit = units.shift()
    }

    return `${size.toFixed(1)} ${unit}`
  }

  useEffect(() => {
    const loadMedia = async () => {
      if (!type) return

      const specialTypes = ['large', 'live', 'short', 'lapse']
      if (type === 'large') {
        try {
          const res = await apiService.getVideos()
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            const firstVideo = res.data[0]
            navigate(`/player/${firstVideo._id}`, { replace: true })
            return
          }

          setVideoStatus('No hay videos disponibles en este momento.')
          return
        } catch (err) {
          console.error('Error fetching videos for large player:', err)
          setVideoStatus(`Error al cargar los videos: ${err.message}`)
          return
        }
      }

      if (specialTypes.includes(type)) return

      try {
        const res = await apiService.getMedia(type)
        if (res.success && res.data) {
          const API_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.host}/api/v1`
          let mediaUrl = res.data.url

          if (mediaUrl.startsWith('/') && !import.meta.env.DEV) {
            const baseUrl = API_URL.replace(/\/api\/v1\/?$/, '')
            mediaUrl = `${baseUrl}${mediaUrl}`
          }

          setVideoUrl(mediaUrl)
          setVideoTitle(res.data.originalName || 'Video sin título')
          setVideoCreator(res.data.uploadedBy?.username || 'Usuario')
          setVideoUploaderProfile({
            username: res.data.uploadedBy?.username || 'Usuario',
            profilePicture: res.data.uploadedBy?.profilePicture || null,
          })
          setVideoDescription(
            res.data.description ||
            `${res.data.type?.charAt(0).toUpperCase() + res.data.type?.slice(1) || 'Video'} subido por ${res.data.uploadedBy?.username || 'Usuario'} • ${formatFileSize(res.data.size)}`
          )
          setVideoUploadedAt(
            res.data.uploadedAt
              ? new Date(res.data.uploadedAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : ''
          )
          setVideoViews(
            res.data.views
              ? `${res.data.views} vistas`
              : res.data.size
                ? `${formatFileSize(res.data.size)} • ${res.data.type || 'video'}`
                : '— vistas'
          )
          setLargeRating(res.data.ratingAverage || 0)
          setLargeRatingCount(res.data.ratingCount || (Array.isArray(res.data.comments) ? res.data.comments.length : 0))
          setLargeComments(
            Array.isArray(res.data.comments)
              ? res.data.comments.map((comment) => ({
                  id: comment._id,
                  name: comment.user?.username || 'Usuario',
                  text: comment.text,
                  stars: comment.stars ?? 5,
                  date: comment.createdAt
                    ? new Date(comment.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                      })
                    : 'Hace un momento',
                }))
              : []
          )
          setVideoStatus('Video cargado correctamente')
        }
      } catch (err) {
        console.error('Error fetching media:', err)
        setVideoStatus(`Error al cargar el video: ${err.message}`)
      }
    }

    loadMedia()
  }, [type, navigate])

  useEffect(() => {
    apiService.getVideos()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          const list = res.data
            .filter((video) => video._id !== type)
            .slice(0, 3)
            .map((video) => ({
              id: video._id,
              title: video.originalName || 'Video recomendado',
              creator: video.uploadedBy?.username || 'Usuario',
              views: video.views ? `${video.views} vistas` : '— vistas',
              time: video.uploadedAt
                ? new Date(video.uploadedAt).toLocaleDateString('es-ES', {
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Reciente',
            }))
          setSuggestedVideos(list)
        }
      })
      .catch((err) => {
        console.error('Error fetching suggested videos:', err)
      })
  }, [type])

  // --- Large Player State ---
  const [largePlaying, setLargePlaying] = useState(false)
  const [largeProgress, setLargeProgress] = useState(45) // percent
  const [largeVolume, setLargeVolume] = useState(75) // percent
  const [largeFollow, setLargeFollow] = useState(false)
  const [largeComments, setLargeComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [largeRating, setLargeRating] = useState(0)
  const [largeRatingCount, setLargeRatingCount] = useState(0)

  // --- Live Player State ---
  const [livePlaying, setLivePlaying] = useState(false)
  const [liveFollow, setLiveFollow] = useState(false)
  const [liveRating, setLiveRating] = useState(4.9)
  const [chatInput, setChatInput] = useState('')
  const [liveChat, setLiveChat] = useState([
    { id: 1, user: '@alex_j', msg: '¡Esta visualización es absolutamente increíble!' },
    { id: 2, user: '@martha_v', msg: 'Amo la vibra oscura de la escala de grises 🖤' },
    { id: 3, user: '@super_fan', msg: '¡Acabo de calificar con 5 estrellas! ¡Sigan así!' },
  ])

  // --- Short Player State ---
  const [shortPlaying, setShortPlaying] = useState(false)
  const [shortFollow, setShortFollow] = useState(false)
  const [shortLiked, setShortLiked] = useState(false)
  const [shortStars, setShortStars] = useState(12400)
  const [videoStatus, setVideoStatus] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isPipMode, setIsPipMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [savedToPlaylist, setSavedToPlaylist] = useState(false)
  const [recommendationOpen, setRecommendationOpen] = useState(false)
  const [liveStatus, setLiveStatus] = useState('')
  const [shortStatus, setShortStatus] = useState('')

  const chatContainerRef = useRef(null)

  // Auto scroll live chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [liveChat])

  const activeUser = user?.username 
    ? user.username.charAt(0).toUpperCase() + user.username.slice(1) 
    : 'Invitado'

  // Progress bar click
  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width
    setLargeProgress(Math.round(percent * 100))
    if (videoRef.current) {
      videoRef.current.currentTime = percent * (videoRef.current.duration || 0)
    }
  }

  // Volume bar click
  const handleVolumeClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)))
    setLargeVolume(percent)
    if (videoRef.current) {
      videoRef.current.volume = percent / 100
    }
  }

  const toggleLargePlay = () => {
    if (!videoRef.current) {
      setVideoStatus('Video no disponible para reproducir aún.')
      return
    }

    if (videoRef.current.paused) {
      videoRef.current.play().catch((err) => {
        console.error('No se pudo reproducir el video:', err)
        setVideoStatus('No se pudo reproducir el video. Revisa los permisos del navegador.')
      })
      setLargePlaying(true)
    } else {
      videoRef.current.pause()
      setLargePlaying(false)
    }
  }

  const handleSkipNext = () => {
    if (suggestedVideos.length > 0) {
      const nextVideo = suggestedVideos[0]
      navigate(`/player/${nextVideo.id}`)
      setVideoStatus(`Cargando ${nextVideo.title}...`)
    } else {
      navigate('/player/live')
      setVideoStatus('Cargando siguiente video...')
    }
  }

  const handleToggleSettings = () => {
    setSettingsOpen((open) => {
      const next = !open
      setVideoStatus(next ? 'Panel de ajustes abierto.' : 'Panel de ajustes cerrado.')
      return next
    })
  }

  const handleTogglePip = async () => {
    if (!videoRef.current || !document.pictureInPictureEnabled) {
      setVideoStatus('Picture-in-Picture no está disponible en este navegador.')
      return
    }

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
        setIsPipMode(false)
        setVideoStatus('Modo PIP desactivado.')
      } else {
        await videoRef.current.requestPictureInPicture()
        setIsPipMode(true)
        setVideoStatus('Modo PIP activado.')
      }
    } catch (err) {
      console.error('Error PIP:', err)
      setVideoStatus('No se pudo activar Picture-in-Picture.')
    }
  }

  const handleToggleFullscreen = async () => {
    if (!playerContainerRef.current) {
      setVideoStatus('No se pudo activar pantalla completa.')
      return
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        setIsFullscreen(false)
        setVideoStatus('Saliste de pantalla completa.')
      } else {
        await playerContainerRef.current.requestFullscreen()
        setIsFullscreen(true)
        setVideoStatus('Entrando a pantalla completa.')
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
      setVideoStatus('No se pudo cambiar a pantalla completa.')
    }
  }

  // Rate large video
  const handleRateLarge = async () => {
    const rating = parseFloat(prompt('Califica este video (1 - 5 estrellas):', '5'))
    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      setVideoStatus('La calificación no es válida. Usa un valor entre 1 y 5.')
      return
    }

    try {
      if (!user) {
        setVideoStatus('Debes iniciar sesión para calificar el video.')
        return
      }

      if (!type || type === 'large') {
        setVideoStatus('No se puede calificar este video en este momento.')
        return
      }

      const res = await apiService.rateMedia(type, { stars: rating })
      if (res.success && res.data) {
        setLargeRating(res.data.ratingAverage || rating)
        setLargeRatingCount(res.data.ratingCount || largeRatingCount)
        setVideoStatus(`Gracias por calificar el video con ${rating} estrellas.`)
      }
    } catch (err) {
      console.error('Error rating media:', err)
      setVideoStatus('Error al calificar el video. Intenta de nuevo más tarde.')
    }
  }

  // Send live chat message
  const handleSendLiveChat = () => {
    if (!chatInput.trim()) return
    const newChatMsg = {
      id: Date.now(),
      user: `@${user?.username || 'tú'}`,
      msg: chatInput.trim(),
    }
    setLiveChat((prev) => [...prev, newChatMsg])
    setChatInput('')
  }

  // Post large comment
  const handlePostComment = async () => {
    if (!newComment.trim()) return

    try {
      if (!user) {
        setVideoStatus('Debes iniciar sesión para comentar este video.')
        return
      }

      if (!type || type === 'large') {
        setVideoStatus('No se puede comentar este video en este momento.')
        return
      }

      const res = await apiService.createMediaComment(type, {
        text: newComment.trim(),
        stars: 5,
      })

      if (res.success && res.data) {
        setLargeComments(
          Array.isArray(res.data.comments)
            ? res.data.comments.map((comment) => ({
                id: comment._id,
                name: comment.user?.username || 'Usuario',
                text: comment.text,
                stars: comment.stars ?? 5,
                date: comment.createdAt
                  ? new Date(comment.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                    })
                  : 'Hace un momento',
              }))
            : []
        )
        setLargeRating(res.data.ratingAverage || largeRating)
        setLargeRatingCount(res.data.ratingCount || largeRatingCount)
        setNewComment('')
        setVideoStatus('Comentario agregado correctamente.')
      }
    } catch (err) {
      console.error('Error adding comment:', err)
      setVideoStatus('Error al enviar el comentario. Intenta nuevamente.')
    }
  }

  // Like short toggle
  const handleShortLike = () => {
    if (shortLiked) {
      setShortStars((prev) => prev - 1)
    } else {
      setShortStars((prev) => prev + 1)
    }
    setShortLiked(!shortLiked)
  }

  // RENDER: LARGE VIDEO PLAYER
  if (type === 'large' || (type !== 'live' && type !== 'short' && type !== 'lapse')) {
    return (
      <main className="flex-1 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 md:p-6 text-slate-100 min-h-screen">
        
        {/* Video Player & Left info */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Main Large Screen */}
          <div ref={playerContainerRef} className="relative group aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20">
              {videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  preload="metadata"
                  className="w-full h-full object-contain"
                  onClick={toggleLargePlay}
                  onTimeUpdate={() => {
                    if (videoRef.current) {
                      setLargeProgress((videoRef.current.currentTime / videoRef.current.duration) * 100 || 0)
                    }
                  }}
                  onError={(e) => {
                    console.error('Video playback error:', e)
                    setVideoStatus(`Error: No se pudo cargar el video desde ${videoUrl}`)
                  }}
                  controls={false}
                />
              ) : (
                <div className="w-full h-full bg-slate-900/50 flex flex-col items-center justify-center gap-4">
                  {videoStatus && videoStatus.includes('Error') ? (
                    <>
                      <div className="text-6xl">⚠️</div>
                      <div className="text-center text-slate-300">{videoStatus}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-8xl grayscale-img">🏢</div>
                      <div className="text-slate-300">Cargando video...</div>
                    </>
                  )}
                </div>
              )}
              <button
                onClick={toggleLargePlay}
                className="absolute size-20 rounded-full bg-blue-600/25 hover:bg-blue-600/40 backdrop-blur-md border border-blue-400/40 flex items-center justify-center text-white hover:scale-105 transition-transform"
              >
                <span className="material-symbols-outlined text-5xl font-fill">
                  {largePlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
            </div>
            
            {/* Player Controls overlay */}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent pt-16 flex flex-col gap-3">
              
              {/* Progress Slider */}
              <div
                onClick={handleProgressClick}
                className="relative h-1.5 w-full bg-white/20 rounded-full cursor-pointer group/progress"
              >
                <div
                  className="absolute h-full bg-blue-500 rounded-full transition-all duration-150"
                  style={{ width: `${largeProgress}%` }}
                ></div>
                <div
                  className="absolute size-3 bg-white rounded-full -top-[3px] shadow-lg pointer-events-none"
                  style={{ left: `${largeProgress}%`, transform: 'translateX(-50%)' }}
                ></div>
              </div>

              {/* Controls Interaction Buttons */}
              <div className="flex items-center justify-between text-slate-200">
                <div className="flex items-center gap-6">
                  <span
                    onClick={toggleLargePlay}
                    className="material-symbols-outlined cursor-pointer hover:text-white"
                  >
                    {largePlaying ? 'pause' : 'play_arrow'}
                  </span>
                  <span className="material-symbols-outlined cursor-pointer hover:text-white" onClick={() => { navigate('/player/live'); setVideoStatus('Cargando siguiente video...') }}>
                    skip_next
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined cursor-pointer hover:text-white">
                      {largeVolume === 0 ? 'volume_off' : 'volume_up'}
                    </span>
                    <div
                      onClick={handleVolumeClick}
                      className="w-16 h-1 bg-white/30 rounded-full cursor-pointer relative"
                    >
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${largeVolume}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-slate-400">
                    {videoRef.current?.currentTime ? new Date(videoRef.current.currentTime * 1000).toISOString().substr(14, 5) : '00:00'} / {videoRef.current?.duration ? new Date(videoRef.current.duration * 1000).toISOString().substr(14, 5) : '28:00'}
                  </span>
                </div>
                
                <div className="flex items-center gap-5">
                  <span className="material-symbols-outlined cursor-pointer hover:text-white" onClick={handleToggleSettings}>settings</span>
                  <span className="material-symbols-outlined cursor-pointer hover:text-white" onClick={handleTogglePip}>branding_watermark</span>
                  <span className="material-symbols-outlined cursor-pointer hover:text-white" onClick={handleToggleFullscreen}>fullscreen</span>
                </div>
              </div>
            </div>
          </div>

          {/* Video Metadata info */}
          <div className="flex flex-col gap-4 border-b border-slate-800 pb-5">
            <h1 className="text-2xl font-bold tracking-tight text-white">{videoTitle}</h1>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                <span>{videoViews}</span>
                <span className="size-1 rounded-full bg-slate-700"></span>
                <span>{videoUploadedAt || 'Fecha no disponible'}</span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  onClick={handleRateLarge}
                  className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-lg cursor-pointer hover:border-slate-700 transition"
                  title="Calificar Video"
                >
                  <span className="material-symbols-outlined text-sm font-fill text-yellow-500">star</span>
                  <span className="text-xs font-bold text-white">{largeRating}</span>
                  <span className="text-slate-500 text-[10px]">({largeRatingCount})</span>
                </div>
                <button
                  onClick={() => { navigator.clipboard?.writeText(window.location.href); setVideoStatus('Enlace copiado al portapapeles.') }}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  <span className="material-symbols-outlined text-sm">share</span> Compartir
                </button>
                <button
                  onClick={() => { setSavedToPlaylist(true); setVideoStatus('Video guardado en tu lista de reproducción.') }}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  <span className="material-symbols-outlined text-sm">playlist_add</span> Guardar
                </button>
              </div>
            </div>
            {videoStatus && (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-3 text-sm text-slate-200">
                {videoStatus}
              </div>
            )}
          </div>

          {settingsOpen && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-200 mb-4">
              <p className="font-semibold text-white">Ajustes del reproductor</p>
              <p className="text-slate-400 mt-2">Ajusta reproducción, volumen y visualización directamente desde el panel de control.</p>
            </div>
          )}

          {/* Creator Information banner */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center font-bold text-white text-lg uppercase">
                  {videoUploaderProfile?.profilePicture ? (
                    <img
                      src={videoUploaderProfile.profilePicture}
                      alt={videoCreator}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    videoCreator[0] || 'U'
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{videoCreator}</h3>
                  <p className="text-xs text-slate-400">
                    {videoUploaderProfile?.username
                      ? `Subido por ${videoUploaderProfile.username}`
                      : 'Creador en Realart'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLargeFollow(!largeFollow)}
                className={`px-5 py-2 text-xs font-bold rounded-lg transition ${
                  largeFollow 
                    ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750' 
                    : 'bg-white hover:bg-slate-200 text-slate-900'
                }`}
              >
                {largeFollow ? 'Siguiendo' : 'Seguir'}
              </button>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              {videoDescription}
            </p>
          </div>

          {/* Comments Section */}
          <div className="flex flex-col gap-6 mt-4">
            <h3 className="font-bold text-lg text-white">{largeComments.length} Comentarios</h3>
            
            {/* Add Comment input */}
            <div className="flex gap-4">
              <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shrink-0 uppercase select-none">
                {activeUser[0]}
              </div>
              <div className="flex-1 flex flex-col gap-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-800 focus:border-blue-500 border-x-0 border-t-0 ring-0 focus:ring-0 px-0 py-2 resize-none text-sm placeholder:text-slate-500 text-white"
                  placeholder="Añadir un comentario público..."
                  rows="2"
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setNewComment('')}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handlePostComment}
                    disabled={!newComment.trim()}
                    className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Comentar
                  </button>
                </div>
              </div>
            </div>

            {/* Comment list */}
            <div className="space-y-6 mt-2">
              {largeComments.map((comment) => (
                <div key={comment.id} className="flex gap-4 p-4 border border-slate-800 bg-slate-900/10 rounded-xl">
                  <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 uppercase shrink-0">
                    {comment.name[0]}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-200">{comment.name}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{comment.date}</span>
                    </div>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed">{comment.text}</p>
                    <div className="flex items-center gap-1 text-slate-400 mt-1">
                      <span className="material-symbols-outlined text-xs font-fill text-yellow-500">star</span>
                      <span className="text-[10px] font-bold text-slate-300">{comment.stars.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Suggested / Sidebar right */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          <h2 className="font-bold text-base text-white mb-2">Siguientes Videos</h2>
          <div className="flex flex-col gap-4">
            {(suggestedVideos.length > 0 ? suggestedVideos : [
              { id: '1', title: 'The Rise of Minimalist Megastructures', creator: 'Concrete Aesthetics', views: '890K', time: '2 meses' },
              { id: '2', title: 'Bauhaus Influence on Modern Living', creator: 'Design History', views: '1.5M', time: '6 meses' },
              { id: '3', title: 'Why Concrete is the Future of Sustainable Cities', creator: 'Urban Future', views: '230K', time: '1 semana' },
            ]).map((suggested) => (
              <div
                key={suggested.id}
                onClick={() => { setRecommendationOpen(true); setVideoStatus('Recomendación abierta.') }}
                className="flex gap-3 group cursor-pointer bg-slate-900/20 hover:bg-slate-900/40 p-2 rounded-lg border border-slate-900 transition"
              >
                <div className="w-32 aspect-video rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center text-2xl select-none">
                  🏢
                </div>
                <div className="flex flex-col gap-1 overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-200 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
                    {suggested.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">{suggested.creator}</p>
                  <p className="text-[9px] text-slate-500">{suggested.views} • {suggested.time}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </main>
    )
  }

  // RENDER: LIVE VIDEO PLAYER
  if (type === 'live') {
    return (
      <main className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row p-4 md:p-6 text-slate-100 min-h-screen gap-6">
        
        {/* Main stream player area */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="relative overflow-hidden rounded-xl bg-black border border-slate-800 shadow-2xl">
            <div className="aspect-video w-full bg-slate-900/80 flex items-center justify-center relative text-8xl grayscale-img">
              📻
              <button
                onClick={() => setLivePlaying(!livePlaying)}
                className="absolute size-20 rounded-full bg-red-600/20 hover:bg-red-600/40 backdrop-blur-md border border-red-500/40 flex items-center justify-center text-white transition-transform hover:scale-105"
              >
                <span className="material-symbols-outlined text-5xl font-fill">
                  {livePlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
              
              {/* Overlay Indicators */}
              <div className="absolute left-6 top-6 flex items-center gap-3">
                <span className="flex items-center gap-1.5 rounded bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white"></span> Live
                </span>
                <span className="rounded bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm border border-slate-800">
                  14,204 Espectadores
                </span>
              </div>
            </div>
            {/* Subtle beacon line */}
            <div className="h-1 w-full bg-slate-900 relative">
              <div className="h-full bg-red-600 w-3/4 absolute shadow-lg"></div>
            </div>
          </div>

          {/* Interactive Info Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold text-white">Midnight Sessions: Minimalist Soundscapes</h1>
              <p className="text-xs text-slate-400">Transmitido en vivo desde Tokyo Studio • 2 horas transcurridas</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
                <button
                  onClick={() => {
                    const rating = parseFloat(prompt('Califica este directo:', '5'))
                    if (!isNaN(rating)) {
                      setLiveRating(rating)
                      setLiveStatus(`Calificaste el directo con ${rating} estrellas.`)
                    }
                  }}
                  className="flex items-center gap-1 rounded px-3 py-1 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <span className="material-symbols-outlined text-sm font-fill text-yellow-500">star</span> Calificar
                </button>
                <div className="h-5 w-px bg-slate-800"></div>
                <span className="px-2 text-xs font-bold text-slate-200">{liveRating}</span>
              </div>
              <button
                onClick={() => { navigator.clipboard?.writeText(window.location.href); setLiveStatus('Enlace del directo copiado.') }}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
              >
                <span className="material-symbols-outlined text-lg">share</span>
              </button>
            </div>
          </div>

          {liveStatus && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-3 text-sm text-slate-200">
              {liveStatus}
            </div>
          )}

          {/* Creator Profile */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-lg">
                SM
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-200 flex items-center gap-1">
                  Studio Minimal
                  <span className="material-symbols-outlined text-sm font-fill text-blue-500">verified</span>
                </h3>
                <p className="text-xs text-slate-500">1.2M seguidores</p>
              </div>
            </div>
            
            <button
              onClick={() => setLiveFollow(!liveFollow)}
              className={`rounded-lg px-6 py-2 text-xs font-bold transition ${
                liveFollow 
                  ? 'bg-slate-800 text-slate-300 border border-slate-700' 
                  : 'bg-white hover:bg-slate-200 text-slate-900'
              }`}
            >
              {liveFollow ? 'Siguiendo' : 'Seguir'}
            </button>
          </div>
        </div>

        {/* Sidebar: Live Chat */}
        <aside className="w-full lg:w-80 flex flex-col border border-slate-800 bg-slate-900/20 rounded-xl h-[500px] lg:h-auto overflow-hidden shrink-0">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3.5 bg-slate-950/40">
            <h3 className="font-bold uppercase tracking-widest text-xs text-slate-400">Chat en Vivo</h3>
            <span className="material-symbols-outlined text-slate-500 cursor-pointer text-sm">settings</span>
          </div>
          
          {/* Scrollable chat body */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {liveChat.map((chat) => (
              <div key={chat.id} className="flex gap-2">
                <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase shrink-0">
                  {chat.user[1]}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500">{chat.user}</span>
                  <p className="text-xs text-slate-300">{chat.msg}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat input box */}
          <div className="border-t border-slate-800 p-4 bg-slate-950/40">
            <div className="flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') handleSendLiveChat() }}
                placeholder="Enviar un mensaje..."
                className="flex-1 border-none bg-transparent p-0 text-xs focus:ring-0 placeholder:text-slate-500 text-white"
              />
              <button onClick={handleSendLiveChat} className="material-symbols-outlined text-slate-400 hover:text-white text-base">
                send
              </button>
            </div>
          </div>
        </aside>
      </main>
    )
  }

  // RENDER: LAPSE PLAYER (VERTICAL IMMERSIVE)
  if (type === 'short' || type === 'lapse') {
    return (
      <main className="flex-1 flex items-center justify-center p-4 bg-bg-deep text-slate-100 min-h-screen">
        <div className="flex flex-row items-end gap-5">
          
          {/* Vertical Phone Screen Panel */}
          <div className="relative aspect-[9/16] w-72 md:w-80 h-[550px] md:h-[600px] bg-black border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-end group shrink-0">
            
            {/* Immersive overlay image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-center justify-center z-10">
              <div className="text-8xl select-none group-hover:scale-105 transition duration-500">🏙️</div>
            </div>

            {/* Hover Play Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <button
                onClick={() => setShortPlaying(!shortPlaying)}
                className="size-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white hover:scale-110 transition-transform"
              >
                <span className="material-symbols-outlined text-4xl font-fill">
                  {shortPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
            </div>

            {/* Left side Metadata info */}
            <div className="relative z-20 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs select-none">
                  MS
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-xs">@marcus_studio</span>
                    <button
                      onClick={() => setShortFollow(!shortFollow)}
                      className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-bold rounded"
                    >
                      {shortFollow ? 'Siguiendo' : 'Seguir'}
                    </button>
                  </div>
                  <span className="text-slate-400 text-[10px] font-medium">Creador Profesional</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-white text-xs leading-relaxed font-medium line-clamp-2">
                  Explorando la arquitectura minimalista en Berlín. El ángulo de la sombra es perfecto hoy... #minimalism #architecture #design
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-350">
                  <span className="material-symbols-outlined text-xs">music_note</span>
                  <span>Sonido Original - Marcus Studio</span>
                </div>
              </div>

              {/* Progress Line */}
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Right Action Sidebar Panel */}
          <div className="flex flex-col gap-4 pb-4">
            
            {/* Stars rating like */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={handleShortLike}
                className={`size-12 rounded-full flex items-center justify-center border transition-all duration-200 ${
                  shortLiked 
                    ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                <span className="material-symbols-outlined text-xl font-fill">star</span>
              </button>
              <span className="text-[10px] font-bold text-slate-500">{shortStars.toLocaleString()}</span>
            </div>

            {/* Comment chat button */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => { setShortStatus('Comentarios del Lapse abiertos.') }}
                className="size-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition"
              >
                <span className="material-symbols-outlined text-xl">chat_bubble</span>
              </button>
              <span className="text-[10px] font-bold text-slate-500">856</span>
            </div>

            {/* Share option */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => { navigator.clipboard?.writeText(window.location.href); setShortStatus('Lapse compartido.') }}
                className="size-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition"
              >
                <span className="material-symbols-outlined text-xl">share</span>
              </button>
              <span className="text-[10px] font-bold text-slate-500">2.1k</span>
            </div>

            {/* More action dot */}
            <button
              onClick={() => { setShortStatus('Abriendo más opciones del Lapse.') }}
              className="size-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition mt-2"
            >
              <span className="material-symbols-outlined text-xl">more_vert</span>
            </button>
          </div>
          {shortStatus && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-3 text-sm text-slate-200 mt-4">
              {shortStatus}
            </div>
          )}
        </div>
      </main>
    )
  }

  // Fallback
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-350 min-h-screen">
      <p className="text-lg">Tipo de reproductor no soportado o inválido.</p>
      <button onClick={() => navigate('/lapses')} className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
        Ir a Lapses
      </button>
    </div>
  )
}
