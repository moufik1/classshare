import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import classRoutes from './routes/classRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

// Initialisation de la connexion à MongoDB
connectDB();

const app = express();

// Middlewares globaux
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de vérification de santé (Health Check)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'ClassShare API'
  });
});

// Enregistrement des routes de l'API
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/comments', commentRoutes);

// Middleware 404 pour les routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route introuvable : ${req.method} ${req.originalUrl}`
  });
});

// Middleware global de gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur non interceptée :', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[ClassShare Server] En écoute sur le port ${PORT} (mode ${process.env.NODE_ENV || 'development'})`);
});
