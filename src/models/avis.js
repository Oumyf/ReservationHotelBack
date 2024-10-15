const mongoose = require('mongoose');

const avisSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    auteur: { type: String, required: true },
    contenu: { type: String, required: true },
    note: { type: Number, required: true } // Note de 1 à 5
});

module.exports = mongoose.model('Avis', avisSchema);
