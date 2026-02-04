const mongoose = require('mongoose');

const AvisSchema = new mongoose.Schema({
  id: { type: String, required: true },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  contrat_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Contrat', required: false },
  contenu_message: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: null },
  deleted_at: { type: Date, default: null }
}, { timestamps: false });

module.exports = mongoose.model('Avis', AvisSchema);
