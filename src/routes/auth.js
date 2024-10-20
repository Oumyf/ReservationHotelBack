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

// Route pour l'inscription d'utilisateur (Client)
router.post('/register/client', [
    body('nom').notEmpty().withMessage('Le nom est requis.'),
    body('email').isEmail().withMessage('L\'email est invalide.'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
    body('telephone').isLength({ min: 9, max: 9 }).withMessage('Le téléphone doit contenir exactement 9 chiffres.'),
    body('adresse').notEmpty().withMessage('L\'adresse est requise.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { nom, email, password, telephone, adresse } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            nom,
            email: email.toLowerCase(),
            password: hashedPassword,
            telephone,
            adresse,
            role: 'client'
        });

        await user.save();
        res.status(201).json({ message: 'Inscription réussie pour le client!' });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
});

// Route pour l'inscription d'hôtel
router.post('/register/hotel', upload.single('logo'), [
    body('nom').notEmpty().withMessage('Le nom est requis.'),
    body('email').isEmail().withMessage('L\'email est invalide.'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
    body('telephone').isLength({ min: 9, max: 9 }).withMessage('Le téléphone doit contenir exactement 9 chiffres.'),
    body('adresse').notEmpty().withMessage('L\'adresse est requise.'),
    body('nombre_etoiles').isInt({ min: 1, max: 5 }).withMessage('Le nombre d\'étoiles doit être entre 1 et 5.'),
    body('description').notEmpty().withMessage('La description est requise.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { nom, email, password, telephone, adresse, nombre_etoiles, description } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            nom,
            email: email.toLowerCase(),
            password: hashedPassword,
            telephone,
            adresse,
            role: 'hotel'
        });

        await user.save();

        const hotel = new Hotel({
            user: user._id,
            nombre_etoiles,
            description,
            logo: req.file ? req.file.path : null,
        });

        await hotel.save();
        res.status(201).json({ message: 'Inscription réussie pour l\'hôtel!' });
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

router.post('/logout', (req, res) => {
    res.json({ message: 'Déconnexion réussie' });
});

module.exports = router;
