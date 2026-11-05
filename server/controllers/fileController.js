import path from 'path';
import File from '../models/File.js';
import Comment from '../models/Comment.js';
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary
} from '../config/cloudinary.js';

/**
 * @desc    Uploader un fichier dans une classe
 * @route   POST /api/files/upload
 * @access  Private (Membres de la classe)
 */
export const uploadFile = async (req, res) => {
  try {
    const { title, subject, classId, chapter } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez sélectionner un fichier à uploader'
      });
    }

    if (!title || !subject || !classId) {
      return res.status(400).json({
        success: false,
        message: 'Le titre, la matière et la classe sont obligatoires'
      });
    }

    // Déterminer le type de fichier (ex: pdf, docx, png, pptx)
    const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();

    // Téléversement sécurisé vers Cloudinary
    const cloudinaryResult = await uploadBufferToCloudinary(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Enregistrement des métadonnées en base de données
    const newFile = await File.create({
      title: title.trim(),
      subject: subject.trim(),
      chapter: chapter ? chapter.trim() : '',
      fileUrl: cloudinaryResult.secure_url,
      fileType: ext,
      fileSize: req.file.size,
      publicId: cloudinaryResult.public_id,
      uploadedBy: req.user._id,
      classId
    });

    const populatedFile = await newFile.populate('uploadedBy', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Fichier uploadé avec succès',
      data: populatedFile
    });
  } catch (error) {
    console.error('Erreur uploadFile :', error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'upload du fichier",
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer les fichiers d'une classe (avec filtre optionnel par matière)
 * @route   GET /api/files/class/:classId
 * @access  Private (Membres de la classe)
 */
export const getFilesByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { subject } = req.query;

    const query = { classId };

    // Filtre insensible à la casse si la matière est spécifiée
    if (subject && subject.trim() !== '') {
      query.subject = new RegExp(`^${subject.trim()}$`, 'i');
    }

    const files = await File.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    // Récupérer la liste de toutes les matières disponibles dans cette classe pour le menu déroulant du frontend
    const availableSubjects = await File.distinct('subject', { classId });

    return res.status(200).json({
      success: true,
      count: files.length,
      availableSubjects,
      data: files
    });
  } catch (error) {
    console.error('Erreur getFilesByClass :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des fichiers',
      error: error.message
    });
  }
};

/**
 * @desc    Supprimer un fichier (réservé au propriétaire du fichier)
 * @route   DELETE /api/files/:fileId
 * @access  Private (Propriétaire uniquement)
 */
export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Fichier introuvable'
      });
    }

    // Vérification de la propriété du fichier
    if (file.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Action non autorisée : seul le propriétaire de ce fichier peut le supprimer'
      });
    }

    // Suppression sur Cloudinary
    await deleteFromCloudinary(file.publicId, file.fileType);

    // Suppression des commentaires associés
    await Comment.deleteMany({ fileId });

    // Suppression en base de données
    await File.findByIdAndDelete(fileId);

    return res.status(200).json({
      success: true,
      message: 'Fichier supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteFile :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du fichier',
      error: error.message
    });
  }
};
