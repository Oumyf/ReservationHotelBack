const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    // nom: { type: String, required: true },
    // email: { type: String, required: true },
    // password: { type: String, required: true },
    // telephone: { type: String, required: true },
    // adresse: { type: String, required: true },
    // role: { type: String, required: true },
    nombre_etoiles: { type: Number, min: 1, max: 5 },
    description: { type: String, minlength: 10 },
    logo: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Assurez-vous que ce champ est là
});

module.exports = mongoose.model('Hotel', hotelSchema);