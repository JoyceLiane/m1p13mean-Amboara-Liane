const multer = require('multer');
const path = require('path');

function makeStorage(folder) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + path.extname(file.originalname);
      cb(null, uniqueName);
    }
  });
}

function makeUploader(folder) {
  return multer({
    storage: makeStorage(folder),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Fichier non valide'), false);
      }
      cb(null, true);
    }
  });
}

// Exporter des uploaders spécifiques
const uploadMagasins = makeUploader('uploads/magasins');
const uploadProduits = makeUploader('uploads/produits');
const uploadProfils = makeUploader('uploads/profils');

module.exports = { uploadMagasins, uploadProduits, uploadProfils };
