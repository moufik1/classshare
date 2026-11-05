import express from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Routes publiques
router.post('/register', register);
router.post('/login', login);

// Routes privées (authentifiées)
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('avatar'), updateProfile);

export default router;
