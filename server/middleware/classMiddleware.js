import mongoose from 'mongoose';
import Class from '../models/Class.js';

/**
 * Middleware pour vérifier que l'utilisateur connecté est membre de la classe
 */
export const checkClassMember = async (req, res, next) => {
  try {
    const classId = req.params.classId || req.body.classId;

    if (!classId) {
      return res.status(400).json({
        success: false,
        message: "L'identifiant de la classe (classId) est requis"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({
        success: false,
        message: 'Format du classId invalide'
      });
    }

    const currentClass = await Class.findById(classId);

    if (!currentClass) {
      return res.status(404).json({
        success: false,
        message: 'Classe introuvable'
      });
    }

    // Vérifie si l'utilisateur fait partie des membres
    const isMember = currentClass.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé : vous devez être membre de cette classe pour y accéder'
      });
    }

    // Attache la classe validée à la requête
    req.currentClass = currentClass;
    next();
  } catch (error) {
    console.error('Erreur checkClassMember :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des accès à la classe',
      error: error.message
    });
  }
};
