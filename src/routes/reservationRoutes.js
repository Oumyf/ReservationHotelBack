const express = require('express');
const {
    createReservation,
    updateReservationStatus,
    getReservations,
    getReservationById,
    handlePaymentSuccess
} = require('../controllers/reservation.controller');  // Make sure this path is correct

const router = express.Router();

// Define the reservation routes
router.post('/reservations', createReservation); // Create reservation
router.put('/reservations/:id', updateReservationStatus); // Update reservation status
router.get('/reservations', getReservations); // Get all reservations
router.get('/reservations/:id', getReservationById); // Get reservation by ID

module.exports = router;
