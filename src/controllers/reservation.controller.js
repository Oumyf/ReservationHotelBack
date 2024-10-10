const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Reservation = require('../models/reservations');
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

// Create the transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'adiaratououmyfall@gmail.com',
        pass: 'dcds ddsw phyg vhyy', // Use app-specific password if needed
    },
});

// Create a reservation
const createReservation = async (req, res) => {
    try {
        // Validate incoming data
        if (!req.body.user_id || !req.body.hotel_id || !req.body.date_debut || !req.body.date_fin || !req.body.email || !req.body.nom) {
            const missingFields = [];
            if (!req.body.user_id) missingFields.push('user_id');
            if (!req.body.hotel_id) missingFields.push('hotel_id');
            if (!req.body.date_debut) missingFields.push('date_debut');
            if (!req.body.date_fin) missingFields.push('date_fin');
            if (!req.body.email) missingFields.push('email');
            if (!req.body.nom) missingFields.push('nom');
        
            return res.status(400).json({ message: "Tous les champs sont requis.", missingFields });
        }
        

        const newReservation = new Reservation({
            user_id: new mongoose.Types.ObjectId(req.body.user_id),
            hotel_id: new mongoose.Types.ObjectId(req.body.hotel_id),
            date_debut: new Date(req.body.date_debut),
            date_fin: new Date(req.body.date_fin),
            statut: 'pending', // Statut par défaut
        });

        const savedReservation = await newReservation.save();
        io.emit('new_notification', { message: `Réservation réussie pour ${req.body.nom}` });

        let mailOptions = {
            from: 'adiaratououmyfall@gmail.com',
            to: req.body.email,
            subject: 'Confirmation de réservation',
            text: `Votre réservation pour ${req.body.nom} est en attente de confirmation après le paiement.`,
        };

        await transporter.sendMail(mailOptions);
        res.status(201).json(savedReservation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la création de la réservation", error: error.message });
    }
};


// Récupérer toutes les réservations
const getReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find();
        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des réservations", error: error.message });
    }
};

// Récupérer une réservation par ID
const getReservationById = async (req, res) => {
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
const updateReservation = async (req, res) => {
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
const deleteReservation = async (req, res) => {
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

// Confirm a reservation after payment and send confirmation email
const confirmReservation = async (req, res) => {
    try {
        const { reservationId, email, nom } = req.body;

        if (!reservationId || !email || !nom) {
            return res.status(400).json({ message: "L'ID de réservation, l'email et le nom sont requis." });
        }

        const updatedReservation = await Reservation.findByIdAndUpdate(
            reservationId,
            { statut: 'confirmed' },
            { new: true }
        );

        if (!updatedReservation) {
            return res.status(404).json({ message: "Réservation non trouvée" });
        }

        // Émettre l'événement de réservation confirmée
        io.emit('reservation_confirmed', { reservationId, message: 'Votre réservation a été confirmée!' });

        let mailOptions = {
            from: 'adiaratououmyfall@gmail.com',
            to: email,
            subject: 'Confirmation de votre réservation',
            text: `Votre réservation pour ${nom} a été confirmée avec succès. Merci de choisir notre service!`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json(updatedReservation);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la confirmation de la réservation", error: error.message });
    }
};



module.exports = {
    createReservation,
    confirmReservation,
    getReservations,
    getReservationById,
    updateReservation,
    deleteReservation,
    confirmReservation,
};
