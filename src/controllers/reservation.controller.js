const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Reservation = require('../models/reservations');
const fetch = require('node-fetch');
const express = require('express');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'adiaratououmyfall@gmail.com',
        pass: 'dcds ddsw phyg vhyy', // Utilisez un mot de passe spécifique à l'application si nécessaire
    },
});

// Fonction pour mettre à jour le statut de la réservation
const updateReservationStatus = async (req, res) => {
    const { reservationId, status } = req.body;

    if (!reservationId || !status) {
        return res.status(400).json({ message: "L'ID de réservation et le statut sont requis." });
    }

    try {
        const updatedReservation = await Reservation.findByIdAndUpdate(
            reservationId,
            { statut: status },
            { new: true }
        );

        if (!updatedReservation) {
            return res.status(404).json({ message: "Réservation non trouvée." });
        }

        io.emit('reservation_status_updated', { reservationId, status });
        res.status(200).json(updatedReservation);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour de la réservation", error: error.message });
    }
};

// Créer une réservation
const createReservation = async (req, res) => {
    try {
        const { user_id, hotel_id, date_debut, date_fin, email, nom } = req.body;

        if (!user_id || !hotel_id || !date_debut || !date_fin || !email || !nom) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        }

        const newReservation = new Reservation({
            user_id: new mongoose.Types.ObjectId(user_id),
            hotel_id: new mongoose.Types.ObjectId(hotel_id),
            date_debut: new Date(date_debut),
            date_fin: new Date(date_fin),
            statut: 'pending',
        });

        const savedReservation = await newReservation.save();

        const params = {
            item_name: "Réservation chambre",
            item_price: "560000",
            currency: "XOF",
            ref_command: savedReservation._id,
            command_name: `Réservation pour ${nom}`,
            env: "test",
            ipn_url: "https://1385-154-125-150-201.ngrok-free.app/ipn",
            success_url: `https://1385-154-125-150-201.ngrok-free.app/success/${savedReservation._id}`, // URL de succès mise à jour
            cancel_url: "https://1385-154-125-150-201.ngrok-free.app/cancel",
            custom_field: JSON.stringify({
                user_id: user_id,
                hotel_id: hotel_id,
            }),
        };

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
            headers: headers,
        });

        const jsonResponse = await paymentResponse.json();

        if (jsonResponse.success) {
            const mailOptions = {
                from: 'adiaratououmyfall@gmail.com',
                to: email,
                subject: 'Confirmation de réservation',
                text: `Votre réservation pour ${nom} est en attente de confirmation après le paiement. Vous pouvez procéder au paiement en suivant ce lien : ${jsonResponse.redirect_url}`,
            };

            await transporter.sendMail(mailOptions);

            return res.status(200).json({ message: "Réservation créée avec succès, veuillez procéder au paiement.", paymentUrl: jsonResponse.redirect_url });
        } else {
            return res.status(500).json({ message: "Erreur lors du traitement du paiement" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la création de la réservation", error: error.message });
    }
};

// Route de succès : Mettre à jour le statut en "confirmed"
const handlePaymentSuccess = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "ID de réservation invalide." });
    }

    try {
        const updatedReservation = await Reservation.findByIdAndUpdate(
            id,
            { statut: 'confirmed' },
            { new: true }
        );

        if (!updatedReservation) {
            return res.status(404).json({ message: "Réservation non trouvée." });
        }

        res.status(200).json({ message: "Paiement réussi, statut de la réservation mis à jour.", reservation: updatedReservation });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du statut après succès de paiement", error: error.message });
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
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "ID de réservation invalide." });
    }

    try {
        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return res.status(404).json({ message: "Réservation non trouvée." });
        }
        res.status(200).json(reservation);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de la réservation", error: error.message });
    }
};

// Export des fonctions
module.exports = {
    createReservation,
    getReservations,
    getReservationById,
    updateReservationStatus,
    handlePaymentSuccess,
};
