const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    hotel_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Hotel' },
    date_debut: { type: Date, required: true },
    date_fin: { type: Date, required: true },
    statut: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
