const mongoose = require('mongoose');

const chambreSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  type: { type: String, required: true }, // Ce champ est requis
  prix: { type: Number, required: true },
  description: { type: String },
  disponibilite: { type: Boolean, required: true },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  nombreDePersonnes: { type: Number, required: true },
  image: { type: String }
});


const Chambre = mongoose.model('Chambre', chambreSchema);

module.exports = Chambre;
