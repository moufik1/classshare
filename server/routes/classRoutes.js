import express from 'express';
import {
  createClass,
  joinClass,
  getMyClasses,
  getClassById
} from '../controllers/classController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkClassMember } from '../middleware/classMiddleware.js';

const router = express.Router();

// Toutes les routes de classe nécessitent d'être connecté
router.use(protect);

router.route('/')
  .post(createClass)
  .get(getMyClasses);

router.post('/join', joinClass);

// Route protégée par le middleware d'appartenance à la classe
router.get('/:classId', checkClassMember, getClassById);

export default router;
