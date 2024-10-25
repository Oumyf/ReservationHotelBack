const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode'); // Assurez-vous d'installer ce package
const PDFDocument = require('pdfkit'); // Assurez-vous d'installer ce package
const fs = require('fs');
const Reservation = require('../models/reservations');
const fetch = require('node-fetch');
const express = require('express');
require('dotenv').config();
const Hotel = require('../models/hotel.model'); 
const Chambre = require('../models/chambre'); 


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Utilisez une variable d'environnement
        pass: process.env.EMAIL_PASSWORD, // Utilisez une variable d'environnement
    },
});

// Fonction pour générer un QR code
const generateQRCode = async (reservationId) => {
    try {
        const qrData = `https://10e8-154-125-148-217.ngrok-free.app/reservations/${reservationId}`; // Lien vers les détails de la réservation
        const qrCode = await QRCode.toDataURL(qrData); // Génère le QR code en base64
        return qrCode;
    } catch (err) {
        console.error('Erreur lors de la génération du QR code', err);
        throw err; // Lancez l'erreur pour gérer plus tard
    }
};



// Fonction pour générer un reçu PDF avec QR code
const generateReceiptPDF = async (reservationDetails) => {
    const receiptsDir = './receipts';

    if (!fs.existsSync(receiptsDir)) {
        fs.mkdirSync(receiptsDir);
    }

    // Récupérer les détails de l'hôtel et de la chambre
    const hotel = await Hotel.findById(reservationDetails.hotel_id);
    const chambre = await Chambre.findById(reservationDetails.chambre_id);
    
    const qrCode = await generateQRCode(reservationDetails._id);

    const doc = new PDFDocument();
    const filePath = `${receiptsDir}/receipt_${reservationDetails._id}.pdf`;

    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text('Reçu de Réservation', { align: 'center' });
    doc.fontSize(12).text(`Réservation ID: ${reservationDetails._id}`);
    doc.text(`Hôtel: ${hotel.nom}`);
    doc.text(`Chambre: ${chambre.nom}`);
    doc.text(`Prix: ${chambre.prix} FCFA`);
    doc.text(`Date de début: ${reservationDetails.date_debut}`);
    doc.text(`Date de fin: ${reservationDetails.date_fin}`);
    doc.text(`Montant payé: ${chambre.prix} FCFA`);
    doc.text(`Statut: ${reservationDetails.statut}`);
    
    // Ajouter le QR code dans le PDF
    doc.text('QR Code pour plus de détails :');
    doc.image(qrCode, { fit: [100, 100], align: 'center' });

    doc.end();

    return filePath;
};




// Fonction pour envoyer l'email avec le QR code et le reçu PDF
const sendEmailWithReceiptAndQRCode = async (email, reservationDetails) => {
    const hotel = await Hotel.findById(reservationDetails.hotel_id);
    const chambre = await Chambre.findById(reservationDetails.chambre_id);

    const filePath = await generateReceiptPDF(reservationDetails);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Confirmation de réservation avec reçu',
        html: `
            <h1>Merci pour votre réservation</h1>
            <p>Votre réservation pour l'hôtel <strong>${hotel.nom}</strong> est confirmée.</p>
            <p><strong>Numéro de réservation:</strong> ${reservationDetails._id}</p>
            <p><strong>Hôtel:</strong> ${hotel.nom}</p>
            <p><strong>Chambre:</strong> ${chambre.nom}</p>
            <p><strong>Prix:</strong> ${chambre.prix} FCFA</p>
            <p><strong>Date de début:</strong> ${reservationDetails.date_debut}</p>
            <p><strong>Date de fin:</strong> ${reservationDetails.date_fin}</p>
            <p><strong>Statut:</strong> ${reservationDetails.statut}</p>
        `,
        attachments: [
            {
                filename: `receipt_${reservationDetails._id}.pdf`,
                path: filePath,
            },
        ],
    };

    await transporter.sendMail(mailOptions);
};



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

        const qrCode = await generateQRCode(updatedReservation._id);
        await sendEmailWithReceiptAndQRCode(updatedReservation.email, qrCode, updatedReservation);

        io.emit('reservation_status_updated', { reservationId, status });
        res.status(200).json(updatedReservation);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour de la réservation", error: error.message });
    }
};

// Créer une réservation
const createReservation = async (req, res) => {
    try {
        const { user_id, hotel_id, chambre_id, date_debut, date_fin, email, nom } = req.body;

        if (!user_id || !hotel_id || !date_debut || !date_fin || !email || !nom) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        }

        const newReservation = new Reservation({
            user_id: new mongoose.Types.ObjectId(user_id),
            hotel_id: new mongoose.Types.ObjectId(hotel_id),
            chambre_id: new mongoose.Types.ObjectId(chambre_id),
            date_debut: new Date(date_debut),
            date_fin: new Date(date_fin),
            statut: 'en attente',
            email: email 
        });

        const savedReservation = await newReservation.save();

        const params = {
            item_name: "Réservation chambre",
            item_price: "560000",
            currency: "XOF",
            ref_command: savedReservation._id,
            command_name: `Réservation pour ${nom}`,
            env: "test",
            ipn_url: "https://10e8-154-125-148-217.ngrok-free.app/ipn",
            success_url: `https://10e8-154-125-148-217.ngrok-free.app/success/${savedReservation._id}`,
            cancel_url: "https://10e8-154-125-148-217.ngrok-free.app/cancel",
            custom_field: JSON.stringify({
                user_id: user_id,
                hotel_id: hotel_id,
                chambre_id: chambre_id,
            }),
        };

        const paymentRequestUrl = "https://paytech.sn/api/payment/request-payment";
        const headers = {
            Accept: "application/json",
            'Content-Type': "application/json",
            API_KEY: process.env.API_KEY, // Utilisez une variable d'environnement
            API_SECRET: process.env.API_SECRET, // Utilisez une variable d'environnement
        };

        const paymentResponse = await fetch(paymentRequestUrl, {
            method: 'POST',
            body: JSON.stringify(params),
            headers: headers,
        });

        const jsonResponse = await paymentResponse.json();

        if (jsonResponse.success) {
            const mailOptions = {
                from: process.env.EMAIL_USER, // Utilisez une variable d'environnement
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

// Route de succès : Mettre à jour le statut en "confirmé"
const handlePaymentSuccess = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "ID de réservation invalide." });
    }

    try {
        const updatedReservation = await Reservation.findByIdAndUpdate(
            id,
            { statut: 'confirmé' },
            { new: true }
        );

        if (!updatedReservation) {
            return res.status(404).json({ message: "Réservation non trouvée." });
        }

        await sendEmailWithReceiptAndQRCode(updatedReservation.email, updatedReservation);

        res.status(200).json({ message: "Paiement réussi, statut de la réservation mis à jour.", reservation: updatedReservation });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la réservation ou de l\'envoi de l\'e-mail', error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de la réservation", error: error.message });
    }
};

// Route de cancellation
const handlePaymentCancellation = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "ID de réservation invalide." });
    }

    try {
        const updatedReservation = await Reservation.findByIdAndUpdate(
            id,
            { statut: 'cancelled' },
            { new: true }
        );

        if (!updatedReservation) {
            return res.status(404).json({ message: "Réservation non trouvée." });
        }

        res.status(200).json({ message: "Paiement annulé, statut de la réservation mis à jour.", reservation: updatedReservation });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour de la réservation", error: error.message });
    }
};

// Vérification du statut de la réservation par ID
const getReservationStatusById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "ID de réservation invalide." });
    }

    try {
        const reservation = await Reservation.findById(id, 'statut'); // Récupérer uniquement le statut
        if (!reservation) {
            return res.status(404).json({ message: "Réservation non trouvée." });
        }
        res.status(200).json({ status: reservation.statut });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la vérification du statut", error: error.message });
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

// Récupérer les réservations d'un utilisateur spécifique
const getReservationsByUser = async (req, res) => {
    const { userId } = req.params;

    if (!userId || !mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ message: "ID utilisateur invalide." });
    }

    try {
        const reservations = await Reservation.find({ user_id: userId });

        if (!reservations || reservations.length === 0) {
            return res.status(404).json({ message: "Aucune réservation trouvée pour cet utilisateur." });
        }

        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des réservations", error: error.message });
    }
};

module.exports = {
    createReservation,
    updateReservationStatus,
    handlePaymentSuccess,
    handlePaymentCancellation,
    getReservations,
    getReservationById,
    getReservationStatusById, // Nouvelle route pour la vérification du statut
    getReservationsByUser,
};
