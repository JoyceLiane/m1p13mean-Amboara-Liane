const mongoose = require('mongoose');

const ContratSchema = new mongoose.Schema({
    id: { type: String, required: true },
    id_magasin: { type: mongoose.Schema.Types.ObjectId, ref: 'Magasin', required: true },
    nom_magasin: { type: String, required: true },
    locataire_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    description: { type: String, required: false},
    imagepath: { type: String, required: false},
    
    // Dates (NULL pour les demandes)
    date_debut: { type: Date, default: null },
    date_fin: { type: Date, default: null },
    date_expulsion: { type: Date, default: null },
    
    // 1. CHAMP CRITIQUE : type de contrat
    type_contrat: {
        type: String,
        enum: ['INITIAL', 'DEMANDE_RENOUVELLEMENT', 'RENOUVELLEMENT_ACTIF'],
        default: 'INITIAL'
    },
    
    // 2. Lien vers le contrat précédent (pour le suivi)
    contrat_parent_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Contrat', 
        default: null 
    },
        
    status_id: { type: mongoose.Schema.Types.ObjectId, ref: 'StatusContrat', required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    deleted_at: { type: Date, default: null }
    
}, { timestamps: false });

module.exports = mongoose.model('Contrat', ContratSchema);