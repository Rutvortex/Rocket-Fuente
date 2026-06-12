const DEFAULT_BACKEND_PORT = 5000
const DEFAULT_API_PATH = '/api/v1'
const DEFAULT_HOST = 'localhost'

const buildUrl = (protocol, host, port, path = '') => {
  const portPart = port ? `:${port}` : ''
  return `${protocol}//${host}${portPart}${path}`
}

const isNode = typeof process !== 'undefined' && Boolean(process.versions?.node)

export const ensureDevHttpsCert = async ({
  host = process.env.VITE_DEV_HOST,
  certFile = process.env.VITE_HTTPS_CERT || './certs/localhost.pem',
  keyFile = process.env.VITE_HTTPS_KEY || './certs/localhost-key.pem',
  scriptPath = './scripts/generate-cert.js',
} = {}) => {
  if (!isNode || process.env.NODE_ENV === 'production' || !host || !process.env.VITE_DEV_HOST) {
    return false
  }

  const { existsSync } = await import('fs')
  const { resolve } = await import('path')
  const { execFileSync } = await import('child_process')

  const certPath = resolve(process.cwd(), certFile)
  const keyPath = resolve(process.cwd(), keyFile)

  if (existsSync(certPath) && existsSync(keyPath)) {
    return false
  }

  const resolvedScript = resolve(process.cwd(), scriptPath)

  try {
    execFileSync(process.execPath, [resolvedScript, host], {
      stdio: 'inherit',
      cwd: process.cwd(),
    })
    return true
  } catch (error) {
    console.warn('Could not generate HTTPS certificate:', error.message)
    return false
  }
}

const isLanAddress = (host) => /^(192\.168|10\.|172\.(1[6-9]|2\d|3[0-1]))\.\d+\.\d+$/.test(host)

const getBrowserHostname = () => {
  if (typeof window === 'undefined') return DEFAULT_HOST
  return window.location.hostname || DEFAULT_HOST
}

const getLanHostFromBrowser = () => {
  const hostname = getBrowserHostname()
  return isLanAddress(hostname) ? hostname : null
}

const getBackendHost = () => {
  if (import.meta.env.VITE_BACKEND_HOST) {
    return import.meta.env.VITE_BACKEND_HOST
  }

  return getLanHostFromBrowser() || getBrowserHostname()
}

export const getApiUrl = () => {
  if (import.meta.env.DEV) {
    // In development, let Vite proxy "/api" to the backend to avoid
    // direct connections to a self-signed backend HTTPS server.
    return DEFAULT_API_PATH
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https:' : 'http:'
  const host = getBackendHost()
  return buildUrl(protocol, host, DEFAULT_BACKEND_PORT, DEFAULT_API_PATH)
}

export const getSocketUrl = () => {
  if (import.meta.env.DEV) {
    // In development, prefer an explicit socket backend URL when configured,
    // otherwise fall back to the Vite dev server socket proxy.
    return import.meta.env.VITE_SOCKET_URL || '/socket.io'
  }

  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL
  }

  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = getBackendHost()
  return buildUrl(protocol, host, DEFAULT_BACKEND_PORT)
}

export const getLanApiUrl = () => {
  const lanHost = getLanHostFromBrowser()
  if (!lanHost) {
    return getApiUrl()
  }

  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https:' : 'http:'
  return buildUrl(protocol, lanHost, DEFAULT_BACKEND_PORT, DEFAULT_API_PATH)
}

export const getLanSocketUrl = () => {
  const lanHost = getLanHostFromBrowser()
  if (!lanHost) {
    return getSocketUrl()
  }

  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return buildUrl(protocol, lanHost, DEFAULT_BACKEND_PORT)
}

export default {
  getApiUrl,
  getSocketUrl,
  getLanApiUrl,
  getLanSocketUrl,
}
