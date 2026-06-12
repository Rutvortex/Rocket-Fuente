import fs from 'fs'
import path from 'path'
import selfsigned from 'selfsigned'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const requestedHost = process.argv[2] || process.env.VITE_DEV_HOST || 'localhost'
const certDir = path.resolve(process.cwd(), 'certs')
const certPath = path.join(certDir, 'localhost.pem')
const keyPath = path.join(certDir, 'localhost-key.pem')

const isIpAddress = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(requestedHost)
const altNames = [
  { type: 2, value: 'localhost' },
  { type: 7, ip: '127.0.0.1' },
  { type: 7, ip: '::1' },
]

if (isIpAddress) {
  altNames.push({ type: 7, ip: requestedHost })
} else {
  altNames.push({ type: 2, value: requestedHost })
}

const attrs = [{ name: 'commonName', value: requestedHost }]
const options = {
  algorithm: 'sha256',
  days: 365,
  keySize: 2048,
  extensions: [{ name: 'subjectAltName', altNames }],
}

if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true })
}

const pems = await selfsigned.generate(attrs, options)
fs.writeFileSync(certPath, pems.cert, 'utf8')
fs.writeFileSync(keyPath, pems.private, 'utf8')

console.log('✅ HTTPS certificate generated successfully.')
console.log(`  host: ${requestedHost}`)
console.log(`  cert: ${certPath}`)
console.log(`  key:  ${keyPath}`)
console.log('')
console.log('Para iniciar el servidor HTTPS:')
console.log('  npm start')
