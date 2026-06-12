import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const frontendRoot = path.resolve(__dirname, '..')

dotenv.config({ path: path.resolve(frontendRoot, '.env') })

let requestedHost = process.argv[2] || process.env.VITE_DEV_HOST || 'localhost'
const fallbackHost = process.env.VITE_BACKEND_HOST || 'localhost'

if (requestedHost === '0.0.0.0' || requestedHost === '::') {
  requestedHost = fallbackHost
}

const hosts = new Set([
  requestedHost,
  'localhost',
  '127.0.0.1',
  '::1',
  process.env.VITE_BACKEND_HOST,
])

const hostList = [...hosts].filter(Boolean)

if (hostList.length === 0) {
  console.error('❌ No se encontró ningún host válido para generar el certificado.')
  process.exit(1)
}

const frontendCertDir = path.join(frontendRoot, 'certs')
const backendCertDir = path.resolve(frontendRoot, '..', 'Backend', 'certs')
const frontendCertPath = path.join(frontendCertDir, 'localhost.pem')
const frontendKeyPath = path.join(frontendCertDir, 'localhost-key.pem')
const backendCertPath = path.join(backendCertDir, 'localhost.pem')
const backendKeyPath = path.join(backendCertDir, 'localhost-key.pem')

fs.mkdirSync(frontendCertDir, { recursive: true })
fs.mkdirSync(backendCertDir, { recursive: true })

try {
  console.log('🔐 Instalando la CA local de mkcert...')
  execSync('mkcert -install', { stdio: 'inherit' })

  const hostArgs = hostList.map((h) => `"${h}"`).join(' ')
  console.log(`🧾 Generando certificados mkcert para: ${hostList.join(', ')}`)
  execSync(
    `mkcert -cert-file "${frontendCertPath}" -key-file "${frontendKeyPath}" ${hostArgs}`,
    { stdio: 'inherit' }
  )

  fs.copyFileSync(frontendCertPath, backendCertPath)
  fs.copyFileSync(frontendKeyPath, backendKeyPath)

  console.log('✅ Certificados generados en Frontend/certs y copiados a Backend/certs.')
  console.log('📌 Si todo ha ido bien, ya no deberías necesitar aceptar manualmente el certificado en el navegador.')
  console.log('📍 Ejecuta ahora:')
  console.log('   cd Frontend && npm run https')
  console.log('   cd ../Backend && npm start')
} catch (error) {
  console.error('❌ Error generando el certificado con mkcert:')
  console.error(error.message)
  if (error.code === 'ENOENT') {
    console.error('mkcert no está disponible en PATH. Instala mkcert antes de continuar.')
    console.error('Instala mkcert usando uno de estos comandos:')
    console.error('  choco install mkcert')
    console.error('  scoop install mkcert')
    console.error('  winget install mkcert')
  } else if (error.message.includes('permission') || error.message.includes('permiso')) {
    console.error('Es posible que necesites ejecutar este comando con privilegios de administrador.')
  }
  process.exit(1)
}
