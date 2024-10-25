// commentaire.js
const mongoose = require('mongoose');
const Avis = require('./avis');  // Import the Avis model

// Create the Commentaire discriminator
const Commentaire = Avis.discriminator('commentaire', new mongoose.Schema({
    contenu: { type: String, required: true }
}));

module.exports = Commentaire;
