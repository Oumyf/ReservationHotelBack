const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  nom: String,
  adresse: String,
  description: String,
  nombre_etoiles: Number,
  date_creation: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hotel', hotelSchema);
