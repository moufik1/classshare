import express from 'express';
import {
  addComment,
  getCommentsByFile,
  deleteComment
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Toutes les actions de commentaires nécessitent d'être connecté
router.use(protect);

// Ajouter un commentaire
router.post('/', addComment);
router.post('/file/:fileId', addComment);

// Obtenir tous les commentaires d'un fichier
router.get('/file/:fileId', getCommentsByFile);

// Supprimer un commentaire
router.delete('/:commentId', deleteComment);

export default router;
