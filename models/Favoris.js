const mongoose = require('mongoose');

const FavorisSchema = new mongoose.Schema({
  id: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  produits_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Produits', required: false },
  contrat_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Contrat', required: false }
}, { timestamps: true });

module.exports = mongoose.model('Favoris', FavorisSchema);
