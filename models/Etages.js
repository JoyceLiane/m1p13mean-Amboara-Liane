const mongoose = require('mongoose');

const RolesSchema = new mongoose.Schema({
  id: { type: String, required: true },       
  nbr_magasin: { type: Number, required: true },
  nom: { type: String, required: false }
}, { timestamps: false });

module.exports = mongoose.model('Roles', RolesSchema);
