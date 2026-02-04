const mongoose = require('mongoose');

const DemandeMaintenanceSchema = new mongoose.Schema({
    contrat_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Contrat', required: true },
    description: { type: String, required: true },
    urgence_id: { type: mongoose.Schema.Types.ObjectId, ref: 'UrgenceMaintenance', required: true },
    statut_id: { type: mongoose.Schema.Types.ObjectId, ref: 'StatusMaintenance', required: true },
    date_demande: { type: Date, default: Date.now },
    cout: { type: Number, default: 0 },
    date_intervention: { type: Date },
        
}, { timestamps: false });

module.exports = mongoose.model('DemandeMaintenance', DemandeMaintenanceSchema);

