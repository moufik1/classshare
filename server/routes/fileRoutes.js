import express from 'express';
import {
  uploadFile,
  getFilesByClass,
  deleteFile
} from '../controllers/fileController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkClassMember } from '../middleware/classMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Toutes les opérations sur les fichiers nécessitent d'être connecté
router.use(protect);

// Upload d'un fichier (Multer parse les champs multipart, puis checkClassMember vérifie l'accès)
router.post(
  '/upload',
  upload.single('file'),
  checkClassMember,
  uploadFile
);

// Obtenir tous les fichiers d'une classe (avec filtre optionnel ?subject=...)
router.get('/class/:classId', checkClassMember, getFilesByClass);

// Supprimer un fichier (vérification du propriétaire dans le contrôleur)
router.delete('/:fileId', deleteFile);

export default router;
