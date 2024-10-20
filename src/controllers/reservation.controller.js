const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Reservation = require('../models/reservations');
const http = require('http');
const express = require('express');
const fetch = require('node-fetch'); // Import fetch for making HTTP requests
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

// Create the transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'adiaratououmyfall@gmail.com',
        pass: 'dcds ddsw phyg vhyy', // Utilisez un mot de passe spécifique à l'application si nécessaire
    },
});

// Create a reservation
const createReservation = async (req, res) => {
    try {
        // Validation des données entrantes
        const { user_id, hotel_id, date_debut, date_fin, email, nom } = req.body;
        
        if (!user_id || !hotel_id || !date_debut || !date_fin || !email || !nom) {
            const missingFields = [];
            if (!user_id) missingFields.push('user_id');
            if (!hotel_id) missingFields.push('hotel_id');
            if (!date_debut) missingFields.push('date_debut');
            if (!date_fin) missingFields.push('date_fin');
            if (!email) missingFields.push('email');
            if (!nom) missingFields.push('nom');
        
            return res.status(400).json({ message: "Tous les champs sont requis.", missingFields });
        }

        // Créer la réservation (statut par défaut 'pending')
        const newReservation = new Reservation({
            user_id: new mongoose.Types.ObjectId(user_id),
            hotel_id: new mongoose.Types.ObjectId(hotel_id),
            date_debut: new Date(date_debut),
            date_fin: new Date(date_fin),
            statut: 'pending',
        });

        const savedReservation = await newReservation.save();

        // Construire les paramètres pour PayTech
        let params = {
            item_name: "Réservation chambre",
            item_price: "560000", // Prix de la réservation
            currency: "XOF",
            ref_command: savedReservation._id, // Utiliser l'ID de la réservation comme référence
            command_name: `Réservation pour ${nom}`,
            env: "test",
            ipn_url: "https://1385-154-125-150-201.ngrok-free.app/ipn",
            success_url: "https://1385-154-125-150-201.ngrok-free.app/success",
            cancel_url: "https://1385-154-125-150-201.ngrok-free.app/cancel",
            custom_field: JSON.stringify({
                user_id: user_id,
                hotel_id: hotel_id,
            })
        };

        // Envoi de la demande de paiement à PayTech
        const paymentRequestUrl = "https://paytech.sn/api/payment/request-payment";
        const headers = {
            Accept: "application/json",
            'Content-Type': "application/json",
            API_KEY: "61cc25223eb4a5834be3d62c5351a16ef1ec7bed42348fe4741dc43b4af5721b",
            API_SECRET: "479ed9a49c6fecac358c65655c525788679f2dbaea2818bbf4a4e8cba62d07b3",
        };

        const paymentResponse = await fetch(paymentRequestUrl, {
            method: 'POST',
            body: JSON.stringify(params),
            headers: headers
        });

        const jsonResponse = await paymentResponse.json();

        if (jsonResponse.success) {
            // Envoyer l'e-mail de confirmation
            let mailOptions = {
                from: 'adiaratououmyfall@gmail.com',
                to: email,
                subject: 'Confirmation de réservation',
                text: `Votre réservation pour ${nom} est en attente de confirmation après le paiement. Vous pouvez procéder au paiement en suivant ce lien : ${jsonResponse.redirect_url}`,
            };

            await transporter.sendMail(mailOptions);

            // Rediriger l'utilisateur vers l'URL de paiement de PayTech
            return res.status(200).json({ message: "Réservation créée avec succès, veuillez procéder au paiement.", paymentUrl: jsonResponse.redirect_url });
        } else {
            return res.status(500).json({ message: "Erreur lors du traitement du paiement" });
        }
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
};
