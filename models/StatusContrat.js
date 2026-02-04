const mongoose = require('mongoose');

const StatusContratSchema = new mongoose.Schema({
  id: { type: String, required: true },       
  nom: { type: String, required: true }
}, { timestamps: false });

module.exports = mongoose.model('StatusContrat', StatusContratSchema);