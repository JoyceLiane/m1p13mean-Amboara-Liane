const mongoose = require('mongoose');

const PaiementSchema = new mongoose.Schema({
    contrat_id: { type: mongoose.Schema.Types.ObjectId,ref: 'Contrat',  required: true},
    montant: { type: Number, required: true},
    date_paiement: { type: Date, required: true}

}, { timestamps: false });

module.exports = mongoose.model('Paiement', PaiementSchema);