const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    hotel_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Hotel' },
    date_debut: { type: Date, required: true },
    date_fin: { type: Date, required: true },
    statut: { 
        type: String, 
        enum: ['pending', 'confirmed'], // Enumération pour le statut
        default: 'pending', // Valeur par défaut
        required: true 
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Met à jour le champ updatedAt à chaque fois que la réservation est modifiée
ReservationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Reservation', ReservationSchema);
