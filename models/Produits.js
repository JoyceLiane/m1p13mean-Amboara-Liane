const mongoose = require('mongoose');

const ProduitsSchema = new mongoose.Schema({
  id: { type: String, required: true },
  nom: { type: String, required: true },
  id_categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'Categorie_produits', required: true },
  prix: { type: Number, required: false },
  description: { type: String, required: true }
}, { timestamps: false });

module.exports = mongoose.model('Produits', ProduitsSchema);
