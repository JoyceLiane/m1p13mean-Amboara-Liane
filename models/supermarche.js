const mongoose = require('mongoose');

const SupermarcheSchema = new mongoose.Schema({
  id_user_admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  nom: { type: String, required: true },
  surface_totale: { type: Number, required: true },
  étages: { type: Number, required: true }
}, { timestamps: false });

module.exports = mongoose.model('Supermarche', SupermarcheSchema);
