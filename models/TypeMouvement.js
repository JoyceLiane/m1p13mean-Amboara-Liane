const mongoose = require('mongoose');

const TypeMouvementSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true },
  description: { type: String, required: false }
}, { timestamps: false });

module.exports = mongoose.model('TypeMouvement', TypeMouvementSchema);