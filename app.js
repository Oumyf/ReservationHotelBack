const express = require('express');
const mongoose = require('mongoose');
const hotelRoutes = require('./src/routes/hotelRoutes'); // Import des routes d'hôtels
const reservationRoutes = require('./src/routes/reservationRoutes');
const chambreRoutes = require('./src/routes/chambreRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const avisRoutes = require('./src/routes/avisRoutes');


const app = express();

// Middleware pour traiter les requêtes JSON
app.use(express.json());

// Utiliser les routes d'hôtels avec le préfixe /api
app.use('/api', hotelRoutes);
app.use('/api', reservationRoutes);
app.use('/api', chambreRoutes);
app.use('/api', serviceRoutes);
app.use('/api', avisRoutes);

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/reservation_hotel')
.then(() => console.log('Connected to MongoDB successfully'))
.catch((err) => console.error('Failed to connect to MongoDB', err));

// Lancer le serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
