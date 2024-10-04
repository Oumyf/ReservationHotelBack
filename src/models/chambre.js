const mongoose = require('mongoose');

const chambreSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    type: { type: String, required: true },
    prix: { type: Number, required: true },
    description: { type: String },
    disponibilite: { type: Boolean, default: true },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true }, // Association avec l'hôtel
    image: { type: String }, // Chemin de l'image
    nombreDePersonnes: { type: Number, required: true }, // Nombre de personnes par chambre
});

module.exports = mongoose.model('Chambre', chambreSchema);
