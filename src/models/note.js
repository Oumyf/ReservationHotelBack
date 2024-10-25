// note.js
const mongoose = require('mongoose');
const Avis = require('./avis');  // Import the Avis model

// Create the Note discriminator
const Note = Avis.discriminator('note', new mongoose.Schema({
    note: { type: Number, required: true, min: 1, max: 5 }
}));

module.exports = Note;
