const express = require('express'); // Importer Express
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express(); // Initialiser Express
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const hotelRoutes = require('./src/routes/hotelRoutes');
app.use('/api', hotelRoutes);

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/reservation_hotel')
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// Lancer le serveur
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
