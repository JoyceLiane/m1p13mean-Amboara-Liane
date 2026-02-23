const mongoose = require('mongoose');

const PaiementSchema = new mongoose.Schema({
    contrat_id: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contrat',  
      required: true
    },
    montant: { 
      type: Number, 
      required: true
    },
    date_paiement: { 
      type: Date, 
      required: true
    },
    mois_concerne_debut: { 
      type: Date, 
      required: true,
      comment: "Premier mois concerné par le paiement"
    },
    mois_concerne_fin: { 
      type: Date, 
      required: true,
      comment: "Dernier mois concerné par le paiement"
    },
    nombre_mois: {
      type: Number,
      required: true,
      min: 1,
      comment: "Nombre de mois payés"
    },
    montant_par_mois: {
      type: Number,
      required: true,
      comment: "Montant du loyer mensuel"
    },
    penalite: {
      type: Number,
      default: 0
    },
    notes: {
      type: String
    },
    statut: {
      type: String,
      enum: ['validé', 'en_attente', 'annulé'],
      default: 'validé'
    }
}, { 
  timestamps: true 
});

// Index pour éviter les doublons sur une période
PaiementSchema.index({ contrat_id: 1, mois_concerne_debut: 1, mois_concerne_fin: 1 });

module.exports = mongoose.model('Paiement', PaiementSchema);