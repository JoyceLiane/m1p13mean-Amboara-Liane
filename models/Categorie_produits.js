const mongoose = require('mongoose');

const CategorieProduitSchema = new mongoose.Schema({
  id: { type: String, required: true },
  nom: { type: String, required: true }
}, { timestamps: false });

module.exports = mongoose.model('Categorie_produits', CategorieProduitSchema);
