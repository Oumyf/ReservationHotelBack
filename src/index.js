const express = require('express');
const mongoose = require('mongoose');
const hotelRoutes = require('./routes/hotelRoutes'); // Import des routes d'hôtels

const app = express();

// Middleware pour traiter les requêtes JSON
app.use(express.json());

// Utiliser les routes d'hôtels avec le préfixe /api
app.use('/api', hotelRoutes);

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/reservation_hotel')
.then(() => console.log('Connected to MongoDB successfully'))
.catch((err) => console.error('Failed to connect to MongoDB', err));

// Lancer le serveur
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
