import mongoose from 'mongoose';

/**
 * Connexion à la base de données MongoDB
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[MongoDB] Connecté avec succès : ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Erreur de connexion : ${error.message}`);
    process.exit(1);
  }
};
