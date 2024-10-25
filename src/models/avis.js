// avis.js
const mongoose = require('mongoose');

// Define the base schema for Avis
const avisSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    auteur: { type: String, required: true },
    type: { type: String, required: true, enum: ['note', 'commentaire'] }
}, { discriminatorKey: 'type', timestamps: true });

// Define the base Avis model
const Avis = mongoose.models.Avis || mongoose.model('Avis', avisSchema);

module.exports = Avis;
