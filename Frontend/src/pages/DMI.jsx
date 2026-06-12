import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/useAuth'
import { useSocket } from '../context/SocketContext'
import { apiService } from '../services/api'

export default function DMI() {
  const { user } = useAuth()
  const [activeView, setActiveView] = useState('explore') // 'explore' | 'create' | 'chat'
  const [selectedGroup, setSelectedGroup] = useState(null)
  
  // Lists
  const [joinedGroups, setJoinedGroups] = useState([])
  const [exploreGroups, setExploreGroups] = useState([])
  const [messages, setMessages] = useState([])
  
  // Loaders
  const [loadingJoined, setLoadingJoined] = useState(true)
  const [loadingExplore, setLoadingExplore] = useState(true)
  const [loadingChat, setLoadingChat] = useState(false)
  
  // Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    isPrivate: false,
    category: 'Otro',
    memberLimit: 0,
    audienceType: 'Normal',
    regionConstraint: 'Mundial'
  })

  // Chat Input
  const [chatText, setChatText] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [statusType, setStatusType] = useState('success')

  const { socketRef } = useSocket()

  const messagesEndRef = useRef(null)

  // Determine if active user is Child (Infantil)
  const isChildAccount = user?.subType === 'Infantil'

  useEffect(() => {
    fetchJoinedGroups()
    fetchExploreGroups()
  }, [])

  useEffect(() => {
    if (activeView === 'chat' && selectedGroup) {
      fetchChatMessages(selectedGroup._id)
      // Join socket room for real-time updates
      const socket = socketRef?.current
      if (socket) {
        socket.emit('group:join', { groupId: selectedGroup._id })
      }

      const interval = setInterval(() => {
        fetchChatMessages(selectedGroup._id, true)
      }, 5000) // Poll messages every 5 seconds

      return () => {
        clearInterval(interval)
        try { socketRef?.current?.emit('group:leave', { groupId: selectedGroup._id }) } catch (e) {}
      }
    }
  }, [activeView, selectedGroup])

  useEffect(() => {
    if (activeView === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Real-time listener for incoming group messages
  useEffect(() => {
    const socket = socketRef?.current
    if (!socket) return

    const handleRealtime = (msg) => {
      const msgGroupId = msg.group?._id || msg.group || null
      if (selectedGroup && msgGroupId && msgGroupId.toString() === selectedGroup._id.toString()) {
        setMessages((prev) => [...prev, msg])
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }

    socket.on('group:message', handleRealtime)
    return () => socket.off('group:message', handleRealtime)
  }, [socketRef, selectedGroup])

  const fetchJoinedGroups = async () => {
    try {
      setLoadingJoined(true)
      const res = await apiService.getGroups(true)
      if (res.success && res.data) {
        setJoinedGroups(res.data)
      }
    } catch (err) {
      console.error('Error fetching joined groups:', err)
    } finally {
      setLoadingJoined(false)
    }
  }

  const fetchExploreGroups = async () => {
    try {
      setLoadingExplore(true)
      const res = await apiService.getGroups(false)
      if (res.success && res.data) {
        setExploreGroups(res.data)
      }
    } catch (err) {
      console.error('Error fetching explore groups:', err)
    } finally {
      setLoadingExplore(false)
    }
  }

  const fetchChatMessages = async (groupId, silent = false) => {
    try {
      if (!silent) setLoadingChat(true)
      const res = await apiService.getGroupMessages(groupId)
      if (res.success && res.data) {
        setMessages(res.data)
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    } finally {
      if (!silent) setLoadingChat(false)
    }
  }

  const handleSelectGroup = (group) => {
    // Leave previous group's socket room
    try {
      const socket = socketRef?.current
      if (socket && selectedGroup && selectedGroup._id) {
        socket.emit('group:leave', { groupId: selectedGroup._id })
      }
    } catch (e) {}

    setSelectedGroup(group)
    setActiveView('chat')
    setMessages([])
  }

  const handleJoinGroup = async (groupId) => {
    try {
      const res = await apiService.joinGroup(groupId)
      if (res.success) {
        setStatusMessage('¡Te has unido a la comunidad con éxito!')
        setStatusType('success')
        fetchJoinedGroups()
        fetchExploreGroups()
        // Automatically switch to the joined community chat
        const groupObj = exploreGroups.find(g => g._id === groupId)
        if (groupObj) {
          handleSelectGroup(groupObj)
        }
      }
    } catch (err) {
      console.error('Error joining group:', err)
      setStatusMessage(err.response?.data?.message || 'Error al unirse a la comunidad.')
      setStatusType('error')
    }
  }

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    if (isChildAccount) {
      setStatusMessage('Las cuentas infantiles no pueden crear comunidades.')
      setStatusType('error')
      return
    }

    try {
      const res = await apiService.createGroup(createForm)
      if (res.success && res.data) {
        setStatusMessage('¡Comunidad creada con éxito!')
        setStatusType('success')
        setCreateForm({
          name: '',
          description: '',
          isPrivate: false,
          category: 'Otro',
          memberLimit: 0,
          audienceType: 'Normal',
          regionConstraint: 'Mundial'
        })
        await fetchJoinedGroups()
        handleSelectGroup(res.data)
      }
    } catch (err) {
      console.error('Error creating group:', err)
      setStatusMessage(err.response?.data?.message || 'Error al crear la comunidad.')
      setStatusType('error')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!chatText.trim() || !selectedGroup) return

    try {
      const res = await apiService.sendGroupMessage(selectedGroup._id, { text: chatText.trim() })
      if (res.success) {
        setChatText('')
        // If socket is connected, the real-time event will append the message.
        // Otherwise, fallback to fetching messages once.
        if (!socketRef?.current) {
          fetchChatMessages(selectedGroup._id, true)
        }
      }
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-2rem)] my-4 mr-4 rounded-3xl border border-slate-800/80 bg-slate-900/30 backdrop-blur-md overflow-hidden text-slate-100 shadow-2xl">
      
      {/* 1. Left Communities Sidebar */}
      <aside className="w-full md:w-64 flex flex-col bg-slate-950/40 border-r border-slate-900/60 shrink-0 select-none">
        <header className="h-14 px-4 flex items-center justify-between border-b border-slate-900/60">
          <span className="font-bold text-sm text-white uppercase tracking-wider">Comunidades</span>
          <span className="material-symbols-outlined text-slate-500">groups</span>
        </header>

        {/* Action Options */}
        <div className="p-3 space-y-1">
          <button 
            onClick={() => { setActiveView('explore'); setSelectedGroup(null) }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition ${
              activeView === 'explore' 
                ? 'bg-blue-600 text-white' 
                : 'bg-transparent text-slate-400 hover:bg-slate-900/50 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-lg">explore</span>
            <span>El Mundo (Explorar)</span>
          </button>
          
          <button 
            onClick={() => { setActiveView('create'); setSelectedGroup(null) }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition ${
              activeView === 'create' 
                ? 'bg-blue-600 text-white' 
                : 'bg-transparent text-slate-400 hover:bg-slate-900/50 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-lg">add_box</span>
            <span>Crear Comunidad</span>
          </button>
        </div>

        <div className="w-full h-px bg-slate-900/60"></div>

        {/* Joined Communities List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
          <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider px-3 mb-2">Mis Comunidades</p>
          
          {loadingJoined ? (
            <p className="text-xs text-slate-600 px-3 py-2">Cargando...</p>
          ) : joinedGroups.length === 0 ? (
            <p className="text-xs text-slate-500 px-3 py-2">Aún no te has unido a ninguna comunidad.</p>
          ) : (
            <div className="space-y-1">
              {joinedGroups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => handleSelectGroup(group)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold text-left transition ${
                    activeView === 'chat' && selectedGroup?._id === group._id
                      ? 'bg-slate-800/80 text-white border border-slate-700/50'
                      : 'bg-transparent text-slate-400 hover:bg-slate-900/30 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg text-blue-500">forum</span>
                  <span className="truncate">{group.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* 2. Main Work Area */}
      <main className="flex-1 flex flex-col bg-transparent min-w-0">
        
        {/* Status Message */}
        {statusMessage && (
          <div className={`m-4 rounded-2xl border px-4 py-3 text-xs flex items-center justify-between ${
            statusType === 'success' 
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200' 
              : 'border-red-500 bg-red-500/10 text-red-200'
          }`}>
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage('')} className="material-symbols-outlined text-sm">close</button>
          </div>
        )}

        {/* VIEW: EXPLORE PUBLIC COMMUNITIES ("EL MUNDO") */}
        {activeView === 'explore' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Explorar</p>
              <h2 className="text-2xl font-bold text-white">El Mundo</h2>
              <p className="text-xs text-slate-400 mt-1">Descubre comunidades públicas creadas por otros usuarios en Realart y únete a la conversación.</p>
            </div>

            {loadingExplore ? (
              <div className="text-center py-12 text-slate-500">Cargando comunidades del mundo...</div>
            ) : exploreGroups.length === 0 ? (
              <div className="text-center py-12 rounded-3xl border border-slate-800 bg-slate-900/20 text-slate-500">
                <span className="material-symbols-outlined text-4xl text-slate-755 mb-2 block">public</span>
                <p>No hay comunidades públicas creadas en el mundo todavía.</p>
                {!isChildAccount && <p className="text-xs text-slate-600 mt-1">¡Ve a "Crear Comunidad" para registrar la primera!</p>}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exploreGroups.map((group) => {
                  const isAlreadyMember = joinedGroups.some(jg => jg._id === group._id)
                  return (
                    <div key={group._id} className="rounded-2xl border border-slate-800 bg-slate-900/20 p-5 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-base text-white truncate">{group.name}</h3>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-400 border border-blue-600/20">
                            {group.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                          {group.description || 'Sin descripción disponible.'}
                        </p>
                        
                        {/* Meta features */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-750">
                            Público
                          </span>
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-750">
                            Audiencia: {group.audienceType || 'Normal'}
                          </span>
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-750">
                            Alcance: {group.regionConstraint || 'Mundial'}
                          </span>
                          {group.memberLimit > 0 && (
                            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-750">
                              Límite: {group.memberLimit} miembros
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-900/60 pt-3">
                        <span className="text-[10px] text-slate-500">
                          Creado por: @{group.creator?.username || 'Usuario'}
                        </span>
                        <button
                          onClick={() => handleJoinGroup(group._id)}
                          disabled={isAlreadyMember}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                            isAlreadyMember 
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                              : 'bg-white hover:bg-slate-200 text-slate-950 shadow-md'
                          }`}
                        >
                          {isAlreadyMember ? 'Unido' : 'Unirse'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW: CREATE COMMUNITY */}
        {activeView === 'create' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 max-w-2xl">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Configuración</p>
              <h2 className="text-2xl font-bold text-white">Crear Comunidad</h2>
              <p className="text-xs text-slate-400 mt-1">Configura y registra un nuevo espacio para interactuar en la comunidad.</p>
            </div>

            {isChildAccount ? (
              <div className="rounded-3xl border border-amber-500 bg-amber-500/10 p-6 text-sm text-amber-250 flex items-start gap-4">
                <span className="material-symbols-outlined text-3xl font-fill">warning</span>
                <div>
                  <h4 className="font-bold text-base mb-1">Cuentas Infantiles Restringidas</h4>
                  <p className="leading-relaxed">Las cuentas infantiles de Realart tienen restringida la creación de comunidades por motivos de seguridad. Puedes explorar comunidades del mundo y participar en los canales públicos aprobados.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateGroup} className="space-y-6 rounded-3xl border border-slate-800/80 bg-slate-900/20 p-6">
                
                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-350">Nombre de la comunidad</label>
                  <input 
                    type="text" 
                    value={createForm.name} 
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white"
                    placeholder="Ej. Desarrolladores React"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-350">Descripción</label>
                  <textarea 
                    value={createForm.description} 
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white resize-none"
                    placeholder="Describe los temas y reglas de tu comunidad..."
                    rows="3"
                  />
                </div>

                {/* Grid inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-355">Categoría temática</label>
                    <select 
                      value={createForm.category} 
                      onChange={(e) => setCreateForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white"
                    >
                      {['Arte', 'Música', 'Fotografía', 'Diseño', 'Otro'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Member Limit */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-355">Límite de miembros (0 = sin límite)</label>
                    <input 
                      type="number" 
                      value={createForm.memberLimit} 
                      onChange={(e) => setCreateForm(prev => ({ ...prev, memberLimit: Number(e.target.value) }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white"
                      min="0"
                    />
                  </div>
                </div>

                {/* Advanced Grid Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Audience Type */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-355">Tipo de audiencia (Acceso)</label>
                    <select 
                      value={createForm.audienceType} 
                      onChange={(e) => setCreateForm(prev => ({ ...prev, audienceType: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white"
                    >
                      {['Infantil', 'Normal', 'Empresarial'].map(aud => (
                        <option key={aud} value={aud}>{aud}</option>
                      ))}
                    </select>
                  </div>

                  {/* Region constraint */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-355">Restricción de región</label>
                    <select 
                      value={createForm.regionConstraint} 
                      onChange={(e) => setCreateForm(prev => ({ ...prev, regionConstraint: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white"
                    >
                      {['Regional', 'Mundial'].map(reg => (
                        <option key={reg} value={reg}>{reg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit button */}
                <button 
                  type="submit"
                  className="rounded-2xl bg-white text-slate-950 hover:bg-slate-200 transition font-bold px-6 py-3.5 text-sm w-full sm:w-auto"
                >
                  Crear Comunidad
                </button>
              </form>
            )}
          </div>
        )}

        {/* VIEW: COMMUNITY CHAT */}
        {activeView === 'chat' && selectedGroup && (
          <div className="flex-1 flex flex-col min-h-0 bg-transparent">
            {/* Chat Header */}
            <header className="h-14 px-4 flex items-center justify-between border-b border-slate-900/60 shrink-0">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-500">forum</span>
                <div>
                  <h2 className="font-bold text-sm text-white">{selectedGroup.name}</h2>
                  <p className="text-[10px] text-slate-500 truncate max-w-xs sm:max-w-md">
                    {selectedGroup.description || 'Comunidad unida de Realart'}
                  </p>
                </div>
              </div>
            </header>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              
              {/* Welcome Banner Card */}
              <div className="py-6 border-b border-slate-900/40 mb-4 flex flex-col items-start">
                <div className="w-14 h-14 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl text-blue-500">forum</span>
                </div>
                <h3 className="text-xl font-bold text-white">¡Te damos la bienvenida a #{selectedGroup.name}!</h3>
                <p className="text-slate-500 text-xs mt-1">Este es el inicio de la conversación en esta comunidad.</p>
              </div>

              {/* Chat list */}
              {loadingChat && messages.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">Cargando mensajes...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">No hay mensajes aún. ¡Comienza a chatear!</div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const senderName = msg.sender?.username || 'Usuario'
                    const isSelf = msg.sender?._id === user?._id || msg.sender === user?._id
                    return (
                      <div key={msg._id || Date.now()} className={`flex gap-3 items-start ${isSelf ? 'flex-row-reverse' : ''}`}>
                        <div className="size-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs uppercase shrink-0">
                          {senderName[0]}
                        </div>
                        <div className={`flex flex-col max-w-[70%] ${isSelf ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-slate-400">@{senderName}</span>
                            <span className="text-[8px] text-slate-655 font-semibold">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className={`rounded-2xl px-4 py-2.5 text-xs md:text-sm leading-relaxed ${
                            isSelf 
                              ? 'bg-blue-600 text-white rounded-tr-none' 
                              : 'bg-slate-900/60 border border-slate-800 text-slate-200 rounded-tl-none'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Chat Input Footer */}
            <footer className="px-4 py-3 shrink-0 bg-slate-950/20 border-t border-slate-900/60">
              <form onSubmit={handleSendMessage} className="bg-slate-900/60 border border-slate-800 rounded-full flex items-center px-4 py-2 shadow-lg max-w-4xl mx-auto">
                <input
                  type="text"
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  placeholder={`Escribe un mensaje para #${selectedGroup.name}`}
                  className="flex-1 bg-transparent border-none p-0 text-xs md:text-sm focus:ring-0 placeholder:text-slate-500 text-white"
                />
                <button type="submit" disabled={!chatText.trim()} className="text-blue-500 hover:text-blue-400 ml-3 transition disabled:opacity-50">
                  <span className="material-symbols-outlined text-xl">send</span>
                </button>
              </form>
            </footer>
          </div>
        )}
        
      </main>

    </div>
  )
}
