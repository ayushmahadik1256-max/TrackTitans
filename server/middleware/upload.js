import multer from 'multer';
import path from 'path';

// Max file size: 10 MB (in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// In-memory buffer storage for direct S3 streaming and SHA-256 calculation
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

const fileFilter = (req, file, cb) => {
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const isMimeValid = ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase());
  const isExtValid = ALLOWED_EXTENSIONS.includes(fileExtension);

  if (isMimeValid && isExtValid) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file format. Only PDF (.pdf) and Image documents (.jpg, .jpeg, .png, .webp) are accepted for FDR certificate submissions.');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter,
});

/**
 * Middleware wrapper for single PDF/Image document upload with custom error translation
 */
export function uploadFdrDocument(req, res, next) {
  const singleUpload = upload.single('fdr_document');

  singleUpload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds maximum allowable limit of 10 MB.',
          errors: ['Uploaded certificate cannot exceed 10 MB.'],
        });
      }

      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
          success: false,
          message: err.message,
          errors: ['Only PDF and Image files (JPG, PNG, WebP) up to 10MB are accepted.'],
        });
      }

      return res.status(400).json({
        success: false,
        message: 'File upload error occurred.',
        errors: [err.message],
      });
    }

    next();
  });
}

export default uploadFdrDocument;
