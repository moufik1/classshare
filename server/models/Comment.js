import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Le texte du commentaire est obligatoire'],
      trim: true,
      minlength: [1, 'Le commentaire ne peut pas être vide'],
      maxlength: [1000, 'Le commentaire ne peut pas dépasser 1000 caractères']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'auteur du commentaire est obligatoire"]
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      required: [true, "L'identifiant du fichier est obligatoire"],
      index: true
    }
  },
  {
    timestamps: true
  }
);

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
