const mongoose = require('mongoose');

const MouvementStockSchema = new mongoose.Schema({
  id: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  produits_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Produits', required: true },
  qt_entree: { type: Number, default: 0 },
  qt_sortie: { type: Number, default: 0 },
  date_mouvement: { type: Date, default: Date.now },
  id_type: { type: mongoose.Schema.Types.ObjectId, ref: 'TypeMouvement', required: true }
}, { timestamps: false });

module.exports = mongoose.model('MouvementStock', MouvementStockSchema);
