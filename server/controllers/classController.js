import Class from '../models/Class.js';
import User from '../models/User.js';
import { generateUniqueClassCode } from '../utils/codeGenerator.js';

/**
 * @desc    Créer une nouvelle classe
 * @route   POST /api/classes
 * @access  Private
 */
export const createClass = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Le nom de la classe doit comporter au moins 2 caractères'
      });
    }

    // Générer un code alphanumérique unique de 6 caractères
    const code = await generateUniqueClassCode();

    // Créer la classe avec l'utilisateur connecté comme créateur et premier membre
    const newClass = await Class.create({
      name: name.trim(),
      code,
      createdBy: req.user._id,
      members: [req.user._id]
    });

    // Ajouter la classe au profil de l'utilisateur
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { classes: newClass._id }
    });

    return res.status(201).json({
      success: true,
      message: 'Classe créée avec succès',
      data: newClass
    });
  } catch (error) {
    console.error('Erreur createClass :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la classe',
      error: error.message
    });
  }
};

/**
 * @desc    Rejoindre une classe via son code unique de 6 caractères
 * @route   POST /api/classes/join
 * @access  Private
 */
export const joinClass = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || code.trim().length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Le code de la classe doit comporter exactement 6 caractères'
      });
    }

    const cleanCode = code.trim().toUpperCase();

    // Recherche de la classe
    const targetClass = await Class.findOne({ code: cleanCode });

    if (!targetClass) {
      return res.status(404).json({
        success: false,
        message: 'Aucune classe trouvée avec ce code'
      });
    }

    // Vérifier si l'utilisateur est déjà membre
    const isAlreadyMember = targetClass.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'Vous êtes déjà membre de cette classe'
      });
    }

    // Ajouter l'utilisateur aux membres de la classe
    targetClass.members.push(req.user._id);
    await targetClass.save();

    // Ajouter la classe aux classes de l'utilisateur
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { classes: targetClass._id }
    });

    return res.status(200).json({
      success: true,
      message: `Vous avez rejoint la classe "${targetClass.name}" avec succès`,
      data: targetClass
    });
  } catch (error) {
    console.error('Erreur joinClass :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la tentative pour rejoindre la classe',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer toutes les classes de l'utilisateur connecté
 * @route   GET /api/classes
 * @access  Private
 */
export const getMyClasses = async (req, res) => {
  try {
    const classes = await Class.find({ members: req.user._id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    console.error('Erreur getMyClasses :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de vos classes',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer les détails d'une classe par son ID
 * @route   GET /api/classes/:classId
 * @access  Private (Membres uniquement)
 */
export const getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.classId)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    return res.status(200).json({
      success: true,
      data: classData
    });
  } catch (error) {
    console.error('Erreur getClassById :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations de la classe',
      error: error.message
    });
  }
};
