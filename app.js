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
const http = require('http'); // Importer le module http
const socketIo = require('socket.io');
const crypto = require('crypto');
const paymentRoutes = require('./src/routes/paymentRoutes');



const app = express();
const server = http.createServer(app); // Créer le serveur HTTP
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Autoriser ces origines
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

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
app.use('/api/payments', paymentRoutes);


// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/reservation_hotel')
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// Lancer le serveur
const PORT = process.env.PORT || 8000;

// Écouter les connexions Socket.IO
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  // Optionnel: Émettre un événement de test
  socket.emit('new_notification', { message: 'Bienvenue sur le serveur!' });

  socket.on('disconnect', () => {
    console.log('A client disconnected:', socket.id);
  });
});

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

const path = require('path'); // Assurez-vous que 'path' est importé

// Middleware pour servir les fichiers statiques du dossier "uploads"
// Middleware pour servir des fichiers statiques dans le dossier 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




// Lancer le serveur HTTP
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
