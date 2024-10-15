const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const Hotel = require('../models/hotel.model');
const router = express.Router();

router.use(express.json()); // Middleware pour parser le JSON

// Configuration de Multer pour le stockage de fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Seuls les fichiers images sont autorisés !'), false);
    }
    cb(null, true);
};

const upload = multer({ storage, fileFilter });

// Route pour l'inscription d'utilisateur
router.post('/register', upload.single('logo'), async (req, res) => {
    const { nom, email, password, telephone, adresse, role, hotelNom, nombre_etoiles, description } = req.body;

    // Validate required fields
    if (!nom || !email || !password || !telephone || !adresse || !role || !hotelNom || !nombre_etoiles || !description) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    try {
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            nom,
            email: email.toLowerCase(), // Normalize email
            password: hashedPassword, // Save hashed password
            telephone,
            adresse,
            role // Ensure that role is included
        });

        await user.save();

        // Create hotel
        const hotel = new Hotel({
            user: user._id,
            hotelNom,
            nombre_etoiles,
            description,
            logo: req.file.path, // Use the path of the uploaded file
        });

        await hotel.save();
        res.status(201).json({ message: 'Inscription réussie!' });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
});

// Route pour la connexion de l'utilisateur
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'L\'email et le mot de passe sont requis.' });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        console.log(user);
        if (!user) {
            return res.status(400).json({ message: 'Utilisateur non trouvé.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Identifiants invalides.' });
        }

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user._id,
                nom: user.nom,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).json({ message: 'Erreur du serveur' });
    }
});

module.exports = router;
