const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');

// Routes pour les réservations
router.post('/reservations', reservationController.createReservation);
router.get('/reservations', reservationController.getReservations);
router.get('/reservations/:id', reservationController.getReservationById);
router.put('/reservations/:id', reservationController.updateReservation);
router.delete('/reservations/:id', reservationController.deleteReservation);

module.exports = router;
