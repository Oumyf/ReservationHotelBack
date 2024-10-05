const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

// Route d'inscription
router.post('/register', async (req, res) => {
    const { id, nom, email, password, role, telephone, adresse } = req.body;

    // Validation des entrées
    if (!id || !nom || !email || !password || !role || !telephone || !adresse) {
        return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    // Vérification des rôles
    const validRoles = ['user', 'admin', 'hotel'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Rôle invalide.' });
    }

    try {
        // Vérification si l'utilisateur existe déjà
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'L’utilisateur existe déjà.' });
        }

        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Enregistrement de l'utilisateur
        const newUser = new User({ id, nom, email, password: hashedPassword, role, telephone, adresse });
        await newUser.save();

        res.status(201).json({ message: 'Utilisateur enregistré avec succès', userId: newUser._id });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

// Route de connexion
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mot de passe incorrect.' });
        }

        // Générer un token JWT
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.status(200).json({ token, user: { id: user._id, nom: user.nom, email: user.email, role: user.role, telephone: user.telephone, adresse: user.adresse } });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

// Route protégée
router.get('/protected', verifyToken, (req, res) => {
    res.status(200).json({ message: 'Vous avez accédé à une route protégée', user: req.user });
});

// Middleware pour vérifier le token JWT
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Accès refusé. Aucun token fourni.' });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token invalide:', err);
        res.status(400).json({ message: 'Token invalide.' });
    }
}

module.exports = router;
