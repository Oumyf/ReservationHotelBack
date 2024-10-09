const express = require('express');
const app = express();
const crypto = require('crypto');

app.use(express.json()); // Parse le corps des requêtes JSON

function SHA256Encrypt(password) {
    let sha256 = crypto.createHash('sha256');
    sha256.update(password);
    return sha256.digest('hex');
}

app.post('/ipn', (req, res) => {
    let type_event = req.body.type_event;
    let custom_field = JSON.parse(req.body.custom_field);
    let ref_command = req.body.ref_command;
    let item_name = req.body.item_name;
    let item_price = req.body.item_price;
    let currency = req.body.currency;
    let command_name = req.body.command_name;
    let env = req.body.env;
    let token = req.body.token;
    let api_key_sha256 = req.body.api_key_sha256;
    let api_secret_sha256 = req.body.api_secret_sha256;

    // Récupérer les clés API depuis les variables d'environnement
    let my_api_key = process.env.API_KEY;
    let my_api_secret = process.env.API_SECRET;

    // Vérification de la validité de la requête PayTech
    if (SHA256Encrypt(my_api_secret) === api_secret_sha256 && SHA256Encrypt(my_api_key) === api_key_sha256) {
        console.log("Notification PayTech reçue avec succès:", req.body);
        // Traiter la notification (ex: valider la commande)
        res.status(200).send("Notification traitée avec succès");
    } else {
        console.log("Notification invalide - Hachage ne correspond pas.");
        res.status(400).send("Notification invalide");
    }
});

const port = 8080;
app.listen(port, () => {
    console.log(`Serveur en écoute sur http://localhost:${port}`);
});
