import multer from 'multer';
import AppError from '../utils/appError.js';
import { HTTP_STATUS } from '../utils/httpCodes.js';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-').toLowerCase();
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const fileFilter = (_req, file, cb) => {
  const allowedTypes = ['image/', 'video/', 'audio/'];
  const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));

  if (!isAllowed) {
    return cb(new AppError('Only image, video, and audio uploads are allowed', HTTP_STATUS.BAD_REQUEST));
  }
  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

export default upload;