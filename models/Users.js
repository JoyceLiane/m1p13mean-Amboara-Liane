const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
  id: { type: String, required: false },
  mdp: { type: String, required: true },
  prenom: { type: String, required: true },
  nom: { type: String, required: true },
  phone: { type: String, required: false },
  role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Roles', required: true },
  statut_id: { type: String, ref: 'UsersStatuts', required: true },
  created_on: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  pdp: { type: String, required: false },
  adresse: { type: String, required: false },
  email: { type: String, required: true }
}, { timestamps: false });

module.exports = mongoose.model('Users', UsersSchema);
