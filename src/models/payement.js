const payementSchema = new mongoose.Schema({
    reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
    montant: Number,
    date: Date,
    mode_paiement: String,
    status: String
  });
  