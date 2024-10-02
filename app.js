const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Importer le package CORS
const hotelRoutes = require('./src/routes/hotelRoutes'); // Import des routes d'hôtels
const reservationRoutes = require('./src/routes/reservationRoutes');
const chambreRoutes = require('./src/routes/chambreRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const avisRoutes = require('./src/routes/avisRoutes');
const auth = require('./src/routes/auth');
require('dotenv').config();

const app = express();

// Middleware pour activer CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));


// Middleware pour traiter les requêtes JSON
app.use(express.json());

// Utiliser les routes d'hôtels avec le préfixe /api
app.use('/api', hotelRoutes);
app.use('/api', reservationRoutes);
app.use('/api', chambreRoutes);
app.use('/api', serviceRoutes);
app.use('/api', avisRoutes);
app.use('/api', auth);

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/reservation_hotel')
.then(() => console.log('Connected to MongoDB successfully'))
.catch((err) => console.error('Failed to connect to MongoDB', err));

// Lancer le serveur
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
