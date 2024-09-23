const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    description: { type: String },
    prix: { type: Number, required: true },
});

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
