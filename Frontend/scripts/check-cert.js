import fs from 'fs'
import path from 'path'
import { X509Certificate } from 'crypto'

const certPath = path.resolve(process.cwd(), 'certs', 'localhost.pem')
if (!fs.existsSync(certPath)) {
  console.error('Certificate file not found:', certPath)
  process.exit(1)
}

const pem = fs.readFileSync(certPath, 'utf8')
const cert = new X509Certificate(pem)
console.log('subject:', cert.subject)
console.log('issuer:', cert.issuer)
console.log('subjectAltName:', cert.subjectAltName)
