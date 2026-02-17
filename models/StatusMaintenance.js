const mongoose = require('mongoose');

const StatusMaintenanceSchema = new mongoose.Schema({
    nom: { type: String, required: true,unique: true },
    couleur: { type: String },
    ordre: { type: Number }, 
    
}, { timestamps: false });

module.exports = mongoose.model('StatusMaintenance', StatusMaintenanceSchema);
