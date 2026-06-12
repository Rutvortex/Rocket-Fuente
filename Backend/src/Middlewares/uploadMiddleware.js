import multer from 'multer';
import path from 'path';
import fs from 'fs';
import AppError from '../utils/appError.js';
import { HTTP_STATUS } from '../utils/httpCodes.js';

// Crear directorio si no existe
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir + '/');
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-').toLowerCase();
    const ext = path.extname(safeName);
    const name = path.basename(safeName, ext);
    const timestamp = Date.now();
    cb(null, `${timestamp}-${name}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedTypes = ['image/', 'video/', 'audio/'];
  const isAllowed = allowedTypes.some((type) => file.mimetype.startsWith(type));

  if (!isAllowed) {
    return cb(
      new AppError(
        'Only image, video, and audio uploads are allowed',
        HTTP_STATUS.BAD_REQUEST
      )
    );
  }
  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

/**
 * Middleware para procesar archivo subido y crear documento Media
 * Retorna información del archivo en req.uploadedFile
 */
export const processUpload = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  // Determinar tipo de media
  let mediaType = 'image';
  if (req.file.mimetype.startsWith('video/')) {
    mediaType = 'video';
  } else if (req.file.mimetype.startsWith('audio/')) {
    mediaType = 'audio';
  }

  // Pasar información al controlador
  req.uploadedFile = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
    type: mediaType,
  };

  next();
};

export default upload;