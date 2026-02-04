const mongoose = require('mongoose');

const UrgenceMaintenanceSchema = new mongoose.Schema({
    niveau: { type: String, required: true }, // "FAIBLE", "MOYEN", etc.
    delai_max_jours: { type: Number }, // Délai d'intervention maximum
    couleur: { type: String }
}, { timestamps: false });

module.exports = mongoose.model('UrgenceMaintenance', UrgenceMaintenanceSchema);

// const urgencesInitiales = [
//     { niveau: 'FAIBLE', delai_max_jours: 30, couleur: '#008000' },
//     { niveau: 'MOYENNE', delai_max_jours: 7, couleur: '#FFA500' },
//     { niveau: 'ELEVEE', delai_max_jours: 3, couleur: '#FF0000' },
//     { niveau: 'URGENT', delai_max_jours: 1, couleur: '#8B0000' }
// ];

// await UrgenceMaintenance.insertMany(urgencesInitiales);