// routes/paytech.js
const express = require('express');
const router = express.Router();
const PaytechController = require('../controllers/payement.controller');

router.post('/initiate-payment', PaytechController.initiatePayment);
router.post('/handle-notification', PaytechController.handleNotification);
router.get('/payment-success', PaytechController.paymentSuccess);
router.get('/payment-cancel/:id', PaytechController.paymentCancel);
router.get('/verify-payment/:transactionId', PaytechController.verifyPayment);

module.exports = router;
