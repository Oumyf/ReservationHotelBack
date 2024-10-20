// controllers/PaytechController.js
const mongoose = require('mongoose');
const PaytechService = require('../PayementService'); // Create this service
const dotenv = require('dotenv');
const winston = require('winston');

dotenv.config();

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
  ],
});

class PaytechController {
    static async initiatePayment(req, res) {
        logger.info('Attempting to initiate payment', { requestData: req.body });
        
        const { item_name, item_price, currency, formation_id } = req.body;

        // Validate input
        if (!item_name || !item_price || !currency || !formation_id) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Find user and formation
        const user = await User.findById(req.user.id); // Assume req.user is set by an auth middleware
        const formation = await Formation.findById(formation_id);
        if (!user || !formation) {
            return res.status(404).json({ error: 'User or Formation not found.' });
        }

        const transaction_id = `ags-${user._id}_formation_${formation._id}_${Date.now()}`;
        logger.info('Creating payment for', { userId: user._id, formationId: formation._id });

        const payTechService = new PaytechService(process.env.PAYTECH_API_KEY, process.env.PAYTECH_API_SECRET);
        
        const response = await payTechService.createPayment({
            item_name,
            item_price,
            currency,
            transaction_id,
        });

        if (response.success) {
            // Store payment information in database
            const paiement = new Paiement({
                reference: transaction_id,
                formation: formation._id,
                user: user._id,
                date_paiement: new Date(),
                montant: item_price,
                mode_paiement: 'wave',
                validation: false,
                status_paiement: 'pending',
            });

            await paiement.save();

            return res.status(200).json({ success: true, redirect_url: response.redirect_url });
        } else {
            logger.error('Payment initiation failed', { errors: response.errors });
            return res.status(400).json({ success: false, errors: response.errors });
        }
    }

    static async handleNotification(req, res) {
        logger.info('Received PayTech notification', { requestData: req.body });

        const { type_event, ref_command, item_price, payment_method } = req.body;
        const apiKey = process.env.PAYTECH_API_KEY;
        const apiSecret = process.env.PAYTECH_API_SECRET;

        // Validate the notification
        if (req.body.api_secret_sha256 !== hash(apiSecret) || req.body.api_key_sha256 !== hash(apiKey)) {
            logger.warn('Invalid notification - Incorrect signature');
            return res.status(400).json({ error: 'Invalid signature' });
        }

        const paiement = await Paiement.findOne({ reference: ref_command });
        if (!paiement) {
            logger.warn('Payment not found for reference', { ref_command });
            return res.status(404).json({ error: 'Payment not found' });
        }

        paiement.status_paiement = PaytechController.getPaymentStatus(type_event);
        paiement.montant = item_price;
        paiement.mode_paiement = PaytechController.mapPaymentMethod(payment_method);
        paiement.validation = paiement.status_paiement === 'paid';
        await paiement.save();

        logger.info('Payment updated', { paymentId: paiement._id, status: paiement.status_paiement });

        if (paiement.status_paiement === 'paid') {
            await PaytechController.handleSuccessfulPayment(paiement);
        }

        return res.json({ success: true, message: 'Payment processed successfully' });
    }

    static async handleSuccessfulPayment(paiement) {
        logger.info('Handling successful payment', { paymentId: paiement._id });

        const user = await User.findById(paiement.user);
        const formation = await Formation.findById(paiement.formation);

        if (!user || !formation) {
            logger.error('User or formation not found for successful payment', {
                paymentId: paiement._id,
                userId: paiement.user,
                formationId: paiement.formation
            });
            return;
        }

        await formation.users.push(user._id); // Assuming you have a relation in your Formation model
        await formation.save();

        logger.info('User added to formation', { userId: user._id, formationId: formation._id });
    }

    static getPaymentStatus(type_event) {
        switch (type_event) {
            case 'sale_complete':
                return 'paid';
            case 'sale_canceled':
                return 'canceled';
            default:
                return 'pending';
        }
    }

    static mapPaymentMethod(payTechMethod) {
        const methodMap = {
            'Carte Bancaire': 'card',
            'PayPal': 'paypal',
            'Orange Money': 'orange_money',
            'Joni Joni': 'joni_joni',
            'Wari': 'wari',
            'Poste Cash': 'poste_cash',
            'Wave': 'wave'
        };
        return methodMap[payTechMethod] || 'other';
    }

    static async paymentCancel(req, res) {
        const { id } = req.params;
        logger.info('Payment cancelled', { paymentId: id });
        
        const payment = await Paiement.findById(id);
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        payment.status_paiement = 'canceled';
        await payment.save();

        return res.redirect('/home?error=Payment cancelled.');
    }

    static async verifyPayment(req, res) {
        const { transactionId } = req.params;
        logger.info('Verifying payment', { transactionId });
        
        const payment = await Paiement.findOne({ reference: transactionId });
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        return res.json({
            status: payment.status_paiement,
            amount: payment.montant,
            date: payment.date_paiement,
        });
    }

    static async paymentSuccess(req, res) {
        logger.info('Displaying payment success page', { requestData: req.body });

        const user = await User.findById(req.user.id); // Assume req.user is set by an auth middleware
        if (!user) {
            logger.warn('Accessing success page without authentication');
            return res.redirect('/login?error=Please login to view payment details.');
        }

        const { formation_id, transaction_id } = req.query;

        const paiement = await Paiement.findOne({
            user: user._id,
            formation: formation_id,
            reference: transaction_id,
        });

        if (!paiement) {
            logger.warn('Payment not found for success page', { formation_id, transaction_id });
            return res.redirect('/home?error=Payment not found.');
        }

        res.render('payment-success', { paiement }); // Assuming you have a view engine set up
    }
}

module.exports = PaytechController;
