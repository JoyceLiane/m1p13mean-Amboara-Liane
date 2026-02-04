const mongoose = require('mongoose');

const TypeMouvementSchema = new mongoose.Schema({
  id: { type: String, required: true },
  nom: { type: String, required: true } // entrée en stock, vente, cassé na zavatra hafa
}, { timestamps: false });

module.exports = mongoose.model('TypeMouvement', TypeMouvementSchema);
