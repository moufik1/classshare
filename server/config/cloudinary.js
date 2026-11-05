import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import path from 'path';

// Configuration Cloudinary (supporte soit CLOUDINARY_URL soit les 3 clés individuelles)
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL
  });
} else {
  cloudinary.config({
    cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
    api_key: (process.env.CLOUDINARY_API_KEY || '').trim(),
    api_secret: (process.env.CLOUDINARY_API_SECRET || '').trim()
  });
}

// Types MIME autorisés (PDF, Images, Word, PowerPoint)
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  // PDF
  'application/pdf',
  // Word (.doc, .docx)
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // PowerPoint (.ppt, .pptx)
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
];

// Extensions autorisées
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.doc', '.docx', '.ppt', '.pptx'];

// Filtrage des fichiers
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ALLOWED_MIME_TYPES.includes(file.mimetype) || ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Format de fichier non supporté. Formats acceptés : PDF, Images (JPG, PNG, WebP), Word (.doc, .docx), PowerPoint (.ppt, .pptx)'
      ),
      false
    );
  }
};

// Stockage en mémoire RAM pour transmission directe vers Cloudinary
const storage = multer.memoryStorage();

// Middleware Multer (limite à 20 Mo)
export const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 Mo
  },
  fileFilter
});

/**
 * Upload d'un buffer vers Cloudinary via upload_stream
 * @param {Buffer} buffer - Contenu du fichier
 * @param {string} originalname - Nom d'origine
 * @param {string} mimetype - Type MIME
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
export const uploadBufferToCloudinary = (buffer, originalname, mimetype) => {
  return new Promise((resolve, reject) => {
    // Les documents (PDF, Word, PPT) nécessitent resource_type: 'raw' ou 'auto'
    const isImage = mimetype.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';

    const cleanName = path.parse(originalname).name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const ext = path.extname(originalname);

    const publicId = isImage
      ? `${Date.now()}_${cleanName}`
      : `${Date.now()}_${cleanName}${ext}`;

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'classshare_uploads',
        resource_type: resourceType,
        public_id: publicId
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

/**
 * Supprime un fichier de Cloudinary
 * @param {string} publicId - ID public Cloudinary
 * @param {string} fileType - Type de fichier pour déterminer le resource_type
 */
export const deleteFromCloudinary = async (publicId, fileType) => {
  try {
    const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'image'].includes(fileType.toLowerCase());
    const resourceType = isImage ? 'image' : 'raw';
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Erreur suppression Cloudinary :', error);
  }
};

export default cloudinary;
