// services/PaytechService.js
const axios = require('axios');
const crypto = require('crypto');

class PaytechService {
    constructor(apiKey, apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.baseUrl = 'https://api.paytech.com'; // Mettez à jour avec l'URL de base correcte
    }

    async createPayment(reservation) {
        try {
            const paymentData = {
                amount: reservation.amount, // Montant de la réservation
                user_id: reservation.user_id,
                hotel_id: reservation.hotel_id,
                // Ajoutez d'autres données nécessaires pour le paiement
            };

            const response = await axios.post(`${this.baseUrl}/payments/initiate`, {
                api_key: this.apiKey,
                ...paymentData,
                api_secret: this.generateSignature(paymentData),
            });

            return response.data;
        } catch (error) {
            console.error('Erreur lors de l\'initiation du paiement :', error.response.data);
            return { success: false, errors: error.response.data };
        }
    }

    generateSignature(data) {
        return crypto.createHash('sha256').update(this.apiSecret + JSON.stringify(data)).digest('hex');
    }
}

module.exports = PaytechService;
