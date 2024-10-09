const fetch = require('node-fetch');

async function initiatePayment(amount, customerPhone, customerName, bookingId) {
    const paymentRequestUrl = "https://paytech.sn/api/payment/request-payment";
    const params = {
        item_name: "Réservation d'hôtel",
        item_price: amount.toString(),
        currency: "XOF",
        ref_command: bookingId, // Utiliser la réservation comme référence
        command_name: `Paiement réservation ${customerName}`,
        env: "test",
        ipn_url: process.env.IPN_URL, // Assure-toi de définir cette variable d'environnement
        success_url: process.env.SUCCESS_URL, // Assure-toi de définir cette variable d'environnement
        cancel_url: process.env.CANCEL_URL, // Assure-toi de définir cette variable d'environnement
        custom_field: JSON.stringify({
            custom_field1: "Référence réservation",
            custom_field2: customerName
        })
    };

    const headers = {
        Accept: "application/json",
        'Content-Type': "application/json",
        API_KEY: process.env.API_KEY,
        API_SECRET: process.env.API_SECRET
    };

    const response = await fetch(paymentRequestUrl, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: headers
    });

    if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const jsonResponse = await response.json();
    return jsonResponse;
}

module.exports = { initiatePayment };
