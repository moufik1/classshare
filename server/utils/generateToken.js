import jwt from 'jsonwebtoken';

/**
 * Génère un JWT signé pour un utilisateur
 * @param {string} userId - ID de l'utilisateur MongoDB
 * @returns {string} Token JWT
 */
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};
