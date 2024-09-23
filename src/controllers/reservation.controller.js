const Reservation = require('../models/reservations'); // Import du modèle de réservation

// Créer une réservation
exports.createReservation = async (req, res) => {
    try {
        const newReservation = new Reservation({
            user_id: req.body.user_id,
            hotel_id: req.body.hotel_id,
            date_debut: req.body.date_debut,
            date_fin: req.body.date_fin,
            statut: req.body.statut
        });

        const savedReservation = await newReservation.save();
        res.status(201).json(savedReservation);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création de la réservation", error });
    }
};

// Récupérer toutes les réservations
exports.getReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find();
        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des réservations", error });
    }
};

// Récupérer une réservation par ID
exports.getReservationById = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ message: "Réservation non trouvée" });
        }
        res.status(200).json(reservation);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de la réservation", error });
    }
};

// Mettre à jour une réservation
exports.updateReservation = async (req, res) => {
    try {
        const updatedReservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            {
                user_id: req.body.user_id,
                hotel_id: req.body.hotel_id,
                date_debut: req.body.date_debut,
                date_fin: req.body.date_fin,
                statut: req.body.statut
            },
            { new: true }
        );

        if (!updatedReservation) {
            return res.status(404).json({ message: "Réservation non trouvée" });
        }

        res.status(200).json(updatedReservation);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour de la réservation", error });
    }
};

// Supprimer une réservation
exports.deleteReservation = async (req, res) => {
    try {
        const deletedReservation = await Reservation.findByIdAndDelete(req.params.id);

        if (!deletedReservation) {
            return res.status(404).json({ message: "Réservation non trouvée" });
        }

        res.status(200).json({ message: "Réservation supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de la réservation", error });
    }
};
