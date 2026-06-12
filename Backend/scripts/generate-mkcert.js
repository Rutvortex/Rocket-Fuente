import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const backendRoot = path.resolve(__dirname, '..')

dotenv.config({ path: path.resolve(backendRoot, '.env') })

let requestedHost = process.argv[2] || process.env.BACKEND_HOST || process.env.VITE_DEV_HOST || 'localhost'

const isWildcardHost = requestedHost === '0.0.0.0' || requestedHost === '::'
if (isWildcardHost) {
  requestedHost = 'localhost'
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

const backendCertDir = path.join(backendRoot, 'certs')
const frontendCertDir = path.resolve(backendRoot, '..', 'Frontend', 'certs')
const backendCertPath = path.join(backendCertDir, 'localhost.pem')
const backendKeyPath = path.join(backendCertDir, 'localhost-key.pem')
const frontendCertPath = path.join(frontendCertDir, 'localhost.pem')
const frontendKeyPath = path.join(frontendCertDir, 'localhost-key.pem')

fs.mkdirSync(backendCertDir, { recursive: true })

const commandExists = (cmd) => {
  try {
    execSync(`${cmd} -version`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

if (!commandExists('mkcert')) {
  console.error('❌ mkcert no está instalado o no está en PATH.')
  console.error('Instala mkcert y vuelve a ejecutar este script. Por ejemplo:')
  console.error('  choco install mkcert')
  console.error('  scoop install mkcert')
  console.error('  winget install mkcert')
  process.exit(1)
}

try {
  console.log('🔐 Instalando la CA local de mkcert...')
  execSync('mkcert -install', { stdio: 'inherit' })

  const hostArgs = hostList.map((h) => `"${h}"`).join(' ')
  console.log(`🧾 Generando certificados mkcert para: ${hostList.join(', ')}`)
  execSync(
    `mkcert -cert-file "${backendCertPath}" -key-file "${backendKeyPath}" ${hostArgs}`,
    { stdio: 'inherit' }
  )

  if (fs.existsSync(frontendCertDir)) {
    fs.copyFileSync(backendCertPath, frontendCertPath)
    fs.copyFileSync(backendKeyPath, frontendKeyPath)
    console.log('✅ Certificados copiados también a Frontend/certs.')
  }

  console.log('✅ Certificados generados en Backend/certs.')
  console.log('📌 Si todo ha ido bien, ya no necesitarás aceptar manualmente el certificado en el navegador.')
  console.log('📍 Ejecuta ahora:')
  console.log('   cd Backend && npm start')
  console.log('   cd ../Frontend && npm run https')
} catch (error) {
  console.error('❌ Error generando el certificado con mkcert:')
  console.error(error.message)
  if (error.code === 'ENOENT') {
    console.error('mkcert no está disponible en PATH. Instala mkcert antes de continuar.')
  } else if (error.message.includes('permission') || error.message.includes('permiso')) {
    console.error('Es posible que necesites ejecutar este comando con privilegios de administrador.')
  }
  process.exit(1)
}
