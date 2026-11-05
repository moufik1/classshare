import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import File from '../models/File.js';
import Class from '../models/Class.js';

/**
 * @desc    Ajouter un commentaire à un fichier
 * @route   POST /api/comments
 * @access  Private (Membres de la classe du fichier)
 */
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const fileId = req.body.fileId || req.params.fileId;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Le commentaire ne peut pas être vide'
      });
    }

    if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant de fichier invalide ou manquant'
      });
    }

    // Vérifier l'existence du fichier
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Fichier introuvable'
      });
    }

    // Vérifier que l'utilisateur est membre de la classe associée au fichier
    const classDoc = await Class.findById(file.classId);
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: 'Classe associée introuvable'
      });
    }

    const isMember = classDoc.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé : vous devez être membre de la classe pour commenter ce document'
      });
    }

    // Création du commentaire
    const newComment = await Comment.create({
      text: text.trim(),
      author: req.user._id,
      fileId: file._id
    });

    const populatedComment = await newComment.populate('author', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Commentaire publié avec succès',
      data: populatedComment
    });
  } catch (error) {
    console.error('Erreur addComment :', error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'ajout du commentaire",
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer tous les commentaires d'un fichier spécifique
 * @route   GET /api/comments/file/:fileId
 * @access  Private (Membres de la classe du fichier)
 */
export const getCommentsByFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant de fichier invalide'
      });
    }

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Fichier introuvable'
      });
    }

    // Vérification de l'appartenance à la classe
    const classDoc = await Class.findById(file.classId);
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: 'Classe introuvable'
      });
    }

    const isMember = classDoc.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé : vous devez être membre de la classe pour voir les commentaires'
      });
    }

    // Récupération des commentaires dans l'ordre chronologique
    const comments = await Comment.find({ fileId })
      .populate('author', 'name email')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    console.error('Erreur getCommentsByFile :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commentaires',
      error: error.message
    });
  }
};

/**
 * @desc    Supprimer un commentaire (réservé à l'auteur du commentaire)
 * @route   DELETE /api/comments/:commentId
 * @access  Private (Auteur du commentaire)
 */
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant de commentaire invalide'
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire introuvable'
      });
    }

    // Vérifier que l'utilisateur connecté est bien l'auteur
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Action non autorisée : seul l\'auteur peut supprimer son commentaire'
      });
    }

    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json({
      success: true,
      message: 'Commentaire supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteComment :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du commentaire',
      error: error.message
    });
  }
};
