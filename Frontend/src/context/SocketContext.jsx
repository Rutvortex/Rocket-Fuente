/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { getSocketUrl } from '../utils/AutoConfiguracion'

const SocketContext = createContext(null)

const SOCKET_URL = getSocketUrl()

export function SocketProvider({ children }) {
  const socketRef = useRef(null)
  const [liveRooms, setLiveRooms] = useState([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // If SOCKET_URL is a relative path (e.g., '/socket.io'), connect to root namespace with that path
    // If it's an absolute URL (e.g., 'wss://...'), use it directly
    const isRelativePath = SOCKET_URL.startsWith('/')
    const socketUrl = isRelativePath ? undefined : SOCKET_URL
    const socketPath = isRelativePath ? SOCKET_URL : '/socket.io'
    
    const socket = io(socketUrl, { path: socketPath, transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('rooms:get')
    })
    socket.on('disconnect', () => setConnected(false))
    socket.on('rooms:list', (rooms) => setLiveRooms(rooms))
    socket.on('connect_error', (err) => {
      // Log connect errors to help debugging in development
      // eslint-disable-next-line no-console
      console.error('Socket connect_error:', err && err.message ? err.message : err)
    })
    socket.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('Socket error:', err)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, socketRef, liveRooms, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
