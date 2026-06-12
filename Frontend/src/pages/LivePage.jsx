import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useSocket } from '../context/SocketContext'

// ICE STUN servers (free Google servers)
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// HOST view: starts a live stream with camera + mic
// ──────────────────────────────────────────────────────────────────────────────
function LiveHost({ roomId, title, shareMode, onEnd }) {
  const { socketRef } = useSocket()
  const { user } = useAuth()
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const peersRef = useRef({}) // viewerId → RTCPeerConnection
  const captureStartedRef = useRef(false) // Flag para evitar múltiples solicitudes de permiso
  const [viewers, setViewers] = useState(0)
  const [camError, setCamError] = useState(null)
  const [isLive, setIsLive] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')

  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    const startCapture = async () => {
      try {
        const getUserMedia = navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices)
          || navigator.getUserMedia?.bind(navigator)
          || navigator.webkitGetUserMedia?.bind(navigator)
          || navigator.mozGetUserMedia?.bind(navigator)

        const getDisplayMedia = navigator.mediaDevices?.getDisplayMedia?.bind(navigator.mediaDevices)

        if (shareMode === 'screen' && !getDisplayMedia) {
          setCamError('No se pudo acceder a la pantalla: tu navegador no soporta getDisplayMedia o no estás en un contexto seguro (https).')
          return
        }

        if (shareMode === 'camera' && !getUserMedia) {
          setCamError('No se pudo acceder a la cámara/micrófono: tu navegador no soporta getUserMedia o no estás en un contexto seguro (https).')
          return
        }

        const stream = shareMode === 'screen'
          ? await getDisplayMedia({ video: true, audio: true })
          : await getUserMedia({ video: true, audio: true })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.muted = true // avoid echo
        }
        socket.emit('live:create', {
          roomId,
          title,
          host: user?.username || 'Anónimo',
        })
        setIsLive(true)
      } catch (err) {
        setCamError('No se pudo acceder a la cámara/micrófono: ' + err?.message)
      }
    }

    startCapture()

    // When a new viewer joins, create a peer connection and send offer
    const handleViewerJoined = async ({ viewerId }) => {
      setViewers((v) => v + 1)
      const pc = new RTCPeerConnection(ICE_SERVERS)
      peersRef.current[viewerId] = pc

      // Add local stream tracks
      streamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, streamRef.current)
      })

      // ICE candidate handling
      pc.onicecandidate = ({ candidate }) => {
        if (candidate) socket.emit('live:ice', { to: viewerId, candidate })
      }

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      socket.emit('live:offer', { to: viewerId, offer })
    }

    const handleAnswer = async ({ from, answer }) => {
      const pc = peersRef.current[from]
      if (pc && pc.signalingState !== 'stable') {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer))
        } catch (err) {
          console.error('Error setting remote description:', err)
        }
      }
    }

    const handleIce = async ({ from, candidate }) => {
      const pc = peersRef.current[from]
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate))
        } catch (err) {
          // Ignorar errores de candidatos duplicados
        }
      }
    }

    socket.on('live:viewer-joined', handleViewerJoined)
    socket.on('live:answer', handleAnswer)
    socket.on('live:ice', handleIce)

    return () => {
      socket.off('live:viewer-joined', handleViewerJoined)
      socket.off('live:answer', handleAnswer)
      socket.off('live:ice', handleIce)
    }
  }, [socketRef])

  const endStream = () => {
    const socket = socketRef.current
    socket?.emit('live:end', { roomId })
    streamRef.current?.getTracks().forEach((t) => t.stop())
    Object.values(peersRef.current).forEach((pc) => pc.close())
    peersRef.current = {}
    onEnd()
  }

  const sendChat = () => {
    if (!chatInput.trim()) return
    const msg = { user: `@${user?.username || 'tú'}`, msg: chatInput.trim(), id: Date.now() }
    setChatMessages((prev) => [...prev, msg])
    setChatInput('')
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl mx-auto p-4 min-h-screen text-slate-100">
      {/* Stream preview */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="relative rounded-xl overflow-hidden bg-black border border-red-900/50 shadow-2xl shadow-red-900/20">
          {camError ? (
            <div className="aspect-video flex items-center justify-center bg-slate-950 text-red-400 text-sm p-8 text-center">
              <div>
                <span className="material-symbols-outlined text-4xl block mb-3">videocam_off</span>
                {camError}
              </div>
            </div>
          ) : (
            <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover" />
          )}
          {/* Live badge */}
          {isLive && (
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-red-600 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> En Vivo
              </span>
              <span className="bg-black/60 px-3 py-1 rounded text-xs text-white backdrop-blur border border-slate-800">
                {viewers} espectadores
              </span>
            </div>
          )}
        </div>

        {/* Info bar */}
        <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div>
            <h1 className="font-bold text-lg text-white">{title}</h1>
            <p className="text-xs text-slate-400">
              Transmitiendo como @{user?.username} • {shareMode === 'screen' ? 'Compartiendo pantalla' : 'Cámara y micrófono'}
            </p>
          </div>
          <button
            onClick={endStream}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
          >
            <span className="material-symbols-outlined text-sm">stop_circle</span>
            Terminar
          </button>
        </div>
      </div>

      {/* Chat sidebar */}
      <div className="w-full lg:w-80 flex flex-col border border-slate-800 bg-slate-900/20 rounded-xl overflow-hidden h-[420px] lg:h-auto shrink-0">
        <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3 bg-slate-950/40">
          <span className="material-symbols-outlined text-red-500 text-sm">sensors</span>
          <h3 className="font-bold uppercase tracking-widest text-xs text-slate-400">Chat en Vivo</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatMessages.length === 0 && (
            <p className="text-xs text-slate-600 text-center mt-4">El chat está vacío. ¡Comparte el enlace!</p>
          )}
          {chatMessages.map((c) => (
            <div key={c.id} className="flex gap-2">
              <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-400 shrink-0 uppercase">
                {c.user[1]}
              </div>
              <div>
                <span className="text-[10px] font-bold text-red-400">{c.user}</span>
                <p className="text-xs text-slate-300">{c.msg}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 p-3 bg-slate-950/40">
          <div className="flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChat()}
              placeholder="Enviar mensaje..."
              className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
            <button onClick={sendChat} className="material-symbols-outlined text-slate-400 hover:text-white text-base">send</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// VIEWER view: watches the live stream
// ──────────────────────────────────────────────────────────────────────────────
function LiveViewer({ roomId, roomInfo }) {
  const { socketRef } = useSocket()
  const { user } = useAuth()
  const videoRef = useRef(null)
  const pcRef = useRef(null)
  const handlingOfferRef = useRef(false) // Flag para evitar múltiples ofertas simultáneas
  const [viewerCount, setViewerCount] = useState(roomInfo?.viewers || 0)
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: '@sistema', msg: 'Te uniste al directo 👋' },
  ])
  const [chatInput, setChatInput] = useState('')
  const [isEnded, setIsEnded] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    const pc = new RTCPeerConnection(ICE_SERVERS)
    pcRef.current = pc

    pc.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0]
      }
    }

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) socket.emit('live:ice', { to: socket.id, candidate })
    }

    const handleOffer = async ({ from, offer }) => {
      // Evitar procesar múltiples ofertas simultáneamente
      if (handlingOfferRef.current) return
      handlingOfferRef.current = true

      try {
        // Verificar estado antes de proceder
        if (pc.signalingState !== 'stable') {
          console.warn('WebRTC en estado no estable:', pc.signalingState)
          return
        }

        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        socket.emit('live:answer', { to: from, answer })
      } catch (err) {
        console.error('Error en handleOffer:', err)
      } finally {
        handlingOfferRef.current = false
      }
    }

    const handleIce = async ({ candidate }) => {
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate))
        } catch (err) {
          // Ignorar errores de candidatos duplicados
        }
      }
    }

    const handleEnded = () => setIsEnded(true)

    const handleRoomsList = (rooms) => {
      const room = rooms.find((r) => r.id === roomId)
      if (room) setViewerCount(room.viewers)
    }

    socket.on('live:offer', handleOffer)
    socket.on('live:ice', handleIce)
    socket.on('live:ended', handleEnded)
    socket.on('rooms:list', handleRoomsList)

    socket.emit('live:join', { roomId })

    return () => {
      socket.off('live:offer', handleOffer)
      socket.off('live:ice', handleIce)
      socket.off('live:ended', handleEnded)
      socket.off('rooms:list', handleRoomsList)
      pc.close()
    }
  }, [roomId, socketRef])

  const sendChat = () => {
    if (!chatInput.trim()) return
    const msg = { user: `@${user?.username || 'espectador'}`, msg: chatInput.trim(), id: Date.now() }
    setChatMessages((prev) => [...prev, msg])
    setChatInput('')
  }

  if (isEnded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-300 gap-6 p-8">
        <span className="material-symbols-outlined text-6xl text-red-500">sensors_off</span>
        <h2 className="text-2xl font-bold text-white">El directo ha terminado</h2>
        <p className="text-slate-400 text-sm">El streamer ha finalizado la transmisión.</p>
        <button
          onClick={() => navigate('/lapses')}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition"
        >
          Volver a Lapses
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl mx-auto p-4 min-h-screen text-slate-100">
      <div className="flex-1 flex flex-col gap-4">
        <div className="relative rounded-xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
          <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover bg-slate-950" />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-red-600 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider text-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> En Vivo
            </span>
            <span className="bg-black/60 px-3 py-1 rounded text-xs text-white backdrop-blur border border-slate-800">
              {viewerCount} espectadores
            </span>
          </div>
          {/* Waiting overlay if no video yet */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 text-slate-400 text-sm pointer-events-none opacity-0 [video:not([src])~&]:opacity-100">
            <span className="material-symbols-outlined text-4xl animate-pulse mb-2">sensors</span>
            Conectando al stream...
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <h1 className="font-bold text-lg text-white">{roomInfo?.title || 'Directo en vivo'}</h1>
          <p className="text-xs text-slate-400">Por @{roomInfo?.host} • {viewerCount} viendo ahora</p>
        </div>
      </div>

      {/* Chat */}
      <div className="w-full lg:w-80 flex flex-col border border-slate-800 bg-slate-900/20 rounded-xl overflow-hidden h-[420px] lg:h-auto shrink-0">
        <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3 bg-slate-950/40">
          <span className="material-symbols-outlined text-red-500 text-sm">sensors</span>
          <h3 className="font-bold uppercase tracking-widest text-xs text-slate-400">Chat en Vivo</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatMessages.map((c) => (
            <div key={c.id} className="flex gap-2">
              <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-400 shrink-0 uppercase">
                {c.user[1]}
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-400">{c.user}</span>
                <p className="text-xs text-slate-300">{c.msg}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 p-3 bg-slate-950/40">
          <div className="flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChat()}
              placeholder="Enviar mensaje..."
              className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
            <button onClick={sendChat} className="material-symbols-outlined text-slate-400 hover:text-white text-base">send</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Main LivePage: decides host vs viewer based on URL params
// ──────────────────────────────────────────────────────────────────────────────
export default function LivePage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { liveRooms } = useSocket()

  // If roomId === 'new', show the "start stream" form
  const [mode, setMode] = useState(roomId === 'new' ? 'setup' : 'viewer')
  const [streamTitle, setStreamTitle] = useState('')
  const [generatedRoomId, setGeneratedRoomId] = useState(null)
  const [shareMode, setShareMode] = useState('camera')

  const roomInfo = liveRooms.find((r) => r.id === (generatedRoomId || roomId))

  if (mode === 'setup') {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen text-slate-100 p-8 gap-8">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-red-500 text-3xl">sensors</span>
            <h1 className="text-2xl font-bold text-white">Iniciar Directo</h1>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Título del directo</label>
              <input
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                placeholder="¿Sobre qué va tu directo?"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 placeholder:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 cursor-pointer">
                <input
                  type="radio"
                  name="shareMode"
                  value="camera"
                  checked={shareMode === 'camera'}
                  onChange={() => setShareMode('camera')}
                  className="accent-red-500"
                />
                <span>
                  Cámara + micrófono
                </span>
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 cursor-pointer">
                <input
                  type="radio"
                  name="shareMode"
                  value="screen"
                  checked={shareMode === 'screen'}
                  onChange={() => setShareMode('screen')}
                  className="accent-red-500"
                />
                <span>
                  Compartir pantalla
                </span>
              </label>
            </div>

            <p className="text-xs text-slate-500">
              {shareMode === 'screen'
                ? 'Compartirás la pantalla con el directo. El navegador te pedirá permisos para capturar la pantalla.'
                : 'Se usará tu cámara y micrófono. Asegúrate de haber dado permisos al navegador.'}
            </p>

            <button
              disabled={!streamTitle.trim()}
              onClick={() => {
                const newRoomId = `${user?.username || 'user'}-${Date.now()}`
                setGeneratedRoomId(newRoomId)
                setMode('host')
              }}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition"
            >
              <span className="material-symbols-outlined text-sm">{shareMode === 'screen' ? 'screenshare' : 'videocam'}</span>
              {shareMode === 'screen' ? 'Iniciar transmisión de pantalla' : 'Iniciar transmisión'}
            </button>

            <button
              onClick={() => navigate('/lapses')}
              className="w-full py-2 text-slate-400 hover:text-white text-xs transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (mode === 'host' && generatedRoomId) {
    return (
      <main className="min-h-screen">
        <LiveHost
          roomId={generatedRoomId}
          title={streamTitle}
          shareMode={shareMode}
          onEnd={() => navigate('/lapses')}
        />
      </main>
    )
  }

  // Viewer mode
  return (
    <main className="min-h-screen">
      <LiveViewer roomId={roomId} roomInfo={roomInfo} />
    </main>
  )
}
