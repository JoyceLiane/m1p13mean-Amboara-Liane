const mongoose = require('mongoose');

const StatusMaintenanceSchema = new mongoose.Schema({
    nom: { type: String, required: true,unique: true },
    couleur: { type: String },
    ordre: { type: Number }, 
    
}, { timestamps: false });

module.exports = mongoose.model('StatusMaintenance', StatusMaintenanceSchema);

// const statutsInitiaux = [
//     { nom: 'EN_ATTENTE', couleur: '#FFA500', ordre: 1 },
//     { nom: 'EN_COURS', couleur: '#0000FF', ordre: 2 },
//     { nom: 'TERMINEE', couleur: '#008000', ordre: 3 },
//     { nom: 'ANNULEE', couleur: '#FF0000', ordre: 4 }
// ];

// await StatusMaintenance.insertMany(statutsInitiaux);