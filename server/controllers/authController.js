import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { uploadBufferToCloudinary } from '../config/cloudinary.js';

/**
 * @desc    Inscription d'un nouvel utilisateur
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation des champs obligatoires
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez renseigner tous les champs obligatoires (nom, email, mot de passe)'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Vérification de l'existence préalable de l'utilisateur
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Cet email est déjà utilisé par un autre compte'
      });
    }

    // Création de l'utilisateur (le mot de passe est hashé automatiquement via le pre-save hook)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      classes: []
    });

    // Génération du token JWT
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || '',
        classes: user.classes,
        createdAt: user.createdAt,
        token
      }
    });
  } catch (error) {
    console.error('Erreur register :', error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'inscription",
      error: error.message
    });
  }
};

/**
 * @desc    Connexion d'un utilisateur existant
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation des champs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }

    // Recherche de l'utilisateur par email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides (email ou mot de passe incorrect)'
      });
    }

    // Vérification du mot de passe
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides (email ou mot de passe incorrect)'
      });
    }

    // Génération du token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || '',
        classes: user.classes,
        createdAt: user.createdAt,
        token
      }
    });
  } catch (error) {
    console.error('Erreur login :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer les informations du profil utilisateur connecté
 * @route   GET /api/auth/me
 * @access  Private (protégé par JWT)
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('classes', 'name code');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erreur getMe :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du profil',
      error: error.message
    });
  }
};

/**
 * @desc    Mettre à jour le profil utilisateur (nom, email, mot de passe, avatar)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    const { name, email, currentPassword, newPassword } = req.body;

    // Modification du nom
    if (name && name.trim()) {
      user.name = name.trim();
    }

    // Modification de l'email avec vérification d'unicité
    if (email && email.trim() && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(409).json({
          success: false,
          message: 'Cette adresse email est déjà utilisée par un autre compte'
        });
      }
      user.email = email.toLowerCase().trim();
    }

    // Modification du mot de passe
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Veuillez renseigner votre mot de passe actuel pour le changer'
        });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Mot de passe actuel incorrect'
        });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Le nouveau mot de passe doit comporter au moins 6 caractères'
        });
      }
      user.password = newPassword;
    }

    // Upload et mise à jour de l'avatar vers Cloudinary
    if (req.file) {
      const cloudinaryResult = await uploadBufferToCloudinary(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      user.avatarUrl = cloudinaryResult.secure_url;
    }

    await user.save();

    const populatedUser = await User.findById(user._id)
      .select('-password')
      .populate('classes', 'name code');

    return res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: populatedUser
    });
  } catch (error) {
    console.error('Erreur updateProfile :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message
    });
  }
};
