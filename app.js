const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const hotelRoutes = require('./src/routes/hotelRoutes');
const reservationRoutes = require('./src/routes/reservationRoutes');
const chambreRoutes = require('./src/routes/chambreRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const avisRoutes = require('./src/routes/avisRoutes');
const authRoutes = require('./src/routes/auth');
const paymentRoutes = require('./src/routes/paymentRoutes');
const http = require('http');
const socketIo = require('socket.io');
const crypto = require('crypto');
require('dotenv').config();
const path = require('path');

const app = express();
const { createReservation, handlePaymentSuccess } = require('./src/controllers/reservation.controller');
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());

app.use('/api', hotelRoutes);
app.use('/api', reservationRoutes);
app.use('/api', chambreRoutes);
app.use('/api', serviceRoutes);
app.use('/api', avisRoutes);
app.use('/api', authRoutes);
app.use('/api/paytech', paymentRoutes);

// Serve static files from "uploads" folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const mongoURI = process.env.DB;


// MongoDB connection
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

const PORT = process.env.PORT || 8000;

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  socket.emit('new_notification', { message: 'Bienvenue sur le serveur!' });
  
  socket.on('disconnect', () => {
    console.log('A client disconnected:', socket.id);
  });
});



// SHA256 encryption function
function SHA256Encrypt(password) {
  const sha256 = crypto.createHash('sha256');
  sha256.update(password);
  return sha256.digest('hex');
}

// Route for payment success
app.get('/success/:id', handlePaymentSuccess);

// HTTP Server start
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
