const mongoose = require('mongoose');

const ProduitsSchema = new mongoose.Schema({
  id: { type: String, required: true },
  nom: { type: String, required: true },
  id_categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'Categorie_produits', required: true },
  id_vendeur: { type: mongoose.Schema.Types.ObjectId, ref: 'Contrat', required: true },
  prix: { type: Number, required: false },
  description: { type: String, required: true },
  imagepath: { type: String, required: false},
  stock: { type: Number, default: 0 }
}, { timestamps: false });

module.exports = mongoose.model('Produits', ProduitsSchema);
