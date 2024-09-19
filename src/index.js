require('dotenv').config();
const express = require('express');
const app = express();
const authRoutes = require('./routes/auth'); // Assurez-vous que le chemin est correct
const connectDB = require('../db'); // Assurez-vous que le chemin est correct

// Middleware pour analyser le corps des requêtes JSON
app.use(express.json());

// Connecter à la base de données
connectDB();

// Utilisation des routes d'authentification
app.use('/api/auth', authRoutes); // Ici, vous définissez le préfixe "/api/auth" pour vos routes d'authentification

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
