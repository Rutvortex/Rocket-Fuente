import fs from 'fs'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { ensureDevHttpsCert } from './src/utils/AutoConfiguracion.js'

function getHttpsConfig(certFile, keyFile) {
  const certPath = path.resolve(process.cwd(), certFile)
  const keyPath = path.resolve(process.cwd(), keyFile)

  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }
  }

  return true
}

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const certFile = env.VITE_HTTPS_CERT || './certs/localhost.pem'
  const keyFile = env.VITE_HTTPS_KEY || './certs/localhost-key.pem'
  const defaultBackendPort = env.VITE_BACKEND_PORT || env.BACKEND_PORT || '5000'
  const inferredProtocol = (env.USE_HTTPS === 'true') ? 'https' : 'http'
  const apiUrl = env.VITE_API_URL || ''
  const backendUrlFromApi = apiUrl ? apiUrl.replace(/\/api\/.*$/, '') : ''
  const backendTarget = env.VITE_BACKEND_URL || backendUrlFromApi || `${inferredProtocol}://localhost:${defaultBackendPort}`

  const createProxyOptions = () => ({
    changeOrigin: true,
    secure: false,
    configure(proxy) {
      proxy.on('proxyReq', (proxyReq, req) => {
        const authHeader = req.headers.authorization || req.headers['Authorization']
        if (authHeader) {
          proxyReq.setHeader('Authorization', authHeader)
        }
      })
    },
  })

  await ensureDevHttpsCert({
    host: env.VITE_DEV_HOST,
    certFile,
    keyFile,
  })

  return {
    plugins: [react()],
    server: {
      https: getHttpsConfig(certFile, keyFile),
      host: env.VITE_DEV_HOST || '0.0.0.0',
      port: Number(env.VITE_PORT) || 5173,
      proxy: {
        '/api/v1': {
          target: backendTarget.replace(/\/$/, ''),
          ...createProxyOptions(),
        },
        '/uploads': {
          target: backendTarget.replace(/\/$/, ''),
          ...createProxyOptions(),
        },
        '/socket.io': {
          target: backendTarget.replace(/\/$/, ''),
          ...createProxyOptions(),
          ws: true,
        }
      }
    }
  }
})
