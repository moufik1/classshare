# 🎓 ClassShare - MVP 1.0

Plateforme de partage de cours et documents scolaires par classe (MERN Stack).

---

## 📁 Structure du Projet

```text
classshare/
├── client/                      # Frontend React (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/          # Modales, FileCard, Navbar, ProtectedRoute
│   │   ├── context/             # AuthContext (JWT & state utilisateur)
│   │   ├── pages/               # Login, Register, Dashboard, ClassDetail
│   │   ├── services/            # Client Axios avec intercepteur Bearer
│   │   ├── App.jsx              # Routes de l'application
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── server/                      # Backend Node.js / Express
    ├── config/                  # Connexion MongoDB & Cloudinary / Multer
    ├── controllers/             # Auth, Classes & Fichiers
    ├── middleware/              # JWT Protect & Vérification membre de classe
    ├── models/                  # User, Class & File
    ├── routes/                  # authRoutes, classRoutes, fileRoutes
    ├── utils/                   # generateToken & generateClassCode
    ├── .env
    ├── package.json
    └── server.js
```

---

## ⚡ Démarrage Rapide

### 1. Backend (`server/`)
```bash
cd server
npm install
npm run dev
```
*Le serveur démarrera sur `http://localhost:5000`.*

> Pensez à renseigner vos identifiants Cloudinary dans `server/.env` pour l'upload réel de documents.

### 2. Frontend (`client/`)
```bash
cd client
npm install
npm run dev
```
*L'application React sera accessible sur `http://localhost:5173`.*

---

## 🔒 Fonctionnalités Clés Implémentées

1. **Authentification Sécurisée** :
   - Inscription et connexion (mots de passe hachés avec `bcryptjs`).
   - Sessions gérées par tokens `JWT` avec auto-injection dans les requêtes Axios.

2. **Espaces de Classes Collaboratifs** :
   - Création de classes avec génération automatique de code alphanumérique unique de 6 caractères (ex: `W7P9K2`).
   - Rejoindre une classe instantanément via son code.
   - Accès restreint : seuls les élèves membres peuvent consulter ou publier dans la classe.

3. **Partage & Stockage de Fichiers (Cloudinary)** :
   - Support des formats PDF, Images, Word (`.doc`, `.docx`) et PowerPoint (`.ppt`, `.pptx`).
   - Limite de taille fixée à 20 Mo.
   - Filtrage dynamique par matière (Maths, Physique, Histoire...).
   - Téléchargement direct.
   - Suppression sécurisée réservée exclusivement à l'auteur du document.
