const express = require('express');
const { initiatePayment } = require('../PayementService');
const router = express.Router();

router.post('/pay', async (req, res) => {
    console.log("Received payment request:", req.body); // Log the incoming request

    const { amount, customerPhone, customerName, bookingId } = req.body;

    try {
        const paymentResponse = await initiatePayment(amount, customerPhone, customerName, bookingId);
        res.json(paymentResponse); // Respond with payment details
    } catch (error) {
        console.error("Erreur lors du paiement:", error);
        res.status(500).json({ message: 'Erreur lors du paiement' });
    }
});


module.exports = router;
