import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, '..', 'Frontend', 'certs');
const targetDir = path.join(__dirname, 'certs');

// Create certs directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const files = ['localhost.pem', 'localhost-key.pem'];

try {
  files.forEach((file) => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Copied ${file}`);
    } else {
      console.warn(`⚠️  ${file} not found in Frontend/certs`);
    }
  });

  console.log('✅ HTTPS setup complete. Backend can now use HTTPS.');
} catch (error) {
  console.error('❌ Error setting up HTTPS:', error.message);
  process.exit(1);
}
