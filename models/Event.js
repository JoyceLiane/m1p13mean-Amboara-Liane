const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    titre: { type: String, required: true },
    description: { type: String },
    date_debut: { type: Date, required: true },
    date_fin: { type: Date, required: true },
    statut: {
        type: String,
        enum: ['PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE'],
        default: 'PLANIFIE'
    },
    cout: { type: Number, default: 0 },
    date_creation: { type: Date, default: Date.now },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }
}, { timestamps: false });

module.exports = mongoose.model('Event', EventSchema);
