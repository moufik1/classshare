import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware pour protéger les routes nécessitant une authentification
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extraction du token depuis le header : "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Vérification et décodage du token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupération de l'utilisateur sans le mot de passe
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé avec ce token'
        });
      }

      return next();
    } catch (error) {
      console.error('Erreur auth middleware :', error.message);
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Accès non autorisé, aucun token fourni'
    });
  }
};
