const mongoose = require('mongoose');

const chambreSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    type: { type: String, required: true },
    prix: { type: Number, required: true },
    description: { type: String },
    disponibilite: { type: Boolean, default: true },
});

module.exports = mongoose.model('Chambre', chambreSchema);
