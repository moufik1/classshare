import crypto from 'crypto';
import Class from '../models/Class.js';

// Alphabet sans caractères ambigus (évite 0, O, 1, I) pour une saisie facile par les élèves
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Génère un code alphanumérique de 6 caractères
 * @returns {string} Code de 6 caractères majuscules
 */
export const generateClassCode = () => {
  let code = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += CHARSET[bytes[i] % CHARSET.length];
  }
  return code;
};

/**
 * Génère un code garanti unique en vérifiant l'existence dans la base de données
 * @returns {Promise<string>}
 */
export const generateUniqueClassCode = async () => {
  let isUnique = false;
  let code = '';
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    code = generateClassCode();
    const existing = await Class.findOne({ code });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Impossible de générer un code unique après plusieurs tentatives.');
  }

  return code;
};
