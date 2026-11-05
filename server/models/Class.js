import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom de la classe est obligatoire'],
      trim: true,
      minlength: [2, 'Le nom doit comporter au moins 2 caractères'],
      maxlength: [60, 'Le nom ne peut pas dépasser 60 caractères']
    },
    code: {
      type: String,
      required: [true, 'Le code de la classe est obligatoire'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 6,
      maxlength: 6,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Le créateur de la classe est obligatoire']
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

const Class = mongoose.model('Class', classSchema);

export default Class;
