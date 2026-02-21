const mongoose = require('mongoose');

const MagasinSchema = new mongoose.Schema({
    id: { type: String, required: true },
    superficie: { type: Number, required: true },
    etage: { type: mongoose.Schema.Types.ObjectId, ref: 'Etages', required: true },
    prix_m2: { type: Number, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    deleted_at: { type: Date, default: null }
}, { timestamps: false });

module.exports = mongoose.model('Magasin', MagasinSchema);