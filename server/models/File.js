import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre du fichier est obligatoire'],
      trim: true,
      minlength: [2, 'Le titre doit comporter au moins 2 caractères'],
      maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
    },
    subject: {
      type: String,
      required: [true, 'La matière est obligatoire'],
      trim: true,
      index: true
    },
    chapter: {
      type: String,
      trim: true,
      default: ''
    },
    fileUrl: {
      type: String,
      required: [true, "L'URL du fichier est obligatoire"]
    },
    fileType: {
      type: String,
      required: [true, 'Le type de fichier est obligatoire']
    },
    fileSize: {
      type: Number,
      required: [true, 'La taille du fichier est obligatoire']
    },
    publicId: {
      type: String,
      required: [true, "L'identifiant public Cloudinary est obligatoire"]
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

const File = mongoose.model('File', fileSchema);

export default File;
