const mongoose = require('mongoose');

const TypeNotificationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  nom: { type: String, required: true } // demande paiement, expulsion, achat produit, etc.
}, { timestamps: false });

module.exports = mongoose.model('TypeNotification', TypeNotificationSchema);
