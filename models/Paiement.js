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
    mois_concerne: { 
      type: Date, 
      required: true,
      default: function() {
        // Par défaut, le mois concerné est le mois de la date de paiement
        const date = new Date(this.date_paiement);
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        return date;
      }
    },
    penalite: {
      type: Number,
      default: 0
    },
    notes: {
      type: String
    }
}, { 
  timestamps: true 
});

// Index pour éviter les doublons (un seul paiement par contrat et par mois)
PaiementSchema.index({ contrat_id: 1, mois_concerne: 1 }, { unique: true });

module.exports = mongoose.model('Paiement', PaiementSchema);