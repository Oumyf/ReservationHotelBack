const mongoose = require('mongoose');
const Reservation = require('../models/reservations'); // Import du modèle de réservation
// const nodemailer = require('nodemailer');



// Configuration du transporteur
// let transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 587,
//     secure: false,
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASSWORD,
//     },
// });

// // Vérification de la connexion
// transporter.verify((error, success) => {
//     if (error) {
//         console.error("Erreur de connexion au serveur SMTP :", error);
//     } else {
//         console.log("Connexion au serveur SMTP réussie !");
//     }
// });

// Créer une réservation
exports.createReservation = async (req, res) => {
    try {
        // Validation des données entrantes
        if (!req.body.user_id || !req.body.hotel_id || !req.body.date_debut || !req.body.date_fin || !req.body.statut || !req.body.email || !req.body.nom) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        }

        // Créer une nouvelle réservation
        const newReservation = new Reservation({
            user_id: new mongoose.Types.ObjectId(req.body.user_id),
            hotel_id: new mongoose.Types.ObjectId(req.body.hotel_id),
            date_debut: new Date(req.body.date_debut),
            date_fin: new Date(req.body.date_fin),
            statut: req.body.statut,
        });

        const savedReservation = await newReservation.save();

        // Configuration de l'email
        // let mailOptions = {
        //     from: process.env.EMAIL_USER,
        //     to: req.body.email,
        //     subject: 'Confirmation de réservation - Keur Teranga',
        //     text: `Bonjour ${req.body.nom},\n\nMerci d'avoir réservé chez Keur Teranga.\nVoici les détails de votre réservation:\n- Date de début: ${req.body.date_debut}\n- Date de fin: ${req.body.date_fin}\n\nÀ très bientôt !`,
        // };

        // Envoi de l'email
        // await transporter.sendMail(mailOptions);
        
        // Réponse de succès
        res.status(201).json(savedReservation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la création de la réservation", error: error.message });
    }
};


// Récupérer toutes les réservations
exports.getReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find();
        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des réservations", error: error.message });
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
        res.status(500).json({ message: "Erreur lors de la récupération de la réservation", error: error.message });
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
                statut: req.body.statut,
            },
            { new: true }
        );

        if (!updatedReservation) {
            return res.status(404).json({ message: "Réservation non trouvée" });
        }

        res.status(200).json(updatedReservation);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour de la réservation", error: error.message });
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
        res.status(500).json({ message: "Erreur lors de la suppression de la réservation", error: error.message });
    }
};
