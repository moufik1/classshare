import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true,
      minlength: [2, 'Le nom doit comporter au moins 2 caractères'],
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
    },
    email: {
      type: String,
      required: [true, "L'adresse email est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Veuillez renseigner un email valide'
      ]
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire'],
      minlength: [6, 'Le mot de passe doit comporter au moins 6 caractères']
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
      }
    ]
  },
  {
    timestamps: true
  }
);

// Middleware Mongoose : Hashage automatique du mot de passe avant enregistrement
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode d'instance pour comparer les mots de passe
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
