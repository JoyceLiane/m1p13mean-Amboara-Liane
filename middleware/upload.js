const multer = require('multer');
const path = require('path');

// Fonction pour choisir le dossier selon la route
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/profils'; // valeur par défaut

    // Exemple : on regarde l'URL ou un champ du body
    if (req.baseUrl.includes('/magasins')) {
      folder = 'uploads/magasins';
    } else if (req.baseUrl.includes('/produits')) {
      folder = 'uploads/produits';
    }

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Fichier non valide'), false);
    }
    cb(null, true);
  }
});

module.exports = upload;
